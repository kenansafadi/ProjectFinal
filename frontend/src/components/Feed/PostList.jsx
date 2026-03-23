// src/components/Feed/PostList.jsx
import Post from "./Post";
import usePost from "../hooks/usePost";
const PostList = () => {
    const { posts, loading, error } = usePost();

    if (loading) return <div>Loading posts...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="post-list">
            {posts.map((post) => (
                <Post key={post.id} post={post} />
            ))}
        </div>
    );
};

export default PostList;
