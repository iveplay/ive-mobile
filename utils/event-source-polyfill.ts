/**
 * Minimal EventSource shim for React Native.
 *
 * ive-connect's HandyDevice.connect() creates an EventSource for SSE.
 * React Native doesn't have EventSource built-in. This shim prevents
 * the ReferenceError so connect() proceeds to the REST-based flow.
 * SSE events (device_status, etc.) won't fire — but the core
 * connect/play/stop/sync operations are all REST and work fine.
 */
if (typeof globalThis.EventSource === 'undefined') {
  // @ts-expect-error minimal shim, not full spec
  globalThis.EventSource = class EventSource {
    static readonly CONNECTING = 0
    static readonly OPEN = 1
    static readonly CLOSED = 2

    readyState = 2 // CLOSED
    url: string

    onerror: ((event: unknown) => void) | null = null
    onmessage: ((event: unknown) => void) | null = null
    onopen: ((event: unknown) => void) | null = null

    constructor(url: string) {
      this.url = url
    }

    addEventListener() {}
    removeEventListener() {}
    close() {}
  }
}
