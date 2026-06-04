// Tone.js is loaded as a global from CDN — available as window.Tone

let sampler = null;
let samplerPromise = null;

const SALAMANDER_BASE = 'https://tonejs.github.io/audio/salamander/';

function getSampler() {
  if (!samplerPromise) {
    samplerPromise = new Promise(resolve => {
      const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.22 }).toDestination();

      sampler = new Tone.Sampler({
        urls: {
          C4:   'C4.mp3',
          'D#4': 'Ds4.mp3',
          'F#4': 'Fs4.mp3',
          A4:   'A4.mp3',
        },
        release: 1,
        baseUrl: SALAMANDER_BASE,
        onload: () => resolve(sampler),
      }).connect(reverb);
    });
  }
  return samplerPromise;
}

// Call this as soon as an audio level is detected so samples load in background
function preloadSampler() { getSampler(); }

async function playNote(noteStr) {
  await Tone.start();
  const s = await getSampler();
  // Convert 'c4' → 'C4' for Tone.js
  const toneNote = noteStr[0].toUpperCase() + noteStr.slice(1);
  s.triggerAttackRelease(toneNote, '2n');
}

export { playNote, preloadSampler };
