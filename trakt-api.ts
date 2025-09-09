import { requestUrl, RequestUrlParam } from 'obsidian';
import {
	TraktSettings,
	TraktMovie,
	TraktShow,
	TraktSearchResult,
	TraktWatchedItem,
	TraktWatchlistItem
} from './types';

export class TraktAPI {
	private settings: TraktSettings;
	private baseURL = 'https://api.trakt.tv';

	constructor(settings: TraktSettings) {
		this.settings = settings;
	}

	updateSettings(settings: TraktSettings) {
		this.settings = settings;
	}

	private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
		if (!this.settings.clientId) {
			throw new Error('Trakt API client ID not configured');
		}

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			'trakt-api-version': '2',
			'trakt-api-key': this.settings.clientId
		};

		if (this.settings.accessToken) {
			headers['Authorization'] = `Bearer ${this.settings.accessToken}`;
		}

		const params: RequestUrlParam = {
			url: `${this.baseURL}${endpoint}`,
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined,
		};

		try {
			const response = await requestUrl(params);
			return response.json;
		} catch (error) {
			console.error('Trakt API error:', error);
			throw error;
		}
	}

	async search(query: string, type?: 'movie' | 'show'): Promise<TraktSearchResult[]> {
		const typeParam = type ? `&type=${type}` : '';
		const endpoint = `/search/movie,show?query=${encodeURIComponent(query)}${typeParam}`;
		return await this.makeRequest(endpoint);
	}

	async getWatchedMovies(): Promise<TraktWatchedItem[]> {
		if (!this.settings.accessToken) {
			throw new Error('Authentication required for watched movies');
		}
		return await this.makeRequest('/sync/watched/movies');
	}

	async getWatchedShows(): Promise<TraktWatchedItem[]> {
		if (!this.settings.accessToken) {
			throw new Error('Authentication required for watched shows');
		}
		return await this.makeRequest('/sync/watched/shows');
	}

	async getWatchlist(): Promise<TraktWatchlistItem[]> {
		if (!this.settings.accessToken) {
			throw new Error('Authentication required for watchlist');
		}
		return await this.makeRequest('/sync/watchlist');
	}

	async markAsWatched(item: TraktMovie | TraktShow, type: 'movie' | 'show'): Promise<void> {
		if (!this.settings.accessToken) {
			throw new Error('Authentication required to mark as watched');
		}

		const body = {
			[type === 'movie' ? 'movies' : 'shows']: [{
				ids: item.ids,
				watched_at: new Date().toISOString()
			}]
		};

		await this.makeRequest('/sync/history', 'POST', body);
	}

	async addToWatchlist(item: TraktMovie | TraktShow, type: 'movie' | 'show'): Promise<void> {
		if (!this.settings.accessToken) {
			throw new Error('Authentication required to add to watchlist');
		}

		const body = {
			[type === 'movie' ? 'movies' : 'shows']: [{
				ids: item.ids
			}]
		};

		await this.makeRequest('/sync/watchlist', 'POST', body);
	}

	async removeFromWatchlist(item: TraktMovie | TraktShow, type: 'movie' | 'show'): Promise<void> {
		if (!this.settings.accessToken) {
			throw new Error('Authentication required to remove from watchlist');
		}

		const body = {
			[type === 'movie' ? 'movies' : 'shows']: [{
				ids: item.ids
			}]
		};

		await this.makeRequest('/sync/watchlist/remove', 'POST', body);
	}

	async getMovieDetails(id: string): Promise<TraktMovie> {
		return await this.makeRequest(`/movies/${id}?extended=full`);
	}

	async getShowDetails(id: string): Promise<TraktShow> {
		return await this.makeRequest(`/shows/${id}?extended=full`);
	}

	// OAuth flow methods
	generateAuthURL(): string {
		if (!this.settings.clientId) {
			throw new Error('Client ID required for authentication');
		}
		
		const params = new URLSearchParams({
			response_type: 'code',
			client_id: this.settings.clientId,
			redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
		});

		return `https://trakt.tv/oauth/authorize?${params.toString()}`;
	}

	async exchangeCodeForToken(code: string): Promise<{ access_token: string; refresh_token: string }> {
		const body = {
			code,
			client_id: this.settings.clientId,
			client_secret: this.settings.clientSecret,
			redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
			grant_type: 'authorization_code'
		};

		const params: RequestUrlParam = {
			url: 'https://api.trakt.tv/oauth/token',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		};

		const response = await requestUrl(params);
		return response.json;
	}

	async refreshAccessToken(): Promise<{ access_token: string; refresh_token: string }> {
		if (!this.settings.refreshToken) {
			throw new Error('Refresh token required');
		}

		const body = {
			refresh_token: this.settings.refreshToken,
			client_id: this.settings.clientId,
			client_secret: this.settings.clientSecret,
			redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
			grant_type: 'refresh_token'
		};

		const params: RequestUrlParam = {
			url: 'https://api.trakt.tv/oauth/token',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		};

		const response = await requestUrl(params);
		return response.json;
	}
}