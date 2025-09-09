# Trakt Tracker - Obsidian Plugin

A powerful Obsidian plugin that integrates with [Trakt.tv](https://trakt.tv) to help you track and organize your movie and TV show viewing habits directly in your Obsidian vault.

## Features

- 🔍 **Search Movies & TV Shows**: Search Trakt's extensive database directly from Obsidian
- ✅ **Mark as Watched**: Track what you've watched and sync with your Trakt account
- 📝 **Auto-generate Notes**: Automatically create detailed notes for movies and shows
- 📋 **Watchlist Sync**: Sync your Trakt watchlist to Obsidian notes
- 🔄 **Watched History Sync**: Import your watched history from Trakt
- ⚙️ **Customizable**: Configure what information to include in your notes
- 🎬 **Rich Metadata**: Include ratings, genres, cast, release dates, and more

## Installation

### From Obsidian Community Plugins (Recommended)
1. Open Obsidian Settings
2. Go to Community plugins and disable Safe mode
3. Click Browse and search for "Trakt Tracker"
4. Install and enable the plugin

### Manual Installation
1. Download the latest release from the [releases page](https://github.com/Nielsvisser511/Nielsvisser511.github.io/releases)
2. Extract the files to your vault's `.obsidian/plugins/trakt-tracker/` folder
3. Reload Obsidian and enable the plugin in settings

### For Developers
```bash
git clone https://github.com/Nielsvisser511/Nielsvisser511.github.io.git
cd Nielsvisser511.github.io
npm install
npm run build
```

## Setup

### 1. Get Trakt API Credentials
1. Go to [Trakt API Applications](https://trakt.tv/oauth/applications)
2. Create a new application with these settings:
   - **Name**: Obsidian Trakt Tracker (or any name you prefer)
   - **Description**: Personal use for Obsidian plugin
   - **Redirect URI**: `urn:ietf:wg:oauth:2.0:oob`
   - **Permissions**: Check all permissions you want to use
3. Copy your **Client ID** and **Client Secret**

### 2. Configure the Plugin
1. Open Obsidian Settings → Community plugins → Trakt Tracker
2. Enter your **Client ID** and **Client Secret**
3. Click **Authenticate** to connect your Trakt account
4. Configure your note preferences (folder, auto-creation, metadata inclusion)

## Usage

### Search and Track
- Use the **ribbon icon** (🎬) or **Command Palette** → "Trakt Tracker: Search Trakt"
- Search for any movie or TV show
- Choose from the search results
- Select an action:
  - **Mark as Watched**: Adds to your Trakt watched history
  - **Add to Watchlist**: Adds to your Trakt watchlist
  - **Create Note**: Creates a note without syncing to Trakt

### Sync Your Data
- **Command Palette** → "Trakt Tracker: Sync Watchlist" - Import your Trakt watchlist
- **Command Palette** → "Trakt Tracker: Sync Watched Items" - Import your watched history

### Note Structure
Generated notes include:
- Title and year
- Overview/synopsis
- Ratings and vote counts (optional)
- Genres (optional)
- Runtime/episode count
- Release dates
- Cast information (optional)
- Links to external resources (IMDB, trailers)
- Custom notes section for your thoughts

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Client ID** | Your Trakt API client ID | - |
| **Client Secret** | Your Trakt API client secret | - |
| **Notes Folder** | Folder where notes will be created | `Trakt` |
| **Auto-create Notes** | Automatically create notes when syncing | `true` |
| **Include Ratings** | Include ratings and vote counts | `true` |
| **Include Genres** | Include genre information | `true` |
| **Include Posters** | Include movie/show posters | `true` |
| **Include Cast** | Include cast information | `true` |

## Commands

| Command | Description |
|---------|-------------|
| `Trakt Tracker: Search Trakt` | Open search modal |
| `Trakt Tracker: Sync Watchlist` | Import watchlist from Trakt |
| `Trakt Tracker: Sync Watched Items` | Import watched history from Trakt |

## Privacy & Data

- Your Trakt credentials are stored locally in Obsidian
- The plugin only communicates with Trakt's official API
- No data is sent to third parties
- All notes are created locally in your vault

## Troubleshooting

### Authentication Issues
- Make sure your Client ID and Client Secret are correct
- Ensure your Trakt application settings include the correct redirect URI: `urn:ietf:wg:oauth:2.0:oob`
- Try disconnecting and reconnecting your account

### Sync Issues
- Check your internet connection
- Verify your Trakt account has content in watchlist/watched history
- Check the Obsidian console for error messages

### Note Creation Issues
- Ensure the notes folder exists and is writable
- Check that you have sufficient disk space
- Verify file naming doesn't conflict with existing files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

If you encounter any issues or have feature requests:
1. Check the [Issues page](https://github.com/Nielsvisser511/Nielsvisser511.github.io/issues)
2. Create a new issue with detailed information about the problem
3. Include your Obsidian version and plugin version

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Trakt.tv](https://trakt.tv) for providing the excellent API
- [Obsidian](https://obsidian.md) for the amazing platform
- The Obsidian plugin development community

---

**Made with ❤️ for the Obsidian community**