/**
 * jq打印机插件,http://www.jqsh.com,适配型号VMP02
 * 依赖插件https://github.com/don/BluetoothSerial
 * @version 1.0.0
 * @author wq@zlzkj.com
 */

var Printersdk = function() {
    var config = {
        timeout: {
            connect: 30
        },
        alert: function(msg) {
            App.alert(msg, function() {
                homeView.router.back();
            });
        }
    };

    var setConfig = function(cfg) {
        for (var i in config) {
            if (cfg[i]) {
                config[i] = cfg[i];
            }
        }
    }

    function dataToBytes(arr) {
        var buffer = new ArrayBuffer(arr.length);
        var data = new Uint8Array(buffer);
        for (var i in arr) {
            data[i] = parseInt(arr[i], 16);
        };
        return data.buffer;
    }

    function bytesToArray(buffer) {
        var data = new Uint8Array(buffer);
        var hexArr = [];
        for (var i in data) {
            var hex = data[i].toString(16);
            hex = "00".substr(0, 2 - hex.length) + hex; 
            hexArr.push(hex.toUpperCase());
        };
        return hexArr;
    }

    //字符串转16进制Unicode数组，双字节编码
    function stringToUnicode(string) {
        string = string.toString(); //数字转字符
        var hexArr = [];
        for (var i in string) {
            var asciiDec = string.charCodeAt(i);
            var hex = asciiDec.toString(16).toUpperCase();
            if (asciiDec <= 255) {
                hexArr.push(hex);
                hexArr.push('00');
            } else {
                hexArr.push(hex.substr(2, 2));
                hexArr.push(hex.substr(0, 2));
            }
        };
        return hexArr;
    }

    function convertToHex(str) {
        var hex = [];
        for(var i=0;i<str.length;i++) {
           hex.push(str.charCodeAt(i).toString(16));
        }
        return hex;
    }

    var sys = {};

    sys.listPaired = function(onSuccess) {
        if (window.bluetoothSerial) {
            window.bluetoothSerial.isEnabled(function() {
                window.bluetoothSerial.list(onSuccess); //传回设备列表
            },function() {
                config.alert("请打开蓝牙");
            });
        } else {
            config.alert("系统异常，未找到bluetoothSerial插件");
        }
    }
    
    sys.discoverUnpaired = function(onSuccess) {
        if (window.bluetoothSerial) {
            window.bluetoothSerial.isEnabled(function() {
                window.bluetoothSerial.discoverUnpaired(onSuccess); //传回设备列表
            },function() {
                config.alert("请打开蓝牙");
            });
        } else {
            config.alert("系统异常，未找到bluetoothSerial插件");
        }
    }

    sys.connect = function(deviceId, onSuccess, onError) {
        var isConnected = false;
        var t = setTimeout(function(){
            if (isConnected) {
                sys.disconnect(); //确保断开
            }
            onError && onError("连接超时，" + config.timeout.connect + "秒内未连接成功");
        },1000*config.timeout.connect);

        window.bluetoothSerial.connect(deviceId, function(peripheral) {
            isConnected = true;
            clearTimeout(t);
            onSuccess && onSuccess(peripheral);
        }, function(errorMsg) {
            isConnected = false;
            clearTimeout(t);
            onError && onError(errorMsg);
        });
    }

    sys.disconnect = function(onSuccess, onError) {
        window.bluetoothSerial.disconnect(onSuccess, onError);
    }

    sys.isConnected = function(onSuccess, onFail) {
        window.bluetoothSerial.isConnected(onSuccess, onFail);
    }

    sys.write = function(data, onSuccess, onError) {
        var byteLength = dataToBytes(data).byteLength;
        if (byteLength <= 40) {
            window.bluetoothSerial.write(dataToBytes(data), onSuccess, onError);
        } else {
            for (var i=0;i<byteLength;i=i+40) {
                window.bluetoothSerial.write(dataToBytes(data).slice(i, i+40), onSuccess, onError);
            }
        }

    }

    var api = {};

    // var data = [
    //     {time: '01-19 9:00:00', temp: 15.1},
    //     {time: '01-19 9:00:15', temp: 16.2}
    // ];
    api.printTable = function(header, billNumber, data, footer, bleName, onSuccess, onError) {
        if (data.length == 0) {
            onError && onError('表格数据不能空');
            return false;
        }

        var defaultSpaceCount = 1;
        // 每个数据字段之间空格
        var fieldSpaceCounts = [];
        
        var unicodeData = [];
        // IOS打印测试，打印内容超过一定长度无法打印，待解决
        // if (F7.device.ios) {
        //     unicodeData = unicodeData.concat(stringToGBK.encode('登录网址：http://bill.duoxieyun.com'));
        //     // 以下长度无法打印
        //     // unicodeData = unicodeData.concat(stringToGBK.encode('多协云冷链全程温度监控多协云冷链全程温度监控多协云冷链全程温度监控多协云冷链全程温度监控多协云冷链全程温度监控多协云冷链全程温度监控多协云冷链全程温度监控多协云冷链全程温度监控多协云冷链全程温度监控'));
        //     var command = ["00","0D","0A","0D","0A","0D","0A"];
        //     sys.write(unicodeData.concat(command), onSuccess, onError);
        //     return;
        // }
        unicodeData = unicodeData.concat(["1B","61","01"]);
        unicodeData = unicodeData.concat(["1D","21","01"]);
        unicodeData = unicodeData.concat(stringToGBK.encode('多协云冷链全程温度监控'));
        unicodeData = unicodeData.concat(["0D","0A","1D","21","00"]);
        if (billNumber != '') {
            if (bleName == 'VMP02-00000000') {
                unicodeData = unicodeData.concat(["1D", "68", "48", "1D", "77", "02", "1D", "48", "00", "1D", "66", "00", "1D", "6B", "04", "2A"]);
            } else {
                unicodeData = unicodeData.concat(["1D", "68", "48", "1D", "77", "02", "1D", "48", "00", "1D", "66", "00", "1D", "6B", "04"]);
            }
            unicodeData = unicodeData.concat(convertToHex(billNumber.substr(-12)));
            if (bleName == 'VMP02-00000000') {
                unicodeData = unicodeData.concat(["2A", "00", "1B", "61", "00"]);
            } else {
                unicodeData = unicodeData.concat(["00", "1B", "61", "00"]);
            }
            unicodeData = unicodeData.concat(stringToGBK.encode('单据编号：'));
            unicodeData = unicodeData.concat(convertToHex(billNumber.substr(-12)));
            unicodeData = unicodeData.concat(["0D", "0A"]);
        }
        unicodeData = unicodeData.concat(["00", "1B", "61", "00"]);
        // 头部信息
        for (var key in header) {
            unicodeData = unicodeData.concat(stringToGBK.encode(header[key]));
            unicodeData = unicodeData.concat(["0D","0A"]); // 换行
        }

        unicodeData = unicodeData.concat(stringToGBK.encode('过程温度：'));
        unicodeData = unicodeData.concat(["0D","0A"]);
        //处理表格数据
        for (var i in data) {
            for (var key in data[i]) {
                unicodeData = unicodeData.concat(stringToGBK.encode(data[i][key]));
                if (key == "temp") {
                    unicodeData = unicodeData.concat(stringToGBK.encode('℃'));
                }
                else {
                    unicodeData = unicodeData.concat(['20', '00']); //字段之间加N个空格
                }
            }
            unicodeData = unicodeData.concat(["0D","0A"]);
        }
        unicodeData = unicodeData.concat(["0D","0A"]);
        // 底部信息
        for (var key in footer) {
            unicodeData = unicodeData.concat(stringToGBK.encode(footer[key]));
            unicodeData = unicodeData.concat(["0D","0A","0D","0A"]);
        }

        if (billNumber != '') {
            unicodeData = unicodeData.concat(stringToGBK.encode('登录网址：http://bill.duoxieyun.com'));
            unicodeData = unicodeData.concat(stringToGBK.encode('于查询界面输入查询编号即可'));
        }
        var command = ["00","0D","0A","0D","0A","0D","0A"];
        sys.write(unicodeData.concat(command), onSuccess, onError);
    }

    return {
        setConfig: setConfig,
        config: config,
        sys: sys,
        api: api
    }
}();