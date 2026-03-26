import React from 'react';
import type { TransportMode } from '@/types';

interface TransportMarkerProps {
  mode: TransportMode;
  heading: number;
  size?: number;
  className?: string;
}

export const TransportMarker: React.FC<TransportMarkerProps> = ({
  mode,
  heading,
  size = 40,
  className = '',
}) => {
  const getMarkerContent = () => {
    switch (mode) {
      case 'air':
        return (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
          >
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        );
      case 'ocean':
        return (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
          >
            <path d="M2 16.5c.65 0 1.25-.25 1.7-.7 1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7s1.25-.25 1.7-.7c1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7s1.25-.25 1.7-.7c1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7V14c-.65 0-1.25-.25-1.7-.7-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7s-1.25-.25-1.7-.7c-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7s-1.25-.25-1.7-.7c-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7v2.5zM2 11c.65 0 1.25-.25 1.7-.7 1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7s1.25-.25 1.7-.7c1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7s1.25-.25 1.7-.7c1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7V8.5c-.65 0-1.25-.25-1.7-.7-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7s-1.25-.25-1.7-.7c-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7s-1.25-.25-1.7-.7c-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7V11z" />
            <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z" opacity="0.3" />
          </svg>
        );
      case 'road':
        return (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
          >
            <path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM6 18.5c.83 0 1.5-.67 1.5-1.5S6.83 15.5 6 15.5 4.5 16.17 4.5 17s.67 1.5 1.5 1.5zM17 11h-1V8h-2v3H8V8H6v3H5c-1.66 0-3 1.34-3 3v7h2.5v-2h11v2H20v-7c0-1.66-1.34-3-3-3z" />
            <path d="M20 6h-2.5l-1.42-2.55c-.2-.36-.58-.58-1-.58H8.92c-.42 0-.8.22-1 .58L6.5 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" opacity="0.3" />
          </svg>
        );
      case 'rail':
        return (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
          >
            <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm2 0V6h5v5h-5zm3.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            <path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4s-8 .5-8 4v9.5z" opacity="0.3" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColor = () => {
    switch (mode) {
      case 'air':
        return 'text-blue-500';
      case 'ocean':
        return 'text-cyan-500';
      case 'road':
        return 'text-orange-500';
      case 'rail':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center ${getColor()} ${className}`}
      style={{
        width: size,
        height: size,
        transform: `rotate(${heading}deg)`,
        transition: 'transform 0.3s ease-out',
      }}
    >
      {/* Pulse ring effect */}
      <div className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping" />
      
      {/* Main marker */}
      <div className="relative z-10 w-3/4 h-3/4">
        {getMarkerContent()}
      </div>
      
      {/* Center dot */}
      <div className="absolute w-2 h-2 bg-current rounded-full" />
    </div>
  );
};

// Live badge component
export const LiveBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-semibold ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>
      LIVE
    </div>
  );
};

// Status badge component
interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-500', text: 'text-yellow-950', label: 'Pending' };
      case 'in-transit':
        return { bg: 'bg-blue-500', text: 'text-white', label: 'In Transit' };
      case 'customs':
        return { bg: 'bg-orange-500', text: 'text-white', label: 'In Customs' };
      case 'delivered':
        return { bg: 'bg-green-500', text: 'text-white', label: 'Delivered' };
      case 'delayed':
        return { bg: 'bg-red-500', text: 'text-white', label: 'Delayed' };
      case 'out-for-delivery':
        return { bg: 'bg-purple-500', text: 'text-white', label: 'Out for Delivery' };
      default:
        return { bg: 'bg-gray-500', text: 'text-white', label: status };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default TransportMarker;
