import { CONFIG_PUNTOS, LIMITES, OTA } from "../constants/appConfig.js";

export const getAppConfig = (req, res) => {
    res.json({
        puntos: CONFIG_PUNTOS,
        limites: LIMITES,
        ota: {
            ...OTA,
            // Construimos la URL dinámica si la variable de entorno está vacía para probar local.
            ANDROID_URL: process.env.OTA_ANDROID_URL || `${req.protocol}://${req.get('host')}/uploads/apk/app-release.apk`
        }
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
