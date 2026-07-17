import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const DEFAULT_SETTINGS = {
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
  notifications: {
    email: true,
    push: false,
    sla: true,
  },
  security: {
    twoFactor: true,
  },
};

const SETTINGS_ID = "global";

// GET /api/settings -> current system settings (merged with defaults)
export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection("settings");
    const doc = await collection.findOne({ _id: SETTINGS_ID });

    const settings = {
      ...DEFAULT_SETTINGS,
      ...(doc ? doc.data : {}),
    };

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("Settings GET error:", err);
    return NextResponse.json({ error: "Failed to load settings." }, { status: 500 });
  }
}

// PUT /api/settings -> persist full or partial settings
export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("settings");

    const current = (await collection.findOne({ _id: SETTINGS_ID }))?.data || {};
    const merged = {
      profile: { ...DEFAULT_SETTINGS.profile, ...current.profile, ...(body.profile || {}) },
      organization: {
        ...DEFAULT_SETTINGS.organization,
        ...current.organization,
        ...(body.organization || {}),
      },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...current.notifications,
        ...(body.notifications || {}),
      },
      security: { ...DEFAULT_SETTINGS.security, ...current.security, ...(body.security || {}) },
    };

    await collection.updateOne(
      { _id: SETTINGS_ID },
      { $set: { data: merged, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, settings: merged });
  } catch (err) {
    console.error("Settings PUT error:", err);
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
  }
}
