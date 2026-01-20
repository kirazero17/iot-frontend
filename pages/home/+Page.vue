<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="hero-top">
        <div>
          <h1>Hệ Thống Giám Sát Rung Chấn</h1>
          <p class="hero-subtitle">Theo dõi và cảnh báo theo thời gian thực thông qua cảm biến IoT</p>
        </div>
        <div class="hero-actions">
          <button class="btn-outline" type="button" @click="refresh" :disabled="loading">
            {{ loading ? 'Đang tải...' : 'Làm mới' }}
          </button>
        </div>
      </div>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      <p v-else-if="demoMode" class="hint">
        Đang hiển thị dữ liệu mẫu (chưa lấy được từ backend).
      </p>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-box">
        <div class="stat-number">{{ statistics.totalDevices }}</div>
        <div class="stat-text">Thiết Bị</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">{{ statistics.activeDevices }}</div>
        <div class="stat-text">Đang Hoạt Động</div>
      </div>
      <div class="stat-box alert-box">
        <div class="stat-number alert-number">{{ statistics.criticalAlerts + statistics.dangerAlerts }}</div>
        <div class="stat-text">Cảnh Báo</div>
      </div>
    </div>

    <!-- System Overview -->
    <div class="overview-section">
      <h2>Tổng Quan</h2>
      <div class="overview-grid">
        <div class="overview-card">
          <h3>Dashboard</h3>
          <p>Xem biểu đồ và thống kê dữ liệu cảm biến theo thời gian</p>
          <a href="/dashboard" class="card-link">Mở Dashboard →</a>
        </div>
        <div class="overview-card">
          <h3>Thiết Bị &amp; Cảm Biến</h3>
          <p>Danh sách thiết bị, trạng thái và bản ghi mới nhất</p>
          <a href="/devices-and-sensors" class="card-link">Xem Thiết Bị →</a>
        </div>
        <div class="overview-card">
          <h3>Cảnh Báo</h3>
          <p>Danh sách cảnh báo mức nguy hiểm và nghiêm trọng</p>
          <a href="/warning" class="card-link">Xem Cảnh Báo →</a>
        </div>
      </div>
    </div>

    <!-- Recent Devices -->
    <div class="recent-devices">
      <h2>Thiết Bị Gần Đây</h2>
      <div v-if="latestDevices.length > 0" class="devices-preview">
        <div
          v-for="device in latestDevices.slice(0, 3)"
          :key="device.deviceId"
          :class="['device-preview-card', `severity-${device.severity}`]"
        >
          <div class="device-preview-header">
            <span class="device-id">{{ device.deviceId }}</span>
            <span :class="['status-badge', device.severity]">
              {{ getSeverityLabel(device.severity) }}
            </span>
          </div>
          <div class="device-preview-data">
            <div class="preview-metric">
              <span>Gia tốc:</span>
              <strong>{{ calcAccel(device).toFixed(2) }} m/s²</strong>
            </div>
            <div class="preview-metric">
              <span>Góc nghiêng:</span>
              <strong>{{ getTiltAngle(device).toFixed(2) }}°</strong>
            </div>
            <div class="preview-time">
              {{ formatTime(device.timestamp) }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-devices">
        <p>Chưa có thiết bị nào được kết nối</p>
      </div>
      <div v-if="latestDevices.length > 3" class="view-all">
        <a href="/devices-and-sensors">Xem tất cả thiết bị →</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";
import type { SensorData, Statistics } from "../../types/sensor";
import { getLatestDevices, getStatistics } from "../../services/sensorApi";

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

function formatTime(timestamp: string): string {
  try {
    return format(new Date(timestamp), "dd/MM/yyyy HH:mm", { locale: vi });
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

function safeNumber(value: unknown) {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function calcAccel(d: SensorData) {
  const reading = d?.data;
  const x = safeNumber(reading?.accel_x);
  const y = safeNumber(reading?.accel_y);
  const z = safeNumber(reading?.accel_z);
  return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
}

function getTiltAngle(d: SensorData) {
  const raw = d?.data?.tilt_angle;
  const n = typeof raw === "string" ? Number.parseFloat(raw) : raw;
  return typeof n === "number" && Number.isFinite(n) ? n : Number.NaN;
}

function setDemoData() {
  demoMode.value = true;
  statistics.value = {
    totalDevices: 3,
    activeDevices: 2,
    criticalAlerts: 1,
    dangerAlerts: 1,
    warningAlerts: 2,
    lastUpdated: new Date().toISOString(),
  };

  const now = Date.now();
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
      deviceId: "ESP32-02",
      timestamp: new Date(now - 38_000).toISOString(),
      severity: "normal",
      data: {
        accel_x: 0.08,
        accel_y: 0.05,
        accel_z: 9.79,
        gyro_x: 0.0,
        gyro_y: 0.01,
        gyro_z: 0.0,
        mag_x: 0,
        mag_y: 0,
        mag_z: 0,
        tilt_angle: 2.1,
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
      location: { lat: 21.0375, lon: 105.7832 },
    },
  ];
}

async function refresh() {
  loading.value = true;
  errorMsg.value = "";
  demoMode.value = false;
  try {
    const [stats, devices] = await Promise.all([getStatistics(), getLatestDevices()]);
    statistics.value = stats;
    latestDevices.value = Array.isArray(devices) ? devices : [];
  } catch (e: any) {
    errorMsg.value = "Không tải được dữ liệu. Kiểm tra đăng nhập và backend.";
    setDemoData();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  refresh();
});
</script>

<style scoped>
.home-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  padding: 22px 18px;
  margin-bottom: 26px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.06);
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.hero-section h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 15px;
  color: #667085;
  margin: 0;
  line-height: 1.5;
}

.hero-actions {
  flex-shrink: 0;
}

.btn-outline {
  border: 1px solid #dbe3f0;
  background: #f8fafc;
  color: #334155;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-outline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin: 10px 0 0 0;
  font-size: 13px;
  color: #dc2626;
}

.hint {
  margin: 10px 0 0 0;
  font-size: 13px;
  color: #64748b;
}

/* Quick Stats */
.quick-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 34px;
  flex-wrap: wrap;
}

.stat-box {
  text-align: center;
  padding: 22px 28px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  min-width: 170px;
}

.stat-number {
  font-size: 42px;
  font-weight: 800;
  color: #667eea;
  margin-bottom: 6px;
}

.alert-box .alert-number {
  color: #ef4444;
}

.stat-text {
  font-size: 15px;
  color: #666;
  font-weight: 600;
}

/* Overview Section */
.overview-section {
  margin-bottom: 34px;
}

.overview-section h2 {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 14px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.overview-card {
  background: white;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.overview-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.overview-card p {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 14px 0;
}

.card-link {
  display: inline-block;
  color: #667eea;
  font-weight: 700;
  text-decoration: none;
  font-size: 14px;
}

/* Recent Devices */
.recent-devices h2 {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 14px;
}

.devices-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.device-preview-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #e5e7eb;
}

.device-preview-card.severity-normal {
  border-left-color: #10b981;
}
.device-preview-card.severity-warning {
  border-left-color: #f59e0b;
}
.device-preview-card.severity-danger {
  border-left-color: #ef4444;
}
.device-preview-card.severity-critical {
  border-left-color: #dc2626;
}

.device-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.device-id {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}
.status-badge.normal {
  background: #d1fae5;
  color: #065f46;
}
.status-badge.warning {
  background: #fef3c7;
  color: #92400e;
}
.status-badge.danger {
  background: #fee2e2;
  color: #991b1b;
}
.status-badge.critical {
  background: #fecaca;
  color: #7f1d1d;
}

.device-preview-data {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-metric {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.preview-metric span {
  color: #6b7280;
}

.preview-metric strong {
  color: #111827;
  font-weight: 700;
}

.preview-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.no-devices {
  background: white;
  border-radius: 12px;
  padding: 28px;
  text-align: center;
  color: #94a3b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.view-all {
  text-align: center;
  margin-top: 10px;
}

.view-all a {
  color: #667eea;
  font-weight: 700;
  text-decoration: none;
  font-size: 15px;
}

@media (max-width: 768px) {
  .home-page {
    padding: 16px;
  }

  .hero-top {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

