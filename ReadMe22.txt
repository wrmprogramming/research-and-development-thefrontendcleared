git init
git add .
git status //در لیست فایل‌هایی که قرار است آپلود بشوند، نباید اسم node_modules رو ببینید!
git commit -m "پروژه React - نسخه اولیه"
git branch -M main
git remote add origin https://github.com/wrmprogramming/research_and_development_frontend.git
git push -u origin main



git clone https://github.com/wrmprogramming/research_and_development_frontend.git
cd research_and_development_frontend
npm install ==> use ==> npm install --legacy-peer-deps
npm run dev ==> npm start



git pull ==> از شاخه خاصی بگیرمک ==؟  git pull origin main
git add .
git add src/components/NewComponent.js
git add src/App.js
git commit -m "توضیح تغییراتی که انجام شد"
git pull
git push ==> به شاخه خاصی باشه ==؟ git push origin main



git status => شاخه محلی با راه‌دور هماهنگ است؟
git branch -d feature/old-feature => حذف یک شاخه محلی
git branch -D feature/old-feature => حذف به زور (ادغام نشده)
git branch -r => شاخه های راه دور
git branch -a => شاخه ها

شاخه جدید بسازیم و به گیت‌هاب بفرستیم
git branch => شاخه های محلی 
git checkout main => روش شاخه اصلی باشم
git pull  => git fetch  + git merge origin/main  اول ببینید چه تغییراتی در گیت‌هاب است (بدون ادغام) 
git diff main origin/main => اگر تغییرات بزرگ است، اول بررسی کنید
git checkout -b feature/add-dashboard => شاخه جدید با ویژگی جدید
git add .
git commit -m "افزودن ویژگی جدید"
git push -u origin feature/add-dashboard
git branch -a => دیدن شاخه جدید
تغییرات روی شاخه جدیدgit add .
git commit -m "تکمیل ویژگی داشبورد"
git push   # بدون -u 


تغییرات را بررسی کردن روزانه
git fetch
git log main..origin/main --oneline
git pull یا git diff main origin/main
git merge origin/main

اضاف کردن ویژگی جدید روی یک برنچ جدید بدون اینکه این ویژگی تاثیری روی پروژه بزاره و برگشت به حالا قبلی
git checkout -b feature/generic-components-backup 
git add .   
git commit -m "feat: اضافه کردن جنریک کامپوننت برای پیج ها"               
git branch -a 
git checkout main
git status 
git push -u origin feature/generic-components-backup