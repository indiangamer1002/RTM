// Lifecycle stages for Requirements
export const requirementLifecycleStages = [
  {
    _id: "6985bf615b9f7bfe251c8e96",
    workItem: "Requirement",
    title: "Identification",
    description: "Requirement is being identified and captured",
    icon: "file-text",
    order: 1,
    isInitial: true,
    isFinal: false,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8e97",
    workItem: "Requirement",
    title: "Preparation",
    description: "Requirement is being prepared for analysis",
    icon: "file-edit",
    order: 2,
    isInitial: false,
    isFinal: false,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8e98",
    workItem: "Requirement",
    title: "Analysis",
    description: "Requirement is being analyzed",
    icon: "search",
    order: 3,
    isInitial: false,
    isFinal: false,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8e99",
    workItem: "Requirement",
    title: "Configuration",
    description: "Requirement configuration is in progress",
    icon: "settings",
    order: 4,
    isInitial: false,
    isFinal: false,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8e9a",
    workItem: "Requirement",
    title: "Design",
    description: "Requirement is being designed",
    icon: "layout",
    order: 5,
    isInitial: false,
    isFinal: false,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8e9b",
    workItem: "Requirement",
    title: "Development",
    description: "Requirement is being developed",
    icon: "code",
    order: 6,
    isInitial: false,
    isFinal: false,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8e9c",
    workItem: "Requirement",
    title: "Testing",
    description: "Requirement is being tested",
    icon: "test-tube",
    order: 7,
    isInitial: false,
    isFinal: false,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8e9d",
    workItem: "Requirement",
    title: "Deployed",
    description: "Requirement has been deployed to production",
    icon: "check-circle",
    order: 8,
    isInitial: false,
    isFinal: true,
    active: true
  }
];

// Statuses for Requirements
export const requirementStatuses = [
  {
    _id: "6985bf615b9f7bfe251c8ea1",
    status: "New",
    workItem: "Requirement",
    category: "NEW",
    color: "#94A3B8",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e96",
    marksCompletion: true,
    order: 1,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8ea2",
    status: "Preparation Active",
    workItem: "Requirement",
    category: "ACTIVE",
    color: "#8B5CF6",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e97",
    marksCompletion: false,
    order: 2,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8ea3",
    status: "Preparation Completed",
    workItem: "Requirement",
    category: "COMPLETED",
    color: "#10B981",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e97",
    marksCompletion: true,
    order: 3,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8ea4",
    status: "Preparation Rework",
    workItem: "Requirement",
    category: "ACTIVE",
    color: "#EF4444",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e97",
    marksCompletion: false,
    order: 4,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8ea5",
    status: "Analysis Active",
    workItem: "Requirement",
    category: "ACTIVE",
    color: "#3B82F6",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e98",
    marksCompletion: false,
    order: 5,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8ea6",
    status: "Analysis Completed",
    workItem: "Requirement",
    category: "COMPLETED",
    color: "#10B981",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e98",
    marksCompletion: true,
    order: 6,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8ea7",
    status: "Analysis Rework",
    workItem: "Requirement",
    category: "ACTIVE",
    color: "#EF4444",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e98",
    marksCompletion: false,
    order: 7,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8ea8",
    status: "Configuration Active",
    workItem: "Requirement",
    category: "ACTIVE",
    color: "#F59E0B",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e99",
    marksCompletion: false,
    order: 8,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8ea9",
    status: "Configuration Completed",
    workItem: "Requirement",
    category: "COMPLETED",
    color: "#10B981",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e99",
    marksCompletion: true,
    order: 9,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8eaa",
    status: "Configuration Rework",
    workItem: "Requirement",
    category: "ACTIVE",
    color: "#EF4444",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e99",
    marksCompletion: false,
    order: 10,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8eab",
    status: "Design Active",
    workItem: "Requirement",
    category: "ACTIVE",
    color: "#EC4899",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e9a",
    marksCompletion: false,
    order: 11,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8eac",
    status: "Design Completed",
    workItem: "Requirement",
    category: "COMPLETED",
    color: "#10B981",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e9a",
    marksCompletion: true,
    order: 12,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8ead",
    status: "Design Rework",
    workItem: "Requirement",
    category: "ACTIVE",
    color: "#EF4444",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e9a",
    marksCompletion: false,
    order: 13,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8eae",
    status: "Development Active",
    workItem: "Requirement",
    category: "ACTIVE",
    color: "#10B981",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e9b",
    marksCompletion: false,
    order: 14,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8eaf",
    status: "Development Completed",
    workItem: "Requirement",
    category: "COMPLETED",
    color: "#10B981",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e9b",
    marksCompletion: true,
    order: 15,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8eb0",
    status: "Development Rework",
    workItem: "Requirement",
    category: "ACTIVE",
    color: "#EF4444",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e9b",
    marksCompletion: false,
    order: 16,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8eb1",
    status: "Testing Active",
    workItem: "Requirement",
    category: "ACTIVE",
    color: "#F59E0B",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e9c",
    marksCompletion: false,
    order: 17,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8eb2",
    status: "Testing Completed",
    workItem: "Requirement",
    category: "COMPLETED",
    color: "#10B981",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e9c",
    marksCompletion: true,
    order: 18,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8eb3",
    status: "Testing Rework",
    workItem: "Requirement",
    category: "ACTIVE",
    color: "#EF4444",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e9c",
    marksCompletion: false,
    order: 19,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8eb4",
    status: "Quality Released",
    workItem: "Requirement",
    category: "APPROVED",
    color: "#8B5CF6",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e9d",
    marksCompletion: false,
    order: 20,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8eb5",
    status: "Pre Production Released",
    workItem: "Requirement",
    category: "APPROVED",
    color: "#F59E0B",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e9d",
    marksCompletion: false,
    order: 21,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8eb6",
    status: "Production Released",
    workItem: "Requirement",
    category: "APPROVED",
    color: "#10B981",
    mappedLifecycleState: "6985bf615b9f7bfe251c8e9d",
    marksCompletion: true,
    order: 22,
    active: true
  },
  {
    _id: "6985bf615b9f7bfe251c8eb7",
    status: "Irrelevant",
    workItem: "Requirement",
    category: "COMPLETED",
    color: "#6B7280",
    mappedLifecycleState: null,
    marksCompletion: false,
    order: 99,
    active: true
  }
];
