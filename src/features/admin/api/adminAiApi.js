import { authApi } from "../../../shared/api/httpClients";

export async function generateCampaignAnalysis(payload) {
  const res = await authApi.post("/api/chat/admin/campaign-analysis", payload);
  return res?.data ?? {};
}

const adminAiApi = { generateCampaignAnalysis };

export default adminAiApi;
