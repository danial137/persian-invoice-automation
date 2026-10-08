# حساب‌یار — HesabYar

اتوماسیون فارسی صدور فاکتور، فروش، مدیریت موجودی و دفتر حسابداری دوبل با Next.js App Router و PostgreSQL. همه مبالغ **تومان صحیح (`bigint`)** هستند.

> **وضعیت پروژه:** نمونه‌کار / مبنای توسعه، نه محصول حسابداری آماده تولید تجاری. صحت قانونی فاکتور، انطباق مالیاتی، مالیات بر ارزش افزوده، گزارش‌های قانونی و امنیت عملیاتی به بررسی و توسعه بیشتر نیاز دارند.

## امکانات

- احراز هویت با کوکی HTTP-only امضاشده و نقش‌های `ADMIN`, `ACCOUNTANT`, `SALES`
- پیش‌فاکتور، فروش قطعی، ثبت پرداخت، تسویه و لغو مشروط فاکتور
- کسر موجودی با شرط اتمیک و ثبت گردش انبار
- ثبت خودکار اسناد حسابداری بدهکار/بستانکار در همان تراکنش فروش یا پرداخت
- مدیریت مشتریان، محصولات، گزارش‌های فروش، چاپ فاکتور A4 و CSV با محافظت در برابر Spreadsheet Formula Injection
- رابط فارسی و راست‌چین با چیدمان واکنش‌گرا
- تست‌های منطق مالی، اعتبارسنجی فرم، سند حسابداری و CSV

## پیش‌نیازها

- Node.js 22+ و npm
- Docker Desktop (یا PostgreSQL 16+ موجود)
- پورت 3000 برای Next.js و **5433** برای PostgreSQL کانتینری (پیش‌فرض قابل تنظیم)

## راه‌اندازی تازه روی Windows / PowerShell

```powershell
Copy-Item .env.example .env
# Edit .env and use unique strong SESSION_SECRET and ADMIN_PASSWORD.
docker compose up -d db
npm install
npx prisma validate
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

سپس `http://localhost:3000/login` را باز کنید. ایمیل و رمز اولیه دقیقاً از `ADMIN_EMAIL` و `ADMIN_PASSWORD` فایل `.env` خوانده می‌شوند.

> هشدار امنیتی: مقادیر `.env.example` فقط نمونه توسعه محلی هستند. آن‌ها را در اینترنت یا محیط واقعی استفاده نکنید.

### اگر از نسخه قبلی حساب‌یار استفاده می‌کنید

1. از پروژه قدیمی و دیتابیس بکاپ بگیرید. برای دیتابیس Docker:

   ```powershell
   docker compose exec -T db pg_dump -U invoice -d invoices > invoices-backup.sql
   ```

2. فایل‌های سورس جدید را در پوشه‌ای **جداگانه** استخراج کنید. ابتدا `README.md` و تفاوت‌های `.env.example` با `.env` خودتان را بخوانید.
3. **فایل `.env` فعلی‌تان را جایگزین نکنید.** رمز واقعی دیتابیس، تنظیمات اتصال و `SESSION_SECRET` قبلی را نگه دارید تا حساب‌ها و نشست‌های قدیمی از دست نروند. `.env` داخل ZIP نیست.
4. این نسخه **تغییر تخریبی در Prisma Schema یا نام جدول‌ها نمی‌دهد**. بعد از بکاپ، دستورات `npx prisma validate`, `npx prisma generate` و `npx prisma db push` را اجرا کنید.
5. `npm install`, `npm test` و سپس `npm run dev` را اجرا کنید. حساب‌ها، مشتریان و فاکتورهای موجود در PostgreSQL حفظ می‌شوند، مشروط بر اینکه به همان دیتابیس متصل باشید.

**هرگز برای ارتقاء** `docker compose down -v`، `prisma migrate reset` یا حذف Volume دیتابیس را اجرا نکنید.

### رفع مشکل پورت یا رمز PostgreSQL

`docker compose ps` باید اتصال `127.0.0.1:5433->5432/tcp` را نشان دهد (با پیش‌فرض این پروژه). اگر PostgreSQL ویندوز روی 5432 گوش می‌دهد، برای Docker پورت 5433 را حفظ کنید.

مقادیر `POSTGRES_PASSWORD` و رمز داخل `DATABASE_URL` باید مطابق رمز **واقعی کاربر دیتابیس موجود** باشند؛ تغییر متغیر محیطی بعد از ایجاد Volume، رمز PostgreSQL را خودکار تغییر نمی‌دهد.

اتصال را تست کنید:

```powershell
docker compose exec -e PGPASSWORD=invoice_dev_password db psql -h 127.0.0.1 -U invoice -d invoices -c "SELECT 1;"
```

### بازیابی رمز ادمین

`npm run db:seed` رمز کاربر مدیر قبلی را تغییر نمی‌دهد. اگر رمز واقعی ادمین را فراموش کرده‌اید، مقدار `ADMIN_EMAIL` و **رمز جدید** `ADMIN_PASSWORD` را در `.env` قرار دهید و بزنید:

```powershell
npm run admin:reset
```

این فرمان فقط رمز مدیر انتخاب‌شده را تغییر می‌دهد؛ اطلاعات فروش و فاکتورها را دست نمی‌زند.

## دستورات کاربردی

| دستور | کاربرد |
| --- | --- |
| `npm run dev` | اجرای محلی Next.js؛ Prisma Client پیش از اجرا تولید می‌شود |
| `npm run build` | تولید Prisma Client و Build برای Production |
| `npm run typecheck` | بررسی TypeScript پس از نصب وابستگی‌ها |
| `npm test` | اجرای تست‌های مستقل بدون نیاز به دیتابیس |
| `npm run check` | TypeScript + تست‌ها |
| `npm run db:seed` | حساب‌های پیش‌فرض، ادمین اولیه و داده‌های نمونه در دیتابیس خالی |
| `npm run admin:reset` | تغییر صریح رمز مدیر موجود |
| `npm run db:studio` | Prisma Studio |

## ساختار پوشه‌ها

```text
app/
  (auth)/login/                # ورود
  (panel)/...                  # صفحات پنل: داده‌خوانی و ترکیب کامپوننت‌ها
  actions/                     # Server Actions نازک: مجوز، اعتبارسنجی، فراخوانی سرویس
  api/reports/sales/           # خروجی CSV
components/
  dashboard/                   # نمودار، KPI، میانبرها
  forms/                       # فرم‌های مستقل مشتری، محصول، پرداخت، تنظیمات و...
  invoices/                    # ویرایشگر، جدول اقلام، سند چاپی و عملیات
  ui/                          # عنوان، وضعیت ارسال، حالت خالی
lib/
  domain/invoices/             # قواعد ثبت، تبدیل و لغو سند
  domain/payments/             # ثبت دریافت و هماهنگی دفتر کل
  domain/inventory/            # تعدیل و گردش موجودی
  queries/dashboard.ts         # داده‌خوانی داشبورد
  validation/invoice.ts        # اعتبارسنجی ورودی فاکتور
  ledger.ts                    # قواعد ثبت سند حسابداری دوبل
  calculations.ts              # محاسبات pure بدون اعشار
  forms.ts / csv.ts            # ابزارهای validation و export
  auth.ts / db.ts              # امنیت نشست و Prisma singleton
styles/                         # CSS تفکیک‌شده بر اساس مسئولیت
prisma/                         # schema و seed سازگار با داده‌های قبلی
scripts/reset-admin.ts         # بازیابی رمز مدیر با درخواست صریح
tests/                          # unit tests
```

## قواعد Clean Code در این بازآرایی

1. **Separation of concerns**: صفحات سرور داده را می‌خوانند، فرم‌ها UI هستند، سرویس‌ها منطق تجاری را اجرا می‌کنند.
2. **Server is authoritative**: قیمت فروش از DB گرفته می‌شود و کل مبلغ روی سرور دوباره حساب می‌شود.
3. **Transactions & invariants**: کاهش موجودی، ایجاد فاکتور و سند دوبل یا همگی ثبت می‌شوند، یا همگی rollback می‌شوند.
4. **Safe error handling**: خطای خام دیتابیس به querystring منتقل نمی‌شود. خطا در log سرور ثبت می‌شود.
5. **Reusability**: فرم‌ها و عناصر مشترک و CSS بر اساس مسئولیت تقسیم شده‌اند.
6. **Compatibility**: جدول‌ها، enumها، روابط Prisma و فایل `.env` کاربر دست‌نخورده می‌مانند.

## محدودیت‌های شناخته‌شده و کارهای باقی‌مانده قبل از عرضه تجاری

- نبود تست یکپارچه روی PostgreSQL واقعی و مرورگر؛ واحدها جایگزین آن نیستند.
- نبود چندمستاجری (Multi-tenant) و جداسازی داده شرکت‌های مختلف.
- نبود حسابرسی تغییرات (audit log)، backup automation، مانیتورینگ و rate limit برای login.
- گزارش‌های عملیاتی صفحه برای کارایی به تعداد مشخصی ردیف محدودند؛ جمع‌بندی برخی گزارش‌ها نیز فقط مربوط به همان مجموعه است.
- ساخت پیش‌فاکتور به فروش از قیمت **روز تبدیل** استفاده می‌کند، نه قیمت زمان پیش‌فاکتور؛ باید با نیاز کسب‌وکار هماهنگ شود.
- پرداخت‌ها برای ثبت دریافت به حساب پیش‌فرض «صندوق و بانک» می‌روند؛ تفکیک حساب بانک/کارت و تسویه واقعی قابل توسعه است.
- قالب فاکتور جایگزین الزامات قانونی و مالیاتی ایران نیست.
- تغییرات این نسخه از نظر سینتکس/مسیر import/CSS و unit test بررسی شده‌اند؛ **Next.js production build و اجرای Docker در محیط ساخت قابل تست نبودند** به دلیل عدم دسترسی به registry npm.

## استقرار

فایل Dockerfile برای اجرای Next.js به صورت standalone در پروژه وجود دارد. دیتابیس را خصوصی نگه دارید، از HTTPS و secrets امن استفاده کنید، نسخه Node و Prisma را قفل کنید و قبل از استقرار واقعی `npm run check`, `npm run build` و تست کار با دیتابیس آزمایشی را اجرا کنید.
