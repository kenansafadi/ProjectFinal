//      הקובץ הזה הוא ה-hook של ה-follow, שמאפשר לנו לגשת לכל הפונקציות והערכים שקשורים ל-follow מכל קומפוננטה שנרצה, בלי צורך להעביר props דרך כל הרכיבים ביניהם. זה עושה את הקוד שלנו יותר נקי וקל לתחזוקה.
import { useContext } from "react";
import FollowContext from "../context/FollowContext";

export const useFollow = () => useContext(FollowContext);
export default useFollow;
