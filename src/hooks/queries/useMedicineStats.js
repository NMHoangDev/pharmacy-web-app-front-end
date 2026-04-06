import { useQuery } from "@tanstack/react-query";
import adminMedicineApi from "../../api/adminMedicineApi";
import { queryKeys } from "./queryKeys";

export const useMedicineStats = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.medicineStats(params),
    queryFn: () => adminMedicineApi.getMedicineStats(params),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default useMedicineStats;
