// src/App.tsx
import { Outlet } from 'react-router-dom'
import "./index.css"  // Changed from "./styles/globals.css"
import { Navbar } from './components/common/Navbar/Navbar'

function App() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    )
}

export default App