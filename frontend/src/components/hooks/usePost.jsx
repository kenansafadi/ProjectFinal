// src/components/hooks/usePost.jsx
import { useContext } from "react";
import PostContext from "../context/PostContext";
const usePost = () => {
    const context = useContext(PostContext);

    if (!context) {
        throw new Error("usePost must be used within a PostProvider");
    }

    return context;
};

export default usePost;
