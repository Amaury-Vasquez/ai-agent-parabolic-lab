import type {
  CannonAssetKey,
  ProjectileAssetKey,
  TargetAssetKey,
} from "@/constants/simulatorAssets";

type Ctx = CanvasRenderingContext2D;

interface DrawTargetOpts {
  hitGlow: number;
}

// -------- Cañones --------

function drawClassicCannon(ctx: Ctx, sx: number, sy: number, angleDeg: number) {
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
}

function drawSlingshot(ctx: Ctx, sx: number, sy: number, angleDeg: number) {
  ctx.save();
  // Base wedge
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(sx - 22, sy + 10, 44, 6);
  // Mango central
  const woodGrad = ctx.createLinearGradient(sx - 6, sy + 14, sx + 6, sy + 14);
  woodGrad.addColorStop(0, "#9a6b3f");
  woodGrad.addColorStop(0.5, "#7a4d28");
  woodGrad.addColorStop(1, "#5a361b");
  ctx.fillStyle = woodGrad;
  ctx.beginPath();
  ctx.roundRect(sx - 5, sy - 4, 10, 22, 2);
  ctx.fill();
  ctx.strokeStyle = "#3a230f";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // Brazos en Y
  const armLen = 22;
  const armSpread = (Math.PI / 180) * 32;
  for (const dir of [-1, 1]) {
    ctx.save();
    ctx.translate(sx, sy - 4);
    ctx.rotate(dir * armSpread);
    const armGrad = ctx.createLinearGradient(0, -armLen, 0, 0);
    armGrad.addColorStop(0, "#a87246");
    armGrad.addColorStop(1, "#6b4225");
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.roundRect(-4, -armLen, 8, armLen, 3);
    ctx.fill();
    ctx.strokeStyle = "#3a230f";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  }
  // Liga
  const armEnd = (d: number) => ({
    x: sx + d * Math.sin(armSpread) * armLen,
    y: sy - 4 - Math.cos(armSpread) * armLen,
  });
  const left = armEnd(-1);
  const right = armEnd(1);
  // Banda elástica orientada al ángulo de disparo (apunta hacia atrás)
  const aimRad = (angleDeg * Math.PI) / 180;
  const pullDx = -Math.cos(aimRad) * 18;
  const pullDy = Math.sin(aimRad) * 18;
  const pocketX = sx + pullDx;
  const pocketY = sy - 4 + pullDy;
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left.x, left.y);
  ctx.lineTo(pocketX, pocketY);
  ctx.lineTo(right.x, right.y);
  ctx.stroke();
  // Pocket de cuero
  ctx.fillStyle = "#5a3719";
  ctx.beginPath();
  ctx.ellipse(pocketX, pocketY, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBow(ctx: Ctx, sx: number, sy: number, angleDeg: number) {
  ctx.save();
  ctx.translate(sx, sy - 4);
  ctx.rotate(-(angleDeg * Math.PI) / 180);
  // Stand
  ctx.fillStyle = "#5a361b";
  ctx.fillRect(-4, 12, 8, 14);
  // Cuerpo del arco
  ctx.strokeStyle = "#3a230f";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, 26, -Math.PI / 2.1, Math.PI / 2.1);
  ctx.stroke();
  ctx.strokeStyle = "#a87246";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 26, -Math.PI / 2.1, Math.PI / 2.1);
  ctx.stroke();
  // Cuerda
  const tipTop = { x: 26 * Math.cos(-Math.PI / 2.1), y: 26 * Math.sin(-Math.PI / 2.1) };
  const tipBot = { x: 26 * Math.cos(Math.PI / 2.1), y: 26 * Math.sin(Math.PI / 2.1) };
  ctx.strokeStyle = "#f1f5f9";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(tipTop.x, tipTop.y);
  ctx.lineTo(-6, 0);
  ctx.lineTo(tipBot.x, tipBot.y);
  ctx.stroke();
  // Empuñadura
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(-3, -5, 6, 10);
  ctx.restore();
}

function drawLauncher(ctx: Ctx, sx: number, sy: number, angleDeg: number) {
  ctx.save();
  // Base hexagonal
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(sx - 22, sy + 16);
  ctx.lineTo(sx - 28, sy + 6);
  ctx.lineTo(sx - 22, sy - 4);
  ctx.lineTo(sx + 22, sy - 4);
  ctx.lineTo(sx + 28, sy + 6);
  ctx.lineTo(sx + 22, sy + 16);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0ea5e9";
  ctx.lineWidth = 1.6;
  ctx.stroke();
  // Sensor
  ctx.fillStyle = "#22d3ee";
  ctx.beginPath();
  ctx.arc(sx, sy + 6, 4, 0, Math.PI * 2);
  ctx.fill();
  // Tubo lanzador
  ctx.save();
  ctx.translate(sx, sy - 4);
  ctx.rotate(-(angleDeg * Math.PI) / 180);
  const tubeGrad = ctx.createLinearGradient(0, -8, 0, 8);
  tubeGrad.addColorStop(0, "#475569");
  tubeGrad.addColorStop(0.5, "#0f172a");
  tubeGrad.addColorStop(1, "#1e293b");
  ctx.fillStyle = tubeGrad;
  ctx.beginPath();
  ctx.roundRect(0, -8, 50, 16, 6);
  ctx.fill();
  ctx.strokeStyle = "#0ea5e9";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // Glow boca
  ctx.fillStyle = "rgba(34,211,238,0.45)";
  ctx.beginPath();
  ctx.arc(50, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function drawCatapult(ctx: Ctx, sx: number, sy: number, angleDeg: number) {
  ctx.save();
  // Base
  ctx.fillStyle = "#5a361b";
  ctx.fillRect(sx - 26, sy + 12, 52, 6);
  // Patas
  ctx.fillRect(sx - 22, sy + 18, 6, 6);
  ctx.fillRect(sx + 16, sy + 18, 6, 6);
  // Eje pivote
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.arc(sx, sy + 12, 4, 0, Math.PI * 2);
  ctx.fill();
  // Brazo
  ctx.save();
  ctx.translate(sx, sy + 12);
  ctx.rotate(-(angleDeg * Math.PI) / 180);
  ctx.fillStyle = "#a87246";
  ctx.beginPath();
  ctx.roundRect(-3, -38, 6, 38, 2);
  ctx.fill();
  ctx.strokeStyle = "#3a230f";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // Cubeta
  ctx.fillStyle = "#5a361b";
  ctx.beginPath();
  ctx.moveTo(-9, -38);
  ctx.quadraticCurveTo(0, -28, 9, -38);
  ctx.lineTo(7, -42);
  ctx.lineTo(-7, -42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

export function drawCannonSprite(
  ctx: Ctx,
  sx: number,
  sy: number,
  angleDeg: number,
  key: CannonAssetKey
): void {
  ctx.save();
  switch (key) {
    case "slingshot":
      drawSlingshot(ctx, sx, sy, angleDeg);
      break;
    case "bow":
      drawBow(ctx, sx, sy, angleDeg);
      break;
    case "launcher":
      drawLauncher(ctx, sx, sy, angleDeg);
      break;
    case "catapult":
      drawCatapult(ctx, sx, sy, angleDeg);
      break;
    case "cannon":
    default:
      drawClassicCannon(ctx, sx, sy, angleDeg);
      break;
  }
  ctx.restore();
}

// -------- Proyectiles --------

function drawBall(ctx: Ctx, sx: number, sy: number) {
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
}

function drawStone(ctx: Ctx, sx: number, sy: number) {
  const g = ctx.createRadialGradient(sx - 3, sy - 3, 1, sx, sy, 10);
  g.addColorStop(0, "#cbd5e1");
  g.addColorStop(0.6, "#64748b");
  g.addColorStop(1, "#1e293b");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(sx - 9, sy - 2);
  ctx.quadraticCurveTo(sx - 6, sy - 10, sx + 2, sy - 9);
  ctx.quadraticCurveTo(sx + 10, sy - 5, sx + 8, sy + 4);
  ctx.quadraticCurveTo(sx + 2, sy + 10, sx - 6, sy + 7);
  ctx.quadraticCurveTo(sx - 11, sy + 3, sx - 9, sy - 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function drawDart(ctx: Ctx, sx: number, sy: number) {
  // Cuerpo del dardo (horizontal, punta a la derecha)
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.moveTo(sx + 12, sy);
  ctx.lineTo(sx - 8, sy - 3);
  ctx.lineTo(sx - 8, sy + 3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Plumas
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy - 3);
  ctx.lineTo(sx - 14, sy - 6);
  ctx.lineTo(sx - 10, sy);
  ctx.lineTo(sx - 14, sy + 6);
  ctx.lineTo(sx - 8, sy + 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawSpark(ctx: Ctx, sx: number, sy: number) {
  const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 16);
  halo.addColorStop(0, "rgba(186,230,253,0.95)");
  halo.addColorStop(0.5, "rgba(56,189,248,0.55)");
  halo.addColorStop(1, "rgba(56,189,248,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(sx, sy, 16, 0, Math.PI * 2);
  ctx.fill();
  const core = ctx.createRadialGradient(sx - 2, sy - 2, 0, sx, sy, 8);
  core.addColorStop(0, "#ffffff");
  core.addColorStop(0.6, "#7dd3fc");
  core.addColorStop(1, "#0284c7");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(sx, sy, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawComet(ctx: Ctx, sx: number, sy: number) {
  const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 10);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.4, "#f0abfc");
  g.addColorStop(1, "#7e22ce");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(sx, sy, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4c1d95";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // anillo
  ctx.strokeStyle = "rgba(244,114,182,0.7)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(sx, sy, 12, 4, Math.PI / 5, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawProjectileSprite(
  ctx: Ctx,
  sx: number,
  sy: number,
  key: ProjectileAssetKey
): void {
  ctx.save();
  switch (key) {
    case "stone":
      drawStone(ctx, sx, sy);
      break;
    case "dart":
      drawDart(ctx, sx, sy);
      break;
    case "spark":
      drawSpark(ctx, sx, sy);
      break;
    case "comet":
      drawComet(ctx, sx, sy);
      break;
    case "ball":
    default:
      drawBall(ctx, sx, sy);
      break;
  }
  ctx.restore();
}

export function projectileTrailColor(key: ProjectileAssetKey): string {
  switch (key) {
    case "spark":
      return "rgba(125,211,252,0.7)";
    case "comet":
      return "rgba(244,114,182,0.7)";
    case "stone":
      return "rgba(148,163,184,0.5)";
    case "dart":
      return "rgba(250,204,21,0.6)";
    case "ball":
    default:
      return "rgba(254,215,170,0.6)";
  }
}

// -------- Blancos --------

function drawHitGlow(ctx: Ctx, sx: number, sy: number, radiusPx: number, hitGlow: number) {
  if (hitGlow <= 0) return;
  const g = ctx.createRadialGradient(sx, sy, radiusPx * 0.4, sx, sy, radiusPx * 2.4);
  g.addColorStop(0, `rgba(250,204,21,${hitGlow})`);
  g.addColorStop(1, "rgba(250,204,21,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(sx, sy, radiusPx * 2.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawBullseye(ctx: Ctx, sx: number, sy: number, radiusPx: number) {
  // Soporte
  ctx.strokeStyle = "#7c2d12";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx, sy + radiusPx + 18);
  ctx.stroke();
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
}

function drawBalloon(ctx: Ctx, sx: number, sy: number, radiusPx: number) {
  // Cuerda al suelo
  ctx.strokeStyle = "rgba(31,41,55,0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx, sy + radiusPx);
  ctx.bezierCurveTo(
    sx - 4,
    sy + radiusPx + 10,
    sx + 4,
    sy + radiusPx + 22,
    sx,
    sy + radiusPx + 34
  );
  ctx.stroke();
  // Globo
  const g = ctx.createRadialGradient(
    sx - radiusPx * 0.35,
    sy - radiusPx * 0.4,
    radiusPx * 0.15,
    sx,
    sy,
    radiusPx
  );
  g.addColorStop(0, "#fda4af");
  g.addColorStop(0.55, "#e11d48");
  g.addColorStop(1, "#881337");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(sx, sy, radiusPx * 0.85, radiusPx, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4c0519";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // Nudo
  ctx.fillStyle = "#881337";
  ctx.beginPath();
  ctx.moveTo(sx - 4, sy + radiusPx);
  ctx.lineTo(sx + 4, sy + radiusPx);
  ctx.lineTo(sx, sy + radiusPx + 6);
  ctx.closePath();
  ctx.fill();
}

function drawBlock(ctx: Ctx, sx: number, sy: number, radiusPx: number) {
  const side = radiusPx * 1.6;
  const left = sx - side / 2;
  const top = sy - side / 2;
  // Sombra
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(left + 3, top + 3, side, side);
  // Cuerpo
  const g = ctx.createLinearGradient(left, top, left, top + side);
  g.addColorStop(0, "#65a30d");
  g.addColorStop(0.5, "#3f6212");
  g.addColorStop(1, "#1a2e05");
  ctx.fillStyle = g;
  ctx.fillRect(left, top, side, side);
  ctx.strokeStyle = "#1a2e05";
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, side, side);
  // Detalle
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(left + 4, top + 4, side - 8, side * 0.18);
  // Cara amigable
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(sx - side * 0.18, sy - side * 0.08, 2.2, 0, Math.PI * 2);
  ctx.arc(sx + side * 0.18, sy - side * 0.08, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(sx, sy + side * 0.14, side * 0.18, 0, Math.PI);
  ctx.stroke();
}

function drawCrate(ctx: Ctx, sx: number, sy: number, radiusPx: number) {
  const side = radiusPx * 1.8;
  const left = sx - side / 2;
  const top = sy - side / 2;
  ctx.fillStyle = "#7a4d28";
  ctx.fillRect(left, top, side, side);
  ctx.strokeStyle = "#3a230f";
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, side, side);
  // tablas
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(left, top + side / 3);
  ctx.lineTo(left + side, top + side / 3);
  ctx.moveTo(left, top + (side * 2) / 3);
  ctx.lineTo(left + side, top + (side * 2) / 3);
  ctx.stroke();
  // Diagonal X
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left + side, top + side);
  ctx.moveTo(left + side, top);
  ctx.lineTo(left, top + side);
  ctx.stroke();
}

function drawBuoy(ctx: Ctx, sx: number, sy: number, radiusPx: number) {
  const r = radiusPx;
  // Base agua
  ctx.fillStyle = "rgba(14,165,233,0.25)";
  ctx.beginPath();
  ctx.ellipse(sx, sy + r * 0.8, r * 1.4, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cuerpo
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(sx, sy, r * 0.85, 0, Math.PI * 2);
  ctx.fill();
  // Banda blanca
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.rect(sx - r * 0.85, sy - r * 0.18, r * 1.7, r * 0.36);
  ctx.fill();
  ctx.strokeStyle = "#7f1d1d";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(sx, sy, r * 0.85, 0, Math.PI * 2);
  ctx.stroke();
  // Mástil
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx, sy - r);
  ctx.lineTo(sx, sy - r * 1.6);
  ctx.stroke();
  // Bandera
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.moveTo(sx, sy - r * 1.6);
  ctx.lineTo(sx + r * 0.6, sy - r * 1.4);
  ctx.lineTo(sx, sy - r * 1.2);
  ctx.closePath();
  ctx.fill();
}

export function drawTargetSprite(
  ctx: Ctx,
  sx: number,
  sy: number,
  radiusPx: number,
  key: TargetAssetKey,
  opts: DrawTargetOpts
): void {
  ctx.save();
  drawHitGlow(ctx, sx, sy, radiusPx, opts.hitGlow);
  switch (key) {
    case "balloon":
      drawBalloon(ctx, sx, sy, radiusPx);
      break;
    case "block":
      drawBlock(ctx, sx, sy, radiusPx);
      break;
    case "crate":
      drawCrate(ctx, sx, sy, radiusPx);
      break;
    case "buoy":
      drawBuoy(ctx, sx, sy, radiusPx);
      break;
    case "bullseye":
    default:
      drawBullseye(ctx, sx, sy, radiusPx);
      break;
  }
  ctx.restore();
}
