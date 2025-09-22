"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

import { createContext, useContext, useEffect, useState } from "react";

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setIsLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      setIsLoading(false);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setUser(session?.user ?? null);
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          setUser(session?.user ?? null);
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.log("Error", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkUser();
  }, [supabase.auth]);

  const signOut = async () => {
    try {
      supabase.auth.signOut();
    } catch (error) {
      console.log("Error signUt", error);
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
