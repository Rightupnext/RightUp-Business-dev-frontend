import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function ClientTable({ data, onEdit, onDelete }) {
  const clients = Array.isArray(data) ? data : [];

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-gray-200 text-left">
          {[
            "Client Name",
            "Requirement",
            "Start Date",
            "End Date",
            "Contact",
            "Email Id",
            "Location",
            "Project Value",
            "Actions",
          ].map((header) => (
            <th key={header} className="p-2 border">{header}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {clients.length === 0 ? (
          <tr>
            <td colSpan={9} className="text-center p-4">
              No Data Available
            </td>
          </tr>
        ) : (
          clients.map((client) => (
            <tr key={client._id || client.id}>
              <td className="border p-2">{client.clientName}</td>
              <td className="border p-2">{client.clientRequirement}</td>
              <td className="border p-2">{client.clientStartDate}</td>
              <td className="border p-2">{client.clientEndDate}</td>
              <td className="border p-2">{client.clientContact}</td>
              <td className="border p-2">{client.clientEmail}</td>
              <td className="border p-2">{client.clientLocation}</td>
              <td className="border p-2">{client.clientProjectValue}</td>
              <td className="border p-2 flex gap-2">
                <button onClick={() => onEdit(client)}>
                  <PencilIcon className="h-5 w-5 text-blue-500" />
                </button>
                <button onClick={() => onDelete(client._id)}>
                  <TrashIcon className="h-5 w-5 text-red-500" />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
