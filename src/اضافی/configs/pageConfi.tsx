// // src/configs/pageConfigs.tsx

// import type { PageConfig } from '../types/page';
// import { 
//   Building2, 
//   Mail, 
//   MapPin, 
//   GraduationCap, 
//   Filter,
//   Paperclip,
//   FileText,
//   Calendar,
//   User,
//   Users,
//   Phone,
//   Eye,
//   Pencil,
//   Trash2,
//   Plus,
//   RefreshCw,
//   BookOpen
// } from 'lucide-react';
// import { useProvince } from '../hooks/useProvince';
// import { useCity } from '../hooks/useCity';
// import { useCommunication } from '../hooks/useCommunication';
// import { useUniversity } from '../hooks/useUniversity';
// import { useUniversityType } from '../hooks/useUniversityType';
// import type { Province, City, Communication, University } from '../types';
// import dateUtils from '../utils/dateUtils';
// import React from 'react';

// // ========== Helper ==========
// export const createPageConfig = <T extends any>(config: PageConfig<T>): PageConfig<T> => {
//   return config;
// };

// // ========== 1. Config استان ==========
// export const provincePageConfig = createPageConfig<Province>({
//   type: 'simple',
//   title: 'مدیریت استان‌ها',
//   subtitle: 'مدیریت و سازماندهی اطلاعات استان‌ها',
//   icon: Building2,
//   columns: [
//     {
//       field: 'name',
//       header: 'نام استان',
//       sortable: true,
//       render: (_, item) => (
//         <div className="province-name-cell">
//           <div className="province-icon-wrapper">
//             <Building2 size={18} className="province-icon" />
//           </div>
//           <div className="province-name fw-semibold">{item.name}</div>
//         </div>
//       )
//     },
//     {
//       field: 'cities_count',
//       header: 'تعداد شهرها',
//       sortable: true,
//       render: (value) => (
//         <div className="cities-count-cell">
//           <MapPin size={14} className="cities-icon" />
//           <span className="cities-count">{value || 0}</span>
//           <span className="cities-label">شهر</span>
//         </div>
//       )
//     },
//     {
//       field: 'created_at',
//       header: 'تاریخ ثبت',
//       sortable: true,
//       type: 'date',
//       render: (value) => value ? (
//         <div className="date-cell">
//           <span>{new Date(value).toLocaleDateString('fa-IR')}</span>
//         </div>
//       ) : '—'
//     }
//   ],
//   formFields: [
//     {
//       name: 'name',
//       label: 'نام استان',
//       type: 'text',
//       required: true,
//       colSize: 12,
//       placeholder: 'نام استان را وارد کنید...'
//     },
//   ],
//   useHook: useProvince,
//   stats: [
//     { key: 'total', label: 'کل استان‌ها', icon: Building2 },
//     { key: 'filtered', label: 'نتیجه فیلتر', icon: Filter },
//   ],
//   searchFields: ['name'],
//   filterConfigs: [],
// });

// // ========== 2. Config ارتباطات ==========
// export const communicationPageConfig = createPageConfig<Communication>({
//   type: 'simple',
//   title: 'مدیریت ارتباطات و مکاتبات',
//   subtitle: 'مدیریت نامه‌ها، ایمیل‌ها و مکاتبات اداری',
//   icon: Mail,
//   columns: [
//     {
//       field: 'title',
//       header: 'عنوان',
//       sortable: true,
//       render: (_, item) => (
//         <div className="communication-title-cell">
//           <div className="title-icon-wrapper">
//             <Mail size={18} className="title-icon" />
//           </div>
//           <div>
//             <div className="title-text fw-semibold">{item.title}</div>
//             <div className="title-sub">
//               <span className="sub-badge">
//                 <User size={10} /> {item.sender}
//               </span>
//               <span className="sub-badge">
//                 <Users size={10} /> {item.receiver}
//               </span>
//             </div>
//           </div>
//         </div>
//       )
//     },
//     {
//       field: 'date',
//       header: 'تاریخ',
//       sortable: true,
//       type: 'date',
//       render: (value) => value ? (
//         <div className="date-cell">
//           <Calendar size={14} className="date-icon" />
//           <span>{dateUtils.toJalali(value)}</span>
//         </div>
//       ) : '—'
//     },
//     {
//       field: 'attachment',
//       header: 'پیوست',
//       sortable: false,
//       render: (value) => value ? (
//         <a href={value} target="_blank" rel="noopener noreferrer" className="attachment-link">
//           <Paperclip size={14} />
//           <span>مشاهده</span>
//         </a>
//       ) : <span className="text-muted">—</span>
//     },
//     {
//       field: 'letter_file',
//       header: 'فایل نامه',
//       sortable: false,
//       render: (value) => value ? (
//         <a href={value} target="_blank" rel="noopener noreferrer" className="attachment-link">
//           <FileText size={14} />
//           <span>مشاهده</span>
//         </a>
//       ) : <span className="text-muted">—</span>
//     }
//   ],
//   formFields: [
//     { name: 'title', label: 'عنوان', type: 'text', required: true, colSize: 12, placeholder: 'موضوع مکاتبه را وارد کنید...' },
//     { name: 'sender', label: 'ارسال کننده', type: 'text', required: true, colSize: 6, placeholder: 'نام فرستنده...' },
//     { name: 'receiver', label: 'دریافت کننده', type: 'text', required: true, colSize: 6, placeholder: 'نام گیرنده...' },
//     { name: 'date', label: 'تاریخ', type: 'date', required: true, colSize: 6 },
//     { name: 'description', label: 'توضیحات', type: 'textarea', required: false, colSize: 12, placeholder: 'توضیحات تکمیلی...' },
//     { name: 'send_date', label: 'تاریخ ارسال', type: 'date', required: false, colSize: 6 },
//     { name: 'receive_date', label: 'تاریخ دریافت', type: 'date', required: false, colSize: 6 },
//     { 
//       name: 'attachment', 
//       label: 'فایل پیوست', 
//       type: 'file', 
//       required: false, 
//       colSize: 6, 
//       accept: 'image/*,application/pdf' 
//     },
//     { 
//       name: 'letter_file', 
//       label: 'فایل نامه', 
//       type: 'file', 
//       required: false, 
//       colSize: 6, 
//       accept: 'image/*,application/pdf' 
//     },
//   ],
//   useHook: useCommunication,
//   stats: [
//     { key: 'total', label: 'کل مکاتبات', icon: Mail },
//     { key: 'filtered', label: 'نتیجه فیلتر', icon: Filter },
//     { key: 'withAttachment', label: 'دارای پیوست', icon: Paperclip },
//     { key: 'withLetter', label: 'دارای فایل نامه', icon: FileText },
//   ],
//   searchFields: ['title', 'sender', 'receiver'],
//   filterConfigs: [
//     {
//       key: 'contractId',
//       label: 'قرارداد',
//       type: 'select',
//       options: []
//     },
//     {
//       key: 'researchId',
//       label: 'پژوهش',
//       type: 'select',
//       options: []
//     }
//   ],
// });

// // ========== 3. Config درخت شهرها ==========
// export const cityTreePageConfig = createPageConfig<any>({
//   type: 'tree',
//   title: 'مدیریت شهرها',
//   subtitle: 'مدیریت سلسله‌مراتبی استان‌ها و شهرها',
//   icon: MapPin,
//   treeConfig: {
//     levels: [
//       { type: 'province', label: 'استان', icon: Building2 },
//       { type: 'city', label: 'شهر', icon: MapPin },
//     ],
//     relations: [
//       { parent: 'province', child: 'city', foreignKey: 'provinceId' },
//     ],
//   },
//   useHook: useCity,
//   formFields: [
//     { name: 'name', label: 'نام شهر', type: 'text', required: true, colSize: 12, placeholder: 'نام شهر را وارد کنید...' },
//     { 
//       name: 'provinceId', 
//       label: 'استان', 
//       type: 'select', 
//       required: true, 
//       colSize: 12, 
//       options: [],
//       isSearchable: true 
//     },
//   ],
//   // ✅ فرم‌های مختلف برای هر نوع آیتم
//   formTypes: [
//     // فرم استان
//     {
//       type: 'province',
//       title: 'ویرایش استان',
//       fields: [
//         { name: 'name', label: 'نام استان', type: 'text', required: true, colSize: 12, placeholder: 'نام استان را وارد کنید...' }
//       ],
//       getInitialData: (item: any) => {
//         const actualItem = item.data?.data || item;
//         return {
//           name: actualItem.name || ''
//         };
//       },
//     },
//     // فرم شهر
//     {
//       type: 'city',
//       title: 'ویرایش شهر',
//       fields: [
//         { name: 'name', label: 'نام شهر', type: 'text', required: true, colSize: 12, placeholder: 'نام شهر را وارد کنید...' },
//         { 
//           name: 'provinceId', 
//           label: 'استان', 
//           type: 'select', 
//           required: true, 
//           colSize: 12,
//           options: [],
//           isSearchable: true,
//           placeholder: 'انتخاب استان...'
//         }
//       ],
//       getInitialData: (item: any) => {
//         const actualItem = item.data?.data || item;
//         const provinceId = item.data?.provinceId || actualItem.provinceId || 
//                           (actualItem.province && typeof actualItem.province === 'object' ? actualItem.province.id : actualItem.province);
//         return {
//           name: actualItem.name || '',
//           provinceId: provinceId
//         };
//       }
//     }
//   ],
//   // ✅ تابع تشخیص نوع آیتم
//   getItemType: (item: any) => {
//     if (!item) return 'unknown';
//     if (item.data?.type) return item.data.type;
//     if (item.type) return item.type;
//     const actualItem = item.data?.data || item;
//     if (actualItem.provinceId !== undefined || actualItem.province !== undefined) return 'city';
//     return 'province';
//   },
//   stats: [
//     { key: 'provinces', label: 'تعداد استان‌ها', icon: Building2 },
//     { key: 'cities', label: 'تعداد شهرها', icon: MapPin },
//   ],
//   searchFields: ['name'],
//   filterConfigs: [
//     {
//       key: 'provinceId',
//       label: 'استان',
//       type: 'select',
//       options: []
//     }
//   ],
// });

// // ========== 4. Config درخت دانشگاه‌ها ==========
// export const universityTreePageConfig = createPageConfig<any>({
//   type: 'tree',
//   title: 'مدیریت دانشگاه‌ها',
//   subtitle: 'مدیریت سلسله‌مراتبی استان‌ها، شهرها و دانشگاه‌ها',
//   icon: GraduationCap,
//   treeConfig: {
//     levels: [
//       { type: 'province', label: 'استان', icon: Building2 },
//       { type: 'city', label: 'شهر', icon: MapPin },
//       { type: 'university', label: 'دانشگاه', icon: GraduationCap },
//     ],
//     relations: [
//       { parent: 'province', child: 'city', foreignKey: 'provinceId' },
//       { parent: 'city', child: 'university', foreignKey: 'cityId' },
//     ],
//   },
//   useHook: useUniversity,
//   formFields: [
//     { name: 'name', label: 'نام دانشگاه', type: 'text', required: true, colSize: 12, placeholder: 'نام کامل دانشگاه را وارد کنید...' },
//     { name: 'address', label: 'آدرس', type: 'textarea', required: false, colSize: 12, placeholder: 'آدرس کامل دانشگاه...' },
//     { name: 'phone', label: 'تلفن', type: 'text', required: false, colSize: 6, placeholder: 'مثال: ۰۲۱-۱۲۳۴۵۶۷۸' },
//     { name: 'email', label: 'ایمیل', type: 'email', required: false, colSize: 6, placeholder: 'info@university.ac.ir' },
//     { 
//       name: 'provinceId', 
//       label: 'استان', 
//       type: 'select', 
//       required: true, 
//       colSize: 6,
//       options: [],
//       isSearchable: true,
//       placeholder: 'انتخاب استان...'
//     },
//     { 
//       name: 'cityId', 
//       label: 'شهر', 
//       type: 'select', 
//       required: true, 
//       colSize: 6,
//       options: [],
//       isSearchable: true,
//       placeholder: 'انتخاب شهر...',
//       dependsOn: 'provinceId'
//     },
//     { 
//       name: 'typeId', 
//       label: 'نوع دانشگاه', 
//       type: 'select', 
//       required: true,
//       colSize: 6,
//       options: [],
//       isSearchable: true,
//       placeholder: 'انتخاب نوع دانشگاه...'
//     },
//   ],
//   // ✅ فرم‌های مختلف برای هر نوع آیتم
//   formTypes: [
//     // فرم استان
//     {
//       type: 'province',
//       title: 'ویرایش استان',
//       fields: [
//         { name: 'name', label: 'نام استان', type: 'text', required: true, colSize: 12, placeholder: 'نام استان را وارد کنید...' }
//       ],
//       getInitialData: (item: any) => {
//         const actualItem = item.data?.data || item;
//         return {
//           name: actualItem.name || ''
//         };
//       }
//     },
//     // فرم شهر
//     {
//       type: 'city',
//       title: 'ویرایش شهر',
//       fields: [
//         { name: 'name', label: 'نام شهر', type: 'text', required: true, colSize: 12, placeholder: 'نام شهر را وارد کنید...' },
//         { 
//           name: 'provinceId', 
//           label: 'استان', 
//           type: 'select', 
//           required: true, 
//           colSize: 12,
//           options: [],
//           isSearchable: true,
//           placeholder: 'انتخاب استان...'
//         }
//       ],
//       getInitialData: (item: any) => {
//         const actualItem = item.data?.data || item;
//         const provinceId = item.data?.provinceId || actualItem.provinceId || 
//                           (actualItem.province && typeof actualItem.province === 'object' ? actualItem.province.id : actualItem.province);
//         return {
//           name: actualItem.name || '',
//           provinceId: provinceId
//         };
//       }
//     },
//     // فرم دانشگاه
//     {
//       type: 'university',
//       title: 'ویرایش دانشگاه',
//       fields: [
//         { name: 'name', label: 'نام دانشگاه', type: 'text', required: true, colSize: 12, placeholder: 'نام کامل دانشگاه را وارد کنید...' },
//         { name: 'address', label: 'آدرس', type: 'textarea', required: false, colSize: 12, placeholder: 'آدرس کامل دانشگاه...' },
//         { name: 'phone', label: 'تلفن', type: 'text', required: false, colSize: 6, placeholder: 'مثال: ۰۲۱-۱۲۳۴۵۶۷۸' },
//         { name: 'email', label: 'ایمیل', type: 'email', required: false, colSize: 6, placeholder: 'info@university.ac.ir' },
//         { 
//           name: 'provinceId', 
//           label: 'استان', 
//           type: 'select', 
//           required: true, 
//           colSize: 6,
//           options: [],
//           isSearchable: true,
//           placeholder: 'انتخاب استان...'
//         },
//         { 
//           name: 'cityId', 
//           label: 'شهر', 
//           type: 'select', 
//           required: true, 
//           colSize: 6,
//           options: [],
//           isSearchable: true,
//           placeholder: 'انتخاب شهر...',
//           dependsOn: 'provinceId'
//         },
//         { 
//           name: 'typeId', 
//           label: 'نوع دانشگاه', 
//           type: 'select', 
//           required: true,
//           colSize: 6,
//           options: [],
//           isSearchable: true,
//           placeholder: 'انتخاب نوع دانشگاه...'
//         },
//       ],
//       getInitialData: (item: any) => {
//         const actualItem = item.data?.data || item;
//         return {
//           name: actualItem.name || '',
//           address: actualItem.address || '',
//           phone: actualItem.phone || '',
//           email: actualItem.email || '',
//           cityId: typeof actualItem.city === 'object' ? actualItem.city?.id : actualItem.city,
//           typeId: typeof actualItem.type === 'object' ? actualItem.type?.id : actualItem.type,
//         };
//       }
//     }
//   ],
//   // ✅ تابع تشخیص نوع آیتم
//   getItemType: (item: any) => {
//     if (!item) return 'unknown';
//     if (item.data?.type) return item.data.type;
//     if (item.type) return item.type;
//     const actualItem = item.data?.data || item;
//     if (actualItem.provinceId !== undefined || actualItem.province !== undefined) return 'city';
//     if (actualItem.cityId !== undefined || actualItem.city !== undefined) return 'university';
//     return 'unknown';
//   },
//   stats: [
//     { key: 'provinces', label: 'تعداد استان‌ها', icon: Building2 },
//     { key: 'cities', label: 'تعداد شهرها', icon: MapPin },
//     { key: 'universities', label: 'تعداد دانشگاه‌ها', icon: GraduationCap },
//   ],
//   searchFields: ['name', 'phone', 'email'],
//   filterConfigs: [
//     {
//       key: 'provinceId',
//       label: 'استان',
//       type: 'select',
//       options: []
//     },
//     {
//       key: 'cityId',
//       label: 'شهر',
//       type: 'select',
//       options: []
//     },
//     {
//       key: 'typeId',
//       label: 'نوع دانشگاه',
//       type: 'select',
//       options: []
//     }
//   ],
// });

// // ========== Export همه Configها ==========
// export default {
//   provincePageConfig,
//   communicationPageConfig,
//   cityTreePageConfig,
//   universityTreePageConfig,
// };
