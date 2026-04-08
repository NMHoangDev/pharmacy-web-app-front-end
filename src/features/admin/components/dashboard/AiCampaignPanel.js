import React from "react";

const EmptyState = ({ message }) => (
  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
    {message}
  </div>
);

const SkeletonCard = () => (
  <div className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-5">
    <div className="h-3 w-24 rounded bg-slate-200" />
    <div className="mt-4 h-7 w-2/3 rounded bg-slate-200" />
    <div className="mt-4 space-y-2">
      <div className="h-3 rounded bg-slate-100" />
      <div className="h-3 rounded bg-slate-100" />
      <div className="h-3 w-5/6 rounded bg-slate-100" />
    </div>
  </div>
);

const AiCampaignPanel = ({
  loading,
  error,
  analysis,
  onRefresh,
}) => {
  const opportunities = Array.isArray(analysis?.opportunities)
    ? analysis.opportunities
    : [];
  const risks = Array.isArray(analysis?.risks) ? analysis.risks : [];
  const proposals = Array.isArray(analysis?.proposals) ? analysis.proposals : [];

  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_70px_-54px_rgba(15,23,42,0.45)]">
      <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_45%),linear-gradient(135deg,#f8fbff_0%,#ffffff_55%,#f8fafc_100%)] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-500">
              AI Campaign Analyst
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Đề xuất chiến dịch bám sát dữ liệu nhà thuốc
            </h3>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              AI đọc doanh thu, tồn kho, nhịp bán và forecast hiện tại để gợi ý
              phương án chiến dịch thực tế cho admin.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
              loading
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                : "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            {loading ? "Đang phân tích..." : "Làm mới đề xuất"}
          </button>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-6">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading && !analysis ? (
          <div className="grid gap-5 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : null}

        {!loading && !analysis ? (
          <EmptyState message="Chưa có đề xuất chiến dịch. Hãy tải dữ liệu dashboard trước để AI phân tích." />
        ) : null}

        {analysis ? (
          <>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="material-symbols-outlined text-sky-500">
                    insights
                  </span>
                  <p className="text-lg font-semibold">
                    {analysis.headline || "AI đang tổng hợp insight"}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {analysis.summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-600">
                    {analysis.llmBacked ? "Sinh bởi Gemini" : "Heuristic fallback"}
                  </span>
                  {analysis.model ? (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-500">
                      {analysis.model}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/70 p-5">
                  <p className="text-sm font-semibold text-emerald-700">
                    Cơ hội nên khai thác
                  </p>
                  <div className="mt-3 space-y-3 text-sm text-emerald-900">
                    {opportunities.length ? (
                      opportunities.map((item, index) => (
                        <div key={`${item}-${index}`} className="flex gap-2">
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                          <span>{item}</span>
                        </div>
                      ))
                    ) : (
                      <p>Chưa có cơ hội nổi bật.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[28px] border border-amber-100 bg-amber-50/70 p-5">
                  <p className="text-sm font-semibold text-amber-700">
                    Rủi ro cần lưu ý
                  </p>
                  <div className="mt-3 space-y-3 text-sm text-amber-900">
                    {risks.length ? (
                      risks.map((item, index) => (
                        <div key={`${item}-${index}`} className="flex gap-2">
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                          <span>{item}</span>
                        </div>
                      ))
                    ) : (
                      <p>Chưa có rủi ro lớn nổi bật.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
              {proposals.map((proposal, index) => (
                <article
                  key={proposal.id || `proposal-${index}`}
                  className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.45)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                        Phương án {index + 1}
                      </p>
                      <h4 className="mt-2 text-xl font-semibold text-slate-900">
                        {proposal.title}
                      </h4>
                    </div>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                      {proposal.timing}
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Mục tiêu
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {proposal.objective}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Lý do chọn
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {proposal.rationale}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Cấu trúc ưu đãi
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {proposal.offerStructure}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Tác động kỳ vọng
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {proposal.expectedImpact}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Sản phẩm đề xuất
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(proposal.recommendedProducts || []).map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Nội dung marketing
                      </p>
                      <div className="mt-3 space-y-3 text-sm text-slate-700">
                        <div>
                          <span className="font-semibold text-slate-900">
                            Banner:
                          </span>{" "}
                          {proposal.marketing?.banner}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">
                            Push:
                          </span>{" "}
                          {proposal.marketing?.pushNotification}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">
                            SMS:
                          </span>{" "}
                          {proposal.marketing?.sms}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900">
                            Social:
                          </span>{" "}
                          {proposal.marketing?.socialPost}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};

export default AiCampaignPanel;
