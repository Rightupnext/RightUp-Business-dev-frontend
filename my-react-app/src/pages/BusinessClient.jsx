// frontend/pages/BusinessClient.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import ClientModal from "../components/modals/ClientModal";
import ClientTable from "../components/tables/ClientTable";
import { AuthContext } from "../context/AuthContext";
const API_BASE = import.meta.env.VITE_BASE; 

export default function BusinessClient() {
  const { token } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
        const res = await axios.get(`${API_BASE}/clients`,  {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      await axios.delete(`${API_BASE}/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClients();
    } catch (err) {
      console.error("Failed to delete client:", err);
      alert("Failed to delete client");
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">My Business Clients</h1>
        <button
          onClick={handleAdd}
          className="bg-[#5B4FE8] text-white px-4 py-2 rounded-md"
        >
          Add Client
        </button>
      </div>

      {loading ? (
        <p>Loading clients...</p>
      ) : (
        <ClientTable
          data={clients}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {modalOpen && (
        <ClientModal
          onClose={() => setModalOpen(false)}
          refresh={fetchClients}
          client={editingClient}
        />
      )}
    </div>
  );
}
