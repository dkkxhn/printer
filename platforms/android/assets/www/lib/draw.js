var draw = (function () {
    var wd, xx, sx, zcxx, zcsx, mywidth, myheight, id, rh;
    var circular_arc = 14 / 9;//圆盘角度比
    var begin_arc = 13 / 18;//起始弧度参数
    var end_arc = 5 / 18;//结束弧度参数
    var disc_radius = 0.360;//圆盘半径
    var disc_lineWidth = 0.020;//圆盘粗度
    var progress_radius = 0.38;//进度条半径
    var text_radius = 0.43;//上下限字体半径
    var progress_lineWidth = 7 / 1000;//进度条粗度
    var scale_interval = 2 / 9;//刻度间隔
    var scale_lineWidth = 0.005;//刻度线粗度
    var scale_x = 0.338;//刻度线起始位置
    var scale_y = 0.348;//刻度线结束位置
    var scale_value_size = 0.03;//刻度值字体大小
    var scale_value_radius = 0.3100;//刻度值半径
    var text_height = 7 / 17;//数值高度比
    var text_size = 0.13;//数值字体大小
    var status_height = 9 / 16; //状态高度比
    var status_size = 0.04; //状态字体大小
    var unit_size = 0.03;//单位字体大小
    var unit_width = 0.85;//单位x坐标
    var unit_height = 1 / 7;//单位y坐标
    var arrow_radius = 0.400;//箭头半径
    var arrow_width = 0.380;//箭头位置
    var arrow_size = 0.010;//箭头大小
    var split_size = 0.15;//分割线长度
    var split_distance = 0.1;//分割线距离中心距离
    var half = 1 / 2;
    var samplingTime;
    var canvas;
    var context;

    /**
     *
     * @param {Object} WD 现在的温度
     * @param {Object} XX 温度下限
     * @param {Object} SX 温度上限
     * @param {Object} ZCXX 正常温度上限
     * @param {Object} ZCSX 正常温度下限
     * @param {Object} ID 画布id
     */
    function draw(WD, XX, SX, ZCXX, ZCSX, ID, RH, time) {
        wd = WD;
        if (wd < -40) {
            wd = -40;
        }
        if (wd > 100) {
            wd = 100;
        }
        xx = XX;
        sx = SX;
        zcxx = ZCXX;
        zcsx = ZCSX;
        rh = RH;
        id = ID;
        samplingTime = time;
        mywidth = 300;
        myheight = 300;
        canvas = document.getElementById(id);
        context = canvas.getContext('2d');
        var pi = Math.PI;

        //进度条轨迹
        canvas.width = 0;
        canvas.height = 0;
        canvas.width = mywidth;
        canvas.height = myheight;
        context.clearRect(0, 0, mywidth, myheight);
        context.lineWidth = mywidth * progress_lineWidth;
        context.beginPath();
        context.arc(mywidth * half, mywidth * half, mywidth * progress_radius, pi * begin_arc, pi * end_arc, false);
        context.strokeStyle = '#ddd';
        context.stroke();
        context.restore();

        //进度条
        if ((wd - sx) <= 0) {
            context.beginPath();
            context.arc(mywidth * half, mywidth * half, mywidth * progress_radius, pi * begin_arc, pi * begin_arc
                + (wd - xx) / (sx - xx) * pi * circular_arc, false);
            context.strokeStyle = '#64caff';
            context.stroke();
            context.restore();
        }

        //圆盘
        for (var i = 0; i < 3; i++) {
            context.save();
            context.lineWidth = mywidth * disc_lineWidth;
            context.beginPath();
            context.textAlign = 'center';
            if (i == 0) {
                context.strokeStyle = '#df030d';
                context.arc(mywidth * half, mywidth * half, mywidth * disc_radius, pi * begin_arc, pi * (circular_arc * (zcxx - xx) / (sx - xx) + begin_arc), false);
                if (zcxx != -39.99) {
                    context.fillText(zcxx, mywidth * half + mywidth * (text_radius + 0.01) * Math.cos(-pi * (circular_arc * (zcxx - xx) / (sx - xx) + begin_arc)), mywidth * half - mywidth * (text_radius + 0.01) * Math.sin(-pi * (circular_arc * (zcxx - xx) / (sx - xx) + begin_arc)));
                }
            } else if (i == 1) {
                context.strokeStyle = '#aae905';
                context.arc(mywidth * half, mywidth * half, mywidth * disc_radius, pi * (circular_arc * (zcxx - xx) / (sx - xx) + begin_arc), pi * (circular_arc * (zcsx - xx) / (sx - xx) + begin_arc), false);
                if (zcsx != 99.99) {
                    context.fillText(zcsx, mywidth * half + mywidth * (text_radius + 0.01) * Math.cos(-pi * (circular_arc * (zcsx - xx) / (sx - xx) + begin_arc)), mywidth * half - mywidth * (text_radius + 0.01) * Math.sin(-pi * (circular_arc * (zcsx - xx) / (sx - xx) + begin_arc)));
                }
            } else if (i == 2) {
                context.strokeStyle = '#df030d';
                context.arc(mywidth * half, mywidth * half, mywidth * disc_radius, pi * (circular_arc * (zcsx - xx) / (sx - xx) + begin_arc), pi * end_arc, false);

            }
            context.stroke();
            context.restore();
        }

        //状态
        context.font = ' bold ' + mywidth * status_size + 'pt Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.beginPath();
        if ((wd - sx) <= 0) {
            if (wd >= zcxx && wd <= zcsx || (zcxx == -39.99 && zcsx == 99.99)) {
                context.fillStyle = "#64caff";
                context.fillText('正常', mywidth * half, myheight * status_height);
            } else {
                context.fillStyle = "#df030d";
                context.fillText('异常', mywidth * half, myheight * status_height);
            }
        } else {
            context.fillStyle = "#FF0000";
            context.fillText('无数据', mywidth * half, myheight * status_height);
        }
        context.closePath();

        //分割线
        context.lineWidth = mywidth * scale_lineWidth;
        context.strokeStyle = '#bbbaba';
        context.beginPath();
        context.moveTo(mywidth * (half - split_size - split_distance), status_height * mywidth);
        context.lineTo(mywidth * (half - split_distance), status_height * mywidth);
        context.stroke();
        context.beginPath();
        context.moveTo(mywidth * (half + split_distance), status_height * mywidth);
        context.lineTo(mywidth * (half + split_size + split_distance), status_height * mywidth);
        context.closePath();
        context.stroke();

        // 湿度
        if (rh) {
            context.font = 'normal 14px Arial';
            context.fillStyle = "#999";
            context.fillText('RH ' + rh + '%', mywidth * half, myheight * 0.70);
        }

        // 最近采集时间
        context.font = 'normal 14px Arial';
        context.fillStyle = "#999";
        context.fillText(samplingTime, mywidth * half, myheight * 0.8);

        //温度显示
        context.font = ' bold ' + mywidth * text_size + 'pt Arial';
        context.fillStyle = '#2a2';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.beginPath();
        var wdjb = WD.toFixed(1) > WD ? WD.toFixed(1) - 0.1 : WD.toFixed(1);
        if (wdjb == -0.0) {
            wdjb = 0.001.toFixed(1);
        }
        if (WD > sx) {
            context.fillText('--', mywidth * half, myheight * text_height);
        }
        else {
            context.fillText(wdjb, mywidth * half, myheight * text_height);
        }
        context.closePath();


        //单位
        context.font = "bold " + mywidth * unit_size + "pt Arial";
        context.fillStyle = '#2a2';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.beginPath();
        context.fillText("单位：℃", mywidth * unit_width, myheight * unit_height);
        context.closePath();

        //画刻度线
        context.lineWidth = mywidth * scale_lineWidth;
        for (var i = 0; i < 8; i++) {
            context.beginPath();
            context.strokeStyle = '#bbbaba';
            context.moveTo(mywidth * half + Math.cos(pi * scale_interval * i - pi * end_arc) * mywidth * scale_x, mywidth * half - Math.sin(pi * scale_interval * i - pi * end_arc) * mywidth * scale_x);
            context.lineTo(mywidth * half + Math.cos(pi * scale_interval * i - pi * end_arc) * mywidth * scale_y, mywidth * half - Math.sin(pi * scale_interval * i - pi * end_arc) * mywidth * scale_y);
            context.stroke();
        }

        //箭头
        if (( wd - sx ) <= 0) {
            context.beginPath();
            context.arc(mywidth * half - mywidth * arrow_radius * Math.cos(pi * circular_arc * (wd - xx) / (sx - xx) - pi * end_arc), mywidth * half - mywidth * arrow_radius * Math.sin(pi * circular_arc * (wd - xx) / (sx - xx) - pi * end_arc), mywidth * arrow_size, 0, pi * 2, false);
            context.fillStyle = '#64caff';
            context.fill();
            context.moveTo(mywidth * half - mywidth * arrow_width * Math.cos(pi * circular_arc * (wd - xx) / (sx - xx) - pi * end_arc), mywidth * half - mywidth * arrow_width * Math.sin(pi * circular_arc * (wd - xx) / (sx - xx) - pi * end_arc));
            context.lineTo(mywidth * half - mywidth * arrow_radius * Math.cos(pi * circular_arc * (wd - xx) / (sx - xx) - pi * end_arc), mywidth * half - mywidth * arrow_radius * Math.sin(pi * circular_arc * (wd - xx) / (sx - xx) - pi * end_arc));
            context.stroke();
        }

        //标刻度值
        for (var i = 0; i < 8; i++) {
            context.beginPath();
            context.font = mywidth * scale_value_size + 'pt sans-serif';
            context.fillStyle = '#BB5500';
            context.fillText((sx - (sx - xx) / 7 * i).toFixed(0),
                mywidth * half + Math.cos(pi * scale_interval * i - pi * end_arc) * mywidth * scale_value_radius, mywidth * half - Math.sin(pi * scale_interval * i - pi * end_arc) * mywidth * scale_value_radius
            );
        }
    }

    return {
        render: draw
    }
})();

