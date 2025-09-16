// src/pages/TournamentBracketApp.jsx

import React, { useState } from 'react';
import TournamentSetupForm from '../components/tournament/TournamentSetupForm';
import DynamicTournamentBracket from '../components/tournament/DynamicTournamentBracket';

export default function TournamentBracketApp() {
    const [currentTournament, setCurrentTournament] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // This function now uses local state instead of a database.
    const handleStartTournament = async (tournamentData) => {
        setIsLoading(true);
        // Simulate loading time
        setTimeout(() => {
            setCurrentTournament(tournamentData);
            setIsLoading(false);
        }, 1000);
    };

    const handleBackToSetup = () => {
        setCurrentTournament(null);
    };

    // This function resets the bracket by re-triggering the setup
    const handleResetBracket = () => {
        if (currentTournament) {
            handleStartTournament(currentTournament);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Setting up tournament...</h2>
                    <p className="text-gray-400">Generating bracket structure</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {!currentTournament ? (
                <TournamentSetupForm onStartTournament={handleStartTournament} />
            ) : (
                <DynamicTournamentBracket 
                    tournament={currentTournament}
                    onBack={handleBackToSetup}
                    onReset={handleResetBracket}
                />
            )}
        </>
    );
}
// src/components/tournament/DynamicTournamentBracket.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Trophy, Share2, Users, Award } from 'lucide-react';
import TournamentMatchCard from './TournamentMatchCard';
import TournamentBracketConnector from './TournamentBracketConnector';

export default function DynamicTournamentBracket({ tournament, onBack, onReset }) {
    const [bracketStructure, setBracketStructure] = useState([]);
    const [champion, setChampion] = useState(null);
    const containerRef = useRef(null);
    const [isMounted, setIsMounted] = useState(false);

    const initializeBracket = useCallback(() => {
        const players = tournament.players;
        const totalPlayers = tournament.totalPlayers;
        const rounds = Math.log2(totalPlayers);
        
        const bracket = [];
        
        const firstRound = [];
        for (let i = 0; i < totalPlayers; i += 2) {
            const player1 = players[i];
            const player2 = players[i + 1];
            
            let winner = null;
            if (player2 === 'BYE') {
                winner = { name: player1, seed: i + 1 };
            } else if (player1 === 'BYE') {
                winner = { name: player2, seed: i + 2 };
            }
            
            firstRound.push({
                player1: player1,
                player2: player2,
                seed1: i + 1,
                seed2: i + 2,
                winner: winner
            });
        }
        bracket.push(firstRound);
        
        let currentMatches = firstRound.length;
        for (let round = 1; round < rounds; round++) {
            currentMatches = currentMatches / 2;
            const roundMatches = [];
            for (let i = 0; i < currentMatches; i++) {
                roundMatches.push({
                    player1: 'TBD',
                    player2: 'TBD',
                    seed1: null,
                    seed2: null,
                    winner: null
                });
            }
            bracket.push(roundMatches);
        }
        
        if (bracket.length > 1) {
            for (let i = 0; i < firstRound.length; i++) {
                const match = firstRound[i];
                if (match.winner) {
                    const nextRoundIndex = 1;
                    const nextMatchIndex = Math.floor(i / 2);
                    const isTopSlot = i % 2 === 0;
                    
                    if (isTopSlot) {
                        bracket[nextRoundIndex][nextMatchIndex].player1 = match.winner.name;
                        bracket[nextRoundIndex][nextMatchIndex].seed1 = match.winner.seed;
                    } else {
                        bracket[nextRoundIndex][nextMatchIndex].player2 = match.winner.name;
                        bracket[nextRoundIndex][nextMatchIndex].seed2 = match.winner.seed;
                    }
                }
            }
        }
        
        setBracketStructure(bracket);
    }, [tournament.players, tournament.totalPlayers]);

    useEffect(() => {
        initializeBracket();
        setIsMounted(false);
        const timer = setTimeout(() => setIsMounted(true), 200);
        return () => clearTimeout(timer);
    }, [initializeBracket]);

    const handlePlayerClick = (roundIndex, matchIndex, playerSeed, playerName) => {
        const match = bracketStructure[roundIndex][matchIndex];
        if (match.player1 === 'TBD' || match.player2 === 'TBD' || match.player1 === 'BYE' || match.player2 === 'BYE') return;

        const newBracketStructure = JSON.parse(JSON.stringify(bracketStructure));
        const currentMatch = newBracketStructure[roundIndex][matchIndex];
        
        const newWinner = { name: playerName, seed: playerSeed };
        currentMatch.winner = newWinner;
        
        if (roundIndex < bracketStructure.length - 1) {
            const nextRoundIndex = roundIndex + 1;
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const isTopSlot = matchIndex % 2 === 0;
            
            if (isTopSlot) {
                newBracketStructure[nextRoundIndex][nextMatchIndex].player1 = newWinner.name;
                newBracketStructure[nextRoundIndex][nextMatchIndex].seed1 = newWinner.seed;
            } else {
                newBracketStructure[nextRoundIndex][nextMatchIndex].player2 = newWinner.name;
                newBracketStructure[nextRoundIndex][nextMatchIndex].seed2 = newWinner.seed;
            }
            
            clearSubsequentRounds(newBracketStructure, nextRoundIndex, nextMatchIndex);
        } else {
            setChampion(newWinner);
        }
        
        setBracketStructure(newBracketStructure);
    };

    const clearSubsequentRounds = (data, fromRoundIndex, fromMatchIndex) => {
        for (let roundIdx = fromRoundIndex; roundIdx < data.length; roundIdx++) {
            if (roundIdx === fromRoundIndex) {
                const match = data[roundIdx][fromMatchIndex];
                match.winner = null;
                
                if (roundIdx < data.length - 1) {
                    const nextMatchIdx = Math.floor(fromMatchIndex / 2);
                    const nextMatch = data[roundIdx + 1][nextMatchIdx];
                    if (fromMatchIndex % 2 === 0) {
                        nextMatch.player1 = 'TBD';
                        nextMatch.seed1 = null;
                    } else {
                        nextMatch.player2 = 'TBD';
                        nextMatch.seed2 = null;
                    }
                }
            } else {
                data[roundIdx].forEach(match => {
                    match.player1 = 'TBD';
                    match.player2 = 'TBD';
                    match.seed1 = null;
                    match.seed2 = null;
                    match.winner = null;
                });
            }
        }
        
        if (fromRoundIndex <= data.length - 1) {
            setChampion(null);
        }
    };

    const getRoundName = (roundIndex, totalRounds) => {
        if (roundIndex === totalRounds - 1) return 'Championship';
        if (roundIndex === totalRounds - 2) return 'Semi Finals';
        if (roundIndex === totalRounds - 3) return 'Quarter Finals';
        return `Round of ${Math.pow(2, totalRounds - roundIndex)}`;
    };

    const generateAlignedBracketLayout = () => {
        const totalRounds = bracketStructure.length;
        if (totalRounds === 0) return null;
        
        const leftRoundsCount = Math.ceil((totalRounds - 1) / 2);
        const rightRoundsCount = Math.floor((totalRounds - 1) / 2);
        const gridColumns = leftRoundsCount + 1 + rightRoundsCount;

        const leftRounds = bracketStructure.slice(0, leftRoundsCount);
        const rightRounds = bracketStructure.slice(leftRoundsCount, totalRounds - 1).reverse();
        const finalRound = bracketStructure[totalRounds - 1];

        return (
            <div 
                className="grid gap-x-16" 
                style={{ 
                    gridTemplateColumns: `repeat(${gridColumns}, 320px)`,
                    justifyContent: 'center',
                    alignItems: 'start'
                }}
            >
                {/* Left Side Rounds */}
                {leftRounds.map((round, roundIndex) => (
                    <div key={`left-${roundIndex}`} className="space-y-4">
                        <h3 className="text-lg font-bold text-center text-gray-200 mb-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            {getRoundName(roundIndex, totalRounds)}
                        </h3>
                        <div className="flex flex-col justify-around gap-y-8 h-full">
                            {round.map((match, matchIndex) => (
                                <div key={matchIndex} data-round={roundIndex} data-match={matchIndex} className="flex items-center justify-center">
                                    <TournamentMatchCard {...match} roundIndex={roundIndex} matchIndex={matchIndex} onPlayerClick={handlePlayerClick} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                
                {/* CENTER - Championship Final */}
                <div key="final" className="space-y-4">
                    <h3 className="text-xl font-bold text-center text-yellow-400 mb-8">
                        🏆 {getRoundName(totalRounds - 1, totalRounds)} 🏆
                    </h3>
                    <div className="flex items-center justify-center h-full">
                        {finalRound && (
                            <div data-round={totalRounds - 1} data-match="0">
                                <TournamentMatchCard {...finalRound[0]} isFinal={true} roundIndex={totalRounds - 1} matchIndex={0} onPlayerClick={handlePlayerClick} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side Rounds (reverse order) */}
                {rightRounds.map((round, reverseIndex) => {
                    const actualRoundIndex = totalRounds - 2 - reverseIndex;
                    return (
                        <div key={`right-${actualRoundIndex}`} className="space-y-4">
                            <h3 className="text-lg font-bold text-center text-gray-200 mb-8 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                                {getRoundName(actualRoundIndex, totalRounds)}
                            </h3>
                            <div className="flex flex-col justify-around gap-y-8 h-full">
                                {round.map((match, matchIndex) => {
                                    const actualMatchIndex = bracketStructure[actualRoundIndex].length - 1 - matchIndex;
                                    return (
                                        <div key={actualMatchIndex} data-round={actualRoundIndex} data-match={actualMatchIndex} className="flex items-center justify-center">
                                            <TournamentMatchCard {...bracketStructure[actualRoundIndex][actualMatchIndex]} roundIndex={actualRoundIndex} matchIndex={actualMatchIndex} onPlayerClick={handlePlayerClick} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
            <header className="border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" onClick={onBack} className="border-gray-600 hover:bg-gray-700">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{tournament.name}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                    <span>{tournament.category}</span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" /> {tournament.actualParticipants} Participants
                                    </span>
                                    <span className="text-blue-400">{tournament.totalPlayers}-slot bracket</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" onClick={onReset} className="border-gray-600 hover:bg-gray-700">
                                <RotateCcw className="w-4 h-4 mr-2" /> Reset
                            </Button>
                            <Button variant="outline" size="sm" className="border-gray-600 hover:bg-gray-700">
                                <Share2 className="w-4 h-4 mr-2" /> Share
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {champion && (
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-b border-yellow-500/40">
                    <div className="container mx-auto px-6 py-6">
                        <div className="flex items-center justify-center gap-6">
                            <Award className="w-12 h-12 text-yellow-400 animate-pulse" />
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-yellow-400 mb-1">TOURNAMENT CHAMPION!</h2>
                                <p className="text-2xl text-white font-bold">{champion.name}</p>
                            </div>
                            <Award className="w-12 h-12 text-yellow-400 animate-pulse" />
                        </div>
                    </div>
                </div>
            )}

            <main className="py-12 overflow-x-auto">
                <div className="min-w-fit px-8">
                    <div ref__={containerRef} className="relative">
                        {generateAlignedBracketLayout()}
                        {isMounted && (
                            <TournamentBracketConnector bracketStructure={bracketStructure} containerRef={containerRef} totalPlayers={tournament.totalPlayers} />
                        )}
                    </div>
                </div>
            </main>

            <footer className="border-t border-gray-700/50 bg-gray-800/30">
                <div className="container mx-auto px-6 py-4">
                    <div className="text-center">
                        <p className="text-gray-300">Click on a player's name to advance them to the next round.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
// src/components/tournament/TournamentBracketConnector.jsx

import React, { useState, useLayoutEffect } from 'react';

export default function TournamentBracketConnector({ bracketStructure, containerRef, totalPlayers }) {
    const [connections, setConnections] = useState([]);

    useLayoutEffect(() => {
        if (!containerRef.current || !bracketStructure.length || !bracketStructure[0]) return;

        const calculateConnections = () => {
            const newConnections = [];
            const containerRect = containerRef.current.getBoundingClientRect();
            
            for (let roundIndex = 0; roundIndex < bracketStructure.length - 1; roundIndex++) {
                const currentRound = bracketStructure[roundIndex];
                const nextRound = bracketStructure[roundIndex + 1];
                
                for (let matchIndex = 0; matchIndex < currentRound.length; matchIndex++) {
                    const nextMatchIndex = Math.floor(matchIndex / 2);

                    const matchEl = containerRef.current.querySelector(`[data-round="${roundIndex}"][data-match="${matchIndex}"]`);
                    const nextMatchEl = containerRef.current.querySelector(`[data-round="${roundIndex + 1}"][data-match="${nextMatchIndex}"]`);

                    if (matchEl && nextMatchEl) {
                        const mRect = matchEl.getBoundingClientRect();
                        const nextRect = nextMatchEl.getBoundingClientRect();

                        const isLeftSide = mRect.left < containerRect.left + containerRect.width / 2;

                        const p1 = { 
                            x: (isLeftSide ? mRect.right : mRect.left) - containerRect.left, 
                            y: mRect.top + mRect.height / 2 - containerRect.top 
                        };
                        const pNext = { 
                            x: (isLeftSide ? nextRect.left : nextRect.right) - containerRect.left, 
                            y: nextRect.top + nextRect.height / 2 - containerRect.top 
                        };
                        
                        const midX = p1.x + (isLeftSide ? 40 : -40);

                        const pathData = `M ${p1.x},${p1.y} C ${midX},${p1.y} ${midX},${pNext.y} ${pNext.x},${pNext.y}`;

                        newConnections.push({
                            id: `conn-${roundIndex}-${matchIndex}`,
                            path: pathData,
                            delay: roundIndex * 150 + matchIndex * 50
                        });
                    }
                }
            }
            setConnections(newConnections);
        };
        
        calculateConnections();
        
        const handleResize = () => setTimeout(calculateConnections, 100);
        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
        
    }, [bracketStructure, containerRef, totalPlayers]);

    return (
        <svg 
            className="absolute inset-0 pointer-events-none w-full h-full"
            style={{ zIndex: -1 }}
        >
            <defs>
                <linearGradient id="bracketConnectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
            <g>
                {connections.map((conn) => (
                    <path
                        key={conn.id}
                        d={conn.path}
                        stroke="url(#bracketConnectionGradient)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                        style={{
                            strokeDasharray: 500,
                            strokeDashoffset: 500,
                            animation: `draw-line 0.5s ease-out forwards ${conn.delay}ms`
                        }}
                    />
                ))}
            </g>
            <style>{`
                @keyframes draw-line {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </svg>
    );
}// src/components/tournament/TournamentMatchCard.jsx

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
}// src/components/tournament/TournamentSetupForm.jsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Users, Play, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TournamentSetupForm({ onStartTournament }) {
    const [tournamentName, setTournamentName] = useState('');
    const [category, setCategory] = useState('');
    const [playerInput, setPlayerInput] = useState('');
    const [tournamentSize, setTournamentSize] = useState('16');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!tournamentName.trim()) {
            setError('Tournament name is required');
            return;
        }
        
        setIsGenerating(true);
        setError('');
        
        const playerNames = playerInput
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        const maxPlayers = parseInt(tournamentSize);
        
        if (playerNames.length > maxPlayers) {
            setError(`Too many players! Maximum allowed: ${maxPlayers}`);
            setIsGenerating(false);
            return;
        }
        
        const actualParticipants = playerNames.length || 0;
        const bracketSize = (actualParticipants <= 4) ? 4 : (actualParticipants <= 8) ? 8 : (actualParticipants <= 16) ? 16 : 32;

        const fullRoster = [...playerNames];
        while (fullRoster.length < bracketSize) {
            fullRoster.push('BYE');
        }
        
        onStartTournament({
            name: tournamentName,
            category: category || 'General',
            players: fullRoster,
            totalPlayers: bracketSize,
            actualParticipants: actualParticipants
        });
    };

    const enteredPlayerCount = playerInput.split(',').filter(name => name.trim().length > 0).length;
    const nextPowerOf2 = enteredPlayerCount > 0 ? Math.pow(2, Math.ceil(Math.log2(enteredPlayerCount))) : parseInt(tournamentSize);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Tournament Bracket Generator</h1>
                    <p className="text-gray-400">Create perfectly aligned tournament brackets</p>
                </div>

                <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700/50 shadow-2xl">
                    <CardHeader className="border-b border-gray-700/50">
                        <CardTitle className="text-white text-xl">Setup Tournament</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="tournament-name" className="text-gray-300">Tournament Name *</Label>
                            <Input
                                id="tournament-name"
                                placeholder="Enter tournament name..."
                                value={tournamentName}
                                onChange={(e) => setTournamentName(e.target.value)}
                                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-gray-300">Category/Game (Optional)</Label>
                            <Input
                                id="category"
                                placeholder="e.g., Valorant, Chess, FIFA, Basketball..."
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tournament-size" className="text-gray-300">Maximum Tournament Size</Label>
                            <Select value={tournamentSize} onValueChange={setTournamentSize}>
                                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                                    <SelectValue placeholder="Select tournament size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="4">Up to 4 Players</SelectItem>
                                    <SelectItem value="8">Up to 8 Players</SelectItem>
                                    <SelectItem value="16">Up to 16 Players</SelectItem>
                                    <SelectItem value="32">Up to 32 Players</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="players" className="text-gray-300 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Player/Team Names
                            </Label>
                            <Textarea
                                id="players"
                                placeholder="Enter player names separated by commas&#10;e.g., Alice, Bob, Charlie, Diana&#10;&#10;For odd numbers, some players will get automatic 'byes' to the next round."
                                value={playerInput}
                                onChange={(e) => setPlayerInput(e.target.value)}
                                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[120px] resize-none"
                            />
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">
                                    {enteredPlayerCount} players entered
                                </span>
                                {enteredPlayerCount > 0 && nextPowerOf2 !== enteredPlayerCount && (
                                    <span className="text-blue-400">
                                        Will create a {nextPowerOf2}-player bracket
                                    </span>
                                )}
                            </div>
                        </div>

                        {enteredPlayerCount > 0 && nextPowerOf2 !== enteredPlayerCount && (
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Bracket Adjustment:</strong> Your {enteredPlayerCount} players will compete in a {nextPowerOf2}-slot bracket. 
                                    Some players will receive automatic "byes" (advancement to next round) to balance the tournament.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            onClick={handleGenerate}
                            disabled={!tournamentName.trim() || isGenerating}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                        >
                            {isGenerating ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating Perfect Bracket...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Play className="w-4 h-4" />
                                    Generate Tournament Bracket
                                </div>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}