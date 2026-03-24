import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { BASE_URL } from "./baseUrl";
import { FiPlus, FiX } from "react-icons/fi";

const defaultForm = {
  name: "",
  email: "",
  password: "",
  region: "global",
};

function AdminUsers() {
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/admin/list`, {
        headers: { authorization: `Bearer ${token}` },
      });
      setAdmins(res.data.admins || []);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to load admins", {
        containerId: "admins",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error("Please enter name", { containerId: "admins" });
        return;
      }
      if (!formData.email.trim()) {
        toast.error("Please enter email", { containerId: "admins" });
        return;
      }
      if (!formData.password.trim()) {
        toast.error("Please enter password", { containerId: "admins" });
        return;
      }

      const token = localStorage.getItem("token");
      const res = await axios.post(`${BASE_URL}/admin/register`, formData, {
        headers: { authorization: `Bearer ${token}` },
      });

      toast.success(res.data.message || "Admin created successfully", {
        containerId: "admins",
      });

      setFormData(defaultForm);
      setIsModalOpen(false);
      fetchAdmins();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to create admin", {
        containerId: "admins",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <ToastContainer containerId="admins" />
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Users</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiPlus /> Add Admin
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          {admins.length === 0 ? (
            <p className="text-gray-500">No admin users found.</p>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => (
                <div key={admin._id} className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg">{admin.name || "Admin"}</h3>
                  <p className="text-gray-700">{admin.email}</p>
                  <p className="text-sm text-gray-500">Region: {admin.region || "global"}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add Admin</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500">
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="password"
                  placeholder="Temporary password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;