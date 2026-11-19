import type { ReleaseInfo } from "./release";

export type OS = "mac" | "win" | "linux";

export const osNames: Record<OS, string> = { linux: "Linux", mac: "macOS", win: "Windows" };

export function detectOS(userAgent: string): OS | null {
  const ua = userAgent.toLowerCase();

  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("android")) return null;
  if (ua.includes("win")) return "win";
  if (ua.includes("mac")) return "mac";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";

  return null;
}

export function primaryDownload(release: ReleaseInfo, os: OS | null) {
  if (!os) {
    return { href: "#download", label: "Baixar o Sketchboard" };
  }

  const asset =
    os === "mac" ? release.assets["mac-arm64"] : os === "win" ? release.assets.win : release.assets["linux-appimage"];

  return { href: asset?.url ?? release.url, label: `Baixar para ${osNames[os]}` };
}

export function formatSize(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}
