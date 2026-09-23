import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import MapViewWrapper, { Marker, Polyline, PROVIDER_GOOGLE } from "@/components/MapViewWrapper";
import { colors, spacing } from "@constants/theme";
import type { Address } from "@/types/trip";
import { useRouteEstimate } from "@/hooks/useLocation";

interface RouteMapCardProps {
  pickup: Address;
  delivery: Address;
  height?: number;
  useOneMapTiles?: boolean;
}

/** Default Singapore Center if coordinates are missing */
const DEFAULT_SG_CENTER = {
  latitude: 1.3521,
  longitude: 103.8198,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export function RouteMapCard({ pickup, delivery, height = 180, useOneMapTiles = false }: RouteMapCardProps) {
  const pCoord = pickup?.coordinates;
  const dCoord = delivery?.coordinates;

  const { route } = useRouteEstimate(pCoord, dCoord);

  const region = useMemo(() => {
    const pLat = pCoord?.latitude;
    const pLng = pCoord?.longitude;
    const dLat = dCoord?.latitude;
    const dLng = dCoord?.longitude;

    if (!pLat || !pLng || !dLat || !dLng) {
      return DEFAULT_SG_CENTER;
    }

    const minLat = Math.min(pLat, dLat);
    const maxLat = Math.max(pLat, dLat);
    const minLng = Math.min(pLng, dLng);
    const maxLng = Math.max(pLng, dLng);

    const latDelta = Math.max(0.02, (maxLat - minLat) * 1.5);
    const lngDelta = Math.max(0.02, (maxLng - minLng) * 1.5);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [pCoord, dCoord]);

  const polylineCoords = route?.polyline && route.polyline.length > 0
    ? route.polyline
    : pCoord && dCoord
    ? [pCoord, dCoord]
    : [];

  return (
    <View style={[styles.container, { height }]}>
      <MapViewWrapper
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
        useOneMapTiles={useOneMapTiles}
      >
        {pCoord ? <Marker coordinate={pCoord} title={`Pickup: ${pickup.label}`} pinColor="#10B981" /> : null}
        {dCoord ? <Marker coordinate={dCoord} title={`Delivery: ${delivery.label}`} pinColor={colors.primary} /> : null}
        {polylineCoords.length > 0 ? (
          <Polyline coordinates={polylineCoords} strokeColor={colors.primary} strokeWidth={4} />
        ) : null}
      </MapViewWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.xs,
  },
});
