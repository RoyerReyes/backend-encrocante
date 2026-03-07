/**
 * Estados válidos para pedidos
 * Centralizado para evitar inconsistencias
 */

export const ESTADOS_PEDIDO = {
  RECIBIDO: 'recibido', // Nuevo estado inicial (opcional, si el POS lo asigna)
  PENDIENTE: 'pendiente', // Default DB
  EN_PREPARACION: 'en_preparacion',
  LISTO: 'listo',
  ENTREGADO: 'entregado',
  PAGADO: 'pagado', // Nuevo estado final
  CANCELADO: 'cancelado'
};

export const ESTADOS_ARRAY = Object.values(ESTADOS_PEDIDO);

/**
 * Transiciones válidas de estados
 * Formato: { estadoActual: [estadosPermitidos] }
 */
export const TRANSICIONES_VALIDAS = {
  [ESTADOS_PEDIDO.RECIBIDO]: [
    ESTADOS_PEDIDO.PENDIENTE,
    ESTADOS_PEDIDO.EN_PREPARACION,
    ESTADOS_PEDIDO.CANCELADO
  ],
  [ESTADOS_PEDIDO.PENDIENTE]: [
    ESTADOS_PEDIDO.EN_PREPARACION,
    ESTADOS_PEDIDO.CANCELADO
  ],
  [ESTADOS_PEDIDO.EN_PREPARACION]: [
    ESTADOS_PEDIDO.LISTO,
    ESTADOS_PEDIDO.CANCELADO,
    ESTADOS_PEDIDO.RECIBIDO // Pausar
  ],
  [ESTADOS_PEDIDO.LISTO]: [
    ESTADOS_PEDIDO.ENTREGADO, // Servir
    ESTADOS_PEDIDO.CANCELADO,
    ESTADOS_PEDIDO.EN_PREPARACION // Volver a cocina (Corrección)
  ],
  [ESTADOS_PEDIDO.ENTREGADO]: [
    ESTADOS_PEDIDO.PAGADO, // Cobrar
    ESTADOS_PEDIDO.CANCELADO
  ],
  [ESTADOS_PEDIDO.PAGADO]: [],
  [ESTADOS_PEDIDO.CANCELADO]: []
};

/**
 * Valida si una transición de estado es válida
 * @param {string} estadoActual - Estado actual del pedido
 * @param {string} nuevoEstado - Nuevo estado deseado
 * @returns {boolean} - true si la transición es válida
 */
export const esTransicionValida = (estadoActual, nuevoEstado) => {
  // Admin puede cancelar desde cualquier estado salvo pagado
  if (nuevoEstado === ESTADOS_PEDIDO.CANCELADO) {
    return estadoActual !== ESTADOS_PEDIDO.PAGADO && estadoActual !== ESTADOS_PEDIDO.CANCELADO;
  }

  const transicionesPermitidas = TRANSICIONES_VALIDAS[estadoActual] || [];
  return transicionesPermitidas.includes(nuevoEstado);
};

/**
 * Estados que indican que el pedido está activo
 */
export const ESTADOS_ACTIVOS = [
  ESTADOS_PEDIDO.RECIBIDO,
  ESTADOS_PEDIDO.PENDIENTE,
  ESTADOS_PEDIDO.EN_PREPARACION,
  ESTADOS_PEDIDO.LISTO,
  ESTADOS_PEDIDO.ENTREGADO // Ahora se considera activo hasta que se paga
];

/**
 * Estados que indican que el pedido está en historial
 */
export const ESTADOS_HISTORIAL = [
  ESTADOS_PEDIDO.PAGADO,
  ESTADOS_PEDIDO.CANCELADO
];

/**
 * Mapeo de colores para la UI (opcional, para consistencia)
 */
export const COLORES_ESTADO = {
  [ESTADOS_PEDIDO.PENDIENTE]: '#2196F3',       // Azul
  [ESTADOS_PEDIDO.EN_PREPARACION]: '#FF9800',  // Naranja
  [ESTADOS_PEDIDO.LISTO]: '#4CAF50',           // Verde
  [ESTADOS_PEDIDO.ENTREGADO]: '#9E9E9E',       // Gris
  [ESTADOS_PEDIDO.CANCELADO]: '#F44336'        // Rojo
};

/**
 * Labels amigables para los estados
 */
export const LABELS_ESTADO = {
  [ESTADOS_PEDIDO.PENDIENTE]: 'Pendiente',
  [ESTADOS_PEDIDO.EN_PREPARACION]: 'En Preparación',
  [ESTADOS_PEDIDO.LISTO]: 'Listo',
  [ESTADOS_PEDIDO.ENTREGADO]: 'Entregado',
  [ESTADOS_PEDIDO.CANCELADO]: 'Cancelado'
};
