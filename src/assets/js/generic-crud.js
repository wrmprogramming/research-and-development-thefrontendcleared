class GenericCRUD {
    constructor(options) {
        this.options = options;
        this.currentEditId = null; // شناسه آیتمی که در حال ویرایش آن هستیم
        this.currentDeleteId = null; // شناسه آیتمی که در حال حذف آن هستیم

        // یافتن عناصر DOM
        this.pageTitleElement = document.getElementById(options.pageTitleId);
        this.addBtn = document.getElementById(options.addBtnId);
        this.tableHeadElement = document.getElementById(options.tableHeadId);
        this.tableBodyElement = document.getElementById(options.tableBodyId);
        this.formElement = document.getElementById(options.formId);
        this.modalTitleElement = document.getElementById(options.modalTitleId);
        this.saveBtn = document.getElementById(options.saveBtnId);
        this.deleteBtn = document.getElementById(options.deleteBtnId);

        // یافتن مودال‌ها و مقداردهی اولیه Bootstrap
        this.crudModal = document.getElementById('crudModal');
        this.deleteConfirmModal = document.getElementById('deleteConfirmModal');


        const hasFileField = this.options.fields.some(field => field.type === 'file');
        if (hasFileField && this.formElement.tagName === 'FORM') {
            this.formElement.setAttribute('enctype', 'multipart/form-data');
        }


        if (this.crudModal) {
            this.modalInstance = bootstrap.Modal.getOrCreateInstance(this.crudModal);
            // Event listener برای مودال CRUD
            this.crudModal.addEventListener('shown.bs.modal', () => {
                // فوکوس روی اولین فیلد قابل فوکوس
                const firstFocusable = this.crudModal.querySelector('input, select, button, a');
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            });
            this.crudModal.addEventListener('hidden.bs.modal', () => {
                // پاک کردن فیلدها و ریست کردن وضعیت پس از بسته شدن مودال
                this.currentEditId = null;
                this.currentDeleteId = null; // اطمینان از پاک شدن ID حذف
                this.clearFormFields();
                this.formElement.querySelector('.error-message')?.remove(); // پاک کردن پیام خطا
            });
        }

        if (this.deleteConfirmModal) {
            this.deleteModalInstance = bootstrap.Modal.getOrCreateInstance(this.deleteConfirmModal);
            this.deleteConfirmModal.addEventListener('hidden.bs.modal', () => {
                this.currentDeleteId = null; // پاک کردن ID حذف پس از بسته شدن مودال
            });
        }

        this.initializeEventListeners();
        this.renderTableHead();
        this.fetchItems(); // بارگذاری اولیه داده‌ها
    }

    initializeEventListeners() {
        // Event listener برای دکمه افزودن
        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => {
                this.prepareForAdd();
            });
        }

        // Event listener برای دکمه ذخیره
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => {
                this.saveItem();
            });
        }

        // Event listener برای دکمه تأیید حذف
        if (this.deleteBtn) {
            this.deleteBtn.addEventListener('click', () => {
                this.confirmDelete();
            });
        }
    }

    // آماده‌سازی فرم برای افزودن آیتم جدید
    prepareForAdd() {
   
        this.currentEditId = null;
        this.currentDeleteId = null;
        this.modalTitleElement.textContent = `افزودن ${this.options.title}`;
        this.clearFormFields();
        this.renderFormFields(true); // true یعنی برای حالت افزودن
        this.formElement.querySelector('.error-message')?.remove(); // پاک کردن پیام خطای قبلی

        // اگر از data-bs-toggle استفاده می‌کنید، مودال توسط Bootstrap باز می‌شود
        // اگر نه، اینجا باید this.modalInstance.show() را فراخوانی کنید.
        // چون در HTML از data-bs-toggle استفاده کردید، این خط لازم نیست:
        // if (this.modalInstance) this.modalInstance.show();
    }

    // رندر کردن فیلدهای فرم (برای افزودن یا ویرایش)
renderFormFields(isAdd = false, itemData = null) { // itemData برای ویرایش اضافه شد
    this.formElement.innerHTML = ''; // پاک کردن فرم فعلی
   
    this.options.fields.forEach(field => {
        const fieldWrapper = document.createElement('div');
        fieldWrapper.classList.add('mb-3');

        const label = document.createElement('label');
        label.setAttribute('for', field.name);
        label.classList.add('form-label');
        label.textContent = field.label;
        if (field.required) {
            label.innerHTML += ' <span class="text-danger">*</span>'; // نشانگر اجباری بودن
        }

        let inputElement;

        if (field.type === 'select') {
            inputElement = document.createElement('select');
            inputElement.setAttribute('id', field.name);
            inputElement.setAttribute('name', field.name);
            if (field.required) {
                inputElement.setAttribute('required', '');
            }

            // اضافه کردن گزینه placeholder اولیه
            const placeholderOption = document.createElement('option');
            placeholderOption.value = "";
            placeholderOption.textContent = field.name === 'province' ? "انتخاب استان" : "انتخاب کنید";
            inputElement.appendChild(placeholderOption);

            // اگر آپشن ها از قبل در تعریف فیلد آمده بود، آنها را اضافه کن
            if (field.options && field.options.length > 0) {
                field.options.forEach(opt => {
                    const optionElement = document.createElement('option');
                    optionElement.value = opt.value;
                    optionElement.textContent = opt.text;
                    // اگر این فیلد برای ویرایش است و مقدار فعلی با این آپشن مطابقت دارد، آن را انتخاب کن
                    if (itemData && itemData[field.name] && (itemData[field.name].id || itemData[field.name] === opt.value || itemData[field.name] === opt.id) && opt.value == (itemData[field.name].id || itemData[field.name])) {
                         optionElement.selected = true;
                    }
                    inputElement.appendChild(optionElement);
                });
            }
            // اینجا select element ساخته شده و آماده است تا توسط onFormReady پر شود (برای استان)
            // یا اگر option از قبل داده شده، الان اضافه شده است.

        }else if (field.type === 'file') {
            inputElement = document.createElement('input');
            inputElement.setAttribute('type', 'file');
            inputElement.setAttribute('id', field.name);
            inputElement.setAttribute('name', field.name);
            // *** پیشنهاد: در حالت ویرایش، فایل را اجباری نکن ***
            if (field.required && isAdd) { // فقط در حالت افزودن اجباری باشد
                inputElement.setAttribute('required', '');
            }

            // اضافه کردن یک span برای نمایش نام فایل انتخاب شده (اختیاری)
            const fileNameDisplay = document.createElement('span');
            fileNameDisplay.classList.add('file-name-display', 'form-text', 'ms-2');
            if (itemData && itemData[field.name]) {
                const url = itemData[field.name];
                if (url) {
                    const parts = url.split('/');
                    const fileName = parts[parts.length - 1];
                    fileNameDisplay.textContent = fileName || 'فایل موجود';
                } else {
                    fileNameDisplay.textContent = 'فایل موجود';
                }
            } else {
                fileNameDisplay.textContent = 'هیچ فایلی انتخاب نشده';
            }

            // اضافه کردن event listener برای نمایش نام فایل در صورت انتخاب
            inputElement.addEventListener('change', (event) => {
                const files = event.target.files;
                if (files.length > 0) {
                    fileNameDisplay.textContent = files[0].name;
                } else {
                    fileNameDisplay.textContent = 'هیچ فایلی انتخاب نشده';
                }
            });
            fieldWrapper.appendChild(label);
            fieldWrapper.appendChild(inputElement);
            fieldWrapper.appendChild(fileNameDisplay); // اضافه کردن span به wrapper

        }
         else { // handles text, number, email, password, textarea, etc.
            inputElement = document.createElement('input');
            inputElement.setAttribute('type', field.type);
            inputElement.setAttribute('id', field.name);
            inputElement.setAttribute('name', field.name);
            if (field.required) {
                inputElement.setAttribute('required', '');
            }

            // مقدار دهی اولیه برای فیلدهای ویرایش
            if (itemData && itemData[field.name]) {
                inputElement.value = itemData[field.name];
            }
        }

        fieldWrapper.appendChild(label);
        fieldWrapper.appendChild(inputElement);
        this.formElement.appendChild(fieldWrapper);
    });

    // بعد از ساخت همه فیلدها، اگر onFormReady وجود دارد، آن را صدا بزن
    if (this.options.onFormReady && typeof this.options.onFormReady === 'function') {
        // Pass itemData to onFormReady if needed for specific select populations
        this.options.onFormReady(itemData);
    }
}



    // پاک کردن مقادیر فیلدهای فرم
    clearFormFields() {
        const inputs = this.formElement.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.value = '';
            if (input.tagName === 'SELECT') {
                input.selectedIndex = 0; // بازگشت به اولین گزینه (معمولاً placeholder)
            }
        });
    }

    // رندر کردن هدر جدول
    renderTableHead() {
        if (!this.tableHeadElement || !this.options.displayFields) return;

        const headerRow = document.createElement('tr');
        this.options.displayFields.forEach(field => {
            const th = document.createElement('th');
            th.textContent = field.label;
            headerRow.appendChild(th);
        });
        // اضافه کردن ستون برای دکمه‌های اکشن (ویرایش و حذف)
        const actionsTh = document.createElement('th');
        actionsTh.textContent = 'عملیات';
        headerRow.appendChild(actionsTh);

        this.tableHeadElement.innerHTML = ''; // پاک کردن هدر قبلی
        this.tableHeadElement.appendChild(headerRow);
    }

    // رندر کردن بدنه جدول با داده‌ها
    renderTableBody(items) {
        if (!this.tableBodyElement || !this.options.displayFields) return;

        this.tableBodyElement.innerHTML = ''; // پاک کردن بدنه قبلی

        items.forEach(item => {
            const row = document.createElement('tr');

            // نمایش فیلدهای اصلی
            this.options.displayFields.forEach(field => {
                const td = document.createElement('td');
                const value = item[field.name];

         console.log(field , " ------ " )


           if (field.type === 'file') {
                const link = document.createElement('a');

                const fileUrl = value.startsWith('http')
                    ? value
                    : `${window.location.origin}/${value.replace(/^\/+/, '')}`;

                const fileName = value.split('/').pop().split('?')[0];

                link.href = fileUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = fileName;

                td.appendChild(link);
            } else {
                // td.textContent = value !== undefined && value !== null ? value : '';
                td.textContent = item[field.name] !== undefined ? item[field.name] : '';

            }
                // مقدار دهی فیلد (ممکن است نیاز به map کردن نام فیلد باشد)
                // td.textContent = item[field.name] !== undefined ? item[field.name] : '';
                row.appendChild(td);
            });

            // اضافه کردن دکمه‌های اکشن
            const actionsTd = document.createElement('td');

            // دکمه ویرایش
            const editButton = document.createElement('button');
            editButton.textContent = 'ویرایش';
            editButton.classList.add('btn', 'btn-sm', 'btn-primary', 'me-2');
            editButton.addEventListener('click', () => this.editItem(item.id)); // فرض می‌کنیم هر آیتم یک 'id' دارد
            actionsTd.appendChild(editButton);

            // دکمه حذف
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'حذف';
            deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
            deleteButton.addEventListener('click', () => this.deleteItem(item.id));
            actionsTd.appendChild(deleteButton);

            row.appendChild(actionsTd);
            this.tableBodyElement.appendChild(row);
        });
    }

    // نمایش پیام خطا در فرم
    displayFormError(message) {
        let errorElement = this.formElement.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.classList.add('alert', 'alert-danger', 'error-message', 'mt-3');
            this.formElement.prepend(errorElement);
        }
        errorElement.textContent = message;
    }

    // --------- API Calls ---------

    async fetchItems() {
        try {
            const response = await fetch(this.options.endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // فرض می‌کنیم API لیستی از آیتم‌ها را برمی‌گرداند
            console.error(" fetching items:", data);
            this.renderTableBody(data);

        } catch (error) {
            console.error("Error fetching items:", error);
            // نمایش پیام خطا به کاربر در جدول یا یک جای دیگر
        }
    }

    async saveItem() {
        if (!this.formElement.checkValidity()) {
            this.formElement.classList.add('was-validated'); // برای نمایش پیام‌های اعتبارسنجی Bootstrap
            this.displayFormError("لطفاً تمام فیلدهای الزامی را پر کنید.");
            return;
        }

        const formData = new FormData(this.formElement);
        const itemData = {};
        formData.forEach((value, key) => {
            itemData[key] = value;
        });

        const url = this.currentEditId ? `${this.options.endpoint}${this.currentEditId}/` : this.options.endpoint;
        const method = this.currentEditId ? 'PUT' : 'POST'; // یا 'PATCH' بسته به API

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    //'Content-Type': 'application/json',
                    // 'X-CSRFToken': getCookie('csrftoken'), // اگر CSRF token لازم است
                },
                body: formData, //JSON.stringify(itemData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // نمایش خطاهای API
                let errorMessage = "خطا در ذخیره اطلاعات.";
                if (errorData && typeof errorData === 'object') {
                    // اگر API خطاهای جزئی را برگرداند (مثلا برای فیلدهای خاص)
                    const fieldErrors = [];
                    for (const key in errorData) {
                        if (Array.isArray(errorData[key])) {
                            fieldErrors.push(`${key}: ${errorData[key].join(' ')}`);
                        } else {
                             fieldErrors.push(`${key}: ${errorData[key]}`);
                        }
                    }
                    errorMessage = fieldErrors.join(' ');
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }
                this.displayFormError(errorMessage);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
            }

            // اگر موفق بود، مودال را ببندید
            if (this.modalInstance) {
                this.modalInstance.hide();
            }
            // و داده‌ها را مجددا بارگذاری کنید
            this.fetchItems();

        } catch (error) {
            console.error("Error saving item:", error);
            // اگر خطای قبلاً نمایش داده نشده بود، اینجا نمایش بده
            if (!this.formElement.querySelector('.error-message')) {
                 this.displayFormError("خطای غیرمنتظره در هنگام ذخیره.");
            }
        }
    }

    async editItem(id) {
    this.currentEditId = id;
    // فرض می‌کنیم modalTitleElement و formElement از قبل تعریف شده‌اند
    if (this.modalTitleElement) {
        this.modalTitleElement.textContent = `ویرایش ${this.options.title || 'آیتم'}`; // عنوان پیش‌فرض اضافه شد
    }
    const existingError = this.formElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    console.log('Editing item with ID:', id);
    // console.log('Initial form element:', this.formElement); // این لاگ را نگه دارید برای اشکال‌زدایی

    try {
        // فرض می‌کنیم endpoint به درستی تنظیم شده است
        const response = await fetch(`${this.options.endpoint}${id}/`);
        if (!response.ok) {
            throw new Error(`Failed to fetch item: ${response.statusText} (${response.status})`);
        }
        const item = await response.json();
        console.log('Item data fetched:', item);

        // --- اطمینان از آماده بودن DOM برای پر کردن ---
        // اگر renderFormFields یک Promise برمی‌گرداند، await کردن آن ضروری است.
        // اگر sync است، یک تأخیر کوتاه می‌تواند کمک کند، اما روش ایده‌آلی نیست.
        // فرض می‌کنیم renderFormFields فیلدهای لازم را در this.formElement ایجاد/آماده می‌کند.
        if (typeof this.renderFormFields === 'function') {
             // اگر renderFormFields یک promise برمی‌گرداند، منتظر آن بمانید
             if (this.renderFormFields.constructor.name === 'AsyncFunction') {
                 await this.renderFormFields(false); // false برای نشان دادن اینکه در حال ویرایش هستیم
             } else {
                 this.renderFormFields(false);
                 // اگر sync است و DOM را تغییر می‌دهد، کمی تأخیر لازم است
                 await new Promise(resolve => setTimeout(resolve, 100)); // تأخیر کمی بیشتر برای اطمینان
             }
        } else {
             console.warn('renderFormFields function not found or not properly implemented.');
             // اگر renderFormFields وجود ندارد، فرض می‌کنیم فرم از قبل آماده است
        }
        // console.log('Form fields rendered/ready. Current form element:', this.formElement); // لاگ بعد از render/ready

        // --- پر کردن فیلدها ---
        for (const field of this.options.fields) {
            const element = this.formElement.querySelector(`[name="${field.name}"]`);
            if (!element) {
                console.warn(`Element for field "${field.name}" not found in the form after rendering.`);
                continue; // رد شدن از این فیلد اگر المنتش پیدا نشد
            }

            // بررسی وجود کلید در داده‌های دریافتی
            if (item.hasOwnProperty(field.name) && item[field.name] !== null && item[field.name] !== undefined) {
                let valueToSet = item[field.name];

                if (element.type === 'file') {
                    // --- مدیریت فیلد فایل ---
                    // سعی می‌کنیم نام فایل را از کلیدهای احتمالی پیدا کنیم
                    // این کلیدها باید با API شما مطابقت داشته باشند.
                    // مثال: attachment -> attachment_name
                    // مثال: profile_image -> profile_image (ممکن است خود URL باشد)
                    let currentFileName = '';
                    const fileNameKey = field.fileNameKey || `${field.name}_name`; // یک کلید احتمالی برای نام فایل

                    if (item.hasOwnProperty(fileNameKey)) {
                        currentFileName = item[fileNameKey];
                    } else if (item.hasOwnProperty(field.name) && typeof item[field.name] === 'string' && item[field.name].includes('.')) {
                        // اگر مقدار خود فیلد یک نام فایل رشته‌ای بود (مثلاً URL)
                        currentFileName = item[field.name];
                    } else if (field.name === 'profile_image' && item.hasOwnProperty('profile_image')) {
                        // حالت خاص برای profile_image اگر کلید متفاوتی دارد
                        currentFileName = item.profile_image;
                    }
                    // اگر نام فایل پیدا نشد، currentFileName خالی می‌ماند

                    // پیدا کردن المان نمایش نام فایل (با استفاده از کلاس صحیح HTML شما: .file-name-display)
                    const parentGroup = element.closest('.mb-3'); // والد .mb-3
                    const fileNameDisplay = parentGroup ? parentGroup.querySelector('.file-name-display') : null;

                    if (fileNameDisplay) {
                        if (currentFileName && currentFileName !== 'null' && currentFileName !== '') {
                            fileNameDisplay.textContent = `فایل فعلی: ${currentFileName}`;
                        } else {
                            fileNameDisplay.textContent = 'هیچ فایلی انتخاب نشده است';
                        }
                    } else {
                        console.warn(`Display element with class ".file-name-display" for file field "${field.name}" not found.`);
                    }
                    // مقدار value برای input type="file" تنظیم نمی‌شود.
                } else {
                    // --- مدیریت فیلدهای غیر فایل ---
                    // اگر مقدار یک آبجکت با 'id' است (برای فیلدهای foreign key یا select)
                    if (typeof valueToSet === 'object' && valueToSet !== null && valueToSet.hasOwnProperty('id')) {
                        valueToSet = valueToSet.id;
                    }
                    // تنظیم مقدار فیلد
                    element.value = valueToSet;
                }
            } else {
                 // اگر داده‌ای برای این فیلد در itemData نیست یا null/undefined است
                 if (element.type !== 'file') {
                    // پاک کردن مقدار فیلدهای غیر فایل
                    element.value = '';
                 } else {
                     // برای فیلدهای فایل، نمایش را به حالت پیش‌فرض برگردان
                    const parentGroup = element.closest('.mb-3');
                    const fileNameDisplay = parentGroup ? parentGroup.querySelector('.file-name-display') : null;
                    if (fileNameDisplay) {
                        fileNameDisplay.textContent = 'هیچ فایلی انتخاب نشده است';
                    }
                 }
            }
        }
        console.log('Form populated successfully for edit.');

        // --- نمایش مودال ---
        if (this.modalInstance) {
            this.modalInstance.show();
            console.log('Modal shown.');
        } else {
            console.error('Modal instance is not available! Cannot show modal.');
            // اینجا می‌توانید یک پیام خطا به کاربر نمایش دهید
        }

    } catch (error) {
        console.error("Error during edit item process:", error);
        // نمایش خطا به کاربر با استفاده از تابع کمکی
        this.displayFormError(`خطا در بارگذاری اطلاعات برای ویرایش: ${error.message}`);
    }
}

// --- تابع کمکی برای نمایش خطا (باید در جایی تعریف شده باشد) ---
// displayFormError(message) {
//     // پیاده‌سازی نمایش خطا بر اساس UI شما
//     alert(`خطا: ${message}`); // مثال ساده
// }

// --- ملاحظات اضافی ---
// 1. `this.options.fields`: مطمئن شوید که این آرایه شامل تمام فیلدهایی است که می‌خواهید مدیریت کنید، و برای فیلدهای فایلی که نامشان در API متفاوت است، ممکن است نیاز به اضافه کردن یک کلید سفارشی مانند `fileNameKey` در تعریف فیلد داشته باشید.
//    مثال: { name: 'attachment', type: 'file', label: 'فایل پیوست', fileNameKey: 'attachment_name' }
// 2. `this.options.endpoint`: باید به درستی تنظیم شده باشد تا URL صحیح برای دریافت داده‌ها را بسازد.
// 3. `this.renderFormFields`: اگر این تابع DOM را تغییر می‌دهد، بسیار مهم است که منتظر بمانید تا کارش تمام شود. اگر Promise برنمی‌گرداند، تأخیر (setTimeout) تنها راه حل است، اما سعی کنید آن را به Promise تبدیل کنید.
// 4. `item.hasOwnProperty(field.name)`: این بررسی مهم است تا از خطاهای مربوط به مقادیر `null` یا `undefined` جلوگیری شود.
// 5. `element.type === 'file'`: منطق مربوط به فیلدهای فایل در اینجا جدا شده است.
// 6. `fileNameDisplay.textContent`: از کلاس صحیح HTML شما (`.file-name-display`) استفاده شده است.
// 7. پاکسازی فیلدها: بخش `else` که در صورت نبودن داده در `itemData` اتفاق می‌افتد، مقدار فیلدهای غیر فایل را پاک می‌کند و برای فیلدهای فایل، نمایش نام فایل را به حالت پیش‌فرض برمی‌گرداند.


//     async editItem(id) {
//     this.currentEditId = id;
//     this.modalTitleElement.textContent = `ویرایش ${this.options.title}`;
//     const existingError = this.formElement.querySelector('.error-message');
//     if (existingError) {
//         existingError.remove();
//     }

//     console.log('Editing item:', id);
//     console.log('Initial form element:', this.formElement); // لاگ اولیه

//     try {
//         const response = await fetch(`${this.options.endpoint}${id}/`);
//         if (!response.ok) {
//             // ... مدیریت خطا ...
//             throw new Error('Failed to fetch item');
//         }
//         const item = await response.json();
//         console.log('Item data fetched:', item);

//         // --- مهم: منتظر می‌مانیم تا renderFormFields کامل شود ---
//         // اگر renderFormFields یک Promise برمی‌گرداند، از await استفاده کنید.
//         // اگر خود تابع sync است، این await لازم نیست اما setTimeout همچنان می‌تواند کمک کند.
//         await this.renderFormFields(false); // فرض می‌کنیم این تابع باید منتظر بماند
//         console.log('Form fields rendered. Current form element:', this.formElement); // لاگ بعد از render

//         // یک تأخیر کوچک برای اطمینان از آپدیت کامل DOM
//         await new Promise(resolve => setTimeout(resolve, 50)); // کمی تأخیر بیشتر

//         // --- پر کردن فیلدها ---
//         for (const field of this.options.fields) {
//             const element = this.formElement.querySelector(`[name="${field.name}"]`);
//             if (!element) {
//                 console.warn(`Element for field "${field.name}" not found after rendering.`);
//                 continue; // رد شدن از این فیلد
//             }

//             if (item.hasOwnProperty(field.name) && item[field.name] !== null && item[field.name] !== undefined) {
//                 let valueToSet = item[field.name];

//                 if (element.type === 'file') {
//                     // --- مدیریت فیلد فایل ---
//                     const currentFileName = item[`${field.name}_name`] || item.profile_image; // کلید دقیق را بررسی کنید
                   
//                     if (currentFileName) {
//                         // پیدا کردن یک المان برای نمایش نام فایل
//                         // این المان باید در HTML شما وجود داشته باشد
//                         const fileNameDisplay = element.closest('.form-group') ? element.closest('.form-group').querySelector('.current-file-name') : null;
//                         if (fileNameDisplay) {
//                             fileNameDisplay.textContent = `فایل فعلی: ${currentFileName}`;
//                         } else {
//                             console.warn(`Display element for file "${field.name}" not found.`);
//                         }
//                     }
//                     // مقدار value برای input type="file" تنظیم نمی‌شود
//                 } else {
//                     // --- مدیریت فیلدهای غیر فایل ---
//                     if (typeof valueToSet === 'object' && valueToSet !== null && valueToSet.hasOwnProperty('id')) {
//                         valueToSet = valueToSet.id;
//                     }
//                     // ... سایر مدیریت مقادیر پیچیده ...
//                     element.value = valueToSet;
//                 }
//             } else {
//                  // اگر داده‌ای برای این فیلد نیست، مقدار را پاک می‌کنیم (مگر فایل)
//                  if (element.type !== 'file') {
//                     element.value = '';
//                  }
//             }
//         }
//         console.log('Form populated successfully.');

//         // --- نمایش مودال ---
//         if (this.modalInstance) {
//             this.modalInstance.show();
//             console.log('Modal shown.');
//         } else {
//             console.error('Modal instance is not available!');
//         }

//     } catch (error) {
//         console.error("Error fetching or preparing item for edit:", error);
//         // نمایش خطا به کاربر
//         this.displayFormError(`خطا در بارگذاری اطلاعات برای ویرایش: ${error.message}`);
//     }
// }

// async editItem(id) {
//     this.currentEditId = id;
//     this.modalTitleElement.textContent = `ویرایش ${this.options.title}`;
//     // پاک کردن خطای قبلی اگر وجود دارد
//     const existingError = this.formElement.querySelector('.error-message');
//     if (existingError) {
//         existingError.remove();
//     }

//     try {
//         const response = await fetch(`${this.options.endpoint}${id}/`);
//         if (!response.ok) {
//             // اگر خطای HTTP بود، پیام مناسب نمایش بده
//             let errorMsg = `خطا در دریافت اطلاعات: وضعیت ${response.status}`;
//             try {
//                 const errorData = await response.json();
//                 errorMsg = errorData.detail || JSON.stringify(errorData);
//             } catch (e) {
//                 // اگر پاسخ JSON نبود
//                 errorMsg = await response.text();
//             }
//             this.displayFormError(errorMsg); // فرض می‌کنیم این متد خطا را نمایش می‌دهد
//             throw new Error(errorMsg);
//         }
//         const item = await response.json();

//         // 1. ابتدا فرم را با فیلدهای مورد نیاز برای ویرایش بسازید
//         this.renderFormFields(false); // false یعنی برای حالت ویرایش

//         // 2. منتظر بمانید تا DOM آپدیت شود (اگر renderFormFields به صورت ناهمزمان کار می‌کند)
//         // اگر renderFormFields همزمان است، این خط ضرورتی ندارد ولی ضرری هم نمی‌زند.
//         // یک راه مطمئن‌تر، استفاده از یک callback یا Promise است که renderFormFields برمی‌گرداند.
//         // اما معمولاً renderFormFields باید DOM را بلافاصله آپدیت کند.

//         // 3. حالا مقادیر را در فرمِ ساخته شده ست کنید
//         // بهتر است ابتدا formData را نسازید، چون ممکن است فرم هنوز خالی باشد.
//         // مستقیم به عناصر داخل this.formElement دسترسی پیدا کنید.
//         for (const field of this.options.fields) {
//             const element = this.formElement.querySelector(`[name="${field.name}"]`);
//             if (element) {
//                 if (item.hasOwnProperty(field.name) && item[field.name] !== null && item[field.name] !== undefined) {
//                     let valueToSet = item[field.name];

//                     // مدیریت حالت‌های خاص:
//                     // اگر مقدار یک شیء بود (مثلا برای Foreign Key یا Choice Field)
//                     if (typeof valueToSet === 'object' && valueToSet !== null) {
//                         // سعی کنید از 'id' استفاده کنید، اگر وجود داشت
//                         if (valueToSet.hasOwnProperty('id')) {
//                             valueToSet = valueToSet.id;
//                         } else {
//                             // اگر 'id' نداشت، سعی کنید اولین مقدار قابل استفاده را پیدا کنید
//                             // این بستگی به ساختار داده شما دارد. ممکن است نیاز به تنظیم دقیق‌تری باشد.
//                             // مثال: اگر { '2': 'نام گزینه' } بود، value '2' خواهد بود.
//                              const firstValue = Object.values(valueToSet)[0];
//                              if (typeof firstValue === 'string' || typeof firstValue === 'number') {
//                                  valueToSet = firstValue;
//                              } else {
//                                  // اگر مقدار خود شیء بود و نه id یا مقدار ساده، ممکن است نیاز به منطق بیشتری باشد
//                                  // console.warn(`Field ${field.name} has complex object value:`, valueToSet);
//                              }
//                         }
//                     }

//                     element.value = valueToSet;

//                     // برای فیلدهای فایل، مقدار value قابل تنظیم نیست.
//                     // این فیلدها باید جداگانه مدیریت شوند (مثلا نمایش نام فایل فعلی).
//                     // برای فایل‌ها، معمولاً شما فقط نام فایل را نمایش می‌دهید و کاربر فایل جدید را آپلود می‌کند.
//                     if (element.type === 'file') {
//                         // اینجا می‌توانید نام فایل فعلی را نمایش دهید اگر API آن را برگرداند
//                         // مثال: const currentFileName = item.attachment_name || item.attachment?.name;
//                         // element.nextElementSibling.textContent = currentFileName || 'No file chosen';
//                         // توجه: element.value = '...' برای فایل‌ها کار نمی‌کند.
//                     }

//                 } else {
//                     // اگر فیلد در داده‌های دریافتی نبود یا null/undefined بود، مقدار را پاک کنید
//                     // البته اگر فیلد فایل است، نباید پاک شود مگر اینکه بخواهیم فایل فعلی حذف شود
//                     if (element.type !== 'file') {
//                        element.value = '';
//                     }
//                 }
//             } else {
//                 // console.warn(`Element for field "${field.name}" not found in the form.`);
//             }
//         }

//         // 4. بعد از پر کردن تمام فیلدها، مودال را نمایش دهید
//         if (this.modalInstance) {
//             this.modalInstance.show();
//         }

//     } catch (error) {
//         console.error("Error fetching item for edit:", error);
//         // نمایش پیام خطا به کاربر در صورت بروز مشکل در fetch یا پردازش اولیه
//         this.displayFormError(`خطا در بارگذاری اطلاعات برای ویرایش: ${error.message}`);
//     }
// }
    // async editItem(id) {
    //     this.currentEditId = id;
    //     this.modalTitleElement.textContent = `ویرایش ${this.options.title}`;
    //     this.formElement.querySelector('.error-message')?.remove(); // پاک کردن خطای قبلی

    //     try {
    //         const response = await fetch(`${this.options.endpoint}${id}/`); // فرض بر اینکه API با ID آیتم را برمی‌گرداند
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         const item = await response.json();

    //         // پر کردن فرم با داده‌های آیتم
    //         this.renderFormFields(false); // false یعنی برای حالت ویرایش
    //         const formData = new FormData(this.formElement); // ساخت یک FormData خالی برای دسترسی به عناصر
    //         for (const field of this.options.fields) {
    //             const element = this.formElement.querySelector(`[name="${field.name}"]`);
    //             if (element) {
    //                 // مقدار دهی فیلد (ممکن است نیاز به map کردن باشد، مثلاً برای select)
    //                 if (item[field.name] !== undefined) {
    //                     element.value = item[field.name];
    //                     // اگر فیلد select است و مقدار آن یک شیء بود (مثلا {id: 1, name: "تهران"})
    //                     // باید مقدار value را به صورت item[field.name].id تنظیم کنید
    //                     if (element.tagName === 'SELECT' && typeof item[field.name] === 'object' && item[field.name] !== null) {
    //                          if(item[field.name].hasOwnProperty('id')) element.value = item[field.name].id;
    //                          else element.value = Object.values(item[field.name])[0]; // فرض اولی مقدار value است
    //                     }
    //                 } else {
    //                     element.value = ''; // پاک کردن فیلد اگر در داده‌ها نبود
    //                 }
    //             }
    //         }
    //         // نمایش مودال
    //         if (this.modalInstance) {
    //             this.modalInstance.show();
    //         }

    //     } catch (error) {
    //         console.error("Error fetching item for edit:", error);
    //         // نمایش پیام خطا به کاربر
    //     }
    // }

    async deleteItem(id) {
        this.currentDeleteId = id;
        document.getElementById('deleteConfirmModalLabel').textContent = `تأیید حذف ${this.options.title}`;

        if (this.deleteModalInstance) {
            this.deleteModalInstance.show();
        }
    }

    async confirmDelete() {
        if (!this.currentDeleteId) return;

        try {
            const response = await fetch(`${this.options.endpoint}${this.currentDeleteId}/`, {
                method: 'DELETE',
                // headers: {
                //     'X-CSRFToken': getCookie('csrftoken'), // اگر CSRF token لازم است
                // }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // بستن مودال حذف
            if (this.deleteModalInstance) {
                this.deleteModalInstance.hide();
            }
            // داده‌ها را مجددا بارگذاری کنید
            this.fetchItems();
            this.currentDeleteId = null; // پاک کردن ID پس از حذف موفق

        } catch (error) {
            console.error("Error deleting item:", error);
            // نمایش پیام خطا به کاربر
        }
    }
}

// تابع کمکی برای گرفتن CSRF token (اگر لازم باشد)
// function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         const cookies = document.cookie.split(';');
//         for (let i = 0; i < cookies.length; i++) {
//             const cookie = cookies[i].trim();
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }

// مثال استفاده (که در فایل HTML شما بود)
// document.addEventListener("DOMContentLoaded", function () {
//   new GenericCRUD({
//     endpoint: "/api/cities/",
//     title: "مدیریت شهرها",
//     pageTitleId: "page-title",
//     addBtnId: "add-item-btn",
//     tableHeadId: "crud-table-head",
//     tableBodyId: "crud-table-body",
//     formId: "crud-form",
//     modalTitleId: "crudModalLabel",
//     saveBtnId: "save-crud-btn",
//     deleteBtnId: "confirm-delete-btn",
//     fields: [
//         { name: "id", label: "ID", type: "text", readonly: true }, // فیلد ID معمولا فقط خواندنی است
//         { name: "name", label: "نام شهر", type: "text", required: true },
//         {
//             name: "province", // این باید با نام فیلد در API مطابقت داشته باشد
//             label: "استان",
//             type: "select",
//             required: true,
//             options: [
//                 { value: "", text: "انتخاب استان" }, // گزینه پیش‌فرض
//                 { value: 1, text: "تهران" },
//                 { value: 2, text: "اصفهان" }
//             ]
//         }
//     ],
//     displayFields: [ // فیلدهایی که در جدول نمایش داده می‌شوند
//         { name: "id", label: "ID" },
//         { name: "name", label: "نام شهر" },
//         // فرض می‌کنیم API نام استان را به صورت 'province_name' برمی‌گرداند.
//         // اگر API فقط ID استان را برمی‌گرداند، ممکن است لازم باشد این بخش را تغییر دهید
//         // یا در بک‌اند یک serialiser برای نمایش نام استان ایجاد کنید.
//         { name: "province_name", label: "نام استان" }
//     ]
//   });
// });
