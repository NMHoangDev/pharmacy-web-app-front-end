import React from "react";
import AdminTableWrapper from "../../common/AdminTableWrapper";

const statusBadge = (status) => {
  const map = {
    requested: {
      label: "Requested",
      color: "bg-orange-100",
      text: "text-orange-700",
    },
    pending: {
      label: "Pending",
      color: "bg-orange-100",
      text: "text-orange-700",
    },
    confirmed: {
      label: "Confirmed",
      color: "bg-green-100",
      text: "text-green-700",
    },
    in_progress: {
      label: "In progress",
      color: "bg-blue-100",
      text: "text-blue-700",
    },
    completed: {
      label: "Completed",
      color: "bg-slate-100",
      text: "text-slate-700",
    },
    done: {
      label: "Done",
      color: "bg-slate-100",
      text: "text-slate-700",
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-red-100",
      text: "text-red-700",
    },
    no_show: {
      label: "No show",
      color: "bg-rose-100",
      text: "text-rose-700",
    },
    rescheduled: {
      label: "Rescheduled",
      color: "bg-indigo-100",
      text: "text-indigo-700",
    },
    refunded: {
      label: "Refunded",
      color: "bg-emerald-100",
      text: "text-emerald-700",
    },
  };
  const cfg = map[status] || map.pending;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
};

const clampStyle = (lines) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  wordBreak: "break-word",
  overflowWrap: "anywhere",
});

const ScheduleList = ({
  appointments,
  onUpdateStatus,
  onSelectAppointment,
  onEnterRoom,
  onOpenActions,
  onOpenAudit,
  selectedId,
}) => {
  return (
    <AdminTableWrapper className="overflow-hidden" padded={false}>
      <div className="overflow-hidden">
        <table className="w-full border-collapse table-fixed text-left">
          <colgroup>
            <col style={{ width: "200px" }} />
            <col style={{ width: "180px" }} />
            <col
              className="hidden md:table-column"
              style={{ width: "180px" }}
            />
            <col
              className="hidden md:table-column"
              style={{ width: "160px" }}
            />
            <col style={{ width: "120px" }} />
            <col style={{ width: "140px" }} />
          </colgroup>
          <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 sm:text-xs">
            <tr>
              <th className="px-2 py-2.5 font-semibold sm:px-3 sm:py-3">
                Appointment
              </th>
              <th className="px-2 py-2.5 font-semibold sm:px-3 sm:py-3">
                Customer
              </th>
              <th className="hidden px-2 py-2.5 font-semibold md:table-cell sm:px-3 sm:py-3">
                Pharmacist
              </th>
              <th className="hidden px-2 py-2.5 font-semibold md:table-cell sm:px-3 sm:py-3">
                Time
              </th>
              <th className="px-2 py-2.5 text-center font-semibold sm:px-3 sm:py-3">
                Status
              </th>
              <th className="px-2 py-2.5 text-center font-semibold sm:px-3 sm:py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <tr
                  key={item.id}
                  className={`group transition-colors hover:bg-[#fafafa] ${isSelected ? "bg-slate-50" : ""}`}
                  onClick={() => onSelectAppointment?.(item)}
                >
                  <td className="px-2 py-2.5 align-middle sm:px-3 sm:py-3">
                    <div className="flex min-w-0 flex-col justify-center gap-0.5">
                      <span
                        className="text-[12px] font-semibold leading-5 text-slate-900 sm:text-sm"
                        style={clampStyle(2)}
                        title={item.id}
                      >
                        {item.id}
                      </span>
                      <span
                        className="text-[11px] leading-4 text-slate-500 sm:text-xs"
                        style={clampStyle(2)}
                        title={item.topic || "Consultation"}
                      >
                        {item.topic || "Consultation"}
                      </span>
                    </div>
                  </td>

                  <td className="px-2 py-2.5 align-middle sm:px-3 sm:py-3">
                    <div className="flex min-w-0 flex-col justify-center gap-0.5">
                      <span
                        className="text-[12px] font-semibold leading-5 text-slate-900 sm:text-sm"
                        style={clampStyle(2)}
                        title={item.customer || "-"}
                      >
                        {item.customer || "-"}
                      </span>
                      <span
                        className="text-[11px] leading-4 text-slate-500 sm:text-xs"
                        style={clampStyle(2)}
                        title={item.customerId || "-"}
                      >
                        {item.customerId || "-"}
                      </span>
                    </div>
                  </td>

                  <td className="hidden px-2 py-2.5 align-middle md:table-cell sm:px-3 sm:py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className="h-7 w-7 shrink-0 rounded-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${item.customerAvatar})`,
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className="text-[12px] font-medium leading-5 text-slate-700 sm:text-sm"
                        style={clampStyle(2)}
                        title={item.pharmacist || "Chưa gán"}
                      >
                        {item.pharmacist || "Chưa gán"}
                      </span>
                    </div>
                  </td>

                  <td className="hidden px-2 py-2.5 align-middle md:table-cell sm:px-3 sm:py-3">
                    <div className="flex min-w-0 flex-col justify-center gap-0.5">
                      <span
                        className="text-[12px] leading-5 text-slate-700 sm:text-sm"
                        style={clampStyle(1)}
                        title={item.date || "-"}
                      >
                        {item.date || "-"}
                      </span>
                      <span
                        className="text-[11px] leading-4 text-slate-500 sm:text-xs"
                        style={clampStyle(1)}
                        title={
                          item.time
                            ? `${item.time} ${item.period || ""}`.trim()
                            : "-"
                        }
                      >
                        {item.time
                          ? `${item.time} ${item.period || ""}`.trim()
                          : "-"}
                      </span>
                    </div>
                  </td>

                  <td className="px-2 py-2.5 text-center align-middle sm:px-3 sm:py-3">
                    {statusBadge(item.status)}
                  </td>

                  <td className="px-2 py-2.5 text-center align-middle sm:px-3 sm:py-3">
                    <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectAppointment?.(item);
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 sm:h-8 sm:w-8"
                        title="Xem chi tiết"
                        aria-label="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined text-[17px] sm:text-[18px]">
                          visibility
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenActions?.(item);
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 sm:h-8 sm:w-8"
                        title="Chỉnh sửa"
                        aria-label="Chỉnh sửa"
                      >
                        <span className="material-symbols-outlined text-[17px] sm:text-[18px]">
                          edit
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onUpdateStatus?.(item.id, "cancelled");
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 sm:h-8 sm:w-8"
                        title="Huỷ lịch hẹn"
                        aria-label="Huỷ lịch hẹn"
                      >
                        <span className="material-symbols-outlined text-[17px] sm:text-[18px]">
                          cancel
                        </span>
                      </button>
                      {(item.status === "in_progress" ||
                        item.status === "confirmed") && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEnterRoom?.(item.id);
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 sm:h-8 sm:w-8"
                          title="Vào phòng"
                          aria-label="Vào phòng"
                        >
                          <span className="material-symbols-outlined text-[17px] sm:text-[18px]">
                            videocam
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenAudit?.(item);
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 sm:h-8 sm:w-8"
                        title="Audit logs"
                        aria-label="Audit logs"
                      >
                        <span className="material-symbols-outlined text-[17px] sm:text-[18px]">
                          history
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {appointments.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">
            Không có lịch hẹn trong ngày này.
          </div>
        )}
      </div>
    </AdminTableWrapper>
  );
};

export default ScheduleList;
