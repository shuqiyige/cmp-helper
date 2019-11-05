
import * as request from "request";
import Utils from "./Utils";
import ClassUtils from "./ClassUtils";
import { window } from "vscode";

let defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.90 Safari/537.36',
    "Accept-Language": "en,zh-CN;q=0.9,zh;q=0.8",
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
};

class PublishCmp{
    static doPublish(ip:string,passwd:string){
        function success(jsessionId){
            PublishCmp.reloadV5Apps({
                "address": ip,
                "jsessionId" : jsessionId,
            },function(msg){
                Utils.updateStatusBar("Hot load success,please reload M3", `热部署App完成,请重启M3`);
                window.showInformationMessage(`Hot load success，please reload M3`);
            });
        }
        //test
        PublishCmp.loginV5({
            "address": ip,
            "userName" : "system",
            "passwd" : passwd
        },success);

    } 
   private static reloadV5Apps(parms,success){
        Utils.updateStatusBar("Hot load [start publish M3 App]", "热部署【开始重新发布App】");

        // 热更新 ： http://127.0.0.1/seeyon/ajax.do?method=ajaxAction&managerName=m3AppNewManager&rnd=32080
        // managerMethod: reloadV5Apps arguments: [{"reset":0}]
        // {"resultCode":60000,"message":"成功热部署：0个应用包；更新的应用包名称： "}
        request.post({
            url:`${parms.address}/seeyon/ajax.do?method=ajaxAction&managerName=m3AppNewManager&rnd=${new Date().getTime()}`, 
            headers: {
                ...defaultHeaders,
                'RequestType': 'AJAX',
                'Referer': '${parms.address}/seeyon/cip/appManagerController.do?method=hotDeployment&_resourceCode=m3_hotDeployment',
                "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8",
                "Cookie": `JSESSIONID=${parms.jsessionId}; loginPageURL=; login_locale=zh_CN`
            },
            form: {
                "managerMethod": "reloadV5Apps",
                "arguments": '[{"reset":0}]'
            }
        }, function(err,httpResponse,body){
            if (err != null) {
                console.log(err);
                Utils.updateStatusBar("Hot load [Fail]", err);
                return;
            }
            if(httpResponse.statusCode !== 200){
                Utils.updateStatusBar("Hot load [Fail]", `响应状态码不等于200【${httpResponse.statusCode}】`);
                return;
            }
            //{"resultCode":60000,"message":"成功热部署：0个应用包；更新的应用包名称： "}
            console.log("body : "+ body)
            let res = JSON.parse(body);
            if(res.resultCode === 60000){
                success(res.message);
            }else{
                Utils.updateStatusBar("Hot load [Fail]", res.message);
                window.showErrorMessage("Hot load fail","please check you config",res.message);
            }
        });
    }

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
                ...defaultHeaders,
            },
            form: {
                "login.timezone": "GMT+8:00",
                "fontSize": 12,
                "screenWidth": 1920,
                "screenHeight": 1080,
                "login_username": parms.userName,
                "login_password": parms.passwd
            }
        }, function(err,httpResponse,body){
            if (err != null) {
                console.log(err);
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
                if(val.indexOf("JSESSIONID") > -1){
                    jsessionId =  val.replace(/.*JSESSIONID=([^;]*);.*/gi,"$1");
                }
            });
            Utils.updateStatusBar("Hot load [Login sucess]", `systen登录成功，JSESSIONID:${jsessionId}`);
            console.log("jsessionId : "+ jsessionId)
            success(jsessionId);
        });
    }


}
export default PublishCmp;