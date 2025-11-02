"use strict";

// Importar funciones de Firebase desde el CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  get, 
  child,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Configuración de Firebase desde variables de entorno de Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar la aplicación Firebase
const app = initializeApp(firebaseConfig);

// Obtener referencia a la base de datos en tiempo real
const database = getDatabase(app);

/**
 * Guarda un voto para un producto en la base de datos
 * @param {string} productID - ID del producto que se está votando
 * @returns {Promise<{success: boolean, message: string}>} - Resultado de la operación
 */
const saveVote = (productID) => {
  // Obtener referencia a la colección 'votes'
  const votesRef = ref(database, 'votes');
  
  // Crear una nueva referencia para un usuario con ID único
  const newVoteRef = push(votesRef);
  
  // Crear objeto con los datos del voto
  const voteData = {
    productID: productID,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('es-ES'),
    time: new Date().toLocaleTimeString('es-ES')
  };
  
  // Guardar los datos en la base de datos y manejar la promesa
  return set(newVoteRef, voteData)
    .then(() => {
      return {
        success: true,
        message: 'Voto guardado exitosamente',
        voteId: newVoteRef.key
      };
    })
    .catch((error) => {
      console.error('Error guardando voto:', error);
      return {
        success: false,
        message: `Error al guardar el voto: ${error.message}`
      };
    });
};

/**
 * Obtiene todos los votos de la base de datos
 * @returns {Promise<{success: boolean, data: Object|string}>} - Resultado con los datos o mensaje de error
 */
const getVotes = async () => {
  try {
    // Obtener referencia a la colección 'votes'
    const votesRef = ref(database, 'votes');
    
    // Obtener los datos una sola vez
    const snapshot = await get(votesRef);
    
    if (snapshot.exists()) {
      // Si existen datos, retornarlos
      return {
        success: true,
        data: snapshot.val()
      };
    } else {
      // Si no hay datos
      return {
        success: true,
        data: {},
        message: 'No hay votos registrados'
      };
    }
  } catch (error) {
    console.error('Error obteniendo votos:', error);
    return {
      success: false,
      message: `Error al obtener los votos: ${error.message}`
    };
  }
};

// Exportar las funciones y la base de datos para usar en otros archivos
export { 
  database, 
  ref, 
  set, 
  push, 
  get, 
  child,
  update,
  remove,
  saveVote,
  getVotes
};