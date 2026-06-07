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
let notesPerMeasure = BEATS_PER_MEASURE;
let staffData = [];
let currentStaffIdx = 0;

// Active clefs for the current level — set via setClefs() before generateGame()
let activeClefs = ['treble', 'bass'];

function setClefs(clefs) {
  activeClefs = (clefs && clefs.length > 0) ? clefs : ['treble', 'bass'];
}

function isSingle() { return activeClefs.length === 1; }

// Canvas heights
const CANVAS_H_DUAL   = 250;
const CANVAS_H_SINGLE = 130;
const MINI_H_DUAL     = 200;
const MINI_H_SINGLE   = 110;

// ─── Note helpers ─────────────────────────────────────────────────────────────

function randomNote() {
  return NOTE_POOL[Math.floor(Math.random() * NOTE_POOL.length)];
}

function randomNoteFromSet(noteSet) {
  return noteSet[Math.floor(Math.random() * noteSet.length)];
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

// ─── Game generation ──────────────────────────────────────────────────────────

function generateGame(count, clefProb, duration = 'q', noteSet = null, mode = 'random') {
  let noteGen;
  if (noteSet) {
    if (mode === 'sequence') {
      noteGen = (_, i) => noteSet[i % noteSet.length];
    } else {
      noteGen = () => randomNoteFromSet(noteSet);
    }
  } else {
    noteGen = randomNote;
  }
  allNotes = Array.from({ length: count }, (_, i) => noteGen(null, i));
  allDurations = Array.from({ length: count }, () => duration);
  notesPerMeasure = Math.round(BEATS_PER_MEASURE / (DURATION_BEATS[duration] || 1));

  if (isSingle()) {
    allClefs = Array.from({ length: count }, () => activeClefs[0]);
  } else {
    allClefs = Array.from({ length: count }, () => randomClef(clefProb));
  }
}

// ─── Main staff rendering ─────────────────────────────────────────────────────

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
  const single = isSingle();
  const clefName = activeClefs[0];

  const parentEl = document.getElementById('canvasParent');
  const parentWidth = parentEl ? parentEl.offsetWidth : 0;
  const width = parentWidth > 0 ? parentWidth : Math.floor(window.innerWidth * 0.88);

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, single ? CANVAS_H_SINGLE : CANVAS_H_DUAL);
  const ctx = renderer.getContext();

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

    if (!single || clefName === 'treble') {
      const treble = new Stave(xOffset, 10, mWidth);
      if (m === 0) treble.addClef('treble').addTimeSignature('4/4');
      treble.setContext(ctx).draw();
      trebleStaves.push(treble);
    }

    if (!single || clefName === 'bass') {
      const bassY = single ? 10 : 130;
      const bass = new Stave(xOffset, bassY, mWidth);
      if (m === 0) bass.addClef('bass').addTimeSignature('4/4');
      bass.setContext(ctx).draw();
      bassStaves.push(bass);
    }

    xOffset += mWidth;
  }

  if (!single) {
    new StaveConnector(trebleStaves[0], bassStaves[0])
      .setType(StaveConnector.type.BRACE).setContext(ctx).draw();
    new StaveConnector(trebleStaves[0], bassStaves[0])
      .setType(StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
    new StaveConnector(trebleStaves[numMeasures - 1], bassStaves[numMeasures - 1])
      .setType(StaveConnector.type.SINGLE_RIGHT).setContext(ctx).draw();
  }

  for (let m = 0; m < numMeasures; m++) {
    const mStart = m * notesPerMeasure;
    const mEnd = Math.min(mStart + notesPerMeasure, count);
    const trebleTickables = [];
    const bassTickables = [];
    const padDur = allDurations[start + mStart] || 'q';

    for (let i = mStart; i < mEnd; i++) {
      const clef = single ? clefName : clefs[i];
      const key  = toVexKey(notes[i], clef);
      const dur  = allDurations[start + i];

      if (single) {
        if (clefName === 'treble') {
          trebleTickables.push(new StaveNote({ clef: 'treble', keys: [key], duration: dur }));
        } else {
          bassTickables.push(new StaveNote({ clef: 'bass', keys: [key], duration: dur }));
        }
      } else {
        if (clef === 'treble') {
          trebleTickables.push(new StaveNote({ clef: 'treble', keys: [key], duration: dur }));
          bassTickables.push(new StaveNote({ clef: 'bass', keys: ['d/3'], duration: dur, type: 'r' }));
        } else {
          trebleTickables.push(new StaveNote({ clef: 'treble', keys: ['b/4'], duration: dur, type: 'r' }));
          bassTickables.push(new StaveNote({ clef: 'bass', keys: [key], duration: dur }));
        }
      }
    }

    // Pad last measure with rests
    if (single) {
      const ticks = clefName === 'treble' ? trebleTickables : bassTickables;
      const restKey = clefName === 'treble' ? 'b/4' : 'd/3';
      while (ticks.length < notesPerMeasure) {
        ticks.push(new StaveNote({ clef: clefName, keys: [restKey], duration: padDur, type: 'r' }));
      }
    } else {
      while (trebleTickables.length < notesPerMeasure) {
        trebleTickables.push(new StaveNote({ clef: 'treble', keys: ['b/4'], duration: padDur, type: 'r' }));
        bassTickables.push(new StaveNote({ clef: 'bass',   keys: ['d/3'], duration: padDur, type: 'r' }));
      }
    }

    const mWidth = m === 0 ? firstMeasureWidth : otherMeasureWidth;
    const formatWidth = mWidth - (m === 0 ? FIRST_MEASURE_EXTRA + 20 : 20);

    if (single) {
      const voice = new Voice({ numBeats: BEATS_PER_MEASURE, beatValue: 4 });
      const ticks = clefName === 'treble' ? trebleTickables : bassTickables;
      const stave = clefName === 'treble' ? trebleStaves[m] : bassStaves[m];
      voice.addTickables(ticks);
      new Formatter().joinVoices([voice]).format([voice], formatWidth);
      voice.draw(ctx, stave);
    } else {
      const trebleVoice = new Voice({ numBeats: BEATS_PER_MEASURE, beatValue: 4 });
      trebleVoice.addTickables(trebleTickables);
      const bassVoice = new Voice({ numBeats: BEATS_PER_MEASURE, beatValue: 4 });
      bassVoice.addTickables(bassTickables);
      new Formatter().joinVoices([trebleVoice, bassVoice]).format([trebleVoice, bassVoice], formatWidth);
      trebleVoice.draw(ctx, trebleStaves[m]);
      bassVoice.draw(ctx, bassStaves[m]);
    }
  }

  // ── Note element mapping ──────────────────────────────────────────────────
  const allGroups = Array.from(container.querySelectorAll('.vf-stavenote'));
  const noteEls = [];

  if (single) {
    // One voice per measure → elements are sequential: m0_b0, m0_b1, …, m1_b0, …
    for (let i = 0; i < count; i++) {
      noteEls.push(allGroups[i] || null);
    }
    // Hide padding rests in the last measure
    const lastM = numMeasures - 1;
    const lastMActual = count - lastM * notesPerMeasure;
    for (let b = lastMActual; b < notesPerMeasure; b++) {
      const el = allGroups[lastM * notesPerMeasure + b];
      if (el) el.style.display = 'none';
    }
  } else {
    // Two voices per measure → treble voice first, bass voice second
    const GROUPS_PER_MEASURE = notesPerMeasure * 2;
    for (let i = 0; i < count; i++) {
      const m = Math.floor(i / notesPerMeasure);
      const b = i % notesPerMeasure;
      const trebleIdx = m * GROUPS_PER_MEASURE + b;
      const bassIdx   = m * GROUPS_PER_MEASURE + notesPerMeasure + b;
      const isTreble  = clefs[i] === 'treble';
      const noteEl    = isTreble ? allGroups[trebleIdx] : allGroups[bassIdx];
      const restEl    = isTreble ? allGroups[bassIdx]   : allGroups[trebleIdx];
      if (restEl) restEl.style.display = 'none';
      noteEls.push(noteEl || null);
    }
    // Hide padding rests in the last measure
    const lastM = numMeasures - 1;
    const lastMActual = count - lastM * notesPerMeasure;
    for (let b = lastMActual; b < notesPerMeasure; b++) {
      const trebleIdx = lastM * GROUPS_PER_MEASURE + b;
      const bassIdx   = lastM * GROUPS_PER_MEASURE + notesPerMeasure + b;
      if (allGroups[trebleIdx]) allGroups[trebleIdx].style.display = 'none';
      if (allGroups[bassIdx])   allGroups[bassIdx].style.display = 'none';
    }
  }

  return noteEls;
}

// ─── Staff advance (lazy rendering of subsequent pages) ───────────────────────

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

  sd.noteEls.forEach((el, i) => {
    if (el) el.style.opacity = i < localIdx ? '1' : '0';
  });
}

// ─── Mini canvas (current note preview) ──────────────────────────────────────

function drawCurrentNote(note, clef, duration) {
  const container = document.getElementById('miniCanvas');
  if (!container) return;
  container.innerHTML = '';
  const single = isSingle();
  const clefName = activeClefs[0];

  const width = container.offsetWidth || 130;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, single ? MINI_H_SINGLE : MINI_H_DUAL);
  const ctx = renderer.getContext();
  const staveW = width - 10;

  if (single) {
    const stave = new Stave(5, 10, staveW).addClef(clefName);
    stave.setContext(ctx).draw();

    const key = toVexKey(note, clefName);
    const sn  = new StaveNote({ clef: clefName, keys: [key], duration });
    const voice = new Voice({ numBeats: BEATS_PER_MEASURE, beatValue: 4 });
    voice.addTickables([sn]);
    new Formatter().joinVoices([voice]).format([voice], staveW - 30);
    voice.draw(ctx, stave);
  } else {
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

    const groups = Array.from(container.querySelectorAll('.vf-stavenote'));
    if (clef === 'treble' && groups[1]) groups[1].style.display = 'none';
    if (clef === 'bass'   && groups[0]) groups[0].style.display = 'none';
  }
}

function emptyMiniClef() {
  const container = document.getElementById('miniCanvas');
  if (!container) return;
  container.innerHTML = '';
  const single = isSingle();
  const clefName = activeClefs[0];

  const width = container.offsetWidth || 130;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, single ? MINI_H_SINGLE : MINI_H_DUAL);
  const ctx = renderer.getContext();
  const staveW = width - 10;

  if (single) {
    new Stave(5, 10, staveW).addClef(clefName).setContext(ctx).draw();
  } else {
    const treble = new Stave(5, 10, staveW).addClef('treble');
    treble.setContext(ctx).draw();
    const bass = new Stave(5, 110, staveW).addClef('bass');
    bass.setContext(ctx).draw();
    new StaveConnector(treble, bass).setType(StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
    new StaveConnector(treble, bass).setType(StaveConnector.type.SINGLE_RIGHT).setContext(ctx).draw();
  }
}

// ─── Empty staff (before game starts / after game ends) ──────────────────────

function emptyClef() {
  const parent = document.getElementById('canvasParent');
  parent.style.overflowY = '';
  parent.style.maxHeight = '';
  parent.innerHTML = '<div id="emptyStaff"></div>';
  const div = document.getElementById('emptyStaff');
  const single = isSingle();
  const clefName = activeClefs[0];

  const parentWidth = parent.offsetWidth;
  const width = parentWidth > 0 ? parentWidth : Math.floor(window.innerWidth * 0.88);

  const renderer = new Renderer(div, Renderer.Backends.SVG);
  renderer.resize(width, single ? CANVAS_H_SINGLE : CANVAS_H_DUAL);
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

    if (!single || clefName === 'treble') {
      const treble = new Stave(xOffset, 10, mWidth);
      if (m === 0) treble.addClef('treble').addTimeSignature('4/4');
      treble.setContext(ctx).draw();
      trebleStaves.push(treble);
    }

    if (!single || clefName === 'bass') {
      const bassY = single ? 10 : 130;
      const bass = new Stave(xOffset, bassY, mWidth);
      if (m === 0) bass.addClef('bass').addTimeSignature('4/4');
      bass.setContext(ctx).draw();
      bassStaves.push(bass);
    }

    xOffset += mWidth;
  }

  if (!single) {
    new StaveConnector(trebleStaves[0], bassStaves[0])
      .setType(StaveConnector.type.BRACE).setContext(ctx).draw();
    new StaveConnector(trebleStaves[0], bassStaves[0])
      .setType(StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
    new StaveConnector(trebleStaves[MEASURES_PER_STAFF - 1], bassStaves[MEASURES_PER_STAFF - 1])
      .setType(StaveConnector.type.SINGLE_RIGHT).setContext(ctx).draw();
  }
}

// ─── Color a note after it's answered ────────────────────────────────────────

function colorNote(idx, color) {
  const staffIdx = Math.floor(idx / (notesPerMeasure * MEASURES_PER_STAFF));
  const sd = staffData[staffIdx];
  if (!sd) return;
  const el = sd.noteEls[idx - sd.start];
  if (el) {
    el.style.opacity = '1';
    el.style.fill    = color;
    el.style.stroke  = color;
  }
}

function getNoteAt(i)     { return allNotes[i]; }
function getClefAt(i)     { return allClefs[i]; }
function getDurationAt(i) { return allDurations[i]; }

export {
  emptyClef, randomNote, randomNoteFromSet, randomClef, getNote, getOctave,
  generateGame, buildAndRender, advanceNote, colorNote, drawCurrentNote,
  emptyMiniClef, getNoteAt, getClefAt, getDurationAt, setClefs,
};
