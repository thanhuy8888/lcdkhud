/* Cấu hình môi trường Sổ tay LCĐ KHUD */
(function() {
  var globalConfig = window.APP_CONFIG || {};

  // Hỗ trợ nạp cấu hình từ localStorage khi thử nghiệm môi trường cục bộ
  var storedUrl = '';
  var storedKey = '';
  try {
    storedUrl = localStorage.getItem('lcdkhud_supabase_url') || '';
    storedKey = localStorage.getItem('lcdkhud_supabase_anon_key') || '';
  } catch (e) {}

  window.APP_CONFIG = {
    SUPABASE_URL: globalConfig.SUPABASE_URL || storedUrl || '',
    SUPABASE_ANON_KEY: globalConfig.SUPABASE_ANON_KEY || storedKey || ''
  };
})();
