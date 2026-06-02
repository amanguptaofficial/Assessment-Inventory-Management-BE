import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage } from "../api/client";

/**
 * Generic data-fetching hook with loading / error / refetch handling.
 * `fetcher` must be a stable (useCallback'd) function returning a promise.
 */
export default function useFetch(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetcher()
      .then((result) => setData(result))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [fetcher]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch, setData };
}
