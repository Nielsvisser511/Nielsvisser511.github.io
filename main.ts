import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	Modal,
	SuggestModal,
	Notice,
	TFile,
	normalizePath
} from 'obsidian';

import { TraktAPI } from './trakt-api';
import { TraktSettings, DEFAULT_SETTINGS, TraktSearchResult, TraktMovie, TraktShow } from './types';

export default class TraktTrackerPlugin extends Plugin {
	settings: TraktSettings;
	traktAPI: TraktAPI;

	async onload() {
		await this.loadSettings();
		this.traktAPI = new TraktAPI(this.settings);

		// Add ribbon icon
		this.addRibbonIcon('film', 'Trakt Tracker', () => {
			new TraktSearchModal(this.app, this).open();
		});

		// Add commands
		this.addCommand({
			id: 'search-trakt',
			name: 'Search Trakt',
			callback: () => {
				new TraktSearchModal(this.app, this).open();
			}
		});

		this.addCommand({
			id: 'sync-watchlist',
			name: 'Sync Watchlist',
			callback: () => {
				this.syncWatchlist();
			}
		});

		this.addCommand({
			id: 'sync-watched',
			name: 'Sync Watched Items',
			callback: () => {
				this.syncWatched();
			}
		});

		// Add settings tab
		this.addSettingTab(new TraktSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.traktAPI.updateSettings(this.settings);
	}

	async syncWatchlist() {
		if (!this.settings.accessToken) {
			new Notice('Please authenticate with Trakt first');
			return;
		}

		try {
			const watchlist = await this.traktAPI.getWatchlist();
			new Notice(`Found ${watchlist.length} items in watchlist`);
			
			for (const item of watchlist) {
				if (this.settings.autoCreateNotes) {
					if (item.movie) {
						await this.createMovieNote(item.movie);
					} else if (item.show) {
						await this.createShowNote(item.show);
					}
				}
			}
		} catch (error) {
			new Notice(`Error syncing watchlist: ${error.message}`);
		}
	}

	async syncWatched() {
		if (!this.settings.accessToken) {
			new Notice('Please authenticate with Trakt first');
			return;
		}

		try {
			const [watchedMovies, watchedShows] = await Promise.all([
				this.traktAPI.getWatchedMovies(),
				this.traktAPI.getWatchedShows()
			]);

			new Notice(`Found ${watchedMovies.length} watched movies and ${watchedShows.length} watched shows`);

			if (this.settings.autoCreateNotes) {
				for (const item of watchedMovies) {
					if (item.movie) {
						await this.createMovieNote(item.movie, true);
					}
				}

				for (const item of watchedShows) {
					if (item.show) {
						await this.createShowNote(item.show, true);
					}
				}
			}
		} catch (error) {
			new Notice(`Error syncing watched items: ${error.message}`);
		}
	}

	async createMovieNote(movie: TraktMovie, watched: boolean = false): Promise<void> {
		const folderPath = this.settings.notesFolder;
		const fileName = `${movie.title} (${movie.year}).md`;
		const filePath = normalizePath(`${folderPath}/${fileName}`);

		// Ensure folder exists
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!folder) {
			await this.app.vault.createFolder(folderPath);
		}

		// Check if file already exists
		const existingFile = this.app.vault.getAbstractFileByPath(filePath);
		if (existingFile) {
			return; // Don't overwrite existing notes
		}

		let content = `# ${movie.title} (${movie.year})\n\n`;
		content += `**Type:** Movie\n`;
		content += `**Status:** ${watched ? 'Watched' : 'In Watchlist'}\n`;
		
		if (movie.overview) {
			content += `**Overview:** ${movie.overview}\n\n`;
		}

		if (this.settings.includeRatings && movie.rating) {
			content += `**Rating:** ${movie.rating}/10 (${movie.votes} votes)\n`;
		}

		if (movie.runtime) {
			content += `**Runtime:** ${movie.runtime} minutes\n`;
		}

		if (this.settings.includeGenres && movie.genres && movie.genres.length > 0) {
			content += `**Genres:** ${movie.genres.join(', ')}\n`;
		}

		if (movie.released) {
			content += `**Released:** ${movie.released}\n`;
		}

		if (movie.certification) {
			content += `**Certification:** ${movie.certification}\n`;
		}

		content += `\n**Trakt ID:** ${movie.ids.trakt}\n`;
		
		if (movie.ids.imdb) {
			content += `**IMDB:** https://www.imdb.com/title/${movie.ids.imdb}\n`;
		}

		if (movie.trailer) {
			content += `**Trailer:** ${movie.trailer}\n`;
		}

		content += `\n## Notes\n\n`;

		try {
			await this.app.vault.create(filePath, content);
		} catch (error) {
			console.error('Error creating movie note:', error);
		}
	}

	async createShowNote(show: TraktShow, watched: boolean = false): Promise<void> {
		const folderPath = this.settings.notesFolder;
		const fileName = `${show.title} (${show.year}).md`;
		const filePath = normalizePath(`${folderPath}/${fileName}`);

		// Ensure folder exists
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!folder) {
			await this.app.vault.createFolder(folderPath);
		}

		// Check if file already exists
		const existingFile = this.app.vault.getAbstractFileByPath(filePath);
		if (existingFile) {
			return; // Don't overwrite existing notes
		}

		let content = `# ${show.title} (${show.year})\n\n`;
		content += `**Type:** TV Show\n`;
		content += `**Status:** ${watched ? 'Watched' : 'In Watchlist'}\n`;
		
		if (show.overview) {
			content += `**Overview:** ${show.overview}\n\n`;
		}

		if (this.settings.includeRatings && show.rating) {
			content += `**Rating:** ${show.rating}/10 (${show.votes} votes)\n`;
		}

		if (show.status) {
			content += `**Status:** ${show.status}\n`;
		}

		if (show.network) {
			content += `**Network:** ${show.network}\n`;
		}

		if (show.aired_episodes) {
			content += `**Episodes:** ${show.aired_episodes}\n`;
		}

		if (show.runtime) {
			content += `**Runtime:** ${show.runtime} minutes per episode\n`;
		}

		if (this.settings.includeGenres && show.genres && show.genres.length > 0) {
			content += `**Genres:** ${show.genres.join(', ')}\n`;
		}

		if (show.first_aired) {
			content += `**First Aired:** ${show.first_aired}\n`;
		}

		if (show.certification) {
			content += `**Certification:** ${show.certification}\n`;
		}

		content += `\n**Trakt ID:** ${show.ids.trakt}\n`;
		
		if (show.ids.imdb) {
			content += `**IMDB:** https://www.imdb.com/title/${show.ids.imdb}\n`;
		}

		if (show.trailer) {
			content += `**Trailer:** ${show.trailer}\n`;
		}

		content += `\n## Notes\n\n`;

		try {
			await this.app.vault.create(filePath, content);
		} catch (error) {
			console.error('Error creating show note:', error);
		}
	}
}

class TraktSearchModal extends SuggestModal<TraktSearchResult> {
	plugin: TraktTrackerPlugin;

	constructor(app: App, plugin: TraktTrackerPlugin) {
		super(app);
		this.plugin = plugin;
		this.setPlaceholder('Search for movies and TV shows...');
	}

	async getSuggestions(query: string): Promise<TraktSearchResult[]> {
		if (query.length < 2) return [];

		try {
			const results = await this.plugin.traktAPI.search(query);
			return results.slice(0, 10); // Limit to top 10 results
		} catch (error) {
			new Notice(`Search error: ${error.message}`);
			return [];
		}
	}

	renderSuggestion(result: TraktSearchResult, el: HTMLElement) {
		el.createEl('div', { text: this.getDisplayTitle(result) });
		el.createEl('small', { text: this.getDisplaySubtitle(result) });
	}

	private getDisplayTitle(result: TraktSearchResult): string {
		if (result.movie) {
			return `${result.movie.title} (${result.movie.year})`;
		} else if (result.show) {
			return `${result.show.title} (${result.show.year})`;
		}
		return 'Unknown';
	}

	private getDisplaySubtitle(result: TraktSearchResult): string {
		const type = result.type.charAt(0).toUpperCase() + result.type.slice(1);
		if (result.movie && result.movie.overview) {
			return `${type} • ${result.movie.overview.substring(0, 100)}...`;
		} else if (result.show && result.show.overview) {
			return `${type} • ${result.show.overview.substring(0, 100)}...`;
		}
		return type;
	}

	async onChooseSuggestion(result: TraktSearchResult, evt: MouseEvent | KeyboardEvent) {
		new TraktItemModal(this.app, this.plugin, result).open();
	}
}

class TraktItemModal extends Modal {
	plugin: TraktTrackerPlugin;
	result: TraktSearchResult;

	constructor(app: App, plugin: TraktTrackerPlugin, result: TraktSearchResult) {
		super(app);
		this.plugin = plugin;
		this.result = result;
	}

	onOpen() {
		const { contentEl } = this;
		
		const item = this.result.movie || this.result.show;
		if (!item) return;

		contentEl.createEl('h2', { text: `${item.title} (${item.year})` });
		
		if ('overview' in item && item.overview) {
			contentEl.createEl('p', { text: item.overview });
		}

		const buttonContainer = contentEl.createEl('div', { cls: 'trakt-buttons' });
		
		// Mark as watched button
		const watchedBtn = buttonContainer.createEl('button', { text: 'Mark as Watched' });
		watchedBtn.onclick = async () => {
			try {
				await this.plugin.traktAPI.markAsWatched(item, this.result.type as 'movie' | 'show');
				new Notice(`Marked "${item.title}" as watched`);
				if (this.plugin.settings.autoCreateNotes) {
					if (this.result.movie) {
						await this.plugin.createMovieNote(this.result.movie, true);
					} else if (this.result.show) {
						await this.plugin.createShowNote(this.result.show, true);
					}
				}
				this.close();
			} catch (error) {
				new Notice(`Error: ${error.message}`);
			}
		};

		// Add to watchlist button
		const watchlistBtn = buttonContainer.createEl('button', { text: 'Add to Watchlist' });
		watchlistBtn.onclick = async () => {
			try {
				await this.plugin.traktAPI.addToWatchlist(item, this.result.type as 'movie' | 'show');
				new Notice(`Added "${item.title}" to watchlist`);
				if (this.plugin.settings.autoCreateNotes) {
					if (this.result.movie) {
						await this.plugin.createMovieNote(this.result.movie);
					} else if (this.result.show) {
						await this.plugin.createShowNote(this.result.show);
					}
				}
				this.close();
			} catch (error) {
				new Notice(`Error: ${error.message}`);
			}
		};

		// Create note button
		const noteBtn = buttonContainer.createEl('button', { text: 'Create Note' });
		noteBtn.onclick = async () => {
			try {
				if (this.result.movie) {
					await this.plugin.createMovieNote(this.result.movie);
				} else if (this.result.show) {
					await this.plugin.createShowNote(this.result.show);
				}
				new Notice(`Created note for "${item.title}"`);
				this.close();
			} catch (error) {
				new Notice(`Error creating note: ${error.message}`);
			}
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class TraktSettingTab extends PluginSettingTab {
	plugin: TraktTrackerPlugin;

	constructor(app: App, plugin: TraktTrackerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Trakt Tracker Settings' });

		new Setting(containerEl)
			.setName('Client ID')
			.setDesc('Your Trakt API client ID')
			.addText(text => text
				.setPlaceholder('Enter your client ID')
				.setValue(this.plugin.settings.clientId)
				.onChange(async (value) => {
					this.plugin.settings.clientId = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Client Secret')
			.setDesc('Your Trakt API client secret')
			.addText(text => text
				.setPlaceholder('Enter your client secret')
				.setValue(this.plugin.settings.clientSecret)
				.onChange(async (value) => {
					this.plugin.settings.clientSecret = value;
					await this.plugin.saveSettings();
				}));

		// Authentication section
		containerEl.createEl('h3', { text: 'Authentication' });

		if (!this.plugin.settings.accessToken) {
			const authButton = new Setting(containerEl)
				.setName('Authenticate with Trakt')
				.setDesc('Connect your Trakt account')
				.addButton(button => button
					.setButtonText('Authenticate')
					.onClick(() => {
						new TraktAuthModal(this.app, this.plugin).open();
					}));
		} else {
			new Setting(containerEl)
				.setName('Authentication Status')
				.setDesc('✅ Connected to Trakt')
				.addButton(button => button
					.setButtonText('Disconnect')
					.onClick(async () => {
						this.plugin.settings.accessToken = '';
						this.plugin.settings.refreshToken = '';
						this.plugin.settings.username = '';
						await this.plugin.saveSettings();
						this.display();
					}));
		}

		// Note settings
		containerEl.createEl('h3', { text: 'Note Settings' });

		new Setting(containerEl)
			.setName('Notes Folder')
			.setDesc('Folder where Trakt notes will be created')
			.addText(text => text
				.setPlaceholder('Trakt')
				.setValue(this.plugin.settings.notesFolder)
				.onChange(async (value) => {
					this.plugin.settings.notesFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto-create Notes')
			.setDesc('Automatically create notes when syncing watchlist/watched items')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoCreateNotes)
				.onChange(async (value) => {
					this.plugin.settings.autoCreateNotes = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include Ratings')
			.setDesc('Include ratings and vote counts in notes')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeRatings)
				.onChange(async (value) => {
					this.plugin.settings.includeRatings = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include Genres')
			.setDesc('Include genre information in notes')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeGenres)
				.onChange(async (value) => {
					this.plugin.settings.includeGenres = value;
					await this.plugin.saveSettings();
				}));
	}
}

class TraktAuthModal extends Modal {
	plugin: TraktTrackerPlugin;

	constructor(app: App, plugin: TraktTrackerPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		
		contentEl.createEl('h2', { text: 'Authenticate with Trakt' });
		
		if (!this.plugin.settings.clientId || !this.plugin.settings.clientSecret) {
			contentEl.createEl('p', { text: 'Please configure your Client ID and Client Secret first.' });
			return;
		}

		contentEl.createEl('p', { text: '1. Click the button below to open Trakt authorization page' });
		
		const authButton = contentEl.createEl('button', { text: 'Open Trakt Authorization' });
		authButton.onclick = () => {
			const authURL = this.plugin.traktAPI.generateAuthURL();
			window.open(authURL, '_blank');
		};

		contentEl.createEl('p', { text: '2. After authorization, copy the code and paste it below:' });

		const codeInput = contentEl.createEl('input', { type: 'text', placeholder: 'Enter authorization code' });
		
		const submitButton = contentEl.createEl('button', { text: 'Submit Code' });
		submitButton.onclick = async () => {
			const code = codeInput.value.trim();
			if (!code) return;

			try {
				const tokens = await this.plugin.traktAPI.exchangeCodeForToken(code);
				this.plugin.settings.accessToken = tokens.access_token;
				this.plugin.settings.refreshToken = tokens.refresh_token;
				await this.plugin.saveSettings();
				
				new Notice('Successfully authenticated with Trakt!');
				this.close();
			} catch (error) {
				new Notice(`Authentication failed: ${error.message}`);
			}
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}