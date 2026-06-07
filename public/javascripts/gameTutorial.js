const _shown = { firstNote: false, firstCorrect: false, firstStreak: false };

function getDriver() {
    return window?.driver?.js?.driver ?? null;
}

export function startPreGameTour() {
    const driver = getDriver();
    if (!driver) {
        console.error('driver.js no está disponible en window.driver.js.driver');
        return;
    }

    const tour = driver({
        showProgress: true,
        allowClose: false,
        disableActiveInteraction: true,
        nextBtnText: 'Siguiente →',
        prevBtnText: '← Atrás',
        doneBtnText: '¡A jugar!',
        progressText: 'Paso {{current}} de {{total}}',
        steps: [
            {
                popover: {
                    title: '¡Bienvenido al Tutorial!',
                    description: 'Vas a aprender a identificar notas musicales paso a paso. Este nivel tiene solo <strong>8 rondas</strong> con las notas más sencillas: <strong>Do, Re y Mi</strong>. Tómatelo con calma y sigue las instrucciones.',
                    align: 'center',
                }
            },
            {
                element: '#progressText',
                popover: {
                    title: 'Tu progreso',
                    description: 'Este contador muestra cuántas notas has completado. Verás algo como "<strong>1 / 8</strong>". La barra verde de la izquierda también se va llenando. Cuando llegues a 8/8 el nivel termina.',
                    side: 'bottom',
                    align: 'center',
                }
            },
            {
                element: '#miniCanvas',
                popover: {
                    title: 'Pentagrama pequeño — nota actual',
                    description: 'Este es el <strong>pentagrama pequeño</strong>. Aquí aparece la nota que debes identificar en cada ronda. La nota es un círculo colocado en una línea o espacio: su posición indica cuál es. En este tutorial solo aparecerán <strong>Do, Re y Mi</strong>.',
                    side: 'right',
                    align: 'center',
                }
            },
            {
                element: '#canvasParent',
                popover: {
                    title: 'Pentagrama grande — historial',
                    description: 'Este es el <strong>pentagrama grande</strong>. Aquí se construye el historial de todas las notas que has respondido. Las correctas se pintan en <strong style="color:#22c55e">verde</strong> y las incorrectas en <strong style="color:#ef4444">rojo</strong>. Al principio está vacío y se va llenando ronda a ronda.',
                    side: 'top',
                    align: 'center',
                }
            },
            {
                element: '#bothContainer',
                popover: {
                    title: 'El teclado de respuesta',
                    description: 'Este es tu piano de respuesta con las 7 notas: <strong>Do, Re, Mi, Fa, Sol, La y Si</strong>. Cuando identifiques la nota del pentagrama pequeño, pulsa la tecla correspondiente aquí.',
                    side: 'top',
                    align: 'center',
                }
            },
            {
                element: '.notec.tecla-blanca',
                popover: {
                    title: 'Las teclas del piano',
                    description: 'Cada tecla muestra el nombre de su nota. Si la nota del pentagrama es un <strong>Do</strong>, pulsa esta tecla. En este tutorial solo verás Do, Re y Mi, así que solo necesitarás las tres primeras teclas.',
                    side: 'top',
                    align: 'start',
                }
            },
            {
                element: '.contenedor.phoneHidden',
                popover: {
                    title: 'Atajos de teclado (recomendado)',
                    description: 'También puedes usar el teclado de tu ordenador:<br><br><strong>A = Do &nbsp; S = Re &nbsp; D = Mi</strong><br>F = Fa &nbsp; J = Sol &nbsp; K = La &nbsp; L = Si<br><br>La mayoría de jugadores lo prefieren porque es mucho más rápido que hacer clic.',
                    side: 'top',
                    align: 'center',
                }
            },
            {
                element: '#scoreDiv',
                popover: {
                    title: 'Tu puntuación',
                    description: 'Aquí se acumula tu puntuación. Responder más rápido da más puntos:<br><br>⚡ <strong>Perfecto</strong> — menos de 1 segundo<br>🟣 <strong>Excelente</strong> — menos de 2 s<br>🔵 <strong>Genial</strong> — menos de 4 s<br>🟢 <strong>Bien</strong> — menos de 8 s<br>🟠 <strong>Ok</strong> — más de 8 s',
                    side: 'bottom',
                    align: 'center',
                }
            },
            {
                element: '#startBtn',
                popover: {
                    title: '¡Todo listo para empezar!',
                    description: 'Pulsa <strong>Comenzar</strong> (o la barra espaciadora) para arrancar. Mira el pentagrama pequeño, identifica la nota (solo Do, Re o Mi) y pulsa la tecla. ¡Buena suerte!',
                    side: 'top',
                    align: 'center',
                }
            },
        ]
    });

    tour.drive();
}

function showBlockingHint(selector, title, description, side = 'bottom') {
    const driver = getDriver();
    if (!driver) return;
    const hint = driver({
        allowClose: false,
        disableActiveInteraction: true,
        doneBtnText: 'Entendido ✓',
        steps: [{
            element: selector,
            popover: { title, description, side, align: 'center' }
        }]
    });
    hint.drive();
}

export function onFirstNoteShown() {
    if (_shown.firstNote) return;
    _shown.firstNote = true;
    setTimeout(() => {
        showBlockingHint(
            '#miniCanvas',
            '¡Ha aparecido la primera nota!',
            'Mira el pentagrama con atención. El círculo indica la nota y su posición te dice cuál es. Recuerda: en este tutorial solo son <strong>Do, Re o Mi</strong>. Cierra este aviso e identifícala.',
            'right'
        );
    }, 700);
}

export function onFirstCorrect() {
    if (_shown.firstCorrect) return;
    _shown.firstCorrect = true;
    setTimeout(() => {
        showBlockingHint(
            '#scoreDiv',
            '¡Primer acierto! 🎉',
            'Cada respuesta correcta suma puntos. Cuanto más rápido respondas, mejor calificación y más puntos consigues. ¡Sigue así!',
            'bottom'
        );
    }, 300);
}

export function onFirstStreak() {
    if (_shown.firstStreak) return;
    _shown.firstStreak = true;
    setTimeout(() => {
        showBlockingHint(
            '#streak',
            '¡Racha activada! 🔥',
            'Acertar varias notas seguidas activa la racha. Mantenerla es la clave para conseguir puntuaciones muy altas. ¡No la rompas!',
            'top'
        );
    }, 300);
}
