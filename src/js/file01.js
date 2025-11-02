"use strict";

import { fetchProducts, fetchCategories } from './functions.js';

/**
 * Renderiza las categorías en el elemento select correspondiente
 * @function
 * @async
 * @returns {Promise<void>}
 * @description Obtiene categorías de una API XML y las renderiza en un elemento select
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
 * @description Obtiene productos de una API y los renderiza en el DOM, mostrando solo los primeros 6 productos.
 * Cada producto se muestra en una tarjeta con imagen, título, precio y enlace a Amazon.
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
 * @description Agrega la clase CSS necesaria para mostrar el elemento toast.
 * Busca el elemento con ID "toast-interactive" y le añade la clase "md:block".
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
 * @description Agrega un event listener al elemento con ID "demo" para abrir
 * un enlace de YouTube en una nueva pestaña cuando se hace click.
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
 * @description Función auto-ejecutable que inicializa la aplicación:
 * - Renderiza las categorías
 * - Renderiza los productos
 * - Muestra el toast
 * - Configura el evento del video demo
 */
(() => {
  renderCategories();
  renderProducts();
  showToast();
  showVideo();
})();