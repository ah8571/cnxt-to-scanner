import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type Nav = NativeStackNavigationProp<RootStackParamList, "Home">;

type Tile = {
  label: string;
  subtitle: string;
  route: keyof RootStackParamList;
  color: string;
};

const TILES: Tile[] = [
  {
    label: "Document Scanner",
    subtitle: "Scan pages to PDF",
    route: "DocumentScanner",
    color: "#1a7f6e",
  },
  {
    label: "QR & Barcode",
    subtitle: "Scan any code instantly",
    route: "QRScanner",
    color: "#1a5f8f",
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>cnxt to scanner</Text>
        <Text style={styles.tagline}>Free document &amp; code scanner</Text>
      </View>

      <View style={styles.grid}>
        {TILES.map((tile) => (
          <Pressable
            key={tile.route}
            style={({ pressed }) => [
              styles.tile,
              { borderColor: tile.color + "66" },
              pressed && { opacity: 0.75 },
            ]}
            onPress={() => navigation.navigate(tile.route as never)}
          >
            <View style={[styles.tileAccent, { backgroundColor: tile.color }]} />
            <Text style={styles.tileLabel}>{tile.label}</Text>
            <Text style={styles.tileSubtitle}>{tile.subtitle}</Text>
          </Pressable>
        ))}
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
  header: {
    paddingTop: 24,
    paddingBottom: 36,
  },
  wordmark: {
    fontSize: 28,
    fontWeight: "800",
    color: "#e6edf3",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: "#8b949e",
    marginTop: 4,
  },
  grid: {
    gap: 16,
  },
  tile: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    overflow: "hidden",
  },
  tileAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  tileLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e6edf3",
    marginBottom: 4,
  },
  tileSubtitle: {
    fontSize: 13,
    color: "#8b949e",
  },
});
