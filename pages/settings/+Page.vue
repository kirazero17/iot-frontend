<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>Cài đặt</h1>
        <p class="subtitle">Quản lý đăng nhập và kiểm tra kết nối backend.</p>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Tài khoản</div>

        <div v-if="isLoggedIn" class="info">
          <div class="row">
            <span class="k">Trạng thái</span>
            <span class="v ok">Đã đăng nhập</span>
          </div>
          <div class="row">
            <span class="k">Token</span>
            <span class="v mono">{{ tokenPreview }}</span>
          </div>

          <button class="btn-danger" type="button" @click="handleLogout">
            Đăng xuất
          </button>
        </div>

        <form v-else class="form" @submit.prevent="handleLogin">
          <label class="field">
            <span class="label">Tài khoản</span>
            <input v-model="username" class="input" placeholder="admin" />
          </label>
          <label class="field">
            <span class="label">Mật khẩu</span>
            <input v-model="password" class="input" type="password" placeholder="••••••••" />
          </label>
          <button class="btn" type="submit" :disabled="loading || !username || !password">
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
          <p v-if="msg" class="msg" :class="{ err: msgType === 'err', ok: msgType === 'ok' }">{{ msg }}</p>
        </form>
      </div>

      <div class="card">
        <div class="card-title">Kết nối backend</div>

        <div class="info">
          <div class="row">
            <span class="k">API URL</span>
            <span class="v mono">{{ apiUrl }}</span>
          </div>
          <div class="row">
            <span class="k">Health</span>
            <span class="v" :class="{ ok: health?.status === 'ok', err: health?.status && health.status !== 'ok' }">
              {{ healthText }}
            </span>
          </div>
          <button class="btn-outline" type="button" @click="checkHealth" :disabled="healthLoading">
            {{ healthLoading ? 'Đang kiểm tra...' : 'Kiểm tra' }}
          </button>
        </div>

        <p class="hint">
          Nếu bị lỗi 401 khi tải trang, hãy đăng nhập lại hoặc kiểm tra `VITE_API_URL`.
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import api from "../../utils/api";
import { getStoredToken, login, logout } from "../../services/authApi";

const username = ref("");
const password = ref("");
const loading = ref(false);
const msg = ref("");
const msgType = ref<"ok" | "err">("ok");

const apiUrl = computed(() => import.meta.env.VITE_API_URL || "(chưa set VITE_API_URL)");
const isLoggedIn = ref(!!getStoredToken());

const tokenPreview = computed(() => {
  const t = getStoredToken();
  if (!t) return "";
  if (t.length <= 20) return t;
  return `${t.slice(0, 10)}...${t.slice(-8)}`;
});

const healthLoading = ref(false);
const health = ref<any>(null);

const healthText = computed(() => {
  if (healthLoading.value) return "Đang kiểm tra...";
  if (!health.value) return "Chưa kiểm tra";
  if (health.value.status === "ok") return `OK (MongoDB: ${health.value.mongodb})`;
  return `Lỗi (MongoDB: ${health.value.mongodb || "unknown"})`;
});

async function handleLogin() {
  msg.value = "";
  loading.value = true;
  try {
    const res = await login({ username: username.value, password: password.value });
    if (!res.token) {
      msgType.value = "err";
      msg.value = res.message || "Đăng nhập thất bại.";
      return;
    }
    msgType.value = "ok";
    msg.value = "Đăng nhập thành công.";
    isLoggedIn.value = true;
  } catch {
    msgType.value = "err";
    msg.value = "Không thể đăng nhập. Kiểm tra backend và tài khoản.";
  } finally {
    loading.value = false;
  }
}

function handleLogout() {
  logout();
  isLoggedIn.value = false;
  msg.value = "";
}

async function checkHealth() {
  healthLoading.value = true;
  try {
    const res = await api.get("/api/health");
    health.value = res.data;
  } catch {
    health.value = { status: "error", mongodb: "disconnected" };
  } finally {
    healthLoading.value = false;
  }
}

onMounted(() => {
  checkHealth();
});
</script>

<style scoped>
.page {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.page-head {
  margin-bottom: 14px;
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

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.06);
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 12px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  font-weight: 900;
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

.btn {
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
  padding: 10px 12px;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  border: 1px solid #dbe3f0;
  background: #ffffff;
  color: #334155;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.btn-danger {
  border: none;
  border-radius: 10px;
  background: #ef4444;
  color: #ffffff;
  padding: 10px 12px;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
  margin-top: 12px;
}

.msg {
  margin: 0;
  font-size: 13px;
}

.msg.err {
  color: #dc2626;
}

.msg.ok {
  color: #16a34a;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 10px;
  align-items: baseline;
}

.k {
  color: #475569;
  font-weight: 900;
  font-size: 12px;
}

.v {
  color: #334155;
  font-size: 13px;
}

.v.ok {
  color: #16a34a;
  font-weight: 900;
}

.v.err {
  color: #dc2626;
  font-weight: 900;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.hint {
  margin: 12px 0 0 0;
  color: #64748b;
  font-size: 13px;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>

