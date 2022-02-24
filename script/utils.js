function getMousePosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: ((event.clientX - rect.left) / (canvas.width)) * 2 -1,
        y: -((event.clientY - rect.top) / (canvas.height)) * 2 +1
    };
}

function hexToRgbNew(hex) {
  var arrBuffer = new ArrayBuffer(4);
  var dataView = new DataView(arrBuffer);
  dataView.setUint32(0,parseInt(hex, 16),false);
  var arrByte = new Uint8Array(arrBuffer);

  return [arrByte[1], arrByte[2], arrByte[3]]
}

const canvasWidth = 1000
const canvasHeight = 480
const middleX = canvasWidth/2
const middleY = canvasHeight/2