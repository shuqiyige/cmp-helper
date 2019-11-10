import * as vscode from 'vscode';
import CmpPackageUtils from "./PackageUtils";
import { PackageType } from "./Enums";
import SyncUtils from './SyncUtils';
import Utils from './Utils';
import BuildUtils from './BuildUtils';

export function activate(context: vscode.ExtensionContext) {
    Utils.init();
    Utils.log('cmp-helper is active!');
    // 打包到cmp zip
    let cmpPackage = vscode.commands.registerCommand('extension.cmpPackage', (uri) => {
        CmpPackageUtils.doPackage(uri, PackageType.Cmp);
    });
    // 打包到wechat
    let wechatPackage = vscode.commands.registerCommand('extension.wechatPackage', (uri) => {
        CmpPackageUtils.doPackage(uri, PackageType.Wechat);
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
        BuildUtils.cvtChineseToUnicode(uri);
    });
    // unicode转中文
    let unicodeToCh = vscode.commands.registerCommand('extension.unicodeToCh', (uri) => {
        BuildUtils.cvtUnicodeToChinese(uri);
    });
    // java 的properties文件转换为js 的国际化
    let propertiesToJs = vscode.commands.registerCommand('extension.propertiesToJs', (uri) => {
        BuildUtils.propertiesToJsCommend(uri);
    });
    context.subscriptions.push(cmpPackage);
    context.subscriptions.push(wechatPackage);
    context.subscriptions.push(autoSyncStatic);
    context.subscriptions.push(chToUnicode);
    context.subscriptions.push(unicodeToCh);
    context.subscriptions.push(propertiesToJs);
    Utils.log('cmp-helper is Ready!');
}

export function deactivate() {
}
