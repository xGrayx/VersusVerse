// src/pages/Brackets/components/brackets/MatchCard.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OpenAIService } from '../../services/api/openai';
import { env } from '../../lib/config/env';
import { type Match, type Competitor } from '../../types/bracket';
import { Loader2 } from 'lucide-react';

interface MatchCardProps {
    match: Match;
    onWinnerSelect: (winner: Competitor, explanation: string) => void;
    isDisabled?: boolean;
}

export function MatchCard({ match, onWinnerSelect, isDisabled }: MatchCardProps) {
    const [isAiSelecting, setIsAiSelecting] = useState(false);

    const handleAiSelect = async () => {
        if (!match.competitor1 || !match.competitor2 || isDisabled) return;

        setIsAiSelecting(true);
        const openai = new OpenAIService(env.OPENAI_API_KEY);

        try {
            const result = await openai.determineWinner(
                match.competitor1.name,
                match.competitor2.name
            );

            // Find the winning competitor object
            const winner = result.winner === match.competitor1.name ?
                match.competitor1 : match.competitor2;

            onWinnerSelect(winner, result.explanation);
        } catch (error) {
            console.error('Error getting AI selection:', error);
        } finally {
            setIsAiSelecting(false);
        }
    };

    return (
        <div className="w-64 border rounded-lg p-4 bg-card">
            <div className="space-y-4">
                <CompetitorSlot
                    competitor={match.competitor1}
                    isWinner={match.winner?.id === match.competitor1?.id}
                    onSelect={
                        !isDisabled && match.competitor1
                            ? () => onWinnerSelect(match.competitor1!, `${match.competitor1!.name} wins the match!`)
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
                            ? () => onWinnerSelect(match.competitor2!, `${match.competitor2!.name} wins the match!`)
                            : undefined
                    }
                />

                {!match.winner && !isDisabled && match.competitor1 && match.competitor2 && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={handleAiSelect}
                        disabled={isAiSelecting}
                    >
                        {isAiSelecting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                AI is deciding...
                            </>
                        ) : (
                            'Let AI Decide'
                        )}
                    </Button>
                )}

                {match.explanation && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                        {match.explanation}
                    </p>
                )}
            </div>
        </div>
    );
}