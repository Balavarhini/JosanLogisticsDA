import "react-native-gesture-handler";
import React, { useCallback, useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { colors } from "@constants/theme";

// Keep the native splash screen up until fonts are loaded AND the auth
// session has finished restoring — this avoids any flash of the wrong
// screen (login vs. dashboard) while `restoreSession()` resolves.
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Redirects between the (auth) group and the (tabs) group based on session
 * state. This is the single source of truth for "protected routes" — screens
 * never need to check auth themselves.
 */
function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isBootstrapping) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && !inTabsGroup) {
      router.replace("/(tabs)/dashboard");
    }

    SplashScreen.hideAsync().catch(() => {});
  }, [isAuthenticated, isBootstrapping, router, segments]);

  return <>{children}</>;
}

function AppShell() {
  return (
    <RouteGuard>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        {/* trip/shipment/pickup/delivery/tracking/pod/documents/settings/help all
            render their own in-screen <Header> so titles can be dynamic (trip
            reference, etc.) — no native header needed for any of them. */}
        <Stack.Screen name="trip/[id]" />
        <Stack.Screen name="shipment/[id]" />
        <Stack.Screen name="pickup/[id]" />
        <Stack.Screen name="delivery/[id]" />
        <Stack.Screen name="tracking/[id]" />
        <Stack.Screen name="pod/[id]" />
        <Stack.Screen name="delivery-confirmation/[id]" options={{ presentation: "fullScreenModal" }} />
        <Stack.Screen name="documents" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="help" />
      </Stack>
    </RouteGuard>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const ready = fontsLoaded || !!fontError;

  const onLayout = useCallback(() => {
    // Native splash stays up (see RouteGuard) until auth bootstrap resolves;
    // nothing to do here beyond letting layout happen once fonts are ready.
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
