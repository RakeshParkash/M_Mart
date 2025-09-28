import { useEffect, useState } from "react";
import api from "../utils/api";
import { HistoryEntry } from "../components/Admin/HistoryEntry";

function UserStatusBadge({ isActive }) {
  return (
    <span
      className={`px-3 py-1 rounded text-sm font-bold ${
        isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

// function HistoryEntry({ entry, onDelete, type }) {
//   return (
//     <div className="border rounded-xl p-4 my-4 bg-gray-50 shadow">
//       <div className="flex justify-between items-center mb-2">
//         <h4 className="font-bold text-lg text-blue-900">{entry.date}</h4>
//         <button
//           onClick={() => onDelete(type, entry.date)}
//           className="text-red-600 hover:text-red-800 px-3 py-1 rounded-lg bg-red-100 font-semibold text-sm"
//           title="Delete This Date's Entries"
//         >
//           🗑 Delete
//         </button>
//       </div>
//       <div className="space-y-2">
//         {entry.items.map((item, i) => (
//           <div key={i} className="text-base flex justify-between">
//             <div>
//               <strong>{item.name}</strong> × {item.quantity}
//             </div>
//             {type === "purchased_history" && (
//               <div>
//                 ₹{item.totalPrice} <span className="text-gray-500">(Adv ₹{item.advancePaid})</span>
//               </div>
//             )}
//             {type === "dues" && (
//               <div>
//                 ₹{item.dueAmount} –{" "}
//                 {item.fullyPaid ? (
//                   <span className="text-green-700 font-bold">Paid</span>
//                 ) : (
//                   <span className="text-red-700 font-bold">Due</span>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Modal management
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // the user being edited/added

  // Form state for user details
  const [userForm, setUserForm] = useState(defaultUserForm());

  // Purchase / Due forms
  const [purchaseForm, setPurchaseForm] = useState(defaultPurchaseDueForm());
  const [dueForm, setDueForm] = useState(defaultPurchaseDueForm());

  // Viewing selected user's history tab: 'purchase' or 'due'
  const [viewHistoryUser, setViewHistoryUser] = useState(null);
  const [historyTab, setHistoryTab] = useState("purchase");

  const [error, setError] = useState("");

  //
  // Default form states
  //
  function defaultUserForm() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "", // for new users, empty ignore on edit ideally
    };
  }

  function defaultPurchaseDueForm() {
    return {
      date: "",
      items: [
        {
          name: "",
          quantity: 1,
          advancePaid: 0,
          totalPrice: 0,
          dueAmount: 0,
          fullyPaid: false,
        },
      ],
    };
  }

  //
  // Fetch users on load
  //
  const getUsers = async () => {
    setFetching(true);
    try {
      const { data } = await api.get("/admin/users");
      // According to your API, data.users is array
      setUsers(data.users || []);
    } catch (e) {
      setError("Failed to fetch users");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  //
  // User form handlers
  //
  const handleUserForm = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddUserModal = () => {
    setEditing(null);
    setUserForm(defaultUserForm());
    setModalOpen(true);
  };

  const openEditUserModal = (user) => {
    setEditing(user);
    setUserForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "", // leave blank on edit
      _id: user._id,
    });
    setModalOpen(true);
  };

  //
  // Submit new or updated user
  //
  const submitUserForm = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        email: userForm.email || "",
        phone: userForm.phone,
        ...(userForm.password ? { password: userForm.password } : {}),
      };

      if (editing) {
        await api.put(`/admin/user/${editing._id}`, payload);
      } else {
        await api.post("/admin/add-user", payload);
      }

      setModalOpen(false);
      getUsers();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to save user"
      );
    }
  };

  //
  // Delete user handler
  //
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/delete-user/${id}`);
      getUsers();
    } catch (err) {
      setError("Delete failed");
    }
  };

  //
  // Modal toggle for viewing purchase/due histories of user
  //
  const openHistoryModal = (user, type = "purchase") => {
    setViewHistoryUser(user);
    setHistoryTab(type);
  };

  const closeHistoryModal = () => {
    setViewHistoryUser(null);
    setPurchaseForm(defaultPurchaseDueForm());
    setDueForm(defaultPurchaseDueForm());
  };

  //
  // Purchase/Due Forms Handlers
  //
  const handlePurchaseFormChange = (e, index) => {
    const { name, value } = e.target;

    setPurchaseForm((prev) => {
      const newItems = [...prev.items];
      if (name === "date") return { ...prev, date: value };
      if (name === "itemName") newItems[index].name = value;
      else if (name === "quantity") newItems[index].quantity = Number(value);
      else if (name === "advancePaid") newItems[index].advancePaid = Number(value);
      else if (name === "totalPrice") newItems[index].totalPrice = Number(value);
      return { ...prev, items: newItems };
    });
  };

  const handleDueFormChange = (e, index) => {
    const { name, value, checked } = e.target;

    setDueForm((prev) => {
      const newItems = [...prev.items];
      if (name === "date") return { ...prev, date: value };
      if (name === "itemName") newItems[index].name = value;
      else if (name === "quantity") newItems[index].quantity = Number(value);
      else if (name === "dueAmount") newItems[index].dueAmount = Number(value);
      else if (name === "fullyPaid") newItems[index].fullyPaid = checked;
      return { ...prev, items: newItems };
    });
  };

  const addPurchaseItem = () => {
    setPurchaseForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", quantity: 1, advancePaid: 0, totalPrice: 0 },
      ],
    }));
  };

  const addDueItem = () => {
    setDueForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", quantity: 1, dueAmount: 0, fullyPaid: false },
      ],
    }));
  };

  const removePurchaseItem = (idx) => {
    setPurchaseForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const removeDueItem = (idx) => {
    setDueForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  //
  // Submit purchase/due for user
  //
  const submitPurchase = async (e) => {
    e.preventDefault();
    if (!viewHistoryUser) return;
    try {
      await api.post(`/admin/user/${viewHistoryUser._id}/purchase`, purchaseForm);
      alert("Purchase history updated");
      getUsers();
      setPurchaseForm(defaultPurchaseDueForm());
    } catch (err) {
      alert("Failed to update purchase history");
    }
  };

  const submitDue = async (e) => {
    e.preventDefault();
    if (!viewHistoryUser) return;
    try {
      const payload = {
        date: dueForm.date,
        items: dueForm.items.map(({ name, quantity, dueAmount, fullyPaid }) => ({
          name,
          quantity,
          dueAmount,
          fullyPaid: !!fullyPaid,
        })),
      };
      await api.post(`/admin/user/${viewHistoryUser._id}/due`, payload);
      alert("Due history updated");
      getUsers();
      setDueForm(defaultPurchaseDueForm());
    } catch (err) {
      alert("Failed to update due history");
    }
  };

  //
  // Delete history entry by date
  //
 const deleteHistoryItem = async (type, date, itemName) => {
  if (!viewHistoryUser) return;
  if (!window.confirm(`Delete ${type} item "${itemName}" for date ${date}?`)) return;
  try {
    await api.delete(
      `/admin/user/${viewHistoryUser._id}/history/${type}/${date}/${itemName}` // Ensure your backend supports this
    );
    alert(`${type} item deleted`);
    getUsers();
  } catch (err) {
    alert("Failed to delete history item");
  }
};

  //
  // Render
  //
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-8 text-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-extrabold text-blue-900 tracking-tight">
            User Management
          </h2>
          <button
            onClick={openAddUserModal}
            className="flex gap-2 items-center px-6 py-3 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-400 text-white text-lg font-bold shadow-lg hover:from-blue-800 hover:to-blue-600 active:scale-95 transition cursor-pointer"
          >
            <span className="text-2xl">+</span> Add New User
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 rounded-xl p-4 mb-6 text-lg font-semibold">{error}</div>
        )}

        {fetching ? (
          <div className="text-center text-2xl text-blue-700 py-10">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-10">No users found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white shadow-2xl hover:shadow-3xl rounded-3xl p-7 flex flex-col transition-transform duration-150 hover:scale-[1.03]"
              >
                <h3 className="text-2xl font-bold text-blue-900 mb-2 truncate">
                  {user.firstName} {user.lastName || ""}
                </h3>
                <p className="text-gray-600 text-base mb-2 font-mono">{user.email}</p>
                <p className="text-gray-600 text-base mb-2 font-mono">{user.phone}</p>
                <div className="mt-3 flex flex-wrap gap-3 items-center">
                  <button
                    onClick={() => openEditUserModal(user)}
                    className="px-4 py-2 rounded-xl bg-blue-200 text-blue-700 hover:bg-blue-300 transition text-base font-bold"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="px-4 py-2 rounded-xl bg-red-200 text-red-700 hover:bg-red-300 transition text-base font-bold"
                  >
                    🗑 Delete
                  </button>
                  <button
                    onClick={() => openHistoryModal(user, "purchase")}
                    className="px-4 py-2 rounded-xl bg-indigo-200 text-indigo-700 hover:bg-indigo-300 transition text-base font-bold"
                  >
                    🛒 Purchases
                  </button>
                  <button
                    onClick={() => openHistoryModal(user, "due")}
                    className="px-4 py-2 rounded-xl bg-purple-200 text-purple-700 hover:bg-purple-300 transition text-base font-bold"
                  >
                    💰 Dues
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User Add/Edit Modal */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
            style={{ backdropFilter: "blur(3px)" }}
            onClick={() => setModalOpen(false)}
          >
            <div
              className="w-full max-w-xl bg-white rounded-3xl p-10 shadow-3xl relative max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-3xl font-bold mb-6 text-blue-800 flex items-center gap-3">
                {editing ? "✏️ Edit User" : "➕ Add New User"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute right-8 top-6 text-gray-400 hover:text-gray-600 text-3xl leading-tight font-bold cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                ✕
              </button>
              <form onSubmit={submitUserForm} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">First Name</label>
                    <input
                      name="firstName"
                      value={userForm.firstName}
                      onChange={handleUserForm}
                      required
                      className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Last Name</label>
                    <input
                      name="lastName"
                      value={userForm.lastName}
                      onChange={handleUserForm}
                      className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={userForm.email}
                      onChange={handleUserForm}
                      className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone</label>
                    <input
                      name="phone"
                      value={userForm.phone}
                      onChange={handleUserForm}
                      required
                      className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  {!editing && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={userForm.password}
                        onChange={handleUserForm}
                        required={!editing}
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-tr from-blue-700 to-blue-400 hover:from-blue-800 hover:to-blue-600 text-white py-3 rounded-2xl text-xl font-bold active:scale-95 transition cursor-pointer"
                >
                  {editing ? "Update User" : "Add User"}
                </button>

                {error && (
                  <p className="text-red-500 text-center mt-3 font-semibold">{error}</p>
                )}
              </form>
            </div>
          </div>
        )}

        {/* User History Modal */}
        {viewHistoryUser && (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-10 pb-10 overflow-auto"
            style={{ backdropFilter: "blur(3px)" }}
            onClick={closeHistoryModal}
          >
            <div
              className="w-full max-w-3xl bg-white rounded-3xl p-8 shadow-3xl relative max-h-[85vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeHistoryModal}
                className="absolute right-8 top-6 text-gray-400 hover:text-gray-700 text-4xl font-bold cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                ✕
              </button>

              <h3 className="text-3xl font-bold text-blue-900 mb-6">
                {viewHistoryUser.firstName} {viewHistoryUser.lastName || ""}
              </h3>
              <div className="flex gap-5 mb-8">
                <button
                  className={`px-6 py-3 rounded-2xl font-bold text-lg transition ${
                    historyTab === "purchase"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setHistoryTab("purchase")}
                >
                  Purchase History
                </button>
                <button
                  className={`px-6 py-3 rounded-2xl font-bold text-lg transition ${
                    historyTab === "due"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setHistoryTab("due")}
                >
                  Due History
                </button>
              </div>

              {/* History List */}
              {historyTab === "purchase" && (
                <>
                  {(!viewHistoryUser.purchased_history || viewHistoryUser.purchased_history.length === 0) && (
                      <p className="text-lg text-gray-600 mb-3">No purchase history.</p>
                    )}
                    {(viewHistoryUser?.purchased_history ?? [])
                      .slice()
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((entry, idx) => (
                        <HistoryEntry
                          key={`${entry.date}-${idx}`}
                          entry={entry}
                          onDelete={deleteHistoryItem}
                          type="purchased_history"
                        />
                    ))}

                  {/* Add Purchase Form */}
                  <div className="mt-8 border-t pt-7">
                    <h4 className="font-bold mb-4 text-xl text-blue-800">
                      Add Purchase Entry
                    </h4>
                    <form onSubmit={submitPurchase} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold mb-2">
                          Date (YYYY-MM-DD)
                        </label>
                        <input
                          type="date"
                          value={purchaseForm.date}
                          name="date"
                          onChange={(e) =>
                            setPurchaseForm((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          required
                          className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {purchaseForm.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
                        >
                          <div>
                            <label className="block text-sm font-bold mb-2">
                              Item Name
                            </label>
                            <input
                              type="text"
                              name="itemName"
                              value={item.name}
                              onChange={(e) => handlePurchaseFormChange(e, idx)}
                              required
                              className="w-full border p-3 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-2">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min={1}
                              name="quantity"
                              value={item.quantity}
                              onChange={(e) => handlePurchaseFormChange(e, idx)}
                              required
                              className="w-full border p-3 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-2">
                              Advance Paid
                            </label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              name="advancePaid"
                              value={item.advancePaid}
                              onChange={(e) => handlePurchaseFormChange(e, idx)}
                              required
                              className="w-full border p-3 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-2">
                              Total Price
                            </label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              name="totalPrice"
                              value={item.totalPrice}
                              onChange={(e) => handlePurchaseFormChange(e, idx)}
                              required
                              className="w-full border p-3 rounded-xl"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePurchaseItem(idx)}
                            className="text-red-600 hover:text-red-900 font-bold text-xl"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addPurchaseItem}
                        className="text-blue-600 hover:text-blue-900 font-bold text-lg"
                      >
                        + Add Item
                      </button>
                      <button
                        type="submit"
                        className="block mt-5 w-full bg-blue-600 text-white py-3 rounded-2xl text-lg font-bold"
                      >
                        Save Purchase Entry
                      </button>
                    </form>
                  </div>
                </>
              )}

              {/* Due History Tab */}
              {historyTab === "due" && (
                <>
                  {(!viewHistoryUser.dues || viewHistoryUser.dues.length === 0) && (
                      <p className="text-lg text-gray-600 mb-3">No due history.</p>
                    )}
                    {(viewHistoryUser?.dues ?? [])
                      .slice()
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((entry, idx) => (
                        <HistoryEntry
                          key={`${entry.date}-${idx}`}
                          entry={entry}
                          onDelete={deleteHistoryItem}
                          type="dues"
                        />
                    ))}
                    
                  {/* Add Due Form */}
                  <div className="mt-8 border-t pt-7">
                    <h4 className="font-bold mb-4 text-xl text-purple-800">
                      Add Due Entry
                    </h4>
                    <form onSubmit={submitDue} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold mb-2">
                          Date (YYYY-MM-DD)
                        </label>
                        <input
                          type="date"
                          value={dueForm.date}
                          name="date"
                          onChange={(e) =>
                            setDueForm((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          required
                          className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {dueForm.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
                        >
                          <div>
                            <label className="block text-sm font-bold mb-2">
                              Item Name
                            </label>
                            <input
                              type="text"
                              name="itemName"
                              value={item.name}
                              onChange={(e) => handleDueFormChange(e, idx)}
                              required
                              className="w-full border p-3 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-2">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min={1}
                              name="quantity"
                              value={item.quantity}
                              onChange={(e) => handleDueFormChange(e, idx)}
                              required
                              className="w-full border p-3 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-2">
                              Due Amount
                            </label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              name="dueAmount"
                              value={item.dueAmount}
                              onChange={(e) => handleDueFormChange(e, idx)}
                              required
                              className="w-full border p-3 rounded-xl"
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-4">
                            <label className="block text-sm font-bold mb-2">
                              Fully Paid
                            </label>
                            <input
                              type="checkbox"
                              name="fullyPaid"
                              checked={item.fullyPaid}
                              onChange={(e) => handleDueFormChange(e, idx)}
                              className="accent-purple-600 w-6 h-6"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDueItem(idx)}
                            className="text-red-600 hover:text-red-900 font-bold text-xl"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addDueItem}
                        className="text-purple-600 hover:text-purple-900 font-bold text-lg"
                      >
                        + Add Item
                      </button>
                      <button
                        type="submit"
                        className="block mt-5 w-full bg-purple-600 text-white py-3 rounded-2xl text-lg font-bold"
                      >
                        Save Due Entry
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}