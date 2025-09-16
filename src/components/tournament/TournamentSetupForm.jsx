// src/components/tournament/TournamentSetupForm.jsx

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