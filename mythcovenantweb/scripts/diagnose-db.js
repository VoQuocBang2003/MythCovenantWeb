const fs = require('fs');
const path = require('path');

// 1. Try to read environment variables from .env files
const projectRoot = path.resolve(__dirname, '..');
const envFiles = ['.env.local', '.env.development', '.env', '.env.production'];
let envConfig = {};

console.log('=== HỆ THỐNG KIỂM TRA KẾT NỐI SUPABASE ===\n');

let envFileFound = null;
for (const file of envFiles) {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    envFileFound = file;
    console.log(`[+] Tìm thấy file cấu hình: ${file}`);
    const content = fs.readFileSync(filePath, 'utf-8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] || '';
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        envConfig[key] = value.trim();
      }
    });
    break;
  }
}

if (!envFileFound) {
  console.log('[-] CẢNH BÁO: Không tìm thấy bất kỳ file .env.local hoặc .env nào tại thư mục gốc!');
  console.log('    Bạn cần tạo một file tên là `.env.local` ở thư mục gốc của dự án với nội dung:');
  console.log('    NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here\n');
}

// Map variables (support both anon_key and publishable_key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const activeKey = supabaseAnonKey || supabasePublishableKey;

console.log('--- Thông tin cấu hình hiện tại ---');
console.log(`URL: ${supabaseUrl ? supabaseUrl : 'CHƯA ĐỊNH NGHĨA (Đang thiếu)'}`);
console.log(`Anon Key: ${supabaseAnonKey ? 'Đã tìm thấy' : 'CHƯA ĐỊNH NGHĨA (Đang thiếu)'}`);
console.log(`Publishable Key: ${supabasePublishableKey ? 'Đã tìm thấy' : 'CHƯA ĐỊNH NGHĨA'}`);
console.log('---------------------------------\n');

if (!supabaseUrl || !activeKey) {
  console.log('[!] KẾT LUẬN: Thiếu tham số kết nối. Không thể tiến hành kiểm tra kết nối với Supabase.');
  process.exit(1);
}

// 2. Load Supabase JS
let createClient;
try {
  const supabaseJs = require('@supabase/supabase-js');
  createClient = supabaseJs.createClient;
} catch (err) {
  console.error('[-] Lỗi: Không thể load thư viện @supabase/supabase-js. Vui lòng chạy `npm install` trước.');
  process.exit(1);
}

// 3. Test Connection
const supabase = createClient(supabaseUrl, activeKey);

async function testConnection() {
  console.log('[*] Đang kiểm tra kết nối tới Supabase...');
  
  // Test query players table
  console.log('[*] Đang truy vấn bảng "players"...');
  const { data: playersData, error: playersError } = await supabase
    .from('players')
    .select('id')
    .limit(1);

  if (playersError) {
    console.log('\n[-] LỖI KẾT NỐI BẢNG "players":');
    console.log(`    Mã lỗi: ${playersError.code || 'Không có'}`);
    console.log(`    Thông báo: ${playersError.message}`);
    console.log(`    Chi tiết: ${playersError.details || 'Không có'}`);
    console.log(`    Gợi ý: ${getHelpMessage(playersError)}`);
  } else {
    console.log('[+] Kết nối thành công tới bảng "players"!');
    console.log(`    Số lượng bản ghi lấy thử: ${playersData.length}`);
  }

  console.log('\n[*] Đang truy vấn bảng "team_assignments"...');
  const { data: teamData, error: teamError } = await supabase
    .from('team_assignments')
    .select('id')
    .limit(1);

  if (teamError) {
    console.log('\n[-] LỖI KẾT NỐI BẢNG "team_assignments":');
    console.log(`    Mã lỗi: ${teamError.code || 'Không có'}`);
    console.log(`    Thông báo: ${teamError.message}`);
    console.log(`    Chi tiết: ${teamError.details || 'Không có'}`);
    console.log(`    Gợi ý: ${getHelpMessage(teamError)}`);
  } else {
    console.log('[+] Kết nối thành công tới bảng "team_assignments"!');
    console.log(`    Số lượng bản ghi lấy thử: ${teamData.length}`);
  }
}

function getHelpMessage(error) {
  const msg = error.message.toLowerCase();
  const code = error.code;

  if (msg.includes('fetch failed') || msg.includes('network') || msg.includes('getaddrinfo')) {
    return 'Lỗi mạng hoặc URL Supabase không chính xác. Hãy kiểm tra kết nối internet và xem NEXT_PUBLIC_SUPABASE_URL đã nhập đúng chưa.';
  }
  if (msg.includes('api key') || msg.includes('invalid jwt') || msg.includes('jwt expired') || msg.includes('anon key')) {
    return 'API Key (Anon Key) không hợp lệ hoặc đã hết hạn. Hãy kiểm tra lại NEXT_PUBLIC_SUPABASE_ANON_KEY trong file .env.local.';
  }
  if (msg.includes('relation') && msg.includes('does not exist')) {
    return 'Bảng này chưa tồn tại trong database. Bạn đã chạy các file Migration/SQL Schema trên trang quản trị Supabase (SQL Editor) chưa? Hãy chạy file `supabase/schema.sql`.';
  }
  if (code === '42P01') {
    return 'Lỗi Postgres: Relation does not exist (Bảng chưa được tạo). Hãy chạy file migration hoặc schema.sql trên Supabase.';
  }
  if (code === 'PGRST116') {
    return 'Lỗi truy vấn single/multiple. Không ảnh hưởng đến kết nối chung.';
  }
  return 'Kiểm tra xem Row Level Security (RLS) trên Supabase có đang chặn quyền truy cập không, hoặc cấu hình quyền truy cập (Policies) cho bảng.';
}

testConnection();
