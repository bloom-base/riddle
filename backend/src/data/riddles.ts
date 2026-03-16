/**
 * Daily Riddles Collection
 * Curated set of classic and original riddles
 * Rotates daily based on UTC date
 */

export interface Riddle {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export const RIDDLES: Riddle[] = [
  {
    id: "riddle_1",
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "An echo",
    difficulty: "medium",
    category: "nature"
  },
  {
    id: "riddle_2",
    question: "The more you take, the more you leave behind. What am I?",
    answer: "Footsteps",
    difficulty: "easy",
    category: "wordplay"
  },
  {
    id: "riddle_3",
    question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    answer: "A map",
    difficulty: "medium",
    category: "objects"
  },
  {
    id: "riddle_4",
    question: "What has keys but no locks, space but no room, and you can enter but can't go inside?",
    answer: "A keyboard",
    difficulty: "easy",
    category: "technology"
  },
  {
    id: "riddle_5",
    question: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?",
    answer: "Fire",
    difficulty: "medium",
    category: "nature"
  },
  {
    id: "riddle_6",
    question: "What gets wet while drying?",
    answer: "A towel",
    difficulty: "easy",
    category: "objects"
  },
  {
    id: "riddle_7",
    question: "I have branches, but no fruit, trunk, or leaves. What am I?",
    answer: "A bank",
    difficulty: "hard",
    category: "wordplay"
  },
  {
    id: "riddle_8",
    question: "What can travel around the world while staying in a corner?",
    answer: "A stamp",
    difficulty: "medium",
    category: "objects"
  },
  {
    id: "riddle_9",
    question: "I am always hungry and will die if not fed, but whatever I touch will soon turn red. What am I?",
    answer: "Fire",
    difficulty: "medium",
    category: "nature"
  },
  {
    id: "riddle_10",
    question: "What has a head and a tail but no body?",
    answer: "A coin",
    difficulty: "easy",
    category: "objects"
  },
  {
    id: "riddle_11",
    question: "I can be cracked, made, told, and played. What am I?",
    answer: "A joke",
    difficulty: "medium",
    category: "wordplay"
  },
  {
    id: "riddle_12",
    question: "What goes up but never comes down?",
    answer: "Your age",
    difficulty: "easy",
    category: "logic"
  },
  {
    id: "riddle_13",
    question: "I have a thousand needles but I do not sew. What am I?",
    answer: "A porcupine",
    difficulty: "medium",
    category: "nature"
  },
  {
    id: "riddle_14",
    question: "What begins with T, ends with T, and has T in it?",
    answer: "A teapot",
    difficulty: "hard",
    category: "wordplay"
  },
  {
    id: "riddle_15",
    question: "I run but never walk, have a bed but never sleep, have a mouth but never speak. What am I?",
    answer: "A river",
    difficulty: "medium",
    category: "nature"
  }
];

/**
 * Get the riddle for a specific date
 * Uses deterministic date-based selection
 */
export function getRiddleOfDay(date: Date = new Date()): Riddle {
  // Use UTC date to ensure consistency across timezones
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dateString = utcDate.toISOString().split('T')[0];

  // Create a deterministic seed from the date
  const hash = dateString.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  // Select riddle based on hash
  const riddleIndex = Math.abs(hash) % RIDDLES.length;

  return RIDDLES[riddleIndex];
}
