import PackType from "../enums/PackType";
import Utils from "../Utils";
import { window, Range, Selection, workspace } from "vscode";
import BuildUtils from "../utils/BuildUtils";
import VSCodeUtils from "../utils/VSCodeUtils";

/**
 * cmp 构建工具
 */
class VSCodeBuildUtil {
    /**
     * properties文件转换为JS
     * @param uri 
     */
    static propertiesToJsCommend(uri: any) {
        let path = VSCodeUtils.getPathOrActivepath(uri);
        if (path === null) {
            return;
        }
        BuildUtils.propertiesToJs(path);
    }
    static build(uri: any, pgType: PackType) {   
        Utils.getAppRootPath(uri);
    }
    /**
     * Unicode 转换为中文
     * @param uri 
     */
    static cvtUnicodeToChineseCommend(uri: any) {
        VSCodeBuildUtil.doCovert(uri, false);
    }
    /**
     * 中文转换为 Unicode
     * @param uri 
     */
    static cvtChineseToUnicodeCommend(uri: any) {
        const unicodeUpperCase = workspace.getConfiguration("seeyon.cmp-helper").get("properties.unicode.upperCase", true);
        VSCodeBuildUtil.doCovert(uri, true, unicodeUpperCase);
    }
    private static doCovert(uri: any, toUnicode: boolean, upperCase: boolean = true) {
        let filePath = VSCodeUtils.getPathOrActivepath(uri);
        if (window.activeTextEditor 
            && filePath === window.activeTextEditor.document.fileName) {
            // 如果该文件为当前真正编辑的文件
            const editor = window.activeTextEditor;
            const srcSelection:Selection = editor.selection;
            const document = editor.document;
            // 替换当前的全部
            const invalidRange = new Range(0, 0, document.lineCount, 0);
            const fullRange = document.validateRange(invalidRange);
            editor.edit(builder => builder.replace(fullRange, BuildUtils.covertText(document.getText(),toUnicode,upperCase)));
            //重新选择范围
            editor.selection = srcSelection;
        } else {
            BuildUtils.covertFile(filePath, toUnicode, upperCase);
        }
    }
}

export default VSCodeBuildUtil;