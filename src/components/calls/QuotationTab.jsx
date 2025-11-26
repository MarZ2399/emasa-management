const QuotationTab = ({ quotationItems, setQuotationItems }) => {
  // Puedes mostrar aquí el resumen y permitir eliminar/editar cantidades:
const total = (quotationItems ?? []).reduce((sum, p) => {
  const precioDscto = p.precioNeto * ((100 - p.discount1) / 100) * ((100 - p.discount8) / 100);
  return sum + (precioDscto * p.quantity);
}, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Cotización</h2>
      <table className="w-full table-auto border rounded">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Código</th>
            <th>Cantidad</th>
            <th>Precio Neto</th>
            <th>1er Dscto</th>
            <th>8to Dscto</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(quotationItems ?? []).map((item, idx)=> {
            const precioDscto = item.precioNeto * ((100 - item.discount1) / 100) * ((100 - item.discount8) / 100);
            return (
              <tr key={idx}>
                <td>{item.nombre}</td>
                <td>{item.codigo}</td>
                <td>{item.quantity}</td>
                <td>S/ {item.precioNeto.toFixed(2)}</td>
                <td>{item.discount1}%</td>
                <td>{item.discount8}%</td>
                <td>S/ {(precioDscto * item.quantity).toFixed(2)}</td>
                <td>
                  <button
                    onClick={() => setQuotationItems(items => items.filter((_, i) => i !== idx))}
                    className="text-red-600 font-bold hover:underline"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-end p-4">
        <div className="text-xl font-bold">Total: S/ {total.toFixed(2)}</div>
      </div>
      {/* Botón para exportar/guardar/enviar cotización */}
    </div>
  );
};

export default QuotationTab;
