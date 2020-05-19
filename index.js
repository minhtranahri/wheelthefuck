const WHEEL = function (dom, duration, input) {
    this.constructor(dom, duration, input);
};

const TRIGGER_DOM = $('#submit');
const OPTION = $('#option');
const SUB_OPTION = $('#sub_option');
const OUTER_SPD = 10;
const INNER_SPD = 12;
const DEFAULT_INPUT = ['left', 'right', 'straight'];
const OUTER_DOM = $('#wheel');
const INNER_DOM = $('#sub_wheel');

WHEEL.prototype = {
    radius_f: 1,
    cursorX: 0,
    cursorY: 0,
    cursor_deg: 10,
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
        this.registerParameters(dom, duration, input);

        this.dom.on('transitionend', function () {
            console.log('getRotationDegrees:' + this.getRotationDegrees(this.dom));
            console.log('current deg: ' + this.currentDeg);
            console.log('----------------');
            this.toggleStatus(true);
            /**
             * transition rotate does not update the canvas image data pixel, this code below will
             * rotate the canvas context after transitionend event fired, then get the pixel color
             * for determined the result of wheel, and rotate back as negative radian for reset the
             * position
             */
            this.redraw(this.currentDeg);

            const p = this.context.getImageData(this.cursorX, this.cursorY, 1, 1).data;
            const currentColorCode = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6).toUpperCase();
            this.equalDom.text(this.input[this.color.indexOf(currentColorCode)]).css('background', currentColorCode);

            // console.table({
            //     color: this.color.indexOf(currentColorCode),
            //     currentColor: currentColorCode,
            //     equal: this.input[this.color.indexOf(currentColorCode)]
            // });

            this.redraw(0);
        }.bind(this));
    },
    registerParameters: function (dom, duration, input) {
        if (this.status) {
            this.dom = dom;
            this.equalDom = $(`#${this.dom.attr('id')}_equal`);
            this.duration = duration;

            this.context = this.dom[0].getContext('2d');

            this.x_cor = this.radius = dom.attr('width') / 2;
            this.y_cor = dom.attr('height') / 2;
            this.calculateInput(input);
            this.drawCircle();
            this.positioningTheCursor();
        }
    },
    /**
     * calculate and draw cursor coordinate
     */
    positioningTheCursor: function () {
        const BLOCK_HEIGHT = this.y_cor * 2; // canvas height
        // calculate opposite side of triangle = nearby side (the radius) * tan(10deg);
        let OPPOSITE_SIDE = Math.tan(this.convertDegToRadian(this.cursor_deg)) * this.radius;
        const TOP_DISTANCE = this.radius - OPPOSITE_SIDE;
        const POSITION = ((TOP_DISTANCE / BLOCK_HEIGHT) * 100).toFixed(0);

        // recalculate after fixed
        OPPOSITE_SIDE = this.radius - (POSITION / 100 * BLOCK_HEIGHT);

        console.log('cursor position: ' + POSITION);

        const RAD = Math.atan(OPPOSITE_SIDE / this.radius);
        console.log(RAD);

        // calculate cursor coordinate
        this.cursorX = Math.cos(RAD) * (this.radius - this.radius_f) + this.radius;
        this.cursorY = this.y_cor - Math.sin(RAD) * (this.radius - this.radius_f);

        if (this.radius === 400) {
            $('#pointer').css({
                'top': `${POSITION}%`,
                'transform': `rotate(-${RAD}rad)`
            });
        }

        // console.log(this.dom);
        // console.log(this.cursorX, this.cursorY);
        // this.context.beginPath();
        // this.context.strokeStyle = this.getRandomColor();
        // this.context.moveTo(this.cursorX, this.cursorY);
        // this.context.lineTo(this.x_cor, this.y_cor);
        // this.context.stroke();
    },
    /**
     * calculate angle, determine number of options, get randomized colors for each options
     * @param input {array}: the array of options
     */
    calculateInput: function (input) {
        console.log('calculateInput: ' + input.length);
        this.num = input.length;
        this.angle = 360 / this.num;
        this.input = input;
        this.color = input.map(function () {
            return this.getRandomColor();
        }.bind(this));
        console.log(this.color);
    },
    /**
     * spin the wheel, toggle status of wheel, and active the rotate transform
     * (status of wheel) false: the wheel is rotating, all operations be canceled, true: rotating ended
     * @param f {number}: randomized degree
     */
    spin: function (f) {
        if (this.status) {
            this.toggleStatus(false);
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
            console.log('duplicated color: ' + color);
            return this.getRandomColor();
        }

        return color;
    },
    toggleStatus: function (status) {
        this.status = status;
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
            this.context.fillStyle = this.color[Math.round(angle / this.angle)];

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
            this.context.font = 'bold 10px sans-serif';
            this.context.fillText(input, this.radius - 50, 0);
            this.context.restore();
        }
    },
    /**
     */
    drawCircle: function () {
        const can = this.dom[0];
        if (can.getContext) {
            for (let i = 0; i < this.num; ++i) {
                this.drawAngledLine(this.x_cor, this.y_cor, this.radius, this.angle * i, this.input[i]);
            }

        } else {
            // Fallback code goes here
        }
    },
    // /**
    //  * get current degree have been rotated
    //  * @param obj
    //  * @returns {number}
    //  */
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

const WHEEL_PROTO = new WHEEL(OUTER_DOM, OUTER_SPD, DEFAULT_INPUT);
const SUB_WHEEL = new WHEEL(INNER_DOM, INNER_SPD, DEFAULT_INPUT);

WHEEL_PROTO.dom.height(WHEEL_PROTO.dom.width());
SUB_WHEEL.dom.height(SUB_WHEEL.dom.width());

INNER_DOM.css('display', 'none');
SUB_WHEEL.toggleStatus(false);

$(document).ready(function () {
    $('#outer_speed').val(OUTER_SPD);
    $('#inner_speed').val(INNER_SPD);

    WHEEL_PROTO.dom.on('click', function () {
        const f = getRandomInt(1, 360);
        WHEEL_PROTO.spin(f);
        SUB_WHEEL.spin(f);
    });

    $('#option, #sub_option').on('blur', function () {
        TRIGGER_DOM.trigger('submit');
    });

    $('#outer_speed, #inner_speed').on('change', function () {
        TRIGGER_DOM.trigger('submit');
    });

    $('#sub_enable').on('change', function () {
        const checked = !!$(this).prop('checked');
        if (checked) {
            SUB_WHEEL.show();
        } else {
            INNER_DOM.css('display', 'none');
        }

        SUB_WHEEL.toggleStatus(checked);
    });

    TRIGGER_DOM.on('submit', function () {
        const input = OPTION.val().split('\n');
        generateWheel(input, !!$('#sub_enable').prop('checked'));
    });

    $('#sync').on('click', function () {
        const outer = OPTION.val().split('\n');
        const inner = SUB_OPTION.val().split('\n');

        if (outer.length !== inner.length) {
            outer.length > inner.length ? outer.splice(inner.length, outer.length) : inner.splice(outer.length, inner.length);
            OPTION.val(outer.join('\n'));
            SUB_OPTION.val(inner.join('\n'));
            TRIGGER_DOM.trigger('submit');
        }
    });

    $('#balance').on('click', function () {
        const outer = OPTION.val().split('\n');
        const inner = SUB_OPTION.val().split('\n');

        if (outer.length !== inner.length) {
            let split;

            if (outer.length > inner.length) {
                split = _.chunk(outer, inner.length)[1];
                outer.splice(inner.length, outer.length);
            } else {
                split = _.chunk(inner, outer.length)[1];
                inner.splice(outer.length, inner.length);
            }

            const splitLength = split.length / 2;

            if (split.length % 2 !== 0) {
                split.splice(split.length - 1, split.length)
            }

            OPTION.val([...outer, ..._.chunk(split, splitLength)[0]].join('\n'));
            SUB_OPTION.val([...inner, ..._.chunk(split, splitLength)[1]].join('\n'));

            TRIGGER_DOM.trigger('submit');
        }
    });
});

function getRandomInt(min, max) {
    const MIN = Math.ceil(min);
    const MAX = Math.floor(max);
    return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}

function generateWheel(input, subWheelEnabled) {
    const subInput = SUB_OPTION.val().split('\n');
    const outerSpd = $('#outer_speed').val();
    const innerSpd = $('#inner_speed').val();

    WHEEL_PROTO.registerParameters(OUTER_DOM, outerSpd, input);
    SUB_WHEEL.registerParameters(INNER_DOM, innerSpd, subInput);
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}
