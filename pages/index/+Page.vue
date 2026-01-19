<template>
  <div class="login-wrap">
    <div class="login-card">
      <h1 class="title">IoT Dashboard</h1>
      <p class="subtitle">
        Đăng nhập để xem dữ liệu thiết bị và cảnh báo từ hệ thống.
      </p>

      <form class="form" @submit.prevent="handleLogin">
        <label class="field">
          <span class="label">Tài khoản</span>
          <input
            v-model="username"
            class="input"
            type="text"
            autocomplete="username"
            placeholder="Ví dụ: admin"
            :disabled="loading"
          />
        </label>

        <label class="field">
          <span class="label">Mật khẩu</span>
          <input
            v-model="password"
            class="input"
            type="password"
            autocomplete="current-password"
            placeholder="Nhập mật khẩu"
            :disabled="loading"
          />
        </label>

        <button class="btn" type="submit" :disabled="loading || !username || !password">
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        <p v-if="okMsg" class="ok">{{ okMsg }}</p>
      </form>

      <div class="note">
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { login } from "../../services/authApi";

const username = ref("");
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");
const okMsg = ref("");

const apiUrl = computed(() => import.meta.env.VITE_API_URL || "(chưa set VITE_API_URL)");

async function handleLogin() {
  errorMsg.value = "";
  okMsg.value = "";
  loading.value = true;
  try {
    const res = await login({ username: username.value, password: password.value });
    if (!res.token) {
      errorMsg.value = res.message || "Đăng nhập thất bại.";
      return;
    }
    okMsg.value = "Đăng nhập thành công.";
    window.location.href = "/home";
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message || "Không thể đăng nhập. Kiểm tra backend và tài khoản.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  background: #ffffff;
  padding: 28px 30px;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
  max-width: 460px;
  width: 100%;
}

.title {
  font-size: 30px;
  margin: 0 0 10px 0;
  color: #0f172a;
}

.subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 18px 0;
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
  font-size: 13px;
  color: #475569;
}

.input {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
}

.input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}

.btn {
  margin-top: 4px;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: #ffffff;
  padding: 10px 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin: 6px 0 0 0;
  font-size: 13px;
  color: #dc2626;
}

.ok {
  margin: 6px 0 0 0;
  font-size: 13px;
  color: #16a34a;
}

.note {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
  color: #64748b;
  font-size: 13px;
}

.row {
  display: grid;
  grid-template-columns: 74px 1fr;
  gap: 10px;
  padding: 4px 0;
}

.k {
  color: #475569;
  font-weight: 600;
}

.v {
  color: #64748b;
}
</style>
