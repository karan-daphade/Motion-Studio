import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { calculateEstimatedWaitTime } from "@/lib/waitlist/waitlist-service";

/**
 * GET /api/v1/public/waitlist/status
 * Query Params: ?device_token=<token>&entry_id=<id>&branch_id=<id>&section_id=<id>
 * Checks for an existing active (WAITING or TABLE_ASSIGNED) entry matching the device or ID.
 * User Story 15.3 (Updated).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceToken = searchParams.get("device_token");
    const entryId = searchParams.get("entry_id") || searchParams.get("id");
    const sectionId = searchParams.get("section_id");
    const restaurantId = searchParams.get("restaurant_id");
    let branchId = searchParams.get("branch_id") || restaurantId;

    if (!deviceToken && !entryId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: device_token or entry_id" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // If branchId was not provided, attempt to derive it from sectionId
    if (!branchId && sectionId) {
      try {
        const { data: sec } = await supabase
          .from("sections")
          .select("branch_id")
          .eq("id", sectionId)
          .maybeSingle();
        if (sec?.branch_id) {
          branchId = sec.branch_id;
        }
      } catch {}
    }

    let isWaitingListTableMissing = false;
    let isQueueEntriesTableMissing = false;
    let matchedEntry: any = null;

    // Tier 1: Query waiting_list_entries
    try {
      const selectCols = `
        id,
        branch_id,
        section_id,
        queue_token,
        customer_name,
        mobile_number,
        guest_count,
        special_request,
        notes,
        status,
        device_token,
        assigned_table_id,
        assigned_table_label,
        assigned_merged_group_id,
        created_at,
        assigned_at
      `;

      // 1. If entryId is provided, look for exact ID match first
      if (entryId) {
        let idQuery = supabase
          .from("waiting_list_entries")
          .select(selectCols)
          .eq("id", entryId);

        if (sectionId) idQuery = idQuery.eq("section_id", sectionId);
        else if (branchId) idQuery = idQuery.eq("branch_id", branchId);

        const { data: idEntries, error: idErr } = await idQuery.maybeSingle();
        if (idErr && (idErr.message?.includes("table") || idErr.message?.includes("schema cache"))) {
          isWaitingListTableMissing = true;
        } else if (idEntries) {
          matchedEntry = idEntries;
        }
      }

      // 2. If no entry found yet and deviceToken is provided, look for ACTIVE entry first
      if (!isWaitingListTableMissing && !matchedEntry && deviceToken) {
        let actQuery = supabase
          .from("waiting_list_entries")
          .select(selectCols)
          .eq("device_token", deviceToken)
          .in("status", ["WAITING", "waiting", "TABLE_ASSIGNED", "assigned", "SEATED", "seated"]);

        if (sectionId) actQuery = actQuery.eq("section_id", sectionId);
        else if (branchId) actQuery = actQuery.eq("branch_id", branchId);

        const { data: actEntries, error: actErr } = await actQuery.order("created_at", { ascending: false }).limit(1);
        if (actErr && (actErr.message?.includes("table") || actErr.message?.includes("schema cache"))) {
          isWaitingListTableMissing = true;
        } else if (actEntries && actEntries.length > 0) {
          matchedEntry = actEntries[0];
        }

        // 3. If no active entry, check if the most recent entry was terminal (NO_SHOW / REMOVED)
        if (!isWaitingListTableMissing && !matchedEntry) {
          let recQuery = supabase
            .from("waiting_list_entries")
            .select(selectCols)
            .eq("device_token", deviceToken);

          if (sectionId) recQuery = recQuery.eq("section_id", sectionId);
          else if (branchId) recQuery = recQuery.eq("branch_id", branchId);

          const { data: recEntries, error: recErr } = await recQuery.order("created_at", { ascending: false }).limit(1);
          if (!recErr && recEntries && recEntries.length > 0) {
            matchedEntry = recEntries[0];
          }
        }
      }
    } catch {
      isWaitingListTableMissing = true;
    }

    // Tier 2: Query queue_entries
    if (!matchedEntry) {
      try {
        const qeSelectCols = `
          id,
          branch_id,
          section_id,
          token_number,
          queue_number,
          customer_name,
          guest_name,
          phone,
          guest_mobile,
          party_size,
          status,
          device_token,
          assigned_table_id,
          assigned_table_label,
          created_at
        `;

        if (entryId) {
          let qeIdQuery = supabase
            .from("queue_entries")
            .select(qeSelectCols)
            .eq("id", entryId);

          if (sectionId) qeIdQuery = qeIdQuery.eq("section_id", sectionId);
          else if (branchId) qeIdQuery = qeIdQuery.eq("branch_id", branchId);

          const { data: qeIdData, error: qeIdErr } = await qeIdQuery.maybeSingle();
          if (qeIdErr && (qeIdErr.message?.includes("table") || qeIdErr.message?.includes("schema cache"))) {
            isQueueEntriesTableMissing = true;
          } else if (qeIdData) {
            matchedEntry = {
              id: qeIdData.id,
              branch_id: qeIdData.branch_id,
              section_id: qeIdData.section_id,
              queue_token: qeIdData.token_number || qeIdData.queue_number,
              customer_name: qeIdData.customer_name || qeIdData.guest_name,
              mobile_number: qeIdData.phone || qeIdData.guest_mobile,
              guest_count: qeIdData.party_size,
              special_request: null,
              status: qeIdData.status.toUpperCase() === "ASSIGNED" ? "TABLE_ASSIGNED" : qeIdData.status.toUpperCase(),
              device_token: qeIdData.device_token,
              assigned_table_id: qeIdData.assigned_table_id || null,
              assigned_table_label: qeIdData.assigned_table_label || null,
              created_at: qeIdData.created_at,
            };
          }
        }

        if (!isQueueEntriesTableMissing && !matchedEntry && deviceToken) {
          let qeActQuery = supabase
            .from("queue_entries")
            .select(qeSelectCols)
            .eq("device_token", deviceToken)
            .in("status", ["waiting", "WAITING", "assigned", "TABLE_ASSIGNED", "seated", "SEATED"]);

          if (sectionId) qeActQuery = qeActQuery.eq("section_id", sectionId);
          else if (branchId) qeActQuery = qeActQuery.eq("branch_id", branchId);

          const { data: qeActList, error: qeActErr } = await qeActQuery.order("created_at", { ascending: false }).limit(1);
          if (qeActErr && (qeActErr.message?.includes("table") || qeActErr.message?.includes("schema cache"))) {
            isQueueEntriesTableMissing = true;
          } else if (qeActList && qeActList.length > 0) {
            const qe = qeActList[0];
            matchedEntry = {
              id: qe.id,
              branch_id: qe.branch_id,
              section_id: qe.section_id,
              queue_token: qe.token_number || qe.queue_number,
              customer_name: qe.customer_name || qe.guest_name,
              mobile_number: qe.phone || qe.guest_mobile,
              guest_count: qe.party_size,
              special_request: null,
              status: qe.status.toUpperCase() === "ASSIGNED" ? "TABLE_ASSIGNED" : qe.status.toUpperCase(),
              device_token: qe.device_token,
              assigned_table_id: qe.assigned_table_id || null,
              assigned_table_label: qe.assigned_table_label || null,
              created_at: qe.created_at,
            };
          }

          if (!isQueueEntriesTableMissing && !matchedEntry) {
            let qeRecQuery = supabase
              .from("queue_entries")
              .select(qeSelectCols)
              .eq("device_token", deviceToken);

            if (sectionId) qeRecQuery = qeRecQuery.eq("section_id", sectionId);
            else if (branchId) qeRecQuery = qeRecQuery.eq("branch_id", branchId);

            const { data: qeRecList, error: qeRecErr } = await qeRecQuery.order("created_at", { ascending: false }).limit(1);
            if (!qeRecErr && qeRecList && qeRecList.length > 0) {
              const qe = qeRecList[0];
              matchedEntry = {
                id: qe.id,
                branch_id: qe.branch_id,
                section_id: qe.section_id,
                queue_token: qe.token_number || qe.queue_number,
                customer_name: qe.customer_name || qe.guest_name,
                mobile_number: qe.phone || qe.guest_mobile,
                guest_count: qe.party_size,
                special_request: null,
                status: qe.status.toUpperCase() === "ASSIGNED" ? "TABLE_ASSIGNED" : qe.status.toUpperCase(),
                device_token: qe.device_token,
                created_at: qe.created_at,
              };
            }
          }
        }
      } catch {
        isQueueEntriesTableMissing = true;
      }
    }

    // Tier 3: Query branch onboarding_progress JSONB metadata
    let branchProgress: any = null;
    if (!matchedEntry) {
      try {
        let bQuery = supabase.from("branches").select("id, onboarding_progress");
        if (branchId) {
          bQuery = bQuery.eq("id", branchId);
        }
        const { data: bList } = await bQuery.limit(10);
        if (bList) {
          for (const bData of bList) {
            if (bData?.onboarding_progress?.waitlist_entries) {
              const waitlistJson: any[] = bData.onboarding_progress.waitlist_entries;
              const reversed = [...waitlistJson].reverse(); // Search newest first!

              // 1. If entryId is provided, look for exact ID match
              if (entryId) {
                const foundById = reversed.find((w: any) => {
                  if (sectionId && w.section_id && w.section_id !== sectionId) return false;
                  return w.id === entryId;
                });
                if (foundById) {
                  matchedEntry = foundById;
                  branchProgress = bData.onboarding_progress;
                  if (!branchId) branchId = bData.id;
                  break;
                }
              }

              // 2. Look for ACTIVE entry for this device (newest to oldest)
              if (deviceToken) {
                const activeFound = reversed.find((w: any) => {
                  if (sectionId && w.section_id && w.section_id !== sectionId) return false;
                  if (w.device_token !== deviceToken) return false;
                  const st = (w.status || "").toUpperCase();
                  return st === "WAITING" || st === "TABLE_ASSIGNED" || st === "SEATED";
                });

                if (activeFound) {
                  matchedEntry = activeFound;
                  branchProgress = bData.onboarding_progress;
                  if (!branchId) branchId = bData.id;
                  break;
                }

                // 3. If no active entry exists, check the MOST RECENT entry for this device
                const recentFound = reversed.find((w: any) => {
                  if (sectionId && w.section_id && w.section_id !== sectionId) return false;
                  return w.device_token === deviceToken;
                });

                if (recentFound) {
                  matchedEntry = recentFound;
                  branchProgress = bData.onboarding_progress;
                  if (!branchId) branchId = bData.id;
                  break;
                }
              }
            }
          }
        }
      } catch {
        // branch progress fallback
      }
    }

    if (!matchedEntry) {
      return NextResponse.json({
        has_active_entry: false,
        entry: null,
      });
    }

    // Strict section boundary check: Do not restore an entry from another dining section
    if (sectionId && matchedEntry.section_id && matchedEntry.section_id !== sectionId) {
      return NextResponse.json({
        has_active_entry: false,
        entry: null,
      });
    }

    const currentStatus = (matchedEntry.status || "").toUpperCase();
    const isSeated = currentStatus === "SEATED";
    const isActive = currentStatus === "WAITING" || currentStatus === "TABLE_ASSIGNED" || isSeated;

    // If entry is terminal (NO_SHOW, REMOVED, COMPLETED), report has_active_entry: false
    if (!isActive) {
      return NextResponse.json({
        has_active_entry: false,
        terminal_status: currentStatus,
        entry: null,
      });
    }

    const isAssigned = currentStatus === "TABLE_ASSIGNED";

    // If seated, verify active dining session
    let sessionData: any = null;
    if (isSeated) {
        if (matchedEntry.assigned_table_id) {
          const { data: sessList } = await supabase
            .from("table_sessions")
            .select("id, table_id, status, opened_at, closed_at, guest_count")
            .eq("table_id", matchedEntry.assigned_table_id)
            .eq("status", "active")
            .order("opened_at", { ascending: false })
            .limit(1);

          if (sessList && sessList.length > 0) sessionData = sessList[0];
        }

      if (!sessionData && branchId) {
        try {
          const { data: bData } = await supabase
            .from("branches")
            .select("id, onboarding_progress")
            .eq("id", branchId)
            .maybeSingle();

          const sessions = (bData?.onboarding_progress as any)?.table_sessions || [];
          sessionData = sessions.find((s: any) =>
            s.waitlist_entry_id === matchedEntry.id ||
            (matchedEntry.device_token && s.primary_device_token === matchedEntry.device_token) ||
            (matchedEntry.assigned_table_id && s.table_id === matchedEntry.assigned_table_id)
          );
        } catch {}
      }

      // Check if session has ended or table is no longer occupied
      let isSessionActive = sessionData ? sessionData.status === "active" : false;

      // Verify physical table status if table_id is known
      const targetTblId = sessionData?.table_id || matchedEntry.assigned_table_id;
      if (isSessionActive && targetTblId) {
        try {
          const { data: tblData } = await supabase
            .from("tables")
            .select("status")
            .eq("id", targetTblId)
            .maybeSingle();
          if (tblData && tblData.status !== "occupied") {
            isSessionActive = false;
          }
        } catch {}
      }

      // If dining session has ended, transition entry to COMPLETED and return has_active_entry: false
      if (!isSessionActive) {
        try {
          if (branchId) {
            const { data: bData } = await supabase
              .from("branches")
              .select("id, onboarding_progress")
              .eq("id", branchId)
              .maybeSingle();

            if (bData?.onboarding_progress) {
              const curProg = bData.onboarding_progress as any;
              const wList = (curProg.waitlist_entries as any[]) || [];
              const updatedWList = wList.map((w: any) =>
                w.id === matchedEntry.id
                  ? { ...w, status: "COMPLETED", completed_at: new Date().toISOString() }
                  : w
              );
              await supabase
                .from("branches")
                .update({
                  onboarding_progress: { ...curProg, waitlist_entries: updatedWList },
                })
                .eq("id", bData.id);
            }
          }
          await supabase.from("waiting_list_entries").update({ status: "COMPLETED" }).eq("id", matchedEntry.id);
          await supabase.from("queue_entries").update({ status: "COMPLETED" }).eq("id", matchedEntry.id);
        } catch {}

        return NextResponse.json({
          has_active_entry: false,
          terminal_status: "COMPLETED",
          entry: null,
        });
      }
    }

    let position = 1;
    if (!isAssigned && !isSeated) {
      // Calculate current position: count of records with status = 'WAITING' in same section created before this record + 1
      if (!isWaitingListTableMissing) {
        let posQuery = supabase
          .from("waiting_list_entries")
          .select("id", { count: "exact", head: true })
          .in("status", ["WAITING", "waiting"])
          .lt("created_at", matchedEntry.created_at);

        if (matchedEntry.section_id) {
          posQuery = posQuery.eq("section_id", matchedEntry.section_id);
        } else if (matchedEntry.branch_id) {
          posQuery = posQuery.eq("branch_id", matchedEntry.branch_id);
        }

        const { count, error } = await posQuery;
        if (!error) {
          position = (count || 0) + 1;
        } else {
          isWaitingListTableMissing = true;
        }
      }

      if (isWaitingListTableMissing && !isQueueEntriesTableMissing) {
        let posQuery = supabase
          .from("queue_entries")
          .select("id", { count: "exact", head: true })
          .in("status", ["waiting", "WAITING"])
          .lt("created_at", matchedEntry.created_at);

        if (matchedEntry.section_id) {
          posQuery = posQuery.eq("section_id", matchedEntry.section_id);
        } else if (matchedEntry.branch_id) {
          posQuery = posQuery.eq("branch_id", matchedEntry.branch_id);
        }

        const { count, error } = await posQuery;
        if (!error) {
          position = (count || 0) + 1;
        } else {
          isQueueEntriesTableMissing = true;
        }
      }

      if (isWaitingListTableMissing && isQueueEntriesTableMissing && branchProgress?.waitlist_entries) {
        const ahead = (branchProgress.waitlist_entries as any[]).filter(
          (w) =>
            w.section_id === matchedEntry.section_id &&
            w.status === "WAITING" &&
            new Date(w.created_at) < new Date(matchedEntry.created_at)
        );
        position = ahead.length + 1;
      }
    } else {
      position = 0;
    }

    const estimatedWaitMinutes = (isAssigned || isSeated) ? 0 : calculateEstimatedWaitTime(position);

    // 2. Log WAITLIST_ENTRY_RESTORED milestone to activity log
    try {
      await supabase.from("waiting_list_activity_logs").insert({
        waiting_list_entry_id: matchedEntry.id,
        event_type: "WAITLIST_ENTRY_RESTORED",
        actor_name: "Customer Device",
        note: `Customer restored active queue session: Token ${matchedEntry.queue_token} (Position #${position})`,
      });
    } catch {
      // Non-blocking telemetry
    }

    return NextResponse.json({
      has_active_entry: true,
      is_seated: isSeated,
      session: sessionData
        ? {
            id: sessionData.id,
            table_id: sessionData.table_id || matchedEntry.assigned_table_id || null,
            table_label: sessionData.table_label || matchedEntry.assigned_table_label || "Table",
            customer_name: sessionData.customer_name || matchedEntry.customer_name,
            guest_count: sessionData.guest_count || matchedEntry.guest_count,
            started_at:
              sessionData.opened_at ||
              sessionData.created_at ||
              matchedEntry.seated_at ||
              matchedEntry.created_at,
          }
        : null,
      entry: {
        id: matchedEntry.id,
        section_id: matchedEntry.section_id || sectionId || null,
        token_number: matchedEntry.queue_token,
        guest_name: matchedEntry.customer_name,
        party_size: matchedEntry.guest_count,
        special_request: matchedEntry.special_request || matchedEntry.notes || null,
        position,
        parties_ahead: isAssigned || isSeated ? 0 : Math.max(0, position - 1),
        estimated_wait_minutes: estimatedWaitMinutes,
        status: isSeated ? "SEATED" : isAssigned ? "TABLE_ASSIGNED" : "WAITING",
        assigned_table_id: sessionData?.table_id || matchedEntry.assigned_table_id || null,
        assigned_table_label: matchedEntry.assigned_table_label || null,
        assigned_at: matchedEntry.assigned_at || null,
        seated_at: matchedEntry.seated_at || null,
        created_at: matchedEntry.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
