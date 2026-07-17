import { MongoClient, GridFSBucket } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "hr_system";

let client;
let clientPromise;

if (uri) {
  const options = {};

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export async function getDb() {
  if (!clientPromise) {
    throw new Error("MONGODB_URI is not configured.");
  }
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

export async function getBucket(bucketName = "documents") {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName });
}

export default clientPromise;
