import * as fs from "fs";
import * as path from "path";
import * as compressing from "compressing";
import * as child_process from "child_process";
import {window } from "vscode";
import Utils from "./Utils";

export default abstract class IPackage{
    // 需要打包的app目录
    protected mateInfo: MateInfo;

    constructor(mateInfo: MateInfo){
        this.mateInfo = mateInfo;
    }
    /**
     * 打包
     */
    public abstract doPackage():boolean;
    /**
     * 根据打包类型，生成对应实现
     * @param packageType 打包类型
     * @param mateInfo
     */
    static getIPackage(packageType: PackageType,mateInfo: MateInfo):IPackage{
        if(packageType === PackageType.Wechat){
            return new WechatPackage(mateInfo);
        }
        return new CmpPackage(mateInfo);
    }
    /**
     * 删除目录
     * @param folder
     */
    static deleteFolder(folder: string) {
        let files = [];
        if (fs.existsSync(folder)) {
            files = fs.readdirSync(folder);
            files.forEach(function (file, index) {
                const curPath = `${folder}${path.sep}${file}`;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    IPackage.deleteFolder(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            try{
                fs.rmdirSync(folder);
            } catch (error) {
                Utils.log("删除临时文件出错",error);
            }
        }
    }
}

class CmpPackage extends IPackage{
    public doPackage(): boolean {
        // ${m3Tools}/libs/fastjson.jar;${m3Tools}/libs/s3script.jar;${m3Tools}/libs/rhino_15.jar
        let classpathjar=`${this.mateInfo.m3Tools}${path.sep}libs${path.sep}fastjson-1.1.27.jar;${this.mateInfo.m3Tools}${path.sep}libs${path.sep}s3script.jar;${this.mateInfo.m3Tools}${path.sep}libs${path.sep}rhino_15.jar`;
        
        // ${m3Tools}/libs/RunI18n.jar
        let i18nclasspathjar=`${this.mateInfo.m3Tools}${path.sep}libs${path.sep}RunI18n.jar`;

        // ${seeyon}/m3files/[m3|v5]/${bundleName}.zip
        let v5OutPath = `${this.mateInfo.v5Runtime}${path.sep}m3files${path.sep}${this.mateInfo.team}${path.sep}${this.mateInfo.appId}.zip`;
        
        // ${appCurrentPath}/out/vreport.zip
        let tempDir = `${this.mateInfo.v5Runtime}${path.sep}m3files${path.sep}v5temp`;
        let outZip = `${tempDir}${path.sep}${this.mateInfo.bundleName}.zip`;
        let outUnzip = `${tempDir}${path.sep}${this.mateInfo.bundleName}`;
        
        // ${m3Tools}/jdk/bin/java.exe
        let javaExe = `${this.mateInfo.m3Tools}${path.sep}jdk${path.sep}bin${path.sep}java.exe`;
        
        let cmpCmd = `${javaExe} -Dfile.encoding=UTF-8  -classpath ${classpathjar} org.s3.script.web.S3ScriptPublishCmd -sourcepath ${this.mateInfo.appCurrentPath}  -outfile ${outZip}   -commondata ${this.mateInfo.appCurrentPath}${path.sep}s3scriptjspdata${path.sep}cmp_commondata.data  -testdatapath null  -noexportpaths 'appRes;WEB-INF;s3scriptjspdata;s3uuid.data'  -buildversion ${this.mateInfo.buildversion}`;
        child_process.execSync(cmpCmd);

        //解压文件
        compressing.zip.uncompress(outZip,outUnzip).then(() =>{
            // 国际化
            let propertistojs = `${javaExe} -Dfile.encoding=UTF-8 -classpath ${i18nclasspathjar} com.seeyon.m3script.plugin.i18n.RunI18n ${outUnzip} "/i18n/" "1"`;
            child_process.execSync(propertistojs);
            // 再次压缩
            compressing.zip.compressDir(outUnzip,v5OutPath,{
                ignoreBase:true// 忽略当前目录
            }).then(()=>{
                try {
                    IPackage.deleteFolder(tempDir);//删除临时目录
                } catch (error) {
                    Utils.log("删除临时文件出错",error);
                }
                let msg  = `${v5OutPath} package success!`;
                Utils.updateStatusBar(`${this.mateInfo.appName} cmp package success`,msg);
                if(!this.mateInfo.autoPublish){
                    window.showInformationMessage(msg);
                }else{
                    Utils.doPublish(this.mateInfo.address,this.mateInfo.passwd);
                }
            }).catch(error=>{
                let msg  = `${v5OutPath} package fail!`;
                window.showInformationMessage(msg);
                Utils.updateStatusBar(`${this.mateInfo.appName} cmp package fail`,error);
            });
        });
        return true;

    }

}

class WechatPackage  extends IPackage{
    public doPackage(): boolean {

        // ${m3Tools}/libs/fastjson.jar;${m3Tools}/libs/s3script.jar;${m3Tools}/libs/rhino_15.jar
        let classpathjar=`${this.mateInfo.m3Tools}${path.sep}libs${path.sep}fastjson-1.1.27.jar;${this.mateInfo.m3Tools}${path.sep}libs${path.sep}s3script.jar;${this.mateInfo.m3Tools}${path.sep}libs${path.sep}rhino_15.jar`;
        let i18nclasspathjar=`${this.mateInfo.m3Tools}${path.sep}libs${path.sep}RunI18n.jar`;

        // ${seeyon}/m3/apps/[v5|m3]/${bundleName}
        let v5OutPath = `${this.mateInfo.v5Runtime}${path.sep}m3${path.sep}apps${path.sep}${this.mateInfo.team}${path.sep}${this.mateInfo.bundleName}`;

        // ${appCurrentPath}/m3/apps/vreport.zip
        let outZip = `${this.mateInfo.v5Runtime}${path.sep}m3${path.sep}apps${path.sep}${this.mateInfo.bundleName}.zip`;
        
        // ${m3Tools}/jdk/bin/java.exe
        let javaExe = `${this.mateInfo.m3Tools}${path.sep}jdk${path.sep}bin${path.sep}java.exe`;
        
        let wechatCmd = `${javaExe} -Dfile.encoding=UTF-8  -classpath ${classpathjar} org.s3.script.web.S3ScriptPublishCmd -sourcepath ${this.mateInfo.appCurrentPath}  -outfile ${outZip}   -commondata ${this.mateInfo.appCurrentPath}${path.sep}s3scriptjspdata${path.sep}wechat_commondata.data  -testdatapath null  -noexportpaths 'appRes;WEB-INF;s3scriptjspdata;s3uuid.data'  -buildversion ${this.mateInfo.buildversion}`;
        let rs = child_process.execSync(wechatCmd);

        compressing.zip.uncompress(outZip,v5OutPath)
            .then(() =>{
                let propertistojs = `${javaExe} -Dfile.encoding=UTF-8 -classpath ${i18nclasspathjar} com.seeyon.m3script.plugin.i18n.RunI18n ${v5OutPath} "/i18n/" "1"`;
                child_process.execSync(propertistojs);
                try {
                    fs.unlinkSync(outZip);
                } catch (error) {
                    Utils.log("删除临时文件出错",error);
                }
                let msg  = `${v5OutPath} package success!`;
                window.showInformationMessage(msg);
                Utils.updateStatusBar(`${this.mateInfo.appName} wechat package success`,msg);
            }).catch(error=>{
                let msg  = `${v5OutPath} package fail!`;
                window.showInformationMessage(msg);
                Utils.updateStatusBar(`${this.mateInfo.appName} wechat package fail`,error);
            });
        return true;
    }
    
}
/**
 * 要打包的元数据
 */
export class MateInfo{
    public appId: string|undefined;
    public appName: string|undefined;
    public appCurrentPath: string|undefined;
    public v5Runtime: string|undefined;
    public m3Tools: string|undefined;
    public bundleName: string|undefined;
    public team: string|undefined;
    public buildversion: boolean = true;

    public passwd:string|undefined  = "123456";
    public address:string|undefined = "127.0.0.1";
    public autoPublish:boolean = true;
}
/**
 * 导包类型枚举
 */
export enum PackageType {
    Cmp = 1,
    Wechat = 2
}