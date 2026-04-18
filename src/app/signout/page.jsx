"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStyleStore } from "@/lib/store";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Loader2 } from "lucide-react";

export default function SignOutPage() {
  const router = useRouter();
  const { clearUser } = useStyleStore();

  useEffect(() => {
    const terminateSession = async () => {
      try {
        if (auth) {
          await signOut(auth); // Tell Firebase to log out
        }
      } catch (error) {
        console.warn("Offline termination executed.");
      } finally {
        clearUser(); // Wipe local Zustand memory
        router.push("/login"); // Kick to login
      }
    };

    terminateSession();
  }, [router, clearUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] -mt-28">
      <Loader2 className="animate-spin text-cyan-400 mb-6" size={40} />
      <p className="text-[#888888] font-sans text-xs tracking-widest uppercase animate-pulse">
        Terminating secure session...
      </p>
    </div>
  );
}