// src/components/Input.jsx
export default function Input({ label, ...props }) {
  return (
    <label className="block mb-4">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm
                   focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        {...props}
      />
    </label>
  );
}
