const charts = new Map();

function crearGraficoAreaspline(divId, datos) {
  return Highcharts.chart(divId, {
    chart: {
      type: 'areaspline',
      backgroundColor: '#dccfca',
      borderRadius: 10,
      zoomType: '',
      style: { zIndex: 0 }
    },
    title: { text: '' },
    xAxis: {
      type: 'datetime',
      labels: { style: { color: '#000' } }
    },
    yAxis: {
      title: { text: '' },
      labels: { style: { color: '#000' } },
      gridLineColor: 'rgba(255,255,255,0.2)'
    },
    series: [{
      name: 'Puntuación',
      data: datos,
      color: 'rgba(57, 181, 255, 0.8)',
      lineColor: '#69c4ff',
      lineWidth: 2,
      fillOpacity: 0.3,
      marker: { enabled: false }
    }],
    legend: { enabled: false },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      style: { color: '#FFF' },
      formatter: function () {
        return `<b>${Highcharts.dateFormat('%d %b %Y', this.x)}</b>: ${this.y}`;
      }
    },
    credits: { enabled: false }
  });
}

function transformarDatos(datos) {
  return datos.map(item => [
    Date.UTC(
      new Date(item.fecha).getUTCFullYear(),
      new Date(item.fecha).getUTCMonth(),
      new Date(item.fecha).getUTCDate()
    ),
    item.puntos
  ]);
}

function toDomId(levelId) {
  return levelId.replace(/-/g, '_');
}

async function fetchStatsForUser() {
  try {
    const response = await fetch("/users/statsForUser", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
    if (!response.ok) throw new Error(`Error en la petición: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener stats del usuario:", error);
    return null;
  }
}

function aplicarZoom(chart, dias) {
  if (!chart || dias === 'all') {
    chart?.xAxis[0].setExtremes(null, null);
    return;
  }
  const data = chart.series[0].data;
  if (!data.length) return;
  const ultimaFecha = data[data.length - 1].x;
  const desde = ultimaFecha - (dias * 24 * 60 * 60 * 1000);
  chart.xAxis[0].setExtremes(desde, ultimaFecha);
}

function formatFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const año = fecha.getFullYear();
  return `${dia}-${mes}-${año}`;
}

function obtenerUltimaFecha(data) {
  if (!data || data.length === 0) return null;
  const ultima = data.reduce((a, b) => (b.fecha > a.fecha ? b : a));
  return formatFecha(ultima.fecha);
}

function obtenerPuntuacionMaxima(data) {
  if (!data || data.length === 0) return null;
  const max = data.reduce((a, b) => (b.puntos > a.puntos ? b : a));
  return { puntos: max.puntos, fecha: formatFecha(max.fecha) };
}

function initChartForLevel(levelId, statsByLevel) {
  if (charts.has(levelId)) return;
  const domId = toDomId(levelId);
  const data = statsByLevel[levelId] || [];

  const bestScoreData = obtenerPuntuacionMaxima(data);
  $(`#bestScore_${domId}`).text(bestScoreData?.puntos ?? 0);
  $(`#bestDate_${domId}`).text(bestScoreData?.fecha ?? 'No hay datos');
  $(`#lastPlayed_${domId}`).text(obtenerUltimaFecha(data) ?? 'No hay datos');

  if (data.length > 2) {
    $(`#chart_${domId}`).removeClass('d-none');
    $(`#nodata_${domId}`).addClass('d-none');
    const chart = crearGraficoAreaspline(`chart_${domId}`, transformarDatos(data));
    charts.set(levelId, chart);
  } else {
    $(`#chart_${domId}`).addClass('d-none');
    $(`#nodata_${domId}`).removeClass('d-none');
    charts.set(levelId, null);
  }
}

let cachedStats = null;

function activateStatsLevel(levelId) {
  $('.levelStatsDiv').prop('hidden', true);
  $(`[data-level-id="${levelId}"].levelStatsDiv`).prop('hidden', false);
  $('.levelBtn').removeClass('btn-light').addClass('btn-outline-secondary');
  $(`.levelBtn[data-level-id="${levelId}"]`).removeClass('btn-outline-secondary').addClass('btn-light');
}

document.addEventListener("DOMContentLoaded", function () {
  const savedLevel = localStorage.getItem('statsLastLevel');
  const firstBtn   = document.querySelector('.levelBtn');
  const initialBtn = savedLevel
    ? (document.querySelector(`.levelBtn[data-level-id="${savedLevel}"]`) || firstBtn)
    : firstBtn;

  if (initialBtn) activateStatsLevel(initialBtn.dataset.levelId);

  fetchStatsForUser().then(stats => {
    if (!stats) return;
    cachedStats = stats.statsByLevel;
    if (initialBtn) initChartForLevel(initialBtn.dataset.levelId, cachedStats);
  });

  $(document).on('click', '.levelBtn', function () {
    const levelId = $(this).data('level-id');
    activateStatsLevel(levelId);
    localStorage.setItem('statsLastLevel', levelId);
    if (cachedStats) initChartForLevel(levelId, cachedStats);
  });
});
