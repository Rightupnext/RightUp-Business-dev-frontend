import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function ClientTable({ data, onEdit, onDelete }) {
  const clients = Array.isArray(data) ? data : [];

  return (
    <div
      className="w-full overflow-x-auto rounded-lg border border-gray-300 shadow-sm bg-white"
      style={{
        scrollbarWidth: "display", // Firefox
        msOverflowStyle: "none", // IE and Edge
      }}
    >
      {/* Hide scrollbar for Webkit browsers */}
      {/* <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style> */}

      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left text-gray-700">
            {[
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
          {clients.length === 0 ? (
            <tr>
              <td
                colSpan={15}
                className="text-center p-6 text-gray-500 border-t border-gray-200"
              >
                No Data Available
              </td>
            </tr>
          ) : (
            clients.map((client) => {
              const reminder = client.reminders?.[0] || {};
              return (
                <tr
                  key={client._id}
                  className="hover:bg-gray-50 transition-colors border-t border-gray-200"
                >
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
                
                  {/* <td className="p-3 whitespace-nowrap">
                    {client.clientStartDate || "-"}
                  </td> */}
                
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
  );
}
