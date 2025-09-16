// src/components/tournament/TournamentMatchCard.jsx

import React from 'react';
import { Card } from '@/components/ui/card';
import { Crown, Trophy, User, Zap } from 'lucide-react';

export default function TournamentMatchCard({ 
    player1, 
    player2, 
    seed1, 
    seed2, 
    winner, 
    isFinal = false,
    roundIndex,
    matchIndex,
    onPlayerClick 
}) {
    const isByeMatch = player1 === 'BYE' || player2 === 'BYE';
    const isComplete = !!winner;
    
    const getPlayerClass = (playerSeed, winnerSeed, playerName) => {
        if (playerName === 'BYE') return 'text-gray-500 text-xs font-medium';
        if (playerName === 'TBD') return 'text-gray-400 text-sm font-medium cursor-not-allowed';
        if (!winner) return 'text-gray-200 hover:text-blue-400 cursor-pointer transition-all duration-200 font-medium';
        return playerSeed === winnerSeed ? 'text-green-400 font-bold' : 'text-gray-500';
    };

    const getCardClass = () => {
        let baseClass = "relative overflow-hidden transition-all duration-300 w-72 ";
        
        if (isFinal) {
            return baseClass + "bg-gradient-to-br from-yellow-900/30 to-purple-900/30 border-2 border-yellow-500/50 shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/30";
        } else if (isComplete) {
            return baseClass + "bg-gradient-to-br from-green-900/20 to-blue-900/20 border border-green-500/40 shadow-lg shadow-green-500/10";
        } else if (isByeMatch) {
            return baseClass + "bg-gradient-to-br from-gray-800/30 to-gray-700/30 border border-gray-600/30";
        } else {
            return baseClass + "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/40 hover:border-blue-500/60 cursor-pointer hover:shadow-lg hover:shadow-blue-500/10";
        }
    };

    const handlePlayerClick = (playerSeed, playerName) => {
        if (playerName === 'TBD' || playerName === 'BYE' || isByeMatch) return;
        onPlayerClick && onPlayerClick(roundIndex, matchIndex, playerSeed, playerName);
    };

    return (
        <Card className={getCardClass()}>
            <div className="p-4 space-y-3">
                {isFinal && (
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-bold text-sm">CHAMPIONSHIP</span>
                        <Crown className="w-5 h-5 text-yellow-400" />
                    </div>
                )}

                {isByeMatch && (
                    <div className="flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 font-semibold text-xs">BYE</span>
                        <Zap className="w-4 h-4 text-orange-400" />
                    </div>
                )}
                
                {/* Player 1 */}
                <div 
                    className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                        winner?.seed === seed1 ? 'bg-green-500/25 border border-green-500/60' : 
                        player1 !== 'BYE' && player1 !== 'TBD' ? 'hover:bg-blue-500/10' : ''
                    }`}
                    onClick={() => handlePlayerClick(seed1, player1)}
                >
                    <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            player1 === 'BYE' ? 'bg-gray-600/30 text-gray-500' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                            {player1 === 'BYE' ? 'B' : seed1}
                        </span>
                        <span className={`${getPlayerClass(seed1, winner?.seed, player1)} min-w-0 truncate`}>
                            {player1}
                        </span>
                    </div>
                    {winner?.seed === seed1 && <Trophy className="w-4 h-4 text-green-400 flex-shrink-0" />}
                </div>

                {!isByeMatch && (
                    <div className="flex items-center justify-center py-0.5">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                        <span className={`px-2 text-xs font-bold rounded ${
                            isFinal ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 bg-gray-700/50'
                        }`}>
                            VS
                        </span>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                    </div>
                )}

                {/* Player 2 */}
                <div 
                    className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                        winner?.seed === seed2 ? 'bg-green-500/25 border border-green-500/60' : 
                        player2 !== 'BYE' && player2 !== 'TBD' ? 'hover:bg-purple-500/10' : ''
                    }`}
                    onClick={() => handlePlayerClick(seed2, player2)}
                >
                    <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            player2 === 'BYE' ? 'bg-gray-600/30 text-gray-500' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                             {player2 === 'BYE' ? 'B' : seed2}
                        </span>
                        <span className={`${getPlayerClass(seed2, winner?.seed, player2)} min-w-0 truncate`}>
                            {player2}
                        </span>
                    </div>
                    {winner?.seed === seed2 && <Trophy className="w-4 h-4 text-green-400 flex-shrink-0" />}
                </div>
            </div>
        </Card>
    );
}