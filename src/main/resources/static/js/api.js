(function () {
  const BASE_URL = '/api/orders';

  async function request(method, path, body) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body !== undefined && body !== null) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(BASE_URL + path, options);

    if (!response.ok) {
      let message = `Error ${response.status}`;
      try {
        const text = await response.text();
        if (text) {
          message += `: ${text}`;
        }
      } catch (e) {
        // ignoramos errores al leer el body
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  window.Api = {
    fetchOrders(status) {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      return request('GET', query);
    },

    fetchOrderById(id) {
      return request('GET', '/' + id);
    },

    createOrder(payload) {
      return request('POST', '', payload);
    },

    simulateOrders(payload) {
      return request('POST', '/simulate', payload || {});
    },

    deleteAllOrders() {
      return request('DELETE', '');
    },

    processPendingOrders() {
      return request('POST', '/process-pending', {});
    },

    processOrdersByIds(orderIds) {
      return request('POST', '/process', { orderIds });
    }
  };
})();
