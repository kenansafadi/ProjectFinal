// src/components/hooks/useFollow.jsx
import { useContext } from "react";
import FollowContext from "../context/FollowContext";

export const useFollow = () => useContext(FollowContext);
export default useFollow;
