// Pool kecil dan idle timeout mencegah koneksi mati dipakai ulang pada Netlify/Supavisor.
export function connectionOptions(url: string) {
  const hosted = /(^|\.)supabase\.(co|com)$/.test(new URL(url).hostname);
  return {
    max: 3,
    idle_timeout: 20,
    connect_timeout: 8,
    prepare: false,
    ssl: hosted ? 'require' as const : undefined,
    connection: { application_name: 'rancang-api' },
  };
}
