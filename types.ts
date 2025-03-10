export interface MarkerData {
    id: number;
    latitude: number;
    longitude: number;
    created_at?: string;
  }
  
  export interface ImageData {
    id: number;
    marker_id: number;
    uri: string;
    created_at?: string;
  }
  
  export type RootStackParamList = {
    index: undefined;
    marker: { 
      id: number;
      latitude: number;
      longitude: number;
    };
  };