export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function maskName(name: string) {
  if (!name) return "u***r";
  if (name.length <= 2) return `${name[0]}*`;
  return `${name[0]}***${name[name.length - 1]}`;
}

export function parseImages(imageUrls: string): string[] {
  try {
    const parsed = JSON.parse(imageUrls);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
