import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DocumentScanner from "react-native-document-scanner-plugin";
import { RootStackParamList } from "../App";

type Nav = NativeStackNavigationProp<RootStackParamList, "DocumentScanner">;

export default function DocumentScannerScreen() {
  const navigation = useNavigation<Nav>();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  async function startScan() {
    setScanning(true);
    setError("");
    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        croppedImageQuality: 90,
      });
      if (scannedImages && scannedImages.length > 0) {
        navigation.navigate("ScanPreview", { imageUris: scannedImages });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // User cancelled — not an error worth surfacing
      if (!msg.toLowerCase().includes("cancel") && !msg.toLowerCase().includes("dismiss")) {
        setError("Scan failed: " + msg);
      }
    } finally {
      setScanning(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.heading}>Document Scanner</Text>
        <Text style={styles.body}>
          Position your document on a flat, well-lit surface. The scanner will
          automatically detect edges and crop to a clean page.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.scanBtn, pressed && { opacity: 0.8 }]}
          onPress={startScan}
          disabled={scanning}
        >
          {scanning ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.scanBtnText}>Open Camera</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0d1117",
    paddingHorizontal: 20,
  },
  backBtn: { paddingTop: 12, paddingBottom: 8, alignSelf: "flex-start" },
  backText: { color: "#1a7f6e", fontSize: 15, fontWeight: "600" },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#e6edf3",
  },
  body: {
    fontSize: 15,
    color: "#8b949e",
    lineHeight: 22,
  },
  error: {
    fontSize: 13,
    color: "#f85149",
    backgroundColor: "#f8514922",
    borderRadius: 10,
    padding: 12,
  },
  scanBtn: {
    backgroundColor: "#1a7f6e",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  scanBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
