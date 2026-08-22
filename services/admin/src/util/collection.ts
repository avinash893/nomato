import { connectDb } from "../config/db";

export const getRestaurantCollection = async () => {
  const db = await connectDb();
  return db.collection("restaurants");
};

export const getRiderCollection = async () => {
  const db = await connectDb();
  return db.collection("riders");
};
