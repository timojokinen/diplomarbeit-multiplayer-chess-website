"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { useContext } from "react";
import { StockfishContext } from "./stockfish-context";

type Props = {
  flipped?: boolean;
};

export default function EvalBar({ flipped }: Props) {
  const { evaluation, mateIn } = useContext(StockfishContext);
  const percent = 100 - ((evaluation + 10) / 20) * 100;
  return (
    <div className="w-6 h-full bg-white border border-gray-300 rounded relative flex justify-center">
      <motion.div
        initial={{ height: "50%" }}
        animate={{ height: percent + "%" }}
        className={clsx(
          "bg-black w-full absolute bottom-0 flex justify-center",
          {
            "bottom-0": flipped,
            "top-0": !flipped,
          }
        )}
      ></motion.div>
      <span className="text-xs mix-blend-difference text-white block mt-1">
        {typeof mateIn !== "undefined" && mateIn !== null && !isNaN(mateIn)
          ? "M" + Math.abs(mateIn)
          : "" + evaluation.toFixed(1)}
      </span>
    </div>
  );
}
