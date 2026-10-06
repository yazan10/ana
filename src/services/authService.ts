import { User, AccountType } from "../types";
import { INITIAL_USERS } from "../data/mockAdminData";

export interface StoredUserAccount extends User {
  password: string; // Plain/encrypted representation for local auth
  lastLogin?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  workshopName?: string;
  accountType?: AccountType;
  nationality?: string;
  country?: string;
  city?: string;
  village?: string;
  workPerimeter?: string;
  activatePublisherNow?: boolean;
  verifyBlueBadgeNow?: boolean;
  plan?: "Free Trial" | "Pro Technician" | "VIP Workshop";
}

const STORAGE_USERS_KEY = "gd_gsm_registered_accounts_v2";
const STORAGE_CURRENT_USER_KEY = "gd_gsm_current_user_v2";

// Default seeded accounts with default password: "password123"
const DEFAULT_SEEDED_ACCOUNTS: StoredUserAccount[] = [
  ...INITIAL_USERS.map((u) => ({
    ...u,
    password: "password123",
    lastLogin: "2025-01-10 14:20:00",
  })),
  {
    id: "usr_admin_001",
    name: "م. عبد الله المدير (Admin GD)",
    email: "admin@gd-gsm.com",
    phone: "+966 50 999 8888",
    workshopName: "GD GSM Master HQ Lab",
    role: "admin",
    accountType: "publisher",
    nationality: "سعودي",
    country: "المملكة العربية السعودية",
    city: "جدة",
    village: "حي الروضة",
    workPerimeter: "كامل المحافظة والمدن المجاورة (30 كم)",
    isPublisherActive: true,
    publisherExpiresAt: "2026-12-31",
    isBlueBadgeVerified: true,
    blueBadgeExpiresAt: "2026-12-31",
    dailyPublishedCount: 22,
    lastPublishDate: new Date().toISOString().split("T")[0],
    plan: "VIP Workshop",
    credits: 99999,
    joinedDate: "2023-01-01",
    status: "active",
    password: "admin123",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "usr_demo_publisher",
    name: "م. أحمد المهندس (ناشر معتمد)",
    email: "publisher@gd-gsm.com",
    phone: "+966 50 111 2233",
    workshopName: "مركز الشفاء لصيانة وبرمجة الهواتف",
    role: "technician",
    accountType: "publisher",
    nationality: "سعودي",
    country: "المملكة العربية السعودية",
    city: "الرياض",
    village: "حي النسيم الشرقي",
    workPerimeter: "15 كم (محيط المدينة والقرى المجاورة)",
    isPublisherActive: true,
    publisherExpiresAt: "2026-12-31",
    isBlueBadgeVerified: false, // غير موثق بالشارة لاختبار الحد 10 خدمات
    dailyPublishedCount: 8,
    lastPublishDate: new Date().toISOString().split("T")[0],
    plan: "Pro Technician",
    credits: 250,
    joinedDate: "2025-01-01",
    status: "active",
    password: "123456",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "usr_demo_verified",
    name: "م. زياد الحلبي (موثق بالشارة الزرقاء ✓)",
    email: "vip.tech@gd-gsm.com",
    phone: "+963 933 555 444",
    workshopName: "مؤسسة النجم للحلول البرمجية والهاردوير",
    role: "technician",
    accountType: "publisher",
    nationality: "سوري",
    country: "الأردن",
    city: "عمان",
    village: "حي الجبيهة",
    workPerimeter: "كامل العاصمة والمحافظات المجاورة (50 كم)",
    isPublisherActive: true,
    publisherExpiresAt: "2026-12-31",
    isBlueBadgeVerified: true, // موثق بالشارة الزرقاء نشر لا نهائي
    blueBadgeExpiresAt: "2026-12-31",
    dailyPublishedCount: 19,
    lastPublishDate: new Date().toISOString().split("T")[0],
    plan: "VIP Workshop",
    credits: 1200,
    joinedDate: "2024-02-14",
    status: "active",
    password: "123456",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "usr_demo_client",
    name: "سالم المنصور (حساب مستخدم عادي)",
    email: "user@gd-gsm.com",
    phone: "+966 54 333 7777",
    workshopName: "عميل طالب صيانة",
    role: "user",
    accountType: "user", // مستخدم عادي
    nationality: "سعودي",
    country: "المملكة العربية السعودية",
    city: "الدمام",
    village: "حي الشاطئ",
    workPerimeter: "5 كم (محلي داخل الحي)",
    isPublisherActive: false,
    isBlueBadgeVerified: false,
    dailyPublishedCount: 0,
    plan: "Free Trial",
    credits: 20,
    joinedDate: "2025-02-01",
    status: "active",
    password: "123456",
    lastLogin: new Date().toISOString(),
  },
];

class AuthService {
  private users: StoredUserAccount[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const raw = localStorage.getItem(STORAGE_USERS_KEY);
      if (raw) {
        this.users = JSON.parse(raw);
      } else {
        this.users = [...DEFAULT_SEEDED_ACCOUNTS];
        this.saveUsers();
      }
    } catch {
      this.users = [...DEFAULT_SEEDED_ACCOUNTS];
    }
  }

  private saveUsers() {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(this.users));
    } catch (e) {
      console.error("Failed to save users database to localStorage", e);
    }
  }

  /**
   * Get all registered accounts (for Admin or internal check)
   */
  public getAllUsers(): User[] {
    // Strip sensitive passwords for public display
    return this.users.map(({ password: _, ...rest }) => rest);
  }

  /**
   * Register a brand new user or publisher account
   */
  public register(payload: RegisterPayload): { success: boolean; user?: User; error?: string } {
    const trimmedEmail = payload.email.trim().toLowerCase();

    // Check if email already exists
    const existing = this.users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return {
        success: false,
        error: "البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استعادة كلمة المرور.",
      };
    }

    if (!payload.password || payload.password.length < 6) {
      return {
        success: false,
        error: "كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام.",
      };
    }

    const assignedType: AccountType = payload.accountType === "publisher" ? "publisher" : "user";
    const isPublisherActive = assignedType === "publisher";
    const isBlueBadge = !!payload.verifyBlueBadgeNow;

    const assignedPlan = payload.plan || (assignedType === "publisher" ? "Pro Technician" : "Free Trial");
    const initialCredits =
      assignedType === "publisher" ? (isBlueBadge ? 1000 : 300) : 50;

    const newAccount: StoredUserAccount = {
      id: `usr_gd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: payload.name.trim(),
      email: trimmedEmail,
      phone: payload.phone?.trim() || "+966 50 000 0000",
      workshopName: payload.workshopName?.trim() || (assignedType === "publisher" ? "مركز صيانة معتمد" : "عميل مستخدم"),
      role: assignedType === "publisher" ? "technician" : "user",
      accountType: assignedType,
      nationality: payload.nationality?.trim() || "سعودي",
      country: payload.country?.trim() || "المملكة العربية السعودية",
      city: payload.city?.trim() || "الرياض",
      village: payload.village?.trim() || "المركز الرئيسي",
      workPerimeter: payload.workPerimeter?.trim() || "15 كم (محيط المدينة والقرى المجاورة)",
      isPublisherActive: isPublisherActive,
      publisherExpiresAt: isPublisherActive ? "2026-12-31" : undefined,
      isBlueBadgeVerified: isBlueBadge,
      blueBadgeExpiresAt: isBlueBadge ? "2026-12-31" : undefined,
      dailyPublishedCount: 0,
      lastPublishDate: new Date().toISOString().split("T")[0],
      plan: assignedPlan,
      credits: initialCredits,
      joinedDate: new Date().toISOString().split("T")[0],
      status: "active",
      password: payload.password,
      lastLogin: new Date().toISOString(),
    };

    this.users.unshift(newAccount);
    this.saveUsers();

    // Set as active logged-in user
    const { password: _, ...safeUser } = newAccount;
    this.setCurrentUser(safeUser);

    return {
      success: true,
      user: safeUser,
    };
  }

  /**
   * Login with email and password
   */
  public login(
    email: string,
    password: string
  ): { success: boolean; user?: User; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const account = this.users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!account) {
      return {
        success: false,
        error: "البريد الإلكتروني غير مسجل في منصة GD GSM. تحقق من البيانات أو أنشئ حساباً جديداً.",
      };
    }

    if (account.status === "suspended") {
      return {
        success: false,
        error: "هذا الحساب معطل مؤقتاً من قبل إدارة المنصة. تواصل مع الدعم الفني.",
      };
    }

    if (account.password !== password) {
      return {
        success: false,
        error: "كلمة المرور غير صحيحة. يرجى المحاولة مجدداً أو النقر على 'نسيت كلمة المرور'.",
      };
    }

    // Reset daily publish count if day changed
    const today = new Date().toISOString().split("T")[0];
    if (account.lastPublishDate !== today) {
      account.dailyPublishedCount = 0;
      account.lastPublishDate = today;
    }

    // Update last login
    account.lastLogin = new Date().toISOString();
    this.saveUsers();

    const { password: _, ...safeUser } = account;
    this.setCurrentUser(safeUser);

    return {
      success: true,
      user: safeUser,
    };
  }

  /**
   * Activate / Upgrade to Publisher account ($10/month)
   */
  public activatePublisherAccount(userId: string): { success: boolean; user?: User; error?: string } {
    const account = this.users.find((u) => u.id === userId);
    if (!account) {
      return { success: false, error: "المستخدم غير موجود." };
    }

    account.accountType = "publisher";
    account.isPublisherActive = true;
    account.role = "technician";
    account.publisherExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    if (account.plan === "Free Trial") {
      account.plan = "Pro Technician";
      account.credits += 200;
    }

    this.saveUsers();
    const { password: _, ...safeUser } = account;
    this.setCurrentUser(safeUser);
    return { success: true, user: safeUser };
  }

  /**
   * Verify Account with Blue Badge ($10/month) - for Unlimited services
   */
  public verifyAccountWithBlueBadge(userId: string): { success: boolean; user?: User; error?: string } {
    const account = this.users.find((u) => u.id === userId);
    if (!account) {
      return { success: false, error: "المستخدم غير موجود." };
    }

    account.isBlueBadgeVerified = true;
    account.blueBadgeExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    account.credits += 300;

    this.saveUsers();
    const { password: _, ...safeUser } = account;
    this.setCurrentUser(safeUser);
    return { success: true, user: safeUser };
  }

  /**
   * Increment daily published services count
   */
  public incrementDailyPublish(userId: string): { success: boolean; dailyCount: number; user?: User } {
    const account = this.users.find((u) => u.id === userId);
    if (!account) return { success: false, dailyCount: 0 };

    const today = new Date().toISOString().split("T")[0];
    if (account.lastPublishDate !== today) {
      account.dailyPublishedCount = 1;
      account.lastPublishDate = today;
    } else {
      account.dailyPublishedCount = (account.dailyPublishedCount || 0) + 1;
    }

    this.saveUsers();
    const { password: _, ...safeUser } = account;
    this.setCurrentUser(safeUser);
    return { success: true, dailyCount: account.dailyPublishedCount, user: safeUser };
  }

  /**
   * Reset / Recover Password
   */
  public resetPassword(
    email: string,
    newPassword: string
  ): { success: boolean; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const account = this.users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!account) {
      return {
        success: false,
        error: "لم يتم العثور على أي حساب بهذا البريد الإلكتروني.",
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: "كلمة المرور الجديدة يجب أن تكون 6 خانات على الأقل.",
      };
    }

    account.password = newPassword;
    this.saveUsers();
    return { success: true };
  }

  /**
   * Get current stored active session
   */
  public getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    return null;
  }

  /**
   * Set current stored active session
   */
  public setCurrentUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Terminate active session
   */
  public logout(): void {
    this.setCurrentUser(null);
  }
}

export const authService = new AuthService();
