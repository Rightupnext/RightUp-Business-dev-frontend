import React from "react";

const Members = () => {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-lg font-semibold mb-4">Members</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-4 py-2 text-left">Employee Id</th>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Role</th>
              <th className="border px-4 py-2 text-left">Email Id</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-3 text-gray-600"></td>
              <td className="border px-4 py-3 text-gray-600"></td>
              <td className="border px-4 py-3 text-gray-600"></td>
              <td className="border px-4 py-3 text-gray-600"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Members;
