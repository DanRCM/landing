"use strict";

// Importar funciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  get, 
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Guarda un giveaway completo en Firebase
 * @param {Object} giveawayData - Datos completos del giveaway
 * @returns {Promise<{success: boolean, message: string, savedId: string}>}
 */
export const saveGiveawayToFirebase = async (giveawayData) => {
  try {
    const savedGiveawaysRef = ref(database, 'savedGiveaways');
    const newGiveawayRef = push(savedGiveawaysRef);
    
    const giveawayWithMetadata = {
      ...giveawayData,
      firebaseId: newGiveawayRef.key,
      savedAt: new Date().toISOString(),
      savedDate: new Date().toLocaleDateString('es-ES'),
      savedTime: new Date().toLocaleTimeString('es-ES')
    };
    
    await set(newGiveawayRef, giveawayWithMetadata);
    
    return {
      success: true,
      message: 'Giveaway guardado exitosamente en Firebase',
      savedId: newGiveawayRef.key
    };
  } catch (error) {
    console.error('Error guardando en Firebase:', error);
    return {
      success: false,
      message: `Error al guardar: ${error.message}`
    };
  }
};

/**
 * Obtiene todos los giveaways guardados de Firebase
 * @returns {Promise<{success: boolean, data: Array|string}>}
 */
export const getSavedGiveawaysFromFirebase = async () => {
  try {
    const savedGiveawaysRef = ref(database, 'savedGiveaways');
    const snapshot = await get(savedGiveawaysRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convertir objeto de Firebase en array
      const giveawaysArray = Object.values(data).filter(item => item !== null);
      return {
        success: true,
        data: giveawaysArray
      };
    } else {
      return {
        success: true,
        data: [],
        message: 'No hay giveaways guardados'
      };
    }
  } catch (error) {
    console.error('Error obteniendo giveaways de Firebase:', error);
    return {
      success: false,
      message: `Error al obtener los giveaways: ${error.message}`,
      data: []
    };
  }
};

/**
 * Elimina un giveaway guardado de Firebase
 * @param {string} firebaseId - ID de Firebase del giveaway
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const removeSavedGiveaway = async (firebaseId) => {
  try {
    const giveawayRef = ref(database, `savedGiveaways/${firebaseId}`);
    await remove(giveawayRef);
    return {
      success: true,
      message: 'Giveaway eliminado correctamente'
    };
  } catch (error) {
    console.error('Error eliminando giveaway:', error);
    return {
      success: false,
      message: `Error al eliminar: ${error.message}`
    };
  }
};

/**
 * Guarda una suscripción en Firebase
 * @param {string} email 
 * @param {string} platform 
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const saveSubscriptionToFirebase = async (email, platform) => {
  try {
    const subscriptionsRef = ref(database, 'subscriptions');
    const newSubscriptionRef = push(subscriptionsRef);
    
    const subscriptionData = {
      email: email,
      platform: platform,
      subscribedAt: new Date().toISOString(),
      subscribedDate: new Date().toLocaleDateString('es-ES')
    };
    
    await set(newSubscriptionRef, subscriptionData);
    
    return {
      success: true,
      message: 'Suscripción guardada correctamente en Firebase'
    };
  } catch (error) {
    console.error('Error guardando suscripción:', error);
    return {
      success: false,
      message: `Error al guardar suscripción: ${error.message}`
    };
  }
};

/**
 * Guarda un voto en Firebase
 * @param {Object} voteData - Datos del voto
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const saveVoteToFirebase = async (voteData) => {
  try {
    const votesRef = ref(database, 'votes');
    const newVoteRef = push(votesRef);
    
    const voteWithMetadata = {
      ...voteData,
      voteId: newVoteRef.key,
      votedAt: new Date().toISOString(),
      votedDate: new Date().toLocaleDateString('es-ES'),
      votedTime: new Date().toLocaleTimeString('es-ES')
    };
    
    await set(newVoteRef, voteWithMetadata);
    
    return {
      success: true,
      message: 'Voto registrado exitosamente',
      voteId: newVoteRef.key
    };
  } catch (error) {
    console.error('Error guardando voto:', error);
    return {
      success: false,
      message: `Error al guardar el voto: ${error.message}`
    };
  }
};

/**
 * Obtiene todos los votos de Firebase
 * @returns {Promise<{success: boolean, data: Array|string}>}
 */
export const getVotesFromFirebase = async () => {
  try {
    const votesRef = ref(database, 'votes');
    const snapshot = await get(votesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convertir objeto de Firebase en array y filtrar nulls
      const votesArray = Object.values(data).filter(item => item !== null);
      return {
        success: true,
        data: votesArray
      };
    } else {
      return {
        success: true,
        data: [],
        message: 'No hay votos registrados'
      };
    }
  } catch (error) {
    console.error('Error obteniendo votos:', error);
    return {
      success: false,
      message: `Error al obtener los votos: ${error.message}`,
      data: []
    };
  }
};

export { database, ref, set, push, get, onValue, remove };