import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { publicApi } from "../api/httpClients";

export const useCampaign = (options = {}) => {
  const refreshIntervalMs = Number(options.refreshIntervalMs ?? 180000);

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      if (!hasLoadedRef.current) setLoading(true);

      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await publicApi.get("/user/discounts/campaigns", {
        signal: controller.signal,
      });

      const list = Array.isArray(res?.data) ? res.data : [];
      setCampaigns(list);
      hasLoadedRef.current = true;
    } catch (e) {
      if (e?.code === "ERR_CANCELED") return;
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    if (Number.isFinite(refreshIntervalMs) && refreshIntervalMs > 0) {
      const id = setInterval(refresh, refreshIntervalMs);
      return () => clearInterval(id);
    }

    return undefined;
  }, [refresh, refreshIntervalMs]);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const activeCampaign = useMemo(() => {
    return campaigns && campaigns.length > 0 ? campaigns[0] : null;
  }, [campaigns]);

  return {
    campaigns,
    activeCampaign,
    loading,
    error,
    refresh,
  };
};
