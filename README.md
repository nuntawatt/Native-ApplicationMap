# 📍 Location Map App

แอปพลิเคชันแผนที่สำหรับบันทึกและจัดการตำแหน่งสถานที่  
สร้างด้วย **React Native + Expo** และใช้ **react-native-maps**  

---

## 🚀 Features

- 🔍 แสดงตำแหน่งปัจจุบันของผู้ใช้บนแผนที่
- ⭐ บันทึกสถานที่ (พร้อมชื่อและคำอธิบาย)
- 📂 ดูรายการสถานที่ที่บันทึกไว้
- ✏️ แก้ไข / ลบสถานที่ได้
- 📌 กดจากรายการเพื่อโฟกัสไปยังตำแหน่งนั้นบนแผนที่
- 🎨 UI ทันสมัย รองรับทั้ง iOS และ Android

---

## 📦 การติดตั้ง

### 1. Clone โปรเจ็กต์
```bash
cd location-map-app
```

### 2. ติดตั้ง dependencies
```bash
npm install
```

### 3. ติดตั้ง Native Modules (Expo)
```bash
npx expo install react-native-maps expo-location react-native-safe-area-context @expo/vector-icons
```

---

## ▶️ รันแอป

### Development Mode
```bash
npx expo start
```

- กด **i** → เปิด iOS Simulator  
- กด **a** → เปิด Android Emulator  
- สแกน QR code → เปิดบน Expo Go

---

## 📂 โครงสร้างไฟล์

```
location-map-app/
│
├── app/                  # ไฟล์หน้าจอหลัก
│   ├── index.tsx         # หน้าหลัก: แสดงแผนที่ + FABs + Modal
│   ├── places.tsx        # รายการสถานที่ที่บันทึก
│   └── _layout.tsx       # Layout ของ expo-router
│
├── lib/
│   ├── places.ts         # Hook จัดการสถานที่
│   └── types.ts          # Type definitions
│
├── assets/              
├── package.json
├── app.json              # Expo config
├── tsconfig.json
└── README.md
```

---

## 🛠️ เทคโนโลยีที่ใช้

- [Expo](https://expo.dev/) – React Native development platform  
- [React Native Maps](https://github.com/react-native-maps/react-native-maps) – Map component  
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/) – ดึงตำแหน่งปัจจุบัน  
- [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) – รองรับพื้นที่ปลอดภัย  
- [Expo Router](https://expo.github.io/router/docs/) – จัดการ navigation  

---

