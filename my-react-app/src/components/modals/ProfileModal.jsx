import React, { useContext, useState } from "react";
import { X, Camera } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
// 
import axios from "axios";

export default function ProfileModal({ onClose }) {
  const { user, setUser } = useContext(AuthContext);
  const [preview, setPreview] = useState(user?.profilePic || null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {

    
    setLoading(true);
    try {
      // ✅ We don't call backend. Just update local user data.
      const updatedUser = {
        ...user,
        profilePic: preview || user?.profilePic || "/default-avatar.png", // Hardcoded fallback
      };

      // ✅ Update context and localStorage (for persistence)
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] relative shadow-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* Profile Image */}
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="relative">
            <label htmlFor="profile-upload" className="cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center relative overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="text-gray-500" />
                )}
              </div>
              <input
                id="profile-upload"
                type="file"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* User Info (Read-only) */}
          <div className="w-full mt-2">
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">User Name:</label>
              <input
                type="text"
                value={user?.name || ""}
                readOnly
                className="w-full border rounded-md p-2 bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Email:</label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full border rounded-md p-2 bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end w-full gap-3 mt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
