const LEVELS_LIST = [
  LevelButtons.LEVEL_NOTES_DRMF,
  LevelButtons.LEVEL_NOTES_SLS,
  LevelButtons.LEVEL_CHORD_CMAJOR,
  LevelButtons.LEVEL_ARP_CMAJOR,
  LevelButtons.LEVEL_ARP_DESC_CMAJOR,
  LevelButtons.LEVEL_ODA_1,
  LevelButtons.LEVEL_ODA_2,
  LevelButtons.LEVEL_ODA_3,
];

const KIND_COLOR = {
  MEL:   '#4A7FA5',
  CHORD: '#5E8A52',
  ARP:   '#A5724A',
};

LevelButtons.renderList('#levelList', 'VRow', LEVELS_LIST, 'available', '8px');

$('#levelList').on('click', 'button', function () {
  const level = $(this).data('level');
  if (!level) return;

  // Reset all rows, highlight selected
  $('#levelList button').css({
    border: `1px solid ${LevelButtons.C.rule}`,
    background: LevelButtons.C.paper,
    boxShadow: 'none',
  });
  $(this).css({
    border: '1.5px solid #C8553D',
    background: 'rgba(200,85,61,0.05)',
    boxShadow: '0 0 0 1px #C8553D',
  });

  localStorage.setItem('selectedLevelId', level.id);
  showLevelDetail(level);
  activatePlayBtns();
});

function showLevelDetail(level) {
  const C         = LevelButtons.C;
  const kindColor = KIND_COLOR[level.brutalKind] || C.terra;
  const staffHTML = LevelButtons.staffSVG(300, 90, C.ink, C.terra, level.staffMode, level.staffNotes, true);

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

  // Staff visualization
  const staffBox = $('<div>').css({
    background: 'rgba(255,255,255,0.65)', borderRadius: 12,
    padding: '16px', border: `1px solid ${C.rule}`,
  }).html(staffHTML);

  // Description
  const desc = $('<p>').css({
    fontSize: 15, lineHeight: 1.65, color: C.ink2, margin: 0,
  }).text(level.description || '');

  detail.append(badges, titleBlock, staffBox, desc);

  $('#noLevelSelected').hide();
  $('#levelDetail').empty().append(detail).fadeIn(200);
}

function activatePlayBtns() {
  ['easy', 'normal', 'hard'].forEach(diff => {
    const anchor = $(`#play${diff.charAt(0).toUpperCase() + diff.slice(1)}`);
    anchor.attr('href', `./atrapado/${diff}`);
    anchor.find('button').prop('disabled', false);
  });
}
