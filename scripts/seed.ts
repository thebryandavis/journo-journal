import { Pool } from 'pg';
import { hashSync } from 'bcryptjs';

const pool = new Pool({
  connectionString: 'postgresql://localhost:5432/journo_journal',
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clean existing data
    await client.query('DELETE FROM tags');
    await client.query('DELETE FROM tasks');
    await client.query('DELETE FROM note_sources');
    await client.query('DELETE FROM sources');
    await client.query('DELETE FROM notes');
    await client.query('DELETE FROM folders');
    await client.query('UPDATE users SET workspace_id = NULL');
    await client.query('DELETE FROM workspaces');
    await client.query('DELETE FROM users');

    // Create user
    const passwordHash = hashSync('password123', 12);
    const userRes = await client.query(
      `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id`,
      ['journalist@demo.com', 'Alex Rivera', passwordHash]
    );
    const userId = userRes.rows[0].id;

    // Create workspace
    const wsRes = await client.query(
      `INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING id`,
      ["Alex's Newsroom", userId]
    );
    const workspaceId = wsRes.rows[0].id;

    // Link user to workspace
    await client.query('UPDATE users SET workspace_id = $1 WHERE id = $2', [workspaceId, userId]);

    // Create folders
    const folderData = [
      { name: 'Investigations', color: '#FF6B35' },
      { name: 'Daily Beat', color: '#FFB800' },
      { name: 'Feature Stories', color: '#3498DB' },
      { name: 'Research', color: '#9B59B6' },
    ];
    const folderIds: Record<string, string> = {};
    for (const f of folderData) {
      const res = await client.query(
        `INSERT INTO folders (user_id, workspace_id, name, color) VALUES ($1, $2, $3, $4) RETURNING id`,
        [userId, workspaceId, f.name, f.color]
      );
      folderIds[f.name] = res.rows[0].id;
    }

    // Create notes
    const notesData = [
      {
        title: 'City Council Approves $50M Infrastructure Bond',
        content: 'The city council voted 7-2 last night to approve a $50 million bond measure for infrastructure improvements. Council member Patricia Hayes led the push, citing deteriorating bridges and water main breaks that have plagued the south side for years. Opposition came from fiscal conservatives who argued the city should prioritize existing revenue streams.\n\nKey details:\n- Bond covers bridge repairs, water main replacement, and road resurfacing\n- Estimated 15-year payback period\n- Property tax increase of approximately $180/year for median-value home\n- Construction to begin Q3 next year\n\nI need to follow up with the city engineer for timeline specifics and get reaction from the south side neighborhood association.',
        type: 'note',
        status: 'in-progress',
        folder: 'Daily Beat',
        is_favorite: true,
        tags: ['city council', 'infrastructure', 'bonds', 'local government'],
      },
      {
        title: 'Water Contamination Pattern — Connecting the Dots',
        content: 'Three neighborhoods have reported unusual water discoloration in the past 6 months. The health department says tests are within acceptable limits, but residents say otherwise. I pulled FOIA records showing the water treatment plant had 14 equipment violations in the past two years — none publicly reported.\n\nTimeline of events:\n- March: Oak Park residents first report brown water\n- May: Similar reports from Riverside district\n- August: Westfield Gardens — same pattern\n- All three neighborhoods are downstream from the Kensington treatment facility\n\nThe pattern is too consistent to be coincidental. Need to interview former plant employees and cross-reference with EPA inspection schedules.',
        type: 'research',
        status: 'in-progress',
        folder: 'Investigations',
        is_favorite: true,
        tags: ['water quality', 'investigation', 'FOIA', 'public health', 'environmental'],
      },
      {
        title: 'Interview Notes: Dr. Sarah Chen, Environmental Scientist',
        content: 'Spoke with Dr. Chen for 45 minutes about the water contamination story. She reviewed my FOIA documents and confirmed that the violation pattern is consistent with aging chloramine injection equipment.\n\nKey quotes:\n- "These readings suggest intermittent failures in the disinfection process"\n- "The geographic clustering downstream from one facility is a textbook indicator"\n- "Residents should be testing independently — the city has a conflict of interest"\n\nShe offered to review any additional lab results I can obtain. Very credible source — 20 years at EPA before joining the university. She emphasized this is not uncommon in cities that deferred maintenance during the 2020-2022 period.',
        type: 'interview',
        status: 'draft',
        folder: 'Investigations',
        is_favorite: false,
        tags: ['interview', 'water quality', 'expert source', 'environmental science'],
      },
      {
        title: 'Idea: The Gig Economy is Reshaping Local Restaurants',
        content: 'Noticed that at least 5 restaurants on Main Street have completely restructured their operations around delivery apps. Some have reduced dine-in seating by 40% to make room for pickup shelves. The economic implications for downtown foot traffic could be significant.\n\nAngles to explore:\n- How much commission do delivery apps take? (reported 15-30%)\n- Impact on restaurant employment (fewer servers, more kitchen staff)\n- Downtown business association perspective on reduced foot traffic\n- Consumer behavior shift — do people order differently via app?\n- Could tie into broader "death of downtown" narrative',
        type: 'idea',
        status: 'draft',
        folder: 'Feature Stories',
        is_favorite: false,
        tags: ['gig economy', 'restaurants', 'downtown', 'business', 'story idea'],
      },
      {
        title: 'School Board Meeting — Teacher Shortage Crisis',
        content: 'The school district announced it still has 47 unfilled teaching positions with two weeks until school starts. Superintendent Maria Lopez called it "the worst staffing crisis in district history."\n\nBy the numbers:\n- 47 vacant positions (up from 12 last year)\n- 23 positions are in Title I schools\n- Average starting salary: $38,500 (state average: $42,100)\n- 15 resignations over summer — most cited salary and working conditions\n\nThe board approved emergency measures including signing bonuses and allowing long-term substitutes. Several parents spoke during public comment expressing frustration. The teachers union rep suggested the district "created this crisis through years of underinvestment."',
        type: 'note',
        status: 'published',
        folder: 'Daily Beat',
        is_favorite: false,
        tags: ['education', 'school board', 'teacher shortage', 'labor'],
      },
      {
        title: 'Research: Housing Affordability Data Analysis',
        content: 'Compiled housing data for the metro area affordability series.\n\nMedian home price trends:\n- 2020: $285,000\n- 2021: $320,000 (+12.3%)\n- 2022: $375,000 (+17.2%)\n- 2023: $390,000 (+4.0%)\n- 2024: $410,000 (+5.1%)\n\nRental market:\n- Average 1BR rent: $1,450/month (up 28% since 2020)\n- Vacancy rate: 3.2% (historically low)\n- 62% of renters are cost-burdened (>30% of income on housing)\n\nKey finding: The wage-to-housing ratio has deteriorated from 4.2x to 5.8x in four years. This puts the metro area in the "severely unaffordable" category by the Demographia standard. The city\'s affordable housing trust fund has disbursed only 40% of available funds due to bureaucratic bottlenecks.',
        type: 'research',
        status: 'in-progress',
        folder: 'Research',
        is_favorite: true,
        tags: ['housing', 'affordability', 'data analysis', 'real estate', 'economics'],
      },
      {
        title: 'Local Tech Startup Raises $12M Series A',
        content: 'MedBridge Health, a health-tech startup based downtown, announced a $12M Series A round led by Sequoia Scout. The company builds AI-powered patient intake systems for community health centers.\n\nFounder Jameel Washington, a former ER nurse, started the company after seeing how much time clinicians spent on paperwork. The platform reportedly reduces intake time by 60%.\n\nThey plan to hire 40 engineers locally and expand to 200 health centers by end of next year. This is the largest VC raise for a local startup since 2021.\n\nGood human interest angle — Washington grew up in the same neighborhood as several of the health centers now using the product.',
        type: 'note',
        status: 'published',
        folder: 'Daily Beat',
        is_favorite: false,
        tags: ['tech', 'startup', 'healthcare', 'venture capital', 'local business'],
      },
      {
        title: 'Idea: Forgotten Neighborhoods — A Photo Essay Series',
        content: 'Three neighborhoods in the eastern part of the city have been largely ignored by both media and city services for over a decade. Infrastructure is crumbling, but residents have built remarkable community institutions — mutual aid networks, community gardens, an informal lending library.\n\nConcept: A 5-part photo essay series documenting both the neglect and the resilience.\n\nPart 1: The landscape — infrastructure decay\nPart 2: The people — community leaders\nPart 3: The institutions — what residents built themselves\nPart 4: The policy — why city services stopped\nPart 5: The future — what residents want\n\nNeed to partner with a photographer. Reach out to Maria at the community center first — she can introduce me to residents.',
        type: 'idea',
        status: 'draft',
        folder: 'Feature Stories',
        is_favorite: true,
        tags: ['photo essay', 'community', 'urban development', 'series idea', 'social justice'],
      },
      {
        title: 'Interview Notes: Chief of Police on Crime Statistics',
        content: 'Sat down with Chief Williams for the quarterly crime stats briefing. Overall crime is down 8% year-over-year but the picture is more nuanced.\n\nKey takeaways:\n- Violent crime down 12% — driven by homicide reduction\n- Property crime down 5%\n- Car thefts up 23% — organized rings targeting catalytic converters\n- Domestic violence calls up 15% — chief attributes to better reporting, not increase\n- Response times improved by 90 seconds on average after redistricting\n\nOff the record, the chief expressed concern about upcoming budget cuts affecting community policing programs. He believes the crime reduction is directly tied to those programs.\n\nNeed to verify these numbers independently with state crime database.',
        type: 'interview',
        status: 'in-progress',
        folder: 'Daily Beat',
        is_favorite: false,
        tags: ['crime', 'police', 'statistics', 'public safety', 'interview'],
      },
      {
        title: 'Climate Adaptation: How Local Farmers Are Responding',
        content: 'Visited three farms in the county for the climate adaptation piece. Each is taking a dramatically different approach to changing weather patterns.\n\nHenderson Farm (conventional, 800 acres):\n- Shifted planting dates by 2 weeks earlier\n- Investing in irrigation from groundwater\n- Considering switching from corn to sorghum\n\nGreen Valley (organic, 120 acres):\n- Cover cropping and no-till for soil moisture retention\n- Diversified from 4 crops to 12\n- Installed rainwater harvesting — $45K investment\n\nSunrise Cooperative (community-supported, 40 acres):\n- Heat-resistant crop varieties from university extension\n- Shade structures over sensitive crops\n- Partnering with climate scientists for real-time data\n\nThe contrast in approaches maps directly to scale and resources. Strong feature potential here.',
        type: 'research',
        status: 'draft',
        folder: 'Feature Stories',
        is_favorite: false,
        tags: ['climate', 'agriculture', 'adaptation', 'farming', 'environment'],
      },
      {
        title: 'Public Records Request Log',
        content: 'Tracking all active FOIA/public records requests:\n\n1. Water treatment plant inspection reports (2022-2024) — FILED March 15, received partial response May 2. Appealing redactions.\n2. City council member expense reports Q1-Q2 — FILED April 1, received June 15. Reviewing.\n3. Police body camera footage, Elm Street incident — FILED April 20, DENIED citing ongoing investigation. Consulting with media lawyer.\n4. School district vendor contracts >$50K — FILED May 5, PENDING. Follow up sent July 1.\n5. Building permits for Riverside development — FILED June 10, PENDING.\n6. Emergency services response time data — FILED June 22, received July 30. Data is messy, needs cleaning.\n\nNeed to set calendar reminders for follow-ups on #4 and #5.',
        type: 'note',
        status: 'in-progress',
        folder: 'Research',
        is_favorite: false,
        tags: ['FOIA', 'public records', 'tracking', 'transparency'],
      },
      {
        title: 'Idea: What Happens to Campaign Promises?',
        content: 'With the election coming up, idea for an accountability piece tracking promises made during the last election cycle.\n\nMethodology:\n- Pull campaign websites from Internet Archive\n- Catalog every specific, measurable promise\n- Rate each: Kept / Partially Kept / Broken / In Progress / Not Attempted\n- Interview each officeholder about the ones they broke\n\nCould be a great interactive web feature with a scorecard format. Similar to PolitiFact\'s "Obameter" but hyperlocal.\n\nStart with the mayor and the 4 council members up for re-election. Would need at least 3 weeks for the research phase.',
        type: 'idea',
        status: 'draft',
        folder: 'Investigations',
        is_favorite: true,
        tags: ['elections', 'accountability', 'politics', 'campaign promises', 'interactive'],
      },
      {
        title: 'Community Health Center Funding Cut — Breaking',
        content: 'BREAKING: The state legislature voted to reduce community health center funding by 18% in the new budget. This directly affects 12 centers in our metro area serving 45,000 patients.\n\nImmediate impacts:\n- Westside Community Health will lose 3 full-time providers\n- Two mobile health units will be suspended\n- Dental services at 4 locations discontinued\n- Wait times expected to increase from 5 days to 3+ weeks\n\nThe cuts disproportionately affect communities of color — 78% of patients at affected centers are Black or Latino. The state health director defended the cuts as "necessary belt-tightening" but advocates say it will push patients to already-overwhelmed ERs.\n\nRunning this in tomorrow\'s edition. Need comment from the governor\'s office by 5pm.',
        type: 'note',
        status: 'in-progress',
        folder: 'Daily Beat',
        is_favorite: false,
        tags: ['healthcare', 'budget cuts', 'breaking news', 'community health', 'state legislature'],
      },
    ];

    const noteIds: string[] = [];
    for (const n of notesData) {
      const wordCount = n.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
      const res = await client.query(
        `INSERT INTO notes (user_id, workspace_id, title, content, content_html, type, status, folder_id, is_favorite, word_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [userId, workspaceId, n.title, n.content, `<p>${n.content.replace(/\n/g, '</p><p>')}</p>`, n.type, n.status, folderIds[n.folder], n.is_favorite, wordCount]
      );
      const noteId = res.rows[0].id;
      noteIds.push(noteId);

      // Insert tags
      for (const tag of n.tags) {
        const autoGenerated = Math.random() > 0.5;
        await client.query(
          `INSERT INTO tags (note_id, tag_name, auto_generated, confidence_score) VALUES ($1, $2, $3, $4)`,
          [noteId, tag, autoGenerated, autoGenerated ? +(0.7 + Math.random() * 0.3).toFixed(2) : null]
        );
      }
    }

    // Create sources
    const sourcesData = [
      { name: 'Patricia Hayes', title: 'City Council Member, District 4', organization: 'City Council', email: 'p.hayes@citygov.example.com', phone: '555-0142', notes: 'Key contact on infrastructure and budget issues. Usually responsive within 24 hours. Prefers email for initial outreach.' },
      { name: 'Dr. Sarah Chen', title: 'Associate Professor, Environmental Science', organization: 'State University', email: 's.chen@stateuniv.example.edu', phone: '555-0287', notes: 'Expert on water quality and environmental contamination. Reviewed FOIA docs for the water story. Very credible — 20 years at EPA.' },
      { name: 'Chief Robert Williams', title: 'Chief of Police', organization: 'Metro Police Department', email: 'chief.williams@metropd.example.gov', phone: '555-0331', notes: 'Quarterly briefings on crime stats. Professional but guarded. Better for on-the-record than background.' },
      { name: 'Maria Gonzalez', title: 'Director', organization: 'Eastside Community Center', email: 'maria@eastsidecc.example.org', phone: '555-0198', notes: 'Deeply connected in eastern neighborhoods. Key contact for the photo essay series. Can introduce to residents and community leaders.' },
      { name: 'Jameel Washington', title: 'Founder & CEO', organization: 'MedBridge Health', email: 'jameel@medbridgehealth.example.com', phone: '555-0456', notes: 'Former ER nurse turned tech founder. Great personal story. Open to follow-up interviews about the company\'s growth.' },
    ];

    const sourceIds: string[] = [];
    for (const s of sourcesData) {
      const res = await client.query(
        `INSERT INTO sources (user_id, workspace_id, name, title, organization, email, phone, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [userId, workspaceId, s.name, s.title, s.organization, s.email, s.phone, s.notes]
      );
      sourceIds.push(res.rows[0].id);
    }

    // Link some sources to notes
    await client.query(`INSERT INTO note_sources (note_id, source_id) VALUES ($1, $2)`, [noteIds[0], sourceIds[0]]);  // Infrastructure + Hayes
    await client.query(`INSERT INTO note_sources (note_id, source_id) VALUES ($1, $2)`, [noteIds[2], sourceIds[1]]);  // Interview + Dr. Chen
    await client.query(`INSERT INTO note_sources (note_id, source_id) VALUES ($1, $2)`, [noteIds[8], sourceIds[2]]);  // Police interview + Chief
    await client.query(`INSERT INTO note_sources (note_id, source_id) VALUES ($1, $2)`, [noteIds[6], sourceIds[4]]);  // Tech startup + Jameel

    // Create tasks
    const tasksData = [
      { title: 'Follow up on water treatment FOIA appeal', description: 'Appeal the redactions on the water treatment plant inspection reports. Consult with media lawyer about next steps.', due_date: '2025-02-15', priority: 'high', note_index: 1 },
      { title: 'Interview residents for photo essay', description: 'Contact Maria Gonzalez at Eastside Community Center to arrange introductions with neighborhood residents for the forgotten neighborhoods series.', due_date: '2025-02-10', priority: 'medium', note_index: 7 },
      { title: 'Verify crime statistics with state database', description: 'Cross-reference Chief Williams quarterly numbers with state crime reporting database. Check for discrepancies.', due_date: '2025-02-05', priority: 'high', note_index: 8 },
      { title: 'Get governor comment on health center cuts', description: 'Need official comment from governor\'s office on the 18% community health center funding reduction by 5pm deadline.', due_date: '2025-01-25', priority: 'high', note_index: 12 },
      { title: 'Compile delivery app commission data', description: 'Research commission rates for DoorDash, UberEats, Grubhub for the restaurant gig economy story.', due_date: '2025-02-20', priority: 'low', note_index: 3 },
      { title: 'Build campaign promise tracking spreadsheet', description: 'Pull archived campaign websites and catalog all specific, measurable promises for accountability story.', due_date: '2025-03-01', priority: 'medium', note_index: 11 },
    ];

    for (const t of tasksData) {
      await client.query(
        `INSERT INTO tasks (user_id, note_id, title, description, due_date, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, noteIds[t.note_index], t.title, t.description, t.due_date, t.priority, t.priority === 'high' ? 'in-progress' : 'pending']
      );
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully!');
    console.log(`  User: journalist@demo.com / password123`);
    console.log(`  Notes: ${notesData.length}`);
    console.log(`  Folders: ${folderData.length}`);
    console.log(`  Sources: ${sourcesData.length}`);
    console.log(`  Tasks: ${tasksData.length}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
