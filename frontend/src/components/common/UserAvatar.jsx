import { useState } from 'react';

const SIZE_CLASSES = {
   sm: 'w-6 h-6 text-xs',
   md: 'w-10 h-10 text-sm',
   lg: 'w-24 h-24 text-3xl',
};

const PALETTE = [
   '#5a6472', '#4a7068', '#5e5a78', '#7a5a5e',
   '#7a6a4a', '#4a6858', '#5a5e78', '#6a5e56',
];

function colourFromName(name = '') {
   let hash = 0;
   for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
   return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitial(name = '') {
   const trimmed = name.trim();
   if (!trimmed) return '?';
   return trimmed.charAt(0).toUpperCase();
}

const UserAvatar = ({ src, name, username, size = 'md', className = '', onClick }) => {
   const [imgError, setImgError] = useState(false);
   const displayName = name || username || '';
   const bgColour = colourFromName(displayName);

   const isNumericSize = typeof size === 'number';
   const sizeClass = isNumericSize ? '' : (SIZE_CLASSES[size] ?? SIZE_CLASSES.md);
   const sizeStyle = isNumericSize
      ? { width: size, height: size, fontSize: size * 0.38 }
      : {};

   const base =
      `rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-semibold text-white ${sizeClass} ${className}`.trim();

   const wrapperProps = {
      className: base,
      style: { backgroundColor: bgColour, ...sizeStyle, ...(onClick && { cursor: 'pointer' }) },
      ...(onClick && {
         role: 'button',
         tabIndex: 0,
         onClick,
         onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); }
         },
      }),
   };

   const showImage = src && !imgError;

   return (
      <div {...wrapperProps}>
         {showImage ? (
            <img
               src={src}
               alt={displayName}
               className='w-full h-full object-cover'
               onError={() => setImgError(true)}
            />
         ) : (
            <span aria-hidden='true'>{getInitial(displayName)}</span>
         )}
      </div>
   );
};

export default UserAvatar;
