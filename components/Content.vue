<template>
  <div id="page-container">
    <div id="page-content" class="content">
      <slot />
    </div>
  </div>
</template>

<style>
/* Page Transition Animation */
body.page-transition #page-content {
  opacity: 0;
}
</style>

<style scoped>
.content {
  flex: 1;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* Page Transition Animation */
#page-content {
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
  padding: 50px;
}
</style>
