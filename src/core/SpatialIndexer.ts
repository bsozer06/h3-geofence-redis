import { latLngToCell, polygonToCells } from "h3-js";

export class SpatialIndexer {
  private static RESOLUTION = 9; // ~0.1 km²

  static getCell(lat: number, lng: number): string {
    return latLngToCell(lat, lng, this.RESOLUTION);
  }

  static getPolygonCells(coordinates: [number, number][]): string[] {
    // Converts the polygon to an H3 set.
    return polygonToCells(coordinates, this.RESOLUTION);
  }
}