export type PlaceCategory = 
  | 'Todos' 
  | 'Gastronomía' 
  | 'Ecoturismo' 
  | 'Cultura y Ocio';

export interface Place {
  id: string;
  name: string;
  category: string;
  municipality: string;
  priceRange: string;
  rating: number;
  shortDescription: string;
  fullDescription?: string;
  imageUrl: string;
  tags?: string[];
  address?: string;
  mapsUrl: string;
  whatsapp: string;
  whatsappMessage: string;
  isFeatured: boolean;
}
