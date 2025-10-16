export class APIError extends Error {
    constructor(statusCode = 400, errors = []) {
        // Criar uma mensagem para o Error baseada nos erros
        const message = Array.isArray(errors) && errors.length > 0 
            ? errors.map(err => err.message || err).join(', ')
            : 'Erro na API';
        
        super(message);
        this.name = 'APIError';
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
