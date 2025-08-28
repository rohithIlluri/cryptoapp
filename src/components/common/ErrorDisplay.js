import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorDisplay = ({ message }) => (
  <div className="bg-red-900/30 border border-red-600/50 text-red-100 px-6 py-4 rounded-xl flex items-center shadow-md">
    <AlertCircle className="mr-3 text-red-400" size={20} />
    <div>
      <p className="font-semibold text-lg">Error</p>
      <p className="text-sm">{message}</p>
    </div>
  </div>
);

export default ErrorDisplay;
