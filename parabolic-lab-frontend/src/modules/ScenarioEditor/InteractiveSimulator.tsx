"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CannonVisual from "@/modules/SimuladorTiroParabolico/CannonVisual";
import TargetVisual from "@/modules/SimuladorTiroParabolico/TargetVisual";
import { useScenarioEditor } from "@/contexts/ScenarioEditorContext";

const InteractiveSimulator = () => {
  const { physicsConfig, updatePhysicsConfig } = useScenarioEditor();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDraggingTarget, setIsDraggingTarget] = useState(false);
  const [isDraggingCannon, setIsDraggingCannon] = useState(false);

  const handleTargetDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDraggingTarget(true);
  }, []);

  const handleCannonDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDraggingCannon(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (isDraggingTarget) {
        // Calculate distance based on x position
        // Canvas starts at ~60px (cannon position) and has scale factor of ~3px per meter
        const distanceInPixels = x - 60;
        const newDistance = Math.max(
          1,
          Math.min(200, Math.round(distanceInPixels / 3))
        );
        updatePhysicsConfig({ targetDistance: newDistance });
      }

      if (isDraggingCannon) {
        // Calculate angle based on mouse position relative to cannon
        const cannonX = 60;
        const cannonY = rect.height - 100;
        const dx = x - cannonX;
        const dy = cannonY - y;
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = (angleRad * 180) / Math.PI;
        const newAngle = Math.max(
          physicsConfig.angleMin,
          Math.min(physicsConfig.angleMax, Math.round(angleDeg))
        );
        updatePhysicsConfig({ angleDefault: newAngle });
      }
    },
    [
      isDraggingTarget,
      isDraggingCannon,
      physicsConfig.angleMin,
      physicsConfig.angleMax,
      updatePhysicsConfig,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingTarget(false);
    setIsDraggingCannon(false);
  }, []);

  useEffect(() => {
    if (isDraggingTarget || isDraggingCannon) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleMouseMove);
        document.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isDraggingTarget, isDraggingCannon, handleMouseMove, handleMouseUp]);

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Vista Previa Interactiva</h3>
        <p className="text-sm text-base-content/70">
          Arrastra el objetivo para cambiar la distancia o el cañón para ajustar
          el ángulo
        </p>
      </div>

      <div
        ref={canvasRef}
        className="bg-gradient-to-b from-sky-200 to-green-100 rounded-lg p-3 sm:p-6 relative overflow-hidden min-h-[400px] sm:min-h-[500px] cursor-crosshair touch-none"
      >
        {/* Sky background with clouds */}
        <div className="absolute top-4 right-8 text-4xl opacity-30 pointer-events-none">
          ☁️
        </div>
        <div className="absolute top-12 right-32 text-3xl opacity-20 pointer-events-none">
          ☁️
        </div>
        <div className="absolute top-6 left-16 text-5xl opacity-25 pointer-events-none">
          ☁️
        </div>

        {/* Ground line */}
        <span className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-700 to-green-500 border-t-4 border-green-800 z-10 pointer-events-none" />

        {/* Measurement grid */}
        {physicsConfig.showGrid ? (
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="gray"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        ) : null}

        {/* Main simulation area */}
        <div className="relative h-full min-h-[420px] pt-8">
          {/* Cannon positioned at left */}
          <div
            className="absolute bottom-28 left-12 z-20 cursor-grab active:cursor-grabbing touch-none"
            onMouseDown={handleCannonDragStart}
            onTouchStart={handleCannonDragStart}
          >
            <CannonVisual angle={physicsConfig.angleDefault} />
          </div>

          {/* Angle indicator line */}
          <div className="absolute bottom-28 left-12 z-10 pointer-events-none">
            <svg width="200" height="200" className="overflow-visible">
              <path
                d={`M 80 0 A 80 80 0 0 1 ${
                  80 * Math.cos((physicsConfig.angleDefault * Math.PI) / 180)
                } ${
                  -80 * Math.sin((physicsConfig.angleDefault * Math.PI) / 180)
                }`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity="0.6"
              />
              <line
                x1="0"
                y1="0"
                x2={
                  120 * Math.cos((physicsConfig.angleDefault * Math.PI) / 180)
                }
                y2={
                  -120 * Math.sin((physicsConfig.angleDefault * Math.PI) / 180)
                }
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray="6 3"
                opacity="0.8"
              />
              <text
                x={50 * Math.cos((physicsConfig.angleDefault * Math.PI) / 180)}
                y={
                  -50 * Math.sin((physicsConfig.angleDefault * Math.PI) / 180) -
                  10
                }
                fill="#1e40af"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
              >
                {physicsConfig.angleDefault}°
              </text>
            </svg>
          </div>

          {/* Trajectory path */}
          {physicsConfig.showTrajectory ? (
            <div className="absolute bottom-24 left-12 pointer-events-none">
              <svg
                width="800"
                height="400"
                className="overflow-visible"
                viewBox="0 0 800 400"
              >
                <path
                  d="M 0 0 Q 200 -150 400 -50"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray="8 4"
                  opacity="0.5"
                />
              </svg>
            </div>
          ) : null}

          {/* Target positioned at calculated distance - DRAGGABLE */}
          <div
            className="absolute bottom-28 transition-all duration-100 z-20 cursor-grab active:cursor-grabbing touch-none"
            style={{
              left: `${140 + physicsConfig.targetDistance * 3}px`,
            }}
            onMouseDown={handleTargetDragStart}
            onTouchStart={handleTargetDragStart}
          >
            <TargetVisual />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-content px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
              Arrastra para mover
            </div>
          </div>

          {/* Distance indicator */}
          <div className="absolute bottom-20 left-12 right-12 pointer-events-none">
            <div className="relative h-8">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-600 opacity-50" />
              <div className="absolute -top-2 left-0 w-0.5 h-4 bg-gray-600 opacity-50" />
              <div
                className="absolute -top-2 w-0.5 h-4 bg-gray-600 opacity-50"
                style={{ left: `${physicsConfig.targetDistance * 2.5}px` }}
              />
              <div
                className="absolute -top-6 bg-white px-2 py-1 rounded shadow text-xs font-semibold"
                style={{
                  left: `${(physicsConfig.targetDistance * 2.5) / 2 - 20}px`,
                }}
              >
                {physicsConfig.targetDistance}m
              </div>
            </div>
          </div>

          {/* Velocity indicator */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 pointer-events-none">
            <div className="text-xs opacity-70">Velocidad inicial</div>
            <div className="text-2xl font-bold text-blue-600">
              {physicsConfig.velocityDefault} m/s
            </div>
          </div>

          {/* Height indicator */}
          {physicsConfig.cannonHeight > 0 ? (
            <div className="absolute bottom-24 left-4 bg-white rounded-lg shadow-md p-2 pointer-events-none">
              <div className="text-xs opacity-70">Altura</div>
              <div className="text-lg font-bold text-green-600">
                {physicsConfig.cannonHeight}m
              </div>
            </div>
          ) : null}
        </div>

        {/* Info panel at bottom */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-20 backdrop-blur-sm rounded px-3 py-1 text-white text-xs pointer-events-none">
          Modo Edición - Haz clic y arrastra para ajustar
        </div>
      </div>
    </div>
  );
};

export default InteractiveSimulator;
