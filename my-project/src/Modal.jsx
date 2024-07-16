import React from 'react';

const Modal = ({ isOpen, close, children }) => {
  if (!isOpen) return null;

  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div onClick={close} className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-80 flex">
      <div onClick={stopPropagation} className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg">
        {children}
      </div>
    </div>
  );
};

export default Modal;
