<div align="center">
  <img src="https://raw.githubusercontent.com/rif-x43/Mintab/main/brandings/svg/appicon_black.svg#gh-light-mode-only" alt="Mintab icon" width="96" />
  <img src="https://raw.githubusercontent.com/rif-x43/Mintab/main/brandings/svg/appicon_white.svg#gh-dark-mode-only" alt="Mintab icon" width="96" />

  <h1>Mintab</h1>

  <p><strong>Open to simplicity.</strong></p>
  <p>A calm, customizable new-tab experience for Chrome and Chromium-based browsers.</p>

  <p>
    <a href="https://github.com/rif-x43/Mintab/releases/tag/v1.0.0"><img src="https://img.shields.io/github/v/release/rif-x43/Mintab?style=flat-square&color=111111" alt="Latest release" /></a>
    <a href="https://github.com/rif-x43/Mintab/issues"><img src="https://img.shields.io/github/issues/rif-x43/Mintab?style=flat-square&color=111111" alt="Open issues" /></a>
    <a href="https://github.com/rif-x43/Mintab/blob/main/mintab/public/manifest.json"><img src="https://img.shields.io/badge/Manifest-V3-111111?style=flat-square" alt="Manifest V3" /></a>
    <a href="https://github.com/rif-x43/Mintab/releases/tag/v1.0.0"><img src="https://img.shields.io/badge/status-v1.0.0-111111?style=flat-square" alt="Version 1.0.0" /></a>
  </p>
</div>

<br />

<p align="center">
  <img src="https://raw.githubusercontent.com/rif-x43/Mintab/main/mintab/src/assets/hero.png" alt="Mintab new tab preview" width="900" />
</p>

## Why Mintab?

Your new tab should help you arrive, not distract you.

Mintab replaces the default new-tab page with a focused, beautifully restrained workspace for the things you check every day: the time, the weather, your bookmarks, your calendar, and the tasks you do not want to forget.

It is intentionally minimal, fully customizable, and local-first by design.

## Highlights

- **A quiet home screen** — a large live clock, optional date, and a clean visual hierarchy.
- **Weather at a glance** — current conditions, temperature, and location powered by Open-Meteo, with automatic or curated city locations.
- **Bookmarks without the clutter** — browse Chrome bookmark folders directly from your new tab, with expandable folder navigation.
- **A useful sidebar** — place the calendar and task list on the left or right, or hide the sidebar entirely.
- **Tasks with deadlines** — add tasks, mark them complete, remove completed items, and set dates and times with the built-in picker.
- **Light, dark, or system theme** — match your device or choose a mode manually.
- **Your background, your mood** — upload a personal background image and tune the shade overlay for readable content.
- **Portable settings** — export and import your Mintab configuration as JSON.
- **No account required** — no Mintab server, analytics, or tracking.

## Screenshots

> Add your polished product captures to `docs/screenshots/` and replace the placeholder paths below. Keeping screenshots in the repository makes the README feel alive and gives future contributors a visual contract for the interface.

<table>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/overview.png" alt="Mintab overview placeholder" />
      <p align="center"><sub><strong>Overview</strong> · clock, weather, bookmarks, and a focused canvas</sub></p>
    </td>
    <td width="50%">
      <img src="docs/screenshots/sidebar.png" alt="Mintab sidebar placeholder" />
      <p align="center"><sub><strong>Sidebar</strong> · calendar and tasks, positioned where you want them</sub></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/settings.png" alt="Mintab settings placeholder" />
      <p align="center"><sub><strong>Settings</strong> · general, appearance, sidebar, backup, and about</sub></p>
    </td>
    <td width="50%">
      <img src="docs/screenshots/custom-background.png" alt="Mintab custom background placeholder" />
      <p align="center"><sub><strong>Personalized</strong> · custom backgrounds with adjustable contrast</sub></p>
    </td>
  </tr>
</table>

## Install the latest release

Mintab is currently distributed as an unpacked browser extension. The fastest way to try it is the packaged `v1.0.0` release.

1. Download **[`Mintab.v1.0.0.zip`](https://github.com/rif-x43/Mintab/releases/download/v1.0.0/Mintab.v1.0.0.zip)** from the [latest release](https://github.com/rif-x43/Mintab/releases/tag/v1.0.0).
2. Extract the archive to a permanent folder. Do not delete or move this folder after installation.
3. Open `chrome://extensions` in Chrome, or the equivalent extensions page in your Chromium-based browser.
4. Enable **Developer mode**.
5. Select **Load unpacked** and choose the extracted extension folder.
6. Open a new tab and make Mintab yours.

Mintab also works with Chromium-based browsers such as Microsoft Edge, Brave, and Opera.

> Because this is an unpacked extension, your browser may display a developer-mode warning after restarting. Dismiss the warning to keep using Mintab.

## Build from source

### Requirements

- Node.js and npm
- A Chromium-based browser with Manifest V3 support

### Development

```bash
git clone https://github.com/rif-x43/Mintab.git
cd Mintab/mintab
npm install
npm run dev
```

### Production build

```bash
npm run lint
npm run build
```

The production extension is generated in `mintab/dist/`. To install your local build, return to `chrome://extensions`, choose **Load unpacked**, and select the `dist/` folder.

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server with HMR. |
| `npm run build` | Create the production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint across the project. |

## Privacy by design

Mintab stores settings, tasks, and uploaded background images locally in the browser using persisted client-side state. It does not require an account and does not send data to a Mintab backend.

When weather is enabled:

- **Open-Meteo** receives the selected coordinates to return current weather data.
- **Nominatim / OpenStreetMap** may receive device coordinates to resolve an automatic location label.
- If you choose a curated city, Mintab uses that city's built-in coordinates instead of requesting your location.

Mintab requests only the browser capabilities it needs for its core experience: bookmarks, local storage, and optional geolocation.

## Project structure

```text
Mintab/
├── brandings/              Brand icons and wordmarks
├── mintab/
│   ├── public/              Manifest V3 metadata and extension icons
│   ├── src/
│   │   ├── components/      Clock, weather, bookmarks, sidebar, and settings UI
│   │   ├── hooks/           Theme behavior
│   │   ├── store/           Persisted user preferences via Zustand
│   │   ├── utils/           Date formatting helpers
│   │   ├── App.jsx          Main new-tab composition
│   │   └── main.jsx         React entry point
│   ├── index.html           Vite document shell
│   ├── package.json         Scripts and dependencies
│   └── vite.config.js       React, Tailwind, and production build configuration
└── README.md
```

## Tech stack

- **React 19** for the interface
- **Vite** for development and production builds
- **Tailwind CSS 4** for the visual system
- **Zustand** for persisted settings
- **Lucide React** for lightweight interface icons
- **Chrome Extension Manifest V3** for new-tab replacement and bookmark access

## Release

### v1.0.0 · Open to Simplicity

The first public Mintab release includes:

- Clock and date customization with 12-hour / 24-hour formats
- Weather in Celsius or Fahrenheit
- Automatic location or selectable cities
- Chrome bookmark folders and expandable navigation
- Calendar and task widgets
- Light, dark, and system themes
- Custom background uploads with adjustable shade
- Settings backup and restore
- Explicit **Save Changes** and **Reset to Default** controls

See the full [v1.0.0 release notes](https://github.com/rif-x43/Mintab/releases/tag/v1.0.0).

## Contributing

Ideas, bug reports, visual feedback, and thoughtful pull requests are welcome.

1. Open an [issue](https://github.com/rif-x43/Mintab/issues) to describe a bug or proposal.
2. Fork the repository and create a focused branch.
3. Run `npm run lint` and `npm run build` before opening a pull request.
4. Include screenshots or a short recording for visual changes.

## Roadmap

Mintab is young and intentionally focused. Possible future improvements include:

- Chrome Web Store distribution
- More layout and typography controls
- Additional widget options
- Stronger responsive behavior across window sizes
- More polished onboarding and first-run defaults

## License

No license has been published yet. Until a license is added to the repository, all rights are reserved by the project owner.

---

<div align="center">
  <sub>Made for calmer tabs, clearer mornings, and fewer distractions.</sub>
</div>
