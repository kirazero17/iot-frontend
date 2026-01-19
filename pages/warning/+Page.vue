<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>Cảnh báo</h1>
        <p class="subtitle">Danh sách cảnh báo mức nguy hiểm và nghiêm trọng từ các thiết bị.</p>
      </div>
      <button class="btn" type="button" @click="refresh" :disabled="loading">
        {{ loading ? 'Đang tải...' : 'Làm mới' }}
      </button>
    </div>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <p v-else-if="demoMode" class="hint">Đang hiển thị dữ liệu mẫu.</p>

    <div class="filters">
      <div class="chip" :class="{ active: filter === 'all' }" @click="filter = 'all'">Tất cả</div>
      <div class="chip" :class="{ active: filter === 'danger' }" @click="filter = 'danger'">Nguy hiểm</div>
      <div class="chip" :class="{ active: filter === 'critical' }" @click="filter = 'critical'">Nghiêm trọng</div>
    </div>

    <div v-if="filteredAlerts.length > 0" class="alerts">
      <div
        v-for="a in filteredAlerts"
        :key="a._id || a.timestamp + a.deviceId"
        class="alert-item"
        :class="`sev-${a.severity}`"
      >
        <div class="left">
          <div class="sev">{{ a.severity.toUpperCase() }}</div>
        </div>
        <div class="mid">
          <div class="row1">
            <div class="dev">Thiết bị: <strong>{{ a.deviceId }}</strong></div>
            <div class="time">{{ formatTime(a.timestamp) }}</div>
          </div>
          <div class="row2">
            <span>Gia tốc:</span>
            <strong>{{ a.data.accel_x.toFixed(2) }}</strong>,
            <strong>{{ a.data.accel_y.toFixed(2) }}</strong>,
            <strong>{{ a.data.accel_z.toFixed(2) }}</strong>
            <span class="unit">m/s²</span>
          </div>
          <div v-if="a.location" class="row3">
            Vị trí: {{ a.location.lat.toFixed(4) }}, {{ a.location.lon.toFixed(4) }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <p>Chưa có cảnh báo.</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";
import type { Alert } from "../../types/sensor";
import { getAlerts } from "../../services/sensorApi";

const loading = ref(false);
const errorMsg = ref("");
const demoMode = ref(false);
const filter = ref<"all" | "danger" | "critical">("all");
const alerts = ref<Alert[]>([]);

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
      location: { lat: 21.0375, lon: 105.7832 },
    },
    {
      deviceId: "ESP32-01",
      timestamp: new Date(now - 68_000).toISOString(),
      severity: "critical",
      data: {
        accel_x: 3.18,
        accel_y: 2.02,
        accel_z: 12.4,
        gyro_x: 0.22,
        gyro_y: 0.14,
        gyro_z: 0.18,
        mag_x: 0,
        mag_y: 0,
        mag_z: 0,
        tilt_angle: 26.1,
      },
    },
  ];
}

async function refresh() {
  loading.value = true;
  errorMsg.value = "";
  demoMode.value = false;
  try {
    alerts.value = await getAlerts(50);
  } catch {
    errorMsg.value = "Không tải được cảnh báo. Kiểm tra đăng nhập và backend.";
    setDemo();
  } finally {
    loading.value = false;
  }
}

const filteredAlerts = computed(() => {
  if (filter.value === "all") return alerts.value;
  return alerts.value.filter((a) => a.severity === filter.value);
});

onMounted(() => {
  refresh();
});
</script>

<style scoped>
.page {
  padding: 24px;
  max-width: 1100px;
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

.btn {
  border: 1px solid #dbe3f0;
  background: #ffffff;
  color: #334155;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #dc2626;
}

.hint {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #64748b;
}

.filters {
  display: flex;
  gap: 10px;
  margin: 12px 0 14px 0;
}

.chip {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

.chip.active {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}

.alerts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
  display: grid;
  grid-template-columns: 90px 1fr;
  overflow: hidden;
  border-left: 4px solid #e5e7eb;
}

.alert-item.sev-danger {
  border-left-color: #ef4444;
}

.alert-item.sev-critical {
  border-left-color: #dc2626;
}

.left {
  padding: 14px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.sev {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.6px;
  color: #334155;
}

.mid {
  padding: 14px 16px;
}

.row1 {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.dev {
  color: #334155;
  font-size: 14px;
}

.time {
  color: #94a3b8;
  font-size: 12px;
}

.row2 {
  color: #475569;
  font-size: 13px;
}

.unit {
  margin-left: 4px;
  color: #94a3b8;
}

.row3 {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.empty {
  background: #ffffff;
  border-radius: 14px;
  padding: 26px;
  text-align: center;
  color: #94a3b8;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
}

@media (max-width: 600px) {
  .alert-item {
    grid-template-columns: 1fr;
  }

  .left {
    justify-content: flex-start;
  }
}
</style>

