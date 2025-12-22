import React from "react";
import { useGameStore } from "../store/gameStore";
import { useSocketStore } from "../store/socketStore";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Frown, RotateCcw, Menu } from "lucide-react";

const Confetti: React.FC = () => {
  // Increased particle count and variety for "crazy" effect
  const particles = React.useMemo(
    () =>
      Array.from({ length: 150 }).map((_, i) => ({
        id: i,
        xStart: Math.random() * 100, // Random start X percentage
        yStart: -20 - Math.random() * 50, // Start above viewport
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
        color: [
          "#FF4D4D",
          "#FFD700",
          "#3B82F6",
          "#10B981",
          "#ffffff",
          "#000000",
        ][Math.floor(Math.random() * 6)],
        size: 5 + Math.random() * 15,
        rotation: Math.random() * 360,
        shape: ["circle", "square", "triangle"][Math.floor(Math.random() * 3)],
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            y: `${p.yStart}vh`,
            x: `${p.xStart}vw`,
            opacity: 1,
            rotate: p.rotation,
          }}
          animate={{
            y: "110vh", // Fall to bottom
            x: [`${p.xStart}vw`, `${p.xStart + (Math.random() - 0.5) * 40}vw`], // Drift
            rotate: p.rotation + 720,
            opacity: [1, 1, 0], // Fade out at end
          }}
          transition={{
            duration: p.duration,
            ease: "linear",
            repeat: Infinity,
            delay: p.delay,
          }}
          className="absolute"
        >
          {p.shape === "circle" && (
            <div
              className="rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                border: "2px solid black",
              }}
            />
          )}
          {p.shape === "square" && (
            <div
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                border: "2px solid black",
              }}
            />
          )}
          {p.shape === "triangle" && (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${p.size / 2}px solid transparent`,
                borderRight: `${p.size / 2}px solid transparent`,
                borderBottom: `${p.size}px solid ${p.color}`,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

const StatusDialog: React.FC = () => {
  const { gameStatus, winner, resetGame, quitGame, gameMode, rematchStatus } = useGameStore();
  const { requestRematch } = useSocketStore();

  if (gameStatus === "playing") return null;

  const isWin = gameStatus === "won";
  // Use vibrant backgrounds for the modal based on result
  const bgClass = isWin
    ? winner === 1
      ? "bg-[#FF4D4D]"
      : "bg-[#FFD700]"
    : "bg-slate-300";

  const textColorClass = isWin && winner === 1 ? "text-white" : "text-black";
  const winnerName = winner === 1 ? "Player 1" : "Player 2";
  const subText = isWin ? "Takes the Crown!" : "Stalemate reached";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Confetti Layer (Above backdrop, below modal) */}
        {isWin && <Confetti />}

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Main Modal Card */}
        <motion.div
          initial={{ scale: 0.5, rotate: -15, opacity: 0, y: 100 }}
          animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, rotate: 15, opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="relative z-50 max-w-sm sm:max-w-md w-full mx-4"
        >
          <div
            className={`relative border-4 sm:border-[6px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] md:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] ${bgClass} overflow-hidden`}
          >
            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-black/10 -rotate-45 transform origin-bottom-left translate-x-10 -translate-y-10" />
            <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rotate-12 transform translate-y-16 -translate-x-10" />

            {/* Content Container */}
            <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center text-center relative z-10">
              {/* Icon Badge */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  type: "tween",
                  ease: "easeInOut",
                }}
                className="bg-white border-4 border-black p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                {isWin ? (
                  <Trophy
                    className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-black fill-yellow-400"
                    strokeWidth={2.5}
                  />
                ) : (
                  <Frown
                    className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-black"
                    strokeWidth={2.5}
                  />
                )}
              </motion.div>

              {/* Title */}
              <h2
                className={`text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] drop-shadow-[3px_3px_0px_rgba(0,0,0,0.5)] sm:drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)] ${textColorClass}`}
              >
                {isWin ? "Victory!" : "Draw"}
              </h2>

              <div className="bg-black text-white px-3 py-0.5 sm:px-4 sm:py-1 mt-3 sm:mt-4 -rotate-2 transform border-2 border-white/20">
                <p className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-widest">
                  {isWin ? winnerName : "No Winner"}
                </p>
              </div>

              <p
                className={`mt-1.5 sm:mt-2 text-sm sm:text-base font-bold opacity-80 ${textColorClass}`}
              >
                {subText}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-4 w-full mt-6 sm:mt-8 md:mt-10">
                <motion.button
                  whileHover={{
                    scale: rematchStatus === "waiting" ? 1 : 1.02,
                    x: rematchStatus === "waiting" ? 0 : -4,
                    y: rematchStatus === "waiting" ? 0 : -4,
                    boxShadow: rematchStatus === "waiting" ? "4px 4px 0px 0px rgba(0,0,0,1)" : "8px 8px 0px 0px rgba(0,0,0,1)",
                  }}
                  whileTap={{
                    scale: rematchStatus === "waiting" ? 1 : 0.98,
                    x: rematchStatus === "waiting" ? 0 : 2,
                    y: rematchStatus === "waiting" ? 0 : 2,
                    boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
                  }}
                  onClick={() => {
                    if (gameMode === "cpu") {
                      resetGame();
                    } else {
                      requestRematch();
                    }
                  }}
                  disabled={rematchStatus === "waiting"}
                  className={`w-full py-2.5 sm:py-3 md:py-4 bg-white border-4 border-black text-black font-black uppercase text-base sm:text-lg md:text-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 sm:gap-3 transition-colors hover:bg-slate-50 ${
                    rematchStatus === "waiting" ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <RotateCcw
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${rematchStatus === "waiting" ? "animate-spin" : ""}`}
                    strokeWidth={3}
                  />
                  {rematchStatus === "waiting" ? "Waiting for opponent..." : "Rematch"}
                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                    x: -4,
                    y: -4,
                    boxShadow: "8px 8px 0px 0px rgba(255,255,255,0.5)",
                  }}
                  whileTap={{
                    scale: 0.98,
                    x: 2,
                    y: 2,
                    boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
                  }}
                  onClick={quitGame}
                  className="w-full py-2.5 sm:py-3 md:py-4 bg-black border-4 border-black text-white font-black uppercase text-base sm:text-lg md:text-xl shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] sm:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 sm:gap-3"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                  Main Menu
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StatusDialog;
