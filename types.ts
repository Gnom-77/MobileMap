export interface MarkerData {
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
  }
  
  export interface ImageData {
    id: string;
    uri: string;
    markerId: string;
  }
  
  export type RootStackParamList = {
    index: undefined;
    marker: { 
      id: string;
      latitude: number;
      longitude: number;
    };
  };