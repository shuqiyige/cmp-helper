import ClassUtils from "./ClassUtils";

/**
 * 日志接口
 */
export interface Logger{
    /**
     * 显示错误提示
     * @param args 
     */
    showError(content:string);
     /**
     * 显示提示
     * @param args 
     */
    showAlert(content:string);
    /**
     * 更新状态
     * @param msg 
     * @param detail 
     */
    updateStatus(msg:string,detail:string|undefined)
    /**
     * 记录日志
     * @param args 
     */
    log(...args);
}
/**
 * 日志工程类
 */
class LogFactory{
    private static  logger:Logger|undefined;
    /**
     * 显示错误提示
     * @param args 
     */
    static showError(content:string){
        if(ClassUtils.isUndefinedOrNull(LogFactory.logger)){
            return;
        }
        LogFactory.logger.showError(content);
    }
     /**
     * 显示提示
     * @param args 
     */
    static showAlert(content:string){
        if(ClassUtils.isUndefinedOrNull(LogFactory.logger)){
            return;
        }
        LogFactory.logger.showAlert(content);
    }
    /**
     * 更新状态
     * @param msg 
     * @param detail 
     */
    static updateStatus(msg:string,detail:string = ""){
        if(ClassUtils.isUndefinedOrNull(LogFactory.logger)){
            return;
        }
        LogFactory.logger.updateStatus(msg,detail);
    }
    /**
     * 记录日志
     * @param args 
     */
    static log(...args){
        if(ClassUtils.isUndefinedOrNull(LogFactory.logger)){
            return;
        }
        LogFactory.logger.log(...args);
    }
    static initLog(logger:Logger){
        LogFactory.logger = logger;
    }
}
export default LogFactory;
