import React from "react";
import { useGameStore } from "../store/gameStore";
import { useSocketStore } from "../store/socketStore";
import { RefreshCw, Home, Volume2, VolumeX, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Controls: React.FC = () => {
  const {
    currentPlayer,
    resetGame,
    quitGame,
    toggleSound,
    isSoundEnabled,
    gameMode,
    username,
    opponentName,
  } = useGameStore();

  const { isConnected, playerNumber } = useSocketStore();
  const isPlayer2 = isConnected && playerNumber === 2;

  // Relative Coloring Logic:
  // If I am Player 2, I want to see myself on the Left (Red).
  // Left Box = Me (Red), Right Box = Opponent (Yellow)

  const leftName = isPlayer2 ? (username || "Me") : (username || "P1");
  const rightName = isPlayer2 ? (opponentName || "Opponent") : (opponentName || (gameMode === "cpu" ? "Bot" : "P2"));

  const isLeftActive = isPlayer2 ? currentPlayer === 2 : currentPlayer === 1;
  const isRightActive = isPlayer2 ? currentPlayer === 1 : currentPlayer === 2;

  return (
    <div className="absolute top-3 sm:top-4 left-0 right-0 px-3 sm:px-4 md:px-8 z-20 flex flex-wrap sm:flex-nowrap gap-3 items-center justify-between pointer-events-none">
      {/* Left: Home/Quit Button */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
        whileTap={{
          scale: 0.95,
          boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
          translate: "2px 2px",
        }}
        onClick={quitGame}
        className="pointer-events-auto p-2.5 sm:p-3 bg-white border-3 border-black rounded-lg text-black shadow-neo hover:bg-slate-100 transition-colors"
        title="Quit to Main Menu"
      >
        <Home size={22} className="sm:w-6 sm:h-6" strokeWidth={3} />
      </motion.button>

      {/* Center: Turn Indicator */}
      <div className="flex items-center gap-2 md:gap-4 pointer-events-auto mt-1 sm:mt-2 order-last sm:order-none flex-1 justify-center min-w-[220px]">
        {/* Player 1 Box */}
        <motion.div
          animate={{
            scale: isLeftActive ? 1.1 : 0.9,
            opacity: isLeftActive ? 1 : 0.6,
            y: isLeftActive ? 0 : 5,
          }}
          className={`flex items-center justify-center px-4 md:px-6 py-2 md:py-3 border-3 border-black rounded-xl shadow-neo transition-colors duration-300 ${isLeftActive
            ? "bg-player1 text-white"
            : "bg-slate-200 text-slate-500"
            }`}
        >
          <span className="font-black text-lg sm:text-xl md:text-2xl tracking-tighter drop-shadow-sm max-w-[100px] truncate">
            {leftName}
          </span>
        </motion.div>

        {/* Animated Arrow */}
        <div className="w-16 sm:w-20 md:w-24 flex justify-center items-center">
          <motion.div
            animate={{
              rotate: isLeftActive ? 180 : 0,
              x: isLeftActive ? -12 : 12, // Move towards active player
              scale: [1, 1.25, 1], // Pulse effect
            }}
            key={currentPlayer} // Re-trigger animation on change
            transition={{
              type: "tween",
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="filter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
          >
            <ArrowRight
              size={40}
              strokeWidth={5}
              className={isLeftActive ? "text-player1" : "text-player2"}
            />
          </motion.div>
        </div>

        {/* Player 2 Box */}
        <motion.div
          animate={{
            scale: isRightActive ? 1.1 : 0.9,
            opacity: isRightActive ? 1 : 0.6,
            y: isRightActive ? 0 : 5,
          }}
          className={`flex items-center justify-center px-4 md:px-6 py-2 md:py-3 border-3 border-black rounded-xl shadow-neo transition-colors duration-300 ${isRightActive
            ? "bg-player2 text-black"
            : "bg-slate-200 text-slate-500"
            }`}
        >
          <span className="font-black text-lg sm:text-xl md:text-2xl tracking-tighter drop-shadow-sm">
            {rightName}
          </span>
        </motion.div>
      </div>

      {/* Right: Actions */}
      <div className="flex gap-2 sm:gap-3 pointer-events-auto">
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
          }}
          whileTap={{
            scale: 0.95,
            boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
            translate: "2px 2px",
          }}
          onClick={toggleSound}
          className="p-2.5 sm:p-3 bg-white border-3 border-black rounded-lg text-black shadow-neo hover:bg-slate-100"
          title={isSoundEnabled ? "Mute" : "Unmute"}
        >
          {isSoundEnabled ? (
            <Volume2 size={22} className="sm:w-6 sm:h-6" strokeWidth={3} />
          ) : (
            <VolumeX size={22} className="sm:w-6 sm:h-6" strokeWidth={3} />
          )}
        </motion.button>

        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
          }}
          whileTap={{
            scale: 0.95,
            boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
            translate: "2px 2px",
          }}
          onClick={resetGame}
          className="p-2.5 sm:p-3 bg-blue-500 border-3 border-black rounded-lg text-white shadow-neo hover:bg-blue-400"
          title="Restart Game"
        >
          <RefreshCw size={22} className="sm:w-6 sm:h-6" strokeWidth={3} />
        </motion.button>
      </div>
    </div>
  );
};

export default Controls;
