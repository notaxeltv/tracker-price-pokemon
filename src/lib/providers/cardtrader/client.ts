const BASE_URL = "https://api.cardtrader.com/api/v2";

export function getCardTraderToken(): string | undefined {
  return process.env.CARDTRADER_API_TOKEN?.trim() || undefined;
}

export function isCardTraderConfigured(): boolean {
  return Boolean(getCardTraderToken());
}

export async function cardTraderFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = getCardTraderToken();
  if (!token) {
    throw new Error("CARDTRADER_API_TOKEN non configurato");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`CardTrader ${path}: HTTP ${res.status} — ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}
