import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { openai } from '@/lib/ai/openai';
import { tavily } from '@/lib/ai/tavily';
import { firecrawl } from '@/lib/ai/firecrawl';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const noteId = request.nextUrl.searchParams.get('noteId');

    if (!noteId) {
      // Return all fact-checks for the user (history view)
      const result = await query(
        `SELECT fc.*, n.title as note_title
         FROM fact_checks fc
         JOIN notes n ON fc.note_id = n.id
         WHERE fc.user_id = $1
         ORDER BY fc.created_at DESC
         LIMIT 50`,
        [userId]
      );

      return NextResponse.json({
        success: true,
        factChecks: result.rows,
      });
    }

    // Fetch most recent fact-check for a specific note with claims
    const fcResult = await query(
      `SELECT fc.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', fcc.id,
              'claim_text', fcc.claim_text,
              'claim_context', fcc.claim_context,
              'verdict', fcc.verdict,
              'confidence', fcc.confidence,
              'explanation', fcc.explanation,
              'sources', fcc.sources,
              'search_queries', fcc.search_queries
            ) ORDER BY fcc.created_at
          ) FILTER (WHERE fcc.id IS NOT NULL),
          '[]'
        ) as claims
      FROM fact_checks fc
      LEFT JOIN fact_check_claims fcc ON fc.id = fcc.fact_check_id
      WHERE fc.note_id = $1 AND fc.user_id = $2
      GROUP BY fc.id
      ORDER BY fc.created_at DESC
      LIMIT 1`,
      [noteId, userId]
    );

    if (fcResult.rows.length === 0) {
      return NextResponse.json({ success: true, factCheck: null });
    }

    return NextResponse.json({
      success: true,
      factCheck: fcResult.rows[0],
    });
  } catch (error) {
    console.error('Error fetching fact-check:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fact-check results' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { noteId } = body;

    if (!noteId) {
      return NextResponse.json(
        { error: 'noteId is required' },
        { status: 400 }
      );
    }

    // Fetch the note
    const noteResult = await query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
      [noteId, userId]
    );

    if (noteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const note = noteResult.rows[0];
    const content = (note.content || '').replace(/<[^>]*>/g, '');

    if (!content.trim()) {
      return NextResponse.json(
        { error: 'Note has no content to fact-check' },
        { status: 400 }
      );
    }

    // Create fact_check record
    const fcResult = await query(
      `INSERT INTO fact_checks (note_id, user_id, status)
       VALUES ($1, $2, 'processing')
       RETURNING *`,
      [noteId, userId]
    );

    const factCheck = fcResult.rows[0];

    try {
      // Step 1: Extract claims
      const claims = await openai.extractClaims(content);

      if (claims.length === 0) {
        await query(
          `UPDATE fact_checks
           SET status = 'completed', total_claims = 0, completed_at = CURRENT_TIMESTAMP,
               summary = 'No verifiable factual claims were found in this note.'
           WHERE id = $1`,
          [factCheck.id]
        );

        return NextResponse.json({
          success: true,
          factCheck: { ...factCheck, status: 'completed', total_claims: 0, claims: [] },
        });
      }

      // Step 2: Search and verify each claim
      let verifiedCount = 0;
      let falseCount = 0;
      let unverifiedCount = 0;
      let mixedCount = 0;
      const claimResults = [];

      for (const claim of claims) {
        // Search with Tavily
        const searchResults = await tavily.search(claim.searchQuery, {
          maxResults: 3,
          searchDepth: 'basic',
        });

        // Scrape top sources with Firecrawl (fall back to snippets)
        const sourceTexts = [];
        for (const result of searchResults.results.slice(0, 2)) {
          try {
            const scraped = await firecrawl.scrape(result.url, {
              onlyMainContent: true,
            });
            sourceTexts.push({
              url: result.url,
              title: result.title,
              content: scraped.markdown.slice(0, 2000),
            });
          } catch {
            sourceTexts.push({
              url: result.url,
              title: result.title,
              content: result.content,
            });
          }
        }

        // Verify claim against sources
        const verification = sourceTexts.length > 0
          ? await openai.verifyClaim(claim.claim, sourceTexts)
          : { verdict: 'unverified', confidence: 0, explanation: 'No sources found.' };

        const sourcesForDb = searchResults.results.slice(0, 3).map((r) => ({
          url: r.url,
          title: r.title,
          snippet: r.content?.slice(0, 300) || '',
          relevance_score: r.score,
        }));

        await query(
          `INSERT INTO fact_check_claims
            (fact_check_id, claim_text, claim_context, verdict, confidence, explanation, sources, search_queries)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            factCheck.id,
            claim.claim,
            claim.context,
            verification.verdict,
            verification.confidence,
            verification.explanation,
            JSON.stringify(sourcesForDb),
            JSON.stringify([claim.searchQuery]),
          ]
        );

        switch (verification.verdict) {
          case 'verified': verifiedCount++; break;
          case 'false': falseCount++; break;
          case 'mixed':
          case 'partially_verified': mixedCount++; break;
          default: unverifiedCount++; break;
        }

        claimResults.push({
          claim_text: claim.claim,
          claim_context: claim.context,
          verdict: verification.verdict,
          confidence: verification.confidence,
          explanation: verification.explanation,
          sources: sourcesForDb,
        });
      }

      // Update fact_check with results
      const summary = `Found ${claims.length} claims: ${verifiedCount} verified, ${falseCount} false, ${mixedCount} mixed, ${unverifiedCount} unverified.`;

      await query(
        `UPDATE fact_checks
         SET status = 'completed', total_claims = $2, verified_count = $3,
             false_count = $4, unverified_count = $5, mixed_count = $6,
             summary = $7, completed_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [factCheck.id, claims.length, verifiedCount, falseCount, unverifiedCount, mixedCount, summary]
      );

      return NextResponse.json({
        success: true,
        factCheck: {
          ...factCheck,
          status: 'completed',
          total_claims: claims.length,
          verified_count: verifiedCount,
          false_count: falseCount,
          unverified_count: unverifiedCount,
          mixed_count: mixedCount,
          summary,
          claims: claimResults,
        },
      });
    } catch (innerError) {
      await query(
        `UPDATE fact_checks SET status = 'failed', error_message = $2 WHERE id = $1`,
        [factCheck.id, String(innerError)]
      );
      throw innerError;
    }
  } catch (error) {
    console.error('Error running fact-check:', error);
    return NextResponse.json(
      { error: 'Failed to run fact-check' },
      { status: 500 }
    );
  }
}
