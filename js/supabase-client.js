(function () {
  const url = window.BETHEL_SUPABASE_URL;
  const key = window.BETHEL_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key || !window.supabase) {
    window.bethelSupabase = null;
    return;
  }

  window.bethelSupabase = window.supabase.createClient(url, key);
})();
