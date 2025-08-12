import React, { useState } from "react";
import { Sparkles, Edit, Hash } from "lucide-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const BlogTitles = () => {
  const blogCategories = [
    "General",
    "Technology",
    "Business",
    "Health",
    "Lifestyle",
    "Education",
    "Travel",
    "Food",
  ];

  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

  const [selectedCategory, setSelectedCategory] = useState("General");
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `Generate a blog title for the keyword ${input} in the category ${selectedCategory}`
      const {data} = await axios.post('/api/ai/generate-blog-titles' , {prompt} , {
        headers : {Authorization : `Bearer ${await getToken()}`}
      })

      if(data.success){
        setContent(data.content)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
       toast.error(error.message)
    }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-scroll p-6 items-start flex-wrap gap-4 flex dark-bg">
      {/* Left column */}
      <form
        className="w-full max-w-lg p-4 dark-card rounded-lg border dark-border shadow-lg"
        onSubmit={onSubmitHandler}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-primary" />
          <h1 className="text-xl font-semibold dark-text">AI Title Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium dark-text">Keyword</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border dark-border bg-dark-surface dark-text placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
          placeholder="The future of artificial intelligence is ..."
          required
        />

        <p className="mt-4 text-sm font-medium dark-text">Category</p>
        <div className="mt-3 flex gap-3 flex-wrap">
          {blogCategories.map((item) => (
            <span
              key={item}
              onClick={() => setSelectedCategory(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition-colors ${
                selectedCategory === item
                  ? "bg-primary text-white font-medium border-primary"
                  : "text-gray-400 border-gray-600 hover:border-primary/50 hover:text-primary"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <button
        disabled = {loading}
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r
          from-primary to-primary/80 text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-primary/25 disabled:opacity-50"
        >
          {loading ? <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span> : <Hash className="w-5" />}
          
          Generate Title
        </button>
      </form>

      {/* Right column */}
      <div className="w-full max-w-lg p-4 dark-card rounded-lg flex flex-col border dark-border min-h-96 shadow-lg">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold dark-text">Generated Titles</h1>
        </div>
          {!content ? (<div className="flex-1 flex justify-center items-center">
          <div className="text-sm flex flex-col items-center gap-5 dark-text-secondary text-center">
            <Hash className="w-9 h-9" />
            <p>Enter a topic and click "Generate Title" to get started</p>
          </div>
        </div>) : (
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

export default BlogTitles;
