/**
 * API and WebSocket client for the Adaptive Offloading Agent.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      // fallback
    }
    throw new Error(errorDetail || `HTTP error ${response.status}`);
  }

  return response.json();
}

// System Health
export async function getHealth() {
  return fetchJson('/');
}

// Scenarios API
export async function getScenarios() {
  return fetchJson('/api/scenarios');
}

export async function selectScenario(scenarioName) {
  return fetchJson('/api/scenarios/select', {
    method: 'POST',
    body: JSON.stringify({ scenario_name: scenarioName }),
  });
}

export async function getCurrentEnvironment() {
  return fetchJson('/api/scenarios/current');
}

export async function triggerTick() {
  return fetchJson('/api/scenarios/tick', {
    method: 'POST',
  });
}

// Benchmarks API
export async function getBenchmarks(limit = 25, offset = 0) {
  return fetchJson(`/api/benchmarks?limit=${limit}&offset=${offset}`);
}

export async function getBenchmarksSummary() {
  return fetchJson('/api/benchmarks/summary');
}

export async function generateTasks(count = 10) {
  return fetchJson('/api/benchmarks/generate', {
    method: 'POST',
    body: JSON.stringify({ count }),
  });
}

// Offloading Workflow API
export async function runOffloadDecision(payload = {}) {
  return fetchJson('/api/offload/run', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOffloadHistory(limit = 20) {
  return fetchJson(`/api/offload/history?limit=${limit}`);
}

export async function getOffloadStats() {
  return fetchJson('/api/offload/stats');
}

// WebSocket Connection for Real-time Simulation
export class SimulationWebSocket {
  constructor(onMessageCallback, onStatusChangeCallback) {
    this.onMessage = onMessageCallback;
    this.onStatusChange = onStatusChangeCallback;
    this.ws = null;
    this.reconnectTimer = null;
    this.isManualClosed = false;
  }

  connect() {
    this.isManualClosed = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // If running with Vite proxy or single-port deployment, connect to window.location.host
    const defaultWsUrl = `${protocol}//${window.location.host}/ws/simulation`;
    const wsUrl = import.meta.env.VITE_WS_URL || defaultWsUrl;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        if (this.onStatusChange) this.onStatusChange('CONNECTED');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessage) this.onMessage(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
      };

      this.ws.onclose = () => {
        if (this.onStatusChange) this.onStatusChange('DISCONNECTED');
        if (!this.isManualClosed) {
          this.reconnectTimer = setTimeout(() => this.connect(), 3000);
        }
      };
    } catch (e) {
      console.error('Failed to initialize WebSocket:', e);
      if (this.onStatusChange) this.onStatusChange('ERROR');
      if (!this.isManualClosed) {
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    }
  }

  send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }

  startSimulation(interval = 2.5) {
    return this.send({ action: 'start', interval });
  }

  pauseSimulation() {
    return this.send({ action: 'pause' });
  }

  triggerStep() {
    return this.send({ action: 'trigger_step' });
  }

  setScenario(scenarioName) {
    return this.send({ action: 'set_scenario', scenario_name: scenarioName });
  }

  close() {
    this.isManualClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
