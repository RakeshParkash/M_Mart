import { useEffect, useState } from "react";
import api from "../utils/api";

function UserStatusBadge({ isActive }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-bold ${
        isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function HistoryEntry({ entry, onDelete, type }) {
  return (
    <div className="border rounded-lg p-3 my-2 bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">{entry.date}</h4>
        <button
          onClick={() => onDelete(type, entry.date)}
          className="text-red-600 hover:text-red-800 cursor-pointer text-sm"
          title="Delete This Date's Entries"
        >
          🗑 Delete
        </button>
      </div>
      <div className="space-y-1">
        {entry.items.map((item, i) => (
          <div key={i} className="text-sm flex justify-between">
            <div>
              <strong>{item.name}</strong> × {item.quantity}
            </div>
            {type === "purchased_history" && (
              <div>
                ₹{item.totalPrice} (Adv ₹{item.advancePaid})
              </div>
            )}
            {type === "dues" && (
              <div>
                ₹{item.dueAmount} –{" "}
                {item.fullyPaid ? (
                  <span className="text-green-600 font-semibold">Paid</span>
                ) : (
                  <span className="text-red-600 font-semibold">Due</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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
        // Only send password if creating new user or if updated password (you might want to improve logic)
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
    const { name, value, type, checked } = e.target;

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
    const { name, value, type, checked } = e.target;

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
      // Prepare due items - fullyPaid must be boolean
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
  const deleteHistoryEntry = async (type, date) => {
    if (!viewHistoryUser) return;
    if (!window.confirm(`Delete ${type} entry for date ${date}?`)) return;
    try {
      await api.delete(
        `/admin/user/${viewHistoryUser._id}/history/${type}/${date}`
      );
      alert(`${type} entry deleted`);
      getUsers();
    } catch (err) {
      alert("Failed to delete history entry");
    }
  };

  //
  // Render
  //
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-5 text-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-blue-900 tracking-tight">
            User Management
          </h2>
          <button
            onClick={openAddUserModal}
            className="flex gap-1 items-center px-5 py-2 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white font-bold shadow hover:from-blue-700 hover:to-blue-600 active:scale-95 transition cursor-pointer"
          >
            <span className="text-lg">+</span> Add New User
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 rounded-md p-3 mb-4">{error}</div>
        )}

        {fetching ? (
          <div className="text-center text-xl text-blue-700">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-500">No users found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white shadow-xl hover:shadow-2xl rounded-2xl p-6 flex flex-col"
              >
                <h3 className="text-xl font-semibold text-blue-900 mb-1 truncate">
                  {user.firstName} {user.lastName || ""}
                </h3>
                <p className="text-gray-600 text-sm mb-1">{user.email}</p>
                <p className="text-gray-600 text-sm mb-1 font-mono">{user.phone}</p>
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => openEditUserModal(user)}
                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-xs"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition text-xs"
                  >
                    🗑 Delete
                  </button>
                  <button
                    onClick={() => openHistoryModal(user, "purchase")}
                    className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition text-xs"
                  >
                    🛒 Purchases
                  </button>
                  <button
                    onClick={() => openHistoryModal(user, "due")}
                    className="px-3 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 transition text-xs"
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
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
            style={{ backdropFilter: "blur(3px)" }}
            onClick={() => setModalOpen(false)}
          >
            <div
              className="w-full max-w-lg bg-white rounded-2xl p-8 shadow-2xl relative max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-semibold mb-4 text-blue-800 flex items-center gap-2">
                {editing ? "✏️ Edit User" : "➕ Add New User"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute right-5 top-4 text-gray-400 hover:text-gray-600 text-2xl leading-tight font-bold cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                ✕
              </button>
              <form onSubmit={submitUserForm} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">First Name</label>
                    <input
                      name="firstName"
                      value={userForm.firstName}
                      onChange={handleUserForm}
                      required
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Last Name</label>
                    <input
                      name="lastName"
                      value={userForm.lastName}
                      onChange={handleUserForm}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={userForm.email}
                      onChange={handleUserForm}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Phone</label>
                    <input
                      name="phone"
                      value={userForm.phone}
                      onChange={handleUserForm}
                      required
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  {!editing && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold mb-1">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={userForm.password}
                        onChange={handleUserForm}
                        required={!editing}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-gradient-to-tr from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white py-2 rounded-xl text-lg font-bold active:scale-95 transition cursor-pointer"
                >
                  {editing ? "Update User" : "Add User"}
                </button>

                {error && (
                  <p className="text-red-500 text-center mt-2 font-semibold">{error}</p>
                )}
              </form>
            </div>
          </div>
        )}

        {/* User History Modal */}
        {viewHistoryUser && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-10 pb-10 overflow-auto"
            style={{ backdropFilter: "blur(3px)" }}
            onClick={closeHistoryModal}
          >
            <div
              className="w-full max-w-4xl bg-white rounded-2xl p-6 shadow-2xl relative max-h-[85vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeHistoryModal}
                className="absolute right-6 top-4 text-gray-400 hover:text-gray-700 text-3xl font-bold cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                ✕
              </button>

              <h3 className="text-3xl font-semibold text-blue-900 mb-4">
                {viewHistoryUser.firstName} {viewHistoryUser.lastName || ""}
              </h3>
              <div className="flex gap-4 mb-4">
                <button
                  className={`px-4 py-2 rounded-md font-semibold transition ${
                    historyTab === "purchase"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setHistoryTab("purchase")}
                >
                  Purchase History
                </button>
                <button
                  className={`px-4 py-2 rounded-md font-semibold transition ${
                    historyTab === "due"
                      ? "bg-purple-600 text-white"
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
  <p>No purchase history</p>
)}

              {(viewHistoryUser?.purchased_history ?? [])
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((entry, idx) => (
                  <HistoryEntry
                    key={`${entry.date}-${idx}`}
                    entry={entry}
                    onDelete={deleteHistoryEntry}
                    type="purchased_history"
                  />
              ))}


                  {/* Add Purchase Form */}
                  <div className="mt-6 border-t pt-5">
                    <h4 className="font-semibold mb-3 text-lg text-blue-800">
                      Add Purchase Entry
                    </h4>
                    <form onSubmit={submitPurchase} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">
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
                          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {purchaseForm.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
                        >
                          <div>
                            <label className="block text-xs font-semibold mb-1">
                              Item Name
                            </label>
                            <input
                              type="text"
                              name="itemName"
                              value={item.name}
                              onChange={(e) => handlePurchaseFormChange(e, idx)}
                              required
                              className="w-full border p-2 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min={1}
                              name="quantity"
                              value={item.quantity}
                              onChange={(e) => handlePurchaseFormChange(e, idx)}
                              required
                              className="w-full border p-2 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">
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
                              className="w-full border p-2 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">
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
                              className="w-full border p-2 rounded"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePurchaseItem(idx)}
                            className="text-red-600 hover:text-red-900 font-bold"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addPurchaseItem}
                        className="text-blue-600 hover:text-blue-900 font-bold"
                      >
                        + Add Item
                      </button>
                      <button
                        type="submit"
                        className="block mt-4 w-full bg-blue-600 text-white py-2 rounded"
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
  <p>No purchase history</p>
)}

                  {(viewHistoryUser?.dues ?? [])
                    .slice()
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((entry , idx) => (
                      <HistoryEntry
                        key={`${entry.date}-${idx}`}
                        entry={entry}
                        onDelete={deleteHistoryEntry}
                        type="dues"
                      />
                    ))}
                  {/* Add Due Form */}
                  <div className="mt-6 border-t pt-5">
                    <h4 className="font-semibold mb-3 text-lg text-purple-800">
                      Add Due Entry
                    </h4>
                    <form onSubmit={submitDue} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">
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
                          className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {dueForm.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
                        >
                          <div>
                            <label className="block text-xs font-semibold mb-1">
                              Item Name
                            </label>
                            <input
                              type="text"
                              name="itemName"
                              value={item.name}
                              onChange={(e) => handleDueFormChange(e, idx)}
                              required
                              className="w-full border p-2 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min={1}
                              name="quantity"
                              value={item.quantity}
                              onChange={(e) => handleDueFormChange(e, idx)}
                              required
                              className="w-full border p-2 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">
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
                              className="w-full border p-2 rounded"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="block text-xs font-semibold mb-1">
                              Fully Paid
                            </label>
                            <input
                              type="checkbox"
                              name="fullyPaid"
                              checked={item.fullyPaid}
                              onChange={(e) => handleDueFormChange(e, idx)}
                              className="accent-purple-600 w-5 h-5"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDueItem(idx)}
                            className="text-red-600 hover:text-red-900 font-bold"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addDueItem}
                        className="text-purple-600 hover:text-purple-900 font-bold"
                      >
                        + Add Item
                      </button>
                      <button
                        type="submit"
                        className="block mt-4 w-full bg-purple-600 text-white py-2 rounded"
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
