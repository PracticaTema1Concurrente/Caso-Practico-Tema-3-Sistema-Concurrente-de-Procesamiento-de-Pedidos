(function () {
  function formatDateTime(value) {
    if (!value) return '–';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '–';
    return d.toLocaleString('es-ES', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  function createStatusChip(status) {
    if (!status) return '';
    const cls = `status-chip status-chip--${status}`;
    let label = status;
    switch (status) {
      case 'PENDING':
        label = 'Pendiente';
        break;
      case 'PROCESSING':
        label = 'Procesando';
        break;
      case 'COMPLETED':
        label = 'Completado';
        break;
      case 'FAILED':
        label = 'Fallido';
        break;
    }
    return `<span class="${cls}">${label}</span>`;
  }

  function renderOrdersTable(orders, statusFilter) {
    const table = document.getElementById('orders-table');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    let filtered = orders || [];

    if (statusFilter) {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    tbody.innerHTML = '';

    if (!filtered.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 9;
      td.className = 'empty-state';
      td.textContent = 'No hay pedidos que coincidan con el filtro.';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    filtered.forEach(order => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${order.id}</td>
        <td>${order.orderNumber ?? '–'}</td>
        <td>${order.customerName ?? '–'}</td>
        <td>${order.totalAmount != null ? Number(order.totalAmount).toFixed(2) : '–'}</td>
        <td>${createStatusChip(order.status)}</td>
        <td>${order.currentStep || '–'}</td>
        <td>${formatDateTime(order.createdAt)}</td>
        <td>${formatDateTime(order.completedAt)}</td>
        <td>${order.failureReason || ''}</td>
      `;

      tbody.appendChild(tr);
    });
  }

  function renderSearchResults(term, orders) {
    const container = document.getElementById('search-results');
    if (!container) return;

    container.innerHTML = '';

    const trimmed = (term || '').trim().toLowerCase();
    if (!trimmed) {
      container.innerHTML = `<p class="empty-state">Introduce un término para buscar pedidos.</p>`;
      return;
    }

    const matches = (orders || []).filter(order => {
      const idMatch = String(order.id || '').includes(trimmed);
      const numberMatch = String(order.orderNumber || '').includes(trimmed);
      const nameMatch = (order.customerName || '').toLowerCase().includes(trimmed);
      return idMatch || numberMatch || nameMatch;
    });

    if (!matches.length) {
      container.innerHTML = `<p class="empty-state">No se han encontrado pedidos que coincidan con "${term}".</p>`;
      return;
    }

    const list = document.createElement('div');
    list.className = 'search-result-list';

    matches.slice(0, 20).forEach(order => {
      const card = document.createElement('div');
      card.className = 'active-order-card'; // reutilizamos estilo bonito

      card.innerHTML = `
        <div class="active-order__header">
          <span>#${order.orderNumber} · ID ${order.id}</span>
          <span>${createStatusChip(order.status)}</span>
        </div>
        <div class="active-order__step">
          <strong>Cliente:</strong> ${order.customerName || '–'}
        </div>
        <div class="active-order__step">
          <strong>Paso actual:</strong> ${order.currentStep || '–'}
        </div>
        <div class="active-order__step">
          <strong>Creado:</strong> ${formatDateTime(order.createdAt)}
        </div>
        <div class="active-order__step">
          <strong>Fin:</strong> ${formatDateTime(order.completedAt)}
        </div>
        ${order.failureReason ? `<div class="active-order__step"><strong>Error:</strong> ${order.failureReason}</div>` : ''}
      `;

      list.appendChild(card);
    });

    container.appendChild(list);
  }

  window.OrdersUI = {
    renderOrdersTable,
    renderSearchResults
  };
})();
