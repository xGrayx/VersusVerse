import { Button } from "../../components/common/Button.tsx"
import { Link } from "react-router-dom"

export default function Home() {
    return (
        <div className="grid place-items-center gap-8 py-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">
                    Welcome to VersusVerse
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Create epic battles, blind rankings, and interactive scenarios for movies, comics, sports, and more.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Bracket Battles</h2>
                    <p className="text-muted-foreground mb-4">Create tournament brackets for any matchup you can imagine.</p>
                    <Button asChild>
                        <Link to="/brackets">Create Battle</Link>
                    </Button>
                </div>

                <div className="p-6 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Blind Ranker</h2>
                    <p className="text-muted-foreground mb-4">Test your ranking skills without seeing what's coming next.</p>
                    <Button asChild variant="secondary">
                        <Link to="/blind-ranker">Start Ranking</Link>
                    </Button>
                </div>

                <div className="p-6 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">AI Quizzes</h2>
                    <p className="text-muted-foreground mb-4">Challenge yourself with AI-generated fandom quizzes.</p>
                    <Button asChild variant="outline">
                        <Link to="/quiz">Take a Quiz</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}