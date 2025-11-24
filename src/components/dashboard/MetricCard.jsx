// src/components/dashboard/MetricCard.jsx
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricCard = ({ title, value, target, icon: Icon, color, trend }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = target ? Math.round((value / target) * 100) : 0;

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedValue(end);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendText = () => {
    if (trend > 0) return `+${trend}%`;
    if (trend < 0) return `${trend}%`;
    return '0%';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-1 text-sm">
          {getTrendIcon()}
          <span className={`font-medium ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {getTrendText()}
          </span>
        </div>
      </div>
      
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      
      <div className="flex items-end gap-2 mb-3">
        <span className="text-3xl font-bold text-gray-900">
          {animatedValue}
        </span>
        {target && (
          <span className="text-gray-500 text-sm mb-1">/ {target}</span>
        )}
      </div>

      {target && (
        <>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <p className={`text-xs font-semibold ${
            percentage >= 100 ? 'text-green-600' : percentage >= 70 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            {percentage}% completado
          </p>
        </>
      )}
    </div>
  );
};

export default MetricCard;
