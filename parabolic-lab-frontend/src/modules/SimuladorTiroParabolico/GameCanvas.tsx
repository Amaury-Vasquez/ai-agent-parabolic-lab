"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playHit, playLaunch, playMiss, unlockAudio } from "./audio";
import {
  distanceToTarget,
  initialProjectile,
  isHit,
  pointsForHit,
  step,
  targetCenter,
} from "./physics";
import type {
  GamePhase,
  Particle,
  ProjectileState,
  ScorePopup,
  SimSettings,
} from "./types";

interface GameCanvasProps {
  settings: SimSettings;
  onSettingsChange: (next: SimSettings) => void;
  onResult: (result: { hit: boolean; points: number; distance: number }) => void;
  fireSignal: number;
  resetSignal: number;
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

const GameCanvas = ({
  settings,
  onSettingsChange,
  onResult,
  fireSignal,
  resetSignal,
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
  const onSettingsChangeRef = useRef(onSettingsChange);
  const [phase, setPhase] = useState<GamePhase>("idle");

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);
  useEffect(() => {
    onSettingsChangeRef.current = onSettingsChange;
  }, [onSettingsChange]);

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

  const screenToWorld = useCallback((sx: number, sy: number) => {
    const cam = cameraRef.current;
    return {
      x: (sx - PADDING_LEFT_M * cam.pxPerMeter) / cam.pxPerMeter,
      y: (cam.groundY - sy) / cam.pxPerMeter,
    };
  }, []);

  const launch = useCallback(() => {
    if (phaseRef.current !== "idle") return;
    unlockAudio();
    const s = settingsRef.current;
    projectileRef.current = initialProjectile(s);
    trailRef.current = [];
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

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const last = lastTimeRef.current || now;
      const dt = Math.min(0.05, (now - last) / 1000);
      lastTimeRef.current = now;
      update(dt);
      draw();
      raf = requestAnimationFrame(tick);
    };

    const update = (dt: number) => {
      const cam = cameraRef.current;
      const s = settingsRef.current;
      if (phaseRef.current === "firing" && projectileRef.current) {
        const sub = 4;
        for (let i = 0; i < sub; i++) {
          const p = projectileRef.current;
          if (!p) break;
          step(p, s.gravity, dt / sub);
          if (i % 2 === 0) {
            trailRef.current.push({
              x: p.x,
              y: p.y,
              vx: 0,
              vy: 0,
              life: TRAIL_LIFE,
              maxLife: TRAIL_LIFE,
              color: "rgba(245,158,11,0.6)",
              size: 4,
            });
          }
          if (isHit(p, s)) {
            const points = pointsForHit(p, s);
            const dist = distanceToTarget(p, s);
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
            onResultRef.current({ hit: true, points, distance: dist });
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
            onResultRef.current({
              hit: false,
              points: 0,
              distance: distanceToTarget(p, s),
            });
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
            onResultRef.current({
              hit: false,
              points: 0,
              distance: distanceToTarget(p, s),
            });
            window.setTimeout(() => {
              phaseRef.current = "idle";
              setPhase("idle");
              projectileRef.current = null;
            }, 400);
            return;
          }
        }
      }
      particlesRef.current.forEach((pt) => {
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 350 * dt;
        pt.life -= dt;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      trailRef.current.forEach((p) => (p.life -= dt));
      trailRef.current = trailRef.current.filter((p) => p.life > 0);
      popupsRef.current.forEach((p) => {
        p.y -= 40 * dt;
        p.life -= dt;
      });
      popupsRef.current = popupsRef.current.filter((p) => p.life > 0);
      if (screenshakeRef.current > 0) {
        screenshakeRef.current = Math.max(0, screenshakeRef.current - dt * 18);
      }
      if (flashRef.current > 0) {
        flashRef.current = Math.max(0, flashRef.current - dt * 1.6);
      }
      void cam;
    };

    const drawSky = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#7dd3fc");
      grad.addColorStop(0.55, "#bae6fd");
      grad.addColorStop(1, "#fef3c7");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    };

    const drawClouds = (ctx: CanvasRenderingContext2D, w: number) => {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
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
      const grad = ctx.createLinearGradient(0, groundY, 0, h);
      grad.addColorStop(0, "#22c55e");
      grad.addColorStop(0.5, "#15803d");
      grad.addColorStop(1, "#064e3b");
      ctx.fillStyle = grad;
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
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

    const drawCannon = (
      ctx: CanvasRenderingContext2D,
      sx: number,
      sy: number,
      angleDeg: number
    ) => {
      ctx.save();
      const shadowGrad = ctx.createRadialGradient(sx, sy + 8, 4, sx, sy + 8, 36);
      shadowGrad.addColorStop(0, "rgba(0,0,0,0.35)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(sx - 40, sy + 4, 80, 14);
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.roundRect(sx - 24, sy - 4, 48, 14, 4);
      ctx.fill();
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.stroke();
      const wheel = (wx: number) => {
        ctx.fillStyle = "#1f2937";
        ctx.beginPath();
        ctx.arc(wx, sy + 12, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#0f172a";
        ctx.stroke();
        ctx.fillStyle = "#475569";
        ctx.beginPath();
        ctx.arc(wx, sy + 12, 4, 0, Math.PI * 2);
        ctx.fill();
      };
      wheel(sx - 14);
      wheel(sx + 14);

      ctx.save();
      ctx.translate(sx, sy - 4);
      ctx.rotate(-(angleDeg * Math.PI) / 180);
      const grad = ctx.createLinearGradient(0, -7, 0, 7);
      grad.addColorStop(0, "#94a3b8");
      grad.addColorStop(0.5, "#475569");
      grad.addColorStop(1, "#1e293b");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(0, -7, 46, 14, 4);
      ctx.fill();
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(40, -6, 6, 12);
      ctx.fillStyle = "rgba(248,113,113,0.5)";
      ctx.fillRect(42, -4, 4, 8);
      ctx.restore();

      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.arc(sx, sy - 4, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0f172a";
      ctx.stroke();
      ctx.restore();
    };

    const drawTarget = (
      ctx: CanvasRenderingContext2D,
      sx: number,
      sy: number,
      radiusPx: number,
      hitGlow: number
    ) => {
      ctx.save();
      ctx.strokeStyle = "#7c2d12";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx, sy + radiusPx + 18);
      ctx.stroke();
      if (hitGlow > 0) {
        const g = ctx.createRadialGradient(
          sx,
          sy,
          radiusPx * 0.4,
          sx,
          sy,
          radiusPx * 2.4
        );
        g.addColorStop(0, `rgba(250,204,21,${hitGlow})`);
        g.addColorStop(1, "rgba(250,204,21,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, radiusPx * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      const rings = [
        { r: 1.0, c: "#dc2626" },
        { r: 0.78, c: "#fef3c7" },
        { r: 0.6, c: "#dc2626" },
        { r: 0.4, c: "#fef3c7" },
        { r: 0.22, c: "#dc2626" },
        { r: 0.08, c: "#facc15" },
      ];
      for (const ring of rings) {
        ctx.beginPath();
        ctx.fillStyle = ring.c;
        ctx.arc(sx, sy, radiusPx * ring.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawTrail = (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      for (const p of trailRef.current) {
        const { sx, sy } = worldToScreen(p.x, p.y);
        const alpha = (p.life / p.maxLife) * 0.7;
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12);
        grad.addColorStop(0, `rgba(254,215,170,${alpha})`);
        grad.addColorStop(1, "rgba(254,215,170,0)");
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
      ctx.save();
      const g = ctx.createRadialGradient(sx - 3, sy - 3, 1, sx, sy, 10);
      g.addColorStop(0, "#fde68a");
      g.addColorStop(0.5, "#f59e0b");
      g.addColorStop(1, "#7c2d12");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
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
      drawTarget(ctx, targetScreen.sx, targetScreen.sy, radiusPx, hitGlow);

      drawCannon(ctx, cannonScreen.sx, cannonScreen.sy, s.angle);

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
            ? "¡En el aire!"
            : phase === "hit"
              ? "¡Impacto!"
              : "Sin impacto"}
      </div>
    </div>
  );
};

export default GameCanvas;
