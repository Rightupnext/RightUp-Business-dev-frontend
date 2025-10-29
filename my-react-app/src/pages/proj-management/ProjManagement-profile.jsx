import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaCamera } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_BASE;

export default function ProjManagementProfile() {
  const { token } = useContext(AuthContext);

  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    email: "",
    emp_role: "",
    address: "",
    bloodGroup: "",
    profileImage: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // ✅ Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data);
        if (res.data.profileImage) {
         setPreviewImage(`${API_BASE.replace("/api", "")}/${res.data.profileImage}`);

        }
      } catch (err) {
        console.error("Fetch Profile Error:", err);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file)); // ✅ Instant preview
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      Object.keys(form).forEach((key) => {
        fd.append(key, form[key]);
      });

      if (imageFile) {
        fd.append("profileImage", imageFile);
      }

      await axios.put(`${API_BASE}/profile/update`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Profile Updated Successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Update Failed");
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
        
        {/* ✅ Profile Image Upload Area */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <img
            src={
              previewImage ||
              "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
            }
            alt="Profile"
            className="w-full h-full rounded-full object-cover border shadow"
          />

          {/* ✅ Upload Camera Icon */}
          <label className="absolute bottom-1 right-1 bg-white p-1 rounded-full cursor-pointer shadow-md">
            <FaCamera className="text-gray-600" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">
          Profile Details
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {[
            { label: "Employee ID", name: "employeeId" },
            { label: "Name", name: "name" },
            { label: "Email ID", name: "email" },
            { label: "Role", name: "emp_role" },
            { label: "Address", name: "address" },
            { label: "Blood Group", name: "bloodGroup" },
          ].map((field) => (
            <div key={field.name} className="text-left">
              <label className="block text-gray-600 mb-1">{field.label}</label>
              <input
                type="text"
                name={field.name}
                value={form[field.name] || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring focus:ring-blue-200"
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}
