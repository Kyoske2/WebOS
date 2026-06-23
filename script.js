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
  status:     { title: 'Status',   icon: '❤️', w: 380, h: 340 }
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
    default: return '<div style="padding:20px;color:rgba(212,175,55,0.5)">Unknown grimoire.</div>';
  }
}

function initApp(id) {
  if(id==='files') renderFM('/');
  if(id==='browser') browserGo();
  if(id==='status') updateStatus();
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
    <h1>◆ Grace Site ◆</h1><p>A place to rest and reflect.</p>
    <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
      ${[['grace://news','📜 Proclamations'],['grace://tome','📖 Tome'],['grace://lore','⚔️ Lore'],['grace://about','ℹ️ About']].map(([u,l])=>
        `<div style="padding:8px;border-radius:3px;background:rgba(212,175,55,0.08);cursor:pointer;font-size:11px;color:#d4af37;border:0.5px solid rgba(212,175,55,0.2)" onclick="navBrowser('${u}')">${l}</div>`
      ).join('')}
    </div></div>`,
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
function browserGo() { const url=(document.getElementById('browser-url')||{}).value||'grace://site'; navBrowser(url); }
function browserBack() { if(browserHistIdx>0){browserHistIdx--;const u=browserHistory[browserHistIdx];document.getElementById('browser-url').value=u;renderBrowser(u);} }
function browserRefresh() { browserGo(); }
function renderBrowser(url) {
  const c=document.getElementById('browser-content'); if(!c) return;
  const gen=browserPages[url];
  c.innerHTML=gen?gen():`<div style="text-align:center;padding:32px;color:rgba(212,175,55,0.4)">404 - Site not found</div>`;
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
const STAMINA_DURATION = 60 * 1000; // 60 seconds for testing, change to 4 * 60 * 60 * 1000 for real (4 hours)
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
