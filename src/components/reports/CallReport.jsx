import React from 'react';
import {
  Phone,
  Search,
  Loader2,
  CalendarDays,
  Users,
  PhoneCall,
  Repeat2,
  BarChart3,
  X,
  Download, 
} from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import TablePaginator from '../common/TablePaginator';
import { useCallReport } from '../../hooks/useCallReport';
import { exportCallReportExcel } from '../../utils/exportCallReportExcel';
import toast from 'react-hot-toast';


const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatFechaHora = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';

  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const texto = (v) => v || '—';

const KpiCard = ({ icon: Icon, titulo, valor, detalle, color = 'slate' }) => {
  const styles = {
    slate: 'border-slate-200 text-slate-700 bg-slate-50',
    blue: 'border-blue-200 text-blue-700 bg-blue-50',
    green: 'border-green-200 text-green-700 bg-green-50',
    amber: 'border-amber-200 text-amber-700 bg-amber-50',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{titulo}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 tabular-nums">{valor}</p>
          <p className="mt-1 text-xs text-gray-500">{detalle}</p>
        </div>

        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${styles[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const CallReport = () => {
  const {
    loading,
    error,
    buscado,
    data,
    total,
    totalRaw,
    vendedores,
    vendedor,
    setVendedor,
    fechaDesde,
    fechaHasta,
    setFechaDesde,
    setFechaHasta,
    buscar,
    limpiar,
  } = useCallReport();

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE_OPTIONS[0]);

  React.useEffect(() => {
    setPage(1);
  }, [data, pageSize]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const paginated = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const totalLlamadas = data.length;

  const clientesUnicos = React.useMemo(() => {
    const set = new Set();
    data.forEach((row) => {
      set.add(`${row.ruc_emp_contacto ?? ''}-${row.raz_social ?? ''}`);
    });
    return set.size;
  }, [data]);

  const tasaContacto = React.useMemo(() => {
    if (!data.length) return 0;

    const contactadas = data.filter((row) => {
      const txt = `${row.resultado_gestion_nom ?? ''}`.toLowerCase();
      return txt.includes('contactado') || txt.includes('venta');
    }).length;

    return (contactadas / data.length) * 100;
  }, [data]);

  const seguimientoPendiente = React.useMemo(() => {
    return data.filter((row) => {
      const txt = `${row.resultado_gestion_nom ?? ''} ${row.observaciones ?? ''}`.toLowerCase();
      return txt.includes('seguimiento') || txt.includes('llamar luego');
    }).length;
  }, [data]);

  const vendedorLabel =
  vendedores.find((item) => String(item.value) === String(vendedor))?.label || 'Todo mi equipo';

const exportarExcel = () => {
  try {
    const toastId = toast.loading('Generando Excel...');

    exportCallReportExcel({
      rows: data,
      fechaDesde,
      fechaHasta,
      vendedorLabel,
    });

    toast.success('Excel descargado correctamente', { id: toastId });
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    toast.error('No se pudo generar el Excel');
  }
};

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Phone}
        title="Reporte de Contacto a Clientes"
        subtitle="Consulta tus llamadas y las de tu equipo por rango de fechas"
        showButton={false}
      />

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-600 mb-2 tracking-wide">
              <CalendarDays className="inline w-3.5 h-3.5 mr-1" />
              Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-600 mb-2 tracking-wide">
              <CalendarDays className="inline w-3.5 h-3.5 mr-1" />
              Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <div className="min-w-[260px] flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-2 tracking-wide">
              <Users className="inline w-3.5 h-3.5 mr-1" />
              Vendedor / Equipo
            </label>
            <select
              value={vendedor}
              onChange={(e) => setVendedor(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
            >
              <option value="">Todo mi equipo</option>
              {vendedores.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={buscar}
            disabled={loading || !fechaDesde || !fechaHasta}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </button>

          <button
            onClick={limpiar}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>

          <button
  onClick={exportarExcel}
  disabled={loading || !data.length}
  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
>
  <Download className="w-4 h-4" />
  Exportar Excel
</button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* {buscado && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            icon={PhoneCall}
            titulo="Total llamadas"
            valor={totalLlamadas}
            detalle={`Total consultado: ${totalRaw}`}
            color="slate"
          />
          <KpiCard
            icon={Users}
            titulo="Clientes únicos"
            valor={clientesUnicos}
            detalle="Clientes distintos contactados"
            color="blue"
          />
          <KpiCard
            icon={BarChart3}
            titulo="Tasa de contacto"
            valor={`${tasaContacto.toFixed(1)}%`}
            detalle="Contactadas / total llamadas"
            color="green"
          />
          <KpiCard
            icon={Repeat2}
            titulo="Seguimiento pendiente"
            valor={seguimientoPendiente}
            detalle="Requieren próxima acción"
            color="amber"
          />
        </div>
      )} */}

      {buscado && !loading && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Mostrando <strong className="text-gray-800">{data.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, data.length)}</strong> de{' '}
              <strong className="text-gray-800">{data.length}</strong> registro(s)
            </p>

            <div className="text-sm text-gray-600 flex flex-wrap gap-4">
              <span>Llamadas: <strong className="text-gray-800">{totalLlamadas}</strong></span>
              <span>Clientes: <strong className="text-gray-800">{clientesUnicos}</strong></span>
              <span>Total API: <strong className="text-gray-800">{total}</strong></span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">RUC</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Razón Social</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Tipo Contacto</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Resultado Gestión</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Teléfono 1</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Teléfono 2</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Observaciones</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Fecha y Hora de Gestión</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Asesor</th>
                  </tr>
                </thead>

                <tbody className="bg-white">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-14 text-center text-gray-400">
                        <Phone className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No se encontraron llamadas para este rango</p>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((row, idx) => (
                      <tr
                        key={`${row.id_llamada ?? 'llamada'}-${idx}`}
                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        
                        <td className="px-4 py-3 whitespace-nowrap text-gray-800 tabular-nums">{texto(row.ruc_emp_contacto)}</td>
                        <td className="px-4 py-3 text-gray-900 font-semibold max-w-[280px] truncate" title={row.raz_social}>
                          {texto(row.raz_social)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{texto(row.tipo_contacto_nom)}</td>
                        <td className="px-4 py-3 text-gray-700 max-w-[300px] truncate" title={row.resultado_gestion_nom}>
                          {texto(row.resultado_gestion_nom)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{texto(row.telefono_1)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{texto(row.telefono_2)}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[360px] truncate" title={row.observaciones}>
                          {texto(row.observaciones)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{formatFechaHora(row.fecha_registro)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{texto(row.nom_asesor)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <TablePaginator
              page={page}
              totalPages={totalPages}
              total={data.length}
              pageSize={pageSize}
              onPage={setPage}
              pageSizeOptions={[10, 20, 50]}
              onPageSize={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CallReport;