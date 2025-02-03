// src/services/api/openai.ts
import OpenAI from 'openai';

export class OpenAIService {
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true // Note: In production, we'd want to proxy through backend
        });
    }

    async determineWinner(
        competitor1: string,
        competitor2: string,
        context?: string
    ): Promise<{ winner: string; explanation: string }> {
        try {
            const response = await this.client.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert at analyzing hypothetical matchups. For each matchup:
1. Consider the competitors' abilities, skills, and context
2. Choose a winner based on logic and known capabilities
3. Provide a brief, exciting explanation
4. IMPORTANT: Always specify the winner EXACTLY as given in the input (same spelling/capitalization)`
                    },
                    {
                        role: "user",
                        content: `Who would win between "${competitor1}" and "${competitor2}"? ${context || ''}\nFormat: Winner: [exact name]\nExplanation: [1-2 sentences]`
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            });

            const content = response.choices[0].message.content || "";
            const [winnerLine, explanationLine] = content.split('\n');
            const winner = winnerLine.replace('Winner:', '').trim();

            // Verify the winner matches one of the competitors exactly
            if (winner !== competitor1 && winner !== competitor2) {
                console.error('AI returned invalid winner name:', winner);
                throw new Error('Invalid winner selection');
            }

            return {
                winner,
                explanation: explanationLine.replace('Explanation:', '').trim()
            };
        } catch (error) {
            console.error('Error determining winner:', error);
            throw error;
        }
    }

    async generateMatchCommentary(
        competitor1: string,
        competitor2: string,
        winner: string,
        context?: string
    ): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a concise battle commentator. Provide a brief, exciting description of how the specified winner achieved victory. Keep it to 1-2 sentences."
                    },
                    {
                        role: "user",
                        content: `In a battle between ${competitor1} and ${competitor2}, ${winner} was victorious. Describe how they won. ${context || ''}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 50
            });

            return response.choices[0].message.content || "No commentary generated.";
        } catch (error) {
            console.error('Error generating match commentary:', error);
            throw error;
        }
    }
}