import React from "react";
import { X } from "lucide-react";

export default function ProjectModal({ open, onClose, projects, title }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-600 hover:text-red-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          {title} Projects
        </h2>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Project Name</th>
                <th className="border px-3 py-2 text-left">Project Head</th>
                <th className="border px-3 py-2 text-left">Type</th>
                <th className="border px-3 py-2 text-left">Start Date</th>
                <th className="border px-3 py-2 text-left">End Date</th>
                <th className="border px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{project.projectName}</td>
                    <td className="border px-3 py-2">
                      {project.projectHead?.name || "-"}
                    </td>
                    <td className="border px-3 py-2">{project.projectType}</td>
                    <td className="border px-3 py-2">{project.startDate || "-"}</td>
                    <td className="border px-3 py-2">{project.endDate || "-"}</td>
                    <td className="border px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          project.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400 italic">
                    No {title} projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
