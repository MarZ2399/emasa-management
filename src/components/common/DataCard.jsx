// src/components/common/DataCard.jsx
const DataCard = ({ title, icon, data, bgColor = 'bg-[#334a5e]' }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
    <div className={`${bgColor} text-white p-4 flex items-center gap-2`}>
      {icon}
      <h3 className="font-bold text-lg">{title}</h3>
    </div>
    <div className="p-6">
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="grid grid-cols-[200px_1fr] gap-4">
            <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">
              {item.label}
            </div>
            <div className={`px-4 py-2 ${item.highlight ? 'font-semibold text-red-700' : ''}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DataCard;
