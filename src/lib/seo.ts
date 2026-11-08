import pages from '../data/keyword-map.json';
export function getPageSeo(path: string) {
  const page = pages.find(item => item.path === path);
  if (!page) throw new Error(`Missing SEO mapping: ${path}`);
  return page;
}
export const serviceGroups = [
  { id: 'home', title: 'شفاطات المطابخ المنزلية', text: 'اختر نوع الجهاز وموضعه قبل تجهيز فتحة القص أو مسار الطرد.' },
  { id: 'ventilation', title: 'تهوية الحمامات والشفط المركزي والبلاورات', text: 'ابدأ بوظيفة النظام ونقاط السحب وطبيعة الهواء ومقاومة الشبكة.' },
  { id: 'commercial', title: 'هود ومداخن المطاعم', text: 'راجع معدات الطهي والهود والدكت والبلاور وهواء التعويض معاً.' },
  { id: 'ducts', title: 'مجاري الهواء ودكت التهوية والتكييف', text: 'حدد استخدام الدكت والخامة والمقاطع والوصلات والعزل وفق المشروع.' },
  { id: 'maintenance', title: 'الصيانة والتنظيف', text: 'ميّز بين إصلاح الجهاز وتنظيف الدهون وتشخيص أعطال مراوح الشبكات.' }
];
