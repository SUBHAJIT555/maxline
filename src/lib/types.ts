export type CargoType =
  | "cargoBox"
  | "shippingContainer"
  | "airFreight"
  | "damagedCargo"
  | "restrictedCargo";

export type Participant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

export type ScoreEntry = {
  id: string;
  participantId: string;
  name: string;
  score: number;
  playedAt: string;
};

export type GridPosition = {
  col: number;
  row: number;
};

export type CargoItem = {
  id: string;
  type: CargoType;
  position: GridPosition;
  /** Epoch ms when this item disappears if it was not collected */
  expiresAt: number;
};

export type GameStatus = "idle" | "playing" | "finished";

export type GameSnapshot = {
  status: GameStatus;
  score: number;
  timeLeft: number;
  forklift: GridPosition;
  items: CargoItem[];
  /** Cell key → remaining spawn waves that must leave this cell empty. */
  cellSkips: Record<string, number>;
};
