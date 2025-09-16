import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Share2, Users, Award } from 'lucide-react';
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
                player1, player2,
                seed1: i + 1,
                seed2: i + 2,
                winner
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
        if (roundIndex === totalRounds - 1) return 'Final';
        if (roundIndex === totalRounds - 2) return 'Semi Finals';
        if (roundIndex === totalRounds - 3) return 'Quarter Finals';
        return `Round ${roundIndex + 1}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
            <header className="border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
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
            </header>

            {champion && (
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-b border-yellow-500/40">
                    <div className="container mx-auto px-6 py-6 flex items-center justify-center gap-6">
                        <Award className="w-12 h-12 text-yellow-400 animate-pulse" />
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-yellow-400 mb-1">TOURNAMENT CHAMPION!</h2>
                            <p className="text-2xl text-white font-bold">{champion.name}</p>
                        </div>
                        <Award className="w-12 h-12 text-yellow-400 animate-pulse" />
                    </div>
                </div>
            )}

            <main className="py-12 overflow-x-auto">
                <div className="min-w-fit px-8">
                    <div ref={containerRef} className="relative flex gap-16">
                        {bracketStructure.map((round, roundIndex) => (
                            <div key={roundIndex} className="space-y-4">
                                <h3 className="text-lg font-bold text-center text-gray-200 mb-8">
                                    {getRoundName(roundIndex, bracketStructure.length)}
                                </h3>
                                <div className="flex flex-col gap-y-8">
                                    {round.map((match, matchIndex) => (
                                        <div key={matchIndex} data-round={roundIndex} data-match={matchIndex}>
                                            <TournamentMatchCard
                                                {...match}
                                                roundIndex={roundIndex}
                                                matchIndex={matchIndex}
                                                onPlayerClick={handlePlayerClick}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isMounted && (
                            <TournamentBracketConnector
                                bracketStructure={bracketStructure}
                                containerRef={containerRef}
                                totalPlayers={tournament.totalPlayers}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
