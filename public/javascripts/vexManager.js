const { Renderer, Stave, StaveNote, Voice, Formatter, StaveConnector } = Vex.Flow;

const NOTE_POOL = ['b3','c4','d4','e4','f4','g4','a4','b4','c5','d5','e5','f5','g5','a5','b5'];
const BEATS_PER_MEASURE = 4;
const MEASURES_PER_STAFF = 10;
const DURATION_BEATS = { 'w': 4, 'h': 2, 'q': 1, '8': 0.5, '16': 0.25 };

// Space reserved in the first measure for clef + time signature
const FIRST_MEASURE_EXTRA = 60;

let allNotes = [];
let allClefs = [];
let allDurations = [];
let notesPerMeasure = BEATS_PER_MEASURE; // recalculated in generateGame
let staffData = [];
let currentStaffIdx = 0;

function randomNote() {
  return NOTE_POOL[Math.floor(Math.random() * NOTE_POOL.length)];
}

function randomClef(trebleRatio) {
  return Math.random() > trebleRatio ? 'treble' : 'bass';
}

function notaDesplazada(nota) {
  const notas = ['c','d','e','f','g','a','b'];
  return notas[(notas.indexOf(nota) + 2) % notas.length];
}

function getOctave(note, clef) {
  if (clef === 'treble') return note[1];
  const map = {
    'b5':4,'a5':4,
    'g5':3,'f5':3,'e5':3,'d5':3,'c5':3,'b4':3,'a4':3,
    'g4':2,'f4':2,'e4':2,'d4':2,'c4':2,'b3':2
  };
  return map[note] || 3;
}

function getNote(note, clef) {
  return clef === 'bass' ? notaDesplazada(note[0]) : note[0];
}

function toVexKey(note, clef) {
  if (clef === 'treble') return note[0] + '/' + note[1];
  return notaDesplazada(note[0]) + '/' + getOctave(note, 'bass');
}

function generateGame(count, clefProb, duration = 'q') {
  allNotes = Array.from({ length: count }, randomNote);
  allClefs = Array.from({ length: count }, () => randomClef(clefProb));
  allDurations = Array.from({ length: count }, () => duration);
  notesPerMeasure = Math.round(BEATS_PER_MEASURE / (DURATION_BEATS[duration] || 1));
}

function buildAndRender() {
  const parent = document.getElementById('canvasParent');
  parent.innerHTML = '';
  parent.style.overflowY = 'auto';
  parent.style.maxHeight = '260px';
  staffData = [];
  currentStaffIdx = 0;

  const total = allNotes.length;
  const notesPerStaff = notesPerMeasure * MEASURES_PER_STAFF;
  const end = Math.min(notesPerStaff, total);

  const div = document.createElement('div');
  div.className = 'staff-section';
  parent.appendChild(div);

  const noteEls = renderStaff(div, 0, end);
  staffData.push({ div, noteEls, start: 0, end });
  noteEls.forEach(el => { if (el) el.style.opacity = '0'; });
}

function renderStaff(container, start, end) {
  const notes = allNotes.slice(start, end);
  const clefs = allClefs.slice(start, end);
  const count = notes.length;
  const numMeasures = Math.ceil(count / notesPerMeasure);

  const parentEl = document.getElementById('canvasParent');
  const parentWidth = parentEl ? parentEl.offsetWidth : 0;
  const width = parentWidth > 0 ? parentWidth : Math.floor(window.innerWidth * 0.88);

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, 250);
  const ctx = renderer.getContext();

  // First measure is wider to accommodate clef + time signature
  const totalStaveWidth = width - 20;
  const firstMeasureWidth = Math.floor(totalStaveWidth / numMeasures) + FIRST_MEASURE_EXTRA;
  const otherMeasureWidth = numMeasures > 1
    ? Math.floor((totalStaveWidth - firstMeasureWidth) / (numMeasures - 1))
    : 0;

  const trebleStaves = [];
  const bassStaves = [];
  let xOffset = 10;

  for (let m = 0; m < numMeasures; m++) {
    const mWidth = m === 0 ? firstMeasureWidth : otherMeasureWidth;
    const treble = new Stave(xOffset, 10, mWidth);
    const bass = new Stave(xOffset, 130, mWidth);

    if (m === 0) {
      treble.addClef('treble').addTimeSignature('4/4');
      bass.addClef('bass').addTimeSignature('4/4');
    }

    treble.setContext(ctx).draw();
    bass.setContext(ctx).draw();
    trebleStaves.push(treble);
    bassStaves.push(bass);
    xOffset += mWidth;
  }

  // Brace and left connector only on the first measure
  new StaveConnector(trebleStaves[0], bassStaves[0])
    .setType(StaveConnector.type.BRACE).setContext(ctx).draw();
  new StaveConnector(trebleStaves[0], bassStaves[0])
    .setType(StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
  // Right connector on the last measure
  new StaveConnector(trebleStaves[numMeasures - 1], bassStaves[numMeasures - 1])
    .setType(StaveConnector.type.SINGLE_RIGHT).setContext(ctx).draw();

  // Draw one voice pair per measure
  for (let m = 0; m < numMeasures; m++) {
    const mStart = m * notesPerMeasure;
    const mEnd = Math.min(mStart + notesPerMeasure, count);
    const trebleTickables = [];
    const bassTickables = [];

    for (let i = mStart; i < mEnd; i++) {
      const clef = clefs[i];
      const key = toVexKey(notes[i], clef);
      const dur = allDurations[start + i];
      if (clef === 'treble') {
        trebleTickables.push(new StaveNote({ clef: 'treble', keys: [key], duration: dur }));
        bassTickables.push(new StaveNote({ clef: 'bass', keys: ['d/3'], duration: dur, type: 'r' }));
      } else {
        trebleTickables.push(new StaveNote({ clef: 'treble', keys: ['b/4'], duration: dur, type: 'r' }));
        bassTickables.push(new StaveNote({ clef: 'bass', keys: [key], duration: dur }));
      }
    }

    // Pad the last measure with rests if it's not a full measure
    while (trebleTickables.length < notesPerMeasure) {
      const padDur = allDurations[start + mStart] || 'q';
      trebleTickables.push(new StaveNote({ clef: 'treble', keys: ['b/4'], duration: padDur, type: 'r' }));
      bassTickables.push(new StaveNote({ clef: 'bass', keys: ['d/3'], duration: padDur, type: 'r' }));
    }

    const trebleVoice = new Voice({ numBeats: BEATS_PER_MEASURE, beatValue: 4 });
    trebleVoice.addTickables(trebleTickables);
    const bassVoice = new Voice({ numBeats: BEATS_PER_MEASURE, beatValue: 4 });
    bassVoice.addTickables(bassTickables);

    const mWidth = m === 0 ? firstMeasureWidth : otherMeasureWidth;
    const formatWidth = mWidth - (m === 0 ? FIRST_MEASURE_EXTRA + 20 : 20);

    new Formatter()
      .joinVoices([trebleVoice, bassVoice])
      .format([trebleVoice, bassVoice], formatWidth);

    trebleVoice.draw(ctx, trebleStaves[m]);
    bassVoice.draw(ctx, bassStaves[m]);
  }

  // Map note elements from DOM.
  // Draw order per measure: trebleVoice first, then bassVoice.
  // So groups: [m0_treble xN, m0_bass xN, m1_treble xN, m1_bass xN, ...]  where N = notesPerMeasure
  const GROUPS_PER_MEASURE = notesPerMeasure * 2;
  const allGroups = Array.from(container.querySelectorAll('.vf-stavenote'));

  const noteEls = [];
  for (let i = 0; i < count; i++) {
    const m = Math.floor(i / notesPerMeasure);
    const b = i % notesPerMeasure;
    const trebleIdx = m * GROUPS_PER_MEASURE + b;
    const bassIdx   = m * GROUPS_PER_MEASURE + notesPerMeasure + b;

    const isTreble = clefs[i] === 'treble';
    const noteEl = isTreble ? allGroups[trebleIdx] : allGroups[bassIdx];
    const restEl = isTreble ? allGroups[bassIdx]   : allGroups[trebleIdx];

    if (restEl) restEl.style.display = 'none';
    noteEls.push(noteEl || null);
  }

  // Hide padding rests in the last measure if it's incomplete
  const lastM = numMeasures - 1;
  const lastMActual = count - lastM * notesPerMeasure;
  for (let b = lastMActual; b < notesPerMeasure; b++) {
    const trebleIdx = lastM * GROUPS_PER_MEASURE + b;
    const bassIdx   = lastM * GROUPS_PER_MEASURE + notesPerMeasure + b;
    if (allGroups[trebleIdx]) allGroups[trebleIdx].style.display = 'none';
    if (allGroups[bassIdx])   allGroups[bassIdx].style.display = 'none';
  }

  return noteEls;
}

function advanceNote(idx) {
  const notesPerStaff = notesPerMeasure * MEASURES_PER_STAFF;
  const staffIdx = Math.floor(idx / notesPerStaff);

  if (staffIdx !== currentStaffIdx) {
    const total = allNotes.length;
    const start = staffIdx * notesPerStaff;
    const end = Math.min(start + notesPerStaff, total);

    const div = document.createElement('div');
    div.className = 'staff-section';

    const parent = document.getElementById('canvasParent');
    parent.appendChild(div);

    const noteEls = renderStaff(div, start, end);
    staffData.push({ div, noteEls, start, end });
    noteEls.forEach(el => { if (el) el.style.opacity = '0'; });

    currentStaffIdx = staffIdx;
    parent.scrollTop = parent.scrollHeight;
  }

  const sd = staffData[staffIdx];
  const localIdx = idx - sd.start;

  // Only reveal answered notes (0..idx-1); current note lives in the mini staff
  sd.noteEls.forEach((el, i) => {
    if (el) el.style.opacity = i < localIdx ? '1' : '0';
  });
}

function drawCurrentNote(note, clef, duration) {
  const container = document.getElementById('miniCanvas');
  if (!container) return;
  container.innerHTML = '';

  const width = container.offsetWidth || 130;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, 200);
  const ctx = renderer.getContext();

  const staveW = width - 10;
  const treble = new Stave(5, 10, staveW).addClef('treble');
  treble.setContext(ctx).draw();
  const bass = new Stave(5, 110, staveW).addClef('bass');
  bass.setContext(ctx).draw();

  new StaveConnector(treble, bass).setType(StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
  new StaveConnector(treble, bass).setType(StaveConnector.type.SINGLE_RIGHT).setContext(ctx).draw();

  const key = toVexKey(note, clef);
  const snTreble = clef === 'treble'
    ? new StaveNote({ clef: 'treble', keys: [key], duration })
    : new StaveNote({ clef: 'treble', keys: ['b/4'], duration, type: 'r' });
  const snBass = clef === 'bass'
    ? new StaveNote({ clef: 'bass', keys: [key], duration })
    : new StaveNote({ clef: 'bass', keys: ['d/3'], duration, type: 'r' });

  const trebleVoice = new Voice({ numBeats: BEATS_PER_MEASURE, beatValue: 4 });
  trebleVoice.addTickables([snTreble]);
  const bassVoice = new Voice({ numBeats: BEATS_PER_MEASURE, beatValue: 4 });
  bassVoice.addTickables([snBass]);

  new Formatter().joinVoices([trebleVoice, bassVoice]).format([trebleVoice, bassVoice], staveW - 30);

  trebleVoice.draw(ctx, treble);
  bassVoice.draw(ctx, bass);

  // Hide the rest (opposite clef placeholder)
  const groups = Array.from(container.querySelectorAll('.vf-stavenote'));
  if (clef === 'treble' && groups[1]) groups[1].style.display = 'none';
  if (clef === 'bass'   && groups[0]) groups[0].style.display = 'none';
}

function emptyMiniClef() {
  const container = document.getElementById('miniCanvas');
  if (!container) return;
  container.innerHTML = '';

  const width = container.offsetWidth || 130;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, 200);
  const ctx = renderer.getContext();

  const staveW = width - 10;
  const treble = new Stave(5, 10, staveW).addClef('treble');
  treble.setContext(ctx).draw();
  const bass = new Stave(5, 110, staveW).addClef('bass');
  bass.setContext(ctx).draw();

  new StaveConnector(treble, bass).setType(StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
  new StaveConnector(treble, bass).setType(StaveConnector.type.SINGLE_RIGHT).setContext(ctx).draw();
}

function emptyClef() {
  const parent = document.getElementById('canvasParent');
  parent.style.overflowY = '';
  parent.style.maxHeight = '';
  parent.innerHTML = '<div id="emptyStaff"></div>';
  const div = document.getElementById('emptyStaff');

  const parentWidth = parent.offsetWidth;
  const width = parentWidth > 0 ? parentWidth : Math.floor(window.innerWidth * 0.88);

  const renderer = new Renderer(div, Renderer.Backends.SVG);
  renderer.resize(width, 250);
  const ctx = renderer.getContext();

  const MARGIN = 10;
  const totalW = width - 2 * MARGIN;
  const measureWidth = Math.floor(totalW / MEASURES_PER_STAFF);
  const firstW = measureWidth + FIRST_MEASURE_EXTRA;
  const otherW = Math.floor((totalW - firstW) / (MEASURES_PER_STAFF - 1));

  const trebleStaves = [];
  const bassStaves = [];
  let xOffset = MARGIN;

  for (let m = 0; m < MEASURES_PER_STAFF; m++) {
    const mWidth = m === 0 ? firstW : otherW;
    const treble = new Stave(xOffset, 10, mWidth);
    const bass   = new Stave(xOffset, 130, mWidth);
    if (m === 0) {
      treble.addClef('treble').addTimeSignature('4/4');
      bass.addClef('bass').addTimeSignature('4/4');
    }
    treble.setContext(ctx).draw();
    bass.setContext(ctx).draw();
    trebleStaves.push(treble);
    bassStaves.push(bass);
    xOffset += mWidth;
  }

  new StaveConnector(trebleStaves[0], bassStaves[0])
    .setType(StaveConnector.type.BRACE).setContext(ctx).draw();
  new StaveConnector(trebleStaves[0], bassStaves[0])
    .setType(StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
  new StaveConnector(trebleStaves[MEASURES_PER_STAFF - 1], bassStaves[MEASURES_PER_STAFF - 1])
    .setType(StaveConnector.type.SINGLE_RIGHT).setContext(ctx).draw();
}

function colorNote(idx, color) {
  const staffIdx = Math.floor(idx / (notesPerMeasure * MEASURES_PER_STAFF));
  const sd = staffData[staffIdx];
  if (!sd) return;
  const el = sd.noteEls[idx - sd.start];
  if (el) {
    el.style.opacity = '1';
    el.style.fill = color;
    el.style.stroke = color;
  }
}

function getNoteAt(i) { return allNotes[i]; }
function getClefAt(i) { return allClefs[i]; }
function getDurationAt(i) { return allDurations[i]; }

export { generateGame, buildAndRender, advanceNote, colorNote, drawCurrentNote, emptyMiniClef, emptyClef, getNote, getOctave, getNoteAt, getClefAt, getDurationAt };
