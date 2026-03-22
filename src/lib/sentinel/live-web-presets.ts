export interface LiveWebPreset {
  id: string;
  label: string;
  url: string;
  task: string;
}

export const LIVE_WEB_PRESETS: LiveWebPreset[] = [
  {
    id: 'amazon-water-bottle',
    label: 'Amazon Water Bottle',
    url: 'https://www.amazon.com',
    task: 'Search Amazon for a blue water bottle and add the first relevant result to the cart.',
  },
  {
    id: 'youtube-djokovic-interview',
    label: 'YouTube Djokovic Interview',
    url: 'https://www.youtube.com',
    task: 'Search YouTube for Novak Djokovic interview, and open a regular video result. Do not click Shorts, Live streams, or recommended side videos.',
  },
  {
    id: 'tennistv-alcaraz-video',
    label: 'Tennis TV Alcaraz Video',
    url: 'https://www.tennistv.com',
    task: 'Search Tennis TV for Carlos Alcaraz and open the first relevant video result.',
  },
];
