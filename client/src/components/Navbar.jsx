import React from 'react'
import { assets } from '../assets/assets'
import {useNavigate} from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {useClerk,UserButton,useUser} from '@clerk/clerk-react';
const Navbar = () => {
    const navigate = useNavigate();
    const {user} = useUser()
    const {openSignIn} = useClerk()

  return (
    <div className='fixed z-5 w-full backdrop-blur-2xl bg-black/20 dark-border border-b flex justify-between
    items-center py-3 px-4 sm:px-20 xl:px-32 cursor-pointer'>
    <img src={assets.logo} alt="logo" onClick={()=> navigate('/')} className='w-32 sm: w-44 cursor-pointer'/>
    
    {
    user ? <UserButton /> : <button onClick={openSignIn} className='flex items-center gap-2 rounded-full text-sm
    cursor-pointer bg-primary text-white px-10 py-2.5 hover:bg-primary/90 transition-colors'> Get Started <ArrowRight /></button>
    }
    
    </div>
  )
}

export default Navbar