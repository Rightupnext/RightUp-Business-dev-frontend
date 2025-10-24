import React from "react";

export default function Button({ text, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-600 transition"
    >
      {text}
    </button>
  );
}
