'use client';

import { clsx } from 'clsx';

interface CardProps {
  image?: string;
  title: string;
  subtitle?: string;
  aspectRatio?: string;
  className?: string;
}

export function Card({ image, title, subtitle, aspectRatio = '3/4', className }: CardProps) {
  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-card transition-all duration-500',
        className
      )}
    >
      <div style={{ aspectRatio }} className="overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-navy2 to-navy flex items-center justify-center">
            <span className="text-accent/50 font-serif text-4xl">{title[0]}</span>
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 via-navy/50 to-transparent p-5 pt-12">
        <h3 className="text-white font-serif text-lg group-hover:text-accent transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="text-white/60 text-sm mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
