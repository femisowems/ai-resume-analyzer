// Simple toast utility to replace sonner
export const toast = {
    success: (message: string, options?: { id?: string }) => {
        console.log('[SUCCESS]', message)
        // In production, this would show a toast notification
        // For now, we'll just log to console
    },
    error: (message: string, options?: { id?: string }) => {
        console.error('[ERROR]', message)
        alert(`Error: ${message}`)
    },
    loading: (message: string, options?: { id?: string }) => {
        console.log('[LOADING]', message)
    },
    info: (message: string, options?: { id?: string }) => {
        console.log('[INFO]', message)
        alert(message)
    }
}
