  
export default class ApiError extends Error {
    // The optional API code for sending back to the client (default: 500)
    public code: number;

    // If the error message should be logged and also logged down to disk.
    public log: boolean;

    // If the error stack should also be logged with the error message.
    public logStack: boolean;

    public userMessage: string;

    /**
     * Creates a new instance of the API error object. This is to be thrown when used with asyncErrorHandler.
     *
     * @param error.code The optional API code for sending back to the client (default: 500)
     * @param error.error The optional API error message, interchangeable with error.message (this takes lead).
     * @param error.message The optional API error message, interchangeable with error.error (ignored if error set.)
     * @param error.log If the error message should be logged and also logged down to disk.
     * @param error.logStack If the error stack should also be logged with the error message.
     */
    public constructor(error: { code?: number; error?: string; message?: any; userMessage?: string, log?: boolean; logStack?: boolean }) {
        super(error.error || error.message);
        console.log(error.code)
        this.code = error.code || 500;
        this.message = error.error || error.message || undefined;
        this.userMessage = error.userMessage || ''

        this.logStack = error.logStack || false;
        this.log = error.log || false;
    }

    /**
     * Simple override of string to ensure stack is logged if specified overwise default.
     */
    public toString(): string | undefined {
        return this.logStack || process.env.NODE_ENV === 'development' ? this.stack : super.toString();
    }
}