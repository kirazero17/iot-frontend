import type { Config } from "vike/types";
import vikeVue from "vike-vue/config";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/head-tags
  title: "IoT Dashboard",
  description: "IoT Dashboard",

  extends: [vikeVue],
} as Config;
