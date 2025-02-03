import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import Home from '../pages/Home'
// import Brackets from '../pages/Brackets'
// import BlindRanker from '../pages/BlindRanker'
// import Quiz from '../pages/Quiz'

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