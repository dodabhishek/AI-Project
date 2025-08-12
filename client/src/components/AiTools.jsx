import React from 'react'
import { AiToolsData } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
const AiTools = () => {
    const navigate = useNavigate();
    const {user} = useUser();
  return (
    <div className='px-4 sm:px-20 xl:px-32 my-24 dark-bg'>
        <div className='text-center'>
            <h2 className='dark-text text-[42px] font-semibold'>Powerful AI Tools</h2>
            <p className='dark-text-secondary max-w-lg mx-auto'>Everything you need to create, enhance, and optimize your content with cutting-edge AI technology.</p>
        </div>

        <div className='flex flex-wrap mt-10 justify-center'>
            {AiToolsData.map((tool,index)=>(
                <div key={index} className='p-8 m-4 max-w-xs rounded-lg dark-card
                shadow-lg border dark-border hover:-translate-y-1 transition-all
                duration-300 cursor-pointer hover:shadow-xl' onClick={()=> user && navigate(tool.path)}>
                <tool.Icon className='w-12 h-12 p-3 text-white rounded-xl'
                style={{background: `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})`}}/>
                <h3 className='dark-text font-medium'>{tool.title}</h3>
                <p className='dark-text-secondary text-sm max-w-[95%]'>{tool.description}</p>
                </div>
            ))}
        </div>
    </div>
  )
}

export default AiTools