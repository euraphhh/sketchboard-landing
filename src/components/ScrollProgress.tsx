import { motion, useScroll, useSpring } from "motion/react";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { damping: 40, restDelta: 0.001, stiffness: 200 });

  return <motion.div aria-hidden="true" className="progress" style={{ scaleX }} />;
}
