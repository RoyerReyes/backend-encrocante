/**
 * Tipos válidos para pedidos
 */

export const TIPOS_PEDIDO = {
  MESA: 'mesa',
  DELIVERY: 'delivery',
  RECOJO: 'recojo'
};

export const TIPOS_ARRAY = Object.values(TIPOS_PEDIDO);

/**
 * Validación de campos requeridos según tipo de pedido
 */
export const CAMPOS_REQUERIDOS_POR_TIPO = {
  [TIPOS_PEDIDO.MESA]: {
    mesa_id: true,
    cliente_id: false
  },
  [TIPOS_PEDIDO.DELIVERY]: {
    mesa_id: false,
    cliente_id: true
  },
  [TIPOS_PEDIDO.RECOJO]: {
    mesa_id: false,
    cliente_id: true
  }
};

/**
 * Valida que un tipo de pedido tenga los campos requeridos
 * @param {string} tipo - Tipo de pedido
 * @param {object} data - Datos del pedido
 * @returns {object} - { valido: boolean, errores: string[] }
 */
export const validarCamposPorTipo = (tipo, data) => {
  const errores = [];
  const camposRequeridos = CAMPOS_REQUERIDOS_POR_TIPO[tipo];

  if (!camposRequeridos) {
    errores.push(`Tipo de pedido inválido: ${tipo}`);
    return { valido: false, errores };
  }

  if (camposRequeridos.mesa_id && !data.mesa_id) {
    errores.push('El campo mesa_id es requerido para pedidos de tipo mesa');
  }

  if (camposRequeridos.cliente_id && !data.cliente_id && !data.nombre_cliente) {
    errores.push('Se requiere seleccionar un cliente o ingresar su nombre para pedidos de tipo delivery o recojo');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};
