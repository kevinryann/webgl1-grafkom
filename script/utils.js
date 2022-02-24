function getMousePosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: ((event.clientX - rect.left) / (canvas.width)) * 2 -1,
        y: -((event.clientY - rect.top) / (canvas.height)) * 2 +1
    };
}

const canvasWidth = 1000
const canvasHeight = 480
const middleX = canvasWidth/2
const middleY = canvasHeight/2