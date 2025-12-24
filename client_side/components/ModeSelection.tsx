import React from "react";
import { motion } from "framer-motion";
import { User, Cpu, ArrowLeft } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { useSocketStore } from "../store/socketStore";

const ModeSelection: React.FC = () => {
  const { setGameMode, setAppScreen } = useGameStore();
  const { connect, isConnected, createBotGame } = useSocketStore();

  const handleSelect = (mode: "pvp" | "cpu") => {
    setGameMode(mode);
    if (mode === "cpu") {
      // CPU mode uses server-side bot via WebSocket
      if (!isConnected) {
        // Connect first, then create bot game
        connect();
        // Wait for connection and create bot game
        const checkConnection = setInterval(() => {
          const { isConnected, socket } = useSocketStore.getState();
          if (isConnected && socket?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            useSocketStore.getState().createBotGame();
          }
        }, 100);
        // Timeout after 5 seconds
        setTimeout(() => clearInterval(checkConnection), 5000);
      } else {
        createBotGame();
      }
    } else {
      // Multiplayer goes to room selection
      setAppScreen("room_selection");
    }
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
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: 0.95, rotate: -2 }}
      className="flex flex-col items-center justify-center min-h-full w-full relative z-10 px-4 py-6 sm:py-8 overflow-y-auto overflow-x-hidden"
    >
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          variants={shapeVariants}
          className="absolute top-[-5%] right-[-5%] sm:top-[-3%] sm:right-[-3%]"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              type: "tween",
            }}
            className="w-[25vw] h-[25vw] min-w-[100px] min-h-[100px] max-w-[200px] max-h-[200px] bg-purple-400 border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-full"
          />
        </motion.div>

        <motion.div
          variants={shapeVariants}
          className="absolute bottom-[8%] left-[3%]"
        >
          <motion.div
            animate={{ rotate: [45, 90, 45] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              type: "tween",
            }}
            className="w-[15vw] h-[15vw] min-w-[60px] min-h-[60px] max-w-[120px] max-h-[120px] bg-yellow-400 border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          />
        </motion.div>

        <motion.div
          variants={shapeVariants}
          className="absolute top-[15%] left-[-2%] sm:left-[-1%]"
        >
          <motion.div
            animate={{ x: [0, 15, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              type: "tween",
            }}
            className="w-[20vw] h-[4vw] min-w-[80px] min-h-[16px] max-w-[150px] max-h-[40px] bg-white border-2 sm:border-4 border-black -rotate-12"
          />
        </motion.div>

        {/* Striped element */}
        <motion.div
          variants={shapeVariants}
          className="absolute bottom-[15%] right-[5%] hidden sm:block"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              type: "tween",
            }}
            className="w-[10vw] h-[20vw] min-w-[50px] min-h-[100px] max-w-[90px] max-h-[180px] border-2 sm:border-4 border-black bg-white rotate-12"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #000 10%, transparent 10%, transparent 50%, #000 50%, #000 60%, transparent 60%, transparent 100%)",
              backgroundSize: "15px 15px",
            }}
          />
        </motion.div>

        {/* Extra geometric noise */}
        <motion.div
          variants={shapeVariants}
          className="absolute top-1/2 left-[3%] hidden lg:block opacity-20"
        >
          <div
            className="w-0 h-0 border-l-[3vw] border-l-transparent border-t-[4.5vw] border-t-blue-500 border-r-[3vw] border-r-transparent rotate-12"
            style={{ maxWidth: "50px" }}
          ></div>
        </motion.div>

        <motion.div
          variants={shapeVariants}
          className="absolute bottom-[5%] right-[30%] hidden lg:block opacity-20"
        >
          <div className="w-[5vw] h-[5vw] min-w-[40px] min-h-[40px] max-w-[80px] max-h-[80px] border-4 sm:border-8 border-green-500 rounded-full"></div>
        </motion.div>
      </div>

      <motion.div
        variants={item}
        className="mb-6 sm:mb-8 md:mb-12 relative z-10"
      >
        <motion.div
          animate={{ rotate: [2, -2, 2] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            type: "tween",
          }}
          className="bg-white border-4 border-black p-3 sm:p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300"
        >
          <h2 className="text-[clamp(1.75rem,5vw,3rem)] sm:text-4xl md:text-5xl font-black text-black tracking-tight uppercase leading-none text-center">
            Select
            <br />
            Mode
          </h2>
        </motion.div>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 w-full max-w-4xl px-2 sm:px-4 z-10">
        {/* Player VS CPU */}
        <motion.button
          variants={item}
          whileHover={{
            scale: 1.05,
            rotate: -2,
            boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)",
          }}
          whileTap={{
            scale: 0.95,
            rotate: 0,
            boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
            translate: "4px 4px",
          }}
          onClick={() => handleSelect("cpu")}
          className="flex-1 bg-violet-500 border-4 border-black p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 group relative overflow-hidden transition-all"
        >
          {/* Decorative Corner */}
          <div className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 border-r-4 border-b-4 border-black bg-white/20"></div>

          <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-none border-4 border-black bg-white flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform duration-300">
            <div className="flex items-center -space-x-3 sm:-space-x-4">
              <User
                className="text-black w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10"
                strokeWidth={3}
              />
              <span className="text-black font-black text-lg sm:text-xl md:text-2xl z-10 bg-yellow-400 px-1 border-2 border-black rotate-12">
                VS
              </span>
              <Cpu
                className="text-black w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10"
                strokeWidth={3}
              />
            </div>
          </div>
          <div className="relative z-10 text-center bg-black p-1.5 sm:p-2 w-full transform -skew-x-12">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white uppercase italic">
              Single Player
            </h3>
          </div>
        </motion.button>

        {/* Player VS Player */}
        <motion.button
          variants={item}
          whileHover={{
            scale: 1.05,
            rotate: 2,
            boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)",
          }}
          whileTap={{
            scale: 0.95,
            rotate: 0,
            boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
            translate: "4px 4px",
          }}
          onClick={() => handleSelect("pvp")}
          className="flex-1 bg-orange-500 border-4 border-black p-4 sm:p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 group relative overflow-hidden transition-all"
        >
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 border-l-4 border-b-4 border-black bg-white/20"></div>

          <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-none border-4 border-black bg-white flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-rotate-6 transition-transform duration-300">
            <div className="flex items-center -space-x-3 sm:-space-x-4">
              <User
                className="text-black w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10"
                strokeWidth={3}
              />
              <span className="text-black font-black text-lg sm:text-xl md:text-2xl z-10 bg-cyan-400 px-1 border-2 border-black -rotate-12">
                VS
              </span>
              <User
                className="text-black w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10"
                strokeWidth={3}
              />
            </div>
          </div>
          <div className="relative z-10 text-center bg-black p-1.5 sm:p-2 w-full transform skew-x-12">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white uppercase italic">
              Multiplayer
            </h3>
          </div>
        </motion.button>
      </div>

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
        onClick={() => setAppScreen("start")}
        className="mt-6 sm:mt-10 md:mt-16 flex items-center gap-2 sm:gap-3 px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-slate-100 border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black text-sm sm:text-base font-black uppercase tracking-wider transition-all z-10"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={4} /> Back
      </motion.button>
    </motion.div>
  );
};

export default ModeSelection;
