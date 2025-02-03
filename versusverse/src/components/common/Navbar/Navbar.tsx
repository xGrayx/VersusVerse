import { Link } from 'react-router-dom'
import { Button } from '../button'

export function Navbar() {
    return (
        <nav className="border-b">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold">
                        VersusVerse
                    </Link>
                    <div className="flex gap-4">
                        <Button variant="ghost" asChild>
                            <Link to="/brackets">Brackets</Link>
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link to="/blind-ranker">Blind Ranker</Link>
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link to="/quiz">Quiz</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}