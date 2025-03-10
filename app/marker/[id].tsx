import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ImageData } from '../../types';

export default function MarkerDetails() {
  const { id, latitude, longitude } = useLocalSearchParams();
  const router = useRouter();
  const [images, setImages] = useState<ImageData[]>([]);

  const handleAddImage = async () => {
    // Проверка на максимальное количество изображений
    if (images.length >= 10) {
      Alert.alert('Ошибка', 'Можно добавить не более 10 изображений');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Необходимо разрешение для доступа к галерее');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true, // Разрешаем выбор нескольких изображений
    });

    if (!result.canceled) {
      const newImages: ImageData[] = result.assets.map((asset, index) => ({
        id: Date.now().toString() + index, // Уникальный ID для каждого изображения
        uri: asset.uri,
        markerId: id as string,
      }));

      // Проверка, чтобы общее количество изображений не превышало 10
      if (images.length + newImages.length > 10) {
        Alert.alert('Ошибка', 'Можно добавить не более 10 изображений');
        return;
      }

      setImages([...images, ...newImages]);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    setImages(images.filter((img) => img.id !== imageId));
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Кнопка "Назад" */}
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Назад</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Маркер #{id}</Text>
      <View style={styles.coordinatesContainer}>
      <Text style={styles.coordinatesTitle}>Координаты:</Text>
      <Text style={styles.coordinatesText}>Широта: {Number(latitude).toFixed(6)}</Text>
      <Text style={styles.coordinatesText}>Долгота: {Number(longitude).toFixed(6)}</Text>
      </View>
      <Text style={styles.coordinates}>Добавьте изображения для этого маркера</Text>

      <Text style={styles.sectionTitle}>Изображения ({images.length}/10)</Text>
      <View style={styles.imageContainer}>
        {images.map((image) => (
          <View key={image.id} style={styles.imageWrapper}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <Text
              style={styles.deleteButton}
              onPress={() => handleDeleteImage(image.id)}
            >
              Удалить
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={handleAddImage} style={styles.addButton}>
        <Text style={styles.addButtonText}>Добавить изображения</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: 'blue',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  imageWrapper: {
    width: '48%',
    marginBottom: 16,
    marginRight: '4%',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  deleteButton: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
  },
  coordinatesContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  coordinatesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  coordinatesText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
});