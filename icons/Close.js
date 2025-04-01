import React from 'react';

const Close = ({ stroke = "white", ...props }) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16.0013 29.3332C23.3346 29.3332 29.3346 23.3332 29.3346 15.9998C29.3346 8.6665 23.3346 2.6665 16.0013 2.6665C8.66797 2.6665 2.66797 8.6665 2.66797 15.9998C2.66797 23.3332 8.66797 29.3332 16.0013 29.3332Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.2266 19.7732L19.7732 12.2266"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.7732 19.7732L12.2266 12.2266"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Close;
