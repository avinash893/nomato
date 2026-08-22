import { MongoClient, Db } from "mongodb";

let client: MongoClient;
let db: Db;

export const connectDb = async (): Promise<Db> => {
  if (db) return db;

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nomato";
  client = new MongoClient(mongoUri);
  await client.connect();

  const dbName = process.env.DB_NAME || "nomato";
  db = client.db(dbName);

  console.log(`Admin service connected to MongoDB (${dbName})`);
  return db;
};
