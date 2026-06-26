const desktop = document.getElementById('desktop');
const taskbarApps = document.getElementById('taskbar-apps');
let zCounter = 200;
let openWindows = {};
let runeCount = 0;

const apps = {
  files:      { title: 'Archive', icon: '📜', w: 480, h: 340 },
  browser:    { title: 'Mirror',   icon: '🔮', w: 540, h: 400 },
  editor:     { title: 'Quill',    icon: '✍️', w: 500, h: 380 },
  terminal:   { title: 'Incant',   icon: '⚔️', w: 480, h: 320 },
  calculator: { title: 'Compute',  icon: '🔢', w: 290, h: 430 },
  status:     { title: 'Status',   icon: '❤️', w: 380, h: 340 },
  anthem:     { title: 'Anthem',   icon: '♪',  w: 320, h: 460 },
  codex:      { title: 'Codex',    icon: '📜', w: 460, h: 420 },
  seer:       { title: 'Seer',     icon: '👁', w: 480, h: 430 }
};

function notify(title, msg) {
  const area = document.getElementById('notif-area');
  const n = document.createElement('div');
  n.className = 'notif';
  n.innerHTML = '<div class="notif-title">'+title+'</div><div style="color:rgba(212,175,55,0.5)">'+msg+'</div>';
  area.appendChild(n);
  setTimeout(() => n.remove(), 3100);
}

function addRunes(amount) {
  runeCount += amount;
  document.getElementById('rune-count').textContent = runeCount;
}

function openApp(id) {
  if (openWindows[id]) { focusWindow(id); return; }
  const cfg = apps[id];
  const dw = desktop.offsetWidth, dh = desktop.offsetHeight;
  const x = Math.min(80 + Object.keys(openWindows).length * 20, dw - cfg.w - 40);
  const y = Math.min(60 + Object.keys(openWindows).length * 20, dh - cfg.h - 40);
  const win = document.createElement('div');
  win.className = 'window focused'; win.id = 'win-'+id;
  win.style.cssText = 'width:'+cfg.w+'px;height:'+cfg.h+'px;left:'+x+'px;top:'+y+'px;';
  win.innerHTML = `
    <div class="window-titlebar" id="tb-${id}">
      <div class="win-controls">
        <button class="win-btn close" onclick="closeWindow('${id}')"></button>
        <button class="win-btn min" onclick="minimizeWindow('${id}')"></button>
        <button class="win-btn max" onclick="maximizeWindow('${id}')"></button>
      </div>
      <div class="window-title">◆ ${cfg.title} ◆</div>
    </div>
    <div class="window-body" id="body-${id}">${getAppHTML(id)}</div>
    <div class="resize-handle" id="rh-${id}"></div>`;
  desktop.appendChild(win);
  openWindows[id] = { el: win, minimized: false, maxed: false };
  makeDraggable(win, document.getElementById('tb-'+id));
  makeResizable(win, document.getElementById('rh-'+id));
  addTaskbarBtn(id, cfg);
  focusWindow(id);
  initApp(id);
  addRunes(10);
  notify(cfg.icon+' '+cfg.title, 'App awakened');
}

function getAppHTML(id) {
  switch(id) {
    case 'files': return `
      <div class="fm-toolbar">
        <button class="ed-btn" onclick="fmNav()">↑</button>
        <span class="fm-breadcrumb" id="fm-path">Archive Root</span>
      </div>
      <div class="fm-grid" id="fm-grid"></div>`;
    case 'browser': return `
      <div class="browser-bar">
        <button class="browser-nav-btn" onclick="browserBack()">←</button>
        <button class="browser-nav-btn" onclick="browserRefresh()">↻</button>
        <input id="browser-url" value="grace://site" onkeydown="if(event.key==='Enter')browserGo()" />
      </div>
      <div class="browser-content" id="browser-content"></div>`;
    case 'editor': return `
      <div class="editor-toolbar">
        <button class="ed-btn" onclick="editorSave()">Inscribe</button>
        <button class="ed-btn" onclick="editorClear()">Erase</button>
      </div>
      <textarea id="editor-area" placeholder="Write your tale...">The Lands Between await...</textarea>`;
    case 'terminal': return `
      <div id="terminal-output">
        <p class="term-line" style="color:rgba(212,175,55,0.4)">⚔️ Incantation Shell v1.0</p>
        <p class="term-line">&nbsp;</p>
        <div class="term-input-row" id="term-input-row">
          <span class="term-prompt">Tarnished></span>
          <input id="term-input" onkeydown="termKeyDown(event)" />
        </div>
      </div>`;
    case 'calculator': return `
      <div class="calc-wrap">
        <div class="calc-display" id="calc-display">0</div>
        <div class="calc-grid">
          ${['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','+/-','='].map(k=>{
            let cls='num';
            if(['÷','×','−','+'].includes(k))cls='op';
            if(k==='=')cls='eq';
            if(['C','±','%'].includes(k))cls='fn';
            return `<button class="calc-btn ${cls}" onclick="calcPress('${k}')">${k}</button>`;
          }).join('')}
        </div>
      </div>`;
case 'status': return `
      <div class="status-grid">
        <div class="status-stat">
          <div class="stat-name">Vigor</div>
          <div class="stat-value">99</div>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:100%"></div></div>
        </div>
        <div class="status-stat">
          <div class="stat-name">Mind</div>
          <div class="stat-value">80</div>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:80%"></div></div>
        </div>
        <div class="status-stat">
          <div class="stat-name">Endurance</div>
          <div class="stat-value">88</div>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:88%"></div></div>
        </div>
        <div class="status-stat">
          <div class="stat-name">Runes Collected</div>
          <div class="stat-value" id="status-runes">0</div>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:45%"></div></div>
        </div>
        <div class="status-stat">
          <div class="stat-name">System Uptime</div>
          <div class="stat-value" id="status-uptime">0h</div>
        </div>
        <div class="status-stat">
          <div class="stat-name">Windows Open</div>
          <div class="stat-value" id="status-windows">0</div>
        </div>
        <div class="status-stat" style="grid-column: 1 / -1;">
          <div class="stat-name">Change Wallpaper</div>
          <div class="stat-name">Stamina</div>
  <div class="stat-value" id="status-stamina">100%</div>
  <div class="stat-bar"><div class="stat-bar-fill" id="stamina-bar-fill" style="width:100%"></div></div>
          <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
            <div class="wallpaper-thumb" onclick="setWallpaper('img/wallpapers/wallp.jpg')" style="background-image:url('img/wallpapers/wallp.jpg')"></div>
            <div class="wallpaper-thumb" onclick="setWallpaper('img/wallpapers/wallp2.jpg')" style="background-image:url('img/wallpapers/wallp2.jpg')"></div>
            <div class="wallpaper-thumb" onclick="setWallpaper('img/wallpapers/wallp3.jpg')" style="background-image:url('img/wallpapers/wallp3.jpg')"></div>
            <div class="wallpaper-thumb video-thumb" onclick="setVideoWallpaper('img/wallpapers/vdwall.mp4')" style="background-image:url('img/wallpapers/vdwallprev.jpg')">▶</div>
            <label class="wallpaper-thumb upload-thumb">
              +
              <input type="file" id="wallpaper-upload" accept="image/*" onchange="uploadWallpaper(event)" style="display:none">
            </label>
          </div>
        </div>
      </div>`;
    case 'seer': return `
      <div class="seer-wrap">
        <div class="seer-viewport">
          <video class="seer-video" id="seer-video" autoplay playsinline muted></video>
          <div class="seer-corner tl"></div>
          <div class="seer-corner tr"></div>
          <div class="seer-corner bl"></div>
          <div class="seer-corner br"></div>
          <div class="seer-hud-status" id="seer-status">◌ Awakening vision...</div>
          <div class="seer-error" id="seer-error">
            <div style="font-size:15px;margin-bottom:6px">◆ Vision Denied</div>
            <div style="font-size:11px;color:rgba(212,175,55,0.4)">Camera access was refused by the browser</div>
          </div>
        </div>
        <canvas id="seer-canvas" style="display:none"></canvas>
        <div class="seer-controls">
          <div class="seer-filters">
            <button class="seer-filter-btn active" data-filter="none" onclick="seerSetFilter('none')">Natural</button>
            <button class="seer-filter-btn" data-filter="ashen" onclick="seerSetFilter('ashen')">Ashen</button>
            <button class="seer-filter-btn" data-filter="golden" onclick="seerSetFilter('golden')">Golden Age</button>
          </div>
          <button class="seer-capture-btn" onclick="seerCapture()">◆ Capture Relic</button>
        </div>
        <div class="seer-preview-row" id="seer-preview-row">
          <img class="seer-preview-thumb" id="seer-preview-thumb" src="" alt="">
          <div class="seer-preview-info">
            <div id="seer-preview-label" style="font-size:10px;color:rgba(212,175,55,0.4);margin-bottom:6px">Last captured relic</div>
            <button class="seer-dl-btn" onclick="seerDownload()">↓ Save Relic</button>
          </div>
        </div>
      </div>`;
    case 'codex': return `
      <div class="codex-wrap">
        <div class="codex-add-row">
          <input type="text" class="codex-input" id="codex-input" placeholder="Inscribe a new edict..." maxlength="120"
            onkeydown="if(event.key==='Enter')codexAdd()">
          <button class="codex-add-btn" onclick="codexAdd()">◆ Inscribe</button>
        </div>
        <div class="codex-list" id="codex-list"></div>
        <div class="codex-footer" id="codex-footer">◇ No edicts recorded</div>
      </div>`;
    case 'anthem': return `
      <div class="anthem-wrap">
        <div class="anthem-art-ring" id="anthem-art-ring">
          <div class="anthem-art-note" id="anthem-art-note">♪</div>
          <div class="anthem-art-orbit"></div>
          <div class="anthem-art-orbit anthem-orbit-2"></div>
        </div>
        <div class="anthem-info">
          <div class="anthem-label">⋄ NOW PLAYING ⋄</div>
          <div class="anthem-track-name" id="anthem-track-name">Erdtree's Glow</div>
          <div class="anthem-track-num" id="anthem-track-num">I / IV</div>
        </div>
        <div class="anthem-controls">
          <button class="anthem-btn" onclick="anthemPrev()" title="Previous">⏮</button>
          <button class="anthem-btn anthem-play-btn" id="anthem-play-btn" onclick="anthemTogglePlay()">▶</button>
          <button class="anthem-btn" onclick="anthemNext()" title="Next">⏭</button>
        </div>
        <div class="anthem-volume">
          <span class="anthem-vol-label">♩</span>
          <input type="range" class="anthem-slider" min="0" max="100" value="40" oninput="anthemSetVolume(this.value)">
          <span class="anthem-vol-label" style="font-size:14px">♫</span>
        </div>
        <div class="anthem-tracklist" id="anthem-tracklist"></div>
        <label class="anthem-upload-btn">
          ◇ Upload MP3
          <input type="file" accept="audio/*" multiple onchange="anthemUpload(event)" style="display:none">
        </label>
      </div>`;
    default: return '<div style="padding:20px;color:rgba(212,175,55,0.5)">Unknown grimoire.</div>';
  }
}

function initApp(id) {
  if(id==='files') renderFM('/');
  if(id==='browser') browserGo();
  if(id==='status') updateStatus();
  if(id==='anthem') updateAnthemUI();
  if(id==='codex') { codexLoad(); codexRender(); }
  if(id==='seer') seerInit();
}

// File System
const vfs = {
  '/': ['Scrolls','Artifacts','Incantations','Gifts','readme'],
  '/Scrolls': ['tale1.txt','tale2.txt','legacy.doc'],
  '/Artifacts': ['relic1.png','relic2.jpg','treasure.png'],
  '/Incantations': ['spell1.mp3','spell2.mp3'],
  '/Gifts': ['item.exe','blessing.zip']
};
let fmCurrent = '/';
function renderFM(path) {
  fmCurrent = path;
  const grid = document.getElementById('fm-grid');
  const label = document.getElementById('fm-path');
  if (!grid) return;
  label.textContent = (path==='/'?'Archive Root':path);
  const items = vfs[path] || [];
  grid.innerHTML = items.map(name=>{
    const isDir = !name.includes('.');
    const icon = isDir ? '📁' : '📄';
    return `<div class="fm-item" ondblclick="fmOpen('${name}')"><span class="fm-icon">${icon}</span><span>${name}</span></div>`;
  }).join('');
}
function fmOpen(name) {
  const path = fmCurrent==='/'?'/'+name:fmCurrent+'/'+name;
  if (vfs[path]) { renderFM(path); return; }
  notify('📄','Opened: '+name); addRunes(5);
}
function fmNav() {
  if (fmCurrent==='/') return;
  const parts = fmCurrent.split('/').filter(Boolean); parts.pop();
  renderFM(parts.length?'/'+parts.join('/'):'/');}

// Browser
let browserHistory = ['grace://site'];
let browserHistIdx = 0;
const browserPages = {
  'grace://site': () => `<div class="browser-home">
    <h1>◆ Grace Site ◆</h1>
    <div class="browser-search-row">
      <input id="browser-search-inp" class="browser-search-inp" placeholder="Search the Lands Between..." onkeydown="if(event.key==='Enter')browserSearch()">
      <button class="browser-search-btn" onclick="browserSearch()">🔍</button>
    </div>
    <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
      ${[['https://duckduckgo.com','🔍 DuckDuckGo'],['https://en.wikipedia.org','📖 Wikipedia'],['https://github.com','⚙ GitHub'],['grace://news','📜 Proclamations'],['grace://lore','⚔️ Lore'],['grace://about','ℹ️ About']].map(([u,l])=>
        `<div style="padding:8px;border-radius:3px;background:rgba(212,175,55,0.08);cursor:pointer;font-size:11px;color:#d4af37;border:0.5px solid rgba(212,175,55,0.2)" onclick="navBrowser('${u}')">${l}</div>`
      ).join('')}
    </div>
    <p style="margin-top:10px;font-size:10px;color:rgba(212,175,55,0.25);text-align:center">⚠ Sites like Google &amp; YouTube block embedding — use ↗ to open them directly</p>
  </div>`,
  'grace://about': () => `<div><h1 style="font-size:18px;color:#d4af37;margin-bottom:8px">◆ About ◆</h1><p style="color:rgba(212,175,55,0.6);font-size:12px;line-height:1.6">WebOS Tarnished Edition - A browser-based OS themed around Elden Ring. Built entirely in HTML & JavaScript with zero frameworks.</p></div>`,
  'grace://lore': () => `<div><h1 style="font-size:18px;color:#d4af37;margin-bottom:8px">⚔️ Lore</h1><p style="color:rgba(212,175,55,0.6);font-size:12px;line-height:1.6">This system was cursed by the Tarnished to run infinitely. Type 'nevergiveup' in Incant to awaken forbidden power...</p></div>`,
  'grace://tome': () => `<div><h1 style="font-size:18px;color:#d4af37;margin-bottom:8px">📖 Tome</h1><p style="color:rgba(212,175,55,0.6);font-size:12px;line-height:1.6">• Drag windows by their gold bars<br>• Resize from bottom-right<br>• Collect runes as you explore<br>• Check your Status to see your might</p></div>`,
  'grace://news': () => `<div><h1 style="font-size:18px;color:#d4af37;margin-bottom:8px">📜 Proclamations</h1><div style="display:flex;flex-direction:column;gap:8px">${[['WebOS Awakens','The system stirs.'],['New Grimoire','6 apps bound within'],['Rune System','Collect runes with each action']].map(([t,d])=>`<div style="padding:8px;border-radius:3px;background:rgba(212,175,55,0.08);border:0.5px solid rgba(212,175,55,0.15)"><div style="font-weight:500;font-size:12px;color:#d4af37;margin-bottom:2px">${t}</div><div style="font-size:11px;color:rgba(212,175,55,0.5)">${d}</div></div>`).join('')}</div></div>`,
};
function navBrowser(url) {
  const inp = document.getElementById('browser-url'); if(inp) inp.value=url;
  if(browserHistIdx<browserHistory.length-1) browserHistory=browserHistory.slice(0,browserHistIdx+1);
  browserHistory.push(url); browserHistIdx=browserHistory.length-1; renderBrowser(url);
}
function browserGo() {
  let url = ((document.getElementById('browser-url')||{}).value||'grace://site').trim();
  // Auto-prepend https:// for bare domains like "google.com"
  if (url && !url.startsWith('grace://') && !url.startsWith('http://') && !url.startsWith('https://') && url.includes('.')) {
    url = 'https://' + url;
    const inp = document.getElementById('browser-url');
    if (inp) inp.value = url;
  }
  navBrowser(url);
}
function browserSearch() {
  const inp = document.getElementById('browser-search-inp');
  if (!inp || !inp.value.trim()) return;
  const q = encodeURIComponent(inp.value.trim());
  navBrowser('https://duckduckgo.com/?q=' + q);
}
function browserBack() { if(browserHistIdx>0){browserHistIdx--;const u=browserHistory[browserHistIdx];document.getElementById('browser-url').value=u;renderBrowser(u);} }
function browserRefresh() { browserGo(); }
function isRealUrl(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

function renderBrowser(url) {
  const c = document.getElementById('browser-content');
  if (!c) return;

  if (isRealUrl(url)) {
    const iframeId = 'bframe-' + Date.now();
    const blocked = ['google.com','youtube.com','facebook.com','twitter.com','instagram.com','reddit.com','linkedin.com','bing.com','amazon.com'];
    const isKnownBlocked = blocked.some(d => url.includes(d));

    if (isKnownBlocked) {
      c.innerHTML = `
        <div class="browser-blocked">
          <div class="browser-blocked-icon">🔒</div>
          <div class="browser-blocked-title">Embedding refused</div>
          <div class="browser-blocked-msg">This site does not allow opening inside another page.<br>Use the button below to visit it directly.</div>
          <a class="browser-blocked-btn" href="${url}" target="_blank" rel="noopener noreferrer">↗ Open in your browser</a>
        </div>`;
      return;
    }

    c.innerHTML = `
      <div class="browser-ext-bar">
        <span class="browser-ext-note">If blank, this site blocks embedding</span>
        <a class="browser-ext-link" href="${url}" target="_blank" rel="noopener noreferrer">↗ Open in browser</a>
      </div>
      <iframe id="${iframeId}" class="browser-iframe"
        src="${url}"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        referrerpolicy="no-referrer">
      </iframe>`;
    return;
  }

  const gen = browserPages[url];
  c.innerHTML = gen ? gen() : `<div style="text-align:center;padding:32px;color:rgba(212,175,55,0.4)">404 — Site not found in the Lands Between</div>`;
}

// Editor
function editorSave() { notify('✍️','Inscribed'); addRunes(8); }
function editorClear() { const e=document.getElementById('editor-area'); if(e) e.value=''; }

// Rick Roll
function rickRoll() {
  const overlay = document.getElementById('rickroll-overlay');
  const iframe = document.getElementById('rick-iframe');
  iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&start_radio=1';
  overlay.classList.add('active');
}
function closeRickRoll() {
  const overlay = document.getElementById('rickroll-overlay');
  const iframe = document.getElementById('rick-iframe');
  overlay.classList.remove('active');
  iframe.src = '';
}

// Terminal
const termHistory = [];
let termHistIdx = -1;
let termOutRef = null, termRowRef = null;

function addTermLineGlobal(html) {
  if (!termOutRef || !termRowRef) return;
  const p = document.createElement('p'); p.className='term-line'; p.innerHTML=html;
  termOutRef.insertBefore(p, termRowRef);
  termOutRef.scrollTop = termOutRef.scrollHeight;
}

const termCmds = {
  help: () => [
    'Available incantations:',
    '  ls              list archive',
    '  pwd             current path',
    '  date            time of day',
    '  whoami          identity',
    '  neofetch        system vision',
    '  <span style="color:#d4af37">nevergiveup</span>      forbidden spell',
  ],
  ls: () => ['Scrolls/  Artifacts/  Incantations/  Gifts/  readme'],
  pwd: () => ['/archive/main'],
  date: () => [new Date().toLocaleString()],
  whoami: () => ['Tarnished'],
  neofetch: () => [
    '<span style="color:#d4af37">  ◆◆◆  WebOS Tarnished  ◆◆◆</span>',
    '',
    '<span style="color:#8b4513">OS:</span> WebOS Tarnished Edition',
    '<span style="color:#8b4513">Kernel:</span> HTML5 Divine Engine',
    '<span style="color:#8b4513">Theme:</span> Elden Ring',
    '<span style="color:#8b4513">Resolution:</span> '+window.innerWidth+'x'+window.innerHeight,
  ],
  nevergiveup: () => {
    setTimeout(() => {
      addTermLineGlobal('<span style="color:#d4af37">◊ Casting forbidden incantation...</span>');
      setTimeout(() => { rickRoll(); addRunes(50); }, 800);
    }, 0);
    return [
      '<span style="color:#d4af37">Searching forbidden grimoire...</span>',
      '<span style="color:rgba(212,175,55,0.4)">Ancient magic awakens...</span>',
    ];
  },
  clear: () => null,
};

function termKeyDown(e) {
  if (e.key==='Enter') {
    const inp=document.getElementById('term-input'); const cmd=inp.value.trim(); inp.value=''; termRun(cmd);
  }
  if (e.key==='ArrowUp'&&termHistory.length) {
    termHistIdx=Math.max(0,termHistIdx-1); document.getElementById('term-input').value=termHistory[termHistIdx]||'';
  }
}
function termRun(cmd) {
  if (!cmd) return;
  termHistory.push(cmd); termHistIdx=termHistory.length;
  const out=document.getElementById('terminal-output');
  const row=document.getElementById('term-input-row');
  termOutRef=out; termRowRef=row;
  const p=document.createElement('p'); p.className='term-line';
  p.innerHTML='<span style="color:#8b4513">Tarnished></span> '+cmd;
  out.insertBefore(p,row);
  const parts=cmd.split(' ');
  const fn=termCmds[parts[0]];
  if(fn===undefined) {
    addLine(out,row,'<span style="color:#d4af37">Unknown incantation: '+parts[0]+'</span>');
  } else if(parts[0]==='clear') {
    Array.from(out.querySelectorAll('.term-line')).forEach(el=>{if(el!==row)el.remove();});
  } else {
    const result=fn();
    if(result) result.forEach(l=>addLine(out,row,l));
  }
  out.scrollTop=out.scrollHeight;
  addRunes(3);
}
function addLine(out,row,html) {
  const p=document.createElement('p'); p.className='term-line'; p.innerHTML=html;
  out.insertBefore(p,row);
}

// Calculator
let calcExpr='0', calcOp=null, calcPrev=null, calcReset=false;
function calcPress(k) {
  const d=document.getElementById('calc-display'); if(!d) return;
  if(k==='C'){calcExpr='0';calcOp=null;calcPrev=null;calcReset=false;}
  else if(k==='±'){calcExpr=String(-parseFloat(calcExpr));}
  else if(k==='%'){calcExpr=String(parseFloat(calcExpr)/100);}
  else if(['÷','×','−','+'].includes(k)){calcPrev=parseFloat(calcExpr);calcOp=k;calcReset=true;}
  else if(k==='='){
    if(calcOp&&calcPrev!==null){
      const cur=parseFloat(calcExpr);const ops={'÷':'/','×':'*','−':'-','+':'+'};
      try{calcExpr=String(eval(calcPrev+ops[calcOp]+cur));}catch(e){calcExpr='Error';}
      calcOp=null;calcPrev=null;
    }
  } else if(k==='.'){
    if(calcReset){calcExpr='0.';calcReset=false;}
    else if(!calcExpr.includes('.')) calcExpr+='.';
  } else {
    if(calcExpr==='0'||calcReset){calcExpr=k;calcReset=false;}
    else calcExpr+=k;
  }
  d.textContent=calcExpr.length>10?parseFloat(calcExpr).toPrecision(8):calcExpr;
  addRunes(1);
}

// Status app
let startTime = Date.now();
function updateStatus() {
  const sr = document.getElementById('status-runes'); if(sr) sr.textContent = runeCount;
  const sw = document.getElementById('status-windows'); if(sw) sw.textContent = Object.keys(openWindows).length;
  const su = document.getElementById('status-uptime');
  if(su) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60);
    su.textContent = Math.floor(elapsed/60)+'h '+Math.floor(elapsed%60)+'m';
  }
}

// Window Management
function focusWindow(id) {
  Object.values(openWindows).forEach(w=>w.el.classList.remove('focused'));
  document.querySelectorAll('.taskbar-btn').forEach(b=>b.classList.remove('active'));
  if(openWindows[id]){
    openWindows[id].el.classList.add('focused');
    openWindows[id].el.style.zIndex=++zCounter;
    const btn=document.querySelector('.taskbar-btn[data-id="'+id+'"]');
    if(btn) btn.classList.add('active');
  }
}
function closeWindow(id) {
  if(!openWindows[id]) return;
  if(id==='seer') seerCleanup();
  openWindows[id].el.remove(); delete openWindows[id];
  const btn=document.querySelector('.taskbar-btn[data-id="'+id+'"]'); if(btn) btn.remove();
  addRunes(2);
}
function minimizeWindow(id) {
  const w=openWindows[id]; if(!w) return;
  w.el.style.display='none'; w.minimized=true;
  const btn=document.querySelector('.taskbar-btn[data-id="'+id+'"]');
  if(btn){btn.classList.remove('active');btn.style.opacity='0.6';}
}
function maximizeWindow(id) {
  const w=openWindows[id]; if(!w) return;
  if(w.maxed){
    w.el.style.cssText='width:'+w.prevW+'px;height:'+w.prevH+'px;left:'+w.prevX+'px;top:'+w.prevY+'px;';
    w.maxed=false;
  } else {
    w.prevW=w.el.offsetWidth;w.prevH=w.el.offsetHeight;
    w.prevX=parseInt(w.el.style.left);w.prevY=parseInt(w.el.style.top);
    w.el.style.cssText='width:'+desktop.offsetWidth+'px;height:'+desktop.offsetHeight+'px;left:0;top:0;';
    w.maxed=true;
  }
}

function addTaskbarBtn(id,cfg) {
  const btn=document.createElement('div');
  btn.className='taskbar-btn active'; btn.dataset.id=id;
  btn.innerHTML=cfg.icon+' '+cfg.title;
  btn.onclick=()=>{
    const w=openWindows[id]; if(!w) return;
    if(w.minimized){w.el.style.display='flex';w.minimized=false;btn.style.opacity='1';focusWindow(id);}
    else if(w.el.classList.contains('focused')){minimizeWindow(id);}
    else{focusWindow(id);}
  };
  taskbarApps.appendChild(btn);
}

function makeDraggable(win,handle) {
  let mx,my,ox,oy,dragging=false;
  handle.addEventListener('mousedown',e=>{
    if(e.target.classList.contains('win-btn')) return;
    dragging=true; mx=e.clientX; my=e.clientY; ox=win.offsetLeft; oy=win.offsetTop;
    focusWindow(win.id.replace('win-','')); e.preventDefault();
  });
  document.addEventListener('mousemove',e=>{
    if(!dragging) return;
    win.style.left=Math.max(0,Math.min(desktop.offsetWidth-win.offsetWidth,ox+(e.clientX-mx)))+'px';
    win.style.top=Math.max(0,Math.min(desktop.offsetHeight-win.offsetHeight,oy+(e.clientY-my)))+'px';
  });
  document.addEventListener('mouseup',()=>{dragging=false;});
}
function makeResizable(win,handle) {
  let dragging=false,sx,sy,sw,sh;
  handle.addEventListener('mousedown',e=>{dragging=true;sx=e.clientX;sy=e.clientY;sw=win.offsetWidth;sh=win.offsetHeight;e.preventDefault();});
  document.addEventListener('mousemove',e=>{if(!dragging)return;win.style.width=Math.max(280,sw+(e.clientX-sx))+'px';win.style.height=Math.max(180,sh+(e.clientY-sy))+'px';});
  document.addEventListener('mouseup',()=>{dragging=false;});
}

desktop.addEventListener('mousedown',e=>{if(e.target===desktop){document.querySelectorAll('.window').forEach(w=>w.classList.remove('focused'));document.querySelectorAll('.taskbar-btn').forEach(b=>b.classList.remove('active'));closeStart();}});
document.addEventListener('click',e=>{if(!e.target.closest('#start-menu')&&!e.target.closest('#taskbar-start')) closeStart();});

function toggleStart(){document.getElementById('start-menu').classList.toggle('open');}
function closeStart(){document.getElementById('start-menu').classList.remove('open');}

function updateClock(){const c=document.getElementById('taskbar-clock');if(c) c.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
updateClock(); setInterval(updateClock,1000);
setInterval(updateStatus, 5000);

setTimeout(()=>notify('◆ WebOS','Welcome, Tarnished'),700);


// Make desktop icons draggable
function makeIconsDraggable() {
  document.querySelectorAll('.desktop-icon').forEach(icon => {
    let isDragging = false;
    let offsetX, offsetY;

    icon.addEventListener('mousedown', (e) => {
      isDragging = true;
      icon.classList.add('dragging');
      const rect = icon.getBoundingClientRect();
      const desktopRect = desktop.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const desktopRect = desktop.getBoundingClientRect();
      let newX = e.clientX - desktopRect.left - offsetX;
      let newY = e.clientY - desktopRect.top - offsetY;

      // Keep icon inside desktop bounds
      newX = Math.max(0, Math.min(desktop.offsetWidth - icon.offsetWidth, newX));
      newY = Math.max(0, Math.min(desktop.offsetHeight - icon.offsetHeight, newY));

      icon.style.left = newX + 'px';
      icon.style.top = newY + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        icon.classList.remove('dragging');
      }
    });
  });
}

// Call this after the page loads
makeIconsDraggable();


function makeIconsDraggable() {
  document.querySelectorAll('.desktop-icon').forEach(icon => {
    let isDragging = false;
    let startX, startY, offsetX, offsetY;
    let moved = false;

    icon.addEventListener('mousedown', (e) => {
      isDragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      const rect = icon.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      if (Math.abs(e.clientX - startX) > 4 || Math.abs(e.clientY - startY) > 4) {
        moved = true;
        icon.classList.add('dragging');
      }
      if (!moved) return;

      const desktopRect = desktop.getBoundingClientRect();
      let newX = e.clientX - desktopRect.left - offsetX;
      let newY = e.clientY - desktopRect.top - offsetY;
      newX = Math.max(0, Math.min(desktop.offsetWidth - icon.offsetWidth, newX));
      newY = Math.max(0, Math.min(desktop.offsetHeight - icon.offsetHeight, newY));

      icon.style.left = newX + 'px';
      icon.style.top = newY + 'px';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      icon.classList.remove('dragging');
    });
  });
}

makeIconsDraggable();


/* wallpaper chaning*/
function setWallpaper(url) {
  document.querySelector('#desktop').style.setProperty('--wallpaper-url', `url('${url}')`);
  document.documentElement.style.setProperty('--desktop-bg', `url('${url}')`);
  removeVideoWallpaper();
  applyWallpaper(url);
  notify('◆ Status', 'Wallpaper changed');
  addRunes(5);
}

function applyWallpaper(url) {
  const style = document.getElementById('dynamic-wallpaper-style') || (() => {
    const s = document.createElement('style');
    s.id = 'dynamic-wallpaper-style';
    document.head.appendChild(s);
    return s;
  })();
  style.textContent = `#desktop::before { background-image: url('${url}') !important; }`;
}

function uploadWallpaper(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    applyWallpaper(e.target.result);
    notify('◆ Status', 'Custom wallpaper applied');
    addRunes(10);
  };
  reader.readAsDataURL(file);
}


/* set wallpaper */
function setVideoWallpaper(src) {
  removeVideoWallpaper(); // clear any old one first
  const video = document.createElement('video');
  video.id = 'desktop-video-bg';
  video.src = src;
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  `;
  desktop.insertBefore(video, desktop.firstChild);

  // hide the static image layer while video plays
  const style = document.getElementById('dynamic-wallpaper-style') || (() => {
    const s = document.createElement('style');
    s.id = 'dynamic-wallpaper-style';
    document.head.appendChild(s);
    return s;
  })();
  style.textContent = `#desktop::before { background-image: none !important; }`;

  notify('◆ Status', 'Video wallpaper applied');
  addRunes(15);
}

function removeVideoWallpaper() {
  const existing = document.getElementById('desktop-video-bg');
  if (existing) existing.remove();
}



// Stamina system
const STAMINA_DURATION = 60 * 1000; // 10 seconds for testing, change to 4 * 60 * 60 * 1000 for real (4 hours)
let staminaWarningShown = false;
let sessionStart = Date.now(); // changed from const to let

function updateStamina() {
  const elapsed = Date.now() - sessionStart;
  let staminaPct = Math.max(0, 100 - (elapsed / STAMINA_DURATION) * 100);
  staminaPct = Math.round(staminaPct);

  const bar = document.getElementById('stamina-bar-fill');
  const val = document.getElementById('status-stamina');
  if (bar) {
    bar.style.width = staminaPct + '%';
    bar.classList.toggle('low-stamina', staminaPct <= 20);
  }
  if (val) val.textContent = staminaPct + '%';

  if (staminaPct <= 0 && !staminaWarningShown) {
    staminaWarningShown = true;
    showStaminaWarning();
  }
}

function showStaminaWarning() {
  notify('⚠️ Stamina Depleted', 'You have been Tarnished too long.');
  
  const overlay = document.createElement('div');
  overlay.id = 'stamina-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 999998;
    background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
  `;
  overlay.innerHTML = `
    <div style="
      width: 100%;
      padding: 40px 0;
      background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0) 100%);
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      animation: stamina-fade-in 2s ease-out;
    ">
      <div style="
        font-family: 'Times New Roman', serif;
        font-size: 64px;
        font-weight: bold;
        letter-spacing: 8px;
        color: #8b0000;
        text-shadow: 
          0 0 20px rgba(139, 0, 0, 0.9),
          0 0 40px rgba(139, 0, 0, 0.6),
          0 4px 8px rgba(0,0,0,0.9);
      ">YOU ARE EXHAUSTED</div>
      <div style="
        font-size: 13px; 
        color: rgba(212,175,55,0.6); 
        font-family: Georgia, serif; 
        text-align: center; 
        max-width: 320px;
        letter-spacing: 1px;
      ">
        Put those ambitious to rest Tarnished.<br>Step away and touch some grass. Return when rested.
      </div>
      <button onclick="restAtGrace()" style="
        margin-top: 8px;
        padding: 8px 24px; 
        border-radius: 2px; 
        border: 1px solid rgba(212,175,55,0.3); 
        background: rgba(212,175,55,0.08); 
        color: #d4af37; 
        cursor: pointer; 
        font-family: Georgia, serif;
        font-size: 12px;
        letter-spacing: 1px;
        pointer-events: auto;
      ">
        ✕ REST AT GRACE
      </button>
    </div>
  `;
  document.body.appendChild(overlay);
}

function restAtGrace() {
  const overlay = document.getElementById('stamina-overlay');
  if (overlay) overlay.remove();

  sessionStart = Date.now(); // resets the SAME variable updateStamina reads from
  staminaWarningShown = false;

  updateStamina();

  notify('🔥 Grace', 'Stamina fully restored, Tarnished.');
  addRunes(5);
}

setInterval(updateStamina, 1000);


// ── Seer Camera ──────────────────────────────────────────────────────────────

let seerStream = null;
let seerFilter = 'none';

function seerInit() {
  const video = document.getElementById('seer-video');
  const errEl = document.getElementById('seer-error');
  const statEl = document.getElementById('seer-status');
  if (!video) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (errEl) errEl.classList.add('visible');
    if (statEl) statEl.textContent = '✕ Not supported';
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    .then(stream => {
      seerStream = stream;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        if (statEl) { statEl.textContent = '● LIVE'; statEl.classList.add('live'); }
        notify('👁 Seer', 'Vision awakened');
      };
    })
    .catch(() => {
      if (errEl) errEl.classList.add('visible');
      if (statEl) statEl.textContent = '✕ Vision denied';
    });
}

function seerCleanup() {
  if (seerStream) {
    seerStream.getTracks().forEach(t => t.stop());
    seerStream = null;
  }
}

function seerCapture() {
  const video  = document.getElementById('seer-video');
  const canvas = document.getElementById('seer-canvas');
  if (!video || !canvas || !video.videoWidth) {
    notify('👁 Seer', 'No vision to capture'); return;
  }

  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');

  // Mirror to match preview (selfie orientation)
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  // Apply selected filter
  ctx.filter = seerFilterValue(seerFilter);
  ctx.drawImage(video, 0, 0);

  // Show preview row
  const thumb = document.getElementById('seer-preview-thumb');
  const row   = document.getElementById('seer-preview-row');
  if (thumb) { thumb.src = canvas.toDataURL('image/png'); }
  if (row)   { row.classList.add('visible'); }

  addRunes(8);
  notify('👁 Seer', 'Relic captured · +8 runes');
}

function seerFilterValue(f) {
  if (f === 'ashen')  return 'grayscale(100%) contrast(1.1)';
  if (f === 'golden') return 'sepia(85%) brightness(1.05) contrast(1.05)';
  return 'none';
}

function seerSetFilter(f) {
  seerFilter = f;
  const video = document.getElementById('seer-video');
  if (video) video.style.filter = seerFilterValue(f);
  document.querySelectorAll('.seer-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === f);
  });
}

function seerDownload() {
  const canvas = document.getElementById('seer-canvas');
  if (!canvas || !canvas.width) return;
  const a = document.createElement('a');
  a.download = 'relic-' + Date.now() + '.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
  addRunes(3);
  notify('👁 Seer', 'Relic saved');
}


// ── Codex Task Journal ───────────────────────────────────────────────────────

const CODEX_KEY = 'webos-codex-tasks';
let codexTasks  = []; // [{ id, text, done, createdAt }]

function codexLoad() {
  try {
    const raw = localStorage.getItem(CODEX_KEY);
    codexTasks = raw ? JSON.parse(raw) : [];
  } catch(e) { codexTasks = []; }
}

function codexSave() {
  try { localStorage.setItem(CODEX_KEY, JSON.stringify(codexTasks)); } catch(e) {}
}

function codexAdd() {
  const input = document.getElementById('codex-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  codexTasks.push({ id: Date.now(), text, done: false, createdAt: Date.now() });
  codexSave();
  codexRender();
  input.value = '';
  input.focus();
  addRunes(4);
}

function codexToggle(id) {
  const task = codexTasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  codexSave();
  codexRender();
  if (task.done) {
    addRunes(10);
    notify('◆ Codex', 'Edict fulfilled · +10 runes');
  }
}

function codexDelete(id) {
  codexTasks = codexTasks.filter(t => t.id !== id);
  codexSave();
  codexRender();
}

function codexClearDone() {
  codexTasks = codexTasks.filter(t => !t.done);
  codexSave();
  codexRender();
}

function codexRender() {
  const list   = document.getElementById('codex-list');
  const footer = document.getElementById('codex-footer');
  if (!list) return;

  if (codexTasks.length === 0) {
    list.innerHTML = '';
    if (footer) footer.textContent = '◇ No edicts recorded';
    return;
  }

  // Pending first, done below
  const sorted = [
    ...codexTasks.filter(t => !t.done),
    ...codexTasks.filter(t =>  t.done),
  ];

  list.innerHTML = sorted.map(task => `
    <div class="codex-item${task.done ? ' done' : ''}" data-id="${task.id}">
      <button class="codex-check" onclick="codexToggle(${task.id})" title="${task.done ? 'Mark undone' : 'Mark fulfilled'}">
        ${task.done ? '◆' : '◇'}
      </button>
      <span class="codex-text">${escapeHtml(task.text)}</span>
      <button class="codex-del" onclick="codexDelete(${task.id})" title="Expunge">✕</button>
    </div>
  `).join('');

  const total     = codexTasks.length;
  const fulfilled = codexTasks.filter(t => t.done).length;
  const pending   = total - fulfilled;

  if (footer) {
    footer.innerHTML = `◆ ${fulfilled} fulfilled &nbsp;·&nbsp; ◇ ${pending} pending` +
      (fulfilled > 0 ? ` &nbsp;<button class="codex-clear-btn" onclick="codexClearDone()">Expunge fulfilled</button>` : '');
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


// ── Anthem Music Player ──────────────────────────────────────────────────────

const anthemTracks = [
  { name: "Erdtree's Glow",        freqs: [130.81, 196.00, 164.81, 261.63] }, // C3 G3 E3 C4 — warm major
  { name: "Limgrave at Dawn",       freqs: [146.83, 174.61, 220.00, 293.66] }, // D3 F3 A3 D4 — melancholic minor
  { name: "Night of the Black Knife", freqs: [123.47, 155.56, 185.00, 246.94] }, // B2 Eb3 Gb3 B3 — tense
  { name: "Grace's Embrace",        freqs: [164.81, 207.65, 246.94, 329.63] }, // E3 Ab3 B3 E4 — peaceful
];

let anthemAudioCtx     = null;
let anthemNodes        = [];
let anthemBellTimer    = null;
let anthemAudioEl      = null;   // HTML Audio for real MP3 tracks
let anthemCurrentTrack = 0;
let anthemPlaying      = false;
let anthemVolume       = 0.4;

function anthemGetCtx() {
  if (!anthemAudioCtx) {
    anthemAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (anthemAudioCtx.state === 'suspended') anthemAudioCtx.resume();
  return anthemAudioCtx;
}

function anthemStartTrack(idx) {
  anthemStopAll();
  const track = anthemTracks[idx];

  // Real audio file — use HTML Audio element
  if (track.type === 'audio') {
    anthemAudioEl = new Audio(track.src);
    anthemAudioEl.loop   = true;
    anthemAudioEl.volume = anthemVolume;
    anthemAudioEl.play().catch(() => notify('♪ Anthem', 'Could not play track'));
    return;
  }

  // Generated track — use Web Audio oscillators
  const ctx = anthemGetCtx();
  const nodes = [];

  // Master output gain
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(anthemVolume * 0.38, ctx.currentTime + 2.5);
  master.connect(ctx.destination);
  nodes.push(master);

  // Pad layer — one filtered sawtooth oscillator per frequency
  track.freqs.forEach((freq, i) => {
    const osc    = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain   = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.detune.setValueAtTime((i % 3) * 4 - 4, ctx.currentTime); // subtle warmth

    // Slow pitch LFO
    const lfo     = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.15 + i * 0.07, ctx.currentTime);
    lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.detune);
    lfo.start();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320 + i * 80, ctx.currentTime);
    filter.Q.setValueAtTime(0.7, ctx.currentTime);

    // Stagger volume so lower freqs are louder
    gain.gain.setValueAtTime(0.28 - i * 0.04, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc.start();

    nodes.push(osc, filter, gain, lfo, lfoGain);
  });

  // Reverb-ish tail via a short delay
  const delay     = ctx.createDelay(0.6);
  const delayGain = ctx.createGain();
  delay.delayTime.setValueAtTime(0.42, ctx.currentTime);
  delayGain.gain.setValueAtTime(0.18, ctx.currentTime);
  master.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(master);
  nodes.push(delay, delayGain);

  anthemNodes = nodes;

  // Schedule random bell chimes
  scheduleBell(ctx, track);
}

function scheduleBell(ctx, track) {
  if (!anthemPlaying) return;
  const now       = ctx.currentTime;
  const bellFreqs = track.freqs.map(f => f * 2); // octave up
  const freq      = bellFreqs[Math.floor(Math.random() * bellFreqs.length)];

  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(anthemVolume * 0.12, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 4);

  const nextMs = 2800 + Math.random() * 7000;
  anthemBellTimer = setTimeout(() => scheduleBell(anthemGetCtx(), track), nextMs);
}

function anthemStopAll() {
  // Stop HTML Audio element
  if (anthemAudioEl) {
    anthemAudioEl.pause();
    anthemAudioEl.src = '';
    anthemAudioEl = null;
  }
  // Stop oscillator nodes
  if (anthemBellTimer) { clearTimeout(anthemBellTimer); anthemBellTimer = null; }
  anthemNodes.forEach(n => {
    try { if (n.gain) n.gain.setValueAtTime(0, anthemAudioCtx.currentTime); } catch(e) {}
    try { if (n.stop) n.stop(); } catch(e) {}
    try { n.disconnect(); } catch(e) {}
  });
  anthemNodes = [];
}

function anthemTogglePlay() {
  anthemPlaying = !anthemPlaying;
  if (anthemPlaying) {
    anthemStartTrack(anthemCurrentTrack);
    addRunes(5);
    notify('♪ Anthem', anthemTracks[anthemCurrentTrack].name);
  } else {
    anthemStopAll();
  }
  updateAnthemUI();
}

function anthemNext() {
  anthemCurrentTrack = (anthemCurrentTrack + 1) % anthemTracks.length;
  if (anthemPlaying) { anthemStartTrack(anthemCurrentTrack); notify('♪ Anthem', anthemTracks[anthemCurrentTrack].name); }
  updateAnthemUI();
  addRunes(2);
}

function anthemPrev() {
  anthemCurrentTrack = (anthemCurrentTrack - 1 + anthemTracks.length) % anthemTracks.length;
  if (anthemPlaying) { anthemStartTrack(anthemCurrentTrack); notify('♪ Anthem', anthemTracks[anthemCurrentTrack].name); }
  updateAnthemUI();
  addRunes(2);
}

function anthemSelectTrack(idx) {
  anthemCurrentTrack = idx;
  if (anthemPlaying) { anthemStartTrack(idx); notify('♪ Anthem', anthemTracks[idx].name); }
  updateAnthemUI();
  addRunes(2);
}

function anthemSetVolume(val) {
  anthemVolume = val / 100;
  if (anthemAudioEl) {
    anthemAudioEl.volume = anthemVolume;
  }
  if (anthemNodes.length > 0 && anthemAudioCtx) {
    const master = anthemNodes[0];
    master.gain.setTargetAtTime(anthemVolume * 0.38, anthemAudioCtx.currentTime, 0.08);
  }
}

function updateAnthemUI() {
  const nameEl  = document.getElementById('anthem-track-name');
  const numEl   = document.getElementById('anthem-track-num');
  const playBtn = document.getElementById('anthem-play-btn');
  const artRing = document.getElementById('anthem-art-ring');
  const artNote = document.getElementById('anthem-art-note');
  const track   = anthemTracks[anthemCurrentTrack];

  if (nameEl)  nameEl.textContent  = track.name;
  if (numEl)   numEl.textContent   = (anthemCurrentTrack + 1) + ' / ' + anthemTracks.length;
  if (playBtn) playBtn.textContent = anthemPlaying ? '⏸' : '▶';
  if (artRing) artRing.classList.toggle('playing', anthemPlaying);
  if (artNote) artNote.classList.toggle('pulsing', anthemPlaying);

  // Rebuild track list dynamically
  const list = document.getElementById('anthem-tracklist');
  if (!list) return;
  list.innerHTML = anthemTracks.map((t, i) => {
    const isActive = i === anthemCurrentTrack;
    const prefix   = t.type === 'audio' ? '♫' : (isActive ? '◆' : '◇');
    const delBtn   = t.type === 'audio'
      ? `<button class="anthem-track-del" onclick="event.stopPropagation();anthemRemoveTrack(${i})" title="Remove">✕</button>`
      : '';
    return `<div class="anthem-track-item${isActive ? ' active' : ''}" onclick="anthemSelectTrack(${i})">
      <span class="anthem-track-label">${prefix} ${t.name}</span>${delBtn}
    </div>`;
  }).join('');
}

function anthemUpload(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;
  files.forEach(file => {
    const src  = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^/.]+$/, ''); // strip extension
    anthemTracks.push({ type: 'audio', name, src });
  });
  updateAnthemUI();
  notify('♪ Anthem', files.length + ' track' + (files.length > 1 ? 's' : '') + ' added');
  event.target.value = ''; // allow re-uploading same file
  addRunes(5);
}

function anthemRemoveTrack(idx) {
  if (anthemCurrentTrack === idx) {
    anthemStopAll();
    anthemPlaying = false;
    anthemCurrentTrack = Math.max(0, idx - 1);
  } else if (anthemCurrentTrack > idx) {
    anthemCurrentTrack--;
  }
  const t = anthemTracks[idx];
  if (t && t.src && t.src.startsWith('blob:')) URL.revokeObjectURL(t.src);
  anthemTracks.splice(idx, 1);
  updateAnthemUI();
}