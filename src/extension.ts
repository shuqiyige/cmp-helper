import * as vscode from 'vscode';
import CmpPackageUtils from "./PackageUtils";
import {PackageType} from "./IPackage";


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

	context.subscriptions.push(cmpPackage);
	context.subscriptions.push(wechatPackage);

	//
	let statusBarItem:vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, Number.MIN_VALUE);
    //statusBarItem.command = '';//可以设置命令
    statusBarItem.show();
}
export function deactivate() {}
