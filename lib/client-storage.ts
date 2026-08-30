import { APP_DATA_VERSION } from "@/lib/domain";

export type PersonalOsSnapshot = {
  version: number;
  exportedAt: string;
  data: Record<string, string>;
};

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const value = localStorage.getItem(key); return value == null ? fallback : JSON.parse(value); }
  catch { return fallback; }
}

export function collectPersonalOsData(): Record<string, string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key?.startsWith("pos_")) data[key] = localStorage.getItem(key) || "";
  }
  return data;
}

export function migratePersonalOsData(data: Record<string, string>, fromVersion = 1) {
  const migrated = { ...data };
  if (fromVersion < 2 && !migrated.pos_reminders) migrated.pos_reminders = JSON.stringify([]);
  migrated.pos_data_version = JSON.stringify(APP_DATA_VERSION);
  return migrated;
}

export function createExport(): PersonalOsSnapshot {
  return { version: APP_DATA_VERSION, exportedAt: new Date().toISOString(), data: collectPersonalOsData() };
}

export function restoreExport(snapshot: PersonalOsSnapshot) {
  if (!snapshot || typeof snapshot.data !== "object") throw new Error("Invalid Personal OS backup");
  const migrated = migratePersonalOsData(snapshot.data, Number(snapshot.version || 1));
  Object.entries(migrated).forEach(([key, value]) => {
    if (key.startsWith("pos_") && typeof value === "string") localStorage.setItem(key, value);
  });
}
