// CustomBadge.jsx
import React from 'react';

const CustomBadge = ({ height = "h-8", className = "" }) => {
  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src="/n-badge.png"
        alt="N Badge"
        className={`${height} w-auto object-contain`}
      />
    </div>
  );
};

export default CustomBadge;