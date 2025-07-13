import React from "react";

export default function SettingsPage({
  theme,
  setTheme,
  sidebarMode,
  setSidebarMode,
  onClose
}) {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-bold text-red-700">Settings</h2>
      <div>
        <label className="font-medium mr-2">Theme:</label>
        <button
          className="px-4 py-2 rounded bg-red-600 text-white font-semibold"
          onClick={() => setTheme(theme === "dark" ? "bright" : "dark")}
        >
          {theme === "dark" ? "Switch to Bright" : "Switch to Dark"}
        </button>
      </div>
      <div>
        <label className="font-medium mr-2">Navigation Layout:</label>
        <button
          className="px-4 py-2 rounded bg-red-600 text-white font-semibold"
          onClick={() => setSidebarMode((m) => !m)}
        >
          {sidebarMode ? "Switch to Topbar" : "Switch to Sidebar"}
        </button>
      </div>
      <div className="flex justify-end">
        <button
          className="px-4 py-2 rounded bg-red-700 text-white font-semibold"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
