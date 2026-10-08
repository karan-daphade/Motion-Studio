"use server";

import { headers } from "next/headers";
import { cookies } from "next/headers";
import { 
  AdminSignupSchema, 
  OtpVerifySchema, 
  PasswordSetupSchema, 
  AdminLoginSchema, 
  ForgotPasswordRequestSchema,
  ResetPasswordSchema,
  type AdminSignupInput,
  type OtpVerifyInput,
  type PasswordSetupInput,
  type AdminLoginInput,
} from "@/lib/auth/schemas";
import { 
  generateNumericOtp, 
  generateSecureToken, 
  hashSecret, 
  timingSafeCompare, 
  hashPassword, 
  verifyPassword, 
  checkRateLimit, 
  logAuthEvent, 
  dispatchSmsOtp 
} from "@/lib/auth/auth-service";
import { 
  sendEmail, 
  renderOtpEmail, 
  renderPasswordLinkEmail, 
  renderLockoutAlertEmail 
} from "@/lib/auth/mailer";
import { createServiceRoleClient } from "@/lib/supabase/admin";

async function getClientIpAndUa() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : headerList.get("x-real-ip") || "127.0.0.1";
  const userAgent = headerList.get("user-agent") || "unknown";
  return { ip, userAgent };
}

/**
 * 1. INITIATE ADMIN SIGN UP
 */
export async function initiateAdminSignup(rawInput: AdminSignupInput) {
  const { ip, userAgent } = await getClientIpAndUa();

  // Server-side Zod validation
  const parseResult = AdminSignupSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { 
      success: false, 
      error: parseResult.error.issues[0]?.message || "Validation failed." 
    };
  }

  const data = parseResult.data;

  // Rate limit: 5 signups per 15 minutes per IP and email
  const rateCheck = checkRateLimit("signup", ip, data.businessEmail, 5, 900);
  if (!rateCheck.allowed) {
    return { 
      success: false, 
      error: `Too many sign-up attempts. Please try again in ${rateCheck.remainingTime} seconds.` 
    };
  }

  const supabase = createServiceRoleClient();

  // Check if active user already exists with this email
  const { data: existingUser } = await supabase
    .from("users")
    .select("id, status")
    .eq("email", data.businessEmail)
    .maybeSingle();

  if (existingUser && existingUser.status === "active") {
    // Avoid leaking, but guide them to login
    return {
      success: false,
      error: "An account with this business email is already registered. Please proceed to login.",
    };
  }

  // Generate 6-digit OTP & cryptographic SHA-256 hash
  const otp = generateNumericOtp();
  const otpHash = hashSecret(otp);
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5-minute expiry

  // Upsert or clean previous pending registration for this email
  await supabase
    .from("pending_admins")
    .delete()
    .eq("business_email", data.businessEmail);

  const { error: insertError } = await supabase
    .from("pending_admins")
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      gender: data.gender || null,
      date_of_birth: data.dateOfBirth || null,
      languages_spoken: data.languagesSpoken || [],
      restaurant_name: data.restaurantName,
      country: data.country,
      state: data.state,
      district: data.district,
      address: data.address,
      pin_code: data.pinCode,
      total_branches: data.totalBranches,
      reference_code: data.referenceCode || null,
      mobile_number: data.mobileNumber,
      business_email: data.businessEmail,
      website: data.website || null,
      otp_hash: otpHash,
      otp_expires_at: otpExpiresAt,
      otp_attempts: 0,
      resend_count: 0,
      last_resend_at: new Date().toISOString(),
    });

  if (insertError) {
    console.error("[SIGNUP ERROR] Database insert failed:", insertError);
    return { success: false, error: "Unable to process registration at this time." };
  }

  // Dispatch OTP via Gmail SMTP
  const emailResult = await sendEmail({
    to: data.businessEmail,
    subject: "Your BharatQR Verification Code",
    html: renderOtpEmail(otp, data.firstName),
  });

  // Mock SMS OTP dispatch if configured
  await dispatchSmsOtp(data.mobileNumber, otp);

  await logAuthEvent({
    ip,
    userAgent,
    eventType: "signup_initiated",
  });

  return { 
    success: true, 
    email: data.businessEmail,
    simulated: emailResult.simulated 
  };
}

/**
 * 2. VERIFY OTP (Signup or Forgot Password)
 */
export async function verifyOtp(rawInput: OtpVerifyInput) {
  const { ip, userAgent } = await getClientIpAndUa();

  const parseResult = OtpVerifySchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { 
      success: false, 
      error: parseResult.error.issues[0]?.message || "Invalid OTP verification payload." 
    };
  }

  const { email, otp, context } = parseResult.data;

  // Rate limit: 10 attempts per 10 minutes per IP
  const rateCheck = checkRateLimit("verify_otp", ip, email, 10, 600);
  if (!rateCheck.allowed) {
    return { 
      success: false, 
      error: `Too many verification attempts. Please wait ${rateCheck.remainingTime} seconds.` 
    };
  }

  const supabase = createServiceRoleClient();

  if (context === "signup") {
    const { data: pending, error: fetchError } = await supabase
      .from("pending_admins")
      .select("*")
      .eq("business_email", email)
      .maybeSingle();

    if (fetchError || !pending) {
      return { success: false, error: "Verification session not found. Please sign up again." };
    }

    // Check expiry
    if (new Date(pending.otp_expires_at).getTime() < Date.now()) {
      return { success: false, error: "Verification code has expired. Please request a new one." };
    }

    // Check attempt limit (max 5)
    if (pending.otp_attempts >= 5) {
      return { 
        success: false, 
        error: "Maximum verification attempts exceeded. Please request a new verification code." 
      };
    }

    // Constant-time comparison or Mock SMS code
    const isMockSms = process.env.MOCK_SMS_OTP === "true" && otp === "909090";
    const isValidOtp = isMockSms || timingSafeCompare(otp, pending.otp_hash);

    if (!isValidOtp) {
      await supabase
        .from("pending_admins")
        .update({ otp_attempts: pending.otp_attempts + 1 })
        .eq("id", pending.id);

      await logAuthEvent({
        ip,
        userAgent,
        eventType: "otp_failed",
      });

      const remaining = 5 - (pending.otp_attempts + 1);
      return { 
        success: false, 
        error: `Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}` 
      };
    }

    // OTP Verified! Create / Update user record
    let userId: string;

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      userId = existingUser.id;
      await supabase
        .from("users")
        .update({
          first_name: pending.first_name,
          last_name: pending.last_name,
          gender: pending.gender || null,
          date_of_birth: pending.date_of_birth || null,
          languages_spoken: pending.languages_spoken || [],
          business_name: pending.restaurant_name,
          email_verified: true,
          phone: pending.mobile_number,
          phone_verified: isMockSms,
          status: "pending",
          role: "admin",
        })
        .eq("id", userId);
    } else {
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          first_name: pending.first_name,
          last_name: pending.last_name,
          gender: pending.gender || null,
          date_of_birth: pending.date_of_birth || null,
          languages_spoken: pending.languages_spoken || [],
          business_name: pending.restaurant_name,
          email: pending.business_email,
          email_verified: true,
          phone: pending.mobile_number,
          phone_verified: isMockSms,
          status: "pending",
          role: "admin",
        })
        .select("id")
        .single();

      if (createError || !newUser) {
        console.error("[USER CREATION ERROR]", createError);
        return { success: false, error: "Failed to initialize owner profile." };
      }
      userId = newUser.id;
    }

    // Also create the restaurant entity if not already present
    const { data: existingRestaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (!existingRestaurant) {
      await supabase.from("restaurants").insert({
        owner_user_id: userId,
        name: pending.restaurant_name,
        subscription_status: "trial",
      });
    }

    // Generate single-use 30-minute password setup token
    const setupToken = generateSecureToken();
    const tokenHash = hashSecret(setupToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await supabase.from("password_setup_tokens").insert({
      user_id: userId,
      token_hash: tokenHash,
      token_type: "initial_setup",
      expires_at: expiresAt,
    });

    // Clean up pending registration
    await supabase.from("pending_admins").delete().eq("id", pending.id);

    // Send single-use password setup link via Gmail SMTP
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const setupUrl = `${appUrl}/admin/setup-password?token=${setupToken}`;

    await sendEmail({
      to: email,
      subject: "Complete Your BharatQR Account Password Setup",
      html: renderPasswordLinkEmail(setupUrl, false, pending.first_name),
    });

    await logAuthEvent({
      userId,
      ip,
      userAgent,
      eventType: "otp_verified",
    });

    return { 
      success: true, 
      token: setupToken, 
      redirectUrl: `/admin/setup-password?token=${setupToken}` 
    };
  } 
  
  if (context === "forgot_password") {
    // Forgot password OTP flow
    const { data: user } = await supabase
      .from("users")
      .select("id, first_name")
      .eq("email", email)
      .maybeSingle();

    if (!user) {
      return { success: false, error: "Invalid verification request." };
    }

    const { data: pending } = await supabase
      .from("pending_admins")
      .select("*")
      .eq("business_email", email)
      .maybeSingle();

    if (!pending || new Date(pending.otp_expires_at).getTime() < Date.now() || pending.otp_attempts >= 5) {
      return { success: false, error: "Invalid or expired reset code. Please request a new one." };
    }

    const isMockSms = process.env.MOCK_SMS_OTP === "true" && otp === "909090";
    const isValidOtp = isMockSms || timingSafeCompare(otp, pending.otp_hash);

    if (!isValidOtp) {
      await supabase
        .from("pending_admins")
        .update({ otp_attempts: pending.otp_attempts + 1 })
        .eq("id", pending.id);

      return { success: false, error: "Invalid verification code. Please check and try again." };
    }

    // Generate single-use reset token
    const resetToken = generateSecureToken();
    const tokenHash = hashSecret(resetToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await supabase.from("password_setup_tokens").insert({
      user_id: user.id,
      token_hash: tokenHash,
      token_type: "password_reset",
      expires_at: expiresAt,
    });

    await supabase.from("pending_admins").delete().eq("id", pending.id);

    return {
      success: true,
      token: resetToken,
      redirectUrl: `/admin/setup-password?token=${resetToken}&reset=true`,
    };
  }

  return { success: false, error: "Unknown verification context." };
}

/**
 * 3. RESEND OTP (120-second cooldown, 5/hr cap)
 */
export async function resendOtp(email: string, context: "signup" | "forgot_password" = "signup") {
  const { ip, userAgent } = await getClientIpAndUa();

  if (!email || !email.includes("@")) {
    return { success: false, error: "Valid email is required to resend code." };
  }

  const supabase = createServiceRoleClient();

  const { data: pending } = await supabase
    .from("pending_admins")
    .select("*")
    .eq("business_email", email)
    .maybeSingle();

  if (!pending) {
    return { success: false, error: "No pending verification found. Please start over." };
  }

  const now = Date.now();
  const lastResend = new Date(pending.last_resend_at).getTime();
  const secondsSinceLast = Math.floor((now - lastResend) / 1000);

  // 120-second resend cooldown
  if (secondsSinceLast < 120) {
    const waitTime = 120 - secondsSinceLast;
    await logAuthEvent({ ip, userAgent, eventType: "otp_cooldown_blocked" });
    return { 
      success: false, 
      error: `Please wait ${waitTime} seconds before requesting another code.` 
    };
  }

  // 5 resends per hour cap
  if (pending.resend_count >= 5) {
    return { 
      success: false, 
      error: "Maximum hourly resend limit reached. Please try again later." 
    };
  }

  const newOtp = generateNumericOtp();
  const newOtpHash = hashSecret(newOtp);
  const newExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await supabase
    .from("pending_admins")
    .update({
      otp_hash: newOtpHash,
      otp_expires_at: newExpiresAt,
      otp_attempts: 0,
      resend_count: pending.resend_count + 1,
      last_resend_at: new Date().toISOString(),
    })
    .eq("id", pending.id);

  // Dispatch new code
  await sendEmail({
    to: email,
    subject: "Your New BharatQR Verification Code",
    html: renderOtpEmail(newOtp, pending.first_name || "Owner"),
  });

  await dispatchSmsOtp(pending.mobile_number, newOtp);

  await logAuthEvent({ ip, userAgent, eventType: "otp_sent" });

  return { success: true };
}

/**
 * 4. COMPLETE PASSWORD SETUP / RESET
 */
export async function completePasswordSetup(rawInput: PasswordSetupInput) {
  const { ip, userAgent } = await getClientIpAndUa();

  const parseResult = PasswordSetupSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { 
      success: false, 
      error: parseResult.error.issues[0]?.message || "Invalid password setup requirements." 
    };
  }

  const { token, username, password } = parseResult.data;
  const tokenHash = hashSecret(token);

  const supabase = createServiceRoleClient();

  // Validate single-use token
  const { data: tokenRecord, error: tokenError } = await supabase
    .from("password_setup_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .maybeSingle();

  if (tokenError || !tokenRecord) {
    return { 
      success: false, 
      error: "This setup link is invalid or has already been used. Please request a new link." 
    };
  }

  if (new Date(tokenRecord.expires_at).getTime() < Date.now()) {
    return { 
      success: false, 
      error: "This setup link has expired (30-minute limit). Please request a new link." 
    };
  }

  // Check if username is already taken by another user
  const { data: existingUsername } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .neq("id", tokenRecord.user_id)
    .maybeSingle();

  if (existingUsername) {
    return { success: false, error: "This username is already taken. Please choose another." };
  }

  // Hash password using bcrypt
  const passwordHash = await hashPassword(password);

  // Update user credentials & activate account
  const { error: updateError } = await supabase
    .from("users")
    .update({
      username,
      password_hash: passwordHash,
      status: "active",
      failed_login_count: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tokenRecord.user_id);

  if (updateError) {
    console.error("[PASSWORD SETUP ERROR]", updateError);
    return { success: false, error: "Failed to update account security." };
  }

  // Mark token as used
  await supabase
    .from("password_setup_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", tokenRecord.id);

  // If this was a password reset, invalidate all other active sessions for this user
  if (tokenRecord.token_type === "password_reset") {
    await supabase
      .from("auth_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", tokenRecord.user_id)
      .is("revoked_at", null);

    await logAuthEvent({
      userId: tokenRecord.user_id,
      ip,
      userAgent,
      eventType: "password_reset_completed",
    });
  } else {
    await logAuthEvent({
      userId: tokenRecord.user_id,
      ip,
      userAgent,
      eventType: "password_setup_completed",
    });
  }

  return { success: true };
}

/**
 * 5. ADMIN LOGIN WITH ACCOUNT LOCKOUT & SESSION ISSUE
 */
export async function loginAdmin(rawInput: AdminLoginInput) {
  const { ip, userAgent } = await getClientIpAndUa();

  const parseResult = AdminLoginSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { 
      success: false, 
      error: "Please provide valid credentials." 
    };
  }

  const { identifier, password, rememberDevice } = parseResult.data;

  // Rate limit: 10 attempts per 30 minutes per IP & Identifier
  const rateCheck = checkRateLimit("login", ip, identifier, 10, 1800);
  if (!rateCheck.allowed) {
    return { 
      success: false, 
      error: `Too many login attempts. Please wait ${rateCheck.remainingTime} seconds.` 
    };
  }

  const supabase = createServiceRoleClient();

  // Look up user by username or email
  const isEmail = identifier.includes("@");
  const query = supabase
    .from("users")
    .select("id, first_name, email, username, password_hash, status, failed_login_count, locked_until, role")
    .eq("role", "admin");

  const { data: user } = isEmail 
    ? await query.eq("email", identifier.toLowerCase()).maybeSingle()
    : await query.eq("username", identifier).maybeSingle();

  // If user does not exist, perform dummy bcrypt compare to prevent timing enumeration
  if (!user || !user.password_hash) {
    await verifyPassword("dummy-password-check-against-timing", "$2a$12$e8Y6b44h/0XqXN1aK6nKfej4e5d6f7g8h9i0j1k2l3m4n5o6p7q8r");
    return { 
      success: false, 
      error: "Invalid credentials. Please verify your username/email and password." 
    };
  }

  const now = Date.now();

  // Check 30-minute lockout status
  if (user.locked_until && new Date(user.locked_until).getTime() > now) {
    const minutesRemaining = Math.ceil((new Date(user.locked_until).getTime() - now) / 60000);
    return {
      success: false,
      error: `Account is temporarily locked due to excessive failed attempts. Please try again in ${minutesRemaining} minutes or use Forgot Password.`,
    };
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    const newFailedCount = (user.failed_login_count || 0) + 1;
    const isNowLocked = newFailedCount >= 10;
    const lockedUntil = isNowLocked ? new Date(now + 30 * 60 * 1000).toISOString() : null;

    await supabase
      .from("users")
      .update({
        failed_login_count: newFailedCount,
        locked_until: lockedUntil,
        status: isNowLocked ? "locked" : user.status,
      })
      .eq("id", user.id);

    if (isNowLocked) {
      // Send security alert email
      await sendEmail({
        to: user.email,
        subject: "Security Alert: Your BharatQR Account Has Been Locked",
        html: renderLockoutAlertEmail(user.first_name || "Owner"),
      });

      await logAuthEvent({
        userId: user.id,
        ip,
        userAgent,
        eventType: "account_locked",
      });

      return {
        success: false,
        error: "Account locked for 30 minutes due to 10 consecutive failed login attempts. A security email has been sent.",
      };
    }

    await logAuthEvent({
      userId: user.id,
      ip,
      userAgent,
      eventType: "login_failed",
    });

    return { 
      success: false, 
      error: "Invalid credentials. Please verify your username/email and password." 
    };
  }

  // SUCCESSFUL LOGIN
  // Reset failed login counts and update last_login_at
  await supabase
    .from("users")
    .update({
      failed_login_count: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  // Check if admin has at least one branch that has completed all 7 onboarding steps
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  let hasCompletedAllSteps = false;
  if (restaurant) {
    const { data: branches } = await supabase
      .from("branches")
      .select("id, status, onboarding_progress")
      .eq("restaurant_id", restaurant.id);

    if (branches && branches.length > 0) {
      hasCompletedAllSteps = branches.some((b) => {
        if (b.status === "active") return true;
        const progress = b.onboarding_progress;
        if (progress && Array.isArray(progress.completed_steps)) {
          // Completed steps 1 through 7
          return [1, 2, 3, 4, 5, 6, 7].every((step) => progress.completed_steps.includes(step));
        }
        return false;
      });
    }
  }

  // Issue secure session cookie
  const sessionToken = generateSecureToken();
  const sessionTokenHash = hashSecret(sessionToken);
  const sessionDurationDays = rememberDevice ? 30 : 1;
  const expiresAt = new Date(now + sessionDurationDays * 24 * 60 * 60 * 1000);

  await supabase.from("auth_sessions").insert({
    user_id: user.id,
    device_name: userAgent.slice(0, 250),
    ip: ip.slice(0, 45),
    refresh_token_hash: sessionTokenHash,
    expires_at: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set({
    name: "bharatqr_admin_session",
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  await logAuthEvent({
    userId: user.id,
    ip,
    userAgent,
    eventType: "login_success",
  });

  return {
    success: true,
    redirectTo: hasCompletedAllSteps ? "/admin" : "/admin/onboarding",
  };
}

/**
 * 6. FORGOT PASSWORD REQUEST
 */
export async function initiateForgotPassword(email: string) {
  const { ip, userAgent } = await getClientIpAndUa();

  const parseResult = ForgotPasswordRequestSchema.safeParse({ email });
  if (!parseResult.success) {
    return { success: false, error: "Please provide a valid email address." };
  }

  const cleanEmail = parseResult.data.email;

  // Rate limit: 3 forgot password requests per 15 minutes
  const rateCheck = checkRateLimit("forgot_password", ip, cleanEmail, 3, 900);
  if (!rateCheck.allowed) {
    return { 
      success: false, 
      error: `Too many password reset requests. Please try again in ${rateCheck.remainingTime} seconds.` 
    };
  }

  const supabase = createServiceRoleClient();

  const { data: user } = await supabase
    .from("users")
    .select("id, first_name, email, phone")
    .eq("email", cleanEmail)
    .maybeSingle();

  // To prevent user enumeration, always respond with success message
  if (user) {
    const otp = generateNumericOtp();
    const otpHash = hashSecret(otp);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await supabase
      .from("pending_admins")
      .delete()
      .eq("business_email", cleanEmail);

    await supabase.from("pending_admins").insert({
      first_name: user.first_name || "Owner",
      last_name: "",
      restaurant_name: "Reset Request",
      country: "India",
      state: "N/A",
      district: "N/A",
      address: "N/A",
      pin_code: "000000",
      total_branches: 1,
      mobile_number: user.phone || "0000000000",
      business_email: cleanEmail,
      otp_hash: otpHash,
      otp_expires_at: otpExpiresAt,
      otp_attempts: 0,
      resend_count: 0,
      last_resend_at: new Date().toISOString(),
    });

    await sendEmail({
      to: cleanEmail,
      subject: "BharatQR Password Reset Code",
      html: renderOtpEmail(otp, user.first_name || "Owner"),
    });

    await logAuthEvent({
      userId: user.id,
      ip,
      userAgent,
      eventType: "forgot_password_initiated",
    });
  }

  return {
    success: true,
    message: "If an account exists with this email, a 6-digit verification code has been dispatched.",
  };
}

/**
 * 7. LOGOUT ADMIN
 */
export async function logoutAdmin() {
  const { ip, userAgent } = await getClientIpAndUa();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("bharatqr_admin_session")?.value;

  let userId: string | null = null;
  if (sessionToken) {
    const tokenHash = hashSecret(sessionToken);
    const supabase = createServiceRoleClient();

    const { data: session } = await supabase
      .from("auth_sessions")
      .select("user_id")
      .eq("refresh_token_hash", tokenHash)
      .maybeSingle();

    if (session) {
      userId = session.user_id;
    }

    await supabase
      .from("auth_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("refresh_token_hash", tokenHash);
  }

  await logAuthEvent({
    userId,
    ip,
    userAgent,
    eventType: "logout",
  });

  cookieStore.delete("bharatqr_admin_session");
  return { success: true };
}
