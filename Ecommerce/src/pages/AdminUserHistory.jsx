import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function DeletedUsersHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserIndex, setExpandedUserIndex] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await api.get("/admin/deleted-history");
        setHistory(res.data.history);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setHistory([]);
      }
      setLoading(false);
    }

    fetchHistory();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading history...</div>;
  }

  const toggleExpand = (idx) => {
    setExpandedUserIndex(idx === expandedUserIndex ? null : idx);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Deleted Users History</h2>

      {history.length === 0 ? (
        <div className="text-gray-500 italic">No deleted user records found.</div>
      ) : (
        <div className="space-y-6">
          {history.map((log, idx) => {
            const user = log.data;
            const isExpanded = idx === expandedUserIndex;

            return (
              <div
                key={idx}
                className="bg-white border shadow-sm rounded-xl p-5 transition-all"
              >
                <div className="flex justify-between flex-wrap gap-4">
                  {/* User Info */}
                  <div>
                    <p className="text-xl font-semibold text-gray-800">
                      {user.firstName} {user.lastName || ""}
                    </p>
                    <p className="text-sm text-gray-600">Phone: {user.phone}</p>
                    {user.email && (
                      <p className="text-sm text-gray-600">Email: {user.email}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {user.purchased_history?.length > 0 && (
                        <p className="text-xs text-green-700">
                          Purchases: {user.purchased_history.length}
                        </p>
                      )}
                      {user.dues?.length > 0 && (
                        <p className="text-xs text-red-600">
                          Dues: {user.dues.length}
                        </p>
                      )}
                    </div>
                    <button
                      className="mt-3 text-sm text-blue-600 underline hover:text-blue-800"
                      onClick={() => toggleExpand(idx)}
                    >
                      {isExpanded ? "Hide Details" : "Show Details"}
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="text-right text-sm text-gray-500">
                    <p>
                      Deleted on:{" "}
                      <span className="font-medium text-gray-700">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </p>
                    {log.performedBy && (
                      <p className="text-xs mt-1">
                        Deleted by:{" "}
                        <span className="text-blue-700 font-semibold">
                          {log.performedBy.firstName} {log.performedBy.lastName}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Expanded Purchase & Dues Info */}
                {isExpanded && (
                  <div className="mt-4 border-t pt-4 space-y-4">
                    {/* Purchase History */}
                    {user.purchased_history?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-green-700 mb-2">
                          Purchase History
                        </h4>
                        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                          {user.purchased_history.map((purchase, pIdx) => (
                            <li key={pIdx}>
                              <span className="font-medium">{purchase.date}</span>
                              <ul className="ml-4 list-[circle]">
                                {purchase.items.map((item, iIdx) => (
                                  <li key={iIdx}>
                                    {item.name} - Qty: {item.quantity}, Advance: ₹
                                    {item.advancePaid}, Total: ₹{item.totalPrice}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Dues */}
                    {user.dues?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-2">Remaining Dues</h4>
                        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                          {user.dues.map((due, dIdx) => (
                            <li key={dIdx}>
                              <span className="font-medium">{due.date}</span>
                              <ul className="ml-4 list-[circle]">
                                {due.items.map((item, iIdx) => (
                                  <li key={iIdx}>
                                    {item.name} - Qty: {item.quantity}, Due: ₹
                                    {item.dueAmount}{" "}
                                    {item.fullyPaid ? (
                                      <span className="text-green-600">(Paid)</span>
                                    ) : (
                                      <span className="text-red-600">(Unpaid)</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
