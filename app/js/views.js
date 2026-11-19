// Rendering for the Leonida Legend tracker: the checklist rows, the guide pane,
// the platinum roadmap and the missables page. Every row shows the official name,
// description and grade; the guide pane adds our own-words guide and its sources.
import { SOURCES } from './sources.js';

export const KIND_LABELS = {
  story: 'Story',
  side: 'Side quests',
  collectible: 'Collectibles',
  activity: 'Activities',
  combat: 'Combat & heists',
  money: 'Money',
  moment: 'Moments',
  platinum: 'Platinum',
};

export const KIND_FILTERS = [
  ['all', 'All 55'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectible', 'Collectibles'],
  ['activity', 'Activities'],
  ['side', 'Side quests'],
  ['combat', 'Combat & heists'],
  ['money', 'Money'],
];

export function gradeBadge(trophy) {
  return `<span class="grade ${trophy.grade}">${trophy.grade}</span>`;
}

export function trophyLabel(trophy, spoilerOn, earned) {
  if (spoilerOn && trophy.kind === 'story' && !earned) {
    return { name: 'Hidden story trophy — earn it to reveal', desc: 'A story trophy. Its name and description stay hidden until you earn it.' };
  }
  return { name: trophy.name, desc: trophy.description };
}

export function renderChecklist(listEl, trophies, state) {
  listEl.replaceChildren();
  for (const trophy of trophies) {
    const earned = state.earned.has(trophy.name);
    const label = trophyLabel(trophy, state.spoiler, earned);
    const li = document.createElement('li');
    if (earned) li.classList.add('earned');
    if (state.selected === trophy.name) li.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.setAttribute('aria-label', `Earned: ${label.name}`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => state.onToggleEarned(trophy, box.checked));
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = label.name;
    if (trophy.missable) {
      const flag = document.createElement('span');
      flag.className = 'flag';
      flag.textContent = 'POSSIBLY MISSABLE';
      name.append(flag);
    } else if (trophy.caution) {
      const flag = document.createElement('span');
      flag.className = 'flag caution';
      flag.textContent = 'ONE-TIME MOMENT';
      name.append(flag);
    }
    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.textContent = label.desc;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${KIND_LABELS[trophy.kind] ?? trophy.kind}${trophy.target ? ` · ${trophy.target} ${trophy.targetLabel}` : ''}${state.counters[trophy.id] ? ` · you: ${state.counters[trophy.id]}` : ''}`;
    body.append(name, desc, meta);
    const badge = document.createElement('span');
    badge.innerHTML = gradeBadge(trophy);
    li.append(box, body, badge);
    li.addEventListener('click', () => state.onSelect(trophy));
    listEl.append(li);
  }
}

export function renderDetail(pane, trophy, state) {
  if (!trophy) {
    pane.innerHTML = '<h3>Pick a trophy</h3><p class="official">Click any trophy in the list to read its guide, its sources and — where it has one — its progress counter.</p>';
    return;
  }
  const earned = state.earned.has(trophy.name);
  const hidden = state.spoiler && trophy.kind === 'story' && !earned;
  const count = state.counters[trophy.id] ?? 0;
  const sourceLinks = trophy.sources
    .map((code) => `<a href="${SOURCES[code].url}">${SOURCES[code].label}</a>`)
    .join(' · ');
  pane.innerHTML = `
    <h3>${hidden ? 'Hidden story trophy' : escapeHtml(trophy.name)}</h3>
    <p>${gradeBadge(trophy)} <span class="meta">${KIND_LABELS[trophy.kind] ?? trophy.kind}</span></p>
    <p class="official">Official description: “${hidden ? 'Hidden until earned.' : escapeHtml(trophy.description)}”</p>
    ${trophy.missable ? '<div class="banner"><strong>Possibly missable.</strong> PowerPyx flags this as the only possibly-missable trophy: the first meditation is missable in Chapter 1. Do it early.</div>' : ''}
    ${trophy.caution && !trophy.missable ? `<div class="banner amber"><strong>Watch out:</strong> ${escapeHtml(trophy.caution)}</div>` : ''}
    ${trophy.target ? `
      <div class="counter">
        <label>Your progress: <input type="number" min="0" max="${trophy.target}" value="${count}" id="counterInput"> of ${trophy.target} ${escapeHtml(trophy.targetLabel)}</label>
        <progress max="${trophy.target}" value="${Math.min(count, trophy.target)}"></progress>
      </div>` : ''}
    <p class="guide">${hidden ? 'Its guide stays hidden with its name — earn the trophy to reveal both.' : escapeHtml(trophy.guide)}</p>
    <p class="sources"><strong>Sources:</strong> ${sourceLinks}</p>
    <p class="sources">Guide written for this entry, in our own words. Names and descriptions are PlayStation's, shown as published.</p>`;
  const input = pane.querySelector('#counterInput');
  if (input) {
    input.addEventListener('change', () => {
      const value = Math.max(0, Math.min(trophy.target, Number(input.value) || 0));
      state.onSetCounter(trophy, value);
    });
  }
}

export function renderRoadmap(container, trophies) {
  const stages = [
    {
      title: 'Finish the story — Chapters 1 to 5',
      time: 'About 60–80 hours',
      text: 'Play the five chapters and the named missions in order. Take optional missions as they appear, scan vehicles and study animals through binoculars as you travel — that progress already counts toward the 100% checklist. Meditate at the first meditation spot you find in Chapter 1: it may be missable. Keep cheats off the whole run; they disable trophies and saving.',
      ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 28, 33, 37, 48],
    },
    {
      title: 'Stranger strands — Andy, Kenton, Billy, Randy, Tyrone and more',
      time: 'With the story, and into cleanup',
      text: 'Finish the stranger mission strands you met on the way — five named strangers have their own final-mission trophies, and eight strands in total earn the Strangers & Freaks silver. Bret’s unique-animal hunt belongs here too.',
      ids: [22, 23, 24, 25, 26, 27, 29],
    },
    {
      title: 'Activities, shooting range and collectibles',
      time: 'The long middle — start early, finish in free-roam',
      text: 'Work the repeatable goals: 250 stunts (300 for the checklist), gold medals in all 42 Shooting Range challenges, 20 different race wins, drone-race wins at every location, fishing, arcade and bowling firsts, 50 challenges (70 for the checklist), 100 vehicles discovered, 100 WAiNK locations, 3 card sets, and exploring all of Leonida.',
      ids: [15, 16, 17, 18, 19, 20, 21, 30, 31, 32, 35, 42, 46],
    },
    {
      title: 'Combat, heists and money — then the platinum',
      time: 'Cleanup, about 10 hours after the checklist',
      text: 'Robberies and escapes (shops with your partner, bank vaults, armored trucks, each gang’s illegal operation), the partner wanted-level escape, Combat Focus, the showroom and Ocean Beach moments, then the money goals: $250,000 laundered, $100,000 spent, every garage bought, 10 vehicles registered. Finish the 100% checklist for A Long Road, and Vice Got a Price! — the platinum — pops with the last trophy.',
      ids: [1, 14, 34, 36, 38, 39, 40, 41, 43, 44, 45, 47, 49, 50, 51, 52, 53, 54, 55],
    },
  ];
  container.replaceChildren();
  for (const stage of stages) {
    const li = document.createElement('li');
    const names = stage.ids
      .map((id) => trophies.find((t) => t.id === id))
      .filter(Boolean)
      .map((t) => `${t.name} (${t.grade})`)
      .join(' · ');
    li.innerHTML = `<h3>${escapeHtml(stage.title)} <span class="meta">— ${escapeHtml(stage.time)}</span></h3>
      <p>${escapeHtml(stage.text)}</p><p class="trophies">${escapeHtml(names)}</p>`;
    container.append(li);
  }
}

export function renderMissables(missableEl, watchEl, trophies) {
  const missable = trophies.filter((t) => t.missable);
  const watch = trophies.filter((t) => t.caution && !t.missable);
  missableEl.replaceChildren();
  for (const t of missable) {
    const card = document.createElement('div');
    card.className = 'missCard';
    card.innerHTML = `<strong>${escapeHtml(t.name)}</strong> ${gradeBadge(t)}<p>${escapeHtml(t.guide)}</p>`;
    missableEl.append(card);
  }
  watchEl.replaceChildren();
  for (const t of watch) {
    const card = document.createElement('div');
    card.className = 'missCard amber';
    card.innerHTML = `<strong>${escapeHtml(t.name)}</strong> ${gradeBadge(t)}<p><strong>${escapeHtml(t.caution)}</strong> ${escapeHtml(t.guide)}</p>`;
    watchEl.append(card);
  }
}

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
