// src/pages/Brackets/components/brackets/BracketViewer.tsx
import { useCallback } from 'react';
import { type Bracket, type Competitor, type Match } from '../../types/bracket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OpenAIService } from '../../services/openai.ts';
import { env } from '../../lib/config/env';

interface BracketViewerProps {
    bracket: Bracket;
    onUpdateBracket: (bracket: Bracket) => void;
}

export function BracketViewer({ bracket, onUpdateBracket }: BracketViewerProps) {
    const openai = new OpenAIService(env.OPENAI_API_KEY);

    const handleWinnerSelect = useCallback(async (roundIndex: number, matchIndex: number, winner: Competitor) => {
        const newBracket = { ...bracket };
        const currentMatch = newBracket.rounds[roundIndex].matches[matchIndex];

        // Update the current match with the winner
        currentMatch.winner = winner;

        // Generate AI commentary for the match
        try {
            const commentary = await openai.generateMatchCommentary(
                currentMatch.competitor1?.name || '',
                currentMatch.competitor2?.name || ''
            );
            currentMatch.explanation = commentary;
        } catch (error) {
            console.error('Failed to generate commentary:', error);
            currentMatch.explanation = `${winner.name} wins the match!`;
        }

        // If this isn't the final round, update the next round's match
        if (roundIndex < newBracket.rounds.length - 1) {
            const nextRoundMatchIndex = Math.floor(matchIndex / 2);
            const nextMatch = newBracket.rounds[roundIndex + 1].matches[nextRoundMatchIndex];

            // Determine if this winner should be competitor1 or competitor2 in the next match
            if (matchIndex % 2 === 0) {
                nextMatch.competitor1 = winner;
            } else {
                nextMatch.competitor2 = winner;
            }
        }

        // Check if this round is complete
        const isRoundComplete = newBracket.rounds[roundIndex].matches.every(
            match => match.winner !== undefined
        );

        // Check if this was the final match of the tournament
        if (roundIndex === newBracket.rounds.length - 1) {
            newBracket.status = 'completed';
        } else if (isRoundComplete) {
            newBracket.status = 'in_progress';
        }

        onUpdateBracket(newBracket);
    }, [bracket, openai]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>{bracket.title}</CardTitle>
                            {bracket.description && (
                                <p className="text-muted-foreground mt-1">
                                    {bracket.description}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Badge variant={
                                bracket.status === 'completed' ? 'default' :
                                    bracket.status === 'in_progress' ? 'secondary' :
                                        'outline'
                            }>
                                {bracket.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="inline-flex gap-8 p-4 min-w-full">
                            {bracket.rounds.map((round, roundIndex) => (
                                <div
                                    key={roundIndex}
                                    className="flex flex-col gap-4"
                                    style={{
                                        marginTop: `${roundIndex * 2}rem`
                                    }}
                                >
                                    <div className="text-sm font-medium text-center mb-2">
                                        Round {roundIndex + 1}
                                    </div>
                                    {round.matches.map((match, matchIndex) => (
                                        <MatchCard
                                            key={match.id}
                                            match={match}
                                            onWinnerSelect={winner =>
                                                handleWinnerSelect(roundIndex, matchIndex, winner)
                                            }
                                            isDisabled={bracket.status === 'completed' ||
                                                (roundIndex > 0 && !isPreviousRoundComplete(bracket, roundIndex))}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Helper function to check if previous round is complete
function isPreviousRoundComplete(bracket: Bracket, currentRoundIndex: number): boolean {
    if (currentRoundIndex === 0) return true;

    const previousRound = bracket.rounds[currentRoundIndex - 1];
    return previousRound.matches.every(match => match.winner !== undefined);
}

interface MatchCardProps {
    match: Match;
    onWinnerSelect: (winner: Competitor) => void;
    isDisabled?: boolean;
}

function MatchCard({ match, onWinnerSelect, isDisabled }: MatchCardProps) {
    return (
        <div className="w-64 border rounded-lg p-4 bg-card">
            <div className="space-y-4">
                <CompetitorSlot
                    competitor={match.competitor1}
                    isWinner={match.winner?.id === match.competitor1?.id}
                    onSelect={
                        !isDisabled && match.competitor1
                            ? () => onWinnerSelect(match.competitor1!)
                            : undefined
                    }
                />

                <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-medium">VS</span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <CompetitorSlot
                    competitor={match.competitor2}
                    isWinner={match.winner?.id === match.competitor2?.id}
                    onSelect={
                        !isDisabled && match.competitor2
                            ? () => onWinnerSelect(match.competitor2!)
                            : undefined
                    }
                />

                {match.explanation && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                        {match.explanation}
                    </p>
                )}
            </div>
        </div>
    );
}

interface CompetitorSlotProps {
    competitor?: Competitor;
    isWinner?: boolean;
    onSelect?: () => void;
}

function CompetitorSlot({ competitor, isWinner, onSelect }: CompetitorSlotProps) {
    if (!competitor) {
        return (
            <div className="h-12 border-2 border-dashed rounded flex items-center justify-center">
                <span className="text-sm text-muted-foreground">TBD</span>
            </div>
        );
    }

    return (
        <div
            className={`p-2 rounded border-2 transition-colors ${
                isWinner
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
            }`}
        >
            <div className="flex items-center gap-2">
                {competitor.image && (
                    <img
                        src={competitor.image}
                        alt={competitor.name}
                        className="w-8 h-8 rounded object-cover"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                            {competitor.name}
                        </span>
                        {competitor.seed && (
                            <span className="text-xs text-muted-foreground">
                                #{competitor.seed}
                            </span>
                        )}
                    </div>
                    {competitor.description && (
                        <p className="text-xs text-muted-foreground truncate">
                            {competitor.description}
                        </p>
                    )}
                </div>
            </div>
            {onSelect && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={onSelect}
                    disabled={isWinner}
                >
                    {isWinner ? 'Winner' : 'Select Winner'}
                </Button>
            )}
        </div>
    );
}