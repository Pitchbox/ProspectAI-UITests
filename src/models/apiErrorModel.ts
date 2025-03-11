export class ApiError extends Error {
    public statusCode?: number;
    public data?: any;

    constructor(message: string, statusCode?: number, data?: any) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.data = data;
    }
}