import React from "react";

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="relative w-full max-w-4xl h-[90vh] flex justify-center items-center">
        <img
          src={imageUrl}
          alt="Task"
          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 font-bold px-3 py-1 rounded-full shadow"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
