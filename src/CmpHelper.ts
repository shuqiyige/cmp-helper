import * as vscode from 'vscode';
import CmpPackageUtils from "./PackageUtils";
import PackType from "./enums/PackType";
import SyncUtils from './commends/SyncUtils';
import VSCodeBuildUtil from './commends/VSCodeBuildUtil';
import LogFactory, { Logger } from './utils/LogFactory';
import { window, StatusBarItem, OutputChannel, StatusBarAlignment } from 'vscode';
import ClassUtils from './utils/ClassUtils';

export function activate(context: vscode.ExtensionContext) {
    LogFactory.initLog(new VSCodeLogger());
    LogFactory.log('cmp-helper is active!');
    // 打包到cmp zip
    let cmpPackage = vscode.commands.registerCommand('extension.cmpPackage', (uri) => {
        CmpPackageUtils.doPackage(uri, PackType.Cmp);
    });
    // 打包到wechat
    let wechatPackage = vscode.commands.registerCommand('extension.wechatPackage', (uri) => {
        CmpPackageUtils.doPackage(uri, PackType.Wechat);
    });
    // 保存即时更新
    let autoSyncStatic = vscode.workspace.onDidSaveTextDocument((e: vscode.TextDocument) => {
        let autoSyncStatic = vscode.workspace.getConfiguration('seeyon.cmp-helper').get("autoSyncStatic", true);
        if (autoSyncStatic) {
            SyncUtils.doSync(e.fileName);
        }
    });
    // 中文转unicode
    let chToUnicode = vscode.commands.registerCommand('extension.chToUnicode', (uri) => {
        VSCodeBuildUtil.cvtChineseToUnicodeCommend(uri);
    });
    // unicode转中文
    let unicodeToCh = vscode.commands.registerCommand('extension.unicodeToCh', (uri) => {
        VSCodeBuildUtil.cvtUnicodeToChineseCommend(uri);
    });
    // java 的properties文件转换为js 的国际化
    let propertiesToJs = vscode.commands.registerCommand('extension.propertiesToJs', (uri) => {
        VSCodeBuildUtil.propertiesToJsCommend(uri);
    });
    context.subscriptions.push(cmpPackage);
    context.subscriptions.push(wechatPackage);
    context.subscriptions.push(autoSyncStatic);
    context.subscriptions.push(chToUnicode);
    context.subscriptions.push(unicodeToCh);
    context.subscriptions.push(propertiesToJs);
    LogFactory.log('cmp-helper is Ready!');
}

export function deactivate() {
}


class VSCodeLogger implements Logger{
    private statusBar: StatusBarItem | undefined;
    private logger: OutputChannel | undefined;
    private timeer = null;
    /**
     * 初始化 状态栏实例
     * @param statusBarItem
     */
    constructor(){
        let statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 1);
        //statusBarItem.command = '';//可以设置命令
        statusBarItem.show();
        this.statusBar = statusBarItem;
        this.statusBar.text = 'CmpHelper is Ready';
        this.updateStatusBar("Ready", " cmp helper is Ready");
        //日志
        this.logger = window.createOutputChannel('CmpHelper');
    }
       /**
     * 更新状态栏
     * @param text 显示的文字
     * @param tooltip tips
     */
    updateStatusBar(text: string = "", tooltip: string = "") {
        this.statusBar.text = 'CmpHelper: ' + text;
        this.statusBar.tooltip = 'CmpHelper: ' + tooltip;
        this.log(tooltip);
        try {
            if (this.timeer !== null) {
                clearTimeout(this.timeer);
            }
            this.timeer = setTimeout(() => {
                this.timeer = null;
                this.statusBar.text = 'CmpHelper: Ready';
                this.statusBar.tooltip = 'CmpHelper: cmp helper is Ready';
            }, 100000);
        } catch (e) {
        }
    }
    showError(content: string) {
        window.showErrorMessage(content);
    }    
    showAlert(content: string) {
        window.showInformationMessage(content);
    }
    updateStatus(msg: string = "", detail: string = "") {
        this.updateStatusBar(msg,detail)
    }
    /**
     * 日志输出
     * @param args
     */
    log(...args) {
        if(ClassUtils.isUndefinedOrNull(args)){
            return;
        }
        args.forEach(function (str, index, arr) {
            try {
                this.logger.appendLine(str);
            } catch (error) {
            }
        });
        console.log(...args);
    }
}