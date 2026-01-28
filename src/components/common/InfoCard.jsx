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
      {/* Header más compacto */}
      <div className={`${selectedColor.header} text-white px-3 py-2 flex items-center justify-between`}>
        <h3 className="font-bold text-sm flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {subtitle && (
          <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
            {subtitle}
          </span>
        )}
      </div>

      <div className="p-3">
        {isContactCard ? (
          // Layout ESPECIAL para contactos: 3 columnas compactas
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.map((contact, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2"
              >
                {/* Título del contacto más compacto */}
                <div className="font-bold text-[#334a5e] text-sm pb-1.5 border-b border-gray-300">
                  {contact.title || `Contacto ${index + 1}`}
                </div>

                {/* Correo */}
                <div className="space-y-0.5">
                  <div className={`${selectedColor.label} px-2 py-1 rounded text-xs font-semibold`}>
                    Correo
                  </div>
                  <div className="px-2 py-1 bg-white rounded text-xs break-all">
                    {contact.email || '-'}
                  </div>
                </div>

                {/* Teléfono */}
                <div className="space-y-0.5">
                  <div className={`${selectedColor.label} px-2 py-1 rounded text-xs font-semibold`}>
                    Teléfono
                  </div>
                  <div className="px-2 py-1 bg-white rounded text-xs">
                    {contact.phone || '-'}
                  </div>
                </div>

                {/* Nombre */}
                <div className="space-y-0.5">
                  <div className={`${selectedColor.label} px-2 py-1 rounded text-xs font-semibold`}>
                    Nombre Completo
                  </div>
                  <div className="px-2 py-1 bg-white rounded text-xs break-words">
                    {contact.fullName || '-'}
                  </div>
                </div>

                {/* Cumpleaños */}
                <div className="space-y-0.5">
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
          // Layout NORMAL: 3 columnas x 1 fila
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map((item, index) => (
              <div key={index} className="space-y-0.5">
                <div
                  className={`${selectedColor.label} px-2.5 py-1.5 rounded font-semibold text-xs ${
                    item.highlight === 'red' ? 'text-red-700' : ''
                  }`}
                >
                  {item.label}
                </div>
                <div
                  className={`px-2.5 py-1.5 bg-gray-50 rounded break-words text-xs ${
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
