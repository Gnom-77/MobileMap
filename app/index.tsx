import React, { useState } from 'react';
import { Text, View, StyleSheet} from "react-native";
import MapView, { Marker, LatLng, LongPressEvent } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { MarkerData } from '../types';

export default function MapScreen() {
  const router = useRouter();
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const handleMapLongPress = (e: LongPressEvent) => {
    const newMarker: MarkerData = {
      id: Date.now().toString(),
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    };
    setMarkers([...markers, newMarker]);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 55.7558,
          longitude: 37.6173,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onLongPress={handleMapLongPress}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            onPress={() => router.push({
              pathname: `/marker/[id]`,
              params: {
                id: marker.id,
                latitude: marker.latitude,
                longitude: marker.longitude
              }
            })}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
