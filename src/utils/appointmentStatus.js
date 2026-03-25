/**
 * Normalizes the status string from backend.
 * Handles case sensitivity and alias mapping (e.g. CANCEL -> CANCELLED).
 */
export const normalizeAppointmentStatus = (status) => {
    if (!status) return "UNKNOWN";
    const s = status.toUpperCase().trim();
    if (s === "CANCEL") return "CANCELLED";
    if (s === "SCHEDULED") return "APPROVED"; // Treat SCHEDULED as APPROVED based on requirements
    return s;
};

/**
 * Returns the Vietnamese label for the status.
 */
export const getAppointmentStatusLabel = (status) => {
    const s = normalizeAppointmentStatus(status);
    switch (s) {
        case "REQUESTED":
            return "Chưa xác nhận";
        case "APPROVED":
        case "CONFIRMED": // In case CONFIRMED shows up (mapped in previous steps)
            return "Đã xác nhận";
        case "REJECTED":
            return "Từ chối";
        case "CANCELLED":
            return "Đã hủy";
        case "COMPLETED":
        case "DONE": // Alias
            return "Hoàn thành";
        case "IN_PROGRESS":
            return "Đang diễn ra";
        default:
            return "Không xác định";
    }
};

/**
 * Returns the styling variant/intent for the status.
 * variants: 'info', 'success', 'danger', 'neutral', 'warning'
 */
export const getAppointmentStatusVariant = (status) => {
    const s = normalizeAppointmentStatus(status);
    switch (s) {
        case "REQUESTED":
            return "info";
        case "APPROVED":
        case "CONFIRMED":
        case "IN_PROGRESS":
            return "success";
        case "REJECTED":
        case "CANCELLED":
            return "danger";
        case "COMPLETED":
        case "DONE":
            return "neutral";
        default:
            return "neutral";
    }
};
