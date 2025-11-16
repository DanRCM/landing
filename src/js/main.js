"use strict";

import { fetchGiveaways, saveSubscription, getSavedGiveaways, saveGiveaway } from './gamepower-api.js';

/**
 * Inicializa la aplicación
 */
const init = () => {
  loadGiveaways();
  setupEventListeners();
  loadSavedGiveaways();
};

/**
 * Carga los giveaways desde la API
 */
const loadGiveaways = async () => {
  try {
    const container = document.getElementById('giveaways-container');
    container.innerHTML = `
      <div class="col-span-3 flex justify-center items-center py-12">
        <div class="animate-pulse text-gray-400">Cargando giveaways...</div>
      </div>
    `;

    const result = await fetchGiveaways();
    
    if (result.success) {
      displayGiveaways(result.data);
      setupFilters(result.data);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error cargando giveaways:', error);
    const container = document.getElementById('giveaways-container');
    container.innerHTML = `
      <div class="col-span-3 text-center py-12 text-red-400">
        Error al cargar los giveaways. Intenta recargar la página.
      </div>
    `;
  }
};

/**
 * Muestra los giveaways en el contenedor
 */
const displayGiveaways = (giveaways) => {
  const container = document.getElementById('giveaways-container');
  
  if (!giveaways || giveaways.length === 0) {
    container.innerHTML = `
      <div class="col-span-3 text-center py-12 text-gray-400">
        No hay giveaways disponibles en este momento.
      </div>
    `;
    return;
  }

  container.innerHTML = giveaways.map(giveaway => `
    <div class="game-card rounded-xl shadow-lg overflow-hidden border border-gray-700 hover:border-green-400 transition-all duration-300">
      <img src="${giveaway.thumbnail}" alt="${giveaway.title}" 
           class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="font-bold text-lg mb-2 text-white line-clamp-2">${giveaway.title}</h3>
        
        <div class="flex items-center justify-between mb-3">
          <span class="text-green-400 font-bold">${giveaway.worth}</span>
          <span class="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">${giveaway.type}</span>
        </div>

        <p class="text-gray-300 text-sm mb-4 line-clamp-2">${giveaway.description}</p>

        <div class="flex items-center justify-between text-xs text-gray-400 mb-4">
          <span>📅 ${formatDate(giveaway.end_date)}</span>
          <span>👥 ${giveaway.users?.toLocaleString() || '0'}</span>
        </div>

        <div class="flex flex-col gap-2">
          <a href="${giveaway.open_giveaway_url}" target="_blank" 
             class="bg-green-500 hover:bg-green-600 text-white text-center py-2 px-4 rounded-lg transition">
            Obtener Juego
          </a>
          <button onclick="saveThisGiveaway(${giveaway.id})" 
                  class="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition save-btn">
            💾 Guardar
          </button>
        </div>
      </div>
    </div>
  `).join('');
};

/**
 * Configura los filtros
 */
const setupFilters = (giveaways) => {
  const platformFilter = document.getElementById('platform-filter');
  const typeFilter = document.getElementById('type-filter');

  const filterGiveaways = () => {
    const platform = platformFilter.value;
    const type = typeFilter.value;

    const filtered = giveaways.filter(giveaway => {
      const platformMatch = !platform || giveaway.platforms.includes(platform);
      const typeMatch = !type || giveaway.type === type;
      return platformMatch && typeMatch;
    });

    displayGiveaways(filtered);
  };

  platformFilter.addEventListener('change', filterGiveaways);
  typeFilter.addEventListener('change', filterGiveaways);
};

/**
 * Configura los event listeners
 */
const setupEventListeners = () => {
  // Formulario de suscripción
  const subscriptionForm = document.getElementById('subscription-form');
  if (subscriptionForm) {
    subscriptionForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const platform = document.getElementById('platform-preference').value;

      try {
        const result = await saveSubscription(email, platform);
        if (result.success) {
          alert('🎉 ¡Te has suscrito exitosamente! Te notificaremos de nuevas ofertas.');
          subscriptionForm.reset();
        } else {
          alert('❌ ' + result.message);
        }
      } catch (error) {
        alert('❌ Error al procesar la suscripción.');
      }
    });
  }

  // Botón de explorar
  const exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      document.getElementById('giveaways').scrollIntoView({ 
        behavior: 'smooth' 
      });
    });
  }
};

/**
 * Carga los giveaways guardados desde Firebase
 */
const loadSavedGiveaways = async () => {
  try {
    const saved = await getSavedGiveaways();
    const container = document.getElementById('saved-giveaways-container');
    
    if (!saved || saved.length === 0) {
      container.innerHTML = '<p class="text-gray-400 text-center">Usa el botón "Guardar" en cualquier giveaway para verlo aquí.</p>';
      return;
    }

    container.innerHTML = saved.map(giveaway => `
      <div class="bg-gray-800 rounded-lg p-4 border border-purple-500">
        <h4 class="font-semibold text-white mb-2">${giveaway.title}</h4>
        <div class="flex justify-between items-center mb-2">
          <span class="text-green-400 text-sm font-bold">${giveaway.worth}</span>
          <span class="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">${giveaway.type}</span>
        </div>
        <p class="text-gray-300 text-xs mb-3 line-clamp-2">${giveaway.description}</p>
        <div class="flex justify-between items-center">
          <a href="${giveaway.open_giveaway_url}" target="_blank" 
             class="text-purple-400 hover:text-purple-300 text-sm font-medium">
            Obtener Juego
          </a>
          <span class="text-xs text-gray-400">Guardado: ${formatDate(giveaway.savedAt)}</span>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error cargando giveaways guardados:', error);
    const container = document.getElementById('saved-giveaways-container');
    container.innerHTML = '<p class="text-red-400 text-center">Error al cargar los giveaways guardados.</p>';
  }
};

/**
 * Función global para guardar giveaways
 */
window.saveThisGiveaway = async (giveawayId) => {
  try {
    const result = await saveGiveaway(giveawayId);
    if (result.success) {
      alert('✅ Giveaway guardado en tus favoritos!');
      loadSavedGiveaways(); // Recargar la lista de guardados
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    alert('❌ Error al guardar el giveaway.');
  }
};

/**
 * Formatea la fecha
 */
const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('es-ES');
  } catch (error) {
    return 'Fecha no disponible';
  }
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);