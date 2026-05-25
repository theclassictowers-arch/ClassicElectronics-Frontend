import type { CSSProperties } from 'react';

type DocumentBodyBorderProps = {
  className?: string;
  style?: CSSProperties;
};

export const DocumentBodyBorder = ({ className = '', style }: DocumentBodyBorderProps) => (
  <svg
    className={`pointer-events-none absolute ${className}`}
    style={style}
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M4 1 H34 C37 1 38 5 41 5 H96 C98 5 99 6 99 8 V96 C99 98 98 99 96 99 H4 C2 99 1 98 1 96 V4 C1 2 2 1 4 1 Z"
      fill="none"
      stroke="#6d28d9"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
    />
    <line
      x1="4"
      y1="99"
      x2="96"
      y2="99"
      stroke="#6d28d9"
      strokeLinecap="round"
      strokeWidth="2.4"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);
