export const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 2] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];
export const DEFAULT_PLAYBACK_SPEED: PlaybackSpeed = 1;

export const MUSIC_TRACK_KEYS = ["aurora", "voltage", "canopy", "horizon"] as const;
export type MusicTrackKey = (typeof MUSIC_TRACK_KEYS)[number];

export const MUSIC_TRACK_LABELS: Record<MusicTrackKey, string> = {
  aurora: "Aurora",
  voltage: "Voltaje",
  canopy: "Pradera",
  horizon: "Horizonte",
};

export const DEFAULT_MUSIC_TRACK: MusicTrackKey = "aurora";
