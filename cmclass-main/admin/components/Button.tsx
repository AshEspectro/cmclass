import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full';
  
  const variants = {
    primary: 'bg-[#007B8A] text-white hover:bg-[#005f6b]',
    secondary: 'bg-black text-white hover:bg-gray-800',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-50',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:border-[#007B8A] hover:text-[#007B8A]'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5',
    lg: 'px-8 py-3'
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}