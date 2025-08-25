'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DigestContextType {
  selectedCategory: string;
  showFavoritesOnly: boolean;
  favoriteCategories: string[];
  searchTerm: string;
  setSelectedCategory: (category: string) => void;
  setShowFavoritesOnly: (show: boolean) => void;
  setSearchTerm: (term: string) => void;
  toggleFavorite: (category: string) => void;
  clearFilters: () => void;
}

const DigestContext = createContext<DigestContextType | undefined>(undefined);

export function DigestProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load user preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFavorites = localStorage.getItem('favoriteCategories');
      if (storedFavorites) {
        setFavoriteCategories(JSON.parse(storedFavorites));
      }
    }
  }, []);

  const toggleFavorite = (category: string) => {
    const newFavorites = favoriteCategories.includes(category)
      ? favoriteCategories.filter(c => c !== category)
      : [...favoriteCategories, category];
    
    setFavoriteCategories(newFavorites);
    localStorage.setItem('favoriteCategories', JSON.stringify(newFavorites));
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setShowFavoritesOnly(false);
    setSearchTerm('');
  };

  const value = {
    selectedCategory,
    showFavoritesOnly,
    favoriteCategories,
    searchTerm,
    setSelectedCategory,
    setShowFavoritesOnly,
    setSearchTerm,
    toggleFavorite,
    clearFilters,
  };

  return (
    <DigestContext.Provider value={value}>
      {children}
    </DigestContext.Provider>
  );
}

export function useDigest() {
  const context = useContext(DigestContext);
  if (context === undefined) {
    throw new Error('useDigest must be used within a DigestProvider');
  }
  return context;
}
