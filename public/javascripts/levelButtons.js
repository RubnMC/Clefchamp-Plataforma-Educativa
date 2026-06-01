/*!
 * levelButtons.js — jQuery factories para tarjetas de nivel de Clefchamp.
 *
 * Uso rápido:
 *   LevelButtons.render('#mi-div', 'V5Brutal', LevelButtons.LEVEL_CHORD_CMAJOR, 'available');
 *
 * Renderizar los 4 estados en fila:
 *   LevelButtons.renderStates('#mi-div', 'V1Minimal', LevelButtons.LEVEL_ARP_CMAJOR);
 *
 * Depende de jQuery (ya incluido en head.ejs).
 */
const LevelButtons = (() => {

  // ─── Paleta ───────────────────────────────────────────────────────────────
  const C = {
    ink:    '#1A2420',
    ink2:   '#3D4845',
    cream:  '#F4EFE6',
    paper:  '#FAF7F1',
    rule:   'rgba(26,36,32,0.10)',
    terra:  '#C8553D',
    shadow: '0 1px 0 rgba(26,36,32,0.04), 0 8px 24px -12px rgba(26,36,32,0.18)',
  };

  // ─── Configs de nivel ─────────────────────────────────────────────────────

  const LEVEL_TUTORIAL = {
    id: 'tutorial-level', num: '00', category: 'Tutorial',
    name: 'Tutorial', cifrado: 'INTRO', cifradoLong: 'Intro',
    roman: 'inicio', notes: 'do · re · mi', notesSep: 'do re mi',
    brutalMain: 'TUTO', brutalSub: 'aprende',
    brutalHeaderRight: 'DO · RE · MI', brutalKind: 'MEL',
    isTutorial: true,
    description: 'Aprende a identificar notas musicales paso a paso. Solo usarás Do, Re y Mi en 8 rondas guiadas con bocadillos explicativos en cada momento clave.',
  };

  const LEVEL_CHORD_CMAJOR = {
    id: 'chord-c-major', num: '03', category: 'Acordes',
    name: 'Do mayor', cifrado: 'C', cifradoLong: 'CMaj', roman: 'I',
    notes: 'do – mi – sol', notesSpread: 'do · mi · sol', notesSep: 'do mi sol',
    detail: '3 notas', brutalMain: 'DO', brutalSub: 'mayor',
    brutalHeaderRight: 'C / DO MI SOL', brutalKind: 'CHORD',
    staffMode: 'triad', pianoMode: 'triad',
    description: 'El acorde de Do mayor se forma con tres notas simultáneas: Do, Mi y Sol. Es el acorde más básico de la armonía occidental y punto de partida para entender la tonalidad.',
  };

  const LEVEL_ARP_CMAJOR = {
    id: 'arp-c-major', num: '07', category: 'Arpegios',
    name: 'Arpegio de Do', cifrado: 'C↗', cifradoLong: 'C esc.', roman: 'I · esc.',
    notes: 'do re mi fa sol la si do', notesSpread: 'do→do · 8 notas', notesSep: 'do → do',
    detail: '8 notas asc.', brutalMain: 'DO', brutalSub: 'arpegio ↗',
    brutalHeaderRight: 'C / DO → DO', brutalKind: 'ARP',
    staffMode: 'scale', pianoMode: 'scale',
    description: 'Toca las ocho notas de la escala de Do mayor en orden ascendente. Los arpegios entrenan la memoria muscular y la fluidez lectora de todo el pentagrama.',
  };

  const LEVEL_NOTES_DRMF = {
    id: 'notes-do-re-mi-fa', num: '01', category: 'Notas',
    name: 'Do · Re · Mi · Fa', cifrado: '4 notas', cifradoLong: 'tetra',
    roman: 'frase 1', notes: 'do re mi fa', notesSep: 'do re mi fa',
    brutalMain: 'DO', brutalSub: '→ re mi fa',
    brutalHeaderRight: 'DO → FA', brutalKind: 'MEL',
    staffNotes: ['C4','D4','E4','F4'], pianoHighlight: [0,1,2,3],
    description: 'Las cuatro primeras notas del pentagrama en clave de sol. Aprende a identificarlas de un vistazo: son la base sobre la que se construyen todas las melodías que vendrán.',
  };

  const LEVEL_NOTES_SLS = {
    id: 'notes-sol-la-si', num: '02', category: 'Notas',
    name: 'Sol · La · Si', cifrado: '3 notas', cifradoLong: 'tri',
    roman: 'frase 2', notes: 'sol la si', notesSep: 'sol la si',
    brutalMain: 'SOL', brutalSub: '→ la si',
    brutalHeaderRight: 'SOL → SI', brutalKind: 'MEL',
    staffNotes: ['G4','A4','B4'], pianoHighlight: [4,5,6],
    description: 'Completa las siete notas naturales con Sol, La y Si. Junto al nivel anterior, ya tendrás dominio de toda la octava central y podrás leer la mayoría de melodías sencillas.',
  };

  const LEVEL_ARP_DESC_CMAJOR = {
    id: 'arp-desc-c-major', num: '08', category: 'Arpegios',
    name: 'Arpegio de Do ↘', cifrado: 'C↘', cifradoLong: 'C ↘',
    roman: 'I desc.', notes: 'do sol mi do', notesSep: 'do → sol → mi → do',
    brutalMain: 'DO', brutalSub: 'arpegio ↘',
    brutalHeaderRight: 'DO → DO ↘', brutalKind: 'ARP',
    staffNotes: ['C5','G4','E4','C4'], pianoHighlight: [0,2,4],
    description: 'Ahora el arpegio desciende: Do alto, Sol, Mi, Do. Leer en dirección descendente requiere un esfuerzo distinto al ascendente. ¡Entrena ambas direcciones para leer cualquier melodía!',
  };

  const LEVEL_ODA_1 = {
    id: 'oda-1', num: '12', category: 'Melodías',
    name: 'Oda a la Alegría · I', cifrado: 'Oda I', cifradoLong: 'Oda I',
    roman: 'parte i', notes: 'mi mi fa sol sol fa mi re', notesSep: 'mi mi fa sol …',
    brutalMain: 'ODA', brutalSub: 'alegría · i',
    brutalHeaderRight: 'I · BEETHOVEN', brutalKind: 'MEL',
    staffNotes: ['E4','E4','F4','G4','G4','F4','E4','D4'],
    description: 'Primera frase de la Oda a la Alegría de Beethoven (9.ª Sinfonía, 1824). Una de las melodías más reconocibles del mundo: Mi Mi Fa Sol Sol Fa Mi Re.',
  };

  const LEVEL_ODA_2 = {
    id: 'oda-2', num: '13', category: 'Melodías',
    name: 'Oda a la Alegría · II', cifrado: 'Oda II', cifradoLong: 'Oda II',
    roman: 'parte ii', notes: 'do do re mi mi re do', notesSep: 'do do re mi re do',
    brutalMain: 'ODA', brutalSub: 'alegría · ii',
    brutalHeaderRight: 'II · BEETHOVEN', brutalKind: 'MEL',
    staffNotes: ['C4','C4','D4','E4','D4','C4','C4','D4'],
    description: 'Segunda frase de la Oda: Do Do Re Mi Mi Re Do. Más grave que la primera, esta sección cierra el tema principal antes de que regrese la melodía inicial.',
  };

  const LEVEL_ODA_3 = {
    id: 'oda-3', num: '14', category: 'Melodías',
    name: 'Oda a la Alegría · III', cifrado: 'Oda III', cifradoLong: 'Oda III',
    roman: 'parte iii (puente)', notes: 're re mi do re mi fa mi', notesSep: 'puente',
    brutalMain: 'ODA', brutalSub: 'alegría · iii',
    brutalHeaderRight: 'III · BEETHOVEN', brutalKind: 'MEL',
    staffNotes: ['D4','D4','E4','C4','D4','E4','F4','E4'],
    description: 'El puente de la Oda: Re Re Mi Do Re Mi Fa Mi. Este fragmento conecta las dos frases principales y añade movimiento y tensión antes del regreso al tema.',
  };

  const LEVEL_CHORD_GMAJOR = {
    id: 'chord-g-major', num: '04', category: 'Acordes',
    name: 'Sol mayor', cifrado: 'G', cifradoLong: 'GMaj', roman: 'V',
    notes: 'sol – si – re', notesSpread: 'sol · si · re', notesSep: 'sol si re',
    detail: '3 notas', brutalMain: 'SOL', brutalSub: 'mayor',
    brutalHeaderRight: 'G / SOL SI RE', brutalKind: 'CHORD',
    staffMode: 'triad', pianoMode: 'triad',
    staffNotes: ['G4','B4','D5'], pianoHighlight: [1,4,6],
    description: 'El acorde de Sol mayor (G) se construye sobre el quinto grado de la escala de Do. Junto a Do mayor y Fa mayor forma la tríada armónica base de innumerables canciones populares.',
  };

  const LEVEL_CHORD_FMAJOR = {
    id: 'chord-f-major', num: '05', category: 'Acordes',
    name: 'Fa mayor', cifrado: 'F', cifradoLong: 'FMaj', roman: 'IV',
    notes: 'fa – la – do', notesSpread: 'fa · la · do', notesSep: 'fa la do',
    detail: '3 notas', brutalMain: 'FA', brutalSub: 'mayor',
    brutalHeaderRight: 'F / FA LA DO', brutalKind: 'CHORD',
    staffMode: 'triad', pianoMode: 'triad',
    staffNotes: ['F4','A4','C5'], pianoHighlight: [0,3,5],
    description: 'El acorde de Fa mayor (F) ocupa el cuarto grado de la escala de Do. Junto a Do y Sol cierra la progresión I-IV-V, la base armónica más usada en pop, blues y rock.',
  };

  const LEVEL_CHORD_AMINOR = {
    id: 'chord-a-minor', num: '06', category: 'Acordes',
    name: 'La menor', cifrado: 'Am', cifradoLong: 'Am', roman: 'vi',
    notes: 'la – do – mi', notesSpread: 'la · do · mi', notesSep: 'la do mi',
    detail: '3 notas', brutalMain: 'LA', brutalSub: 'menor',
    brutalHeaderRight: 'Am / LA DO MI', brutalKind: 'CHORD',
    staffMode: 'triad', pianoMode: 'triad',
    staffNotes: ['A4','C5','E5'], pianoHighlight: [0,2,5],
    description: 'La menor (Am) es el relativo menor de Do mayor: comparte las mismas notas pero empieza en La. Es uno de los acordes más expresivos y reconocibles en música popular y clásica.',
  };

  const LEVEL_MEL_MARY = {
    id: 'mel-mary', num: '09', category: 'Melodías',
    name: 'María y el Corderito', cifrado: 'Mary', cifradoLong: 'Mary',
    roman: 'trad.', notes: 'mi re do re mi mi mi', notesSep: 'mi re do re …',
    brutalMain: 'MARY', brutalSub: 'corderito',
    brutalHeaderRight: 'TRAD. · 7 NOTAS', brutalKind: 'MEL',
    staffNotes: ['E4','D4','C4','D4','E4','E4','E4'],
    description: 'Mary Had a Little Lamb usa solo tres alturas (Do, Re, Mi) en movimiento conjunto. Perfecta para consolidar la lectura de la zona central del pentagrama y entrenar el ojo en pasos de segunda.',
  };

  const LEVEL_MEL_CUMPLE = {
    id: 'mel-cumple', num: '10', category: 'Melodías',
    name: 'Cumpleaños Feliz', cifrado: 'Cumple', cifradoLong: 'Cumple',
    roman: 'trad.', notes: 'sol sol la sol do si', notesSep: 'sol sol la …',
    brutalMain: 'CUM\nPLE', brutalSub: 'feliz',
    brutalHeaderRight: 'TRAD. · 6 NOTAS', brutalKind: 'MEL',
    staffNotes: ['G4','G4','A4','G4','C5','B4'],
    description: 'La primera frase de Cumpleaños Feliz combina pasos de segunda con un salto de cuarta (Sol→Do). Practicar este salto interválico es clave para leer melodías con movimiento mixto.',
  };

  const LEVEL_MEL_CAMPANITA = {
    id: 'mel-campanita', num: '11', category: 'Melodías',
    name: 'Campanita', cifrado: 'Jingle', cifradoLong: 'Jingle',
    roman: 'trad.', notes: 'mi mi mi · mi mi mi · mi sol do re mi', notesSep: 'mi mi mi …',
    brutalMain: 'JIN\nGLE', brutalSub: 'bells',
    brutalHeaderRight: 'TRAD. · 8 NOTAS', brutalKind: 'MEL',
    staffNotes: ['E4','E4','E4','E4','G4','C4','D4','E4'],
    description: 'El arranque de Jingle Bells en Do mayor: tres Mi repetidos que saltan a Sol, bajan a Do y suben por grado. Un clásico para trabajar la repetición de notas y los saltos de tercera.',
  };

  // ─── Metadatos de juego por nivel ────────────────────────────────────────
  const LEVEL_META = {
    'tutorial-level':    { difficulty: 1, clefs: ['treble'], rounds: 8,  experience: 5  },
    'notes-do-re-mi-fa': { difficulty: 2, clefs: ['treble'], rounds: 20, experience: 17 },
    'notes-sol-la-si':   { difficulty: 2, clefs: ['treble'], rounds: 20, experience: 17 },
    'chord-c-major':     { difficulty: 3, clefs: ['treble'], rounds: 20, experience: 17 },
    'chord-g-major':     { difficulty: 3, clefs: ['treble'], rounds: 20, experience: 17 },
    'chord-f-major':     { difficulty: 3, clefs: ['treble'], rounds: 20, experience: 17 },
    'chord-a-minor':     { difficulty: 4, clefs: ['treble'], rounds: 20, experience: 17 },
    'arp-c-major':       { difficulty: 4, clefs: ['treble'], rounds: 20, experience: 17 },
    'arp-desc-c-major':  { difficulty: 5, clefs: ['treble'], rounds: 20, experience: 17 },
    'mel-mary':          { difficulty: 2, clefs: ['treble'], rounds: 7,  experience: 17 },
    'mel-cumple':        { difficulty: 3, clefs: ['treble'], rounds: 6,  experience: 17 },
    'mel-campanita':     { difficulty: 3, clefs: ['treble'], rounds: 8,  experience: 17 },
    'oda-1':             { difficulty: 5, clefs: ['treble'], rounds: 8,  experience: 17 },
    'oda-2':             { difficulty: 5, clefs: ['treble'], rounds: 8,  experience: 17 },
    'oda-3':             { difficulty: 6, clefs: ['treble'], rounds: 8,  experience: 17 },
  };

  // ─── SVGs de indicadores ──────────────────────────────────────────────────

  function noteIconSVG(filled, extra = false) {
    const baseColor = extra ? '#C8553D' : '#350D40';
    const c = filled ? baseColor : `${baseColor}33`;
    return `<svg viewBox="0 0 12 28" width="11" height="28" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:bottom">
      <ellipse cx="5" cy="23.5" rx="4.2" ry="2.8" transform="rotate(-20 5 23.5)" fill="${c}"/>
      <line x1="8.8" y1="22.5" x2="8.8" y2="3" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M8.8 3 Q15 6 8.8 12" stroke="${c}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <path d="M8.8 8 Q15 11 8.8 17" stroke="${c}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  function trebleClefSVG(active) {
    const c = active ? '#350D40' : 'rgba(53,13,64,0.2)';
    return `<svg viewBox="0 0 14 40" width="14" height="40" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 2 C7 2 7 35 7 37 C7 39 4.5 39 3.5 37 C2.5 35 4.5 33.5 6.5 34.5"
            stroke="${c}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 15.5 C11 14.5 13.5 17.5 13.5 21.5 C13.5 25.5 10.5 27.5 7 26.5
               C3.5 25.5 1.5 22.5 2 18.5 C2.5 14.5 5 12 7 11
               C10.5 9.5 13.5 11 13.5 7 C13.5 3 9 2 7 4"
            stroke="${c}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  function bassClefSVG(active) {
    const c = active ? '#350D40' : 'rgba(53,13,64,0.2)';
    return `<svg viewBox="0 0 18 26" width="18" height="26" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3 C8 2 2 6 2 13 C2 20 8 24 12 23"
            stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <circle cx="15.5" cy="8"  r="2" fill="${c}"/>
      <circle cx="15.5" cy="14" r="2" fill="${c}"/>
    </svg>`;
  }

  const LEVELS = Object.fromEntries(
    Object.entries({
      LEVEL_TUTORIAL,
      LEVEL_CHORD_CMAJOR, LEVEL_CHORD_GMAJOR, LEVEL_CHORD_FMAJOR, LEVEL_CHORD_AMINOR,
      LEVEL_ARP_CMAJOR, LEVEL_ARP_DESC_CMAJOR,
      LEVEL_NOTES_DRMF, LEVEL_NOTES_SLS,
      LEVEL_MEL_MARY, LEVEL_MEL_CUMPLE, LEVEL_MEL_CAMPANITA,
      LEVEL_ODA_1, LEVEL_ODA_2, LEVEL_ODA_3,
    }).map(([key, lvl]) => [key, { ...lvl, ...(LEVEL_META[lvl.id] || {}) }])
  );

  // ─── Metadata de estado ───────────────────────────────────────────────────
  const STATE_LABEL = {
    locked: 'Bloqueado', available: 'Disponible',
    progress: 'En progreso', done: 'Completado',
  };

  function stateMeta(state) {
    return {
      locked:    { label: 'Bloqueado', pct: 0,    dim: true,  glyph: 'lock'  },
      available: { label: 'Empezar',   pct: 0,    dim: false, glyph: 'play'  },
      progress:  { label: 'Continuar', pct: 0.45, dim: false, glyph: 'play'  },
      done:      { label: 'Repasar',   pct: 1,    dim: false, glyph: 'check' },
    }[state] || { label: 'Empezar', pct: 0, dim: false, glyph: 'play' };
  }

  // ─── Iconos SVG ───────────────────────────────────────────────────────────
  function iconLock(size, color) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
  }
  function iconPlay(size, color) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" fill="${color}"/></svg>`;
  }
  function iconCheck(size, color) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>`;
  }
  function iconStars(count, size, color) {
    return Array.from({ length: count }, () =>
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="${color}"/></svg>`
    ).join('');
  }

  // ─── Pentagrama SVG ───────────────────────────────────────────────────────
  // Grado diatónico 0 = E4 (línea inferior del pentagrama de clave de sol)
  const NOTE_STEP = {
    C4: -2, D4: -1, E4: 0, F4: 1, G4: 2,
    A4:  3, B4:  4, C5: 5, D5: 6, E5: 7, F5: 8,
  };

  function staffSVG(width, height, ink, accent, mode, customNotes, showClef) {
    const padV  = 6;
    const padH  = showClef ? 20 : 4;
    const staffH = height - 2 * padV;
    const lineGap = staffH / 4;
    const topY    = padV;
    const noteR   = lineGap * 0.38;

    // 5 líneas del pentagrama
    let linesHTML = '';
    for (let i = 0; i < 5; i++) {
      const y = topY + i * lineGap;
      linesHTML += `<line x1="${padH}" y1="${y}" x2="${width - 3}" y2="${y}" stroke="${ink}" stroke-width="0.8" opacity="0.4"/>`;
    }

    // Y para un grado (grado 0 = E4 en línea inferior)
    const stepY = s => topY + 4 * lineGap - s * (lineGap / 2);

    // Notas a dibujar
    let notes;
    if (customNotes && customNotes.length) {
      notes = customNotes;
    } else if (mode === 'scale') {
      notes = ['C4','D4','E4','F4','G4','A4','B4','C5'];
    } else {
      notes = ['C4','E4','G4']; // triad por defecto
    }

    // Eliminar duplicados para el pentagrama (ej. ODA tiene notas repetidas)
    const uniqueNotes = customNotes ? notes : [...new Set(notes)];

    let notesHTML = '', ledgersHTML = '';
    const isChord = mode === 'triad' && !customNotes;

    if (isChord) {
      const cx = padH + (width - padH - 3) / 2;
      uniqueNotes.forEach(n => {
        const s = NOTE_STEP[n] ?? 0;
        const cy = stepY(s);
        notesHTML += `<ellipse cx="${cx}" cy="${cy}" rx="${noteR * 1.1}" ry="${noteR * 0.85}" fill="${accent}"/>`;
        if (s <= -2) {
          ledgersHTML += `<line x1="${cx - noteR * 2.2}" y1="${cy}" x2="${cx + noteR * 2.2}" y2="${cy}" stroke="${ink}" stroke-width="0.8"/>`;
        }
      });
      // Plica hacia arriba desde la nota más alta
      const maxStep = Math.max(...uniqueNotes.map(n => NOTE_STEP[n] ?? 0));
      const stemX = cx + noteR;
      notesHTML += `<line x1="${stemX}" y1="${stepY(-2)}" x2="${stemX}" y2="${stepY(maxStep) - lineGap * 1.5}" stroke="${ink}" stroke-width="0.9"/>`;
    } else {
      const n = notes.length;
      const xStart = padH + 4;
      const xEnd   = width - 5;
      notes.forEach((note, i) => {
        const s  = NOTE_STEP[note] ?? 0;
        const cx = n > 1 ? xStart + i * (xEnd - xStart) / (n - 1) : (padH + width) / 2;
        const cy = stepY(s);
        notesHTML += `<ellipse cx="${cx}" cy="${cy}" rx="${noteR * 1.05}" ry="${noteR * 0.8}" fill="${accent}"/>`;
        if (s <= -2) {
          ledgersHTML += `<line x1="${cx - noteR * 2.2}" y1="${cy}" x2="${cx + noteR * 2.2}" y2="${cy}" stroke="${ink}" stroke-width="0.8"/>`;
        }
        // Plica: hacia arriba si la nota está por debajo de la línea central (grado < 4)
        const dir = s < 4 ? -1 : 1;
        const sx  = s < 4 ? cx + noteR : cx - noteR;
        notesHTML += `<line x1="${sx}" y1="${cy}" x2="${sx}" y2="${cy + dir * lineGap * 1.5}" stroke="${ink}" stroke-width="0.8"/>`;
      });
    }

    const clefHTML = showClef
      ? `<text x="1" y="${topY + staffH * 0.82}" font-size="${Math.round(staffH * 1.1)}" fill="${ink}" font-family="serif" opacity="0.55">𝄞</text>`
      : '';

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible">${linesHTML}${ledgersHTML}${clefHTML}${notesHTML}</svg>`;
  }

  // ─── Piano SVG ────────────────────────────────────────────────────────────
  // Índices de teclas blancas: 0=C  1=D  2=E  3=F  4=G  5=A  6=B
  function pianoSVG(width, height, mode, ink, highlightColor, whiteColor, customHL) {
    const nW = 7;
    const kW = width / nW;
    const bW = kW * 0.55, bH = height * 0.62;

    let hlWhite;
    if (customHL) {
      hlWhite = customHL;
    } else if (mode === 'scale') {
      hlWhite = [0,1,2,3,4,5,6];
    } else {
      hlWhite = [0,2,4]; // triad C E G
    }

    let whites = '', blacks = '';
    for (let i = 0; i < nW; i++) {
      const x  = i * kW;
      const hl = hlWhite.includes(i);
      whites += `<rect x="${x + 0.5}" y="0.5" width="${kW - 1}" height="${height - 1}" rx="2" fill="${hl ? highlightColor : whiteColor}" stroke="${ink}" stroke-width="0.7"/>`;
    }
    // Teclas negras después de las blancas 0,1,3,4,5 (no hay negra después de E ni B)
    [0,1,3,4,5].forEach(pos => {
      const x = (pos + 1) * kW - bW / 2;
      blacks += `<rect x="${x}" y="0" width="${bW}" height="${bH}" rx="1.5" fill="${ink}"/>`;
    });

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="display:block">${whites}${blacks}</svg>`;
  }

  // ─── Utilidades ──────────────────────────────────────────────────────────
  const BASE = {
    appearance: 'none', border: 'none', background: 'none',
    cursor: 'pointer', textAlign: 'left',
    fontFamily: '"Geist", system-ui, sans-serif',
    color: C.ink, padding: 0, margin: 0,
  };

  function actionCircle(state, m, size) {
    const locked = state === 'locked';
    const circle = $('<div>').css({
      width: size, height: size, borderRadius: 999, flexShrink: 0,
      background: locked ? 'transparent' : C.ink,
      color: C.cream, display: 'grid', placeItems: 'center',
      border: locked ? `1px solid ${C.rule}` : 'none',
    });
    if (m.glyph === 'lock')  circle.html(iconLock (Math.round(size * 0.38), C.ink2));
    if (m.glyph === 'play')  circle.html(iconPlay (Math.round(size * 0.34), C.cream));
    if (m.glyph === 'check') circle.html(iconCheck(Math.round(size * 0.41), C.cream));
    return circle;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // V1 — Notación minimal
  // ═══════════════════════════════════════════════════════════════════════════
  function V1Minimal(state, level) {
    state = state || 'available';
    level = level || LEVEL_CHORD_CMAJOR;
    const m      = stateMeta(state);
    const isScale = level.staffMode === 'scale';
    const staffW  = isScale ? 132 : 88;
    const cardW   = isScale ? 360 : 320;
    const accent  = m.dim ? C.ink2 : C.terra;

    const thumb = $('<div>').css({
      background: '#fff', borderRadius: 10, padding: '4px 2px',
      border: `1px solid ${C.rule}`, overflow: 'hidden', flexShrink: 0,
    }).html(staffSVG(staffW, 64, C.ink, accent, level.staffMode, level.staffNotes, true));

    const textBlock = $('<div>').css({ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }).append(
      $('<div>').css({ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.ink2, fontWeight: 500 })
               .text(`Nivel ${level.num} · ${level.category}`),
      $('<div>').css({ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.1 })
               .text(level.name),
      $('<div>').css({ fontSize: 12, color: C.ink2, fontFamily: '"Geist Mono", monospace',
                       whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })
               .text(`${level.cifrado} · ${level.notes}`),
    );

    const right = $('<div>').css({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 });
    if (state === 'locked')   right.append($('<span>').html(iconLock(14, C.ink2)));
    if (state === 'done')     right.append($('<span>').html(iconStars(3, 11, C.terra)));
    if (state === 'progress') right.append($('<span>').css({ fontSize: 11, fontFamily: '"Geist Mono",monospace', color: C.terra })
                                                      .text(`${Math.round(m.pct * 100)}%`));
    right.append(actionCircle(state, m, 32));

    return $('<button>').css({
      ...BASE, width: cardW, background: C.paper, borderRadius: 16,
      boxShadow: C.shadow, padding: '14px 16px', display: 'grid',
      gridTemplateColumns: `${staffW + 8}px 1fr auto`, gap: '14px',
      alignItems: 'center', opacity: m.dim ? 0.45 : 1,
      border: `1px solid ${C.rule}`,
    }).append(thumb, textBlock, right);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // V2 — Editorial pautado
  // ═══════════════════════════════════════════════════════════════════════════
  function V2Editorial(state, level) {
    state = state || 'available';
    level = level || LEVEL_CHORD_CMAJOR;
    const m       = stateMeta(state);
    const isScale = level.staffMode === 'scale';
    const cardW   = isScale ? 320 : 240;
    const staffW  = isScale ? 280 : 160;
    const accent  = m.dim ? C.ink2 : (state === 'done' ? C.terra : C.ink);

    const header = $('<div>').css({
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      borderBottom: `1px solid ${C.rule}`, paddingBottom: 8,
    }).append(
      $('<span>').css({ fontFamily: '"Instrument Serif","EB Garamond",serif', fontSize: 13, fontStyle: 'italic', color: C.ink2 })
                 .text(`Nº ${level.num} — ${level.category}`),
      $('<span>').css({ fontFamily: '"Geist Mono",monospace', fontSize: 10, color: C.ink2 })
                 .text(level.roman),
    );

    const staffDiv = $('<div>').css({ display: 'grid', placeItems: 'center', padding: '4px 0' })
      .html(staffSVG(staffW, isScale ? 80 : 76, C.ink, accent, level.staffMode, level.staffNotes, true));

    const nameDiv = $('<div>').append(
      $('<div>').css({ fontFamily: '"Instrument Serif","EB Garamond",serif',
                       fontSize: isScale ? 26 : 28, lineHeight: 1, letterSpacing: '-0.01em' })
               .text(level.name),
      $('<div>').css({ fontFamily: '"Geist Mono",monospace', fontSize: 10, color: C.ink2,
                       marginTop: 4, letterSpacing: '0.08em' })
               .text(`${level.cifrado} · ${level.notesSep || level.notes}`),
    );

    const actionDiv = $('<div>').css({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 });
    if (state === 'locked')    actionDiv.append($('<span>').html(iconLock(14, C.ink2)));
    if (state === 'available') actionDiv.append($('<span>').css({ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontSize: 13, color: C.terra }).text('empezar →'));
    if (state === 'progress')  actionDiv.append($('<span>').css({ fontFamily: '"Geist Mono",monospace', fontSize: 11, color: C.terra }).text(`${Math.round(m.pct * 100)}%`));
    if (state === 'done')      actionDiv.append($('<span>').html(iconStars(3, 12, C.terra)));

    const footer = $('<div>').css({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' })
      .append(nameDiv, actionDiv);

    return $('<button>').css({
      ...BASE, width: cardW, background: C.paper, borderRadius: 4,
      padding: '18px 18px 14px', display: 'flex', flexDirection: 'column', gap: '14px',
      opacity: m.dim ? 0.4 : 1, border: `1px solid ${C.ink}`,
      boxShadow: `4px 4px 0 0 ${C.ink}`,
    }).append(header, staffDiv, footer);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // V5 — Brutalista
  // ═══════════════════════════════════════════════════════════════════════════
  function V5Brutal(state, level) {
    state = state || 'available';
    level = level || LEVEL_CHORD_CMAJOR;
    const m       = stateMeta(state);
    const accent  = m.dim ? C.ink2 : C.terra;
    const hasNotes = !!level.staffNotes;
    const isScale  = level.staffMode === 'scale';
    const isWide   = isScale || (hasNotes && level.staffNotes.length >= 6);
    const isMed    = hasNotes && level.staffNotes.length >= 4 && !isWide;
    const cardW    = level.brutalWidth  ?? (isWide ? 320 : isMed ? 290 : 260);
    const staffW   = isWide ? 138 : isMed ? 108 : 84;
    const kind     = level.brutalKind || level.kind || 'CHORD';
    const topRight = level.brutalHeaderRight
      || (isScale ? `${(level.cifrado || '').replace('↗', '').trim()} / DO → DO`
                  : `${level.cifrado} / DO – MI – SOL`);

    const bSize = level.brutalSize ?? 76;
    const bCase = level.brutalCase || 'upper';
    const bFont = level.brutalFont || '"Geist", sans-serif';

    const headerBar = $('<div>').css({
      display: 'flex', justifyContent: 'space-between', padding: '6px 10px',
      borderBottom: `2.5px solid ${C.ink}`,
      fontFamily: '"Geist Mono",monospace', fontSize: 10, letterSpacing: '0.12em',
    }).append(
      $('<span>').text(`LV.${level.num} / ${(level.roman || '').toUpperCase()} — ${kind}`),
      $('<span>').text(topRight),
    );

    const bigType = $('<div>').css({
      fontFamily: bFont, fontWeight: bSize >= 56 ? 800 : 700,
      fontSize: bSize, lineHeight: bSize >= 56 ? 0.85 : 0.95,
      letterSpacing: bSize >= 56 ? '-0.05em' : '-0.02em',
      textTransform: bCase === 'mixed' ? 'none' : 'uppercase',
      color: C.ink, whiteSpace: 'pre-line', overflowWrap: 'break-word',
    }).text(level.brutalMain || '');

    const subRow = $('<div>').css({
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4, gap: '10px',
    }).append(
      $('<div>').css({ fontFamily: '"Geist",sans-serif', fontWeight: 600, fontSize: 16,
                       letterSpacing: '-0.02em', color: accent, lineHeight: 1.15 })
               .text(level.brutalSub || ''),
      $('<div>').html(staffSVG(staffW, 56, C.ink, accent, level.staffMode, level.staffNotes, false)),
    );

    const body = $('<div>').css({ padding: '10px 14px 12px' }).append(bigType, subRow);

    const stateDiv = $('<div>').css({
      flex: 1, padding: '8px 10px', borderRight: `2.5px solid ${C.ink}`,
      display: 'flex', alignItems: 'center', gap: '6px',
    });
    if (state === 'locked')    stateDiv.append($('<span>').html(iconLock(11, C.ink)), $('<span>').text(' bloqueado'));
    if (state === 'available') stateDiv.text('disponible');
    if (state === 'progress')  stateDiv.text(`${Math.round(m.pct * 100)}% hecho`);
    if (state === 'done')      stateDiv.append($('<span>').html(iconCheck(11, C.terra)), $('<span>').text(' completo'));

    const playDiv = $('<div>').css({
      padding: '8px 12px', minWidth: 64, textAlign: 'center',
      background: m.dim ? C.paper : C.ink,
      color: m.dim ? C.ink2 : C.cream,
      fontFamily: '"Geist Mono",monospace', fontSize: 11,
      textTransform: 'uppercase', letterSpacing: '0.08em',
    }).text(state === 'done' ? '★ ★ ★' : state === 'locked' ? '— — —' : 'play ▸');

    const footerBar = $('<div>').css({
      display: 'flex', borderTop: `2.5px solid ${C.ink}`,
    }).append(stateDiv, playDiv);

    return $('<button>').css({
      ...BASE, width: cardW, background: C.paper,
      border: `2.5px solid ${C.ink}`, padding: 0,
      overflow: 'hidden', position: 'relative',
      boxShadow: `5px 5px 0 0 ${C.ink}`,
      opacity: m.dim ? 0.55 : 1,
    }).append(headerBar, body, footerBar);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // V6 — Teclado
  // ═══════════════════════════════════════════════════════════════════════════
  function V6Keyboard(state, level) {
    state = state || 'available';
    level = level || LEVEL_CHORD_CMAJOR;
    const m        = stateMeta(state);
    const dim      = m.dim;
    const hlColor  = dim ? '#D7CFBE' : C.terra;

    const header = $('<div>').css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }).append(
      $('<span>').css({ fontFamily: '"Geist Mono",monospace', fontSize: 10, color: C.ink2, letterSpacing: '0.1em' })
                 .text(`${level.num} · ${(level.category || '').toUpperCase()}`),
      $('<span>').css({
        padding: '2px 7px', borderRadius: 4,
        fontFamily: '"Geist Mono",monospace', fontSize: 10, fontWeight: 600,
        background: dim ? 'transparent' : C.terra,
        color: dim ? C.ink2 : C.cream,
        border: dim ? `1px solid ${C.rule}` : 'none',
      }).text(level.cifradoLong || level.cifrado),
    );

    const pianoDiv = $('<div>').css({ display: 'grid', placeItems: 'center', padding: '4px 0 2px' })
      .html(pianoSVG(168, 72, level.pianoMode, C.ink, hlColor, C.paper, level.pianoHighlight));

    const nameBlock = $('<div>').append(
      $('<div>').css({ fontSize: 15, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.01em' }).text(level.name),
      $('<div>').css({ fontSize: 10, color: C.ink2, marginTop: 3,
                       fontFamily: '"Geist Mono",monospace', letterSpacing: '0.06em' })
               .text(level.notesSep || level.notes || ''),
    );

    const footer = $('<div>').css({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' })
      .append(nameBlock, actionCircle(state, m, 28));

    const btn = $('<button>').css({
      ...BASE, width: 200, background: C.paper, borderRadius: 18, padding: '16px',
      display: 'flex', flexDirection: 'column', gap: '12px',
      border: `1px solid ${C.rule}`, boxShadow: C.shadow,
      opacity: dim ? 0.55 : 1,
    }).append(header, pianoDiv, footer);

    if (state === 'progress') {
      const track = $('<div>').css({ height: 3, borderRadius: 2, background: 'rgba(26,36,32,0.10)', overflow: 'hidden', marginTop: '-4px' });
      track.append($('<div>').css({ width: `${m.pct * 100}%`, height: '100%', background: C.terra }));
      btn.append(track);
    }
    if (state === 'done') {
      btn.append($('<div>').css({ marginTop: '-4px' }).html(iconStars(3, 11, C.terra)));
    }

    return btn;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VRow — Fila compacta de ancho completo para la lista de selección
  // ═══════════════════════════════════════════════════════════════════════════
  function VRow(state, level) {
    state = state || 'available';
    level = level || LEVEL_NOTES_DRMF;
    const m   = stateMeta(state);
    const dim = m.dim;

    const numTag = $('<span>').css({
      fontFamily: '"Geist Mono",monospace', fontSize: 11,
      fontWeight: 600, color: dim ? C.ink2 : C.ink,
      flexShrink: 0, minWidth: 28,
    }).text(level.num);

    const catTag = $('<span>').css({
      fontFamily: '"Geist Mono",monospace', fontSize: 9,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: 100, flexShrink: 0,
      background: dim ? 'transparent' : 'rgba(200,85,61,0.10)',
      color: dim ? C.ink2 : C.terra,
      border: `1px solid ${dim ? C.rule : 'rgba(200,85,61,0.22)'}`,
    }).text(level.category || '');

    const nameSpan = $('<span>').css({
      flex: 1, fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      color: dim ? C.ink2 : C.ink,
    }).text(level.name);

    const statusDiv = $('<div>').css({ flexShrink: 0, display: 'flex', alignItems: 'center' });
    if (m.glyph === 'lock')  statusDiv.html(iconLock(13, C.ink2));
    if (m.glyph === 'play')  statusDiv.html(iconPlay(13, dim ? C.ink2 : C.terra));
    if (m.glyph === 'check') statusDiv.html(iconCheck(13, C.terra));

    return $('<button>').css({
      ...BASE, width: '100%', background: C.paper, borderRadius: 10,
      padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10,
      border: `1px solid ${C.rule}`, opacity: dim ? 0.5 : 1,
      transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
      boxShadow: 'none',
    }).append(numTag, catTag, nameSpan, statusDiv);
  }

  // ─── API pública ──────────────────────────────────────────────────────────
  const VARIANTS = { V1Minimal, V2Editorial, V5Brutal, V6Keyboard, VRow };
  const STATES   = ['locked', 'available', 'progress', 'done'];

  /**
   * Renderiza un botón en el contenedor dado.
   *
   * @param {string} selector   - Selector jQuery, p.ej. '#mi-div' o '.level-card'
   * @param {string} variant    - 'V1Minimal' | 'V2Editorial' | 'V5Brutal' | 'V6Keyboard'
   * @param {object} level      - Config de nivel, p.ej. LevelButtons.LEVEL_CHORD_CMAJOR
   * @param {string} [state]    - 'locked' | 'available' | 'progress' | 'done'  (default: 'available')
   */
  function render(selector, variant, level, state) {
    const fn = VARIANTS[variant];
    if (!fn) { console.error(`LevelButtons: variante desconocida "${variant}"`); return; }
    $(selector).empty().append(fn(state || 'available', level));
  }

  /**
   * Renderiza los 4 estados del botón en fila dentro del contenedor dado.
   * Útil para comparar estados durante el desarrollo.
   */
  function renderStates(selector, variant, level) {
    const fn = VARIANTS[variant];
    if (!fn) { console.error(`LevelButtons: variante desconocida "${variant}"`); return; }

    const row = $('<div>').css({ display: 'flex', gap: '28px', alignItems: 'flex-end', flexWrap: 'wrap' });
    STATES.forEach(s => {
      const col = $('<div>').css({ display: 'flex', flexDirection: 'column', gap: '10px' });
      col.append(
        fn(s, level),
        $('<div>').css({
          fontFamily: '"Geist Mono",monospace', fontSize: 10,
          color: 'rgba(26,36,32,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase',
        }).text(STATE_LABEL[s]),
      );
      row.append(col);
    });
    $(selector).empty().append(row);
  }

  /**
   * Renderiza múltiples niveles apilados verticalmente.
   *
   * @param {string}   selector  - Contenedor
   * @param {string}   variant   - Variante de botón
   * @param {object[]} levels    - Array de configs de nivel
   * @param {string}   [state]   - Estado para todos (default: 'available')
   */
  function renderList(selector, variant, levels, state, gap) {
    const fn = VARIANTS[variant];
    if (!fn) { console.error(`LevelButtons: variante desconocida "${variant}"`); return; }
    const col = $('<div>').css({ display: 'flex', flexDirection: 'column', gap: gap !== undefined ? gap : '16px' });
    levels.forEach(lvl => {
      const btn = fn(state || 'available', lvl);
      btn.data('level', lvl);
      col.append(btn);
    });
    $(selector).empty().append(col);
  }

  return {
    C, VARIANTS, LEVELS, STATES,
    render, renderStates, renderList,
    staffSVG, pianoSVG,
    noteIconSVG, trebleClefSVG, bassClefSVG,
    ...LEVELS,
  };
})();
