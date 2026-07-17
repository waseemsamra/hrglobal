import { MongoClient, GridFSBucket } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "hr_system";

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable so the client is reused across
  // module reloads caused by Hot Module Replacement (HMR).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb() {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

// Returns a GridFS bucket for storing/retrieving file bytes.
export async function getBucket(bucketName = "documents") {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName });
}

export default clientPromise;
