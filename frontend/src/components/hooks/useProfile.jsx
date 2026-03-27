import { useContext } from "react";
import ProfileContext from "../context/ProfileContext";



const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context; // מחזיר את כל הערכים והפונקציות מהפרופיל
};

export default useProfile;
