import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

// Inertia 3 resolves pages itself, so the laravel-vite-plugin helper that
// Breeze scaffolds for v2 is no longer the right shape.
const pages = import.meta.glob('./Pages/**/*.tsx', { eager: false });

const appName = import.meta.env.VITE_APP_NAME || 'DeFlock Campus';

createInertiaApp({
    // Chapter pages set their own full title; only bare pages get the suffix.
    title: (title) => (title ? title : appName),
    // Inertia 3 wants the component itself, not the module wrapping it.
    resolve: async (name) => {
        const page = pages[`./Pages/${name}.tsx`];
        if (!page) {
            throw new Error(`Inertia page "${name}" was not found in resources/js/Pages.`);
        }
        const module = (await page()) as { default: Parameters<typeof createRoot>[0] extends never ? never : any };
        return module.default;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
