import { MongoClient, Collection, Document } from "mongodb";

let cachedDb: Collection<Document> | null = null;

export async function connectToDB(
  dbName: string,
  collectionName: string
): Promise<Collection<Document>> {
  if (cachedDb) return cachedDb;

  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not defined");

  const client = await MongoClient.connect(process.env.MONGO_URI);

  const db = client.db(dbName);
  cachedDb = db.collection(collectionName);
  return cachedDb;
}
