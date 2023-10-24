import { StockfishInstance } from "@/types";
import { Color, parseFEN } from "ks-engine";

class Queue {
  private getter: null | ((value: string | PromiseLike<string>) => void);
  private list: string[];

  constructor() {
    this.getter = null;
    this.list = [];
  }

  async get() {
    if (this.list.length > 0) {
      return this.list.shift()!;
    }

    return new Promise<string>((resolve) => (this.getter = resolve));
  }

  put(x: string) {
    if (this.getter) {
      this.getter(x);
      this.getter = null;
    } else {
      this.list.push(x);
    }
  }
}

type EvaluationData = {
  type: "evaluation";
  value: number;
  mateIn?: number;
};

type BestMoveData = {
  type: "bestmove";
  value: string | null;
};

type EngineOutput = EvaluationData | BestMoveData;

type Subscriber = (data: EngineOutput) => void;

export default class EngineWrapper {
  private readonly stockfishInstance: StockfishInstance;
  private queue: Queue;
  private subscribers: Subscriber[] = [];
  private activeColor: Color;

  constructor(stockfishInstance: StockfishInstance) {
    this.stockfishInstance = stockfishInstance;
    this.queue = new Queue();
    this.stockfishInstance.addMessageListener((line) => this.queue.put(line));
  }

  public subscribe(subscriber: Subscriber): () => void {
    this.subscribers.push(subscriber);
    return () => this.unsubscribe(subscriber);
  }

  public unsubscribe(subscriber: Subscriber) {
    const index = this.subscribers.indexOf(subscriber);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }

  public async initialize(options: Record<string, string | number> = {}) {
    this.send("uci");
    await this.receiveUntil((line) => line === "uciok");
    for (const name in options) {
      this.send(`setoption name ${name} value ${options[name]}`);
    }
    this.send("isready");
    await this.receiveUntil((line) => line === "readyok");
  }

  public async initializeGame() {
    this.send("ucinewgame");
    this.send("isready");
    await this.receiveUntil((line) => line === "readyok");
  }

  public async evaluatePosition(fen: string, depth: number) {
    const { activeColor } = parseFEN(fen);
    this.activeColor = activeColor;

    this.send("stop");
    this.send(`position fen ${fen}`);
    this.send(`go depth ${depth}`);

    await this.receiveUntil((line) => line.startsWith("bestmove"));
  }

  private notifySubscribers(data: EngineOutput) {
    for (const subscriber of this.subscribers) {
      subscriber(data);
    }
  }

  private send(command: string): void {
    this.stockfishInstance.postMessage(command);
  }

  private async receive() {
    const line = await this.queue.get();

    if (line.startsWith("info")) {
      const cpMatch = line.match(/score cp (-?\d+)/);
      const mateMatch = line.match(/score mate (-?\d+)/);

      if (cpMatch) {
        let evaluation =
          Math.max(-1000, Math.min(1000, parseInt(cpMatch[1]))) / 100;

        if (this.activeColor) {
          evaluation = -evaluation;
        }

        this.notifySubscribers({ type: "evaluation", value: evaluation });
      } else if (mateMatch) {
        const mateIn = parseInt(mateMatch[1]);
        let evaluation = mateIn > 0 ? 10 : -10;

        if (this.activeColor) {
          evaluation = -evaluation;
        }

        this.notifySubscribers({
          type: "evaluation",
          value: evaluation,
          mateIn: mateIn,
        });
      }
    } else if (line.startsWith("bestmove")) {
      const bestMove = line.split(" ")[1];
      this.notifySubscribers({ type: "bestmove", value: bestMove });
    }

    return line;
  }

  private async receiveUntil(predicate: (line: string) => boolean) {
    const lines: string[] = [];
    while (true) {
      const line = await this.receive();
      lines.push(line);
      if (predicate(line)) {
        break;
      }
    }
    return lines;
  }
}
