import React, { useState, useMemo } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function ClientTable({ data, onEdit, onDelete }) {
  const clients = Array.isArray(data) ? data : [];

  const [searchTerm, setSearchTerm] = useState("");

  // 🔍 Filter logic
  const filteredClients = useMemo(() => {
    return clients.filter((client, index) => {
      const siNo = (index + 1).toString();
      const name = client.clientName?.toLowerCase() || "";
      const contact = client.clientContact?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();

      return (
        siNo.includes(search) ||
        name.includes(search) ||
        contact.includes(search)
      );
    });
  }, [clients, searchTerm]);

  return (
    <div className="w-full bg-white border border-gray-300 rounded-lg shadow-sm p-4">
      {/* 🔍 Search Bar */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-800">Client List</h2>
        <input
          type="text"
          placeholder="Search by SI No, Name, or Contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Table */}
      <div
        className="w-full overflow-x-auto rounded-lg border border-gray-200"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              {[
                "SI No",
                "Client Name",
                "Referral Name",
                "Requirement",
                "Contact",
                "Email Id",
                "Location",
                "Last Discussion Date",
                "Followup Date",
                "Reminder Date",
                "Reminder Time (AM/PM)",
                "Reminder Message",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="p-3 border-b border-gray-300 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td
                  colSpan={13}
                  className="text-center p-6 text-gray-500 border-t border-gray-200"
                >
                  No matching data found
                </td>
              </tr>
            ) : (
              filteredClients.map((client, index) => {
                const reminder = client.reminders?.[0] || {};
                return (
                  <tr
                    key={client._id}
                    className="hover:bg-gray-50 transition-colors border-t border-gray-200"
                  >
                    {/* ✅ Serial Number */}
                    <td className="p-3 whitespace-nowrap text-gray-700 font-medium">
                      {index + 1}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {client.clientName || "-"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {client.clientRefrence || "-"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {client.clientRequirement || "-"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {client.clientContact || "-"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {client.clientEmail || "-"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {client.clientLocation || "-"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {client.clientDiscussionDate || "-"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {client.clientFollowup || "-"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {reminder.date || "-"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {reminder.time || "-"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {reminder.message || "-"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onEdit(client)}
                          className="p-1 rounded hover:bg-blue-100"
                        >
                          <PencilIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                        </button>
                        <button
                          onClick={() => onDelete(client._id)}
                          className="p-1 rounded hover:bg-red-100"
                        >
                          <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
