// src/pages/Brackets/components/brackets/BracketCreator.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useBracketStore } from '../../store/bracketStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateEmptyBracket } from '../../lib/utils/bracket'
import { type Competitor } from '../../types/bracket'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { CompetitorSearch } from './CompetitorSearch'

interface BracketCreatorProps {
    onCancel: () => void;
}

export function BracketCreator({ onCancel }: BracketCreatorProps) {
    const [step, setStep] = useState<'details' | 'competitors'>('details');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [numCompetitors, setNumCompetitors] = useState(8);
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [bulkInput, setBulkInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { setCurrentBracket } = useBracketStore();

    const handleNextStep = () => {
        if (!title.trim()) {
            setError('Please enter a title for your bracket');
            return;
        }
        setError(null);
        setStep('competitors');
    };

    const handleAddCompetitor = () => {
        if (competitors.length >= numCompetitors) {
            setError(`Maximum ${numCompetitors} competitors allowed`);
            return;
        }

        const newCompetitor: Competitor = {
            id: crypto.randomUUID(),
            name: `Competitor ${competitors.length + 1}`,
            seed: competitors.length + 1
        };

        setCompetitors([...competitors, newCompetitor]);
    };

    const handleUpdateCompetitor = (id: string, updates: Partial<Competitor>) => {
        setCompetitors(competitors.map(c =>
            c.id === id ? { ...c, ...updates } : c
        ));
    };

    const handleRemoveCompetitor = (id: string) => {
        setCompetitors(prev => {
            // Remove the competitor
            const filtered = prev.filter(c => c.id !== id);
            // Update seeds for remaining competitors
            return filtered.map((c, index) => ({
                ...c,
                seed: index + 1
            }));
        });
    };

    const handleProcessBulkInput = () => {
        const names = bulkInput
            .split('\n')
            .map(name => name.trim())
            .filter(Boolean);

        if (names.length > numCompetitors) {
            setError(`Maximum ${numCompetitors} competitors allowed`);
            return;
        }

        const newCompetitors = names.map((name, index) => ({
            id: crypto.randomUUID(),
            name,
            seed: index + 1
        }));

        setCompetitors(newCompetitors);
        setError(null);
    };

    const handleCompetitorSelect = (competitor: Competitor) => {
        if (competitors.length >= numCompetitors) {
            setError(`Maximum ${numCompetitors} competitors allowed`);
            return;
        }

        // Add seed number to the competitor
        const newCompetitor = {
            ...competitor,
            seed: competitors.length + 1
        };

        setCompetitors([...competitors, newCompetitor]);
        setError(null);
    };

    const handleCreate = () => {
        if (competitors.length < 2) {
            setError('At least 2 competitors are required');
            return;
        }

        if (competitors.length !== numCompetitors) {
            setError(`Exactly ${numCompetitors} competitors are required`);
            return;
        }

        const bracket = generateEmptyBracket(competitors);
        bracket.title = title;
        bracket.description = description;

        // Seed competitors into the first round
        const firstRound = bracket.rounds[0];
        competitors.forEach((competitor, index) => {
            const matchIndex = Math.floor(index / 2);
            const isCompetitor1 = index % 2 === 0;

            if (isCompetitor1) {
                firstRound.matches[matchIndex].competitor1 = competitor;
            } else {
                firstRound.matches[matchIndex].competitor2 = competitor;
            }
        });

        setCurrentBracket(bracket);
        onCancel();
    };

    if (step === 'details') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Create New Bracket</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Bracket Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter bracket title..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter bracket description..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="competitors">Number of Competitors</Label>
                                <select
                                    id="competitors"
                                    value={numCompetitors}
                                    onChange={(e) => setNumCompetitors(Number(e.target.value))}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                                >
                                    {[4, 8, 16, 32, 64].map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-end gap-4">
                            <Button variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button onClick={handleNextStep}>
                                Next: Add Competitors
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Competitors</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <Tabs defaultValue="manual" className="w-full">
                        <TabsList>
                            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                            <TabsTrigger value="bulk">Bulk Entry</TabsTrigger>
                            <TabsTrigger value="api">API Search</TabsTrigger>
                        </TabsList>

                        <TabsContent value="manual" className="space-y-4">
                            <div className="space-y-4">
                                {competitors.map((competitor, index) => (
                                    <div key={competitor.id} className="flex gap-4 items-center">
                                        <Input
                                            value={competitor.name}
                                            onChange={(e) => handleUpdateCompetitor(competitor.id, {
                                                name: e.target.value
                                            })}
                                            placeholder={`Competitor ${index + 1}`}
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleRemoveCompetitor(competitor.id)}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}

                                {competitors.length < numCompetitors && (
                                    <Button
                                        variant="outline"
                                        onClick={handleAddCompetitor}
                                        className="w-full"
                                    >
                                        Add Competitor
                                    </Button>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="bulk" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="bulk-input">
                                    Enter one competitor per line
                                </Label>
                                <Textarea
                                    id="bulk-input"
                                    value={bulkInput}
                                    onChange={(e) => setBulkInput(e.target.value)}
                                    placeholder="John Doe&#10;Jane Smith&#10;..."
                                    rows={10}
                                />
                                <Button
                                    variant="secondary"
                                    onClick={handleProcessBulkInput}
                                    className="w-full"
                                >
                                    Process Bulk Input
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="api" className="space-y-4">
                            <CompetitorSearch
                                onSelect={handleCompetitorSelect}
                                maxCompetitors={numCompetitors}
                                currentCount={competitors.length}
                            />

                            {competitors.length > 0 && (
                                <div className="border rounded-md p-4 mt-4">
                                    <h3 className="font-medium mb-2">Selected Competitors ({competitors.length}/{numCompetitors})</h3>
                                    <div className="space-y-2">
                                        {competitors.map((competitor, index) => (
                                            <div key={competitor.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-md">
                                                <div className="flex items-center gap-2">
                                                    {competitor.image && (
                                                        <img
                                                            src={competitor.image}
                                                            alt={competitor.name}
                                                            className="w-8 h-8 rounded object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-medium">
                                                            #{competitor.seed} {competitor.name}
                                                        </div>
                                                        {competitor.description && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {competitor.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveCompetitor(competitor.id)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setStep('details')}
                            disabled={isLoading}
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={isLoading || competitors.length !== numCompetitors}
                        >
                            Create Bracket
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}