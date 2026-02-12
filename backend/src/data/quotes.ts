/**
 * Famous U.S. Literature Quotes
 * Curated collection for daily quote fragment matching puzzle
 * Mix of canonical "everybody knows" quotes and deeper cuts
 * Target difficulty: High school senior level
 */

export interface Quote {
  id: string;
  author: string;
  book: string;
  openingFragment: string;
  closingFragment: string;
  fullQuote: string;
}

export const QUOTES: Quote[] = [
  {
    id: "twain_1",
    author: "Mark Twain",
    book: "The Adventures of Huckleberry Finn",
    openingFragment: "You don't know about me",
    closingFragment: "without you have read a book called The Adventures of Tom Sawyer",
    fullQuote: "You don't know about me without you have read a book called The Adventures of Tom Sawyer"
  },
  {
    id: "fitzgerald_1",
    author: "F. Scott Fitzgerald",
    book: "The Great Gatsby",
    openingFragment: "In my younger and more vulnerable years,",
    closingFragment: "my father gave me advice that I've been turning over in my mind ever since.",
    fullQuote: "In my younger and more vulnerable years, my father gave me advice that I've been turning over in my mind ever since."
  },
  {
    id: "fitzgerald_2",
    author: "F. Scott Fitzgerald",
    book: "The Great Gatsby",
    openingFragment: "So we beat on,",
    closingFragment: "boats against the current, borne back ceaselessly into the past.",
    fullQuote: "So we beat on, boats against the current, borne back ceaselessly into the past."
  },
  {
    id: "steinbeck_1",
    author: "John Steinbeck",
    book: "The Grapes of Wrath",
    openingFragment: "And the great owners, who must lose their land in an upheaval,",
    closingFragment: "the great owners with access to history, with eyes to read history and to know the great fact: when property accumulates in too few hands, it is taken away.",
    fullQuote: "And the great owners, who must lose their land in an upheaval, the great owners with access to history, with eyes to read history and to know the great fact: when property accumulates in too few hands, it is taken away."
  },
  {
    id: "hawthorne_1",
    author: "Nathaniel Hawthorne",
    book: "The Scarlet Letter",
    openingFragment: "It is a curious subject of observation and inquiry,",
    closingFragment: "whether hatred and love be not the same thing at bottom.",
    fullQuote: "It is a curious subject of observation and inquiry, whether hatred and love be not the same thing at bottom."
  },
  {
    id: "melville_1",
    author: "Herman Melville",
    book: "Moby Dick",
    openingFragment: "Call me",
    closingFragment: "Ishmael.",
    fullQuote: "Call me Ishmael."
  },
  {
    id: "thoreau_1",
    author: "Henry David Thoreau",
    book: "Walden",
    openingFragment: "Go confidently in the direction of your dreams,",
    closingFragment: "and endeavor to live the life which you have imagined.",
    fullQuote: "Go confidently in the direction of your dreams, and endeavor to live the life which you have imagined."
  },
  {
    id: "twain_2",
    author: "Mark Twain",
    book: "The Adventures of Tom Sawyer",
    openingFragment: "The secret to getting ahead is",
    closingFragment: "getting started.",
    fullQuote: "The secret to getting ahead is getting started."
  },
  {
    id: "morrison_1",
    author: "Toni Morrison",
    book: "Beloved",
    openingFragment: "Freeing yourself was one thing,",
    closingFragment: "claiming ownership of that freed self was another.",
    fullQuote: "Freeing yourself was one thing, claiming ownership of that freed self was another."
  },
  {
    id: "faulkner_1",
    author: "William Faulkner",
    book: "The Sound and the Fury",
    openingFragment: "I have come here to tell you the truth,",
    closingFragment: "the whole truth about what happened that night.",
    fullQuote: "I have come here to tell you the truth, the whole truth about what happened that night."
  }
];

export function getQuoteOfDay(date: Date = new Date()): Quote[] {
  // Create a deterministic seed from the date (year-month-day)
  const dateString = date.toISOString().split('T')[0];
  const hash = dateString.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  const startIndex = Math.abs(hash) % QUOTES.length;
  
  // Return 8-10 quotes for today's puzzle, rotating through the list
  const count = 8 + (Math.abs(hash) % 3);
  const todaysQuotes: Quote[] = [];
  
  for (let i = 0; i < count; i++) {
    todaysQuotes.push(QUOTES[(startIndex + i) % QUOTES.length]);
  }
  
  return todaysQuotes;
}
