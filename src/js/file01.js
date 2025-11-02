"use strict";

import { fetchProducts, fetchCategories } from './functions.js';
import { saveVote, getVotes } from './firebase.js';

/**
 * Habilita el formulario de votación
 * @function
 * @description Configura el event listener para el formulario de votación
 */
const enableForm = () => {
  const form = document.getElementById('form_voting');
  
  if (form) {
    form.addEventListener('submit', async (event) => {
      // Prevenir el comportamiento por defecto del formulario
      event.preventDefault();
      
      // Obtener el valor del select
      const selectProduct = document.getElementById('select_product');
      const productID = selectProduct.value;
      
      // Validar que se haya seleccionado un producto
      if (!productID) {
        alert('Por favor, selecciona un producto para votar.');
        return;
      }
      
      try {
        // Llamar a la función saveVote con el productID
        const result = await saveVote(productID);
        
        // Mostrar mensaje de alerta con el resultado
        if (result.success) {
          alert('✅ ' + result.message);
          // Opcional: resetear el formulario
          form.reset();
          // Actualizar la tabla de votos
          await displayVotes();
        } else {
          alert('❌ ' + result.message);
        }
      } catch (error) {
        console.error('Error en el formulario:', error);
        alert('❌ Ocurrió un error inesperado al guardar el voto.');
      }
    });
  }
};

/**
 * Muestra los votos en una tabla HTML
 * @function
 * @async
 * @description Obtiene los votos de Firebase y los muestra en una tabla
 */
const displayVotes = async () => {
  try {
    const result = await getVotes();
    const container = document.getElementById('results');
    
    if (!result.success) {
      container.innerHTML = `<p class="text-red-500">Error: ${result.message}</p>`;
      return;
    }
    
    const votes = result.data;
    
    // Si no hay votos
    if (Object.keys(votes).length === 0) {
      container.innerHTML = `
        <div class="text-center p-4 bg-gray-100 rounded-lg">
          <p class="text-gray-600">No hay votos registrados todavía.</p>
        </div>
      `;
      return;
    }
    
    // Calcular total de votos por producto
    const voteCounts = {};
    Object.values(votes).forEach(vote => {
      if (!voteCounts[vote.productID]) {
        voteCounts[vote.productID] = 0;
      }
      voteCounts[vote.productID]++;
    });
    
    // Crear tabla HTML
    let tableHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <thead class="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Producto
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total de Votos
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Porcentaje
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
    `;
    
    const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
    
    // Ordenar productos por cantidad de votos (descendente)
    const sortedProducts = Object.entries(voteCounts)
      .sort(([,a], [,b]) => b - a);
    
    sortedProducts.forEach(([productID, count]) => {
      const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : 0;
      
      tableHTML += `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
            ${productID}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
            ${count}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
            ${percentage}%
          </td>
        </tr>
      `;
    });
    
    tableHTML += `
          </tbody>
          <tfoot class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                TOTAL
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                ${totalVotes}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                100%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
    
    container.innerHTML = tableHTML;
    
  } catch (error) {
    console.error('Error mostrando votos:', error);
    const container = document.getElementById('results');
    container.innerHTML = `
      <div class="text-red-500 p-4 bg-red-50 rounded-lg">
        Error al cargar los votos: ${error.message}
      </div>
    `;
  }
};

/**
 * Renderiza las categorías en el elemento select correspondiente
 * @function
 * @async
 * @returns {Promise<void>}
 */
const renderCategories = async () => {
  try {
    const result = await fetchCategories('https://data-dawm.github.io/datum/reseller/categories.xml');
    
    if (result.success) {
      const container = document.getElementById('categories');
      container.innerHTML = `<option selected disabled>Seleccione una categoría</option>`;
      
      const categoriesXML = result.body;
      const categories = categoriesXML.getElementsByTagName('category');
      
      for (let category of categories) {
        let categoryHTML = `<option value="[ID]">[NAME]</option>`;
        
        const id = category.getElementsByTagName('id')[0].textContent;
        const name = category.getElementsByTagName('name')[0].textContent;
        
        categoryHTML = categoryHTML.replaceAll('[ID]', id);
        categoryHTML = categoryHTML.replaceAll('[NAME]', name);
        
        container.innerHTML += categoryHTML;
      }
    } else {
      alert('Error: ' + (result.message || 'No se pudo obtener las categorías.'));
    }
  } catch (error) {
    console.error('Error en renderCategories:', error);
    alert('Ocurrió un error al obtener las categorías.');
  }
};

/**
 * Renderiza los productos en el contenedor HTML
 * @function
 * @async
 * @returns {Promise<void>}
 */
const renderProducts = () => {
  fetchProducts('https://data-dawm.github.io/datum/reseller/products.json')
    .then(result => {
      if (result.success) {
        const container = document.getElementById('products-container');
        container.innerHTML = '';

        let products = result.body.slice(0, 6);

        products.forEach(product => {
          let productHTML = `
          <div class="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
              <img
                  class="w-full h-40 bg-gray-300 dark:bg-gray-700 rounded-lg object-cover transition-transform duration-300 hover:scale-[1.03]"
                  src="[PRODUCT.IMGURL]" alt="[PRODUCT.TITLE]">
              <h3
                  class="h-6 text-xl font-semibold tracking-tight text-gray-900 dark:text-white hover:text-black-600 dark:hover:text-white-400">
                  $[PRODUCT.PRICE]
              </h3>

              <div class="h-5 rounded w-full">[PRODUCT.TITLE]</div>
              <div class="space-y-2">
                  <a href="[PRODUCT.PRODUCTURL]" target="_blank" rel="noopener noreferrer"
                  class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-full inline-block">
                      Ver en Amazon
                  </a>
                  <div class="hidden"><span class="1">[PRODUCT.CATEGORY_ID]</span></div>
              </div>
          </div>`;

          productHTML = productHTML.replaceAll('[PRODUCT.IMGURL]', product.imgUrl);
          productHTML = productHTML.replaceAll(
            '[PRODUCT.TITLE]',
            product.title.length > 20 ? product.title.substring(0, 20) + '...' : product.title
          );
          productHTML = productHTML.replaceAll('[PRODUCT.PRICE]', product.price);
          productHTML = productHTML.replaceAll('[PRODUCT.PRODUCTURL]', product.productURL);
          productHTML = productHTML.replaceAll('[PRODUCT.CATEGORY_ID]', product.category_id);

          container.innerHTML += productHTML;
        });
      } else {
        alert('Error: ' + (result.message || 'No se pudo obtener los productos.'));
      }
    })
    .catch(error => {
      console.error('Error en fetchProducts:', error);
      alert('Ocurrió un error al obtener los productos.');
    });
};

/**
 * Muestra el toast interactivo en la interfaz
 * @function
 */
const showToast = () => {
  const toast = document.getElementById("toast-interactive");
  if (toast) {
    toast.classList.add("md:block");
  }
};

/**
 * Configura el evento click para el video demo
 * @function
 */
const showVideo = () => {
  const demo = document.getElementById("demo");
  if (demo) {
    demo.addEventListener("click", () => {
      window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
    });
  }
};

/**
 * Función de inicialización inmediatamente invocada (IIFE)
 * @function
 * @description Función auto-ejecutable que inicializa la aplicación
 */
(() => {
  renderCategories();
  renderProducts();
  showToast();
  showVideo();
  enableForm();
  displayVotes();
})();