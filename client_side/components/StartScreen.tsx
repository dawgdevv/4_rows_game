import React from "react";
import { motion } from "framer-motion";
import { Play, Zap } from "lucide-react";
import { useGameStore } from "../store/gameStore";

const StartScreen: React.FC = () => {
  const { setAppScreen } = useGameStore();

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
      className="flex flex-col items-center justify-center h-full w-full relative z-10 p-4 overflow-hidden"
    >
      {/* Abstract Background Shapes - Crazy Motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Top Left Yellow Box */}
        <motion.div
          variants={shapeVariants}
          className="absolute top-10 left-4 md:left-20"
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
            className="w-24 h-24 md:w-32 md:h-32 bg-[#FACC15] border-4 border-[#312E81] shadow-[8px_8px_0px_0px_rgba(49,46,129,1)]"
          />
        </motion.div>

        {/* Bottom Right Pink Circle */}
        <motion.div
          variants={shapeVariants}
          className="absolute bottom-20 right-4 md:right-20"
        >
          <motion.div
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              type: "tween",
            }}
            className="w-32 h-32 md:w-48 md:h-48 bg-[#EC4899] rounded-full border-4 border-[#312E81] shadow-[8px_8px_0px_0px_rgba(49,46,129,1)] flex items-center justify-center"
          >
            <div className="w-16 h-16 bg-black rounded-full animate-ping opacity-20" />
          </motion.div>
        </motion.div>

        {/* Top Right Striped Rect */}
        <motion.div
          variants={shapeVariants}
          className="absolute top-20 right-4 md:right-32"
        >
          <motion.div
            animate={{ rotate: [6, 24, 6] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "mirror",
              type: "tween",
            }}
            className="w-20 h-40 md:w-40 md:h-60 border-4 border-[#312E81] bg-white"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #312E81 10%, transparent 10%, transparent 50%, #312E81 50%, #312E81 60%, transparent 60%, transparent 100%)",
              backgroundSize: "20px 20px",
            }}
          />
        </motion.div>

        {/* Floating Lines */}
        <motion.div
          variants={shapeVariants}
          className="absolute top-1/3 left-[-50px] md:left-1/4"
        >
          <motion.div
            animate={{ x: [-50, 50, -50], rotate: [45, 90, 45] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              type: "tween",
            }}
            className="w-64 h-4 bg-[#06B6D4] border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"
          />
        </motion.div>

        {/* Chaos Element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15, rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] -z-20 pointer-events-none"
        >
          <div className="w-full h-full border-[100px] border-dashed border-[#6366F1] rounded-full" />
        </motion.div>
      </div>

      {/* Main Title Block - Creative Colors */}
      <motion.div
        initial={{ y: -100, opacity: 0, rotate: -5 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="mb-16 text-center relative z-10"
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          className="relative bg-[#06B6D4] border-4 border-[#312E81] p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(49,46,129,1)]"
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

          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white uppercase leading-[0.85] drop-shadow-md italic">
            <motion.span
              animate={{
                scale: [1, 1.12, 1],
                rotate: [-2, 3, -2],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block origin-center text-[#FACC15] text-stroke-3"
            >
              4
            </motion.span>
            <br />
            <span className="text-[#FACC15] text-stroke-3">In A</span>
            <br />
            <span className="text-[#EC4899] text-stroke-3">Row</span>
          </h1>

          <div className="absolute -bottom-6 -right-6 bg-[#312E81] text-white px-4 py-1 font-bold rotate-[-5deg] border-2 border-white">
            Made by Nishant
          </div>
        </motion.div>
      </motion.div>

      {/* Interactive 3D Button - Creative Style */}
      <motion.button
        whileHover="hover"
        initial="initial"
        whileTap="tap"
        onClick={() => setAppScreen("mode_selection")}
        className="relative group outline-none bg-transparent border-none p-0 cursor-pointer z-20"
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
          <div className="relative px-16 py-8 flex items-center gap-6">
            {/* Icon Container with Rotation */}
            <motion.div
              variants={{
                initial: { rotate: 0, scale: 1 },
                hover: { rotate: 180, scale: 1.2 },
              }}
              className="bg-[#312E81] p-3 rounded-full text-[#FACC15]"
            >
              <Play size={40} fill="currentColor" strokeWidth={0} />
            </motion.div>

            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-5xl font-black text-[#312E81] uppercase italic tracking-tighter leading-none">
                  Start
                </span>
                <Zap
                  className="text-[#EC4899] animate-pulse"
                  size={32}
                  strokeWidth={4}
                />
              </div>
              <span className="text-5xl font-black text-white text-stroke-indigo uppercase italic tracking-tighter leading-none pl-4">
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
      <div className="mt-20 font-bold tracking-widest uppercase text-white/50 bg-[#312E81]/20 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
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
