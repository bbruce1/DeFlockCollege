import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
    // Bound to IPv4 explicitly. Vite otherwise advertises itself as
    // http://[::1]:5173 while the application is served from 127.0.0.1, and a
    // browser that does not treat those as the same origin quietly fails to
    // load any asset.
    server: {
        host: "127.0.0.1",
        strictPort: true,
    },
    // Matches the "@/*" path in tsconfig, so imports resolve the same way in the
    // type checker and the bundler.
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./resources/js", import.meta.url)),
        },
    },
    plugins: [
        laravel({
            input: "resources/js/app.tsx",
            refresh: true,
        }),
        react(),
        // Tailwind 4 runs through Vite directly; there is no PostCSS step.
        tailwindcss(),
    ],
});
