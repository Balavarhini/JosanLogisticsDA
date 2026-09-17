import React from "react";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, MapViewProps } from "react-native-maps";
import { config } from "@constants/config";

export { Marker, Polyline, PROVIDER_GOOGLE };

export default function SmartMapView(props: MapViewProps) {
  const hasKey = !!(
    config.googleMapsApiKey &&
    config.googleMapsApiKey !== "YOUR_ANDROID_GOOGLE_MAPS_API_KEY"
  );

  return (
    <MapView
      {...props}
      provider={hasKey ? props.provider : undefined}
    />
  );
}
