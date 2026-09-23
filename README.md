<p align="center">
  <img src="https://raw.githubusercontent.com/Artiscow/Urd/main/docs/brand/urd-logo-turkis.svg" alt="Urd" width="180">
</p>

<p align="center">
  <strong>🇬🇧 English</strong> ·
  <a href="readme/README-nb.md">🇳🇴 Bokmål</a> ·
  <a href="readme/README-tr.md">🇹🇷 Türkçe</a>
</p>

<p align="center">
  <a href="https://github.com/Artiscow/Urd/blob/main/docs/languages/setup-publication/SETUP-en-GB.md"><strong>Setup guide</strong></a> ·
  <a href="https://github.com/Artiscow/Urd/blob/main/docs/languages/user-guide/GUIDE-en-GB.md"><strong>User guide</strong></a> ·
  <a href="https://github.com/Artiscow/Urd"><strong>Main repository</strong></a>
</p>

# Urd

This repository IS your website: a dependency-free, static site where `/admin` is the visual editor. No build step, no npm - what lives here is what gets served.

## Getting started

1. **Create your own repository** from this template ("Use this template" on GitHub).
2. **Connect the repository to a host** (Cloudflare Pages recommended) and set up publishing: follow the [setup guide](https://github.com/Artiscow/Urd/blob/main/docs/languages/setup-publication/SETUP-en-GB.md).
3. **Open `/admin`** on the deployed site and sign in with GitHub: the setup wizard helps you with name and colours, and everything you publish is committed to your own repository.

Local preview without a host: run a static server from this folder (for example `python3 -m http.server`) and open `http://localhost:8000/`. Publishing needs the host functions, but the editor and the preview work locally.

## Updating Urd

Open the **Updates** panel in the admin: it checks against the template repository, shows what will change (hand-edited files are flagged), and writes the new version as one combined commit. `_headers` is never updated automatically; the panel shows what to copy in by hand if needed.

## Content and structure

- `content/` is your content (pages, theme, collections) - everything the admin writes lives here and in `media/`.
- `plugins/` holds extensions: drop in a plugin folder and enable it in the Plugins panel. See [plugins/README.md](plugins/README.md); more can be found via the GitHub topic `urd-plugin`.
- `assets/engine/` and `admin/` are Urd itself and are maintained by the Updates panel; do not edit them by hand.

## Documentation

[User guide](https://github.com/Artiscow/Urd/blob/main/docs/languages/user-guide/GUIDE-en-GB.md) and full documentation in the [main repository](https://github.com/Artiscow/Urd), with translations under [docs/languages/](https://github.com/Artiscow/Urd/tree/main/docs/languages).
