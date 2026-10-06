import { TechnicianServiceItem, User } from "../types";
import { authService } from "./authService";

const STORAGE_SERVICES_KEY = "gd_gsm_technician_services_v1";

const INITIAL_SERVICES: TechnicianServiceItem[] = [
  {
    id: "srv_001",
    publisherId: "usr_101",
    publisherName: "م. أحمد عبد الرحمن",
    publisherWorkshop: "مركز الأوائل لصيانة وبرمجة الجوال",
    publisherPhone: "+966 50 123 4567",
    isBlueBadgeVerified: true,
    nationality: "سعودي",
    country: "المملكة العربية السعودية",
    city: "الرياض",
    village: "حي العليا",
    workPerimeter: "15 كم (محيط المدينة والقرى المجاورة)",
    title: "تفليش وحل مشاكل موت البوت Bootloop لجميع هواتف سامسونج أودين",
    description: "تفليش روم 4 ملفات رسمي مع الحفاظ على البيانات عند الإمكان، إصلاح شاشات الموت الزرقاء وسقوط النظام، وتجاوز Knox Guard و MDM للشركات.",
    category: "flashing_software",
    deviceBrand: "Samsung Galaxy",
    priceUsd: 15,
    estimatedTime: "25 دقيقة",
    createdAt: "2025-01-08",
    viewsCount: 342,
  },
  {
    id: "srv_002",
    publisherId: "usr_102",
    publisherName: "م. محمود طارق",
    publisherWorkshop: "المهندس سوفت وير & هاردوير",
    publisherPhone: "+20 100 987 6543",
    isBlueBadgeVerified: true,
    nationality: "مصري",
    country: "مصر",
    city: "القاهرة",
    village: "حي مصر الجديدة",
    workPerimeter: "20 كم (العاصمة والمدن المجاورة)",
    title: "فك حماية FRP وتخطي حساب جوجل أندرويد 14 و 15 خلال دقائق",
    description: "تخطي فوري لحساب جوجل FRP لجميع معالجات MTK و Exynos و Snapdragon بدون فتح الجهاز بنقرة واحدة عبر خادم GD GSM.",
    category: "frp_unlock",
    deviceBrand: "Xiaomi / Redmi / POCO",
    priceUsd: 12,
    estimatedTime: "15 دقيقة",
    createdAt: "2025-01-09",
    viewsCount: 520,
  },
  {
    id: "srv_003",
    publisherId: "usr_demo_verified",
    publisherName: "م. زياد الحلبي (موثق بالشارة الزرقاء ✓)",
    publisherWorkshop: "مؤسسة النجم للحلول البرمجية والهاردوير",
    publisherPhone: "+963 933 555 444",
    isBlueBadgeVerified: true,
    nationality: "سوري",
    country: "الأردن",
    city: "عمان",
    village: "حي الجبيهة",
    workPerimeter: "كامل العاصمة والمحافظات المجاورة (50 كم)",
    title: "إصلاح شريحة الذاكرة UFS و Emmc وبرمجة التيست بوينت EDL و BROM",
    description: "إحياء الهواتف الميتة نهائياً (Hard Brick) عبر مبرمجة EasyJTAG و UFi وبرمجة دامب المصنع الأصلي مع استرجاع ملفات الشبكة والتوجيه.",
    category: "hardware_board",
    deviceBrand: "جميع الماركات العالمية",
    priceUsd: 35,
    estimatedTime: "ساعتان",
    createdAt: "2025-01-10",
    viewsCount: 890,
  },
  {
    id: "srv_004",
    publisherId: "usr_103",
    publisherName: "م. ياسين العراقي",
    publisherWorkshop: "مختبر بابل لبرمجة كوالكوم",
    publisherPhone: "+964 770 112 2334",
    isBlueBadgeVerified: false,
    nationality: "عراقي",
    country: "العراق",
    city: "بغداد",
    village: "حي المنصور",
    workPerimeter: "15 كم (محيط بغداد)",
    title: "تغيير شاشات OLED أصلية مع برمجة الترو تون TrueTone وحساس البصمة",
    description: "استبدال شاشات آيفون وسامسونج الأصلية، نقل بيانات IC الشاشة القديمة لعدم ظهور رسالة الشاشة غير الأصلية مع ضمان 6 أشهر.",
    category: "screen_battery",
    deviceBrand: "Apple iPhone",
    priceUsd: 45,
    estimatedTime: "40 دقيقة",
    createdAt: "2025-01-10",
    viewsCount: 215,
  },
  {
    id: "srv_005",
    publisherId: "usr_105",
    publisherName: "م. سفيان المغربي",
    publisherWorkshop: "كازا جي إس إم سيرفس",
    publisherPhone: "+212 661 223 344",
    isBlueBadgeVerified: false,
    nationality: "مغربي",
    country: "المغرب",
    city: "الدار البيضاء",
    village: "حي المعاريف",
    workPerimeter: "25 كم (كامل كازا وضواحيها)",
    title: "فك حظر الشبكة الدولية SIM Network Unlock وإصلاح السيريال غير المسجل",
    description: "فتح رسمي ودائم للشبكات الأمريكية والأوروبية (AT&T, T-Mobile, Vodafone, O2) وإصلاح فقدان البيسباند والشبكة.",
    category: "icloud_imei",
    deviceBrand: "Samsung & Google Pixel",
    priceUsd: 25,
    estimatedTime: "ساعة واحدة",
    createdAt: "2025-01-11",
    viewsCount: 410,
  },
  {
    id: "srv_006",
    publisherId: "usr_demo_publisher",
    publisherName: "م. أحمد المهندس (ناشر معتمد)",
    publisherWorkshop: "مركز الشفاء لصيانة وبرمجة الهواتف",
    publisherPhone: "+966 50 111 2233",
    isBlueBadgeVerified: false,
    nationality: "سعودي",
    country: "المملكة العربية السعودية",
    city: "الرياض",
    village: "حي النسيم الشرقي",
    workPerimeter: "15 كم (محيط المدينة والقرى المجاورة)",
    title: "صيانة أيسيات الباور والشحن IC U2 / Tristar وتبديل منفذ Type-C السريع",
    description: "إصلاح أعطال السحب العالي والحرارة وتفريغ البطارية السريع وهواتف لا تقبل الشحن مع فحص التيليمتري المجهري الحراري.",
    category: "hardware_board",
    deviceBrand: "جميع الموديلات",
    priceUsd: 30,
    estimatedTime: "ساعة ونصف",
    createdAt: "2025-01-11",
    viewsCount: 305,
  },
];

export interface AddServicePayload {
  title: string;
  description: string;
  category: TechnicianServiceItem["category"];
  deviceBrand: string;
  priceUsd: number;
  estimatedTime: string;
  country?: string;
  city?: string;
  village?: string;
  workPerimeter?: string;
  publisherPhone?: string;
}

class TechnicianServicesStore {
  private services: TechnicianServiceItem[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const raw = localStorage.getItem(STORAGE_SERVICES_KEY);
      if (raw) {
        this.services = JSON.parse(raw);
      } else {
        this.services = [...INITIAL_SERVICES];
        this.save();
      }
    } catch {
      this.services = [...INITIAL_SERVICES];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(this.services));
    } catch (e) {
      console.error("Failed to save services", e);
    }
  }

  public getAllServices(): TechnicianServiceItem[] {
    // Return sorted: Blue Badge Verified first, then newest
    return [...this.services].sort((a, b) => {
      if (a.isBlueBadgeVerified && !b.isBlueBadgeVerified) return -1;
      if (!a.isBlueBadgeVerified && b.isBlueBadgeVerified) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getServicesByPublisher(publisherId: string): TechnicianServiceItem[] {
    return this.services.filter((s) => s.publisherId === publisherId);
  }

  /**
   * Publish a new service with strict daily limit checking:
   * - Must be publisher ($10/month subscription active)
   * - Unverified: max 10 services per day
   * - Blue Badge Verified ($10/month): Unlimited services (∞)
   */
  public publishService(
    user: User,
    payload: AddServicePayload
  ): { success: boolean; service?: TechnicianServiceItem; error?: string; requiresBlueBadge?: boolean } {
    if (user.accountType !== "publisher" || !user.isPublisherActive) {
      return {
        success: false,
        error: "يجب تفعيل حساب 'ناشر' (10 دولار شهرياً) لتتمكن من نشر وعرض خدمات الصيانة للعملاء في محيط عملك.",
      };
    }

    const dailyLimit = 10;
    const currentCount = user.dailyPublishedCount || 0;

    // Check limit if not blue badge verified
    if (!user.isBlueBadgeVerified && currentCount >= dailyLimit) {
      return {
        success: false,
        requiresBlueBadge: true,
        error: `لقد استنفدت الحد اليومي المسموح به للحساب العادي (${dailyLimit} خدمات يومياً). لنشر أكثر من 10 خدمات يومياً وعرض خدمات بدون توقف وبعدد لانهائي، وثّق حسابك بالشارة الزرقاء مقابل 10 دولار شهرياً.`,
      };
    }

    const newService: TechnicianServiceItem = {
      id: `srv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      publisherId: user.id,
      publisherName: user.name,
      publisherWorkshop: user.workshopName,
      publisherPhone: payload.publisherPhone || user.phone || "+966 50 000 0000",
      isBlueBadgeVerified: !!user.isBlueBadgeVerified,
      nationality: user.nationality || "سعودي",
      country: payload.country || user.country,
      city: payload.city || user.city,
      village: payload.village || user.village,
      workPerimeter: payload.workPerimeter || user.workPerimeter,
      title: payload.title.trim(),
      description: payload.description.trim(),
      category: payload.category,
      deviceBrand: payload.deviceBrand.trim(),
      priceUsd: Number(payload.priceUsd) || 10,
      estimatedTime: payload.estimatedTime.trim() || "30 دقيقة",
      createdAt: new Date().toISOString().split("T")[0],
      viewsCount: 1,
    };

    this.services.unshift(newService);
    this.save();

    // Increment user daily published count in authService
    authService.incrementDailyPublish(user.id);

    return {
      success: true,
      service: newService,
    };
  }

  public deleteService(serviceId: string, userId: string): boolean {
    const idx = this.services.findIndex((s) => s.id === serviceId && s.publisherId === userId);
    if (idx !== -1) {
      this.services.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }
}

export const technicianServicesStore = new TechnicianServicesStore();
