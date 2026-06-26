# Web-OS Tarnished Edition

A browser-based desktop environment with an Elden Ring theme. Draggable windows, a working terminal, a file manager, and a few extra mechanics I added for fun (rune counter, stamina system). Built with plain HTML/CSS/JS, no frameworks.

[Live demo](https://kyoske2.github.io/WebOS/)

![screenshot](demo.gif)

## What's in it

- Draggable, resizable windows (minimize/maximize/close all work)
- Taskbar + Start menu
- 9 apps:
  - **Archive** – file manager with a small virtual file tree
  - **Mirror** – browser that loads real websites in an iframe, with a DuckDuckGo search bar and graceful fallback for sites that block embedding (Google, YouTube, etc.)
  - **Quill** – basic text editor
  - **Incant** – terminal with a handful of commands (`ls`, `pwd`, `date`, `whoami`, `neofetch`, `help`)
  - **Compute** – calculator
  - **Status** – character sheet style panel (see below)
  - **Anthem** – ambient music player with 4 procedurally-generated Elden Ring-style tracks (Web Audio API, no files needed). Play/pause, skip, volume slider, and track list
  - **Codex** – task manager. Add edicts, mark them fulfilled (awards runes), expunge completed ones. Tasks persist via `localStorage`
  - **Seer** – live camera viewer using `getUserMedia`. Three filters (Natural, Ashen, Golden Age), capture to canvas, download the shot. Stream stops cleanly when the window closes
- Wallpaper picker — presets, custom upload, or a looping video
- Rune counter that goes up as you use the OS
- Stamina bar that drains over a session and pops a "you died" style screen when it hits zero (nudges you to take a break)
- Easter egg in the terminal — try `nevergiveup`

## Running it

Nothing to install. Open the live demo link, or clone the repo and open `index.html` directly in a browser.

```bash
git clone https://github.com/kyoske2/WebOS.git
cd Web-OS
open index.html   # or just double-click it
```

## Project structure

```
WebOS/
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

**Anthem** generates all audio at runtime using the Web Audio API — layered sawtooth oscillators run through lowpass filters with slow LFO pitch modulation, a feedback delay loop for reverb depth, and random bell chimes scheduled on a timer. No audio files, no copyright issues.

**Seer** requests camera access via `navigator.mediaDevices.getUserMedia`, mirrors the feed (selfie orientation), and on capture draws the current frame to a hidden `<canvas>` with the selected CSS filter baked in. The stream is explicitly stopped (`track.stop()`) when the window closes so the browser camera indicator turns off.

**Mirror** now loads external URLs in a sandboxed `<iframe>`. Sites known to block embedding (Google, YouTube, etc.) are detected upfront and shown a fallback page with a direct "open in browser" link instead of a blank frame.

## AI usage

I used Claude during development to help debug CSS issues (mostly background shorthand stomping on inline styles — that one got me a few times), fix some JS scoping bugs in the stamina system, music player, and bounce ideas off of for new features. All code was reviewed and tested by me before going in. What's more, README.md was also organized by AI as well.

## Notes

This was built for Stardance. The original (non-Tarnished) version had a more generic "modern OS" look — this version reskins it and adds the Status/rune/stamina stuff on top, none of which was in the original guide.
