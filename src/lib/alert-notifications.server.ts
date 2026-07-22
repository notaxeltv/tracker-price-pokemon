import "server-only";

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { buildPortfolioRows } from "./portfolio-resolve";
import { getPriceAlertStatus } from "./portfolio";
import type { DashboardData, PortfolioData } from "./types";

interface AlertState {
  notified: Record<string, string>;
  updatedAt: string;
}

function getAlertStatePath(): string {
  return process.env.ALERT_STATE_PATH ?? path.join(process.cwd(), "data/alert-state.json");
}

async function loadAlertState(): Promise<AlertState> {
  try {
    const raw = await readFile(getAlertStatePath(), "utf-8");
    return JSON.parse(raw) as AlertState;
  } catch {
    return { notified: {}, updatedAt: new Date().toISOString() };
  }
}

async function saveAlertState(state: AlertState): Promise<void> {
  const filePath = getAlertStatePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(state, null, 2), "utf-8");
}

export interface AlertNotificationPayload {
  type: "price_alert";
  status: "above" | "below";
  key: string;
  title: string;
  subtitle?: string;
  marketPrice: number;
  threshold: number;
  triggeredAt: string;
}

async function sendWebhook(payload: AlertNotificationPayload): Promise<boolean> {
  const url = process.env.ALERT_WEBHOOK_URL?.trim();
  if (!url) return false;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

async function sendEmailViaWebhook(payload: AlertNotificationPayload): Promise<boolean> {
  const url = process.env.ALERT_EMAIL_WEBHOOK_URL?.trim();
  if (!url) return false;

  const subject = `[Pokémon Tracker] Alert ${payload.status === "above" ? "↑" : "↓"} — ${payload.title}`;
  const body = [
    `Prodotto: ${payload.title}`,
    payload.subtitle ? `Set: ${payload.subtitle}` : "",
    `Prezzo mercato: €${payload.marketPrice.toFixed(2)}`,
    `Soglia: €${payload.threshold.toFixed(2)}`,
    `Tipo: ${payload.status === "above" ? "Sopra soglia (target vendita)" : "Sotto soglia (stop loss)"}`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, body, payload }),
  });
  return res.ok;
}

export async function dispatchPriceAlerts(
  data: DashboardData,
  portfolio: PortfolioData
): Promise<{ sent: number; active: number }> {
  const rows = buildPortfolioRows(data, portfolio.entries);
  const state = await loadAlertState();
  let sent = 0;
  let active = 0;
  const hasNotifyTarget =
    Boolean(process.env.ALERT_WEBHOOK_URL?.trim()) ||
    Boolean(process.env.ALERT_EMAIL_WEBHOOK_URL?.trim());

  for (const row of rows) {
    const status = getPriceAlertStatus(row.entry, row.marketPrice);
    if (!status || row.marketPrice == null) continue;

    active++;
    const notifyKey = `${row.key}:${status}`;
    if (state.notified[notifyKey]) continue;

    const threshold =
      status === "above" ? row.entry.alertAbove! : row.entry.alertBelow!;

    const payload: AlertNotificationPayload = {
      type: "price_alert",
      status,
      key: row.key,
      title: row.title,
      subtitle: row.subtitle,
      marketPrice: row.marketPrice,
      threshold,
      triggeredAt: new Date().toISOString(),
    };

    if (hasNotifyTarget) {
      const webhookOk = await sendWebhook(payload);
      const emailOk = await sendEmailViaWebhook(payload);
      if (webhookOk || emailOk) {
        state.notified[notifyKey] = new Date().toISOString();
        sent++;
      }
    } else {
      state.notified[notifyKey] = new Date().toISOString();
    }
  }

  state.updatedAt = new Date().toISOString();
  await saveAlertState(state);

  return { sent, active };
}

export async function mergePortfolioEntries(
  incoming: Record<string, import("./types").PortfolioEntry>
): Promise<PortfolioData> {
  const { loadPortfolio, savePortfolio } = await import("./portfolio.server");
  const current = await loadPortfolio();
  const entries = { ...current.entries };

  for (const [key, entry] of Object.entries(incoming)) {
    entries[key] = { ...entries[key], ...entry };
  }

  const next: PortfolioData = {
    entries,
    updatedAt: new Date().toISOString(),
  };
  await savePortfolio(next);
  return next;
}
