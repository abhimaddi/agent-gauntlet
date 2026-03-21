export interface LiveWebPreset {
  id: string;
  label: string;
  url: string;
  task: string;
}

export const LIVE_WEB_PRESETS: LiveWebPreset[] = [
  {
    id: 'amazon-toothpaste',
    label: 'Amazon Toothpaste',
    url: 'https://www.amazon.com',
    task: 'Go to amazon.com, search for "Sensodyne toothpaste", and add the first result to the cart.',
  },
  {
    id: 'google-flights',
    label: 'Google Flights',
    url: 'https://www.google.com/flights',
    task: 'Go to Google Flights and find the cheapest one-way flight from New York (JFK) to Los Angeles (LAX) for next Friday.',
  },
  {
    id: 'techcrunch-newsletter',
    label: 'TechCrunch Newsletter',
    url: 'https://techcrunch.com',
    task: 'Go to TechCrunch.com and sign up for their newsletter using the email address test@sentinelarena.local.',
  },
];
