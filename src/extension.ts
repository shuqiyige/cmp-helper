import * as vscode from 'vscode';
import CmpPackageUtils from "./PackageUtils";
import {PackageType} from "./IPackage";
import SyncUtils from './SyncUtils';
import Utils from './Utils';


export function activate(context: vscode.ExtensionContext) {
	console.log('cmp-helper is active!');
	// 打包到cmp zip
	let cmpPackage = vscode.commands.registerCommand('extension.cmpPackage', (uri) => {
		CmpPackageUtils.doPackage(uri,PackageType.Cmp);
	});
	// 打包到wechat
	let wechatPackage = vscode.commands.registerCommand('extension.wechatPackage', (uri) => {
		CmpPackageUtils.doPackage(uri,PackageType.Wechat);
	});
	// 保存及更新
	let autoSyncStatic = vscode.workspace.onDidSaveTextDocument((e: vscode.TextDocument) => {
        let autoSyncStatic = vscode.workspace.getConfiguration('seeyon.cmp-helper').get("autoSyncStatic", true);
        if(autoSyncStatic) {
            SyncUtils.doSync(e.fileName);
        }
    });
	context.subscriptions.push(cmpPackage);
	context.subscriptions.push(wechatPackage);
	context.subscriptions.push(autoSyncStatic);
	//
	let statusBarItem:vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, Number.MIN_VALUE);
    //statusBarItem.command = '';//可以设置命令
	statusBarItem.show();
	Utils.initStatusBar(statusBarItem);
}
export function deactivate() {}
