import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('baymax_token'); navigate('/login'); };
  return (
    <nav className='bg-baymax-blue text-white px-6 py-3 flex justify-between items-center'>
      <span className='text-2xl font-bold'>🤖 BAYMAX</span>
      <div className='flex gap-6'>
        <Link to='/dashboard' className='hover:text-blue-200'>Home</Link>
        <Link to='/screening' className='hover:text-blue-200'>Screening</Link>
        <Link to='/chat' className='hover:text-blue-200'>Chat</Link>
        <Link to='/appointments' className='hover:text-blue-200'>Appointments</Link>
        <Link to='/resources' className='hover:text-blue-200'>Resources</Link>
        <button onClick={logout} className='text-red-300 hover:text-red-100'>Logout</button>
      </div>
    </nav>
  );
}
