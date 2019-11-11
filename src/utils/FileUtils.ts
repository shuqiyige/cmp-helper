import * as path from "path";
import * as fs from "fs";

/**
 * 文件操作相关工具
 */
class FileUtils{
    /**
     * 将文件的目录转换为ParsedPath
     * @param fileDir 文件
     */
    static parseAndcreateParent(fileDir: string): path.ParsedPath {
        let parsePath: path.ParsedPath = path.parse(fileDir);
        if (!fs.existsSync(parsePath.dir)) {
            fs.mkdirSync(parsePath.dir);
        }
        return parsePath;
    }
}

export default FileUtils;