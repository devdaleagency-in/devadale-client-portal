import React, { useState, MouseEvent, useCallback } from 'react';
import './RippleButton.css';

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  children: React.ReactNode;
  key?: React.Key;
  type?: 'button' | 'submit' | 'reset';
}

type Ripple = { x: number; y: number; key: number };

function setRipplePosition(el: HTMLSpanElement | null, x: number, y: number) {
  if (!el) return;
  el.style.setProperty('--ripple-x', `${x}px`);
  el.style.setProperty('--ripple-y', `${y}px`);
}

export default function RippleButton({ onClick, className = '', children, ...buttonProps }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const key = Date.now();
    setRipples((prev) => [...prev, { x, y, key }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.key !== key));
    }, 600);
    if (onClick) onClick(e);
  };

  const rippleRef = useCallback(
    (ripple: Ripple) => (el: HTMLSpanElement | null) => setRipplePosition(el, ripple.x, ripple.y),
    []
  );

  return (
    <button
      {...buttonProps}
      onClick={createRipple}
      className={`relative overflow-hidden rounded-lg ${className}`}
    >
      {children}
      {ripples.map((r) => (
        <span key={r.key} ref={rippleRef(r)} className="ripple-effect" />
      ))}
    </button>
  );
}
