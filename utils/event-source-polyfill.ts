/**
 * Minimal browser API shims for React Native.
 *
 * Event / EventTarget — Required by eventsource v4 (used by @xsense/autoblow-sdk).
 * React Native doesn't provide these browser globals.
 *
 * EventSource — ive-connect's HandyDevice.connect() creates an EventSource for SSE.
 * React Native doesn't have EventSource built-in. This shim prevents
 * the ReferenceError so connect() proceeds to the REST-based flow.
 * SSE events (device_status, etc.) won't fire — but the core
 * connect/play/stop/sync operations are all REST and work fine.
 */

if (typeof globalThis.Event === 'undefined') {
  // @ts-expect-error minimal shim, not full spec
  globalThis.Event = class Event {
    type: string
    bubbles: boolean
    cancelable: boolean
    composed: boolean

    constructor(
      type: string,
      options?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean },
    ) {
      this.type = type
      this.bubbles = options?.bubbles ?? false
      this.cancelable = options?.cancelable ?? false
      this.composed = options?.composed ?? false
    }
  }
}

if (typeof globalThis.EventTarget === 'undefined') {
  globalThis.EventTarget = class EventTarget {
    private _listeners: Record<string, ((...args: unknown[]) => void)[]> = {}

    addEventListener(type: string, listener: (...args: unknown[]) => void) {
      if (!this._listeners[type]) this._listeners[type] = []
      this._listeners[type].push(listener)
    }

    removeEventListener(type: string, listener: (...args: unknown[]) => void) {
      if (!this._listeners[type]) return
      this._listeners[type] = this._listeners[type].filter(
        (l) => l !== listener,
      )
    }

    dispatchEvent(event: { type: string }): boolean {
      const listeners = this._listeners[event.type]
      if (listeners) listeners.forEach((l) => l(event))
      return true
    }
  }
}

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
