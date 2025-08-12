import React, { useState } from 'react'
import Markdown from 'react-markdown';
const CreationItem = ({item}) => {
    const [expanded,setExpanded] = useState(false);
  return (
    <div onClick={()=>setExpanded(!expanded)} className='p-4 max-w-5xl text-sm dark-card border dark-border rounded-lg cursor-pointer hover:shadow-lg transition-shadow'> 
        <div className='flex justify-between items-center gap-4'>
            <div>
                <h2 className='dark-text font-medium'>{item.prompt}</h2>
                <p className='dark-text-secondary'>{item.type} - {new Date(item.created_at).toLocaleDateString()}</p>
            </div>
                <button className='bg-primary/10 border border-primary/30 text-primary
                px-4 py-1 rounded-full hover:bg-primary/20 transition-colors'>{item.type}</button>
        </div>
        {
          expanded && (
            <div>
                {item.type === 'image' ? 
                (
                    <div>
                        <img src= {item.content} alt="image" className='mt-3 w-full max-w-md rounded-lg' />
                    </div>
                ): (
                    <div className='mt-3 h-full overflow-y-scroll text-sm dark-text-secondary'>
                            <div className='reset-tw' >
                                <Markdown>
                                {item.content}
                                </Markdown></div>
                    </div>
                )
                
                }
            </div>
          )
        }
    </div>
  )
}

export default CreationItem