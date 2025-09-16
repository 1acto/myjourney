import { Button } from "@heroui/button";
import { FcGoogle } from "react-icons/fc";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RotatingText from "@/components/shared/RotatingText";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuth, loading } = useAuth();

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = "http://localhost:3001/auth/google";
  };

  useEffect(() => {
    if (isAuth && !loading) {
      navigate("/user");
    }
  }, [isAuth, loading, navigate]);

  return (
    <div
      className="h-screen flex flex-col justify-between px-4 pt-12"
      style={{
        backgroundImage: "url('Bg.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="p-4 flex justify-center flex-col">
        <img alt="OribitIQ Logo" className="w-60 mx-auto" src="Logo.svg" />
        <div className="text-4xl mx-auto font-normal text-center text-neutral-600 dark:text-neutral-400 mt-16">
          <div>
            <span className="text-2xl">Your branch</span>
            <RotatingText
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              initial={{ y: "100%" }}
              mainClassName="px-2 sm:px-2 md:px-3 text-[#4D55A0] font-bold overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
              rotationInterval={5000}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              staggerDuration={0.025}
              staggerFrom={"last"}
              texts={["Perfected.", "Advantaged.", "Optimized.", "Prospering."]}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            />
          </div>
        </div>
      </div>
      <div>
        <img alt="ad-svg" src="Landing.svg" className="w-auto h-auto mx-auto" />
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
