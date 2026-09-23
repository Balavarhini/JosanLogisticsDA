import React from "react";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, UrlTile, MapViewProps } from "react-native-maps";
import { config } from "@constants/config";

export { Marker, Polyline, PROVIDER_GOOGLE, UrlTile };

export interface SmartMapViewProps extends MapViewProps {
  useOneMapTiles?: boolean;
}

export default function SmartMapView({ useOneMapTiles, children, ...props }: SmartMapViewProps) {
  const hasKey = !!(
    config.googleMapsApiKey &&
    config.googleMapsApiKey !== "YOUR_ANDROID_GOOGLE_MAPS_API_KEY"
  );

  return (
    <MapView
      {...props}
      provider={hasKey ? props.provider : undefined}
    >
      {useOneMapTiles ? (
        <UrlTile
          urlTemplate="https://maps.onemap.gov.sg/maps/maptiles/3857/Default/{z}/{x}/{y}.png"
          maximumZ={19}
          tileSize={256}
        />
      ) : null}
      {children}
    </MapView>
  );
}

