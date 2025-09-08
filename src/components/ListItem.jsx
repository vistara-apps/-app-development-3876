import React from 'react';
import { cn } from '../utils/cn';

const ListItem = ({ 
  children, 
  variant = 'default', 
  interactive = false,
  onClick,
  className = '',
  ...props 
}) => {
  const variants = {
    default: 'bg-white/50',
    interactive: 'bg-white/50 hover:bg-white/70 cursor-pointer',
  };

  return (
    <div
      className={cn(
        'rounded-lg p-4 transition-all duration-200',
        interactive ? variants.interactive : variants[variant],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default ListItem;