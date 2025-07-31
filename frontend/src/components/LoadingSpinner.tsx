
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-glass-border rounded-full animate-spin border-t-medical-primary"></div>
        <div className="mt-4 text-center text-white">Loading...</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
