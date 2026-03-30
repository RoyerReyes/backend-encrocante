/**
 * Configuraciones generales de la aplicación
 */

export const LIMITES = {
  // Cantidad máxima de items por detalle de pedido
  MAX_CANTIDAD_ITEM: 100,

  // Longitud máxima de notas
  MAX_LENGTH_NOTA: 500,
  MAX_LENGTH_OBSERVACIONES: 1000,

  // Longitud de nombres
  MIN_LENGTH_NOMBRE_CLIENTE: 3,
  MAX_LENGTH_NOMBRE_CLIENTE: 100,

  // Precios
  MIN_PRECIO: 0.01,
  MAX_PRECIO: 99999.99,

  // Mesas
  MIN_NUMERO_MESA: 1,
  MAX_NUMERO_MESA: 100
};

export const CONFIG_PUNTOS = {
  SOLES_POR_PUNTO: 25,   // Gastas 25 soles -> Ganas 1 punto
  PUNTOS_POR_SOL_CANJE: 1 // 1 punto = 1 sol de descuento (Valor alto para empezar, ajustable)
};

export const OTA = {
  ANDROID_VERSION: process.env.OTA_ANDROID_VERSION || "1.0.7",
  ANDROID_URL: process.env.OTA_ANDROID_URL || "https://backend-encrocante-pd4y.onrender.com/uploads/apk/app-release.apk",
  FORCE_UPDATE: process.env.OTA_FORCE_UPDATE !== 'false' // defaults to true
};

export const ROLES = {
  ADMIN: 'admin',
  MESERO: 'mesero',
  COCINERO: 'cocina'
};

export const ROLES_ARRAY = Object.values(ROLES);

/**
 * Eventos de WebSocket
 */
export const SOCKET_EVENTS = {
  PEDIDO_ACTUALIZADO: 'pedido_actualizado',
  PEDIDO_CREADO: 'pedido_creado',
  DETALLE_ACTUALIZADO: 'detalle_actualizado',
  ESTADO_ACTUALIZADO: 'estado_actualizado',
  CONEXION: 'connection',
  DESCONEXION: 'disconnect'
};

/**
 * Mensajes de error estándar
 */
export const MENSAJES_ERROR = {
  NO_AUTORIZADO: 'No tienes permisos para realizar esta acción',
  PEDIDO_NO_ENCONTRADO: 'Pedido no encontrado',
  PLATILLO_NO_ENCONTRADO: 'Platillo no encontrado',
  DETALLE_NO_ENCONTRADO: 'Detalle no encontrado',
  MESA_NO_ENCONTRADA: 'Mesa no encontrada',
  CLIENTE_NO_ENCONTRADO: 'Cliente no encontrado',
  PLATILLO_INACTIVO: 'El platillo seleccionado no está disponible',
  PEDIDO_NO_MODIFICABLE: 'No se puede modificar un pedido en este estado',
  TRANSICION_INVALIDA: 'La transición de estado no es válida',
  DATOS_INVALIDOS: 'Los datos proporcionados son inválidos',
  ERROR_SERVIDOR: 'Error interno del servidor',
  SIN_DETALLES: 'El pedido debe tener al menos un platillo'
};

/**
 * Regex para validaciones
 */
export const REGEX = {
  NOMBRE_CLIENTE: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  SOLO_LETRAS_ESPACIOS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
};
