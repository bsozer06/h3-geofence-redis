import { geofenceService } from "./index.js";

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Simulated route: [lat, lng]
const route: [number, number][] = [
  [41.035, 29.001], // Outside
  [41.037, 29.005], // Outside
  [41.041, 29.008], // INSIDE (Expecting ENTER)
  [41.042, 29.010], // INSIDE
  [41.041, 29.009], // INSIDE (Hysteresis test: even if it slightly goes outside here, it shouldn't immediately trigger exit)
  [41.030, 29.000], // OUTSIDE (Expecting EXIT)
];

async function runSimulation() {
  const assetId = "car_001";
  const fenceId = "besiktas_zone";

  console.log(`\n--- Simulation Started: Vehicle ${assetId} is moving ---\n`);

  for (const coord of route) {
    const [lat, lng] = coord;
    console.log(`Location Update: Lat:${lat}, Lng:${lng}`);

    const result = await geofenceService.processUpdate(assetId, lat, lng, fenceId);
    
    if (result === "ENTER") {
      console.log("🚨 [NOTIFICATION] VEHICLE ENTERED THE AREA!");
    } else if (result === "EXIT") {
      console.log("🚷 [NOTIFICATION] VEHICLE EXITED THE AREA!");
    } else {
      console.log("... Monitoring (No change)");
    }

    await sleep(1500); // Wait 1.5 seconds (for a real-time feel)
  }

  console.log("\n--- Simulation Completed ---");
  process.exit(0);
}

// Short delay to ensure index.ts is ready
setTimeout(runSimulation, 2000);
