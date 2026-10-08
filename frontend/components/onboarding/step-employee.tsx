"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  ChefHat, 
  Utensils, 
  Receipt, 
  CreditCard, 
  Sparkles, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Loader2, 
  Eye, 
  EyeOff, 
  Lock, 
  Phone, 
  Mail, 
  Calendar, 
  Briefcase, 
  LayoutGrid, 
  Clock, 
  Check,
  ShieldAlert,
  Layers,
  Search
} from "lucide-react";
import { branding } from "@/config/branding";
import { 
  CreateEmployeeSchema, 
  UpdateEmployeeSchema, 
  type CreateEmployeeInput, 
  type UpdateEmployeeInput,
  type EmployeeRole,
  type EmploymentType,
  PASSWORD_STRENGTH_REGEX
} from "@/lib/onboarding/schemas";

export interface EmployeeRecord {
  id: string;
  branch_id: string;
  first_name: string;
  last_name: string;
  role: EmployeeRole;
  email?: string | null;
  username: string;
  phone?: string | null;
  status: "active" | "inactive" | "suspended";
  employment_type: EmploymentType;
  start_date?: string | null;
  end_date?: string | null;
  permissions?: any;
  assigned_section_ids?: string[];
  assigned_shift_ids?: string[];
  assigned_kitchen_ids?: string[];
  created_at?: string;
  updated_at?: string;
}

interface StepEmployeeProps {
  branchId: string;
  initialEmployees: EmployeeRecord[];
  sections: Array<{ id: string; name: string; type?: string; active?: boolean }>;
  shifts: Array<{ id: string; name: string; start_time?: string; end_time?: string; active?: boolean }>;
  kitchens: Array<{ id: string; name: string; type?: string; active?: boolean }>;
  onAddEmployee: (data: CreateEmployeeInput) => Promise<{ success: boolean; employee?: any; error?: string }>;
  onUpdateEmployee: (id: string, data: UpdateEmployeeInput) => Promise<{ success: boolean; employee?: any; error?: string }>;
  onToggleStatus: (id: string, active: boolean) => Promise<{ success: boolean; status?: string; error?: string }>;
  onDeleteEmployee: (id: string) => Promise<{ success: boolean; error?: string }>;
  onProceedToMenu?: () => void;
  onBackToSections?: () => void;
  isSettingsMode?: boolean;
}

export const ROLE_CONFIGS: Record<EmployeeRole, {
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeBg: string;
  badgeText: string;
  borderCol: string;
}> = {
  manager: {
    label: "Branch Manager",
    desc: "Full operational authority, shift supervision, table management & reports",
    icon: ShieldCheck,
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
    borderCol: "border-purple-200",
  },
  section_manager: {
    label: "Section Manager",
    desc: "Oversees designated dining areas, assigns waitstaff & supervises seating",
    icon: LayoutGrid,
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
    borderCol: "border-blue-200",
  },
  waiter: {
    label: "Waiter",
    desc: "Takes orders, fires items to kitchen, handles table service & bill requests",
    icon: Utensils,
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
    borderCol: "border-amber-200",
  },
  biller: {
    label: "Biller",
    desc: "Compiles table orders, applies discounts, taxes & generates invoices",
    icon: Receipt,
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    borderCol: "border-emerald-200",
  },
  kitchen_staff: {
    label: "Kitchen Staff",
    desc: "Receives prep tickets on KDS, updates cooking statuses (preparing/ready)",
    icon: ChefHat,
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
    borderCol: "border-orange-200",
  },
  cashier: {
    label: "Cashier",
    desc: "Accepts payments, manages cash drawer, settles cards & UPI receipts",
    icon: CreditCard,
    badgeBg: "bg-teal-100",
    badgeText: "text-teal-800",
    borderCol: "border-teal-200",
  },
  cleaner: {
    label: "Cleaner",
    desc: "Monitors table clearing, sanitization, and marks tables ready for guests",
    icon: Sparkles,
    badgeBg: "bg-cyan-100",
    badgeText: "text-cyan-800",
    borderCol: "border-cyan-200",
  },
  other: {
    label: "Other",
    desc: "Custom support staff, security, or utility personnel",
    icon: Users,
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-800",
    borderCol: "border-slate-200",
  },
};

export default function StepEmployee({
  branchId,
  initialEmployees,
  sections,
  shifts,
  kitchens,
  onAddEmployee,
  onUpdateEmployee,
  onToggleStatus,
  onDeleteEmployee,
  onProceedToMenu,
  onBackToSections,
  isSettingsMode = false,
}: StepEmployeeProps) {
  const [employees, setEmployees] = useState<EmployeeRecord[]>(initialEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | null>(null);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<EmployeeRole>("waiter");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [employmentType, setEmploymentType] = useState<EmploymentType>("full_time");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assignedSections, setAssignedSections] = useState<string[]>([]);
  const [assignedShifts, setAssignedShifts] = useState<string[]>([]);
  const [assignedKitchens, setAssignedKitchens] = useState<string[]>([]);
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [gatingMessage, setGatingMessage] = useState<string | null>(null);
  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);

  useEffect(() => {
    setEmployees(initialEmployees);
  }, [initialEmployees]);

  // Search & Filter state for staff directory
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (roleFilter !== "all" && emp.role !== roleFilter) return false;
      if (statusFilter !== "all" && emp.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
        const username = (emp.username || "").toLowerCase();
        const phone = (emp.phone || "").toLowerCase();
        const roleLabel = (ROLE_CONFIGS[emp.role]?.label || "").toLowerCase();
        if (!fullName.includes(q) && !username.includes(q) && !phone.includes(q) && !roleLabel.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [employees, roleFilter, statusFilter, searchQuery]);

  // Derived metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const activeManagers = employees.filter((e) => e.role === "manager" && e.status === "active").length;
  const hasValidBranchManager = activeManagers > 0;

  // Password strength checks for real-time meter
  const passwordChecks = useMemo(() => {
    return {
      length: password.length >= PASSWORD_STRENGTH_REGEX.length,
      uppercase: PASSWORD_STRENGTH_REGEX.uppercase.test(password),
      lowercase: PASSWORD_STRENGTH_REGEX.lowercase.test(password),
      number: PASSWORD_STRENGTH_REGEX.number.test(password),
      special: PASSWORD_STRENGTH_REGEX.special.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordChecks.length) score += 20;
    if (passwordChecks.uppercase) score += 20;
    if (passwordChecks.lowercase) score += 20;
    if (passwordChecks.number) score += 20;
    if (passwordChecks.special) score += 20;
    return score;
  }, [passwordChecks]);

  const strengthColor = useMemo(() => {
    if (strengthScore <= 40) return "bg-rose-500";
    if (strengthScore <= 80) return "bg-amber-500";
    return "bg-emerald-500";
  }, [strengthScore]);

  const strengthLabel = useMemo(() => {
    if (strengthScore <= 40) return "Weak";
    if (strengthScore <= 80) return "Moderate";
    return "Strong (Meets Security Standard)";
  }, [strengthScore]);

  const isPasswordValid = 
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase &&
    passwordChecks.number &&
    passwordChecks.special;

  // Check if all dining sections are selected for operational coverage
  const allSectionsSelected = useMemo(() => {
    return sections.length > 0 && assignedSections.length === sections.length;
  }, [sections, assignedSections]);

  const handleToggleAllSections = () => {
    if (allSectionsSelected) {
      setAssignedSections([]);
    } else {
      setAssignedSections(sections.map((s) => s.id));
    }
  };

  const handleRoleChange = (newRole: EmployeeRole) => {
    setRole(newRole);
    // If switching away from kitchen or manager, clear kitchen assignments
    if (newRole !== "manager" && newRole !== "kitchen_staff") {
      setAssignedKitchens([]);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = (suggestedRole?: EmployeeRole) => {
    const initialRole = suggestedRole || (activeManagers === 0 ? "manager" : "waiter");
    setEditingEmployee(null);
    setFirstName("");
    setLastName("");
    setRole(initialRole);
    setEmail("");
    setPhone("");
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setEmploymentType("full_time");
    setStartDate("");
    setEndDate("");
    setAssignedSections([]);
    setAssignedShifts([]);
    setAssignedKitchens([]);
    setStatus("active");
    setFormErrors({});
    setActionError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (emp: EmployeeRecord) => {
    setEditingEmployee(emp);
    setFirstName(emp.first_name);
    setLastName(emp.last_name || "");
    setRole(emp.role);
    setEmail(emp.email || "");
    setPhone(emp.phone || "");
    setUsername(emp.username || "");
    setPassword(""); // Never load or show existing password
    setShowPassword(false);
    setEmploymentType(emp.employment_type || "full_time");
    setStartDate(emp.start_date ? emp.start_date.substring(0, 10) : "");
    setEndDate(emp.end_date ? emp.end_date.substring(0, 10) : "");
    setAssignedSections(emp.assigned_section_ids || []);
    setAssignedShifts(emp.assigned_shift_ids || []);
    setAssignedKitchens(emp.assigned_kitchen_ids || []);
    setStatus(emp.status === "inactive" ? "inactive" : "active");
    setFormErrors({});
    setActionError(null);
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setActionError(null);

    // Client-side quick checks
    if (!editingEmployee && !isPasswordValid) {
      setFormErrors({
        password: "Password must be 12+ characters with uppercase, lowercase, digit, and special character.",
      });
      return;
    }

    if (editingEmployee && password.length > 0 && !isPasswordValid) {
      setFormErrors({
        password: "Password must be 12+ characters with uppercase, lowercase, digit, and special character.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingEmployee) {
        const payload: UpdateEmployeeInput = {
          first_name: firstName,
          last_name: lastName,
          role,
          email: email.trim() || undefined,
          phone: phone.trim(),
          username: username.toLowerCase().trim(),
          employment_type: employmentType,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          assigned_section_ids: assignedSections,
          assigned_shift_ids: assignedShifts,
          assigned_kitchen_ids: assignedKitchens,
          status,
          password: password.trim() ? password : undefined,
        };

        const res = await onUpdateEmployee(editingEmployee.id, payload);
        if (res.success && res.employee) {
          setEmployees((prev) =>
            prev.map((e) => (e.id === editingEmployee.id ? res.employee : e))
          );
          setIsModalOpen(false);
        } else {
          setActionError(res.error || "Failed to update employee.");
        }
      } else {
        const payload: CreateEmployeeInput = {
          first_name: firstName,
          last_name: lastName,
          role,
          email: email.trim() || undefined,
          phone: phone.trim(),
          username: username.toLowerCase().trim(),
          password,
          employment_type: employmentType,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          assigned_section_ids: assignedSections,
          assigned_shift_ids: assignedShifts,
          assigned_kitchen_ids: assignedKitchens,
          status,
        };

        const res = await onAddEmployee(payload);
        if (res.success && res.employee) {
          setEmployees((prev) => [...prev, res.employee]);
          setIsModalOpen(false);
          setGatingMessage(null);
        } else {
          setActionError(res.error || "Failed to create employee.");
        }
      }
    } catch (err: any) {
      setActionError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status Handler
  const handleToggleStatusClick = async (emp: EmployeeRecord) => {
    const nextActive = emp.status !== "active";
    setStatusTogglingId(emp.id);
    setActionError(null);

    const res = await onToggleStatus(emp.id, nextActive);
    setStatusTogglingId(null);

    if (res.success) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === emp.id
            ? { ...e, status: nextActive ? "active" : "inactive" }
            : e
        )
      );
    } else {
      setActionError(res.error || "Failed to toggle employee status.");
    }
  };

  // Delete Handler
  const handleDeleteClick = async (emp: EmployeeRecord) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${emp.first_name} ${emp.last_name}? Their historical records will be archived.`
    );
    if (!confirmed) return;

    const res = await onDeleteEmployee(emp.id);
    if (res.success) {
      setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
    } else {
      setActionError(res.error || "Failed to delete employee.");
    }
  };

  // Forward Gating Check
  const handleForwardAdvance = () => {
    if (!hasValidBranchManager) {
      setGatingMessage(
        "At least one active Branch Manager is required before proceeding to Menu Engineering. Please add or activate a Branch Manager."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setGatingMessage(null);
    onProceedToMenu?.();
  };

  // Helper to toggle items in multi-select arrays
  const toggleSelection = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    id: string
  ) => {
    if (currentList.includes(id)) {
      setList(currentList.filter((item) => item !== id));
    } else {
      setList([...currentList, id]);
    }
  };

  return (
    <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-10 shadow-brandCard transition-all">
      {/* Top Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800 border border-purple-200">
              <Users className="h-3.5 w-3.5" />
              {isSettingsMode ? "Branch Staff Directory" : "Step 5 of 7: Staff & Roles"}
            </span>
            <span className="text-xs font-medium text-brand-text-muted">
              Role Credentials & Working Responsibilities
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-secondary tracking-tight mt-2">
            Employee Management
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-1">
            Add your branch team members, assign operational roles, link them to sections, shifts, and kitchens, and set direct login credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddModal()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all self-start sm:self-center shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Gating Error / Action Error Banner */}
      {(gatingMessage || actionError) && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm font-medium text-rose-900 shadow-sm animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Notice: </span>
            <span>{gatingMessage || actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setGatingMessage(null);
              setActionError(null);
            }}
            className="text-rose-600 hover:text-rose-900 font-bold shrink-0 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Metrics Bar */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-brand-border bg-brand-surface-muted/40 p-4 text-left">
          <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">
            Total Staff
          </div>
          <div className="text-2xl font-black text-brand-secondary mt-1">
            {totalEmployees}
          </div>
          <div className="text-[10px] text-brand-text-muted mt-0.5">
            Registered for branch
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface-muted/40 p-4 text-left">
          <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">
            Active Staff
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {activeEmployees}
          </div>
          <div className="text-[10px] text-brand-text-muted mt-0.5">
            Eligible to log in
          </div>
        </div>

        <div className={`rounded-2xl border p-4 text-left transition-all ${
          hasValidBranchManager
            ? "border-purple-200 bg-purple-50/50"
            : "border-amber-200 bg-amber-50/50"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              hasValidBranchManager ? "text-purple-800" : "text-amber-800"
            }`}>
              Branch Managers
            </span>
            {hasValidBranchManager ? (
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-amber-600" />
            )}
          </div>
          <div className={`text-2xl font-black mt-1 ${
            hasValidBranchManager ? "text-purple-900" : "text-amber-900"
          }`}>
            {activeManagers}
          </div>
          <div className="text-[10px] text-brand-text-muted mt-0.5">
            {hasValidBranchManager ? "Requirement Met (Min 1)" : "Min 1 Required to Proceed"}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface-muted/40 p-4 text-left">
          <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">
            Section Coverage
          </div>
          <div className="text-2xl font-black text-brand-secondary mt-1">
            {sections.length} Areas
          </div>
          <div className="text-[10px] text-brand-text-muted mt-0.5">
            {shifts.length} Active Shifts
          </div>
        </div>
      </div>

      {/* Branch Manager Gating Callout if 0 Active Managers */}
      {!hasValidBranchManager && (
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                Branch Manager Required to Advance
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Every branch requires at least one active Branch Manager with operational authority before completing onboarding.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenAddModal("manager")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all shrink-0"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Add Branch Manager</span>
          </button>
        </div>
      )}

      {/* Employee List Section */}
      <div className="mt-8">
        {/* Header Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-brand-secondary">
                Branch Staff Directory
              </h3>
              <span className="rounded-full bg-brand-surface-muted border border-brand-border px-2.5 py-0.5 text-xs font-bold text-brand-text-secondary">
                {employees.length} {employees.length === 1 ? "member" : "members"}
              </span>
            </div>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Horizontal directory of all team members, assigned dining sections, and login access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            {employees.length > 0 && (
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff, username, phone..."
                  className="w-full rounded-xl border border-brand-border bg-white pl-8 pr-7 py-2 text-xs text-brand-text-primary placeholder:text-brand-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-brand-text-muted hover:text-brand-secondary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all w-full sm:w-auto justify-center shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar (Role & Status) */}
        {employees.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-brand-border/60">
            {/* Role Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin text-xs">
              <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mr-1 shrink-0">
                Role:
              </span>
              <button
                type="button"
                onClick={() => setRoleFilter("all")}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                  roleFilter === "all"
                    ? "bg-brand-secondary text-white border-brand-secondary shadow-xs"
                    : "bg-white text-brand-text-secondary border-brand-border hover:bg-brand-surface-muted"
                }`}
              >
                All ({employees.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("manager")}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                  roleFilter === "manager"
                    ? "bg-purple-700 text-white border-purple-700 shadow-xs"
                    : "bg-white text-purple-900 border-brand-border hover:bg-purple-50"
                }`}
              >
                Managers ({employees.filter((e) => e.role === "manager").length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("section_manager")}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                  roleFilter === "section_manager"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-blue-900 border-brand-border hover:bg-blue-50"
                }`}
              >
                Section Mgr ({employees.filter((e) => e.role === "section_manager").length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("waiter")}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                  roleFilter === "waiter"
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-white text-amber-900 border-brand-border hover:bg-amber-50"
                }`}
              >
                Waiters ({employees.filter((e) => e.role === "waiter").length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("kitchen_staff")}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                  roleFilter === "kitchen_staff"
                    ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                    : "bg-white text-orange-900 border-brand-border hover:bg-orange-50"
                }`}
              >
                Kitchen ({employees.filter((e) => e.role === "kitchen_staff").length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("biller")}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                  roleFilter === "biller"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-emerald-900 border-brand-border hover:bg-emerald-50"
                }`}
              >
                Billers ({employees.filter((e) => e.role === "biller").length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("cashier")}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                  roleFilter === "cashier"
                    ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                    : "bg-white text-teal-900 border-brand-border hover:bg-teal-50"
                }`}
              >
                Cashiers ({employees.filter((e) => e.role === "cashier").length})
              </button>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 shrink-0 text-xs">
              <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mr-1">
                Status:
              </span>
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`rounded-lg px-2 py-0.5 text-[11px] font-bold border transition-all ${
                  statusFilter === "all"
                    ? "bg-brand-secondary text-white border-brand-secondary"
                    : "bg-white text-brand-text-secondary border-brand-border hover:bg-brand-surface-muted"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`rounded-lg px-2 py-0.5 text-[11px] font-bold border transition-all ${
                  statusFilter === "active"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-emerald-800 border-brand-border hover:bg-emerald-50"
                }`}
              >
                Active ({employees.filter((e) => e.status === "active").length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("inactive")}
                className={`rounded-lg px-2 py-0.5 text-[11px] font-bold border transition-all ${
                  statusFilter === "inactive"
                    ? "bg-gray-600 text-white border-gray-600"
                    : "bg-white text-gray-700 border-brand-border hover:bg-gray-100"
                }`}
              >
                Inactive ({employees.filter((e) => e.status !== "active").length})
              </button>
            </div>
          </div>
        )}

        {employees.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-brand-border p-12 text-center bg-white">
            <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-brand-secondary">
              No Staff Added Yet
            </h3>
            <p className="mt-1 text-xs text-brand-text-secondary max-w-md mx-auto">
              Start by creating your first team member. You must add at least one Branch Manager before continuing.
            </p>
            <button
              type="button"
              onClick={() => handleOpenAddModal("manager")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Employee (Branch Manager)</span>
            </button>
          </div>
        ) : (
          /* Spreadsheet / Table Container */
          <div className="rounded-2xl border border-brand-border bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
              <table className="w-full text-left border-collapse min-w-[860px]">
                <thead className="sticky top-0 z-10 bg-brand-surface-muted/95 backdrop-blur-sm border-b border-brand-border text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">
                  <tr>
                    <th scope="col" className="py-3 px-4 w-[240px]">
                      Employee / Contact
                    </th>
                    <th scope="col" className="py-3 px-4 w-[140px]">
                      Username
                    </th>
                    <th scope="col" className="py-3 px-4 w-[160px]">
                      Operational Role
                    </th>
                    <th scope="col" className="py-3 px-4 min-w-[200px]">
                      Sections Allocated
                    </th>
                    <th scope="col" className="py-3 px-4 w-[160px]">
                      Shift / Kitchen
                    </th>
                    <th scope="col" className="py-3 px-4 w-[120px] text-center">
                      Status
                    </th>
                    <th scope="col" className="py-3 px-4 w-[110px] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60 text-xs">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-brand-text-muted">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="h-7 w-7 text-brand-text-muted/50" />
                          <p className="font-bold text-brand-secondary">No team members match your filters</p>
                          <p className="text-[11px] text-brand-text-secondary">Try adjusting your search query or role filter.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery("");
                              setRoleFilter("all");
                              setStatusFilter("all");
                            }}
                            className="mt-1 text-xs font-bold text-brand-primary hover:underline"
                          >
                            Clear all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const roleMeta = ROLE_CONFIGS[emp.role] || ROLE_CONFIGS.other;
                      const RoleIcon = roleMeta.icon;
                      const isActive = emp.status === "active";
                      const isToggling = statusTogglingId === emp.id;

                      // Resolved assignment names
                      const assignedSecNames = sections
                        .filter((s) => (emp.assigned_section_ids || []).includes(s.id))
                        .map((s) => s.name);

                      const assignedShiftNames = shifts
                        .filter((s) => (emp.assigned_shift_ids || []).includes(s.id))
                        .map((s) => s.name);

                      const assignedKitNames = kitchens
                        .filter((k) => (emp.assigned_kitchen_ids || []).includes(k.id))
                        .map((k) => k.name);

                      const isAllSections = sections.length > 0 && (emp.assigned_section_ids || []).length === sections.length;

                      return (
                        <tr
                          key={emp.id}
                          className={`transition-colors hover:bg-brand-surface-muted/40 ${
                            !isActive ? "bg-gray-50/70 opacity-75" : ""
                          }`}
                        >
                          {/* 1. Employee / Contact */}
                          <td className="py-3 px-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                                emp.role === "manager"
                                  ? "bg-purple-100 text-purple-800 border-purple-200"
                                  : "bg-brand-surface-muted text-brand-secondary border-brand-border"
                              }`}>
                                {emp.first_name[0]?.toUpperCase()}
                                {emp.last_name ? emp.last_name[0]?.toUpperCase() : ""}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-brand-secondary truncate">
                                  {emp.first_name} {emp.last_name}
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-brand-text-muted mt-0.5">
                                  <Phone className="h-3 w-3 shrink-0" />
                                  <span>{emp.phone || "No phone"}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Username */}
                          <td className="py-3 px-4 align-middle">
                            <span className="font-mono text-[11px] font-semibold text-brand-secondary bg-brand-surface-muted border border-brand-border/60 px-2 py-0.5 rounded-md">
                              @{emp.username}
                            </span>
                          </td>

                          {/* 3. Role */}
                          <td className="py-3 px-4 align-middle">
                            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border ${roleMeta.badgeBg} ${roleMeta.badgeText} ${roleMeta.borderCol}`}>
                              <RoleIcon className="h-3.5 w-3.5 shrink-0" />
                              <span>{roleMeta.label}</span>
                            </span>
                          </td>

                          {/* 4. Sections Allocated */}
                          <td className="py-3 px-4 align-middle">
                            <div className="flex flex-wrap items-center gap-1 max-w-[280px]">
                              {isAllSections ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                                  <Layers className="h-3 w-3" />
                                  All Sections ({sections.length})
                                </span>
                              ) : assignedSecNames.length > 0 ? (
                                <>
                                  {assignedSecNames.slice(0, 2).map((name, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center gap-1 rounded bg-blue-50/80 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800 border border-blue-200/60"
                                    >
                                      <LayoutGrid className="h-2.5 w-2.5" />
                                      {name}
                                    </span>
                                  ))}
                                  {assignedSecNames.length > 2 && (
                                    <span
                                      className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200"
                                      title={assignedSecNames.slice(2).join(", ")}
                                    >
                                      +{assignedSecNames.length - 2} more
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-[11px] text-brand-text-muted italic">
                                  None assigned
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 5. Shift / Kitchen */}
                          <td className="py-3 px-4 align-middle">
                            <div className="flex flex-col gap-1 text-[11px]">
                              {assignedShiftNames.length > 0 ? (
                                <div className="flex items-center gap-1 text-amber-800 font-medium">
                                  <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                                  <span className="truncate max-w-[130px]">{assignedShiftNames.join(", ")}</span>
                                </div>
                              ) : (
                                <span className="text-brand-text-muted italic text-[10px]">No shift tied</span>
                              )}

                              {assignedKitNames.length > 0 && (
                                <div className="flex items-center gap-1 text-orange-800 font-medium">
                                  <ChefHat className="h-3 w-3 text-orange-600 shrink-0" />
                                  <span className="truncate max-w-[130px]">{assignedKitNames.join(", ")}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 6. Status Toggle */}
                          <td className="py-3 px-4 align-middle text-center">
                            <div className="inline-flex flex-col items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleStatusClick(emp)}
                                disabled={isToggling}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  isActive ? "bg-emerald-500" : "bg-gray-300"
                                }`}
                                title={isActive ? "Deactivate employee" : "Activate employee"}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    isActive ? "translate-x-4" : "translate-x-0"
                                  }`}
                                />
                              </button>
                              <span className={`text-[10px] font-bold ${isActive ? "text-emerald-700" : "text-gray-500"}`}>
                                {isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </td>

                          {/* 7. Actions */}
                          <td className="py-3 px-4 align-middle text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(emp)}
                                className="p-1.5 rounded-lg border border-brand-border text-brand-secondary hover:bg-brand-surface-muted transition-all"
                                title="Edit profile and credentials"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(emp)}
                                className="p-1.5 rounded-lg border border-brand-border text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                                title="Archive employee"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Summary */}
            <div className="px-4 py-2.5 bg-brand-surface-muted/60 border-t border-brand-border flex items-center justify-between text-xs text-brand-text-secondary">
              <span>
                Showing {employees.length} {employees.length === 1 ? "staff member" : "staff members"} ({activeManagers} active {activeManagers === 1 ? "Branch Manager" : "Branch Managers"})
              </span>
              <span className="text-[11px] text-brand-text-muted hidden sm:inline">
                Scroll vertically to view up to 15+ employees
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      {!isSettingsMode && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-border pt-6">
          <button
            type="button"
            onClick={onBackToSections}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-5 py-2.5 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sections & Tables</span>
          </button>

          <button
            type="button"
            onClick={handleForwardAdvance}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-brandCard transition-all w-full sm:w-auto justify-center ${
              hasValidBranchManager
                ? "bg-brand-primary hover:bg-brand-primary-hover"
                : "bg-purple-700 hover:bg-purple-800"
            }`}
          >
            <span>Save & Continue to Menu Engineering</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-brand-border bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-surface-muted/30 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-secondary">
                    {editingEmployee ? "Edit Employee Profile" : "Add New Employee"}
                  </h3>
                  <p className="text-xs text-brand-text-secondary">
                    {editingEmployee 
                      ? `Updating details and credentials for @${editingEmployee.username}`
                      : "Directly configure credentials and working assignments."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-brand-text-muted hover:bg-brand-surface-muted hover:text-brand-secondary transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
              {/* Error banner inside modal */}
              {actionError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* 1. Personal & Role Info */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  1. Identity & Role Assignment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-text-primary mb-1">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Ramesh"
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                    {formErrors.first_name && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text-primary mb-1">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Sharma"
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                    {formErrors.last_name && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.last_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text-primary mb-1">
                      Operational Role <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={role}
                      onChange={(e) => handleRoleChange(e.target.value as EmployeeRole)}
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs font-bold text-brand-secondary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    >
                      {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-brand-text-muted mt-1">
                      {ROLE_CONFIGS[role]?.desc}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text-primary mb-1">
                      Employment Type
                    </label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    >
                      <option value="full_time">Full-time</option>
                      <option value="part_time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Login Credentials & Security */}
              <div className="border-t border-brand-border/60 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  2. Login Credentials & Access Security
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Username */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-brand-text-primary mb-1">
                      Platform-Wide Username <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-brand-text-muted">@</span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                        placeholder="e.g. ramesh_mumbai"
                        className="w-full rounded-xl border border-brand-border bg-white pl-8 pr-3.5 py-2.5 text-xs font-mono text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                      />
                    </div>
                    <span className="text-[11px] text-brand-text-muted mt-1 block">
                      Must be unique platform-wide across all branches. Letters, digits, underscores, dots.
                    </span>
                    {formErrors.username && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.username}</p>
                    )}
                  </div>

                  {/* Direct Password */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-brand-text-primary">
                        {editingEmployee ? "Reset Password (Optional)" : "Password (12+ characters)"}{" "}
                        {!editingEmployee && <span className="text-rose-500">*</span>}
                      </label>
                      {editingEmployee && (
                        <span className="text-[11px] text-brand-text-muted italic">
                          Leave blank to keep current password
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!editingEmployee}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={editingEmployee ? "•••••••••••• (Unchanged)" : "••••••••••••"}
                        className="w-full rounded-xl border border-brand-border bg-white pl-3.5 pr-10 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-brand-text-muted hover:text-brand-text-primary"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Real-time Strength Meter */}
                    {password.length > 0 && (
                      <div className="mt-2.5 space-y-2 rounded-xl bg-brand-surface-muted/60 p-3 border border-brand-border/60">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-brand-text-muted">Password Strength:</span>
                          <span className="font-bold text-brand-secondary">{strengthLabel}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-brand-surface-muted overflow-hidden">
                          <div
                            className={`h-full ${strengthColor} transition-all duration-300`}
                            style={{ width: `${strengthScore}%` }}
                          />
                        </div>

                        {/* Checklist */}
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                          <div className={`flex items-center gap-1 ${passwordChecks.length ? "text-emerald-700" : "text-brand-text-muted"}`}>
                            <Check className="h-3 w-3" />
                            <span>12+ characters</span>
                          </div>
                          <div className={`flex items-center gap-1 ${passwordChecks.uppercase ? "text-emerald-700" : "text-brand-text-muted"}`}>
                            <Check className="h-3 w-3" />
                            <span>Uppercase (A-Z)</span>
                          </div>
                          <div className={`flex items-center gap-1 ${passwordChecks.lowercase ? "text-emerald-700" : "text-brand-text-muted"}`}>
                            <Check className="h-3 w-3" />
                            <span>Lowercase (a-z)</span>
                          </div>
                          <div className={`flex items-center gap-1 ${passwordChecks.number ? "text-emerald-700" : "text-brand-text-muted"}`}>
                            <Check className="h-3 w-3" />
                            <span>Digit (0-9)</span>
                          </div>
                          <div className={`flex items-center gap-1 ${passwordChecks.special ? "text-emerald-700" : "text-brand-text-muted"}`}>
                            <Check className="h-3 w-3" />
                            <span>Special character (!@#$)</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {formErrors.password && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.password}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Contact Details & Dates */}
              <div className="border-t border-brand-border/60 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  3. Contact & Dates
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-text-primary mb-1">
                      Mobile Number <span className="text-xs text-brand-text-muted font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit mobile (e.g. 9876543210)"
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text-primary mb-1">
                      Email Address <span className="text-brand-text-muted font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="staff@bharatqr.internal"
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                    {formErrors.email && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text-primary mb-1">
                      Start Date <span className="text-brand-text-muted font-normal">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text-primary mb-1">
                      End Date <span className="text-brand-text-muted font-normal">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs text-brand-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Working Responsibilities (Multi-select) */}
              <div className="border-t border-brand-border/60 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3 flex items-center gap-1.5">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  4. Working Responsibilities & Assignments
                </h4>

                {/* Assigned Sections */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-brand-text-primary mb-1.5">
                    Assigned Dining Sections (Multi-select)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {/* All Sections (Full Branch) operational shortcut */}
                    {sections.length > 0 && (
                      <button
                        type="button"
                        onClick={handleToggleAllSections}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold border transition-all ${
                          allSectionsSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-200"
                            : "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                        }`}
                      >
                        <Layers className="h-3.5 w-3.5" />
                        <span>All Sections (Full Branch)</span>
                        {allSectionsSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>
                    )}

                    {/* Individual sections from Step 4 */}
                    {sections.map((sec) => {
                      const isSelected = assignedSections.includes(sec.id);
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => toggleSelection(assignedSections, setAssignedSections, sec.id)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-white text-brand-secondary border-brand-border hover:bg-brand-surface-muted"
                          }`}
                        >
                          <LayoutGrid className="h-3 w-3" />
                          <span>{sec.name}</span>
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-brand-text-muted mt-1.5 block">
                    Choose which dining section(s) this employee handles, or click <strong>All Sections (Full Branch)</strong>. (Operational assignment only; role alone decides managerial authority).
                  </span>
                </div>

                {/* Assigned Shifts */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-brand-text-primary mb-1.5">
                    Assigned Operating Shifts (Multi-select)
                  </label>
                  {shifts.length === 0 ? (
                    <p className="text-xs text-brand-text-muted italic">No shifts configured in Step 3.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {shifts.map((sh) => {
                        const isSelected = assignedShifts.includes(sh.id);
                        return (
                          <button
                            key={sh.id}
                            type="button"
                            onClick={() => toggleSelection(assignedShifts, setAssignedShifts, sh.id)}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                              isSelected
                                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                                : "bg-white text-brand-secondary border-brand-border hover:bg-brand-surface-muted"
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            <span>{sh.name}</span>
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <span className="text-[11px] text-brand-text-muted mt-1 block">
                    Operational hours when this staff member is rostered.
                  </span>
                </div>

                {/* Assigned Kitchens - Only visible for Branch Manager or Kitchen Staff */}
                {(role === "manager" || role === "kitchen_staff") && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-brand-text-primary">
                        Assigned Kitchen Prep Stations (Multi-select)
                      </label>
                      <span className="text-[10px] text-brand-text-muted">
                        Visible for {role === "manager" ? "Branch Manager" : "Kitchen Staff"}
                      </span>
                    </div>
                    {kitchens.length === 0 ? (
                      <p className="text-xs text-brand-text-muted italic">No kitchens configured in Step 2.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {kitchens.map((kit) => {
                          const isSelected = assignedKitchens.includes(kit.id);
                          return (
                            <button
                              key={kit.id}
                              type="button"
                              onClick={() => toggleSelection(assignedKitchens, setAssignedKitchens, kit.id)}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                                isSelected
                                  ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                                  : "bg-white text-brand-secondary border-brand-border hover:bg-brand-surface-muted"
                              }`}
                            >
                              <ChefHat className="h-3 w-3" />
                              <span>{kit.name}</span>
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <span className="text-[11px] text-brand-text-muted mt-1 block">
                      Order ticket filtering for kitchen display/prep stations.
                    </span>
                  </div>
                )}
              </div>

              {/* 5. Permission Controls (Placeholder) */}
              <div className="border-t border-brand-border/60 pt-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                    5. Permission Controls
                  </h4>
                  <span className="rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5">
                    Role Defaults Active
                  </span>
                </div>
                <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-xs text-purple-900 flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-950">Detailed permission controls coming soon</p>
                    <p className="text-[11px] text-purple-800 mt-0.5">
                      This staff member currently operates under standardized system role capabilities for <strong>{ROLE_CONFIGS[role]?.label || role}</strong>. Custom per-role action overrides can be assigned once the granular permission matrix is enabled.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Status Toggle */}
              <div className="border-t border-brand-border/60 pt-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-brand-text-primary">
                    Employee Account Status
                  </div>
                  <div className="text-[11px] text-brand-text-muted">
                    Active employees can sign in; Inactive employees are blocked from logging in.
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${status === "active" ? "text-emerald-600" : "text-gray-500"}`}>
                    {status === "active" ? "Active" : "Inactive"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStatus(status === "active" ? "inactive" : "active")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      status === "active" ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        status === "active" ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-brand-border px-4 py-2.5 text-xs font-bold text-brand-secondary hover:bg-brand-surface-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-xs font-bold text-white shadow-brandCard hover:bg-brand-primary-hover disabled:opacity-50 transition-all"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingEmployee ? "Save Changes" : "Save Employee"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
