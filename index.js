/**
 * coordinate of cursor
 * @type {number}
 */
const cursorX = 769;
const cursorY = 403;

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
    });
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
    color: [],
    context: null,

    /**
     * canvas constructor, define canvas context, x,y-coordinate, the radius of circle
     * register transitionend event
     */
    constructor: function (dom, duration, input) {
        this.dom = dom;
        this.duration = duration;

        this.context = this.dom[0].getContext('2d');

        this.x_cor = this.radius = dom.attr('width') / 2;
        this.y_cor = dom.attr('height') / 2;
        this.calculateInput(input);
        this.drawCircle();

        this.dom.on('transitionend', function () {
            this.toggleStatus();
            /**
             * transition rotate does not update the canvas image data pixel, this code below will
             * rotate the canvas context after transitionend event fired, then get the pixel color
             * for determined the result of wheel, and rotate back as negative radian for reset the
             * position
             */
            this.redraw(this.currentDeg);

            const p = this.context.getImageData(cursorX, cursorY, 1, 1).data;
            const currentColorCode = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6).toUpperCase();
            $('#current').text(this.input[this.color.indexOf(currentColorCode)]);

            this.redraw(0);
        }.bind(this));
    },
    /**
     * calculate angle, determine number of options, get randomized colors for each options
     * @param input {array}: the array of options
     */
    calculateInput: function (input) {
        this.num = input.length;
        this.angle = 360 / this.num;
        this.input = input;
        this.color = input.map(function () {
            return this.getRandomColor();
        }.bind(this));
    },
    /**
     * spin the wheel, toggle status of wheel, and active the rotate transform
     * (status of wheel) false: the wheel is rotating, all operations be canceled, true: rotating ended
     * @param f {number}: randomized degree
     */
    spin: function (f) {
        if (this.status) {
            this.toggleStatus();
            this.currentDeg = this.currentDeg + this.getRandomDeg(f);

            this.dom.css({
                'transform': `rotate(${this.currentDeg}deg)`,
                'transition-duration': `${this.duration}s`
            });
        }
    },
    /**
     * redraw the canvas circle, reset all canvas data
     * @param rad {number}: degree as radian to rotate using canvas
     */
    redraw: function (rad) {
        this.context.clearRect(0, 0, this.radius * 2, this.radius * 2);
        this.context.save();
        this.context.translate(this.x_cor, this.y_cor);
        this.context.rotate(this.convertDegToRadian(rad));
        this.context.translate(-this.x_cor, -this.y_cor);

        this.drawCircle();
        this.context.restore();
    },
    /**
     * get random color as hex
     * @returns {*|*|string|string|string}
     */
    getRandomColor: function () {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }

        if (this.color.indexOf(color) > -1) {
            return this.getRandomColor();
        }

        return color;
    },
    toggleStatus: function () {
        return this.status = !this.status;
    },
    /**
     * randomized degree will be used for rotate, this decision the result
     * @param f {number}
     * @returns {*} degree
     */
    getRandomDeg: function (f) {
        return 360 * 10 + f + getRandomInt(1, 20) * this.angle;
    },
    /**
     * draw the arc
     * @param x {number} x-coordinate of circle center
     * @param y {number} y-coordinate of circle center
     * @param length {number} the radius
     * @param angle {number} current degree
     * @param input {string|image} content will be fill on the circle part
     */
    drawAngledLine: function (x, y, length, angle, input) {
        // in case image
        if (typeof input !== 'string') {
            const base_image = new Image();
            base_image.src = `./img/fff&text=${getRandomInt(1, 9)}.png`;

            base_image.onload = function () {
                const radians = this.convertDegToRadian(angle);
                this.context.beginPath();
                this.context.fillStyle = this.context.createPattern(base_image, 'repeat');
                this.context.moveTo(x, y);
                this.context.arc(this.x_cor, this.y_cor, this.radius, radians, this.convertDegToRadian(angle + this.angle));
                this.context.fill();
            }.bind(this);
        } else {
            const radians = this.convertDegToRadian(angle);
            this.context.beginPath();
            this.context.fillStyle = this.color[angle / this.angle];

            // draw the arc of circle
            this.context.moveTo(x, y);
            this.context.arc(this.x_cor, this.y_cor, this.radius, radians, this.convertDegToRadian(angle + this.angle));
            this.context.fill();

            // fill text
            this.context.save();
            this.context.translate(this.x_cor, this.y_cor);
            this.context.rotate(this.convertDegToRadian(angle + this.angle / 2));
            this.context.textAlign = "center";
            this.context.fillStyle = "#fff";
            this.context.font = 'bold 30px sans-serif';
            this.context.fillText(input, this.radius - 100, 0);
            this.context.restore();
        }
    },
    /**
     * draw each arc of circle
     */
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
    /**
     * get current degree have been rotated
     * @param obj
     * @returns {number}
     */
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
    },
    show: function () {
        this.dom.css('display', 'block');
    }
};

function getRandomInt(min, max) {
    const MIN = Math.ceil(min);
    const MAX = Math.floor(max);
    return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}

function generateWheel(input, subWheelEnabled) {
    const subInput = $('#sub_option').val().split('\n');

    const WHEEL_PROTO = new WHEEL($('#wheel'), '10', input);
    WHEEL_PROTO.dom.height(WHEEL_PROTO.dom.width());

    let SUB_WHEEL;
    if (subWheelEnabled) {
        SUB_WHEEL = new WHEEL($('#sub_wheel'), '12', subInput);
        SUB_WHEEL.dom.height(SUB_WHEEL.dom.width());
        SUB_WHEEL.show();
    } else {
        $('#sub_wheel').css('display', 'none');
    }

    WHEEL_PROTO.dom.on('click', function () {
        const f = getRandomInt(1, 360);
        WHEEL_PROTO.spin(f);
        if (subWheelEnabled) {
            SUB_WHEEL.spin(f);
        }
    });
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}
