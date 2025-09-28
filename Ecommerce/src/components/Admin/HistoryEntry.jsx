// import 

function HistoryItem({ item, type, onDelete, entryDate }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white border rounded-xl shadow p-3 mb-2">
      <div className="flex-1">
        <div className="font-bold text-blue-900 text-lg">{item.name}</div>
        <div className="text-gray-700">
          Quantity: <span className="font-semibold">{item.quantity}</span>
        </div>
        {type === "purchased_history" && (
          <div className="text-gray-700">
            Total: <span className="font-semibold">₹{item.totalPrice}</span>{" "}
            <span className="text-xs text-gray-500">(Advance Paid ₹{item.advancePaid})</span>
          </div>
        )}
        {type === "dues" && (
          <div>
            <span className="text-gray-700">
              Due: <span className="font-semibold">₹{item.dueAmount}</span>
            </span>
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${item.fullyPaid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {item.fullyPaid ? "Paid" : "Due"}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={() => onDelete(type, entryDate, item.name)}
        className="ml-4 px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 font-bold text-base"
        title="Delete This Item"
      >
        🗑 Delete
      </button>
    </div>
  );
}

export function HistoryEntry({ entry, onDelete, type }) {
  return (
    <div className="border rounded-2xl p-5 my-4 bg-gray-50 shadow-lg">
      <h4 className="font-bold text-xl text-blue-900 mb-3">{entry.date}</h4>
      <div className="space-y-2">
        {entry.items.map((item, i) => (
          <HistoryItem
            key={i}
            item={item}
            type={type}
            entryDate={entry.date}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}