import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import platillosRoutes from "./routes/platillos.js";
import authRoutes from "./routes/auth.js";
import pedidosRoutes from "./routes/pedidos.js";
import usuariosRoutes from "./routes/usuarios.js"; // Importar rutas de usuarios
import { errorHandler } from "./middlewares/errorMiddleware.js";
import detallePedidoRoutes from "./routes/detallePedido.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas (montadas)
app.use("/auth", authRoutes);
app.use("/platillos", platillosRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/usuarios", usuariosRoutes); // Montar rutas de usuarios
app.use("/detalles", detallePedidoRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Bienvenido a la API Encrocante 🚀");
});

// Crear servidor HTTP + socket.io
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Ejemplo de conexión socket
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);
  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Manejador de errores centralizado (DEBE SER EL ÚLTIMO MIDDLEWARE)
app.use(errorHandler);

export { app, server, io };