"use strict";

// js/file01.js

// 1️⃣ Importar la función fetchProducts desde functions.js
import { fetchProducts } from './functions.js';

// 2️⃣ Crear la función flecha renderProducts
const renderProducts = () => {
  // 3️⃣ Llamar a fetchProducts con la URL indicada
  fetchProducts('https://data-dawm.github.io/datum/reseller/products.json')
    .then(result => {
      // 4️⃣ Verificar si result.success es true o false
      if (result.success) {
        // 5️⃣ Obtener referencia al contenedor y limpiar contenido previo
        const container = document.getElementById('products-container');
        container.innerHTML = '';

        // 6️⃣ Obtener productos y limitar a los primeros 6
        let products = result.body.slice(0, 6);

        // 7️⃣ Recorrer los productos
        products.forEach(product => {
          // 8️⃣ Crear plantilla HTML con template literal
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

          // 9️⃣ Reemplazar los marcadores con los valores del producto
          productHTML = productHTML.replaceAll('[PRODUCT.IMGURL]', product.imgUrl);
          productHTML = productHTML.replaceAll(
            '[PRODUCT.TITLE]',
            product.title.length > 20 ? product.title.substring(0, 20) + '...' : product.title
          );
          productHTML = productHTML.replaceAll('[PRODUCT.PRICE]', product.price);
          productHTML = productHTML.replaceAll('[PRODUCT.PRODUCTURL]', product.productURL);
          productHTML = productHTML.replaceAll('[PRODUCT.CATEGORY_ID]', product.category_id);

          // 🔟 Concatenar el producto al contenedor
          container.innerHTML += productHTML;
        });
      } else {
        // ⚠️ En caso de error, mostrar alerta
        alert('Error: ' + (result.message || 'No se pudo obtener los productos.'));
      }
    })
    .catch(error => {
      console.error('Error en fetchProducts:', error);
      alert('Ocurrió un error al obtener los productos.');
    });
};

// 1️⃣1️⃣ Llamar a la función renderProducts en una función de autoejecución
(() => {
  renderProducts();
})();


(() => {
    alert("¡Bienvenido a la página!");
    console.log("Mensaje de bienvenida mostrado.");
})();