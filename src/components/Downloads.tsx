import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { AssetKey, ReleaseInfo } from "../lib/release";
import { APP_REPO_URL } from "../lib/release";
import { detectOS, formatSize, type OS } from "../lib/platform";

const platforms: { items: { key: AssetKey; label: string; file: string }[]; os: OS; title: string }[] = [
  {
    items: [
      { file: "mac-arm64.dmg", key: "mac-arm64", label: "Apple Silicon" },
      { file: "mac-x64.dmg", key: "mac-x64", label: "Intel" }
    ],
    os: "mac",
    title: "macOS"
  },
  { items: [{ file: "win-x64.exe", key: "win", label: "Instalador x64" }], os: "win", title: "Windows" },
  {
    items: [
      { file: "x86_64.AppImage", key: "linux-appimage", label: "AppImage" },
      { file: "amd64.deb", key: "linux-deb", label: "Debian, Ubuntu" }
    ],
    os: "linux",
    title: "Linux"
  }
];

export default function Downloads({ release }: { release: ReleaseInfo }) {
  const reduce = useReducedMotion();
  const [os, setOS] = useState<OS | null>(null);

  useEffect(() => {
    setOS(detectOS(navigator.userAgent));
  }, []);

  const reveal = (index: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    transition: { delay: index * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    viewport: { amount: 0.2, once: true },
    whileInView: { opacity: 1, y: 0 }
  });

  return (
    <>
      <div className="dl">
        {platforms.map((platform, index) => (
          <motion.div key={platform.os} className={platform.os === os ? "os recommended" : "os"} {...reveal(index)}>
            <header>
              <h3>{platform.title}</h3>
              {platform.os === os && <span className="tag">para você</span>}
            </header>
            <ul>
              {platform.items.map((item) => {
                const asset = release.assets[item.key];
                return (
                  <li key={item.key}>
                    <a href={asset?.url ?? release.url}>
                      <b>{item.label}</b>
                      <small>{asset ? formatSize(asset.size) : item.file}</small>
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ))}
        <motion.div className="os" {...reveal(3)}>
          <header>
            <h3>Código</h3>
          </header>
          <ul>
            <li>
              <a href={APP_REPO_URL} target="_blank" rel="noopener">
                <b>GitHub</b>
                <small>MIT</small>
              </a>
            </li>
            <li>
              <a href={`${APP_REPO_URL}/releases`} target="_blank" rel="noopener">
                <b>Todas as versões</b>
                <small>↗</small>
              </a>
            </li>
          </ul>
        </motion.div>
      </div>
      <p className="note">
        {release.version ? `Versão ${release.version}. ` : "A primeira versão pública sai em breve. "}
        Os instaladores ainda não são assinados, então o macOS e o Windows podem pedir confirmação na primeira abertura.
        {release.assets.checksums && (
          <>
            {" "}
            Confira o download com o <a href={release.assets.checksums.url}>SHA256SUMS.txt</a>.
          </>
        )}
      </p>
    </>
  );
}
