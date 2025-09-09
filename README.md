# Trakt Integration for Obsidian

An Obsidian plugin that integrates with Trakt.tv to help you track and manage your TV shows and movies directly from your notes.

## Features

- **Search Trakt Database**: Search for TV shows and movies from the extensive Trakt.tv database
- **Insert Trakt Data**: Add detailed information about shows/movies to your notes including overview, ratings, genres, and more
- **Watchlist Integration**: Add items to your Trakt watchlist directly from Obsidian
- **Watch History**: Mark shows/movies as watched on Trakt
- **Note Integration**: Automatically detect show/movie names from note titles and perform Trakt actions

## Installation

### Manual Installation
1. Download the latest release from the releases page
2. Extract the files to your vault's plugins folder: `VaultFolder/.obsidian/plugins/trakt-integration/`
3. Reload Obsidian and enable the plugin in Settings → Community Plugins

### For Development
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Copy `main.js`, `manifest.json`, and `styles.css` to your vault's plugins folder

## Setup

1. **Get Trakt API Key**:
   - Visit [Trakt.tv API Applications](https://trakt.tv/oauth/applications)
   - Create a new application
   - Copy the Client ID (this is your API key)

2. **Configure Plugin**:
   - Go to Settings → Community Plugins → Trakt Integration
   - Enter your API key (Client ID)
   - Enter your Trakt username
   - (Optional) Add access token for watchlist features

## Usage

### Commands
- **Search Trakt**: Open the search modal to find shows and movies
- **Add to Watchlist**: Add the current note to your Trakt watchlist
- **Mark as Watched**: Mark the current note as watched on Trakt

### Search and Insert Data
1. Use the command palette (Ctrl/Cmd + P) and search for "Search Trakt"
2. Enter the name of a show or movie
3. Browse the results and click "Insert Data" to add information to your note
4. Use "Add to Watchlist" or "Mark as Watched" for quick Trakt actions

### Automatic Note Integration
- Name your notes after shows or movies
- Use the "Add to Watchlist" or "Mark as Watched" commands to automatically detect and process the content

## API Requirements

This plugin requires:
- A Trakt.tv account
- A Trakt API key (free)
- For watchlist features: OAuth access token (requires manual setup)

## Data Format

When inserting Trakt data, the plugin creates structured notes with:
- Title and year
- Overview/synopsis
- Ratings and vote counts
- Genres
- Status information (for shows)
- Release dates (for movies)
- Direct links to Trakt and IMDb

## Privacy

This plugin:
- Only communicates with Trakt.tv API
- Stores API credentials locally in Obsidian
- Does not collect or transmit personal data
- Requires explicit user action for all API calls

## Support

For issues, feature requests, or questions:
- [GitHub Issues](https://github.com/Nielsvisser511/Nielsvisser511.github.io/issues)
- [Trakt.tv API Documentation](https://trakt.docs.apiary.io/)

## License

MIT License - see LICENSE file for details.