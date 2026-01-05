// src/components/FeedbackModal.jsx
import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, type, title, message }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden transform transition-all scale-100">
        {/* Header de Color */}
        <div className={`h-3 w-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />
        
        <div className="p-6 text-center">
          {/* Icono Animado */}
          <div className="flex justify-center mb-4">
            {isSuccess ? (
              <div className="p-3 bg-green-100 rounded-full text-green-600 animate-bounce">
                <CheckCircle size={48} />
              </div>
            ) : (
              <div className="p-3 bg-red-100 rounded-full text-red-600 animate-pulse">
                <XCircle size={48} />
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            {message}
          </p>

          <button 
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-bold text-white transition-transform active:scale-95
              ${isSuccess 
                ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200' 
                : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200'
              }`}
          >
            {isSuccess ? 'Continuar' : 'Entendido, revisar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;