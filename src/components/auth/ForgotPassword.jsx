import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`, 
        { correo: email.trim().toLowerCase() }
      );

      if (response.data.success) {
        setSent(true);
        toast.success('¡Correo enviado! Revisa tu bandeja de entrada');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de confirmación
  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Correo Enviado!
          </h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Si el correo <strong className="text-green-600">{email}</strong> está registrado, 
            recibirás instrucciones para restablecer tu contraseña.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded text-left">
            <p className="text-sm text-yellow-800">
              <strong>📬 Revisa:</strong> Bandeja de entrada y carpeta de spam.
              <br />
              <strong>⏱️ Expira en:</strong> 30 minutos.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  // Formulario de solicitud
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
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="text-gray-600">
            No te preocupes, te enviaremos instrucciones para recuperarla
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@emasa.pe"
                  className="w-full px-4 py-3.5 pl-11 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-green-500 transition-all text-gray-900"
                  required
                  disabled={loading}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar instrucciones'
              )}
            </button>
          </form>

          {/* Footer del card */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium hover:gap-3 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>

        {/* Ayuda adicional */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Necesitas ayuda? Contacta a <span className="font-semibold">soporte@emasa.pe</span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
