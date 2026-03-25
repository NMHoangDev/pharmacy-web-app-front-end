import { getAccessToken, isTokenExpired } from "./auth";

const MEDIA_BASE_URL = "http://localhost:8087";

const isMediaUrl = (src) =>
  typeof src === "string" && src.includes("/api/media/");

const normalizeMediaUrl = (src) => {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/api/media/")) return `${MEDIA_BASE_URL}${src}`;
  return src;
};

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = () => reject(new Error("Không thể đọc dữ liệu ảnh."));
    reader.readAsDataURL(blob);
  });

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = () => reject(new Error("Không thể đọc dữ liệu ảnh."));
    reader.readAsDataURL(file);
  });

export const fetchMediaImageAsDataUrl = async (src) => {
  if (!src || src.startsWith("data:") || !isMediaUrl(src)) return src;
  const url = normalizeMediaUrl(src);
  const token = getAccessToken();
  const headers = {};
  if (token && !isTokenExpired(token)) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error("Không thể tải ảnh.");
  }
  const blob = await res.blob();
  return blobToDataUrl(blob);
};

export const resolveHtmlImagesToDataUrls = async (html) => {
  if (!html || typeof window === "undefined") return html || "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const imgs = Array.from(doc.images || []);
  const cache = new Map();

  for (const img of imgs) {
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:") || !isMediaUrl(src)) continue;
    try {
      let dataUrl = cache.get(src);
      if (!dataUrl) {
        dataUrl = await fetchMediaImageAsDataUrl(src);
        cache.set(src, dataUrl);
      }
      if (dataUrl) img.setAttribute("src", dataUrl);
    } catch (err) {
      // keep original src on failure
    }
  }

  return doc.body.innerHTML;
};

export const resolveJsonImagesToDataUrls = async (json) => {
  if (!json || typeof window === "undefined") return json;
  const clone = JSON.parse(JSON.stringify(json));
  const cache = new Map();

  const resolveSrc = async (src) => {
    if (!src || src.startsWith("data:") || !isMediaUrl(src)) return src;
    if (cache.has(src)) return cache.get(src);
    const dataUrl = await fetchMediaImageAsDataUrl(src);
    cache.set(src, dataUrl);
    return dataUrl;
  };

  const walk = async (node) => {
    if (!node) return;
    if (Array.isArray(node)) {
      for (const child of node) {
        await walk(child);
      }
      return;
    }
    if (node.type === "image" && node.attrs?.src) {
      node.attrs.src = await resolveSrc(node.attrs.src);
    }
    if (node.content) {
      await walk(node.content);
    }
  };

  await walk(clone);
  return clone;
};
