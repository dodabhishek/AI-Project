import { Eraser, Sparkles } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
  const [input, setInput] = useState(null); // fixed: null instead of ""
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input) {
      toast.error("Please select an image file.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", input);

      const { data } = await axios.post(
        "/api/ai/remove-image-background",
        formData,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Background removed successfully!");
      } else {
        toast.error(data.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setInput(file);
    console.log("Selected file:", file.name);
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
          <h1 className="text-xl font-semibold dark-text">Background Removal</h1>
        </div>

        <p className="mt-6 text-sm font-medium dark-text">Upload Image</p>
        <input
          onChange={handleFileChange}
          type="file"
          accept="image/*"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border dark-border bg-dark-surface dark-text cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          required
        />

        <p className="text-xs dark-text-secondary font-light mt-1">
          Supports JPG, PNG, and other image formats
        </p>

        <button
          disabled={loading}
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r
          from-primary to-primary/80 text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-primary/25 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Eraser className="w-5" />
          )}
          Remove Background
        </button>
      </form>

      {/* Right column */}
      <div className="w-full max-w-lg p-4 dark-card rounded-lg flex flex-col border dark-border min-h-96 shadow-lg">
        <div className="flex items-center gap-3">
          <Eraser className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold dark-text">Processed Image</h1>
        </div>
        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 dark-text-secondary text-center">
              <Eraser className="w-9 h-9" />
              <p>Upload an image and click "Remove Background" to get started</p>
            </div>
          </div>
        ) : (
          <img src={content} alt="image" className="mt-3 w-full h-full object-contain rounded-lg" />
        )}
      </div>
    </div>
  );
};

export default RemoveBackground;
