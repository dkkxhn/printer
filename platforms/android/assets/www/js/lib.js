
var F7 = new Framework7({
    modalTitle: '提示信息',
    modalButtonOk: '确认',
    modalButtonCancel: '取消',
    swipeBackPage: false,
    cache: false,
    swipePanel: 'left'
});
var $$ = Framework7.$;

// ajax请求开始
$$(document).on('ajaxStart', function () {
//    F7.showIndicator();
});
// ajax请求结束
$$(document).on('ajaxComplete', function () {
    F7.hideIndicator();
    F7.pullToRefreshDone();
    lazyImg();
});
// ajax请求失败
$$(document).on('ajaxError', function () {
    F7.pullToRefreshDone();
    F7.hideIndicator();
//    var notic = $$(document).find(".notification-item");
//    if (notic.length == 0) {
//        F7.addNotification({
//            title: "提示信息",
//            message: '数据不小心丢在半路上了，可能是您的网络不给力，请重试！',
//            hold: 4000
//        });
//    }
});
/**
 * API调用封装
 * @param type:请求模式，get/post
 * @param params:请求的数据，名值
 * @param [successCallback]:请求成功回调函数
 * @param [errorCallback]:请求失败回调函数
 *
 */
var App = {
    url: '192.168.1.200',
    userId: '',
    utc: function() {
        return Date.parse(new Date()) / 1000;
    },
    http: function(options,successCallback, errorCallback) {
        var utc = this.utc();
        var userId = options.userId == null ? this.userId : options.userId;
        var _defaHeader = {
            "Api-Key":"0ac6Pb-el9z95-Kf0QbUiL",
            "Api-Domain": "android",
            "Api-Time": utc,
            "Api-Userid": userId?userId:'noduoxieyun'
        }
        var _defaParams = {
            
        };
        var params = options.params || {};
        for (var k in _defaParams) {
            if (typeof params[k] === "undefined") {
                params[k] = _defaParams[k];
            }
        }
        var headers = options.headers || {};
        for (var k in _defaHeader) {
            if (typeof headers[k] === "undefined") {
                headers[k] = _defaHeader[k];
            }
        }
        var method = options.method || "get";
        var api = options.api || "";
        var url = options.url || this.url + api;
        var time = options.time || 500;
        var loading = options.loading;
        // headers.sign = createSign(headers, "d6ac06b713fd5b73578fab023d37b09e");
        setTimeout(function() {
            $$.ajax({
                method: method,
                url: url,
                data: params,
                dataType: "json",
                success: function(data) {
                    if (!loading) {
                        //App.loading("close");
                    }
                    if (data.code == '200') {
                        if (data.result) {
                            successCallback && successCallback(data.result);
                        } else {
                            successCallback && successCallback(data);
                        }
                    } else {
                        successCallback && successCallback(data);
                    }
                    /*else if (data.code == '201') {
                        App.toast( "apikey错误");
                    } else if (data.code == '202') {
                        App.toast( "数据格式错误");
                    } else if (data.code == '203') {
                        App.toast( "服务忙，请稍候再试");
                    } else if (data.code == '204') {
                        App.toast( "时间溢出错误");
                    } else if (data.code == '205') {
                        App.toast( "设备ID不匹配");
                    } else if (data.code == '206') {
                        App.toast( "设备不存在");
                    } else if (data.code == '207') {
                        App.toast( "操作失败");
                    } else if (data.code == '208') {
                        App.toast( "数据部分的传感器在数据库中不存在");
                    } else if (data.code == '209') {
                        App.toast( "部分数据的时间比数据库中最近采集时间要早");
                    } else {
                        App.toast("数据上传失败");
                    }*/
                },
                error: function(ret) {
                    App.loading("close");
                    if (errorCallback) {
                        errorCallback(ret);
                    } else {
                        if (!loading) {
                            App.preloader.hide();
                        }
                        App.toast("网络不给力~");
                    }
                },
                contentType:'application/json; charset=UTF-8',
                headers: headers,
                timeout: 30000
            });
        }, time);
    }
};
// 是否为android
App.android = F7.device.android;
// 是否为ios
App.ios = F7.device.ios;
// 获取设备可视宽度
App.clientWidth = document.body.clientWidth;
// 获取设备可视高度
App.clientHeight = document.body.clientHeight;
/**
 * 按钮触摸效果
 */
$$(document).on("touchstart touchmove touchend",".app-btn", function(e) {
    var that = $$(this);
    var act = "active";
    if (e.type == "touchstart") {
       that.addClass(act);
    }
    if (e.type == "touchmove" || e.type == "touchend") {
       that.removeClass(act);
    }
});
/**
 * 自定义触摸效果
 * 在HTML结构里加入自定义属性data-touch="class","class"为触摸时具体效果样式
 */
$$(document).on("touchstart touchmove touchend","[data-touch]", function(e) {
    var that = $$(this);
    var act = that.data("touch");
    if (e.type == "touchstart") {
        that.addClass(act);
    }
    if (e.type == "touchmove" || e.type == "touchend") {
        that.removeClass(act);
    }
});


/**
 * 加载层封装
 * msg[string]: 消息内容
 * type[number]: 加载层类型,若为0则不显示菊花
 * time[number]: 加载层存在时间
 */
App.loading = function(msg, type, time) {
    var tpl;
    var msg = msg || "";
    window.loadingDuration = "";
    var msk = ".loading-mask";
    if (window.loadingDuration) {
        clearTimeout(window.loadingDuration);
    }
    if (arguments[0] == "close") {
        $$(msk).remove();
        return false;
    }
    if (arguments.length == 2) {
        time = arguments[1];
    }
    if (time > 0) {
        window.loadingDuration = setTimeout(function() {
            $$(msk).animate({opacity: 0}, 500, 'ease-out', function() {
                $$(msk).remove();
            });
        }, time)
    }
    if ($$(msk).length > 0) {
        $$(msk).remove();
    }
    if (type == 0) {
        tpl = '<div class="loading-mask">'
                +'<div class="loading">'
                    +'<div>'+msg+'</div>'
                    +'</div>'
                +'</div>';
    } else {
        var msgHtml = "";
        if (msg) {
            msgHtml = '<div class="mt5">'+msg+'</div>';
        }
        tpl = '<div class="loading-mask">'
                +'<div class="loading">'
                    +'<i style="width:40px; height:40px" class="preloader preloader-white"></i>'
                    + msgHtml
                +'</div>'
            +'</div>';
    }
    $$("body").append(tpl);
}

/**
 * 信息提示框
 * msg[string]: 信息内容
 * duration[number]: 持续时间
 */
App.toast = function(msg, duration) {
    var toast = $$('<div class="modal toast">'+msg+'</div>');
    $$('body').append(toast);
    $$(toast).show();
    $$(toast).css({
        marginTop: - Math.round($$(toast).outerHeight() / 2) + 'px'
    });
    $$(toast).css({
        marginLeft: - Math.round($$(toast).outerWidth() / 2) + 'px'
    });
    $$(toast).addClass('modal-in').transitionEnd(function () {
    });
    $$(toast).on('click', function() {
        remove();
    });
    function remove() {
        $$(toast).removeClass('modal-in').addClass('modal-out').transitionEnd(function () {
            $$(this).remove();
        });
    }
    setTimeout(function() {
        remove();
    }, duration || 1500);
};

/**
 * 插件调用
 */
 var durationEnd = true;
// App.toast = function(msg, duration, position, callback) {
//     if (window.plugins) {
//         window.plugins.toast.show(msg, duration || "short", position || "center", function() {
//             setTimeout(function() {
//                 durationEnd = true;
//             }, 1000);
//             callback && callback();
//         });
//     } else {
//         alert(msg);
//     }
// };
App.alert = function(msg, callback, btnName) {
    F7.alert(msg, function() {
        callback && callback();
    });
};
App.confirm = function(title, msg, callback, btn1, btn2) {
    F7.confirm(title, msg, function () {
        callback && callback();
    }, {}, btn1, btn2);
};
App.prompt = function(msg, callback, text, btnName){
    if (window.plugins) {
        navigator.notification.prompt(msg, callback, "提示信息", btnName || ['确定','取消'], text);
    }
};
App.picker = function(type, date, callback){
     if (window.plugins) {
        window.plugins.datePicker.show({
            date: date || new Date(),
            mode: type || 'date',
            cancelText: '取消',
            doneButtonLabel: '确定',
            cancelButtonLabel: '取消',
            locale: 'zh_cn',
            is24Hour: true,
            androidTheme: 3
        }, function(ret,err){
            if(isNaN(ret)) {

            } else {
                callback(ret);
            }
        });
    }
};
/**
 * 图片延迟加载
 * @param {Object} e:图片对象
 */
function lazyImg(e) {
    var e = e || ".J_lazy";
    $$(e).each(function() {
        var self = $$(this);
        var src = $$(this).attr("data-src");
        var img = new Image();
        img.src = src;
        img.onload = function() {
            self.attr("src",img.src);
            self.css("opacity",1);
            setTimeout(function() {
                self.addClass("onload");
            }, 500);
        }
    })
}
/**
 * 获取日期
 * @param  {[string]} type [为'y'，获取现在的年份,为'ym',获取年月,为'm',获取月,为'w',获取周]
 * @return {[type]}      [description]
 */
App.getDate = function(type) {
    var date = new Date();
    var y = date.getFullYear();
    var m = fixTime(date.getMonth()+1);
    var w = date.getDay();
    var d = fixTime(date.getDate());
    var h = fixTime(date.getHours());
    var min = fixTime(date.getMinutes());
    var r = y+"/"+m+"/"+d+' '+h+':'+min;
    if (type == 'y') {
        r = y;
    } else if (type == 'ym') {
        r = y + '-' + m;
    } else if (type == 'm') {
        r = m;
    } else if (type == 'w') {
        r = '周' + '日一二三四五六'.charAt(w);
    }
    return r;
}

/**
 * 获取第n天的时间
 * @param n
 * @returns {string}
 * @constructor
 */
App.GetDateTime = function(n) {
    var dd = new Date();
    dd.setDate(dd.getDate()+n);
    return dd;
}

App.formatDate = function(nS, type) {
    var dd = new Date(nS);     
    var year = dd.getFullYear();     
    var month = fixTime(dd.getMonth()+1);
    var date = fixTime(dd.getDate());    
    var hour = fixTime(dd.getHours());  
    var minute = fixTime(dd.getMinutes());
    var second = fixTime(dd.getSeconds());
    if (type == 1) {
        return  month+"-"+date+" "+hour+":"+minute+":"+second;
    } else {
        return  year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
    }
};

App.loadJScript = function(src) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    document.body.appendChild(script);
}

/**
 * 版本比较
 * @param  {[type]} v1 [服务器版本]
 * @param  {[type]} v2 [本地版本]
 * @return {[type]}    [description]
 */
App.compareVersion = function(v1, v2) {
    var n1 = v1.split(".");
    var n2 = v2.split(".");
    var diff = parseInt(n1.length - n2.length);
    var point = 1;
    var fmtNum = function(n) {
        return parseInt(n.join("").replace(/\b(0+)/gi,""));
    };
    for (var i = 0; i < diff; i++) {
        point = point*10;
    }
    var fn1 = fmtNum(n1);
    var fn2 = fmtNum(n2);
    // 补位
    if (n1.length < n2.length) {
        fn1 = fn1*point;
    } else {
        fn2 = fn2*point;
    }
    var res = fn1 - fn2;
    return res;
};

var isLoading = false;
App.indicator = {
    show: function() {
        if (!isLoading) {
            F7.showIndicator();
            isLoading = true;
        }
    },
    hide: function() {
        if (isLoading) {
            F7.hideIndicator();
            isLoading = false;
        }
    }
};

var preloaderTimer;
App.preloader = {
    show: function(msg, time) {
        var that = this;
        that.hide();
        F7.showPreloader(msg);
        preloaderTimer = setTimeout(function() {
            that.hide();
        }, time || 15000);
    },
    hide: function() {
        F7.hidePreloader();
        clearTimeout(preloaderTimer);
    }
};


//配置dxsdk
Dxsdk.setConfig({
    preloader: App.preloader
});


App.notify = function(title, message) {
    var instance = F7.addNotification({
        title: title,
        message: message
    });
    setTimeout(function() {
        F7.closeNotification(instance);
    }, 1000*5);
};
App.extend = function(destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
    return destination;
};

/**
 * 数字保留小数
 * @param  {[type]} v [数字]
 * @param  {[type]} n [保留n位小数]
 * @return {[type]}   [description]
 */
App.fmtNumber = function(v, n) {
    if (v) {
        var n = n || 1;
        var v = v.toString();
        var i = v.indexOf('.');
        if (i > -1) {
            return v.substr(0, i + n + 1); 
        } else {
            return v + '.0';
        }
    } else {
        return v;
    }
};
/**
 * 格式化服务器图片，转换成对应尺寸
 * @param src：图片地址
 */
function imgFmt(src, w ,h) {
    var type = src.substr(src.lastIndexOf("."));
    var w = w.toFixed(0);
    var h = h.toFixed(0);
    return src+'_r'+ w + 'x' + h + type;
}

function fixTime(d) {
    if (d < 10) {
        d = "0" +d;
    }
    return d;
}

// 去掉前后空格
App.trim = function(str){
    if(String.prototype.trim){
        return str == null ? "" : String.prototype.trim.call(str);
    }else{
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }
};
App.errorCodeTip = function(code, msg) {
    App.preloader.hide();
    if (code == '201') {
        App.toast(msg || "apikey错误");
    } else if (code == '202') {
        App.toast(msg || "数据格式错误");
    } else if (code == '203') {
        App.toast(msg || "服务忙，请稍候再试");
    } else if (code == '204') {
        App.toast(msg || "时间溢出错误");
    } else if (code == '205') {
        App.toast(msg || "设备ID不匹配");
    } else if (code == '206') {
        App.toast(msg || "服务器不存在该设备");
    } else if (code == '207') {
        App.toast(msg || "操作失败");
    } else if (code == '208') {
        App.toast(msg || "数据部分的传感器在数据库中不存在");
    } else if (code == '209') {
        App.toast(msg || "部分数据的时间比数据库中最近采集时间要早");
    } else {
        App.toast(msg || "数据上传失败");
    } 
}