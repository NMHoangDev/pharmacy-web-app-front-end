import { useCallback, useEffect, useState } from "react";
import { listActiveBranches } from "../api/branchApi";

const normalizeBranches = (branches) =>
  (branches || [])
    .filter(Boolean)
    .map((b) => ({
      id: b.id,
      code: b.code ?? "",
      name: b.name ?? "",
      status: b.status ?? "",
      addressLine: b.addressLine ?? "",
      ward: b.ward ?? "",
      district: b.district ?? "",
      city: b.city ?? "",
      province: b.province ?? "",
      country: b.country ?? "",
      phone: b.phone ?? "",
      timezone: b.timezone ?? "",
    }))
    .filter((b) => !!b.id);

export const useBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const list = await listActiveBranches({ signal });
      setBranches(normalizeBranches(list));
    } catch (err) {
      if (err?.name !== "AbortError") {
        setError(err?.message || "Không thể tải danh sách chi nhánh");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    reload(controller.signal);
    return () => controller.abort();
  }, [reload]);

  return { branches, loading, error, reload };
};

export default useBranches;
