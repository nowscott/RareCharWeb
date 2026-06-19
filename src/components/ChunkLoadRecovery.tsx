'use client';

import { useEffect } from 'react';

const CHUNK_RELOAD_FLAG = 'rarechar_chunk_reload_attempted';

function isChunkLoadFailure(reason: unknown): boolean {
  if (!reason) return false;

  const error = reason as { name?: unknown; message?: unknown };
  const name = typeof error.name === 'string' ? error.name : '';
  const message = typeof error.message === 'string' ? error.message : String(reason);
  const text = `${name} ${message}`;

  return (
    text.includes('ChunkLoadError') ||
    text.includes('Loading chunk') ||
    text.includes('failed to fetch dynamically imported module') ||
    text.includes('Importing a module script failed')
  );
}

function reloadOnceForFreshAssets(): void {
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_FLAG) === '1') return;
    sessionStorage.setItem(CHUNK_RELOAD_FLAG, '1');
  } catch {
    // sessionStorage may be unavailable in private or restricted contexts.
  }

  window.location.reload();
}

export default function ChunkLoadRecovery() {
  useEffect(() => {
    const clearReloadFlag = () => {
      try {
        sessionStorage.removeItem(CHUNK_RELOAD_FLAG);
      } catch {
        // Ignore unavailable sessionStorage.
      }
    };

    const clearFlagTimer = window.setTimeout(clearReloadFlag, 10_000);

    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadFailure(event.error) || isChunkLoadFailure(event.message)) {
        event.preventDefault();
        reloadOnceForFreshAssets();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadFailure(event.reason)) {
        event.preventDefault();
        reloadOnceForFreshAssets();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.clearTimeout(clearFlagTimer);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
