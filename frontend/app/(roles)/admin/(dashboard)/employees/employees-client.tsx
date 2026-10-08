"use client";

import React, { useState } from "react";
import StepEmployee from "@/components/onboarding/step-employee";
import { 
  createEmployee, 
  updateEmployee, 
  toggleEmployeeStatus, 
  deleteEmployee 
} from "@/app/actions/onboarding-actions";
import { Users, Store, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "@/lib/onboarding/schemas";

interface EmployeesClientProps {
  branchId: string;
  branchName: string;
  branches: Array<{ id: string; name: string }>;
  initialEmployees: any[];
  sections: any[];
  shifts: any[];
  kitchens: any[];
}

export default function EmployeesClient({
  branchId,
  branchName,
  branches,
  initialEmployees,
  sections,
  shifts,
  kitchens,
}: EmployeesClientProps) {
  const [employees, setEmployees] = useState(initialEmployees);

  const handleAddEmployee = async (data: CreateEmployeeInput) => {
    const res = await createEmployee(branchId, data);
    if (res.success && res.employee) {
      setEmployees((prev) => [...prev, res.employee]);
    }
    return res;
  };

  const handleUpdateEmployee = async (id: string, data: UpdateEmployeeInput) => {
    const res = await updateEmployee(id, data);
    if (res.success && res.employee) {
      setEmployees((prev) => prev.map((e) => (e.id === id ? res.employee : e)));
    }
    return res;
  };

  const handleToggleStatus = async (id: string, active: boolean) => {
    const res = await toggleEmployeeStatus(id, active);
    if (res.success) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: active ? "active" : "inactive" } : e))
      );
    }
    return res;
  };

  const handleDeleteEmployee = async (id: string) => {
    const res = await deleteEmployee(id);
    if (res.success) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    }
    return res;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-secondary tracking-tight">
              Staff & Employee Directory
            </h1>
            <span className="rounded-full bg-brand-primary-light px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-brand-primary/20">
              {branchName}
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1">
            Manage staff members, roles, shift schedules, assigned sections, and operational permissions.
          </p>
        </div>

        {branches.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-text-muted">Switch Branch:</span>
            <select
              value={branchId}
              onChange={(e) => {
                window.location.href = `/admin/employees?branchId=${e.target.value}`;
              }}
              className="rounded-xl border border-brand-border bg-white px-3 py-1.5 text-xs font-bold text-brand-secondary outline-none focus:border-brand-primary"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Embedded StepEmployee in settings mode */}
      <StepEmployee
        branchId={branchId}
        initialEmployees={employees}
        sections={sections}
        shifts={shifts}
        kitchens={kitchens}
        onAddEmployee={handleAddEmployee}
        onUpdateEmployee={handleUpdateEmployee}
        onToggleStatus={handleToggleStatus}
        onDeleteEmployee={handleDeleteEmployee}
        isSettingsMode={true}
      />
    </div>
  );
}
