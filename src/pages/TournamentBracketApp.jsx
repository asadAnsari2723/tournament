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
