import React from 'react';
import {
  Utensils,
  Trees,
  Landmark,
  Compass,
  Sparkles,
  Heart,
  Users,
  Baby,
  Wallet,
  Sun,
} from 'lucide-react';
import { MoodFilterOption, PlaceCategory } from '../types/place';

export const getCategoryIcon = (category: PlaceCategory, className = 'w-3.5 h-3.5') => {
  switch (category) {
    case 'Gastronomía':
      return <Utensils className={className} />;
    case 'Ecoturismo':
      return <Trees className={className} />;
    case 'Cultura y Ocio':
      return <Landmark className={className} />;
    default:
      return <Compass className={className} />;
  }
};

export const getMoodIcon = (mood: MoodFilterOption, className = 'w-3.5 h-3.5') => {
  switch (mood) {
    case 'En Pareja':
      return <Heart className={className} />;
    case 'Con Amigos':
      return <Users className={className} />;
    case 'En Familia':
      return <Baby className={className} />;
    case 'Plan Barato':
      return <Wallet className={className} />;
    case 'Al Aire Libre':
      return <Sun className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};
