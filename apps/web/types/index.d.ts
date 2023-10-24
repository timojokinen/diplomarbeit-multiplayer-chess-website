export interface StockfishInstance {
  postMessage: (message: string) => void;
  addMessageListener: (listener: (message: string) => void) => void;
  ready: Promise<void>;
}

declare global {
  const Stockfish: (() => Promise<StockfishInstance>) | undefined;
}

export {};
