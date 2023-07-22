const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

var imgidx = 2;

var centerX;
var body;
var arm;
var joint;

var mode;
var editting;
var isDragging;
var selectedEvent;
var selectedIdx;

var POINT_SIZE = 11;
var DIST = 30;

const images = [
    'images/body0.png',
    'images/body1.png',
    'images/body2.png',
    'images/body3.png',
    'images/body4.png'
];
const arrows = '../images/arrows.png';

// 体型スライダー処理
function changeSlider(evt) {
    imgidx = slider.value;
    init();
}
let slider = document.getElementById("slider");
slider.addEventListener('input', changeSlider);

// モード変更処理
const EditMode = 0;
const ViewMode = 1;
function changeMode(val) {
    if (val == "Edit") {
        mode = EditMode;
    } else if (val == "View") {
        mode = ViewMode;
    } else {
        console.log("Invalid Mode!");
    }

    update();
}

// 編集箇所変更処理
const CenterEditting = 0;
const ShoulderEditting = 1;
const SleeveEditting = 2;
const HemEditting = 3;
const AllEditting = 4;
function changeEditting(val) {
    mode = EditMode;
    document.getElementById("edit-mode").checked = true;

    if (val == "Center") {
        editting = CenterEditting;
    } else if (val == "Shoulder") {
        editting = ShoulderEditting;
    } else if (val == "Sleeve") {
        editting = SleeveEditting;
    } else if (val == "Hem") {
        editting = HemEditting;
    } else if (val == "All") {
        editting = AllEditting;
    } else {
        console.log("Invalid Editting!");
    }

    update();
}

// Point間の距離を計算
function calcDist(p, q) {
    let dx = p.x - q.x;
    let dy = p.y - q.y;
    return Math.sqrt(dx*dx + dy*dy);
}

// 描画処理
function drawJoint() {
    context.strokeStyle = 'rgba(60, 179, 113, 1.0)';
    context.fillStyle = 'rgba(60, 179, 113, 0.9)';

    // Left
    context.beginPath();
    context.beginPath();
    context.moveTo(joints.points[0].x, joints.points[0].y);
    context.arc(joints.points[0].x, joints.points[0].y, joints.radius, 0, Math.PI*2);
    context.fill();

    // Right
    context.beginPath();
    context.beginPath();
    context.moveTo(joints.points[1].x, joints.points[1].y);
    context.arc(joints.points[1].x, joints.points[1].y, joints.radius, 0, Math.PI*2);
    context.fill();
}

function drawBody() {
    context.strokeStyle = 'rgba(60, 179, 113, 1.0)';
    context.fillStyle = 'rgba(60, 179, 113, 0.9)';

    centerBottom = {
        x: centerX,
        y: joints.height + body.height,
    };
    centerUp = {
        x: centerX,
        y: joints.height,
    };

    // Left Body
    context.beginPath();
    context.moveTo(joints.points[0].x, joints.points[0].y - joints.radius);
    context.lineTo(joints.points[0].x, joints.points[0].y);
    // context.lineTo(joints.points[0].x - joints.radius, joints.points[0].y);
    context.lineTo(body.points[1].x, body.points[1].y);
    context.lineTo(centerBottom.x, centerBottom.y);
    context.lineTo(centerUp.x, centerUp.y);
    context.lineTo(joints.points[0].x, joints.points[0].y - joints.radius);

    context.closePath();
    context.fill();
    
    // Right Body
    context.beginPath();
    context.moveTo(joints.points[1].x, joints.points[1].y - joints.radius);
    context.lineTo(joints.points[1].x, joints.points[1].y);
    // context.lineTo(joints.points[1].x + joints.radius, joints.points[1].y);
    context.lineTo(body.points[2].x, body.points[2].y);
    context.lineTo(centerBottom.x, centerBottom.y);
    context.lineTo(centerUp.x, centerUp.y);
    context.lineTo(joints.points[1].x, joints.points[1].y - joints.radius);

    context.closePath();
    context.fill();
}

function drawSleeve() {
    context.strokeStyle = 'rgba(60, 179, 113, 1.0)';
    context.fillStyle = 'rgba(60, 179, 113, 0.9)';

    let xDiff = sleeves.length * Math.sin(sleeves.angle);
    let yDiff = sleeves.length * Math.cos(sleeves.angle);
    let edgeXdiff = joints.radius * Math.cos(sleeves.angle);
    let edgeYdiff = joints.radius * Math.sin(sleeves.angle);

    let edgeCenterX;
    let edgeCenterY;

    // Left Sleeve
    edgeCenterX = joints.points[0].x - xDiff;
    edgeCenterY = joints.points[0].y + yDiff;

    context.beginPath();
    context.moveTo(joints.points[0].x - edgeXdiff, joints.points[0].y - edgeYdiff);
    context.lineTo(edgeCenterX - edgeXdiff, edgeCenterY - edgeYdiff);
    context.lineTo(edgeCenterX + edgeXdiff, edgeCenterY + edgeYdiff);
    context.lineTo(joints.points[0].x + edgeXdiff, joints.points[0].y + edgeYdiff);

    context.closePath();
    context.fill();
    
    // Right Sleeve
    edgeCenterX = joints.points[1].x + xDiff;
    edgeCenterY = joints.points[1].y + yDiff;

    context.beginPath();
    context.moveTo(joints.points[1].x + edgeXdiff, joints.points[1].y - edgeYdiff);
    context.lineTo(edgeCenterX + edgeXdiff, edgeCenterY - edgeYdiff);
    context.lineTo(edgeCenterX - edgeXdiff, edgeCenterY + edgeYdiff);
    context.lineTo(joints.points[1].x - edgeXdiff, joints.points[1].y + edgeYdiff);

    context.closePath();
    context.fill();
}

function drawSpade(point) {
    context.strokeStyle = 'rgba(0, 0, 255, 1.0)';
    context.fillStyle = 'rgba(0, 0, 255, 1.0)';

    context.beginPath();

    // Spade-pattern
    context.moveTo(point.x, point.y - POINT_SIZE);
    context.lineTo(point.x - POINT_SIZE, point.y);
    context.lineTo(point.x, point.y + POINT_SIZE);
    context.lineTo(point.x + POINT_SIZE, point.y);

    // Circle-pattern
    // context.arc(point.x, point.y, POINT_SIZE, 0 * Math.PI / 180, 360 * Math.PI / 180, false ) ;

    context.fill();
    context.stroke();
}

function drawPoints() {
    if (mode == ViewMode) {
        return;
    }

    // Joints
    for (let i = 0; i < joints.points.length; i++) {
        if (editting == ShoulderEditting || editting == AllEditting) {
            drawSpade(joints.points[i]);
        }
    }
    // Body
    for (let i = 0; i < body.points.length; i++) {
        if (i == 0) {
            if (editting == CenterEditting || editting == AllEditting) {
                drawSpade(body.points[i]);
            }
        } else {
            if (editting == HemEditting || editting == AllEditting) {
                drawSpade(body.points[i]);
            }
        }
    }
    // Sleeve
    for (let i = 0; i < sleeves.points.length; i++) {
        if (editting == SleeveEditting || editting == AllEditting) {
            drawSpade(sleeves.points[i]);
        }
    }
}

function draw() {
    const img = new Image();
    img.onload = () => {
        // Image
        context.drawImage(img, 0, 0, 760, 1020);
        // Joint
        drawJoint();
        // Body
        drawBody();
        // Sleeve
        drawSleeve();
        // Drag Points
        drawPoints();
    }
    img.src = images[imgidx];
}

// 座標更新
const jointUpdateMode = 0;
const bodyUpdateMode = 1;
const sleeveUpdateMode = 2;

function jointUpdate(event, idx, point) {
    // Drag
    if (event == jointUpdateMode) {
        joints.height = point.y;
        joints.width = Math.abs(centerX - point.x);
    }
    if (event == bodyUpdateMode && idx == 0) {
        centerX = point.x;
        joints.height = point.y;
    }

    // Left
    joints.points[0] = {
        x: centerX - joints.width,
        y: joints.height,
    };

    // Right
    joints.points[1] = {
        x: centerX + joints.width,
        y: joints.height,
    };
}

function bodyUpdate(event, idx, point) {
    if (event == bodyUpdateMode && idx != 0) {
        // Left, Right
        body.height = point.y - joints.height;
        body.width = Math.abs(centerX - point.x);
    }

    // Center
    body.points[0] = {
        x: centerX,
        y: joints.height
    }

    // Left-Bottom
    body.points[1] = {
        x: centerX - body.width,
        y: joints.height + body.height
    };

    // Right-Bottom
    body.points[2] = {
        x: centerX + body.width,
        y: joints.height + body.height
    };
}

function sleeveUpdate(event, idx, point) {
    if (event == sleeveUpdateMode &&
        point.y >= joints.height &&
        Math.abs(point.x - centerX) >= joints.width
    ) {
        if (idx == 0) {
            let d = calcDist(point, joints.points[0]);
            let dx = joints.points[0].x - point.x;

            sleeves.length = d;
            sleeves.angle = Math.asin(dx/d);
        }
        else {
            let d = calcDist(point, joints.points[1]);
            let dx = point.x - joints.points[1].x;

            sleeves.length = d;
            sleeves.angle = Math.asin(dx/d);
        } 
    }

    let xDiff = sleeves.length * Math.sin(sleeves.angle);
    let yDiff = sleeves.length * Math.cos(sleeves.angle);

    // Left
    sleeves.points[0] = {
        x: joints.points[0].x - xDiff,
        y: joints.points[0].y + yDiff,
    };

    // Right
    sleeves.points[1] = {
        x: joints.points[1].x + xDiff,
        y: joints.points[1].y + yDiff,
    };
}

function update(event, idx, point) {
    jointUpdate(event, idx, point);
    bodyUpdate(event, idx, point);
    sleeveUpdate(event, idx, point);

    draw();
}

// 画面上の座標を、canvas上の座標に変換
function convertEvt2Point(evt) {
    const rect = evt.target.getBoundingClientRect();

    const viewX = evt.clientX - rect.left;
    const viewY = evt.clientY - rect.top;

    const scaleWidth = canvas.clientWidth / canvas.width;
    const scaleHeight = canvas.clientHeight / canvas.height;

    const canvasX = Math.floor(viewX / scaleWidth);
    const canvasY = Math.floor(viewY / scaleHeight);

    return {
        x: canvasX, y: canvasY
    };
}

// 初期化
function init() {
    canvas.width = 760;
    canvas.height = 1020;

    // Parameter Initialization
    centerX = 375               // *中心の座標            
    joints = {
        radius: 32,             // *半径
        height: 253,            // *canvas上辺からの距離
        width:  94,             // *centerLineからの距離

        points: [               // 関節の中心
            { x: -1, y: -1 },   // 0: Left
            { x: -1, y: -1 },   // 1: Right
        ],
    };
    body = {        
        height: 273,            // *joint中心からの高さ
        width:  121,            // *centerXからの距離

        points: [               // body下端点
            { x: -1, y: -1 },   // 0: Center
            { x: -1, y: -1 },   // 1: Left-Bottom
            { x: -1, y: -1 },   // 2: Right-Bottom
        ],
    };
    sleeves = {
        length: 266,            // *joint中心からの距離
        angle:  0.57,           // *真下方向から角度(0 ~ Math.PI (rad))

        points: [               // 袖先の座標
            { x: -1, y: -1 },   // 0: Left
            { x: -1, y: -1 },   // 1: Right
        ],
    }

    mode = EditMode;
    document.getElementById("edit-mode").checked = true;
    editting = CenterEditting;
    document.getElementById("center-editting").checked = true;
    isDragging = false;
    selectedEvent = null;
    selectedIdx = null;
    
    // Mouse Down
    canvas.onmousedown = function (evt) {
        if (mode == ViewMode) return;

        isDragging = true;
        
        let point = convertEvt2Point(evt);
        
        // Pick Nearest Point
        let dmin = DIST;
        // Joints
        for (let i = 0; i < joints.points.length; i++) {
            if (editting == ShoulderEditting || editting == AllEditting) {
                let dist = calcDist(point, joints.points[i]);
                if (dist < dmin) {
                    dmin = dist;
                    selectedEvent = jointUpdateMode;
                    selectedIdx = i;
                }
            }
        }
        // Body 
        for (let i = 0; i < body.points.length; i++) {
            if (i == 0) {
                if (editting == CenterEditting || editting == AllEditting) {
                    let dist = calcDist(point, body.points[i]);
                    if (dist < dmin) {
                        dmin = dist;
                        selectedEvent = bodyUpdateMode;
                        selectedIdx = i;
                    }
                }
            } else {
                if (editting == HemEditting || editting == AllEditting) {
                    let dist = calcDist(point, body.points[i]);
                    if (dist < dmin) {
                        dmin = dist;
                        selectedEvent = bodyUpdateMode;
                        selectedIdx = i;
                    }
                }
            }
        }
        // Sleeve
        for (let i = 0; i < sleeves.points.length; i++) {
            if (editting == SleeveEditting || editting == AllEditting) {
                let dist = calcDist(point, sleeves.points[i]);
                if (dist < dmin) {
                    dmin = dist;
                    selectedEvent = sleeveUpdateMode;
                    selectedIdx = i;
                }
            }
        }

        if (dmin == DIST) {
            selectedEvent = null;
            selectedIdx = null;
            return;
        }

        update(selectedEvent, selectedIdx, point);
    }

    // Mouse Move
    canvas.onmousemove = function (evt) {
        if (mode == ViewMode) return;

        if (!isDragging) {
            return;
        }
        if (selectedEvent == null || selectedIdx == null) {
            return;
        }

        let point = convertEvt2Point(evt);

        update(selectedEvent, selectedIdx, point);
    }

    // Mouse Up
    document.onmouseup = function (evt) {
        if (mode == ViewMode) return;

        let point = convertEvt2Point(evt);

        update(selectedEvent, selectedIdx, point);

        isDragging = false;
        selectedEvent = null;
        selectedIdx = null;
    }

    update();
}

init();


