# Web-OS Tarnished Edition

A browser-based desktop environment with an Elden Ring theme. Draggable windows, a working terminal, a file manager, and a few extra mechanics I added for fun (rune counter, stamina system). Built with plain HTML/CSS/JS, no frameworks.

[Live demo](https://kyoske2.github.io/WebOS/)

![screenshot](demo.gif)

## What's in it

- Draggable, resizable windows (minimize/maximize/close all work)
- Taskbar + Start menu
- 6 apps:
  - **Archive** – file manager with a small virtual file tree
  - **Mirror** – internal "browser" with a few static pages
  - **Quill** – basic text editor
  - **Incant** – terminal with a handful of commands (`ls`, `pwd`, `date`, `whoami`, `neofetch`, `help`)
  - **Compute** – calculator
  - **Status** – character sheet style panel (see below)
- Wallpaper picker — presets, custom upload, or a looping video
- Rune counter that goes up as you use the OS
- Stamina bar that drains over a session and pops a "you died" style screen when it hits zero (nudges you to take a break)
- Easter egg in the terminal — try `nevergiveup`

## Running it

Nothing to install. Open the live demo link, or clone the repo and open `index.html` directly in a browser.

```bash
git clone https://github.com/kyoske2/Web-OS.git
cd Web-OS
open index.html   # or just double-click it
```

## Project structure

```
Web-OS/
├── index.html
├── style.css
├── script.js
├── icons/
└── img/
    └── wallpapers/
```

Kept it as plain HTML/CSS/JS on purpose — no build step, no node_modules, just open the file and it works.

## How it works

Windows are just absolutely positioned `div`s. Dragging/resizing is done with raw `mousedown`/`mousemove`/`mouseup` listeners, nothing fancy. Each app's content gets built as a template string and injected into the window body when it opens.

The Status app pulls from a couple of `setInterval` loops — one tracks session uptime and stamina drain, another updates the rune count whenever an action happens (opening an app, running a terminal command, etc). When stamina hits 0 it throws up a full-screen overlay; clicking "rest at grace" resets the timer back to full.

The wallpaper picker uses `FileReader` to read an uploaded image as a data URL so it can be applied with zero backend involved. Video wallpaper is just a `<video>` element absolutely positioned behind everything else, muted and looping.

## AI usage

I used Claude during development to help debug CSS issues (mostly background shorthand stomping on inline styles — that one got me a few times), fix some JS scoping bugs in the stamina system, and bounce ideas off of for new features. All code was reviewed and tested by me before going in. What's more, README.md was also organized by AI as well.

## Notes

This was built for Stardance. The original (non-Tarnished) version had a more generic "modern OS" look — this version reskins it and adds the Status/rune/stamina stuff on top, none of which was in the original guide.
