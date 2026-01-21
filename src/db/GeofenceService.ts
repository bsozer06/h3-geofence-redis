import Redis from 'ioredis';
import { SpatialIndexer } from '../core/SpatialIndexer.js';

const CHECK_SCRIPT = `
  local assetId = KEYS[1]
  local currentCell = ARGV[1]
  local fenceId = ARGV[2]
  local threshold = tonumber(ARGV[3])

  local isInside = redis.call('SISMEMBER', 'fences:' .. fenceId, currentCell)
  local stateKey = 'asset:' .. assetId .. ':state'
  local counterKey = 'asset:' .. assetId .. ':counter'

  local lastState = redis.call('GET', stateKey)

  if isInside == 1 then
    redis.call('SET', stateKey, fenceId)
    redis.call('DEL', counterKey)
    if lastState ~= fenceId then return 'ENTER' end
  else
    if lastState == fenceId then
      local count = redis.call('INCR', counterKey)
      if count >= threshold then
        redis.call('DEL', stateKey)
        redis.call('DEL', counterKey)
        return 'EXIT'
      end
    end
  end
  return 'NO_CHANGE'
`;

export class GeofenceService {
    private redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null
    });

    constructor() {
        this.redis.defineCommand('checkGeofence', {
            numberOfKeys: 1,
            lua: CHECK_SCRIPT
        });
    }

    /**
      * Poligonu H3 hücrelerine böler ve Redis Set olarak kaydeder.
      */
    async setupFence(id: string, coordinates: [number, number][]) {
        const cells = SpatialIndexer.getPolygonCells(coordinates);
        const key = `fences:${id}`;

        // Eski veriyi temizle ve yenisini ekle
        await this.redis.del(key);

        // Redis SADD (Set Add) çok sayıda argümanı kabul eder
        if (cells.length > 0) {
            await this.redis.sadd(key, ...cells);
            console.log(`[DB] ${id} alanı için ${cells.length} hücre Redis'e yazıldı.`);
        } else {
            throw new Error("Poligon alanı H3 hücrelerine bölünemedi. Koordinatları kontrol edin.");
        }
    }

    /**
     * Araç konumunu kontrol eder (Lua Script çağrısı)
     */
    async processUpdate(assetId: string, lat: number, lng: number, fenceId: string): Promise<string> {
        const cell = SpatialIndexer.getCell(lat, lng);

        // Tanımladığımız Lua script'ini çağırıyoruz
        // @ts-ignore
        return await this.redis.checkGeofence(assetId, cell, fenceId, 3);
    }
}