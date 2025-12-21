import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import BoardCanvas from "./BoardCanvas";
import Controls from "./Controls";
import StatusDialog from "./StatusDialog";
import StartScreen from "./StartScreen";
import ModeSelection from "./ModeSelection";
import { getBestMove } from "../utils/ai";

// --- Background Components ---

const GameTheme: React.FC = () => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
    {/* Base Wall Texture */}
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `
                 linear-gradient(to right, #334155 1px, transparent 1px),
                 linear-gradient(to bottom, #334155 1px, transparent 1px)
               `,
        backgroundSize: "60px 60px",
      }}
    />

    {/* Animated Spotlights */}
    <motion.div
      animate={{
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.2, 1],
        rotate: [0, 10, 0],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
        type: "tween",
      }}
      className="absolute top-[-20%] left-[20%] w-[60vw] h-[60vw] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"
    />
    <motion.div
      animate={{
        opacity: [0.2, 0.5, 0.2],
        scale: [1.2, 1, 1.2],
        rotate: [0, -15, 0],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2,
        type: "tween",
      }}
      className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"
    />

    {/* Atmospheric Vignette */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.8)_100%)]" />

    {/* Industrial Floor */}
    <div className="absolute bottom-0 w-full h-[35vh] bg-[#020617] border-t-8 border-[#1e293b] shadow-[0_-20px_60px_rgba(0,0,0,0.8)]">
      {/* Moving Hazard Stripes */}
      <motion.div
        animate={{ backgroundPositionX: ["0px", "-56px"] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
          type: "tween",
        }}
        className="w-full h-6 opacity-60 border-b-4 border-black/50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, #000 0px, #000 20px, #fbbf24 20px, #fbbf24 40px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Perspective Floor Grid */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)",
        }}
      >
        <div
          className="w-full h-[200%] absolute top-0 left-0 origin-top"
          style={{
            backgroundImage:
              "linear-gradient(to right, #475569 2px, transparent 2px), linear-gradient(to bottom, #475569 2px, transparent 2px)",
            backgroundSize: "120px 120px",
            transform:
              "perspective(800px) rotateX(60deg) scale(2.5) translateY(-50px)",
          }}
        />
      </div>
    </div>

    {/* Environmental Typography */}
    <div className="absolute top-24 left-8 text-white/5 font-black text-[12vw] leading-none select-none hidden xl:block pointer-events-none">
      ZONE
      <br />
      B-04
    </div>
    <div className="absolute bottom-24 right-12 text-white/5 font-black text-[8vw] leading-none select-none hidden xl:block text-right pointer-events-none">
      SECURE
      <br />
      AREA
    </div>
  </div>
);

const GenerativeParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const colors = ["#FF4D4D", "#FFD700", "#3B82F6", "#94a3b8"];
    const shapes = ["square", "circle", "cross", "triangle"];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      shape: string;
      color: string;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }

    const particleCount = 20;
    const particles: Particle[] = Array.from({ length: particleCount }).map(
      () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 20 + Math.random() * 60,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.005,
        opacity: 0.05 + Math.random() * 0.1,
      })
    );

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.x < -100) p.x = width + 100;
        if (p.x > width + 100) p.x = -100;
        if (p.y < -100) p.y = height + 100;
        if (p.y > height + 100) p.y = -100;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        switch (p.shape) {
          case "square":
            ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
            break;
          case "circle":
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case "cross":
            ctx.beginPath();
            ctx.moveTo(-p.size / 2, 0);
            ctx.lineTo(p.size / 2, 0);
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(0, p.size / 2);
            ctx.stroke();
            break;
          case "triangle":
            ctx.beginPath();
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(p.size / 2, p.size / 2);
            ctx.lineTo(-p.size / 2, p.size / 2);
            ctx.closePath();
            ctx.stroke();
            break;
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", setSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};

const Game: React.FC = () => {
  const {
    appScreen,
    gameMode,
    currentPlayer,
    gameStatus,
    activeDrop,
    startDrop,
    board,
  } = useGameStore();

  useEffect(() => {
    if (
      appScreen === "game" &&
      gameMode === "cpu" &&
      currentPlayer === 2 &&
      gameStatus === "playing" &&
      !activeDrop
    ) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove(board, 2);
        if (bestMove !== -1) {
          startDrop(bestMove);
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [
    appScreen,
    gameMode,
    currentPlayer,
    gameStatus,
    activeDrop,
    board,
    startDrop,
  ]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden flex flex-col">
      {/* BACKGROUND LAYER (z-0) */}
      <div className="absolute inset-0 z-0">
        {appScreen === "game" ? (
          <GameTheme />
        ) : (
          /* Menu Background */
          <div className="absolute inset-0 bg-slate-950">
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 2px, transparent 2px), linear-gradient(90deg, #fff 2px, transparent 2px)",
                backgroundSize: "60px 60px",
              }}
            ></div>
          </div>
        )}

        {/* Particles Overlay */}
        <GenerativeParticles />

        {/* Hero Shapes for Game Mode */}
        {appScreen === "game" && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            {/* Rotating Dotted Circle */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 0.1,
                rotate: 360,
              }}
              transition={{
                scale: { duration: 0.5 },
                opacity: { duration: 0.5 },
                rotate: { duration: 60, repeat: Infinity, ease: "linear" },
              }}
              className="absolute -top-40 -left-40 w-[600px] h-[600px] border-2 border-dashed border-white rounded-full"
            />

            {/* Player 1 Active Glow (Left) */}
            <motion.div
              animate={{
                opacity: currentPlayer === 1 ? [0.1, 0.25, 0.1] : 0,
                height: currentPlayer === 1 ? ["40%", "60%", "40%"] : "40%",
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                type: "tween",
              }}
              className="absolute top-1/2 left-0 -translate-y-1/2 w-4 md:w-32 bg-player1 blur-[100px] rounded-full"
            />

            {/* Player 2 Active Glow (Right) */}
            <motion.div
              animate={{
                opacity: currentPlayer === 2 ? [0.1, 0.25, 0.1] : 0,
                height: currentPlayer === 2 ? ["40%", "60%", "40%"] : "40%",
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                type: "tween",
              }}
              className="absolute top-1/2 right-0 -translate-y-1/2 w-4 md:w-32 bg-player2 blur-[100px] rounded-full"
            />
          </div>
        )}
      </div>

      {/* CONTENT LAYER (z-20) - Interactive elements */}
      <div className="relative z-20 w-full flex-1 flex flex-col pointer-events-none overflow-x-hidden overflow-y-auto">
        <AnimatePresence mode="wait">
          {appScreen === "start" && (
            <div className="pointer-events-auto w-full min-h-full flex-1">
              <StartScreen key="start" />
            </div>
          )}

          {appScreen === "mode_selection" && (
            <div className="pointer-events-auto w-full min-h-full flex-1">
              <ModeSelection key="mode" />
            </div>
          )}

          {appScreen === "game" && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 50 }}
              className="relative w-full flex-1 flex flex-col pointer-events-auto"
            >
              <Controls />

              {/* Board container with minimal top padding on small screens */}
              <div className="flex-1 flex items-center justify-center p-2 sm:p-3 md:p-4 pt-14 sm:pt-16 md:pt-20 z-10">
                <div className="relative w-full max-w-6xl h-full">
                  <BoardCanvas />
                </div>
              </div>

              <StatusDialog />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Game;
