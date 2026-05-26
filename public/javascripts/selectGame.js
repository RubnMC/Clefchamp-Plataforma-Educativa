const LEVELS_LIST = [
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
];

const KIND_COLOR = {
  MEL:   '#4A7FA5',
  CHORD: '#5E8A52',
  ARP:   '#A5724A',
};

const levelGrid = $('<div>').css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '18px',
  padding: '4px 8px 8px 2px',
});
LEVELS_LIST.forEach(lvl => {
  const btn = LevelButtons.VARIANTS.V5Brutal('available', { ...lvl, brutalSize: 46 });
  btn.data('level', lvl).css('width', '100%');
  levelGrid.append(btn);
});
$('#levelList').empty().append(levelGrid);

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

  localStorage.setItem('selectedLevelId', level.id);
  showLevelDetail(level);
});

function showLevelDetail(level) {
  const C         = LevelButtons.C;
  const kindColor = KIND_COLOR[level.brutalKind] || C.terra;

  const detail = $('<div>').css({ display: 'flex', flexDirection: 'column', gap: '18px' });

  // Badges row
  const badges = $('<div>').css({ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' });
  badges.append(
    $('<span>').css({
      fontFamily: '"Geist Mono",monospace', fontSize: 12,
      color: C.ink2, letterSpacing: '0.1em',
    }).text(`LV.${level.num}`),
    $('<span>').css({
      fontFamily: '"Geist Mono",monospace', fontSize: 10,
      padding: '3px 9px', borderRadius: 100,
      background: 'rgba(26,36,32,0.07)', color: C.ink,
      letterSpacing: '0.08em', textTransform: 'uppercase',
    }).text(level.category),
    $('<span>').css({
      fontFamily: '"Geist Mono",monospace', fontSize: 10,
      padding: '3px 9px', borderRadius: 100,
      background: `${kindColor}22`, color: kindColor,
      letterSpacing: '0.08em',
    }).text(level.brutalKind || ''),
  );

  // Title + notes
  const titleBlock = $('<div>');
  titleBlock.append(
    $('<h2>').css({
      fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.03em',
      margin: 0, lineHeight: 1.1,
    }).text(level.name),
    $('<p>').css({
      fontFamily: '"Geist Mono",monospace', fontSize: 12,
      color: C.ink2, margin: '6px 0 0', letterSpacing: '0.06em',
    }).text(level.notes),
  );

  // Description
  const desc = $('<p>').css({
    fontSize: 15, lineHeight: 1.65, color: C.ink2, margin: 0,
  }).text(level.description || '');

  // Play button
  const playBtn = $('<a>').attr('href', './atrapado/normal').css({
    display: 'block', textAlign: 'center', textDecoration: 'none',
    padding: '14px', marginTop: '4px',
    background: C.ink, color: C.cream,
    border: `2.5px solid ${C.ink}`,
    boxShadow: `5px 5px 0 0 ${C.terra}`,
    fontFamily: '"Geist Mono",monospace', fontSize: 13,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    cursor: 'pointer',
  }).text('jugar ▸');

  detail.append(badges, titleBlock, desc, playBtn);

  $('#levelDetail').empty().append(detail).fadeIn(200);
}
