// Builds index-live-test.html: the site pointed at a mock backend, for tests.
import fs from "fs";
let html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
html = html.replace(/const SUPABASE_URL\s*=\s*"[^"]*";/, 'const SUPABASE_URL      = "https://mock.supabase.co";');
html = html.replace(/const SUPABASE_ANON_KEY\s*=\s*"[^"]*";/, 'const SUPABASE_ANON_KEY = "mock-key";');
html = html.replace(/<script src="https:\/\/cdn\.jsdelivr[^"]*"><\/script>/, "");
fs.writeFileSync(new URL("./index-live-test.html", import.meta.url), html);
console.log("tests/index-live-test.html built");
