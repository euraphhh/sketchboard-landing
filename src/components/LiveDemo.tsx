import { useEffect, useRef, useState } from "react";
import { stagger, useAnimate, useInView, useReducedMotion } from "motion/react";

const tools = [
  { label: "Selecionar", path: "M5 3l14 8-6.5 1.5L10 19z" },
  { label: "Pincel", path: "M4 20l1-4L16 5l3 3L8 19zM14 7l3 3" },
  { label: "Marcador", path: "M12 4l7 7-6 6-7-7z" },
  { label: "Borracha", path: "M8 20h11M7 17l-3-3 9-9 6 6-7 7z" },
  { label: "Texto", path: "M6 5h12M12 5v14M8 19h8" }
];
const pencil = 1;
const text = 4;
const expression = "12 × 4";
const stop = new Error("stop");

// A looping demo of the app: pick the text tool, write a calculation,
// accept the suggested result and watch the workspace save.
export default function LiveDemo() {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInView(scope, { amount: 0.5 });
  const [activeTool, setActiveTool] = useState(pencil);
  const [status, setStatus] = useState("Workspace salvo");
  const hl = useRef<HTMLSpanElement>(null);
  const toolRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const strong = useRef<HTMLElement>(null);
  const res = useRef<HTMLSpanElement>(null);
  const suggest = useRef<HTMLDivElement>(null);
  const insert = useRef<HTMLSpanElement>(null);
  const cursor = useRef<SVGSVGElement>(null);
  const dot = useRef<HTMLElement>(null);

  // Resting state: the result already inserted, centered.
  useEffect(() => {
    if (strong.current && res.current) {
      animate(strong.current, { x: -res.current.offsetWidth / 2 }, { duration: 0 });
    }
  }, [animate]);

  useEffect(() => {
    if (reduce || !inView) return;

    let cancelled = false;
    const ok = () => {
      if (cancelled) throw stop;
    };
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)).then(ok);
    const step = async (animation: { then: (onResolve: () => void) => unknown }) => {
      await new Promise<void>((resolve) => animation.then(resolve));
      ok();
    };
    const chars = () => Array.from(scope.current.querySelectorAll<HTMLElement>(".c"));
    const center = (element: Element) => {
      const box = scope.current.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      return { x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + rect.height / 2 };
    };
    const selectTool = (index: number, instant = false) => {
      const tool = toolRefs.current[index];
      if (!tool || !hl.current) return;
      setActiveTool(index);
      animate(hl.current, { y: tool.offsetTop }, instant ? { duration: 0 } : { damping: 32, stiffness: 420, type: "spring" });
    };
    const press = (element: Element) => animate(element, { scale: [1, 0.82, 1] }, { duration: 0.25 });

    function reset() {
      animate(strong.current!, { opacity: 1, x: 0 }, { duration: 0 });
      animate(chars(), { opacity: 0 }, { duration: 0 });
      animate(res.current!, { opacity: 0 }, { duration: 0 });
      animate(suggest.current!, { opacity: 0, scale: 0.9, y: 6 }, { duration: 0 });
      animate(cursor.current!, { opacity: 0, scale: 1 }, { duration: 0 });
      selectTool(pencil, true);
      setStatus("Workspace salvo");
    }

    async function run() {
      const cursorEl = cursor.current!;

      while (true) {
        reset();
        const box = scope.current.getBoundingClientRect();
        animate(cursorEl, { x: box.width * 0.72, y: box.height * 0.82 }, { duration: 0 });
        await wait(400);
        await step(animate(cursorEl, { opacity: 1 }, { duration: 0.3 }));

        const tool = center(toolRefs.current[text]!);
        await step(animate(cursorEl, { x: tool.x - 6, y: tool.y - 4 }, { duration: 1, ease: "easeInOut" }));
        press(cursorEl);
        await wait(120);
        selectTool(text);
        await wait(550);

        const word = center(strong.current!);
        const wordWidth = strong.current!.getBoundingClientRect().width;
        await step(animate(cursorEl, { x: word.x - wordWidth / 2 - 8, y: word.y - 4 }, { duration: 0.9, ease: "easeInOut" }));
        await step(
          animate(chars(), { opacity: [0, 1], rotate: [-8, 0], y: [16, 0] }, { delay: stagger(0.15), duration: 0.35, ease: "easeOut" })
        );
        await wait(250);
        animate(suggest.current!, { opacity: [0, 1], scale: [0.85, 1], y: [8, 0] }, { damping: 24, stiffness: 380, type: "spring" });
        await wait(900);

        const button = center(insert.current!);
        await step(animate(cursorEl, { x: button.x - 4, y: button.y - 4 }, { duration: 0.8, ease: "easeInOut" }));
        press(cursorEl);
        animate(insert.current!, { scale: [1, 0.9, 1] }, { duration: 0.25 });
        await wait(160);

        animate(suggest.current!, { opacity: 0, scale: 0.9, y: 6 }, { duration: 0.2 });
        animate(res.current!, { opacity: [0, 1], x: [-12, 0] }, { duration: 0.45 });
        animate(strong.current!, { x: -res.current!.offsetWidth / 2 }, { damping: 26, stiffness: 260, type: "spring" });
        setStatus("Salvando…");
        animate(dot.current!, { opacity: [1, 0.25, 1] }, { duration: 0.5, repeat: 1 });
        animate(cursorEl, { opacity: 0 }, { duration: 0.4 });
        await wait(900);
        setStatus("Workspace salvo");
        await wait(2600);
        await step(animate(strong.current!, { opacity: 0 }, { duration: 0.4 }));
      }
    }

    run().catch((error) => {
      if (error !== stop) console.error(error);
    });

    return () => {
      cancelled = true;
    };
  }, [inView, reduce, animate, scope]);

  return (
    <div
      ref={scope}
      className="mock board-grid"
      role="img"
      aria-label="Demonstração do Sketchboard: a conta 12 vezes 4 escrita no quadro recebe a sugestão 48"
    >
      <div className="dots" aria-hidden="true">
        <i style={{ background: "#ff5f57" }} />
        <i style={{ background: "#febc2e" }} />
        <i style={{ background: "#28c840" }} />
      </div>
      <div className="switcher panel" aria-hidden="true">
        <div>
          <b>Landing workflow</b>
          <small>3 workflows</small>
        </div>
        <span>+</span>
      </div>
      <div className="rail panel" aria-hidden="true">
        <span ref={hl} className="hl" style={{ transform: "translateY(54px)" }} />
        {tools.map((tool, index) => (
          <span
            key={tool.label}
            ref={(element) => {
              toolRefs.current[index] = element;
            }}
            className={index === activeTool ? "tool active" : "tool"}
          >
            <svg viewBox="0 0 24 24">
              <path d={tool.path} />
            </svg>
          </span>
        ))}
        <hr />
        <div className="chip-color">
          <i />
          #FFFFFF
        </div>
      </div>
      <div className="math" aria-hidden="true">
        <strong ref={strong}>
          <span>
            {expression.split("").map((char, index) => (
              <span key={index} className="c">
                {char}
              </span>
            ))}
          </span>
          <span ref={res} className="res">
            = 48
          </span>
        </strong>
        <div ref={suggest} className="suggest panel">
          <code>= 48</code>
          <span ref={insert}>Inserir</span>
        </div>
      </div>
      <svg ref={cursor} className="cursor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 2l15 9-6.5 1.8L9 19z" fill="#ffffff" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <div className="pill l panel" aria-hidden="true">
        <i ref={dot} />
        {status}
      </div>
      <div className="pill r panel" aria-hidden="true">
        100%
      </div>
    </div>
  );
}
