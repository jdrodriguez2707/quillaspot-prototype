export type PlaceCategory = 
  | 'Todos' 
  | 'Gastronomía' 
  | 'Ecoturismo' 
  | 'Cultura y Ocio';

export type PlaceMood =
  | 'En Pareja'
  | 'Con Amigos'
  | 'En Familia'
  | 'Plan Barato'
  | 'Al Aire Libre';

export type MoodFilterOption = 'Todos los planes' | PlaceMood;

export interface Place {
  id: string;
  name: string;
  category: string;
  municipality: string;
  priceLevel: string; // 'Entrada libre' | 'Económico' | 'Moderado' | 'Prémium'
  priceDetail?: string; // Para la vista de detalle
  rating: number;
  shortDescription: string;
  fullDescription?: string;
  imageUrl: string;
  tags?: string[];
  moods: PlaceMood[];
  address?: string;
  mapsUrl: string;
  whatsapp: string;
  whatsappMessage: string;
  isFeatured: boolean;
}

export type PlanMoveDirection = 'up' | 'down';

export interface PlanToastState {
  id: number;
  message: string;
}

export interface QuillaBotResponse {
  message: string;
  recommendedPlaceIds: string[];
}

export interface QuillaBotErrorCode {
  code: 'MISSING_API_KEY' | 'INVALID_REQUEST' | 'UPSTREAM_ERROR' | 'NETWORK_ERROR';
}

export interface QuillaBotErrorResponse {
  error: string;
  code?: QuillaBotErrorCode['code'];
}

export interface QuillaBotHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}



