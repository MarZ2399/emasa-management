import React from 'react';
import { Link } from 'react-router-dom';
import { FileBarChart2, Phone, ArrowRight } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';

const REPORTES = [
  {
    title: 'Reporte de Contactos al Cliente',
    description: 'Consulta tus llamadas y las de tu equipo con indicadores de gestión comercial.',
    to: '/reports/calls',
    icon: Phone,
    badge: 'Operaciones',
    accent: 'bg-green-500',
  },
];

const ReportsModule = () => {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={FileBarChart2}
        title="Reportes"
        subtitle="Accede a reportes operativos y de rendimiento"
        showButton={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {REPORTES.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className="group bg-white rounded-2xl border border-gray-200 shadow-sm p-3 md:p-4 hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${item.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                  {item.badge}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                  {item.title}
                </h2>

                <p className="text-sm text-gray-500 leading-5">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                <span>Ver reporte</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsModule;