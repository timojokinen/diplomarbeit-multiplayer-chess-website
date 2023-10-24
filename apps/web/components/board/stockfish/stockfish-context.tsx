"use client";

import EngineWrapper from "@/lib/stockfish";
import Script from "next/script";
import React, { useEffect, useState } from "react";

export const StockfishContext = React.createContext<{
  mateIn: null | number;
  bestMove: null | string;
  evaluation: number;
  depth: number;
  setDepth: (depth: number) => void;
}>(undefined as any);

export type Props = {
  children: React.ReactNode;
  FEN: string;
};

export default function StockfishProvider({ children, FEN }: Props) {
  const [engine, setEngine] = useState<EngineWrapper | null>(null);
  const [evaluation, setEvaluation] = useState<number>(0);
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [mateIn, setMateIn] = useState<number | null>(null);
  const [depth, setDepth] = useState(17);

  const initStockfish = async () => {
    if (!Stockfish) throw new Error("Stockfish.js was not loaded yet.");
    const sf = await Stockfish();
    await sf.ready;
    const engineWrapper = new EngineWrapper(sf);
    await engineWrapper.initialize({
      Threads: navigator?.hardwareConcurrency ?? 1,
    });
    await engineWrapper.initializeGame();
    setEngine(engineWrapper);
  };

  useEffect(() => {
    const unsubscribe = engine?.subscribe((data) => {
      if (data.type === "evaluation") {
        setEvaluation(data.value);
        setMateIn(data.mateIn ?? null);
        setBestMove(null);
      } else {
        setBestMove(data.value);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [engine]);

  useEffect(() => {
    if (engine && FEN) {
      engine.evaluatePosition(FEN, depth);
    }
  }, [FEN, engine, depth]);

  return (
    <>
      <StockfishContext.Provider
        value={{ bestMove, evaluation, mateIn, depth, setDepth }}
      >
        {children}
      </StockfishContext.Provider>
      <Script
        src="/stockfish.js"
        onReady={() => {
          initStockfish();
        }}
      ></Script>
    </>
  );
}
