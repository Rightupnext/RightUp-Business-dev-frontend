import React from "react";

export default function InputField({ type, placeholder, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  );
}
