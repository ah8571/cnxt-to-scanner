import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./screens/HomeScreen";
import DocumentScannerScreen from "./screens/DocumentScannerScreen";
import QRScannerScreen from "./screens/QRScannerScreen";
import ScanPreviewScreen from "./screens/ScanPreviewScreen";

export type RootStackParamList = {
  Home: undefined;
  DocumentScanner: undefined;
  QRScanner: undefined;
  ScanPreview: { imageUris: string[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0d1117" },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="DocumentScanner" component={DocumentScannerScreen} />
          <Stack.Screen name="QRScanner" component={QRScannerScreen} />
          <Stack.Screen name="ScanPreview" component={ScanPreviewScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
