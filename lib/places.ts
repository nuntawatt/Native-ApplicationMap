import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { Place } from "./types";

const STORAGE_KEY = "@SAVED_PLACES";

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadPlaces = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setPlaces(raw ? JSON.parse(raw) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadPlaces();
  }, []);

  const persist = async (next: Place[]) => {
    setPlaces(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addPlace = async (p: Place) => persist([p, ...places]);

  const removePlace = async (id: string) =>
    persist(places.filter((x) => x.id !== id));

  const updatePlace = async (id: string, patch: Partial<Pick<Place, "title"|"desc">>) =>
    persist(
      places.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );

  const clearAll = async () => persist([]);

  return { places, loading, addPlace, removePlace, updatePlace, clearAll, reloadPlaces };
}
