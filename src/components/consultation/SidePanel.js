import React, { useEffect, useMemo, useState } from "react";
import { searchPosProducts } from "../../api/pharmacistPosApi";

const PAGE_SIZE = 10;

const SAFETY_SECTIONS = [
  {
    title: "Tiền sử & chống chỉ định",
    items: [
      {
        key: "history_anaphylaxis",
        label: "Từng phản vệ hoặc phù mạch do thuốc",
      },
      {
        key: "history_aspirin_nsaid_asthma",
        label: "Hen do aspirin/NSAID (nếu tư vấn giảm đau/kháng viêm)",
      },
      {
        key: "history_drug_allergy",
        label: "Có tiền sử dị ứng thuốc nghiêm trọng",
      },
    ],
  },
  {
    title: "Trùng hoạt chất",
    items: [
      {
        key: "duplicate_screened",
        label: "Đã kiểm tra trùng hoạt chất (vd: paracetamol/kháng histamine)",
      },
    ],
  },
  {
    title: "Red flags cần chuyển khám",
    items: [
      { key: "redflag_dyspnea_chestpain", label: "Khó thở/đau ngực/lơ mơ" },
      { key: "redflag_high_fever", label: "Sốt cao kéo dài" },
      { key: "redflag_vomit_dehydration", label: "Nôn nhiều/mất nước" },
      { key: "redflag_bloody_diarrhea", label: "Tiêu chảy có máu" },
      { key: "redflag_fast_rash", label: "Phát ban lan nhanh" },
    ],
  },
  {
    title: "Yếu tố công việc/thói quen",
    items: [
      {
        key: "risk_drive_machine",
        label: "Có lái xe/vận hành máy (liên quan thuốc gây buồn ngủ)",
      },
      {
        key: "risk_alcohol_regular",
        label: "Uống rượu bia thường xuyên (tăng tương tác/độc tính)",
      },
    ],
  },
];

const RX_KEYWORDS = {
  paracetamol: ["paracetamol", "acetaminophen"],
  antihistamine: [
    "chlorpheniramine",
    "loratadine",
    "cetirizine",
    "fexofenadine",
  ],
  nsaid: [
    "ibuprofen",
    "diclofenac",
    "naproxen",
    "aspirin",
    "ketoprofen",
    "meloxicam",
  ],
  sedating: [
    "chlorpheniramine",
    "diphenhydramine",
    "promethazine",
    "codeine",
    "dextromethorphan",
  ],
};

const createInitialSafetyChecks = () => {
  const checks = {};
  SAFETY_SECTIONS.forEach((section) => {
    section.items.forEach((item) => {
      checks[item.key] = false;
    });
  });
  return checks;
};

const SidePanel = ({
  messages,
  onSendMessage,
  onSaveNotes,
  canWriteNotes = false,
  initialNotes = "",
  onCreatePrescription,
  onSearchPrescriptionProducts,
  onCreatePrescriptionOrder,
}) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [chatInput, setChatInput] = useState("");
  const [noteContent, setNoteContent] = useState(initialNotes || "");
  const [safetyChecks, setSafetyChecks] = useState(createInitialSafetyChecks);

  const [actionMessage, setActionMessage] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [prescription, setPrescription] = useState({
    title: "Đơn thuốc tư vấn trực tuyến",
    diagnosis: "",
    instructions: "",
    extraNote: "",
  });

  const [rxQuery, setRxQuery] = useState("");
  const [rxPage, setRxPage] = useState(0);
  const [rxLoading, setRxLoading] = useState(false);
  const [rxResults, setRxResults] = useState([]);
  const [rxTotalPages, setRxTotalPages] = useState(0);
  const [rxItems, setRxItems] = useState([]);

  useEffect(() => {
    setNoteContent(initialNotes || "");
  }, [initialNotes]);

  useEffect(() => {
    setRxPage(0);
  }, [rxQuery]);

  useEffect(() => {
    let active = true;
    const keyword = rxQuery.trim();

    if (activeTab !== "prescription" || !isComposerOpen || keyword.length < 2) {
      setRxResults([]);
      setRxTotalPages(0);
      setRxLoading(false);
      return () => {
        active = false;
      };
    }

    const timer = setTimeout(async () => {
      setRxLoading(true);
      try {
        const response = await (onSearchPrescriptionProducts
          ? onSearchPrescriptionProducts({
              q: keyword,
              page: rxPage,
              size: PAGE_SIZE,
            })
          : searchPosProducts({
              q: keyword,
              page: rxPage,
              size: PAGE_SIZE,
            }));

        if (!active) return;

        const content = Array.isArray(response?.content)
          ? response.content
          : [];
        setRxResults(content);
        setRxTotalPages(Number(response?.totalPages || 0));
      } catch {
        if (!active) return;
        setRxResults([]);
        setRxTotalPages(0);
      } finally {
        if (active) setRxLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    activeTab,
    isComposerOpen,
    onSearchPrescriptionProducts,
    rxPage,
    rxQuery,
  ]);

  const selectedSafetyLabels = useMemo(() => {
    const labels = [];
    SAFETY_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        if (safetyChecks[item.key]) labels.push(item.label);
      });
    });
    return labels;
  }, [safetyChecks]);

  const redFlagDetected = useMemo(
    () =>
      Object.entries(safetyChecks).some(
        ([key, checked]) => key.startsWith("redflag_") && checked,
      ),
    [safetyChecks],
  );

  const hasPrescriptionContent = useMemo(
    () =>
      Boolean(
        prescription.title ||
        prescription.diagnosis ||
        prescription.instructions ||
        prescription.extraNote ||
        rxItems.length,
      ),
    [prescription, rxItems.length],
  );

  const containsAny = (text, words) => {
    const content = String(text || "").toLowerCase();
    return words.some((word) => content.includes(word));
  };

  const interactionWarnings = useMemo(() => {
    const warnings = [];

    const groups = Object.entries(RX_KEYWORDS)
      .filter(([group]) => group !== "sedating")
      .map(([group, words]) => ({
        group,
        matched: rxItems.filter((item) => containsAny(item.name, words)),
      }));

    groups.forEach(({ group, matched }) => {
      if (matched.length <= 1) return;
      if (group === "paracetamol") {
        warnings.push("Cảnh báo trùng hoạt chất Paracetamol giữa nhiều thuốc.");
      }
      if (group === "antihistamine") {
        warnings.push("Cảnh báo trùng nhóm kháng histamine (dễ gây buồn ngủ).");
      }
      if (group === "nsaid") {
        warnings.push(
          "Cảnh báo phối hợp nhiều NSAID làm tăng nguy cơ tác dụng phụ.",
        );
      }
    });

    if (safetyChecks.history_aspirin_nsaid_asthma) {
      const nsaidInRx = rxItems.some((item) =>
        containsAny(item.name, RX_KEYWORDS.nsaid),
      );
      if (nsaidInRx) {
        warnings.push(
          "Bệnh nhân có tiền sử hen do aspirin/NSAID: cân nhắc tránh NSAID.",
        );
      }
    }

    if (safetyChecks.risk_drive_machine) {
      const sedatingInRx = rxItems.some((item) =>
        containsAny(item.name, RX_KEYWORDS.sedating),
      );
      if (sedatingInRx) {
        warnings.push(
          "Bệnh nhân lái xe/vận hành máy: lưu ý thuốc có nguy cơ gây buồn ngủ.",
        );
      }
    }

    if (safetyChecks.risk_alcohol_regular) {
      warnings.push(
        "Bệnh nhân uống rượu bia thường xuyên: cần tư vấn tương tác thuốc-rượu.",
      );
    }

    if (redFlagDetected) {
      warnings.push("Có red flags: ưu tiên chuyển khám trực tiếp/cấp cứu.");
    }

    return warnings;
  }, [redFlagDetected, rxItems, safetyChecks]);

  const buildPrescriptionPayload = () => {
    const title = prescription.title?.trim() || "Đơn thuốc tư vấn trực tuyến";
    return {
      title,
      diagnosis: prescription.diagnosis?.trim() || "",
      instructions: prescription.instructions?.trim() || "",
      note: prescription.extraNote?.trim() || "",
      items: rxItems.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        batchNo: item.batchNo,
        expiryDate: item.expiryDate,
        unitPrice: Number(item.unitPrice || 0),
        dose: item.dose,
        frequency: item.frequency,
        duration: item.duration,
        quantity: Number(item.quantity || 1),
        instruction: item.instruction,
      })),
      safetyChecks: selectedSafetyLabels,
      warnings: interactionWarnings,
      redFlagDetected,
    };
  };

  const toPrescriptionText = (payload) => {
    const itemLines = payload.items.length
      ? payload.items
          .map(
            (item, index) =>
              `${index + 1}. ${item.name} (${item.sku || "N/A"}) | Liều: ${item.dose || "-"} | Số lượng: ${item.quantity || 1} | Cách dùng: ${item.frequency || "-"} | Thời gian: ${item.duration || "-"} | Dặn dò: ${item.instruction || "-"}`,
          )
          .join("\n")
      : "Chưa có thuốc được thêm.";

    return [
      `Tiêu đề: ${payload.title}`,
      `Chẩn đoán: ${payload.diagnosis || "-"}`,
      "--- Thuốc kê ---",
      itemLines,
      "--- Hướng dẫn ---",
      payload.instructions || "-",
      "--- Kiểm tra an toàn đã tick ---",
      payload.safetyChecks.length ? payload.safetyChecks.join("; ") : "-",
      "--- Cảnh báo ---",
      payload.warnings.length
        ? payload.warnings.join("; ")
        : "Không phát hiện cảnh báo lớn.",
      "--- Ghi chú ---",
      payload.note || "-",
    ].join("\n");
  };

  const updatePrescription = (key, value) => {
    setPrescription((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSafetyCheck = (key) => {
    setSafetyChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateRxItem = (productId, patch) => {
    setRxItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    );
  };

  const removeRxItem = (productId) => {
    setRxItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const addRxItem = (product) => {
    if (!product?.productId) return;
    setRxItems((prev) => {
      const existed = prev.find((item) => item.productId === product.productId);
      if (existed) return prev;
      return [
        ...prev,
        {
          productId: product.productId,
          name: product.name,
          sku: product.sku,
          batchNo: product.lotNo,
          expiryDate: product.expiryDate,
          dose: "",
          frequency: "",
          duration: "",
          quantity: 1,
          instruction: "",
        },
      ];
    });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput("");
  };

  const handleSavePrescriptionRecord = async () => {
    const payload = buildPrescriptionPayload();
    const merged = [
      noteContent,
      "",
      "===== DON THUOC TU VAN =====",
      toPrescriptionText(payload),
    ].join("\n");
    await onSaveNotes(merged);
    setActionMessage("Đã lưu đơn thuốc vào hồ sơ tư vấn.");
  };

  const handleSendPrescription = () => {
    if (!hasPrescriptionContent) return;
    const payload = buildPrescriptionPayload();
    onSendMessage(`Đã gửi ${payload.title} cho bệnh nhân.`, {
      type: "PRESCRIPTION",
      title: payload.title,
      payload,
    });
    if (payload.redFlagDetected) {
      onSendMessage(
        "Cảnh báo: Có dấu hiệu red flags, khuyến nghị bệnh nhân đi khám trực tiếp.",
      );
    }
    setActionMessage("Đã gửi đơn thuốc cho bệnh nhân.");
  };

  const handleDownloadPrescription = () => {
    const payload = buildPrescriptionPayload();
    const content = toPrescriptionText(payload);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${payload.title.replace(/\s+/g, "_") || "don_thuoc"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActionMessage("Đã tải đơn thuốc.");
  };

  const handleDownloadPrescriptionMessage = (note) => {
    if (!note?.payload) return;
    const payload = {
      title: note.title || "Đơn thuốc tư vấn",
      diagnosis: note.payload.diagnosis || "",
      instructions: note.payload.instructions || "",
      note: note.payload.note || "",
      items: Array.isArray(note.payload.items) ? note.payload.items : [],
      safetyChecks: Array.isArray(note.payload.safetyChecks)
        ? note.payload.safetyChecks
        : [],
      warnings: Array.isArray(note.payload.warnings)
        ? note.payload.warnings
        : [],
    };

    const content = toPrescriptionText(payload);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${payload.title.replace(/\s+/g, "_") || "don_thuoc"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreatePrescriptionOrder = async () => {
    if (!hasPrescriptionContent) return;
    const payload = buildPrescriptionPayload();
    try {
      const body = {
        ...payload,
        consultationNote: noteContent,
        summary: toPrescriptionText(payload),
      };

      if (onCreatePrescriptionOrder) {
        const created = await onCreatePrescriptionOrder(body);
        if (created?.orderCode) {
          setActionMessage(`Đã lên đơn thành công: ${created.orderCode}`);
        } else {
          setActionMessage("Đã tạo đơn thuốc trong lúc tư vấn.");
        }
        return;
      }

      onCreatePrescription?.(body);
      setActionMessage("Đã chuyển thông tin đơn sang luồng lên đơn tại quầy.");
    } catch (error) {
      setActionMessage(error?.message || "Không thể lên đơn trong lúc tư vấn.");
    }
  };

  return (
    <aside className="w-[420px] bg-white border-l border-slate-200 flex flex-col shadow-sm h-full">
      <div className="flex border-b border-slate-200 px-1 shrink-0">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "chat"
              ? "text-primary border-primary"
              : "text-slate-500 border-transparent hover:text-slate-700"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
          Tin nhắn
        </button>

        {canWriteNotes && (
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "notes"
                ? "text-primary border-primary"
                : "text-slate-500 border-transparent hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              description
            </span>
            Ghi chú
          </button>
        )}

        {canWriteNotes && (
          <button
            onClick={() => setActiveTab("prescription")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "prescription"
                ? "text-primary border-primary"
                : "text-slate-500 border-transparent hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">pill</span>
            Đơn thuốc
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === "chat" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-4 mb-4">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || `${msg.senderId || "unknown"}-${idx}`}
                  className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-xl max-w-[90%] text-sm border ${
                      msg.isSelf
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    {msg.content}
                    {msg.note?.type === "PRESCRIPTION" && (
                      <div
                        className={`mt-2 rounded-lg p-2 text-xs ${
                          msg.isSelf
                            ? "border border-white/40 bg-white/10"
                            : "border border-primary/30 bg-primary/10"
                        }`}
                      >
                        <p
                          className={`font-bold mb-1 ${
                            msg.isSelf ? "text-white" : "text-primary"
                          }`}
                        >
                          {msg.note?.title || "Đơn thuốc"}
                        </p>
                        {msg.note?.payload?.diagnosis && (
                          <p>Chẩn đoán: {msg.note.payload.diagnosis}</p>
                        )}
                        {Array.isArray(msg.note?.payload?.items) &&
                          msg.note.payload.items.length > 0 && (
                            <p>Số thuốc kê: {msg.note.payload.items.length}</p>
                          )}
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadPrescriptionMessage(msg.note)
                          }
                          className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
                            msg.isSelf
                              ? "border border-white/60 text-white hover:bg-white/15"
                              : "border border-primary/40 text-primary hover:bg-primary/15"
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">
                            download
                          </span>
                          Tải đơn
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>
                      {msg.senderName || msg.senderRole || "Người dùng"}
                    </span>
                    {msg.createdAt && (
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </span>
                </div>
              ))}

              {messages.length === 0 && (
                <div className="text-center text-slate-400 text-sm mt-10 opacity-70">
                  Chưa có tin nhắn nào.
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="mt-auto flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-white border border-slate-300 rounded-full px-4 text-sm text-slate-800 focus:ring-1 focus:ring-primary outline-none"
              />
              <button
                type="submit"
                className="p-2 bg-primary text-white rounded-full hover:bg-primary/90"
              >
                <span className="material-symbols-outlined text-sm filled-icon">
                  send
                </span>
              </button>
            </form>
          </div>
        )}

        {canWriteNotes && activeTab === "notes" && (
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest">
                  Kiểm tra an toàn
                </h3>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                  Bắt buộc
                </span>
              </div>

              <div className="space-y-3">
                {SAFETY_SECTIONS.map((section) => (
                  <div key={section.title} className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-primary/80 font-semibold">
                      {section.title}
                    </p>

                    {section.items.map((item) => (
                      <label
                        key={item.key}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={!!safetyChecks[item.key]}
                          onChange={() => toggleSafetyCheck(item.key)}
                          className="mt-0.5 rounded border-[#326767] bg-transparent text-primary"
                        />
                        <span className="text-sm leading-tight text-slate-700">
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                ))}

                {redFlagDetected && (
                  <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-xs text-red-200">
                    Có red flags. Khuyến nghị chuyển khám trực tiếp/cấp cứu thay
                    vì tự điều trị.
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
                Ghi chú lâm sàng
              </h3>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-4 text-sm text-slate-800 placeholder:text-slate-400 min-h-[150px]"
                placeholder="Nhập quan sát về triệu chứng, liều lượng đề xuất..."
              />
            </section>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() =>
                  onSaveNotes(
                    [
                      noteContent,
                      "",
                      "===== CHECKLIST AN TOAN =====",
                      selectedSafetyLabels.length
                        ? selectedSafetyLabels
                            .map((item) => `- ${item}`)
                            .join("\n")
                        : "- Chưa tick nội dung nào",
                    ].join("\n"),
                  )
                }
                className="flex items-center justify-center gap-1.5 w-full bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                <span className="material-symbols-outlined text-[18px]">
                  save
                </span>
                Lưu hồ sơ tư vấn
              </button>
            </div>
          </div>
        )}

        {canWriteNotes && activeTab === "prescription" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsComposerOpen((prev) => !prev)}
                className="flex items-center justify-center gap-1.5 w-full bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isComposerOpen ? "close" : "edit_note"}
                </span>
                {isComposerOpen ? "Đóng form" : "Lên đơn thuốc"}
              </button>

              <button
                onClick={handleSendPrescription}
                disabled={!hasPrescriptionContent}
                className="flex items-center justify-center gap-1.5 w-full bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  send
                </span>
                Gửi đơn cho bệnh nhân
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleSavePrescriptionRecord}
                  disabled={!hasPrescriptionContent}
                  className="flex-1 flex items-center justify-center gap-1 border border-slate-300 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    save
                  </span>
                  Lưu hồ sơ
                </button>
                <button
                  onClick={handleDownloadPrescription}
                  disabled={!hasPrescriptionContent}
                  className="flex-1 flex items-center justify-center gap-1 border border-slate-300 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    download
                  </span>
                  Tải đơn
                </button>
                <button
                  onClick={handleCreatePrescriptionOrder}
                  disabled={!hasPrescriptionContent}
                  className="flex-1 flex items-center justify-center gap-1 border border-slate-300 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    point_of_sale
                  </span>
                  Tại quầy
                </button>
              </div>
            </div>

            {actionMessage && (
              <div className="rounded-xl border border-primary/40 bg-primary/10 p-2 text-xs text-primary">
                {actionMessage}
              </div>
            )}

            {isComposerOpen && (
              <div className="fixed inset-0 z-[80] bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                      Lên đơn thuốc trong lúc tư vấn
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsComposerOpen(false)}
                      className="h-8 w-8 rounded-full border border-slate-300 text-slate-500 hover:bg-slate-100"
                    >
                      <span className="material-symbols-outlined text-base">
                        close
                      </span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-primary mb-1 font-bold">
                        Tiêu đề đơn
                      </label>
                      <input
                        value={prescription.title}
                        onChange={(e) =>
                          updatePrescription("title", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-primary mb-1 font-bold">
                        Chẩn đoán
                      </label>
                      <textarea
                        rows={2}
                        value={prescription.diagnosis}
                        onChange={(e) =>
                          updatePrescription("diagnosis", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs uppercase tracking-wider text-primary font-bold">
                        Tìm kiếm thuốc theo tên
                      </label>
                      <input
                        value={rxQuery}
                        onChange={(e) => setRxQuery(e.target.value)}
                        placeholder="Nhập tên thuốc..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      />

                      <div className="overflow-hidden rounded-lg border border-slate-300">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-100 text-slate-700">
                            <tr>
                              <th className="px-2 py-2 text-left">Tên thuốc</th>
                              <th className="px-2 py-2 text-center">Thêm</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rxLoading ? (
                              <tr>
                                <td
                                  colSpan={2}
                                  className="px-2 py-3 text-center text-slate-500"
                                >
                                  Đang tải thuốc...
                                </td>
                              </tr>
                            ) : rxResults.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={2}
                                  className="px-2 py-3 text-center text-slate-500"
                                >
                                  Chưa có dữ liệu.
                                </td>
                              </tr>
                            ) : (
                              rxResults.map((product) => (
                                <tr
                                  key={product.productId}
                                  className="border-t border-slate-200 hover:bg-slate-50"
                                >
                                  <td className="px-2 py-2">{product.name}</td>
                                  <td className="px-2 py-2 text-center">
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        addRxItem(product);
                                      }}
                                      className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-primary hover:bg-primary/30"
                                      title="Thêm thuốc"
                                    >
                                      +
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <button
                          type="button"
                          disabled={rxPage <= 0}
                          onClick={() =>
                            setRxPage((prev) => Math.max(prev - 1, 0))
                          }
                          className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40"
                        >
                          Trước
                        </button>
                        <span>
                          Trang{" "}
                          {Math.min(rxPage + 1, Math.max(rxTotalPages, 1))}/
                          {Math.max(rxTotalPages, 1)}
                        </span>
                        <button
                          type="button"
                          disabled={rxPage + 1 >= rxTotalPages}
                          onClick={() => setRxPage((prev) => prev + 1)}
                          className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40"
                        >
                          Sau
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wider text-primary font-bold">
                        Thuốc đã thêm vào đơn
                      </p>
                      {rxItems.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          Chưa thêm thuốc nào.
                        </p>
                      ) : (
                        rxItems.map((item) => (
                          <div
                            key={item.productId}
                            className="rounded-lg border border-slate-300 bg-slate-50 p-2 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-slate-800">
                                {item.name}
                              </p>
                              <button
                                type="button"
                                onClick={() => removeRxItem(item.productId)}
                                className="text-xs text-red-300 hover:text-red-200"
                              >
                                Xóa
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <input
                                value={item.dose}
                                onChange={(e) =>
                                  updateRxItem(item.productId, {
                                    dose: e.target.value,
                                  })
                                }
                                placeholder="Liều"
                                className="rounded border border-slate-300 bg-white px-2 py-1"
                              />
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateRxItem(item.productId, {
                                    quantity: Math.max(
                                      Number(e.target.value || 1),
                                      1,
                                    ),
                                  })
                                }
                                placeholder="Số lượng"
                                className="rounded border border-slate-300 bg-white px-2 py-1"
                              />
                              <input
                                value={item.frequency}
                                onChange={(e) =>
                                  updateRxItem(item.productId, {
                                    frequency: e.target.value,
                                  })
                                }
                                placeholder="Số lần/ngày"
                                className="rounded border border-slate-300 bg-white px-2 py-1"
                              />
                              <input
                                value={item.duration}
                                onChange={(e) =>
                                  updateRxItem(item.productId, {
                                    duration: e.target.value,
                                  })
                                }
                                placeholder="Số ngày"
                                className="rounded border border-slate-300 bg-white px-2 py-1"
                              />
                            </div>

                            <textarea
                              rows={2}
                              value={item.instruction}
                              onChange={(e) =>
                                updateRxItem(item.productId, {
                                  instruction: e.target.value,
                                })
                              }
                              placeholder="Hướng dẫn dùng thuốc"
                              className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                            />
                          </div>
                        ))
                      )}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-primary mb-1 font-bold">
                        Hướng dẫn thêm
                      </label>
                      <textarea
                        rows={3}
                        value={prescription.instructions}
                        onChange={(e) =>
                          updatePrescription("instructions", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-primary mb-1 font-bold">
                        Ghi chú gắn đơn
                      </label>
                      <textarea
                        rows={2}
                        value={prescription.extraNote}
                        onChange={(e) =>
                          updatePrescription("extraNote", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      />
                    </div>

                    {interactionWarnings.length > 0 && (
                      <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-200">
                          Cảnh báo an toàn
                        </p>
                        {interactionWarnings.map((warning) => (
                          <p key={warning} className="text-xs text-amber-100">
                            • {warning}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidePanel;
