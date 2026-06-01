"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playHit, playLaunch, playMiss, unlockAudio } from "./audio";
import {
  computeShotScore,
  distanceToTarget,
  initialProjectile,
  isHit,
  pointsForHit,
  step,
  targetCenter,
} from "./physics";
import {
  drawCannonSprite,
  drawProjectileSprite,
  drawTargetSprite,
  projectileTrailColor,
} from "./sprites";
import type {
  GamePhase,
  Particle,
  ProjectileState,
  ScorePopup,
  ShotOutcome,
  SimSettings,
  TrajectoryMetrics,
} from "./types";
import {
  DEFAULT_ASSETS,
  type CannonAssetKey,
  type ProjectileAssetKey,
  type TargetAssetKey,
} from "@/constants/simulatorAssets";
import {
  BACKGROUND_THEMES,
  DEFAULT_BACKGROUND,
  type BackgroundAssetKey,
} from "@/constants/simulatorBackgrounds";

interface GameCanvasProps {
  settings: SimSettings;
  onSettingsChange: (next: SimSettings) => void;
  onResult: (result: ShotOutcome) => void;
  onMetricsUpdate?: (metrics: TrajectoryMetrics | null) => void;
  fireSignal: number;
  resetSignal: number;
  paused?: boolean;
  speedMultiplier?: number;
  cannonAsset?: CannonAssetKey;
  projectileAsset?: ProjectileAssetKey;
  targetAsset?: TargetAssetKey;
  backgroundAsset?: BackgroundAssetKey;
}

const PADDING_LEFT_M = 4;
const PADDING_RIGHT_M = 8;
const PADDING_TOP_M = 6;
const GROUND_PX = 70;
const TRAIL_LIFE = 0.6;

interface Camera {
  pxPerMeter: number;
  width: number;
  height: number;
  groundY: number;
}

const EMPTY_METRICS: TrajectoryMetrics = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  alturaMaxima: 0,
  tiempoVuelo: 0,
  alcance: 0,
};

const GameCanvas = ({
  settings,
  onSettingsChange,
  onResult,
  onMetricsUpdate,
  fireSignal,
  resetSignal,
  paused = false,
  speedMultiplier = 1,
  cannonAsset = DEFAULT_ASSETS.cannon,
  projectileAsset = DEFAULT_ASSETS.projectile,
  targetAsset = DEFAULT_ASSETS.target,
  backgroundAsset = DEFAULT_BACKGROUND,
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(settings);
  const phaseRef = useRef<GamePhase>("idle");
  const projectileRef = useRef<ProjectileState | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const trailRef = useRef<Particle[]>([]);
  const popupsRef = useRef<ScorePopup[]>([]);
  const dragStateRef = useRef<{
    active: boolean;
    pointerX: number;
    pointerY: number;
  }>({ active: false, pointerX: 0, pointerY: 0 });
  const screenshakeRef = useRef(0);
  const flashRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const cameraRef = useRef<Camera>({
    pxPerMeter: 6,
    width: 800,
    height: 500,
    groundY: 430,
  });
  const fireSignalRef = useRef(fireSignal);
  const resetSignalRef = useRef(resetSignal);
  const onResultRef = useRef(onResult);
  const onMetricsUpdateRef = useRef(onMetricsUpdate);
  const onSettingsChangeRef = useRef(onSettingsChange);
  const pausedRef = useRef(paused);
  const speedRef = useRef(speedMultiplier);
  const assetsRef = useRef({
    cannon: cannonAsset,
    projectile: projectileAsset,
    target: targetAsset,
    background: backgroundAsset,
  });
  const metricsRef = useRef<TrajectoryMetrics>({ ...EMPTY_METRICS });
  const bestPointRef = useRef<{ x: number; y: number; distance: number } | null>(
    null
  );
  const trajectorySamplesRef = useRef<Array<{ x: number; y: number }>>([]);
  const [phase, setPhase] = useState<GamePhase>("idle");

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);
  useEffect(() => {
    onMetricsUpdateRef.current = onMetricsUpdate;
  }, [onMetricsUpdate]);
  useEffect(() => {
    onSettingsChangeRef.current = onSettingsChange;
  }, [onSettingsChange]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);
  useEffect(() => {
    assetsRef.current = {
      cannon: cannonAsset,
      projectile: projectileAsset,
      target: targetAsset,
      background: backgroundAsset,
    };
  }, [cannonAsset, projectileAsset, targetAsset, backgroundAsset]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = Math.max(380, Math.min(rect.width * 0.62, 620));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    cameraRef.current.width = width;
    cameraRef.current.height = height;
    cameraRef.current.groundY = height - GROUND_PX;
    const s = settingsRef.current;
    const worldWidthM = Math.max(s.targetDistance + PADDING_RIGHT_M, 30);
    const worldHeightM = Math.max(
      s.cannonHeight + s.targetRadius * 2 + PADDING_TOP_M,
      18
    );
    const pxPerW = (width - 40) / (worldWidthM + PADDING_LEFT_M);
    const pxPerH = (cameraRef.current.groundY - 20) / worldHeightM;
    cameraRef.current.pxPerMeter = Math.max(2, Math.min(pxPerW, pxPerH));
  }, []);

  useEffect(() => {
    resizeCanvas();
    const obs = new ResizeObserver(resizeCanvas);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [resizeCanvas]);

  useEffect(() => {
    resizeCanvas();
  }, [
    settings.targetDistance,
    settings.cannonHeight,
    settings.targetRadius,
    resizeCanvas,
  ]);

  const worldToScreen = useCallback((x: number, y: number) => {
    const cam = cameraRef.current;
    return {
      sx: PADDING_LEFT_M * cam.pxPerMeter + x * cam.pxPerMeter,
      sy: cam.groundY - y * cam.pxPerMeter,
    };
  }, []);

  const resetMetrics = () => {
    metricsRef.current = { ...EMPTY_METRICS };
    bestPointRef.current = null;
    trajectorySamplesRef.current = [];
    onMetricsUpdateRef.current?.(null);
  };

  const launch = useCallback(() => {
    if (phaseRef.current !== "idle") return;
    unlockAudio();
    const s = settingsRef.current;
    projectileRef.current = initialProjectile(s);
    trailRef.current = [];
    trajectorySamplesRef.current = [
      { x: projectileRef.current.x, y: projectileRef.current.y },
    ];
    metricsRef.current = {
      x: projectileRef.current.x,
      y: projectileRef.current.y,
      vx: projectileRef.current.vx,
      vy: projectileRef.current.vy,
      alturaMaxima: projectileRef.current.y,
      tiempoVuelo: 0,
      alcance: 0,
    };
    bestPointRef.current = {
      x: projectileRef.current.x,
      y: projectileRef.current.y,
      distance: distanceToTarget(projectileRef.current, s),
    };
    onMetricsUpdateRef.current?.(metricsRef.current);
    phaseRef.current = "firing";
    setPhase("firing");
    playLaunch();
    screenshakeRef.current = 6;
  }, []);

  const reset = useCallback(() => {
    projectileRef.current = null;
    particlesRef.current = [];
    trailRef.current = [];
    popupsRef.current = [];
    phaseRef.current = "idle";
    resetMetrics();
    setPhase("idle");
  }, []);

  useEffect(() => {
    if (fireSignal !== fireSignalRef.current) {
      fireSignalRef.current = fireSignal;
      launch();
    }
  }, [fireSignal, launch]);

  useEffect(() => {
    if (resetSignal !== resetSignalRef.current) {
      resetSignalRef.current = resetSignal;
      reset();
    }
  }, [resetSignal, reset]);

  const spawnHitBurst = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 220;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        life: 0.9 + Math.random() * 0.5,
        maxLife: 1.4,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  };

  const spawnDust = (x: number, y: number) => {
    for (let i = 0; i < 14; i++) {
      const angle = -Math.PI + (Math.random() - 0.5) * Math.PI * 0.6;
      const speed = 40 + Math.random() * 90;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        color: "rgba(150,130,90,0.85)",
        size: 3 + Math.random() * 5,
      });
    }
  };

  const finalizeShot = (
    hit: boolean,
    landingX: number,
    landingY: number,
    s: SimSettings
  ) => {
    const ref = bestPointRef.current ?? { x: landingX, y: landingY, distance: 0 };
    const closest = { x: ref.x, y: ref.y };
    const distance = ref.distance;
    const { score } = computeShotScore(closest, s, hit);
    const finalMetrics: TrajectoryMetrics = {
      ...metricsRef.current,
      alcance: Math.max(metricsRef.current.alcance, landingX - s.cannonX),
    };
    metricsRef.current = finalMetrics;
    onMetricsUpdateRef.current?.(finalMetrics);
    const outcome: ShotOutcome = {
      hit,
      distance,
      autoScore: score,
      landingX,
      landingY,
      metrics: finalMetrics,
    };
    onResultRef.current(outcome);
  };

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const last = lastTimeRef.current || now;
      const realDt = Math.min(0.05, (now - last) / 1000);
      lastTimeRef.current = now;
      const simDt = pausedRef.current ? 0 : realDt * speedRef.current;
      update(realDt, simDt);
      draw();
      raf = requestAnimationFrame(tick);
    };

    const update = (realDt: number, simDt: number) => {
      const cam = cameraRef.current;
      const s = settingsRef.current;
      const trailColor = projectileTrailColor(assetsRef.current.projectile);
      if (phaseRef.current === "firing" && projectileRef.current && simDt > 0) {
        const sub = 4;
        for (let i = 0; i < sub; i++) {
          const p = projectileRef.current;
          if (!p) break;
          step(p, s.gravity, simDt / sub);
          // Métricas en vivo
          metricsRef.current.x = p.x;
          metricsRef.current.y = p.y;
          metricsRef.current.vx = p.vx;
          metricsRef.current.vy = p.vy;
          metricsRef.current.alturaMaxima = Math.max(
            metricsRef.current.alturaMaxima,
            p.y
          );
          metricsRef.current.tiempoVuelo += simDt / sub;
          metricsRef.current.alcance = Math.max(
            metricsRef.current.alcance,
            p.x - s.cannonX
          );
          trajectorySamplesRef.current.push({ x: p.x, y: p.y });
          if (trajectorySamplesRef.current.length > 600) {
            trajectorySamplesRef.current.shift();
          }
          const dToTarget = distanceToTarget(p, s);
          if (
            !bestPointRef.current ||
            dToTarget < bestPointRef.current.distance
          ) {
            bestPointRef.current = { x: p.x, y: p.y, distance: dToTarget };
          }
          if (i % 2 === 0) {
            trailRef.current.push({
              x: p.x,
              y: p.y,
              vx: 0,
              vy: 0,
              life: TRAIL_LIFE,
              maxLife: TRAIL_LIFE,
              color: trailColor,
              size: 4,
            });
          }
          if (isHit(p, s)) {
            const points = pointsForHit(p, s);
            const c = targetCenter(s);
            const sc = worldToScreen(c.x, c.y);
            spawnHitBurst(sc.sx, sc.sy, "#facc15", 36);
            spawnHitBurst(sc.sx, sc.sy, "#f97316", 24);
            popupsRef.current.push({
              x: sc.sx,
              y: sc.sy,
              text: `+${points}`,
              life: 1.2,
              color: "#16a34a",
            });
            screenshakeRef.current = 12;
            flashRef.current = 0.4;
            phaseRef.current = "hit";
            setPhase("hit");
            playHit(1);
            finalizeShot(true, p.x, p.y, s);
            window.setTimeout(() => {
              phaseRef.current = "idle";
              setPhase("idle");
              projectileRef.current = null;
            }, 900);
            return;
          }
          if (p.y <= 0 && p.vy < 0) {
            const sc = worldToScreen(p.x, 0);
            spawnDust(sc.sx, sc.sy);
            popupsRef.current.push({
              x: sc.sx,
              y: sc.sy - 30,
              text: "Fallaste",
              life: 1.0,
              color: "#dc2626",
            });
            screenshakeRef.current = 5;
            phaseRef.current = "miss";
            setPhase("miss");
            playMiss();
            finalizeShot(false, p.x, 0, s);
            window.setTimeout(() => {
              phaseRef.current = "idle";
              setPhase("idle");
              projectileRef.current = null;
            }, 700);
            return;
          }
          if (p.x > s.targetDistance + 60 || p.x < -10 || p.y > 200) {
            phaseRef.current = "miss";
            setPhase("miss");
            playMiss();
            finalizeShot(false, p.x, p.y, s);
            window.setTimeout(() => {
              phaseRef.current = "idle";
              setPhase("idle");
              projectileRef.current = null;
            }, 400);
            return;
          }
        }
        onMetricsUpdateRef.current?.(metricsRef.current);
      }
      // Partículas / popups corren en tiempo real (independiente de pausa)
      particlesRef.current.forEach((pt) => {
        pt.x += pt.vx * realDt;
        pt.y += pt.vy * realDt;
        pt.vy += 350 * realDt;
        pt.life -= realDt;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      trailRef.current.forEach((p) => (p.life -= realDt));
      trailRef.current = trailRef.current.filter((p) => p.life > 0);
      popupsRef.current.forEach((p) => {
        p.y -= 40 * realDt;
        p.life -= realDt;
      });
      popupsRef.current = popupsRef.current.filter((p) => p.life > 0);
      if (screenshakeRef.current > 0) {
        screenshakeRef.current = Math.max(0, screenshakeRef.current - realDt * 18);
      }
      if (flashRef.current > 0) {
        flashRef.current = Math.max(0, flashRef.current - realDt * 1.6);
      }
      void cam;
    };

    const drawSky = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const theme = BACKGROUND_THEMES[assetsRef.current.background];
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, theme.sky[0]);
      grad.addColorStop(0.55, theme.sky[1]);
      grad.addColorStop(1, theme.sky[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    };

    const drawClouds = (ctx: CanvasRenderingContext2D, w: number) => {
      const theme = BACKGROUND_THEMES[assetsRef.current.background];
      ctx.save();
      ctx.fillStyle = theme.cloud;
      const cloud = (cx: number, cy: number, scale: number) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 18 * scale, cy + 4 * scale, 14 * scale, 0, Math.PI * 2);
        ctx.arc(cx - 18 * scale, cy + 4 * scale, 14 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 6 * scale, cy - 10 * scale, 13 * scale, 0, Math.PI * 2);
        ctx.fill();
      };
      cloud(w * 0.18, 60, 1);
      cloud(w * 0.55, 90, 0.85);
      cloud(w * 0.82, 50, 1.1);
      ctx.restore();
    };

    const drawGround = (
      ctx: CanvasRenderingContext2D,
      w: number,
      groundY: number,
      h: number
    ) => {
      const theme = BACKGROUND_THEMES[assetsRef.current.background];
      const grad = ctx.createLinearGradient(0, groundY, 0, h);
      grad.addColorStop(0, theme.ground[0]);
      grad.addColorStop(0.5, theme.ground[1]);
      grad.addColorStop(1, theme.ground[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.fillStyle = theme.grassShadow;
      for (let x = 0; x < w; x += 6) {
        const grassH = 3 + ((x * 7) % 5);
        ctx.fillRect(x, groundY - grassH, 1, grassH);
      }
    };

    const drawGrid = (
      ctx: CanvasRenderingContext2D,
      cam: Camera,
      worldOriginScreenX: number
    ) => {
      ctx.save();
      ctx.strokeStyle = "rgba(15,23,42,0.08)";
      ctx.lineWidth = 1;
      const stepM = 5;
      const stepPx = stepM * cam.pxPerMeter;
      for (let x = worldOriginScreenX; x < cam.width; x += stepPx) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, cam.groundY);
        ctx.stroke();
      }
      for (let y = cam.groundY; y > 0; y -= stepPx) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cam.width, y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(15,23,42,0.45)";
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      for (
        let xm = stepM;
        xm * cam.pxPerMeter + worldOriginScreenX < cam.width;
        xm += stepM
      ) {
        const sx = worldOriginScreenX + xm * cam.pxPerMeter;
        ctx.fillText(`${xm}m`, sx + 2, cam.groundY - 4);
      }
      ctx.restore();
    };

    const drawTrail = (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      for (const p of trailRef.current) {
        const { sx, sy } = worldToScreen(p.x, p.y);
        const alpha = (p.life / p.maxLife) * 0.7;
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12);
        grad.addColorStop(
          0,
          p.color.replace(/[\d.]+\)$/, `${alpha.toFixed(3)})`)
        );
        grad.addColorStop(1, p.color.replace(/[\d.]+\)$/, "0)"));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawProjectile = (ctx: CanvasRenderingContext2D) => {
      const p = projectileRef.current;
      if (!p) return;
      const { sx, sy } = worldToScreen(p.x, p.y);
      drawProjectileSprite(ctx, sx, sy, assetsRef.current.projectile);
    };

    const drawParticles = (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      for (const p of particlesRef.current) {
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawPopups = (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.font = "bold 22px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      for (const p of popupsRef.current) {
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4;
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.restore();
    };

    const drawAimVector = (
      ctx: CanvasRenderingContext2D,
      sx: number,
      sy: number,
      mouseX: number,
      mouseY: number
    ) => {
      ctx.save();
      ctx.strokeStyle = "rgba(220,38,38,0.7)";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
      ctx.restore();
    };

    const drawSpeedBadge = (
      ctx: CanvasRenderingContext2D,
      w: number
    ) => {
      if (pausedRef.current) {
        ctx.save();
        ctx.fillStyle = "rgba(15,23,42,0.78)";
        ctx.fillRect(w - 96, 10, 86, 28);
        ctx.fillStyle = "#fef3c7";
        ctx.font = "bold 13px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("⏸ Pausa", w - 86, 29);
        ctx.restore();
        return;
      }
      if (speedRef.current !== 1) {
        ctx.save();
        ctx.fillStyle = "rgba(15,23,42,0.78)";
        ctx.fillRect(w - 96, 10, 86, 28);
        ctx.fillStyle = "#a7f3d0";
        ctx.font = "bold 13px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(`${speedRef.current}× tiempo`, w - 86, 29);
        ctx.restore();
      }
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const cam = cameraRef.current;
      const s = settingsRef.current;
      const w = cam.width;
      const h = cam.height;

      const shake = screenshakeRef.current;
      const shx = (Math.random() - 0.5) * shake;
      const shy = (Math.random() - 0.5) * shake;
      ctx.save();
      ctx.translate(shx, shy);

      drawSky(ctx, w, h);
      drawClouds(ctx, w);

      const cannonScreen = worldToScreen(s.cannonX, s.cannonHeight);
      drawGrid(ctx, cam, cannonScreen.sx);
      drawGround(ctx, w, cam.groundY, h);

      if (s.cannonHeight > 0) {
        ctx.save();
        ctx.fillStyle = "#78716c";
        ctx.fillRect(
          cannonScreen.sx - 18,
          cannonScreen.sy + 6,
          36,
          cam.groundY - cannonScreen.sy - 6
        );
        ctx.strokeStyle = "#44403c";
        ctx.strokeRect(
          cannonScreen.sx - 18,
          cannonScreen.sy + 6,
          36,
          cam.groundY - cannonScreen.sy - 6
        );
        ctx.restore();
      }

      const targetCtr = targetCenter(s);
      const targetScreen = worldToScreen(targetCtr.x, targetCtr.y);
      const radiusPx = s.targetRadius * cam.pxPerMeter;

      const hitGlow = phaseRef.current === "hit" ? 0.7 : 0;
      drawTargetSprite(
        ctx,
        targetScreen.sx,
        targetScreen.sy,
        radiusPx,
        assetsRef.current.target,
        { hitGlow }
      );

      drawCannonSprite(
        ctx,
        cannonScreen.sx,
        cannonScreen.sy,
        s.angle,
        assetsRef.current.cannon
      );

      if (dragStateRef.current.active) {
        drawAimVector(
          ctx,
          cannonScreen.sx,
          cannonScreen.sy,
          dragStateRef.current.pointerX,
          dragStateRef.current.pointerY
        );
      }

      drawTrail(ctx);
      drawProjectile(ctx);
      drawParticles(ctx);
      drawPopups(ctx);

      if (flashRef.current > 0) {
        ctx.fillStyle = `rgba(250,204,21,${flashRef.current * 0.4})`;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();

      ctx.save();
      ctx.fillStyle = "rgba(15,23,42,0.7)";
      ctx.fillRect(10, 10, 168, 56);
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "bold 12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(`Ángulo: ${Math.round(s.angle)}°`, 20, 28);
      ctx.fillText(`v₀: ${s.velocity.toFixed(1)} m/s`, 20, 46);
      ctx.fillText(`Distancia: ${s.targetDistance} m`, 20, 62);
      ctx.restore();

      drawSpeedBadge(ctx, w);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [worldToScreen]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phaseRef.current !== "idle") return;
    unlockAudio();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const s = settingsRef.current;
    const cannonScreen = worldToScreen(s.cannonX, s.cannonHeight);
    const dx = px - cannonScreen.sx;
    const dy = py - cannonScreen.sy;
    if (dx * dx + dy * dy > 110 * 110) return;
    canvasRef.current?.setPointerCapture(e.pointerId);
    dragStateRef.current = { active: true, pointerX: px, pointerY: py };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragStateRef.current.active) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    dragStateRef.current.pointerX = px;
    dragStateRef.current.pointerY = py;
    const s = settingsRef.current;
    const cannonScreen = worldToScreen(s.cannonX, s.cannonHeight);
    const dx = cannonScreen.sx - px;
    const dy = py - cannonScreen.sy;
    const angleRad = Math.atan2(Math.max(0, dy), Math.max(0.0001, dx));
    const angleDeg = Math.max(
      0,
      Math.min(90, (angleRad * 180) / Math.PI)
    );
    const dist = Math.hypot(dx, dy);
    const cam = cameraRef.current;
    const distM = dist / cam.pxPerMeter;
    const velocity = Math.max(5, Math.min(80, distM * 1.5));
    onSettingsChangeRef.current({
      ...s,
      angle: Math.round(angleDeg * 10) / 10,
      velocity: Math.round(velocity * 10) / 10,
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragStateRef.current.active) return;
    canvasRef.current?.releasePointerCapture(e.pointerId);
    dragStateRef.current.active = false;
    launch();
  };

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg shadow-lg cursor-crosshair touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <div className="text-xs opacity-60 mt-2 text-center">
        {phase === "idle"
          ? "Arrastra el cañón para apuntar (estilo resortera) o usa los controles"
          : phase === "firing"
            ? paused
              ? "Pausado — ajusta la cámara o cambia la velocidad"
              : "¡En el aire!"
            : phase === "hit"
              ? "¡Impacto!"
              : "Sin impacto"}
      </div>
    </div>
  );
};

export default GameCanvas;
