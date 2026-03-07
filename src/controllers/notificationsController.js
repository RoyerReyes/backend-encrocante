import { getIO } from "../socket.js";

export const sendBroadcast = async (req, res) => {
    try {
        const { message, title } = req.body;

        if (!message) {
            return res.status(400).json({ message: "El mensaje es requerido." });
        }

        const io = getIO();

        // Emitir evento a todos los clientes conectados
        // Estructura del payload compatible con el frontend
        io.emit("broadcast_message", {
            title: title || "Anuncio del Administrador",
            message: message,
            timestamp: new Date().toISOString()
        });

        console.log(`📢 Broadcast enviado: ${message}`);

        res.status(200).json({ message: "Broadcast enviado correctamente." });
    } catch (error) {
        console.error("Error enviando broadcast:", error);
        res.status(500).json({ message: "Error interno al enviar broadcast." });
    }
};
