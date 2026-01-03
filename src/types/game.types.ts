export type GameStage =
  | "setup"
  | "roleReveal"
  | "gameplay"
  | "votingResult"
  | "timerExpired";

export type WordCategory =
  | "animals"
  | "cities"
  | "professions"
  | "objects"
  | "food"
  | "drinks"
  | "smoking"
  | "entertainment"
  | "relationships"
  | "games"
  | "hobbies"
  | "holidays"
  | "sports";

export interface Player {
  id: string;
  name: string;
  isActive: boolean;
  isSpy: boolean;
}

export interface VotingState {
  [playerId: string]: string; // playerId who voted -> playerId they voted for
}

export interface GameSettings {
  spyCount: number;
  categories: WordCategory[];
  timerDuration: number; // в секундах
  showCategoryToSpy: boolean;
  showLetterCountToSpy: boolean;
  showFirstLetterToSpy: boolean;
}

export interface GameState {
  stage: GameStage;
  players: Player[];
  activePlayers: Player[];
  currentWord: string;
  currentCategory: WordCategory | null;
  settings: GameSettings;
  roleRevealIndex: number;
  votes: VotingState;
  eliminatedPlayer: Player | null;
  winner: "spies" | "civilians" | null;
  spies: Player[];
}

export interface WordsData {
  [key: string]: string[];
}

export interface HintQuestion {
  id: string;
  question: string;
}
