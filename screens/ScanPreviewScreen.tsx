import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type Nav = NativeStackNavigationProp<RootStackParamList, "ScanPreview">;
type Route = RouteProp<RootStackParamList, "ScanPreview">;

export default function ScanPreviewScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { imageUris } = route.params;

  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState("");

  async function exportToPdf() {
    setExporting(true);
    setStatus("");
    try {
      // Build HTML with each scanned page as a full-page image
      const pages = await Promise.all(
        imageUris.map(async (uri) => {
          const b64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
          return `<div class="page"><img src="data:image/jpeg;base64,${b64}" /></div>`;
        })
      );

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #fff; }
  .page { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; page-break-after: always; }
  .page img { max-width: 100%; max-height: 100%; object-fit: contain; }
</style></head><body>${pages.join("")}</body></html>`;

      const { uri } = await Print.printToFileAsync({ html });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16);
      const destUri = (FileSystem.cacheDirectory ?? "") + `scan_${timestamp}.pdf`;
      const existing = await FileSystem.getInfoAsync(destUri);
      if (existing.exists) await FileSystem.deleteAsync(destUri, { idempotent: true });
      await FileSystem.moveAsync({ from: uri, to: destUri });

      await Sharing.shareAsync(destUri, {
        mimeType: "application/pdf",
        dialogTitle: `scan_${timestamp}.pdf`,
        UTI: "com.adobe.pdf",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.toLowerCase().includes("cancel") && !msg.toLowerCase().includes("dismiss")) {
        setStatus("Export failed: " + msg);
        setTimeout(() => setStatus(""), 6000);
      }
    }
    setExporting(false);
  }

  async function saveToPhotos() {
    const { status: perm } = await MediaLibrary.requestPermissionsAsync();
    if (perm !== "granted") {
      setStatus("Photo library permission denied.");
      setTimeout(() => setStatus(""), 4000);
      return;
    }
    try {
      for (const uri of imageUris) {
        await MediaLibrary.saveToLibraryAsync(uri);
      }
      setStatus(`${imageUris.length} image${imageUris.length > 1 ? "s" : ""} saved to Photos.`);
      setTimeout(() => setStatus(""), 4000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus("Save failed: " + msg);
      setTimeout(() => setStatus(""), 6000);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topbar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Rescan</Text>
        </Pressable>
        <Text style={styles.pageCount}>{imageUris.length} page{imageUris.length > 1 ? "s" : ""}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {imageUris.map((uri, i) => (
          <View key={uri} style={styles.pageCard}>
            <Text style={styles.pageLabel}>Page {i + 1}</Text>
            <Image source={{ uri }} style={styles.pageImage} resizeMode="contain" />
          </View>
        ))}
      </ScrollView>

      {status ? <Text style={styles.status}>{status}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.75 }]}
          onPress={saveToPhotos}
          disabled={exporting}
        >
          <Text style={styles.secondaryBtnText}>Save to Photos</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.8 }]}
          onPress={exportToPdf}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Export PDF</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0d1117" },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backText: { color: "#1a7f6e", fontSize: 15, fontWeight: "600" },
  pageCount: { fontSize: 14, color: "#8b949e", fontWeight: "600" },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },
  pageCard: {
    backgroundColor: "#161b22",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  pageLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#8b949e",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  pageImage: {
    width: "100%",
    aspectRatio: 0.707, // A4 portrait ratio
    backgroundColor: "#0d1117",
  },
  status: {
    marginHorizontal: 20,
    marginBottom: 8,
    fontSize: 13,
    color: "#8b949e",
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#e6edf3", fontSize: 15, fontWeight: "600" },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#1a7f6e",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
