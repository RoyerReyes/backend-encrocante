export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // Reportar todos los errores a la vez
    stripUnknown: true // Eliminar campos que no están en el esquema
  });

  if (error) {
    const errors = error.details.map(detail => ({
      message: detail.message.replace(/"/g, "'"), // Limpiar mensaje
      field: detail.context.key
    }));
    return res.status(400).json({ 
      error: "Datos de entrada inválidos",
      errors 
    });
  }

  req.body = value; // Sobrescribir req.body con los datos validados y saneados
  next();
};
