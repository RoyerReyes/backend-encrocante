/**
 * Middleware centralizado para manejar errores.
 * Se activa cuando se llama a next(error) en cualquier parte de la aplicación.
 */
export const errorHandler = (err, req, res, next) => {
  // Imprimir el error en la consola para debugging
  // err.stack proporciona más detalles, incluyendo la línea donde ocurrió el error
  console.error(err.stack);

  // Enviar una respuesta genérica de error al cliente
  // Es una buena práctica no filtrar detalles del error al cliente en producción
  res.status(500).json({ 
    message: "Ocurrió un error inesperado en el servidor.",
    error: process.env.NODE_ENV === 'development' ? err.message : {} // Opcional: mostrar más info en desarrollo
  });
};
