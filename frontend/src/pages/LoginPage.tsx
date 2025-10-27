import { Button } from "@heroui/button";
import { FcGoogle } from "react-icons/fc";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuth, loading } = useAuth();

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  useEffect(() => {
    if (isAuth && !loading) {
      navigate("/map");
    }
  }, [isAuth, loading, navigate]);

  return (
    <div
      className="h-screen flex flex-col justify-between px-4 pt-12"
      style={{
        backgroundImage: "url('BgLogin.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="p-4 flex justify-center flex-col">
        <img alt="OribitIQ Logo" className="w-60 mx-auto" src="Logo.svg" />
        <div className="text-4xl mx-auto font-normal text-center text-neutral-600 dark:text-neutral-400 mt-16" />
      </div>

      <div className="p-4">
        <Button
          fullWidth
          color="primary"
          radius="lg"
          size="lg"
          startContent={<FcGoogle />}
          onPress={handleGoogleSignIn}
        >
          <span className="font-bold">Sign in with Google</span>
        </Button>
      </div>
    </div>
  );
}
