interface CannonVisualProps {
  angle: number;
}

const CannonVisual = ({ angle }: CannonVisualProps) => (
  <div className="relative">
    {/* Cannon base */}
    <div className="relative">
      {/* Wheels */}
      <div className="flex gap-4 absolute -bottom-4 left-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-4 border-gray-800 shadow-lg">
          <div className="w-full h-full rounded-full border-2 border-gray-600" />
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-4 border-gray-800 shadow-lg">
          <div className="w-full h-full rounded-full border-2 border-gray-600" />
        </div>
      </div>

      {/* Base platform */}
      <div className="w-24 h-6 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg shadow-xl border-2 border-gray-700" />

      {/* Cannon mount */}
      <div className="absolute -top-4 left-8 w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full shadow-lg border-4 border-gray-800">
        <div className="absolute inset-2 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full" />
      </div>

      {/* Cannon barrel - rotates based on angle */}
      <div
        className="absolute -top-4 left-14 origin-left transition-transform duration-300"
        style={{ transform: `rotate(-${angle}deg)` }}
      >
        <div className="relative">
          {/* Barrel */}
          <div className="w-20 h-6 bg-gradient-to-b from-gray-400 to-gray-600 rounded-r-full shadow-2xl border-2 border-gray-700">
            {/* Barrel highlights */}
            <div className="absolute top-1 left-2 right-4 h-1 bg-gray-300 opacity-50 rounded-full" />
            <div className="absolute bottom-1 left-2 right-4 h-1 bg-gray-800 opacity-30 rounded-full" />
          </div>

          {/* Barrel opening */}
          <div className="absolute -right-1 top-1 w-5 h-4 bg-gradient-to-r from-gray-800 to-black rounded-r-full border border-gray-900">
            <div className="absolute inset-1 bg-gradient-to-r from-red-900 to-orange-600 rounded-r-full opacity-40" />
          </div>
        </div>
      </div>

      {/* Decorative details */}
      <div className="absolute top-1 left-2 w-2 h-2 bg-yellow-500 rounded-full shadow-md" />
      <div className="absolute top-1 right-2 w-2 h-2 bg-yellow-500 rounded-full shadow-md" />
    </div>
  </div>
);

export default CannonVisual;
