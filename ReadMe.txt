npm create vite@latest project-control -- --template react
cd project-control
npm install -D vitest @vitest/coverage-v8 @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw --legacy-peer-deps
npm install -D @testing-library/dom --legacy-peer-deps
npm install -D @testing-library/user-event --legacy-peer-deps
 npm run test:run
اگر همه موارد بالا جواب نداد، این روش ساده را امتحان کنید:

در CommunicationsManagement.tsx در handleSubmit:
tsx

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  if (!formData.topic || !formData.sender || !formData.receiver || !formData.date) {
    alert('لطفاً تمام فیلدهای اجباری را پر کنید');
    return;
  }

  setIsUploading(true);
  setUploadProgress(0);

  try {
    if (editingItem) {
      // ساخت یک آبجکت جدید برای ارسال
      const updatePayload: any = {
        id: editingItem.id,
        data: {
          topic: formData.topic,
          sender: formData.sender,
          receiver: formData.receiver,
          date: formData.date,
        },
        onProgress: (progress: number) => setUploadProgress(progress),
      };
      
      // فقط اگر فایل جدید وجود داشته باشد اضافه کن
      if (formData.attachment instanceof File) {
        updatePayload.data.attachment = formData.attachment;
      }
      if (formData.lettersfile instanceof File) {
        updatePayload.data.lettersfile = formData.lettersfile;
      }
      
      // اگر فایل حذف شده بود
      if (formData.attachment === null && editingItem.attachment) {
        updatePayload.data.clear_attachment = true;
      }
      if (formData.lettersfile === null && editingItem.lettersfile) {
        updatePayload.data.clear_lettersfile = true;
      }
      
      await updateCommunication(updatePayload);
    } else {
      await createCommunication({
        data: formData,
        onProgress: (progress) => setUploadProgress(progress),
      });
    }
    
    setIsModalOpen(false);
    resetForm();
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید.');
  } finally {
    setIsUploading(false);
    setUploadProgress(0);
  }
};

و در src/services/api.ts:
tsx

update: async (
  id: number,
  data: CommunicationFormData & { clear_attachment?: boolean; clear_lettersfile?: boolean },
  onProgress?: (progress: number) => void
): Promise<Communication> => {
  const formData = new FormData();
  formData.append('topic', data.topic);
  formData.append('sender', data.sender);
  formData.append('receiver', data.receiver);
  formData.append('date', data.date);
  
  if (data.attachment && data.attachment instanceof File) {
    formData.append('attachment', data.attachment);
  }
  if (data.lettersfile && data.lettersfile instanceof File) {
    formData.append('lettersfile', data.lettersfile);
  }
  
  // برای حذف فایل
  if (data.clear_attachment) {
    formData.append('clear_attachment', 'true');
  }
  if (data.clear_lettersfile) {
    formData.append('clear_lettersfile', 'true');
  }

  const response = await api.patch(`/communications/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
},

این روش‌ها باید مشکل حذف فایل در ویرایش را حل کنند. اگر باز هم مشکل داشت، لطفاً خطای کنسول مرورگر (F12) را به من بگویید