// src/routes/Router.tsx
import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import Home from '../pages/Home/Home'
import Brackets from '../pages/Brackets/BracketsPage'

// Creating placeholder components for routes that don't exist yet
const BlindRanker = () => (
    <div className="p-8">
        <h1 className="text-3xl font-bold">Blind Ranker</h1>
        <p className="text-muted-foreground mt-2">Coming soon...</p>
    </div>
)

const Quiz = () => (
    <div className="p-8">
        <h1 className="text-3xl font-bold">AI Quizzes</h1>
        <p className="text-muted-foreground mt-2">Coming soon...</p>
    </div>
)

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'brackets',
                element: <Brackets />,
            },
            {
                path: 'blind-ranker',
                element: <BlindRanker />,
            },
            {
                path: 'quiz',
                element: <Quiz />,
            },
        ],
    },
])