import * as vscode from 'vscode';
import IPackage ,{PackageType,MateInfo} from "./IPackage";
import ClassUtils from "./ClassUtils";
import Utils from "./Utils";

class CmpPackageUtils {

    static doPackage_(_appPath: any, type: PackageType){
        if(!Utils.isConfig()){
            return;
        }
        let mateinfo:MateInfo = new MateInfo();
        mateinfo.appCurrentPath = Utils.getAppRootPath(_appPath);

        // not found config
        if(ClassUtils.isUndefinedOrNull(mateinfo.appCurrentPath)){
            let msg = `seeyon.cmp-helper.packageApps not matched current path [${_appPath}]!`;
            Utils.updateStatusBar("path not match",msg);
            return;
        }
        // read config  manifest.json
        let manifestJson:any = Utils.readManifest(mateinfo.appCurrentPath);
        if(ClassUtils.isUndefinedOrNull(manifestJson)){
            return;
        }
        
        mateinfo.appId = manifestJson.appId;
        mateinfo.appName = manifestJson.appName;
        mateinfo.bundleName = manifestJson.bundleName;
        mateinfo.team = manifestJson.team;
        mateinfo.v5Runtime = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("v5Runtime",undefined);
        mateinfo.buildversion = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("buildversion",true);

        // 热部署
        mateinfo.address = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("address","http://127.0.0.1");
        mateinfo.passwd = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("passwd","system");
        mateinfo.autoPublish = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("autoPublish",true);

        if(ClassUtils.isUndefinedOrNull(mateinfo.v5Runtime)){
            let msg = `seeyon.cmp-helper.v5Runtime is empty!`;
            Utils.updateStatusBar(msg,msg);
            return;
        }

        mateinfo.m3Tools = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("m3Tools",undefined);
        if(ClassUtils.isUndefinedOrNull(mateinfo.m3Tools)){
            let msg = `seeyon.cmp-helper.m3Tools is empty!`;
            Utils.updateStatusBar(msg,msg);
            return;
        }
        IPackage.getIPackage(type,mateinfo).doPackage();
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
        if (ClassUtils.isUndefinedOrNull(appPath)) {
            Utils.updateStatusBar("unknown package path",`${packageName} package cancel for unknown package path!`);
            return;
        }
        Utils.log(`${packageName} package start!`);
        CmpPackageUtils.doPackage_(appPath, type);
        Utils.log(`${packageName} package end!`);
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
                Utils.log(error);
            }
        } else {
            appPath = maybePath.fsPath;
        }
        return appPath;
    }
}

export default CmpPackageUtils;