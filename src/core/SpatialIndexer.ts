import { latLngToCell, polygonToCells } from "h3-js";

export class SpatialIndexer {
  private static RESOLUTION = 9; // ~0.1 km²

  static getCell(lat: number, lng: number): string {
    return latLngToCell(lat, lng, this.RESOLUTION);
  }

  static getPolygonCells(coordinates: [number, number][]): string[] {
    // Poligonu H3 setine dönüştürür
    return polygonToCells(coordinates, this.RESOLUTION);
  }
}