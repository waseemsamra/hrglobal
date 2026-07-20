import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("hr_system");

  const result = await db.collection("settings").updateOne(
    { _id: "global" },
    {
      $set: {
        "data.organization.name": "CareerHub",
        updatedAt: new Date(),
      },
    }
  );

  console.log("Updated:", result.modifiedCount);

  const settings = await db.collection("settings").findOne({ _id: "global" });
  console.log("New org name:", settings?.data?.organization?.name);

  await client.close();
}

main().catch(console.error);
