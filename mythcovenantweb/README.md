# Myth Covenant Admin

Myth Covenant Admin là nền tảng quản trị cho website Myth Covenant, hỗ trợ quản lý thành viên, layout team, import/export Excel, đăng nhập admin và lưu trữ dữ liệu trên Supabase.

## Tính năng chính
- Quản lý thành viên với CRUD
- Import/Export Excel cho danh sách thành viên
- Quản lý layout team và export team hiện tại
- Đăng nhập admin bằng Supabase Auth
- Giao diện tối giản, đẹp trên desktop và mobile

## Công nghệ sử dụng
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- xlsx

## Cài đặt local

1. Cài đặt dependencies
```bash
npm install
```

2. Tạo file môi trường
```bash
cp .env.example .env.local
```

3. Điền thông tin Supabase vào .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Chạy dev server
```bash
npm run dev
```

Mở http://localhost:3000 để xem ứng dụng.

## Cấu hình Supabase

### 1. Tạo project trên Supabase
- Truy cập https://supabase.com
- Tạo project mới
- Lấy URL và keys từ Settings > API

### 2. Tạo bảng dữ liệu
Trong SQL Editor, chạy các lệnh sau:

```sql
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  class_name text not null,
  role text not null,
  power integer not null default 0,
  note text not null default '',
  created_at timestamptz default now()
);

create table if not exists public.team_assignments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  assignments jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 3. Bật Authentication
- Vào Authentication > Settings
- Bật Email provider
- Tạo ít nhất một tài khoản admin qua Authentication > Users

### 4. Cấu hình RLS (khuyến nghị)
Nếu dùng Row Level Security, hãy tạo policy phù hợp hoặc tắt RLS cho môi trường phát triển.

## Deploy lên Vercel

1. Push project lên GitHub.
2. Truy cập https://vercel.com và chọn Import Project.
3. Chọn repository vừa push.
4. Thiết lập môi trường:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
5. Build Command: `npm run build`
6. Output Directory: `.next`
7. Deploy.

## Kiểm tra trước khi deploy
```bash
npm run lint
npm run build
```

## GitHub ready
- Đảm bảo đã commit và push toàn bộ source code.
- Không commit file .env.local.
- Khuyến nghị tạo .gitignore cho file môi trường và thư mục build.
