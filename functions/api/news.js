export async function onRequestGet(context) {
  try {
    const res = await fetch('https://feeds.bbci.co.uk/arabic/sport/rss.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AhmedShawqiSite/1.0)' }
    });
    if (!res.ok) throw new Error('upstream fetch failed: ' + res.status);
    const xml = await res.text();

    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
      const block = match[1];
      const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
      const linkMatch = block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/);
      if (titleMatch && linkMatch) {
        items.push({
          title: titleMatch[1].trim(),
          link: linkMatch[1].trim()
        });
      }
    }

    return new Response(JSON.stringify({ items }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: true, items: [] }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      status: 200
    });
  }
}