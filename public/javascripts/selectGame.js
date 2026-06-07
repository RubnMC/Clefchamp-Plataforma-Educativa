//TODO: eliminar hardcoded
const LEVELS_LIST = [
  LevelButtons.LEVEL_TUTORIAL,
  LevelButtons.LEVEL_NOTES_DRMF,
  LevelButtons.LEVEL_NOTES_SLS,
  LevelButtons.LEVEL_CHORD_CMAJOR,
  LevelButtons.LEVEL_CHORD_GMAJOR,
  LevelButtons.LEVEL_CHORD_FMAJOR,
  LevelButtons.LEVEL_CHORD_AMINOR,
  LevelButtons.LEVEL_ARP_CMAJOR,
  LevelButtons.LEVEL_ARP_DESC_CMAJOR,
  LevelButtons.LEVEL_MEL_MARY,
  LevelButtons.LEVEL_MEL_CUMPLE,
  LevelButtons.LEVEL_MEL_CAMPANITA,
  LevelButtons.LEVEL_ODA_1,
  LevelButtons.LEVEL_ODA_2,
  LevelButtons.LEVEL_ODA_3,
  LevelButtons.LEVEL_SOUND_CDE,
];

const KIND_COLOR = {
  MEL:   '#4A7FA5',
  CHORD: '#5E8A52',
  ARP:   '#A5724A',
};

Promise.all([
  $.getJSON('/play/levels'),
  fetch('/play/getStudentLevels').then(r => r.json()),
]).then(([levelsData, studentData]) => {
  const metaById = {};
  levelsData.forEach(l => { metaById[l.id] = l; });
  LEVELS_LIST.forEach(lvl => {
    const m = metaById[lvl.id] || {};
    lvl.difficulty = m.difficulty;
    lvl.clefs      = m.clefs;
    lvl.rounds     = m.rounds;
    lvl.experience = m.experience;
  });
  renderLevelGrid(studentData.levelIds || []);
}).catch(() => renderLevelGrid(LEVELS_LIST.map(l => l.id)));

function renderLevelGrid(unlockedIds) {
  const levelGrid = $('<div>').css({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '18px',
    padding: '4px 8px 8px 2px',
  });
  LEVELS_LIST.forEach(lvl => {
    const unlocked = unlockedIds.includes(lvl.id);
    const state = unlocked ? 'available' : 'locked';
    const btn = LevelButtons.VARIANTS.V5Brutal(state, { ...lvl, brutalSize: 46 });
    btn.data('level', lvl).css('width', '100%');
    if (!unlocked) {
      btn.prop('disabled', true).css({ pointerEvents: 'none', cursor: 'not-allowed' });
    }
    levelGrid.append(btn);
  });
  $('#levelList').empty().append(levelGrid);
}

$('#levelList').on('click', 'button', function () {
  const level = $(this).data('level');
  if (!level) return;

  // Reset all cards, highlight selected
  $('#levelList button').css({
    border: `2.5px solid ${LevelButtons.C.ink}`,
    background: LevelButtons.C.paper,
    boxShadow: `5px 5px 0 0 ${LevelButtons.C.ink}`,
  });
  $(this).css({
    border: '2.5px solid #C8553D',
    background: 'rgba(200,85,61,0.05)',
    boxShadow: '5px 5px 0 0 #C8553D',
  });

  localStorage.setItem('lastPlayedName', level.name);
  showLevelDetail(level);
});

function quaverIcon(filled, extra = false) {
  return $('<div>').css({
    width: '18px', height: '44px', display: 'inline-block', flexShrink: 0,
    verticalAlign: 'bottom',
    backgroundColor: extra ? '#C8553D' : '#350D40',
    opacity: filled ? 1 : 0.2,
    maskImage: 'url(/images/icons/quaver.svg)',
    WebkitMaskImage: 'url(/images/icons/quaver.svg)',
    maskSize: 'contain', WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center', WebkitMaskPosition: 'center',
  });
}

function statLabel(text) {
  return $('<span>').css({
    fontFamily: '"Geist Mono",monospace', fontSize: 10,
    color: LevelButtons.C.ink2, letterSpacing: '0.1em',
    textTransform: 'uppercase', display: 'block', marginBottom: '5px',
  }).text(text);
}

function showLevelDetail(level) {
  const C         = LevelButtons.C;
  const kindColor = KIND_COLOR[level.brutalKind] || C.terra;

  $('#levelDetailPanel').css({ display: 'flex', flexDirection: 'column' });
  $('#levelDetail').css({ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 });

  const detail = $('<div>').css({ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 });

  // ── Badges ──
  const badges = $('<div>').css({ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' });
  badges.append(
    $('<span>').css({ fontFamily: '"Geist Mono",monospace', fontSize: 12, color: C.ink2, letterSpacing: '0.1em' }).text(`LV.${level.num}`),
    $('<span>').css({ fontFamily: '"Geist Mono",monospace', fontSize: 10, padding: '3px 9px', borderRadius: 100, background: 'rgba(26,36,32,0.07)', color: C.ink, letterSpacing: '0.08em', textTransform: 'uppercase' }).text(level.category),
    $('<span>').css({ fontFamily: '"Geist Mono",monospace', fontSize: 10, padding: '3px 9px', borderRadius: 100, background: `${kindColor}22`, color: kindColor, letterSpacing: '0.08em' }).text(level.brutalKind || ''),
  );

  // ── Título + notas ──
  const titleBlock = $('<div>');
  titleBlock.append(
    $('<h2>').css({ fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }).text(level.name),
    $('<p>').css({ fontFamily: '"Geist Mono",monospace', fontSize: 12, color: C.ink2, margin: '6px 0 0', letterSpacing: '0.06em' }).text(level.notes),
  );

  // ── Dificultad ──
  const diffSection = $('<div>');
  diffSection.append(statLabel('Dificultad'));
  const iconsRow = $('<div>').css({ display: 'flex', gap: '6px', alignItems: 'flex-end', justifyContent: 'center' });
  const d = level.difficulty || 1;
  for (let i = 1; i <= 5; i++) {
    iconsRow.append(quaverIcon(d > 5 || i <= d));
  }
  if (d === 6) iconsRow.append(quaverIcon(true, true));
  if (d === 7) { iconsRow.append(quaverIcon(true, true)); iconsRow.append(quaverIcon(true, true)); }
  if (d > 5) {
    iconsRow.append(
      $('<span>').css({ fontFamily: '"Geist Mono",monospace', fontSize: 10, color: '#C8553D', letterSpacing: '0.06em', marginLeft: '4px', alignSelf: 'center' })
    );
  }
  diffSection.append(iconsRow);

  // ── Stats: claves · rondas · experiencia ──
  const statsRow = $('<div>').css({
    display: 'flex', gap: '0', alignItems: 'stretch',
    border: `1.5px solid rgba(26,36,32,0.1)`, borderRadius: '8px',
    overflow: 'hidden',
  });

  const cellStyle = { flex: 1, padding: '10px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center' };
  const divider   = () => $('<div>').css({ width: '1.5px', background: 'rgba(26,36,32,0.1)', flexShrink: 0 });

  // Claves
  const clefsCell = $('<div>').css(cellStyle);
  clefsCell.append(statLabel('Claves'));
  const clefIcons = $('<div>').css({ display: 'flex', gap: '6px', alignItems: 'center' });
  const trebleActive = (level.clefs || []).includes('treble');
  const bassActive   = (level.clefs || []).includes('bass');
  clefIcons.append($('<img>').attr('src', '/images/icons/treble.svg').css({ height: '52px', width: 'auto', opacity: trebleActive ? 1 : 0.2 }));
  clefIcons.append($('<img>').attr('src', '/images/icons/bass.svg').css({ height: '36px', width: 'auto', opacity: bassActive   ? 1 : 0.2 }));
  clefsCell.append(clefIcons);

  // Rondas
  const roundsCell = $('<div>').css(cellStyle);
  roundsCell.append(statLabel('Rondas'));
  roundsCell.append(
    $('<span>').css({ fontFamily: '"Geist Mono",monospace', fontSize: 22, fontWeight: 700, color: C.ink, lineHeight: 1 }).text(level.rounds ?? '—')
  );

  // Experiencia
  const expCell = $('<div>').css(cellStyle);
  expCell.append(statLabel('Experiencia'));
  expCell.append(
    $('<span>').css({ fontFamily: '"Geist Mono",monospace', fontSize: 22, fontWeight: 700, color: kindColor, lineHeight: 1 }).text(level.experience != null ? `+${level.experience}` : '—')
  );

  statsRow.append(clefsCell, divider(), roundsCell, divider(), expCell);

  // ── Descripción ──
  const desc = $('<p>').css({ fontSize: 14, lineHeight: 1.7, color: C.ink2, margin: 0 }).text(level.description || '');

  // ── Botón jugar ──
  const playBtn = $('<a>').attr('href', `/play/${level.id}`).css({
    display: 'block', textAlign: 'center', textDecoration: 'none',
    padding: '14px', marginTop: 'auto',
    background: C.ink, color: C.cream,
    border: `2.5px solid ${C.ink}`,
    boxShadow: `5px 5px 0 0 ${C.terra}`,
    fontFamily: '"Geist Mono",monospace', fontSize: 13,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    cursor: 'pointer',
  }).text('jugar ▸');

  detail.append(badges, titleBlock, diffSection, statsRow, desc, playBtn);

  $('#levelDetail').empty().append(detail).fadeIn(200);
}
