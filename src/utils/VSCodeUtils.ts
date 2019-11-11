import { window, OutputChannel, StatusBarItem, StatusBarAlignment } from "vscode";
import LogFactory from "./LogFactory";

/**
 * VScode 相关操作工具
 */
class VSCodeUtils{
    /**
     *  获取当前的工作目录
     * @param maybePath 可能是uri
     */
    static getPathOrActivepath(maybePath: any): string | null {
        let appPath = null;
        if (maybePath === null) {
            try {
                appPath = window.activeTextEditor.document.fileName;
            } catch (error) {
                LogFactory.log(error);
            }
        } else {
            appPath = maybePath.fsPath;
        }
        return appPath;
    }
}


export default VSCodeUtils;