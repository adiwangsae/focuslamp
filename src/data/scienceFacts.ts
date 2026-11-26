import { ScienceFact } from '../types';

export const SCIENCE_FACTS: ScienceFact[] = [
  {
    id: 'fact_ward_2017',
    category: 'Attention',
    titleEn: 'Smartphone Presence & Available Cognitive Capacity',
    titleId: 'Kehadiran Ponsel & Kapasitas Kognitif',
    summaryEn:
      'Controlled experiments found that even when a smartphone is turned off or face-down on a desk, its mere presence in sight measurably reduces available working memory and fluid intelligence compared with keeping the phone in another room or docked out of reach.',
    summaryId:
      'Eksperimen terkontrol menunjukkan bahwa meskipun ponsel dimatikan atau diletakkan terbalik di meja, keberadaannya yang masih terlihat dapat menurunkan kapasitas memori kerja yang tersedia dibandingkan saat disimpan di luar jangkauan.',
    sourceTitle:
      'Brain Drain: The Mere Presence of One’s Own Smartphone Reduces Available Cognitive Capacity',
    authorOrInstitution: 'Adrian F. Ward et al., University of Texas at Austin (JACR)',
    year: 2017,
    verifiedUrl: 'https://doi.org/10.1086/691462',
  },
  {
    id: 'fact_mark_2008',
    category: 'Attention',
    titleEn: 'The Cost of Interrupted Work & Task Switching',
    titleId: 'Biaya Gangguan Kerja & Perpindahan Tugas',
    summaryEn:
      'Field observations of knowledge workers showed that after an external interruption, people often take over 20 minutes to fully return to the original task trajectory, and report higher perceived workload and frustration.',
    summaryId:
      'Observasi lapangan menunjukkan bahwa setelah gangguan eksternal terjadi, seseorang sering memerlukan lebih dari 20 menit untuk kembali ke alur tugas semula, disertai peningkatan beban kerja yang dirasakan.',
    sourceTitle: 'The Cost of Interrupted Work: More Speed and Stress',
    authorOrInstitution: 'Gloria Mark, Daniela Gudith, & Ulrich Klocke (UC Irvine / CHI)',
    year: 2008,
    verifiedUrl: 'https://doi.org/10.1145/1357054.1357072',
  },
  {
    id: 'fact_kaplan_1995',
    category: 'Environment',
    titleEn: 'Directed Attention Fatigue & Restorative Breaks',
    titleId: 'Kelelahan Perhatian Terarah & Jeda Pemulihan',
    summaryEn:
      'Attention Restoration Theory proposes that prolonged directed focus depletes inhibitory control over distractions. Short restorative breaks away from screens help replenish directed attention mechanisms before the next study block.',
    summaryId:
      'Teori Pemulihan Perhatian menjelaskan bahwa fokus terarah yang berkepanjangan menguras kontrol atas distraksi. Jeda singkat jauh dari layar membantu memulihkan kapasitas perhatian sebelum blok belajar berikutnya.',
    sourceTitle: 'The Restorative Benefits of Nature: Toward an Integrative Framework',
    authorOrInstitution: 'Stephen Kaplan, University of Michigan (Journal of Environmental Psychology)',
    year: 1995,
    verifiedUrl: 'https://doi.org/10.1016/0272-4944(95)90001-2',
  },
  {
    id: 'fact_figueiro_2017',
    category: 'Circadian',
    titleEn: 'Task Lighting & Evening Alertness Balance',
    titleId: 'Pencahayaan Belajar & Keseimbangan Ritme Sirkadian',
    summaryEn:
      'Circadian lighting research indicates that higher short-wavelength (cool) light supports daytime alertness, while warmer lower-CCT task lighting in the evening helps limit circadian phase delay before sleep.',
    summaryId:
      'Riset pencahayaan sirkadian menunjukkan cahaya sejuk mendukung kewaspadaan di siang hari, sedangkan cahaya hangat di malam hari membantu mengurangi penundaan ritme tidur.',
    sourceTitle: 'The Impact of Daytime Light Exposures on Sleep and Mood in Office Workers',
    authorOrInstitution: 'Mariana G. Figueiro et al., Lighting Research Center (RPI)',
    year: 2017,
    verifiedUrl: 'https://doi.org/10.1016/j.sleh.2017.03.005',
  },
  {
    id: 'fact_dunlosky_2013',
    category: 'Memory',
    titleEn: 'Distributed Practice Over Last-Minute Cramming',
    titleId: 'Latihan Terdistribusi Dibandingkan Sistem Kebut Semalam',
    summaryEn:
      'A comprehensive review of 10 learning techniques rated distributed practice (spacing shorter study sessions across multiple days) and practice testing as having high utility for durable long-term recall.',
    summaryId:
      'Tinjauan komprehensif terhadap 10 teknik belajar menilai latihan terdistribusi (membagi sesi belajar di beberapa hari) dan latihan pengujian mandiri memiliki utilitas tertinggi untuk daya ingat jangka panjang.',
    sourceTitle:
      'Improving Students’ Learning With Effective Learning Techniques: Promising Directions From Cognitive and Educational Psychology',
    authorOrInstitution: 'John Dunlosky et al., Kent State University (Psychological Science in the Public Interest)',
    year: 2013,
    verifiedUrl: 'https://doi.org/10.1177/1529100612453266',
  },
  {
    id: 'fact_diekelmann_2010',
    category: 'Sleep',
    titleEn: 'Sleep Supports Long-Term Memory Consolidation',
    titleId: 'Tidur Mendukung Konsolidasi Memori Jangka Panjang',
    summaryEn:
      'Neuroscience research indicates that slow-wave and REM sleep play complementary roles in stabilizing newly encoded declarative and procedural memories after daytime study.',
    summaryId:
      'Riset neurosains menunjukkan bahwa fase tidur gelombang lambat dan REM berperan dalam menstabilkan memori deklaratif dan prosedural yang baru dipelajari di siang hari.',
    sourceTitle: 'The memory function of sleep',
    authorOrInstitution: 'Susanne Diekelmann & Jan Born, University of Lübeck (Nature Reviews Neuroscience)',
    year: 2010,
    verifiedUrl: 'https://doi.org/10.1038/nrn2762',
  },
  {
    id: 'fact_roediger_2006',
    category: 'Learning',
    titleEn: 'Active Recall Strengthens Retention Beyond Re-Reading',
    titleId: 'Mengingat Aktif Menguatkan Retensi Melampaui Membaca Ulang',
    summaryEn:
      'Testing memory via active recall—even without immediate feedback—produces stronger long-term retention over days than passive repeated reading of the same study notes.',
    summaryId:
      'Menguji ingatan secara aktif (active recall) menghasilkan daya ingat jangka panjang yang lebih kuat dibandingkan membaca ulang catatan yang sama secara berulang.',
    sourceTitle: 'Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention',
    authorOrInstitution: 'Henry L. Roediger III & Jeffrey D. Karpicke (Psychological Science)',
    year: 2006,
    verifiedUrl: 'https://doi.org/10.1111/j.1467-9280.2006.01693.x',
  },
];
