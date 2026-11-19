import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const grid =
  "M128 0V1024M256 0V1024M384 0V1024M512 0V1024M640 0V1024M768 0V1024M896 0V1024M0 128H1024M0 256H1024M0 384H1024M0 512H1024M0 640H1024M0 768H1024M0 896H1024";

// The app icon, with the S drawn when it scrolls into view and again on hover.
export default function DrawIcon({ size }: { size: string }) {
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);

  return (
    <span className="tile" style={{ height: size, width: size }} onPointerEnter={() => setRun((n) => n + 1)} aria-hidden="true">
      <svg viewBox="0 0 1024 1024">
        <rect width="1024" height="1024" fill="#000000" />
        <path d={grid} stroke="#262626" strokeWidth="4" fill="none" />
        <motion.path
          key={run}
          d="M704 288C560 224 336 272 336 416C336 560 688 464 688 624C688 784 448 816 320 736"
          stroke="#ffffff"
          strokeWidth="84"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ amount: 0.6, once: true }}
          transition={{ duration: 1.5, ease: [0.6, 0.1, 0.2, 1] }}
        />
      </svg>
    </span>
  );
}
