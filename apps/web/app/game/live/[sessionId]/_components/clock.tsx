import clsx from "clsx";
import { Color } from "ks-engine";
import { useEffect, useRef, useState } from "react";

type Props = {
  timeRemaining: number | null;
  color: Color;
  isTicking: boolean;
};

const formatTimeRemaining = (timeRemaining: number) => {
  if (timeRemaining < 0) timeRemaining = 0;

  const minutesExact = timeRemaining / 60000;
  const minutes = Math.floor(minutesExact).toString().padStart(2, "0");
  const secondsExact = (timeRemaining / 1000) % 60;

  let seconds =
    secondsExact < 1 && minutesExact < 1
      ? secondsExact.toFixed(2).padStart(5, "0")
      : Math.floor(secondsExact).toString().padStart(2, "0");

  return minutes + ":" + seconds;
};

export default function Clock({ timeRemaining, color, isTicking }: Props) {
  const [localTimeRemaining, setLocalTimeRemaining] = useState<number | null>(
    timeRemaining
  );
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("./clock-web-worker.ts", import.meta.url)
    );

    workerRef.current.onmessage = (event) => {
      setLocalTimeRemaining(event.data);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    setLocalTimeRemaining(timeRemaining);
    if (isTicking && timeRemaining !== null) {
      workerRef.current?.postMessage({ command: "start", timeRemaining });
    } else {
      workerRef.current?.postMessage({ command: "stop" });
    }
  }, [isTicking, timeRemaining]);

  if (localTimeRemaining === null || isNaN(localTimeRemaining)) return null;

  return (
    <div
      className={clsx("border rounded text-4xl font-bold py-2 px-4", {
        "bg-neutral-900 text-white": color === Color.Black,
        "bg-white text-black border-neutral-300": color === Color.White,
      })}
    >
      {formatTimeRemaining(localTimeRemaining)}
    </div>
  );
}
