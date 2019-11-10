import { PackageType } from "./Enums";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { ParsedPath } from "path";
import Utils from "./Utils";
import DateFormat from "./DateFormat";
import { window, Range, Selection, workspace } from "vscode";
import ClassUtils from "./ClassUtils";
/**
 * 没有文件异常
 */
class NosuchFileException implements Error {
    constructor(info: string) {
        this.message = info;
    }
    message: string;
    name: string;
}

/**
 * cmp 构建工具
 */
class BuildUtils {
    /**
     * Unicode 转换为中文
     * @param uri 
     */
    static cvtUnicodeToChinese(uri: any) {
        BuildUtils.doCovert(uri, false);
    }
    /**
     * 中文转换为 Unicode
     * @param uri 
     */
    static cvtChineseToUnicode(uri: any) {
        const unicodeUpperCase = workspace.getConfiguration("seeyon.cmp-helper").get("properties.unicode.upperCase", true);
        BuildUtils.doCovert(uri, true, unicodeUpperCase);
    }
    static build(uri: any, pgType: PackageType) {


    }
    /**
     * properties文件转换为JS
     * @param uri 
     */
    static propertiesToJsCommend(uri: any) {
        let path = Utils.getPathOrActivepath(uri);
        if (path === null) {
            return;
        }
        BuildUtils.propertiesToJs(path);
    }
    /**
     * properties 转换为 JS文件
     * @param src 源文件
     * @param target 目標文件[如果为空表示生成到当前文件的文件目录]
     */
    static propertiesToJs(src: string, target: string | undefined = undefined) {
        if (!fs.existsSync(src)) {
            throw new NosuchFileException("文件不存在：" + src);
        }
        let targetFileName = target;
        if (ClassUtils.isUndefined(target)) {
            let parsedPath: ParsedPath = BuildUtils.parseAndcreateParent(src);
            targetFileName = `${parsedPath.dir}${path.sep}${parsedPath.name}.js`;
        }
        BuildUtils.parseAndcreateParent(targetFileName);

        let input = fs.createReadStream(src, { "encoding": "utf8", "flags": "r", "autoClose": true });
        let output = fs.createWriteStream(targetFileName, { "encoding": "utf8", "flags": "w", "autoClose": true });
        const rline = readline.createInterface({
            input: input,
            output: output,
            terminal: false
        });

        output.write(`/** auto create by cmpHelper at ${DateFormat.format(new Date(), "yyyy-MM-dd HH:mm:ss")} **/\n`);
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

    static parseAndcreateParent(fileDir: string): ParsedPath {
        let parsePath: ParsedPath = path.parse(fileDir);
        if (!fs.existsSync(parsePath.dir)) {
            fs.mkdirSync(parsePath.dir);
        }
        return parsePath;
    }
    private static doCovert(uri: any, toUnicode: boolean, upperCase: boolean = true) {
        let filePath = Utils.getPathOrActivepath(uri);
        if (window.activeTextEditor && filePath === window.activeTextEditor.document.fileName) {
            const editor = window.activeTextEditor;
            const document = editor.document;
            const text = document.getText();
            const newText = text.split(/\r?\n/g).map(line => {
                if (toUnicode) {
                    return BuildUtils.toUnicode(line, upperCase);
                } else {
                    return BuildUtils.toChinese(line);
                }
            }).join("\n");
            // 替换当前的全部
            const invalidRange = new Range(0, 0, document.lineCount, 0);
            const fullRange = document.validateRange(invalidRange);
            editor.edit(builder => builder.replace(fullRange, newText));
            //重新选择范围
            editor.selection = new Selection(0, 0, 0, 0);
        } else {
            BuildUtils.cvtFile(filePath, toUnicode, upperCase);
        }
    }
    private static cvtFile(filePath: string, toUnicode: boolean, upperCase: boolean = true) {
        let input = fs.createReadStream(filePath, { "encoding": "utf8", "flags": "r", "autoClose": true });
        const rline = readline.createInterface({
            input: input,
            terminal: false
        });
        let afterData = "";
        rline.on("line", line => {
            if (line.startsWith("#")) {// properties 注釋
                afterData = `${afterData}${BuildUtils.toChinese(line)}\n`;
                return;
            }
            if (toUnicode) {
                afterData = `${afterData}${BuildUtils.toUnicode(line, upperCase)}\n`;
            } else {
                afterData = `${afterData}${BuildUtils.toChinese(line)}\n`;
            }
        });
        rline.on("close", () => {
            input.close();

            // 读取结束后，写入文件
            const output = fs.createWriteStream(filePath, { "encoding": "utf8", "flags": "w", "autoClose": true });
            output.write(afterData);
            output.close();
        });
    }
    private static toUnicode(line, upperCase) {
        return line.split('').map(char => {
            const code = char.charCodeAt(0);
            if (code <= 0x7f) {
                return char;
            }
            const escaped = escape(char).replace('%', code <= 0xff ? '\\u00' : '\\');
            return upperCase ? escaped : escaped.toLocaleLowerCase();
        }).join('');
    }
    private static toChinese(line) {
        return unescape(line.replace(/\\u([0-9A-Fa-f]{4})/gi, "%u$1"));
    }
}


export default BuildUtils;