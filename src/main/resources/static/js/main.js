(function () {
const AppState = {
  orders: [],
  isRefreshing: false,
  refreshIntervalId: null,
  loopIntervalId: null,
  isLoopRunning: false
};

  // Exponer por si quieres juguetear desde la consola
  window.AppState = AppState;

  async function loadPartials() {
    const mapping = {
      'section-search': 'search.html',
      'section-create': 'create.html',
      'section-orders': 'orders.html',
      'section-active': 'active.html',
      'section-stats': 'stats.html'
    };

    const entries = Object.entries(mapping);

    await Promise.all(entries.map(async ([sectionId, file]) => {
      const res = await fetch(`partials/${file}`);
      if (!res.ok) {
        console.error(`Error cargando ${file}:`, res.status);
        return;
      }
      const html = await res.text();
      const sec = document.getElementById(sectionId);
      if (sec) {
        sec.innerHTML = html;
      }
    }));
  }


  // --- Notificaciones ---
  function showNotification(message, type) {
    const bar = document.getElementById('notification-bar');
    const text = document.getElementById('notification-message');
    if (!bar || !text) return;

    text.textContent = message;

    bar.classList.remove('notification--hidden');
    bar.classList.remove('notification--error', 'notification--success');

    if (type === 'error') {
      bar.classList.add('notification--error');
    } else if (type === 'success') {
      bar.classList.add('notification--success');
    }
  }

  function hideNotification() {
    const bar = document.getElementById('notification-bar');
    if (bar) {
      bar.classList.add('notification--hidden');
    }
  }

  window.showNotification = showNotification; // por si otros módulos la quieren

    function applySectionGroup(sectionIds) {
      const sections = document.querySelectorAll('.section');
      sections.forEach(sec => {
        sec.classList.remove('section--active');
      });

      (sectionIds || []).forEach(id => {
        const sec = document.getElementById(id);
        if (sec) {
          sec.classList.add('section--active');
        }
      });
    }

    function setupNavigation() {
      const navButtons = document.querySelectorAll('.nav__item');
      if (!navButtons.length) return;

      navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          navButtons.forEach(b => b.classList.remove('nav__item--active'));
          btn.classList.add('nav__item--active');

          const ids = (btn.dataset.sections || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

          applySectionGroup(ids);
        });
      });

      // Estado inicial: el que tenga nav__item--active (o el primero)
      const activeBtn = document.querySelector('.nav__item--active') || navButtons[0];
      if (activeBtn) {
        const ids = (activeBtn.dataset.sections || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        applySectionGroup(ids);
      }
    }

  // --- Refresco global de pedidos ---
  async function refreshOrders(showErrors = false) {
    if (AppState.isRefreshing) return;
    AppState.isRefreshing = true;

    try {
      const orders = await Api.fetchOrders();
      AppState.orders = orders || [];

      const statusFilterSelect = document.getElementById('filter-status');
      const statusFilter = statusFilterSelect ? statusFilterSelect.value || '' : '';

      OrdersUI.renderOrdersTable(AppState.orders, statusFilter);
      ProgressUI.renderActiveOrders(AppState.orders);
      StatsUI.updateStats(AppState.orders);
    } catch (err) {
      if (showErrors) {
        showNotification(err.message || 'Error al obtener los pedidos', 'error');
      }
    } finally {
      AppState.isRefreshing = false;
    }
  }

  function startAutoRefresh() {
    if (AppState.refreshIntervalId != null) return;
    AppState.refreshIntervalId = setInterval(() => {
      refreshOrders(false);
    }, 3000);
  }

  function updateLoopStatusUI() {
    const el = document.getElementById('loop-status');
    if (!el) return;

    el.classList.remove('loop-status--running', 'loop-status--stopped');

    if (AppState.isLoopRunning) {
      el.textContent = 'Bucle en ejecución';
      el.classList.add('loop-status--running');
    } else {
      el.textContent = 'Bucle detenido';
      el.classList.add('loop-status--stopped');
    }
  }

  async function runLoopTick(config) {
    // Cada tick creamos un lote de pedidos usando /simulate
    const payload = {};

    if (config.batchSize) payload.numberOfOrders = config.batchSize;
    if (config.minDelay != null) payload.minProcessingDelayMs = config.minDelay;
    if (config.maxDelay != null) payload.maxProcessingDelayMs = config.maxDelay;
    if (config.failureProb != null) payload.failureProbability = config.failureProb;
    // El autoProcess lo gestiona el backend de la simulación

    try {
      await Api.simulateOrders(payload);
      showNotification(`Bucle: se han creado ${config.batchSize} pedidos.`, 'success');
      await refreshOrders(false);
    } catch (err) {
      showNotification(err.message || 'Error en la ejecución del bucle', 'error');
    }
  }

  function startLoop(config) {
    if (AppState.loopIntervalId != null) {
      clearInterval(AppState.loopIntervalId);
      AppState.loopIntervalId = null;
    }

    AppState.isLoopRunning = true;
    updateLoopStatusUI();

    // Primera ejecución inmediata
    runLoopTick(config);

    AppState.loopIntervalId = setInterval(() => {
      runLoopTick(config);
    }, config.intervalMs);
  }

  function stopLoop() {
    if (AppState.loopIntervalId != null) {
      clearInterval(AppState.loopIntervalId);
      AppState.loopIntervalId = null;
    }
    AppState.isLoopRunning = false;
    updateLoopStatusUI();
  }


  // --- Formularios y botones ---
  function setupFormsAndButtons() {
    const formCreate = document.getElementById('form-create-order');
    const formSimulate = document.getElementById('form-simulate');
    const btnProcessPending = document.getElementById('btn-process-pending');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnClearAll = document.getElementById('btn-clear-all');
    const formSearch = document.getElementById('form-search');
    const filterStatus = document.getElementById('filter-status');
    const notifClose = document.getElementById('notification-close');
    const formLoop = document.getElementById('form-loop');
    const btnLoopStart = document.getElementById('btn-loop-start');
    const btnLoopStop = document.getElementById('btn-loop-stop');

    if (notifClose) {
      notifClose.addEventListener('click', hideNotification);
    }

    if (filterStatus) {
      filterStatus.addEventListener('change', () => {
        const status = filterStatus.value || '';
        OrdersUI.renderOrdersTable(AppState.orders, status);
      });
    }

    if (formCreate) {
      formCreate.addEventListener('submit', async (e) => {
        e.preventDefault();

        const customerName = document.getElementById('customerName').value.trim();
        const totalAmountValue = document.getElementById('totalAmount').value;
        const minDelayValue = document.getElementById('minDelay').value;
        const maxDelayValue = document.getElementById('maxDelay').value;
        const failureProbValue = document.getElementById('failureProb').value;
        const autoProcessInput = document.getElementById('autoProcess');
        const batchModeInput = document.getElementById('batchMode');

        if (!customerName || !totalAmountValue) {
          showNotification('Nombre de cliente e importe son obligatorios.', 'error');
          return;
        }

        const autoProcessChecked = autoProcessInput && autoProcessInput.checked;
        const batchModeChecked = batchModeInput && batchModeInput.checked;

        // Si está en modo lote, NO procesamos automáticamente
        // Si no, respetamos el checkbox autoProcess
        const autoProcess = batchModeChecked ? false : !!autoProcessChecked;

        const payload = {
          customerName: customerName,
          totalAmount: parseFloat(totalAmountValue),
          minProcessingDelayMs: minDelayValue ? parseInt(minDelayValue, 10) : null,
          maxProcessingDelayMs: maxDelayValue ? parseInt(maxDelayValue, 10) : null,
          failureProbability: failureProbValue ? parseFloat(failureProbValue) : null,
          autoProcess: autoProcess
        };

        try {
          const created = await Api.createOrder(payload);

          if (batchModeChecked) {
            showNotification(`Pedido #${created.orderNumber} creado en estado PENDING.`, 'success');
          } else if (autoProcess) {
            showNotification(`Pedido #${created.orderNumber} creado y enviado a procesar.`, 'success');
          } else {
            showNotification(`Pedido #${created.orderNumber} creado.`, 'success');
          }

          // Limpiamos solo algunos campos (no parámetros para no molestar)
          // formCreate.reset(); // si quieres vaciar todo

          await refreshOrders(false);
        } catch (err) {
          showNotification(err.message || 'Error al crear el pedido', 'error');
        }
      });
    }

    if (btnProcessPending) {
      btnProcessPending.addEventListener('click', async () => {
        try {
          await Api.processPendingOrders();
          showNotification('Procesando todos los pedidos pendientes...', 'success');
          await refreshOrders(false);
        } catch (err) {
          showNotification(err.message || 'Error al procesar pendientes', 'error');
        }
      });
    }

    if (formSimulate) {
      formSimulate.addEventListener('submit', async (e) => {
        e.preventDefault();

        const numOrdersValue = document.getElementById('sim-numOrders').value;
        const minDelayValue = document.getElementById('sim-minDelay').value;
        const maxDelayValue = document.getElementById('sim-maxDelay').value;
        const failureProbValue = document.getElementById('sim-failureProb').value;

        const payload = {};

        if (numOrdersValue) payload.numberOfOrders = parseInt(numOrdersValue, 10);
        if (minDelayValue) payload.minProcessingDelayMs = parseInt(minDelayValue, 10);
        if (maxDelayValue) payload.maxProcessingDelayMs = parseInt(maxDelayValue, 10);
        if (failureProbValue) payload.failureProbability = parseFloat(failureProbValue);

        try {
          const result = await Api.simulateOrders(payload);
          StatsUI.renderSimulationResult(result);
          showNotification('Simulación ejecutada correctamente.', 'success');
          await refreshOrders(false);
        } catch (err) {
          showNotification(err.message || 'Error al ejecutar la simulación', 'error');
        }
      });
    }

    if (btnRefresh) {
      btnRefresh.addEventListener('click', async () => {
        await refreshOrders(true);
      });
    }

    if (btnClearAll) {
      btnClearAll.addEventListener('click', async () => {
        if (!confirm('¿Seguro que quieres borrar todos los pedidos?')) return;
        try {
          await Api.deleteAllOrders();
          AppState.orders = [];
          OrdersUI.renderOrdersTable([], '');
          ProgressUI.renderActiveOrders([]);
          StatsUI.updateStats([]);
          showNotification('Todos los pedidos han sido eliminados.', 'success');
        } catch (err) {
          showNotification(err.message || 'Error al eliminar los pedidos', 'error');
        }
      });
    }

    if (formSearch) {
      formSearch.addEventListener('submit', (e) => {
        e.preventDefault();
        const term = document.getElementById('search-term').value || '';
        OrdersUI.renderSearchResults(term, AppState.orders);
      });
    }

        // --- Bucle de pedidos ---
        if (btnLoopStart) {
          btnLoopStart.addEventListener('click', (e) => {
            e.preventDefault();

            const batchSizeValue = document.getElementById('loop-batchSize').value;
            const intervalSecValue = document.getElementById('loop-intervalSec').value;
            const minDelayValue = document.getElementById('loop-minDelay').value;
            const maxDelayValue = document.getElementById('loop-maxDelay').value;
            const failureProbValue = document.getElementById('loop-failureProb').value;

            const batchSize = batchSizeValue ? parseInt(batchSizeValue, 10) : null;
            const intervalSec = intervalSecValue ? parseInt(intervalSecValue, 10) : null;

            if (!batchSize || batchSize <= 0) {
              showNotification('Indica un número de pedidos por ciclo mayor que 0.', 'error');
              return;
            }
            if (!intervalSec || intervalSec <= 0) {
              showNotification('Indica un intervalo en segundos mayor que 0.', 'error');
              return;
            }

            const config = {
              batchSize: batchSize,
              intervalMs: intervalSec * 1000,
              minDelay: minDelayValue ? parseInt(minDelayValue, 10) : null,
              maxDelay: maxDelayValue ? parseInt(maxDelayValue, 10) : null,
              failureProb: failureProbValue ? parseFloat(failureProbValue) : null
            };

            startLoop(config);
            showNotification('Bucle de creación de pedidos iniciado.', 'success');
          });
        }

        if (btnLoopStop) {
          btnLoopStop.addEventListener('click', (e) => {
            e.preventDefault();
            stopLoop();
            showNotification('Bucle de creación de pedidos detenido.', 'success');
          });
        }

        // Aseguramos que el estado inicial del bucle se muestre correcto
        updateLoopStatusUI();
  }

  // --- Inicialización ---
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1) Cargar contenido HTML de las secciones
    await loadPartials();

    // 2) Configurar navegación y formularios (ya existe el DOM necesario)
    setupNavigation();
    setupFormsAndButtons();

    // 3) Primera carga de pedidos + auto-refresh
    await refreshOrders(false);
    startAutoRefresh();
  } catch (e) {
    console.error('Error inicializando la app', e);
    showNotification('Error inicializando la aplicación', 'error');
  }
});

})();
