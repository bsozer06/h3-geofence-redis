import { GeofenceService } from "./db/GeofenceService.js";
import { SpatialIndexer } from "./core/SpatialIndexer.js";

const geofenceService = new GeofenceService();

// Test amaçlı bir poligon (Örn: Beşiktaş Meydan civarı)
const besiktasPolygon: [number, number][] = [
  [41.041, 29.006],
  [41.043, 29.009],
  [41.040, 29.012],
  [41.038, 29.008],
  [41.041, 29.006] // Kapatma noktası
];

async function init() {
  console.log("--- Geofence Sistemi Başlatılıyor ---");
  
  // 1. Poligonu Redis'e kaydet (H3 hücrelerine bölerek)
  const fenceId = "besiktas_zone";
  const cells = SpatialIndexer.getPolygonCells(besiktasPolygon);
  
  // GeofenceService içindeki addFence metodunu çağırıyoruz (Henüz yazmadıysan ekle)
  // Redis'e SADD ile bu hücreleri ekliyoruz
  await geofenceService.setupFence(fenceId, besiktasPolygon);
  
  console.log(`${fenceId} alanı ${cells.length} adet H3 hücresi ile tanımlandı.`);
}

export { geofenceService };
init();