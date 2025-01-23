let socket = io();

let canvas = new fabric.Canvas('c');
let line, triangle, origX, origY, isFreeDrawing = true;
let activeColor = '#000000';
let isLoadedFromJson = false;

const history = [];

//init variables
let div = $("#canvasWrapper");
let $canvas = $("#c");

//width and height of canvas's wrapper
let w, h;
w = div.width();
h = div.height();
$canvas.width(w).height(h);

//set w & h for canvas
canvas.setHeight(h);
canvas.setWidth(w);

function initCanvas(canvas) {
    // canvas.clear();
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
        blur: 0,
        offsetX: 0,
        offsetY: 0,
        affectStroke: true,
        color: '#ffffff',
    });
    canvas.freeDrawingBrush.width = 5;
    canvas.isDrawingMode = true;

    return canvas;
}

function setBrush(options) {
    if (options.width !== undefined) {
        canvas.freeDrawingBrush.width = parseInt(options.width, 10);
    }

    if (options.color !== undefined) {
        canvas.freeDrawingBrush.color = options.color;
    }
}

function setCanvasSelectableStatus(val) {
    canvas.forEachObject(function(obj) {
        obj.lockMovementX = ! val;
        obj.lockMovementY = ! val;
        obj.hasControls = val;
        obj.hasBorders = val;
        obj.selectable = val;
    });
    canvas.renderAll();
}

function removeCanvasEvents() {
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
    canvas.off('object:moving');
}

function undoObject() {
    if (canvas) {
        if (canvas._objects.length > 0) {
            const poppedObject = canvas._objects.pop();
            canvas.renderAll();
        }
    }
}

function saveCanvas() {
    const dataURL = canvas.toDataURL({
        width: canvas.width,
        height: canvas.height,
        left: 0,
        top: 0,
        format: 'png',
   });
   const link = document.createElement('a');
   link.download = 'image.png';

   link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function emitEvent() {
    let aux = canvas;
    let json = aux.toJSON();
    let data = {
        w: w,
        h: h,
        data: json
    };
    socket.emit('drawing', data);
}


$(function () {
    //Canvas init
    initCanvas(canvas).renderAll();

    //canvas events
    canvas.on('after:render', function() {
        if (! isLoadedFromJson) {
            emitEvent();
        }
        isLoadedFromJson = false;
        console.log(canvas.toJSON());
    });

    //dynamically resize the canvas on window resize
    $(window)
        .on('resize', function () {
            w = div.width();
            h = div.height();
            canvas.setHeight(h);
            canvas.setWidth(w);
            $canvas.width(w).height(h);
        })
        .on('keydown', function (e) {
            if (e.keyCode === 46) { //delete key
                undoObject();
            }
        });

    //Set Brush Size
    $(".size-btns button").on('click', function () {
        $(".size-btns button").removeClass('active');
        $(this).addClass('active');
    });

    //Set brush color
    $(".color-btns button").on('click', function () {
        let val = $(this).data('value');
        activeColor = val;
        $("#brushColor").val(val);
        setBrush({color: val});
    });

    $("#brushColor").on('change', function () {
        let val = $(this).val();
        activeColor = val;
        setBrush({color: val});
    });

    $("#drwUndo").on('click', function() { undoObject(); });

    $("#drwClearCanvas").on('click', function () { canvas.clear(); });

    $("#drwSaveCanvas").on('click', (e) => { saveCanvas(e); });

    canvas.renderAll();

    //Sockets
    socket.emit('ready', "Page loaded");

    socket.on('drawing', function (obj) {
        //set this flag, to disable infinite rendering loop
        isLoadedFromJson = true;

        //calculate ratio by dividing this canvas width to sender canvas width
        let ratio = w / obj.w;

        //reposition and rescale each sent canvas object
        obj.data.objects.forEach(function(object) {
            object.left *= ratio;
            object.scaleX *= ratio;
            object.top *= ratio;
            object.scaleY *= ratio;
        });

        canvas.loadFromJSON(obj.data);
    });
});