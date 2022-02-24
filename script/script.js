// Init essential variables
var vertices = [];
var colors = [];
var offset = 0;
var vertexCount = 0;
var drawObjectInfo = [];
var vecTemp = [];
var objVertex;
var selectedVertex;
var x1 = 0; 
var x2 = 0;
var y1 = 0;
var y2 = 0;

// Create empty buffer
var vertexBuffer = gl.createBuffer();
var colorBuffer = gl.createBuffer();

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

gl.clearColor(0.0, 0.0, 0.0, 0.0);
gl.enable(gl.DEPTH_TEST);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.viewport(0, 0, canvas.width, canvas.height);

function initDrawObject(object) {
    switch (object) {
        case "line":
            nothing = false;
            drawLine = true;
            drawSquare = false;
            drawRectangle = false;
            resizing = false;
            break;
        case "square":
            nothing = false;
            drawLine = false;
            drawSquare = true;
            drawRectangle = false;
            resizing = false;
            break;
        case "rectangle":
            nothing = false;
            drawLine = false;
            drawSquare = false;
            drawRectangle = true;
            resizing = false;
            break;
        case "resize":
            nothing = false;
            drawLine = false;
            drawSquare = false;
            drawRectangle = false;
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

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
        if (!drawRectangle){
            vertices.push(x);
            vertices.push(y);
        }

        if (drawLine) {
            vertexCount += 1;
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
        else if (drawSquare){
            vecTemp.push(mousePosition);
            vertexCount += 1;
            if(vertexCount == 2){
                let deltaX = (vecTemp[1].x - vecTemp[0].x) * (canvasWidth/canvasHeight);
                let deltaY = (vecTemp[1].y - vecTemp[0].y) * (canvasHeight/canvasWidth);
                vertices.push(vecTemp[0].x - deltaY);
                vertices.push(vecTemp[0].y + deltaX);
                vertices.push(vecTemp[1].x - deltaY);
                vertices.push(vecTemp[1].y + deltaX);
                colors.push(
                    0, 0, 0,
                    0, 0, 0,
                    0, 0, 0,
                    0, 0, 0);
                drawObjectInfo.push({
                    "name" : "square",
                    "mode" : gl.TRIANGLE_STRIP,
                    "offset" : offset,
                    "count" : 4
                });
                offset += 4;
                vertexCount = 0;
                vecTemp = [];
            }
        }
        else if (drawRectangle){
            if (vertexCount == 0){
                x1 = x;
                y1 = y;
            }
            if (vertexCount == 1){
                x2 = x;
                y2 = y;
            }
            vertexCount += 1;
            if(vertexCount == 2){
                vertices.push(x1);vertices.push(y2);
                vertices.push(x2);vertices.push(y2);
                vertices.push(x2);vertices.push(y1);
                vertices.push(x1);vertices.push(y1);
                colors.push(
                    0, 0, 0,
                    0, 0, 0,
                    0, 0, 0,
                    0, 0, 0);
                drawObjectInfo.push({
                    "name" : "rectangle",
                    "mode" : gl.TRIANGLE_FAN,
                    "offset" : offset,
                    "count" : 4
                });
                offset += 4;
                vertexCount = 0;
                vecTemp = [];
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

// Save webgl canvas to json file
function save() {
    var json = {};
    json.vertices = vertices;
    json.colors = colors;
    json.drawObjectInfo = drawObjectInfo;

    var jsonString = JSON.stringify(json);
    var blob = new Blob([jsonString], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(url);
}

// load webgl canvas from json file
var input = document.querySelector("#file");

input.addEventListener("change", function (event) {
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
        var json = JSON.parse(event.target.result);
        vertices = json.vertices;
        colors = json.colors;
        drawObjectInfo = json.drawObjectInfo;
        drawObject();
    }
    reader.readAsText(file);
});
