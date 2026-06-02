import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const uploadFile = multer({ storage: storage }).single("file");

export default uploadFile;
