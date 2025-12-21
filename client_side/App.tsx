import React from "react";
import Game from "./components/Game";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <Game />
    </div>
  );
};

export default App;
