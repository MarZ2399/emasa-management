// src/components/layout/UserProfile.jsx
import React from 'react';
import { Mail, Briefcase } from 'lucide-react';

const UserProfile = ({ user }) => {
  return (
    <div className="p-4 border-b border-white/20">
      {/* Foto y nombre */}
      <div className="flex flex-col items-center mb-3">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20 shadow-lg mb-3">
          <img 
            src={user.foto} 
            alt={user.nombreCompleto}
            className="w-full h-full object-cover bg-white"
          />
        </div>
        <h3 className="text-white font-bold text-center text-base">
          {user.nombreCompleto}
        </h3>
      </div>

      {/* Información del usuario */}
      <div className="space-y-2 text-sm flex flex-col items-center">
  <div className="flex items-center gap-2 text-white/90">
    <Briefcase className="w-4 h-4 flex-shrink-0" />
    <span className="truncate">{user.area}</span>
  </div>
  <div className="flex items-center gap-2 text-white/90">
    <Mail className="w-4 h-4 flex-shrink-0" />
    <span className="truncate">{user.correo}</span>
  </div>
</div>
    </div>
  );
};

export default UserProfile;
