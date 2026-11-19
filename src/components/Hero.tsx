import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ReleaseInfo } from "../lib/release";
import { APP_REPO_URL } from "../lib/release";
import { detectOS, primaryDownload } from "../lib/platform";

const title = "Sketchboard";
const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero({ release }: { release: ReleaseInfo }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drew, setDrew] = useState(false);
  const [cta, setCta] = useState(() => primaryDownload(release, null));

  useEffect(() => {
    setCta(primaryDownload(release, detectOS(navigator.userAgent)));
  }, [release]);

  useScribble(canvasRef, sectionRef, () => setDrew(true), Boolean(reduce));

  function moveSpotlight(event: React.PointerEvent<HTMLElement>) {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    section.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    section.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  function hideSpotlight() {
    sectionRef.current?.style.setProperty("--mx", "-999px");
    sectionRef.current?.style.setProperty("--my", "-999px");
  }

  const fadeUp = (index: number) => ({
    animate: { opacity: 1, y: 0 },
    initial: reduce ? false : { opacity: 0, y: 18 },
    transition: { delay: 0.5 + index * 0.12, duration: 0.7, ease }
  });

  return (
    <section ref={sectionRef} className="hero board-grid" onPointerMove={moveSpotlight} onPointerLeave={hideSpotlight}>
      <canvas ref={canvasRef} aria-label="Quadro para rabiscar" />
      <div className="wrap">
        <motion.div className="eyebrow" {...fadeUp(0)}>
          Open source · MIT · macOS, Windows, Linux
        </motion.div>
        <h1 aria-label={title}>
          {title.split("").map((char, index) => (
            <motion.span
              key={index}
              aria-hidden="true"
              className="ch"
              initial={reduce ? false : { opacity: 0, y: 56 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.035, duration: 0.8, ease }}
            >
              {char}
            </motion.span>
          ))}
        </h1>
        <motion.p className="sub" {...fadeUp(1)}>
          Workflows, texto, imagens e rabiscos.
        </motion.p>
        <svg className="wave" viewBox="0 0 600 120" aria-hidden="true">
          <motion.path
            d="M12 104C60 20 130 4 210 30S330 112 420 100S520 50 588 14"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.9, duration: 1.5, ease: [0.6, 0.1, 0.2, 1] }}
          />
        </svg>
        <motion.div className="cta" {...fadeUp(2)}>
          <a className="btn primary" href={cta.href}>
            {cta.label}
          </a>
          <a className="btn" href={APP_REPO_URL} target="_blank" rel="noopener">
            Ver código
          </a>
        </motion.div>
        <motion.div className={drew ? "hint gone" : "hint"} {...fadeUp(3)}>
          Rabisque aqui. O traço some sozinho.
        </motion.div>
      </div>
    </section>
  );
}

interface Stroke {
  end: number;
  points: { x: number; y: number }[];
}

const hold = 2500;
const fade = 5000;

// Freehand drawing on the hero background. Strokes fade out after a few seconds.
function useScribble(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  sectionRef: RefObject<HTMLElement | null>,
  onFirstStroke: () => void,
  reduce: boolean
) {
  // Keep the latest callback without restarting the effect (which would clear the strokes).
  const onFirstStrokeRef = useRef(onFirstStroke);
  onFirstStrokeRef.current = onFirstStroke;

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !section || !ctx) return;

    let strokes: Stroke[] = [];
    let current: Stroke | null = null;
    let frame = 0;
    let dpr = 1;

    function draw() {
      if (!canvas || !ctx) return;
      const now = performance.now();
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 7;
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#fff";

      strokes = strokes.filter((stroke) => {
        const age = stroke.end ? now - stroke.end - hold : 0;
        const alpha = reduce ? 1 : Math.max(0, 1 - Math.max(0, age) / fade);
        if (alpha <= 0) return false;

        const points = stroke.points;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        if (points.length === 1) ctx.lineTo(points[0].x + 0.01, points[0].y);
        for (let i = 1; i < points.length - 1; i += 1) {
          const midX = (points[i].x + points[i + 1].x) / 2;
          const midY = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
        }
        if (points.length > 1) ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();
        return true;
      });

      ctx.globalAlpha = 1;
      frame = strokes.length && !reduce ? requestAnimationFrame(draw) : 0;
    }

    function kick() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    function resize() {
      if (!canvas || !section || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = section.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function position(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function down(event: PointerEvent) {
      canvas!.setPointerCapture(event.pointerId);
      current = { end: 0, points: [position(event)] };
      strokes.push(current);
      onFirstStrokeRef.current();
      kick();
    }

    function move(event: PointerEvent) {
      if (!current) return;
      current.points.push(position(event));
      kick();
    }

    function up() {
      if (!current) return;
      current.end = performance.now();
      current = null;
      kick();
    }

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    const observer = new ResizeObserver(resize);
    observer.observe(section);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [canvasRef, sectionRef, reduce]);
}
