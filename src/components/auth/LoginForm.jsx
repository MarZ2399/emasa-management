import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import logoImage from "../../assets/logo-emasa1.png";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    correo: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.correo, formData.password);

    if (result.success) {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Lado izquierdo - Banner compacto */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Fondo con gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600"></div>
        
        {/* Formas geométricas decorativas */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-emerald-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-24 left-1/4 w-72 h-72 bg-teal-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Grid sutil de fondo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          {/* Header con logo */}
          <div>
            <div className="mb-12">
    <img 
      src={logoImage} 
      alt="EMASA - Gestión Empresarial" 
      className="h-16 object-contain drop-shadow-2xl"
    />
  </div>

            {/* Título principal - enfoque corporativo */}
<div className="mb-10">
  <h1 className="text-5xl font-bold leading-tight mb-4">
    SalesCore:<br />
    El corazón de<br />
    <span className="text-green-200">nuestra gestión</span>
  </h1>
  <p className="text-lg text-green-50 leading-relaxed">
    Conectando cada área para potenciar nuestras ventas y optimizar resultados
  </p>
</div>


            {/* Features compactos */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">Gestión en tiempo real</div>
                  <div className="text-xs text-green-100">Información actualizada al instante</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">Seguridad avanzada</div>
                  <div className="text-xs text-green-100">Protección de datos garantizada</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">Reportes detallados</div>
                  <div className="text-xs text-green-100">Analytics y métricas completas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer compacto */}
          {/* <div className="pt-6 border-t border-white/10">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-sm font-bold">
                  JD
                </div>
              </div>
              <div>
                <p className="text-green-50 text-sm italic mb-1.5">
                  "EMASA transformó completamente nuestra forma de trabajar."
                </p>
                <div className="text-xs">
                  <div className="font-semibold">Juan Díaz</div>
                  <div className="text-green-100">Director General, TechCorp</div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Lado derecho - Formulario minimalista */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Header móvil */}
          <div className="lg:hidden mb-12">
  <img 
    src={logoImage} 
    alt="EMASA Logo" 
    className="h-10 object-contain"
  />
</div>

          {/* Título */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Bienvenido
            </h2>
            <p className="text-gray-500">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Correo - diseño minimalista */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('correo')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="tu@emasa.pe"
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-green-500 transition-all text-gray-900 placeholder-gray-400"
                  required
                  autoComplete="email"
                />
                <Mail className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  focusedField === 'correo' ? 'text-green-500' : 'text-gray-400'
                }`} />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <Link 
      to="/forgot-password" 
      className="text-sm font-medium text-green-600 hover:text-green-700"
    >
      ¿Olvidaste tu contraseña?
    </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-green-500 transition-all text-gray-900 placeholder-gray-400"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                    focusedField === 'password' ? 'text-green-500' : 'text-gray-400'
                  } hover:text-green-600`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Mantener sesión iniciada
              </label>
            </div>

            {/* Botón - estilo minimalista */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando...
                </span>
              ) : (
                <span className="relative z-10">Iniciar sesión</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <a href="#" className="font-semibold text-green-600 hover:text-green-700">
              Solicitar acceso
            </a>
          </p>

          <p className="mt-12 text-center text-xs text-gray-400">
            © 2026 EMASA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
