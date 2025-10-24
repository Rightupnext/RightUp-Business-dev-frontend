import React from "react";

const CardDashboard = () => {
  const cards = [
    { title: "Team Members" },
    { title: "Websites" },
    { title: "Digital Marketing" },
    { title: "" }, // Empty card (placeholder)
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-10 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-indigo-50 shadow-sm rounded-md h-32 flex items-center justify-center hover:shadow-md transition-all duration-300"
          >
            {card.title && (
              <h2 className="text-gray-800 text-center font-medium">
                {card.title}
              </h2>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardDashboard;
