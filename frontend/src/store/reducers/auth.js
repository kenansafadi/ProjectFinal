import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   user: null,
   token: null,
   isAuthenticated: false,
   isPrivate: false,
};
// הקובץ הזה הוא ה-reducer של האותנטיקציה, שמנהל את המידע של המשתמש והטוקן בסטור. הוא מכיל את ה-state ההתחלתי עם ערכים ריקים, ואת הפונקציות שמעדכנות את ה-state בהתאם לפעולות השונות (login, logout, setUserFromToken, updateUser). כל פעם שהפעולה מתבצעת, ה-state מתעדכן בהתאם למה שהפעולה עושה (למשל, בפעולת login אנחנו מעדכנים את המידע של המשתמש והטוקן ומסמנים שהוא מאומת).

const authSlice = createSlice({
// ה-createSlice היא פונקציה שמקבלת אובייקט עם שם הסלייס, ה-state ההתחלתי, והרדוסרים (הפונקציות שמעדכנות את ה-state). היא יוצרת לנו אוטומטית את האקשנים והרדוסר המתאימים, ואנחנו יכולים לייצא אותם לשימוש בקומפוננטות שלנו.

   name: 'auth',
   initialState,
   reducers: {
      login: (state, action) => {
         state.user = action.payload.user;
         state.token = action.payload.token;
         state.isAuthenticated = true;
         state.isPrivate = action.payload.isPrivate;
      },

      // פונקציה שמטפלת בפעולת ה-logout, שמנקה את המידע של המשתמש והטוקן מהסטור ומסמנת שהוא לא מאומת יותר. היא גם מאפסת את הערך של isPrivate ל-false, כדי לוודא שהמצב חוזר לברירת המחדל שלו.

      logout: (state) => {
         state.user = null;
         state.token = null;
         state.isAuthenticated = false;
         state.isPrivate = false;
      },

      setUserFromToken: (state, action) => {
         state.user = action.payload.user;
         state.token = action.payload.token;
         state.isAuthenticated = true;
      },

      updateUser: (state, action) => {
         if (state.user) state.user = { ...state.user, ...action.payload };
      },
   },
});

export const { login, logout, setUserFromToken, updateUser } = authSlice.actions;
export default authSlice.reducer;