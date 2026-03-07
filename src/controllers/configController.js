import { CONFIG_PUNTOS, LIMITES } from "../constants/appConfig.js";

export const getAppConfig = (req, res) => {
    res.json({
        puntos: CONFIG_PUNTOS,
        limites: LIMITES
    });
};

export const uploadQrImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ninguna imagen' });
        }

        // Construct URL similar to platillos: http://host:port/uploads/platillos/filename
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/platillos/${req.file.filename}`;

        res.json({
            message: 'QR subido correctamente',
            imagen_url: imageUrl
        });
    } catch (error) {
        console.error('Error al subir QR:', error);
        res.status(500).json({ message: 'Error interno al procesar la imagen' });
    }
};
