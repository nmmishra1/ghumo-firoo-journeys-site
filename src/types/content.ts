export interface Attraction {
  name: string;
  summary: string;
  tips?: string[];
}

export interface StayArea {
  area: string;
  bestFor: string[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

export interface DestinationGuide {
  type: 'destination';
  slug: string;
  title: string;
  region: string;
  country: string;
  summary: string;
  content?: string;
  heroImage?: string;
  bestTime: string;
  quickFacts: Record<string, string>;
  attractions: Attraction[];
  cultureEtiquette: string[];
  gettingAround: string[];
  whereToStay: StayArea[];
  costsPerDay: {
    budget: string;
    midrange: string;
    luxury: string;
  };
  itineraries: ItineraryDay[];
  sustainability: string[];
  faqs: { q: string; a: string }[];
  updatedAt: string;
}

export interface ContentBrief {
  slug: string;
  title: string;
  targetKeywords: string[];
  outline: string[];
  faqs: string[];
  sources?: string[];
  notes?: string;
}

export type AnyContent = DestinationGuide;