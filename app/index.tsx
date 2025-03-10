import React, { useEffect } from 'react';
import { Alert, View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, LongPressEvent } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useDatabase } from '../contexts/DatabaseContext';
import { MarkerData } from '../types';

export default function MapScreen() {
  const router = useRouter();
  const {
    addMarker,
    getMarkers,
    deleteMarker,
    isLoading,
    error,
    markers,
    setMarkers
  } = useDatabase();

  useEffect(() => {
    const loadMarkers = async () => {
      try {
        const savedMarkers = await getMarkers();
        setMarkers(savedMarkers);
      } catch (err) {
        Alert.alert('Ошибка', 'Не удалось загрузить маркеры');
      }
    };

    if (!isLoading) {
      loadMarkers();
    }
  }, [isLoading, getMarkers, setMarkers]);

  useEffect(() => {
    if (error) {
      Alert.alert('Ошибка базы данных', error.message);
    }
  }, [error]);

  const handleMapLongPress = async (e: LongPressEvent) => {
    const coordinate = e.nativeEvent.coordinate;
    try {
      const newId = await addMarker(coordinate.latitude, coordinate.longitude);
      setMarkers(prev => [...prev, {
        id: newId,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude
      }]);
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось добавить маркер');
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 55.7558,
          longitude: 37.6173,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onLongPress={handleMapLongPress}>
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
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
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(43, 23, 199, 0.5)', // Полупрозрачный фон
    zIndex: 1,
  },
});
