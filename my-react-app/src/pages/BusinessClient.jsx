import React, { useEffect, useState } from "react";
import axios from "axios";
import ClientModal from "../components/modals/ClientModal";
import ClientTable from "../components/tables/ClientTable";

export default function BusinessClient() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/clients");
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
      await axios.delete(`http://localhost:5000/api/clients/${id}`);
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
        <h1 className="text-xl font-semibold">Business Clients</h1>
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
        <ClientTable data={clients} onEdit={handleEdit} onDelete={handleDelete} />
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
