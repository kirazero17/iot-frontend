<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p class="subtitle">Theo dõi dữ liệu cảm biến và cảnh báo theo thời gian thực</p>
      </div>
      <button class="btn" type="button" @click="refreshData" :disabled="loading">
        {{ loading ? 'Đang tải...' : 'Làm mới' }}
      </button>
    </div>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <p v-else-if="demoMode" class="hint">Đang hiển thị dữ liệu mẫu.</p>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon devices">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Tổng Thiết Bị</h3>
          <p class="stat-value">{{ statistics.totalDevices }}</p>
          <span class="stat-label">Thiết bị đang hoạt động: {{ statistics.activeDevices }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon critical">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Cảnh Báo Nghiêm Trọng</h3>
          <p class="stat-value critical">{{ statistics.criticalAlerts }}</p>
          <span class="stat-label">Mức độ nguy hiểm cao</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Cảnh Báo Nguy Hiểm</h3>
          <p class="stat-value danger">{{ statistics.dangerAlerts }}</p>
          <span class="stat-label">Cần theo dõi chặt chẽ</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon warning">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Cảnh Báo</h3>
          <p class="stat-value warning">{{ statistics.warningAlerts }}</p>
          <span class="stat-label">Cần chú ý</span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-container">
        <h2>Dữ Liệu Cảm Biến (Latest)</h2>
        <div v-if="latestDevices.length > 0" class="charts-grid">
          <div class="chart-card">
            <h3>Gia Tốc (m/s²)</h3>
            <div class="chart-wrapper">
              <LineChart :data="accelerationData" :options="chartOptions" :key="`accel-${updateKey}`" />
            </div>
          </div>

          <div class="chart-card">
            <h3>Góc Xoay (rad/s)</h3>
            <div class="chart-wrapper">
              <LineChart :data="gyroscopeData" :options="chartOptions" :key="`gyro-${updateKey}`" />
            </div>
          </div>

          <div class="chart-card">
            <h3>Từ Trường (µT)</h3>
            <div class="chart-wrapper">
              <LineChart :data="magnetometerData" :options="chartOptions" :key="`mag-${updateKey}`" />
            </div>
          </div>
        </div>
        <div v-else class="no-data">
          <p>Chưa có dữ liệu từ cảm biến</p>
        </div>
      </div>
    </div>

    <!-- Devices Status -->
    <div class="devices-section">
      <h2>Trạng Thái Thiết Bị</h2>
      <div v-if="latestDevices.length > 0" class="devices-grid">
        <div v-for="device in latestDevices" :key="device.deviceId" :class="['device-card', `severity-${device.severity}`]">
          <div class="device-header">
            <h3>Thiết Bị: {{ device.deviceId }}</h3>
            <span :class="['severity-badge', device.severity]">
              {{ getSeverityLabel(device.severity) }}
            </span>
          </div>
          <div class="device-data">
            <div class="data-row">
              <span>Gia tốc X:</span>
              <strong>{{ formatNumber(device?.data?.accel_x, 2) }} m/s²</strong>
            </div>
            <div class="data-row">
              <span>Gia tốc Y:</span>
              <strong>{{ formatNumber(device?.data?.accel_y, 2) }} m/s²</strong>
            </div>
            <div class="data-row">
              <span>Gia tốc Z:</span>
              <strong>{{ formatNumber(device?.data?.accel_z, 2) }} m/s²</strong>
            </div>
            <div class="data-row">
              <span>Góc nghiêng:</span>
              <strong>{{ formatNumber(getTiltAngle(device), 2) }}°</strong>
            </div>
            <div class="data-row">
              <span>Cập nhật:</span>
              <strong>{{ formatTime(device.timestamp) }}</strong>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>Không có thiết bị nào đang hoạt động</p>
      </div>
    </div>

    <!-- Recent Alerts -->
    <div class="alerts-section">
      <h2>Cảnh Báo Gần Đây</h2>
      <div v-if="alerts.length > 0" class="alerts-list">
        <div v-for="alert in alerts" :key="alert._id || alert.timestamp" :class="['alert-item', `alert-${alert.severity}`]">
          <div class="alert-icon">
            <svg v-if="alert.severity === 'critical'" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            </svg>
          </div>
          <div class="alert-content">
            <div class="alert-header">
              <h4>Thiết Bị: {{ alert.deviceId }}</h4>
              <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
            </div>
            <p class="alert-details">
              Gia tốc: X={{ formatNumber(alert?.data?.accel_x, 2) }},
              Y={{ formatNumber(alert?.data?.accel_y, 2) }},
              Z={{ formatNumber(alert?.data?.accel_z, 2) }} m/s²
            </p>
            <p v-if="alert.location" class="alert-location">
              Vị trí: {{ formatNumber(alert.location?.lat, 4) }}, {{ formatNumber(alert.location?.lon, 4) }}
            </p>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>Không có cảnh báo nào</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";
import type { Alert, SensorData, Statistics } from "../../types/sensor";
import { getAlerts, getLatestDevices, getStatistics } from "../../services/sensorApi";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
const LineChart = Line;

const loading = ref(false);
const errorMsg = ref("");
const demoMode = ref(false);

const statistics = ref<Statistics>({
  totalDevices: 0,
  activeDevices: 0,
  criticalAlerts: 0,
  dangerAlerts: 0,
  warningAlerts: 0,
  lastUpdated: new Date().toISOString(),
});
const latestDevices = ref<SensorData[]>([]);
const alerts = ref<Alert[]>([]);
const updateKey = ref(0);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: "top" as const },
    tooltip: { mode: "index" as const, intersect: false },
  },
  scales: {
    x: { display: true, title: { display: true, text: "Thiết Bị" } },
    y: { display: true, title: { display: true, text: "Giá Trị" } },
  },
  animation: { duration: 0 },
};

const accelerationData = computed(() => {
  const labels = latestDevices.value.map((d) => d.deviceId);
  return {
    labels,
    datasets: [
      {
        label: "Gia tốc X",
        data: latestDevices.value.map((d) => asNumber(d?.data?.accel_x)),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Gia tốc Y",
        data: latestDevices.value.map((d) => asNumber(d?.data?.accel_y)),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Gia tốc Z",
        data: latestDevices.value.map((d) => asNumber(d?.data?.accel_z)),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
});

const gyroscopeData = computed(() => {
  const labels = latestDevices.value.map((d) => d.deviceId);
  return {
    labels,
    datasets: [
      {
        label: "Góc X",
        data: latestDevices.value.map((d) => asNumber(d?.data?.gyro_x)),
        borderColor: "rgb(255, 159, 64)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Góc Y",
        data: latestDevices.value.map((d) => asNumber(d?.data?.gyro_y)),
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Góc Z",
        data: latestDevices.value.map((d) => asNumber(d?.data?.gyro_z)),
        borderColor: "rgb(201, 203, 207)",
        backgroundColor: "rgba(201, 203, 207, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
});

const magnetometerData = computed(() => {
  const labels = latestDevices.value.map((d) => d.deviceId);
  return {
    labels,
    datasets: [
      {
        label: "Từ trường X",
        data: latestDevices.value.map((d) => asNumber(d?.data?.mag_x)),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Từ trường Y",
        data: latestDevices.value.map((d) => asNumber(d?.data?.mag_y)),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Từ trường Z",
        data: latestDevices.value.map((d) => asNumber(d?.data?.mag_z)),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
});

function formatTime(timestamp: string): string {
  try {
    return format(new Date(timestamp), "dd/MM/yyyy HH:mm:ss", { locale: vi });
  } catch {
    return timestamp;
  }
}

function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    normal: "Bình Thường",
    warning: "Cảnh Báo",
    danger: "Nguy Hiểm",
    critical: "Nghiêm Trọng",
  };
  return labels[severity] || severity;
}

function asNumber(value: unknown) {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : Number.NaN;
}

function formatNumber(value: unknown, decimals = 2) {
  const n = asNumber(value);
  return Number.isFinite(n) ? n.toFixed(decimals) : "NaN";
}

function getTiltAngle(d: SensorData) {
  return asNumber(d?.data?.tilt_angle);
}

function setDemoData() {
  demoMode.value = true;
  const now = Date.now();
  statistics.value = {
    totalDevices: 3,
    activeDevices: 2,
    criticalAlerts: 1,
    dangerAlerts: 1,
    warningAlerts: 2,
    lastUpdated: new Date().toISOString(),
  };
  latestDevices.value = [
    {
      deviceId: "ESP32-01",
      timestamp: new Date(now - 15_000).toISOString(),
      severity: "warning",
      data: {
        accel_x: 0.32,
        accel_y: 0.12,
        accel_z: 9.67,
        gyro_x: 0.01,
        gyro_y: 0.02,
        gyro_z: 0.01,
        mag_x: 0,
        mag_y: 0,
        mag_z: 0,
        tilt_angle: 7.2,
      },
    },
    {
      deviceId: "ESP32-03",
      timestamp: new Date(now - 61_000).toISOString(),
      severity: "danger",
      data: {
        accel_x: 2.31,
        accel_y: 1.42,
        accel_z: 11.1,
        gyro_x: 0.12,
        gyro_y: 0.08,
        gyro_z: 0.1,
        mag_x: 0,
        mag_y: 0,
        mag_z: 0,
        tilt_angle: 18.9,
      },
    },
  ];
  alerts.value = [
    {
      deviceId: "ESP32-03",
      timestamp: new Date(now - 22_000).toISOString(),
      severity: "danger",
      data: {
        accel_x: 2.31,
        accel_y: 1.42,
        accel_z: 11.1,
        gyro_x: 0.12,
        gyro_y: 0.08,
        gyro_z: 0.1,
        mag_x: 0,
        mag_y: 0,
        mag_z: 0,
        tilt_angle: 18.9,
      },
    },
  ];
}

let refreshInterval: ReturnType<typeof setInterval> | null = null;

async function refreshData() {
  loading.value = true;
  errorMsg.value = "";
  demoMode.value = false;
  try {
    const [newStats, newDevices, newAlerts] = await Promise.all([getStatistics(), getLatestDevices(), getAlerts(10)]);
    statistics.value = newStats;
    latestDevices.value = Array.isArray(newDevices) ? newDevices : [];
    alerts.value = Array.isArray(newAlerts) ? newAlerts : [];
    updateKey.value += 1;
  } catch {
    errorMsg.value = "Không tải được dữ liệu dashboard. Kiểm tra đăng nhập và backend.";
    setDemoData();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  refreshData();
  refreshInterval = setInterval(refreshData, 5000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>

<style scoped>
.dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

h1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-header h1 {
  font-size: 32px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.btn {
  border: 1px solid #dbe3f0;
  background: #ffffff;
  color: #334155;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #dc2626;
}

.hint {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #64748b;
}

/* Statistics Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 32px;
  height: 32px;
}

.stat-icon.devices {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.critical {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.stat-icon.warning {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #d97706;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 30px;
  font-weight: 900;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.stat-value.critical {
  color: #dc2626;
}
.stat-value.danger {
  color: #ea580c;
}
.stat-value.warning {
  color: #d97706;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

/* Charts Section */
.charts-section {
  margin-bottom: 24px;
}

.charts-section h2 {
  font-size: 20px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 14px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 18px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  font-size: 16px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.chart-wrapper {
  height: 280px;
  position: relative;
}

/* Devices Section */
.devices-section {
  margin-bottom: 24px;
}

.devices-section h2 {
  font-size: 20px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 14px;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}

.device-card {
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e5e7eb;
}

.device-card.severity-normal {
  border-left-color: #10b981;
}
.device-card.severity-warning {
  border-left-color: #f59e0b;
}
.device-card.severity-danger {
  border-left-color: #ef4444;
}
.device-card.severity-critical {
  border-left-color: #dc2626;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.device-header h3 {
  font-size: 15px;
  font-weight: 900;
  color: #1a1a1a;
  margin: 0;
}

.severity-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.severity-badge.normal {
  background: #d1fae5;
  color: #065f46;
}
.severity-badge.warning {
  background: #fef3c7;
  color: #92400e;
}
.severity-badge.danger {
  background: #fee2e2;
  color: #991b1b;
}
.severity-badge.critical {
  background: #fecaca;
  color: #7f1d1d;
}

.device-data {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.data-row span {
  color: #666;
}

.data-row strong {
  color: #1a1a1a;
  font-weight: 800;
}

/* Alerts Section */
.alerts-section h2 {
  font-size: 20px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 14px;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 14px;
  border-left: 4px solid;
}

.alert-item.alert-danger {
  border-left-color: #ef4444;
}
.alert-item.alert-critical {
  border-left-color: #dc2626;
}

.alert-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-icon svg {
  width: 24px;
  height: 24px;
}

.alert-item.alert-danger .alert-icon {
  color: #ef4444;
}
.alert-item.alert-critical .alert-icon {
  color: #dc2626;
}

.alert-content {
  flex: 1;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.alert-header h4 {
  font-size: 15px;
  font-weight: 900;
  color: #1a1a1a;
  margin: 0;
}

.alert-time {
  font-size: 12px;
  color: #999;
}

.alert-details {
  font-size: 13px;
  color: #666;
  margin: 4px 0;
}

.alert-location {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0 0;
}

.no-data {
  background: white;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  color: #999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .devices-grid {
    grid-template-columns: 1fr;
  }
}
</style>

