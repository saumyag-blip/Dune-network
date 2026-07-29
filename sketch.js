// ---------------------------------------------------------------
// Radial hub-and-spoke network for the "Dune" tanker dataset.
// Line width = barrels transferred. Particle density = transfer count.
// ---------------------------------------------------------------

let nodes = [];          // { name, transfers, barrels, x, y, angle }
let sortMode = "volume"; // "volume" | "transfers"
let isPaused = false;
let hoveredNode = null;

let cw, ch;              // canvas width/height (css pixels)
let holder;

const HUB_RADIUS = 34;
const NODE_RADIUS = 13;

function setup() {
  holder = document.getElementById("canvas-holder");
  cw = holder.clientWidth;
  ch = Math.max(460, Math.min(620, cw * 0.62));

  const c = createCanvas(cw, ch);
  c.parent("canvas-holder");
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));

  buildLayout();
  setupControls();
  textFont("IBM Plex Mono");
}

function windowResized() {
  cw = holder.clientWidth;
  ch = Math.max(460, Math.min(620, cw * 0.62));
  resizeCanvas(cw, ch);
  buildLayout();
}

// Sort vessels by the active metric, then place them evenly around a circle.
function buildLayout() {
  const sorted = [...VESSELS].sort((a, b) =>
    sortMode === "volume" ? b.barrels - a.barrels : b.transfers - a.transfers
  );

  const cx = cw / 2;
  const cy = ch / 2;
  const orbit = Math.min(cw, ch) * 0.36;

  nodes = sorted.map((v, i) => {
    const angle = -HALF_PI + (i / sorted.length) * TWO_PI;
    return {
      ...v,
      angle,
      x: cx + orbit * cos(angle),
      y: cy + orbit * sin(angle),
      particles: makeParticles(v.transfers)
    };
  });

  nodesCX = cx;
  nodesCY = cy;
}

let nodesCX, nodesCY;

function makeParticles(transferCount) {
  // more transfers -> more concurrent particles on that spoke
  const count = constrain(Math.round(transferCount * 1.6), 2, 10);
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({ t: random(1), speed: random(0.0035, 0.0065) });
  }
  return arr;
}

function draw() {
  clear();
  drawBackground();

  const maxBarrels = Math.max(...VESSELS.map(v => v.barrels));
  const minBarrels = Math.min(...VESSELS.map(v => v.barrels));

  // links
  for (const n of nodes) {
    const w = map(n.barrels, minBarrels, maxBarrels, 1.6, 9);
    const isHover = hoveredNode === n;

    stroke(201, 154, 74, isHover ? 230 : 130);
    strokeWeight(isHover ? w + 1.5 : w);
    line(nodesCX, nodesCY, n.x, n.y);

    // flowing particles
    if (!isPaused) {
      for (const p of n.particles) {
        p.t += p.speed;
        if (p.t > 1) p.t = 0;
      }
    }
    noStroke();
    for (const p of n.particles) {
      const px = lerp(nodesCX, n.x, p.t);
      const py = lerp(nodesCY, n.y, p.t);
      const glow = isHover ? 255 : 200;
      fill(232, 194, 122, glow);
      circle(px, py, isHover ? 5 : 3.6);
    }
  }

  // hub
  noStroke();
  for (let r = HUB_RADIUS + 18; r > HUB_RADIUS; r -= 3) {
    fill(201, 154, 74, 10);
    circle(nodesCX, nodesCY, r * 2);
  }
  fill(20, 24, 30);
  stroke(201, 154, 74);
  strokeWeight(1.5);
  circle(nodesCX, nodesCY, HUB_RADIUS * 2);
  noStroke();
  fill(232, 194, 122);
  textAlign(CENTER, CENTER);
  textSize(11);
  textStyle(BOLD);
  text(HUB_NAME, nodesCX, nodesCY);

  // vessel nodes
  hoveredNode = null;
  for (const n of nodes) {
    const isHover = dist(mouseX, mouseY, n.x, n.y) < NODE_RADIUS + 6;
    if (isHover) hoveredNode = n;

    stroke(201, 154, 74);
    strokeWeight(1.2);
    fill(isHover ? 30 : 20, 24, 30);
    circle(n.x, n.y, NODE_RADIUS * 2 * (isHover ? 1.15 : 1));

    noStroke();
    fill(233, 228, 216);
    textAlign(CENTER, CENTER);
    textSize(9);
    textStyle(NORMAL);

    // label placed outside the node, oriented away from hub
    const lx = n.x + cos(n.angle) * (NODE_RADIUS + 14);
    const ly = n.y + sin(n.angle) * (NODE_RADIUS + 14);
    textAlign(cos(n.angle) > 0.15 ? LEFT : (cos(n.angle) < -0.15 ? RIGHT : CENTER), CENTER);
    text(n.name, lx, ly);
  }

  updateTooltip();
}

function drawBackground() {
  noStroke();
  fill(20, 25, 32);
  rect(0, 0, cw, ch);
  // faint concentric rings for a "radar" feel
  stroke(35, 42, 52);
  strokeWeight(1);
  noFill();
  for (let r = 1; r <= 3; r++) {
    circle(nodesCX || cw / 2, nodesCY || ch / 2, (Math.min(cw, ch) * 0.36 * 2 * r) / 3);
  }
}

function updateTooltip() {
  const tip = document.getElementById("tooltip");
  if (hoveredNode) {
    tip.classList.remove("hidden");
    tip.style.left = (holder.offsetLeft + hoveredNode.x) + "px";
    tip.style.top = (holder.offsetTop + hoveredNode.y) + "px";
    tip.innerHTML =
      `<span class="t-name">${hoveredNode.name}</span><br>` +
      `${hoveredNode.transfers} transfers · ${hoveredNode.barrels.toLocaleString()} bbl`;
  } else {
    tip.classList.add("hidden");
  }
}

function setupControls() {
  const volBtn = document.getElementById("sortVolume");
  const trBtn = document.getElementById("sortTransfers");
  const flowBtn = document.getElementById("toggleFlow");

  volBtn.addEventListener("click", () => {
    sortMode = "volume";
    volBtn.classList.add("active");
    trBtn.classList.remove("active");
    buildLayout();
  });

  trBtn.addEventListener("click", () => {
    sortMode = "transfers";
    trBtn.classList.add("active");
    volBtn.classList.remove("active");
    buildLayout();
  });

  flowBtn.addEventListener("click", () => {
    isPaused = !isPaused;
    flowBtn.textContent = isPaused ? "RESUME FLOW" : "PAUSE FLOW";
    flowBtn.classList.toggle("active", isPaused);
  });
}
