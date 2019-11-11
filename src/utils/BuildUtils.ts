import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import ClassUtils from "./ClassUtils";
import FileUtils from "./FileUtils";
import { ParsedPath } from "path";
import DateFormatUtils from "./DateFormatUtils";

/**
 * 构建相关工具
 */
class BuildUtils {

    /**
     * properties 转换为 JS文件
     * @param src 源文件
     * @param target 目標文件[如果为空表示生成到当前文件的文件目录]
     */
    public static propertiesToJs(src: string, target: string | undefined = undefined) {
        if (!fs.existsSync(src)) {
            throw new Error("文件不存在：" + src);
        }
        let targetFileName = target;
        if (ClassUtils.isUndefined(target)) {
            let parsedPath: ParsedPath = FileUtils.parseAndcreateParent(src);
            targetFileName = `${parsedPath.dir}${path.sep}${parsedPath.name}.js`;
        }
        // 目标文件生成一下父目录
        FileUtils.parseAndcreateParent(targetFileName);

        let input = fs.createReadStream(src, { "encoding": "utf8", "flags": "r", "autoClose": true });
        let output = fs.createWriteStream(targetFileName, { "encoding": "utf8", "flags": "w", "autoClose": true });
        const rline = readline.createInterface({
            input: input,
            output: output,
            terminal: false
        });

        output.write(`/** auto create by cmpHelper at ${DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss")} **/\n`);
        output.write(`if(typeof fI18nData == "undefined"){\n    fI18nData = {};\n}\n`);
        rline.on("line", (line) => {
            if (line.startsWith("#")) {// properties 注釋
                output.write(`//${BuildUtils.toChinese(line)}\n`);
                return;
            }
            const lineCont: string[] = line.trim().split("=");
            if (lineCont.length !== 2) {
                return;
            }
            const key = lineCont[0].trim();
            let val = BuildUtils.toChinese(lineCont[1]);
            output.write(`fI18nData["${key}"]="${val}";\n`);
        });
        rline.on("close", () => {
            input.close();
            output.close();
        });
    }
    /**
     * 文件转码[Unicode 与 中文]
     * @param filePath 文件目录
     * @param toUnicode 是否为转换为Unicode
     * @param upperCase 如果是转换Unicode，是否需要要转换为大写
     */
    public static async covertFile(filePath: string, toUnicode: boolean, upperCase: boolean = true) {
        let option = { "encoding": "utf8", "flags": "r" };
        let srcText: string = fs.readFileSync(filePath, option);
        // 读取结束后，写入文件
        const output = fs.createWriteStream(filePath, { "encoding": "utf8", "flags": "w", "autoClose": true });
        output.write(BuildUtils.covertText(srcText, toUnicode, upperCase));
        output.close();
    }
    /**
     * 实现多行文字Unicode 与 中文相互转换
     * @param srcText   源字符串  
     * @param toUnicode 是否为转换为Unicode
     * @param upperCase 如果是转换Unicode，是否需要要转换为大写
     */
    public static covertText(srcText: string, toUnicode: boolean, upperCase: boolean = true) {
        return srcText.split(/\r?\n/g).map(line => {
            if (line.startsWith("#")) {// properties 注釋
                //return BuildUtils.toChinese(line);
                return line;// 注释转？
            }
            if (toUnicode) {
                return BuildUtils.toUnicode(line, upperCase);
            } else {
                return BuildUtils.toChinese(line);
            }
        }).join("\n");
    }
    /**
     * 将中文转换为Unicode
     * @param str 需要转换的字符串
     * @param upperCase 
     */
    private static toUnicode(str, upperCase) {
        return str.split('').map(char => {
            const code = char.charCodeAt(0);
            if (code <= 0x7f) {
                return char;
            }
            const escaped = escape(char).replace('%', code <= 0xff ? '\\u00' : '\\');
            return upperCase ? escaped : escaped.toLocaleLowerCase();
        }).join('');
    }
    /**
     * 将Unicode码转换为中文
     * @param str 需要转换的字符串
     */
    private static toChinese(str) {
        return unescape(str.replace(/\\u([0-9A-Fa-f]{4})/gi, "%u$1"));
    }
}
export default BuildUtils;