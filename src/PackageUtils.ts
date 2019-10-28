import * as vscode from 'vscode';
import IPackage ,{PackageType,MateInfo} from "./IPackage";
import ClassUtils from "./ClassUtils";
import { StatusBarItem,window } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';




class CmpPackageUtils {
    private static statusBar: StatusBarItem|undefined;
    static initStatusBar(statusBarItem: StatusBarItem){
        this.statusBar = statusBarItem;
    }

    static updateStatusBar(text: string ="error" ,tooltip: string = "unknown error"){
        if(ClassUtils.isUndefined(CmpPackageUtils.statusBar)){
            return;
        }
        //window.setStatusBarMessage(tooltip);
        CmpPackageUtils.statusBar.text = text;
        CmpPackageUtils.statusBar.tooltip = tooltip;
        console.log(tooltip);
    }


    static doPackage_(_appPath: any, type: PackageType): boolean{
        const packageApps = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("packageApps",[]);
        if(packageApps.length === 0){
           let msg = `seeyon.cmp-helper.packageApps is empty!`;
            CmpPackageUtils.updateStatusBar("config is empty",msg);
            return false;
        }

        let mateinfo:MateInfo = new MateInfo();
        // match all config paths
        for (let index = 0, length = packageApps.length; index < length; index++) {
            const packageApp = packageApps[index];
            const configPath:string = packageApp["path"];
			if(configPath === null){
				continue;
			}
			//nice found
			if(configPath !== null &&  _appPath.toUpperCase().startsWith(configPath.toUpperCase()) ){
                mateinfo.appCurrentPath = configPath;
				break;
			}
        }

        // not found config
        let configPath:string = mateinfo.appCurrentPath;
        if(configPath === undefined){
            let msg = `seeyon.cmp-helper.packageApps not matched current path [${_appPath}]!`;
            CmpPackageUtils.updateStatusBar("path not match",msg);
            return false;
        }

        // read config  manifest.json
        const manifest = path.join(configPath,"manifest.json");
        if(!fs.existsSync(manifest)){
            let msg = `${manifest} not exist !`;
            CmpPackageUtils.updateStatusBar("manifest.json not found",msg);
            return false;
        }
        let manifestJson:any = JSON.parse(fs.readFileSync(manifest,{
            "encoding": "utf8",
            "flag": "r"//读模式
        }));

        mateinfo.appId = manifestJson.appId;
        mateinfo.appName = manifestJson.appName;
        mateinfo.bundleName = manifestJson.bundleName;

        mateinfo.v5Runtime = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("v5Runtime",undefined);
        if(ClassUtils.isUndefinedOrNull(mateinfo.v5Runtime)){
            let msg = `seeyon.cmp-helper.v5Runtime is empty!`;
            CmpPackageUtils.updateStatusBar(msg,msg);
            return false;
        }

        mateinfo.m3Tools = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("m3Tools",undefined);
        if(ClassUtils.isUndefinedOrNull(mateinfo.m3Tools)){
            let msg = `seeyon.cmp-helper.m3Tools is empty!`;
            CmpPackageUtils.updateStatusBar(msg,msg);
            return false;
        }
        let mypackage:IPackage = IPackage.getIPackage(type,mateinfo);
        return mypackage.doPackage();
    }
    /**
     * @param uri 打包的URI
     * @param type 打包类型【cmp or wechat】
     */
    static doPackage(uri: any, type: PackageType): void {
        let packageName = "wechat";
        if (type === PackageType.Cmp) {
            packageName = "cmp";
        }
        let appPath = CmpPackageUtils.getPath(uri);
        if (appPath === null) {
            CmpPackageUtils.updateStatusBar("unknown package path",`${packageName} package cancel for unknown package path!`);
            return;
        }
        console.log(`${packageName} package start!`);
        if (type === PackageType.Cmp) {
        }
        let success: boolean = CmpPackageUtils.doPackage_(appPath, type);
        if (success) {
            vscode.window.showInformationMessage(`${packageName} package success!`);
        } else {
            vscode.window.showErrorMessage(`${packageName} package fail!`);
        }
        console.log(`${packageName} package end!`);
    }
    /**
     * 获取当前的工作目录
     * @param maybePath 可能是目录
     */
    private static getPath(maybePath: any): string | null {
        let appPath = null;
        if (maybePath === null) {
            try {
                appPath = vscode.window.activeTextEditor.document.fileName;
            } catch (error) {
                console.log(error);
            }
        } else {
            appPath = maybePath.fsPath;
        }
        return appPath;
    }
}

export default CmpPackageUtils;