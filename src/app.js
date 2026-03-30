import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import platillosRoutes from "./routes/platillos.js";
import authRoutes from "./routes/auth.js";
import pedidosRoutes from "./routes/pedidos.js";
import usuariosRoutes from "./routes/usuarios.js";
import detallePedidoRoutes from "./routes/detallePedido.js";
import reportesRoutes from "./routes/reportes.js"; // ADDED
import clientesRoutes from "./routes/clientes.js";
import categoriasRoutes from "./routes/categorias.js"; // ADDED
import salsasRoutes from "./routes/salsasRoutes.js"; // ADDED
import presasRoutes from "./routes/presasRoutes.js"; // ADDED
import configRoutes from "./routes/config.js";
import notificationsRoutes from "./routes/notifications.js"; // ADDED
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { runMigrations } from "./config/migrate.js"; // ADDED

dotenv.config();

const app = express();

// Execute DB migrations
runMigrations();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas
app.use("/auth", authRoutes);
app.use("/platillos", platillosRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/reportes", reportesRoutes);
app.use("/clientes", clientesRoutes);
app.use("/categorias", categoriasRoutes); // ADDED
app.use("/salsas", salsasRoutes); // ADDED
app.use("/presas", presasRoutes); // ADDED
app.use("/config", configRoutes);
app.use("/notifications", notificationsRoutes); // ADDED



// Las rutas para actualizar y eliminar un detalle por su ID específico
// Las rutas para crear y listar detalles estarán anidadas en pedidos.js
app.use("/detalle-pedido", detallePedidoRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Bienvenido a la API Encrocante 🚀");
});

// Crear servidor HTTP + socket.io
// Crear servidor HTTP
const server = createServer(app);

// Inicializar Socket.IO
// Nota: Importamos desde index.js o lo inicializamos aquí, pero ya no exportamos 'io' directamente para evitar dependencias circulares.
// Sin embargo, como 'app.js' es importado por controladores, es mejor inicializarlo en 'index.js' o aquí pero SIN exportarlo para uso en controladores.
// MEJOR ENFOQUE: Inicializar aquí, pero los controladores usan getIO().
import { initSocket } from "./socket.js";
const io = initSocket(server);

// Manejador de errores centralizado (DEBE SER EL ÚLTIMO MIDDLEWARE)
app.use(errorHandler);

export { app, server };