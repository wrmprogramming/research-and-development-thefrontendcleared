// // src/core/managers/FileManager.ts

// export type FileState = 'existing' | 'new' | 'deleted' | 'none';

// export interface ManagedFile {
//   id?: string;
//   file: File | string | null;
//   state: FileState;
//   fileName?: string;
//   fileSize?: number;
//   fileType?: string;
//   url?: string;
// }

// export class FileManager {
//   private static instance: FileManager;
//   private files: Map<string, ManagedFile> = new Map();

//   private constructor() {}

//   static getInstance(): FileManager {
//     if (!FileManager.instance) {
//       FileManager.instance = new FileManager();
//     }
//     return FileManager.instance;
//   }

//   createFromFile(field: string, file: File): ManagedFile {
//     console.log(`📁 FileManager.createFromFile: ${field}`, file.name);
//     const managed: ManagedFile = {
//       id: crypto.randomUUID(),
//       file,
//       state: 'new',
//       fileName: file.name,
//       fileSize: file.size,
//       fileType: file.type,
//     };
//     this.files.set(field, managed);
//     return managed;
//   }

//   createFromUrl(field: string, url: string): ManagedFile {
//     console.log(`📁 FileManager.createFromUrl: ${field}`, url);
//     const managed: ManagedFile = {
//       id: crypto.randomUUID(),
//       file: url,
//       state: 'existing',
//       fileName: url.split('/').pop() || 'فایل',
//       url,
//     };
//     this.files.set(field, managed);
//     return managed;
//   }

//   markForDelete(field: string): void {
//     console.log(`📁 FileManager.markForDelete: ${field}`);
//     const existing = this.files.get(field);
//     if (existing) {
//       this.files.set(field, {
//         ...existing,
//         state: 'deleted',
//         file: null,
//       });
//     } else {
//       this.files.set(field, {
//         file: null,
//         state: 'deleted',
//       });
//     }
//   }

//   getForApi(field: string): File | string | null | undefined {
//     const managed = this.files.get(field);
//     console.log(`📁 FileManager.getForApi: ${field}`, managed?.state);
    
//     if (!managed) return undefined;
//     if (managed.state === 'deleted') return null;
//     if (managed.state === 'new' && managed.file instanceof File) return managed.file;
//     if (managed.state === 'existing') return managed.file as string;
//     return undefined;
//   }

//   getState(field: string): FileState {
//     return this.files.get(field)?.state || 'none';
//   }

//   getFile(field: string): ManagedFile | undefined {
//     return this.files.get(field);
//   }

//   clear(field?: string): void {
//     if (field) {
//       console.log(`📁 FileManager.clear: ${field}`);
//       this.files.delete(field);
//     } else {
//       console.log('📁 FileManager.clear: all');
//       this.files.clear();
//     }
//   }
// }
