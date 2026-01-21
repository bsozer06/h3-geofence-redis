import { geofenceService } from "./index.js";

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Simüle edilmiş rota: [lat, lng]
const route: [number, number][] = [
  [41.035, 29.001], // Dışarıda
  [41.037, 29.005], // Dışarıda
  [41.041, 29.008], // İÇERİDE (Enter bekliyoruz)
  [41.042, 29.010], // İÇERİDE
  [41.041, 29.009], // İÇERİDE (Hysteresis testi: Burada hafif dışarı çıksa bile hemen exit demeyecek)
  [41.030, 29.000], // DIŞARIDA (Exit bekliyoruz)
];

async function runSimulation() {
  const assetId = "car_001";
  const fenceId = "besiktas_zone";

  console.log(`\n--- Simülasyon Başlıyor: Araç ${assetId} harekete geçiyor ---\n`);

  for (const coord of route) {
    const [lat, lng] = coord;
    console.log(`Konum Güncellemesi: Lat:${lat}, Lng:${lng}`);

    const result = await geofenceService.processUpdate(assetId, lat, lng, fenceId);
    
    if (result === "ENTER") {
      console.log("🚨 [BİLDİRİM] ARAÇ ALANA GİRDİ!");
    } else if (result === "EXIT") {
      console.log("🚷 [BİLDİRİM] ARAÇ ALANDAN ÇIKTI!");
    } else {
      console.log("... İzleniyor (Değişim yok)");
    }

    await sleep(1500); // 1.5 saniye bekle (Gerçek zamanlı hissi için)
  }

  console.log("\n--- Simülasyon Tamamlandı ---");
  process.exit(0);
}

// Index.ts'in hazır olması için kısa bir bekleme
setTimeout(runSimulation, 2000);