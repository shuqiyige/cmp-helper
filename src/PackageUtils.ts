import * as vscode from 'vscode';
import IPackage from "./IPackage";
import ClassUtils from "./utils/ClassUtils";
import Utils from "./Utils";
import PackType from "./enums/PackType";
import PackInfo from './dto/PackInfo';
import VSCodeUtils from './utils/VSCodeUtils';
import LogFactory from './utils/LogFactory';

class CmpPackageUtils {

    static doPackage_(_appPath: any, type: PackType) {
        if (!Utils.isConfig()) {
            return;
        }
        let mateinfo: PackInfo = new PackInfo();
        mateinfo.appCurrentPath = Utils.getAppRootPath(_appPath);

        // not found config
        if (ClassUtils.isUndefinedOrNull(mateinfo.appCurrentPath)) {
            let msg = `seeyon.cmp-helper.packageApps not matched current path [${_appPath}]!`;
            LogFactory.updateStatus("path not match", msg);
            return;
        }
        // read config  manifest.json
        let manifestJson: any = Utils.readManifest(mateinfo.appCurrentPath);
        if (ClassUtils.isUndefinedOrNull(manifestJson)) {
            return;
        }

        mateinfo.appId = manifestJson.appId;
        mateinfo.appName = manifestJson.appName;
        mateinfo.bundleName = manifestJson.bundleName;
        mateinfo.team = manifestJson.team;
        mateinfo.v5Runtime = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("v5Runtime", undefined);
        mateinfo.buildversion = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("buildversion", true);

        // 热部署
        mateinfo.address = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("address", "http://127.0.0.1");
        mateinfo.passwd = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("passwd", "system");
        mateinfo.autoPublish = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("autoPublish", true);

        if (ClassUtils.isUndefinedOrNull(mateinfo.v5Runtime)) {
            let msg = `seeyon.cmp-helper.v5Runtime is empty!`;
            LogFactory.updateStatus(msg, msg);
            return;
        }

        mateinfo.m3Tools = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("m3Tools", undefined);
        if (ClassUtils.isUndefinedOrNull(mateinfo.m3Tools)) {
            let msg = `seeyon.cmp-helper.m3Tools is empty!`;
            LogFactory.updateStatus(msg, msg);
            return;
        }
        IPackage.getIPackage(type, mateinfo).doPackage();
    }
    /**
     * @param uri 打包的URI
     * @param type 打包类型【cmp or wechat】
     */
    static doPackage(uri: any, type: PackType): void {
        let packageName = "wechat";
        if (type === PackType.Cmp) {
            packageName = "cmp";
        }
        let appPath = VSCodeUtils.getPathOrActivepath(uri);
        if (ClassUtils.isUndefinedOrNull(appPath)) {
            LogFactory.updateStatus("unknown package path", `${packageName} package cancel for unknown package path!`);
            return;
        }
        LogFactory.log(`${packageName} package start!`);
        CmpPackageUtils.doPackage_(appPath, type);
        LogFactory.log(`${packageName} package end!`);
    }
}
export default CmpPackageUtils;