interface DeferredPromise extends Promise<void> {
  resolve: Function;
  reject: Function;
}

/**
 * Create a deferred promise with `resolve` and `reject` methods.
 */
export default function defer() {
  let _resolve: Function;
  let _reject: Function;

  const promise = new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  }) as DeferredPromise;

  // Prevent unhandled rejection warnings
  promise.catch(() => {});

  promise.resolve = _resolve;
  promise.reject = _reject;

  return promise;
}
