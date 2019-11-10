# cmp 打包插件

### 配置vscode

```json
"seeyon.cmp-helper":{
    "v5Runtime":"D:\\seeyon_v5_trunk_runtime\\ApacheJetspeed\\webapps\\seeyon",// v5运行目录
    "m3Tools":"D:\\my_apps_data\\m3_tool",//m3工具目录【包含打包需要的libs/xxx.jar和jdk】
    "buildversion":false,//是否生成编译版本号【默认true】
    "address":"http://127.0.0.1",//v5的ip地址，默认【http://127.0.0.1】
    "passwd":"123456",//system账号密码，默认【123456】
    "autoPublish": true,//是否自动发布cmp zip包，默认【true】
    "properties.unicode.upperCase":true,// properties 转Unicode是否自动转大写[默认true]
    "packageApps":[{
        "appName":"考勤",
        "path":"D:\\project_spaces\\seeyon_v5_trunk\\apps-attendance-h5"
    },{
        "appName":"任务",
        "path":"D:\\project_spaces\\seeyon_v5_trunk\\apps-taskmanage-h5",
    }],
    "autoSyncStatic":true//自动同步静态文件(微协同),支持文件类型["js","css","json","svg","ttf","eot","woff","png","jpg","bmp","jpeg","properties"]
},
```

### 打包预览

> 配置

![配置](https://raw.githubusercontent.com/shuqiyige/cmp-helper/master/doc/config.gif "配置截图")

> 微协同打包

![微协同打包](https://raw.githubusercontent.com/shuqiyige/cmp-helper/master/doc/wechatpack.gif "右键截图")

> CMP打包

![CMP打包](https://raw.githubusercontent.com/shuqiyige/cmp-helper/master/doc/cmppack.gif "右键截图")

> 文件自动同步

![文件自动同步](https://raw.githubusercontent.com/shuqiyige/cmp-helper/master/doc/autoSync.gif "文件自动同步")

> properties文件Unicode与中文相互转换

![properties文件Unicode与中文相互转换](https://raw.githubusercontent.com/shuqiyige/cmp-helper/master/doc/unicodeCvt.gif "properties文件Unicode与中文相互转换")

> properties文件转换为JS文件

![properties文件转换为JS文件](https://raw.githubusercontent.com/shuqiyige/cmp-helper/master/doc/propTojs.gif "properties文件转换为JS文件")


### m3Tools包含文件一览

```
m3_tool
├── jdk     //jdk
└── libs    //依赖的jar包
    ├── fastjson-1.1.27.jar
    ├── rhino_15.jar
    ├── RunI18n.jar
    └── s3script.jar
```


> 依赖插件

```json
{
    "compressing": "^1.4.0", // https://github.com/node-modules/compressing
    "request": "^2.88.0" // https://github.com/request/request
}
```