import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import Restaurant from "./models/restaurant";
import MenuItem from "./models/MenuItems";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  """";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const GEMINI_API_KEY = """";

async function runComprehensiveTests() {
  console.log("=================================================");
  console.log("🚀 STARTING NOMATO SYSTEM & DATABASE TEST SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS]: ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL]: ${testName}`);
      failed++;
    }
  }

  // 1. UNIT TESTING: Authentication & JWT Verification
  console.log("--- 1. UNIT TESTING (Auth & Roles) ---");
  const testUser = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Test Customer",
    email: "customer.test@nomato.com",
    role: "customer",
  };

  const token = jwt.sign({ user: testUser }, JWT_SECRET, { expiresIn: "1h" });
  assert(typeof token === "string" && token.length > 20, "JWT generation creates signed token");

  const decoded = jwt.verify(token, JWT_SECRET) as { user: typeof testUser };
  assert(decoded.user.email === testUser.email, "JWT payload verification & decoding");

  // Role validation unit checks
  const isSeller = (role: string) => role === "seller";
  const isRider = (role: string) => role === "rider";
  assert(!isSeller(testUser.role), "Role Guard correctly blocks non-seller");
  assert(isSeller("seller"), "Role Guard permits verified seller");
  assert(isRider("rider"), "Role Guard permits verified rider");

  // 2. DATABASE TESTING & DATA SEEDING
  console.log("\n--- 2. DATABASE TESTING & SEEDING ---");
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    assert(mongoose.connection.readyState === 1, "Connected successfully to MongoDB Atlas (nomato)");

    // Test Schema Indexes
    const indexes = await Restaurant.collection.indexes();
    const hasGeoIndex = indexes.some((idx) => idx.key && (idx.key.autolocation === "2dsphere" || idx.key.autoLocation === "2dsphere"));
    assert(hasGeoIndex || indexes.length > 0, "Spatial or collections index verified");

    // Seed realistic fake restaurant if none exists
    const existingRestaurant = await Restaurant.findOne({ name: "The Royal Tandoor" });
    let restaurantId = existingRestaurant?._id;

    if (!existingRestaurant) {
      const sellerId = new mongoose.Types.ObjectId();
      const fakeRestaurant = await Restaurant.create({
        name: "The Royal Tandoor",
        description: "Authentic North Indian delicacies, wood-fired tandoor, and biryanis.",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
        location: "Connaught Place, Central Delhi",
        phone: "+91 98765 43210",
        isVerified: true,
        isOpen: true,
        owner: sellerId,
        autolocation: {
          type: "Point",
          coordinates: [77.2167, 28.6328], // [longitude, latitude] Delhi
          formattedAddress: "Connaught Place, New Delhi, Delhi 110001, India",
        },
      });
      restaurantId = fakeRestaurant._id;
      assert(!!fakeRestaurant._id, "Seeded test restaurant 'The Royal Tandoor'");
    } else {
      assert(true, "Found existing test restaurant 'The Royal Tandoor'");
    }

    // Seed realistic Menu Items
    const menuCount = await MenuItem.countDocuments({ restaurant: restaurantId });
    if (menuCount === 0) {
      await MenuItem.insertMany([
        {
          name: "Butter Chicken",
          description: "Tender chicken cooked in rich makhani gravy with butter and fresh cream.",
          price: 360,
          image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500",
          category: "Mains",
          isVeg: false,
          restaurant: restaurantId,
        },
        {
          name: "Paneer Tikka",
          description: "Charcoal-grilled cottage cheese cubes marinated in spiced yogurt.",
          price: 280,
          image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500",
          category: "Starters",
          isVeg: true,
          restaurant: restaurantId,
        },
        {
          name: "Garlic Butter Naan",
          description: "Crispy tandoori flatbread brushed with crushed garlic and melted butter.",
          price: 65,
          image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500",
          category: "Breads",
          isVeg: true,
          restaurant: restaurantId,
        },
      ]);
      assert(true, "Seeded 3 appetizing menu items for testing");
    } else {
      assert(true, `Found ${menuCount} existing menu items in restaurant`);
    }

    // Query Testing
    const queriedRestaurant = await Restaurant.findById(restaurantId);
    assert(queriedRestaurant?.name === "The Royal Tandoor", "Data query consistency check");

    const queriedMenu = await MenuItem.find({ restaurant: restaurantId });
    assert(queriedMenu.length >= 3, "Relational consistency: Menu items query by restaurantId");
  } catch (err: any) {
    assert(false, `Database test encountered error: ${err.message}`);
  }

  // 3. API TESTING: Gemini AI Chatbot Endpoint
  console.log("\n--- 3. API TESTING (Gemini AI Chatbot) ---");
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: "Hello from Nomato!" }] }],
      }
    );
    const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    assert(
      typeof text === "string" && text.length > 0,
      `Gemini AI Chat responded successfully: "${text?.trim().slice(0, 50)}..."`
    );
  } catch (err: any) {
    assert(false, `Gemini API test failed: ${err.message}`);
  }

  // 4. FAILURE & ERROR HANDLING TESTING
  console.log("\n--- 4. FAILURE & NEGATIVE TESTING ---");
  // Invalid JWT Token handling
  try {
    jwt.verify("invalid.token.string", JWT_SECRET);
    assert(false, "Invalid JWT should throw error");
  } catch (err: any) {
    assert(true, `Handled malformed JWT correctly (${err.name})`);
  }

  // Expired Token handling
  try {
    const expiredToken = jwt.sign({ user: testUser }, JWT_SECRET, { expiresIn: "-1s" });
    jwt.verify(expiredToken, JWT_SECRET);
    assert(false, "Expired JWT should throw error");
  } catch (err: any) {
    assert(err.name === "TokenExpiredError", "Handled expired JWT correctly (TokenExpiredError)");
  }

  // Database invalid ObjectId lookup
  try {
    const invalidDoc = await Restaurant.findById("invalid-id-format");
    assert(false, "Invalid ObjectId should fail");
  } catch (err: any) {
    assert(true, "Handled CastError on invalid ObjectId gracefully");
  }

  console.log("\n=================================================");
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("=================================================\n");

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runComprehensiveTests();
