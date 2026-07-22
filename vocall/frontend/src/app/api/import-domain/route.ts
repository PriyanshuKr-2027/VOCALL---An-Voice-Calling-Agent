import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let rawUrl = body.url || body.domain;

    if (!rawUrl) {
      return NextResponse.json(
        { error: 'URL or domain parameter is required' },
        { status: 400 }
      );
    }

    // Clean up domain / URL input
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = `https://${rawUrl}`;
    }

    const parsedUrl = new URL(rawUrl);
    const domain = parsedUrl.hostname.replace(/^www\./, '');

    // Fetch site contents
    const res = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({
        name: domain.split('.')[0].toUpperCase(),
        domain,
        title: domain,
        description: `Imported from ${domain}`,
        logo_url: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      });
    }

    const html = await res.text();

    // Parse <title>
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : domain;

    // Parse description (meta description or og:description)
    const metaDescMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i) ||
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);

    const description = metaDescMatch
      ? metaDescMatch[1].trim()
      : `Voice AI Platform for ${domain}`;

    // Extract logo or favicon
    const logoMatch =
      html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);

    let logo_url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    if (logoMatch && logoMatch[1]) {
      const href = logoMatch[1];
      if (href.startsWith('http://') || href.startsWith('https://')) {
        logo_url = href;
      } else if (href.startsWith('//')) {
        logo_url = `${parsedUrl.protocol}${href}`;
      } else if (href.startsWith('/')) {
        logo_url = `${parsedUrl.origin}${href}`;
      }
    }

    const name = title.split(/[-|_]/)[0].trim() || domain;

    return NextResponse.json({
      name,
      domain,
      title,
      description,
      logo_url,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to import domain metadata' },
      { status: 500 }
    );
  }
}
