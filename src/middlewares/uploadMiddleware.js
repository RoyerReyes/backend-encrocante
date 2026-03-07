
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Asegurar que el directorio de destino exista
const uploadDir = 'public/uploads/platillos';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generar nombre archivo: platillo_TIMESTAMP_ORIGINALNAME
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'platillo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    console.log('Multer fileFilter checking:', file.originalname, file.mimetype);
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('No es un archivo de imagen válido'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB max
    }
});

export default upload;
