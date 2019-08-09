export interface GeoPointData {
  latitude: number;
  longitude: number;
}

export interface FirestormData {
  [key: string]:
  string | string[] |
  number | number[] |
  boolean | boolean[]; 
}