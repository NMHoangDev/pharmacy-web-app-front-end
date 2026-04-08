export const getDefaultPathForRoles = (roles = []) => {
  const normalizedRoles = Array.isArray(roles)
    ? roles.map((role) => String(role || "").trim().toUpperCase())
    : [String(roles || "").trim().toUpperCase()];

  if (normalizedRoles.includes("ADMIN")) {
    return "/admin/dashboard";
  }

  if (normalizedRoles.includes("PHARMACIST")) {
    return "/pharmacist/pos";
  }

  if (normalizedRoles.includes("SHIPPER")) {
    return "/shipper/orders";
  }

  return "/";
};

export const getRoleLabel = (roles = []) => {
  const normalizedRoles = Array.isArray(roles)
    ? roles.map((role) => String(role || "").trim().toUpperCase())
    : [String(roles || "").trim().toUpperCase()];

  if (normalizedRoles.includes("ADMIN")) return "Quản trị viên";
  if (normalizedRoles.includes("PHARMACIST")) return "Dược sĩ";
  if (normalizedRoles.includes("SHIPPER")) return "Shipper";
  if (normalizedRoles.includes("STAFF")) return "Nhân viên";
  return "Người dùng";
};
