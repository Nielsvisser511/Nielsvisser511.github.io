export interface TraktSettings {
	clientId: string;
	clientSecret: string;
	accessToken: string;
	refreshToken: string;
	username: string;
	notesFolder: string;
	autoCreateNotes: boolean;
	includePosters: boolean;
	includeRatings: boolean;
	includeGenres: boolean;
	includeCast: boolean;
}

export const DEFAULT_SETTINGS: TraktSettings = {
	clientId: '',
	clientSecret: '',
	accessToken: '',
	refreshToken: '',
	username: '',
	notesFolder: 'Trakt',
	autoCreateNotes: true,
	includePosters: true,
	includeRatings: true,
	includeGenres: true,
	includeCast: true,
};

export interface TraktMovie {
	title: string;
	year: number;
	ids: {
		trakt: number;
		slug: string;
		imdb: string;
		tmdb: number;
	};
	overview?: string;
	rating?: number;
	votes?: number;
	runtime?: number;
	genres?: string[];
	certification?: string;
	released?: string;
	trailer?: string;
	homepage?: string;
	language?: string;
}

export interface TraktShow {
	title: string;
	year: number;
	ids: {
		trakt: number;
		slug: string;
		imdb: string;
		tmdb: number;
		tvdb: number;
	};
	overview?: string;
	first_aired?: string;
	airs?: {
		day: string;
		time: string;
		timezone: string;
	};
	runtime?: number;
	certification?: string;
	network?: string;
	country?: string;
	trailer?: string;
	homepage?: string;
	status?: string;
	rating?: number;
	votes?: number;
	genres?: string[];
	aired_episodes?: number;
}

export interface TraktEpisode {
	season: number;
	number: number;
	title: string;
	ids: {
		trakt: number;
		tvdb: number;
		imdb: string;
		tmdb: number;
	};
	overview?: string;
	rating?: number;
	votes?: number;
	first_aired?: string;
	runtime?: number;
}

export interface TraktSearchResult {
	type: 'movie' | 'show' | 'episode' | 'person';
	score: number;
	movie?: TraktMovie;
	show?: TraktShow;
	episode?: TraktEpisode;
}

export interface TraktWatchedItem {
	plays: number;
	last_watched_at: string;
	last_updated_at: string;
	movie?: TraktMovie;
	show?: TraktShow;
	seasons?: Array<{
		number: number;
		episodes: Array<{
			number: number;
			plays: number;
			last_watched_at: string;
		}>;
	}>;
}

export interface TraktWatchlistItem {
	rank: number;
	listed_at: string;
	type: 'movie' | 'show' | 'season' | 'episode';
	movie?: TraktMovie;
	show?: TraktShow;
}