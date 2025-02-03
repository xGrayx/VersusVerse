// src/lib/utils/bracket.ts
import { type Bracket, type Competitor } from '../../types/bracket'

export function generateEmptyBracket(competitors: Competitor[]): Bracket {
    const numCompetitors = competitors.length;
    const numRounds = Math.ceil(Math.log2(numCompetitors));

    // Generate rounds and matches structure
    const rounds = Array.from({ length: numRounds }, (_, roundIndex) => {
        const numMatches = Math.pow(2, numRounds - roundIndex - 1);
        const matches = Array.from({ length: numMatches }, (_, matchIndex) => ({
            id: `match-${roundIndex}-${matchIndex}`,
            roundIndex,
            matchIndex,
            competitor1: undefined,
            competitor2: undefined,
            winner: undefined,
        }));

        return { matches };
    });

    // For the first round, calculate the number of byes needed
    const totalSlots = Math.pow(2, numRounds);
    const numByes = totalSlots - numCompetitors;

    return {
        id: crypto.randomUUID(),
        title: '',
        rounds,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft',
    };
}

export function calculateBracketProgress(bracket: Bracket): number {
    if (!bracket.rounds.length) return 0;

    const totalMatches = bracket.rounds.reduce(
        (sum, round) => sum + round.matches.length,
        0
    );

    const completedMatches = bracket.rounds.reduce(
        (sum, round) => sum + round.matches.filter(m => m.winner).length,
        0
    );

    return (completedMatches / totalMatches) * 100;
}