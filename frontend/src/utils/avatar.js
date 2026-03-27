export const getAvatarUrl = (profilePicture, baseUrl) => {
   if (!profilePicture) return null;
   if (profilePicture.startsWith('http')) return profilePicture;
   return `${baseUrl}${profilePicture}`;
};
