import moment from 'moment';
import { useState, useEffect } from 'react';
import { ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { XCircle } from 'lucide-react';
import { post, get } from '../utils/request';
import { useSelector } from 'react-redux';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const Post = ({ postData, handleLikePost, isLiked }) => {
   const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
   const [newComment, setNewComment] = useState('');
   const [comments, setComments] = useState([]);
   const [postToDelete, setPostToDelete] = useState(null);
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [isReplying, setIsReplying] = useState(false);
   const { user } = useAuth();
   const [showComments, setShowComments] = useState(false);
   //    const [isLiked, setIsLiked] = useState(postData?.likes?.includes(user?.id));
   const [isLoading, setIsLoading] = useState(false);

   const handleFetchComments = async () => {
      try {
         if (!postData?._id) return;
         const response = await get(`${BACKEND_API_URL}/posts/${postData?._id}/comments`);
         const data = await response.json();
         setComments(data);
      } catch (error) {
         console.log(error);
      }
   };

   const handleReplySubmit = async (commentId, comment) => {
      try {
         setIsReplying(true);
         const response = await post(
            `${BACKEND_API_URL}/posts/${postData?._id}/${commentId}/reply`,
            {
               comment: comment,
               author_name: user?.username,
            }
         );
         const data = await response.json();
         return data;
      } catch (error) {
         throw error;
      } finally {
         setIsReplying(false);
      }
   };

   useEffect(() => {
      handleFetchComments();
   }, []);

   useEffect(() => {
      handleFetchComments();
   }, [isReplying, isCommentModalOpen]);

   return (
      <div key={postData?._id} className='bg-white shadow-lg rounded-xl p-6 mb-6'>
         {/* Header with user info */}
         <div className='flex items-center mb-4'>
            <div className='w-10 h-10 rounded-full bg-gray-300 mr-4'></div> {/* Avatar */}
            <div className='flex justify-between items-center w-full'>
               <div>
                  <p className='font-semibold text-lg'>{postData?.author?.name}</p>
                  <p className='text-sm text-gray-500'>
                     {moment(postData?.createdAt).fromNow()}
                  </p>{' '}
               </div>
               <div className='flex space-x-4 items-center gap-2'>
                  {postData?.likes?.length > 0 && (
                     <p className='text-sm text-gray-500'>{postData?.likes?.length || 0} likes</p>
                  )}
                  {isLiked ? (
                     <ThumbsDown
                        onClick={() => handleLikePost(postData?._id, isLiked)}
                        className={`w-6 h-6 text-red-500 hover:text-blue-600 cursor-pointer`}
                     />
                  ) : (
                     <ThumbsUp
                        onClick={() => handleLikePost(postData?._id, isLiked)}
                        className={`w-6 h-6 text-blue-500 hover:text-red-600 cursor-pointer`}
                     />
                  )}
               </div>
            </div>
         </div>

         {/* Post Content */}
         <div className='mb-4'>
            <p className='text-xl font-semibold text-gray-800'>{postData?.title}</p>
            <p className='text-gray-700 mt-2'>{postData?.content}</p>
         </div>

         {/* Action buttons */}
         <div className='flex justify-between items-center mb-4'>
            <div className='flex items-center gap-2 '>
               <span
                  onClick={() => setIsCommentModalOpen(true)}
                  className='text-blue-500 text-xs cursor-pointer'
               >
                  {postData?.comments?.length} Comments
               </span>
               {postData?.comments?.length > 0 && (
                  <span
                     onClick={() => setShowComments(!showComments)}
                     className='text-xs text-blue-500  cursor-pointer '
                  >
                     {showComments
                        ? `Hide comments (${postData?.comments?.length})`
                        : `Show comments (${postData?.comments?.length})`}
                  </span>
               )}
            </div>
         </div>

         {/* Add Comment Section */}
         <AddCommentModal
            isOpen={isCommentModalOpen}
            onClose={() => setIsCommentModalOpen(false)}
            postId={postData?._id}
         />

         {/* Comments Display */}
         <div className='mt-4'>
            {showComments &&
               comments?.map((comment) => (
                  <Comment
                     postId={postData?._id}
                     handleReplySubmit={handleReplySubmit}
                     key={comment._id}
                     comment={comment}
                  />
               ))}
         </div>
      </div>
   );
};

const Comment = ({ comment, postId, handleReplySubmit }) => {
   const [replyContent, setReplyContent] = useState('');
   const [error, setError] = useState('');
   const { user } = useAuth();
   const [isReplying, setIsReplying] = useState(false);
   const [showReplies, setShowReplies] = useState(false);
   const navigate = useNavigate();

   const replySubmit = async (commentId) => {
      try {
         if (!replyContent) {
            setError('Reply content is required');
            return;
         }
         const data = await handleReplySubmit(commentId, replyContent);
         if (data.status === 400) {
            setError(data.message);
            return;
         }
         setReplyContent('');
         setIsReplying(false);
      } catch (error) {
         if (error.status) {
            setError(error.message);
            return;
         }
      } finally {
         setTimeout(() => {
            setError('');
         }, 3000);
      }
   };

   return (
      <div key={comment._id} className='mb-4'>
         {/* Main Comment */}
         <div className='flex items-start space-x-3'>
            <div
               onClick={() => navigate(`/public-profile/${comment?.userId}`)}
               className='w-8 h-8 rounded-full bg-gray-200 cursor-pointer'
            ></div>
            <div className='flex-1'>
               <div className='flex justify-between items-center'>
                  <div>
                     <p className='font-semibold text-sm'>{comment?.author_name}</p>
                     <p className='text-xs text-gray-500'>{moment(comment?.createdAt).fromNow()}</p>
                  </div>
               </div>
               <p className='text-gray-700'>{comment?.text}</p>

               {/* Reply Button */}
               <span
                  onClick={() => setIsReplying(!isReplying)}
                  className='text-xs text-blue-500 hover:underline mt-1 cursor-pointer'
               >
                  Reply
               </span>

               {/* Reply Form */}
               {error && <p className='text-red-500 mb-4 bg-red-100 p-2 rounded-md'>{error}</p>}
               {isReplying && (
                  <div className='mt-2 ml-4'>
                     <input
                        type='text'
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder='Write a reply...'
                        className='border p-1 px-2 rounded-md w-full text-sm'
                     />
                     <button
                        onClick={() => replySubmit(comment._id)}
                        className='mt-1 bg-blue-500 text-white text-sm px-3 py-1 rounded-md'
                     >
                        Post Reply
                     </button>
                  </div>
               )}

               {/* Toggle Replies */}
               {comment.replies?.length > 0 && (
                  <p
                     onClick={() => setShowReplies(!showReplies)}
                     className='text-xs text-blue-500 mt-2 cursor-pointer mr-2 '
                  >
                     {showReplies
                        ? `Hide replies (${comment.replies.length})`
                        : `Show replies (${comment.replies.length})`}
                  </p>
               )}
            </div>
         </div>

         {/* Sub-comments (Collapsible) */}
         {showReplies && comment.replies?.length > 0 && (
            <div className='ml-10 mt-2 space-y-2'>
               {comment.replies.map((reply) => (
                  <div key={reply._id} className='flex items-start space-x-3'>
                     <div
                        onClick={() => navigate(`/public-profile/${reply?.userId}`)}
                        className='w-6 h-6 rounded-full bg-gray-200 cursor-pointer'
                     ></div>
                     <div className='flex-1'>
                        <p className='font-semibold text-sm'>{reply?.author_name}</p>
                        <p className='text-gray-700 text-sm'>{reply?.text}</p>
                        <p className='text-xs text-gray-500'>
                           {moment(reply?.createdAt).fromNow()}
                        </p>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

const AddCommentModal = ({ isOpen, onClose, postId }) => {
   const [comment, setComment] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
   const { user } = useAuth();

   const handleSubmit = async (e) => {
      try {
         if (!comment) {
            setError('Comment is required');
            return;
         }

         const response = await post(`${BACKEND_API_URL}/posts/${postId}/comment`, {
            comment,
            author_name: user?.username,
         });
         const data = await response.json();

         if (data.status === 400) {
            setError(data.message);
            return;
         }
         setComment('');
         onClose();
      } catch (error) {
         if (error.status === 400) {
            setError(error.response.data.message);
            return;
         }
         console.log(error);
      } finally {
         setTimeout(() => {
            setError('');
         }, 3000);
      }
   };

   if (!isOpen) return null;

   return (
      <div className='fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50'>
         <div className='bg-white rounded-lg w-96 p-6 relative'>
            <button
               onClick={onClose}
               className='absolute top-4 right-4 text-gray-500 hover:text-gray-700'
            >
               <XCircle className='w-6 h-6' />
            </button>
            <h3 className='text-xl font-semibold mb-4'>Add a Comment</h3>
            {error && <p className='text-red-500 mb-4 bg-red-100 p-2 rounded-md'>{error}</p>}
            <form>
               <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className='w-full p-3 border border-gray-300 rounded-md'
                  rows='4'
                  placeholder='Type your comment here...'
               />
               <div className='mt-4 flex justify-end'>
                  <button
                     type='button'
                     onClick={handleSubmit}
                     className='bg-blue-500 text-white px-6 py-2 rounded-md'
                  >
                     Submit
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default Post;
