import { useCallback, useEffect, useMemo, useState } from "react";
import { isUuid } from "../api/client";

const readUrlParam = (paramName) => {
  try {
    return new URLSearchParams(window.location.search).get(paramName) || "";
  } catch {
    return "";
  }
};

const writeUrlParam = (paramName, value) => {
  try {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(paramName, value);
    else url.searchParams.delete(paramName);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  } catch {
    console.log("CÓ LỖI tại hàm writeUrlParam trong useAdminBranchSelection");
  }
};

export const useAdminBranchSelection = (options = {}) => {
  const {
    storageKey = "admin.branchId",
    urlParam = "branchId",
    persistToUrl = true,
  } = options;

  const initial = useMemo(() => {
    const fromUrl = readUrlParam(urlParam);
    if (isUuid(fromUrl)) return fromUrl;

    try {
      const fromStorage = window.localStorage.getItem(storageKey) || "";
      if (isUuid(fromStorage)) return fromStorage;
    } catch {
      console.log("CÓ LỖI tại hàm useAdminBranchSelection ");
    }

    return "";
  }, [storageKey, urlParam]);

  const [branchId, setBranchIdRaw] = useState(initial);

  const setBranchId = useCallback((nextValue) => {
    const value = typeof nextValue === "string" ? nextValue : "";
    setBranchIdRaw(isUuid(value) ? value : "");
  }, []);

  useEffect(() => {
    try {
      if (branchId) window.localStorage.setItem(storageKey, branchId);
      else window.localStorage.removeItem(storageKey);
    } catch {
      console.log("CÓ LỖI tại hàm useAdminBranchSelection ");
    }

    if (persistToUrl) writeUrlParam(urlParam, branchId);
  }, [branchId, persistToUrl, storageKey, urlParam]);

  return { branchId, setBranchId };
};

export default useAdminBranchSelection;
