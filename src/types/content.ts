export interface ContentSection {
  title: string;
  text: string;
  bullets?: string[];
  subsections?: { title: string; text: string }[];
}
export interface Comparison {
  caption: string;
  headers: string[];
  rows: string[][];
}
export interface ServiceContent {
  slug: string;
  title: string;
  description: string;
  sections: ContentSection[];
  faq: { question: string; answer: string }[];
  quoteChecklist: string[];
  comparison?: Comparison;
}
export interface GuideContent {
  illustration?: { src: string; alt: string; caption: string; width: number; height: number };
  slug: string;
  lead: string;
  sections: ContentSection[];
  comparison?: Comparison;
  references: { href: string; text: string }[];
}
