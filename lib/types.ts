export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type Coordinates = { latitude: number; longitude: number };

export type Place = {
  id: string;
  title: string;
  desc: string;
  lat: number;
  lng: number;
  createdAt: string;
};
