import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

// Collection: countries
// Shape: { _id, name, code, cities: [{ id, name }], createdAt, updatedAt }

function serialize(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    code: doc.code || "",
    cities: Array.isArray(doc.cities) ? doc.cities : [],
  };
}

// GET /api/locations -> list of countries with their cities
export async function GET() {
  try {
    const db = await getDb();
    const countries = await db
      .collection("countries")
      .find({})
      .sort({ name: 1 })
      .toArray();
    return NextResponse.json({ countries: countries.map(serialize) });
  } catch (err) {
    console.error("Locations GET error:", err);
    return NextResponse.json({ error: "Failed to load locations." }, { status: 500 });
  }
}

// POST /api/locations
//   { action: "addCountry", name, code }
//   { action: "addCity", countryId, city }
export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDb();
    const col = db.collection("countries");

    if (body.action === "addCountry") {
      const name = (body.name || "").trim();
      if (!name) {
        return NextResponse.json({ error: "Country name is required." }, { status: 400 });
      }
      const existing = await col.findOne({
        name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      });
      if (existing) {
        return NextResponse.json({ error: "Country already exists." }, { status: 409 });
      }
      const doc = {
        name,
        code: (body.code || "").trim().toUpperCase(),
        cities: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await col.insertOne(doc);
      return NextResponse.json(
        { success: true, country: serialize({ ...doc, _id: result.insertedId }) },
        { status: 201 }
      );
    }

    if (body.action === "addCity") {
      const cityName = (body.city || "").trim();
      if (!body.countryId || !cityName) {
        return NextResponse.json(
          { error: "countryId and city are required." },
          { status: 400 }
        );
      }
      const country = await col.findOne({ _id: new ObjectId(body.countryId) });
      if (!country) {
        return NextResponse.json({ error: "Country not found." }, { status: 404 });
      }
      const dupe = (country.cities || []).some(
        (c) => c.name.toLowerCase() === cityName.toLowerCase()
      );
      if (dupe) {
        return NextResponse.json({ error: "City already exists." }, { status: 409 });
      }
      const city = { id: new ObjectId().toString(), name: cityName };
      await col.updateOne(
        { _id: new ObjectId(body.countryId) },
        { $push: { cities: city }, $set: { updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true, city }, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("Locations POST error:", err);
    return NextResponse.json({ error: "Failed to update locations." }, { status: 500 });
  }
}

// PUT /api/locations
//   { action: "updateCountry", countryId, name, code }
//   { action: "updateCity", countryId, cityId, name }
export async function PUT(request) {
  try {
    const body = await request.json();
    const db = await getDb();
    const col = db.collection("countries");

    if (body.action === "updateCountry") {
      const name = (body.name || "").trim();
      if (!body.countryId || !name) {
        return NextResponse.json(
          { error: "countryId and name are required." },
          { status: 400 }
        );
      }
      await col.updateOne(
        { _id: new ObjectId(body.countryId) },
        {
          $set: {
            name,
            code: (body.code || "").trim().toUpperCase(),
            updatedAt: new Date(),
          },
        }
      );
      return NextResponse.json({ success: true });
    }

    if (body.action === "updateCity") {
      const name = (body.name || "").trim();
      if (!body.countryId || !body.cityId || !name) {
        return NextResponse.json(
          { error: "countryId, cityId and name are required." },
          { status: 400 }
        );
      }
      await col.updateOne(
        { _id: new ObjectId(body.countryId), "cities.id": body.cityId },
        { $set: { "cities.$.name": name, updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("Locations PUT error:", err);
    return NextResponse.json({ error: "Failed to update locations." }, { status: 500 });
  }
}

// DELETE /api/locations?countryId=...            -> delete a country
// DELETE /api/locations?countryId=...&cityId=... -> delete a city
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("countryId");
    const cityId = searchParams.get("cityId");

    if (!countryId) {
      return NextResponse.json({ error: "countryId is required." }, { status: 400 });
    }

    const db = await getDb();
    const col = db.collection("countries");

    if (cityId) {
      await col.updateOne(
        { _id: new ObjectId(countryId) },
        { $pull: { cities: { id: cityId } }, $set: { updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true });
    }

    await col.deleteOne({ _id: new ObjectId(countryId) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Locations DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete location." }, { status: 500 });
  }
}
