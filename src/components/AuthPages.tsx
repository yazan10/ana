import React, { useState } from "react";
import {
  LogIn,
  UserPlus,
  KeyRound,
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  Sparkles,
  MapPin,
  Check,
  Compass,
  BadgeCheck,
  CreditCard,
  Crown,
  Users,
} from "lucide-react";
import { Language, User, AppView, AccountType } from "../types";
import { authService, RegisterPayload } from "../services/authService";

interface AuthProps {
  lang: Language;
  onNavigate: (view: AppView) => void;
  onLoginSuccess: (user: User) => void;
  initialMode?: "login" | "signup" | "forgot_password";
}

const NATIONALITIES = [
  { labelAr: "سعودي", labelEn: "Saudi", flag: "🇸🇦" },
  { labelAr: "مصري", labelEn: "Egyptian", flag: "🇪🇬" },
  { labelAr: "أردني", labelEn: "Jordanian", flag: "🇯🇴" },
  { labelAr: "سوري", labelEn: "Syrian", flag: "🇸🇾" },
  { labelAr: "عراقي", labelEn: "Iraqi", flag: "🇮🇶" },
  { labelAr: "يمني", labelEn: "Yemeni", flag: "🇾🇪" },
  { labelAr: "إماراتي", labelEn: "Emirati", flag: "🇦🇪" },
  { labelAr: "كويتي", labelEn: "Kuwaiti", flag: "🇰🇼" },
  { labelAr: "قطري", labelEn: "Qatari", flag: "🇶🇦" },
  { labelAr: "بحريني", labelEn: "Bahraini", flag: "🇧🇭" },
  { labelAr: "عُماني", labelEn: "Omani", flag: "🇴🇲" },
  { labelAr: "مغربي", labelEn: "Moroccan", flag: "🇲🇦" },
  { labelAr: "جزائري", labelEn: "Algerian", flag: "🇩🇿" },
  { labelAr: "تونسي", labelEn: "Tunisian", flag: "🇹🇳" },
  { labelAr: "فلسطيني", labelEn: "Palestinian", flag: "🇵🇸" },
  { labelAr: "لبناني", labelEn: "Lebanese", flag: "🇱🇧" },
  { labelAr: "سوداني", labelEn: "Sudanese", flag: "🇸🇩" },
  { labelAr: "تركي", labelEn: "Turkish", flag: "🇹🇷" },
  { labelAr: "أخرى / جنسية دولية", labelEn: "Other / International", flag: "🌍" },
];

const COUNTRIES = [
  "المملكة العربية السعودية",
  "جمهورية مصر العربية",
  "الإمارات العربية المتحدة",
  "العراق",
  "الأردن",
  "الجمهورية العربية السورية",
  "المملكة المغربية",
  "الجزائر",
  "اليمن",
  "دولة الكويت",
  "دولة قطر",
  "سلطنة عُمان",
  "مملكة البحرين",
  "تونس",
  "فلسطين",
  "لبنان",
  "السودان",
  "تركيا",
  "دولة أخرى",
];

const WORK_PERIMETERS = [
  "5 كم (نطاق القرية أو الحي فقط)",
  "15 كم (محيط المدينة والقرى المجاورة)",
  "30 كم (كامل المحافظة والضواحي)",
  "50+ كم (تغطية إقليمية شاملة)",
  "خدمات سحابية / أونلاين عن بعد (عبر السيرفر وTeamViewer)",
];

// ----------------------------------------------------
// 1. LOGIN PAGE
// ----------------------------------------------------
export const LoginPage: React.FC<AuthProps> = ({
  lang,
  onNavigate,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isAr = lang === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError(
        isAr
          ? "يرجى إدخال البريد الإلكتروني وكلمة المرور."
          : "Please enter both email and password."
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = authService.login(email, password);
      setIsLoading(false);

      if (!res.success || !res.user) {
        setError(res.error || (isAr ? "فشل تسجيل الدخول." : "Login failed."));
        return;
      }

      setSuccessMsg(
        isAr
          ? `مرحباً بك مجدداً، ${res.user.name}! جاري الدخول للمنصة...`
          : `Welcome back, ${res.user.name}! Redirecting...`
      );

      setTimeout(() => {
        onLoginSuccess(res.user!);
        onNavigate("app");
      }, 700);
    }, 400);
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);

    setIsLoading(true);
    setTimeout(() => {
      const res = authService.login(demoEmail, demoPass);
      setIsLoading(false);
      if (res.success && res.user) {
        setSuccessMsg(
          isAr
            ? `تم تسجيل الدخول بحساب: ${res.user.name}`
            : `Logged in as: ${res.user.name}`
        );
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onNavigate("app");
        }, 600);
      }
    }, 300);
  };

  return (
    <div className="max-w-md w-full mx-auto my-6 sm:my-10 p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
      {/* Switcher Header */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
        <button
          type="button"
          className="flex-1 py-2 rounded-lg bg-white text-indigo-700 shadow-2xs text-center cursor-pointer transition-all flex items-center justify-center gap-1.5"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>{isAr ? "تسجيل الدخول" : "Sign In"}</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("signup")}
          className="flex-1 py-2 rounded-lg text-slate-600 hover:text-slate-900 text-center cursor-pointer transition-all flex items-center justify-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{isAr ? "إنشاء حساب جديد" : "Create Account"}</span>
        </button>
      </div>

      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-md shadow-indigo-100">
          <Zap className="w-6 h-6 fill-white" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          {isAr ? "تسجيل الدخول إلى GD GSM" : "GD GSM Sign In"}
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          {isAr
            ? "الوصول المباشر لأدوات السوفت وير، الرومات، وسوق خدمات الفنيين"
            : "Direct access to flashing suite, firmware repos & services market."}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {isAr ? "البريد الإلكتروني للفني أو المستخدم:" : "Email Address:"}
          </label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="tech@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-colors"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {isAr ? "كلمة المرور:" : "Password:"}
            </label>
            <button
              type="button"
              onClick={() => onNavigate("forgot_password")}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
            >
              {isAr ? "نسيت كلمة المرور؟" : "Forgot Password?"}
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>{isAr ? "تذكر تسجيل دخولي" : "Remember this device"}</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{isAr ? "دخول للمنصة" : "Sign In to Platform"}</span>
              <ArrowIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Accounts List */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>{isAr ? "حسابات تجريبية سريعة بنقرة واحدة:" : "Quick Demo Accounts:"}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Publisher account (regular 10/day limit) */}
          <button
            type="button"
            onClick={() => handleQuickLogin("publisher@gd-gsm.com", "123456")}
            className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-start text-xs font-semibold text-slate-700 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-700 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500" />
                <span>{isAr ? "ناشر معتمد (10$/شهر)" : "Publisher ($10/mo)"}</span>
              </span>
              <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full font-bold">
                {isAr ? "حد 10/يوم" : "10/day"}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">publisher@gd-gsm.com</div>
          </button>

          {/* Verified Blue Badge Publisher (unlimited services) */}
          <button
            type="button"
            onClick={() => handleQuickLogin("vip.tech@gd-gsm.com", "123456")}
            className="p-2 rounded-xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200 hover:border-blue-300 text-start text-xs font-semibold text-slate-700 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
                <span>{isAr ? "ناشر موثق بالشارة الزرقاء" : "Blue Badge (Unlimited)"}</span>
              </span>
              <span className="text-[9px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded-full font-bold">
                ∞ لا نهائي
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">vip.tech@gd-gsm.com</div>
          </button>

          {/* Regular User account */}
          <button
            type="button"
            onClick={() => handleQuickLogin("user@gd-gsm.com", "123456")}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start text-xs font-semibold text-slate-700 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-500" />
                <span>{isAr ? "مستخدم عادي (مجاني)" : "Regular User (Free)"}</span>
              </span>
              <span className="text-[9px] text-slate-500 font-bold">{isAr ? "تصفح وطلب" : "Client"}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">user@gd-gsm.com</div>
          </button>

          {/* Admin account */}
          <button
            type="button"
            onClick={() => handleQuickLogin("admin@gd-gsm.com", "admin123")}
            className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-start text-xs font-semibold text-slate-700 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                <span>{isAr ? "مدير النظام GD HQ" : "Master Admin"}</span>
              </span>
              <span className="text-[9px] text-purple-700 font-mono font-bold">99k pts</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">admin@gd-gsm.com</div>
          </button>
        </div>
      </div>

      <div className="text-center pt-2 text-xs text-slate-600 font-medium">
        <span>{isAr ? "ليس لديك حساب حتى الآن؟ " : "Don't have an account yet? "}</span>
        <button
          type="button"
          onClick={() => onNavigate("signup")}
          className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
        >
          {isAr ? "إنشاء حساب جديد (مستخدم أو ناشر)" : "Register now"}
        </button>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-3 text-xs text-slate-500 font-medium">
        <button
          type="button"
          onClick={() => onNavigate("services_market")}
          className="hover:text-indigo-600 transition-colors cursor-pointer"
        >
          {isAr ? "سوق خدمات الصيانة" : "Services Market"}
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => onNavigate("app")}
          className="hover:text-indigo-600 transition-colors cursor-pointer"
        >
          {isAr ? "الدخول كفني زائر" : "Enter as Guest"}
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 2. SIGN UP / REGISTER PAGE
// ----------------------------------------------------
export const SignUpPage: React.FC<AuthProps> = ({
  lang,
  onNavigate,
  onLoginSuccess,
}) => {
  const [accountType, setAccountType] = useState<AccountType>("publisher");
  const [name, setName] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("سعودي");
  const [country, setCountry] = useState("المملكة العربية السعودية");
  const [city, setCity] = useState("الرياض");
  const [village, setVillage] = useState("");
  const [workPerimeter, setWorkPerimeter] = useState("15 كم (محيط المدينة والقرى المجاورة)");

  // Publisher specifics
  const [verifyBlueBadgeNow, setVerifyBlueBadgeNow] = useState(false);
  const [agreePublisherTerms, setAgreePublisherTerms] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isAr = lang === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const getPasswordStrength = () => {
    if (!password) return { text: "", level: 0, color: "bg-slate-200" };
    if (password.length < 6) return { text: isAr ? "ضعيفة جداً" : "Very Weak", level: 1, color: "bg-rose-500" };
    if (password.length < 8) return { text: isAr ? "متوسطة" : "Medium", level: 2, color: "bg-amber-500" };
    return { text: isAr ? "قوية وآمنة" : "Strong", level: 3, color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError(isAr ? "يرجى تعبئة جميع الحقول الأساسية المطلوبة." : "Please fill in all required fields.");
      return;
    }

    if (!city.trim()) {
      setError(isAr ? "يرجى تحديد المدينة." : "Please enter your city.");
      return;
    }

    if (password.length < 6) {
      setError(isAr ? "كلمة المرور يجب أن تتكون من 6 خانات على الأقل." : "Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError(isAr ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError(isAr ? "يجب الموافقة على شروط استخدام منصة GD GSM." : "You must agree to the Terms of Service.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const payload: RegisterPayload = {
        name,
        email,
        password,
        phone,
        workshopName: workshopName.trim() || (accountType === "publisher" ? "مركز صيانة فني معتمد" : "عميل مستخدم"),
        accountType,
        nationality,
        country,
        city,
        village: village.trim() || "المركز العام",
        workPerimeter,
        activatePublisherNow: accountType === "publisher",
        verifyBlueBadgeNow: accountType === "publisher" && verifyBlueBadgeNow,
        plan: accountType === "publisher" ? "Pro Technician" : "Free Trial",
      };

      const res = authService.register(payload);
      setIsLoading(false);

      if (!res.success || !res.user) {
        setError(res.error || (isAr ? "فشل إنشاء الحساب." : "Registration failed."));
        return;
      }

      setSuccessMsg(
        isAr
          ? `تهانينا ${res.user.name}! تم إنشاء ${
              accountType === "publisher"
                ? "حساب ناشر معتمد بنجاح وتفعيل اشتراك الـ 10$ شهرياً" +
                  (verifyBlueBadgeNow ? " مع التوثيق بالشارة الزرقاء ✓" : "")
                : "حساب مستخدم بنجاح"
            }. جاري التحويل للمنصة...`
          : `Congratulations ${res.user.name}! Account created successfully. Redirecting...`
      );

      setTimeout(() => {
        onLoginSuccess(res.user!);
        onNavigate("services_market");
      }, 1000);
    }, 500);
  };

  return (
    <div className="max-w-2xl w-full mx-auto my-6 sm:my-10 p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
      {/* Switcher Header */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
        <button
          type="button"
          onClick={() => onNavigate("login")}
          className="flex-1 py-2 rounded-lg text-slate-600 hover:text-slate-900 text-center cursor-pointer transition-all flex items-center justify-center gap-1.5"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>{isAr ? "تسجيل الدخول" : "Sign In"}</span>
        </button>
        <button
          type="button"
          className="flex-1 py-2 rounded-lg bg-white text-indigo-700 shadow-2xs text-center cursor-pointer transition-all flex items-center justify-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{isAr ? "إنشاء حساب جديد" : "Create Account"}</span>
        </button>
      </div>

      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-md shadow-indigo-100">
          <UserPlus className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          {isAr ? "إنشاء حساب جديد في منصة GD GSM" : "Create GD GSM Account"}
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          {isAr
            ? "اختر نوع الحساب وحدد جنسيتك ومكان عملك ومحيطه الجغرافي بدقة"
            : "Choose your account type and specify your nationality & workspace perimeter."}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* STEP 1: ACCOUNT TYPE SELECTION */}
        <div>
          <label className="block text-xs font-extrabold text-slate-800 mb-2">
            {isAr ? "1. اختر نوع الحساب المراد إنشاؤه:" : "1. Select Account Type:"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Publisher Card */}
            <div
              onClick={() => setAccountType("publisher")}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                accountType === "publisher"
                  ? "border-indigo-600 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20"
                  : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                      <Crown className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">
                      {isAr ? "حساب ناشر (فني صيانة)" : "Publisher (Technician)"}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    {isAr ? "10$ شهرياً" : "$10 / mo"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {isAr
                    ? "نشر وعرض خدمات الصيانة للعملاء في محيط مكان عملك (حتى 10 خدمات يومياً، أو نشر لا نهائي مع الشارة الزرقاء)."
                    : "Publish & market maintenance services in your area (up to 10 daily or unlimited with Blue Badge)."}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-indigo-100/60 flex items-center gap-1.5 text-[10px] font-bold text-indigo-700">
                <Check className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isAr ? "مخصص لأصحاب الورش وفنيي الصيانة" : "For workshop owners & technicians"}</span>
              </div>
            </div>

            {/* Standard User Card */}
            <div
              onClick={() => {
                setAccountType("user");
                setVerifyBlueBadgeNow(false);
              }}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                accountType === "user"
                  ? "border-slate-900 bg-slate-100 shadow-xs ring-2 ring-slate-500/20"
                  : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xs">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">
                      {isAr ? "حساب مستخدم عادي" : "Standard User"}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {isAr ? "مجاناً" : "Free"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {isAr
                    ? "تصفح الفنيين والخدمات في دولتك ومدينتك وقريتك، طلب خدمات الصيانة والتواصل المباشر مع الفنيين."
                    : "Browse nearby technicians, request phone repairs, and chat directly via WhatsApp."}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                <Check className="w-3.5 h-3.5 text-slate-600" />
                <span>{isAr ? "مخصص للعملاء وأصحاب الأجهزة" : "For device owners & clients"}</span>
              </div>
            </div>
          </div>

          {/* Publisher Upsell with Blue Badge */}
          {accountType === "publisher" && (
            <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={verifyBlueBadgeNow}
                  onChange={(e) => setVerifyBlueBadgeNow(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-sm border-blue-400 text-blue-600 focus:ring-blue-500"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-blue-900">
                    <BadgeCheck className="w-4 h-4 text-blue-600 fill-blue-100" />
                    <span>
                      {isAr
                        ? "توثيق الحساب بالشارة الزرقاء مباشرة (سعر التوثيق 10$ شهرياً)"
                        : "Verify account with Blue Badge ($10/month)"}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    {isAr
                      ? "⚡ ميزة التوثيق بالشارة الزرقاء تتيح لك نشر خدمات بدون توقف وبعدد لانهائي (أكثر من 10 خدمات يومياً) مع إظهار الشارة الزرقاء المعتمدة ✓ بجانب اسمك وأولوية الظهور."
                      : "Unlocks unlimited service postings (more than 10 daily), official blue verified badge ✓, and priority in local searches."}
                  </p>
                </div>
              </label>

              <div className="pt-2 border-t border-blue-200/70 flex items-center justify-between text-xs font-bold text-blue-900">
                <span>{isAr ? "إجمالي الاشتراك الشهري:" : "Monthly Total:"}</span>
                <span className="font-mono text-sm text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
                  {verifyBlueBadgeNow ? "20$ شهرياً (10$ ناشر + 10$ توثيق شارة)" : "10$ شهرياً (حساب ناشر عادي)"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: NATIONALITY & LOCATION PERIMETER */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Compass className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-extrabold text-slate-800">
              {isAr ? "2. اختر جنسيتك ومكان عملك ومحيطه الجغرافي:" : "2. Nationality & Workplace Perimeter:"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Nationality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? "اختر جنسيتك:" : "Select Nationality:"}
              </label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500"
              >
                {NATIONALITIES.map((n) => (
                  <option key={n.labelAr} value={n.labelAr}>
                    {n.flag} {isAr ? n.labelAr : n.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? "الدولة (مكان العمل):" : "Country (Workplace):"}
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? "المدينة / المحافظة:" : "City / Governorate:"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={isAr ? "الرياض، القاهرة، بغداد، دبي، عمان..." : "e.g. Riyadh, Cairo, Amman"}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Village / Neighborhood */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? "القرية / البلدة / الحي:" : "Village / Town / District:"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={isAr ? "مثال: حي العليا، بلدة دير استيا، قرية عين سينيا..." : "e.g. Al Olaya district, village..."}
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500"
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Work Perimeter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isAr ? "محيط ونطاق العمل الذي تشتغل في محيطه:" : "Service & Work Perimeter Coverage:"}
            </label>
            <select
              value={workPerimeter}
              onChange={(e) => setWorkPerimeter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500"
            >
              {WORK_PERIMETERS.map((p) => (
                <option key={p} value={p}>
                  🎯 {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STEP 3: PERSONAL & CONTACT INFO */}
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? "الاسم الكامل:" : "Full Name:"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={isAr ? "م. خالد السعيد" : "John Doe"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? "اسم الورشة أو المختبر (اختياري):" : "Workshop Name (Optional):"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={isAr ? "مركز الشفاء لصيانة وبرمجة الهواتف" : "Tech Repair Lab"}
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? "البريد الإلكتروني:" : "Email Address:"}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? "رقم الجوال / واتساب للتواصل:" : "WhatsApp / Mobile Phone:"}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+966 50 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? "كلمة المرور:" : "Password:"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isAr ? "تأكيد كلمة المرور:" : "Confirm Password:"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Password strength */}
          {password && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{isAr ? "قوة كلمة المرور:" : "Password strength:"}</span>
                <span className="font-bold text-slate-700">{strength.text}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                <div className={`h-full flex-1 rounded-full ${strength.level >= 1 ? strength.color : "bg-slate-200"}`} />
                <div className={`h-full flex-1 rounded-full ${strength.level >= 2 ? strength.color : "bg-slate-200"}`} />
                <div className={`h-full flex-1 rounded-full ${strength.level >= 3 ? strength.color : "bg-slate-200"}`} />
              </div>
            </div>
          )}
        </div>

        {/* Terms agreement */}
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              {isAr
                ? "أوافق على شروط الاستخدام وسياسة نشر خدمات الصيانة في GD GSM"
                : "I agree to the Terms of Service & GD GSM Publishing Policy"}
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {accountType === "publisher"
                  ? isAr
                    ? `تأكيد وإنشاء حساب ناشر معتمد (${verifyBlueBadgeNow ? "20$" : "10$"} شهرياً)`
                    : `Create Publisher Account (${verifyBlueBadgeNow ? "$20" : "$10"}/mo)`
                  : isAr
                  ? "تأكيد وإنشاء حساب مستخدم مجاناً"
                  : "Create Free User Account"}
              </span>
              <ArrowIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2 text-xs text-slate-600 font-medium">
        <span>{isAr ? "لديك حساب بالفعل؟ " : "Already have an account? "}</span>
        <button
          type="button"
          onClick={() => onNavigate("login")}
          className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
        >
          {isAr ? "تسجيل الدخول الآن" : "Sign In now"}
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 3. FORGOT PASSWORD PAGE
// ----------------------------------------------------
export const ForgotPasswordPage: React.FC<AuthProps> = ({
  lang,
  onNavigate,
}) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAr = lang === "ar";

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !newPassword) {
      setError(isAr ? "يرجى إدخال البريد الإلكتروني وكلمة المرور الجديدة." : "Please fill in all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError(isAr ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل." : "Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(isAr ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authService.resetPassword(email, newPassword);
      setIsLoading(false);

      if (!res.success) {
        setError(res.error || (isAr ? "فشل استعادة كلمة المرور." : "Reset failed."));
        return;
      }

      setSuccess(
        isAr
          ? "تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة."
          : "Password updated successfully! You can now sign in."
      );

      setTimeout(() => {
        onNavigate("login");
      }, 1500);
    }, 400);
  };

  return (
    <div className="max-w-md w-full mx-auto my-8 p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto border border-amber-200">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          {isAr ? "استعادة كلمة المرور" : "Reset Password"}
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          {isAr
            ? "أدخل بريدك الإلكتروني المسجل لتعيين كلمة مرور جديدة لحسابك"
            : "Enter your registered email to assign a new password."}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {isAr ? "البريد الإلكتروني المسجل:" : "Registered Email:"}
          </label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="tech@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {isAr ? "كلمة المرور الجديدة:" : "New Password:"}
          </label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {isAr ? "تأكيد كلمة المرور الجديدة:" : "Confirm New Password:"}
          </label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>{isAr ? "حفظ وتعيين كلمة المرور" : "Save & Set Password"}</span>
          )}
        </button>
      </form>

      <div className="text-center pt-2 text-xs text-slate-600 font-medium">
        <button
          type="button"
          onClick={() => onNavigate("login")}
          className="font-bold text-indigo-600 hover:underline cursor-pointer"
        >
          {isAr ? "العودة لتسجيل الدخول" : "Back to Sign In"}
        </button>
      </div>
    </div>
  );
};
