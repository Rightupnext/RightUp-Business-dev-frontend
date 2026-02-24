import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE;
const API = `${API_BASE}/project-holidays`;

export default function ProjectHolidays() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch images
  const fetchImages = async () => {
    try {
      const res = await axios.get(API);
      setImages(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="p-6 mt-16">
      <h2 className="text-2xl font-semibold mb-6">Holiday Calendar</h2>

      {/* 🔵 Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="gap-6">
          {images.map((img) => (
            <div
              key={img._id}
              className="relative overflow-hidden rounded-xl shadow-lg"
            >
              <div className="w-full h-[450px] px-[30px] flex items-center justify-center bg-white">
                <img
                  src={img.imageUrl}
                  alt="holiday"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
