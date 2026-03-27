import { useEffect, useState, useRef } from 'react';
import { ImagePlus, X, Send, Paperclip, MapPin, FileText, Download, CornerUpRight, Trash2, Copy, Reply, ExternalLink } from 'lucide-react';
import useAuth from '../hooks/useReduxAuth';
import MainLayout from '../components/Layout';
import useSocket from '../hooks/useSocket';
import { get, post, postFormData, del } from '../utils/request';
import { useSearchParams, useNavigate } from 'react-router-dom';
import UserAvatar from '../components/common/UserAvatar';
import toast from 'react-hot-toast';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const BASE_URL = BACKEND_API_URL.replace('/api', '');

function formatFileSize(bytes) {
   if (!bytes) return '';
   if (bytes < 1024) return `${bytes} B`;
   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const AttachmentMenu = ({ onSelect }) => (
   <div className='absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 w-44 z-50'>
      <button onClick={() => onSelect('image')} className='flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full cursor-pointer'>
         <ImagePlus className='w-4 h-4 text-blue-500' />Photo
      </button>
      <button onClick={() => onSelect('file')} className='flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full cursor-pointer'>
         <FileText className='w-4 h-4 text-orange-500' />Document
      </button>
      <button onClick={() => onSelect('location')} className='flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full cursor-pointer'>
         <MapPin className='w-4 h-4 text-green-500' />Location
      </button>
   </div>
);

const ContextMenu = ({ x, y, message, isMine, onCopy, onForward, onReply, onDelete }) => {
   const menuWidth = 160; // w-40 = 10rem = 160px
   const menuHeight = isMine ? 160 : 130; // approximate height
   const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
   const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);
   
   return (
      <div className='fixed bg-white rounded-lg shadow-xl border border-gray-100 py-1 w-40 z-[100]' style={{ top: adjustedY, left: adjustedX }}>
         <button onClick={onReply} className='flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full cursor-pointer'>
            <Reply className='w-3.5 h-3.5' />Reply
         </button>
         {message.text && (
            <button onClick={onCopy} className='flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full cursor-pointer'>
               <Copy className='w-3.5 h-3.5' />Copy Text
            </button>
         )}
         <button onClick={onForward} className='flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full cursor-pointer'>
            <CornerUpRight className='w-3.5 h-3.5' />Forward
         </button>
         {isMine && (
            <button onClick={onDelete} className='flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full cursor-pointer'>
               <Trash2 className='w-3.5 h-3.5' />Delete
            </button>
         )}
      </div>
   );
};

const ForwardModal = ({ users, currentUserId, onForward, onClose }) => (
   <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-[100]'>
      <div className='bg-white rounded-xl w-80 max-h-96 shadow-2xl'>
         <div className='flex items-center justify-between p-4 border-b border-gray-100'>
            <h3 className='text-sm font-semibold text-gray-900'>Forward to...</h3>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-600 cursor-pointer'><X className='w-4 h-4' /></button>
         </div>
         <div className='overflow-y-auto max-h-72'>
            {users.filter(u => u._id !== currentUserId).map(u => (
               <button key={u._id} onClick={() => onForward(u._id)} className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full cursor-pointer transition-colors'>
                  <UserAvatar src={u.profilePicture ? `${BASE_URL}${u.profilePicture}` : null} username={u.username} size='sm' />
                  <span className='text-sm text-gray-800'>{u.username}</span>
               </button>
            ))}
         </div>
      </div>
   </div>
);

const ReplyBar = ({ replyingTo, onCancel }) => (
   <div className='px-5 py-2 border-t border-gray-100 bg-gray-50 flex items-center gap-3'>
      <div className='flex-1 border-l-2 border-blue-400 pl-3'>
         <p className='text-xs font-semibold text-blue-500'>{replyingTo.senderName}</p>
         <p className='text-xs text-gray-500 truncate'>{replyingTo.text || '📷 Media'}</p>
      </div>
      <button onClick={onCancel} className='text-gray-400 hover:text-gray-600 cursor-pointer shrink-0'><X className='w-4 h-4' /></button>
   </div>
);

const PostLinkCard = ({ postLink, isMine }) => {
   const navigate = useNavigate();
   return (
      <div
         onClick={() => navigate(`/post/${postLink.postId}`)}
         className={`rounded-xl overflow-hidden cursor-pointer max-w-[240px] ${isMine ? 'bg-blue-600' : 'bg-white border border-gray-200'}`}
      >
         {postLink.image && (
            <img src={`${BASE_URL}${postLink.image}`} alt='' className='w-full h-28 object-cover' />
         )}
         <div className='p-3'>
            <p className={`text-xs font-semibold line-clamp-1 ${isMine ? 'text-white' : 'text-gray-900'}`}>{postLink.title}</p>
            {postLink.content && (
               <p className={`text-xs mt-0.5 line-clamp-2 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>{postLink.content}</p>
            )}
            <div className={`flex items-center gap-1 mt-2 text-[11px] ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
               <ExternalLink className='w-3 h-3' />View post
            </div>
         </div>
      </div>
   );
};

const QuoteBlock = ({ replyTo, isMine, onClick }) => (
   <div
      onClick={onClick}
      className={`border-l-2 pl-2.5 py-0.5 mb-1.5 rounded-r cursor-pointer transition-opacity hover:opacity-70 ${isMine ? 'border-blue-300' : 'border-gray-400'}`}
   >
      <p className={`text-[11px] font-semibold ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>{replyTo.senderName}</p>
      <p className={`text-[11px] truncate max-w-[180px] ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>{replyTo.text || '📷 Media'}</p>
   </div>
);

const MessageReactions = ({ reactions, isMine, onReact, isOverlay }) => {
   if (!reactions?.length) return null;
   const emojiCounts = {};
   reactions.forEach(r => { emojiCounts[r.emoji] = (emojiCounts[r.emoji] || 0) + 1; });
   
   return (
      <div className={`flex gap-1 ${isOverlay ? 'absolute -bottom-2 ' + (isMine ? 'right-0' : 'left-0') + ' bg-white border border-gray-100 shadow-sm rounded-full px-1.5 py-0.5 z-10' : 'mt-1 flex-wrap ' + (isMine ? 'justify-end' : 'justify-start')}`}>
         {Object.entries(emojiCounts).map(([emoji, count]) => (
            <button
               key={emoji}
               onClick={() => onReact?.(emoji)}
               className={`text-xs px-1.5 py-0.5 rounded-full border transition-all cursor-pointer hover:scale-105 ${
                  isOverlay
                     ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                     : isMine 
                        ? 'bg-blue-600 border-blue-400 text-white hover:bg-blue-700' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
               }`}
            >
               {emoji} {count > 1 && <span className='ml-0.5'>{count}</span>}
            </button>
         ))}
      </div>
   );
};

const ReactionPicker = ({ onReact, isMine }) => {
   const emojis = ['👍', '❤️', '😂', '😮', '😢'];
   const pickerRef = useRef(null);
   const [adjustedClass, setAdjustedClass] = useState('');

   useEffect(() => {
      if (!pickerRef.current) return;
      const rect = pickerRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      let classes = [];
      if (rect.right > windowWidth - 10) classes.push('right-0 left-auto');
      if (rect.left < 10) classes.push('left-0 right-auto');
      if (classes.length) setAdjustedClass(classes.join(' '));
   }, []);

   return (
      <div ref={pickerRef} className={`absolute bottom-full mb-2 z-10 ${adjustedClass} ${isMine ? 'right-0' : 'left-0'}`}>
         <div className='flex gap-1 py-1.5 px-2 bg-white border border-gray-100 shadow-xl rounded-full'>
            {emojis.map(emoji => (
               <button
                  key={emoji}
                  onClick={(e) => { e.stopPropagation(); onReact?.(emoji); }}
                  className='text-xl leading-none hover:scale-125 transition-transform origin-bottom cursor-pointer p-1'
               >
                  {emoji}
               </button>
            ))}
         </div>
      </div>
   );
};

const MessageBubble = ({ msg, isMine, onQuoteClick, onReact }) => {
   const msgType = msg.type || (msg.image ? 'image' : 'text');
   const hasQuote = msg.replyTo?.senderName;
   const hasText = msg.text && msgType !== 'post_link';

   return (
      <div className='flex flex-col max-w-xs'>
         <div className={`relative group w-fit rounded-2xl ${
            isMine ? 'bg-blue-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'
         } ${
            msgType === 'image' && !hasText && !hasQuote ? 'p-1'
            : msgType === 'post_link' ? 'p-0 overflow-hidden'
            : 'px-4 py-2.5'
         }`}>

            {msg.forwarded && msgType !== 'post_link' && (
               <div className={`text-[11px] flex items-center gap-1 mb-1 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                  <CornerUpRight className='w-3 h-3' />
                  Forwarded{msg.originalSenderName ? ` from ${msg.originalSenderName}` : ''}
               </div>
            )}

            {hasQuote && (
               <QuoteBlock replyTo={msg.replyTo} isMine={isMine} onClick={onQuoteClick} />
            )}

            {msgType === 'post_link' && msg.postLink && (
               <PostLinkCard postLink={msg.postLink} isMine={isMine} />
            )}

            {msgType === 'image' && msg.image && (
               <img src={`${BASE_URL}${msg.image}`} alt='Shared' className='max-w-[240px] max-h-[200px] rounded-xl object-cover cursor-pointer' onClick={() => window.open(`${BASE_URL}${msg.image}`, '_blank')} />
            )}

            {msgType === 'file' && (
               <div className='flex items-center gap-3 max-w-[220px]'>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isMine ? 'bg-blue-400' : 'bg-gray-200'}`}>
                     <FileText className='w-5 h-5' />
                  </div>
                  <div className='flex-1 min-w-0'>
                     <p className='text-sm font-medium truncate'>{msg.fileName || 'Document'}</p>
                     <p className={`text-xs ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>{formatFileSize(msg.fileSize)}</p>
                  </div>
                  <a href={`${BASE_URL}${msg.image}`} download={msg.fileName} onClick={e => e.stopPropagation()} className={`shrink-0 ${isMine ? 'text-white hover:text-blue-100' : 'text-gray-500 hover:text-gray-700'}`}>
                     <Download className='w-4 h-4' />
                  </a>
               </div>
            )}

            {msgType === 'location' && msg.location && (
               <a href={`https://www.openstreetmap.org/?mlat=${msg.location.lat}&mlon=${msg.location.lng}#map=15/${msg.location.lat}/${msg.location.lng}`} target='_blank' rel='noopener noreferrer' className={`flex items-center gap-2 max-w-[220px] ${isMine ? 'text-white' : 'text-gray-800'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isMine ? 'bg-blue-400' : 'bg-green-100'}`}>
                     <MapPin className={`w-5 h-5 ${isMine ? 'text-white' : 'text-green-600'}`} />
                  </div>
                  <div className='min-w-0'>
                     <p className='text-sm font-medium'>📍 Location</p>
                     <p className={`text-xs truncate ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                        {msg.location.label || `${msg.location.lat?.toFixed(4)}, ${msg.location.lng?.toFixed(4)}`}
                     </p>
                  </div>
               </a>
            )}

            {hasText && (
               <p className={`text-sm break-words whitespace-pre-wrap max-w-[260px] ${msgType !== 'text' ? 'mt-1.5' : ''}`}>{msg.text}</p>
            )}

            {/* Hover reaction picker */}
            <div className='absolute -bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block z-10'>
               <ReactionPicker onReact={onReact} isMine={isMine} />
            </div>

            {/* Reactions inside bubble for non-images, below for images */}
            {msgType !== 'image' && (
               <MessageReactions reactions={msg.reactions} isMine={isMine} onReact={onReact} isOverlay />
            )}
         </div>
         
         {msgType === 'image' && (
            <MessageReactions reactions={msg.reactions} isMine={isMine} onReact={onReact} />
         )}
      </div>
   );
};

export default function Messaging() {
   const [selectedUserId, setSelectedUserId] = useState('');
   const [messages, setMessages] = useState([]);
   const [newMsg, setNewMsg] = useState('');
   const [isUploading, setIsUploading] = useState(false);
   const [showAttachMenu, setShowAttachMenu] = useState(false);
   const [contextMenu, setContextMenu] = useState(null);
   const [forwardModal, setForwardModal] = useState(null);
   const [replyingTo, setReplyingTo] = useState(null);
   const { user } = useAuth();
   const [users, setUsers] = useState([]);
   const params = useSearchParams();
   const fileInputRef = useRef(null);
   const fileTypeRef = useRef('image');
   const msgRefs = useRef({});
   const [highlightedId, setHighlightedId] = useState(null);
   const navigate = useNavigate();

   const firstChatUserId = params[0]?.get('user_id');
   const { disconnect, sendMessage: sendSocketMessage, receiveMessage } = useSocket();

   const selectedUser = users.find((u) => u._id == selectedUserId);
   const currentUser = { id: user?.id, name: user?.username };
   const messagesContainer = useRef(null);

   const scrollToMessage = (replyTo) => {
      if (!replyTo?._id) return;
      const el = msgRefs.current[replyTo._id.toString()];
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedId(replyTo._id.toString());
      setTimeout(() => setHighlightedId(null), 1500);
   };

   const autoScroll = () => {
      if (messagesContainer.current) messagesContainer.current.scrollTop = messagesContainer.current.scrollHeight;
   };

   const handleFetchMessages = async () => {
      try {
         if (!selectedUserId || !currentUser?.id) return;
         const response = await get(`${BACKEND_API_URL}/chat/messages?senderId=${currentUser.id}&receiverId=${selectedUserId}`);
         const data = await response.json();
         setMessages(Array.isArray(data) ? data : []);
         setTimeout(() => autoScroll(), 100);
      } catch (error) { console.log(error); }
   };

   const handleFetchUsers = async () => {
      try {
         let firstChatUser = [];
         const response = await get(`${BACKEND_API_URL}/chat/users`);
         const data = await response.json();

         if (firstChatUserId) {
            try {
               const res = await get(`${BACKEND_API_URL}/chat/first-chat-user?user_id=${firstChatUserId}`);
               const u = await res.json();
               if (u && !u.message) firstChatUser = [u];
            } catch { /* ignore first chat user fetch errors */ }
         }

         setUsers(() => {
            const uniqueData = [...firstChatUser, ...(Array.isArray(data) ? data : [])].filter(
               (item, index, self) => index === self.findIndex((t) => t._id === item._id)
            );
            if (firstChatUser.length > 0) setSelectedUserId(firstChatUser[0]?._id);
            else if (uniqueData.length > 0) setSelectedUserId(uniqueData[0]._id);
            return uniqueData;
         });
      } catch (error) { console.log(error); }
   };

   useEffect(() => {
      receiveMessage('ReceiveMessage', (msg) => {
         setMessages((prev) => (Array.isArray(prev) ? [...prev, msg] : [msg]));
         setTimeout(() => autoScroll(), 100);
      });
      handleFetchUsers();
      return () => disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => { handleFetchMessages(); }, [selectedUserId]); // eslint-disable-line react-hooks/exhaustive-deps

   useEffect(() => {
      const handleClick = () => { setContextMenu(null); setShowAttachMenu(false); };
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
   }, []);

   const uploadFile = async (file) => {
      const fd = new FormData();
      fd.append('file', file);
      const res = await postFormData(`${BACKEND_API_URL}/chat/upload`, fd);
      return res.json();
   };

   const handleAttachSelect = (type) => {
      setShowAttachMenu(false);
      if (type === 'location') { handleSendLocation(); return; }
      fileTypeRef.current = type;
      if (fileInputRef.current) {
         fileInputRef.current.accept = type === 'image' ? 'image/jpeg,image/png,image/gif,image/webp' : '.pdf,.doc,.docx,.txt,.zip,.csv,.xls,.xlsx';
         fileInputRef.current.click();
      }
   };

   const handleFileSelected = async (e) => {
      const file = e.target.files?.[0];
      if (!file || !selectedUserId) return;
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsUploading(true);
      try {
         const data = await uploadFile(file);
         const msgObj = {
            receiverId: selectedUserId, senderId: currentUser?.id,
            text: '', image: data.url, type: data.type, fileName: data.fileName, fileSize: data.fileSize,
            sender_name: currentUser?.name || 'Guest',
            replyTo: replyingTo || undefined,
         };
         sendSocketMessage('SendMessage', msgObj);
         setMessages((prev) => (Array.isArray(prev) ? [...prev, msgObj] : [msgObj]));
         setReplyingTo(null);
         setTimeout(() => autoScroll(), 100);
      } catch { toast.error('Failed to upload file'); }
      finally { setIsUploading(false); }
   };

   const handleSendLocation = () => {
      if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
      navigator.geolocation.getCurrentPosition(
         (pos) => {
            const msgObj = {
               receiverId: selectedUserId, senderId: currentUser?.id,
               text: '', type: 'location',
               location: { lat: pos.coords.latitude, lng: pos.coords.longitude, label: '' },
               sender_name: currentUser?.name || 'Guest',
               replyTo: replyingTo || undefined,
            };
            sendSocketMessage('SendMessage', msgObj);
            setMessages((prev) => (Array.isArray(prev) ? [...prev, msgObj] : [msgObj]));
            setReplyingTo(null);
            setTimeout(() => autoScroll(), 100);
         },
         () => toast.error('Location access denied'),
         { enableHighAccuracy: true }
      );
   };

   const sendMessage = () => {
      if (!newMsg.trim()) return;
      if (!selectedUserId) { toast.error('Select a user first'); return; }
      const msgObj = {
         receiverId: selectedUserId, senderId: currentUser?.id,
         text: newMsg, type: 'text',
         sender_name: currentUser?.name || 'Guest',
         replyTo: replyingTo ? {
            _id: replyingTo._id,
            text: replyingTo.text,
            senderName: replyingTo.senderName,
            type: replyingTo.type || 'text',
         } : undefined,
      };
      sendSocketMessage('SendMessage', msgObj);
      setMessages((prev) => (Array.isArray(prev) ? [...prev, msgObj] : [msgObj]));
      setNewMsg('');
      setReplyingTo(null);
      setTimeout(() => autoScroll(), 100);
   };

   const handleContextMenu = (e, msg, idx) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, msg, idx });
   };

   const handleCopy = () => {
      if (contextMenu?.msg?.text) navigator.clipboard.writeText(contextMenu.msg.text);
      toast.success('Copied');
      setContextMenu(null);
   };

   const handleReply = () => {
      const msg = contextMenu?.msg;
      setReplyingTo({
         _id: msg?._id,
         text: msg?.text || null,
         senderName: msg?.senderId === currentUser?.id ? 'You' : (selectedUser?.username || 'Them'),
         type: msg?.type || 'text',
      });
      setContextMenu(null);
   };

   const handleDelete = async () => {
      const msg = contextMenu?.msg;
      const idx = contextMenu?.idx;
      setContextMenu(null);
      if (!msg?._id) { setMessages(prev => prev.filter((_, i) => i !== idx)); return; }
      try {
         await del(`${BACKEND_API_URL}/chat/messages/${msg._id}`);
         setMessages(prev => prev.filter(m => m._id !== msg._id));
         toast.success('Deleted');
      } catch { toast.error('Failed to delete'); }
   };

   const handleForwardStart = () => { setForwardModal(contextMenu?.msg); setContextMenu(null); };

   const handleForward = async (targetUserId) => {
      try {
         await post(`${BACKEND_API_URL}/chat/forward`, { messageId: forwardModal._id, targetUserId });
         toast.success('Message forwarded');
      } catch { toast.error('Failed to forward'); }
      setForwardModal(null);
   };

   const handleReact = async (msgId, emoji) => {
      if (!msgId) return;
      try {
         const res = await post(`${BACKEND_API_URL}/chat/messages/${msgId}/react`, { emoji });
         const data = await res.json();
         setMessages(prev => prev.map(m => m._id === msgId ? { ...m, reactions: data.reactions } : m));
      } catch { toast.error('Failed to add reaction'); }
   };

   return (
      <MainLayout>
         <div className='flex h-full w-full'>
            {/* User List */}
            <div className='w-64 border-r border-gray-100 bg-gray-50/50 flex flex-col'>
               <div className='p-4 border-b border-gray-100'>
                  <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>Messages</h2>
               </div>
               <div className='overflow-y-auto flex-1'>
                  {users.length === 0 ? (
                     <div className='p-6 text-center text-sm text-gray-400'>
                        <p>No connections yet.</p>
                     </div>
                  ) : (
                     users.map((u) => {
                        if (u._id === currentUser?.id) return null;
                        const isSelected = u._id === selectedUserId;
                        return (
                           <div key={u._id} onClick={() => setSelectedUserId(u._id)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : 'hover:bg-gray-100'}`}>
                              <UserAvatar src={u.profilePicture ? `${BASE_URL}${u.profilePicture}` : null} username={u.username} size='sm' />
                              <span className={`text-sm truncate ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{u?.username}</span>
                           </div>
                        );
                     })
                  )}
               </div>
            </div>

            {/* Chat Area */}
            {users.length > 0 ? (
               <div className='flex-1 flex flex-col'>
                  <div className='px-5 py-3 border-b border-gray-100 flex items-center gap-3'>
                     {selectedUser && <UserAvatar src={selectedUser.profilePicture ? `${BASE_URL}${selectedUser.profilePicture}` : null} username={selectedUser.username} size='sm' />}
                     <h3 className='font-semibold text-gray-900'>{selectedUser?.username || 'Select a conversation'}</h3>
                  </div>

                  {/* Messages */}
                  <div ref={messagesContainer} className='flex-1 px-5 py-4 space-y-2 overflow-y-auto'>
                      {messages?.map((msg, idx) => {
                         const isMine = msg.senderId === currentUser?.id || msg.senderId?.toString() === currentUser?.id;
                         const msgId = msg._id?.toString();
                         return (
                            <div
                               key={msgId || idx}
                               ref={el => { if (msgId) msgRefs.current[msgId] = el; }}
                               className={`flex transition-all duration-300 ${isMine ? 'justify-end' : 'justify-start'} ${
                                  highlightedId === msgId ? 'scale-[1.02] brightness-95' : ''
                               }`}
                               onContextMenu={(e) => handleContextMenu(e, msg, idx)}
                            >
                               <MessageBubble
                                  msg={msg}
                                  isMine={isMine}
                                  onQuoteClick={() => scrollToMessage(msg.replyTo)}
                                  onReact={(emoji) => handleReact(msg._id, emoji)}
                               />
                            </div>
                         );
                      })}
                  </div>

                  {/* Reply bar */}
                  {replyingTo && <ReplyBar replyingTo={replyingTo} onCancel={() => setReplyingTo(null)} />}

                  {/* Input */}
                  <div className='px-5 py-3 border-t border-gray-100 flex items-center gap-2'>
                     <div className='relative'>
                        <button onClick={(e) => { e.stopPropagation(); setShowAttachMenu(!showAttachMenu); }} disabled={isUploading || !selectedUserId} className='text-gray-400 hover:text-blue-500 cursor-pointer transition-colors shrink-0 disabled:opacity-40'>
                           <Paperclip className='w-5 h-5' />
                        </button>
                        {showAttachMenu && <AttachmentMenu onSelect={handleAttachSelect} />}
                     </div>
                     <input ref={fileInputRef} type='file' onChange={handleFileSelected} className='hidden' />
                     <input
                        type='text'
                        className='flex-1 px-3 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Type a message...'
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={!selectedUserId}
                     />
                     <button onClick={sendMessage} disabled={isUploading || !selectedUserId} className='w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer shrink-0 disabled:opacity-50'>
                        {isUploading ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' /> : <Send className='w-4 h-4' />}
                     </button>
                  </div>
               </div>
            ) : (
               <div className='flex-1 flex flex-col items-center justify-center bg-gray-50'>
                  <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
                     <ExternalLink className='w-8 h-8 text-blue-500' />
                  </div>
                  <h2 className='text-xl font-semibold text-gray-800 mb-2'>Your Messages</h2>
                  <p className='text-gray-500 text-sm max-w-sm text-center'>
                     You don't have any connections yet. Head to the <button onClick={() => navigate('/')} className='text-blue-500 hover:underline cursor-pointer'>Home page</button> to find people to follow!
                  </p>
               </div>
            )}

            {contextMenu && (
               <ContextMenu
                  x={contextMenu.x} y={contextMenu.y}
                  message={contextMenu.msg}
                  isMine={contextMenu.msg.senderId === currentUser?.id}
                  onCopy={handleCopy} onForward={handleForwardStart}
                  onReply={handleReply} onDelete={handleDelete}
               />
            )}

            {forwardModal && (
               <ForwardModal users={users} currentUserId={currentUser?.id} onForward={handleForward} onClose={() => setForwardModal(null)} />
            )}
         </div>
      </MainLayout>
   );
}
