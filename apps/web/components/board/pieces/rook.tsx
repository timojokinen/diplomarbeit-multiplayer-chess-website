import { forwardRef } from "react";
import { PieceProps } from "./index";
import { Color } from "ks-engine";

const Rook = forwardRef<HTMLDivElement, PieceProps>(
  ({ pieceColor: color, ...rest }, ref) => {
    return (
      <div {...rest} ref={ref}>
        {color === Color.White ? (
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 45 45"
          >
            <g
              fill="#fff"
              fillRule="evenodd"
              stroke="#000"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="butt"
                d="M9 39.3h27v-3H9v3zM12 36.3v-4h21v4H12zM11 14.3v-5h4v2h5v-2h5v2h5v-2h4v5"
              />
              <path d="m34 14.3-3 3H14l-3-3" />
              <path
                strokeLinecap="butt"
                strokeLinejoin="miter"
                d="M31 17.3v12.5H14V17.3"
              />
              <path d="m31 29.8 1.5 2.5h-20l1.5-2.5" />
              <path fill="none" strokeLinejoin="miter" d="M11 14.3h23" />
            </g>
          </svg>
        ) : (
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 45 45"
          >
            <g
              fillRule="evenodd"
              stroke="#000"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="butt"
                d="M9 39.3h27v-3H9v3zM12.5 32.3l1.5-2.5h17l1.5 2.5h-20zM12 36.3v-4h21v4H12z"
              />
              <path
                strokeLinecap="butt"
                strokeLinejoin="miter"
                d="M14 29.8v-13h17v13H14z"
              />
              <path
                strokeLinecap="butt"
                d="m14 16.8-3-2.5h23l-3 2.5H14zM11 14.3v-5h4v2h5v-2h5v2h5v-2h4v5H11z"
              />
              <path
                fill="none"
                stroke="#fff"
                strokeLinejoin="miter"
                strokeWidth="1"
                d="M12 35.8h21M13 31.8h19M14 29.8h17M14 16.8h17M11 14.3h23"
              />
            </g>
          </svg>
        )}
      </div>
    );
  }
);

Rook.displayName = "Rook";

export default Rook;
