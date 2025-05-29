
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
    fill="none" // Default to no fill for paths unless specified
    stroke="currentColor" // Default stroke color
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...rest}
  >
    {/* Cart basket outline - Bolder */}
    <path
      d="M5.5 5.5H7L9.125 14.5H16.875L19 5.5H20.5"
      strokeWidth="2" // Increased from 1.5
      fill="none" 
    />
    {/* Wheels - filled, slightly larger */}
    <circle cx="9" cy="18.5" r="1.75" strokeWidth="1.5" fill="currentColor" /> 
    <circle cx="17" cy="18.5" r="1.75" strokeWidth="1.5" fill="currentColor" />
    
    {/* Worker icon part (helmet and head) - Bolder and more prominent */}
    {/* Helmet Outline - Bolder, slightly adjusted path for better shape */}
    <path
      d="M10.5 8.5C10.5 7.25 11.328 6.5 12.5 6.5C13.672 6.5 14.5 7.25 14.5 8.5"
      strokeWidth="2" // Increased from 1.5
      fill="none"
    />
    {/* Head circle underneath helmet - filled, larger */}
    <circle cx="12.5" cy="9.75" r="1.25" fill="currentColor" stroke="none"/> 

    {/* Slats inside the cart - Bolder */}
    <path d="M10.5 10.5V13.5" strokeWidth="2.25"/> 
    <path d="M12.5 10.5V13.5" strokeWidth="2.25"/> 
    <path d="M14.5 10.5V13.5" strokeWidth="2.25"/> 
    
    {/* Cart Handle - Bolder, slightly adjusted path */}
    <path d="M19 5.5V4.5C19 3.4 18.1 2.5 17 2.5H14.5" strokeWidth="2" fill="none"/> 
  </svg>
);
