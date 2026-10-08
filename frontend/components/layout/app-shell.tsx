"use client";

import React, { useState } from "react";
import BrandHeader from "@/components/brand/brand-header";
import AppSidebar, { BranchOption } from "./app-sidebar";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    id: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  branches?: BranchOption[];
  currentBranch?: {
    id: string;
    name: string;
    status: string;
  } | null;
  roleName?: string;
  showBackToHub?: boolean;
}

export default function AppShell({
  children,
  user,
  branches = [],
  currentBranch,
  roleName = "Admin",
  showBackToHub = true,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      {/* Sticky Master Header */}
      <BrandHeader
        roleName={roleName}
        userEmail={user?.email || "owner@bharatqr.internal"}
        userName={displayName}
        currentBranch={currentBranch?.name}
        showBackToHub={showBackToHub}
        hasActiveBranch={true}
        onMobileMenuToggle={() => setIsSidebarOpen(true)}
      />

      <div className="flex flex-1 relative">
        {/* App Sidebar (Persistent on Desktop, Slide-over on Mobile) */}
        <AppSidebar
          branches={branches}
          currentBranchId={currentBranch?.id}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-200 min-w-0 ${
            isCollapsed ? "md:pl-16" : "md:pl-64"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
