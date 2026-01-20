<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>Thiết Bị &amp; Cảm Biến</h1>
        <p class="subtitle">Danh sách thiết bị đang gửi dữ liệu lên hệ thống.</p>
      </div>
      <div class="actions">
        <select v-model="sevFilter" class="select">
          <option value="all">Tất cả</option>
          <option value="normal">Bình thường</option>
          <option value="warning">Cảnh báo</option>
          <option value="danger">Nguy hiểm</option>
          <option value="critical">Nghiêm trọng</option>
        </select>
        <button class="btn" type="button" @click="refresh" :disabled="loading">
          {{ loading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </div>
    </div>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <p v-else-if="demoMode" class="hint">Đang hiển thị dữ liệu mẫu.</p>

    <div class="table-card">
      <div class="table-head">
        <div class="title">Thiết bị</div>
        <div class="meta">{{ filtered.length }} thiết bị</div>
      </div>

      <div v-if="filtered.length === 0" class="empty">
        <p>Chưa có dữ liệu thiết bị.</p>
      </div>

      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Severity</th>
              <th>Cập nhật</th>
              <th>Accel (x,y,z)</th>
              <th>Tilt</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in filtered" :key="d.deviceId">
              <td class="mono">{{ d.deviceId }}</td>
              <td>
                <span class="sev-pill" :class="`sev-${d.severity}`">{{ d.severity }}</span>
              </td>
              <td class="mono">{{ formatTime(d.timestamp) }}</td>
              <td class="mono">
                {{ formatNumber(d?.data?.accel_x, 2) }}, {{ formatNumber(d?.data?.accel_y, 2) }}, {{ formatNumber(d?.data?.accel_z, 2) }}
              </td>
              <td class="mono">{{ formatNumber(getTiltAngle(d), 2) }}°</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";
import type { SensorData } from "../../types/sensor";
import { getLatestDevices } from "../../services/sensorApi";

const loading = ref(false);
const errorMsg = ref("");
const demoMode = ref(false);
const sevFilter = ref<"all" | "normal" | "warning" | "danger" | "critical">("all");
const devices = ref<SensorData[]>([]);

function formatTime(ts: string) {
  try {
    return format(new Date(ts), "dd/MM/yyyy HH:mm:ss", { locale: vi });
  } catch {
    return ts;
  }
}

function setDemo() {
  demoMode.value = true;
  const now = Date.now();
  devices.value = [
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
  ];
}

async function refresh() {
  loading.value = true;
  errorMsg.value = "";
  demoMode.value = false;
  try {
    const res = await getLatestDevices();
    devices.value = Array.isArray(res) ? res : [];
  } catch {
    errorMsg.value = "Không tải được danh sách thiết bị. Kiểm tra đăng nhập và backend.";
    setDemo();
  } finally {
    loading.value = false;
  }
}

const filtered = computed(() => {
  if (sevFilter.value === "all") return devices.value;
  return devices.value.filter((d) => d.severity === sevFilter.value);
});

onMounted(() => {
  refresh();
});

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
</script>

<style scoped>
.page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

h1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 28px;
  margin: 0 0 8px 0;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.select {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 10px;
  padding: 8px 10px;
  font-weight: 800;
  color: #334155;
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

.table-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.06);
  padding: 16px;
}

.table-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 10px;
  border-bottom: 1px solid #eef2f7;
  margin-bottom: 10px;
}

.title {
  font-size: 16px;
  font-weight: 900;
  color: #111827;
}

.meta {
  font-size: 12px;
  color: #94a3b8;
}

.empty {
  padding: 20px 6px;
  color: #94a3b8;
  text-align: center;
}

.table-wrap {
  overflow: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 10px 12px;
  border-bottom: 1px solid #eef2f7;
  text-align: left;
  font-size: 13px;
  white-space: nowrap;
}

.table th {
  color: #475569;
  font-weight: 900;
  background: #f8fafc;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.sev-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 12px;
  text-transform: uppercase;
}

.sev-pill.sev-normal {
  background: #d1fae5;
  color: #065f46;
}
.sev-pill.sev-warning {
  background: #fef3c7;
  color: #92400e;
}
.sev-pill.sev-danger {
  background: #fee2e2;
  color: #991b1b;
}
.sev-pill.sev-critical {
  background: #fecaca;
  color: #7f1d1d;
}
</style>

