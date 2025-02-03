// src/pages/Brackets/BracketsPage.tsx
import { useState } from 'react'
import { Button } from '../../components/common/Button'
import { useBracketStore } from '../../store/bracketStore'
import { BracketCreator } from '../../components/brackets/BracketCreator'
import { BracketViewer } from '../../components/brackets/BracketViewer'

export default function BracketsPage() {
    const [isCreating, setIsCreating] = useState(false);
    const { currentBracket, updateBracket } = useBracketStore();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Bracket Battles</h1>
                <div className="flex gap-4">
                    {currentBracket && (
                        <Button
                            variant="outline"
                            onClick={() => setIsCreating(true)}
                        >
                            New Bracket
                        </Button>
                    )}
                    {!currentBracket && (
                        <Button onClick={() => setIsCreating(true)}>
                            Create Bracket
                        </Button>
                    )}
                </div>
            </div>

            {isCreating ? (
                <BracketCreator onCancel={() => setIsCreating(false)} />
            ) : currentBracket ? (
                <BracketViewer
                    bracket={currentBracket}
                    onUpdateBracket={updateBracket}
                />
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        No active bracket. Create one to get started!
                    </p>
                </div>
            )}
        </div>
    )
}