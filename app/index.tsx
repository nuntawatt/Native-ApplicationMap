import { Link, useLocalSearchParams } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePlaces } from "../lib/places";
import type { Region, Coordinates } from "../lib/types";

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const bounceValue = useRef(new Animated.Value(1)).current;

  const { focusLat, focusLng } = useLocalSearchParams<{
    focusLat?: string;
    focusLng?: string;
  }>();

  const { places, addPlace } = usePlaces();

  const [region, setRegion] = useState<Region>({
    latitude: 13.736717,
    longitude: 100.523186,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [myCoord, setMyCoord] = useState<Coordinates | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (focusLat && focusLng && mapRef.current) {
      const lat = Number(focusLat);
      const lng = Number(focusLng);
      mapRef.current.animateToRegion(
        { latitude: lat, longitude: lng, latitudeDelta: 0.004, longitudeDelta: 0.004 },
        800
      );
    }
  }, [focusLat, focusLng]);

  const pulse = () => {
    Animated.sequence([
      Animated.timing(bounceValue, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(bounceValue, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    pulse();
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("ต้องอนุญาตตำแหน่ง", "ไปที่การตั้งค่าเพื่ออนุญาตให้แอปใช้ตำแหน่ง");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = pos.coords;
      const next: Region = { latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 };
      setMyCoord({ latitude, longitude });
      setRegion(next);
      mapRef.current?.animateToRegion(next, 1000);
    } catch (e) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถระบุตำแหน่งได้");
      console.error(e);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSavePlace = async () => {
    if (!myCoord) return Alert.alert("ไม่พบตำแหน่ง", "กดปุ่มตำแหน่งปัจจุบันก่อน");
    if (!title.trim()) return Alert.alert("กรอกข้อมูลไม่ครบ", "กรุณาใส่ชื่อสถานที่");
    setLoading(true);
    try {
      await addPlace({
        id: Date.now().toString(),
        title: title.trim(),
        desc: desc.trim(),
        lat: myCoord.latitude,
        lng: myCoord.longitude,
        createdAt: new Date().toISOString(),
      });
      setTitle("");
      setDesc("");
      setOpenModal(false);
      Alert.alert("บันทึกสำเร็จ 🎉", "เพิ่มสถานที่ใหม่เรียบร้อยแล้ว");
    } finally {
      setLoading(false);
    }
  };

  const mapStyle = [
    { featureType: "poi.business", stylers: [{ visibility: "off" }] },
    { featureType: "poi.park", elementType: "labels.text", stylers: [{ visibility: "off" }] },
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.wrap}>
        <MapView
          ref={mapRef}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          style={StyleSheet.absoluteFillObject}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          customMapStyle={mapStyle}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          rotateEnabled
          zoomEnabled
          scrollEnabled
        >
          {/* current location marker (render เฉพาะเมื่อมีค่า) */}
          {myCoord && (
            <Marker
              coordinate={{ latitude: myCoord.latitude, longitude: myCoord.longitude }}
              title="📍 ตำแหน่งปัจจุบัน"
              description="คุณอยู่ที่นี่"
              pinColor="#4285F4"
            />
          )}

          {/* saved places */}
          {places.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.lat, longitude: p.lng }}
              title={p.title}
              description={p.desc}
              pinColor="#34A853"
            />
          ))}
        </MapView>

        {/* FABs */}
        <View style={styles.fabContainer}>
          <Animated.View style={{ transform: [{ scale: bounceValue }] }}>
            <TouchableOpacity
              style={[styles.fab, styles.locationFab]}
              onPress={getCurrentLocation}
              disabled={locationLoading}
              activeOpacity={0.85}
            >
              {locationLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Ionicons name="location" size={22} color="white" />
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={[styles.fab, styles.addFab]}
            onPress={() => setOpenModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="bookmark" size={22} color="white" />
          </TouchableOpacity>

          <Link href="/places" asChild>
            <TouchableOpacity style={[styles.fab, styles.listFab]} activeOpacity={0.85}>
              <Ionicons name="list" size={22} color="white" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Modal บันทึกสถานที่ */}
        <Modal visible={openModal} animationType="slide" onRequestClose={() => setOpenModal(false)}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>บันทึกสถานที่ใหม่</Text>
              <TouchableOpacity onPress={() => setOpenModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {myCoord && (
                <View style={styles.locationInfo}>
                  <Ionicons name="location-outline" size={20} color="#4285F4" />
                  <Text style={styles.locationText}>
                    📍 {myCoord.latitude.toFixed(6)}, {myCoord.longitude.toFixed(6)}
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ชื่อสถานที่ *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="กรอกชื่อสถานที่"
                  placeholderTextColor="#9ca3af"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>คำอธิบาย (ไม่บังคับ)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="เพิ่มรายละเอียดเกี่ยวกับสถานที่นี้"
                  placeholderTextColor="#9ca3af"
                  value={desc}
                  onChangeText={setDesc}
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.btn, styles.saveBtn]}
                  onPress={handleSavePlace}
                  disabled={loading || !title.trim()}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons name="bookmark" size={18} color="white" />
                      <Text style={styles.btnText}>บันทึกสถานที่</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={() => setOpenModal(false)}
                  disabled={loading}
                >
                  <Text style={[styles.btnText, { color: "#666" }]}>ยกเลิก</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  wrap: { flex: 1, backgroundColor: "transparent" },

  fabContainer: { position: "absolute", right: 16, bottom: 20, gap: 12, alignItems: "center" },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  locationFab: { backgroundColor: "#4285F4" },
  addFab: { backgroundColor: "#34A853" },
  listFab: { backgroundColor: "#9333EA" },

  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  closeButton: { padding: 4 },
  modalContent: { flex: 1, padding: 20 },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  locationText: { fontSize: 14, color: "#374151", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#FAFAFA",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  actions: { gap: 12, marginTop: 8 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 12, gap: 8 },
  saveBtn: { backgroundColor: "#4285F4" },
  cancelBtn: { backgroundColor: "#F3F4F6" },
  btnText: { fontSize: 16, fontWeight: "600", color: "white" },
});
