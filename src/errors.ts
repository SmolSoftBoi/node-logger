export function getError(error: unknown): string {
    return String(error);
}

export function getErrorName(error: unknown): string {
    return error instanceof Error ? error.name : String(error);
}

export function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export function getErrorStack(error: unknown): string {
    return error instanceof Error ? error.stack || error.message : String(error);
}