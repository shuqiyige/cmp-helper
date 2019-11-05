import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import Utils from './Utils';
import ClassUtils from './ClassUtils';

class SyncUtils{
    
    static allowSyncTypes:string[] = ["js","css","json","svg","ttf","eot","woff","png","jpg","bmp","jpeg"];
    /**
     * 
     * @param fileName 同步文件
     */
	static doSync(fileName: string) {
        Utils.updateStatusBar(`start sync file[${fileName}]`);
        if(!Utils.isConfig() || !Utils.isSupportSyncFile(fileName)){
            return;
        }
        let appPath = Utils.getAppRootPath(fileName);
        if(ClassUtils.isUndefinedOrNull(appPath)){
            return;
        }

        let manifestJson:any = Utils.readManifest(appPath);
        const v5Runtime = vscode.workspace.getConfiguration("seeyon.cmp-helper").get("v5Runtime")
        //${seeyon}m3/apps/v5/${apppath}
        let relativePath = fileName.substr(appPath.length);
        let targetPath = `${v5Runtime}${path.sep}m3${path.sep}apps${path.sep}${manifestJson.team}${path.sep}${manifestJson.bundleName}${relativePath}`;
        try {
            fs.writeFileSync(targetPath,fs.readFileSync(fileName));
            Utils.updateStatusBar("sync file success！",fileName + " --> " + targetPath);
            console.debug("sync file success!",fileName + " --> " + targetPath);
        } catch (error) {
            Utils.updateStatusBar("sync file fail！",error);
            console.debug("sync file fail!",error);
        }
	}

}
export default SyncUtils;