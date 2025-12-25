import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, RefreshCw } from "lucide-react";

interface LeaderboardEntry {
    name: string;
    wins: number;
    games: number;
    win_rate: number;
}

const LeaderboardSidebar: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8081";

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/leaderboard`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setLeaderboard(data.leaderboard || []);
        } catch (err) {
            console.error("Leaderboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        // Refresh every 30 seconds
        const interval = setInterval(fetchLeaderboard, 30000);
        return () => clearInterval(interval);
    }, []);

    const getMedal = (rank: number) => {
        if (rank === 0) return <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
        if (rank === 1) return <Medal className="w-4 h-4 text-gray-400" />;
        if (rank === 2) return <Medal className="w-4 h-4 text-amber-600" />;
        return <span className="text-xs font-bold text-gray-500">{rank + 1}</span>;
    };

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-30 hidden lg:block"
        >
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-56">
                {/* Header */}
                <div className="bg-[#FACC15] border-b-4 border-black p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-black" strokeWidth={2.5} />
                        <span className="font-black text-sm uppercase">Top Players</span>
                    </div>
                    <button onClick={fetchLeaderboard} className="p-1 hover:bg-black/10 rounded">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {/* Leaderboard */}
                <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                    {loading && leaderboard.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
                    )}

                    {!loading && leaderboard.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">No games yet</div>
                    )}

                    {leaderboard.slice(0, 5).map((entry, index) => (
                        <motion.div
                            key={entry.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center gap-2 p-2 border-2 border-black text-sm ${index === 0 ? "bg-yellow-100" : "bg-white"
                                }`}
                        >
                            <div className="w-5 flex justify-center">{getMedal(index)}</div>
                            <div className="flex-1 font-bold truncate text-black">{entry.name}</div>
                            <div className="font-black text-xs text-black">{entry.wins}W</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default LeaderboardSidebar;
