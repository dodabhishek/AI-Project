import React, { useState } from 'react'
import { Sparkles, Edit, Hash } from 'lucide-react'

const BlogTitles = () => {
  const blogCategories = [
    'General', 'Technology', 'Business', 'Health',
    'Lifestyle', 'Education', 'Travel', 'Food',
  ];

  const [selectedCategory, setSelectedCategory] = useState('General');
  const [input, setInput] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();
  };

  return (
    <div className='h-full overflow-y-scroll p-6 items-start flex-wrap gap-4 flex text-slate-700'>
      {/* Left column */}
      <form
        className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'
        onSubmit={onSubmitHandler}
      >
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>AI Title Generator</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Keyword</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type='text'
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='The future of artificial intelligence is ...'
          required
        />

        <p className='mt-4 text-sm font-medium'>Category</p>
        <div className='mt-3 flex gap-3 flex-wrap'>
          {blogCategories.map((item) => (
            <span
              key={item}
              onClick={() => setSelectedCategory(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition ${
                selectedCategory === item
                  ? 'bg-purple-50 text-purple-700 font-medium border-purple-300'
                  : 'text-gray-500 border-gray-300 hover:border-gray-400'
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <button
          type='submit'
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r
          from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'
        >
          <Hash className='w-5' />
          Generate Title
        </button>
      </form>

      {/* Right column */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Hash className='w-5 h-5 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>Generated Titles</h1>
        </div>

        <div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5 text-gray-400 text-center'>
            <Hash className='w-9 h-9' />
            <p>Enter a topic and click "Generate Title" to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogTitles;
