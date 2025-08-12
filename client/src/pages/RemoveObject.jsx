import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Scissors, Sparkles } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [object, setObject] = useState("");
  const [content, setContent] = useState("");
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input) {
      toast.error("Please select an image file.");
      return;
    }
    if (object.split(' ').length > 1) {
      toast.error('Please enter only one object name');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", input);
      formData.append("object", object);

      const { data } = await axios.post(
        "/api/ai/remove-image-Object",
        formData,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Object removed successfully!");
      } else {
        toast.error(data.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-y-scroll p-6 items-start flex-wrap gap-4 flex dark-bg'>
      {/* Left column */}
      <form
        className='w-full max-w-lg p-4 dark-card rounded-lg border dark-border shadow-lg'
        onSubmit={onSubmitHandler}
      >
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-primary' />
          <h1 className='text-xl font-semibold dark-text'>Object Removal</h1>
        </div>

        <p className='mt-6 text-sm font-medium dark-text'>Upload Image</p>
        <input
          onChange={(e) => setInput(e.target.files[0])}
          type='file'
          accept='image/*'
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border dark-border bg-dark-surface dark-text cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90'
          required
        />

        <p className='mt-6 text-sm font-medium dark-text'>Describe object name to remove</p>
        <textarea
          onChange={(e) => setObject(e.target.value)}
          rows={4}
          value={object}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border dark-border bg-dark-surface dark-text placeholder-gray-400 focus:ring-2 focus:ring-primary/50'
          placeholder='e.g., watch or spoon, only single object name'
          required
        />

        <button
          disabled={loading}
          type='submit'
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r
          from-primary to-primary/80 text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-primary/25 disabled:opacity-50'
        >
          {loading ? <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
            : <Scissors className='w-5' />}
          Remove Object
        </button>
      </form>

      {/* Right column */}
      <div className='w-full max-w-lg p-4 dark-card rounded-lg flex flex-col border dark-border min-h-96 shadow-lg'>
        <div className='flex items-center gap-3'>
          <Scissors className='w-5 h-5 text-primary' />
          <h1 className='text-xl font-semibold dark-text'>Processed Image</h1>
        </div>
        {
          !content ? (
            <div className='flex-1 flex justify-center items-center'>
              <div className='text-sm flex flex-col items-center gap-5 dark-text-secondary text-center'>
                <Scissors className='w-9 h-9' />
                <p>Upload an image and click "Remove Object" to get started</p>
              </div>
            </div>
          ) :
            (
              <img src={content} alt="image" className='mt-3 h-full w-full rounded-lg' />
            )
        }
      </div>
    </div>
  )
}

export default RemoveObject;