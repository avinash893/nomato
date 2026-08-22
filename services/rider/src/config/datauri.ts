import DataUriParser from "datauri/parser";
import path from "path";

const getBuffer = (file: Express.Multer.File) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

export default getBuffer;
