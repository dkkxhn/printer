var Service = {};
App.url = "http://api.duoxieyun.com/v1/";


//根据MAC地址获取打印机详情
Service.getPrinter = function (mac, callback) {
    App.http({
        api: "isp/printer/" + mac,
        method: "GET"
    }, function (ret) {
        callback && callback(ret);
    });
};

//创建一个打印机
Service.createPrinter = function (data,callback) {
    var str = JSON.stringify(data);
    App.http({
        method: "POST",
        params: str,
        api: "isp/printer/create",
    }, function (ret) {
        callback && callback(ret);
    });
};
