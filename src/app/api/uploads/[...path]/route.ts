import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readUploadedFile, getContentType } from '@/lib/uploads';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const relativePath = params.path.join('/');

    // Security: user can only access their own uploads
    if (!relativePath.startsWith(userId + '/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const fileBuffer = await readUploadedFile(relativePath);

    if (!fileBuffer) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileName = params.path[params.path.length - 1];
    const contentType = getContentType(fileName);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'private, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error serving upload:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
