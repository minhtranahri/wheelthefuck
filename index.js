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
    constructor: function (dom, duration) {
        this.dom = dom;
        this.duration = duration;
    },
    spin: function () {
        if (this.status) {
            this.dom.css('animation-play-state', 'running');
            this.dom.css('animation-duration', this.duration);
        } else {
            this.dom.css('animation-play-state', 'paused');
        }
        this.toggleStatus();
    },
    toggleStatus: function () {
        return this.status = !this.status;
    },
    addHide: function () {
        this.dom.hide();
    }
};

