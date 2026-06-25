// vite.config.js
import { defineConfig } from "file:///C:/Users/vg934/OneDrive/Desktop/lms-clean%20(1)/lms-clean/frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/vg934/OneDrive/Desktop/lms-clean%20(1)/lms-clean/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";
import { createRequire } from "module";
var __vite_injected_original_dirname = "C:\\Users\\vg934\\OneDrive\\Desktop\\lms-clean (1)\\lms-clean\\frontend";
var __vite_injected_original_import_meta_url = "file:///C:/Users/vg934/OneDrive/Desktop/lms-clean%20(1)/lms-clean/frontend/vite.config.js";
var require2 = createRequire(__vite_injected_original_import_meta_url);
var vite_config_default = defineConfig(async ({ mode }) => {
  const isDev = mode === "development";
  const frappeui = await importFrappeUIPlugin(isDev);
  const pwaPlugin = await importPWAPlugin(isDev);
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
      pwaPlugin?.({
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
  config.plugins = config.plugins.filter(Boolean);
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
  const module = await import("file:///C:/Users/vg934/OneDrive/Desktop/lms-clean%20(1)/lms-clean/frontend/node_modules/frappe-ui/vite/index.js");
  return module.default;
}
async function importPWAPlugin(isDev) {
  if (isDev)
    return null;
  return require2("vite-plugin-pwa").VitePWA;
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx2ZzkzNFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGxtcy1jbGVhbiAoMSlcXFxcbG1zLWNsZWFuXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx2ZzkzNFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGxtcy1jbGVhbiAoMSlcXFxcbG1zLWNsZWFuXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy92ZzkzNC9PbmVEcml2ZS9EZXNrdG9wL2xtcy1jbGVhbiUyMCgxKS9sbXMtY2xlYW4vZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHsgcGF0aFRvRmlsZVVSTCB9IGZyb20gJ3VybCdcbmltcG9ydCB7IGNyZWF0ZVJlcXVpcmUgfSBmcm9tICdtb2R1bGUnXG5cbmNvbnN0IHJlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKGltcG9ydC5tZXRhLnVybClcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICh7IG1vZGUgfSkgPT4ge1xuXHRjb25zdCBpc0RldiA9IG1vZGUgPT09ICdkZXZlbG9wbWVudCdcblx0Y29uc3QgZnJhcHBldWkgPSBhd2FpdCBpbXBvcnRGcmFwcGVVSVBsdWdpbihpc0Rldilcblx0Y29uc3QgcHdhUGx1Z2luID0gYXdhaXQgaW1wb3J0UFdBUGx1Z2luKGlzRGV2KVxuXG5cdGNvbnN0IGNvbmZpZyA9IHtcblx0XHRkZWZpbmU6IHtcblx0XHRcdF9fVlVFX1BST0RfSFlEUkFUSU9OX01JU01BVENIX0RFVEFJTFNfXzogJ2ZhbHNlJyxcblx0XHR9LFxuXHRcdHBsdWdpbnM6IFtcblx0XHRcdGZyYXBwZXVpKHtcblx0XHRcdFx0ZnJhcHBlUHJveHk6IHRydWUsXG5cdFx0XHRcdGx1Y2lkZUljb25zOiB0cnVlLFxuXHRcdFx0XHRqaW5qYUJvb3REYXRhOiB0cnVlLFxuXHRcdFx0XHRidWlsZENvbmZpZzoge1xuXHRcdFx0XHRcdGluZGV4SHRtbFBhdGg6ICcuLi9sbXMvd3d3L19sbXMuaHRtbCcsXG5cdFx0XHRcdH0sXG5cdFx0XHR9KSxcblx0XHRcdHZ1ZSgpLFxuXHRcdFx0cHdhUGx1Z2luPy4oe1xuXHRcdFx0XHRyZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcblx0XHRcdFx0ZGV2T3B0aW9uczoge1xuXHRcdFx0XHRcdGVuYWJsZWQ6IGZhbHNlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR3b3JrYm94OiB7XG5cdFx0XHRcdFx0Y2xlYW51cE91dGRhdGVkQ2FjaGVzOiB0cnVlLFxuXHRcdFx0XHRcdG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiA1ICogMTAyNCAqIDEwMjQsXG5cdFx0XHRcdFx0Z2xvYkRpcmVjdG9yeTogJy9hc3NldHMvbG1zL2Zyb250ZW5kJyxcblx0XHRcdFx0XHRnbG9iUGF0dGVybnM6IFsnKiovKi57anMsdHMsY3NzLGh0bWwsc3ZnfSddLFxuXHRcdFx0XHRcdHJ1bnRpbWVDYWNoaW5nOiBbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHVybFBhdHRlcm46ICh7IHJlcXVlc3QgfSkgPT5cblx0XHRcdFx0XHRcdFx0XHRyZXF1ZXN0LmRlc3RpbmF0aW9uID09PSAnZG9jdW1lbnQnLFxuXHRcdFx0XHRcdFx0XHRoYW5kbGVyOiAnTmV0d29ya0ZpcnN0Jyxcblx0XHRcdFx0XHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHRcdFx0XHRcdGNhY2hlTmFtZTogJ2h0bWwtY2FjaGUnLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRdLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtYW5pZmVzdDogZmFsc2UsXG5cdFx0XHR9KSxcblx0XHRdLFxuXHRcdHNlcnZlcjoge1xuXHRcdFx0aG9zdDogJzAuMC4wLjAnLCAvLyBBY2NlcHQgY29ubmVjdGlvbnMgZnJvbSBhbnkgbmV0d29yayBpbnRlcmZhY2Vcblx0XHRcdGFsbG93ZWRIb3N0czogdHJ1ZSxcblx0XHR9LFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGFsaWFzOiB7XG5cdFx0XHRcdCdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxuXHRcdFx0fSxcblx0XHR9LFxuXHRcdG9wdGltaXplRGVwczoge1xuXHRcdFx0aW5jbHVkZTogW1xuXHRcdFx0XHQnZmVhdGhlci1pY29ucycsXG5cdFx0XHRcdCd0YWlsd2luZC5jb25maWcuanMnLFxuXHRcdFx0XHQnaW50ZXJhY3RqcycsXG5cdFx0XHRcdCdoaWdobGlnaHQuanMnLFxuXHRcdFx0XHQncGx5cicsXG5cdFx0XHRdLFxuXHRcdFx0ZXhjbHVkZTogbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nID8gW10gOiBbJ2ZyYXBwZS11aSddLFxuXHRcdH0sXG5cdH1cblx0Y29uZmlnLnBsdWdpbnMgPSBjb25maWcucGx1Z2lucy5maWx0ZXIoQm9vbGVhbilcblx0cmV0dXJuIGNvbmZpZ1xufSlcblxuYXN5bmMgZnVuY3Rpb24gaW1wb3J0RnJhcHBlVUlQbHVnaW4oaXNEZXYpIHtcblx0Y29uc3QgbG9jYWxQbHVnaW5QYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2ZyYXBwZS11aS92aXRlL2luZGV4LmpzJylcblx0aWYgKGlzRGV2KSB7XG5cdFx0aWYgKGZzLmV4aXN0c1N5bmMobG9jYWxQbHVnaW5QYXRoKSkge1xuXHRcdFx0Y29uc3QgbW9kdWxlID0gYXdhaXQgaW1wb3J0KHBhdGhUb0ZpbGVVUkwobG9jYWxQbHVnaW5QYXRoKS5ocmVmKVxuXHRcdFx0cmV0dXJuIG1vZHVsZS5kZWZhdWx0XG5cdFx0fVxuXHRcdGNvbnNvbGUud2FybignTG9jYWwgZnJhcHBlLXVpIG5vdCBmb3VuZCwgZmFsbGluZyBiYWNrIHRvIG5wbSBwYWNrYWdlJylcblx0fVxuXHQvLyBGYWxsIGJhY2sgdG8gbnBtIHBhY2thZ2UgaWYgbG9jYWwgaW1wb3J0IGZhaWxzXG5cdGNvbnN0IG1vZHVsZSA9IGF3YWl0IGltcG9ydCgnZnJhcHBlLXVpL3ZpdGUnKVxuXHRyZXR1cm4gbW9kdWxlLmRlZmF1bHRcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW1wb3J0UFdBUGx1Z2luKGlzRGV2KSB7XG5cdGlmIChpc0RldikgcmV0dXJuIG51bGxcblx0cmV0dXJuIHJlcXVpcmUoJ3ZpdGUtcGx1Z2luLXB3YScpLlZpdGVQV0Fcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1ksU0FBUyxvQkFBb0I7QUFDamEsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixPQUFPLFFBQVE7QUFDZixTQUFTLHFCQUFxQjtBQUM5QixTQUFTLHFCQUFxQjtBQUw5QixJQUFNLG1DQUFtQztBQUE4TSxJQUFNLDJDQUEyQztBQU94UyxJQUFNQSxXQUFVLGNBQWMsd0NBQWU7QUFFN0MsSUFBTyxzQkFBUSxhQUFhLE9BQU8sRUFBRSxLQUFLLE1BQU07QUFDL0MsUUFBTSxRQUFRLFNBQVM7QUFDdkIsUUFBTSxXQUFXLE1BQU0scUJBQXFCLEtBQUs7QUFDakQsUUFBTSxZQUFZLE1BQU0sZ0JBQWdCLEtBQUs7QUFFN0MsUUFBTSxTQUFTO0FBQUEsSUFDZCxRQUFRO0FBQUEsTUFDUCx5Q0FBeUM7QUFBQSxJQUMxQztBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1IsU0FBUztBQUFBLFFBQ1IsYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2IsZUFBZTtBQUFBLFFBQ2YsYUFBYTtBQUFBLFVBQ1osZUFBZTtBQUFBLFFBQ2hCO0FBQUEsTUFDRCxDQUFDO0FBQUEsTUFDRCxJQUFJO0FBQUEsTUFDSixZQUFZO0FBQUEsUUFDWCxjQUFjO0FBQUEsUUFDZCxZQUFZO0FBQUEsVUFDWCxTQUFTO0FBQUEsUUFDVjtBQUFBLFFBQ0EsU0FBUztBQUFBLFVBQ1IsdUJBQXVCO0FBQUEsVUFDdkIsK0JBQStCLElBQUksT0FBTztBQUFBLFVBQzFDLGVBQWU7QUFBQSxVQUNmLGNBQWMsQ0FBQywyQkFBMkI7QUFBQSxVQUMxQyxnQkFBZ0I7QUFBQSxZQUNmO0FBQUEsY0FDQyxZQUFZLENBQUMsRUFBRSxRQUFRLE1BQ3RCLFFBQVEsZ0JBQWdCO0FBQUEsY0FDekIsU0FBUztBQUFBLGNBQ1QsU0FBUztBQUFBLGdCQUNSLFdBQVc7QUFBQSxjQUNaO0FBQUEsWUFDRDtBQUFBLFVBQ0Q7QUFBQSxRQUNEO0FBQUEsUUFDQSxVQUFVO0FBQUEsTUFDWCxDQUFDO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ1AsTUFBTTtBQUFBO0FBQUEsTUFDTixjQUFjO0FBQUEsSUFDZjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1IsT0FBTztBQUFBLFFBQ04sS0FBSyxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLE1BQ25DO0FBQUEsSUFDRDtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ2IsU0FBUztBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRDtBQUFBLE1BQ0EsU0FBUyxTQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVztBQUFBLElBQ25EO0FBQUEsRUFDRDtBQUNBLFNBQU8sVUFBVSxPQUFPLFFBQVEsT0FBTyxPQUFPO0FBQzlDLFNBQU87QUFDUixDQUFDO0FBRUQsZUFBZSxxQkFBcUIsT0FBTztBQUMxQyxRQUFNLGtCQUFrQixLQUFLLFFBQVEsa0NBQVcsNEJBQTRCO0FBQzVFLE1BQUksT0FBTztBQUNWLFFBQUksR0FBRyxXQUFXLGVBQWUsR0FBRztBQUNuQyxZQUFNQyxVQUFTLE1BQU0sT0FBTyxjQUFjLGVBQWUsRUFBRTtBQUMzRCxhQUFPQSxRQUFPO0FBQUEsSUFDZjtBQUNBLFlBQVEsS0FBSyx3REFBd0Q7QUFBQSxFQUN0RTtBQUVBLFFBQU0sU0FBUyxNQUFNLE9BQU8saUhBQWdCO0FBQzVDLFNBQU8sT0FBTztBQUNmO0FBRUEsZUFBZSxnQkFBZ0IsT0FBTztBQUNyQyxNQUFJO0FBQU8sV0FBTztBQUNsQixTQUFPRCxTQUFRLGlCQUFpQixFQUFFO0FBQ25DOyIsCiAgIm5hbWVzIjogWyJyZXF1aXJlIiwgIm1vZHVsZSJdCn0K
