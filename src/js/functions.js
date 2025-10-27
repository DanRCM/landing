'use strict';

let fetchProducts =  (url) => {

    return fetch(url)
        .then(response => {

            // Verificar si la respuesta no es exitosa
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return response.json();

        })
        .then(data => {

            // Respuesta exitosa
            return {
                success: true,
                body: data
            };

        })
        .catch(error => {

            // Error en la solicitud
            return {
                success: false,
                body: error.message
            };

        });
}

export { fetchProducts }
