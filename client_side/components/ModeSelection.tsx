import React from "react";
import { motion } from "framer-motion";
import { User, Cpu, ArrowLeft } from "lucide-react";
import { useGameStore } from "../store/gameStore";

const ModeSelection: React.FC = () => {
  const { setGameMode, setAppScreen } = useGameStore();

  const handleSelect = (mode: "pvp" | "cpu") => {
    setGameMode(mode);
    setAppScreen("game");
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
      className="flex flex-col items-center justify-center h-full w-full relative z-10 px-4 overflow-hidden"
    >
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          variants={shapeVariants}
          className="absolute top-[-50px] right-[-50px]"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              type: "tween",
            }}
            className="w-64 h-64 bg-purple-400 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-full"
          />
        </motion.div>

        <motion.div
          variants={shapeVariants}
          className="absolute bottom-[10%] left-[5%]"
        >
          <motion.div
            animate={{ rotate: [45, 90, 45] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              type: "tween",
            }}
            className="w-32 h-32 bg-yellow-400 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          />
        </motion.div>

        <motion.div
          variants={shapeVariants}
          className="absolute top-[20%] left-[-20px]"
        >
          <motion.div
            animate={{ x: [0, 20, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              type: "tween",
            }}
            className="w-40 h-12 bg-white border-4 border-black -rotate-12"
          />
        </motion.div>

        {/* Striped element */}
        <motion.div
          variants={shapeVariants}
          className="absolute bottom-[20%] right-[10%]"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              type: "tween",
            }}
            className="w-24 h-48 border-4 border-black bg-white rotate-12"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #000 10%, transparent 10%, transparent 50%, #000 50%, #000 60%, transparent 60%, transparent 100%)",
              backgroundSize: "20px 20px",
            }}
          />
        </motion.div>

        {/* Extra geometric noise */}
        <motion.div
          variants={shapeVariants}
          className="absolute top-1/2 left-10 hidden md:block opacity-20"
        >
          <div className="w-0 h-0 border-l-[50px] border-l-transparent border-t-[75px] border-t-blue-500 border-r-[50px] border-r-transparent rotate-12"></div>
        </motion.div>

        <motion.div
          variants={shapeVariants}
          className="absolute bottom-10 right-1/3 hidden md:block opacity-20"
        >
          <div className="w-20 h-20 border-8 border-green-500 rounded-full"></div>
        </motion.div>
      </div>

      <motion.div variants={item} className="mb-12 relative z-10">
        <motion.div
          animate={{ rotate: [2, -2, 2] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            type: "tween",
          }}
          className="bg-white border-4 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300"
        >
          <h2 className="text-4xl md:text-6xl font-black text-black tracking-tight uppercase leading-none text-center">
            Select
            <br />
            Mode
          </h2>
        </motion.div>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl px-4 z-10">
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
          className="flex-1 bg-violet-500 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-6 group relative overflow-hidden transition-all"
        >
          {/* Decorative Corner */}
          <div className="absolute top-0 left-0 w-16 h-16 border-r-4 border-b-4 border-black bg-white/20"></div>

          <div className="relative z-10 w-28 h-28 rounded-none border-4 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform duration-300">
            <div className="flex items-center -space-x-4">
              <User size={40} className="text-black" strokeWidth={3} />
              <span className="text-black font-black text-2xl z-10 bg-yellow-400 px-1 border-2 border-black rotate-12">
                VS
              </span>
              <Cpu size={40} className="text-black" strokeWidth={3} />
            </div>
          </div>
          <div className="relative z-10 text-center bg-black p-2 w-full transform -skew-x-12">
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic">
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
          className="flex-1 bg-orange-500 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-6 group relative overflow-hidden transition-all"
        >
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-16 h-16 border-l-4 border-b-4 border-black bg-white/20"></div>

          <div className="relative z-10 w-28 h-28 rounded-none border-4 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-rotate-6 transition-transform duration-300">
            <div className="flex items-center -space-x-4">
              <User size={40} className="text-black" strokeWidth={3} />
              <span className="text-black font-black text-2xl z-10 bg-cyan-400 px-1 border-2 border-black -rotate-12">
                VS
              </span>
              <User size={40} className="text-black" strokeWidth={3} />
            </div>
          </div>
          <div className="relative z-10 text-center bg-black p-2 w-full transform skew-x-12">
            <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic">
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
        className="mt-16 flex items-center gap-3 px-8 py-4 bg-slate-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-black uppercase tracking-wider transition-all z-10"
      >
        <ArrowLeft strokeWidth={4} /> Back
      </motion.button>
    </motion.div>
  );
};

export default ModeSelection;
