import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import React, { useState, useRef } from "react";
import {
  Alert,
  Clipboard,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type Nav = NativeStackNavigationProp<RootStackParamList, "QRScanner">;

type ScanResult = {
  type: string;
  data: string;
};

export default function QRScannerScreen() {
  const navigation = useNavigation<Nav>();
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [paused, setPaused] = useState(false);
  const lastScanRef = useRef<string>("");

  function handleBarCodeScanned({ type, data }: BarcodeScanningResult) {
    if (paused || data === lastScanRef.current) return;
    lastScanRef.current = data;
    setPaused(true);
    setResult({ type, data });
  }

  function reset() {
    lastScanRef.current = "";
    setPaused(false);
    setResult(null);
  }

  function copyToClipboard() {
    if (!result) return;
    Clipboard.setString(result.data);
    Alert.alert("Copied", "Result copied to clipboard.");
  }

  function openUrl() {
    if (!result) return;
    Linking.openURL(result.data).catch(() =>
      Alert.alert("Cannot open", "This doesn't look like a valid URL.")
    );
  }

  const isUrl =
    result?.data.startsWith("http://") || result?.data.startsWith("https://");

  if (!permission) {
    return <View style={styles.root} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.root}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.permContent}>
          <Text style={styles.heading}>Camera permission needed</Text>
          <Text style={styles.body}>
            cnxt to scanner needs camera access to scan QR codes and barcodes.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Grant Permission</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      {!paused && (
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{
            barcodeTypes: [
              "qr", "pdf417", "aztec", "ean13", "ean8", "upc_a",
              "upc_e", "code39", "code93", "code128", "codabar", "itf14",
              "datamatrix",
            ],
          }}
          onBarcodeScanned={handleBarCodeScanned}
        />
      )}

      {/* Viewfinder overlay */}
      {!paused && (
        <View style={styles.overlay}>
          <SafeAreaView style={styles.overlayTop}>
            <Pressable style={styles.backBtnOverlay} onPress={() => navigation.goBack()}>
              <Text style={styles.backTextOverlay}>← Back</Text>
            </Pressable>
          </SafeAreaView>
          <View style={styles.finderFrame} />
          <Text style={styles.hint}>Point at a QR code or barcode</Text>
        </View>
      )}

      {/* Result panel */}
      {result && (
        <SafeAreaView style={styles.resultPanel}>
          <Text style={styles.resultType}>{result.type}</Text>
          <Text style={styles.resultData} numberOfLines={6} selectable>
            {result.data}
          </Text>
          <View style={styles.resultActions}>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
              onPress={copyToClipboard}
            >
              <Text style={styles.actionBtnText}>Copy</Text>
            </Pressable>
            {isUrl && (
              <Pressable
                style={({ pressed }) => [styles.actionBtn, styles.actionBtnPrimary, pressed && { opacity: 0.7 }]}
                onPress={openUrl}
              >
                <Text style={[styles.actionBtnText, { color: "#fff" }]}>Open URL</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
              onPress={reset}
            >
              <Text style={styles.actionBtnText}>Scan Again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const FINDER_SIZE = 240;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0d1117" },
  backBtn: { paddingTop: 12, paddingBottom: 8, paddingHorizontal: 20, alignSelf: "flex-start" },
  backText: { color: "#1a5f8f", fontSize: 15, fontWeight: "600" },
  permContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 20,
  },
  heading: { fontSize: 24, fontWeight: "800", color: "#e6edf3" },
  body: { fontSize: 15, color: "#8b949e", lineHeight: 22 },
  primaryBtn: {
    backgroundColor: "#1a5f8f",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  overlayTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  backBtnOverlay: {
    paddingTop: 12,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  backTextOverlay: { color: "#fff", fontSize: 15, fontWeight: "600" },
  finderFrame: {
    width: FINDER_SIZE,
    height: FINDER_SIZE,
    borderWidth: 2,
    borderColor: "#1a5f8f",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  hint: {
    marginTop: 24,
    color: "#e6edf3",
    fontSize: 14,
    fontWeight: "500",
  },
  resultPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#161b22",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  resultType: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#8b949e",
  },
  resultData: {
    fontSize: 16,
    color: "#e6edf3",
    lineHeight: 24,
  },
  resultActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 4,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionBtnPrimary: {
    backgroundColor: "#1a5f8f",
    borderColor: "#1a5f8f",
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e6edf3",
  },
});
