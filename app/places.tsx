import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePlaces } from "../lib/places";
import type { Place } from "../lib/types";

export default function PlacesScreen() {
  const { places, loading, removePlace, updatePlace, reloadPlaces } = usePlaces();
  const [refreshing, setRefreshing] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reloadPlaces();
    setRefreshing(false);
  };

  const navigateToPlace = (place: Place) => {
    router.push({
      pathname: "/",
      params: { focusLat: place.lat.toString(), focusLng: place.lng.toString() },
    });
  };

  const confirmDelete = (place: Place) => {
    Alert.alert("ลบสถานที่", `ต้องการลบ "${place.title}" หรือไม่?`, [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบ", style: "destructive", onPress: () => handleDelete(place.id) },
    ]);
  };

  const handleDelete = async (id: string) => {
    try {
      await removePlace(id);
    } catch {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถลบสถานที่ได้");
    }
  };

  const openEditModal = (place: Place) => {
    setEditingPlace(place);
    setEditTitle(place.title);
    setEditDesc(place.desc);
  };

  const handleUpdate = async () => {
    if (!editingPlace || !editTitle.trim()) {
      return Alert.alert("กรอกข้อมูลไม่ครบ", "กรุณาใส่ชื่อสถานที่");
    }
    setIsUpdating(true);
    try {
      await updatePlace(editingPlace.id, { title: editTitle.trim(), desc: editDesc.trim() });
      setEditingPlace(null);
      setEditTitle("");
      setEditDesc("");
    } catch {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถแก้ไขสถานที่ได้");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("th-TH", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const renderPlaceItem = ({ item: place }: { item: Place }) => (
    <TouchableOpacity style={styles.placeCard} onPress={() => navigateToPlace(place)} activeOpacity={0.7}>
      <View style={styles.placeContent}>
        <View style={styles.placeHeader}>
          <View style={styles.placeIcon}>
            <Ionicons name="location" size={20} color="#34A853" />
          </View>
          <View style={styles.placeInfo}>
            <Text style={styles.placeTitle} numberOfLines={1}>{place.title}</Text>
            <Text style={styles.placeCoords}>📍 {place.lat.toFixed(4)}, {place.lng.toFixed(4)}</Text>
            {!!place.desc && <Text style={styles.placeDesc} numberOfLines={2}>{place.desc}</Text>}
            <Text style={styles.placeDate}>บันทึกเมื่อ {formatDate(place.createdAt)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.placeActions}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={(e) => { e.stopPropagation(); openEditModal(place); }}>
          <Ionicons name="pencil" size={18} color="#4285F4" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={(e) => { e.stopPropagation(); confirmDelete(place); }}>
          <Ionicons name="trash" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="location-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>ยังไม่มีสถานที่ที่บันทึก</Text>
      <Text style={styles.emptyDesc}>กดปุ่ม “บันทึกสถานที่” ในแผนที่เพื่อเพิ่มสถานที่โปรด</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/")}>
        <Ionicons name="add" size={20} color="white" />
        <Text style={styles.addButtonText}>ไปที่แผนที่</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>สถานที่ที่บันทึก</Text>
        <Text style={styles.headerSubtitle}>ทั้งหมด {places.length} สถานที่</Text>
      </View>

      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaceItem}
        contentContainerStyle={[styles.listContainer, places.length === 0 && styles.emptyListContainer]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Edit Modal */}
      <Modal visible={!!editingPlace} animationType="slide" onRequestClose={() => setEditingPlace(null)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>แก้ไขสถานที่</Text>
            <TouchableOpacity onPress={() => setEditingPlace(null)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {editingPlace && (
              <View style={styles.locationInfo}>
                <Ionicons name="location-outline" size={20} color="#4285F4" />
                <Text style={styles.locationText}>
                  📍 {editingPlace.lat.toFixed(6)}, {editingPlace.lng.toFixed(6)}
                </Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ชื่อสถานที่ *</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น ร้านกาแฟโปรด, บ้าน, ที่ทำงาน"
                placeholderTextColor="#999"
                value={editTitle}
                onChangeText={setEditTitle}
                maxLength={50}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>คำอธิบาย (ไม่บังคับ)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="เพิ่มรายละเอียดเกี่ยวกับสถานที่นี้"
                placeholderTextColor="#999"
                value={editDesc}
                onChangeText={setEditDesc}
                multiline
                numberOfLines={4}
                maxLength={200}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleUpdate} disabled={isUpdating || !editTitle.trim()}>
                {isUpdating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.buttonText}>บันทึกการเปลี่ยนแปลง</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditingPlace(null)} disabled={isUpdating}>
                <Text style={[styles.buttonText, { color: "#666" }]}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  loadingText: { fontSize: 16, color: "#666" },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#E5E5E5" },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#1F2937", marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: "#6B7280" },
  listContainer: { padding: 16 },
  emptyListContainer: { flex: 1 },

  placeCard: {
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  placeContent: { flex: 1 },
  placeHeader: { flexDirection: "row", alignItems: "flex-start" },
  placeIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E8F5E8", alignItems: "center", justifyContent: "center", marginRight: 12 },
  placeInfo: { flex: 1 },
  placeTitle: { fontSize: 18, fontWeight: "600", color: "#1F2937", marginBottom: 4 },
  placeCoords: { fontSize: 14, color: "#6B7280", fontFamily: "monospace", marginBottom: 4 },
  placeDesc: { fontSize: 14, color: "#4B5563", lineHeight: 20, marginBottom: 6 },
  placeDate: { fontSize: 12, color: "#9CA3AF" },
  placeActions: { flexDirection: "row", gap: 8, marginLeft: 8 },
  actionButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  editButton: { backgroundColor: "#EFF6FF" },
  deleteButton: { backgroundColor: "#FEF2F2" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#374151", marginTop: 16, marginBottom: 8, textAlign: "center" },
  emptyDesc: { fontSize: 16, color: "#6B7280", textAlign: "center", lineHeight: 24, marginBottom: 32 },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#4285F4", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, gap: 8 },
  addButtonText: { color: "white", fontSize: 16, fontWeight: "600" },

  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: "#E5E5E5" },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  closeButton: { padding: 4 },
  modalContent: { flex: 1, padding: 20 },
  locationInfo: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", padding: 12, borderRadius: 12, marginBottom: 20, gap: 8 },
  locationText: { fontSize: 14, color: "#374151", fontFamily: "monospace" },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 12, padding: 16, fontSize: 16, color: "#000", backgroundColor: "#FAFAFA" },
  textArea: { height: 100, textAlignVertical: "top" },
  buttonContainer: { gap: 12, marginTop: 20 },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16, borderRadius: 12, gap: 8 },
  saveButton: { backgroundColor: "#4285F4" },
  cancelButton: { backgroundColor: "#F3F4F6" },
  buttonText: { fontSize: 16, fontWeight: "600", color: "white" },
});
