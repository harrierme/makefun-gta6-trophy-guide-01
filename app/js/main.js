// Leonida Legend — boot, tracker state, filters, spoiler setting and routing.
// The guide's data is app/data/trophies.json; progress lives in localStorage only.
import {
  loadEarned, saveEarned, loadCounters, saveCounters,
  exportProgress, importProgressFile,
} from './store.js';
import {
  KIND_FILTERS, renderChecklist, renderDetail, renderRoadmap, renderMissables,
} from './views.js';

// Demo seeding for screenshots only: ?demo=1 checks off a fixed set of 13
// early trophies when no progress has been saved yet, so the screenshots show
// a tracker in use. It never overwrites saved progress.
const DEMO_EARNED = [
  'Just Like Paradise', 'Paradise Lost', 'Trust', 'Family Matters',
  'Master of None', 'Stick Fiddler', 'Hot Together', 'In The Beginning…',
  'Let’s Go Bowling', 'Ten Pin', 'Treat Yo Self', 'On the Spot',
  'T**s Ass Drug Money',
];

const params = new URLSearchParams(location.search);
const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;

const state = {
  earned: loadEarned(),
  counters: loadCounters(),
  kind: 'all',
  grade: 'all',
  query: '',
  spoiler: params.get('spoiler') === '1',
  hideEarned: false,
  selected: null,
  onToggleEarned,
  onSelect,
  onSetCounter,
};

if (params.get('demo') === '1' && state.earned.size === 0) {
  state.earned = new Set(DEMO_EARNED);
  saveEarned(state.earned);
  state.counters = { 15: 87, 31: 34, 35: 61, 32: 22 };
  saveCounters(state.counters);
}

const listEl = document.getElementById('trophyList');
const detailPane = document.getElementById('detailPane');
const searchInput = document.getElementById('search');
const gradeFilter = document.getElementById('gradeFilter');
const spoilerToggle = document.getElementById('spoilerToggle');
const hideEarnedBox = document.getElementById('hideEarned');
const resultLine = document.getElementById('resultLine');
const chipsEl = document.getElementById('kindChips');

spoilerToggle.checked = state.spoiler;
if (params.get('select')) {
  const wanted = trophies.find((t) => String(t.id) === params.get('select'));
  if (wanted) state.selected = wanted.name;
}

function filteredTrophies() {
  const query = state.query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind === 'missable' && !t.missable) return false;
    if (state.kind !== 'all' && state.kind !== 'missable' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.hideEarned && state.earned.has(t.name)) return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

function renderHeader() {
  const earnedByGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (state.earned.has(t.name)) earnedByGrade[t.grade]++;
  document.getElementById('earnedCount').textContent = state.earned.size;
  document.getElementById('progressFill').style.width = `${(state.earned.size / trophies.length) * 100}%`;
  document.getElementById('gradeCounts').textContent =
    `${earnedByGrade.platinum} platinum · ${earnedByGrade.gold} gold · ${earnedByGrade.silver} silver · ${earnedByGrade.bronze} bronze`;
  const next = trophies.find((t) => t.grade !== 'platinum' && !state.earned.has(t.name));
  document.getElementById('nextUp').textContent = next
    ? `Next up: ${next.name} — ${next.description}`
    : (state.earned.has('Vice Got a Price!')
      ? 'Platinum earned — you are a Leonida Legend.'
      : 'One left: the platinum — Vice Got a Price!');
}

function renderTracker() {
  const shown = filteredTrophies();
  renderChecklist(listEl, shown, state);
  const selected = trophies.find((t) => t.name === state.selected) ?? shown[0] ?? null;
  renderDetail(detailPane, selected, state);
  resultLine.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${state.earned.size} earned · ${trophies.filter((t) => t.missable).length} flagged possibly missable · 0 online trophies in this list.`;
  renderHeader();
}

function onToggleEarned(trophy, checked) {
  if (checked) state.earned.add(trophy.name);
  else state.earned.delete(trophy.name);
  saveEarned(state.earned);
  renderTracker();
}

function onSelect(trophy) {
  state.selected = trophy.name;
  renderTracker();
}

function onSetCounter(trophy, value) {
  state.counters[trophy.id] = value;
  saveCounters(state.counters);
  if (value >= trophy.target) state.earned.add(trophy.name);
  saveEarned(state.earned);
  renderTracker();
}

function renderChips() {
  chipsEl.replaceChildren();
  for (const [kind, label] of KIND_FILTERS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip${state.kind === kind ? ' active' : ''}`;
    button.textContent = kind === 'all' ? label : `${label} (${trophies.filter((t) => kind === 'missable' ? t.missable : t.kind === kind).length})`;
    button.addEventListener('click', () => {
      state.kind = kind;
      renderChips();
      renderTracker();
    });
    chipsEl.append(button);
  }
}

function showView(name) {
  for (const view of ['tracker', 'roadmap', 'missables', 'sources']) {
    document.getElementById(`view-${view}`).hidden = view !== name;
    document.getElementById(`tab-${view}`).classList.toggle('active', view === name);
  }
  // The header progress is part of every view, not just the tracker.
  renderHeader();
  if (name === 'tracker') renderTracker();
}

function route() {
  const hash = location.hash.replace(/^#\/?/, '') || 'tracker';
  const [view] = hash.split('/');
  showView(['tracker', 'roadmap', 'missables', 'sources'].includes(view) ? view : 'tracker');
  window.scrollTo(0, 0);
}

searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  renderTracker();
});
gradeFilter.addEventListener('change', () => {
  state.grade = gradeFilter.value;
  renderTracker();
});
spoilerToggle.addEventListener('change', () => {
  state.spoiler = spoilerToggle.checked;
  renderTracker();
});
hideEarnedBox.addEventListener('change', () => {
  state.hideEarned = hideEarnedBox.checked;
  renderTracker();
});
document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state.earned, state.counters));
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const imported = await importProgressFile(file);
    state.earned = imported.earned;
    state.counters = imported.counters;
    saveEarned(state.earned);
    saveCounters(state.counters);
    renderTracker();
  } catch (error) {
    alert(`Could not import that file: ${error.message}`);
  }
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all earned trophies and counters?')) return;
  state.earned = new Set();
  state.counters = {};
  saveEarned(state.earned);
  saveCounters(state.counters);
  renderTracker();
});

renderChips();
renderRoadmap(document.getElementById('roadmapStages'), trophies);
renderMissables(
  document.getElementById('missableList'),
  document.getElementById('watchList'),
  trophies,
);
window.addEventListener('hashchange', route);
route();
