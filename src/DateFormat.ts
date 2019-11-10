class DateFormat{
    /**
     * 日期格式化：data.format("yyyy-MM-dd HH:mm:ss") q:季度(h也表示24小时制)
     * 
     * @param fmt 日期格式
     * @returns 返回格式化后的字符串
     */
    static format(data:Date,fmt:string) {
        var regexs = {
            "M+" : data.getMonth() + 1, // 月份
            "d+" : data.getDate(), // 日
            "H+" : data.getHours(), // 小时
            "m+" : data.getMinutes(), // 分
            "s+" : data.getSeconds(), // 秒
            "q+" : Math.floor((data.getMonth() + 3) / 3), // 季度
            "S" : data.getMilliseconds()
        // 毫秒
        };
        // 年
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (data.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        // 其他的格式化
        for ( var k in regexs) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (regexs[k]) : (("00" + regexs[k]).substr(("" + regexs[k]).length)));
            }
        }
        return fmt;
    };
    /**
     * 将日期字符串（yyyy-MM-dd）转换为Date对象，
     * 
     * @param source 字符串
     */
    static parseDate(source:string) {
        let sdate = source.split("-");
        return new Date(parseInt(sdate[0]), parseInt(sdate[1]) - 1, parseInt(sdate[2]));
    };
    /**
     * 将日期时间字符串（yyyy-MM-dd HH:mm:ss）转换为Date对象
     * 
     * @param source 字符串
     */
    static parseDateTime(source:string) {
        let sdatetime:string[] = source.split(" ");
        let sdate:string[] = sdatetime[0].split("-");
        let stime:string[] = sdatetime[1].split(":");
        return new Date(parseInt(sdate[0], parseInt(sdate[1]) - 1, parseInt(sdate[2]), parseInt(stime[0]), parseInt(stime[1]), parseInt(stime[2]) );
    };
}
export default DateFormat;