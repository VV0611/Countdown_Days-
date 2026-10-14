# 倒数日 · Countdown Day

A small cross-platform countdown/count-up tracker built with Expo Router. Pin the dates that matter, see milestone badges fire automatically, and switch the whole UI between Chinese and English.

Runs from a single codebase on iOS, Android, and the web.

## Features

- **Countdown & count-up events** — track days until a future date, or days since a past one.
- **Milestones** — automatic badges when an event hits (or is about to hit) a round number of days: 7, 100, 365, 1000, etc.
- **Live detail view** — a per-second countdown, plus the same gap expressed in weeks, months, and years.
- **Pinning** — pinned events float to the top of the list.
- **Color themes** — pick an accent color per event from a preset palette.
- **Bilingual UI** — toggle between 中文 and English from the settings screen; the choice is remembered.
- **Local persistence** — events and settings are stored on-device (AsyncStorage / localStorage on web) via Zustand, no backend required.

## Tech stack

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduce/) (file-based navigation, shared across iOS/Android/web)
- React Native 0.85 / React 19
- [Zustand](https://github.com/pmndrs/zustand) with the `persist` middleware for state + storage
- [dayjs](https://day.js.org/) for date math
- TypeScript throughout

## Project structure

```
app/                   Expo Router screens (file-based routes)
  index.tsx            Home — list of events
  settings.tsx          Language picker
  event/new.tsx         Create event
  event/[id]/index.tsx  Event detail
  event/[id]/edit.tsx   Edit / delete event
src/
  components/          EventCard, EventForm, ColorPicker, ConfirmDialog, EmptyState
  store/                eventStore (events) and settingsStore (language)
  i18n/                 translations.ts + useT() hook
  utils/                date math, milestone logic, web layout helper
```

## Getting started

```bash
npm install
npm run web       # or: npm start / npm run ios / npm run android
```

Requires Node and, for native builds, the Expo Go app or a configured iOS/Android toolchain — see the [Expo docs](https://docs.expo.dev/versions/v56.0.0/) for details.

## License

MIT — see [LICENSE](LICENSE).
