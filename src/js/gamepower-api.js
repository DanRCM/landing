"use strict";

import { 
  saveGiveawayToFirebase, 
  getSavedGiveawaysFromFirebase,
  saveSubscriptionToFirebase 
} from './firebase.js';

// Configuración de la API de GamerPower
const GAMERPOWER_API = {
  // Usar URL directa en producción, proxy en desarrollo
  giveaways: import.meta.env.PROD 
    ? 'https://www.gamerpower.com/api/giveaways'
    : '/api/giveaways',
  
  filtered: (platform, type) => 
    import.meta.env.PROD
      ? `https://www.gamerpower.com/api/giveaways?platform=${platform}&type=${type}`
      : `/api/giveaways?platform=${platform}&type=${type}`
};

// Cache de giveaways para buscar por ID
let currentGiveaways = [];

/**
 * Obtiene los giveaways desde la API de GamerPower
 * @returns {Promise<{success: boolean, data: Array|string}>}
 */
export const fetchGiveaways = async () => {
  try {
    const url = GAMERPOWER_API.giveaways;
    console.log('Haciendo fetch a:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Respuesta no es JSON:', text.substring(0, 200));
      throw new Error('La respuesta no es JSON válido');
    }

    const data = await response.json();
    
    // Guardar en cache para búsquedas posteriores
    currentGiveaways = data;
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error fetching giveaways:', error);
    
    // En producción, intentar con CORS proxy como fallback
    if (import.meta.env.PROD) {
      console.log('Intentando con proxy CORS...');
      try {
        const corsProxyResponse = await fetch(`https://corsproxy.io/?${encodeURIComponent('https://www.gamerpower.com/api/giveaways')}`);
        if (corsProxyResponse.ok) {
          const data = await corsProxyResponse.json();
          currentGiveaways = data;
          return {
            success: true,
            data: data
          };
        }
      } catch (corsError) {
        console.error('Error con proxy CORS:', corsError);
      }
    }
    
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
};
/**
 * Encuentra un giveaway por ID en el cache
 * @param {number} giveawayId 
 * @returns {Object|null}
 */
const findGiveawayById = (giveawayId) => {
  return currentGiveaways.find(giveaway => giveaway.id === giveawayId) || null;
};

/**
 * Guarda una suscripción en Firebase
 * @param {string} email 
 * @param {string} platform 
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const saveSubscription = async (email, platform) => {
  try {
    const result = await saveSubscriptionToFirebase(email, platform);
    return result;
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
};

/**
 * Obtiene los giveaways guardados de Firebase
 * @returns {Promise<Array>}
 */
export const getSavedGiveaways = async () => {
  try {
    const result = await getSavedGiveawaysFromFirebase();
    if (result.success) {
      return result.data;
    } else {
      console.error('Error obteniendo giveaways guardados:', result.message);
      return [];
    }
  } catch (error) {
    console.error('Error en getSavedGiveaways:', error);
    return [];
  }
};

/**
 * Guarda un giveaway en Firebase
 * @param {number} giveawayId 
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const saveGiveaway = async (giveawayId) => {
  try {
    // Buscar el giveaway completo en el cache
    const giveaway = findGiveawayById(giveawayId);
    
    if (!giveaway) {
      return {
        success: false,
        message: 'No se pudo encontrar los datos del giveaway'
      };
    }

    // Guardar en Firebase
    const result = await saveGiveawayToFirebase(giveaway);
    return result;
  } catch (error) {
    return {
      success: false,
      message: `Error al guardar: ${error.message}`
    };
  }
};