# Myth Covenant - Database Design Documentation

## Tổng quan

Database được thiết kế cho dự án Myth Covenant sử dụng PostgreSQL (Supabase) với 5 bảng chính: `users`, `players`, `teams`, `team_members`, và `settings`. Thiết kế hướng tới tính mở rộng, linh hoạt và dễ bảo trì.

---

## 1. Quan hệ giữa các bảng

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│  users  │◄────────│ players │◄────────│ teams   │
└─────────┘    1   1└─────────┘    1   1└─────────┘
     │                   │                   │
     │ 1..*              │ 1..*              │ 1..*
     ▼                   ▼                   ▼
     ┌─────────────────────────────────────────────┐
     │              team_members                   │
     └─────────────────────────────────────────────┘
                    1..*
                    
┌─────────┐
│ settings│
└─────────┘
```

### Mối quan hệ chi tiết:

- **users** 1 ── 1 **players**: Mỗi user có một player profile duy nhất
- **teams** 1 ── 1 **players** (leader): Mỗi team có một leader (player)
- **teams** 1 ── n **team_members**: Mỗi team có nhiều thành viên
- **players** 1 ── n **team_members**: Mỗi player có thể tham gia nhiều team (lịch sử)
- **settings** n ── 1 **users**: Mỗi user có nhiều settings
- **settings** n ── 1 **teams**: Mỗi team có nhiều settings

---

## 2. Mục đích từng bảng

### 2.1 users

Bảng chứa thông tin xác thực và hồ sơ người dùng hệ thống.

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | UUID (PK) | Khóa chính, tự động sinh UUID |
| `email` | VARCHAR(255) | Email người dùng, duy nhất |
| `full_name` | VARCHAR(255) | Họ tên đầy đủ |
| `avatar_url` | TEXT | URL ảnh đại diện |
| `role` | VARCHAR(50) | Vai trò: 'user', 'admin', 'moderator' |
| `is_active` | BOOLEAN | Trạng thái kích hoạt tài khoản |
| `email_verified` | BOOLEAN | Đã xác thực email |
| `last_login_at` | TIMESTAMP | Lần đăng nhập cuối |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

**Indexes:**
- `idx_users_email` - Tìm kiếm nhanh theo email
- `idx_users_role` - Lọc theo vai trò
- `idx_users_is_active` - Lọc trạng thái hoạt động

---

### 2.2 players

Bảng chứa thông tin cấu hình game cho người chơi.

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | UUID (PK) | Khóa chính |
| `user_id` | UUID (FK) | Tham chiếu tới users.id |
| `display_name` | VARCHAR(100) | Tên hiển thị trong game |
| `game_id` | VARCHAR(100) | ID tài khoản game bên ngoài |
| `level` | INTEGER | Cấp độ hiện tại |
| `experience` | INTEGER | Điểm kinh nghiệm |
| `total_points` | INTEGER | Tổng điểm |
| `current_team_id` | UUID (FK) | Team hiện tại |
| `is_available` | BOOLEAN | Có sẵn để giao cho team |
| `status` | VARCHAR(50) | Trạng thái: 'active', 'inactive', 'banned' |
| `metadata` | JSONB | Dữ liệu mở rộng linh hoạt |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

**Indexes:**
- `idx_players_user_id` - Join với users
- `idx_players_current_team_id` - Join với teams
- `idx_players_status` - Lọc trạng thái
- `idx_players_total_points` - Sắp xếp bảng xếp hạng

---

### 2.3 teams

Bảng quản lý thông tin đội nhóm.

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | UUID (PK) | Khóa chính |
| `name` | VARCHAR(100) | Tên đội |
| `description` | TEXT | Mô tả đội |
| `leader_id` | UUID (FK) | ID leader (player) |
| `max_members` | INTEGER | Số thành viên tối đa |
| `current_member_count` | INTEGER | Số thành viên hiện tại |
| `is_active` | BOOLEAN | Trạng thái hoạt động |
| `team_code` | VARCHAR(20) | Mã đội để tham gia |
| `metadata` | JSONB | Dữ liệu mở rộng |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

**Indexes:**
- `idx_teams_leader_id` - Tìm team theo leader
- `idx_teams_team_code` - Tìm team bằng mã
- `idx_teams_current_member_count` - Thống kê số thành viên

---

### 2.4 team_members

Bảng trung gian ghi lại mối quan hệ giữa team và player, bao gồm cả lịch sử.

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | UUID (PK) | Khóa chính |
| `team_id` | UUID (FK) | Tham chiếu teams.id |
| `player_id` | UUID (FK) | Tham chiếu players.id |
| `role` | VARCHAR(50) | Vai trò trong team: 'leader', 'deputy', 'member' |
| `status` | VARCHAR(50) | Trạng thái: 'active', 'inactive', 'left' |
| `joined_at` | TIMESTAMP | Thời gian tham gia |
| `left_at` | TIMESTAMP | Thời gian rời đi |
| `is_current` | BOOLEAN | Là thành viên hiện tại không |
| `metadata` | JSONB | Dữ liệu mở rộng |
| `created_at` | TIMESTAMP | Thời gian tạo bản ghi |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

**Unique Constraint:**
- `unique_team_player_current` - Đảm bảo một player chỉ có một bản ghi active duy nhất trong một team

**Indexes:**
- `idx_team_members_team_id` - Lấy danh sách thành viên của team
- `idx_team_members_player_id` - Lấy lịch sử team của player
- `idx_team_members_is_current` - Lọc thành viên hiện tại

---

### 2.5 settings

Bảng cấu hình linh hoạt cho hệ thốc và người dùng.

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | UUID (PK) | Khóa chính |
| `user_id` | UUID (FK) | Thuộc về user (có thể NULL) |
| `team_id` | UUID (FK) | Thuộc về team (có thể NULL) |
| `key` | VARCHAR(100) | Tên cấu hình |
| `value` | JSONB | Giá trị cấu hình |
| `data_type` | VARCHAR(20) | Kiểu dữ liệu: 'string', 'number', 'boolean', 'json' |
| `is_system` | BOOLEAN | Cấu hình hệ thống hay người dùng |
| `is_active` | BOOLEAN | Kích hoạt cấu hình |
| `description` | TEXT | Mô tả cấu hình |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

**Unique Constraint:**
- `unique_setting_key` - Kết hợp user_id, team_id, key để duy nhất

**Indexes:**
- `idx_settings_key` - Tìm cấu hình theo tên
- `idx_settings_is_system` - Phân biệt cấu hình hệ thống

---

## 3. Luồng dữ liệu

### 3.1 Đăng ký và tạo Player

```
1. Tạo record trong users (đăng ký tài khoản)
2. Tự động tạo record trong players (user_id = users.id)
3. Tạo settings mặc định cho user (is_system = true)
```

### 3.2 Tạo đội và thêm thành viên

```
1. Player tạo team (leader_id = player.id)
2. Tạo bản ghi team_members (team_id, player_id, role = 'leader')
3. Cập nhật current_team_id cho player
4. Cập nhật current_member_count cho team
```

### 3.3 Thêm thành viên vào đội

```
1. Tìm team bằng team_code
2. Kiểm tra current_member_count < max_members
3. Tạo bản ghi team_members (role = 'member')
4. Cập nhật current_team_id cho player
5. Tăng current_member_count cho team
```

### 3.4 Rời đội

```
1. Cập nhật team_members.is_current = false, status = 'left', left_at = NOW()
2. Đặt lại player.current_team_id = NULL
3. Giảm team.current_member_count
```

---

## 4. Tính mở rộng

### 4.1 Metadata (JSONB)

Mỗi bảng đều có trường `metadata JSONB` cho phép:
- Thêm thuộc tính mới mà không cần migration
- Lưu trữ dữ liệu phức tạp (mảng, đối tượng lồng nhau)
- Tương thích ngược khi có schema thay đổi

### 4.2 Settings linh hoạt

Bảng `settings` cho phép:
- Thêm cấu hình mới mà không thay đổi schema
- Hỗ trợ cấu hình đa cấp (hệ thống → team → user)
- Dễ dàng bật/tắt tính năng

### 4.3 Lịch sử team_members

Thay vì xóa bản ghi khi rời đội:
- Giữ lịch sử thay đổi bằng `is_current` và `left_at`
- Thống kê được hoạt động của player
- Phục hồi lại được trạng thái trước đó

---

## 5. Migration Order

Cần chạy migration theo thứ tự:

1. `001_create_users_table.sql` - Tạo bảng users + function trigger
2. `002_create_players_table.sql` - Tạo bảng players (chỉ có FK tới users)
3. `003_create_teams_table.sql` - Tạo bảng teams (chưa có FK)
4. `004_create_team_members_table.sql` - Tạo bảng team_members
5. `005_create_settings_table.sql` - Tạo bảng settings
6. `006_add_foreign_keys.sql` - Thêm FK còn lại (players.current_team_id, teams.leader_id)

---

## 6. Ghi chú

- Tất cả các bảng đều sử dụng UUID làm khóa chính để tránh xung đột khi merge dữ liệu
- Timestamp sử dụng `TIMESTAMP WITH TIME ZONE` để hỗ trợ đa múi giờ
- Các trường `is_active`, `status` cho phép soft delete
- Trigger `update_updated_at_column()` tự động cập nhật `updated_at` khi có thay đổi