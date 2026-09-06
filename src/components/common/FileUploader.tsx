// // src/components/common/FileUploader.tsx

// import React, { useState, useRef, useCallback, useEffect } from 'react';
// import { FileManager, type FileState } from './FileManager';

// export interface FileUploaderProps {
//   name: string;
//   value?: File | string | null;
//   onChange?: (value: File | string | null | undefined) => void;
//   label?: string;
//   required?: boolean;
//   error?: string;
//   disabled?: boolean;
//   accept?: string;
//   maxSize?: number;
//   description?: string;
//   className?: string;
// }

// export const FileUploader: React.FC<FileUploaderProps> = ({
//   name,
//   value,
//   onChange,
//   label,
//   required = false,
//   error,
//   disabled = false,
//   accept = '*/*',
//   maxSize = 10 * 1024 * 1024,
//   description,
//   className = '',
// }) => {
//   const [isDragging, setIsDragging] = useState(false);
//   const [localFile, setLocalFile] = useState<File | string | null | undefined>(value);
//   const [fileState, setFileState] = useState<FileState>('none');
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const fileManager = FileManager.getInstance();

//   useEffect(() => {
//     console.log(`📎 FileUploader[${name}]: value changed`, value);
//     setLocalFile(value);
//     if (value instanceof File) setFileState('new');
//     else if (typeof value === 'string') setFileState('existing');
//     else if (value === null) setFileState('deleted');
//     else setFileState('none');
//   }, [value, name]);

//   const handleFileSelect = useCallback((file: File) => {
//     console.log(`📎 FileUploader[${name}]: file selected`, file.name, file.size);
    
//     if (file.size > maxSize) {
//       alert(`حجم فایل نباید بیشتر از ${maxSize / (1024 * 1024)} مگابایت باشد`);
//       return;
//     }
    
//     if (file.size === 0) {
//       alert('فایل خالی است');
//       return;
//     }

//     fileManager.createFromFile(name, file);
//     setLocalFile(file);
//     setFileState('new');
//     onChange?.(file);
//   }, [maxSize, onChange, name]);

//   const handleDelete = useCallback(() => {
//     console.log(`📎 FileUploader[${name}]: delete clicked`);
//     fileManager.markForDelete(name);
//     setLocalFile(null);
//     setFileState('deleted');
//     onChange?.(null);
//   }, [onChange, name]);

//   const handleRestore = useCallback(() => {
//     console.log(`📎 FileUploader[${name}]: restore clicked`);
//     fileManager.clear(name);
//     if (typeof value === 'string') {
//       setLocalFile(value);
//       setFileState('existing');
//       onChange?.(value);
//     } else {
//       setLocalFile(undefined);
//       setFileState('none');
//       onChange?.(undefined);
//     }
//   }, [value, onChange, name]);

//   const renderContent = () => {
//     // حالت ۱: فایل جدید
//     if (localFile instanceof File) {
//       const isImage = localFile.type.startsWith('image/');
//       return (
//         <div className="file-uploader-preview new">
//           <div className="file-icon">
//             {isImage ? (
//               <img src={URL.createObjectURL(localFile)} alt={localFile.name} className="file-preview-image" />
//             ) : (
//               <span>📄</span>
//             )}
//           </div>
//           <div className="file-info">
//             <span className="file-name">{localFile.name}</span>
//             <span className="file-meta">
//               {formatFileSize(localFile.size)}
//               <span className="badge badge-success">جدید</span>
//             </span>
//           </div>
//           <button className="file-action-btn delete" onClick={handleDelete} title="حذف فایل">✕</button>
//         </div>
//       );
//     }

//     // حالت ۲: فایل موجود
//     if (typeof localFile === 'string' && localFile) {
//       const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(localFile);
//       const fileName = localFile.split('/').pop() || 'فایل';
//       return (
//         <div className="file-uploader-preview existing">
//           <div className="file-icon">
//             {isImage ? <img src={localFile} alt={fileName} className="file-preview-image" /> : <span>📎</span>}
//           </div>
//           <div className="file-info">
//             <span className="file-name">{fileName}</span>
//             <span className="file-meta">
//               <span className="badge badge-info">موجود</span>
//             </span>
//           </div>
//           <div className="file-actions">
//             <a href={localFile} target="_blank" rel="noopener noreferrer" className="file-link" title="مشاهده">👁️</a>
//             <a href={localFile} download className="file-link download" title="دانلود">⬇️</a>
//             <button className="file-action-btn delete" onClick={handleDelete} title="حذف فایل">✕</button>
//           </div>
//         </div>
//       );
//     }

//     // حالت ۳: فایل حذف شده
//     if (localFile === null) {
//       return (
//         <div className="file-uploader-preview deleted">
//           <div className="file-icon deleted-icon"><span>🗑️</span></div>
//           <div className="file-info">
//             <span className="file-name text-muted">فایل حذف شده</span>
//             <span className="file-meta"><span className="badge badge-danger">حذف شده</span></span>
//           </div>
//           <button className="file-action-btn restore" onClick={handleRestore} title="بازیابی">🔄</button>
//         </div>
//       );
//     }

//     // حالت ۴: هیچ فایلی
//     return (
//       <div
//         className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
//         onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
//         onDragLeave={() => setIsDragging(false)}
//         onDrop={(e) => {
//           e.preventDefault();
//           setIsDragging(false);
//           const file = e.dataTransfer.files[0];
//           if (file) handleFileSelect(file);
//         }}
//         onClick={() => fileInputRef.current?.click()}
//       >
//         <div className="upload-icon-wrapper">📤</div>
//         <div className="drop-text">
//           <span className="drop-title">فایل را اینجا بکشید و رها کنید</span>
//           <span className="drop-subtitle">یا کلیک کنید تا انتخاب کنید</span>
//         </div>
//         {accept !== '*/*' && <span className="drop-accept">پسوندهای مجاز: {accept}</span>}
//         {maxSize > 0 && <span className="drop-size">حداکثر حجم: {maxSize / (1024 * 1024)} مگابایت</span>}
//       </div>
//     );
//   };

//   return (
//     <div className={`file-uploader ${className} ${disabled ? 'disabled' : ''} ${error ? 'has-error' : ''}`}>
//       {label && (
//         <label className="file-uploader-label">
//           {label}
//           {required && <span className="required-star">*</span>}
//         </label>
//       )}
//       {description && <p className="file-uploader-description">{description}</p>}
//       {renderContent()}
//       <input
//         ref={fileInputRef}
//         type="file"
//         accept={accept}
//         onChange={(e) => {
//           const file = e.target.files?.[0];
//           if (file) handleFileSelect(file);
//           e.target.value = '';
//         }}
//         className="file-input-hidden"
//         disabled={disabled}
//       />
//       {error && <div className="file-uploader-error">⚠️ {error}</div>}

//       <style>{`
//         .file-uploader { width: 100%; position: relative; }
//         .file-uploader-label { display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px; }
//         .file-uploader-label .required-star { color: #ef4444; margin-right: 4px; }
//         .file-uploader-description { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
//         .file-drop-zone { border: 2px dashed #d1d5db; border-radius: 12px; padding: 32px 20px; text-align: center; cursor: pointer; transition: all 0.3s ease; background: #fafafa; }
//         .file-drop-zone:hover { border-color: #4f46e5; background: #f8fafc; }
//         .file-drop-zone.dragging { border-color: #4f46e5; background: #eef2ff; transform: scale(1.02); }
//         .file-drop-zone .upload-icon-wrapper { font-size: 40px; margin-bottom: 12px; }
//         .file-drop-zone .drop-title { display: block; font-size: 16px; font-weight: 500; color: #374151; }
//         .file-drop-zone .drop-subtitle { display: block; font-size: 13px; color: #9ca3af; margin-top: 4px; }
//         .file-drop-zone .drop-accent, .file-drop-zone .drop-size { display: inline-block; font-size: 11px; color: #9ca3af; margin-top: 8px; padding: 2px 10px; background: #f3f4f6; border-radius: 12px; margin-right: 6px; }
//         .file-input-hidden { display: none; }
//         .file-uploader-preview { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1.5px solid #e5e7eb; border-radius: 10px; background: #fafafa; transition: all 0.3s ease; position: relative; }
//         .file-uploader-preview:hover { border-color: #4f46e5; background: #f8fafc; }
//         .file-uploader-preview .file-icon { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid #e5e7eb; flex-shrink: 0; overflow: hidden; font-size: 24px; }
//         .file-uploader-preview .file-preview-image { width: 100%; height: 100%; object-fit: cover; }
//         .file-uploader-preview .file-info { flex: 1; min-width: 0; }
//         .file-uploader-preview .file-name { display: block; font-size: 14px; font-weight: 500; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
//         .file-uploader-preview .file-meta { display: flex; align-items: center; gap: 8px; margin-top: 2px; font-size: 13px; color: #6b7280; }
//         .file-uploader-preview .file-meta .badge { font-size: 10px; padding: 2px 8px; border-radius: 12px; }
//         .badge-success { background: #d1fae5; color: #065f46; }
//         .badge-info { background: #dbeafe; color: #1e40af; }
//         .badge-danger { background: #fecaca; color: #991b1b; }
//         .file-uploader-preview .file-actions { display: flex; gap: 4px; }
//         .file-action-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; background: transparent; color: #6b7280; font-size: 16px; }
//         .file-action-btn:hover { background: #f3f4f6; }
//         .file-action-btn.delete:hover { color: #ef4444; background: #fecaca; }
//         .file-action-btn.restore:hover { color: #4f46e5; background: #eef2ff; }
//         .file-link { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; border-radius: 8px; text-decoration: none; color: #6b7280; font-size: 16px; transition: all 0.2s ease; }
//         .file-link:hover { background: #f3f4f6; text-decoration: none; }
//         .file-link.download:hover { color: #059669; background: #d1fae5; }
//         .file-uploader-preview.deleted { border-color: #fecaca; background: #fef2f2; }
//         .file-uploader-preview.deleted .file-name { color: #9ca3af; }
//         .file-uploader-error { margin-top: 6px; font-size: 13px; color: #ef4444; display: flex; align-items: center; gap: 6px; }
//         .file-uploader.disabled { opacity: 0.6; pointer-events: none; }
//         .file-uploader.has-error .file-drop-zone { border-color: #ef4444; }
//         @media (max-width: 480px) { .file-uploader-preview { flex-wrap: wrap; } }
//       `}</style>
//     </div>
//   );
// };

// function formatFileSize(bytes: number): string {
//   if (bytes === 0) return '0 B';
//   const k = 1024;
//   const sizes = ['B', 'KB', 'MB', 'GB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
// }

