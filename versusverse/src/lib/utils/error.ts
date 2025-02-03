// src/lib/utils/error.ts
export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public status: number = 500,
        public details?: unknown
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export const errorCodes = {
    INVALID_INPUT: 'INVALID_INPUT',
    API_ERROR: 'API_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    NOT_FOUND: 'NOT_FOUND',
} as const;