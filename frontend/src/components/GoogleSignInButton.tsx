import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export const GoogleSignInButton = () => {
  const { handleGoogleLogin } = useAuth();

  return (
    <GoogleLogin
      theme="filled_black"
      size="medium"
      text="signin"
      shape="circle"
      // type="icon"
      onSuccess={(cred) => {
        if (!cred.credential) {
          console.log("Login Failed");
          return;
        }
        handleGoogleLogin(cred.credential);
      }}
      onError={() => console.log("Login Failed")}
    />
  );
};
