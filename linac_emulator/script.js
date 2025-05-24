// ===========================
// LINAC Console Emulator Logic (Merged with DRR/MLC Demo)
// ===========================

/* === Global Constants & State === */
const NUM_LEAF_PAIRS = 20; // More leaf pairs for DRR/MLC
const fieldDisplayContainerSize = 400;
const maxJawDistance = 20.0;
const centerPx = fieldDisplayContainerSize / 2.0;
const scaleFactor = fieldDisplayContainerSize / (maxJawDistance * 2);

let jawX1 = 5.0, jawX2 = 5.0, jawY1 = 5.0, jawY2 = 5.0;
let leftLeafPositions = Array(NUM_LEAF_PAIRS).fill(jawX1);
let rightLeafPositions = Array(NUM_LEAF_PAIRS).fill(jawX2);
let collimatorAngle = 0;
let rotatingContainerLeft = 0, rotatingContainerTop = 0;

/* --- Emulator parameters --- */
let selectedEnergy = '6 MV';
let isPrepared = false;
let isBeaming = false;
let isDoorOpen = false;
let deliveredMU = 0;
let setMU = 0;
let gantryAngle = 0;
let couchAngle = 0;
let fieldAdjustmentLocked = false;
let currentLoadedPlan = null;
let loadedFieldIndex = -1;
let overrideActive = false;

/* === DRR/MLC/Field Visualizer DOM === */
let fieldDisplayContainer, rotatingElementsContainer, fieldRectEl;

/* === HTML Control References (set in DOMContentLoaded) === */
let presetMatchJawBtn, presetSquareBtn, presetOffsetBtn, presetBlockBtn, presetCshapeBtn, presetDiagonalBtn, presetDiagRevBtn, presetDiagShallowBtn;
let animateSquareRandBtn, animateOffsetRandBtn, animateDiagonalRandBtn, slidingWindowBtn, imrtDemoBtn, presetMultiBlockBtn;
let collRotateNegBtn, collRotatePosBtn, collimatorDisplay, collimatorDisplay2;
let drrImageSelect;

/* === Utility Functions === */
function roundToDecimalPlace(num, places) { const factor = 10 ** places; return Math.round(num * factor) / factor; }
function lerp(start, end, t) { return start * (1 - t) + end * t; }

function getActualCoords() {
  const actual_x1 = -jawX1, actual_x2 = jawX2, actual_y1 = -jawY1, actual_y2 = jawY2;
  return { actual_x1, actual_x2, actual_y1, actual_y2 };
}
function getFieldDimensionsPx() {
  const { actual_x1, actual_x2, actual_y1, actual_y2 } = getActualCoords();
  const leftPx = centerPx + (actual_x1 * scaleFactor);
  const rightPx = centerPx + (actual_x2 * scaleFactor);
  const topPx = centerPx - (actual_y2 * scaleFactor);
  const bottomPx = centerPx - (actual_y1 * scaleFactor);
  const widthPx = Math.max(0, rightPx - leftPx);
  const heightPx = Math.max(0, bottomPx - topPx);
  return { leftPx, topPx, widthPx, heightPx };
}

/* === Visualizer/DRR UI === */
function updateOuterVisualsAndContainers() {
  if (!fieldRectEl || !rotatingElementsContainer) return;
  document.getElementById('control-jawX1').textContent = jawX1.toFixed(1);
  document.getElementById('control-jawX2').textContent = jawX2.toFixed(1);
  document.getElementById('control-jawY1').textContent = jawY1.toFixed(1);
  document.getElementById('control-jawY2').textContent = jawY2.toFixed(1);
  const { actual_x1, actual_x2, actual_y1, actual_y2 } = getActualCoords();
  document.getElementById('totalFieldX').textContent = (actual_x2 - actual_x1).toFixed(1);
  document.getElementById('totalFieldY').textContent = (actual_y2 - actual_y1).toFixed(1);
  if(collimatorDisplay) collimatorDisplay.textContent = `${collimatorAngle}°`;
  if(collimatorDisplay2) collimatorDisplay2.textContent = `${collimatorAngle}°`;
  const dims = getFieldDimensionsPx();
  fieldRectEl.style.width = `${dims.widthPx}px`;
  fieldRectEl.style.height = `${dims.heightPx}px`;
  fieldRectEl.style.left = `${dims.leftPx}px`;
  fieldRectEl.style.top = `${dims.topPx}px`;
  const leafPairHeight = (NUM_LEAF_PAIRS > 0 && dims.heightPx >= 0) ? (dims.heightPx / NUM_LEAF_PAIRS) : 0;
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    const outerLeftEl = document.getElementById(`outerLeftLeaf_${i}`);
    const outerRightEl = document.getElementById(`outerRightLeaf_${i}`);
    const pairContainerEl = document.getElementById(`leafPairContainer_${i}`);
    if (!outerLeftEl || !outerRightEl || !pairContainerEl) continue;
    const pairTop = dims.topPx + (i * leafPairHeight);
    pairContainerEl.style.top = `${pairTop}px`;
    pairContainerEl.style.height = `${leafPairHeight}px`;
    outerLeftEl.style.left = '0px';
    outerLeftEl.style.width = `${Math.max(0, dims.leftPx)}px`;
    const fieldRightEdgePx = dims.leftPx + dims.widthPx;
    outerRightEl.style.left = `${fieldRightEdgePx}px`;
    outerRightEl.style.width = `${Math.max(0, fieldDisplayContainerSize - fieldRightEdgePx)}px`;
  }
  rotatingElementsContainer.style.transform = `rotate(${collimatorAngle}deg) translate(${rotatingContainerLeft}px, ${rotatingContainerTop}px)`;
}
function updateInnerLeafVisuals(currentLeft, currentRight, disableTransitions = false) {
  const dims = getFieldDimensionsPx();
  if (scaleFactor <= 0 || fieldDisplayContainerSize <= 0 || dims.widthPx < 0 || dims.heightPx < 0) { return; }
  const leafPairHeight = (NUM_LEAF_PAIRS > 0 && dims.heightPx >= 0) ? (dims.heightPx / NUM_LEAF_PAIRS) : 0;
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    const innerLeftEl = document.getElementById(`innerLeftLeaf_${i}`);
    const innerRightEl = document.getElementById(`innerRightLeaf_${i}`);
    const pairContainerEl = document.getElementById(`leafPairContainer_${i}`);
    if (!innerLeftEl || !innerRightEl || !pairContainerEl) continue;
    const pairTop = dims.topPx + (i * leafPairHeight);
    pairContainerEl.style.top = `${pairTop}px`;
    pairContainerEl.style.height = `${leafPairHeight}px`;
    let clampedLeftDist = Math.min(jawX1, currentLeft[i] ?? jawX1);
    let clampedRightDist = Math.min(jawX2, currentRight[i] ?? jawX2);
    if (!disableTransitions) { leftLeafPositions[i] = clampedLeftDist; rightLeafPositions[i] = clampedRightDist; }
    const leftTipPx_relCenter = -(clampedLeftDist * scaleFactor);
    const rightTipPx_relCenter = (clampedRightDist * scaleFactor);
    const leftTipPx_abs = centerPx + leftTipPx_relCenter;
    const rightTipPx_abs = centerPx + rightTipPx_relCenter;
    innerLeftEl.style.left = `${dims.leftPx}px`;
    innerLeftEl.style.width = `${Math.max(0, leftTipPx_abs - dims.leftPx)}px`;
    const fieldRightEdgePx = dims.leftPx + dims.widthPx;
    innerRightEl.style.left = `${rightTipPx_abs}px`;
    innerRightEl.style.width = `${Math.max(0, fieldRightEdgePx - rightTipPx_abs)}px`;
    innerLeftEl.style.transition = disableTransitions ? 'none' : 'width 1s ease-in-out, left 1s ease-in-out';
    innerRightEl.style.transition = disableTransitions ? 'none' : 'width 1s ease-in-out, left 1s ease-in-out';
    innerLeftEl.classList.add('inner'); innerRightEl.classList.add('inner');
  }
}
function handleImageChange() {
  if (!drrImageSelect || !fieldDisplayContainer) return;
  const imageUrl = drrImageSelect.value;
  if (imageUrl) {
    fieldDisplayContainer.style.backgroundImage = `url('${imageUrl}')`;
    fieldDisplayContainer.style.backgroundColor = '#111';
  } else {
    fieldDisplayContainer.style.backgroundImage = 'none';
    fieldDisplayContainer.style.backgroundColor = '#111';
  }
}

/* === Field/MLC Control Logic === */
function changeFieldSize(jawLabel, delta) {
  let controlDisplayId = 'control-jaw' + jawLabel;
  let currentValue = 0;
  const step = 0.5;
  delta = Math.sign(delta) * step;
  const minDistance = 0.1;
  switch(jawLabel) {
    case 'X1': jawX1 = Math.min(maxJawDistance, Math.max(minDistance, roundToDecimalPlace(jawX1 + delta, 1))); currentValue = jawX1; break;
    case 'X2': jawX2 = Math.min(maxJawDistance, Math.max(minDistance, roundToDecimalPlace(jawX2 + delta, 1))); currentValue = jawX2; break;
    case 'Y1': jawY1 = Math.min(maxJawDistance, Math.max(minDistance, roundToDecimalPlace(jawY1 + delta, 1))); currentValue = jawY1; break;
    case 'Y2': jawY2 = Math.min(maxJawDistance, Math.max(minDistance, roundToDecimalPlace(jawY2 + delta, 1))); currentValue = jawY2; break;
    default: return;
  }
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    leftLeafPositions[i] = jawX1;
    rightLeafPositions[i] = jawX2;
  }
  document.getElementById(controlDisplayId).textContent = currentValue.toFixed(1);
  updateOuterVisualsAndContainers();
  updateInnerLeafVisuals(leftLeafPositions, rightLeafPositions, false);
}

/* --- Collimator --- */
function changeCollimator(delta) {
  collimatorAngle = (collimatorAngle + delta + 360) % 360;
  if (collimatorDisplay) collimatorDisplay.textContent = `${collimatorAngle}°`;
  if (collimatorDisplay2) collimatorDisplay2.textContent = `${collimatorAngle}°`;
  updateOuterVisualsAndContainers();
}

/* --- Leaf Presets --- */
function calculatePresetPositions(presetType) {
  const targetLeft = [];
  const targetRight = [];
  const currentJawX1 = jawX1;
  const currentJawX2 = jawX2;
  const currentJawY1 = jawY1;
  const currentJawY2 = jawY2;
  const totalWidth = currentJawX1 + currentJawX2;
  const squareDist = Math.min(currentJawX1, currentJawX2, currentJawY1, currentJawY2, 4.0);
  const offsetDistR = Math.min(currentJawX2, 2.0);
  const blockDist = Math.min(currentJawX1, currentJawX2, 1.0);
  const cShapeInnerDist = Math.min(currentJawX1, currentJawX2, 3.0);
  const cShapeOuterDist = Math.min(currentJawX1, currentJawX2, 8.0);
  const diagStep = (totalWidth > 0) ? totalWidth / Math.max(1, NUM_LEAF_PAIRS - 1) : 0;
  const minGap = 0.5;

  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    let leftDist, rightDist;
    switch (presetType) {
      case 'match': leftDist = currentJawX1; rightDist = currentJawX2; break;
      case 'square': leftDist = squareDist; rightDist = squareDist; break;
      case 'offset': leftDist = currentJawX1; rightDist = offsetDistR; break;
      case 'block': leftDist = blockDist; rightDist = blockDist; break;
      case 'cshape': {
        const numEnds = Math.max(1, Math.floor(NUM_LEAF_PAIRS / 4));
        if (i < numEnds || i >= NUM_LEAF_PAIRS - numEnds) { leftDist = cShapeOuterDist; rightDist = cShapeOuterDist; }
        else { leftDist = cShapeInnerDist; rightDist = cShapeOuterDist; }
        break;
      }
      case 'diagonal': {
        let l_target = currentJawX1 - (i / Math.max(1, NUM_LEAF_PAIRS - 1)) * totalWidth;
        let r_target = currentJawX2 - ((NUM_LEAF_PAIRS - 1 - i) / Math.max(1, NUM_LEAF_PAIRS - 1)) * totalWidth;
        leftDist = Math.max(0, -l_target);
        rightDist = Math.max(0, r_target);
        if (leftDist + rightDist < minGap) {
          const adjustment = (minGap - (leftDist + rightDist)) / 2;
          leftDist += adjustment;
          rightDist += adjustment;
        }
        break;
      }
      case 'diagRev': {
        let l_target = currentJawX1 - ((NUM_LEAF_PAIRS - 1 - i) / Math.max(1, NUM_LEAF_PAIRS - 1)) * totalWidth;
        let r_target = currentJawX2 - (i / Math.max(1, NUM_LEAF_PAIRS - 1)) * totalWidth;
        leftDist = Math.max(0, -l_target);
        rightDist = Math.max(0, r_target);
        if (leftDist + rightDist < minGap) {
          const adjustment = (minGap - (leftDist + rightDist)) / 2;
          leftDist += adjustment;
          rightDist += adjustment;
        }
        break;
      }
      case 'diagShallow': {
        let m = 0.3;
        let l_target = currentJawX1 - (i / Math.max(1, NUM_LEAF_PAIRS - 1)) * totalWidth * m;
        let r_target = currentJawX2 - ((NUM_LEAF_PAIRS - 1 - i) / Math.max(1, NUM_LEAF_PAIRS - 1)) * totalWidth * m;
        leftDist = Math.max(0, -l_target);
        rightDist = Math.max(0, r_target);
        if (leftDist + rightDist < minGap) {
          const adjustment = (minGap - (leftDist + rightDist)) / 2;
          leftDist += adjustment;
          rightDist += adjustment;
        }
        break;
      }
      case 'multiBlock': {
        // You can implement more advanced pattern here if desired
        leftDist = (i % 4 < 2) ? currentJawX1 : blockDist * 1.2;
        rightDist = (i % 4 < 2) ? currentJawX2 : blockDist * 1.2;
        break;
      }
      default: leftDist = currentJawX1; rightDist = currentJawX2;
    }
    targetLeft[i] = Math.min(currentJawX1, Math.max(0, leftDist ?? currentJawX1));
    targetRight[i] = Math.min(currentJawX2, Math.max(0, rightDist ?? currentJawX2));
  }
  return { targetLeft, targetRight };
}
function setLeafPreset(presetType) {
  const { targetLeft, targetRight } = calculatePresetPositions(presetType);
  leftLeafPositions = targetLeft;
  rightLeafPositions = targetRight;
  updateOuterVisualsAndContainers();
  updateInnerLeafVisuals(leftLeafPositions, rightLeafPositions, false);
}

/* === Animation Logic (shortened: DRR demo, not full IMRT logic here) === */
function stopAllAnimations() {}
function startSlidingWindowDemo() {}
function startPresetAnimation(presetType) {}
function startImrtDemo() {}

/* === Initialization & Event Listeners === */
document.addEventListener('DOMContentLoaded', () => {
  // Assign DOM element references
  fieldDisplayContainer = document.getElementById('fieldDisplayContainer');
  rotatingElementsContainer = document.getElementById('rotatingElementsContainer');
  fieldRectEl = document.getElementById('fieldDisplayRect');
  presetMatchJawBtn = document.getElementById('presetMatchJaw');
  presetSquareBtn = document.getElementById('presetSquare');
  presetOffsetBtn = document.getElementById('presetOffset');
  presetBlockBtn = document.getElementById('presetBlock');
  presetCshapeBtn = document.getElementById('presetCshape');
  presetDiagonalBtn = document.getElementById('presetDiagonal');
  presetDiagRevBtn = document.getElementById('presetDiagRev');
  presetDiagShallowBtn = document.getElementById('presetDiagShallow');
  animateSquareRandBtn = document.getElementById('animateSquareRandBtn');
  animateOffsetRandBtn = document.getElementById('animateOffsetRandBtn');
  animateDiagonalRandBtn = document.getElementById('animateDiagonalRandBtn');
  slidingWindowBtn = document.getElementById('slidingWindowBtn');
  imrtDemoBtn = document.getElementById('imrtDemoBtn');
  presetMultiBlockBtn = document.getElementById('presetMultiBlock');
  collRotateNegBtn = document.getElementById('collRotateNegBtn');
  collRotatePosBtn = document.getElementById('collRotatePosBtn');
  collimatorDisplay = document.getElementById('collimatorDisplay');
  collimatorDisplay2 = document.getElementById('collimatorDisplay2');
  drrImageSelect = document.getElementById('drrImageSelect');

  // Create Leaf Pair HTML elements and append
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    leftLeafPositions[i] = jawX1; rightLeafPositions[i] = jawX2;
    const pairContainer = document.createElement('div'); pairContainer.className = 'leaf-pair-container'; pairContainer.id = `leafPairContainer_${i}`;
    const outerLeftLeaf = document.createElement('div'); outerLeftLeaf.className = 'leaf-section outer left'; outerLeftLeaf.id = `outerLeftLeaf_${i}`;
    const innerLeftLeaf = document.createElement('div'); innerLeftLeaf.className = 'leaf-section inner left'; innerLeftLeaf.id = `innerLeftLeaf_${i}`;
    const innerRightLeaf = document.createElement('div'); innerRightLeaf.className = 'leaf-section inner right'; innerRightLeaf.id = `innerRightLeaf_${i}`;
    const outerRightLeaf = document.createElement('div'); outerRightLeaf.className = 'leaf-section outer right'; outerRightLeaf.id = `outerRightLeaf_${i}`;
    pairContainer.appendChild(outerLeftLeaf); pairContainer.appendChild(innerLeftLeaf); pairContainer.appendChild(innerRightLeaf); pairContainer.appendChild(outerRightLeaf);
    rotatingElementsContainer.appendChild(pairContainer);
  }

  // DRR image
  if (drrImageSelect) {
    drrImageSelect.addEventListener('change', handleImageChange);
    handleImageChange();
  }

  // Drag logic for rotatingElementsContainer
  let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
  rotatingElementsContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    rotatingElementsContainer.classList.add('dragging');
    dragOffsetX = e.clientX - rotatingElementsContainer.getBoundingClientRect().left;
    dragOffsetY = e.clientY - rotatingElementsContainer.getBoundingClientRect().top;
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let x = e.clientX - dragOffsetX;
    let y = e.clientY - dragOffsetY;
    const containerRect = fieldDisplayContainer.getBoundingClientRect();
    const draggableRect = rotatingElementsContainer.getBoundingClientRect();
    const minX = 0, maxX = containerRect.width - draggableRect.width;
    const minY = 0, maxY = containerRect.height - draggableRect.height;
    x = Math.max(minX, Math.min(maxX, x));
    y = Math.max(minY, Math.min(maxY, y));
    rotatingElementsContainer.style.left = `${x}px`;
    rotatingElementsContainer.style.top = `${y}px`;
    rotatingContainerLeft = x;
    rotatingContainerTop = y;
  });
  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    rotatingElementsContainer.classList.remove('dragging');
  });

  updateOuterVisualsAndContainers();
  updateInnerLeafVisuals(leftLeafPositions, rightLeafPositions, false);

  // Preset Buttons
  presetMatchJawBtn?.addEventListener('click', () => setLeafPreset('match'));
  presetSquareBtn?.addEventListener('click', () => setLeafPreset('square'));
  presetOffsetBtn?.addEventListener('click', () => setLeafPreset('offset'));
  presetBlockBtn?.addEventListener('click', () => setLeafPreset('block'));
  presetCshapeBtn?.addEventListener('click', () => setLeafPreset('cshape'));
  presetDiagonalBtn?.addEventListener('click', () => setLeafPreset('diagonal'));
  presetDiagRevBtn?.addEventListener('click', () => setLeafPreset('diagRev'));
  presetDiagShallowBtn?.addEventListener('click', () => setLeafPreset('diagShallow'));
  presetMultiBlockBtn?.addEventListener('click', () => setLeafPreset('multiBlock'));

  // Animation Buttons
  slidingWindowBtn?.addEventListener('click', startSlidingWindowDemo);
  animateSquareRandBtn?.addEventListener('click', () => startPresetAnimation('square'));
  animateOffsetRandBtn?.addEventListener('click', () => startPresetAnimation('offset'));
  animateDiagonalRandBtn?.addEventListener('click', () => startPresetAnimation('diagonal'));
  imrtDemoBtn?.addEventListener('click', startImrtDemo);

  // Collimator Buttons
  collRotateNegBtn?.addEventListener('click', () => changeCollimator(-5));
  collRotatePosBtn?.addEventListener('click', () => changeCollimator(5));
});
