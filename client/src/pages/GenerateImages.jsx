import React, { useState } from "react";
import { Sparkles, Image } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
const GenerateImages = () => {
  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

  const ImageStyle = [
    "Realistic",
    "Ghibli style",
    "Anime style",
    "Cartoon style",
    "Fantasy style",
    "Realistic style",
    "3D style",
    "Portrait style",
  ];

  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(false);

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
        setLoading(true)
        const prompt = `Generate an image of ${input} in style ${selectedStyle}`;
        const {data} = await axios.post('/api/ai/generate-image' , {prompt,publish} , {
        headers : {Authorization : `Bearer ${await getToken()}`}
      })

      if(data.success){
        setContent(data.content)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
       toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="h-full overflow-y-scroll p-6 items-start flex-wrap gap-4 flex dark-bg">
        {/* Left column */}
        <form
          className="w-full max-w-lg p-4 dark-card rounded-lg border dark-border shadow-lg"
          onSubmit={onSubmitHandler}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 text-primary" />
            <h1 className="text-xl font-semibold dark-text">AI Image Generator</h1>
          </div>

          <p className="mt-6 text-sm font-medium dark-text">Describe Your Image</p>
          <textarea
          
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            value={input}
            className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border dark-border bg-dark-surface dark-text placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
            placeholder="Describe what you want to see in the image"
            required
          />

          <p className="mt-4 text-sm font-medium dark-text">Style</p>
          <div className="mt-3 flex gap-3 flex-wrap">
            {ImageStyle.map((item) => (
              <span
                key={item}
                onClick={() => setSelectedStyle(item)}
                className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition-colors ${
                  selectedStyle === item
                    ? "bg-primary text-white font-medium border-primary"
                    : "text-gray-400 border-gray-600 hover:border-primary/50 hover:text-primary"
                }`}
              >
                {item}
              </span>
            ))}
          </div>

          <div className="my-6 flex items-center gap-2">
            <label className="relative cursor-pointer">
              <input
                type="checkbox"
                onChange={(e) => setPublish(e.target.checked)}
                checked={publish}
                className="sr-only peer "
              />
              <div className="w-9 h-5 bg-gray-600 rounded-full peer-checked:bg-primary transition "></div>
              <span
                className="absolute left-1 top-1 w-3 h-3 bg-white 
                rounded-full transition peer-checked:translate-x-4"
              ></span>
            </label>
            <p className="text-sm dark-text">Make this image public</p>
          </div>

          <button
          disabled = {loading}
            type="submit"
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r
          from-primary to-primary/80 text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-primary/25 disabled:opacity-50"
          >
            {loading ? <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>:  <Image className="w-5" />}
           
            Generate Image
          </button>
        </form>

        {/* Right column */}
        <div className="w-full max-w-lg p-4 dark-card rounded-lg flex flex-col border dark-border min-h-96 shadow-lg">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold dark-text">Generated Image</h1>
          </div>
            {!content ? (<div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 dark-text-secondary text-center">
              <Image className="w-9 h-9" />
              <p>Enter a topic and click "Generate Image" to get started</p>
            </div>
          </div>) : (
            <div className="mt-3 h-full">
              <img src={content} alt="image"  className="w-full h-full rounded-lg"/>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default GenerateImages;
