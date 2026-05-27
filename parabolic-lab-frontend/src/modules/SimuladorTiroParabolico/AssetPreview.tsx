"use client";

import { useEffect, useRef } from "react";
import {
  drawCannonSprite,
  drawProjectileSprite,
  drawTargetSprite,
} from "./sprites";
import type {
  CannonAssetKey,
  ProjectileAssetKey,
  TargetAssetKey,
} from "@/constants/simulatorAssets";

type AssetKind = "cannon" | "projectile" | "target";

interface AssetPreviewProps {
  kind: AssetKind;
  assetKey: string;
  size?: number;
  className?: string;
}

const AssetPreview = ({
  kind,
  assetKey,
  size = 80,
  className,
}: AssetPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size * 0.58;

    if (kind === "cannon") {
      drawCannonSprite(ctx, cx, cy, 35, assetKey as CannonAssetKey);
    } else if (kind === "projectile") {
      drawProjectileSprite(ctx, cx, cy, assetKey as ProjectileAssetKey);
    } else {
      drawTargetSprite(ctx, cx, cy, size * 0.28, assetKey as TargetAssetKey, {
        hitGlow: 0,
      });
    }
  }, [kind, assetKey, size]);

  return <canvas ref={canvasRef} className={className} />;
};

export default AssetPreview;
