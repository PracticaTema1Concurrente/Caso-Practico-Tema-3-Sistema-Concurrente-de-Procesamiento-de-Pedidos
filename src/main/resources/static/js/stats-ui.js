(function () {
  // Estado interno para saber el último estado visto de cada pedido
  const lastStatusById = {};

  function safeNumber(value) {
    const n = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(n) ? null : n;
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setBarScale(id, ratio) {
    const el = document.getElementById(id);
    if (!el) return;
    const r = Math.max(0, Math.min(1, ratio || 0));
    el.style.transform = `scaleX(${r})`;
  }

  function formatMs(ms) {
    if (ms == null) return '–';
    if (ms < 1000) return `${ms} ms`;
    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(1)} s`;
    const m = s / 60;
    return `${m.toFixed(1)} min`;
  }

  function formatWindowLabel(diffMs) {
    if (!diffMs || diffMs <= 0) return '–';
    const minutes = diffMs / 1000 / 60;
    if (minutes < 60) return `${minutes.toFixed(1)} min`;
    const hours = minutes / 60;
    return `${hours.toFixed(1)} h`;
  }

  /**
   * Crea una "bolita" efímera en el radar en el cuadrante correspondiente
   * al estado del pedido. Dura ~1 segundo y luego desaparece.
   */
  function createPulseDot(status) {
    const container = document.getElementById('pulse-dots-layer');
    if (!container) return;

    // Centro del radar en % (coincide con el centro del círculo)
    const centerX = 50;
    const centerY = 50;

    // Distancia radial entre 20% y 45% del radio
    const rMin = 20;
    const rMax = 45;
    const r = rMin + Math.random() * (rMax - rMin);

    // Elegimos rango angular según cuadrante
    let minDeg, maxDeg;
    switch (status) {
      case 'COMPLETED': // Éxitos → arriba izquierda
        minDeg = 91;
        maxDeg = 180;
        break;
      case 'FAILED': // Fallidos → abajo derecha
        minDeg = 271;
        maxDeg = 360;
        break;
      case 'PROCESSING': // Procesando → arriba derecha
        minDeg = 0;
        maxDeg = 90;
        break;
      case 'PENDING': // En cola → abajo izquierda
      default:
        minDeg = 181;
        maxDeg = 270;
        break;
    }

    const angleDeg = minDeg + Math.random() * (maxDeg - minDeg);
    const angleRad = (angleDeg * Math.PI) / 180;

    const offsetX = r * Math.cos(angleRad);
    const offsetY = r * Math.sin(angleRad);

    // En CSS el eje Y crece hacia abajo, por eso restamos offsetY
    const x = centerX + offsetX;
    const y = centerY - offsetY;

    const dot = document.createElement('div');
    dot.className = 'pulse-dot';

    if (status === 'COMPLETED') dot.classList.add('pulse-dot--success');
    else if (status === 'FAILED') dot.classList.add('pulse-dot--fail');
    else if (status === 'PROCESSING') dot.classList.add('pulse-dot--processing');
    else dot.classList.add('pulse-dot--pending');

    dot.style.left = `${x}%`;
    dot.style.top = `${y}%`;

    container.appendChild(dot);

    // Que desaparezca del DOM tras 1 segundo (coincide con la animación)
    setTimeout(() => {
      dot.remove();
    }, 2000);
  }

  /**
   * Para cada pedido, si es nuevo o ha cambiado de estado,
   * generamos una bolita en el radar.
   */
function spawnPulseDots(orders) {
  if (!orders || !orders.length) return;

  const now = Date.now();
  const pulseWindowMs = 10000; // 10 segundos

  // --- FILTRO QUE QUIERES AÑADIR ---
  const filteredOrders = orders.filter(o => {
    const status = o.status;

    // Siempre mostrar los activos
    if (status === 'PENDING' || status === 'PROCESSING') {
      return true;
    }

    // COMPLETED / FAILED solo si llevan < 10 segundos
    if ((status === 'COMPLETED' || status === 'FAILED') && o.completedAt) {
      const completedTime = new Date(o.completedAt).getTime();
      return now - completedTime <= pulseWindowMs;
    }

    return false;
  });

  // Si tras filtrar no hay nada, no hacemos nada
  if (!filteredOrders.length) return;

  // --- A PARTIR DE AQUÍ TODO IGUAL QUE TU CÓDIGO ---
  const currentIds = new Set();

  filteredOrders.forEach(o => {
    const id = o.id ?? o.orderId ?? null;
    if (id == null) return;

    currentIds.add(id);
    const currentStatus = o.status;
    const prevStatus = lastStatusById[id];

    if (!prevStatus) {
      lastStatusById[id] = currentStatus;
      if (currentStatus) createPulseDot(currentStatus);

    } else if (prevStatus !== currentStatus) {
      lastStatusById[id] = currentStatus;
      if (currentStatus) createPulseDot(currentStatus);
    }
  });

  Object.keys(lastStatusById).forEach(id => {
    if (!currentIds.has(id)) delete lastStatusById[id];
  });
}


  function updateStats(orders) {
    const list = orders || [];

    const total = list.length;
    const completed = list.filter(o => o.status === 'COMPLETED').length;
    const failed = list.filter(o => o.status === 'FAILED').length;
    const processing = list.filter(o => o.status === 'PROCESSING').length;
    const pending = list.filter(o => o.status === 'PENDING').length;
    const inProgress = pending + processing;

    // --- Tiempos ---
    let totalTime = 0;
    let maxTime = 0;
    let countTime = 0;
    let minCreated = null;
    let maxCreated = null;

    list.forEach(o => {
      if (o.createdAt) {
        const t = new Date(o.createdAt);
        if (!isNaN(t.getTime())) {
          if (!minCreated || t < minCreated) minCreated = t;
          if (!maxCreated || t > maxCreated) maxCreated = t;
        }
      }

      if (o.createdAt && o.completedAt) {
        const t1 = new Date(o.createdAt);
        const t2 = new Date(o.completedAt);
        if (!isNaN(t1.getTime()) && !isNaN(t2.getTime())) {
          const diff = t2 - t1;
          if (diff >= 0) {
            totalTime += diff;
            countTime++;
            if (diff > maxTime) maxTime = diff;
          }
        }
      }
    });

    const avgMs = countTime > 0 ? Math.round(totalTime / countTime) : null;
    const windowDiffMs =
      minCreated && maxCreated && maxCreated > minCreated
        ? maxCreated - minCreated
        : null;

    // --- Importe económico ---
    let totalAmount = 0;
    let countAmount = 0;
    let low = 0;
    let mid = 0;
    let high = 0;

    list.forEach(o => {
      const val = safeNumber(o.totalAmount);
      if (val == null) return;
      totalAmount += val;
      countAmount++;

      if (val < 50) low++;
      else if (val < 150) mid++;
      else high++;
    });

    const avgAmount = countAmount > 0 ? totalAmount / countAmount : null;

    // --- Ratios ---
    const successBase = completed + failed;
    const successRate = successBase > 0 ? completed / successBase : 0;
    const failRate = successBase > 0 ? failed / successBase : 0;
    const pendingRate = total > 0 ? pending / total : 0;

    const pendingPercent = total > 0 ? pending / total : 0;
    const processingPercent = total > 0 ? processing / total : 0;
    const completedPercent = total > 0 ? completed / total : 0;
    const failedPercent = total > 0 ? failed / total : 0;

    let throughputH = null;
    if (windowDiffMs && windowDiffMs > 0) {
      const hours = windowDiffMs / 1000 / 60 / 60;
      if (hours > 0) {
        throughputH = total / hours;
      }
    }

    // --- PINTAR EN LA UI ---

    // Resumen global
    setText('stat-total-orders', total);
    setText('stat-in-progress', inProgress);
    setText('stat-completed', completed);
    setText('stat-failed', failed);

    // Calidad de servicio
    setText('stat-success-rate', `${Math.round(successRate * 100)}%`);
    setBarScale('bar-success-fill', successRate);

    setText('stat-fail-rate', `${Math.round(failRate * 100)}%`);
    setBarScale('bar-fail-fill', failRate);

    setText('stat-pending-rate', `${Math.round(pendingRate * 100)}%`);
    setBarScale('bar-pending-fill', pendingRate);

    // Distribución por estado
    setText(
      'stat-pending',
      `${pending} (${Math.round(pendingPercent * 100)}%)`
    );
    setBarScale('bar-status-pending', pendingPercent);

    setText(
      'stat-processing',
      `${processing} (${Math.round(processingPercent * 100)}%)`
    );
    setBarScale('bar-status-processing', processingPercent);

    setText(
      'stat-completed-dist',
      `${completed} (${Math.round(completedPercent * 100)}%)`
    );
    setBarScale('bar-status-completed', completedPercent);

    setText(
      'stat-failed-dist',
      `${failed} (${Math.round(failedPercent * 100)}%)`
    );
    setBarScale('bar-status-failed', failedPercent);

    // Rendimiento temporal
    setText('stat-avg-time', avgMs != null ? formatMs(avgMs) : '–');
    setText('stat-max-time', maxTime > 0 ? formatMs(maxTime) : '–');
    setText(
      'stat-throughput-h',
      throughputH != null ? throughputH.toFixed(1) : '–'
    );
    setText(
      'stat-time-window',
      windowDiffMs ? formatWindowLabel(windowDiffMs) : '–'
    );

    // Volumen económico
    setText(
      'stat-total-amount',
      `${totalAmount.toFixed(2)} €`
    );
    setText(
      'stat-avg-amount',
      avgAmount != null ? `${avgAmount.toFixed(2)} €` : '–'
    );
    setText('stat-low-amount-count', low);
    setText('stat-mid-amount-count', mid);
    setText('stat-high-amount-count', high);

    // --- Pulso del sistema: generación de bolitas por pedidos/estados ---
    spawnPulseDots(list);

    // Carga del sistema (barra horizontal + mini KPIs)
    const activeRatio = total > 0 ? inProgress / total : 0;
    const load = Math.max(0, Math.min(1, (activeRatio + successRate) / 2));
    const loadFill = document.getElementById('pulse-load-fill');
    if (loadFill) {
      loadFill.style.transform = `scaleX(${load})`;
    }
    setText('pulse-load-label', `${Math.round(load * 100)}%`);

    setText(
      'pulse-throughput',
      throughputH != null ? throughputH.toFixed(1) : '–'
    );
    setText('pulse-success-window', completed.toString());
    setText('pulse-fail-window', failed.toString());
  }

  function renderSimulationResult(result) {
    const container = document.getElementById('simulation-result');
    if (!container) return;

    if (!result) {
      container.innerHTML = `<p class="simulation-result__placeholder">
        Aún no se ha ejecutado ninguna simulación.
      </p>`;
      return;
    }

    container.innerHTML = `
      <div class="simulation-result">
        <p><strong>Pedidos simulados:</strong> ${result.totalOrders}</p>
        <p><strong>Completados:</strong> ${result.completed}</p>
        <p><strong>Fallidos:</strong> ${result.failed}</p>
        <p><strong>Tiempo total:</strong> ${result.totalTimeMs} ms</p>
      </div>
    `;
  }

  window.StatsUI = {
    updateStats,
    renderSimulationResult
  };
})();
