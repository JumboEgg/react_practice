
canvas.selection = false;
var line, isDown, origX, origY, textVal, activeObj;

canvas.on('mouse:down', function(o) {
    isDown = true;
    var pointer = canvas.getPointer(o.e);
    origX = pointer.x;
    origY = pointer.y;
});

canvas.on('mouse:move', function(o) {
    if (isDown) {
        var pointer = canvas.getPointer(o.e);
        canvas.renderAll();
    }
});

canvas.on('mouse:up', function(o) {
    isDown = false;
    //set coordinates for proper mouse interaction
    var objs = canvas.getObjects();
    for (var i = 0 ; i < objs.length; i++) {
        objs[i].setCoords();
    }
});
function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}
canvas.on("object:modified", function (e) {
    try {
        var obj = e.target;

        obj.width *= obj.scaleX;
        obj.height *= obj.scaleY;
        obj.scaleX = 1;
        obj.scaleY = 1;
        
        //find text with the same UUID
        var currUUID = obj.uuid;
        var objs = canvas.getObjects();
        var currObjWithSameUUID = null;
        for (var i = 0 ; i < objs.length; i++) {
            if (objs[i].uuid === currUUID &&
                objs[i].type === 'text') {
                currObjWithSameUUID = objs[i];
                break;
            }
        }
        if (currObjWithSameUUID) {
            currObjWithSameUUID.left = obj.left;
            currObjWithSameUUID.top = obj.top - 30;
            currObjWithSameUUID.opacity = 1;
        }
    } catch (E) {
    }
});

var _hideText = function (e) {
    try {
        var obj = e.target;
        //console.log(obj);
        //find text with the same UUID
        var currUUID = obj.uuid;
        var objs = canvas.getObjects();
        var currObjWithSameUUID = null;
        for (var i = 0 ; i < objs.length; i++) {
            if (objs[i].uuid === currUUID && objs[i].type === 'text') {
                currObjWithSameUUID = objs[i];
                break;
            }
        }
        if (currObjWithSameUUID) {
            currObjWithSameUUID.opacity = 0;
        }
    } catch (E) {
    }
}

canvas.on("object:moving", function (e) {
    _hideText(e);
});
canvas.on("object:scaling", function (e) {
    _hideText(e);
});
canvas.renderAll();