<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>Nhật ký</h1>
        <p class="subtitle">Tra cứu lịch sử dữ liệu theo thiết bị và thời gian.</p>
      </div>
      <button class="btn" type="button" @click="runQuery" :disabled="loading || !deviceId">
        {{ loading ? 'Đang tải...' : 'Tải dữ liệu' }}
      </button>
    </div>

    <div class="filters-card">
      <div class="row">
        <label class="field">
          <span class="label">Device ID</span>
          <input v-model="deviceId" class="input" placeholder="Ví dụ: ESP32-01" />
        </label>

        <label class="field">
          <span class="label">Từ</span>
          <input v-model="fromLocal" class="input" type="datetime-local" />
        </label>

        <label class="field">
          <span class="label">Đến</span>
          <input v-model="toLocal" class="input" type="datetime-local" />
        </label>

        <label class="field">
          <span class="label">Giới hạn</span>
          <input v-model.number="limit" class="input" type="number" min="1" max="500" />
        </label>
      </div>

      <div class="row2">
        <button class="btn-outline" type="button" @click="quick('15m')">15 phút</button>
        <button class="btn-outline" type="button" @click="quick('1h')">1 giờ</button>
        <button class="btn-outline" type="button" @click="quick('24h')">24 giờ</button>
        <button class="btn-outline" type="button" @click="useDemo">Dữ liệu mẫu</button>
        <span class="msg" v-if="errorMsg">{{ errorMsg }}</span>
        <span class="msg hint" v-else-if="demoMode">Đang hiển thị dữ liệu mẫu.</span>
      </div>
    </div>

    <div class="table-card">
      <div class="table-head">
        <div class="title">Kết quả</div>
        <div class="meta">{{ rows.length }} bản ghi</div>
      </div>

      <div v-if="rows.length === 0" class="empty">
        <p>Chưa có dữ liệu. Chọn Device ID và bấm “Tải dữ liệu”.</p>
      </div>

      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Thiết bị</th>
              <th>Severity</th>
              <th>Accel (x,y,z)</th>
              <th>Tilt (°)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r._id || r.timestamp + r.deviceId">
              <td class="mono">{{ formatTime(r.timestamp) }}</td>
              <td>{{ r.deviceId }}</td>
              <td>
                <span class="sev-pill" :class="`sev-${r.severity}`">{{ r.severity }}</span>
              </td>
              <td class="mono">
                {{ r.data.accel_x.toFixed(2) }}, {{ r.data.accel_y.toFixed(2) }}, {{ r.data.accel_z.toFixed(2) }}
              </td>
              <td class="mono">{{ r.data.tilt_angle.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";
import type { SensorData } from "../../types/sensor";
import { getDeviceHistory } from "../../services/sensorApi";

const deviceId = ref("");
const fromLocal = ref("");
const toLocal = ref("");
const limit = ref(120);

const loading = ref(false);
const errorMsg = ref("");
const demoMode = ref(false);
const rows = ref<SensorData[]>([]);

function formatTime(ts: string) {
  try {
    return format(new Date(ts), "dd/MM/yyyy HH:mm:ss", { locale: vi });
  } catch {
    return ts;
  }
}

function localToIso(value: string) {
  if (!value) return undefined;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return undefined;
  return dt.toISOString();
}

function quick(preset: "15m" | "1h" | "24h") {
  const now = new Date();
  const from = new Date(now);
  if (preset === "15m") from.setMinutes(from.getMinutes() - 15);
  if (preset === "1h") from.setHours(from.getHours() - 1);
  if (preset === "24h") from.setHours(from.getHours() - 24);

  // datetime-local expects "YYYY-MM-DDTHH:mm"
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtLocal = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  fromLocal.value = fmtLocal(from);
  toLocal.value = fmtLocal(now);
}

function useDemo() {
  demoMode.value = true;
  errorMsg.value = "";
  const now = Date.now();
  rows.value = [
    {
      deviceId: "ESP32-01",
      timestamp: new Date(now - 10_000).toISOString(),
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
      deviceId: "ESP32-01",
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
      deviceId: "ESP32-01",
      timestamp: new Date(now - 78_000).toISOString(),
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

async function runQuery() {
  loading.value = true;
  errorMsg.value = "";
  demoMode.value = false;
  try {
    rows.value = await getDeviceHistory(
      deviceId.value,
      localToIso(fromLocal.value),
      localToIso(toLocal.value),
      limit.value
    );
  } catch {
    errorMsg.value = "Không tải được lịch sử. Kiểm tra đăng nhập và backend.";
    rows.value = [];
  } finally {
    loading.value = false;
  }
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

.btn {
  border: 1px solid #dbe3f0;
  background: #ffffff;
  color: #334155;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filters-card,
.table-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.06);
  padding: 16px;
}

.filters-card {
  margin-bottom: 14px;
}

.row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 0.6fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  font-weight: 800;
  color: #475569;
}

.input {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 9px 10px;
  font-size: 14px;
  outline: none;
}

.input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}

.row2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.btn-outline {
  border: 1px solid #dbe3f0;
  background: #f8fafc;
  color: #334155;
  border-radius: 999px;
  padding: 7px 12px;
  font-weight: 800;
  cursor: pointer;
  font-size: 13px;
}

.msg {
  margin-left: auto;
  font-size: 13px;
  color: #dc2626;
}

.msg.hint {
  color: #64748b;
}

.table-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 10px;
  border-bottom: 1px solid #eef2f7;
  margin-bottom: 10px;
}

.table-head .title {
  font-size: 16px;
  font-weight: 900;
  color: #111827;
}

.table-head .meta {
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

@media (max-width: 900px) {
  .row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

