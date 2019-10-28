import * as fs from "fs";
import * as path from "path";
import * as compressing from "compressing";
import * as child_process from "child_process";

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
     */
    static getIPackage(packageType: PackageType,mateInfo: MateInfo):IPackage{
        if(packageType === PackageType.Wechat){
            return new WechatPackage(mateInfo);
        }
        return new CmpPackage(mateInfo);
    }
    /**
     * 删除目录
     * @param path 
     */
    static deleteFolder(folder: string) {
        var files = [];
        if (fs.existsSync(folder)) {
            files = fs.readdirSync(folder);
            files.forEach(function (file, index) {
                var curPath = `${folder}${path.sep}${file}`;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    IPackage.deleteFolder(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(folder);
        }
    }
}

class CmpPackage extends IPackage{
    public doPackage(): boolean {
        
        // ${m3Tools}/libs/fastjson.jar;${m3Tools}/libs/s3script.jar;${m3Tools}/libs/rhino_15.jar
        let classpathjar=`${this.mateInfo.m3Tools}${path.sep}libs${path.sep}fastjson-1.1.27.jar;${this.mateInfo.m3Tools}${path.sep}libs${path.sep}s3script.jar;${this.mateInfo.m3Tools}${path.sep}libs${path.sep}rhino_15.jar`;
        // ${m3Tools}/libs/RunI18n.jar
        let i18nclasspathjar=`${this.mateInfo.m3Tools}${path.sep}libs${path.sep}RunI18n.jar`;

        // ${seeyon}/m3files/v5/${bundleName}.zip
        let v5OutPath = `${this.mateInfo.v5Runtime}${path.sep}m3files${path.sep}v5${path.sep}${this.mateInfo.appId}.zip`;
        
        // ${appCurrentPath}/out/vreport.zip
        let tempDir = `${this.mateInfo.v5Runtime}${path.sep}m3files${path.sep}v5temp`;
        let outZip = `${tempDir}${path.sep}${this.mateInfo.bundleName}.zip`;
        let outUnzip = `${tempDir}${path.sep}${this.mateInfo.bundleName}`;
        
        // ${m3Tools}/jdk/bin/java.exe
        let javaExe = `${this.mateInfo.m3Tools}${path.sep}jdk${path.sep}bin${path.sep}java.exe`;
        
        let cmpCmd = `${javaExe} -Dfile.encoding=UTF-8  -classpath ${classpathjar} org.s3.script.web.S3ScriptPublishCmd -sourcepath ${this.mateInfo.appCurrentPath}  -outfile ${outZip}   -commondata ${this.mateInfo.appCurrentPath}${path.sep}s3scriptjspdata${path.sep}cmp_commondata.data  -testdatapath null  -noexportpaths 'appRes;WEB-INF;s3scriptjspdata;s3uuid.data'  -buildversion true`;
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
                IPackage.deleteFolder(tempDir);//删除临时目录
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

        // ${seeyon}/m3/apps/v5/${bundleName}
        let v5OutPath = `${this.mateInfo.v5Runtime}${path.sep}m3${path.sep}apps${path.sep}v5${path.sep}${this.mateInfo.bundleName}`;
        // ${appCurrentPath}/out/vreport.zip
        let outZip = `${this.mateInfo.v5Runtime}${path.sep}m3${path.sep}apps${path.sep}${this.mateInfo.bundleName}.zip`;
        
        // ${m3Tools}/jdk/bin/java.exe
        let javaExe = `${this.mateInfo.m3Tools}${path.sep}jdk${path.sep}bin${path.sep}java.exe`;
        
        let wechatCmd = `${javaExe} -Dfile.encoding=UTF-8  -classpath ${classpathjar} org.s3.script.web.S3ScriptPublishCmd -sourcepath ${this.mateInfo.appCurrentPath}  -outfile ${outZip}   -commondata ${this.mateInfo.appCurrentPath}${path.sep}s3scriptjspdata${path.sep}wechat_commondata.data  -testdatapath null  -noexportpaths 'appRes;WEB-INF;s3scriptjspdata;s3uuid.data'  -buildversion true`;
        let rs = child_process.execSync(wechatCmd);

        compressing.zip.uncompress(outZip,v5OutPath)
        .then(() =>{
            let propertistojs = `${javaExe} -Dfile.encoding=UTF-8 -classpath ${i18nclasspathjar} com.seeyon.m3script.plugin.i18n.RunI18n ${v5OutPath} "/i18n/" "1"`;
            child_process.execSync(propertistojs);
            fs.unlinkSync(outZip);
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
    bundleName: string|undefined;
}
/**
 * 导包类型枚举
 */
export enum PackageType {
    Cmp = 1,
    Wechat = 2
}