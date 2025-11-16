# GameDeals - Landing Page de Juegos Gratis y Ofertas

## Descripción del Proyecto

GameDeals es una landing page moderna y responsive que utiliza la API de GamerPower para mostrar giveaways activos de juegos y contenido gratuito. Los usuarios pueden explorar ofertas, filtrar por plataforma y tipo, guardar sus giveaways favoritos y suscribirse para recibir notificaciones de nuevas ofertas.

## Objetivo

El objetivo de este proyecto es proporcionar una interfaz atractiva y fácil de usar para descubrir juegos gratuitos y ofertas en diversas plataformas. Además, permite a los usuarios guardar sus giveaways de interés y suscribirse para no perderse ninguna oferta.

## Características

- **Explorar Giveaways**: Muestra una lista de giveaways activos con detalles como título, valor, descripción, fecha de finalización y más.
- **Filtros**: Permite filtrar giveaways por plataforma (PC, Steam, Epic Games, etc.) y tipo (Juego, DLC, Early Access, etc.).
- **Guardar Giveaways**: Los usuarios pueden guardar giveaways en su lista personalizada, almacenada en Firebase para persistencia.
- **Suscripciones**: Formulario de suscripción para recibir alertas de nuevas ofertas, guardando los datos en Firebase.
- **Diseño Responsive**: Optimizado para dispositivos móviles y desktop.
- **Tema Oscuro**: Diseño con paleta de colores oscura, típica de gaming.

## Tecnologías Utilizadas

- **Frontend**:
  - HTML5
  - CSS3 (Tailwind CSS)
  - JavaScript (ES6+)
- **Backend y Base de Datos**:
  - Firebase Realtime Database
- **Herramientas de Desarrollo**:
  - Vite (entorno de desarrollo y build)
  - Flowbite (componentes de UI para Tailwind CSS)
- **APIs**:
  - GamerPower API (https://www.gamerpower.com/api)

## Estructura del Proyecto
src/
├── index.html # Página principal
├── js/
│ ├── main.js # Lógica principal de la aplicación
│ ├── gamepower-api.js # Funciones para interactuar con la API de GamerPower
│ └── firebase.js # Configuración y funciones de Firebase
├── .env # Variables de entorno
└── vite.config.js # Configuración de Vite (proxy para CORS)


## Configuración del Proyecto

### Prerrequisitos

- Node.js (versión 14 o superior)
- npm o yarn
- Cuenta en Firebase para usar Realtime Database

### Pasos para Configuración

1. **Clonar el repositorio** (o descargar los archivos)

2. **Instalar dependencias**:
   ```bash
   npm install