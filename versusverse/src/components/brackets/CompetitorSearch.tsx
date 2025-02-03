// src/pages/Brackets/components/brackets/CompetitorSearch.tsx
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ApiCompetitorService, type ApiSource } from '../../services/competitors/apiCompetitorService';
import { type Competitor } from '../../types/bracket';

interface CompetitorSearchProps {
    onSelect: (competitor: Competitor) => void;
    maxCompetitors: number;
    currentCount: number;
}

export function CompetitorSearch({ onSelect, maxCompetitors, currentCount }: CompetitorSearchProps) {
    const [sources, setSources] = useState<ApiSource[]>([]);
    const [selectedSource, setSelectedSource] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<Competitor[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const apiService = new ApiCompetitorService();

    useEffect(() => {
        const loadSources = async () => {
            const availableSources = await apiService.getAvailableSources();
            setSources(availableSources);
        };
        loadSources();
    }, []);

    const handleSearch = async () => {
        if (!selectedSource) return;

        setIsLoading(true);
        try {
            const searchResults = await apiService.searchCompetitors(selectedSource, searchQuery);
            setResults(searchResults);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoFill = async () => {
        if (!selectedSource) return;

        setIsLoading(true);
        try {
            const remaining = maxCompetitors - currentCount;
            const competitors = await apiService.getCompetitors(selectedSource, remaining);
            competitors.forEach(onSelect);
            setResults([]); // Clear search results after auto-fill
        } catch (error) {
            console.error('Auto-fill error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                >
                    <option value="">Select a source...</option>
                    {sources.map(source => (
                        <option key={source.id} value={source.id}>
                            {source.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex gap-2">
                <Input
                    placeholder="Search competitors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={!selectedSource || isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                </Button>
            </div>

            {currentCount < maxCompetitors && (
                <Button
                    variant="outline"
                    onClick={handleAutoFill}
                    disabled={!selectedSource || isLoading}
                    className="w-full"
                >
                    Auto-fill Remaining ({maxCompetitors - currentCount} spots)
                </Button>
            )}

            {results.length > 0 && (
                <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                        {results.map(competitor => (
                            <div
                                key={competitor.id}
                                className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                                onClick={() => {
                                    if (currentCount < maxCompetitors) {
                                        onSelect(competitor);
                                        setResults(prev => prev.filter(c => c.id !== competitor.id));
                                    }
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    {competitor.image && (
                                        <img
                                            src={competitor.image}
                                            alt={competitor.name}
                                            className="w-8 h-8 rounded object-cover"
                                        />
                                    )}
                                    <div>
                                        <div className="font-medium">{competitor.name}</div>
                                        {competitor.description && (
                                            <div className="text-sm text-muted-foreground">
                                                {competitor.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={currentCount >= maxCompetitors}
                                >
                                    Add
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}