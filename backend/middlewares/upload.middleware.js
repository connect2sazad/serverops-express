import multer from 'multer';
import { MAX_FILE_UPLOAD_SIZE } from '../config/config.js';


const storage = multer.memoryStorage();

const upload = multer({
    storage,

    limits: {
        fileSize: MAX_FILE_UPLOAD_SIZE, 
    }
});

export default upload;