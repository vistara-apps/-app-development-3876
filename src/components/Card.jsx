import React from 'react';
import { cn } from '../utils/cn';

const Card = ({ 
  children, 
  variant = 'default', 
  className = '',
  ...props 
}) => {
  const variants = {
    default: 'bg-white/95 backdrop-blur-sm',
    warning: 'bg-yellow-50/95 backdrop-blur-sm border-yellow-200',
    success: 'bg-green-50/95 backdrop-blur-sm border-green-200',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-white/20 shadow-card p-6 transition-all duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;