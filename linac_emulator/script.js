// ===========================
// LINAC Console Emulator Logic
// (INCLUDES INTERACTIVE MLC VISUALIZER)
// ===========================

// -----------
// DOM Elements
// (Some are assigned later for MLC)
// -----------

// ... [Unchanged: Most of the LINAC logic up to MLC section, as before] ...

// -----------
// MLC Visualizer Logic
// -----------
const NUM_LEAF_PAIRS = 5;
let leftLeafPositions = [];
let rightLeafPositions = [];
let collimatorAngle = 0; // global collimator angle (shared by visualizer and parameters)
const fieldDisplayContainerSize = 220;
const maxFieldCoordinate = 20.0;
const centerPx = fieldDisplayContainerSize / 2.0;
const scaleFactor = (fieldDisplayContainerSize > 0) ? (fieldDisplayContainerSize / 2.0) / maxFieldCoordinate : 1;

// Create MLC visualizer leaf DOM elements on load
document.addEventListener('DOMContentLoaded', () => {
  // Main MLC visualizer container
  const fieldDisplayContainer = document.getElementById('fieldDisplayContainer');
  // Remove any leaves if reloading
  if (fieldDisplayContainer) {
    // Clean up on reload
    Array.from(fieldDisplayContainer.querySelectorAll('.leaf-pair-container')).forEach(el => el.remove());
    for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
      leftLeafPositions[i] = 5.0;
      rightLeafPositions[i] = 5.0;
      // Create container for this leaf pair
      const pairContainer = document.createElement('div');
      pairContainer.className = 'leaf-pair-container';
      pairContainer.id = `leafPairContainer_${i}`;
      // Outer left leaf (outside field)
      const outerLeftLeaf = document.createElement('div');
      outerLeftLeaf.className = 'leaf-section outer left';
      outerLeftLeaf.id = `outerLeftLeaf_${i}`;
      // Inner left leaf (inside field)
      const innerLeftLeaf = document.createElement('div');
      innerLeftLeaf.className = 'leaf-section inner left';
      innerLeftLeaf.id = `innerLeftLeaf_${i}`;
      // Inner right leaf (inside field)
      const innerRightLeaf = document.createElement('div');
      innerRightLeaf.className = 'leaf-section inner right';
      innerRightLeaf.id = `innerRightLeaf_${i}`;
      // Outer right leaf (outside field)
      const outerRightLeaf = document.createElement('div');
      outerRightLeaf.className = 'leaf-section outer right';
      outerRightLeaf.id = `outerRightLeaf_${i}`;
      // Append in order: outer left, inner left, inner right, outer right
      pairContainer.appendChild(outerLeftLeaf);
      pairContainer.appendChild(innerLeftLeaf);
      pairContainer.appendChild(innerRightLeaf);
      pairContainer.appendChild(outerRightLeaf);
      fieldDisplayContainer.appendChild(pairContainer);
    }
  }
  updateOuterVisualsAndContainers();
  updateInnerLeafVisuals(leftLeafPositions, rightLeafPositions, false);

  // Add listeners for all MLC buttons
  [
    { id: 'presetMatchJaw', fn: () => setLeafPreset('match') },
    { id: 'presetSquare', fn: () => setLeafPreset('square') },
    { id: 'presetOffset', fn: () => setLeafPreset('offset') },
    { id: 'presetBlock', fn: () => setLeafPreset('block') },
    { id: 'presetCshape', fn: () => setLeafPreset('cshape') },
    { id: 'presetDiagonal', fn: () => setLeafPreset('diagonal') },
    { id: 'presetDiagRev', fn: () => setLeafPreset('diagRev') },
    { id: 'presetDiagShallow', fn: () => setLeafPreset('diagShallow') },
    { id: 'animateSquareRandBtn', fn: () => startPresetAnimation('square') },
    { id: 'animateOffsetRandBtn', fn: () => startPresetAnimation('offset') },
    { id: 'animateDiagonalRandBtn', fn: () => startPresetAnimation('diagonal') },
    { id: 'slidingWindowBtn', fn: startSlidingWindowDemo },
    { id: 'imrtDemoBtn', fn: startImrtDemo }
  ].forEach(({ id, fn }) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', fn);
  });
});

// --- Helper Functions (MLC) ---
function getFieldDimensionsPx() {
  const leftPx = centerPx - (jawX1 * scaleFactor);
  const rightPx = centerPx + (jawX2 * scaleFactor);
  const topPx = centerPx - (jawY2 * scaleFactor);
  const bottomPx = centerPx + (jawY1 * scaleFactor);
  const widthPx = Math.max(0, rightPx - leftPx);
  const heightPx = Math.max(0, bottomPx - topPx);
  return { leftPx, topPx, widthPx, heightPx };
}
function updateOuterVisualsAndContainers() {
  const fieldRectEl = document.getElementById('fieldDisplayRect');
  if (!fieldRectEl) return;
  document.getElementById('control-jawX1').textContent = jawX1.toFixed(1);
  document.getElementById('control-jawX2').textContent = jawX2.toFixed(1);
  document.getElementById('control-jawY1').textContent = jawY1.toFixed(1);
  document.getElementById('control-jawY2').textContent = jawY2.toFixed(1);
  document.getElementById('jawX1').textContent = jawX1.toFixed(1);
  document.getElementById('jawX2').textContent = jawX2.toFixed(1);
  document.getElementById('jawY1').textContent = jawY1.toFixed(1);
  document.getElementById('jawY2').textContent = jawY2.toFixed(1);
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
}
function updateInnerLeafVisuals(currentLeft, currentRight, disableTransitions = false) {
  const dims = getFieldDimensionsPx();
  if (scaleFactor <= 0 || fieldDisplayContainerSize <= 0 || dims.widthPx < 0 || dims.heightPx < 0) return;
  const leafPairHeight = (NUM_LEAF_PAIRS > 0 && dims.heightPx >= 0) ? (dims.heightPx / NUM_LEAF_PAIRS) : 0;
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    const innerLeftEl = document.getElementById(`innerLeftLeaf_${i}`);
    const innerRightEl = document.getElementById(`innerRightLeaf_${i}`);
    const pairContainerEl = document.getElementById(`leafPairContainer_${i}`);
    if (!innerLeftEl || !innerRightEl || !pairContainerEl) continue;
    const pairTop = dims.topPx + (i * leafPairHeight);
    pairContainerEl.style.top = `${pairTop}px`;
    pairContainerEl.style.height = `${leafPairHeight}px`;
    let clampedLeft = Math.min(jawX1, currentLeft[i] ?? jawX1);
    let clampedRight = Math.min(jawX2, currentRight[i] ?? jawX2);
    if (!isAnimating && !disableTransitions) {
      leftLeafPositions[i] = clampedLeft; rightLeafPositions[i] = clampedRight;
    }
    const leftTipPx = centerPx - (clampedLeft * scaleFactor);
    const rightTipPx = centerPx + (clampedRight * scaleFactor);
    const fieldRightEdgePx = dims.leftPx + dims.widthPx;
    innerLeftEl.style.left = `${dims.leftPx}px`;
    innerLeftEl.style.width = `${Math.max(0, leftTipPx - dims.leftPx)}px`;
    innerRightEl.style.left = `${rightTipPx}px`;
    innerRightEl.style.width = `${Math.max(0, fieldRightEdgePx - rightTipPx)}px`;
    if (disableTransitions) {
      innerLeftEl.classList.remove('inner'); innerRightEl.classList.remove('inner');
    } else {
      innerLeftEl.classList.add('inner'); innerRightEl.classList.add('inner');
    }
  }
}

// --- Preset Calculation & Setting ---
function calculatePresetPositions(presetType) {
  const targetLeft = []; const targetRight = [];
  const squareSizeCm = 4; const offsetPosCm = 2; const blockPosCm = 1;
  const cShapeInner = 3, cShapeOuter = 8;
  const diagStep = (jawX1 + jawX2 > 0) ? (jawX1 + jawX2) / Math.max(1, NUM_LEAF_PAIRS - 1) : 1;
  const minGap = 0.5;
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    let left, right;
    switch (presetType) {
      case 'match': left = jawX1; right = jawX2; break;
      case 'square': left = squareSizeCm; right = squareSizeCm; break;
      case 'offset': left = jawX1; right = offsetPosCm; break;
      case 'block': left = blockPosCm; right = blockPosCm; break;
      case 'cshape':
        if (i === 0 || i === NUM_LEAF_PAIRS - 1) { left = cShapeOuter; right = cShapeOuter; }
        else { left = cShapeInner; right = cShapeOuter; }
        break;
      case 'diagonal': {
        let l = jawX1 - (i * diagStep * 0.5);
        let r = jawX2 - ((NUM_LEAF_PAIRS - 1 - i) * diagStep * 0.5);
        if (l + r < minGap) { const adj = (minGap - (l + r)) / 2; l -= adj; r -= adj; }
        left = l; right = r;
        break;
      }
      case 'diagRev': {
        let l = jawX1 - ((NUM_LEAF_PAIRS - 1 - i) * diagStep * 0.5);
        let r = jawX2 - (i * diagStep * 0.5);
        if (l + r < minGap) { const adj = (minGap - (l + r)) / 2; l -= adj; r -= adj; }
        left = l; right = r;
        break;
      }
      case 'diagShallow': {
        let m = 0.25;
        let l = jawX1 - (i * diagStep * m);
        let r = jawX2 - ((NUM_LEAF_PAIRS - 1 - i) * diagStep * m);
        if (l + r < minGap) { const adj = (minGap - (l + r)) / 2; l -= adj; r -= adj; }
        left = l; right = r;
        break;
      }
      default: left = jawX1; right = jawX2;
    }
    targetLeft[i] = Math.min(jawX1, Math.max(0, left ?? jawX1));
    targetRight[i] = Math.min(jawX2, Math.max(0, right ?? jawX2));
  }
  return { targetLeft, targetRight };
}
function setLeafPreset(presetType) {
  stopAllAnimations();
  const { targetLeft, targetRight } = calculatePresetPositions(presetType);
  leftLeafPositions = targetLeft;
  rightLeafPositions = targetRight;
  updateOuterVisualsAndContainers();
  updateInnerLeafVisuals(leftLeafPositions, rightLeafPositions, false);
}

// --- Animation Control ---
let isAnimating = false;
let currentAnimationFrameId = null;
let animStartTime = 0;
let animType = 'NONE';
let animStartLeft = [], animStartRight = [], animTargetLeft = [], animTargetRight = [], animDurations = [];
let currentAnimatingButton = null;
function stopAllAnimations() {
  if (isAnimating) {
    cancelAnimationFrame(currentAnimationFrameId); currentAnimationFrameId = null; isAnimating = false; animType = 'NONE';
    if(currentAnimatingButton) { currentAnimatingButton.classList.remove('animating'); }
    ['slidingWindowBtn','animateSquareRandBtn','animateOffsetRandBtn','animateDiagonalRandBtn','imrtDemoBtn'].forEach(id => {
      const btn = document.getElementById(id); if(btn) btn.textContent = btn.getAttribute('data-label') || btn.textContent.replace(/Stop.*/,'Demo');
      if(btn) btn.classList.remove('animating');
    });
    currentAnimatingButton = null;
    updateOuterVisualsAndContainers();
    updateInnerLeafVisuals(leftLeafPositions, rightLeafPositions, false);
  }
}
function lerp(start, end, t) { return start * (1 - t) + end * t; }
function startSlidingWindowDemo() {
  if (isAnimating) { stopAllAnimations(); return; }
  isAnimating = true; animType = 'SLIDING'; currentAnimatingButton = document.getElementById('slidingWindowBtn');
  currentAnimatingButton.classList.add('animating');
  currentAnimatingButton.textContent = "Stop Demo";
  const windowGapCm = 2.0; const duration = 8000;
  const jawFieldStartX = centerPx - (jawX1 * scaleFactor);
  const jawFieldEndX = centerPx + (jawX2 * scaleFactor);
  const windowGapPx = windowGapCm * scaleFactor;
  const targetLeftEndPx = jawFieldEndX;
  const targetRightStartPx = jawFieldStartX + windowGapPx;
  const targetRightEndPx = targetLeftEndPx + windowGapPx;
  animStartTime = performance.now();
  function animationStep(timestamp) {
    if (!isAnimating || animType !== 'SLIDING') return;
    const elapsedTime = timestamp - animStartTime;
    let progress = Math.min(1, elapsedTime / duration);
    let currentLeftTipPx = lerp(jawFieldStartX, targetLeftEndPx, progress);
    let currentRightTipPx = lerp(targetRightStartPx, targetRightEndPx, progress);
    let animLeftPos = Math.max(0, -(currentLeftTipPx - centerPx) / scaleFactor);
    let animRightPos = Math.max(0, (currentRightTipPx - centerPx) / scaleFactor);
    const currentLeft = new Array(NUM_LEAF_PAIRS).fill(animLeftPos);
    const currentRight = new Array(NUM_LEAF_PAIRS).fill(animRightPos);
    updateInnerLeafVisuals(currentLeft, currentRight, true);
    if (progress < 1) {
      currentAnimationFrameId = requestAnimationFrame(animationStep);
    } else {
      stopAllAnimations();
    }
  }
  currentAnimationFrameId = requestAnimationFrame(animationStep);
}
function startPresetAnimation(presetType) {
  if (isAnimating) { stopAllAnimations(); return; }
  isAnimating = true; animType = 'PRESET';
  currentAnimatingButton = document.getElementById(
    presetType === 'square' ? 'animateSquareRandBtn' :
    presetType === 'offset' ? 'animateOffsetRandBtn' :
    presetType === 'diagonal' ? 'animateDiagonalRandBtn' : null
  );
  if(currentAnimatingButton) {
    currentAnimatingButton.classList.add('animating');
    currentAnimatingButton.textContent = "Stop Animation";
  }
  const { targetLeft, targetRight } = calculatePresetPositions(presetType);
  animTargetLeft = targetLeft; animTargetRight = targetRight;
  animStartLeft = [...leftLeafPositions]; animStartRight = [...rightLeafPositions];
  animDurations = [];
  const baseDuration = 2000; const durationVariation = 1000;
  let maxDuration = 0;
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    const duration = baseDuration + (Math.random() * durationVariation);
    animDurations[i] = duration;
    if (duration > maxDuration) maxDuration = duration;
  }
  animStartTime = performance.now();
  function presetAnimationStep(timestamp) {
    if (!isAnimating || animType !== 'PRESET') return;
    const elapsedTime = timestamp - animStartTime;
    let allDone = true;
    const currentLeft = []; const currentRight = [];
    for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
      const pairDuration = animDurations[i];
      const progress = Math.min(1, elapsedTime / pairDuration);
      currentLeft[i] = lerp(animStartLeft[i], animTargetLeft[i], progress);
      currentRight[i] = lerp(animStartRight[i], animTargetRight[i], progress);
      if (progress < 1) allDone = false;
    }
    updateInnerLeafVisuals(currentLeft, currentRight, true);
    if (!allDone) {
      currentAnimationFrameId = requestAnimationFrame(presetAnimationStep);
    } else {
      leftLeafPositions = [...animTargetLeft]; rightLeafPositions = [...animTargetRight];
      stopAllAnimations();
    }
  }
  currentAnimationFrameId = requestAnimationFrame(presetAnimationStep);
}

// --- NEW: IMRT Demo Animation Logic ---
const imrtSequence = ['square', 'offset', 'diagonal', 'cshape', 'block', 'match'];
let currentImrtStep = 0;
let imrtStepDuration = 2500;
function startImrtDemo() {
  if (isAnimating) { stopAllAnimations(); return; }
  isAnimating = true; animType = 'IMRT'; currentImrtStep = 0;
  currentAnimatingButton = document.getElementById('imrtDemoBtn');
  currentAnimatingButton.classList.add('animating');
  currentAnimatingButton.textContent = "Stop IMRT";
  prepareAndRunImrtStep();
}
function prepareAndRunImrtStep() {
  if (currentImrtStep >= imrtSequence.length) { stopAllAnimations(); return; }
  const currentPresetType = imrtSequence[currentImrtStep];
  const { targetLeft, targetRight } = calculatePresetPositions(currentPresetType);
  animTargetLeft = targetLeft; animTargetRight = targetRight;
  animStartLeft = [...leftLeafPositions]; animStartRight = [...rightLeafPositions];
  animStartTime = performance.now();
  currentAnimationFrameId = requestAnimationFrame(imrtAnimationStep);
}
function imrtAnimationStep(timestamp) {
  if (!isAnimating || animType !== 'IMRT') return;
  const elapsedTime = timestamp - animStartTime;
  const progress = Math.min(1, elapsedTime / imrtStepDuration);
  const currentLeft = [];
  const currentRight = [];
  for (let i = 0; i < NUM_LEAF_PAIRS; i++) {
    currentLeft[i] = lerp(animStartLeft[i], animTargetLeft[i], progress);
    currentRight[i] = lerp(animStartRight[i], animTargetRight[i], progress);
  }
  updateInnerLeafVisuals(currentLeft, currentRight, true);
  if (progress >= 1) {
    leftLeafPositions = [...animTargetLeft]; rightLeafPositions = [...animTargetRight];
    currentImrtStep++; prepareAndRunImrtStep();
  } else currentAnimationFrameId = requestAnimationFrame(imrtAnimationStep);
}

// --- END MLC VISUALIZER LOGIC ---

// -----------
// [The rest of your emulator logic (EMR, controls, image alignment, etc.) goes here, unchanged]
// You may need to ensure that jawX1, jawX2, jawY1, jawY2, collimatorAngle, and other state variables
// are kept in sync between the visualizer and your parameter logic.
// -----------
