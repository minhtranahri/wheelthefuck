$(document).ready(function () {
    const WHEEL_PROTO = new WHEEL($('#wheel'), '5');
    const SUB_WHEEL = new WHEEL($('#sub_wheel'), '8');

    WHEEL_PROTO.dom.height(WHEEL_PROTO.dom.width());
    SUB_WHEEL.dom.height(SUB_WHEEL.dom.width());

    WHEEL_PROTO.dom.on('click', function () {
        const f = getRandomInt(1, 360);
        WHEEL_PROTO.spin(f);
        SUB_WHEEL.spin(f);
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
    num: 20,

    constructor: function (dom, duration) {
        this.dom = dom;
        this.duration = duration;
        this.dom.on('transitionend', function () {
            this.toggleStatus();
            console.log(this.getRotationDegrees(this.dom));
        }.bind(this));
        this.x_cor = this.y_cor = dom.attr('width') / 2;
        this.radius = dom.attr('width') / 2;
        this.drawCircle();
        this.angle = 360 / this.num;
    },
    spin: function (f) {
        if (this.status) {
            this.currentDeg = this.currentDeg + this.getRandomDeg(f);
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
    getRandomDeg: function (f) {
        return 360 * 10 + f * this.angle + f;
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
    },
    getRotationDegrees: function (obj) {
        let angle;
        const matrix = obj.css("-webkit-transform") ||
            obj.css("-moz-transform") ||
            obj.css("-ms-transform") ||
            obj.css("-o-transform") ||
            obj.css("transform");
        if (matrix !== 'none') {
            const values = matrix.split('(')[1].split(')')[0].split(',');
            const a = parseFloat(values[0]);
            const b = parseFloat(values[1]);
            angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        } else {
            angle = 0;
        }
        return (angle < 0) ? angle + 360 : angle;
    }
};

function getRandomInt(min, max) {
    const MIN = Math.ceil(min);
    const MAX = Math.floor(max);
    return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}
