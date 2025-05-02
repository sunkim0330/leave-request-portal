export default function StatusFilter({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {["All", "Pending", "Approved", "Denied"].map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={`px-3 py-1 rounded-full text-sm font-medium border
            ${
              value === status
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-blue-600 border-blue-300 hover:bg-blue-100"
            }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
