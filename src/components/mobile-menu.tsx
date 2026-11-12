'use client';

import { useEffect, useRef } from 'react';

// Menú móvil: se cierra al tocar fuera, al elegir un enlace o con Escape.
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = () => ref.current?.removeAttribute('open');
    const onDown = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <details
      className="relative md:hidden"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('a,button')) ref.current?.removeAttribute('open');
      }}
      ref={ref}
    >
      {children}
    </details>
  );
}
