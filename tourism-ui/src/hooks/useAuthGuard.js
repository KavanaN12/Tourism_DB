import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAuthGuard(user) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  return user;
}
