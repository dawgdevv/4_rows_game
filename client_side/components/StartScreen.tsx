import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Zap, User } from "lucide-react";
import { useGameStore } from "../store/gameStore";

const StartScreen: React.FC = () => {
  const { setAppScreen, setUsername, username } = useGameStore();
  const [inputName, setInputName] = useState(username);

  const handleStart = () => {
    if (inputName.trim()) {
      setUsername(inputName.trim());
      setAppScreen("mode_selection");
    }
  };

  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const shapeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      variants={backgroundVariants}
      className="flex flex-col items-center justify-center min-h-full w-full relative z-10 p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden"
    >
      {/* Abstract Background Shapes - Crazy Motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Top Left Yellow Box */}
        <motion.div
          variants={shapeVariants}
          className="absolute top-[5%] left-[2%] sm:left-[5%] md:left-[8%]"
        >
          <motion.div
            animate={{
              rotate: [-12, 12, -12],
              scale: [1, 1.2, 0.9, 1],
              borderRadius: ["0%", "20%", "0%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              type: "tween",
            }}
            className="w-[15vw] h-[15vw] min-w-[60px] min-h-[60px] max-w-[120px] max-h-[120px] bg-[#FACC15] border-2 sm:border-4 border-[#312E81] shadow-[4px_4px_0px_0px_rgba(49,46,129,1)] sm:shadow-[8px_8px_0px_0px_rgba(49,46,129,1)]"
          />
        </motion.div>

        {/* Bottom Right Pink Circle */}
        <motion.div
          variants={shapeVariants}
          className="absolute bottom-[10%] right-[2%] sm:right-[5%] md:right-[8%]"
        >
          <motion.div
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              type: "tween",
            }}
            className="w-[20vw] h-[20vw] min-w-[80px] min-h-[80px] max-w-[160px] max-h-[160px] bg-[#EC4899] rounded-full border-2 sm:border-4 border-[#312E81] shadow-[4px_4px_0px_0px_rgba(49,46,129,1)] sm:shadow-[8px_8px_0px_0px_rgba(49,46,129,1)] flex items-center justify-center"
          >
            <div className="w-[30%] h-[30%] bg-black rounded-full animate-ping opacity-20" />
          </motion.div>
        </motion.div>

        {/* Top Right Striped Rect */}
        <motion.div
          variants={shapeVariants}
          className="absolute top-[8%] right-[2%] sm:right-[10%] md:right-[15%]"
        >
          <motion.div
            animate={{ rotate: [6, 24, 6] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "mirror",
              type: "tween",
            }}
            className="w-[12vw] h-[25vw] min-w-[50px] min-h-[100px] max-w-[120px] max-h-[200px] border-2 sm:border-4 border-[#312E81] bg-white"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #312E81 10%, transparent 10%, transparent 50%, #312E81 50%, #312E81 60%, transparent 60%, transparent 100%)",
              backgroundSize: "15px 15px",
            }}
          />
        </motion.div>

        {/* Floating Lines */}
        <motion.div
          variants={shapeVariants}
          className="absolute top-[30%] left-0 sm:left-[10%] md:left-[20%] hidden sm:block"
        >
          <motion.div
            animate={{ x: [-30, 30, -30], rotate: [45, 90, 45] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              type: "tween",
            }}
            className="w-[20vw] max-w-[200px] h-1 sm:h-2 bg-[#06B6D4] border border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
          />
        </motion.div>

        {/* Chaos Element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1, rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] sm:w-[100vw] sm:h-[100vw] -z-20 pointer-events-none"
        >
          <div className="w-full h-full border-[30px] sm:border-[50px] md:border-[80px] border-dashed border-[#6366F1] rounded-full" />
        </motion.div>
      </div>

      {/* Main Title Block - Creative Colors */}
      <motion.div
        initial={{ y: -100, opacity: 0, rotate: -5 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="mb-6 sm:mb-10 md:mb-12 text-center relative z-10"
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          className="relative bg-[#06B6D4] border-4 border-[#312E81] p-4 sm:p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(49,46,129,1)] sm:shadow-[12px_12px_0px_0px_rgba(49,46,129,1)] md:shadow-[16px_16px_0px_0px_rgba(49,46,129,1)]"
        >
          {/* Corner Screws */}
          <div className="absolute top-2 left-2 w-4 h-4 bg-white border-2 border-black rounded-full flex items-center justify-center">
            <div className="w-2 h-0.5 bg-black rotate-45" />
          </div>
          <div className="absolute top-2 right-2 w-4 h-4 bg-white border-2 border-black rounded-full flex items-center justify-center">
            <div className="w-2 h-0.5 bg-black rotate-45" />
          </div>
          <div className="absolute bottom-2 left-2 w-4 h-4 bg-white border-2 border-black rounded-full flex items-center justify-center">
            <div className="w-2 h-0.5 bg-black rotate-45" />
          </div>
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-white border-2 border-black rounded-full flex items-center justify-center">
            <div className="w-2 h-0.5 bg-black rotate-45" />
          </div>

          <h1 className="text-[clamp(2.5rem,10vw,8rem)] font-black tracking-tighter text-white uppercase leading-[0.85] drop-shadow-md italic">
            <motion.span
              animate={{
                scale: [1, 1.2, 0.92, 1.18, 1],
                rotate: [-6, 8, -4, 6, -6],
                y: [0, -6, 6, -4, 0],
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-block origin-center text-[#FACC15] text-stroke-3 drop-shadow-[0_0_30px_rgba(250,204,21,0.55)]"
            >
              4
            </motion.span>
            <br />
            <span className="text-[#FACC15] text-stroke-3">In A</span>
            <br />
            <span className="text-[#EC4899] text-stroke-3">Row</span>
          </h1>

          <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-[#312E81] text-white px-2 py-0.5 sm:px-4 sm:py-1 text-xs sm:text-sm font-bold rotate-[-5deg] border-2 border-white">
            Made by Nishant
          </div>
        </motion.div>
      </motion.div>

      {/* Username Input */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6 w-full max-w-sm z-20"
      >
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#312E81] p-2 rounded-lg">
            <User className="w-5 h-5 text-[#FACC15]" strokeWidth={3} />
          </div>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="Enter your name..."
            maxLength={15}
            className="w-full pl-16 pr-4 py-4 bg-white border-4 border-[#312E81] shadow-[6px_6px_0px_0px_rgba(49,46,129,1)] text-lg font-bold text-[#312E81] placeholder-[#312E81]/50 focus:outline-none focus:shadow-[8px_8px_0px_0px_rgba(49,46,129,1)] transition-shadow"
          />
        </div>
      </motion.div>

      {/* Interactive 3D Button - Creative Style */}
      <motion.button
        whileHover="hover"
        initial="initial"
        whileTap="tap"
        onClick={handleStart}
        disabled={!inputName.trim()}
        className={`relative group outline-none bg-transparent border-none p-0 cursor-pointer z-20 ${!inputName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Shadow Layer (Deep Violet) */}
        <motion.div
          variants={{
            initial: { x: 10, y: 10 },
            hover: { x: 15, y: 15 },
            tap: { x: 0, y: 0 },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute inset-0 bg-[#312E81] rounded-2xl"
        />

        {/* Main Button Layer (Vibrant Yellow) */}
        <motion.div
          variants={{
            initial: { x: 0, y: 0 },
            hover: { x: -5, y: -5 },
            tap: { x: 0, y: 0 },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="relative w-full h-full bg-[#FACC15] border-4 border-[#312E81] rounded-2xl overflow-hidden"
        >
          {/* Background Texture */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(#312E81 2px, transparent 2px)",
              backgroundSize: "16px 16px",
            }}
          />

          {/* Content Container */}
          <div className="relative px-6 py-4 sm:px-10 sm:py-6 md:px-14 md:py-8 flex items-center gap-3 sm:gap-4 md:gap-6">
            {/* Icon Container with Rotation */}
            <motion.div
              variants={{
                initial: { rotate: 0, scale: 1 },
                hover: { rotate: 180, scale: 1.2 },
              }}
              className="bg-[#312E81] p-2 sm:p-3 rounded-full text-[#FACC15]"
            >
              <Play
                size={28}
                className="sm:w-9 sm:h-9 md:w-10 md:h-10"
                fill="currentColor"
                strokeWidth={0}
              />
            </motion.div>

            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-[clamp(1.5rem,5vw,3rem)] font-black text-[#312E81] uppercase italic tracking-tighter leading-none">
                  Start
                </span>
                <Zap
                  className="text-[#EC4899] animate-pulse w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8"
                  strokeWidth={4}
                />
              </div>
              <span className="text-[clamp(1.75rem,5.5vw,3.5rem)] font-black text-white text-stroke-indigo uppercase italic tracking-tighter leading-none pl-2 sm:pl-4">
                Game
              </span>
            </div>

            {/* Shine Effect */}
            <motion.div
              variants={{
                initial: { x: "-150%", opacity: 0 },
                hover: { x: "150%", opacity: 0.5 },
              }}
              transition={{ duration: 0.6, ease: "linear" }}
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12"
            />
          </div>
        </motion.div>
      </motion.button>

      {/* Footer Tag */}
      <div className="mt-6 sm:mt-10 md:mt-16 text-xs sm:text-sm font-bold tracking-widest uppercase text-white/50 bg-[#312E81]/20 px-4 py-1.5 sm:px-6 sm:py-2 rounded-full border border-white/10 backdrop-blur-md">
        Press Start to Connect
      </div>

      {/* Global Style for Text Stroke if needed */}
      <style>{`
        .text-stroke-3 {
            -webkit-text-stroke: 3px white;
        }
        .text-stroke-indigo {
             -webkit-text-stroke: 2px #312E81;
        }
      `}</style>
    </motion.div>
  );
};

export default StartScreen;
