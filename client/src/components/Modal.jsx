import React, { useEffect } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  maxWidth = 'max-w-md'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />

        <div className={`relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidth}`}>
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 leading-none">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="mt-2">
              {children}
            </div>

            {footer && (
              <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
