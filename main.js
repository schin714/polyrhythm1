import { color } from 'd3-color';
import './style.css';

const paper = document.querySelector("#paper");
const pen = paper.getContext("2d");

const calculateNextImpactTime = (currentImpactTime, velocity) => {
  return currentImpactTime + (Math.PI / velocity) * 1000;
}

let soundEnabled = false;

document.onvisibilitychange = () => soundEnabled = false;

paper.onclick = () => soundEnabled = !soundEnabled;

let startTime = new Date().getTime();

const arcs = [
  "#11c1e9",
  "#23bae9",
  "#35b2ea",
  "#56a3ea",
  "#679ceb",
  "#7894eb",
  "#898cec",
  "#9a84ec",
  "#ab7cec",
  "#bc75ed",
  "#c66fe5",
  "#cc6cd8",
  "#d069c9",
  "#d465bc",
  "#d962ad",
  "#de5f9f",
  "#e35c92",
  "#e85984",
  "#ec5575",
  "#f15267",
  "#f64f5a"
].map((arcColor, index) => {
  const audio = new Audio(`./sounds/key-${index}.mp3`);

  audio.volume = 0.15;

  const duration = 300;
  const maxLoops = 50;
  const oneFullLoop = 2 * Math.PI,
          numberOfLoops = oneFullLoop * (maxLoops - index);
    const velocity = numberOfLoops / duration

  return {
    arcColor: color(arcColor),
    audio,
    nextImpactTime: calculateNextImpactTime(startTime, velocity),
    velocity,
    currentColor: color(arcColor),
    fading: false,
    fadingStart: 0
  }
});

const draw = () => {
  const currentTime = new Date().getTime(),
        elapsedTime = (currentTime - startTime) / 1000;
  
  paper.width = paper.clientWidth;
  paper.height = paper.clientHeight;
  
  const start = {
    x: paper.width * 0.1,
    y: paper.height * 0.9
  }
  
  const end = {
    x: paper.width * 0.9,
    y: paper.height * 0.9
  }
  
  pen.strokeStyle = "white";
  pen.lineWidth = 6;
  
  pen.beginPath();
  pen.moveTo(start.x, start.y);
  pen.lineTo(end.x, end.y);
  pen.stroke();
  
  const center = {
    x: paper.width * 0.5,
    y: paper.height * 0.9
  }
  
  const length = end.x - start.x;
  const initialArcRadius = length * 0.05;
  const spacing = (length / 2 - initialArcRadius) / arcs.length;
  
  const maxAngle = 2 * Math.PI;
  
  arcs.forEach((arc, index) => {
    const distance = Math.PI + (elapsedTime * arc.velocity),
        modDistance = distance % maxAngle,
        adjustedDistance = modDistance >= Math.PI ? modDistance : maxAngle - modDistance;
    
    const arcRadius = initialArcRadius + (index * spacing);
    const x = center.x + arcRadius * Math.cos(adjustedDistance),
        y = center.y + arcRadius * Math.sin(adjustedDistance);

    // Play the audio
    if(currentTime >= arc.nextImpactTime) {
      if(soundEnabled) {
        arc.audio.play();
      }
      arc.fading = true;
      arc.fadingStart = elapsedTime;

      arc.nextImpactTime = calculateNextImpactTime(arc.nextImpactTime, arc.velocity);
    }

    if(arc.fading && (elapsedTime - arc.fadingStart <= 0.07) ) {
      arc.currentColor = arc.currentColor.brighter();
    }
    else {
      arc.fading = false;
      arc.currentColor = arc.arcColor;
    }
    
    // Draw arc
    pen.beginPath();
    pen.strokeStyle = arc.currentColor;
    pen.arc(center.x, center.y, arcRadius, Math.PI, 2 * Math.PI);
    pen.stroke();

    // Draw circle
    pen.fillStyle = "white";
    pen.strokeStyle = "white";
    pen.beginPath();
    pen.arc(x, y, length * 0.0065, 0, 2 * Math.PI);
    pen.fill();
    pen.stroke();

  });
  
  requestAnimationFrame(draw);
}

draw();