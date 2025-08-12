import React, { useState } from 'react'
import { Sparkles, Edit } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const articleLength = [
    { length: 800, text: 'Short (500-800 words)' },
    { length: 1200, text: 'Medium (800-1200 words)' },
    { length: 1600, text: 'Long (1200+ words)' },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setContent('');
    try {
      setLoading(true);
      const prompt = `Write an article about ${input} in ${selectedLength.text}`;
      const { data } = await axios.post(
        '/api/ai/generate-article',
        { prompt, length: selectedLength.length },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message || "Failed to generate article.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-y-scroll p-6 items-start flex-wrap gap-4 flex dark-bg'>
      {/* left col */}
      <form
        className='w-full max-w-lg p-4 dark-card rounded-lg border dark-border shadow-lg'
        onSubmit={onSubmitHandler}
      >
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-primary' />
          <h1 className='text-xl font-semibold dark-text'>Article Configuration</h1>
        </div>
        <p className='mt-6 text-sm font-medium dark-text'>Article Topic</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border dark-border bg-dark-surface dark-text placeholder-gray-400 focus:ring-2 focus:ring-primary/50'
          placeholder='The future of artificial intelligence is ...'
          required
        />
        <p className='mt-4 text-sm font-medium dark-text'>Article Length</p>
        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {articleLength.map((item, index) => (
            <span
              onClick={() => setSelectedLength(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition-colors ${
                selectedLength.text === item.text 
                  ? 'bg-primary text-white border-primary' 
                  : 'text-gray-400 border-gray-600 hover:border-primary/50 hover:text-primary'
              }`}
              key={index}
            >
              {item.text}
            </span>
          ))}
        </div>
        <br />
        <button
          type="submit"
          disabled={loading}
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-primary/25'
        >
          {loading ? (
            <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
          ) : (
            <Edit className='w-5' />
          )}
          Generate Article
        </button>
      </form>
      {/* Right col */}
      <div className='w-full max-w-lg p-4 dark-card rounded-lg flex flex-col border dark-border min-h-96 max-h-[600px] shadow-lg'>
        <div className='flex items-center gap-3'>
          <Edit className='w-5 h-5 text-primary' />
          <h1 className='text-xl font-semibold dark-text'>Generated Article</h1>
        </div>
        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 dark-text-secondary'>
              <Edit className='w-9 h-9' />
              <p>Enter a topic and click "Generate article" to get started</p>
            </div>
          </div>
        ) : (
          <div className='mt-3 h-full overflow-y-scroll text-sm dark-text'>
            <Markdown
              components={{
                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-2 dark-text" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-2 dark-text" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-2" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold dark-text" {...props} />,
                em: ({node, ...props}) => <em className="italic" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/50 pl-4 italic dark-text-secondary my-2" {...props} />,
                code: ({node, ...props}) => <code className="bg-gray-800 px-1 rounded text-gray-200" {...props} />,
              }}
            >
              {content}
            </Markdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;