// src/lib/config/env.ts
export const env = {
    OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY as string,
    NODE_ENV: import.meta.env.MODE as string,
    IS_DEV: import.meta.env.DEV as boolean,
} as const;