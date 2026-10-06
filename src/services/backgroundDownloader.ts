import { BackgroundFileItem, ESSENTIAL_BACKGROUND_FILES } from "../data/driversAndToolsData";

type ProgressListener = (files: BackgroundFileItem[], totalProgress: number, isDownloading: boolean, speedMb: number) => void;

class BackgroundDownloaderService {
  private files: BackgroundFileItem[] = [];
  private listeners: Set<ProgressListener> = new Set();
  private isDownloading: boolean = false;
  private currentSpeedMb: number = 0;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem("yaz_pro_background_files");
      if (saved) {
        this.files = JSON.parse(saved);
      } else {
        // Start by default with all essential files pre-loading in background
        this.files = ESSENTIAL_BACKGROUND_FILES.map((f) => ({
          ...f,
          status: f.isEssential ? "ready" : "cached",
          progress: 100,
        }));
      }
    } catch {
      this.files = [...ESSENTIAL_BACKGROUND_FILES];
    }
  }

  private persist() {
    try {
      localStorage.setItem("yaz_pro_background_files", JSON.stringify(this.files));
    } catch {
      // ignore
    }
  }

  private notify() {
    const total = this.files.reduce((acc, f) => acc + f.progress, 0);
    const avgProgress = Math.round(total / (this.files.length || 1));
    this.listeners.forEach((cb) => cb([...this.files], avgProgress, this.isDownloading, this.currentSpeedMb));
  }

  public getFiles(): BackgroundFileItem[] {
    return [...this.files];
  }

  public getReadyCount(): number {
    return this.files.filter((f) => f.progress === 100).length;
  }

  public getTotalCount(): number {
    return this.files.length;
  }

  public getTotalSizeMb(): number {
    return this.files.reduce((acc, f) => acc + f.sizeMb, 0);
  }

  public onUpdate(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    const total = this.files.reduce((acc, f) => acc + f.progress, 0);
    const avgProgress = Math.round(total / (this.files.length || 1));
    listener([...this.files], avgProgress, this.isDownloading, this.currentSpeedMb);
    return () => this.listeners.delete(listener);
  }

  /**
   * Start or resume background download of all pending files
   */
  public startBackgroundDownloadAll() {
    if (this.isDownloading) return;
    this.isDownloading = true;
    this.currentSpeedMb = 48.5; // High-speed fiber download simulation

    // Set all pending files to downloading
    this.files = this.files.map((f) => {
      if (f.progress < 100) {
        return { ...f, status: "downloading" as const };
      }
      return f;
    });
    this.notify();

    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      let allDone = true;
      let activeDownloads = 0;

      this.files = this.files.map((file) => {
        if (file.progress < 100) {
          allDone = false;
          activeDownloads++;
          const increment = Math.floor(Math.random() * 15) + 12; // fast chunk download
          const newProgress = Math.min(100, file.progress + increment);
          const newStatus = newProgress === 100 ? ("ready" as const) : ("downloading" as const);
          return {
            ...file,
            progress: newProgress,
            status: newStatus,
            downloadSpeedMb: newProgress === 100 ? 0 : 35 + Math.floor(Math.random() * 25),
          };
        }
        return file;
      });

      if (allDone) {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.isDownloading = false;
        this.currentSpeedMb = 0;
        this.persist();
      } else {
        this.currentSpeedMb = 42 + Math.floor(Math.random() * 20);
      }

      this.notify();
    }, 400);
  }

  /**
   * Download a single file individually in background
   */
  public downloadSingleFile(fileId: string) {
    this.files = this.files.map((f) => {
      if (f.id === fileId) {
        return { ...f, status: "downloading" as const, progress: 5 };
      }
      return f;
    });
    this.startBackgroundDownloadAll();
  }

  /**
   * Pre-load all files immediately to 100% (Instant Background Sync)
   */
  public preloadAllInstant() {
    this.files = this.files.map((f) => ({
      ...f,
      status: "ready" as const,
      progress: 100,
      downloadSpeedMb: 0,
    }));
    this.isDownloading = false;
    this.currentSpeedMb = 0;
    this.persist();
    this.notify();
  }

  /**
   * Export or generate a downloaded file package for local storage / PC
   */
  public exportFileForTechnician(file: BackgroundFileItem) {
    const fakeContent = `GD GSM AUTO-GENERATED PACKAGE\nPackage Name: ${file.name}\nVersion: ${file.version}\nChecksum MD5: ${file.checksumMd5}\nTarget Chipset: ${file.chipsetOrBrand}\n\n[PACKAGE INTEGRITY VERIFIED - READY FOR HARDWARE FLASHING]`;
    const blob = new Blob([fakeContent], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.id}_${file.name.replace(/\s+/g, "_")}.${file.fileFormat.includes("EXE") ? "exe" : file.fileFormat.includes("APK") ? "apk" : file.fileFormat.includes("ELF") ? "elf" : file.fileFormat.includes("BIN") ? "bin" : "zip"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const backgroundDownloader = new BackgroundDownloaderService();
