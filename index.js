$(document).ready(function () {
    const WHEEL_PROTO = new WHEEL($('#wheel'), '0.5s');
    const SUB_WHEEL = new WHEEL($('#sub_wheel'), '0.8s');

    WHEEL_PROTO.dom.height(WHEEL_PROTO.dom.width());
    SUB_WHEEL.dom.height(SUB_WHEEL.dom.width());

    WHEEL_PROTO.dom.on('click', function () {
        WHEEL_PROTO.spin();
        SUB_WHEEL.spin();
    })
});

const WHEEL = function (dom, duration) {
    this.constructor(dom, duration);
};

WHEEL.prototype = {
    dom: $('#wheel'),
    status: true,
    duration: '0.5s',
    currentDeg: 0,
    constructor: function (dom, duration) {
        this.dom = dom;
        this.duration = duration;
        this.dom.on('transitionend', function () {
            this.toggleStatus();
        }.bind(this));
        this.drawCircle();
    },
    spin: function () {
        if (this.status) {
            this.currentDeg = this.currentDeg + this.getRandomDeg();
            this.dom.css('transform', `rotate(${this.currentDeg}deg)`);
            this.toggleStatus();
        }
    },
    toggleStatus: function () {
        return this.status = !this.status;
    },
    getRandomDeg: function () {
        return 360 * 10 + getRandomInt();
    },
    drawCircle: function drawCircle() {
        var can = this.dom[0];
        if (can.getContext) {
            var ctx = can.getContext('2d');

            var drawAngledLine = function (x, y, length, angle) {
                var radians = angle / 180 * Math.PI;
                var endX = x + length * Math.cos(radians);
                var endY = y - length * Math.sin(radians);

                ctx.beginPath();
                ctx.moveTo(x, y)
                ctx.lineTo(endX, endY);
                ctx.closePath();
                ctx.stroke();
            }

            ctx.fillStyle = "#BD1981";
            ctx.beginPath();
            ctx.arc(200, 200, 150, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = "#FFC8B2";
            ctx.lineWidth = "2";

            for (let i = 0; i < 21; ++i) {
                drawAngledLine(200, 200, 150, 18 * i);
            }

        } else {
            // Fallback code goes here
        }
    }
};

function getRandomInt() {
    const min = Math.ceil(1);
    const max = Math.floor(360);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
