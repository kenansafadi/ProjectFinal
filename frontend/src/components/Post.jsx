import moment from 'moment';
import { useState, useEffect } from 'react';
import { ThumbsUp, Share2, Bookmark, BookmarkCheck, X } from 'lucide-react';
import { XCircle } from 'lucide-react';
import { post, get } from '../utils/request';
import useAuth from '../hooks/useReduxAuth';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './common/UserAvatar';
import useSocket from '../hooks/useSocket';
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const BASE_URL = BACKEND_API_URL.replace('/api', '');

const getReactionLabel = (emoji) => {
   switch (emoji) {
      case '👍': return { text: 'Like', color: 'text-blue-600' };
      case '❤️': return { text: 'Love', color: 'text-red-500' };
      case '😂': return { text: 'Haha', color: 'text-yellow-500' };
      case '😮': return { text: 'Wow', color: 'text-yellow-500' };
      case '😢': return { text: 'Sad', color: 'text-yellow-500' };
      default: return { text: 'Like', color: 'text-gray-500 group-hover:text-gray-700' };
   }
};

const Post = ({ postData, isBookmarked: initialBookmarked }) => {
   const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
   const [comments, setComments] = useState(postData?.comments || []);
   const [isReplying, setIsReplying] = useState(false);
   const { user } = useAuth();
   const [showComments, setShowComments] = useState(false);
   const [isBookmarked, setIsBookmarked] = useState(initialBookmarked || false);
   const [postReactions, setPostReactions] = useState(postData?.reactions || []);
   const [isReactingPost, setIsReactingPost] = useState(false);
   const [shareModalOpen, setShareModalOpen] = useState(false);
   const [shareContacts, setShareContacts] = useState([]);
   const [shareSent, setShareSent] = useState(null);
   const [shareCopied, setShareCopied] = useState(false);
   const navigate = useNavigate();
   const { sendMessage: sendSocketMessage } = useSocket();

   const authorId = postData?.author?._id || postData?.user?._id || postData?.userId;
   const isCurrentUsersPost = Boolean(authorId) && String(authorId) === String(user?.id);
   const authorName =
      postData?.author?.name ||
      postData?.author?.username ||
      postData?.user?.username ||
      postData?.author_name ||
      (isCurrentUsersPost ? user?.username : 'Unknown user');
   const rawAvatar =
      postData?.author?.profilePicture || postData?.user?.profilePicture || postData?.profilePicture;
   const authorAvatar = rawAvatar
      ? rawAvatar.startsWith('http') ? rawAvatar : `${BACKEND_API_URL.replace('/api', '')}${rawAvatar}`
      : null;

   const goToAuthorProfile = () => {
      if (!authorId) return;
      if (isCurrentUsersPost) {
         navigate('/profile');
         return;
      }
      navigate(`/public-profile/${authorId}`);
   };
   const handleKeyActivate = (event, onActivate) => {
      if (event.key === 'Enter' || event.key === ' ') {
         event.preventDefault();
         onActivate();
      }
   };
// פונקציה לפתיחת מודל השיתוף, שמביאה את רשימת אנשי הקשר של המשתמש כדי שיוכל לבחור עם מי לשתף את הפוסט. המודל מציג את אנשי הקשר ומאפשר למשתמש ללחוץ על אחד מהם כדי לשתף את הפוסט בהודעה פרטית. לאחר הבחירה, המודל נסגר והמשתמש מקבל אישור שהפוסט שותף בהצלחה.
   const handleShare = async () => {
      try {
         const res = await get(`${BACKEND_API_URL}/chat/users`);
         const data = await res.json();
         setShareContacts(Array.isArray(data) ? data : []);
      } catch { setShareContacts([]); }
      setShareModalOpen(true);
      setShareSent(null);
   };

   // פונקציה לשיתוף הפוסט עם משתמש אחר דרך הודעה פרטית
   const handleShareToUser = (contactId) => {
      const msgObj = {
         receiverId: contactId,
         senderId: user?.id,
         text: '',
         type: 'post_link',
         postLink: {
            postId: postData?._id,
            title: postData?.title,
            content: postData?.content,
            image: postData?.image || null,
         },
         sender_name: user?.username || 'Unknown',
      };
      sendSocketMessage('SendMessage', msgObj);
      setShareSent(contactId);
      setTimeout(() => setShareModalOpen(false), 800);
   };
   

   const handleBookmarkToggle = async () => {
      setIsBookmarked((prev) => !prev);
      try {
         await post(`${BACKEND_API_URL}/users/bookmark`, { postId: postData?._id });
      } catch {
         setIsBookmarked((prev) => !prev); // לחזור למצב הקודם אם קרתה שגיאה
      }
   };

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
   };

   const handleReactPost = async (emoji) => {
      if (isReactingPost) return;
      setIsReactingPost(true);
      
      const prevReactions = [...postReactions];
      const existingIdx = postReactions.findIndex(r => String(r.userId) === String(user?.id));
      
      let newReactions;
      if (existingIdx !== -1) {
         if (postReactions[existingIdx].emoji === emoji) {
            newReactions = postReactions.filter((_, i) => i !== existingIdx);
         } else {
            newReactions = [...postReactions];
            newReactions[existingIdx] = { ...newReactions[existingIdx], emoji };
         }
      } else {
         newReactions = [...postReactions, { userId: user?.id, emoji }];
      }
      setPostReactions(newReactions);

      try {
         const res = await post(`${BACKEND_API_URL}/posts/${postData._id}/react`, { emoji });
         const data = await res.json();
         if (data.reactions) {
            setPostReactions(data.reactions);
         }
      } catch (err) {
         setPostReactions(prevReactions);
         console.error('Failed to react to post', err);
      } finally {
         setIsReactingPost(false);
      }
   };

   useEffect(() => {
      handleFetchComments();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      handleFetchComments();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isReplying, isCommentModalOpen]);

   return (
      <div key={postData?._id} className='bg-white shadow-lg rounded-xl p-6 mb-6'>
         {/* Header — avatar + name + time only */}
         <div className='flex items-center mb-4'>
            <UserAvatar
               src={authorAvatar}
               name={authorName}
               size='md'
               className='mr-3 ring-2 ring-gray-100'
               onClick={goToAuthorProfile}
            />
            <div>
               <span
                  role='button'
                  tabIndex={0}
                  onClick={goToAuthorProfile}
                  onKeyDown={(event) => handleKeyActivate(event, goToAuthorProfile)}
                  className='font-semibold text-sm text-gray-900 hover:underline cursor-pointer'
               >
                  {authorName}
               </span>
               <p className='text-xs text-gray-400'>
                  {moment(postData?.createdAt).fromNow()}
               </p>
            </div>
         </div>

         {/* Post Content */}
         <div className='mb-4'>
            <p
               onClick={() => navigate(`/post/${postData?._id}`)}
               className='text-lg font-semibold text-gray-800 hover:text-gray-900 cursor-pointer transition-colors'
            >
               {postData?.title}
            </p>
            <p className='text-gray-600 mt-1 text-sm leading-relaxed'>{postData?.content}</p>
         </div>

         {postData?.image && (
            <div className='mb-4 -mx-5'>
               <img
                  src={`${BACKEND_API_URL.replace('/api', '')}${postData.image}`}
                  alt='Post image'
                  className='w-full max-h-[400px] object-cover'
               />
            </div>
         )}
         {/* Action bar — clean row */}
         <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
            <div className='flex items-center gap-5'>
               {/* Like / React Group */}
               <div className='relative group flex items-center h-full'>
                  <button
                     onClick={() => {
                        const myReact = postReactions.find(r => String(r.userId) === String(user?.id))?.emoji;
                        if (myReact) handleReactPost(myReact); // toggle off
                        else handleReactPost('👍'); // toggle on
                     }}
                     className='flex items-center gap-1.5 text-sm cursor-pointer transition-colors'
                  >
                     {(() => {
                        const myReact = postReactions.find(r => String(r.userId) === String(user?.id))?.emoji;
                        if (myReact === '👍') {
                           return <ThumbsUp className='w-[18px] h-[18px] text-blue-600 fill-blue-600' />;
                        }
                        if (myReact) {
                           return <span className='text-[18px] leading-none mb-0.5'>{myReact}</span>;
                        }
                        return <ThumbsUp className='w-[18px] h-[18px] text-gray-400 group-hover:text-gray-700 transition-colors' />;
                     })()}
                     <span className={`text-xs font-semibold transition-colors ${getReactionLabel(postReactions.find(r => String(r.userId) === String(user?.id))?.emoji).color}`}>
                        {getReactionLabel(postReactions.find(r => String(r.userId) === String(user?.id))?.emoji).text}
                     </span>
                  </button>

                  {/* The Picker */}
                  <div className='absolute bottom-full left-0 hidden group-hover:block z-10'>
                     <div className='pb-2'>
                        <div className='flex gap-2 py-1.5 px-3 bg-white border border-gray-100 shadow-xl rounded-full transition-all'>
                           {['👍', '❤️', '😂', '😮', '😢'].map((emoji) => (
                              <button
                                 key={emoji}
                                 onClick={() => handleReactPost(emoji)}
                                 className='text-xl leading-none hover:scale-125 transition-transform origin-bottom cursor-pointer'
                              >
                                 {emoji}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>



               {/* Comment */}
               <button
                  onClick={() => setIsCommentModalOpen(true)}
                  className='flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-500 cursor-pointer transition-colors'
               >
                  <svg className='w-[18px] h-[18px]' fill='none' stroke='currentColor' strokeWidth='1.5' viewBox='0 0 24 24'>
                     <path strokeLinecap='round' strokeLinejoin='round' d='M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z' />
                  </svg>
                  <span className='text-gray-500 text-xs'>{comments?.length || 0}</span>
               </button>

               {/* Share */}
               <button
                  onClick={handleShare}
                  className='flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-500 cursor-pointer transition-colors'
               >
                  <Share2 className='w-[18px] h-[18px]' /><span className='text-gray-500 text-xs'>Share</span>
               </button>
            </div>

            {/* Bookmark — far right */}
            <button
               onClick={handleBookmarkToggle}
               className='cursor-pointer transition-colors'
            >
               {isBookmarked ? (
                  <Bookmark className='w-[18px] h-[18px] text-gray-800 fill-gray-800' />
               ) : (
                  <Bookmark className='w-[18px] h-[18px] text-gray-300 hover:text-gray-600' />
               )}
            </button>
         </div>

         {/* Toggle comments */}
         {comments?.length > 0 && (
            <button
               onClick={() => setShowComments(!showComments)}
               className='text-xs text-gray-400 hover:text-gray-600 mt-3 cursor-pointer transition-colors'
            >
               {showComments ? 'Hide comments' : `View ${comments.length} comment${comments.length > 1 ? 's' : ''}`}
            </button>
         )}

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

         {/* Share to DM Modal */}
         {shareModalOpen && (
            <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50' onClick={() => setShareModalOpen(false)}>
               <div className='bg-white rounded-xl w-80 shadow-2xl' onClick={e => e.stopPropagation()}>
                  <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
                     <h3 className='text-sm font-semibold text-gray-900'>Share</h3>
                     <button onClick={() => setShareModalOpen(false)} className='text-gray-400 hover:text-gray-600 cursor-pointer'><X className='w-4 h-4' /></button>
                  </div>

                  {/* Quick share row */}
                  <div className='flex items-center justify-around px-6 py-4 border-b border-gray-100'>
                     {/* WhatsApp */}
                     <a
                        href={`https://wa.me/?text=${encodeURIComponent(`${postData?.title} — ${window.location.origin}/post/${postData?._id}`)}`}
                        target='_blank' rel='noopener noreferrer'
                        className='flex flex-col items-center gap-1.5 cursor-pointer group'
                        onClick={() => setShareModalOpen(false)}
                     >
                        <div className='w-11 h-11 rounded-full bg-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform'>
                           <svg viewBox='0 0 24 24' className='w-6 h-6 fill-white'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z'/><path d='M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.533 5.845L0 24l6.354-1.503A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.032-1.384l-.361-.214-3.741.885.886-3.741-.235-.375A9.808 9.808 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z'/></svg>
                        </div>
                        <span className='text-[11px] text-gray-500'>WhatsApp</span>
                     </a>

                     {/* X / Twitter */}
                     <a
                        href={`https://x.com/intent/tweet?text=${encodeURIComponent(`${postData?.title}`)}&url=${encodeURIComponent(`${window.location.origin}/post/${postData?._id}`)}`}
                        target='_blank' rel='noopener noreferrer'
                        className='flex flex-col items-center gap-1.5 cursor-pointer group'
                        onClick={() => setShareModalOpen(false)}
                     >
                        <div className='w-11 h-11 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform'>
                           <svg viewBox='0 0 24 24' className='w-5 h-5 fill-white'><path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z'/></svg>
                        </div>
                        <span className='text-[11px] text-gray-500'>X / Twitter</span>
                     </a>

                     {/* Copy link */}
                     <button
                        onClick={() => {
                           navigator.clipboard.writeText(`${window.location.origin}/post/${postData?._id}`);
                           setShareCopied(true);
                           setTimeout(() => setShareCopied(false), 2000);
                        }}
                        className='flex flex-col items-center gap-1.5 cursor-pointer group'
                     >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${shareCopied ? 'bg-green-500' : 'bg-gray-100'}`}>
                           {shareCopied
                              ? <svg viewBox='0 0 24 24' className='w-5 h-5 fill-none stroke-white stroke-2'><polyline points='20 6 9 17 4 12'/></svg>
                              : <svg viewBox='0 0 24 24' className='w-5 h-5 fill-none stroke-gray-600 stroke-2'><rect x='9' y='9' width='13' height='13' rx='2'/><path d='M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1'/></svg>
                           }
                        </div>
                        <span className='text-[11px] text-gray-500'>{shareCopied ? 'Copied!' : 'Copy link'}</span>
                     </button>
                  </div>

                  {/* DM contacts */}
                  <div className='px-5 pt-3 pb-1'>
                     <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Send in chat</p>
                  </div>
                  {shareContacts.length === 0 ? (
                     <p className='text-xs text-gray-300 text-center py-4 pb-5'>No conversations yet</p>
                  ) : (
                     <div className='overflow-y-auto max-h-48 pb-2'>
                        {shareContacts.map(c => (
                           <button
                              key={c._id}
                              onClick={() => handleShareToUser(c._id)}
                              className='flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 w-full transition-colors cursor-pointer'
                           >
                              <UserAvatar src={c.profilePicture ? `${BASE_URL}${c.profilePicture}` : null} username={c.username} size='sm' />
                              <span className='flex-1 text-sm text-gray-800 text-left'>{c.username}</span>
                              {shareSent === c._id && <span className='text-xs text-green-500 font-medium'>Sent ✓</span>}
                           </button>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   );
};

const Comment = ({ comment, postId, handleReplySubmit }) => {
   const [replyContent, setReplyContent] = useState('');
   const [error, setError] = useState('');
   const { user } = useAuth();
   const [isReplying, setIsReplying] = useState(false);
   const [showReplies, setShowReplies] = useState(false);
   const [reactions, setReactions] = useState(comment?.reactions || []);
   const [isReacting, setIsReacting] = useState(false);
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

   const handleReact = async (emoji) => {
      if (isReacting) return;
      setIsReacting(true);
      
      const prevReactions = [...reactions];
      const existingIdx = reactions.findIndex(r => String(r.userId) === String(user?.id));
      
      // Optimistic update
      let newReactions;
      if (existingIdx !== -1) {
         if (reactions[existingIdx].emoji === emoji) {
            newReactions = reactions.filter((_, i) => i !== existingIdx);
         } else {
            newReactions = [...reactions];
            newReactions[existingIdx] = { ...newReactions[existingIdx], emoji };
         }
      } else {
         newReactions = [...reactions, { userId: user?.id, emoji }];
      }
      setReactions(newReactions);

      try {
         const res = await post(`${BACKEND_API_URL}/posts/${postId}/${comment._id}/react`, { emoji });
         const data = await res.json();
         if (data.reactions) {
            setReactions(data.reactions);
         }
      } catch (err) {
         setReactions(prevReactions); // revert on fail
         console.error('Failed to react', err);
      } finally {
         setIsReacting(false);
      }
   };

   // Group reactions for pills - computed on demand (currently unused but kept for future)
   // const reactionCounts = reactions.reduce((acc, r) => {
   //    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
   //    return acc;
   // }, {});
   // const myReactedEmojis = reactions.filter(r => String(r.userId) === String(user?.id)).map(r => r.emoji);

   return (
      <div key={comment._id} className='mb-4'>
         {/* Main Comment */}
         <div className='flex items-start space-x-3'>
            <UserAvatar
               src={comment?.profilePicture ? (comment.profilePicture.startsWith('http') ? comment.profilePicture : `${BACKEND_API_URL.replace('/api', '')}${comment.profilePicture}`) : null}
               name={comment?.author_name}
               size='sm'
               onClick={() => navigate(`/public-profile/${comment?.userId}`)}
            />
            <div className='flex-1'>
               <div className='flex justify-between items-center'>
                  <div>
                     <p className='font-semibold text-sm'>{comment?.author_name}</p>
                     <p className='text-xs text-gray-500'>{moment(comment?.createdAt).fromNow()}</p>
                  </div>
               </div>
               <p className='text-gray-800 text-sm mt-1'>{comment?.text}</p>

               {/* Action Bar */}
               <div className='flex items-center gap-4 mt-1.5'>
                  {/* Reply Button */}
                  <span
                     onClick={() => setIsReplying(!isReplying)}
                     className='text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer'
                  >
                     Reply
                  </span>

                  {/* React Button & Hover Picker */}
                  <div className='relative group flex items-center h-full'>
                     <span 
                        onClick={() => {
                           const myReact = reactions.find(r => String(r.userId) === String(user?.id))?.emoji;
                           if (myReact) handleReact(myReact);
                           else handleReact('👍');
                        }}
                        className={`text-xs font-semibold cursor-pointer transition-colors ${getReactionLabel(reactions.find(r => String(r.userId) === String(user?.id))?.emoji).color}`}
                     >
                        {getReactionLabel(reactions.find(r => String(r.userId) === String(user?.id))?.emoji).text}
                     </span>
                     {/* The Picker (Only shows on hover over the React button/container) */}
                     <div className='absolute bottom-full left-0 hidden group-hover:block z-10'>
                        <div className='pb-2'>
                           <div className='flex gap-2 py-1.5 px-3 bg-white border border-gray-100 shadow-xl rounded-full transition-all'>
                              {['👍', '❤️', '😂', '😮', '😢'].map((emoji) => (
                                 <button
                                    key={emoji}
                                    onClick={() => handleReact(emoji)}
                                    className='text-xl leading-none hover:scale-125 transition-transform origin-bottom cursor-pointer'
                                 >
                                    {emoji}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>


               </div>

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
                     <UserAvatar
                        src={reply?.profilePicture ? (reply.profilePicture.startsWith('http') ? reply.profilePicture : `${BACKEND_API_URL.replace('/api', '')}${reply.profilePicture}`) : null}
                        name={reply?.author_name}
                        size='sm'
                        onClick={() => navigate(`/public-profile/${reply?.userId}`)}
                     />
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
   const { user } = useAuth();

   const handleSubmit = async () => {
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
