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
    * * It divides the polygon into H3 cells and saves it as a Redis Set.
    */
  async setupFence(id: string, coordinates: [number, number][]) {
    const cells = SpatialIndexer.getPolygonCells(coordinates);
    const key = `fences:${id}`;

    // Clear old data and add new data.
    await this.redis.del(key);

    // Redis SADD (Set Add) accepts multiple arguments.
    if (cells.length > 0) {
      await this.redis.sadd(key, ...cells);
      console.log(`[DB] ${id} field: ${cells.length} cells were written to Redis.`);
    } else {
      throw new Error("The polygon area could not be divided into H3 cells. Please check the coordinates.");
    }

  }

  /**
  * Checks vehicle position (Lua Script call)
  */
  async processUpdate(assetId: string, lat: number, lng: number, fenceId: string): Promise<string> {
    const cell = SpatialIndexer.getCell(lat, lng);

  // We call the Lua script we defined
  // @ts-ignore
    return await this.redis.checkGeofence(assetId, cell, fenceId, 3);
  }
}