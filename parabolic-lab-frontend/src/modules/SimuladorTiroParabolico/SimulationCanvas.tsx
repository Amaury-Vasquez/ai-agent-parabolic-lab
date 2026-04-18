"use client";

import { useEffect, useRef } from "react";
import CannonVisual from "./CannonVisual";
import TargetVisual from "./TargetVisual";

interface SimulationCanvasProps {
  angle: number;
  velocity: number;
  targetDistance: number;
  cannonHeight: number;
}

const SimulationCanvas = ({
  angle,
  velocity,
  targetDistance,
  cannonHeight,
}: SimulationCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-gradient-to-b from-sky-200 to-green-100 rounded-lg p-3 md:p-6 relative overflow-hidden min-h-[400px] md:min-h-[600px]">
      {/* Sky background with clouds */}
      <div className="absolute top-2 right-4 md:top-4 md:right-8 text-2xl md:text-4xl opacity-30">
        ☁️
      </div>
      <div className="absolute top-6 right-16 md:top-12 md:right-32 text-xl md:text-3xl opacity-20">
        ☁️
      </div>
      <div className="absolute top-3 left-8 md:top-6 md:left-16 text-3xl md:text-5xl opacity-25">
        ☁️
      </div>

      {/* Ground line */}
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-t from-green-700 to-green-500 border-t-2 md:border-t-4 border-green-800 z-10">
        {/* Grass texture effect */}
        <div className="h-full w-full opacity-30">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="inline-block w-1 h-2 md:h-3 bg-green-900 mx-0.5 md:mx-1"
              style={{ height: `${Math.random() * 8 + 6}px` }}
            />
          ))}
        </div>
      </div>

      {/* Measurement grid */}
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

      {/* Main simulation area */}
      <div ref={canvasRef} className="relative h-full min-h-[320px] md:min-h-[500px] pt-4 md:pt-8">
        {/* Cannon positioned at left */}
        <div className="absolute bottom-20 left-4 md:bottom-28 md:left-12 z-20 scale-75 md:scale-100 origin-bottom-left">
          <CannonVisual angle={angle} />
        </div>

        {/* Angle indicator line */}
        <div className="absolute bottom-20 left-4 md:bottom-28 md:left-12 z-10 scale-75 md:scale-100 origin-bottom-left">
          <svg width="200" height="200" className="overflow-visible">
            {/* Base angle arc */}
            <path
              d={`M 80 0 A 80 80 0 0 1 ${80 * Math.cos((angle * Math.PI) / 180)} ${-80 * Math.sin((angle * Math.PI) / 180)}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4 2"
              opacity="0.6"
            />
            {/* Angle line */}
            <line
              x1="0"
              y1="0"
              x2={120 * Math.cos((angle * Math.PI) / 180)}
              y2={-120 * Math.sin((angle * Math.PI) / 180)}
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="6 3"
              opacity="0.8"
            />
            {/* Angle text */}
            <text
              x={50 * Math.cos((angle * Math.PI) / 180)}
              y={-50 * Math.sin((angle * Math.PI) / 180) - 10}
              fill="#1e40af"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
            >
              {angle}°
            </text>
          </svg>
        </div>

        {/* Trajectory path (placeholder - will be animated later) */}
        <div className="absolute bottom-20 left-4 md:bottom-24 md:left-12 pointer-events-none scale-75 md:scale-100 origin-bottom-left">
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

        {/* Target positioned at calculated distance */}
        <div
          className="absolute bottom-20 md:bottom-28 transition-all duration-300 z-20 scale-75 md:scale-100 origin-bottom-left"
          style={{
            left: `${140 + targetDistance * 3}px`,
          }}
        >
          <TargetVisual />
        </div>

        {/* Distance indicator */}
        <div className="absolute bottom-16 md:bottom-20 left-4 md:left-12 right-4 md:right-12">
          <div className="relative h-6 md:h-8">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-600 opacity-50" />
            <div className="absolute -top-2 left-0 w-0.5 h-3 md:h-4 bg-gray-600 opacity-50" />
            <div
              className="absolute -top-2 w-0.5 h-3 md:h-4 bg-gray-600 opacity-50"
              style={{ left: `${targetDistance * 2.5}px` }}
            />
            <div
              className="absolute -top-5 md:-top-6 bg-white px-2 py-1 rounded shadow text-xs font-semibold"
              style={{ left: `${(targetDistance * 2.5) / 2 - 20}px` }}
            >
              {targetDistance}m
            </div>
          </div>
        </div>

        {/* Velocity indicator */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white rounded-lg shadow-md p-2 md:p-3">
          <div className="text-xs opacity-70">Velocidad inicial</div>
          <div className="text-lg md:text-2xl font-bold text-blue-600">
            {velocity} m/s
          </div>
        </div>

        {/* Height indicator */}
        {cannonHeight > 0 ? (
          <div className="absolute bottom-20 left-2 md:bottom-24 md:left-4 bg-white rounded-lg shadow-md p-2">
            <div className="text-xs opacity-70">Altura</div>
            <div className="text-sm md:text-lg font-bold text-green-600">
              {cannonHeight}m
            </div>
          </div>
        ) : null}
      </div>

      {/* Info panel at bottom */}
      <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-black bg-opacity-20 backdrop-blur-sm rounded px-2 py-0.5 md:px-3 md:py-1 text-white text-xs">
        Simulación de Tiro Parabólico
      </div>
    </div>
  );
};

export default SimulationCanvas;
