import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Wifi, WifiOff } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { useSocketStore } from "../store/socketStore";

const RoomSelection: React.FC = () => {
  const { setAppScreen } = useGameStore();
  const { connect, createRoom, joinRoom, isConnected, roomCode, error, disconnect } = useSocketStore();
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    if (!isConnected) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      // Don't disconnect here - let the game manage the connection
    };
  }, []);

  const handleCreateRoom = () => {
    if (isConnected) {
      createRoom();
    }
  };

  const handleJoinRoom = () => {
    if (isConnected && joinCode.trim()) {
      joinRoom(joinCode.trim().toUpperCase());
    }
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBack = () => {
    disconnect();
    setAppScreen("mode_selection");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center min-h-full w-full relative z-10 px-4 py-6 sm:py-8 overflow-y-auto"
    >
      {/* Connection Status */}
      <motion.div
        variants={item}
        className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-2 rounded border-2 border-white/20"
      >
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-bold">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-bold">Connecting...</span>
          </>
        )}
      </motion.div>

      {/* Debug Display - Remove after testing */}
      <div className="absolute top-4 left-4 bg-black/70 px-3 py-2 rounded border border-white/20 text-xs text-white font-mono">
        Room: {roomCode || 'null'}
      </div>

      {/* Title */}
      <motion.div variants={item} className="mb-8 sm:mb-12">
        <motion.div
          animate={{ rotate: [2, -2, 2] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            type: "tween",
          }}
          className="bg-white border-4 border-black p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight uppercase leading-none text-center">
            Multiplayer
            <br />
            Room
          </h2>
        </motion.div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-500 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md w-full"
        >
          <p className="text-white font-bold text-center">{error}</p>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex flex-col gap-6 w-full max-w-md items-center">
        {/* Room Code Display (if created) - Centered */}
        {roomCode ? (
          <motion.div
            variants={item}
            className="bg-green-400 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full"
          >
            <p className="text-black font-bold text-center mb-4 text-xl">Room Created!</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="bg-white border-4 border-black px-8 py-4 flex-1 text-center">
                <p className="text-4xl font-black text-black tracking-wider">{roomCode}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyCode}
                className="bg-black border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                {copied ? (
                  <Check className="w-7 h-7 text-green-400" strokeWidth={3} />
                ) : (
                  <Copy className="w-7 h-7 text-white" strokeWidth={3} />
                )}
              </motion.button>
            </div>
            <p className="text-black text-base font-bold text-center mb-2">
              Share this code with your friend!
            </p>
            <p className="text-black/70 text-sm text-center">
              Waiting for opponent to join...
            </p>
          </motion.div>
        ) : (
          <>
            {/* Create Room */}
            <motion.div variants={item} className="w-full">
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)",
                }}
                whileTap={{
                  scale: 0.98,
                  boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)",
                }}
                onClick={handleCreateRoom}
                disabled={!isConnected}
                className="w-full bg-blue-500 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <h3 className="text-2xl font-black text-white uppercase mb-2">
                  Create Room
                </h3>
                <p className="text-white/90 text-sm font-bold">
                  Start a new game and get a room code
                </p>
              </motion.button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={item} className="flex items-center gap-4 w-full">
              <div className="flex-1 h-1 bg-white/20"></div>
              <span className="text-white font-black text-sm uppercase">OR</span>
              <div className="flex-1 h-1 bg-white/20"></div>
            </motion.div>

            {/* Join Room */}
            <motion.div variants={item} className="w-full">
              <div className="bg-orange-500 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-black text-white uppercase mb-4">
                  Join Room
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    maxLength={6}
                    className="flex-1 bg-white border-4 border-black px-4 py-3 text-black font-black text-xl uppercase text-center placeholder:text-black/30 focus:outline-none focus:ring-4 focus:ring-yellow-400"
                    disabled={!isConnected}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoinRoom}
                    disabled={!isConnected || !joinCode.trim()}
                    className="bg-black border-4 border-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-white font-black uppercase text-sm">Join</span>
                  </motion.button>
                </div>
                <p className="text-white/90 text-xs font-bold mt-3">
                  Enter the room code shared by your friend
                </p>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Back Button */}
      <motion.button
        variants={item}
        whileHover={{
          scale: 1.05,
          x: -5,
          boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)",
        }}
        whileTap={{
          scale: 0.95,
          x: 0,
          boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
        }}
        onClick={handleBack}
        className="mt-8 flex items-center gap-2 sm:gap-3 px-5 py-2.5 sm:px-6 sm:py-3 bg-slate-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black text-sm sm:text-base font-black uppercase tracking-wider transition-all"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={4} /> Back
      </motion.button>
    </motion.div>
  );
};

export default RoomSelection;
