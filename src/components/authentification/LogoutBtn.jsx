import { logout } from "@/app/actions/auth-actions";
import React from "react";

const LogoutBtn = () => {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <button
      onClick={handleLogout}
      className='w-full flex items-center space-x-3 text-white/90 hover:text-white py-2 px-4 rounded transition-colors'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='w-5 h-5 text-red-400'
      >
        <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
        <polyline points='16 17 21 12 16 7' />
        <line x1='21' y1='12' x2='9' y2='12' />
      </svg>
      <span className='text-red-400'>Sign Out</span>
    </button>
  );
};

export default LogoutBtn;
