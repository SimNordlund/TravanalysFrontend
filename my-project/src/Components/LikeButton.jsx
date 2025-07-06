import { useState, useEffect } from "react";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";

function LikeButton() {
  const [likes, setLikes] = useState(0);
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${API}/api/likes`)
      .then(r => r.json()).then(d => setLikes(d.total));
  }, []);

  const handleLike = async () => {
    const r = await fetch(`${API}/api/likes`, { method: "POST" });
    const d = await r.json();
    setLikes(d.total);
  };

  return (
    <button
      onClick={handleLike}
      className="mb-0 flex items-center gap-1 text-indigo-500 hover:text-indigo-800"
    >
      <HandThumbUpIcon className="h-10 w-10" />
      {likes}
    </button>
  );
}

export default LikeButton; 