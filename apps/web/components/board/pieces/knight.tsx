import { forwardRef } from "react";
import { PieceProps } from "./index";
import { Color } from "ks-engine";

const Knight = forwardRef<HTMLDivElement, PieceProps>(
  ({ pieceColor: color, ...rest }, ref) => {
    return (
      <div {...rest} ref={ref}>
        {color === Color.White ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <g
              fill="none"
              fillRule="evenodd"
              stroke="#000"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            >
              <path
                fill="#fff"
                d="M22 10.3c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"
              />
              <path
                fill="#fff"
                d="M24 18.3c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"
              />
              <path fill="#000" d="M9.5 25.8a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" />
              <path
                fill="#000"
                strokeWidth="1.49997"
                d="M14.933 16.05a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z"
              />
            </g>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
            <g
              fill="none"
              fillRule="evenodd"
              stroke="#000"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            >
              <path
                fill="#000"
                d="M22 10.3c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"
              />
              <path
                fill="#000"
                d="M24 18.3c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"
              />
              <path
                fill="#fff"
                stroke="#fff"
                d="M9.5 25.8a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z"
              />
              <path
                fill="#fff"
                stroke="#fff"
                strokeWidth="1.49997"
                d="M14.933 16.05a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z"
              />
              <path
                fill="#fff"
                stroke="none"
                d="m24.55 10.7-.45 1.45.5.15c3.15 1 5.65 2.49 7.9 6.75s3.25 10.31 2.75 20.25l-.05.5h2.25l.05-.5c.5-10.06-.88-16.85-3.25-21.34-2.37-4.49-5.79-6.64-9.19-7.16l-.51-.1z"
              />
            </g>
          </svg>
        )}
      </div>
    );
  }
);

Knight.displayName = "Knight";

export default Knight;
