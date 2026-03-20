export default function BrandPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Brand Configuration</h1>
      <p className="text-gray-500 mb-8">
        Set your colors, font, and style. Every generated image will use these settings.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary color
            </label>
            <input
              type="color"
              defaultValue="#000000"
              className="w-16 h-10 cursor-pointer rounded border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accent color
            </label>
            <input
              type="color"
              defaultValue="#0070f3"
              className="w-16 h-10 cursor-pointer rounded border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
              <option value="bold">Bold</option>
              <option value="elegant">Elegant</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Save brand config
          </button>
        </form>
      </div>
    </div>
  );
}
