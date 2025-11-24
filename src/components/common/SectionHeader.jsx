import { Search } from 'lucide-react';

const SectionHeader = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  buttonText, 
  buttonTextMobile,
  buttonIcon: ButtonIcon = Search,
  onButtonClick,
  showButton = true,
  gradientFrom = 'from-[#334a5e]',
  gradientTo = 'to-[#2ecc70]'
}) => {
  return (
    <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-xl shadow-lg p-6 text-white`}>
      <div className="w-full flex items-center gap-6 justify-start">
        
        {/* Contenido Izquierdo */}
        <div className="flex items-center gap-6 flex-1">
          <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-blur-sm">
            <Icon className="w-8 h-8 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-3xl font-bold">{title}</h1>
            <p className="text-blue-100 text-sm md:text-base mt-1">{subtitle}</p>
          </div>
        </div>

        {/* Botón Derecho - Condicional */}
        {showButton && (
          <button
            onClick={onButtonClick}
            className="bg-white hover:bg-blue-50 text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold transition shadow-lg flex items-center gap-2 whitespace-nowrap"
          >
            <ButtonIcon className="w-5 h-5 md:w-6 md:h-6" />
            <span className="hidden sm:inline">{buttonText}</span>
            <span className="sm:hidden">{buttonTextMobile}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
