import clsx from "clsx";

type Props = {
  flipped: boolean;
};

export default function Coordinates({ flipped }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 pointer-events-none w-full h-full"
    >
      <text
        x={0.75}
        y={3}
        fontSize={2}
        className={clsx("font-bold fill-indigo-700")}
      >
        {flipped ? 1 : 8}
      </text>
      <text
        x={0.75}
        y={15.5}
        fontSize={2}
        className={clsx("font-bold fill-indigo-100", {})}
      >
        {flipped ? 2 : 7}
      </text>
      <text
        x={0.75}
        y={28}
        fontSize={2}
        className={clsx("font-bold fill-indigo-700", {})}
      >
        {flipped ? 3 : 6}
      </text>
      <text
        x={0.75}
        y={40.5}
        fontSize={2}
        className={clsx("font-bold fill-indigo-100", {})}
      >
        {flipped ? 4 : 5}
      </text>
      <text
        x={0.75}
        y={53}
        fontSize={2}
        className={clsx("font-bold fill-indigo-700", {})}
      >
        {flipped ? 5 : 4}
      </text>
      <text
        x={0.75}
        y={65.5}
        fontSize={2}
        className={clsx("font-bold fill-indigo-100", {})}
      >
        {flipped ? 6 : 3}
      </text>
      <text
        x={0.75}
        y={78}
        fontSize={2}
        className={clsx("font-bold fill-indigo-700", {})}
      >
        {flipped ? 7 : 2}
      </text>
      <text
        x={0.75}
        y={90.5}
        fontSize={2}
        className={clsx("font-bold fill-indigo-100", {})}
      >
        {flipped ? 8 : 1}
      </text>
      <text
        x={10}
        y={99}
        fontSize={2}
        className={clsx("font-bold fill-indigo-100", {})}
      >
        {flipped ? "h" : "a"}
      </text>
      <text
        x={22.5}
        y={99}
        fontSize={2}
        className={clsx("font-bold fill-indigo-700", {})}
      >
        {flipped ? "g" : "b"}
      </text>
      <text
        x={35}
        y={99}
        fontSize={2}
        className={clsx("font-bold fill-indigo-100", {})}
      >
        {flipped ? "f" : "c"}
      </text>
      <text
        x={47}
        y={99}
        fontSize={2}
        className={clsx("font-bold fill-indigo-700", {})}
      >
        {flipped ? "e" : "d"}
      </text>
      <text
        x={60}
        y={99}
        fontSize={2}
        className={clsx("font-bold fill-indigo-100", {})}
      >
        {flipped ? "d" : "e"}
      </text>
      <text
        x={72.5}
        y={99}
        fontSize={2}
        className={clsx("font-bold fill-indigo-700", {})}
      >
        {flipped ? "c" : "f"}
      </text>
      <text
        x={85}
        y={99}
        fontSize={2}
        className={clsx("font-bold fill-indigo-100", {})}
      >
        {flipped ? "b" : "g"}
      </text>
      <text
        x={97.5}
        y={99}
        fontSize={2}
        className={clsx("font-bold fill-indigo-700", {})}
      >
        {flipped ? "a" : "h"}
      </text>
    </svg>
  );
}
