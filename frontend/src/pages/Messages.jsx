import { useEffect, useState, useRef } from 'react';
import socketService from '../services/chatServices';
import useAuth from '../hooks/useAuth';
import MainLayout from '../components/Layout';
import useSocket from '../hooks/useSocket';
import { get } from '../utils/request';
import { useSearchParams } from 'react-router-dom';
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function Messaging() {
   const [selectedUserId, setSelectedUserId] = useState('');
   const [messages, setMessages] = useState([]);
   const [newMsg, setNewMsg] = useState('');
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(null);
   const { user } = useAuth();
   const [users, setUsers] = useState([]);
   const params = useSearchParams();

   const firstChatUserId = params[0]?.get('user_id');

   const {
      socket,
      errorHandle,
      disconnect,
      sendMessage: sendSocketMessage,
      receiveMessage,
   } = useSocket();

   const selectedUser = users.find((user) => user._id == selectedUserId);
   const currentUser = { id: user?.id, name: user?.username };
   const currentMessages = messages[selectedUserId] || [];
   const messagesContainer = useRef(null);

   const autoScroll = () => {
      if (messagesContainer.current) {
         messagesContainer.current.scrollTop = messagesContainer.current.scrollHeight;
      }
   };

   const handleFetchMessages = async () => {
      try {
         if (selectedUserId && currentUser?.id) {
            const response = await get(
               `${BACKEND_API_URL}/chat/messages?senderId=${currentUser?.id}&receiverId=${selectedUserId}`
            );
            const data = await response.json();

            setMessages(data);
            autoScroll();
         }
      } catch (error) {
         console.log(error);
      }
   };

   const handleFetchUser = async () => {
      try {
         let firstChatUser = [];
         const response = await get(`${BACKEND_API_URL}/chat/users`);
         const data = await response.json();

         if (firstChatUserId) {
            firstChatUser = await handleFirstChatUser();
         }

         setUsers((prev) => {
            const uniqueData = [...firstChatUser, ...data].filter(
               (item, index, self) => index === self.findIndex((t) => t._id === item._id)
            );

            if (firstChatUser.length > 0) {
               setSelectedUserId(firstChatUser[0]?._id);
            }

            return uniqueData;
         });
      } catch (error) {
         console.log(error);
      }
   };

   // useEffect(() => {
   //    socketService.connect(`${currentUser?.id}`);
   //    socketService.errorHandle((error) => {
   //       const parsed_error = JSON.parse(error.message || '{}');
   //       console.log(parsed_error);
   //       setError(parsed_error?.message || '');
   //       setTimeout(() => {
   //          setError('');
   //       }, 3000);
   //    });

   //    socketService.receiveMessage((msg) => {
   //       setMessages((prev) => [...prev, msg]);
   //       autoScroll();
   //    });
   //    handleFetchUser();

   //    return () => {
   //       socketService.disconnect();
   //    };
   // }, []);

   const handleFirstChatUser = async () => {
      try {
         const response = await get(
            `${BACKEND_API_URL}/chat/first-chat-user?user_id=${firstChatUserId}`
         );
         const data = await response.json();
         if (data) {
            return [data];
         } else {
            return [];
         }
         // console.log('data', data);
         // setSelectedUserId(data._id);
         // setUsers((prev) => [...prev, data]);
      } catch (error) {
         console.log(error);
      }
   };

   useEffect(() => {
      receiveMessage('ReceiveMessage', (msg) => {
         setMessages((prev) => [...prev, msg]);
         autoScroll();
      });

      handleFetchUser();
      return () => {
         disconnect();
      };
   }, []);

   useEffect(() => {
      handleFetchMessages();
   }, [selectedUserId]);

   // useEffect(() => {
   //    if (firstChatUserId) {
   //       handleFirstChatUser();
   //    }
   // }, [firstChatUserId]);

   // const sendMessage = () => {
   //    if (!newMsg.trim()) return;

   //    const msgObj = {
   //       receiverId: selectedUserId,
   //       senderId: currentUser?.id,
   //       text: newMsg,
   //       sender_name: currentUser?.name,
   //    };
   //    // console.log(msgObj, currentUser?.id, selectedUserId);
   //    socketService.sendMessage(msgObj);

   //    // Optimistically update UI
   //    setMessages((prev) => [...prev, msgObj]);

   //    setNewMsg('');
   // };

   const sendMessage = () => {
      if (!newMsg.trim()) return;
      const msgObj = {
         receiverId: selectedUserId,
         senderId: currentUser?.id,
         text: newMsg,
         sender_name: currentUser?.name,
      };
      sendSocketMessage('SendMessage', msgObj);
      setMessages((prev) => [...prev, msgObj]);
      setNewMsg('');
   };

   return (
      <MainLayout>
         <div className='flex h-[100%] w-full '>
            <div className='w-[20%] bg-gray-100 p-4 '>
               <h2 className='text-lg font-semibold mb-4'>Users</h2>
               <ul className='space-y-2'>
                  {users.map((user) => {
                     if (user.email === currentUser?.email) return null;
                     return (
                        <li
                           key={user._id}
                           onClick={() => setSelectedUserId(user._id)}
                           className='flex items-center gap-2  py-1 rounded-md hover:bg-gray-100 cursor-pointer transition'
                        >
                           {/* Placeholder avatar */}
                           <div className='w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold uppercase'>
                              {user?.username?.charAt(0)}
                           </div>

                           {/* Username */}
                           <span className='text-sm font-medium text-gray-800'>
                              {user?.username}
                           </span>
                        </li>
                     );
                  })}
               </ul>
            </div>

            {/* Chat */}
            <div className='flex-1 flex flex-col justify-between'>
               {/* Header */}
               <div className='flex justify-between items-start p-4 border-b'>
                  <div className='flex flex-col  w-[70%]'>
                     <h3 className='font-semibold text-lg'>{selectedUser?.username}</h3>
                     {error && (
                        <p className='w-full text-center text-red-500 bg-red-100 p-1 rounded-md'>
                           {error}
                        </p>
                     )}
                     {success && (
                        <p className='w-full text-center text-green-500 bg-green-100 p-1 rounded-md'>
                           {success}
                        </p>
                     )}
                  </div>
                  <div className='text-sm text-gray-600 flex-1 flex justify-end'>
                     {/* <strong>{selectedUser?.username}</strong> */}
                  </div>
               </div>

               {/* Messages */}
               <div
                  ref={messagesContainer}
                  className='flex-1 p-4 space-y-2 overflow-y-auto bg-gray-50 '
               >
                  {messages?.map((msg, idx) => (
                     <div
                        key={idx}
                        className={`max-w-xs px-4 py-2 rounded ${
                           msg.senderId === currentUser?.id
                              ? 'ml-auto bg-blue-500 text-white'
                              : 'mr-auto bg-gray-200'
                        }`}
                     >
                        <span className='block text-sm'>{msg.text}</span>
                     </div>
                  ))}
               </div>

               {/* Input */}
               <div className='p-4 border-t flex gap-2 border-blue-500'>
                  <input
                     type='text'
                     className='flex-1 px-3 py-2 border border-blue-500 rounded focus:outline-none'
                     placeholder='Type a message...'
                     value={newMsg}
                     onChange={(e) => setNewMsg(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                     onClick={sendMessage}
                     className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
                  >
                     Send
                  </button>
               </div>
            </div>
         </div>
      </MainLayout>
   );
}
