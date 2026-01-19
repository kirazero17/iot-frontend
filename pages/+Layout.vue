<!-- https://vike.dev/Layout -->

<template>
  <div class="layout">
    <Sidebar>
      <div class="sidebar-header">
        <Logo />
        <h2 class="app-title">IoT Dashboard</h2>
      </div>
      <nav class="sidebar-nav">
        <Link href="/home" class="nav-item">
          <span class="nav-icon"></span>
          <span>Trang Chủ</span>
        </Link>
        <Link href="/dashboard" class="nav-item">
          <span class="nav-icon"></span>
          <span>Dashboard</span>
        </Link>
        <Link href="/devices-and-sensors" class="nav-item">
          <span class="nav-icon"></span>
          <span>Thiết Bị & Cảm Biến</span>
        </Link>
        <Link href="/warning" class="nav-item">
          <span class="nav-icon"></span>
          <span>Cảnh Báo</span>
        </Link>
        <Link href="/history" class="nav-item">
          <span class="nav-icon"></span>
          <span>Nhật Ký</span>
        </Link>
        <Link href="/settings" class="nav-item">
          <span class="nav-icon"></span>
          <span>Cài Đặt</span>
        </Link>
      </nav>
    </Sidebar>
    <Content><slot /></Content>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import Content from "../components/Content.vue";
import Link from "../components/Link.vue";
import Logo from "../components/Logo.vue";
import Sidebar from "../components/Sidebar.vue";
import { loadTokenFromStorage, getStoredToken } from "../services/authApi";

onMounted(() => {
  loadTokenFromStorage();

  const path = window.location.pathname;
  const hasToken = !!getStoredToken();

  // Require login for all pages except "/"
  if (!hasToken && path !== "/") {
    window.location.href = "/";
    return;
  }

  // If already logged in, don't stay on login page
  if (hasToken && path === "/") {
    window.location.href = "/home";
  }
});
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
}
* {
  box-sizing: border-box;
}
a {
  text-decoration: none;
}
</style>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* Page Transition Animation */
#page-content {
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}
body.page-transition #page-content {
  opacity: 0;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.app-title {
  margin: 12px 0 0 0;
  font-size: 26px;
  font-weight: 600;
  color: white;
  text-align: center;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s;
  font-size: 20px;
  font-weight: 500;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}
</style>
