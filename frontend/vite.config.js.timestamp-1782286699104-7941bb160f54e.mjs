// vite.config.js
import { defineConfig } from "file:///C:/Users/vg934/OneDrive/Desktop/lms-clean%20(1)/lms-clean/frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/vg934/OneDrive/Desktop/lms-clean%20(1)/lms-clean/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";
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
  const localPluginPath = path.resolve(__vite_injected_original_dirname, "../frappe-ui/vite/index.js");
  if (isDev) {
    if (fs.existsSync(localPluginPath)) {
      const module2 = await import(pathToFileURL(localPluginPath).href);
      return module2.default;
    }
    console.warn("Local frappe-ui not found, falling back to npm package");
  }
  const packagePlugin = "frappe-ui/vite";
  const module = await import(packagePlugin);
  return module.default;
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx2ZzkzNFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGxtcy1jbGVhbiAoMSlcXFxcbG1zLWNsZWFuXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx2ZzkzNFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGxtcy1jbGVhbiAoMSlcXFxcbG1zLWNsZWFuXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy92ZzkzNC9PbmVEcml2ZS9EZXNrdG9wL2xtcy1jbGVhbiUyMCgxKS9sbXMtY2xlYW4vZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHsgcGF0aFRvRmlsZVVSTCB9IGZyb20gJ3VybCdcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhhc3luYyAoeyBtb2RlIH0pID0+IHtcblx0Y29uc3QgaXNEZXYgPSBtb2RlID09PSAnZGV2ZWxvcG1lbnQnXG5cdGNvbnN0IGZyYXBwZXVpID0gYXdhaXQgaW1wb3J0RnJhcHBlVUlQbHVnaW4oaXNEZXYpXG5cblx0Y29uc3QgY29uZmlnID0ge1xuXHRcdGRlZmluZToge1xuXHRcdFx0X19WVUVfUFJPRF9IWURSQVRJT05fTUlTTUFUQ0hfREVUQUlMU19fOiAnZmFsc2UnLFxuXHRcdH0sXG5cdFx0cGx1Z2luczogW1xuXHRcdFx0ZnJhcHBldWkoe1xuXHRcdFx0XHRmcmFwcGVQcm94eTogdHJ1ZSxcblx0XHRcdFx0bHVjaWRlSWNvbnM6IHRydWUsXG5cdFx0XHRcdGppbmphQm9vdERhdGE6IHRydWUsXG5cdFx0XHRcdGJ1aWxkQ29uZmlnOiB7XG5cdFx0XHRcdFx0aW5kZXhIdG1sUGF0aDogJy4uL2xtcy93d3cvX2xtcy5odG1sJyxcblx0XHRcdFx0fSxcblx0XHRcdH0pLFxuXHRcdFx0dnVlKCksXG5cdFx0XHRWaXRlUFdBKHtcblx0XHRcdFx0cmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG5cdFx0XHRcdGRldk9wdGlvbnM6IHtcblx0XHRcdFx0XHRlbmFibGVkOiBmYWxzZSxcblx0XHRcdFx0fSxcblx0XHRcdFx0d29ya2JveDoge1xuXHRcdFx0XHRcdGNsZWFudXBPdXRkYXRlZENhY2hlczogdHJ1ZSxcblx0XHRcdFx0XHRtYXhpbXVtRmlsZVNpemVUb0NhY2hlSW5CeXRlczogNSAqIDEwMjQgKiAxMDI0LFxuXHRcdFx0XHRcdGdsb2JEaXJlY3Rvcnk6ICcvYXNzZXRzL2xtcy9mcm9udGVuZCcsXG5cdFx0XHRcdFx0Z2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLHRzLGNzcyxodG1sLHN2Z30nXSxcblx0XHRcdFx0XHRydW50aW1lQ2FjaGluZzogW1xuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR1cmxQYXR0ZXJuOiAoeyByZXF1ZXN0IH0pID0+XG5cdFx0XHRcdFx0XHRcdFx0cmVxdWVzdC5kZXN0aW5hdGlvbiA9PT0gJ2RvY3VtZW50Jyxcblx0XHRcdFx0XHRcdFx0aGFuZGxlcjogJ05ldHdvcmtGaXJzdCcsXG5cdFx0XHRcdFx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0XHRcdFx0XHRjYWNoZU5hbWU6ICdodG1sLWNhY2hlJyxcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0fSxcblx0XHRcdFx0bWFuaWZlc3Q6IGZhbHNlLFxuXHRcdFx0fSksXG5cdFx0XSxcblx0XHRzZXJ2ZXI6IHtcblx0XHRcdGhvc3Q6ICcwLjAuMC4wJywgLy8gQWNjZXB0IGNvbm5lY3Rpb25zIGZyb20gYW55IG5ldHdvcmsgaW50ZXJmYWNlXG5cdFx0XHRhbGxvd2VkSG9zdHM6IHRydWUsXG5cdFx0fSxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRhbGlhczoge1xuXHRcdFx0XHQnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcblx0XHRcdH0sXG5cdFx0fSxcblx0XHRvcHRpbWl6ZURlcHM6IHtcblx0XHRcdGluY2x1ZGU6IFtcblx0XHRcdFx0J2ZlYXRoZXItaWNvbnMnLFxuXHRcdFx0XHQndGFpbHdpbmQuY29uZmlnLmpzJyxcblx0XHRcdFx0J2ludGVyYWN0anMnLFxuXHRcdFx0XHQnaGlnaGxpZ2h0LmpzJyxcblx0XHRcdFx0J3BseXInLFxuXHRcdFx0XSxcblx0XHRcdGV4Y2x1ZGU6IG1vZGUgPT09ICdwcm9kdWN0aW9uJyA/IFtdIDogWydmcmFwcGUtdWknXSxcblx0XHR9LFxuXHR9XG5cdHJldHVybiBjb25maWdcbn0pXG5cbmFzeW5jIGZ1bmN0aW9uIGltcG9ydEZyYXBwZVVJUGx1Z2luKGlzRGV2KSB7XG5cdGNvbnN0IGxvY2FsUGx1Z2luUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9mcmFwcGUtdWkvdml0ZS9pbmRleC5qcycpXG5cdGlmIChpc0Rldikge1xuXHRcdGlmIChmcy5leGlzdHNTeW5jKGxvY2FsUGx1Z2luUGF0aCkpIHtcblx0XHRcdGNvbnN0IG1vZHVsZSA9IGF3YWl0IGltcG9ydChwYXRoVG9GaWxlVVJMKGxvY2FsUGx1Z2luUGF0aCkuaHJlZilcblx0XHRcdHJldHVybiBtb2R1bGUuZGVmYXVsdFxuXHRcdH1cblx0XHRjb25zb2xlLndhcm4oJ0xvY2FsIGZyYXBwZS11aSBub3QgZm91bmQsIGZhbGxpbmcgYmFjayB0byBucG0gcGFja2FnZScpXG5cdH1cblx0Ly8gRmFsbCBiYWNrIHRvIG5wbSBwYWNrYWdlIGlmIGxvY2FsIGltcG9ydCBmYWlsc1xuXHRjb25zdCBwYWNrYWdlUGx1Z2luID0gJ2ZyYXBwZS11aS92aXRlJ1xuXHRjb25zdCBtb2R1bGUgPSBhd2FpdCBpbXBvcnQocGFja2FnZVBsdWdpbilcblx0cmV0dXJuIG1vZHVsZS5kZWZhdWx0XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9ZLFNBQVMsb0JBQW9CO0FBQ2phLE9BQU8sU0FBUztBQUNoQixPQUFPLFVBQVU7QUFDakIsT0FBTyxRQUFRO0FBQ2YsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxlQUFlO0FBTHhCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYSxPQUFPLEVBQUUsS0FBSyxNQUFNO0FBQy9DLFFBQU0sUUFBUSxTQUFTO0FBQ3ZCLFFBQU0sV0FBVyxNQUFNLHFCQUFxQixLQUFLO0FBRWpELFFBQU0sU0FBUztBQUFBLElBQ2QsUUFBUTtBQUFBLE1BQ1AseUNBQXlDO0FBQUEsSUFDMUM7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNSLFNBQVM7QUFBQSxRQUNSLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGVBQWU7QUFBQSxRQUNmLGFBQWE7QUFBQSxVQUNaLGVBQWU7QUFBQSxRQUNoQjtBQUFBLE1BQ0QsQ0FBQztBQUFBLE1BQ0QsSUFBSTtBQUFBLE1BQ0osUUFBUTtBQUFBLFFBQ1AsY0FBYztBQUFBLFFBQ2QsWUFBWTtBQUFBLFVBQ1gsU0FBUztBQUFBLFFBQ1Y7QUFBQSxRQUNBLFNBQVM7QUFBQSxVQUNSLHVCQUF1QjtBQUFBLFVBQ3ZCLCtCQUErQixJQUFJLE9BQU87QUFBQSxVQUMxQyxlQUFlO0FBQUEsVUFDZixjQUFjLENBQUMsMkJBQTJCO0FBQUEsVUFDMUMsZ0JBQWdCO0FBQUEsWUFDZjtBQUFBLGNBQ0MsWUFBWSxDQUFDLEVBQUUsUUFBUSxNQUN0QixRQUFRLGdCQUFnQjtBQUFBLGNBQ3pCLFNBQVM7QUFBQSxjQUNULFNBQVM7QUFBQSxnQkFDUixXQUFXO0FBQUEsY0FDWjtBQUFBLFlBQ0Q7QUFBQSxVQUNEO0FBQUEsUUFDRDtBQUFBLFFBQ0EsVUFBVTtBQUFBLE1BQ1gsQ0FBQztBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNQLE1BQU07QUFBQTtBQUFBLE1BQ04sY0FBYztBQUFBLElBQ2Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNSLE9BQU87QUFBQSxRQUNOLEtBQUssS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxNQUNuQztBQUFBLElBQ0Q7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNiLFNBQVM7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Q7QUFBQSxNQUNBLFNBQVMsU0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVc7QUFBQSxJQUNuRDtBQUFBLEVBQ0Q7QUFDQSxTQUFPO0FBQ1IsQ0FBQztBQUVELGVBQWUscUJBQXFCLE9BQU87QUFDMUMsUUFBTSxrQkFBa0IsS0FBSyxRQUFRLGtDQUFXLDRCQUE0QjtBQUM1RSxNQUFJLE9BQU87QUFDVixRQUFJLEdBQUcsV0FBVyxlQUFlLEdBQUc7QUFDbkMsWUFBTUEsVUFBUyxNQUFNLE9BQU8sY0FBYyxlQUFlLEVBQUU7QUFDM0QsYUFBT0EsUUFBTztBQUFBLElBQ2Y7QUFDQSxZQUFRLEtBQUssd0RBQXdEO0FBQUEsRUFDdEU7QUFFQSxRQUFNLGdCQUFnQjtBQUN0QixRQUFNLFNBQVMsTUFBTSxPQUFPO0FBQzVCLFNBQU8sT0FBTztBQUNmOyIsCiAgIm5hbWVzIjogWyJtb2R1bGUiXQp9Cg==
