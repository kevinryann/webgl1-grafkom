// Init essential variables
var vertices = [];
var colors = [];
var offset = 0;
var vertexCount = 0;
var drawObjectInfo = [];
var objVertex;
var selectedVertex;

// Create empty buffer
const vertexBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();

// Bind buffer
gl.useProgram(shaderProgram);
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
var coordinates = gl.getAttribLocation(shaderProgram, "coordinates");
gl.vertexAttribPointer(coordinates, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coordinates);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
var color = gl.getAttribLocation(shaderProgram, "color");
gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(color);

gl.clearColor(0.0, 0.0, 0.0, 0.1);
gl.enable(gl.DEPTH_TEST);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.viewport(0, 0, canvas.width, canvas.height);

function initDrawObject(object) {
    switch (object) {
        case "line":
            nothing = false;
            drawLine = true;
            resizing = false;
            break;
        case "resize":
            nothing = false;
            drawLine = false;
            resizing = true;
            break;
    }
    return object;
}

function drawObject() {
    gl.useProgram(shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);

    for (var i = 0; i < drawObjectInfo.length; i++) {
        gl.drawArrays(drawObjectInfo[i].mode, drawObjectInfo[i].offset, drawObjectInfo[i].count);
    }
}

var canvasElement = document.querySelector("#canvas");
var dummyResizing = 0;

canvasElement.addEventListener("mousedown", function (event) {
    var mousePosition = getMousePosition(canvas, event);

    if (resizing) {
        selectedVertex = -1;
        selectedObject = -1;
        for(var i = 0; i < vertices.length; i+=2){
            if((Number(vertices[i]).toFixed(1) == Number(mousePosition.x).toFixed(1)) 
            && (Number(vertices[i+1]).toFixed(1) == Number(mousePosition.y).toFixed(1))){
                selectedVertex = i;
                break;
            }
        }

        if(selectedVertex != -1){
            for(var i = drawObjectInfo.length-1; i >= 0; i--){
                if(drawObjectInfo[i].off*2 <= selectedVertex){
                    selectedObject = i;
                    break;
                }
                selectedObject = 0;
            }  
        }

        if (selectedObject != -1) {
            dummyResizing += 1;
            if (dummyResizing == 2) {
                selectedVertex = -1;
                selectedObject = -1;
                dummyResizing = 0;
            }
        }
    }
    else {
        var x = mousePosition.x;
        var y = mousePosition.y;
        vertices.push(x);
        vertices.push(y);

        vertexCount += 1;
        if (drawLine) {
            if (vertexCount == 2) {
                colors.push(1,0,0,0,0,1);
                drawObjectInfo.push({
                    "mode" : gl.LINE_STRIP,
                    "offset" : offset,
                    "count" : 2
                });
                offset += 2;
                vertexCount = 0;
            }
        }
    }

    
    drawObject();
});

canvasElement.addEventListener('mousemove', function (event) {
    if (resizing) {
        var mousePosition = getMousePosition(canvas, event);
        if(selectedVertex != -1){
            vertices[selectedVertex] = mousePosition.x;
            vertices[selectedVertex+1] = mousePosition.y;
        
            drawObject();
        }
    }
});

canvasElement.addEventListener('mouseup', function (event) {
    mousePosition = null;
});