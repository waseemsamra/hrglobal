import { MongoClient } from "mongodb";

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://waseemsamra_db_user:qJYG7TunR4LnKUXi@cluster0.cpv8wig.mongodb.net/hr_system?appName=Cluster0";

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
