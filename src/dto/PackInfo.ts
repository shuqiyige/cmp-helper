/**
 * 打包信息的元数据，
 * 来自：插件配置和manifest.json
 */
export default class PackInfo {
    /**
     * manifest.json -> appId
     */
    public appId: string | undefined;
    /**
     * manifest.json -> appName
     */
    public appName: string | undefined;
    /**
     * manifest.json -> bundleName
     */
    public bundleName: string | undefined;
    /**
     * manifest.json -> team
     */
    public team: string | undefined;

    
    /**
     * 来自配置[seeyon.cmp-helper.buildversion]
     */
    public buildversion: boolean = true;
    /**
     * 来自配置[seeyon.cmp-helper.packageApps.path]
     */
    public appCurrentPath: string | undefined;
    /**
     * 来自配置[seeyon.cmp-helper.v5Runtime]
     */
    public v5Runtime: string | undefined;
    /**
     * 来自配置[seeyon.cmp-helper.m3Tools]
     */
    public m3Tools: string | undefined;
    /**
     * 来自配置[seeyon.cmp-helper.passwd]
     */
    public passwd: string | undefined = "123456";
    /**
     * 来自配置[seeyon.cmp-helper.address]
     */
    public address: string | undefined = "127.0.0.1";
    /**
     * 来自配置[seeyon.cmp-helper.autoPublish]
     */
    public autoPublish: boolean = true;
}