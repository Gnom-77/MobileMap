import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useDatabase } from '../../contexts/DatabaseContext';
import { ImageData } from '../../types';

export default function MarkerDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Явное преобразование параметров
  const id = Number(params.id);
  const latitude = Number(params.latitude);
  const longitude = Number(params.longitude);

  const {
    addImage,
    getMarkerImages,
    deleteImage,
    deleteMarker,
    getMarkers,
    setMarkers,
    error
  } = useDatabase();
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null); // Состояние для выбранного изображения

  // Проверка валидности параметров
  if (isNaN(id) || isNaN(latitude) || isNaN(longitude)) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ошибка: неверные параметры маркера</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Назад к карте</Text>
        </TouchableOpacity>
      </View>
    );
  }

  useEffect(() => {
    const loadImages = async () => {
      try {
        const markerId = Number(id);
        const savedImages = await getMarkerImages(markerId);
        setImages(savedImages);
      } catch (err) {
        Alert.alert('Ошибка', 'Не удалось загрузить изображения');
      }
    };

    loadImages();
  }, [id]);

  useEffect(() => {
    if (error) {
      Alert.alert('Ошибка базы данных', error.message);
    }
  }, [error]);

  const handleAddImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') throw new Error('Необходимо разрешение для доступа к галерее');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        const markerId = Number(id);

        // Проверка на количество изображений
        if (images.length + result.assets.length > 10) {
          Alert.alert('Ошибка', 'Нельзя добавить больше 10 изображений к одному маркеру.');
          return;
        }

        await Promise.all(result.assets.map(asset =>
          addImage(markerId, asset.uri)
        ));

        const updatedImages = await getMarkerImages(markerId);
        setImages(updatedImages);
      }
    } catch (err) {
      if (err instanceof Error)
        Alert.alert('Ошибка', err.message);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось удалить изображение');
    }
  };

  const handleDeleteMarker = async () => {
    Alert.alert(
      'Удаление маркера',
      'Вы уверены, что хотите удалить этот маркер?',
      [
        {
          text: 'Нет',
          style: 'cancel',
        },
        {
          text: 'Да',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMarker(id);
              const updatedMarkers = await getMarkers();
              setMarkers(updatedMarkers.filter(m => m.id !== id)); // Оптимистичное обновление
              router.back();
            } catch (err) {
              Alert.alert('Ошибка', 'Не удалось удалить маркер');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Назад</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Маркер #{id}</Text>

      <View style={styles.coordinatesContainer}>
        <Text style={styles.coordinatesTitle}>Координаты:</Text>
        <Text style={styles.coordinatesText}>
          Широта: {Number(latitude).toFixed(6)}
        </Text>
        <Text style={styles.coordinatesText}>
          Долгота: {Number(longitude).toFixed(6)}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Изображения ({images.length}/10)</Text>

      <View style={styles.imageContainer}>
        {images.map((image) => (
          <View key={image.id} style={styles.imageWrapper}>
            <TouchableOpacity
              onPress={() => setSelectedImage(image)}
              style={styles.imageTouchable}
            >
              <Image source={{ uri: image.uri }} style={styles.image} />
            </TouchableOpacity>
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

      <TouchableOpacity onPress={handleDeleteMarker} style={styles.deleteMarkerButton}>
        <Text style={styles.deleteMarkerButtonText}>Удалить маркер</Text>
      </TouchableOpacity>

      {/* Модальное окно для просмотра изображения */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedImage !== null}
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.closeButtonText}>Закрыть</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage?.uri }} style={styles.modalImage} />
        </View>
      </Modal>
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
  imageTouchable: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
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
  deleteMarkerButton: {
    backgroundColor: 'red',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 50
  },
  deleteMarkerButtonText: {
    color: 'white',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalImage: {
    width: '80%',
    height: 300,
    borderRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'red',
    fontSize: 16,
  },
});
