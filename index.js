$(document).ready(function () {
    const WHEEL_PROTO = new WHEEL($('#wheel'), '5');
    const SUB_WHEEL = new WHEEL($('#sub_wheel'), '8');

    WHEEL_PROTO.dom.height(WHEEL_PROTO.dom.width());
    SUB_WHEEL.dom.height(SUB_WHEEL.dom.width());

    WHEEL_PROTO.dom.on('click', function () {
        WHEEL_PROTO.spin();
        SUB_WHEEL.spin();
    });
});

const WHEEL = function (dom, duration) {
    this.constructor(dom, duration);
};

WHEEL.prototype = {
    dom: $('#wheel'),
    status: true,
    duration: '0.5s',
    currentDeg: 0,
    radius: 0,
    x_cor: 0,
    y_cor: 0,

    constructor: function (dom, duration) {
        this.dom = dom;
        this.duration = duration;
        this.dom.on('transitionend', function () {
            this.toggleStatus();
        }.bind(this));
        this.x_cor = this.y_cor = dom.attr('width') / 2;
        this.radius = dom.attr('width') / 2;
        this.drawCircle();
    },
    spin: function () {
        if (this.status) {
            this.currentDeg = this.currentDeg + this.getRandomDeg();
            this.dom.css({
                'transform': `rotate(${this.currentDeg}deg)`,
                'transition-duration': `${this.duration}s`
            });
            this.toggleStatus();
        }
    },
    toggleStatus: function () {
        return this.status = !this.status;
    },
    getRandomDeg: function () {
        return 360 * 10 + getRandomInt();
    },
    drawCircle: function () {
        const can = this.dom[0];
        if (can.getContext) {
            const ctx = can.getContext('2d');

            const drawAngledLine = function (x, y, length, angle) {
                const radians = angle / 180 * Math.PI;
                const endX = x + length * Math.cos(radians);
                const endY = y - length * Math.sin(radians);

                ctx.beginPath();
                ctx.lineWidth = "0.3";
                ctx.strokeStyle = "#000";
                ctx.moveTo(x, y);
                ctx.lineTo(endX, endY);
                ctx.closePath();
                ctx.stroke();
            };

            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(this.x_cor, this.y_cor, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = "#000";
            ctx.stroke();

            for (let i = 0; i < 20; ++i) {
                drawAngledLine(this.x_cor, this.y_cor, this.radius, 18 * i);
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
