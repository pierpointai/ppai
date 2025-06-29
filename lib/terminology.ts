// Standardized terminology throughout the application
export const terminology = {
  // Primary terms (use these consistently)
  vessel: "vessel", // Use "vessel" instead of "ship"
  cargo: "cargo",
  charterer: "charterer",
  broker: "broker",
  owner: "owner",
  operator: "operator",

  // Vessel-related terms
  vesselTypes: {
    bulkCarrier: "Bulk Carrier",
    container: "Container Vessel",
    tanker: "Tanker",
    generalCargo: "General Cargo Vessel",
    roro: "RoRo Vessel",
    multipurpose: "Multipurpose Vessel",
  },

  // Size categories (standardized)
  vesselSizes: {
    handysize: "Handysize",
    handymax: "Handymax",
    supramax: "Supramax",
    ultramax: "Ultramax",
    panamax: "Panamax",
    kamsarmax: "Kamsarmax",
    postPanamax: "Post-Panamax",
    capesize: "Capesize",
    vloc: "VLOC",
    vlcc: "VLCC",
    ulcc: "ULCC",
  },

  // Commercial terms
  commercial: {
    voyage: "Voyage Charter",
    timecharter: "Time Charter",
    coa: "Contract of Affreightment",
    spot: "Spot Market",
    period: "Period Charter",
    laycan: "Laycan",
    demurrage: "Demurrage",
    despatch: "Despatch",
    laytime: "Laytime",
  },

  // Status terms
  status: {
    // Vessel status
    available: "Available",
    pending: "Pending",
    fixed: "Fixed",
    failed: "Failed",

    // Order status
    active: "Active",
    matched: "Matched",
    completed: "Completed",
    cancelled: "Cancelled",

    // Linking status
    shortlisted: "Shortlisted",
    contacted: "Contacted",
    offered: "Offered",
    rejected: "Rejected",
    nominated: "Nominated",
  },

  // Units (standardized)
  units: {
    dwt: "DWT",
    mt: "MT",
    cbm: "CBM",
    teu: "TEU",
    nm: "NM", // Nautical miles
    knots: "knots",
    usd: "USD",
    day: "day",
    ton: "ton",
  },

  // Action terms
  actions: {
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    link: "Link",
    unlink: "Unlink",
    match: "Match",
    compare: "Compare",
    filter: "Filter",
    sort: "Sort",
    search: "Search",
    export: "Export",
    import: "Import",
    save: "Save",
    cancel: "Cancel",
    submit: "Submit",
    apply: "Apply",
    clear: "Clear",
    refresh: "Refresh",
    copy: "Copy",
    send: "Send",
  },

  // Navigation terms
  navigation: {
    dashboard: "Dashboard",
    vessels: "Vessels",
    orders: "Orders",
    clients: "Clients",
    companies: "Companies",
    reports: "Reports",
    settings: "Settings",
    help: "Help",
    profile: "Profile",
  },
}

// Helper function to get consistent terminology
export function getTerm(category: keyof typeof terminology, key: string): string {
  const categoryTerms = terminology[category] as Record<string, string>
  return categoryTerms[key] || key
}

// Text transformation utilities
export function standardizeText(text: string): string {
  // Replace common variations with standard terms
  return text
    .replace(/\bship\b/gi, "vessel")
    .replace(/\bships\b/gi, "vessels")
    .replace(/\bvessel name\b/gi, "vessel name")
    .replace(/\bship name\b/gi, "vessel name")
    .replace(/\bshipowner\b/gi, "vessel owner")
    .replace(/\bshipment\b/gi, "cargo")
    .replace(/\bfreight rate\b/gi, "freight rate")
    .replace(/\bhire rate\b/gi, "charter rate")
}
