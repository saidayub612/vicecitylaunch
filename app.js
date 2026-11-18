/**
 * ViceCityLaunch.live - Core Application Logic
 * Modular Vanilla ES6+ - Zero Dependencies - Ultra-fast Performance
 */

document.addEventListener('DOMContentLoaded', () => {
  initAudio();
  initCountdownClocks();
  initNzTrickGuide();
  initStorageCalculator();
  initChecklistTracker();
  initShareHooks();
  initScrollSpy();
  initSocialBar();
});

// ============================================================================
// 1. WEB AUDIO API SYNTH EFFECTS (Subtle retro-synth micro-interactions)
// ============================================================================
let audioCtx = null;
let soundEnabled = localStorage.getItem('vicecity_sound_enabled') === 'true';

function initAudio() {
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundStatusText = document.getElementById('sound-status-text');
  const soundIcon = document.getElementById('sound-icon');

  function updateSoundUI() {
    if (soundStatusText) {
      soundStatusText.textContent = soundEnabled ? 'SFX ON' : 'SFX OFF';
    }
    if (soundIcon) {
      soundIcon.innerHTML = soundEnabled
        ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z"/>`
        : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z m11.414-4l4 4m0-4l-4 4"/>`;
    }
  }

  updateSoundUI();

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('vicecity_sound_enabled', soundEnabled);
      updateSoundUI();
      if (soundEnabled) {
        playSynthNote(587.33, 'triangle', 0.12, 0.08); // D5 chime
        showToast('🔊 Retro SFX Enabled');
      } else {
        showToast('🔇 Audio Muted');
      }
    });
  }
}

function playSynthNote(freq = 440, type = 'sine', duration = 0.1, gainLevel = 0.05) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(gainLevel, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Graceful fallback if audio is blocked
  }
}

function playClickSound() {
  playSynthNote(659.25, 'triangle', 0.08, 0.04); // E5 blip
}

function playSuccessSound() {
  if (!soundEnabled) return;
  setTimeout(() => playSynthNote(523.25, 'sine', 0.1, 0.05), 0);
  setTimeout(() => playSynthNote(659.25, 'sine', 0.1, 0.05), 80);
  setTimeout(() => playSynthNote(783.99, 'sine', 0.18, 0.06), 160);
}

// ============================================================================
// 2. LIVE GLOBAL ROLLOUT & COUNTDOWN CLOCKS
// ============================================================================
// Release: Midnight November 19, 2026 local time in each territory.
// Current simulation reference anchor: 2026-11-18T15:13:37+03:00 (12:13:37 UTC).
// Targets below represent midnight Nov 19 in respective UTC equivalents:
const REGIONS = [
  {
    id: 'nz',
    name: 'New Zealand',
    city: 'Auckland / Wellington',
    flag: '🇳🇿',
    tz: 'NZDT (UTC+13)',
    // Midnight Nov 19 NZDT = Nov 18, 11:00:00 UTC
    targetUtc: new Date('2026-11-18T11:00:00Z').getTime(),
    isLiveNow: true,
    highlight: true
  },
  {
    id: 'aus',
    name: 'Australia East',
    city: 'Sydney / Melbourne',
    flag: '🇦🇺',
    tz: 'AEDT (UTC+11)',
    // Midnight Nov 19 AEDT = Nov 18, 13:00:00 UTC
    targetUtc: new Date('2026-11-18T13:00:00Z').getTime()
  },
  {
    id: 'asia',
    name: 'Japan & East Asia',
    city: 'Tokyo / Seoul',
    flag: '🇯🇵',
    tz: 'JST (UTC+9)',
    // Midnight Nov 19 JST = Nov 18, 15:00:00 UTC
    targetUtc: new Date('2026-11-18T15:00:00Z').getTime()
  },
  {
    id: 'gst',
    name: 'Middle East',
    city: 'Dubai / Riyadh',
    flag: '🇦🇪',
    tz: 'GST (UTC+4)',
    // Midnight Nov 19 GST = Nov 18, 20:00:00 UTC
    targetUtc: new Date('2026-11-18T20:00:00Z').getTime()
  },
  {
    id: 'eu',
    name: 'Europe (Central)',
    city: 'Paris / Berlin / Rome',
    flag: '🇪🇺',
    tz: 'CET (UTC+1)',
    // Midnight Nov 19 CET = Nov 18, 23:00:00 UTC
    targetUtc: new Date('2026-11-18T23:00:00Z').getTime()
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    city: 'London / Dublin',
    flag: '🇬🇧',
    tz: 'GMT (UTC+0)',
    // Midnight Nov 19 GMT = Nov 19, 00:00:00 UTC
    targetUtc: new Date('2026-11-19T00:00:00Z').getTime()
  },
  {
    id: 'useast',
    name: 'US East Coast',
    city: 'Miami / New York',
    flag: '🇺🇸',
    tz: 'EST (UTC-5)',
    // Midnight Nov 19 EST = Nov 19, 05:00:00 UTC
    targetUtc: new Date('2026-11-19T05:00:00Z').getTime()
  },
  {
    id: 'uswest',
    name: 'US West Coast',
    city: 'Los Angeles / Seattle',
    flag: '🇺🇸',
    tz: 'PST (UTC-8)',
    // Midnight Nov 19 PST = Nov 19, 08:00:00 UTC
    targetUtc: new Date('2026-11-19T08:00:00Z').getTime()
  }
];

// Reference base time anchor
// If client device is within November 2026, use real Date.now(), otherwise anchor relative to 2026-11-18T12:13:37Z
const SIMULATED_START = new Date('2026-11-18T12:13:37Z').getTime();
const REAL_START = Date.now();
const IS_REAL_2026 = (new Date().getFullYear() === 2026 && new Date().getMonth() === 10);

function getCurrentAppTime() {
  if (IS_REAL_2026) {
    return Date.now();
  }
  // Otherwise advance simulated time relative to elapsed real seconds in session
  const elapsed = Date.now() - REAL_START;
  return SIMULATED_START + elapsed;
}

function initCountdownClocks() {
  const container = document.getElementById('regional-clocks-grid');
  const userLocalBanner = document.getElementById('user-local-countdown');
  if (!container) return;

  function renderClocks() {
    const now = getCurrentAppTime();

    // User's Local Time Calculation
    if (userLocalBanner) {
      // Find local midnight for Nov 19
      const localMidnight = new Date(2026, 10, 19, 0, 0, 0).getTime();
      const localDiff = localMidnight - now;
      if (localDiff <= 0) {
        userLocalBanner.innerHTML = `
          <div class="flex items-center gap-2 text-emerald-400 font-bold">
            <span class="w-3 h-3 rounded-full bg-emerald-400 pulse-live-indicator inline-block"></span>
            <span>GTA 6 IS LIVE IN YOUR LOCAL TIMEZONE!</span>
          </div>`;
      } else {
        const h = Math.floor(localDiff / (1000 * 60 * 60));
        const m = Math.floor((localDiff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((localDiff % (1000 * 60)) / 1000);
        userLocalBanner.innerHTML = `
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-slate-400">Your Local Midnight:</span>
            <span class="text-cyan-400 font-mono-num font-bold tracking-wider">${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s</span>
          </div>`;
      }
    }

    container.innerHTML = REGIONS.map(reg => {
      const diff = reg.targetUtc - now;
      const isLive = diff <= 0;

      if (isLive) {
        // Calculate how long it has been live
        const elapsed = Math.abs(diff);
        const hoursLive = Math.floor(elapsed / (1000 * 60 * 60));
        const minsLive = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

        return `
          <div class="vice-card vice-card-live p-5 flex flex-col justify-between relative overflow-hidden group">
            <div class="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">${reg.flag}</span>
                  <div>
                    <h3 class="font-bold text-white text-base leading-tight">${reg.name}</h3>
                    <p class="text-xs text-slate-400">${reg.city}</p>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 text-xs font-extrabold tracking-wider">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 pulse-live-indicator"></span>
                  LIVE NOW
                </div>
              </div>
              <div class="text-xs text-slate-400 font-mono mb-4">${reg.tz}</div>
            </div>
            
            <div class="pt-3 border-t border-emerald-500/20 flex items-center justify-between">
              <span class="text-xs text-slate-300">Unlocked ${hoursLive > 0 ? `${hoursLive}h ` : ''}${minsLive}m ago</span>
              <a href="#nz-trick" class="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1">
                How to join <span>→</span>
              </a>
            </div>
          </div>
        `;
      } else {
        const totalSecs = Math.floor(diff / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;

        return `
          <div class="vice-card p-5 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/40">
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">${reg.flag}</span>
                  <div>
                    <h3 class="font-bold text-white text-base leading-tight">${reg.name}</h3>
                    <p class="text-xs text-slate-400">${reg.city}</p>
                  </div>
                </div>
                <div class="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
                  Midnight Rollout
                </div>
              </div>
              <div class="text-xs text-slate-400 font-mono mb-3">${reg.tz}</div>
            </div>

            <div>
              <div class="grid grid-cols-3 gap-2 my-2 text-center">
                <div class="bg-slate-900/80 rounded-lg py-2 border border-slate-800">
                  <div class="text-xl font-extrabold font-mono-num text-cyan-400">${String(hours).padStart(2, '0')}</div>
                  <div class="text-[10px] uppercase tracking-wider text-slate-400">Hours</div>
                </div>
                <div class="bg-slate-900/80 rounded-lg py-2 border border-slate-800">
                  <div class="text-xl font-extrabold font-mono-num text-cyan-400">${String(mins).padStart(2, '0')}</div>
                  <div class="text-[10px] uppercase tracking-wider text-slate-400">Mins</div>
                </div>
                <div class="bg-slate-900/80 rounded-lg py-2 border border-slate-800">
                  <div class="text-xl font-extrabold font-mono-num text-cyan-400">${String(secs).padStart(2, '0')}</div>
                  <div class="text-[10px] uppercase tracking-wider text-slate-400">Secs</div>
                </div>
              </div>
              <div class="text-[11px] text-slate-500 text-center mt-1">Unlocks Nov 19 00:00 Local</div>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  renderClocks();
  setInterval(renderClocks, 1000);
}

// ============================================================================
// 3. COLLAPSIBLE "HOW TO PLAY EARLY (NZ REGION SWITCH)" GUIDE
// ============================================================================
function initNzTrickGuide() {
  const toggleBtn = document.getElementById('nz-toggle-btn');
  const content = document.getElementById('nz-trick-content');
  const toggleIcon = document.getElementById('nz-toggle-icon');
  const shareNzBtn = document.getElementById('share-nz-trick-btn');

  // Platform switch tabs
  const tabXbox = document.getElementById('tab-xbox');
  const tabPs5 = document.getElementById('tab-ps5');
  const panelXbox = document.getElementById('panel-xbox');
  const panelPs5 = document.getElementById('panel-ps5');

  if (toggleBtn && content) {
    toggleBtn.addEventListener('click', () => {
      playClickSound();
      const isExpanded = content.classList.contains('expanded');
      if (isExpanded) {
        content.classList.remove('expanded');
        toggleIcon.style.transform = 'rotate(0deg)';
      } else {
        content.classList.add('expanded');
        toggleIcon.style.transform = 'rotate(180deg)';
      }
    });
  }

  if (tabXbox && tabPs5 && panelXbox && panelPs5) {
    tabXbox.addEventListener('click', () => {
      playClickSound();
      tabXbox.className = 'px-4 py-2 rounded-lg text-sm font-bold bg-pink-500 text-white shadow-lg shadow-pink-500/30 transition-all';
      tabPs5.className = 'px-4 py-2 rounded-lg text-sm font-bold bg-slate-800 text-slate-300 hover:text-white transition-all';
      panelXbox.classList.remove('hidden');
      panelPs5.classList.add('hidden');
    });

    tabPs5.addEventListener('click', () => {
      playClickSound();
      tabPs5.className = 'px-4 py-2 rounded-lg text-sm font-bold bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/30 transition-all';
      tabXbox.className = 'px-4 py-2 rounded-lg text-sm font-bold bg-slate-800 text-slate-300 hover:text-white transition-all';
      panelPs5.classList.remove('hidden');
      panelXbox.classList.add('hidden');
    });
  }

  if (shareNzBtn) {
    shareNzBtn.addEventListener('click', () => {
      playClickSound();
      const shareText = `🇳🇿 GTA 6 is LIVE NOW in New Zealand! Here is the working Xbox & PS5 early access trick: https://vicecitylaunch.live#nz-trick`;
      navigator.clipboard.writeText(shareText).then(() => {
        showToast('📋 NZ Trick link copied! Send it to your squad');
      }).catch(() => {
        showToast('Direct link: vicecitylaunch.live#nz-trick');
      });
    });
  }
}

// ============================================================================
// 4. INTERACTIVE PS5 & XBOX STORAGE & DELETE CALCULATOR
// ============================================================================
const CONSOLES = {
  'ps5-base': { name: 'PS5 Standard (825 GB)', usable: 667, platform: 'ps5' },
  'ps5-slim-1tb': { name: 'PS5 Slim / Pro (1 TB)', usable: 848, platform: 'ps5' },
  'ps5-pro-2tb': { name: 'PS5 Pro (2 TB)', usable: 1770, platform: 'ps5' },
  'xbox-x': { name: 'Xbox Series X (1 TB)', usable: 802, platform: 'xbox' },
  'xbox-s-512': { name: 'Xbox Series S (512 GB)', usable: 364, platform: 'xbox' },
  'xbox-s-1tb': { name: 'Xbox Series S (1 TB)', usable: 802, platform: 'xbox' }
};

const DEFAULT_GAMES = [
  { id: 'cod-bo6', name: 'Call of Duty: Black Ops 6', size: 140, checked: true },
  { id: 'fortnite', name: 'Fortnite', size: 85, checked: true },
  { id: 'rdr2', name: 'Red Dead Redemption 2', size: 120, checked: false },
  { id: 'eafc26', name: 'EA Sports FC 26', size: 65, checked: true },
  { id: 'cyberpunk', name: 'Cyberpunk 2077', size: 95, checked: false },
  { id: 'nba2k26', name: 'NBA 2K26', size: 150, checked: true }
];

let customGames = [];
try {
  const saved = localStorage.getItem('vicecity_custom_games');
  if (saved) customGames = JSON.parse(saved);
} catch (e) {
  customGames = [];
}

let userGameSelections = {};
try {
  const savedSelections = localStorage.getItem('vicecity_game_selections');
  if (savedSelections) userGameSelections = JSON.parse(savedSelections);
} catch (e) {
  userGameSelections = {};
}

function initStorageCalculator() {
  const consoleSelect = document.getElementById('console-select');
  const editionToggleStandard = document.getElementById('edition-standard');
  const editionToggleDeluxe = document.getElementById('edition-deluxe');
  const gamesListContainer = document.getElementById('games-checklist-container');
  const addGameBtn = document.getElementById('add-custom-game-btn');
  const customNameInput = document.getElementById('custom-game-name');
  const customSizeInput = document.getElementById('custom-game-size');

  let currentGtaSize = 185; // Standard by default

  // Load saved console
  const savedConsole = localStorage.getItem('vicecity_selected_console');
  if (savedConsole && CONSOLES[savedConsole] && consoleSelect) {
    consoleSelect.value = savedConsole;
  }

  function getGtaSize() {
    return currentGtaSize;
  }

  function renderGamesList() {
    if (!gamesListContainer) return;

    const allGames = [...DEFAULT_GAMES, ...customGames];

    gamesListContainer.innerHTML = allGames.map(game => {
      const isChecked = userGameSelections[game.id] !== undefined
        ? userGameSelections[game.id]
        : game.checked;

      const isCustom = customGames.some(c => c.id === game.id);

      return `
        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-pink-500/30 transition-all">
          <label class="flex items-center gap-3 cursor-pointer flex-1">
            <input type="checkbox" data-game-id="${game.id}" data-game-size="${game.size}" class="custom-checkbox game-checkbox" ${isChecked ? 'checked' : ''}>
            <span class="text-sm font-medium text-slate-200 select-none">${game.name}</span>
          </label>
          <div class="flex items-center gap-3">
            <span class="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">${game.size} GB</span>
            ${isCustom ? `
              <button class="text-slate-500 hover:text-red-400 text-xs p-1 transition-colors delete-custom-btn" data-delete-id="${game.id}" title="Remove custom game">
                ✕
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Attach checkbox handlers
    gamesListContainer.querySelectorAll('.game-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        playClickSound();
        const id = e.target.dataset.gameId;
        userGameSelections[id] = e.target.checked;
        localStorage.setItem('vicecity_game_selections', JSON.stringify(userGameSelections));
        calculateStorage();
      });
    });

    // Attach delete handlers for custom games
    gamesListContainer.querySelectorAll('.delete-custom-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.deleteId;
        customGames = customGames.filter(g => g.id !== id);
        delete userGameSelections[id];
        localStorage.setItem('vicecity_custom_games', JSON.stringify(customGames));
        localStorage.setItem('vicecity_game_selections', JSON.stringify(userGameSelections));
        renderGamesList();
        calculateStorage();
        showToast('Game removed');
      });
    });
  }

  function calculateStorage() {
    const selectedConsoleKey = consoleSelect ? consoleSelect.value : 'ps5-base';
    const consoleInfo = CONSOLES[selectedConsoleKey] || CONSOLES['ps5-base'];
    const usableSpace = consoleInfo.usable;
    const gtaSize = getGtaSize();

    // Sum installed games
    const allGames = [...DEFAULT_GAMES, ...customGames];
    let installedGamesTotal = 0;
    const checkedGames = [];

    allGames.forEach(game => {
      const isChecked = userGameSelections[game.id] !== undefined
        ? userGameSelections[game.id]
        : game.checked;
      if (isChecked) {
        installedGamesTotal += game.size;
        checkedGames.push(game);
      }
    });

    const totalUsedWithGta = installedGamesTotal + gtaSize;
    const remainingOrDeficit = usableSpace - totalUsedWithGta;
    const isReady = remainingOrDeficit >= 0;

    // Update numbers in UI
    const usableLabel = document.getElementById('calc-usable-gb');
    const installedLabel = document.getElementById('calc-installed-gb');
    const gtaLabel = document.getElementById('calc-gta-gb');
    const verdictTitle = document.getElementById('storage-verdict-title');
    const verdictDesc = document.getElementById('storage-verdict-desc');
    const verdictBanner = document.getElementById('storage-verdict-banner');
    const affiliateRecCard = document.getElementById('affiliate-recommendation-card');

    if (usableLabel) usableLabel.textContent = `${usableSpace} GB`;
    if (installedLabel) installedLabel.textContent = `${installedGamesTotal} GB`;
    if (gtaLabel) gtaLabel.textContent = `${gtaSize} GB`;

    // Dynamic Segmented Progress Bar
    const segGames = document.getElementById('storage-bar-games');
    const segGta = document.getElementById('storage-bar-gta');
    const segFree = document.getElementById('storage-bar-free');
    const segOverflow = document.getElementById('storage-bar-overflow');

    if (segGames && segGta && segFree && segOverflow) {
      if (isReady) {
        const gamesPct = (installedGamesTotal / usableSpace) * 100;
        const gtaPct = (gtaSize / usableSpace) * 100;
        const freePct = (remainingOrDeficit / usableSpace) * 100;

        segGames.style.width = `${gamesPct}%`;
        segGta.style.width = `${gtaPct}%`;
        segFree.style.width = `${freePct}%`;
        segOverflow.style.width = `0%`;
      } else {
        const deficit = Math.abs(remainingOrDeficit);
        const virtualTotal = totalUsedWithGta;
        const gamesPct = (installedGamesTotal / virtualTotal) * 100;
        const gtaPct = ((gtaSize - deficit) / virtualTotal) * 100;
        const overflowPct = (deficit / virtualTotal) * 100;

        segGames.style.width = `${gamesPct}%`;
        segGta.style.width = `${Math.max(0, gtaPct)}%`;
        segFree.style.width = `0%`;
        segOverflow.style.width = `${overflowPct}%`;
      }
    }

    // Verdict Styling
    if (verdictBanner && verdictTitle && verdictDesc) {
      if (isReady) {
        verdictBanner.className = 'p-5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 box-glow-green transition-all';
        verdictTitle.innerHTML = `
          <div class="flex items-center gap-2 text-emerald-400 font-bold text-lg">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            READY FOR VICE CITY!
          </div>
        `;
        verdictDesc.innerHTML = `You have <strong class="text-emerald-300 font-mono">${remainingOrDeficit} GB</strong> of free buffer remaining after installing GTA 6. You are fully ready for Day-One launch!`;
      } else {
        const deficit = Math.abs(remainingOrDeficit);
        verdictBanner.className = 'p-5 rounded-xl border border-red-500/50 bg-red-950/30 shadow-lg shadow-red-500/20 transition-all';
        
        // Find smart deletion recommendation
        let tip = '';
        const bigGame = checkedGames.slice().sort((a, b) => b.size - a.size)[0];
        if (bigGame) {
          tip = `Tip: Unchecking <strong>${bigGame.name} (${bigGame.size} GB)</strong> will free up enough room instantly.`;
        }

        verdictTitle.innerHTML = `
          <div class="flex items-center gap-2 text-red-400 font-bold text-lg">
            <svg class="w-6 h-6 flex-shrink-0 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            STORAGE SHORTAGE: FREE UP ${deficit} GB MORE!
          </div>
        `;
        verdictDesc.innerHTML = `Your console will overflow by <strong class="text-red-300 font-mono font-bold">${deficit} GB</strong>. Delete non-essential games or expand your internal storage. ${tip}`;
      }
    }

    // Dynamic affiliate recommendation highlight based on console platform
    if (affiliateRecCard) {
      const isXbox = consoleInfo.platform === 'xbox';
      const ps5Block = document.getElementById('affiliate-ps5-block');
      const xboxBlock = document.getElementById('affiliate-xbox-block');
      if (ps5Block && xboxBlock) {
        if (isXbox) {
          xboxBlock.classList.add('ring-2', 'ring-cyan-400', 'bg-slate-800/90');
          ps5Block.classList.remove('ring-2', 'ring-cyan-400', 'bg-slate-800/90');
        } else {
          ps5Block.classList.add('ring-2', 'ring-pink-500', 'bg-slate-800/90');
          xboxBlock.classList.remove('ring-2', 'ring-pink-500', 'bg-slate-800/90');
        }
      }
    }
  }

  // Console switch
  if (consoleSelect) {
    consoleSelect.addEventListener('change', () => {
      playClickSound();
      localStorage.setItem('vicecity_selected_console', consoleSelect.value);
      calculateStorage();
    });
  }

  // Edition toggle
  if (editionToggleStandard && editionToggleDeluxe) {
    editionToggleStandard.addEventListener('click', () => {
      playClickSound();
      currentGtaSize = 185;
      editionToggleStandard.className = 'flex-1 py-2 px-3 rounded-lg text-xs md:text-sm font-bold bg-pink-500 text-white shadow-md shadow-pink-500/30 transition-all';
      editionToggleDeluxe.className = 'flex-1 py-2 px-3 rounded-lg text-xs md:text-sm font-bold bg-slate-800 text-slate-300 hover:text-white transition-all';
      calculateStorage();
    });

    editionToggleDeluxe.addEventListener('click', () => {
      playClickSound();
      currentGtaSize = 212;
      editionToggleDeluxe.className = 'flex-1 py-2 px-3 rounded-lg text-xs md:text-sm font-bold bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/30 transition-all';
      editionToggleStandard.className = 'flex-1 py-2 px-3 rounded-lg text-xs md:text-sm font-bold bg-slate-800 text-slate-300 hover:text-white transition-all';
      calculateStorage();
    });
  }

  // Custom game add
  if (addGameBtn && customNameInput && customSizeInput) {
    addGameBtn.addEventListener('click', () => {
      const name = customNameInput.value.trim();
      const size = parseInt(customSizeInput.value, 10);

      if (!name) {
        showToast('⚠️ Please enter a game title');
        return;
      }
      if (isNaN(size) || size <= 0 || size > 1000) {
        showToast('⚠️ Enter a valid game size in GB (1 - 1000)');
        return;
      }

      playClickSound();
      const newGame = {
        id: 'custom-' + Date.now(),
        name: name,
        size: size,
        checked: true
      };

      customGames.push(newGame);
      userGameSelections[newGame.id] = true;
      localStorage.setItem('vicecity_custom_games', JSON.stringify(customGames));
      localStorage.setItem('vicecity_game_selections', JSON.stringify(userGameSelections));

      customNameInput.value = '';
      customSizeInput.value = '';
      renderGamesList();
      calculateStorage();
      showToast(`Added ${name} (${size} GB)`);
    });
  }

  renderGamesList();
  calculateStorage();
}

// ============================================================================
// 5. DAY-ONE LEONIDA LAUNCH CHECKLIST & TROPHY TRACKER
// ============================================================================
const CHECKLIST_ITEMS = [
  // Settings Optimization (5)
  { id: 'chk-1', category: 'settings', title: 'Disable Motion Blur & Film Grain', desc: 'Sharpen Vice City neon fidelity and gain clearer 60 FPS motion clarity.' },
  { id: 'chk-2', category: 'settings', title: 'Select Graphics Mode: Performance vs Fidelity', desc: 'Target 60 FPS Performance for gunplay or 4K Ray-Tracing Fidelity for cutscenes.' },
  { id: 'chk-3', category: 'settings', title: 'Calibrate HDR Peak Brightness & Nit Levels', desc: 'Fine-tune HDR black levels for Leonida sunsets and nighttime street glows.' },
  { id: 'chk-4', category: 'settings', title: 'DualSense / Controller Haptics to High', desc: 'Experience detailed vehicle rumble, rainfall sensations, and weapon triggers.' },
  { id: 'chk-5', category: 'settings', title: 'Configure Custom Radio Wheel Favorites', desc: 'Pin Flash FM, Wave 103, and Fever 105 to quick-select slots for cruising.' },

  // Story Milestones (5)
  { id: 'chk-6', category: 'story', title: 'Complete Chapter 1: The Leonard County Jailbreak', desc: 'Survive the opening cinematic escape with Lucia and unlock free-roam.' },
  { id: 'chk-7', category: 'story', title: 'Check In at Port Gellhorn Safehouse Motel', desc: 'Stash weapons, swap character outfits, and unlock the initial weapons armory.' },
  { id: 'chk-8', category: 'story', title: 'Execute First Bodega Robbery with Co-op Sync', desc: 'Perform the synced Lucia/Jason crowd control stick-up mechanic.' },
  { id: 'chk-9', category: 'story', title: 'Unlock the Leonida State Highway Map Sector', desc: 'Drive across Kelly County and reveal the broader state territory borders.' },
  { id: 'chk-10', category: 'story', title: 'Survive a 3-Star Police Pursuit in a Muscle Car', desc: 'Lose Leonida Highway Patrol cruisers using back-alley evasive driving.' },

  // Collectibles & Easter Eggs (5)
  { id: 'chk-11', category: 'collectibles', title: 'Locate Vice Beach Hidden Package #1', desc: 'Hidden directly behind the Ocean View retro art-deco promenade.' },
  { id: 'chk-12', category: 'collectibles', title: 'Spot the Neon Flamingos Easter Egg on Starfish Island', desc: 'Retro homage to the classic Tommy Vercetti estate gardens.' },
  { id: 'chk-13', category: 'collectibles', title: 'Take a High-Danger Selfie with a Grassrivers Alligator', desc: 'Snap an in-game smartphone photo without becoming swamp reptile bait.' },
  { id: 'chk-14', category: 'collectibles', title: 'Visit the Iconic Malibu Club Exterior at Night', desc: 'Check out the pulsing neon lights and iconic 80s synth soundtrack tribute.' },
  { id: 'chk-15', category: 'collectibles', title: 'Discover the Sunken Shipwreck Reef in Florida Keys', desc: 'Dive into the turquoise shallows and discover hidden smuggler contraband.' },

  // Online Prep & Day-One Perks (5)
  { id: 'chk-16', category: 'online', title: 'Link Rockstar Games Social Club Account', desc: 'Sync your profile to claim exclusive pre-launch cosmetics and jackets.' },
  { id: 'chk-17', category: 'online', title: 'Claim Pre-Order GTA$ & Weapons Cache', desc: 'Redeem day-one bonus currency and weapon skin packs from the in-game phone.' },
  { id: 'chk-18', category: 'online', title: 'Enable 2-Step Verification for Free GTA$ Bonus', desc: 'Protect your account and unlock the standard Rockstar 2FA account cash award.' },
  { id: 'chk-19', category: 'online', title: 'Create or Join a Vice City Launch Crew', desc: 'Assemble your 4-player heist syndicate before GTA 6 Online servers open.' },
  { id: 'chk-20', category: 'online', title: 'Pre-load Day-One Title Update Patch (Version 1.01)', desc: 'Verify the game file integrity and install the hotfix patch before launching.' }
];

let checklistState = {};
try {
  const savedState = localStorage.getItem('vicecity_checklist_v1');
  if (savedState) checklistState = JSON.parse(savedState);
} catch (e) {
  checklistState = {};
}

function initChecklistTracker() {
  const container = document.getElementById('checklist-items-container');
  const countBadge = document.getElementById('checklist-completed-count');
  const percentBadge = document.getElementById('checklist-percent-badge');
  const progressBar = document.getElementById('checklist-progress-bar');
  const shareBtn = document.getElementById('share-progress-btn');
  const resetBtn = document.getElementById('reset-checklist-btn');
  const searchInput = document.getElementById('checklist-search-input');
  const filterTabs = document.querySelectorAll('.checklist-tab-btn');

  let currentCategory = 'all';
  let searchQuery = '';

  function updateChecklistProgress() {
    const total = CHECKLIST_ITEMS.length;
    const completed = CHECKLIST_ITEMS.filter(item => checklistState[item.id]).length;
    const percent = Math.round((completed / total) * 100);

    if (countBadge) countBadge.textContent = `${completed} / ${total}`;
    if (percentBadge) percentBadge.textContent = `${percent}% Completed`;
    if (progressBar) progressBar.style.width = `${percent}%`;

    // Dynamic celebration effect when 100%
    if (completed === total && total > 0) {
      playSuccessSound();
      showToast('🏆 100% LAUNCH READY! You conquered the Leonida checklist!');
    }
  }

  function renderChecklist() {
    if (!container) return;

    const filtered = CHECKLIST_ITEMS.filter(item => {
      const matchCat = (currentCategory === 'all' || item.category === currentCategory);
      const matchSearch = (!searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-500">
          <p class="text-sm">No items match your filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => {
      const isChecked = !!checklistState[item.id];
      const categoryBadges = {
        settings: '<span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Settings</span>',
        story: '<span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">Story</span>',
        collectibles: '<span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Collectibles</span>',
        online: '<span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Online</span>'
      };

      return `
        <div class="vice-card p-4 flex items-start gap-3 transition-all ${isChecked ? 'bg-slate-900/40 border-pink-500/20 opacity-75' : 'hover:border-pink-500/30'}">
          <input type="checkbox" data-task-id="${item.id}" class="custom-checkbox checklist-item-checkbox mt-0.5" ${isChecked ? 'checked' : ''}>
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              ${categoryBadges[item.category] || ''}
              <h4 class="text-sm font-bold text-white ${isChecked ? 'line-through text-slate-400' : ''}">${item.title}</h4>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">${item.desc}</p>
          </div>
        </div>
      `;
    }).join('');

    // Attach checkbox events
    container.querySelectorAll('.checklist-item-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        playClickSound();
        const taskId = e.target.dataset.taskId;
        checklistState[taskId] = e.target.checked;
        localStorage.setItem('vicecity_checklist_v1', JSON.stringify(checklistState));
        updateChecklistProgress();
        renderChecklist();
      });
    });
  }

  // Filter tab events
  filterTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      filterTabs.forEach(b => {
        b.className = 'checklist-tab-btn px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-all';
      });
      btn.className = 'checklist-tab-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-pink-500 shadow-md shadow-pink-500/30 transition-all';
      currentCategory = btn.dataset.category;
      renderChecklist();
    });
  });

  // Search input event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderChecklist();
    });
  }

  // Reset Button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset your Leonida Launch Checklist progress?')) {
        playClickSound();
        checklistState = {};
        localStorage.removeItem('vicecity_checklist_v1');
        updateChecklistProgress();
        renderChecklist();
        showToast('Checklist progress reset');
      }
    });
  }

  // Share Progress Card Button
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      playClickSound();
      const total = CHECKLIST_ITEMS.length;
      const completed = CHECKLIST_ITEMS.filter(item => checklistState[item.id]).length;
      const percent = Math.round((completed / total) * 100);

      const viralText = `🌴 ViceCityLaunch.live - Day 1 Leonida Tracker:\n🎯 Completed: ${completed}/${total} tasks (${percent}%)\n🚀 Ready to rule Vice City on Day-One! Check your readiness & console storage:\nhttps://vicecitylaunch.live #GTA6 #ViceCity #Leonida`;

      if (navigator.share) {
        navigator.share({
          title: 'ViceCityLaunch.live - My GTA 6 Launch Progress',
          text: viralText,
          url: 'https://vicecitylaunch.live'
        }).catch(() => {
          copyToClipboard(viralText);
        });
      } else {
        copyToClipboard(viralText);
      }
    });
  }

  renderChecklist();
  updateChecklistProgress();
}

// ============================================================================
// 6. VIRAL SHARE HOOKS & UTILITIES
// ============================================================================
function initShareHooks() {
  const shareSquadBtns = document.querySelectorAll('.share-squad-btn');

  shareSquadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      const shareData = {
        title: 'ViceCityLaunch.live - GTA 6 Global Rollout & Tools',
        text: '🌴 GTA 6 is live now in New Zealand! Check real-time launch countdowns, the NZ early play trick, and console storage calculator:',
        url: window.location.href.split('#')[0]
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => {
          copyToClipboard(`${shareData.text} ${shareData.url}`);
        });
      } else {
        copyToClipboard(`${shareData.text} ${shareData.url}`);
      }
    });
  });
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Copied to clipboard! Share it with your squad.');
    }).catch(() => {
      prompt('Copy this link:', text);
    });
  } else {
    prompt('Copy this link:', text);
  }
}

// Toast helper
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="text-cyan-400">🌴</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

// Smooth scroll spy for active header navigation links
function initScrollSpy() {
  const links = document.querySelectorAll('header a[href^="#"]');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 120;
    links.forEach(link => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          const top = targetSection.offsetTop;
          const height = targetSection.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            link.classList.add('text-pink-400');
          } else {
            link.classList.remove('text-pink-400');
          }
        }
      }
    });
  });
}

// ============================================================================
// 7. HIGH-CONVERTING SOCIAL BAR / FLOATING EARLY ACCESS NOTIFICATION
// ============================================================================
function initSocialBar() {
  const alert = document.getElementById('social-bar-alert');
  const closeBtn = document.getElementById('social-bar-close');
  const ctaBtn = document.getElementById('social-bar-cta');

  if (!alert) return;

  // Don't show if user dismissed it in this session
  if (sessionStorage.getItem('vicecity_social_dismissed') === 'true') {
    return;
  }

  // Slide in after 3.5 seconds
  setTimeout(() => {
    alert.classList.remove('translate-y-32', 'opacity-0');
    alert.classList.add('translate-y-0', 'opacity-100');
    playSynthNote(784, 'sine', 0.08, 0.03); // gentle ping
  }, 3500);

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      alert.classList.remove('translate-y-0', 'opacity-100');
      alert.classList.add('translate-y-32', 'opacity-0');
      sessionStorage.setItem('vicecity_social_dismissed', 'true');
    });
  }

  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      alert.classList.remove('translate-y-0', 'opacity-100');
      alert.classList.add('translate-y-32', 'opacity-0');
      sessionStorage.setItem('vicecity_social_dismissed', 'true');
      // Ensure the NZ trick accordion is expanded
      const nzContent = document.getElementById('nz-trick-content');
      const toggleIcon = document.getElementById('nz-toggle-icon');
      if (nzContent && !nzContent.classList.contains('expanded')) {
        nzContent.classList.add('expanded');
        if (toggleIcon) toggleIcon.style.transform = 'rotate(180deg)';
      }
    });
  }
}
