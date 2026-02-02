import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2, AlertCircle, Check, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(null);
  const [success, setSuccess] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔐 VALIDACIÓN DE CONTRASEÑA EN TIEMPO REAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false
  });

  // Validar contraseña en tiempo real
  useEffect(() => {
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      passwordsMatch: password.length > 0 && password === confirmPassword
    });
  }, [formData.password, formData.confirmPassword]);

  // Verificar si la contraseña cumple todos los requisitos
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  // Verificar token al montar
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setValidToken(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/verify-reset-token/${token}`
        );
        setValidToken(response.data.valid);
        if (!response.data.valid) {
          toast.error('El enlace es inválido o ha expirado');
        }
      } catch (error) {
        setValidToken(false);
        toast.error('Error al verificar el enlace');
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Por favor cumple con todos los requisitos de seguridad');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          token,
          newPassword: formData.password
        }
      );

      if (response.data.success) {
        setSuccess(true);
        toast.success('¡Contraseña actualizada exitosamente!');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de carga
  if (validToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  // Token inválido
  if (validToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Enlace Inválido
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            El enlace de recuperación es inválido o ha expirado. 
            Los enlaces expiran después de <strong>30 minutos</strong> por seguridad.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Solicitar nuevo enlace
          </Link>
          <Link
            to="/login"
            className="block mt-4 text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  // Éxito
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Listo!
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Tu contraseña ha sido actualizada exitosamente. 
            Serás redirigido al inicio de sesión...
          </p>
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Formulario de reset
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/src/assets/logo-emasa.jpg" 
              alt="EMASA Logo" 
              className="h-14 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Nueva Contraseña
          </h2>
          <p className="text-gray-600">
            Crea una contraseña segura para proteger tu cuenta
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nueva contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setPasswordFocused(true)}
                  placeholder="Ingresa tu nueva contraseña"
                  className="w-full px-4 py-3.5 pl-11 pr-11 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-green-500 transition-all text-gray-900"
                  required
                  disabled={loading}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 🔐 REGLAS DE SEGURIDAD CON INDICADORES VISUALES */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {(passwordFocused || formData.password.length > 0) && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Requisitos de seguridad:
                </p>
                
                {/* Longitud mínima */}
                <div className="flex items-center gap-2">
                  {passwordValidation.minLength ? (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    passwordValidation.minLength ? 'text-green-600 font-medium' : 'text-gray-600'
                  }`}>
                    Mínimo 8 caracteres
                  </span>
                </div>

                {/* Mayúscula */}
                <div className="flex items-center gap-2">
                  {passwordValidation.hasUppercase ? (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    passwordValidation.hasUppercase ? 'text-green-600 font-medium' : 'text-gray-600'
                  }`}>
                    Al menos una letra mayúscula (A-Z)
                  </span>
                </div>

                {/* Minúscula */}
                <div className="flex items-center gap-2">
                  {passwordValidation.hasLowercase ? (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    passwordValidation.hasLowercase ? 'text-green-600 font-medium' : 'text-gray-600'
                  }`}>
                    Al menos una letra minúscula (a-z)
                  </span>
                </div>

                {/* Número */}
                <div className="flex items-center gap-2">
                  {passwordValidation.hasNumber ? (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    passwordValidation.hasNumber ? 'text-green-600 font-medium' : 'text-gray-600'
                  }`}>
                    Al menos un número (0-9)
                  </span>
                </div>

                {/* Carácter especial */}
                <div className="flex items-center gap-2">
                  {passwordValidation.hasSpecialChar ? (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    passwordValidation.hasSpecialChar ? 'text-green-600 font-medium' : 'text-gray-600'
                  }`}>
                    Al menos un carácter especial (!@#$%^&*)
                  </span>
                </div>
              </div>
            )}

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repite tu contraseña"
                  className={`w-full px-4 py-3.5 pl-11 pr-11 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all text-gray-900 ${
                    formData.confirmPassword.length > 0
                      ? passwordValidation.passwordsMatch
                        ? 'border-green-500 focus:border-green-500'
                        : 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:border-green-500'
                  }`}
                  required
                  disabled={loading}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Indicador de coincidencia */}
              {formData.confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {passwordValidation.passwordsMatch ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        Las contraseñas coinciden
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-500">
                        Las contraseñas no coinciden
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Barra de progreso visual */}
            {formData.password.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-600">
                    Seguridad de la contraseña
                  </span>
                  <span className={`text-xs font-semibold ${
                    Object.values(passwordValidation).filter(Boolean).length === 6
                      ? 'text-green-600'
                      : Object.values(passwordValidation).filter(Boolean).length >= 4
                      ? 'text-yellow-600'
                      : 'text-red-500'
                  }`}>
                    {Object.values(passwordValidation).filter(Boolean).length === 6
                      ? 'Muy segura'
                      : Object.values(passwordValidation).filter(Boolean).length >= 4
                      ? 'Media'
                      : 'Débil'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      Object.values(passwordValidation).filter(Boolean).length === 6
                        ? 'bg-green-600'
                        : Object.values(passwordValidation).filter(Boolean).length >= 4
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${(Object.values(passwordValidation).filter(Boolean).length / 6) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar contraseña'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
