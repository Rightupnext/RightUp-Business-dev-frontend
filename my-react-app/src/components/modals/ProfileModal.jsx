import React, { useContext, useState } from "react";
import { X, Camera } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_BASE; // ✅ Use env base URL

export default function ProfileModal({ onClose }) {
  const { user, setUser, token } = useContext(AuthContext);

  // =====================================================
  // 🔥 Helper to build full image URL for local uploads
  // =====================================================
  const fullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; // Cloudinary
    return `${API_BASE}/${path}`; // Local uploads
  };

  // =====================================================
  // 🔥 Load existing image (converted to full URL)
  // =====================================================
  const [preview, setPreview] = useState(
    fullImageUrl(user?.profilePic || user?.profileImage)
  );

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // 📸 Image Selection Preview
  // =====================================================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // =====================================================
  // 💾 SAVE PROFILE — Upload + Update DB
  // =====================================================
  const handleSave = async () => {
    if (!imageFile) {
      onClose();
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("profileImage", imageFile);
      formData.append("name", user.name);
      formData.append("email", user.email);

      const res = await fetch(`${API_BASE}/profile/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      // Update UI + LocalStorage
      const updatedUser = {
        ...user,
        profilePic: fullImageUrl(data.profileImage), // ⭐ FIX: convert to full URL
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated!");
      onClose();
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile.");
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

        <div className="flex flex-col items-center gap-4 mt-4">

          {/* =======================
              Profile Image
          ======================== */}
          <label htmlFor="profile-upload" className="cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {preview ? (
                <img
                  src={fullImageUrl(preview)}
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

          {/* User Details */}
          <div className="w-full mt-2">
            <label className="block text-gray-700 mb-1">User Name:</label>
            <input
              type="text"
              value={user?.name || ""}
              readOnly
              className="w-full border rounded-md p-2 bg-gray-100 text-gray-700"
            />

            <label className="block text-gray-700 mt-3 mb-1">Email:</label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full border rounded-md p-2 bg-gray-100 text-gray-700"
            />
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
