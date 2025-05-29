
import React from 'react';

interface KarigarKartLogoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const KarigarKartLogoIcon: React.FC<KarigarKartLogoIconProps> = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5" // Adjusted for a slightly cleaner look, can be '2' for bolder
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...rest}
  >
    {/* Cart Basket */}
    <path d="M5 6h14l-1.5 7H6.5L5 6z" />
    {/* Slats inside the cart */}
    <line x1="9" y1="9" x2="9" y2="13" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="15" y1="9" x2="15" y2="13" />
    {/* Cart Undercarriage */}
    <path d="M6.5 13H17.5" />
    {/* Wheels */}
    <circle cx="7.5" cy="17.5" r="1.5" fill="currentColor" strokeWidth="1"/>
    <circle cx="16.5" cy="17.5" r="1.5" fill="currentColor" strokeWidth="1"/>
    
    {/* Worker Figure - Positioned ABOVE the cart (y < 6) */}
    {/* Shoulders/Body part - simple representation */}
    <path d="M11 5h2" strokeWidth="1.5"/>
    {/* Head - small circle under helmet */}
    <circle cx="12" cy="3.5" r="0.75" fill="currentColor" stroke="none"/>
    {/* Helmet */}
    {/* Path: M(start x y) a(rx ry x-axis-rotation large-arc-flag sweep-flag dx dy) v(vertical line) h(horizontal line) v(vertical line) z(close path) */}
    {/* This creates a small arc for the top of the helmet, then lines for the sides and bottom brim */}
    <path d="M10.5 2.5a1.5 1.5 0 0 1 3 0v1h-3v-1z" fill="currentColor" strokeWidth="1"/>

    {/* Cart Handle */}
    <path d="M5 6L3 4" />
  </svg>
);
