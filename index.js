$(document).ready(function () {
    const TRIGGER_DOM = $('#submit');
    generateWheel(['left', 'right', 'straight'], false);

    $('#option, #sub_option').on('blur', function () {
        TRIGGER_DOM.trigger('submit');
    });

    $('#sub_enable').on('change', function () {
        TRIGGER_DOM.trigger('submit');
    });

    TRIGGER_DOM.on('submit', function () {
        const input = $('#option').val().split('\n');
        generateWheel(input, !!$('#sub_enable').prop('checked'));
    })
});

const WHEEL = function (dom, duration, input) {
    this.constructor(dom, duration, input);
};

WHEEL.prototype = {
    dom: '',
    status: true,
    duration: '0.5s',
    currentDeg: 0,
    radius: 0,
    x_cor: 0,
    y_cor: 0,
    num: 3,
    input: [],

    constructor: function (dom, duration, input) {
        this.dom = dom;
        this.duration = duration;
        this.dom.on('transitionend', function () {
            this.toggleStatus();
            console.log(this.getRotationDegrees(this.dom));
        }.bind(this));
        this.x_cor = this.y_cor = dom.attr('width') / 2;
        this.radius = dom.attr('width') / 2;
        this.calculateInput(input);
        this.drawCircle();
    },
    calculateInput: function (input) {
        this.num = input.length;
        this.angle = 360 / this.num;
        this.input = input;
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
        return 360 * 10 + f + getRandomInt(1, 20) * this.angle;
    },
    drawAngledLine: function (x, y, length, angle, input) {
        const ctx = this.dom[0].getContext('2d');

        if (typeof input !== 'string') {
            const base_image = new Image();
            base_image.src = `./img/fff&text=${getRandomInt(1, 9)}.png`;

            base_image.onload = function () {
                const radians = this.convertDegToRadian(angle);
                ctx.beginPath();
                ctx.fillStyle = ctx.createPattern(base_image, 'repeat');
                ctx.moveTo(x, y);
                ctx.arc(this.x_cor, this.y_cor, this.radius, radians, this.convertDegToRadian(angle + this.angle));
                ctx.fill();
            }.bind(this);
        } else {
            const radians = this.convertDegToRadian(angle);
            ctx.beginPath();
            ctx.fillStyle = getRandomColor();

            ctx.moveTo(x, y);
            ctx.arc(this.x_cor, this.y_cor, this.radius, radians, this.convertDegToRadian(angle + this.angle));
            ctx.fill();

            // fill text
            ctx.save();
            ctx.translate(this.x_cor, this.y_cor);
            ctx.rotate(this.convertDegToRadian(angle + this.angle / 2));
            ctx.textAlign = "center";
            ctx.fillStyle = "#fff";
            ctx.font = 'bold 30px sans-serif';
            ctx.fillText(input, this.radius - 100, 0);
            ctx.restore();
        }
    },
    drawCircle: function () {
        const can = this.dom[0];
        if (can.getContext) {
            for (let i = 0; i < this.num; ++i) {
                console.log(this.input[i]);
                this.drawAngledLine(this.x_cor, this.y_cor, this.radius, this.angle * i, this.input[i]);
            }

        } else {
            // Fallback code goes here
        }
    },
    getRotationDegrees: function (obj) {
        let angle = 0;
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
        }
        return (angle < 0) ? angle + 360 : angle;
    },
    convertDegToRadian: function (deg) {
        return deg / 180 * Math.PI
    }
};

function getRandomInt(min, max) {
    const MIN = Math.ceil(min);
    const MAX = Math.floor(max);
    return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generateWheel(input, subWheelEnabled) {
    const WHEEL_PROTO = new WHEEL($('#wheel'), '10', input);
    WHEEL_PROTO.dom.height(WHEEL_PROTO.dom.width());

    let SUB_WHEEL;
    if (subWheelEnabled) {
        const subInput = $('#sub_option').val().split('\n');
        SUB_WHEEL = new WHEEL($('#sub_wheel'), '12', subInput);
        SUB_WHEEL.dom.height(SUB_WHEEL.dom.width());
    }

    WHEEL_PROTO.dom.on('click', function () {
        const f = getRandomInt(1, 360);
        WHEEL_PROTO.spin(f);
        if (subWheelEnabled) {
            SUB_WHEEL.spin(f);
        }
    });
}
