import { Server } from "socket.io";
import { getActivePedidos } from "./models/pedido.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", async (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    // Emitir datos iniciales (Robustez: Refresco)
    try {
      const activePedidos = await getActivePedidos();
      socket.emit("initial_data", activePedidos);
    } catch (error) {
      console.error("Error enviando initial_data socket:", error);
    }

    socket.on("disconnect", () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO no ha sido inicializado.");
  }
  return io;
};
