import * as path from "path";
import * as fs from "fs";
import * as request from "request";
import {OutputChannel, StatusBarAlignment, StatusBarItem, window, workspace, WorkspaceConfiguration} from "vscode";
import ClassUtils from "./ClassUtils";

let timeer = null;

class Utils {

    private static statusBar: StatusBarItem | undefined;
    private static logger: OutputChannel | undefined;

    /**
     * 初始化 状态栏实例
     * @param statusBarItem
     */
    static init() {
        let statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 1);
        //statusBarItem.command = '';//可以设置命令
        statusBarItem.show();
        Utils.statusBar = statusBarItem;
        Utils.statusBar.text = 'CmpHelper is Ready';
        Utils.updateStatusBar("Ready", " cmp helper is Ready");
        //日志
        Utils.logger = window.createOutputChannel('CmpHelper');
    }

    /**
     * 读取 manifest.json
     * @param appPath
     */
    static readManifest(appPath: string | undefined): any {
        if (ClassUtils.isUndefinedOrNull(appPath)) {
            return;
        }
        const manifest = path.join(appPath, "manifest.json");
        if (!fs.existsSync(manifest)) {
            return;
        }
        return JSON.parse(fs.readFileSync(manifest, {
            "encoding": "utf8",
            "flag": "r"//读模式
        }).replace(/\n/g, ''));
    }

    /**
     * 判断当前控件是否已经配置
     */
    static isConfig(): boolean {
        const myConfigs: WorkspaceConfiguration = workspace.getConfiguration("seeyon.cmp-helper");
        if (ClassUtils.isUndefinedOrNull(myConfigs)) {
            return false;
        }
        const packageApps = myConfigs.get("packageApps", []);
        if (packageApps.length === 0) {
            let msg = `seeyon.cmp-helper.packageApps is empty!`;
            Utils.updateStatusBar("config is empty", msg);
            return false;
        }
        const v5Runtime = myConfigs.get("v5Runtime", undefined);
        if (ClassUtils.isUndefinedOrNull(v5Runtime)) {
            let msg = `seeyon.cmp-helper.v5Runtime is empty!`;
            Utils.updateStatusBar("config is empty", msg);
            return false;
        }
        const m3Tools = myConfigs.get("m3Tools", undefined);
        if (ClassUtils.isUndefinedOrNull(m3Tools)) {
            let msg = `seeyon.cmp-helper.m3Tools is empty!`;
            Utils.updateStatusBar("config is empty", msg);
            return false;
        }
        return true;
    }

    /**
     * 更新状态栏
     * @param text 显示的文字
     * @param tooltip tips
     */
    static updateStatusBar(text: string = "error", tooltip: string = "unknown error") {
        if (ClassUtils.isUndefined(Utils.statusBar)) {
            return;
        }
        Utils.statusBar.text = 'CmpHelper: ' + text;
        Utils.statusBar.tooltip = 'CmpHelper: ' + tooltip;
        Utils.log(tooltip);
        try {
            if (timeer !== null) {
                clearTimeout(timeer);
            }
            timeer = setTimeout(() => {
                timeer = null;
                Utils.statusBar.text = 'CmpHelper: Ready';
                Utils.statusBar.tooltip = 'CmpHelper: cmp helper is Ready';
            }, 20000);
        } catch (e) {
        }
    }

    /**
     * 支持同步的文件的后缀
     */
    static allowSyncTypes: string[] = ["js", "css", "json", "svg", "ttf", "eot", "woff", "png", "jpg", "bmp", "jpeg", "map"];

    /**
     * @param fileName 判断文件是否支持同步
     */
    static isSupportSyncFile(fileName: string): boolean {
        let isSupportFile = false;
        for (let index = 0; index < Utils.allowSyncTypes.length; index++) {
            const element = Utils.allowSyncTypes[index];
            if (fileName.endsWith(element)) {
                isSupportFile = true;
            }
        }
        return isSupportFile;
    }

    /**
     * @param currentFileName 当前文件
     */
    static getAppRootPath(currentFileName: string | undefined): string | undefined {
        if (ClassUtils.isUndefinedOrNull(currentFileName)) {
            return;
        }
        const packageApps = workspace.getConfiguration("seeyon.cmp-helper").get("packageApps", []);
        // match all config paths
        for (let index = 0, length = packageApps.length; index < length; index++) {
            const packageApp = packageApps[index];
            const configPath: string = packageApp["path"];
            if (configPath === null) {
                continue;
            }
            //nice found
            if (currentFileName.toUpperCase().startsWith(configPath.toUpperCase())) {
                return configPath;
            }
        }
        return;
    }

    /**
     * 日志输出
     * @param args
     */
    static log(...args) {
        if (!ClassUtils.isUndefined(Utils.logger)) {
            args.forEach(function (str, index, arr) {
                try {
                    Utils.logger.appendLine(str);
                } catch (error) {
                }
            });
        }
        console.log(...args);
    }

    private static defaultHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.90 Safari/537.36',
        "Accept-Language": "en,zh-CN;q=0.9,zh;q=0.8",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    };
    static doPublish(ip:string,passwd:string){
        function success(jsessionId){
            Utils.reloadV5Apps({
                "address": ip,
                "jsessionId" : jsessionId,
            },function(msg){
                Utils.updateStatusBar("Hot load success,please reload M3", `热部署App完成,请重启M3`);
                window.showInformationMessage(`Hot load success，please reload M3`);
            });
        }
        //test
        Utils.loginV5({
            "address": ip,
            "userName" : "system",
            "passwd" : passwd
        },success);

    }

    /**
     * 重新热加载M3 App
     * @param parms { address:v5ip , jsessionId:sessionId }
     * @param success
     */
    private static reloadV5Apps(parms,success){
        Utils.updateStatusBar("Hot load [start publish M3 App]", "热部署【开始重新发布App】");

        // 热更新 ： http://127.0.0.1/seeyon/ajax.do?method=ajaxAction&managerName=m3AppNewManager&rnd=32080
        // managerMethod: reloadV5Apps arguments: [{"reset":0}]
        // {"resultCode":60000,"message":"成功热部署：0个应用包；更新的应用包名称： "}
        request.post({
            url:`${parms.address}/seeyon/ajax.do?method=ajaxAction&managerName=m3AppNewManager&rnd=${new Date().getTime()}`,
            headers: {
                ...Utils.defaultHeaders,
                'RequestType': 'AJAX',
                'Referer': `${parms.address}/seeyon/cip/appManagerController.do?method=hotDeployment&_resourceCode=m3_hotDeployment`,
                "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8",
                "Cookie": `JSESSIONID=${parms.jsessionId}; loginPageURL=; login_locale=zh_CN`
            },
            form: {
                "managerMethod": "reloadV5Apps",
                "arguments": '[{"reset":0}]'//JSON字符串
            }
        }, function(err,httpResponse,body){
            if (err !== null) {
                Utils.log(err);
                Utils.updateStatusBar("Hot load [Fail]", err);
                return;
            }
            if(httpResponse.statusCode !== 200){
                Utils.updateStatusBar("Hot load [Fail]", `响应状态码不等于200【${httpResponse.statusCode}】`);
                return;
            }
            //{"resultCode":60000,"message":"成功热部署：0个应用包；更新的应用包名称： "}
            Utils.log("body : "+ body);
            let res = JSON.parse(body);
            if(res.resultCode === 60000){
                success(res.message);
            }else{
                Utils.updateStatusBar("Hot load [Fail]", res.message);
                window.showErrorMessage("Hot load fail","please check you config",res.message);
            }
        });
    }

    /**
     * 登录V5
     * @param parms { address:V5的ip , userName:用户名 ,passwd:密码 }
     * @param success   成功回调，返回JSESSIONID
     * @param error 错误回调
     */
    static loginV5(parms,success,error=function(){}){
        // 登录 url
        // http://127.0.0.1/seeyon/main.do?method=login
        /**
         authorization:
         login.timezone: GMT+8:00
         province:
         city:
         rectangle:
         login_username: system
         trustdo_type:
         login_password: 1
         login_validatePwdStrength: 1
         random:
         fontSize: 12
         screenWidth: 1920
         screenHeight: 1080
         */
        Utils.updateStatusBar("Hot load [start login V5]", "开始登录V5");
        request.post({
            url:`${parms.address}/seeyon/main.do?method=login`,
            headers : {
                ...Utils.defaultHeaders,
                "Host": `${parms.address.replace("http://","").replace("https://","")}`,
                "Origin": `${parms.address}`,
                "Referer": `${parms.address}/seeyon/main.do`
            },
            form: {
                "login.timezone": "GMT+8:00",
                "authorization": "",
                "fontSize": 12,
                "screenWidth": 1920,
                "screenHeight": 1080,
                "login_username": parms.userName,
                "login_validatePwdStrength": 1,
                "loginName": parms.userName,
                "login_password": parms.passwd
            }
        }, function(err,httpResponse,body){
            if (err !== null) {
                Utils.log(err);
                Utils.updateStatusBar("Hot load [Fail]", err);
                error();
                return;
            }
            if(httpResponse.statusCode !== 302 /** 302 登录成功重定向 */
                || !ClassUtils.isUndefined(httpResponse.headers["LoginError"]) /** header：LoginError：1表示登录失败 */
                || httpResponse.headers["loginok"] !== "ok"  /** loginok:"ok" 表示登录成功 */ ){
                Utils.updateStatusBar("Hot load [Fail]", "systen登录失败,请设置正确的system账号密码");
                error();
                return;
            }

            let cookies:string[] = httpResponse.headers["set-cookie"];
            let jsessionId = "";
            //JSESSIONID=12DE33EE6F47E9C061F449A34AF3FE83;
            cookies.forEach(function(val,index,datas){
                if(val.indexOf("JSESSIONID") > -1){//正则获取JSESSIONID
                    jsessionId =  val.replace(/.*JSESSIONID=([^;]*);.*/gi,"$1");
                }
            });
            Utils.updateStatusBar("Hot load [Login sucess]", `systen登录成功，JSESSIONID:${jsessionId}`);
            Utils.log("jsessionId : "+ jsessionId);
            success(jsessionId);
        });
    }
}


export default Utils;