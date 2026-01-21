import { GeofenceService } from "./db/GeofenceService.js";
import { SpatialIndexer } from "./core/SpatialIndexer.js";

const geofenceService = new GeofenceService();

// A testing range (e.g., near Beşiktaş Square)
const besiktasPolygon: [number, number][] = [
  [41.041, 29.006],
  [41.043, 29.009],
  [41.040, 29.012],
  [41.038, 29.008],
  [41.041, 29.006]
];

async function init() {
  console.log("--- Initializing Geofence System ---");
  
  // 1. Save the polygon to Redis (by splitting it into H3 cells)
  const fenceId = "besiktas_zone";
  const cells = SpatialIndexer.getPolygonCells(besiktasPolygon);
  
  // We add these cells to Redis using SADD
  await geofenceService.setupFence(fenceId, besiktasPolygon);
  
  console.log(`${fenceId} area has been defined with ${cells.length} H3 cells.`);
}

export { geofenceService };

init();