import { ErrorCodeData } from "../types";

export const ERROR_CODES_DB: ErrorCodeData[] = [
  {
    code: "Odin FAIL! (Auth / PIT / Setup Connection)",
    platform: "Samsung Odin",
    descriptionAr: "فشل أودين في بدء بروتوكول المصادقة مع وضع الداونلود (Loke) أو عدم تطابق ملف PIT لجدول البارتشنات.",
    descriptionEn: "Odin failed to establish secure communication with Loke/Download mode or partition layout mismatched.",
    solutionAr: "تأكد من رقم الحماية (Binary U/S/B) في وضع الداونلود - يجب أن يكون الروم مساوياً أو أعلى من حماية الجهاز. استخدم كابل أصلي ومنفذ USB خلفي.",
    solutionEn: "Check device binary (SW REV CHECK). Flash matching or higher binary firmware with official Samsung USB driver v1.7.59.",
  },
  {
    code: "BROM ERROR : S_BROM_DOWNLOAD_EXCEPTION (0x3E7 / 1011)",
    platform: "MediaTek BROM",
    descriptionAr: "معالج ميديا تك رفض الاتصال لأن حماية البوت لودر الصلبة (SLA / DAA Security Challenge) مفعلة.",
    descriptionEn: "MediaTek SoC rejected download agent because secure boot SLA / DAA auth handshake is active.",
    solutionAr: "استخدم نقطة التيست بوينت (CLK to GND) لتجاوز حماية SLA/DAA أو استخدم ملف DA المخصص MTK_AllInOne_DA_v6.bin.",
    solutionEn: "Bridge CLK test point to GND to bypass SLA/DAA or use custom authenticated DA agent.",
  },
  {
    code: "FAILED (remote: 'Flashing is not allowed in Lock State')",
    platform: "Fastboot",
    descriptionAr: "البوت لودر في حالة القفل (Locked) وتفليش البارتشنات المخصصة ممنوع.",
    descriptionEn: "The device bootloader is locked or partition table is protected by OEM security flags.",
    solutionAr: "قم بفك البوت لودر عبر أمر fastboot oem unlock أو fastboot flashing unlock مع تفعيل OEM Unlocking في خيارات المطورين.",
    solutionEn: "Unlock bootloader using 'fastboot flashing unlock' after enabling OEM Unlocking in Developer Options.",
  },
  {
    code: "Sahara Server Handshake Failed / Error 4004",
    platform: "Qualcomm EDL 9008",
    descriptionAr: "جهاز كوالكوم في وضع 9008 لم يستجب لحزم بروتوكول Sahara أو تم إرسال ملف Firehose غير متوافق مع نوع الذاكرة UFS/eMMC.",
    descriptionEn: "Qualcomm device in 9008 mode failed to send Sahara packet response or rejected programmer ELF/MBN.",
    solutionAr: "اختر ملف مبرمج Firehose (prog_firehose_ddr.elf) المطابق لرقم المعالج بالضبط، وتأكد من كابل EDL 9008 ذو المقاومة.",
    solutionEn: "Select matching Firehose ELF programmer for target chipset and verify UFS power rails.",
  },
  {
    code: "iTunes / Finder Error 4013 (NAND / Baseband)",
    platform: "Apple iOS",
    descriptionAr: "انقطاع الاتصال المفاجئ أثناء التفليش في مرحلة انتظار استجابة الناند (NAND) أو آي سي البيسباند.",
    descriptionEn: "Unexpected disconnect during restore when attempting to communicate with NAND flash or baseband PMIC.",
    solutionAr: "افصل فلاتة السماعة العلوية وسنسور البروكسيميتي (Flood Illuminator) أولاً لأنها تسبب شورت على مسار I2C0، أو أعد شبلنة ذاكرة NAND.",
    solutionEn: "Disconnect ear speaker flex (shorted flood illuminator on I2C0 bus) or reball/replace NAND flash.",
  },
  {
    code: "SW REV. CHECK FAIL : [boot] Fused 3 > Binary 2",
    platform: "Samsung Bootloader",
    descriptionAr: "محاولة الرجوع (Downgrade) إلى إصدار حماية أقدم، وهو مرفوض ومحمي بفيوزات المعالج e-Fuse.",
    descriptionEn: "Attempting to flash an older bootloader security binary than the fused e-Fuse value in the device.",
    solutionAr: "حمّل روم رسمي يحتوي على حماية Binary 3 أو أعلى حصراً (لا يمكن الرجوع إلى Binary 2 بعد احتراق الفيوز).",
    solutionEn: "Download and flash firmware binary 3 or higher. Downgrading blown e-Fuse binaries is prevented by hardware.",
  },
];
