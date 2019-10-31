# cmp 打包插件

### 配置vscode

```json
"seeyon.cmp-helper":{
    "v5Runtime":"D:\\seeyon_v5_trunk_runtime\\ApacheJetspeed\\webapps\\seeyon",// v5运行目录
    "m3Tools":"D:\\my_apps_data\\m3_tool",//m3工具目录【包含打包需要的libs/xxx.jar和jdk】
    "buildversion":false,//是否生成编译版本号【默认true】
    "packageApps":[{
        "appName":"考勤",
        "path":"D:\\project_spaces\\seeyon_v5_trunk\\apps-attendance-h5"
    },{
        "appName":"任务",
        "path":"D:\\project_spaces\\seeyon_v5_trunk\\apps-taskmanage-h5",
    }],
    "autoSyncStatic":true//自动同步静态文件(微协同),支持文件类型["js","css","json","svg","ttf","eot","woff","png","jpg","bmp","jpeg"]
},
```

### 右键点击`CMP 打包`或者`Wechat 打包`

> 右键菜单

![右键截图](https://raw.githubusercontent.com/shuqiyige/cmp-helper/master/doc/pic1.png "右键截图")

> 打包成功提示

![右键截图](https://raw.githubusercontent.com/shuqiyige/cmp-helper/master/doc/pic2.png "右键截图")

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

