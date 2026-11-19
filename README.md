# makefun-gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/harrierme/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/harrierme/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline, open-source guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=szgskt7z&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

# Leonida Legend — GTA VI Trophy Guide & Tracker

An offline, open-source guide and tracker for all **55 Grand Theft Auto VI
trophies** on PlayStation 5 (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden;
0 online trophies), built for the make.fun bounty
`gta6-trophy-guide-01`.

## What it is

- **Tracker** — every trophy with its official name, description and grade, a
  checklist saved in the browser (localStorage), progress counters for the
  trophies that have counts (250 stunts, 42 Shooting Range challenges, 100
  WAiNK locations…), export to JSON and import back, search, filters by kind
  (story, missable, collectibles, activities, side quests, combat & heists,
  money) and grade, and a spoiler setting that hides story trophies until
  they are earned.
- **Roadmap to the platinum** — four stages built from the official
  descriptions and PowerPyx's roadmap: story (60–80 hours), stranger
  strands, activities and collectibles, then combat, heists, money and the
  100% checklist. About 200 hours, one playthrough, difficulty 4/10.
- **Missables** — only one trophy is flagged as possibly missable
  (Positive Mental Attitude: the first meditation is missable in Chapter 1),
  plus a watch list of one-time moments and one-way choices. Five trophies
  are marked as not yet pinned down by PowerPyx, and their guides say so
  instead of guessing.
- **Cited guides** — every trophy has a guide written for this entry, in our
  own words, naming its sources beside it (Exophase, PSNProfiles, PowerPyx,
  GTA Zone). Names and descriptions are PlayStation's, shown as published.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: every file the page loads lives under `app/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored `vendor/makefun-frontend.ts` library.

## Screenshots

`shots.json` records how the four screenshots in `screenshots/` were taken:
the tracker with a cited guide open, the roadmap, the missables page, and the
tracker with the spoiler setting on. They are real renders of this app in
desktop Chrome at 1280×800, taken with `?demo=1` seeding 13 earned trophies
(the app's own demo mode, which never overwrites saved progress).

## License

MIT — see `LICENSE`. Unofficial fan work, not affiliated with Rockstar Games.
