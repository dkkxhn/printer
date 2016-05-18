/**
 * 多协云蓝牙温度记录仪JS-SDK
 * 依赖ble插件https://github.com/don/cordova-plugin-ble-central
 * @version 1.0.0
 * @author wq@zlzkj.com
 */
var Dxsdk = function () {
    //创建proto
    var ProtoBuf = dcodeIO.ProtoBuf;
    var DevCmd = ProtoBuf.loadProtoFile("lib/duoxieyun-ble.proto").build("DevCmd");
    var DevResponse = ProtoBuf.loadProtoFile("lib/duoxieyun-ble.proto").build("DevResponse");
    var DevCfg = ProtoBuf.loadProtoFile("lib/duoxieyun-ble.proto").build("DevCfg");
    var DevCfgFixed = ProtoBuf.loadProtoFile("lib/duoxieyun-ble.proto").build("DevCfgFixed");
    var DevStatus = ProtoBuf.loadProtoFile("lib/duoxieyun-ble.proto").build("DevStatus");
    var DevDataPack = ProtoBuf.loadProtoFile("lib/duoxieyun-ble.proto").build("DevDataPack");
    var SendDataRequest = ProtoBuf.loadProtoFile("lib/duoxieyun-ble.proto").build("SendDataRequest");
    var RecvDataPush = ProtoBuf.loadProtoFile("lib/duoxieyun-ble.proto").build("RecvDataPush");
    var BasePush = ProtoBuf.loadProtoFile("lib/duoxieyun-ble.proto").build("BasePush");
    var BaseRequest = ProtoBuf.loadProtoFile("lib/duoxieyun-ble.proto").build("BaseRequest");

    var config = {
        timeout: {
            connect: 60
        },
        alert: function (msg) {
            // 游客登录模式
            //console.log($$('.J_bleLogOut').length);
            if ($$('.J_bleLogOut').length) {
                App.alert(msg, function () {
                    loginView.router.back();
                });
            } else {
                App.alert(msg, function () {
                    homeView.router.back();
                });
            }
        }
    };

    var setConfig = function (cfg) {
        for (var i in config) {
            if (cfg[i]) {
                config[i] = cfg[i];
            }
        }
    }

    function getCharacteristicByFlag(characteristics, flag) {
        // 读写通道映射
        var flagMap = {
            "write": '0000ff13-bbaa-0099-8877-665544332211',
            "notify": '0000ff14-bbaa-0099-8877-665544332211'
        };
        for (var i in characteristics) {
            if (characteristics[i].characteristic == flagMap[flag] || characteristics[i].characteristic == flagMap[flag].toUpperCase()) {
                return characteristics[i];
            }
        }
        ;
        return "该蓝牙模块不是多协云模块，无法读写";
    }

    function getCharacteristicByFlagIos(characteristics) {
        // 读写通道映射

        var writeList =  [
            "49535343-8841-43F4-A8D4-ECBE34729BB3",
            "BEF8D6C9-9C21-4C9E-B632-BD58C1009F9F"
        ];

        for (var i in characteristics) {
            for (var j in writeList) {
                if (characteristics[i].characteristic == writeList[j] || characteristics[i].characteristic == writeList[j]) {
                    return characteristics[i];
                }
            }
        }
        return "读写通道映射失败";
    }

    function commandToBytes(command) {
        var arr = command.split(" ");
        var buffer = new ArrayBuffer(arr.length);
        var data = new Uint8Array(buffer);
        for (var i in arr) {
            data[i] = parseInt(arr[i], 16);
        }
        ;
        return data.buffer;
    }

    function arrayToBytes(arr) {
        var buffer = new ArrayBuffer(arr.length);
        var data = new Uint8Array(buffer);
        for (var i in arr) {
            data[i] = parseInt(arr[i], 16);
        }
        ;
        return data.buffer;
    }

    function bytesToArray(buffer) {
        var data = new Uint8Array(buffer);
        var hexArr = [];
        for (var i in data) {
            var hex = data[i].toString(16);
            hex = "00".substr(0, 2 - hex.length) + hex;
            hexArr.push(hex.toUpperCase());
        }
        ;
        return hexArr;
    }

    function arrToHex(arr) {
        var hexArr = [];
        for (var i in arr) {
            var hex = arr[i].toString(16);
            hex = "00".substr(0, 2 - hex.length) + hex;
            hexArr.push(hex.toUpperCase());
        }
        ;
        return hexArr;
    }

    //数组转arraybuffer
    function toArrayBuffer(buffer) {
        var ab = new ArrayBuffer(buffer.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }
        return ab;
    }

    //ArrayBufferToString
    function uintToString(uintArray) {
        function pad(n) {
            return n.length < 2 ? "0" + n : n;
        }

        var array = new Uint8Array(uintArray);
        var str = "";
        for (var i = 0, len = array.length; i < len; ++i) {
            str += ("%" + pad(array[i].toString(16)))
        }
        str = decodeURIComponent(str);
        return str;
    }

    //字符转数组
    function stringToUtf8ByteArray(str) {
        str = str.replace(/\r\n/g, '\n');
        var out = [],
            p = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            if (c < 128) {
                out[p++] = c;
            } else if (c < 2048) {
                out[p++] = (c >> 6) | 192;
                out[p++] = (c & 63) | 128;
            } else {
                out[p++] = (c >> 12) | 224;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
        }
        return out;
    };

    //解析温度
    function analysisTemp(oldArray) {
        var newArray = new Array(oldArray.length / 2);
        for (var i = 0; i < newArray.length; i++) {
            if ((oldArray[i * 2] & 0x80) == 0x80) {
                newArray[i] = ((~((oldArray[i * 2] << 8 & 0xFF00) | oldArray[i * 2 + 1])) & 0xFFFF) + 1;
                newArray[i] = -newArray[i];
            } else {
                newArray[i] = (oldArray[i * 2] << 8 & 0xFF00) | oldArray[i * 2 + 1];
            }
            newArray[i] /= 10;
        }
        return newArray;
    }

    //设置包头
    function setHeader(data) {
        var buffer = new ArrayBuffer(8 + data.byteLength);
        var x = new DataView(buffer, 0);
        x.setInt8(0, 254);
        x.setInt8(1, 1);
        x.setInt16(2, data.byteLength + 8);
        x.setInt16(4, 30001);
        x.setInt16(6, 0);
        var array = new Uint8Array(data);
        for (var i = 0; i < data.byteLength; i++) {
            x.setInt8(8 + i, array[i]);
        }
        // console.log(new Uint8Array(buffer));
        return buffer;
    }

    var sys = {};

    sys.startScan = function (services, onSuccess, onError) {
        if (window.ble) {
            window.ble.isEnabled(function () {
                window.ble.startScan(services, onSuccess, onError);
            }, function () {
                config.alert("请打开蓝牙");
            });
        } else {
            config.alert("系统异常，未找到ble插件");
        }
    }

    sys.stopScan = function (onSuccess, onError) {
        window.ble.stopScan(onSuccess, onError);
    }

    sys.connect = function (deviceId, onSuccess, onError, onDisconnected) {
        var isConnected = false;
        var t = setTimeout(function () {
            if (isConnected) {
                sys.disconnect(deviceId); //确保断开
            }
            onError && onError("连接超时，" + config.timeout.connect + "秒内未连接成功");
        }, 1000 * config.timeout.connect);

        window.ble.connect(deviceId, function (peripheral) {
            isConnected = true;
            clearTimeout(t);
            onSuccess && onSuccess(peripheral);
        }, function (errorMsg) {
            isConnected = false;
            clearTimeout(t);
            // 用Disconnected判断是连接失败还是连接成功后再断开
            if (errorMsg == 'Disconnected') {
                onDisconnected && onDisconnected();
            } else {
                onError && onError(errorMsg);
            }
        });
        // success中返回peripheral对象，类似下列结构
        // {
        //     "characteristics": [{
        //         "descriptors": [{
        //             "uuid": "2902"
        //         }, {
        //             "uuid": "2901"
        //         }],
        //         "characteristic": "ffe1",
        //         "service": "ffe0",
        //         "properties": ["Read", "WriteWithoutResponse", "Notify"]
        //     }],
        //     "advertising": {},
        //     "id": "20:C3:8F:FD:6D:76",
        //     "services": ["ffe0"],
        //     "rssi": -46,
        //     "name": "LANYA"
        // }
    }

    sys.disconnect = function (deviceId, onSuccess, onError) {
        window.ble.disconnect(deviceId, onSuccess, onError);
    }

    sys.isConnected = function (deviceId, onSuccess, onFail) {
        window.ble.isConnected(deviceId, onSuccess, onFail);
    }

    sys.write = function (peripheral, data, type, onSuccess, onError) {
        //alert(peripheral);
        //alert(JSON.stringify(peripheral));

        if (F7.device.ios && type == "print") {
            var res = getCharacteristicByFlagIos(peripheral.characteristics);

            //alert(JSON.stringify(res));
            if (typeof res == "object") {

                var arr = dataToBytes(data);
                //alert(arr);
                var byteLength = arr.byteLength;
                if (byteLength <= 40) {
                    window.ble.write(peripheral.id, res.service, res.characteristic, arr, onSuccess, onError);
                    sys.disconnect(peripheral.id,  onSuccess, onError);
                } else {
                    for (var i = 0; i < byteLength; i = i + 40) {
                        window.ble.write(peripheral.id, res.service, res.characteristic, arr.slice(i, i + 40), onSuccess, onError);
                        if (i > byteLength - 40) {
                            sys.disconnect(peripheral.id, onSuccess, onError);
                        }
                    }
                }

                //window.ble.write(peripheral.id, res.service, res.characteristic, arr, onSuccess, onError);

            } else {
                onError && onError(res);
            }
        } else {
            var res = getCharacteristicByFlag(peripheral.characteristics, 'write');
            if (typeof res == "object") {
                var arr = bytesToArray(data);
                var chunks = []; //BLE每组最多传输20字符
                for (var i = 0, len = arr.length; i < len; i += 20) {
                    chunks.push(arr.slice(i, i + 20));
                }

                function _sendChunkData(data, i, length) {
                    if (i < length - 1) {
                        window.ble.write(peripheral.id, res.service, res.characteristic, arrayToBytes(data[i]), function () {
                            _sendChunkData(data, ++i, length);
                        }, onError);
                    } else {
                        window.ble.write(peripheral.id, res.service, res.characteristic, arrayToBytes(data[i]), onSuccess, onError);
                    }
                }

                _sendChunkData(chunks, 0, chunks.length);

            } else {
                onError && onError(res);
            }
        }

    }

    sys.startNotify = function (peripheral, onSuccess, onError) {
        var res = getCharacteristicByFlag(peripheral.characteristics, 'notify');
        if (typeof res == "object") {
            window.ble.startNotification(peripheral.id, res.service, res.characteristic, function (buffer) {
                onSuccess(bytesToArray(buffer));
            }, onError);
        } else {
            onError && onError(res);
        }
    }

    sys.stopNotify = function (peripheral, onSuccess, onError) {
        var res = getCharacteristicByFlag(peripheral.characteristics, 'notify');
        if (typeof res == "object") {
            window.ble.stopNotification(peripheral.id, res.service, res.characteristic, onSuccess, onError);
        } else {
            onError && onError(res);
        }
    }

    var queue = {};
    queue.tasks = [];


    var api = {};

    //api底层方法，未做数据解析
    api.execute = function (peripheral, command, isNeedResponse, onSuccess, onError, onProgress) {
        onProgress && onProgress([1, 100]); //模拟一点进度

        //先打开监听通道，再写数据
        if (isNeedResponse) {

            var totalData = [];
            var totalLength = 0;

            sys.startNotify(peripheral, function (data) {
                // console.log("notify");
                // console.log(data);

                //关闭loading提示，可以在onProgress里启用进度条提示
                // 蓝牙数据传输每组20条记录，多于20条会自动拆分成多个Notify发送
                // 累加每次Notify发送过来的数据
                // Array.prototype.push.apply(totalData, data);
                totalData = totalData.concat(data);
                if (totalData.length < 8) { //返回数据至少有8位
                    onError && onError("模块返回的数据长度有误，当前返回值为" + totalData.join(" "));
                } else {
                    // 计算本次报文总长度，按照多协文档第2位是长度位，长度为不含前面4位，所以加4
                    totalLength = parseInt(totalData[2], 16) * 16 + parseInt(totalData[3], 16);
                    // console.log(totalLength);
                    onProgress && onProgress([totalData.length, totalLength]);
                    if (totalLength == totalData.length || totalData.length == Math.ceil(totalLength / 20) * 20) {
                        // console.log(totalData);
                        // console.log('================');
                        totalData = totalData.slice(0, totalLength);
                        totalData = totalData.slice(8); //去掉前8位
                        onSuccess && onSuccess(arrayToBytes(totalData)); //当前方案是数据全部读完再回调
                        //sys.stopNotify(peripheral);
                    }
                }
            }, function (errorMsg) {
                onError && onError("数据接收失败:" + errorMsg);
            });
        }

        sys.write(peripheral, command, "", function () {
            if (!isNeedResponse) { //无需返回直接回调
                onSuccess && onSuccess();
            }
        }, function (errorMsg) {
            onError && onError("指令\"" + command + "\"发送失败:" + errorMsg);
        });
    }

    //11 获取记录仪固件信息
    api.cfgFixed = function (peripheral, onSuccess, onError, onProgress) {

        var devCmd = new DevCmd();
        devCmd.Cmd = 11;
        var cmdBuffer = devCmd.toArrayBuffer();
        // console.log(new Uint8Array(cmdBuffer));

        var recvDataPush = new RecvDataPush();
        var basePush = new BasePush();
        recvDataPush.Data = cmdBuffer;
        recvDataPush.BasePush = basePush;
        var data = recvDataPush.toArrayBuffer();

        var buffer = setHeader(data); //最终传给设备的包
        // console.log(new Uint8Array(buffer));

        api.execute(peripheral, buffer, true, function (data) {
            // console.log(new Uint8Array(data));
            var msgDec = SendDataRequest.decode(data);
            // console.log(msgDec);
            var offset = msgDec.Data.offset;
            var limit = msgDec.Data.limit;
            var obj = DevCfgFixed.decode(msgDec.Data.buffer.slice(offset, limit));
            //console.log('cfgFixed');
            //console.log(obj);


            var json = {
                id: uintToString(obj.DeviceId.buffer.slice(obj.DeviceId.offset, obj.DeviceId.limit)),
                ver: obj.SoftwareVersion,
                ssid: (obj.SSID != null ? uintToString(obj.SSID.buffer.slice(obj.SSID.offset, obj.SSID.limit)) : ''),
                mac: uintToString(obj.MAC.buffer.slice(obj.MAC.offset, obj.MAC.limit))
            };
            //console.log(json);
            onSuccess && onSuccess(json);
        }, onError, onProgress);

    };

    //5 获取记录仪配置信息
    api.cfg = function (peripheral, onSuccess, onError, onProgress) {

        var devCmd = new DevCmd();
        devCmd.Cmd = 5;
        var cmdBuffer = devCmd.toArrayBuffer();
        // console.log(new Uint8Array(cmdBuffer));

        var recvDataPush = new RecvDataPush();
        var basePush = new BasePush();
        recvDataPush.Data = cmdBuffer;
        recvDataPush.BasePush = basePush;
        var data = recvDataPush.toArrayBuffer();

        var buffer = setHeader(data); //最终传给设备的包
        //console.log('cfg 指令');
        //console.log(new Uint8Array(buffer));

        api.execute(peripheral, buffer, true, function (data) {
            // console.log(new Uint8Array(data));
            var msgDec = SendDataRequest.decode(data);
            // console.log(msgDec);
            var offset = msgDec.Data.offset;
            var limit = msgDec.Data.limit;
            var obj = DevCfg.decode(msgDec.Data.buffer.slice(offset, limit));
            // console.log('cfg obj');
            // console.log(obj);

            var json = {
                content: uintToString(obj.Content.buffer.slice(obj.Content.offset, obj.Content.limit)), //发货信息,接受16个中文(UTF-8,一个汉字占3个字节),`张三-李四`
                logInterval: obj.LogInterval, //记录间隔，单位秒
                highThreshold: obj.HighThreshold, //温度上限，单位摄氏度
                highToleranceTime: obj.HighToleranceTime, //上限容忍时间,单位分钟
                lowThreshold: obj.LowThreshold, //温度下限，单位摄氏度
                lowToleranceTime: obj.LowToleranceTime //下限容忍时间,单位分钟
            };
            //console.log(json);
            onSuccess && onSuccess(json);
        }, onError, onProgress);

    };
    //3 参数设置
    api.setCfg = function (peripheral, params, onSuccess, onError, onProgress) {
        //console.log(params);
        function _serialize(content, logInterval, highThreshold, highToleranceTime, lowThreshold, lowToleranceTime) {
            var devCmd = new DevCmd();
            devCmd.Cmd = 3;
            var devCfg = new DevCfg();
            var utf8_buffer = stringToUtf8ByteArray(content);
            var arraybuffer = toArrayBuffer(utf8_buffer);
            devCfg.Content = arraybuffer;
            devCfg.LogInterval = logInterval;
            devCfg.HighThreshold = highThreshold;
            devCfg.HighToleranceTime = highToleranceTime;
            devCfg.LowThreshold = lowThreshold;
            devCfg.LowToleranceTime = lowToleranceTime;
            devCmd.DevCfg = devCfg;
            var buffer = devCmd.toArrayBuffer();
            var msgDec = DevCmd.decode(buffer);
            var offset = msgDec.DevCfg.Content.offset;
            var limit = msgDec.DevCfg.Content.limit;
            return buffer;
        }

        var content = params.content;
        var logInterval = params.logInterval;
        var highThreshold = params.highThreshold;
        var highToleranceTime = params.highToleranceTime;
        var lowThreshold = params.lowThreshold;
        var lowToleranceTime = params.lowToleranceTime;

        var recvDataPush = new RecvDataPush();
        var basePush = new BasePush();
        recvDataPush.Data = _serialize(content, logInterval, highThreshold, highToleranceTime, lowThreshold, lowToleranceTime);
        recvDataPush.BasePush = basePush;
        var data = recvDataPush.toArrayBuffer();
        var buffer = setHeader(data);
        //console.log(arrToHex(new Uint8Array(buffer)));

        api.execute(peripheral, buffer, true, function (data) {
            // console.log('received');
            // console.log(new Uint8Array(data));
            var msgDec = SendDataRequest.decode(data);
            var offset = msgDec.Data.offset;
            var limit = msgDec.Data.limit;
            var obj = DevResponse.decode(msgDec.Data.buffer.slice(offset, limit));
            //console.log(obj);
            if (obj.ErrCode == 200) {
                onSuccess && onSuccess(true);
            } else {
                onError('参数设置异常，errCode:' + obj.ErrCode);
            }
        }, onError, onProgress);
    };

    //06 更新记录仪中时间
    api.syncTime = function (peripheral, onSuccess, onError, onProgress) {

        // 获取手机时间
        var time = Math.floor(new Date().getTime() / 1000);

        var devCmd = new DevCmd();
        devCmd.Cmd = 6;
        devCmd.ParamUint32 = time;
        var cmdBuffer = devCmd.toArrayBuffer();
        // console.log(new Uint8Array(cmdBuffer));

        var recvDataPush = new RecvDataPush();
        var basePush = new BasePush();
        recvDataPush.Data = cmdBuffer;
        recvDataPush.BasePush = basePush;
        var data = recvDataPush.toArrayBuffer();

        var buffer = setHeader(data);
        // console.log(arrToHex(new Uint8Array(buffer)));

        api.execute(peripheral, buffer, true, function (data) {
            // console.log('received');
            // console.log(new Uint8Array(data));
            var msgDec = SendDataRequest.decode(data);
            var offset = msgDec.Data.offset;
            var limit = msgDec.Data.limit;
            var obj = DevResponse.decode(msgDec.Data.buffer.slice(offset, limit));
            // console.log('time');
            // console.log(obj);
            if (obj.ErrCode == 200) {
                var json = {
                    time: time
                };
                // console.log(json);
                onSuccess && onSuccess(json);
            } else {
                onError('时间同步失败，errCode:' + obj.ErrCode);
            }
        }, onError, onProgress);
    };

    //09 读取当前温度信息
    api.currentData = function (peripheral, onSuccess, onError, onProgress) {
        var devCmd = new DevCmd();
        devCmd.Cmd = 9;
        var cmdBuffer = devCmd.toArrayBuffer();
        // console.log(new Uint8Array(cmdBuffer));

        var recvDataPush = new RecvDataPush();
        var basePush = new BasePush();
        recvDataPush.Data = cmdBuffer;
        recvDataPush.BasePush = basePush;
        var data = recvDataPush.toArrayBuffer();

        var buffer = setHeader(data); //最终传给设备的包
        // console.log(new Uint8Array(buffer));

        api.execute(peripheral, buffer, true, function (data) {
            // console.log(new Uint8Array(data));
            var msgDec = SendDataRequest.decode(data);
            // console.log(msgDec);
            var offset = msgDec.Data.offset;
            var limit = msgDec.Data.limit;
            var obj = DevStatus.decode(msgDec.Data.buffer.slice(offset, limit));
            // console.log('currentData');
            // console.log(obj);
            var json = {
                isRecording: obj.IsLogging,
                voltage: obj.Voltage,
                temp: obj.Temperature / 10,
                time: obj.CurrentTime,
                logTime: obj.StartLogTime,
                num: obj.LoggedCnt
            };
            // console.log(obj);
            // console.log(json);
            onSuccess && onSuccess(json);
        }, onError, onProgress);

    }

    //10 读取历史数据
    api.historyData = function (peripheral, onSuccess, onError, onProgress) {

        function buildCommandBuffer() {
            var devCmd = new DevCmd();
            devCmd.Cmd = 10;
            var cmdBuffer = devCmd.toArrayBuffer();
            // console.log(new Uint8Array(cmdBuffer));

            var recvDataPush = new RecvDataPush();
            var basePush = new BasePush();
            recvDataPush.Data = cmdBuffer;
            recvDataPush.BasePush = basePush;
            var data = recvDataPush.toArrayBuffer();

            var buffer = setHeader(data); //最终传给设备的包
            return buffer;
        }

        function decodeHistoryData(data) {
            // console.log(new Uint8Array(data));
            var msgDec = SendDataRequest.decode(data);
            // console.log(msgDec);
            var offset = msgDec.Data.offset;
            var limit = msgDec.Data.limit;
            var devData = DevDataPack.decode(msgDec.Data.buffer.slice(offset, limit));

            var offset2 = devData.DevData.offset;
            var limit2 = devData.DevData.limit;
            var array = new Uint8Array(devData.DevData.buffer.slice(offset2, limit2));
            var newArray = analysisTemp(array);
            var json = {
                num: devData.SerialNum,
                data: newArray
            }
            // console.log('decodeHistoryData');
            // console.log(json);
            return json;
        }


        function exec() {

            // onProgress && onProgress([1, 100]); //模拟一点进度

            var totalDataList = [];
            //先打开监听通道
            var currentTotalData = [];
            var currentTotalLength = 0;

            sys.startNotify(peripheral, function (data) {
                // console.log("notify");
                // console.log(data);

                // 蓝牙数据传输每组20条记录，多于20条会自动拆分成多个Notify发送
                // 累加每次Notify发送过来的数据
                currentTotalData = currentTotalData.concat(data);
                if (currentTotalData.length < 8) { //返回数据至少有8位
                    onError && onError("模块返回的数据长度有误，当前返回值为" + currentTotalData.join(" "));
                } else {
                    // 计算本次报文总长度，按照多协文档第2位是长度位，长度为不含前面4位，所以加4
                    currentTotalLength = parseInt(currentTotalData[2], 16) * 16 + parseInt(currentTotalData[3], 16);
                    // console.log(currentTotalLength);
                    // onProgress && onProgress([currentTotalData.length, currentTotalLength]);
                    if (currentTotalLength == currentTotalData.length || currentTotalData.length == Math.ceil(currentTotalLength / 20) * 20) {
                        //一个历史记录包接收完整后就先解析
                        // console.log(currentTotalData);
                        currentTotalData = currentTotalData.slice(0, currentTotalLength);
                        currentTotalData = currentTotalData.slice(8); //去掉前8位
                        //解析本次的数据包
                        var currentDataPackage = decodeHistoryData(arrayToBytes(currentTotalData));
                        // totalDataList.push(currentDataPackage.data);
                        totalDataList = totalDataList.concat(currentDataPackage.data);
                        currentTotalData = []; //清空本次数据
                        // console.log(totalDataList);
                        // console.log('================');
                        onProgress && onProgress(currentDataPackage);
                        if (currentDataPackage.num == 0) {
                            //console.log(totalDataList);
                            console.log('---finished---');
                            onSuccess && onSuccess(totalDataList);
                            sys.stopNotify(peripheral);
                        }
                    }
                }
            }, function (errorMsg) {
                onError && onError("数据接收失败:" + errorMsg);
            });

            sys.write(peripheral, buildCommandBuffer(), "", function () {
            }, function (errorMsg) {
                onError && onError("指令\"" + buffer + "\"发送失败:" + errorMsg);
            });
        }

        exec();
    }

    api.printTable = function (header, billNumber, data, footer, bleName, peripheral, onSuccess, onError) {
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
        unicodeData = unicodeData.concat(["1B", "61", "01"]);
        unicodeData = unicodeData.concat(["1D", "21", "01"]);
        unicodeData = unicodeData.concat(stringToGBK.encode('多协云冷链全程温度监控'));
        unicodeData = unicodeData.concat(["0D", "0A", "1D", "21", "00"]);
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
            unicodeData = unicodeData.concat(["0D", "0A"]); // 换行
        }

        unicodeData = unicodeData.concat(stringToGBK.encode('过程温度：'));
        unicodeData = unicodeData.concat(["0D", "0A"]);
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
            unicodeData = unicodeData.concat(["0D", "0A"]);
        }
        unicodeData = unicodeData.concat(["0D", "0A"]);
        // 底部信息
        for (var key in footer) {
            unicodeData = unicodeData.concat(stringToGBK.encode(footer[key]));
            unicodeData = unicodeData.concat(["0D", "0A", "0D", "0A"]);
        }

        if (billNumber != '') {
            unicodeData = unicodeData.concat(stringToGBK.encode('登录网址：http://bill.duoxieyun.com'));
            unicodeData = unicodeData.concat(stringToGBK.encode('于查询界面输入查询编号即可'));
        }
        var command = ["00", "0D", "0A", "0D", "0A", "0D", "0A"];
        //alert(unicodeData);
        sys.write(peripheral, unicodeData.concat(command), "print", onSuccess, onError);
    }

    function convertToHex(str) {
        var hex = [];
        for (var i = 0; i < str.length; i++) {
            hex.push(str.charCodeAt(i).toString(16));
        }
        return hex;
    }

    function dataToBytes(arr) {
        var buffer = new ArrayBuffer(arr.length);
        var data = new Uint8Array(buffer);
        for (var i in arr) {
            data[i] = parseInt(arr[i], 16);
        }
        ;
        return data.buffer;
    }

    return {
        setConfig: setConfig,
        config: config,
        sys: sys,
        api: api
    }
}();