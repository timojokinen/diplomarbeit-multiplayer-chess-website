import { forwardRef } from "react";
import { PieceProps } from "./index";
import { Color } from "ks-engine";

const Queen = forwardRef<HTMLDivElement, PieceProps>(
  ({ pieceColor: color, ...rest }, ref) => {
    return (
      <div {...rest} ref={ref}>
        {color === Color.White ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 45 45"
            className="w-full h-full"
          >
            <g
              fill="#fff"
              stroke="#000"
              strokeLinejoin="round"
              strokeWidth="1.5"
            >
              <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" />
              <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1 2.5-1 2.5-1.5 1.5 0 2.5 0 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
              <path
                fill="none"
                d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0"
              />
              <circle cx="6" cy="12" r="2" />
              <circle cx="14" cy="9" r="2" />
              <circle cx="22.5" cy="8" r="2" />
              <circle cx="31" cy="9" r="2" />
              <circle cx="39" cy="12" r="2" />
            </g>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 45 45"
            className="w-full h-full"
          >
            <g
              stroke="#000"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="butt"
                d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z"
              />
              <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1 2.5-1 2.5-1.5 1.5 0 2.5 0 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
              <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" />
              <circle cx="6" cy="12" r="2" />
              <circle cx="14" cy="9" r="2" />
              <circle cx="22.5" cy="8" r="2" />
              <circle cx="31" cy="9" r="2" />
              <circle cx="39" cy="12" r="2" />
              <path
                fill="none"
                strokeLinecap="butt"
                d="M11 38.5a35 35 1 0 0 23 0"
              />
              <g fill="none" stroke="#fff">
                <path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" />
              </g>
            </g>
          </svg>
        )}
      </div>
    );
  }
);

Queen.displayName = "Queen";

export default Queen;
