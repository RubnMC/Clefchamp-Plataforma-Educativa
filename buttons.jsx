// buttons.jsx — four button variants for Clefchamp level cards,
// parameterized by a `level` config so the same component renders chord,
// arpeggio, scale, interval, etc.
//
// Variants kept after review:
//   V1 — Notación minimal   (clean pill, staff thumb on the left)
//   V2 — Editorial pautado  (paper card, serif hero, staff is hero)
//   V5 — Brutalista         (oversized type, thick borders, monospace)
//   V6 — Teclado            (mini-piano hero)
//
// Each accepts { state, level }.

const COLORS = {
  ink:     '#1A2420',
  ink2:    '#3D4845',
  cream:   '#F4EFE6',
  paper:   '#FAF7F1',
  rule:    'rgba(26,36,32,0.10)',
  terra:   '#C8553D',
  terraSoft: '#E9A294',
  forest:  '#3E6B5A',
  amber:   '#D9994A',
  shadow:  '0 1px 0 rgba(26,36,32,0.04), 0 8px 24px -12px rgba(26,36,32,0.18)',
};

// ─── Level configs ──────────────────────────────────────────────────────────
// Each level describes the musical content + how to label/abbreviate it for
// the various visual roles (mono badge, brutalist big-type, etc).
const LEVEL_CHORD_CMAJOR = {
  id: 'chord-c-major',
  num: '03',
  category: 'Acordes',
  name: 'Do mayor',
  cifrado: 'C',
  cifradoLong: 'CMaj',
  roman: 'I',
  notes: 'do – mi – sol',
  notesSpread: 'do · mi · sol',
  notesSep: 'do mi sol',
  detail: '3 notas',
  brutalMain: 'DO',
  brutalSub: 'mayor',
  brutalHeaderRight: 'C / DO MI SOL',
  brutalKind: 'CHORD',
  staffMode: 'triad',
  pianoMode: 'triad',
};

const LEVEL_NOTES_DRMF = {
  id: 'notes-do-re-mi-fa', num: '01', category: 'Notas',
  name: 'Do · Re · Mi · Fa', cifrado: '4 notas', cifradoLong: 'tetra',
  roman: 'frase 1', notes: 'do re mi fa', notesSep: 'do re mi fa',
  brutalMain: 'DO', brutalSub: '→ re mi fa',
  brutalHeaderRight: 'DO → FA', brutalKind: 'MEL',
  staffNotes: ['C4', 'D4', 'E4', 'F4'],
  pianoHighlight: [0, 1, 2, 3],
};

const LEVEL_NOTES_SLS = {
  id: 'notes-sol-la-si', num: '02', category: 'Notas',
  name: 'Sol · La · Si', cifrado: '3 notas', cifradoLong: 'tri',
  roman: 'frase 2', notes: 'sol la si', notesSep: 'sol la si',
  brutalMain: 'SOL', brutalSub: '→ la si',
  brutalHeaderRight: 'SOL → SI', brutalKind: 'MEL',
  staffNotes: ['G4', 'A4', 'B4'],
  pianoHighlight: [4, 5, 6],
};

const LEVEL_ARP_DESC_CMAJOR = {
  id: 'arp-desc-c-major', num: '08', category: 'Arpegios',
  name: 'Arpegio de Do ↘', cifrado: 'C↘', cifradoLong: 'C ↘',
  roman: 'I desc.', notes: 'do sol mi do', notesSep: 'do → sol → mi → do',
  brutalMain: 'DO', brutalSub: 'arpegio ↘',
  brutalHeaderRight: 'DO → DO ↘', brutalKind: 'ARP',
  staffNotes: ['C5', 'G4', 'E4', 'C4'],
  pianoHighlight: [0, 2, 4],
};

const LEVEL_ODA_1 = {
  id: 'oda-1', num: '12', category: 'Melodías',
  name: 'Oda a la Alegría · I', cifrado: 'Oda I', cifradoLong: 'Oda I',
  roman: 'parte i', notes: 'mi mi fa sol sol fa mi re', notesSep: 'mi mi fa sol …',
  brutalMain: 'ODA', brutalSub: 'alegría · i',
  brutalHeaderRight: 'I · BEETHOVEN', brutalKind: 'MEL',
  staffNotes: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4'],
};

const LEVEL_ODA_2 = {
  id: 'oda-2', num: '13', category: 'Melodías',
  name: 'Oda a la Alegría · II', cifrado: 'Oda II', cifradoLong: 'Oda II',
  roman: 'parte ii', notes: 'do do re mi mi re do', notesSep: 'do do re mi re do',
  brutalMain: 'ODA', brutalSub: 'alegría · ii',
  brutalHeaderRight: 'II · BEETHOVEN', brutalKind: 'MEL',
  staffNotes: ['C4', 'C4', 'D4', 'E4', 'D4', 'C4', 'C4', 'D4'],
};

const LEVEL_ODA_3 = {
  id: 'oda-3', num: '14', category: 'Melodías',
  name: 'Oda a la Alegría · III', cifrado: 'Oda III', cifradoLong: 'Oda III',
  roman: 'parte iii (puente)', notes: 're re mi do re mi fa mi', notesSep: 'puente',
  brutalMain: 'ODA', brutalSub: 'alegría · iii',
  brutalHeaderRight: 'III · BEETHOVEN', brutalKind: 'MEL',
  staffNotes: ['D4', 'D4', 'E4', 'C4', 'D4', 'E4', 'F4', 'E4'],
};

// ── Treatments for long piece titles (Nocturno op. 9 nº 2) ─────────────────
// Five strategies for the same piece, so the user can compare:
//   A · ABBR    — shorten the noun → big "NOCT"
//   B · OPUS    — opus number becomes the hero
//   C · NUMBER  — the catalogue position "9·2" is the mark
//   D · WRAP    — title IS the hero, smaller size, wraps to 2 lines (mixed case)
//   E · GLYPH   — a musical mark replaces big type; full title goes in body
const NOCT_NOTES = ['G4', 'E4', 'F4', 'D4', 'E4', 'C4', 'D4', 'B4'];

const LEVEL_NOCT_A_ABBR = {
  id: 'noct-a', num: '21', category: 'Repertorio',
  name: 'Nocturno op. 9 nº 2', cifrado: 'Noct.', roman: 'op. 9 / 2',
  notes: 'fragmento', notesSep: 'fragmento',
  brutalMain: 'NOCT.', brutalSub: 'op. 9 · nº 2 · chopin',
  brutalHeaderRight: 'CHOPIN · 1832', brutalKind: 'PIEZA',
  staffNotes: NOCT_NOTES, brutalWidth: 320,
};

const LEVEL_NOCT_B_OPUS = {
  id: 'noct-b', num: '21', category: 'Repertorio',
  name: 'Nocturno op. 9', cifrado: 'op.9/2', roman: 'op. 9 / 2',
  notes: 'fragmento', notesSep: 'fragmento',
  brutalMain: 'OP.9', brutalSub: 'nocturno · nº 2',
  brutalHeaderRight: 'CHOPIN · NOCT.', brutalKind: 'PIEZA',
  staffNotes: NOCT_NOTES, brutalWidth: 320,
};

const LEVEL_NOCT_C_NUMBER = {
  id: 'noct-c', num: '21', category: 'Repertorio',
  name: 'Nocturno 9·2', cifrado: '9·2', roman: 'op. 9 / 2',
  notes: 'fragmento', notesSep: 'fragmento',
  brutalMain: '9·2', brutalSub: 'nocturno · chopin',
  brutalHeaderRight: 'OP.9 / Nº 2', brutalKind: 'PIEZA',
  staffNotes: NOCT_NOTES, brutalWidth: 300,
};

const LEVEL_NOCT_D_WRAP = {
  id: 'noct-d', num: '21', category: 'Repertorio',
  name: 'Nocturno op. 9 nº 2', cifrado: 'op.9/2', roman: 'op. 9 / 2',
  notes: 'fragmento', notesSep: 'fragmento',
  brutalMain: 'Nocturno\nop. 9 nº 2', brutalSub: 'Frédéric Chopin · 1832',
  brutalHeaderRight: 'CHOPIN · PIEZA', brutalKind: 'PIEZA',
  brutalSize: 30, brutalCase: 'mixed',
  brutalFont: '"Instrument Serif", "EB Garamond", serif',
  staffNotes: NOCT_NOTES, brutalWidth: 340,
};

const LEVEL_NOCT_E_GLYPH = {
  id: 'noct-e', num: '21', category: 'Repertorio',
  name: 'Nocturno op. 9 nº 2', cifrado: 'op.9/2', roman: 'op. 9 / 2',
  notes: 'fragmento', notesSep: 'fragmento',
  brutalMain: '𝄞', brutalSub: 'Nocturno op. 9 nº 2 · Chopin',
  brutalHeaderRight: 'CHOPIN · OP.9 / 2', brutalKind: 'PIEZA',
  brutalSize: 84, brutalCase: 'mixed',
  brutalFont: 'serif',
  staffNotes: NOCT_NOTES, brutalWidth: 320,
};

const LEVEL_ARP_CMAJOR = {
  id: 'arp-c-major',
  num: '07',
  category: 'Arpegios',
  name: 'Arpegio de Do',
  cifrado: 'C↗',
  cifradoLong: 'C esc.',
  roman: 'I · esc.',
  notes: 'do re mi fa sol la si do',
  notesSpread: 'do→do · 8 notas',
  notesSep: 'do → do',
  detail: '8 notas asc.',
  brutalMain: 'DO',
  brutalSub: 'arpegio ↗',
  staffMode: 'scale',
  pianoMode: 'scale',
  kind: 'ARP',
};

// ─── State helper ───────────────────────────────────────────────────────────
function stateMeta(state) {
  return {
    locked:    { label: 'Bloqueado',  pct: 0,    stars: 0, dim: true,  glyph: 'lock'  },
    available: { label: 'Empezar',    pct: 0,    stars: 0, dim: false, glyph: 'play'  },
    progress:  { label: 'Continuar',  pct: 0.45, stars: 1, dim: false, glyph: 'play'  },
    done:      { label: 'Repasar',    pct: 1,    stars: 3, dim: false, glyph: 'check' },
  }[state];
}

const baseBtn = {
  appearance: 'none', border: 'none', background: 'none',
  cursor: 'pointer', textAlign: 'left',
  fontFamily: '"Geist", system-ui, sans-serif',
  color: COLORS.ink, padding: 0, margin: 0,
};

// ───────────────────────────────────────────────────────────
// V1 — Notación minimal
// ───────────────────────────────────────────────────────────
const V1Minimal = ({ state = 'available', level = LEVEL_CHORD_CMAJOR }) => {
  const m = stateMeta(state);
  const dim = m.dim ? 0.45 : 1;
  // Scale levels need a wider staff thumbnail
  const staffW = level.staffMode === 'scale' ? 132 : 88;
  return (
    <button style={{ ...baseBtn, width: level.staffMode === 'scale' ? 360 : 320,
                     background: COLORS.paper, borderRadius: 16,
                     boxShadow: COLORS.shadow, padding: '14px 16px', display: 'grid',
                     gridTemplateColumns: `${staffW + 8}px 1fr auto`, gap: 14,
                     alignItems: 'center', opacity: dim, border: `1px solid ${COLORS.rule}` }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: '4px 2px',
                    border: `1px solid ${COLORS.rule}` }}>
        <StaffC width={staffW} height={64} ink={COLORS.ink} mode={level.staffMode}
                accent={m.dim ? COLORS.ink2 : COLORS.terra} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: COLORS.ink2, fontWeight: 500 }}>
          Nivel {level.num} · {level.category}
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
          {level.name}
        </div>
        <div style={{ fontSize: 12, color: COLORS.ink2, fontFamily: '"Geist Mono", monospace',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {level.cifrado} · {level.notes}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        {state === 'locked' && <Lock size={14} color={COLORS.ink2} />}
        {state === 'done' && <Stars count={3} size={11} on={COLORS.terra} />}
        {state === 'progress' && (
          <div style={{ fontSize: 11, fontFamily: '"Geist Mono", monospace', color: COLORS.terra }}>
            {Math.round(m.pct * 100)}%
          </div>
        )}
        <div style={{
          width: 32, height: 32, borderRadius: 999,
          background: state === 'locked' ? 'transparent' : COLORS.ink,
          color: COLORS.cream, display: 'grid', placeItems: 'center',
          border: state === 'locked' ? `1px solid ${COLORS.rule}` : 'none',
        }}>
          {m.glyph === 'lock' && <Lock size={12} color={COLORS.ink2} />}
          {m.glyph === 'play' && <Play size={11} color={COLORS.cream} />}
          {m.glyph === 'check' && <Check size={13} color={COLORS.cream} />}
        </div>
      </div>
    </button>
  );
};

// ───────────────────────────────────────────────────────────
// V2 — Editorial pautado
// ───────────────────────────────────────────────────────────
const V2Editorial = ({ state = 'available', level = LEVEL_CHORD_CMAJOR }) => {
  const m = stateMeta(state);
  const dim = m.dim ? 0.4 : 1;
  const isScale = level.staffMode === 'scale';
  const cardW = isScale ? 320 : 240;
  const staffW = isScale ? 280 : 160;
  return (
    <button style={{ ...baseBtn, width: cardW, background: COLORS.paper, borderRadius: 4,
                     padding: '18px 18px 14px', display: 'flex', flexDirection: 'column',
                     gap: 14, opacity: dim, border: `1px solid ${COLORS.ink}`,
                     boxShadow: '4px 4px 0 0 ' + COLORS.ink }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    borderBottom: `1px solid ${COLORS.rule}`, paddingBottom: 8 }}>
        <span style={{ fontFamily: '"Instrument Serif", "EB Garamond", serif',
                       fontSize: 13, fontStyle: 'italic', color: COLORS.ink2 }}>
          Nº {level.num} — {level.category}
        </span>
        <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 10, color: COLORS.ink2 }}>
          {level.roman}
        </span>
      </div>
      <div style={{ display: 'grid', placeItems: 'center', padding: '4px 0' }}>
        <StaffC width={staffW} height={isScale ? 80 : 76} ink={COLORS.ink} mode={level.staffMode}
                accent={m.dim ? COLORS.ink2 : (state === 'done' ? COLORS.terra : COLORS.ink)} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: '"Instrument Serif", "EB Garamond", serif',
                        fontSize: isScale ? 26 : 28, lineHeight: 1, letterSpacing: '-0.01em' }}>
            {level.name}
          </div>
          <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 10,
                        color: COLORS.ink2, marginTop: 4, letterSpacing: '0.08em' }}>
            {level.cifrado} · {level.notesSep}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {state === 'locked' && <Lock size={14} color={COLORS.ink2} />}
          {state === 'available' && (
            <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic',
                           fontSize: 13, color: COLORS.terra }}>
              empezar →
            </span>
          )}
          {state === 'progress' && (
            <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 11, color: COLORS.terra }}>
              {Math.round(m.pct * 100)}%
            </span>
          )}
          {state === 'done' && <Stars count={3} size={12} on={COLORS.terra} />}
        </div>
      </div>
    </button>
  );
};

// ───────────────────────────────────────────────────────────
// V5 — Brutalista
// ───────────────────────────────────────────────────────────
const V5Brutal = ({ state = 'available', level = LEVEL_CHORD_CMAJOR }) => {
  const m = stateMeta(state);
  const dim = m.dim;
  const accent = dim ? COLORS.ink2 : COLORS.terra;
  const hasNotes = !!level.staffNotes;
  const isScale = level.staffMode === 'scale';
  // Width scales to the staff content (overridable via level.brutalWidth)
  const isWide = isScale || (hasNotes && level.staffNotes.length >= 6);
  const isMed  = hasNotes && level.staffNotes.length >= 4 && !isWide;
  const cardW = level.brutalWidth ?? (isWide ? 320 : isMed ? 290 : 260);
  const staffW = isWide ? 138 : isMed ? 108 : 84;
  const upperKind = level.brutalKind || level.kind || 'CHORD';
  const topRight = level.brutalHeaderRight
    || (isScale ? `${level.cifrado.replace('↗', '').trim()} / DO → DO`
                : `${level.cifrado} / DO – MI – SOL`);
  // Big-type knobs so long titles (e.g. "Nocturno op. 9 nº 2") work too.
  const bSize = level.brutalSize ?? 76;
  const bCase = level.brutalCase || 'upper';
  const bLH   = bSize >= 56 ? 0.85 : 0.95;
  const bLS   = bSize >= 56 ? '-0.05em' : '-0.02em';
  const bTT   = bCase === 'mixed' ? 'none' : 'uppercase';
  const bFont = level.brutalFont || '"Geist", sans-serif';
  return (
    <button style={{ ...baseBtn, width: cardW, background: COLORS.paper,
                     border: `2.5px solid ${COLORS.ink}`,
                     padding: 0, position: 'relative', overflow: 'hidden',
                     boxShadow: `5px 5px 0 0 ${COLORS.ink}`,
                     opacity: dim ? 0.55 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    padding: '6px 10px', borderBottom: `2.5px solid ${COLORS.ink}`,
                    fontFamily: '"Geist Mono", monospace', fontSize: 10, letterSpacing: '0.12em' }}>
        <span>LV.{level.num} / {level.roman.toUpperCase()} — {upperKind}</span>
        <span>{topRight}</span>
      </div>
      <div style={{ padding: '10px 14px 12px', position: 'relative' }}>
        <div style={{ fontFamily: bFont, fontWeight: bSize >= 56 ? 800 : 700,
                      fontSize: bSize, lineHeight: bLH, letterSpacing: bLS,
                      textTransform: bTT, color: COLORS.ink,
                      whiteSpace: 'pre-line', overflowWrap: 'break-word' }}>
          {level.brutalMain}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                      marginTop: 4, gap: 10 }}>
          <div style={{ fontFamily: '"Geist", sans-serif', fontWeight: 600,
                        fontSize: 16, letterSpacing: '-0.02em', color: accent,
                        lineHeight: 1.15 }}>
            {level.brutalSub}
          </div>
          <StaffC width={staffW} height={56} ink={COLORS.ink}
                  accent={accent} clef={false}
                  mode={level.staffMode} notes={level.staffNotes} />
        </div>
      </div>
      <div style={{ display: 'flex', borderTop: `2.5px solid ${COLORS.ink}`,
                    fontFamily: '"Geist Mono", monospace', fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <div style={{ flex: 1, padding: '8px 10px', borderRight: `2.5px solid ${COLORS.ink}`,
                      display: 'flex', alignItems: 'center', gap: 6 }}>
          {state === 'locked' && (<><Lock size={11} color={COLORS.ink} /> bloqueado</>)}
          {state === 'available' && 'disponible'}
          {state === 'progress' && `${Math.round(m.pct * 100)}% hecho`}
          {state === 'done' && (<><Check size={11} color={COLORS.terra} /> completo</>)}
        </div>
        <div style={{ padding: '8px 12px', background: dim ? COLORS.paper : COLORS.ink,
                      color: dim ? COLORS.ink2 : COLORS.cream, minWidth: 64, textAlign: 'center' }}>
          {state === 'done' ? '★ ★ ★' : state === 'locked' ? '— — —' : 'play ▸'}
        </div>
      </div>
    </button>
  );
};

// ───────────────────────────────────────────────────────────
// V6 — Teclado
// ───────────────────────────────────────────────────────────
const V6Keyboard = ({ state = 'available', level = LEVEL_CHORD_CMAJOR }) => {
  const m = stateMeta(state);
  const dim = m.dim;
  return (
    <button style={{ ...baseBtn, width: 200, background: COLORS.paper, borderRadius: 18,
                     padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
                     border: `1px solid ${COLORS.rule}`, boxShadow: COLORS.shadow,
                     opacity: dim ? 0.55 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: '"Geist Mono", monospace', fontSize: 10,
                       color: COLORS.ink2, letterSpacing: '0.1em' }}>
          {level.num} · {level.category.toUpperCase()}
        </span>
        <span style={{
          padding: '2px 7px', borderRadius: 4,
          fontFamily: '"Geist Mono", monospace', fontSize: 10, fontWeight: 600,
          background: dim ? 'transparent' : COLORS.terra,
          color: dim ? COLORS.ink2 : COLORS.cream,
          border: dim ? `1px solid ${COLORS.rule}` : 'none',
        }}>
          {level.cifradoLong}
        </span>
      </div>
      <div style={{ display: 'grid', placeItems: 'center', padding: '4px 0 2px' }}>
        <PianoC width={168} height={72} mode={level.pianoMode}
                ink={COLORS.ink}
                highlight={dim ? '#D7CFBE' : COLORS.terra}
                white={COLORS.paper} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.01em' }}>
            {level.name}
          </div>
          <div style={{ fontSize: 10, color: COLORS.ink2, marginTop: 3,
                        fontFamily: '"Geist Mono", monospace', letterSpacing: '0.06em' }}>
            {level.notesSep}
          </div>
        </div>
        <div style={{ width: 28, height: 28, borderRadius: 999,
                      background: state === 'locked' ? 'transparent' : COLORS.ink,
                      color: COLORS.cream, display: 'grid', placeItems: 'center',
                      border: state === 'locked' ? `1px solid ${COLORS.rule}` : 'none' }}>
          {state === 'locked' && <Lock size={11} color={COLORS.ink2} />}
          {state === 'available' && <Play size={10} color={COLORS.cream} />}
          {state === 'progress' && <Play size={10} color={COLORS.cream} />}
          {state === 'done' && <Check size={12} color={COLORS.cream} />}
        </div>
      </div>
      {state === 'progress' && (
        <div style={{ height: 3, borderRadius: 2, background: 'rgba(26,36,32,0.10)',
                      overflow: 'hidden', marginTop: -4 }}>
          <div style={{ width: `${m.pct * 100}%`, height: '100%', background: COLORS.terra }} />
        </div>
      )}
      {state === 'done' && (
        <div style={{ marginTop: -4 }}><Stars count={3} size={11} on={COLORS.terra} /></div>
      )}
    </button>
  );
};

Object.assign(window, {
  COLORS,
  V1Minimal, V2Editorial, V5Brutal, V6Keyboard,
  LEVEL_CHORD_CMAJOR, LEVEL_ARP_CMAJOR,
  LEVEL_NOTES_DRMF, LEVEL_NOTES_SLS, LEVEL_ARP_DESC_CMAJOR,
  LEVEL_ODA_1, LEVEL_ODA_2, LEVEL_ODA_3,
  LEVEL_NOCT_A_ABBR, LEVEL_NOCT_B_OPUS, LEVEL_NOCT_C_NUMBER,
  LEVEL_NOCT_D_WRAP, LEVEL_NOCT_E_GLYPH,
});
