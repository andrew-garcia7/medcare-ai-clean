import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  const setAuth = useAuthStore(
    (state) => state.setAuth
  );

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      setAuth(true);

      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      Logging in...
    </div>
  );
}