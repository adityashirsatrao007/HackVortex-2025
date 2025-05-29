
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
    className={className} // Apply className for sizing and color
    {...rest} // Spread other SVG props
  >
    {/* Cart basket outline */}
    <path
      d="M5.5 5.5H7L9.125 14.5H16.875L19 5.5H20.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Wheels - made them filled and part of the main color */}
    <circle cx="9" cy="18.5" r="1.5" stroke="currentColor" fill="currentColor" strokeWidth="1.5" />
    <circle cx="17" cy="18.5" r="1.5" stroke="currentColor" fill="currentColor" strokeWidth="1.5" />
    {/* Struts to wheels */}
    <path d="M9.125 14.5L9 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16.875 14.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

    {/* Worker icon part (helmet and head) */}
    {/* Helmet */}
    <path
      d="M10.75 8C10.75 7 11.5 6.5 12.5 6.5C13.5 6.5 14.25 7 14.25 8"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Head circle underneath helmet - filled */}
     <circle cx="12.5" cy="9" r="1" fill="currentColor" stroke="none"/>

    {/* Slats inside the cart */}
    <path d="M10.5 10.5V13.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    <path d="M12.5 10.5V13.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    <path d="M14.5 10.5V13.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
     {/* Cart Handle */}
    <path d="M19 5.5V4.5C19 3.5 18.25 2.5 17.25 2.5H14.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
);
