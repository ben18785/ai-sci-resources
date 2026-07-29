// Tests LIVE-mode logic against a mock of the supabase-js client.
const { chromium } = require('playwright');

(async () => {
let lastDialog = '';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));

// Inject a mock supabase BEFORE page scripts run
await page.addInitScript(() => {
  const db = {
    resources: [
      { id: 'r1', title: 'Live Resource One', url: 'https://example.org', description: 'From the mock DB.',
        rtype: 'course', disciplines: ['Life sciences'], category: 'Machine learning', level: 'beginner', approved: true, created_at: '2026-07-01T00:00:00Z' },
      { id: 'r2', title: 'Live Resource Two', url: null, description: 'Also from the mock DB.',
        rtype: 'paper', disciplines: ['Computer science'], category: 'Machine learning', level: 'advanced', approved: true, created_at: '2026-07-02T00:00:00Z' }
    ],
    vote_counts: [ { resource_id: 'r2', voter_fields: ['Computer science'], voter_stage: "Master's", n: 3 } ],
    votes: [],
    profiles: [],
    comments: [],
    comment_votes: [],
    comment_vote_counts: [],
    vote_counts_30d: [ { resource_id: 'r2', n: 3 } ],
    admins: [{ user_id: 'user-1' }],
    my_path: [],
    paths: [],
    path_items: [],
    requests: [],
    request_votes: [],
    request_vote_counts: [],
    request_replies: [],
    public_profiles: [],
    resource_difficulty: [],
    votes_by_day: [ { day: '2026-07-20', n: 3 }, { day: '2026-07-27', n: 1 } ],
    flags: [],
    public_profile_stats: [],
    pageviews: [],
    site_stats: [ { people_all: 5, sessions_all: 9, countries_all: 2, people_30d: 3, sessions_30d: 4, countries_30d: 2 } ],
    country_stats: [ { country: 'GB', people: 3, sessions: 5 }, { country: 'US', people: 1, sessions: 1 } ]
  };
  let currentSession = null;
  let authCallback = null;
  window.__mock = {
    db,
    signInAs(user) { currentSession = { user }; authCallback && authCallback('SIGNED_IN', currentSession); }
  };

  function table(name) {
    const state = { filters: [] };
    const exec = () => {
      let rows = db[name] || [];
      for (const [col, val] of state.filters) rows = rows.filter(r => r[col] === val);
      return rows;
    };
    const chain = {
      select() { return chain; },
      eq(col, val) { state.filters.push([col, val]); return chain; },
      order() { return Promise.resolve({ data: exec(), error: null }); },
      maybeSingle() { return Promise.resolve({ data: exec()[0] || null, error: null }); },
      insert(rec) { if (name === 'resources') rec = { approved: true, created_at: '2026-07-28T12:00:00Z', ...rec };
        if (name === 'requests') rec = { resolved: false, created_at: new Date().toISOString(), ...rec };
        if (name === 'request_replies') rec = { created_at: new Date().toISOString(), ...rec };
        const row = { id: 'gen-' + Math.random().toString(36).slice(2), ...rec };
        db[name].push(row);
        if (name === 'votes') db.vote_counts.push({ resource_id: rec.resource_id, voter_fields: rec.voter_fields, voter_stage: rec.voter_stage, voter_ai: rec.voter_ai, voter_stats: rec.voter_stats, n: 1 });
        if (name === 'comment_votes') { const e = db.comment_vote_counts.find(x => String(x.comment_id) === String(rec.comment_id)); e ? e.n++ : db.comment_vote_counts.push({ comment_id: rec.comment_id, n: 1 }); }
        if (name === 'request_votes') { const e = db.request_vote_counts.find(x => String(x.request_id) === String(rec.request_id)); e ? e.n++ : db.request_vote_counts.push({ request_id: rec.request_id, n: 1 }); }
        return { select: () => ({ single: () => Promise.resolve({ data: row, error: null }) }),
                 then(res) { res({ data: null, error: null }); } }; },
      upsert(rec) { const i = db[name].findIndex(r => r.id === rec.id); i >= 0 ? db[name][i] = rec : db[name].push(rec);
        return Promise.resolve({ data: null, error: null }); },
      delete() { const d = { eq(col, val) { state.filters.push([col, val]); return d; },
        then(res) { const keep = db[name].filter(r => !state.filters.every(([c, v]) => r[c] === v));
          if (name === 'votes') { const gone = db[name].filter(r => state.filters.every(([c, v]) => r[c] === v));
            for (const g of gone) { const j = db.vote_counts.findIndex(x => x.resource_id === g.resource_id && x.voter_stage === g.voter_stage); if (j >= 0) db.vote_counts.splice(j, 1); } }
          if (name === 'comment_votes') { const gone2 = db[name].filter(r => state.filters.every(([c, v]) => String(r[c]) === String(v))); for (const g of gone2) { const e = db.comment_vote_counts.find(x => String(x.comment_id) === String(g.comment_id)); if (e) e.n--; } db[name] = db[name].filter(r => !state.filters.every(([c, v]) => String(r[c]) === String(v))); res({ data: null, error: null }); return; }
          if (name === 'request_votes') { const gone3 = db[name].filter(r => state.filters.every(([c, v]) => String(r[c]) === String(v))); for (const g of gone3) { const e = db.request_vote_counts.find(x => String(x.request_id) === String(g.request_id)); if (e) e.n--; } db[name] = db[name].filter(r => !state.filters.every(([c, v]) => String(r[c]) === String(v))); res({ data: null, error: null }); return; }
          db[name] = keep; res({ data: null, error: null }); } }; return d; },
      update(vals) {
        const u = { eq(col, val) { state.filters.push([col, val]); return u; },
          then(res) { db[name].filter(r => state.filters.every(([c, v]) => String(r[c]) === String(v))).forEach(r => Object.assign(r, vals)); res({ data: null, error: null }); } };
        return u;
      },
      then(res) { res({ data: exec(), error: null }); }  // awaited without order()
    };
    return chain;
  }
  const realFetch = window.fetch.bind(window);
  window.fetch = (url, opts) => {
    if (String(url).includes('world-atlas')) {
      const topo = {
        transform: { scale: [1, 1], translate: [0, 0] },
        arcs: [
          [[-5, 50], [7, 0], [0, 8], [-7, 0], [0, -8]],
          [[-100, 30], [20, 0], [0, 15], [-20, 0], [0, -15]]
        ],
        objects: { countries: { type: 'GeometryCollection', geometries: [
          { type: 'Polygon', id: 826, properties: { name: 'United Kingdom' }, arcs: [[0]] },
          { type: 'Polygon', id: 840, properties: { name: 'United States of America' }, arcs: [[1]] }
        ] } }
      };
      return Promise.resolve({ json: () => Promise.resolve(topo) });
    }
    return realFetch(url, opts);
  };
  window.supabase = {
    createClient() {
      return {
        from: table,
        storage: { from: () => ({
          upload: () => Promise.resolve({ data: {}, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: 'https://mock.storage/avatar.jpg' } })
        }) },
        auth: {
          getSession: () => Promise.resolve({ data: { session: currentSession } }),
          onAuthStateChange(cb) { authCallback = cb; return { data: { subscription: {} } }; },
          signInWithOAuth() { return Promise.resolve({ error: null }); },
          signOut() { currentSession = null; authCallback && authCallback('SIGNED_OUT', null); return Promise.resolve({ error: null }); }
        }
      };
    }
  };
});

await page.goto('file://' + require('path').join(__dirname, 'index-live-test.html'));
await page.waitForTimeout(900);

// 1. Signed out: resources visible, no demo banner, Sign in button present
console.log('Demo banner hidden:', await page.isHidden('#demoBanner'));
console.log('Sign-in button shown:', Boolean(await page.$('#signInBtn')));
console.log('Mock resources loaded:', (await page.textContent('body')).includes('Live Resource One'));
console.log('Shelves default view:', (await page.$$('.shelf')).length > 0);
await page.click('.view-tabs .tab[data-view="browse"]');
await page.waitForTimeout(300);

// 2. Voting while signed out opens the auth modal
await page.click('.card .vote button');
await page.waitForTimeout(300);
console.log('Auth modal opens on vote attempt:', await page.$eval('#authOverlay', el => el.classList.contains('open')));
await page.click('#cancelAuth');

// 3. Suggest while signed out also gated
await page.click('#suggestBtn');
await page.waitForTimeout(200);
console.log('Auth modal opens on suggest attempt:', await page.$eval('#authOverlay', el => el.classList.contains('open')));
await page.click('#cancelAuth');

// 4. Simulate OAuth completion → first sign-in should open the background modal
await page.evaluate(() => window.__mock.signInAs({
  id: 'user-1', email: 'ada@example.org',
  user_metadata: { full_name: 'Ada Lovelace', avatar_url: '' }
}));
await page.waitForTimeout(900);
console.log('User chip shows name:', (await page.textContent('#authArea')).includes('Ada Lovelace'));
console.log('Profile modal opens on first sign-in:', await page.$eval('#personaOverlay', el => el.classList.contains('open')));

// 5. Save background → profile upserted
await page.click('#fieldChips .chip:nth-child(2)');   // Life sciences
await page.click('#fieldChips .chip:nth-child(3)');   // + Medicine & health (multi-select)
await page.click('#stageChips .chip:nth-child(4)');   // Postdoc / researcher
await page.click('#aiChips .chip:nth-child(2)');      // AI: Beginner
await page.click('#statsChips .chip:nth-child(3)');   // Stats: Intermediate
await page.click('#langChips .chip:nth-child(1)');    // Languages: Python
await page.click('#langChips .chip:nth-child(2)');    // + R
await page.click('#savePersona');
await page.waitForTimeout(500);
const prof = await page.evaluate(() => window.__mock.db.profiles[0]);
console.log('Profile saved to DB:', JSON.stringify(prof));

// 6. Vote now works and is tied to the user id
await page.click('.card .vote button');
await page.waitForTimeout(500);
const vote = await page.evaluate(() => window.__mock.db.votes[0]);
console.log('Vote recorded with user id + background:', JSON.stringify(vote));

// 7. "For you" weighting: Life sciences resource (r1) should now rank first
const first = await page.textContent('.card h3');
console.log('First card after Life-sciences vote:', first.trim());

// 8. Suggest now works, attributed to the user
await page.click('#suggestBtn');
await page.fill('#sTitle', 'Suggested While Signed In');
await page.fill('#sDesc', 'Testing attributed suggestions.');
await page.click('#sLangChips .chip:nth-child(3)');   // Julia
await page.click('#submitSuggest');
await page.waitForTimeout(500);
const sugg = await page.evaluate(() => window.__mock.db.resources.find(r => r.title === 'Suggested While Signed In'));
console.log('Suggestion attributed:', sugg && sugg.suggester_id === 'user-1', '| suggested_by:', sugg && sugg.suggested_by);
console.log('Suggestion languages:', JSON.stringify(sugg && sugg.languages));
// language filter
await page.selectOption('#filterLang', 'Julia');
await page.waitForTimeout(300);
console.log('Julia filter shows only tagged:', (await page.$$('.card')).length);
await page.selectOption('#filterLang', 'none');
await page.waitForTimeout(300);
console.log('No-code filter count:', (await page.$$('.card')).length);
await page.selectOption('#filterLang', '');
await page.waitForTimeout(300);

// 8a2. Propose a NEW topic with a suggestion (normalised: trim, collapse spaces, capitalise)
await page.click('#suggestBtn');
await page.fill('#sTitle', 'New Topic Resource');
await page.fill('#sDesc', 'Tests community topics.');
await page.selectOption('#sCat', '__new__');
console.log('New-topic input revealed:', await page.$eval('#sCatNewWrap', el => !el.hidden));
await page.fill('#sCatNew', '  causal   inference ');
await page.click('#submitSuggest');
await page.waitForTimeout(500);
const nt = await page.evaluate(() => window.__mock.db.resources.find(r => r.title === 'New Topic Resource'));
console.log('New topic normalised:', nt && nt.category);
console.log('New topic in sidebar:', (await page.textContent('#sbTopics')).includes('Causal inference'));

// 8a3. Case-insensitive dedupe against an existing topic
await page.click('#suggestBtn');
await page.fill('#sTitle', 'Dedupe Topic Resource');
await page.fill('#sDesc', 'Should map to the existing topic.');
await page.selectOption('#sCat', '__new__');
await page.fill('#sCatNew', 'machine learning');
await page.click('#submitSuggest');
await page.waitForTimeout(500);
const dt = await page.evaluate(() => window.__mock.db.resources.find(r => r.title === 'Dedupe Topic Resource'));
console.log('Existing topic deduped to:', dt && dt.category);

// 8p. My path: star a resource from a Browse card (auto-creates a default path)
await page.click('.card [data-tps]');
await page.waitForTimeout(500);
const pth = await page.evaluate(() => window.__mock.db.paths[0]);
const pit = await page.evaluate(() => window.__mock.db.path_items[0]);
console.log('Default path auto-created:', JSON.stringify(pth && { name: pth.name, user_id: pth.user_id }));
console.log('Path item saved:', JSON.stringify(pit && { resource_id: pit.resource_id }));
await page.click('.view-tabs .tab[data-view="mypath"]');
await page.waitForTimeout(400);
console.log('Path switcher tabs:', (await page.$$('.ptab')).length, '(1 path + new)');
console.log('My path items:', (await page.$$('.mp-item')).length);
await page.click('.mp-item [data-tpd]');
await page.waitForTimeout(400);
console.log('Done tick persisted:', await page.evaluate(() => (window.__mock.db.my_path.find(x => x.done) || {}).done === true));
console.log('Progress line:', (await page.textContent('.pw-pct')).trim());
// 8p2. Second named path via "+ New path", then the add-to-path picker
page.once('dialog', d => d.accept('Generative AI'));
await page.click('#mpNew');
await page.waitForTimeout(500);
console.log('Second path created:', await page.evaluate(() => window.__mock.db.paths.length) === 2);
console.log('New path is active tab:', (await page.textContent('.ptab.active')).includes('Generative AI'));
await page.click('.view-tabs .tab[data-view="browse"]');
await page.waitForTimeout(300);
const stars = await page.$$('.card [data-tps]');
await stars[1].click();   // un-starred card → picker should open (2 paths)
await page.waitForTimeout(300);
console.log('Add-to-path picker opens:', Boolean(await page.$('.path-picker')));
console.log('Picker lists both paths + new:', (await page.$$('.path-picker .pk')).length === 3);
await page.click('.path-picker .pk[data-pk]');   // add to first path
await page.waitForTimeout(500);
console.log('Picker add stored:', await page.evaluate(() => window.__mock.db.path_items.length) === 2);
console.log('Picker closed after choice:', !(await page.$('.path-picker')));
// 8p3. Delete the empty second path — done-ticks survive
await page.click('.view-tabs .tab[data-view="mypath"]');
await page.waitForTimeout(400);
await page.click('.ptab[data-ptab]');   // switch to first path tab
await page.waitForTimeout(300);
console.log('First path shows both items:', (await page.$$('.mp-item')).length === 2);
const tabs2 = await page.$$('.ptab[data-ptab]');
await tabs2[1].click();   // switch to the (empty) second path
await page.waitForTimeout(300);
page.once('dialog', d => d.accept());
await page.click('#mpDel');
await page.waitForTimeout(500);
console.log('Path deleted, one remains:', await page.evaluate(() => window.__mock.db.paths.length) === 1);
console.log('Done-tick survived delete:', await page.evaluate(() => window.__mock.db.my_path.some(x => x.done)));
await page.click('.view-tabs .tab[data-view="path"]');
await page.waitForTimeout(400);
console.log('Topic pathways render:', (await page.$$('.tp-topic')).length, 'topic(s)');
console.log('Beginner stage highlighted:', await page.$eval('.tp-stage', el => el.classList.contains('you')));
await page.click('.view-tabs .tab[data-view="browse"]');
await page.waitForTimeout(300);

// 8r. Requests mini-forum
await page.click('.view-tabs .tab[data-view="req"]');
await page.waitForTimeout(400);
await page.click('#rqAskBtn');
await page.fill('#rqTitle', 'Generative AI materials?');
await page.fill('#rqBody', 'Diffusion models ideally, with code.');
await page.click('#rqPost');
await page.waitForTimeout(500);
const rq = await page.evaluate(() => window.__mock.db.requests[0]);
console.log('Request posted:', JSON.stringify(rq && { title: rq.title, author_id: rq.author_id, resolved: rq.resolved }));
await page.click('.rq .rq-want button');
await page.waitForTimeout(400);
console.log('Want-vote recorded:', await page.evaluate(() => window.__mock.db.request_votes.length) === 1);
// expand + reply with attached existing resource
await page.click('.rq h3');
await page.waitForTimeout(300);
await page.fill('[id^=rqReply-]', 'Try this one.');
await page.fill('[id^=rqAttach-]', 'Live Resource One');
await page.click('[data-rqsend]');
await page.waitForTimeout(500);
const rep1 = await page.evaluate(() => window.__mock.db.request_replies[0]);
console.log('Reply with attachment:', JSON.stringify(rep1 && { resource_id: rep1.resource_id, body: rep1.body }));
// contribute a brand-new resource in answer
await page.click('.rq h3'); await page.waitForTimeout(200); await page.click('.rq h3'); await page.waitForTimeout(200);
await page.click('[data-rqnew]');
await page.waitForTimeout(300);
await page.fill('#sTitle', 'Diffusion Models Primer');
await page.fill('#sDesc', 'Contributed in answer to a request.');
await page.click('#submitSuggest');
await page.waitForTimeout(600);
const linked = await page.evaluate(() => {
  const rr = window.__mock.db.request_replies.find(x => !x.body);
  const res = window.__mock.db.resources.find(r => r.title === 'Diffusion Models Primer');
  return rr && res && String(rr.resource_id) === String(res.id);
});
console.log('New resource auto-linked to request:', linked);
console.log('Provenance map set:', await page.evaluate(() => Object.keys(resToRequest).length) >= 1);
// mark resolved
await page.click('[data-rqres]');
await page.waitForTimeout(400);
console.log('Resolved persisted:', await page.evaluate(() => window.__mock.db.requests[0].resolved));
await page.click('.view-tabs .tab[data-view="browse"]');
await page.waitForTimeout(300);

// 8b. Comments: expand, post, verify, delete
await page.click('.card [data-cmt]');
await page.waitForTimeout(300);
console.log('Comment section opens:', Boolean(await page.$('.cmts')));
await page.fill(".cmts textarea", 'Really useful for protein folding work.');
await page.click('.cmts [data-postcmt]');
await page.waitForTimeout(500);
const cmt = await page.evaluate(() => window.__mock.db.comments[0]);
console.log('Comment stored with author:', JSON.stringify(cmt));
console.log('Comment visible in UI:', (await page.textContent('body')).includes('Really useful for protein folding'));
// 8c. Upvote the comment
await page.click('.cmt .cmt-up');
await page.waitForTimeout(500);
const cv = await page.evaluate(() => window.__mock.db.comment_votes[0]);
console.log('Comment upvote stored:', JSON.stringify(cv));
console.log('Upvote count shown:', (await page.textContent('.cmt .cmt-up')).trim());
await page.click('.cmt .cmt-up');  // toggle off
await page.waitForTimeout(500);
console.log('Upvote removed on second click:', await page.evaluate(() => window.__mock.db.comment_votes.length) === 0);

page.on('dialog', d => d.accept());
page.on('dialog', d => { lastDialog = d.message(); });
await page.click('.cmt .del');
await page.waitForTimeout(500);
console.log('Comment deleted from DB:', await page.evaluate(() => window.__mock.db.comments.length) === 0);

// 8s. Public profile: opt in, save, clickable name, card
await page.click('#authArea #pubProfileBtn');
await page.waitForTimeout(400);
await page.check('#pubOn');
await page.fill('#pubName', 'Ada Lovelace');
await page.fill('#pubInst', 'Analytical Engines Ltd');
await page.fill('#pubBlurb', 'First programmer; enjoys well-documented resources.');
await page.check('#pubShowFields');
await page.click('#pubSave');
await page.waitForTimeout(500);
const pubProf = await page.evaluate(() => window.__mock.db.profiles[0]);
console.log('Public profile saved:', JSON.stringify({ pub: pubProf.public_profile, name: pubProf.pub_name, inst: pubProf.institution, show: pubProf.show_fields }));
// the "by Ada Lovelace" tag on her suggestion should now be clickable
const linkable = await page.$('.card .tag.who-link[data-uid="user-1"]');
console.log('Suggester name clickable:', Boolean(linkable));
await linkable.click();
await page.waitForTimeout(400);
const cardTxt = await page.textContent('#profileCard');
console.log('Card shows details:', cardTxt.includes('Ada Lovelace') && cardTxt.includes('Analytical Engines'));
console.log('Card shows fields:', cardTxt.includes('Life sciences'));
console.log('Card stat tiles:', (await page.$$('#profileCard .pf-stat')).length);
await page.click('#pfClose');
await page.waitForTimeout(300);

// 8d. Trending tab + detail view + activity
await page.selectOption('#browseMain select.ctl', 'trending');
await page.waitForTimeout(300);
const trendFirst = await page.textContent('.card h3');
console.log('Trending puts r2 first:', trendFirst.includes('Live Resource Two'));
await page.click('.card .desc');   // click card body -> detail modal
await page.waitForTimeout(400);
console.log('Detail modal opens:', await page.$eval('#detailOverlay', el => el.classList.contains('open')));
console.log('Deep link hash set:', await page.evaluate(() => location.hash));
await page.click('#closeDetailBtn');
await page.waitForTimeout(300);
await page.click('#activityBtn');
await page.waitForTimeout(400);
const actText = await page.textContent('#activityBody');
console.log('Activity shows upvote:', actText.includes('Live Resource Two'));
console.log('Activity shows suggestion:', actText.includes('Suggested While Signed In'));
await page.click('#closeActivity');
console.log('Time chart rendered:', await page.$eval('#timeChart', el => !el.hidden) && Boolean(await page.$('#timeChart svg path')));
console.log('Time chart total:', (await page.textContent('#timeChart .tc-foot')).trim());
console.log('Usage line rendered:', (await page.textContent('#usageLine')).includes('Since launch'));
// 8e. Visitor map
await page.click('#usageLine [data-map]');
await page.waitForTimeout(600);
console.log('Map modal opens:', await page.$eval('#mapOverlay', el => el.classList.contains('open')));
console.log('Map has country paths:', (await page.$$('#mapBox path')).length);
await page.hover('#mapBox path[data-a2="GB"]');
await page.waitForTimeout(300);
console.log('Tooltip on hover:', (await page.textContent('#mapTip')).trim());
await page.click('#closeMap');
await page.waitForTimeout(300);

console.log('Pageview logged:', await page.evaluate(() => window.__mock.db.pageviews.length) >= 1);

// 8f. Constellation graph
await page.click('.view-tabs .tab[data-view="graph"]');
await page.waitForTimeout(500);
console.log('Graph view shown:', await page.$eval('#graphView', el => el.style.display !== 'none'));
console.log('Graph hub + resource nodes:', (await page.$$('#graphBox circle')).length);
await page.click('#graphBox .gnode-res');
await page.waitForTimeout(400);
console.log('Graph node click opens detail:', await page.$eval('#detailOverlay', el => el.classList.contains('open')));
await page.click('#closeDetailBtn');
await page.waitForTimeout(200);
await page.click('.view-tabs .tab[data-view="browse"]');
await page.waitForTimeout(200);
// density toggle
await page.click('#densToggle');
console.log('Compact mode toggles:', await page.$eval('#resourceGrid', el => el.classList.contains('compact')));
await page.click('#densToggle');

// 8t. Duplicate detection
lastDialog = '';
await page.click('#suggestBtn');
await page.fill('#sTitle', 'Suggested While Signed In');
await page.fill('#sDesc', 'Testing duplicate detection.');
await page.click('#submitSuggest');
await page.waitForTimeout(600);
console.log('Duplicate confirm shown:', lastDialog.includes('already'));

// 8u. Micro-feedback on completion
await page.click('.view-tabs .tab[data-view="mypath"]');
await page.waitForTimeout(300);
await page.click('.mp-item [data-tpd]'); await page.waitForTimeout(400);
await page.click('.mp-item [data-tpd]'); await page.waitForTimeout(400);
console.log('Feedback prompt shown:', await page.isVisible('#diffPrompt'));
await page.click('#diffPrompt [data-diff="right level"]');
await page.waitForTimeout(500);
console.log('Difficulty saved:', await page.evaluate(() => window.__mock.db.my_path[0].difficulty));

// 8v. Report from the detail view
await page.click('.view-tabs .tab[data-view="browse"]'); await page.waitForTimeout(300);
await page.click('.card .desc'); await page.waitForTimeout(400);
await page.click('#detailModal [data-flag]');
await page.waitForTimeout(500);
const flag = await page.evaluate(() => window.__mock.db.flags[0]);
console.log('Report stored:', JSON.stringify(flag && { type: flag.target_type, reporter: flag.reporter_id }));
await page.click('#closeDetailBtn'); await page.waitForTimeout(200);

// 8w. Reply-notification badge
await page.evaluate(async () => {
  const qid = window.__mock.db.requests[0].id;
  window.__mock.db.request_replies.push({ id: 'gen-other', request_id: qid, author_id: 'user-2', author_name: 'Someone Else', body: 'New info!', created_at: new Date(Date.now() + 1000).toISOString() });
  localStorage.setItem('aisci_req_seen', String(Date.now() - 60000));
  await loadData(); render();
});
await page.waitForTimeout(400);
console.log('Reply badge shows count:', /Requests\s*\d/.test((await page.textContent('.view-tabs .tab[data-view="req"]')).trim()));

// 8x. Digest (admin-only tool)
console.log('Digest button visible to admin:', await page.isVisible('#digestBtn'));
await page.click('#digestBtn');
await page.waitForTimeout(400);
const dg = await page.inputValue('#digestText');
console.log('Digest content built:', dg.includes('AI in Science Atlas') && dg.includes('Trending'));
await page.click('#digestClose');
await page.waitForTimeout(200);

// 9. Sign out
await page.click('#signOutBtn');
await page.waitForTimeout(600);
console.log('Sign-in button back after sign-out:', Boolean(await page.$('#signInBtn')));

await page.screenshot({ path: 'shot-4-live.png' });
console.log('Console errors:', errors.length ? errors : 'none');
await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
