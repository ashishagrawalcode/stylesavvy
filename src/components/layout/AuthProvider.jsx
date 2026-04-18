"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useStyleStore } from "../../lib/store";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Define the routes that DO NOT require a login
const PUBLIC_ROUTES = ["/", "/login"];

export default function AuthProvider({ children }) {
  const { user, setUser, clearUser, isAuthLoading } = useStyleStore();
  const pathname = usePathname();
  const router = useRouter();
  
  // Local state to prevent screen flashing while checking auth
  const [isRouting, setIsRouting] = useState(true);

  useEffect(() => {
    // 1. OFFLINE DEVELOPMENT BYPASS
    if (!auth) {
      setUser({
        uid: "offline-dev-123",
        email: "dev@stylesavvy.local",
        displayName: "Offline Developer",
        isDev: true
      });
      setIsRouting(false);
      return;
    }

    // 2. LIVE FIREBASE LISTENER
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
      } else {
        clearUser();
      }
      setIsRouting(false);
    });

    return () => unsubscribe();
  }, [setUser, clearUser]);

  // 3. THE SECURITY GUARD (Route Protection Logic)
  useEffect(() => {
    // Don't route if we are still checking who the user is
    if (isAuthLoading || isRouting) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // If user is NOT logged in and tries to access a private page -> Kick to Login
    if (!user && !isPublicRoute) {
      router.push("/login");
    } 
    // If user IS logged in but tries to view the Login page -> Push to Stylist Dashboard
    else if (user && pathname === "/login") {
      router.push("/stylist");
    }
  }, [user, pathname, isAuthLoading, isRouting, router]);

  // 4. LOADING STATE (Prevents flash of protected content)
  if (isAuthLoading || isRouting) {
    return (
      <div className="min-h-screen w-full bg-[#030303] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
        <span className="font-sans text-xs tracking-widest text-[#888888] uppercase">Authenticating connection...</span>
      </div>
    );
  }

  // 5. RENDER APP IF SECURE
  // If we reach here, the user is either on a public route or properly authenticated
  return <>{children}</>;
}