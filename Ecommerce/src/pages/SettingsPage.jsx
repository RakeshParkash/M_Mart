import React, { useRef, useEffect } from "react";

export default function SettingsPopover({
  theme,
  setTheme,
  sidebarMode,
  setSidebarMode,
  onClose
}) {
  const popoverRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 mt-2 right-0 w-60 bg-white rounded-xl shadow-lg p-4 flex flex-col gap-4 border border-gray-200 animate-fade-in"
      style={{ minWidth: "220px" }}
    >
      <div className="font-bold text-lg text-red-700 mb-2">Settings</div>
      <div>
        <label className="font-medium mr-2">Theme:</label>
        <button
          className={`px-3 py-1 rounded-full font-semibold transition ${
            theme === "red"
              ? "bg-blue-600 text-white"
              : "bg-red-600 text-white"
          }`}
          onClick={() => {
            setTheme(theme === "red" ? "blue" : "red");
            onClose();
          }}
        >
          {theme === "red" ? "Switch to Blue" : "Switch to Red"}
        </button>
      </div>
      <div>
        <label className="font-medium mr-2">Layout:</label>
        <button
          className="px-3 py-1 rounded-full bg-gray-700 text-white font-semibold transition"
          onClick={() => {
            setSidebarMode((m) => !m);
            onClose();
          }}
        >
          {sidebarMode ? "Topbar" : "Sidebar"}
        </button>
      </div>
    </div>
  );
}
