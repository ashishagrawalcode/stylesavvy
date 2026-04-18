"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useStyleStore } from "../../lib/store";
import StyleSavvyLogo from "./StyleSavvyLogo";

export default function RoomLobby({ onJoinRoom }) {
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useStyleStore();

  const handleCreateRoom = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    
    // Generate random 5 character room code
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    
    try {
      // Create room document
      await setDoc(doc(db, "rooms", code), {
        createdAt: serverTimestamp(),
        hostId: user.uid,
        status: "active"
      });
      
      onJoinRoom(code);
    } catch (err) {
      console.error("Error creating room:", err);
      setError("Failed to create room. Make sure Firestore is configured properly.");
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomCodeInput || !user) return;
    
    setLoading(true);
    setError("");
    const code = roomCodeInput.toUpperCase();
    
    try {
      const roomRef = doc(db, "rooms", code);
      const roomSnap = await getDoc(roomRef);
      
      if (roomSnap.exists()) {
        onJoinRoom(code);
      } else {
        setError("Room not found. Check the code and try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error joining room:", err);
      setError("Failed to join room.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
      {/* Ambient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7c3aed] opacity-10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0ea5e9] opacity-10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md p-8 rounded-3xl bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="mb-4">
            <StyleSavvyLogo scale={0.9} />
          </div>
          <p className="text-[#6b6b80] text-sm mt-2">Create or join a live styling session</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[#1a1a24] border border-white/10 text-[#e8e8f0] font-normal tracking-wide transition-all hover:bg-[#222233] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Creating..." : "Create New Room"}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-[#444455] text-xs uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-3">
            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value)}
              placeholder="Enter Room Code"
              className="w-full bg-[#11111a] border border-white/10 rounded-xl px-4 py-4 text-[#e8e8f0] text-center uppercase tracking-widest focus:outline-none focus:border-[#7c3aed]/50 transition-colors font-sans"
              maxLength={5}
            />
            <button
              type="submit"
              disabled={loading || roomCodeInput.length < 3}
              className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-[#e8e8f0] font-normal transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Joining..." : "Join Room"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
