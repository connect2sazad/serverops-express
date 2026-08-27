import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

import { MAX_FILE_UPLOAD_SIZE, FILE_UPLOAD_DIR } from '../config/config.js';

const uploadDirectory = path.resolve(FILE_UPLOAD_DIR)

const storage = multer.diskStorage({

    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },

    filename: (req, file, callback) => {
        
        const extension = path.extname(file.originalname);

        const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;

        callback(null, filename);

    }

});

const upload = multer({
    storage,

    limits: {
        fileSize: MAX_FILE_UPLOAD_SIZE, 
    }
});

export default upload;