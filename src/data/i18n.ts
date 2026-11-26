import { Language } from '../types';

export interface CopyDictionary {
  nav: {
    features: string;
    howItWorks: string;
    about: string;
    login: string;
    getStarted: string;
    focus: string;
    dashboard: string;
    home: string;
    device: string;
    profile: string;
    notifications: string;
  };
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    primaryCta: string;
    secondaryCta: string;
    featuresHeading: string;
    featuresSubheading: string;
    howHeading: string;
    analyticsHeading: string;
    analyticsSubheading: string;
    aboutHeading: string;
    aboutBody: string;
    footerTagline: string;
    footerCopyright: string;
  };
  auth: {
    authLandingTitle: string;
    authLandingSubtitle: string;
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    forgotTitle: string;
    forgotSubtitle: string;
    resetTitle: string;
    resetSubtitle: string;
    verifyTitle: string;
    verifySubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    newPasswordLabel: string;
    fullNameLabel: string;
    rememberMe: string;
    forgotLink: string;
    loginButton: string;
    registerButton: string;
    sendResetButton: string;
    updatePasswordButton: string;
    verifyNowButton: string;
    resendVerificationButton: string;
    demoQuickTitle: string;
    termsLabel: string;
    privacyLabel: string;
    marketingLabel: string;
    noAccount: string;
    haveAccount: string;
    backToLogin: string;
    resetSentTitle: string;
    resetSentBody: string;
  };
  onboarding: {
    title: string;
    subtitle: string;
    stepOf: string;
    skipOptional: string;
    next: string;
    back: string;
    finish: string;
  };
  home: {
    quickFocusTitle: string;
    startSession: string;
    resumeSession: string;
    deviceCardTitle: string;
    todaysProgressTitle: string;
    focusMinutes: string;
    completedSessions: string;
    dailyTarget: string;
    aiInsightTitle: string;
    openAiPage: string;
    gamificationTitle: string;
    recentActivityTitle: string;
    viewAllAnalytics: string;
  };
  focus: {
    setupTitle: string;
    setupSubtitle: string;
    durationLabel: string;
    customDurationLabel: string;
    prototypeLimitNote: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    deviceReadiness: string;
    dockRequiredWarning: string;
    startFocus: string;
    activeSessionTitle: string;
    endSession: string;
    demoControlsTitle: string;
    demoControlsHint: string;
    resultTitle: string;
    actualFocusLabel: string;
    awayTimeLabel: string;
    statusLabel: string;
    xpEarnedLabel: string;
    reflectionLabel: string;
    reflectionPlaceholder: string;
    saveReflection: string;
    returnHome: string;
    startAnother: string;
  };
  device: {
    title: string;
    subtitle: string;
    simBanner: string;
    connectionLabel: string;
    lampLabel: string;
    dockLabel: string;
    presenceLabel: string;
    networkLabel: string;
    ambientLabel: string;
    simControlsTitle: string;
    techDetailsTitle: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    exportCsv: string;
    searchPlaceholder: string;
    allStatuses: string;
    behaviorTitle: string;
    sensorDisclaimer: string;
    monthlyProgressTitle: string;
    monthlyProgressSubtitle: string;
    mlSectionTitle: string;
    mlDisclaimer: string;
    historyTitle: string;
    noSessionsFound: string;
  };
  ai: {
    title: string;
    subtitle: string;
    simDisclaimer: string;
    tabInsights: string;
    tabTips: string;
    tabMotivation: string;
    tabFacts: string;
    insufficientTitle: string;
    insufficientBody: string;
    chatTitle: string;
    chatPlaceholder: string;
    send: string;
    openFullPage: string;
    back: string;
    newChat: string;
    historyTitle: string;
    modeChat: string;
    modeInsights: string;
    statusLabel: string;
    jumpToLatest: string;
    messagesCount: string;
    unavailableTitle: string;
    retry: string;
  };
  profile: {
    title: string;
    subtitle: string;
    accountSection: string;
    preferencesSection: string;
    languageLabel: string;
    themeLabel: string;
    light: string;
    dark: string;
    defaultDurationLabel: string;
    dailyTargetLabel: string;
    retentionLabel: string;
    notificationsSection: string;
    securityTitle: string;
    securityBody: string;
    logout: string;
    achievementsTitle: string;
    resetDemoData: string;
  };
  common: {
    connected: string;
    disconnected: string;
    connecting: string;
    reconnecting: string;
    connectionFailed: string;
    ready: string;
    docked: string;
    notDocked: string;
    present: string;
    away: string;
    on: string;
    off: string;
    demoDataBadge: string;
    level: string;
    streakDays: string;
    markAllRead: string;
    noNotifications: string;
    close: string;
    verified: string;
    unverified: string;
  };
}

export const COPY: Record<Language, CopyDictionary> = {
  en: {
    nav: {
      features: 'Features',
      howItWorks: 'How It Works',
      about: 'About',
      login: 'Log In',
      getStarted: 'Get Started',
      focus: 'Focus',
      dashboard: 'Dashboard',
      home: 'Home',
      device: 'Device',
      profile: 'Profile',
      notifications: 'Notifications',
    },
    landing: {
      heroTitle: 'Build Better Focus Habits.',
      heroSubtitle:
        'Understand your study patterns, reduce digital distractions, and make every focused session count.',
      primaryCta: 'Get Started',
      secondaryCta: 'Learn More',
      featuresHeading: 'Designed around intentional desk study',
      featuresSubheading:
        'FocusLamp pairs a physical phone-docking study lamp with calm session tracking, behavioral insights, and habit reinforcement.',
      howHeading: 'How FocusLamp works',
      analyticsHeading: 'Progress and Analytics Overview',
      analyticsSubheading:
        'Clear weekly charts, monthly habit summaries, and transparent session logs derived directly from your study records.',
      aboutHeading: 'Built for students managing real digital noise',
      aboutBody:
        'Instead of noisy productivity timers or intrusive monitoring, FocusLamp uses a physical phone dock and ambient task lighting to mark when study begins—giving you honest metrics on time at the desk while respecting that sensors never read your mind.',
      footerTagline: 'Smart Study Lamp Ecosystem · Interactive Prototype',
      footerCopyright: '© 2026 FocusLamp Prototype. Demonstration build without active hardware.',
    },
    auth: {
      authLandingTitle: 'Welcome to FocusLamp',
      authLandingSubtitle:
        'Sign in with an existing student account, try a populated demo profile, or create a new account.',
      loginTitle: 'Welcome back to FocusLamp',
      loginSubtitle: 'Sign in with a demo student profile or your created session account.',
      registerTitle: 'Create your FocusLamp account',
      registerSubtitle:
        'Create your personal FocusLamp account to track focus sessions and study habits.',
      forgotTitle: 'Reset your password',
      forgotSubtitle: 'Enter your email to generate a simulated 30-minute recovery token.',
      resetTitle: 'Choose a new password',
      resetSubtitle: 'Use your simulated recovery token before it expires.',
      verifyTitle: 'Verify your email address',
      verifySubtitle: 'Confirm ownership of your account email within the simulated 24-hour window.',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm Password',
      newPasswordLabel: 'New Password',
      fullNameLabel: 'Full Name',
      rememberMe: 'Remember my email on this browser',
      forgotLink: 'Forgot password?',
      loginButton: 'Log In',
      registerButton: 'Create Account',
      sendResetButton: 'Send Recovery Link',
      updatePasswordButton: 'Update Password',
      verifyNowButton: 'Confirm Verification',
      resendVerificationButton: 'Resend Verification Email',
      demoQuickTitle: 'Try a pre-populated demo student profile',
      termsLabel: 'I accept the FocusLamp Terms and Conditions (required)',
      privacyLabel: 'I acknowledge the FocusLamp Privacy Policy (required)',
      marketingLabel: 'Receive occasional study research updates (optional)',
      noAccount: 'New to FocusLamp?',
      haveAccount: 'Already have an account?',
      backToLogin: 'Back to Log In',
      resetSentTitle: 'Recovery simulation ready',
      resetSentBody:
        'A simulated single-use token valid for 30 minutes has been issued for this account.',
    },
    onboarding: {
      title: 'Welcome to FocusLamp',
      subtitle: 'Three quick principles behind your smart study desk ecosystem.',
      stepOf: 'Slide',
      skipOptional: 'Skip intro',
      next: 'Next',
      back: 'Back',
      finish: 'Get Started',
    },
    home: {
      quickFocusTitle: 'Quick Focus',
      startSession: 'Start Focus Session',
      resumeSession: 'View Active Session',
      deviceCardTitle: 'Device Status',
      todaysProgressTitle: "Today's Progress",
      focusMinutes: 'Focus Minutes',
      completedSessions: 'Completed',
      dailyTarget: 'Daily Target',
      aiInsightTitle: 'FocusMate AI Insight',
      openAiPage: 'Open FocusMate AI',
      gamificationTitle: 'Habit & Level Progress',
      recentActivityTitle: 'Recent Activity',
      viewAllAnalytics: 'View Full Analytics',
    },
    focus: {
      setupTitle: 'Focus Setup',
      setupSubtitle: 'Prepare your desk, dock your phone, and choose a study block.',
      durationLabel: 'Session Duration',
      customDurationLabel: 'Custom minutes',
      prototypeLimitNote:
        'Prototype range: 1–60 minutes (aligned with current FL-01 firmware prototype bounds).',
      subjectLabel: 'Study Topic (Optional)',
      subjectPlaceholder: 'e.g. Algorithms, Calculus, Essay Draft',
      deviceReadiness: 'Device Readiness',
      dockRequiredWarning:
        'Phone must be placed on the FocusLamp FL-01 dock before starting a session.',
      startFocus: 'Start Focus',
      activeSessionTitle: 'Focus Session in Progress',
      endSession: 'End Session',
      demoControlsTitle: 'Demo Controls (Hardware Event Simulator)',
      demoControlsHint:
        'Simulate physical sensor and Bluetooth events for demonstration. Not shown as normal user controls.',
      resultTitle: 'Session Summary',
      actualFocusLabel: 'Actual Focus Time',
      awayTimeLabel: 'Excluded Away Time',
      statusLabel: 'Final Status',
      xpEarnedLabel: 'XP Earned',
      reflectionLabel: 'Optional Study Reflection',
      reflectionPlaceholder: 'What did you complete or notice during this study block?',
      saveReflection: 'Save Note',
      returnHome: 'Return Home',
      startAnother: 'New Focus Session',
    },
    device: {
      title: 'FocusLamp FL-01 Device',
      subtitle: 'Simulated hardware telemetry, dock state, and lighting controls.',
      simBanner:
        'Simulated Hardware Interface: No live Bluetooth LE or Android DND bridge is active in this browser.',
      connectionLabel: 'BLE Connection',
      lampLabel: 'Task Lamp',
      dockLabel: 'Phone Dock',
      presenceLabel: 'Desk Presence Sensor',
      networkLabel: 'Wi-Fi Telemetry Sync',
      ambientLabel: 'Ambient Light',
      simControlsTitle: 'Device Simulation Controls',
      techDetailsTitle: 'Technical Specifications & Firmware Diagnostics',
    },
    dashboard: {
      title: 'Study Analytics',
      subtitle: 'Metrics and charts derived directly from your recorded session history.',
      exportCsv: 'Export CSV',
      searchPlaceholder: 'Search by subject, date, or reflection...',
      allStatuses: 'All Statuses',
      behaviorTitle: 'Behavioral Sensor Summary',
      sensorDisclaimer:
        'Note: Physical presence and dock sensors measure desk presence and phone placement—they never claim to directly measure cognitive attention.',
      monthlyProgressTitle: 'Monthly Progress (Rolling 4 Weeks)',
      monthlyProgressSubtitle: 'Focus minutes and completed sessions across the last 28 days.',
      mlSectionTitle: 'ML Results (Demonstration Data)',
      mlDisclaimer:
        'Demonstration ML summary derived from session history. No live model accuracy or confidence score is fabricated.',
      historyTitle: 'Session History',
      noSessionsFound: 'No sessions match the selected filters.',
    },
    ai: {
      title: 'FocusMate AI',
      subtitle: 'Interactive study coach, behavioral pattern analysis, and verified focus science.',
      simDisclaimer:
        'Prototype AI Transparency: Live chat uses the configured AI model when available; behavioral insights are deterministically computed from your logged session records.',
      tabInsights: 'Personalized Insights',
      tabTips: 'Study Tips',
      tabMotivation: 'Motivation',
      tabFacts: 'Science & Fun Facts',
      insufficientTitle: 'Personalized insights not yet available',
      insufficientBody:
        'Log at least 3 focus sessions so FocusMate AI has enough sample records to detect reliable behavioral patterns.',
      chatTitle: 'FocusMate Assistant',
      chatPlaceholder: 'Ask about your focus data, streaks, or study methods...',
      send: 'Send',
      openFullPage: 'Open Full Page',
      back: 'Back',
      newChat: 'New chat',
      historyTitle: 'Conversations',
      modeChat: 'Chat',
      modeInsights: 'Insights & Science',
      statusLabel: 'FocusMate AI',
      jumpToLatest: 'Jump to latest',
      messagesCount: 'msgs',
      unavailableTitle: 'AI service temporarily unavailable',
      retry: 'Retry',
    },
    profile: {
      title: 'Profile & Settings',
      subtitle: 'Manage preferences, notification retention, 26 achievements, and demo security.',
      accountSection: 'Account Information',
      preferencesSection: 'Study & Display Preferences',
      languageLabel: 'Language',
      themeLabel: 'Appearance Theme',
      light: 'Light',
      dark: 'Dark',
      defaultDurationLabel: 'Default Focus Duration',
      dailyTargetLabel: 'Daily Focus Target',
      retentionLabel: 'Notification Retention',
      notificationsSection: 'Notification & Sensor Preferences',
      securityTitle: 'Prototype Security & Privacy Notice',
      securityBody:
        'This interactive demo uses client-side simulated authentication and mock user data. Production deployment requires FastAPI backend authentication, server-side authorization, HTTPS, rate limiting, and strict per-user database isolation.',
      logout: 'Log Out',
      achievementsTitle: 'Achievements (26 Milestones)',
      resetDemoData: 'Reset Demo Data',
    },
    common: {
      connected: 'Connected',
      disconnected: 'Disconnected',
      connecting: 'Connecting...',
      reconnecting: 'Reconnecting...',
      connectionFailed: 'Connection Failed',
      ready: 'Ready',
      docked: 'Phone Docked',
      notDocked: 'Not Docked',
      present: 'User Present',
      away: 'Away from Desk',
      on: 'On',
      off: 'Off',
      demoDataBadge: 'Demonstration Data',
      level: 'Level',
      streakDays: 'day streak',
      markAllRead: 'Mark all as read',
      noNotifications: 'You are all caught up.',
      close: 'Close',
      verified: 'Verified',
      unverified: 'Unverified',
    },
  },
  id: {
    nav: {
      features: 'Fitur',
      howItWorks: 'Cara Kerja',
      about: 'Tentang',
      login: 'Masuk',
      getStarted: 'Mulai',
      focus: 'Fokus',
      dashboard: 'Dasbor',
      home: 'Beranda',
      device: 'Perangkat',
      profile: 'Profil',
      notifications: 'Notifikasi',
    },
    landing: {
      heroTitle: 'Bangun Kebiasaan Fokus Lebih Baik.',
      heroSubtitle:
        'Pahami pola belajar Anda, kurangi gangguan digital, dan buat setiap sesi fokus lebih bermakna.',
      primaryCta: 'Mulai Sekarang',
      secondaryCta: 'Pelajari Lebih Lanjut',
      featuresHeading: 'Dirancang untuk belajar yang penuh kesadaran',
      featuresSubheading:
        'FocusLamp memadukan lampu belajar pintar dengan dock ponsel, pelacakan sesi yang tenang, analitik perilaku, dan penguatan kebiasaan.',
      howHeading: 'Cara kerja FocusLamp',
      analyticsHeading: 'Ringkasan Progres dan Analitik',
      analyticsSubheading:
        'Grafik mingguan yang jelas, ringkasan bulanan, dan catatan sesi transparan yang dihitung langsung dari riwayat belajar Anda.',
      aboutHeading: 'Dibangun untuk mahasiswa menghadapi distraksi digital nyata',
      aboutBody:
        'Alih-alih pengatur waktu yang bising atau pemantauan yang mengganggu, FocusLamp menggunakan dock ponsel fisik dan pencahayaan meja untuk menandai waktu belajar—menyajikan metrik jujur tanpa mengklaim sensor dapat membaca pikiran.',
      footerTagline: 'Ekosistem Lampu Belajar Pintar · Prototipe Interaktif',
      footerCopyright: '© 2026 Prototipe FocusLamp. Simulasi demonstrasi tanpa perangkat keras aktif.',
    },
    auth: {
      authLandingTitle: 'Selamat Datang di FocusLamp',
      authLandingSubtitle:
        'Masuk dengan akun mahasiswa, coba profil demo siap pakai, atau buat akun baru.',
      loginTitle: 'Selamat datang kembali di FocusLamp',
      loginSubtitle: 'Masuk dengan profil mahasiswa demo atau akun yang Anda buat.',
      registerTitle: 'Buat akun FocusLamp Anda',
      registerSubtitle:
        'Buat akun FocusLamp pribadi Anda untuk mencatat sesi fokus dan kebiasaan belajar.',
      forgotTitle: 'Atur ulang kata sandi',
      forgotSubtitle: 'Masukkan email Anda untuk membuat token pemulihan simulasi 30 menit.',
      resetTitle: 'Buat kata sandi baru',
      resetSubtitle: 'Gunakan token pemulihan simulasi sebelum masa berlakunya habis.',
      verifyTitle: 'Verifikasi alamat email Anda',
      verifySubtitle: 'Konfirmasi kepemilikan email akun Anda dalam batas simulasi 24 jam.',
      emailLabel: 'Alamat Email',
      passwordLabel: 'Kata Sandi',
      confirmPasswordLabel: 'Konfirmasi Kata Sandi',
      newPasswordLabel: 'Kata Sandi Baru',
      fullNameLabel: 'Nama Lengkap',
      rememberMe: 'Ingat email saya di browser ini',
      forgotLink: 'Lupa kata sandi?',
      loginButton: 'Masuk',
      registerButton: 'Buat Akun',
      sendResetButton: 'Kirim Tautan Pemulihan',
      updatePasswordButton: 'Perbarui Kata Sandi',
      verifyNowButton: 'Konfirmasi Verifikasi',
      resendVerificationButton: 'Kirim Ulang Email Verifikasi',
      demoQuickTitle: 'Coba profil mahasiswa demo siap pakai',
      termsLabel: 'Saya menyetujui Ketentuan Layanan FocusLamp (wajib)',
      privacyLabel: 'Saya memahami Kebijakan Privasi FocusLamp (wajib)',
      marketingLabel: 'Terima pembaruan riset belajar sesekali (opsional)',
      noAccount: 'Baru di FocusLamp?',
      haveAccount: 'Sudah memiliki akun?',
      backToLogin: 'Kembali ke Masuk',
      resetSentTitle: 'Simulasi pemulihan siap',
      resetSentBody:
        'Token sekali pakai simulasi yang berlaku selama 30 menit telah dibuat untuk akun ini.',
    },
    onboarding: {
      title: 'Selamat Datang di FocusLamp',
      subtitle: 'Tiga prinsip utama di balik ekosistem meja belajar pintar Anda.',
      stepOf: 'Slide',
      skipOptional: 'Lewati pengenalan',
      next: 'Lanjut',
      back: 'Kembali',
      finish: 'Mulai Sekarang',
    },
    home: {
      quickFocusTitle: 'Fokus Cepat',
      startSession: 'Mulai Sesi Fokus',
      resumeSession: 'Lihat Sesi Aktif',
      deviceCardTitle: 'Status Perangkat',
      todaysProgressTitle: 'Progres Hari Ini',
      focusMinutes: 'Menit Fokus',
      completedSessions: 'Selesai',
      dailyTarget: 'Target Harian',
      aiInsightTitle: 'Wawasan FocusMate AI',
      openAiPage: 'Buka FocusMate AI',
      gamificationTitle: 'Progres Kebiasaan & Level',
      recentActivityTitle: 'Aktivitas Terbaru',
      viewAllAnalytics: 'Lihat Analitik Lengkap',
    },
    focus: {
      setupTitle: 'Pengaturan Fokus',
      setupSubtitle: 'Siapkan meja Anda, letakkan ponsel di dock, dan pilih durasi belajar.',
      durationLabel: 'Durasi Sesi',
      customDurationLabel: 'Menit kustom',
      prototypeLimitNote:
        'Rentang prototipe: 1–60 menit (sesuai batasan prototipe firmware FL-01 saat ini).',
      subjectLabel: 'Topik Belajar (Opsional)',
      subjectPlaceholder: 'mis. Algoritma, Kalkulus, Draf Esai',
      deviceReadiness: 'Kesiapan Perangkat',
      dockRequiredWarning:
        'Ponsel harus diletakkan di dock FocusLamp FL-01 sebelum memulai sesi.',
      startFocus: 'Mulai Fokus',
      activeSessionTitle: 'Sesi Fokus Sedang Berlangsung',
      endSession: 'Akhiri Sesi',
      demoControlsTitle: 'Kontrol Demo (Simulator Kejadian Perangkat)',
      demoControlsHint:
        'Simulasikan sensor fisik dan kejadian Bluetooth untuk demonstrasi. Tidak tampil sebagai kontrol pengguna biasa.',
      resultTitle: 'Ringkasan Sesi',
      actualFocusLabel: 'Waktu Fokus Aktual',
      awayTimeLabel: 'Waktu Meninggalkan Meja (Dikecualikan)',
      statusLabel: 'Status Akhir',
      xpEarnedLabel: 'XP Diperoleh',
      reflectionLabel: 'Refleksi Belajar (Opsional)',
      reflectionPlaceholder: 'Apa yang Anda selesaikan atau amati selama blok belajar ini?',
      saveReflection: 'Simpan Catatan',
      returnHome: 'Kembali ke Beranda',
      startAnother: 'Sesi Fokus Baru',
    },
    device: {
      title: 'Perangkat FocusLamp FL-01',
      subtitle: 'Telemetri perangkat simulasi, status dock, dan kontrol pencahayaan.',
      simBanner:
        'Antarmuka Perangkat Simulasi: Tidak ada koneksi BLE langsung atau Android DND aktif di browser ini.',
      connectionLabel: 'Koneksi BLE',
      lampLabel: 'Lampu Belajar',
      dockLabel: 'Dock Ponsel',
      presenceLabel: 'Sensor Kehadiran Meja',
      networkLabel: 'Sinkronisasi Wi-Fi',
      ambientLabel: 'Cahaya Sekitar',
      simControlsTitle: 'Kontrol Simulasi Perangkat',
      techDetailsTitle: 'Spesifikasi Teknis & Diagnostik Firmware',
    },
    dashboard: {
      title: 'Analitik Belajar',
      subtitle: 'Metrik dan grafik dihitung langsung dari riwayat sesi yang tercatat.',
      exportCsv: 'Ekspor CSV',
      searchPlaceholder: 'Cari topik, tanggal, atau refleksi...',
      allStatuses: 'Semua Status',
      behaviorTitle: 'Ringkasan Sensor Perilaku',
      sensorDisclaimer:
        'Catatan: Sensor kehadiran fisik dan dock hanya mencatat keberadaan di meja dan posisi ponsel—bukan pengukuran perhatian kognitif secara langsung.',
      monthlyProgressTitle: 'Progres Bulanan (4 Minggu Terakhir)',
      monthlyProgressSubtitle: 'Menit fokus dan sesi selesai selama 28 hari terakhir.',
      mlSectionTitle: 'Hasil ML (Data Demonstrasi)',
      mlDisclaimer:
        'Ringkasan ML demonstrasi dari riwayat sesi. Tidak ada akurasi model atau skor kepercayaan yang direkayasa.',
      historyTitle: 'Riwayat Sesi',
      noSessionsFound: 'Tidak ada sesi yang sesuai dengan filter.',
    },
    ai: {
      title: 'FocusMate AI',
      subtitle: 'Asisten belajar interaktif, analisis pola perilaku, dan sains fokus terverifikasi.',
      simDisclaimer:
        'Transparansi AI Prototipe: Obrolan langsung memakai model AI terkonfigurasi bila tersedia; wawasan perilaku dihitung deterministik dari riwayat sesi.',
      tabInsights: 'Wawasan Personal',
      tabTips: 'Tips Belajar',
      tabMotivation: 'Motivasi',
      tabFacts: 'Fakta Sains & Menarik',
      insufficientTitle: 'Wawasan terpersonalisasi belum tersedia',
      insufficientBody:
        'Catat minimal 3 sesi fokus agar FocusMate AI memiliki sampel data yang cukup untuk mengenali pola perilaku Anda.',
      chatTitle: 'Asisten FocusMate',
      chatPlaceholder: 'Tanyakan tentang data fokus, streak, atau strategi belajar...',
      send: 'Kirim',
      openFullPage: 'Buka Halaman Penuh',
      back: 'Kembali',
      newChat: 'Obrolan baru',
      historyTitle: 'Riwayat Obrolan',
      modeChat: 'Obrolan',
      modeInsights: 'Wawasan & Sains',
      statusLabel: 'FocusMate AI',
      jumpToLatest: 'Ke pesan terbaru',
      messagesCount: 'pesan',
      unavailableTitle: 'Layanan AI sementara tidak tersedia',
      retry: 'Coba Lagi',
    },
    profile: {
      title: 'Profil & Pengaturan',
      subtitle: 'Kelola preferensi, retensi notifikasi, 26 pencapaian, dan info keamanan.',
      accountSection: 'Informasi Akun',
      preferencesSection: 'Preferensi Belajar & Tampilan',
      languageLabel: 'Bahasa',
      themeLabel: 'Tema Tampilan',
      light: 'Terang',
      dark: 'Gelap',
      defaultDurationLabel: 'Durasi Fokus Default',
      dailyTargetLabel: 'Target Fokus Harian',
      retentionLabel: 'Retensi Notifikasi',
      notificationsSection: 'Preferensi Notifikasi & Sensor',
      securityTitle: 'Pemberitahuan Keamanan & Privasi Prototipe',
      securityBody:
        'Demo interaktif ini menggunakan autentikasi simulasi sisi klien dan data contoh. Implementasi produksi memerlukan autentikasi backend FastAPI, otorisasi sisi server, HTTPS, pembatasan laju, dan isolasi data pengguna.',
      logout: 'Keluar',
      achievementsTitle: 'Pencapaian (26 Tonggak)',
      resetDemoData: 'Atur Ulang Data Demo',
    },
    common: {
      connected: 'Terhubung',
      disconnected: 'Terputus',
      connecting: 'Menghubungkan...',
      reconnecting: 'Menghubungkan Ulang...',
      connectionFailed: 'Koneksi Gagal',
      ready: 'Siap',
      docked: 'Ponsel di Dock',
      notDocked: 'Tidak di Dock',
      present: 'Pengguna Hadir',
      away: 'Meninggalkan Meja',
      on: 'Menyala',
      off: 'Mati',
      demoDataBadge: 'Data Demonstrasi',
      level: 'Level',
      streakDays: 'hari beruntun',
      markAllRead: 'Tandai semua dibaca',
      noNotifications: 'Semua notifikasi sudah dibaca.',
      close: 'Tutup',
      verified: 'Terverifikasi',
      unverified: 'Belum Verifikasi',
    },
  },
};
