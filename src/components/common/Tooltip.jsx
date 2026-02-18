// src/components/common/Tooltip.jsx
const Tooltip = ({ text, children, position = 'top' }) => {
  const positionClasses = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top:    'top-full left-1/2 -translate-x-1/2 border-t-gray-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800',
    left:   'left-full top-1/2 -translate-y-1/2 border-l-gray-800',
    right:  'right-full top-1/2 -translate-y-1/2 border-r-gray-800',
  };

  return (
    <div className="relative inline-flex group">
      {children}

      {/* Tooltip box */}
      <div className={`
        absolute ${positionClasses[position]} z-50
        px-2.5 py-1.5 rounded-lg
        bg-gray-800 text-white text-xs font-medium whitespace-nowrap
        opacity-0 scale-95 pointer-events-none
        group-hover:opacity-100 group-hover:scale-100
        transition-all duration-150 ease-out
        shadow-lg
      `}>
        {text}
        {/* Flecha */}
        <div className={`
          absolute border-4 border-transparent
          ${arrowClasses[position]}
        `} />
      </div>
    </div>
  );
};

export default Tooltip;
