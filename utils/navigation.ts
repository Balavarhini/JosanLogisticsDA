import { Linking, Platform } from "react-native";
import { appStorage } from "@/services/storage";

export type NavAppChoice = "google" | "waze" | "apple" | "onemap";

export interface NavDestination {
  latitude: number;
  longitude: number;
  label?: string;
  postalCode?: string;
}

export interface NavAppOption {
  id: NavAppChoice;
  name: string;
  icon: string;
  subtitle: string;
  platform?: "all" | "ios" | "android";
}

export const NAV_APP_OPTIONS: NavAppOption[] = [
  {
    id: "google",
    name: "Google Maps",
    icon: "🗺️",
    subtitle: "Recommended turn-by-turn with live SG traffic",
    platform: "all",
  },
  {
    id: "waze",
    name: "Waze",
    icon: "🚗",
    subtitle: "Community real-time speed trap & gantry alerts",
    platform: "all",
  },
  {
    id: "apple",
    name: "Apple Maps",
    icon: "🍏",
    subtitle: "Native iOS maps & navigation",
    platform: "ios",
  },
  {
    id: "onemap",
    name: "OneMap SG",
    icon: "🇸🇬",
    subtitle: "SLA official Singapore building & postal map",
    platform: "all",
  },
];

const PREFERRED_NAV_APP_KEY = "@josan_driver_preferred_nav_app";

export async function getPreferredNavApp(): Promise<NavAppChoice | null> {
  return await appStorage.getJSON<NavAppChoice>(PREFERRED_NAV_APP_KEY);
}

export async function setPreferredNavApp(app: NavAppChoice): Promise<void> {
  await appStorage.setJSON(PREFERRED_NAV_APP_KEY, app);
}

/**
 * Launch external turn-by-turn navigation for Singapore destinations.
 */
export async function launchNavigationApp(
  dest: NavDestination,
  navApp: NavAppChoice
): Promise<boolean> {
  const { latitude: lat, longitude: lng, label, postalCode } = dest;
  const encodedLabel = encodeURIComponent(label || postalCode || "Destination");

  let url = "";

  switch (navApp) {
    case "google": {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`;
      break;
    }
    case "waze": {
      url = `waze://?ll=${lat},${lng}&navigate=yes`;
      break;
    }
    case "apple": {
      if (Platform.OS === "ios") {
        url = `maps://?daddr=${lat},${lng}&q=${encodedLabel}`;
      } else {
        url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      }
      break;
    }
    case "onemap": {
      url = `https://www.onemap.gov.sg/main/v2/?lat=${lat}&lng=${lng}`;
      break;
    }
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported || navApp === "google" || navApp === "onemap") {
      await Linking.openURL(url);
      return true;
    } else {
      // Fallback to Google Maps web link if custom scheme (e.g. waze://) is not installed
      const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      await Linking.openURL(fallbackUrl);
      return true;
    }
  } catch (error) {
    console.warn("[launchNavigationApp] Failed to open navigation URL:", error);
    try {
      await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
      return true;
    } catch {
      return false;
    }
  }
}
