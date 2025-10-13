export class APIError extends Error {
    constructor(statusCode = 400, errors = []) {
        super();
        this.statusCode = statusCode;
        this.errors = errors;
    }
    toJson() {
        return {
            statusCode: this.statusCode,
            errors: this.errors,
        }
    }
}
