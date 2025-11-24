import React from 'react';

const StatsCard = ({ title, value, color = 'blue', icon: Icon }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-600 text-blue-600',
    green: 'bg-green-50 border-green-600 text-green-600',
    purple: 'bg-purple-50 border-purple-600 text-purple-600',
    red: 'bg-red-50 border-red-600 text-red-600',
  };

  return (
    <div className={`${colorClasses[color]} border-l-4 p-4 rounded`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        </div>
        {Icon && <Icon className={`w-8 h-8 text-${color}-600 opacity-50`} />}
      </div>
    </div>
  );
};

export default StatsCard;