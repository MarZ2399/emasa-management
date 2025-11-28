const InfoCard = ({ title, subtitle, icon, color, data }) => {
  const colors = {
    green: {
      border: 'border-[#2ecc70]',
      header: 'bg-[#2ecc70]',
      label: 'bg-[#2ecc70]/10'
    },
    blue: {
      border: 'border-[#334a5e]',
      header: 'bg-[#334a5e]',
      label: 'bg-[#334a5e]/10'
    }
  };

  const selectedColor = colors[color] || colors.green;
  const isContactCard = title === 'Datos Contacto';

  return (
    <div className={`border ${selectedColor.border} rounded-lg overflow-hidden h-full`}>
      <div className={`${selectedColor.header} text-white px-4 py-3 flex items-center justify-between`}>
        <h3 className="font-bold flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {subtitle && (
          <span className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">
            {subtitle}
          </span>
        )}
      </div>

      <div className="p-4">
        {isContactCard ? (
          // Layout ESPECIAL para contactos: 3 columnas con fields verticales
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((contact, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3"
              >
                {/* Título del contacto */}
                <div className="font-bold text-[#334a5e] text-base mb-3 pb-2 border-b border-gray-300">
                  {contact.title || `Contacto ${index + 1}`}
                </div>

                {/* Correo */}
                <div className="space-y-1">
                  <div className={`${selectedColor.label} px-2 py-1 rounded text-xs font-semibold`}>
                    Correo
                  </div>
                  <div className="px-2 py-1 bg-white rounded text-xs break-all">
                    {contact.email || '-'}
                  </div>
                </div>

                {/* Teléfono */}
                <div className="space-y-1">
                  <div className={`${selectedColor.label} px-2 py-1 rounded text-xs font-semibold`}>
                    Teléfono
                  </div>
                  <div className="px-2 py-1 bg-white rounded text-xs">
                    {contact.phone || '-'}
                  </div>
                </div>

                {/* Nombre */}
                <div className="space-y-1">
                  <div className={`${selectedColor.label} px-2 py-1 rounded text-xs font-semibold`}>
                    Nombre Completo
                  </div>
                  <div className="px-2 py-1 bg-white rounded text-xs break-words">
                    {contact.fullName || '-'}
                  </div>
                </div>

                {/* Cumpleaños */}
                <div className="space-y-1">
                  <div className={`${selectedColor.label} px-2 py-1 rounded text-xs font-semibold`}>
                    Cumpleaños
                  </div>
                  <div className="px-2 py-1 bg-white rounded text-xs">
                    {contact.birthday || '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Layout NORMAL (dos columnas: label | valor)
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 text-sm">
                <div
                  className={`${selectedColor.label} px-3 py-2 rounded font-semibold ${
                    item.highlight === 'red' ? 'text-red-700' : ''
                  }`}
                >
                  {item.label}
                </div>
                <div
                  className={`col-span-2 px-3 py-2 bg-gray-50 rounded break-words ${
                    item.highlight === 'red' ? 'font-semibold text-red-700' : ''
                  }`}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoCard;
