
import type React from 'react';

interface KarigarKartToolboxLogoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const KarigarKartToolboxLogoIcon: React.FC<KarigarKartToolboxLogoIconProps> = ({ className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...rest}
  >
    {/* Toolbox body outline */}
    <path d="M20 9H4L4 19H20V9Z" />
    {/* Slanted top edges of the box body */}
    <path d="M4 9L6 6H18L20 9" />
    {/* Handle */}
    <path d="M8 6V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V6" />
    {/* Latch - simple line */}
    <line x1="12" y1="13" x2="12" y2="16" />
  </svg>
);
