// TestLayout.tsx
export default function TestLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="bg-black text-white w-64 flex-shrink-0 flex items-center justify-center">
        Sidebar
      </div>
      <div className="flex flex-1 min-w-0 min-h-0 bg-blue-100">
        <div className="flex-1 min-w-0 min-h-0 bg-red-300 flex items-center justify-center">
          <div className="w-full h-full bg-yellow-200 text-3xl flex items-center justify-center">
            THIS BOX SHOULD FILL EVERYTHING NOT SIDEBAR
          </div>
        </div>
      </div>
    </div>
  );
}
