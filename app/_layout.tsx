import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTransparent: true,
          headerShadowVisible: false,
          headerLargeTitle: false,
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
          contentStyle: { backgroundColor: "transparent" },
          animation: Platform.OS === "ios" ? "slide_from_right" : "fade_from_bottom",
        }}
      >
        <Stack.Screen name="index" options={{ title: "แผนที่" }} />
        <Stack.Screen
          name="places"
          options={{
            title: "สถานที่ที่บันทึก",
            presentation: "modal",
          }}
        />
      </Stack>
    </>
  );
}
