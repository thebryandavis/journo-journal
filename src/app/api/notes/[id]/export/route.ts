import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { query } from '@/lib/db';
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const noteId = params.id;
    const format = request.nextUrl.searchParams.get('format') || 'markdown';

    // Fetch note with tags
    const result = await query(
      `SELECT
        n.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'tag_name', t.tag_name
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags
      FROM notes n
      LEFT JOIN tags t ON n.id = t.note_id
      WHERE n.id = $1 AND n.user_id = $2
      GROUP BY n.id`,
      [noteId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const note = result.rows[0];

    let content = '';
    let contentType = 'text/plain';
    let filename = `${note.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;

    switch (format) {
      case 'markdown':
        content = generateMarkdown(note);
        contentType = 'text/markdown';
        filename += '.md';
        break;

      case 'html':
        content = generateHTML(note);
        contentType = 'text/html';
        filename += '.html';
        break;

      case 'json':
        content = JSON.stringify(note, null, 2);
        contentType = 'application/json';
        filename += '.json';
        break;

      default:
        content = generatePlainText(note);
        contentType = 'text/plain';
        filename += '.txt';
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting note:', error);
    return NextResponse.json(
      { error: 'Failed to export note' },
      { status: 500 }
    );
  }
}

function generateMarkdown(note: any): string {
  const tags = note.tags.map((t: any) => `#${t.tag_name}`).join(' ');

  return `# ${note.title}

**Type:** ${note.type}
**Created:** ${new Date(note.created_at).toLocaleDateString()}
**Tags:** ${tags}

---

${note.content || ''}
`;
}

function generateHTML(note: any): string {
  const tags = note.tags.map((t: any) => `<span class="tag">${t.tag_name}</span>`).join(' ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${note.title}</title>
  <style>
    body {
      font-family: Georgia, serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 { color: #1A1A1A; }
    .meta { color: #666; margin-bottom: 2rem; }
    .tag {
      background: #FFB800;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      margin-right: 0.5rem;
    }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  <div class="meta">
    <p><strong>Type:</strong> ${note.type}</p>
    <p><strong>Created:</strong> ${new Date(note.created_at).toLocaleDateString()}</p>
    <p><strong>Tags:</strong> ${tags}</p>
  </div>
  <div class="content">
    ${note.content_html || note.content || ''}
  </div>
</body>
</html>`;
}

function generatePlainText(note: any): string {
  const tags = note.tags.map((t: any) => t.tag_name).join(', ');
  const content = note.content ? note.content.replace(/<[^>]*>/g, '') : '';

  return `${note.title}

Type: ${note.type}
Created: ${new Date(note.created_at).toLocaleDateString()}
Tags: ${tags}

---

${content}
`;
}
