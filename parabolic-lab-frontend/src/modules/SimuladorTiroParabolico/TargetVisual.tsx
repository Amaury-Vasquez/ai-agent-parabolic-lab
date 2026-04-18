const TargetVisual = () => (
  <div className="relative flex flex-col items-center">
    {/* Target board */}
    <div className="relative w-16 h-16 mb-2">
      {/* Concentric circles - classic target design */}
      <div className="absolute inset-0 rounded-full bg-red-600 shadow-lg" />
      <div className="absolute inset-2 rounded-full bg-white" />
      <div className="absolute inset-4 rounded-full bg-red-500" />
      <div className="absolute inset-6 rounded-full bg-white" />
      <div className="absolute inset-8 rounded-full bg-red-600" />

      {/* Center bullseye */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-600 shadow-md" />

      {/* Crosshair */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 opacity-20" />
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-800 opacity-20" />
    </div>

    {/* Target stand/pole */}
    <div className="w-2 h-16 bg-gradient-to-b from-amber-700 to-amber-900 rounded-full shadow-md relative">
      {/* Pole highlights */}
      <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-amber-500 opacity-50 rounded-full" />
    </div>

    {/* Target base */}
    <div className="w-12 h-3 bg-gradient-to-b from-amber-800 to-amber-950 rounded-full shadow-lg" />

    {/* Score indicator (optional decoration) */}
    <div className="absolute -top-8 -right-6 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-yellow-500">
      <span className="text-xs font-bold text-yellow-600">🎯</span>
    </div>
  </div>
);

export default TargetVisual;
