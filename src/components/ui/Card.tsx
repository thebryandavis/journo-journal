'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  className,
  onClick,
}) => {
  const CardComponent = hover ? motion.div : 'div';

  return (
    <CardComponent
      className={clsx(
        'card',
        hover && 'card-hover cursor-pointer',
        className
      )}
      onClick={onClick}
      {...(hover && {
        whileHover: { y: -4, shadow: '0 10px 30px rgba(26, 26, 26, 0.1)' },
        transition: { duration: 0.2 }
      })}
    >
      {children}
    </CardComponent>
  );
};
