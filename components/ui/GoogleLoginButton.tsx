"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import Image from "next/image";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";
import { googleLogin } from "@/services/auth/auth.services";

type Role = "candidate" | "recruiter";

interface GoogleLoginButtonProps {
  role: Role;
}

const GoogleLoginButton = ({ role }: GoogleLoginButtonProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google sign-in didn't return a credential. Try again.");
      return;
    }

    setLoading(true);
    try {
      const response = await googleLogin({
        idToken: credentialResponse.credential,
        role,
      });

      const user = response.data.user;
      const targetPath =
        user.role === "CANDIDATE"
          ? user.isOnboarded
            ? "/candidate/dashboard"
            : "/candidate/profile/build"
          : "/recruiter/search";

      router.push(targetPath);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      <Button
        id="signup-btn-google"
        variant="outline"
        type="button"
        loading={loading}
        className="w-full pointer-events-none"
        tabIndex={-1}
      >
        <Image src="/icons/google.svg" alt="google" height={20} width={20} />
        Continue with Google
      </Button>
      {/* Google Identity Services renders its own clickable button here,
          invisible and stacked exactly over the styled Button above, so
          clicks land on Google's SDK while the user sees our design. */}
      {!loading && (
        <div className="absolute inset-0 opacity-0 overflow-hidden [&>div]:w-full [&_iframe]:w-full!">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error("Google sign-in failed. Try again.")}
            width="400"
          />
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;
