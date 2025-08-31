import { useEffect, useRef, useState } from 'react';

export default function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    Promise.resolve()
      .then(() => asyncFn(controller.signal))
      .then((d) => { if (!controller.signal.aborted) setData(d); })
      .catch((e) => { if (!controller.signal.aborted) setError(e); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, abort: () => abortRef.current?.abort() };
}

