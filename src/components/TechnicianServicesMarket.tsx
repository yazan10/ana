import React, { useState, useMemo } from "react";
import {
  Wrench,
  Plus,
  BadgeCheck,
  MapPin,
  Compass,
  Phone,
  MessageCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Crown,
  Users,
  Building2,
  ExternalLink,
  ChevronRight,
  Flame,
  X,
  CreditCard,
  Zap,
  Check,
} from "lucide-react";
import { Language, User, TechnicianServiceItem } from "../types";
import {
  technicianServicesStore,
  AddServicePayload,
} from "../services/technicianServicesStore";
import { authService } from "../services/authService";

interface TechnicianServicesMarketProps {
  lang: Language;
  currentUser: User | null;
  onUpdateCurrentUser: (user: User) => void;
  onGoLogin: () => void;
  onGoSignUp: () => void;
}

const CATEGORIES: { id: TechnicianServiceItem["category"] | "all"; labelAr: string; labelEn: string }[] = [
  { id: "all", labelAr: "الكل", labelEn: "All Services" },
  { id: "flashing_software", labelAr: "تفليش ورومات وسوفت وير", labelEn: "Flashing & Software" },
  { id: "frp_unlock", labelAr: "فك حماية FRP وحسابات جوجل", labelEn: "FRP & Accounts" },
  { id: "hardware_board", labelAr: "صيانة بورد وأيسيات ومعالجات", labelEn: "Board & ICs Repair" },
  { id: "screen_battery", labelAr: "شاشات وبطاريات وهيكل", labelEn: "Screen & Battery" },
  { id: "icloud_imei", labelAr: "فك شبكة وآيكلاود وسيريال", labelEn: "Network & iCloud" },
  { id: "maintenance_general", labelAr: "صيانة شاملة وسريعة", labelEn: "General Maintenance" },
];

export const TechnicianServicesMarket: React.FC<TechnicianServicesMarketProps> = ({
  lang,
  currentUser,
  onUpdateCurrentUser,
  onGoLogin,
  onGoSignUp,
}) => {
  const isAr = lang === "ar";

  const [services, setServices] = useState<TechnicianServiceItem[]>(() =>
    technicianServicesStore.getAllServices()
  );

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<TechnicianServiceItem["category"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [cityFilter, setCityFilter] = useState("");
  const [villageFilter, setVillageFilter] = useState("");
  const [onlyBlueBadge, setOnlyBlueBadge] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpgradePublisherModalOpen, setIsUpgradePublisherModalOpen] = useState(false);
  const [isBlueBadgeModalOpen, setIsBlueBadgeModalOpen] = useState(false);
  const [bookingSuccessModal, setBookingSuccessModal] = useState<string | null>(null);

  // Add Service Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<TechnicianServiceItem["category"]>("flashing_software");
  const [newBrand, setNewBrand] = useState("Samsung Galaxy");
  const [newPrice, setNewPrice] = useState(15);
  const [newTime, setNewTime] = useState("30 دقيقة");
  const [newDescription, setNewDescription] = useState("");
  const [newPhone, setNewPhone] = useState(currentUser?.phone || "");
  const [formError, setFormError] = useState<string | null>(null);

  // Refresh services list
  const refreshServices = () => {
    setServices(technicianServicesStore.getAllServices());
  };

  // Distinct countries in services
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => set.add(s.country));
    return Array.from(set);
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (selectedCategory !== "all" && s.category !== selectedCategory) return false;
      if (selectedCountry !== "all" && s.country !== selectedCountry) return false;
      if (onlyBlueBadge && !s.isBlueBadgeVerified) return false;

      if (cityFilter.trim() && !s.city.toLowerCase().includes(cityFilter.toLowerCase())) {
        return false;
      }

      if (villageFilter.trim() && !s.village.toLowerCase().includes(villageFilter.toLowerCase())) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesDesc = s.description.toLowerCase().includes(q);
        const matchesBrand = s.deviceBrand.toLowerCase().includes(q);
        const matchesName = s.publisherName.toLowerCase().includes(q);
        const matchesCity = s.city.toLowerCase().includes(q);
        const matchesVillage = s.village.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesBrand && !matchesName && !matchesCity && !matchesVillage) {
          return false;
        }
      }

      return true;
    });
  }, [services, selectedCategory, selectedCountry, onlyBlueBadge, cityFilter, villageFilter, searchQuery]);

  // Handle Publish Service
  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!currentUser) {
      onGoLogin();
      return;
    }

    if (!newTitle.trim() || !newDescription.trim()) {
      setFormError(isAr ? "يرجى كتابة عنوان وتفاصيل الخدمة." : "Please fill in title and description.");
      return;
    }

    const payload: AddServicePayload = {
      title: newTitle,
      description: newDescription,
      category: newCategory,
      deviceBrand: newBrand,
      priceUsd: Number(newPrice) || 10,
      estimatedTime: newTime,
      publisherPhone: newPhone || currentUser.phone,
      country: currentUser.country,
      city: currentUser.city,
      village: currentUser.village,
      workPerimeter: currentUser.workPerimeter,
    };

    const res = technicianServicesStore.publishService(currentUser, payload);

    if (!res.success) {
      if (res.requiresBlueBadge) {
        setIsAddModalOpen(false);
        setIsBlueBadgeModalOpen(true);
      } else {
        setFormError(res.error || (isAr ? "فشل نشر الخدمة." : "Failed to publish service."));
      }
      return;
    }

    // Refresh user state to reflect daily count
    const updatedUser = authService.getCurrentUser();
    if (updatedUser) {
      onUpdateCurrentUser(updatedUser);
    }

    // Reset form
    setNewTitle("");
    setNewDescription("");
    setIsAddModalOpen(false);
    refreshServices();
  };

  // Handle Upgrade to Publisher ($10/month)
  const handleConfirmPublisherUpgrade = () => {
    if (!currentUser) return;
    const res = authService.activatePublisherAccount(currentUser.id);
    if (res.success && res.user) {
      onUpdateCurrentUser(res.user);
      setIsUpgradePublisherModalOpen(false);
      refreshServices();
    }
  };

  // Handle Verify Blue Badge ($10/month)
  const handleConfirmBlueBadge = () => {
    if (!currentUser) return;
    const res = authService.verifyAccountWithBlueBadge(currentUser.id);
    if (res.success && res.user) {
      onUpdateCurrentUser(res.user);
      setIsBlueBadgeModalOpen(false);
      refreshServices();
    }
  };

  // Handle Delete Service
  const handleDeleteService = (serviceId: string) => {
    if (!currentUser) return;
    if (window.confirm(isAr ? "هل أنت متأكد من حذف هذه الخدمة؟" : "Delete this service?")) {
      technicianServicesStore.deleteService(serviceId, currentUser.id);
      refreshServices();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER & USER ACCOUNT STATUS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold">
              <Compass className="w-3.5 h-3.5" />
              <span>{isAr ? "سوق ومحيط خدمات صيانة الهواتف" : "Technician Services & Work Perimeter Hub"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isAr
                ? "اعثر على أقرب فني صيانة في دولتك، مدينتك وقريتك"
                : "Find Smartphone Technicians in Your Area & Perimeter"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isAr
                ? "منصة متكاملة لربط العملاء بأفضل فنيي صيانة الهواتف والبرمجة في محيط عملهم الجغرافي. يمكن للفنيين الناشرين عرض خدماتهم وتوثيق حساباتهم بالشارة الزرقاء لنشر غير محدود."
                : "Connect device owners with certified phone repair technicians in their exact district & city."}
            </p>
          </div>

          {/* User Quick Status & CTA */}
          <div className="w-full lg:w-auto shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col gap-3 min-w-[280px]">
            {currentUser ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-bold text-xs text-slate-900">
                        <span>{currentUser.name}</span>
                        {currentUser.isBlueBadgeVerified && (
                          <BadgeCheck
                            className="w-4 h-4 text-blue-600 fill-blue-100 shrink-0"
                            title={isAr ? "فني موثق بالشارة الزرقاء" : "Blue Badge Verified"}
                          />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {currentUser.nationality} • {currentUser.city}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentUser.accountType === "publisher"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {currentUser.accountType === "publisher"
                      ? isAr
                        ? "ناشر معتمد"
                        : "Publisher"
                      : isAr
                      ? "مستخدم عادي"
                      : "User"}
                  </span>
                </div>

                {/* Workplace details */}
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-semibold">{currentUser.country} - {currentUser.city}</span>
                    {currentUser.village && <span>({currentUser.village})</span>}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span>{isAr ? "محيط العمل:" : "Perimeter:"} {currentUser.workPerimeter}</span>
                  </div>
                </div>

                {/* Publisher Daily Counter & Blue badge state */}
                {currentUser.accountType === "publisher" ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        {isAr ? "عداد النشر اليومي:" : "Daily Published:"}
                      </span>
                      {currentUser.isBlueBadgeVerified ? (
                        <span className="font-bold text-blue-700 flex items-center gap-1 text-[11px] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>{isAr ? "∞ لا نهائي (موثق)" : "∞ Unlimited"}</span>
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-indigo-700 text-xs bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          {currentUser.dailyPublishedCount || 0} / 10 {isAr ? "خدمات" : "services"}
                        </span>
                      )}
                    </div>

                    {/* Unverified prompt */}
                    {!currentUser.isBlueBadgeVerified && (
                      <button
                        onClick={() => setIsBlueBadgeModalOpen(true)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <BadgeCheck className="w-3.5 h-3.5" />
                        <span>{isAr ? "توثيق بالشارة الزرقاء (10$/شهر) لنشر غير محدود" : "Get Blue Badge ($10/mo)"}</span>
                      </button>
                    )}

                    {/* Publish Service button */}
                    <button
                      onClick={() => {
                        if (!currentUser.isBlueBadgeVerified && (currentUser.dailyPublishedCount || 0) >= 10) {
                          setIsBlueBadgeModalOpen(true);
                        } else {
                          setIsAddModalOpen(true);
                        }
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? "نشر خدمة صيانة جديدة +" : "Post New Service +"}</span>
                    </button>
                  </div>
                ) : (
                  /* Regular User Options */
                  <div className="space-y-2 pt-1">
                    <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed font-medium">
                      {isAr
                        ? "أنت بحساب مستخدم لتصفح وطلب الصيانة. هل أنت فني وتريد نشر خدماتك؟"
                        : "Registered as client. Are you a phone technician?"}
                    </div>
                    <button
                      onClick={() => setIsUpgradePublisherModalOpen(true)}
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Crown className="w-4 h-4 text-amber-300" />
                      <span>{isAr ? "الترقية إلى حساب ناشر (10$/شهرياً)" : "Upgrade to Publisher ($10/mo)"}</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Logged out state */
              <div className="space-y-2.5 text-center">
                <div className="text-xs font-bold text-slate-800">
                  {isAr ? "انضم لسوق فنيي الصيانة GD GSM" : "Join GD GSM Tech Market"}
                </div>
                <p className="text-[11px] text-slate-500">
                  {isAr ? "سجل دخولك أو أنشئ حساب ناشر / مستخدم" : "Sign in to post or request repairs."}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onGoLogin}
                    className="flex-1 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 cursor-pointer"
                  >
                    {isAr ? "دخول" : "Sign In"}
                  </button>
                  <button
                    onClick={onGoSignUp}
                    className="flex-1 py-1.5 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-300 cursor-pointer"
                  >
                    {isAr ? "حساب جديد" : "Sign Up"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. FILTERS & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder={isAr ? "ابحث باسم الخدمة، ماركة الهاتف، أو الفني..." : "Search services, brand, technician..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-9 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          {/* Country Filter */}
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
            >
              <option value="all">{isAr ? "جميع الدول (All Countries)" : "All Countries"}</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>
                  📍 {c}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="relative">
            <input
              type="text"
              placeholder={isAr ? "تصفية بالمدينة (مثال: الرياض، القاهرة...)" : "Filter by city..."}
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Village / District Filter */}
          <div className="relative">
            <input
              type="text"
              placeholder={isAr ? "تصفية بالقرية / الحي..." : "Filter by village/neighborhood..."}
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Categories Pills & Blue Badge Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Only Blue Badge Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={onlyBlueBadge}
              onChange={(e) => setOnlyBlueBadge(e.target.checked)}
              className="rounded-sm border-blue-300 text-blue-600 focus:ring-blue-500"
            />
            <BadgeCheck className="w-4 h-4 text-blue-600 fill-blue-100" />
            <span>{isAr ? "الفنيين الموثقين بالشارة الزرقاء فقط" : "Blue Badge Verified Only"}</span>
          </label>
        </div>
      </div>

      {/* 3. SERVICES LISTING GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
          <span>
            {isAr
              ? `تم العثور على ${filteredServices.length} خدمة صيانة معروضة`
              : `Found ${filteredServices.length} maintenance services`}
          </span>
          <span className="text-[11px] text-slate-400">
            {isAr ? "الترتيب: الفنيون الموثقون بالشارة الزرقاء أولاً 🛡️" : "Priority: Blue Badge Verified first"}
          </span>
        </div>

        {filteredServices.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {isAr ? "لا توجد خدمات مطابقة لبحثك في هذه المنطقة" : "No services found in this location"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isAr
                ? "جرب تغيير فلاتر المدينة أو القرية، أو كن أول فني صيانة ينشر خدماته في هذه المنطقة!"
                : "Try expanding your search perimeter or be the first technician to publish here!"}
            </p>
            {currentUser?.accountType === "publisher" && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? "نشر خدمة في هذه المنطقة الآن" : "Publish Service Here"}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const isOwner = currentUser?.id === service.publisherId;

              return (
                <div
                  key={service.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                    service.isBlueBadgeVerified
                      ? "border-blue-200 ring-1 ring-blue-500/10 hover:border-blue-400"
                      : "border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Technician info & badges */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {service.publisherName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1 font-bold text-xs text-slate-900">
                            <span className="truncate max-w-[140px]">{service.publisherName}</span>
                            {service.isBlueBadgeVerified && (
                              <BadgeCheck
                                className="w-4 h-4 text-blue-600 fill-blue-100 shrink-0"
                                title={isAr ? "فني موثق بالشارة الزرقاء (معتمد)" : "Blue Badge Verified Technician"}
                              />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium truncate max-w-[160px]">
                            {service.publisherWorkshop || service.nationality}
                          </div>
                        </div>
                      </div>

                      {/* Verification / Price Badge */}
                      <div className="text-end">
                        <div className="text-sm font-black font-mono text-emerald-600">
                          ${service.priceUsd}
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium">
                          {service.estimatedTime}
                        </div>
                      </div>
                    </div>

                    {/* Workplace & Perimeter Info */}
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{service.country} - {service.city}</span>
                        {service.village && (
                          <span className="text-slate-600 font-normal">({service.village})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Compass className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{service.workPerimeter}</span>
                      </div>
                    </div>

                    {/* Service Title & Brand */}
                    <div className="space-y-1">
                      <div className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        📱 {service.deviceBrand}
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2">
                        {service.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                    {/* WhatsApp button */}
                    <a
                      href={`https://wa.me/${service.publisherPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        isAr
                          ? `مرحباً، أود الاستفسار عن خدمة: ${service.title}`
                          : `Hello, inquiring about: ${service.title}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{isAr ? "واتساب مباشر" : "WhatsApp"}</span>
                    </a>

                    {/* Direct Call / Request */}
                    <button
                      onClick={() => setBookingSuccessModal(service.title)}
                      className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      {isAr ? "حجز الخدمة" : "Book"}
                    </button>

                    {/* Delete if Owner */}
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title={isAr ? "حذف الخدمة" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD NEW SERVICE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {isAr ? "نشر خدمة صيانة جديدة" : "Post Maintenance Service"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isAr ? "عرض الخدمة لجميع العملاء في دولتك ومدينتك" : "Visible to all clients in your work perimeter."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handlePublishSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? "عنوان الخدمة الواضح:" : "Service Title:"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? "مثال: فك حماية FRP وتخطي حساب جوجل لسامسونج خلال 10 دقائق" : "e.g. Samsung FRP bypass in 10 minutes"}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? "قسم ونوع الصيانة:" : "Category:"}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TechnicianServiceItem["category"])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="flashing_software">{isAr ? "تفليش وسوفت وير" : "Flashing & Software"}</option>
                    <option value="frp_unlock">{isAr ? "تخطي FRP وحسابات" : "FRP Unlock"}</option>
                    <option value="hardware_board">{isAr ? "صيانة بورد وأيسيات" : "Motherboard & IC"}</option>
                    <option value="screen_battery">{isAr ? "شاشات وبطاريات" : "Screen & Battery"}</option>
                    <option value="icloud_imei">{isAr ? "فك شبكة وآيكلاود" : "Network & iCloud"}</option>
                    <option value="maintenance_general">{isAr ? "صيانة عامة سريعة" : "General Repair"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? "الماركة أو الطراز المستهدف:" : "Target Brand:"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Samsung, Xiaomi, iPhone..."
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? "السعر التقريبي بالدولار ($):" : "Estimated Price ($):"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? "الوقت المتوقع للتنفيذ:" : "Estimated Execution Time:"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? "20 دقيقة، ساعة واحدة..." : "20 mins, 1 hour..."}
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? "تفاصيل ووصف الخدمة:" : "Service Description:"}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={isAr ? "اشرح للعملاء طريقة الإصلاح والضمان والأدوات المستخدمة..." : "Describe repair procedure and warranty..."}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? "رقم الواتساب للتواصل المباشر مع العملاء:" : "WhatsApp Phone for Client Chat:"}
                </label>
                <input
                  type="tel"
                  placeholder="+966 50 123 4567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isAr ? "نشر الخدمة الآن" : "Publish Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BLUE BADGE VERIFICATION MODAL ($10/MONTH) */}
      {isBlueBadgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8 text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border-2 border-blue-200 shadow-md shadow-blue-100">
              <BadgeCheck className="w-9 h-9 fill-blue-100 text-blue-600" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {isAr ? "توثيق الحساب بالشارة الزرقاء ✓" : "Verify Account with Blue Badge ✓"}
              </h3>
              <p className="text-xs text-blue-800 font-bold bg-blue-50 py-1 px-3 rounded-full inline-block">
                {isAr ? "سعر التوثيق: 10 دولار شهرياً فقط" : "Verification Price: $10 / Month"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-start text-xs space-y-2.5">
              <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1.5">
                {isAr ? "مميزات التوثيق بالشارة الزرقاء:" : "Blue Badge Privileges:"}
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isAr ? "نشر خدمات بدون توقف وبعدد لانهائي:" : "Unlimited Service Postings:"}</strong>{" "}
                  {isAr ? "تخطي حد الـ 10 خدمات اليومي ونشر أي عدد من الخدمات." : "Post unlimited services daily."}
                </span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isAr ? "الشارة الزرقاء الرسمية ✓:" : "Official Blue Badge ✓:"}</strong>{" "}
                  {isAr ? "تظهر بجانب اسمك في البروفايل وكروت الخدمات وشريط التنقل." : "Shows next to your name everywhere."}
                </span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isAr ? "أولوية الظهور في نتائج البحث:" : "Top Search Ranking:"}</strong>{" "}
                  {isAr ? "تظهر خدماتك في المقدمة للعملاء القريبين منك في مدينتك وقريتك." : "Rank #1 in local perimeter."}
                </span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isAr ? "+300 نقطة كريدت إضافية:" : "+300 Bonus Credits:"}</strong>{" "}
                  {isAr ? "هدية فورية لتفليش الأجهزة والرومات المتقدمة." : "Instant bonus credits."}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleConfirmBlueBadge}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BadgeCheck className="w-4 h-4" />
                <span>{isAr ? "تأكيد ودفع 10$ لتفعيل الشارة الزرقاء فوراً" : "Pay $10 & Activate Blue Badge Now"}</span>
              </button>

              <button
                onClick={() => setIsBlueBadgeModalOpen(false)}
                className="w-full py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
              >
                {isAr ? "إغلاق" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: UPGRADE TO PUBLISHER ($10/MONTH) */}
      {isUpgradePublisherModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8 text-center">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border-2 border-indigo-200 shadow-md shadow-indigo-100">
              <Crown className="w-8 h-8 text-indigo-600" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {isAr ? "تفعيل حساب ناشر صيانة معتمد" : "Activate Publisher Account"}
              </h3>
              <p className="text-xs text-indigo-800 font-bold bg-indigo-50 py-1 px-3 rounded-full inline-block">
                {isAr ? "رسوم الاشتراك: 10 دولار شهرياً" : "Subscription: $10 / Month"}
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? "حول حسابك إلى حساب فني ناشر معتمد لتتمكن من نشر خدمات الصيانة وبرمجة الهواتف وتلقي طلبات العملاء في محيط مكان عملك (حتى 10 خدمات يومياً)."
                : "Transform your account into a verified publisher to post up to 10 maintenance services daily."}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-start text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? "نشر ما يصل إلى 10 خدمات يومياً" : "Post up to 10 services per day"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? "تحديد الدولة، المدينة، القرية ونطاق التغطية" : "Local district & coverage radius"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? "+200 نقطة كريدت تفليش مباشرة" : "+200 flashing credits included"}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleConfirmPublisherUpgrade}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isAr ? "تأكيد الاشتراك بـ 10$ شهرياً وتفعيل الحساب" : "Confirm $10/mo & Activate Publisher"}</span>
              </button>

              <button
                onClick={() => setIsUpgradePublisherModalOpen(false)}
                className="w-full py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
              >
                {isAr ? "إغلاق" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: BOOKING / CONTACT SUCCESS */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 text-center space-y-3 shadow-xl">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">
              {isAr ? "تم إرسال طلب حجز الخدمة بنجاح!" : "Booking Request Sent!"}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? `تم إشعار فني الصيانة بطلبك للخدمة: "${bookingSuccessModal}". سيتواصل معك الفني عبر الواتساب أو الهاتف لتأكيد الموعد واستلام الجهاز.`
                : `The technician has been notified for "${bookingSuccessModal}".`}
            </p>
            <button
              onClick={() => setBookingSuccessModal(null)}
              className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-indigo-500"
            >
              {isAr ? "حسناً، تم" : "Done"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
