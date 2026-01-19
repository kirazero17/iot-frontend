<template>
  <a :class="{ active: isActive }" :href="href">
    <slot />
  </a>
</template>

<script lang="ts" setup>
import { usePageContext } from "vike-vue/usePageContext";
import { computed, useAttrs } from "vue";

const pageContext = usePageContext();
const { href } = useAttrs();
const isActive = computed(() => {
  const { urlPathname } = pageContext;
  return href === "/" ? urlPathname === href : urlPathname.startsWith(href);
});
</script>

<style scoped>
a {
  display: block;
  color: inherit;
  text-decoration: none;
}

a.active {
  background-color: rgba(255, 255, 255, 0.15) !important;
  color: white !important;
}
</style>
