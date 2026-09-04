import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
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
