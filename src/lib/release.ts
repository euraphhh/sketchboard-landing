// Fetches the latest Sketchboard release at build time.
// Vercel rebuilds the site when the app's release workflow calls the deploy hook,
// so the download links are always current without client-side API calls.
export const APP_REPO = "kaikynetto/sketchboard";
export const APP_REPO_URL = `https://github.com/${APP_REPO}`;

export type AssetKey = "mac-arm64" | "mac-x64" | "win" | "linux-appimage" | "linux-deb" | "checksums";

export interface ReleaseAsset {
  name: string;
  size: number;
  url: string;
}

export interface ReleaseInfo {
  assets: Partial<Record<AssetKey, ReleaseAsset>>;
  url: string;
  version: string | null;
}

const patterns: Record<AssetKey, RegExp> = {
  checksums: /^SHA256SUMS\.txt$/,
  "linux-appimage": /linux-x86_64\.AppImage$/,
  "linux-deb": /linux-amd64\.deb$/,
  "mac-arm64": /mac-arm64\.dmg$/,
  "mac-x64": /mac-x64\.dmg$/,
  win: /win-x64\.exe$/
};

const fallback: ReleaseInfo = {
  assets: {},
  url: `${APP_REPO_URL}/releases/latest`,
  version: null
};

export async function getLatestRelease(): Promise<ReleaseInfo> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  const token = import.meta.env.GITHUB_TOKEN;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${APP_REPO}/releases/latest`, { headers });

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const assets: ReleaseInfo["assets"] = {};

    for (const asset of data.assets ?? []) {
      const key = (Object.keys(patterns) as AssetKey[]).find((k) => patterns[k].test(asset.name));

      if (key) {
        assets[key] = { name: asset.name, size: asset.size, url: asset.browser_download_url };
      }
    }

    return {
      assets,
      url: data.html_url ?? fallback.url,
      version: typeof data.tag_name === "string" ? data.tag_name.replace(/^v/, "") : null
    };
  } catch {
    return fallback;
  }
}
