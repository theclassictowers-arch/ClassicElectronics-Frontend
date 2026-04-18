const { MongoClient } = require('mongodb');

// Data from dummyData.ts (valveCategories only)
const valveCategories = [
  {
    name: "Solenoid Valves",
    slug: "solenoid-valves",
    _id: "valve-1",
    children: [
      {
        name: "ASCO Type",
        slug: "solenoid-valves/asco-type",
        _id: "sv-1",
        items: [
          { name: "AMF-Z-20", slug: "asco/amf-z-20", _id: "asco-1", description: "Right Angle, Standard Asco Type Port Size 3/4\"" },
          { name: "AMF-Z-25", slug: "asco/amf-z-25", _id: "asco-2", description: "Right Angle, Standard Asco Type Port Size 1\"" },
          { name: "AMF-Z-40S", slug: "asco/amf-z-40s", _id: "asco-3", description: "Right Angle, Standard Asco Type Port Size 1 1/2\"" },
          { name: "AMF-Z-50S", slug: "asco/amf-z-50s", _id: "asco-4", description: "Right Angle, Standard Asco Type Port Size 2\"" },
          { name: "AMF-Z-62S", slug: "asco/amf-z-62s", _id: "asco-5", description: "Right Angle, Standard Asco Type Port Size 2 1/2\"" },
          { name: "AMF-Z-76S", slug: "asco/amf-z-76s", _id: "asco-6", description: "Submerge, Asco Type Port Size 3\"" }
        ]
      },
      {
        name: "GOYEN Type",
        slug: "solenoid-valves/goyen-type",
        _id: "sv-3",
        items: [
          { name: "TMF-Z-20", slug: "goyen/tmf-z-20", _id: "goyen-1", description: "Right Angle Goyen Type Port Size 3/4\"" },
          { name: "TMF-Z-25", slug: "goyen/tmf-z-25", _id: "goyen-2", description: "Right Angle Goyen Type Port Size 1\"" },
          { name: "TMF-Z-40S", slug: "goyen/tmf-z-40s", _id: "goyen-3", description: "Right Angle Goyen Type Port Size 1 1/2\"" },
          { name: "TMF-Z-50S", slug: "goyen/tmf-z-50s", _id: "goyen-4", description: "Right Angle Goyen Type Port Size 2\"" },
          { name: "TMF-Z-62S", slug: "goyen/tmf-z-62s", _id: "goyen-5", description: "Right Angle Goyen Type Port Size 2 1/2\"" },
          { name: "TMF-Z-76S", slug: "goyen/tmf-z-76s", _id: "goyen-6", description: "Right Angle Goyen Type Port Size 3\"" },
          { name: "TMF-Z-25DD", slug: "goyen/tmf-z-25dd", _id: "goyen-7", description: "Pipe Connection Goyen Type Port Size 1\"" },
          { name: "TMF-Z-45DD", slug: "goyen/tmf-z-45dd", _id: "goyen-8", description: "Pipe Connection Goyen Type Port Size 1 1/2\"" },
          { name: "TMF-Y-50S", slug: "goyen/tmf-y-50s", _id: "goyen-9", description: "Submerged Type Goyen Type Port Size 2\"" },
          { name: "TMF-Y-62S", slug: "goyen/tmf-y-62s", _id: "goyen-10", description: "Submerged Type Goyen Type Port Size 2 1/2\"" },
          { name: "TMF-Y-76S", slug: "goyen/tmf-y-76s", _id: "goyen-11", description: "Submerged Type Goyen Type Port Size 3\"" },
          { name: "TMF-Y-89S", slug: "goyen/tmf-y-89s", _id: "goyen-12", description: "Submerged Type Goyen Type Port Size 3\"" }
        ]
      }
    ]
  },
  {
    name: "Diaphragm Valves",
    slug: "diaphragm-valves",
    _id: "valve-2",
    children: [
      {
        name: "ASCO Type Repair Kits",
        slug: "diaphragm-valves/asco-repair-kits",
        _id: "dv-rk-1",
        items: [
          { name: 'C113-443: Diaphragm + Spring (3/4" Angle Type Valve)', slug: "diaphragm/asco/c113-443", _id: "asco-rk-1", description: "Diaphragm + Spring for ASCO 3/4\" and 1\" right angle type pulse valve. Material Silica Gel." },
          { name: 'C113-827: Diaphragm + Spring (1.5" Solenoid Pulse Valve)', slug: "diaphragm/asco/c113-827", _id: "asco-rk-2", description: "Diaphragm + Spring for ASCO 1.5\" right angle type solenoid pulse valve. Material NBR or Viton." },
          { name: 'C113-685: Diaphragm + Spring (2" Solenoid Pulse Valve)', slug: "diaphragm/asco/c113-685", _id: "asco-rk-3", description: "Diaphragm + Spring for ASCO 2\" right angle type solenoid pulse valve. Material NBR or Viton." }
        ]
      },
      {
        name: "Goyen Type Repair Kits",
        slug: "diaphragm-valves/goyen-repair-kits",
        _id: "dv-rk-2",
        items: [
          { name: "K2003 & K2007: Diaphragm + Spring", slug: "diaphragm/goyen/k2003-k2007", _id: "goyen-rk-1", description: "Diaphragm + Spring for Goyen type pulse valve. Material Nylon, NBR or Viton." },
          { name: "K2501 & K2503: Diaphragm + Spring", slug: "diaphragm/goyen/k2501-k2503", _id: "goyen-rk-2", description: "Diaphragm + Spring for Goyen type pulse valve. Material Nylon, NBR or Viton." },
          { name: "K4502 & K4503: Diaphragm + Spring (Small and Big)", slug: "diaphragm/goyen/k4502-k4503", _id: "goyen-rk-3", description: "Diaphragm + Spring (small and big) for Goyen type pulse valve. Material Nylon, NBR or Viton." },
          { name: "K5004 & K5000: Diaphragm + Spring (Small and Big)", slug: "diaphragm/goyen/k5004-k5000", _id: "goyen-rk-4", description: "Diaphragm + Spring (small and big) for Goyen type pulse valve. Material Nylon, NBR or Viton." },
          { name: "K4000: Diaphragm + Spring (Big + Small)", slug: "diaphragm/goyen/k4000", _id: "goyen-rk-5", description: "Diaphragm + Spring (big + small) for Goyen type pulse valve." }
        ]
      },
      {
        name: "Turbo Type Repair Kits",
        slug: "diaphragm-valves/turbo-repair-kits",
        _id: "dv-rk-3",
        items: [
          { name: "M25: Diaphragm + Spring", slug: "diaphragm/turbo/m25", _id: "turbo-rk-1", description: "Diaphragm + Spring for Turbo 3/4\" and 1\" pulse valve. Material NBR." },
          { name: "M40 + M25: Diaphragm + Spring", slug: "diaphragm/turbo/m40-m25", _id: "turbo-rk-2", description: "Diaphragm + Spring for Turbo 1.5\" pulse valve. Material NBR." },
          { name: "M50 + M25: Diaphragm + Spring", slug: "diaphragm/turbo/m50-m25", _id: "turbo-rk-3", description: "Diaphragm + Spring for Turbo 2\" pulse valve. Material NBR." },
          { name: "M75 + M25: Diaphragm + Spring", slug: "diaphragm/turbo/m75-m25", _id: "turbo-rk-4", description: "Diaphragm + Spring for Turbo 2\" pulse valve. Material NBR." }
        ]
      },
      {
        name: "Mecair Type Repair Kits",
        slug: "diaphragm-valves/mecair-repair-kits",
        _id: "dv-rk-4",
        items: [
          { name: "DB16: Diaphragm + Spring (Mecair 3/4\" pulse valve)", slug: "diaphragm/mecair/db16", _id: "mecair-rk-1", description: "Diaphragm + Spring for Mecair 3/4\" pulse valve. Material NBR." },
          { name: "DB18: Diaphragm + Spring (Mecair 1\" pulse valve)", slug: "diaphragm/mecair/db18", _id: "mecair-rk-2", description: "Diaphragm + Spring for Mecair 1\" pulse valve. Material NBR." },
          { name: "DB112: Diaphragm + Spring (Mecair 1\" pulse valve)", slug: "diaphragm/mecair/db112", _id: "mecair-rk-3", description: "Diaphragm + Spring for Mecair 1\" pulse valve. Material NBR." },
          { name: "DB11 + DB16: Diaphragm + Spring (Mecair 1.5\" pulse valve)", slug: "diaphragm/mecair/db11-db16", _id: "mecair-rk-4", description: "Diaphragm + Spring for Mecair 1.5\" pulse valve. Material NBR." },
          { name: "DB116 + DB16: Diaphragm + Spring (Mecair 1\" pulse valve)", slug: "diaphragm/mecair/db116-db16", _id: "mecair-rk-5", description: "Diaphragm + Spring for Mecair 1\" pulse valve. Material NBR." },
          { name: "DB120 + DB16: Diaphragm + Spring (Mecair 1\" pulse valve)", slug: "diaphragm/mecair/db120-db16", _id: "mecair-rk-6", description: "Diaphragm + Spring for Mecair 1\" pulse valve. Material NBR." }
        ]
      }
    ]
  }
];

async function seed() {
  // Update this URI with your actual database connection string
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/classic-electronics";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to database");
    const db = client.db();
    const collection = db.collection("categories");

    // Insert the valve categories
    const result = await collection.insertMany(valveCategories);
    console.log(`Successfully inserted ${result.insertedCount} valve categories.`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seed();