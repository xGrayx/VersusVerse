// src/services/competitors/apiCompetitorService.ts
import { type Competitor } from '../../types/bracket';

export interface ApiSource {
    id: string;
    name: string;
    type: 'characters' | 'movies' | 'locations' | 'general';
    description: string;
}

export const API_SOURCES = {
    MARVEL: 'marvel',
    POKEMON: 'pokemon',
    STAR_WARS: 'star_wars',
    MOVIES: 'movies',
    ANIME: 'anime'
} as const;

export class ApiCompetitorService {
    private apiCache: Map<string, any[]> = new Map();

    async getAvailableSources(): Promise<ApiSource[]> {
        return [
            {
                id: API_SOURCES.MARVEL,
                name: 'Marvel Characters',
                type: 'characters',
                description: 'Characters from Marvel Comics'
            },
            {
                id: API_SOURCES.POKEMON,
                name: 'Pokémon',
                type: 'characters',
                description: 'All Pokémon characters'
            },
            {
                id: API_SOURCES.STAR_WARS,
                name: 'Star Wars',
                type: 'characters',
                description: 'Characters from Star Wars'
            },
            {
                id: API_SOURCES.MOVIES,
                name: 'Popular Movies',
                type: 'movies',
                description: 'Movies from TMDB'
            },
            {
                id: API_SOURCES.ANIME,
                name: 'Anime Characters',
                type: 'characters',
                description: 'Popular anime characters'
            }
        ];
    }

    async getCompetitors(source: string, count: number): Promise<Competitor[]> {
        let data = this.apiCache.get(source);

        if (!data) {
            data = await this.fetchFromApi(source);
            this.apiCache.set(source, data);
        }

        // Randomly select the requested number of items
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map((item, index) => ({
            id: crypto.randomUUID(),
            name: item.name,
            description: item.description,
            image: item.image,
            seed: index + 1
        }));
    }

    async searchCompetitors(source: string, query: string): Promise<Competitor[]> {
        let data = this.apiCache.get(source);

        if (!data) {
            data = await this.fetchFromApi(source);
            this.apiCache.set(source, data);
        }

        const normalizedQuery = query.toLowerCase();
        return data
            .filter(item => item.name.toLowerCase().includes(normalizedQuery))
            .map((item, index) => ({
                id: crypto.randomUUID(),
                name: item.name,
                description: item.description,
                image: item.image,
                seed: index + 1
            }));
    }

    private async fetchFromApi(source: string): Promise<any[]> {
        switch (source) {
            case API_SOURCES.POKEMON:
                return this.fetchPokemon();
            case API_SOURCES.STAR_WARS:
                return this.fetchStarWarsCharacters();
            case API_SOURCES.MOVIES:
                return this.fetchMovies();
            case API_SOURCES.ANIME:
                return this.fetchAnimeCharacters();
            default:
                throw new Error(`Unknown API source: ${source}`);
        }
    }

    private async fetchPokemon(): Promise<any[]> {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();

        // Fetch details for each Pokemon
        const detailPromises = data.results.map(async (pokemon: any) => {
            const detailResponse = await fetch(pokemon.url);
            const details = await detailResponse.json();
            return {
                name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
                description: `Type: ${details.types.map((t: any) => t.type.name).join(', ')}`,
                image: details.sprites.front_default
            };
        });

        return Promise.all(detailPromises);
    }

    private async fetchStarWarsCharacters(): Promise<any[]> {
        const response = await fetch('https://swapi.dev/api/people/');
        const data = await response.json();

        return data.results.map((character: any) => ({
            name: character.name,
            description: `From Star Wars Universe`,
            // Note: SWAPI doesn't provide images
        }));
    }

    private async fetchMovies(): Promise<any[]> {
        // Using TMDB API (you'll need to add your API key to env variables)
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const data = await response.json();

        return data.results.map((movie: any) => ({
            name: movie.title,
            description: movie.overview.substring(0, 100) + '...',
            image: `https://image.tmdb.org/t/p/w200${movie.poster_path}`
        }));
    }

    private async fetchAnimeCharacters(): Promise<any[]> {
        // Using Jikan API (unofficial MyAnimeList API)
        const response = await fetch('https://api.jikan.moe/v4/top/characters');
        const data = await response.json();

        return data.data.map((character: any) => ({
            name: character.name,
            description: character.about?.substring(0, 100) + '...',
            image: character.images.jpg.image_url
        }));
    }
}