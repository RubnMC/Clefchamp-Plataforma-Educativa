// app.jsx — design canvas: 4 button variants × 2 level types (chord + arpeggio).

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "background": "cream"
}/*EDITMODE-END*/;

const STATES = ['locked', 'available', 'progress', 'done'];
const STATE_LABEL = {
  locked: 'Bloqueado',
  available: 'Disponible',
  progress: 'En progreso',
  done: 'Completado',
};

const ABSTYLE = { background: COLORS.cream, padding: 32 };

function StateRow({ Btn, level }) {
  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      {STATES.map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn state={s} level={level} />
          <div style={{
            fontFamily: '"Geist Mono", monospace', fontSize: 10,
            color: 'rgba(26,36,32,0.55)', letterSpacing: '0.08em',
            textTransform: 'uppercase', textAlign: 'left', paddingLeft: 2,
          }}>
            {STATE_LABEL[s]}
          </div>
        </div>
      ))}
    </div>
  );
}

function CenterStage({ Btn, level, caption }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%',
                  fontFamily: '"Geist", system-ui, sans-serif', color: COLORS.ink,
                  justifyContent: 'center', alignItems: 'flex-start', gap: 18 }}>
      <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 10,
                    color: 'rgba(26,36,32,0.55)', letterSpacing: '0.1em',
                    textTransform: 'uppercase' }}>
        {caption}
      </div>
      <Btn state="available" level={level} />
    </div>
  );
}

function ArtboardBody({ label, kicker, description, Btn, level }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%',
                  fontFamily: '"Geist", system-ui, sans-serif', color: COLORS.ink }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'baseline', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 10,
                        color: 'rgba(26,36,32,0.55)', letterSpacing: '0.12em',
                        textTransform: 'uppercase' }}>
            {kicker}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em',
                        marginTop: 4 }}>
            {label}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(26,36,32,0.65)', marginTop: 4,
                        maxWidth: 540 }}>
            {description}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <StateRow Btn={Btn} level={level} />
      </div>
    </div>
  );
}

// Width budgets — accommodate 4 buttons in a row.
const W = {
  v1_chord: 1620, v1_arp: 1780,
  v2_chord: 1320, v2_arp: 1620,
  v5_chord: 1280, v5_arp: 1580,
  v6_chord: 1160, v6_arp: 1160,
};

function App() {
  return (
    <>
      <DesignCanvas
        title="Clefchamp · Botones de nivel"
        subtitle="4 estilos × 2 tipos de nivel — acorde de Do mayor y arpegio de Do mayor"
      >
        {/* ─── Acorde de Do mayor ───────────────────────────────── */}
        <DCSection
          id="row-chord"
          title="Nivel: Acorde de Do mayor"
          subtitle="Tres notas apiladas (do – mi – sol). Los 4 estilos seleccionados, cada uno en 4 estados."
        >
          <DCArtboard id="v1-chord" label="01 · Notación minimal"
                      width={W.v1_chord} height={360} style={ABSTYLE}>
            <ArtboardBody
              label="01 · Notación minimal · acorde" kicker="ESTILO 01 / ACORDE"
              Btn={V1Minimal} level={LEVEL_CHORD_CMAJOR}
              description="Pill ancha con pentagrama miniatura. Encaja en una lista vertical de niveles. Densidad alta."
            />
          </DCArtboard>
          <DCArtboard id="v2-chord" label="02 · Editorial pautado"
                      width={W.v2_chord} height={360} style={ABSTYLE}>
            <ArtboardBody
              label="02 · Editorial pautado · acorde" kicker="ESTILO 02 / ACORDE"
              Btn={V2Editorial} level={LEVEL_CHORD_CMAJOR}
              description="Serif itálica + monospace. El pentagrama es el héroe. Sombra dura tipo papel."
            />
          </DCArtboard>
          <DCArtboard id="v5-chord" label="05 · Brutalista"
                      width={W.v5_chord} height={360} style={ABSTYLE}>
            <ArtboardBody
              label="05 · Brutalista · acorde" kicker="ESTILO 05 / ACORDE"
              Btn={V5Brutal} level={LEVEL_CHORD_CMAJOR}
              description="Tipo gigante con la sílaba ‘DO’, monoespaciada en headers, sombra offset."
            />
          </DCArtboard>
          <DCArtboard id="v6-chord" label="06 · Teclado"
                      width={W.v6_chord} height={360} style={ABSTYLE}>
            <ArtboardBody
              label="06 · Teclado · acorde" kicker="ESTILO 06 / ACORDE"
              Btn={V6Keyboard} level={LEVEL_CHORD_CMAJOR}
              description="Mini-piano con C–E–G iluminadas. Para alumnos que aún no leen pentagrama."
            />
          </DCArtboard>
        </DCSection>

        {/* ─── Estilo 05 · Títulos largos (Nocturno op. 9 nº 2) ───── */}
        <DCSection
          id="row-brutal-long"
          title="Estilo 05 · Títulos largos"
          subtitle="Cinco estrategias para piezas con título largo, usando como ejemplo el Nocturno op. 9 nº 2 de Chopin. El sistema brutalista exige un anclaje corto y punzante — aquí hay cinco maneras de proporcionarlo."
        >
          <DCArtboard id="noct-a" label="A · Abreviatura"
                      width={520} height={320} style={ABSTYLE}>
            <CenterStage Btn={V5Brutal} level={LEVEL_NOCT_A_ABBR}
                         caption="A · Sustantivo abreviado como ancla (‘NOCT.’)" />
          </DCArtboard>
          <DCArtboard id="noct-b" label="B · Opus como héroe"
                      width={520} height={320} style={ABSTYLE}>
            <CenterStage Btn={V5Brutal} level={LEVEL_NOCT_B_OPUS}
                         caption="B · Opus como ancla — funciona para catálogos" />
          </DCArtboard>
          <DCArtboard id="noct-c" label="C · Número catalográfico"
                      width={500} height={320} style={ABSTYLE}>
            <CenterStage Btn={V5Brutal} level={LEVEL_NOCT_C_NUMBER}
                         caption="C · Sólo el número (‘9·2’) — más conciso" />
          </DCArtboard>
          <DCArtboard id="noct-d" label="D · Título como héroe (wrap)"
                      width={540} height={320} style={ABSTYLE}>
            <CenterStage Btn={V5Brutal} level={LEVEL_NOCT_D_WRAP}
                         caption="D · Título a 2 líneas, serif mixto — más literario" />
          </DCArtboard>
          <DCArtboard id="noct-e" label="E · Glifo musical"
                      width={520} height={320} style={ABSTYLE}>
            <CenterStage Btn={V5Brutal} level={LEVEL_NOCT_E_GLYPH}
                         caption="E · Símbolo (𝄞) reemplaza al texto grande" />
          </DCArtboard>
        </DCSection>

        {/* ─── Estilo 05 · Iteraciones brutalistas ──────────────── */}
        <DCSection
          id="row-brutal-iters"
          title="Estilo 05 · Iteraciones brutalistas"
          subtitle="El mismo lenguaje aplicado a 7 tipos de nivel — notas sueltas, acorde, arpegio descendente y tres partes de la Oda a la Alegría. Todos en estado ‘disponible’."
        >
          <DCArtboard id="b-drmf" label="Do · Re · Mi · Fa"
                      width={460} height={320} style={ABSTYLE}>
            <CenterStage Btn={V5Brutal} level={LEVEL_NOTES_DRMF}
                         caption="Melodía · 4 notas" />
          </DCArtboard>
          <DCArtboard id="b-sls" label="Sol · La · Si"
                      width={420} height={320} style={ABSTYLE}>
            <CenterStage Btn={V5Brutal} level={LEVEL_NOTES_SLS}
                         caption="Melodía · 3 notas" />
          </DCArtboard>
          <DCArtboard id="b-cmaj" label="Do mayor (acorde)"
                      width={420} height={320} style={ABSTYLE}>
            <CenterStage Btn={V5Brutal} level={LEVEL_CHORD_CMAJOR}
                         caption="Acorde · 3 notas apiladas" />
          </DCArtboard>
          <DCArtboard id="b-arpdesc" label="Arpegio Do ↘"
                      width={460} height={320} style={ABSTYLE}>
            <CenterStage Btn={V5Brutal} level={LEVEL_ARP_DESC_CMAJOR}
                         caption="Arpegio descendente · do→do" />
          </DCArtboard>
          <DCArtboard id="b-oda1" label="Oda · I"
                      width={500} height={320} style={ABSTYLE}>
            <CenterStage Btn={V5Brutal} level={LEVEL_ODA_1}
                         caption="Oda a la Alegría — parte i" />
          </DCArtboard>
          <DCArtboard id="b-oda2" label="Oda · II"
                      width={500} height={320} style={ABSTYLE}>
            <CenterStage Btn={V5Brutal} level={LEVEL_ODA_2}
                         caption="Oda a la Alegría — parte ii" />
          </DCArtboard>
          <DCArtboard id="b-oda3" label="Oda · III"
                      width={500} height={320} style={ABSTYLE}>
            <CenterStage Btn={V5Brutal} level={LEVEL_ODA_3}
                         caption="Oda a la Alegría — parte iii (puente)" />
          </DCArtboard>
        </DCSection>

        {/* ─── Arpegio de Do mayor ──────────────────────────────── */}
        <DCSection
          id="row-arp"
          title="Nivel: Arpegio de Do mayor"
          subtitle="Escala completa ascendente (do · re · mi · fa · sol · la · si · do). Mismos 4 estilos adaptados."
        >
          <DCArtboard id="v1-arp" label="01 · Notación minimal"
                      width={W.v1_arp} height={360} style={ABSTYLE}>
            <ArtboardBody
              label="01 · Notación minimal · arpegio" kicker="ESTILO 01 / ARPEGIO"
              Btn={V1Minimal} level={LEVEL_ARP_CMAJOR}
              description="El pentagrama se alarga para alojar las 8 notas; la pill crece a la par. Etiqueta y cifrado se adaptan al tipo de nivel."
            />
          </DCArtboard>
          <DCArtboard id="v2-arp" label="02 · Editorial pautado"
                      width={W.v2_arp} height={360} style={ABSTYLE}>
            <ArtboardBody
              label="02 · Editorial pautado · arpegio" kicker="ESTILO 02 / ARPEGIO"
              Btn={V2Editorial} level={LEVEL_ARP_CMAJOR}
              description="Mismo lenguaje editorial; la partitura interna muestra la escala ascendente con plicas alternadas según altura."
            />
          </DCArtboard>
          <DCArtboard id="v5-arp" label="05 · Brutalista"
                      width={W.v5_arp} height={360} style={ABSTYLE}>
            <ArtboardBody
              label="05 · Brutalista · arpegio" kicker="ESTILO 05 / ARPEGIO"
              Btn={V5Brutal} level={LEVEL_ARP_CMAJOR}
              description="‘DO arpegio ↗’: la sílaba se mantiene; la flecha y el ‘DO → DO’ del header comunican el ascenso."
            />
          </DCArtboard>
          <DCArtboard id="v6-arp" label="06 · Teclado"
                      width={W.v6_arp} height={360} style={ABSTYLE}>
            <ArtboardBody
              label="06 · Teclado · arpegio" kicker="ESTILO 06 / ARPEGIO"
              Btn={V6Keyboard} level={LEVEL_ARP_CMAJOR}
              description="Todas las teclas blancas iluminadas (do→do). El chip pasa de ‘CMaj’ a ‘C esc.’ para señalar el cambio de tipo."
            />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Sistema" />
        <div style={{ padding: '6px 14px 10px', fontSize: 11,
                      color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
          Cada estilo está parametrizado por una <code>level config</code>:
          número, categoría, nombre, cifrado, notas, modo de pentagrama y modo
          de piano. Añadir un nuevo nivel (escalas, intervalos, ritmo…) es solo
          un nuevo objeto.
        </div>
        <TweakSection label="Paleta" />
        <div style={{ padding: '6px 14px 14px', fontSize: 11,
                      color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
          Crema #F4EFE6 · Tinta #1A2420 · Terracota #C8553D.<br />
          Sugerencia: cambiar el color de acento por categoría — mayor (terracota),
          menor (azul), dim (lila), dom7 (ámbar).
        </div>
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
