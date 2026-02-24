import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Trash2, UploadCloud } from "lucide-react";

const API_BASE = import.meta.env.VITE_BASE;
const API = `${API_BASE}/project-holidays`;

export default function ProjectHolidays() {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(); // hidden input ref

  // fetch images
  const fetchImages = async () => {
    const res = await axios.get(API);
    setImages(res.data);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // open file picker when icon clicked
  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  // when user selects file → upload immediately
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post(`${API}/upload`, formData);
      fetchImages();
    } catch (err) {
      alert("Upload failed");
    }
  };

  // delete image
  const handleDelete = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchImages();
  };

  return (
    <div className="p-6 mt-16">
      <h2 className="text-2xl font-semibold mb-6">ProjectHolidays</h2>

      {/* 🔵 Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        hidden
      />

      {/* 🔵 Upload Icon Button */}
      <button
        onClick={openFilePicker}
        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-green-700 transition mb-8"
      >
        <UploadCloud size={20} />
        Upload Image
      </button>

      {/* 🔵 Image Grid */}
      {images.length === 0 ? (
        <p className="text-gray-500">No images uploaded yet</p>
      ) : (
        <div className="gap-6">
          {images.map((img) => (
            <div
              key={img._id}
              className="relative group overflow-hidden rounded-xl shadow-lg"
            >
              <div className="w-full px-[30px] flex justify-center">
                <img
                  src={img.imageUrl}
                  alt=""
                  className="max-h-[800px] object-contain"
                />
              </div>

              {/* Delete Button Overlay */}
              <button
                onClick={() => handleDelete(img._id)}
                className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
