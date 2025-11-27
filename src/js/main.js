"use strict";

import { 
  fetchGiveaways, 
  saveSubscription, 
  getSavedGiveaways, 
  saveGiveaway,
  getUniqueGamesForVoting,
  filterGamesForVoting,
  currentGiveaways,
  findGiveawayById
} from './gamepower-api.js';

import { saveVoteToFirebase, getVotesFromFirebase } from './firebase.js';

/**
 * Inicializa la aplicación
 */
const init = () => {
  loadGiveaways();
  setupEventListeners();
  loadSavedGiveaways();
  setupVotingSystem();
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

/**
 * Configura el sistema de votación
 */
const setupVotingSystem = () => {
  loadVotingGames();
  setupVotingFilters();
  setupVotingForm();
  loadVotingResults();
};

/**
 * Carga los juegos en el selector de votación
 */
const loadVotingGames = () => {
  const games = getUniqueGamesForVoting();
  const gameSelect = document.getElementById('game-select');
  
  if (games.length === 0) {
    gameSelect.innerHTML = '<option value="" disabled>No hay juegos disponibles</option>';
    return;
  }
  
  // Ordenar juegos alfabéticamente
  games.sort((a, b) => a.title.localeCompare(b.title));
  
  gameSelect.innerHTML = '<option value="" disabled selected>Busca y selecciona tu juego favorito</option>';
  
  games.forEach(game => {
    const option = document.createElement('option');
    option.value = game.id;
    option.textContent = `${game.title} (${game.platform})`;
    option.setAttribute('data-type', game.type);
    option.setAttribute('data-platform', game.platform);
    gameSelect.appendChild(option);
  });
};

/**
 * Configura los filtros de votación
 */
const setupVotingFilters = () => {
  const platformFilter = document.getElementById('voting-platform-filter');
  const typeFilter = document.getElementById('voting-type-filter');
  const gameSelect = document.getElementById('game-select');

  const filterGames = () => {
    const platform = platformFilter.value;
    const type = typeFilter.value;
    
    const filteredGames = filterGamesForVoting(platform, type);
    
    // Actualizar el select de juegos
    gameSelect.innerHTML = '<option value="" disabled selected>Busca y selecciona tu juego favorito</option>';
    
    filteredGames.forEach(game => {
      const option = document.createElement('option');
      option.value = game.id;
      option.textContent = `${game.title} (${game.platform})`;
      gameSelect.appendChild(option);
    });
    
    if (filteredGames.length === 0) {
      gameSelect.innerHTML = '<option value="" disabled>No hay juegos con estos filtros</option>';
    }
  };

  platformFilter.addEventListener('change', filterGames);
  typeFilter.addEventListener('change', filterGames);
};

/**
 * Configura el formulario de votación
 */
const setupVotingForm = () => {
  const votingForm = document.getElementById('voting-form');
  
  if (votingForm) {
    votingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const gameSelect = document.getElementById('game-select');
      const selectedGameId = parseInt(gameSelect.value); // Asegurar que es número
      const selectedOption = gameSelect.options[gameSelect.selectedIndex];
      
      if (!selectedGameId || isNaN(selectedGameId)) {
        alert('Por favor, selecciona un juego válido para votar.');
        return;
      }
      
      try {
        console.log('Buscando juego con ID:', selectedGameId);
        console.log('currentGiveaways disponible:', currentGiveaways.length);
        
        // Usar la función importada para buscar el juego
        const game = findGiveawayById(selectedGameId);
        
        if (!game) {
          console.error('Juego no encontrado. currentGiveaways:', currentGiveaways);
          alert('Error: No se pudo encontrar la información del juego seleccionado.');
          return;
        }
        
        const voteData = {
          gameId: selectedGameId,
          gameTitle: game.title,
          gamePlatform: game.platforms,
          gameType: game.type,
          gameThumbnail: game.thumbnail,
          gameWorth: game.worth,
          gameDescription: game.description
        };
        
        console.log('Enviando voto:', voteData);
        
        const result = await saveVoteToFirebase(voteData);
        
        if (result.success) {
          alert('🎉 ¡Tu voto ha sido registrado! Gracias por participar.');
          votingForm.reset();
          loadVotingResults(); // Actualizar resultados
        } else {
          alert('❌ ' + result.message);
        }
      } catch (error) {
        console.error('Error en el formulario de votación:', error);
        alert('❌ Ocurrió un error al registrar tu voto: ' + error.message);
      }
    });
  }
};

/**
 * Carga y muestra los resultados de votación
 */
const loadVotingResults = async () => {
  try {
    const result = await getVotesFromFirebase();
    const container = document.getElementById('voting-results');
    
    if (!result.success) {
      container.innerHTML = `<p class="text-red-400">Error: ${result.message}</p>`;
      return;
    }
    
    const votes = result.data;
    
    if (!votes || votes.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-400">Aún no hay votos registrados.</p>
          <p class="text-gray-500 text-sm mt-2">¡Sé el primero en votar!</p>
        </div>
      `;
      return;
    }
    
    // Contar votos por juego
    const voteCounts = {};
    votes.forEach(vote => {
      const gameId = vote.gameId;
      if (!voteCounts[gameId]) {
        voteCounts[gameId] = {
          count: 0,
          title: vote.gameTitle,
          platform: vote.gamePlatform,
          type: vote.gameType,
          worth: vote.gameWorth
        };
      }
      voteCounts[gameId].count++;
    });
    
    // Calcular total de votos
    const totalVotes = votes.length;
    
    // Convertir a array y ordenar por votos (descendente)
    const sortedVotes = Object.entries(voteCounts)
      .map(([gameId, data]) => ({
        gameId,
        ...data
      }))
      .sort((a, b) => b.count - a.count);
    
    // Generar HTML de resultados
    let resultsHTML = '';
    
    sortedVotes.forEach((vote, index) => {
      const percentage = ((vote.count / totalVotes) * 100).toFixed(1);
      const isFirst = index === 0;
      
      resultsHTML += `
        <div class="bg-gray-800 rounded-lg p-4 border ${isFirst ? 'border-yellow-400' : 'border-gray-700'}">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h4 class="font-semibold text-white ${isFirst ? 'text-yellow-400' : ''}">
                ${isFirst ? '👑 ' : ''}${vote.title}
              </h4>
              <p class="text-green-400 text-sm font-bold mt-1">${vote.worth}</p>
            </div>
            <span class="text-lg font-bold text-white">${vote.count} voto${vote.count !== 1 ? 's' : ''}</span>
          </div>
          
          <div class="flex justify-between items-center text-xs text-gray-400 mb-2">
            <span>${vote.platform}</span>
            <span>${vote.type}</span>
          </div>
          
          <!-- Barra de progreso -->
          <div class="w-full bg-gray-700 rounded-full h-2 mb-1">
            <div class="bg-green-500 h-2 rounded-full" style="width: ${percentage}%"></div>
          </div>
          
          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-400">${percentage}% del total</span>
            <span class="text-gray-400">${vote.count}/${totalVotes}</span>
          </div>
        </div>
      `;
    });
    
    // Añadir resumen total
    resultsHTML += `
      <div class="bg-gray-800 rounded-lg p-4 border border-purple-500 mt-4">
        <div class="text-center">
          <p class="text-purple-400 font-bold">Total de votos: ${totalVotes}</p>
          <p class="text-gray-400 text-sm">${sortedVotes.length} juegos diferentes</p>
        </div>
      </div>
    `;
    
    container.innerHTML = resultsHTML;
    
  } catch (error) {
    console.error('Error cargando resultados de votación:', error);
    const container = document.getElementById('voting-results');
    container.innerHTML = `
      <div class="text-red-400 text-center">
        Error al cargar los resultados de votación.
      </div>
    `;
  }
};

/**
 * Función global para cargar resultados
 */
window.loadVotingResults = loadVotingResults;