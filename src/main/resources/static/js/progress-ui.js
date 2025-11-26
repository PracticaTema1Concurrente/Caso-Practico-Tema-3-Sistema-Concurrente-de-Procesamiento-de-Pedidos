(function () {
  const STEPS = [
    'Verificando stock',
    'Procesando pago',
    'Preparando envío',
    'Completado',
    'Fallido'
  ];

  // Mapa para controlar visibilidad temporal de pedidos completados/fallidos
  // { [orderId]: timestampDeExpiracion }
  const visibilityMap = {};

  function estimateProgress(order) {
    if (!order || !order.status) return 0;

    if (order.status === 'PENDING') return 0;
    if (order.status === 'COMPLETED') return 100;
    if (order.status === 'FAILED') return 100;

    const step = (order.currentStep || '').toLowerCase();

    let index = 0;
    if (step.includes('verificando')) index = 0;
    else if (step.includes('pago')) index = 1;
    else if (step.includes('envío') || step.includes('envio')) index = 2;
    else if (step.includes('complet')) index = 3;

    const fractions = [10, 40, 75, 100];
    return fractions[index] || 10;
  }

  function getStepLabel(order) {
    if (!order) return 'En cola';

    if (order.currentStep && order.currentStep.trim()) {
      return order.currentStep;
    }

    switch (order.status) {
      case 'PENDING':
        return 'En cola';
      case 'PROCESSING':
        return 'Procesando...';
      case 'COMPLETED':
        return 'Completado';
      case 'FAILED':
        return 'Fallido';
      default:
        return 'En cola';
    }
  }

function renderActiveOrders(orders) {
  const container = document.getElementById('active-orders-container');
  if (!container) return;

  container.innerHTML = '';

  const list = orders || [];
  const now = Date.now();

  const active = list.filter(o => {
    if (!o) return false;

    // Pedidos en procesamiento: siempre visibles
    if (o.status === 'PROCESSING') {
      if (o.id != null && visibilityMap[o.id]) {
        delete visibilityMap[o.id];
      }
      return true;
    }

    // Completados o fallidos: visibles durante 10 segundos
    if (o.status === 'COMPLETED' || o.status === 'FAILED') {
      if (o.id == null) return false;

      const existing = visibilityMap[o.id];
      if (!existing) {
        visibilityMap[o.id] = now + 10000; // 10 segundos
        return true;
      }
      if (existing > now) {
        return true;
      }
      return false;
    }

    // Otros estados: no visibles en este monitor
    if (o.id != null && visibilityMap[o.id]) {
      delete visibilityMap[o.id];
    }
    return false;
  });

  if (!active.length) {
    container.innerHTML = `<p class="empty-state">No hay pedidos en curso en este momento.</p>`;
    return;
  }

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  active.forEach(order => {
    const progress = estimateProgress(order);
    const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
    const offset = circumference * (1 - safeProgress / 100);

    const card = document.createElement('div');
    card.className = 'active-order-card';

    let circleColor = 'var(--accent-strong)';

    // Estilo visual según estado final
    if (order.status === 'COMPLETED') {
      card.classList.add('active-order-card--completed');
      circleColor = '#22c55e'; // verde
    } else if (order.status === 'FAILED') {
      card.classList.add('active-order-card--failed');
      circleColor = '#f87171'; // rojo
    }

    card.innerHTML = `
      <div class="active-order__header">
        <span class="active-order__id">ID: ${order.id ?? '–'}</span>
        <span class="active-order__amount">${Number(order.totalAmount || 0).toFixed(2)} €</span>
      </div>

      <div class="active-order__name">
        ${order.customerName || 'Cliente sin nombre'}
      </div>

      <div class="active-order__progress-wrapper">
        <div class="progress-circle">
          <svg viewBox="0 0 120 120" class="progress-circle__svg">
            <circle
              class="progress-circle__bg"
              cx="60"
              cy="60"
              r="${radius}"
            ></circle>
            <circle
              class="progress-circle__value"
              cx="60"
              cy="60"
              r="${radius}"
              style="
                stroke-dasharray: ${circumference.toFixed(2)};
                stroke-dashoffset: ${offset.toFixed(2)};
                stroke: ${circleColor};
              "
            ></circle>
          </svg>
          <div class="progress-circle__label">
            ${safeProgress}%
          </div>
        </div>
      </div>

      <div class="active-order__step active-order__step--center">
        ${getStepLabel(order)}
      </div>
    `;

    container.appendChild(card);
  });
}

  window.ProgressUI = {
    renderActiveOrders
  };
})();