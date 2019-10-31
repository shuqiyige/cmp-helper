import * as path from "path"
import * as fs from "fs"
import { StatusBarItem,workspace, WorkspaceConfiguration } from "vscode";
import ClassUtils from "./ClassUtils";

class Utils{
    /**
     * 读取 manifest.json
     * @param appPath 
     */
    static readManifest(appPath: string|undefined):any{
        if(ClassUtils.isUndefinedOrNull(appPath)){
            return;
        }
        const manifest = path.join(appPath,"manifest.json");
        if(!fs.existsSync(manifest)){
            return;
        }
        let manifestJson:any = JSON.parse(fs.readFileSync(manifest,{
            "encoding": "utf8",
            "flag": "r"//读模式
        }));
        return manifestJson;
    }
    /**
     * 判断当前控件是否已经配置
     */
    static isConfig():boolean{
        const myConfigs: WorkspaceConfiguration = workspace.getConfiguration("seeyon.cmp-helper");
        if(ClassUtils.isUndefinedOrNull(myConfigs)){
            return false;
        }
        const packageApps = myConfigs.get("packageApps",[]);
        if(packageApps.length === 0){
            let msg = `seeyon.cmp-helper.packageApps is empty!`;
           Utils.updateStatusBar("config is empty",msg);
            return false;
        }
        const v5Runtime  = myConfigs.get("v5Runtime",undefined);
        if(ClassUtils.isUndefinedOrNull(v5Runtime)){
            let msg = `seeyon.cmp-helper.v5Runtime is empty!`;
            Utils.updateStatusBar("config is empty",msg);
            return false;
        }
        const m3Tools = myConfigs.get("m3Tools",undefined);
        if(ClassUtils.isUndefinedOrNull(m3Tools)){
            let msg = `seeyon.cmp-helper.m3Tools is empty!`;
            Utils.updateStatusBar("config is empty",msg);
            return false;
        }
        return true;
    }

    private static statusBar: StatusBarItem|undefined;
    /**
     * 初始化 状态栏实例
     * @param statusBarItem 
     */
    static initStatusBar(statusBarItem: StatusBarItem){
        Utils.statusBar = statusBarItem;
        Utils.statusBar.text = 'CmpHelper is Ready';
        Utils.updateStatusBar("Ready"," cmp helper is Ready");
    }
    /**
     * 更新状态栏
     * @param text 显示的文字 
     * @param tooltip tips
     */
    static updateStatusBar(text: string ="error" ,tooltip: string = "unknown error"){
        if(ClassUtils.isUndefined(Utils.statusBar)){
            return;
        }
        Utils.statusBar.text = 'CmpHelper: ' + text;
        Utils.statusBar.tooltip = 'CmpHelper: ' + tooltip;
        console.log(tooltip);
    }

    /**
     * 支持同步的文件的后缀
     */
    static allowSyncTypes:string[] = ["js","css","json","svg","ttf","eot","woff","png","jpg","bmp","jpeg","map"];
    /**
     * @param fileName 判断文件是否支持同步
     */
    static isSupportSyncFile(fileName:string):boolean{
        let isSupportFile = false;
        for (let index = 0; index < Utils.allowSyncTypes.length; index++) {
            const element = Utils.allowSyncTypes[index];
            if(fileName.endsWith(element)){
                isSupportFile = true;
            }
        }
        return isSupportFile;
    }

    /**
     * @param currentFileName 当前文件
     */
    static getAppRootPath(currentFileName: string|undefined): string|undefined{
        if(ClassUtils.isUndefinedOrNull(currentFileName)){
            return;
        }
        const packageApps = workspace.getConfiguration("seeyon.cmp-helper").get("packageApps",[]);
        // match all config paths
        for (let index = 0, length = packageApps.length; index < length; index++) {
            const packageApp = packageApps[index];
            const configPath:string = packageApp["path"];
            if(configPath === null){
                continue;
            }
            //nice found
            if(configPath !== null &&  currentFileName.toUpperCase().startsWith(configPath.toUpperCase()) ){
                return configPath;
            }
        }
        return;
    }
}


export default Utils;