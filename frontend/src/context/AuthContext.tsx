import { useContext, createContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import type { UserData } from "../types";

interface AuthContext {
  userData: UserData | null;
  authLoading: boolean;
  handleGoogleLogin: (googleToken: string) => void;
  getUserData : () =>void;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleGoogleLogin = async (googleToken: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: "post",
        credentials:"include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ googleToken }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) localStorage.setItem("chalkToken", data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getUserData = async() =>{
    try{
        setAuthLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`,{
            method:"get",
            credentials:"include",
            headers: { Authorization: `Bearer ${localStorage.getItem("chalkToken") ?? ""}` },
        })

        if(!res.ok){
            throw new Error("Not authenticated");
        }

        const dat = await res.json();

        setUserData(dat.userData[0]);
    } catch(err){
        console.log(err)
    } finally{
        setAuthLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        userData,
        authLoading,
        handleGoogleLogin,
        getUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
