

var bleAv = avalon.define({
    $id: "homeCtl",
    data: [],
    buttonText: "开始扫描录入",
    isScan: 0,
    show: 0,
    length: 0,
    scan: function () {
        if (bleAv.isScan) {
            Dxsdk.sys.stopScan(function () {
                bleAv.isScan = 0;
                bleAv.show = 0;
                bleAv.length = 0;
                bleAv.buttonText = "重新扫描";
            });
        } else {
            bleAv.data = [];
            bleAv.isScan = 1;
            bleAv.show = 1;
            bleAv.buttonText = "停止扫描";
            scanBle();
        }
    }
});
avalon.scan();
function scanBle() {
    bleAv.isScan = 1;
    Dxsdk.sys.startScan([], function (device) {
        console.log(device);
        //发现一个设备则自动回调一次
        var deviceName = device.name;
        if (deviceName == undefined || !deviceName) {
            return;
        }
        if (deviceName.indexOf('BLU58') > -1 || deviceName.indexOf('QSprinter') > -1 || deviceName.indexOf('VMP') > -1) {
            console.log(1);
            Service.getPrinter(device.id, function (ret) {
                console.log(ret);
                if (ret.code && ret.code != 200) {
                    var data = {
                        "mac": device.id,
                        "vendor": deviceName,
                        "company": ''
                    };
                    Service.createPrinter(data, function () {
                        bleAv.length++;
                        device.rssi = 1;
                        bleAv.data.push(device);
                    })
                } else {
                    device.rssi = 0;
                    bleAv.data.push(device);
                }
            });
        }
    }, function () {
        bleAv.isScan = 0;
        bleAv.show = 0;
    });
}

