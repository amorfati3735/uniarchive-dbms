import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

function checkFileType(file: Express.Multer.File, cb: multer.FileFilterCallback) {
    const filetypesRegex = /pdf|jpg|jpeg|png|doc|docx/i;
    // Just a basic check.
    const extname = filetypesRegex.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypesRegex.test(file.mimetype);

    // Some environments/browsers send odd mimetypes (e.g. application/octet-stream for .pdf on windows)
    // If extension is valid, we might be lenient on mimetype or check strictly.
    // For now, let's relax mimetype check if extension is CLEARLY pdf/doc.
    // Actually, let's just log it in the error so the user can tell us what happened.

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error(`Invalid file type! Extension: ${path.extname(file.originalname)}, Mime: ${file.mimetype}`));
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 25000000 }, // 25MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

export default upload;
