import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, requestUrl } from 'obsidian';

// Trakt API interfaces
interface TraktShow {
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
	genres?: string[];
	status?: string;
	network?: string;
}

interface TraktMovie {
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
	genres?: string[];
	released?: string;
}

interface TraktSearchResult {
	type: 'show' | 'movie';
	score: number;
	show?: TraktShow;
	movie?: TraktMovie;
}

interface TraktIntegrationSettings {
	apiKey: string;
	username: string;
	accessToken: string;
}

const DEFAULT_SETTINGS: TraktIntegrationSettings = {
	apiKey: '',
	username: '',
	accessToken: ''
};

export default class TraktIntegrationPlugin extends Plugin {
	settings: TraktIntegrationSettings;

	async onload() {
		await this.loadSettings();

		// Add ribbon icon for quick access
		const ribbonIconEl = this.addRibbonIcon('tv', 'Trakt Integration', (evt: MouseEvent) => {
			new TraktSearchModal(this.app, this).open();
		});
		ribbonIconEl.addClass('trakt-integration-ribbon-class');

		// Add commands
		this.addCommand({
			id: 'search-trakt',
			name: 'Search Trakt',
			callback: () => {
				new TraktSearchModal(this.app, this).open();
			}
		});

		this.addCommand({
			id: 'add-to-watchlist',
			name: 'Add current note to Trakt watchlist',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.addCurrentNoteToWatchlist(view);
			}
		});

		this.addCommand({
			id: 'mark-as-watched',
			name: 'Mark current note as watched on Trakt',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.markCurrentNoteAsWatched(view);
			}
		});

		// Add settings tab
		this.addSettingTab(new TraktSettingTab(this.app, this));
	}

	onunload() {
		// Cleanup if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Trakt API methods
	async searchTrakt(query: string): Promise<TraktSearchResult[]> {
		if (!this.settings.apiKey) {
			new Notice('Please configure your Trakt API key in settings');
			return [];
		}

		try {
			const response = await requestUrl({
				url: `https://api.trakt.tv/search/show,movie?query=${encodeURIComponent(query)}`,
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'trakt-api-version': '2',
					'trakt-api-key': this.settings.apiKey
				}
			});

			return response.json || [];
		} catch (error) {
			console.error('Error searching Trakt:', error);
			new Notice('Error searching Trakt API');
			return [];
		}
	}

	async addToWatchlist(type: 'shows' | 'movies', item: TraktShow | TraktMovie): Promise<boolean> {
		if (!this.settings.accessToken) {
			new Notice('Please authenticate with Trakt in settings');
			return false;
		}

		try {
			const payload = {
				[type]: [item]
			};

			const response = await requestUrl({
				url: 'https://api.trakt.tv/sync/watchlist',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'trakt-api-version': '2',
					'trakt-api-key': this.settings.apiKey,
					'Authorization': `Bearer ${this.settings.accessToken}`
				},
				body: JSON.stringify(payload)
			});

			if (response.status === 201) {
				new Notice(`Added to watchlist: ${item.title}`);
				return true;
			}
		} catch (error) {
			console.error('Error adding to watchlist:', error);
			new Notice('Error adding to Trakt watchlist');
		}
		return false;
	}

	async markAsWatched(type: 'shows' | 'movies', item: TraktShow | TraktMovie): Promise<boolean> {
		if (!this.settings.accessToken) {
			new Notice('Please authenticate with Trakt in settings');
			return false;
		}

		try {
			const payload = {
				[type]: [item]
			};

			const response = await requestUrl({
				url: 'https://api.trakt.tv/sync/history',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'trakt-api-version': '2',
					'trakt-api-key': this.settings.apiKey,
					'Authorization': `Bearer ${this.settings.accessToken}`
				},
				body: JSON.stringify(payload)
			});

			if (response.status === 201) {
				new Notice(`Marked as watched: ${item.title}`);
				return true;
			}
		} catch (error) {
			console.error('Error marking as watched:', error);
			new Notice('Error marking as watched on Trakt');
		}
		return false;
	}

	async addCurrentNoteToWatchlist(view: MarkdownView) {
		const file = view.file;
		if (!file) return;

		const title = file.basename;
		const results = await this.searchTrakt(title);
		
		if (results.length > 0) {
			const result = results[0];
			if (result.show) {
				await this.addToWatchlist('shows', result.show);
			} else if (result.movie) {
				await this.addToWatchlist('movies', result.movie);
			}
		} else {
			new Notice(`No Trakt results found for: ${title}`);
		}
	}

	async markCurrentNoteAsWatched(view: MarkdownView) {
		const file = view.file;
		if (!file) return;

		const title = file.basename;
		const results = await this.searchTrakt(title);
		
		if (results.length > 0) {
			const result = results[0];
			if (result.show) {
				await this.markAsWatched('shows', result.show);
			} else if (result.movie) {
				await this.markAsWatched('movies', result.movie);
			}
		} else {
			new Notice(`No Trakt results found for: ${title}`);
		}
	}

	async insertTraktData(editor: Editor, item: TraktShow | TraktMovie, type: 'show' | 'movie') {
		const content = this.formatTraktData(item, type);
		editor.replaceSelection(content);
	}

	private formatTraktData(item: TraktShow | TraktMovie, type: 'show' | 'movie'): string {
		let content = `# ${item.title} (${item.year})\n\n`;
		
		if (item.overview) {
			content += `## Overview\n${item.overview}\n\n`;
		}

		content += `## Trakt Information\n`;
		content += `- **Type**: ${type}\n`;
		content += `- **Year**: ${item.year}\n`;
		
		if (item.rating) {
			content += `- **Rating**: ${item.rating}/10\n`;
		}
		
		if (item.votes) {
			content += `- **Votes**: ${item.votes}\n`;
		}

		if (item.genres && item.genres.length > 0) {
			content += `- **Genres**: ${item.genres.join(', ')}\n`;
		}

		if (type === 'show' && (item as TraktShow).status) {
			content += `- **Status**: ${(item as TraktShow).status}\n`;
		}

		if (type === 'show' && (item as TraktShow).network) {
			content += `- **Network**: ${(item as TraktShow).network}\n`;
		}

		if (type === 'movie' && (item as TraktMovie).released) {
			content += `- **Released**: ${(item as TraktMovie).released}\n`;
		}

		content += `\n## Links\n`;
		content += `- [Trakt](https://trakt.tv/${type}s/${item.ids.slug})\n`;
		
		if (item.ids.imdb) {
			content += `- [IMDb](https://www.imdb.com/title/${item.ids.imdb})\n`;
		}

		return content;
	}
}

class TraktSearchModal extends Modal {
	plugin: TraktIntegrationPlugin;
	results: TraktSearchResult[] = [];

	constructor(app: App, plugin: TraktIntegrationPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Search Trakt' });

		// Search input
		const searchContainer = contentEl.createDiv();
		const searchInput = searchContainer.createEl('input', {
			type: 'text',
			placeholder: 'Search for shows and movies...'
		});
		searchInput.style.width = '100%';
		searchInput.style.marginBottom = '10px';

		// Search button
		const searchButton = searchContainer.createEl('button', { text: 'Search' });
		searchButton.style.marginLeft = '10px';

		// Results container
		const resultsContainer = contentEl.createDiv();

		const performSearch = async () => {
			const query = searchInput.value.trim();
			if (!query) return;

			searchButton.textContent = 'Searching...';
			searchButton.disabled = true;

			this.results = await this.plugin.searchTrakt(query);
			this.displayResults(resultsContainer);

			searchButton.textContent = 'Search';
			searchButton.disabled = false;
		};

		searchButton.addEventListener('click', performSearch);
		searchInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				performSearch();
			}
		});

		searchInput.focus();
	}

	displayResults(container: HTMLElement) {
		container.empty();

		if (this.results.length === 0) {
			container.createEl('p', { text: 'No results found' });
			return;
		}

		this.results.forEach((result, index) => {
			const item = result.show || result.movie;
			if (!item) return;

			const resultEl = container.createDiv({ cls: 'trakt-search-result' });
			resultEl.style.border = '1px solid var(--background-modifier-border)';
			resultEl.style.padding = '10px';
			resultEl.style.marginBottom = '10px';
			resultEl.style.borderRadius = '5px';

			const titleEl = resultEl.createEl('h3', { text: `${item.title} (${item.year})` });
			titleEl.style.margin = '0 0 5px 0';

			const typeEl = resultEl.createEl('p', { text: `Type: ${result.type}` });
			typeEl.style.margin = '0 0 5px 0';
			typeEl.style.fontSize = '0.9em';
			typeEl.style.color = 'var(--text-muted)';

			if (item.overview) {
				const overviewEl = resultEl.createEl('p', { text: item.overview });
				overviewEl.style.margin = '0 0 10px 0';
				overviewEl.style.fontSize = '0.9em';
			}

			// Action buttons
			const buttonContainer = resultEl.createDiv();
			buttonContainer.style.display = 'flex';
			buttonContainer.style.gap = '10px';

			const insertButton = buttonContainer.createEl('button', { text: 'Insert Data' });
			insertButton.addEventListener('click', () => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					this.plugin.insertTraktData(activeView.editor, item, result.type);
					this.close();
				}
			});

			const watchlistButton = buttonContainer.createEl('button', { text: 'Add to Watchlist' });
			watchlistButton.addEventListener('click', async () => {
				const type = result.type === 'show' ? 'shows' : 'movies';
				await this.plugin.addToWatchlist(type, item);
			});

			const watchedButton = buttonContainer.createEl('button', { text: 'Mark as Watched' });
			watchedButton.addEventListener('click', async () => {
				const type = result.type === 'show' ? 'shows' : 'movies';
				await this.plugin.markAsWatched(type, item);
			});
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class TraktSettingTab extends PluginSettingTab {
	plugin: TraktIntegrationPlugin;

	constructor(app: App, plugin: TraktIntegrationPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Trakt Integration Settings' });

		containerEl.createEl('p', {
			text: 'To use this plugin, you need to get an API key from Trakt.tv. Visit https://trakt.tv/oauth/applications to create an application and get your API key.'
		});

		new Setting(containerEl)
			.setName('Trakt API Key')
			.setDesc('Your Trakt API key (Client ID)')
			.addText(text => text
				.setPlaceholder('Enter your API key')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Trakt Username')
			.setDesc('Your Trakt username')
			.addText(text => text
				.setPlaceholder('Enter your username')
				.setValue(this.plugin.settings.username)
				.onChange(async (value) => {
					this.plugin.settings.username = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Access Token')
			.setDesc('OAuth access token for authenticated requests (optional, for watchlist features)')
			.addText(text => text
				.setPlaceholder('Enter your access token')
				.setValue(this.plugin.settings.accessToken)
				.onChange(async (value) => {
					this.plugin.settings.accessToken = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: 'Instructions' });
		
		const instructionsList = containerEl.createEl('ol');
		instructionsList.createEl('li', { text: 'Go to https://trakt.tv/oauth/applications and create a new application' });
		instructionsList.createEl('li', { text: 'Copy the Client ID and paste it as your API key above' });
		instructionsList.createEl('li', { text: 'For watchlist features, you\'ll need to implement OAuth flow to get an access token' });
		instructionsList.createEl('li', { text: 'Use the search command to find shows and movies from Trakt' });
		instructionsList.createEl('li', { text: 'Insert Trakt data into your notes or add items to your watchlist' });
	}
}