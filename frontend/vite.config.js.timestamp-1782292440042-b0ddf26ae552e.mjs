// vite.config.js
import { defineConfig } from "file:///C:/Users/vg934/OneDrive/Desktop/lms-clean%20(1)/lms-clean/frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/vg934/OneDrive/Desktop/lms-clean%20(1)/lms-clean/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import { VitePWA } from "file:///C:/Users/vg934/OneDrive/Desktop/lms-clean%20(1)/lms-clean/frontend/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\vg934\\OneDrive\\Desktop\\lms-clean (1)\\lms-clean\\frontend";
var vite_config_default = defineConfig(async ({ mode }) => {
  const isDev = mode === "development";
  const frappeui = await importFrappeUIPlugin(isDev);
  const config = {
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false"
    },
    plugins: [
      frappeui({
        frappeProxy: true,
        lucideIcons: true,
        jinjaBootData: true,
        buildConfig: {
          indexHtmlPath: "../lms/www/_lms.html"
        }
      }),
      vue(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: {
          enabled: false
        },
        workbox: {
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globDirectory: "/assets/lms/frontend",
          globPatterns: ["**/*.{js,ts,css,html,svg}"],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === "document",
              handler: "NetworkFirst",
              options: {
                cacheName: "html-cache"
              }
            }
          ]
        },
        manifest: false
      })
    ],
    server: {
      host: "0.0.0.0",
      // Accept connections from any network interface
      allowedHosts: true
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "src")
      }
    },
    optimizeDeps: {
      include: [
        "feather-icons",
        "tailwind.config.js",
        "interactjs",
        "highlight.js",
        "plyr"
      ],
      exclude: mode === "production" ? [] : ["frappe-ui"]
    }
  };
  return config;
});
async function importFrappeUIPlugin(isDev) {
  if (isDev) {
    try {
      const module2 = await import("../frappe-ui/vite");
      return module2.default;
    } catch (error) {
      console.warn(
        "Local frappe-ui not found, falling back to npm package:",
        error.message
      );
    }
  }
  const module = await import("file:///C:/Users/vg934/OneDrive/Desktop/lms-clean%20(1)/lms-clean/frontend/node_modules/frappe-ui/vite/index.js");
  return module.default;
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx2ZzkzNFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGxtcy1jbGVhbiAoMSlcXFxcbG1zLWNsZWFuXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx2ZzkzNFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGxtcy1jbGVhbiAoMSlcXFxcbG1zLWNsZWFuXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy92ZzkzNC9PbmVEcml2ZS9EZXNrdG9wL2xtcy1jbGVhbiUyMCgxKS9sbXMtY2xlYW4vZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICh7IG1vZGUgfSkgPT4ge1xuXHRjb25zdCBpc0RldiA9IG1vZGUgPT09ICdkZXZlbG9wbWVudCdcblx0Y29uc3QgZnJhcHBldWkgPSBhd2FpdCBpbXBvcnRGcmFwcGVVSVBsdWdpbihpc0RldilcblxuXHRjb25zdCBjb25maWcgPSB7XG5cdFx0ZGVmaW5lOiB7XG5cdFx0XHRfX1ZVRV9QUk9EX0hZRFJBVElPTl9NSVNNQVRDSF9ERVRBSUxTX186ICdmYWxzZScsXG5cdFx0fSxcblx0XHRwbHVnaW5zOiBbXG5cdFx0XHRmcmFwcGV1aSh7XG5cdFx0XHRcdGZyYXBwZVByb3h5OiB0cnVlLFxuXHRcdFx0XHRsdWNpZGVJY29uczogdHJ1ZSxcblx0XHRcdFx0amluamFCb290RGF0YTogdHJ1ZSxcblx0XHRcdFx0YnVpbGRDb25maWc6IHtcblx0XHRcdFx0XHRpbmRleEh0bWxQYXRoOiAnLi4vbG1zL3d3dy9fbG1zLmh0bWwnLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSksXG5cdFx0XHR2dWUoKSxcblx0XHRcdFZpdGVQV0Eoe1xuXHRcdFx0XHRyZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcblx0XHRcdFx0ZGV2T3B0aW9uczoge1xuXHRcdFx0XHRcdGVuYWJsZWQ6IGZhbHNlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR3b3JrYm94OiB7XG5cdFx0XHRcdFx0Y2xlYW51cE91dGRhdGVkQ2FjaGVzOiB0cnVlLFxuXHRcdFx0XHRcdG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiA1ICogMTAyNCAqIDEwMjQsXG5cdFx0XHRcdFx0Z2xvYkRpcmVjdG9yeTogJy9hc3NldHMvbG1zL2Zyb250ZW5kJyxcblx0XHRcdFx0XHRnbG9iUGF0dGVybnM6IFsnKiovKi57anMsdHMsY3NzLGh0bWwsc3ZnfSddLFxuXHRcdFx0XHRcdHJ1bnRpbWVDYWNoaW5nOiBbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHVybFBhdHRlcm46ICh7IHJlcXVlc3QgfSkgPT5cblx0XHRcdFx0XHRcdFx0XHRyZXF1ZXN0LmRlc3RpbmF0aW9uID09PSAnZG9jdW1lbnQnLFxuXHRcdFx0XHRcdFx0XHRoYW5kbGVyOiAnTmV0d29ya0ZpcnN0Jyxcblx0XHRcdFx0XHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHRcdFx0XHRcdGNhY2hlTmFtZTogJ2h0bWwtY2FjaGUnLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRdLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtYW5pZmVzdDogZmFsc2UsXG5cdFx0XHR9KSxcblx0XHRdLFxuXHRcdHNlcnZlcjoge1xuXHRcdFx0aG9zdDogJzAuMC4wLjAnLCAvLyBBY2NlcHQgY29ubmVjdGlvbnMgZnJvbSBhbnkgbmV0d29yayBpbnRlcmZhY2Vcblx0XHRcdGFsbG93ZWRIb3N0czogdHJ1ZSxcblx0XHR9LFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGFsaWFzOiB7XG5cdFx0XHRcdCdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxuXHRcdFx0fSxcblx0XHR9LFxuXHRcdG9wdGltaXplRGVwczoge1xuXHRcdFx0aW5jbHVkZTogW1xuXHRcdFx0XHQnZmVhdGhlci1pY29ucycsXG5cdFx0XHRcdCd0YWlsd2luZC5jb25maWcuanMnLFxuXHRcdFx0XHQnaW50ZXJhY3RqcycsXG5cdFx0XHRcdCdoaWdobGlnaHQuanMnLFxuXHRcdFx0XHQncGx5cicsXG5cdFx0XHRdLFxuXHRcdFx0ZXhjbHVkZTogbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nID8gW10gOiBbJ2ZyYXBwZS11aSddLFxuXHRcdH0sXG5cdH1cblx0cmV0dXJuIGNvbmZpZ1xufSlcblxuYXN5bmMgZnVuY3Rpb24gaW1wb3J0RnJhcHBlVUlQbHVnaW4oaXNEZXYpIHtcblx0aWYgKGlzRGV2KSB7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IG1vZHVsZSA9IGF3YWl0IGltcG9ydCgnLi4vZnJhcHBlLXVpL3ZpdGUnKVxuXHRcdFx0cmV0dXJuIG1vZHVsZS5kZWZhdWx0XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0J0xvY2FsIGZyYXBwZS11aSBub3QgZm91bmQsIGZhbGxpbmcgYmFjayB0byBucG0gcGFja2FnZTonLFxuXHRcdFx0XHRlcnJvci5tZXNzYWdlXG5cdFx0XHQpXG5cdFx0fVxuXHR9XG5cdC8vIEZhbGwgYmFjayB0byBucG0gcGFja2FnZSBpZiBsb2NhbCBpbXBvcnQgZmFpbHNcblx0Y29uc3QgbW9kdWxlID0gYXdhaXQgaW1wb3J0KCdmcmFwcGUtdWkvdml0ZScpXG5cdHJldHVybiBtb2R1bGUuZGVmYXVsdFxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvWSxTQUFTLG9CQUFvQjtBQUNqYSxPQUFPLFNBQVM7QUFDaEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsZUFBZTtBQUh4QixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsT0FBTyxFQUFFLEtBQUssTUFBTTtBQUMvQyxRQUFNLFFBQVEsU0FBUztBQUN2QixRQUFNLFdBQVcsTUFBTSxxQkFBcUIsS0FBSztBQUVqRCxRQUFNLFNBQVM7QUFBQSxJQUNkLFFBQVE7QUFBQSxNQUNQLHlDQUF5QztBQUFBLElBQzFDO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUixTQUFTO0FBQUEsUUFDUixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixlQUFlO0FBQUEsUUFDZixhQUFhO0FBQUEsVUFDWixlQUFlO0FBQUEsUUFDaEI7QUFBQSxNQUNELENBQUM7QUFBQSxNQUNELElBQUk7QUFBQSxNQUNKLFFBQVE7QUFBQSxRQUNQLGNBQWM7QUFBQSxRQUNkLFlBQVk7QUFBQSxVQUNYLFNBQVM7QUFBQSxRQUNWO0FBQUEsUUFDQSxTQUFTO0FBQUEsVUFDUix1QkFBdUI7QUFBQSxVQUN2QiwrQkFBK0IsSUFBSSxPQUFPO0FBQUEsVUFDMUMsZUFBZTtBQUFBLFVBQ2YsY0FBYyxDQUFDLDJCQUEyQjtBQUFBLFVBQzFDLGdCQUFnQjtBQUFBLFlBQ2Y7QUFBQSxjQUNDLFlBQVksQ0FBQyxFQUFFLFFBQVEsTUFDdEIsUUFBUSxnQkFBZ0I7QUFBQSxjQUN6QixTQUFTO0FBQUEsY0FDVCxTQUFTO0FBQUEsZ0JBQ1IsV0FBVztBQUFBLGNBQ1o7QUFBQSxZQUNEO0FBQUEsVUFDRDtBQUFBLFFBQ0Q7QUFBQSxRQUNBLFVBQVU7QUFBQSxNQUNYLENBQUM7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDUCxNQUFNO0FBQUE7QUFBQSxNQUNOLGNBQWM7QUFBQSxJQUNmO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUixPQUFPO0FBQUEsUUFDTixLQUFLLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsTUFDbkM7QUFBQSxJQUNEO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDYixTQUFTO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNEO0FBQUEsTUFDQSxTQUFTLFNBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxXQUFXO0FBQUEsSUFDbkQ7QUFBQSxFQUNEO0FBQ0EsU0FBTztBQUNSLENBQUM7QUFFRCxlQUFlLHFCQUFxQixPQUFPO0FBQzFDLE1BQUksT0FBTztBQUNWLFFBQUk7QUFDSCxZQUFNQSxVQUFTLE1BQU0sT0FBTyxtQkFBbUI7QUFDL0MsYUFBT0EsUUFBTztBQUFBLElBQ2YsU0FBUyxPQUFPO0FBQ2YsY0FBUTtBQUFBLFFBQ1A7QUFBQSxRQUNBLE1BQU07QUFBQSxNQUNQO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFFQSxRQUFNLFNBQVMsTUFBTSxPQUFPLGlIQUFnQjtBQUM1QyxTQUFPLE9BQU87QUFDZjsiLAogICJuYW1lcyI6IFsibW9kdWxlIl0KfQo=
