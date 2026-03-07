import { server } from './app.js';

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const HOST_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

server.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en ${HOST_URL}`);
  console.log(`📺 Pantalla de Cocina/Cliente: ${HOST_URL}/pantalla.html`);
});

// Manejo de promesas rechazadas no controladas
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});