import { getDb } from "@/lib/mongodb";

// Keep these defaults in sync with src/app/api/settings/route.js
export const DEFAULT_SETTINGS = {
  profile: {
    fullName: "Alex Thompson",
    email: "alex.thompson@recruitglobal.io",
    bio: "HR Director specialized in international talent acquisition and regional compliance strategies.",
  },
  organization: {
    name: "GlobalRecruit",
    hqLocation: "New York, NY",
    brandColor: "#0058BE",
  },
  notifications: { email: true, push: false, sla: true },
  security: { twoFactor: true },
};

const SETTINGS_ID = "global";

// Server-side helper: read the merged settings document directly from MongoDB.
export async function getSettings() {
  try {
    const db = await getDb();
    const doc = await db.collection("settings").findOne({ _id: SETTINGS_ID });
    return {
      ...DEFAULT_SETTINGS,
      ...(doc?.data || {}),
      organization: {
        ...DEFAULT_SETTINGS.organization,
        ...(doc?.data?.organization || {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Convenience: just the public-facing organization/brand name.
export async function getOrgName() {
  const s = await getSettings();
  return s.organization?.name || DEFAULT_SETTINGS.organization.name;
}
