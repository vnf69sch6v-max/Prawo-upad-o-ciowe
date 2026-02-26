// NBP interest rates — fetches from official XML endpoint + Firestore cache
// https://static.nbp.pl/dane/stopy/stopy_procentowe.xml
import { NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';

interface NBPRate {
    name: string;
    nameEn: string;
    value: number;
    validFrom: string;
}

const NAME_MAP: Record<string, string> = {
    'Stopa referencyjna': 'Reference rate',
    'Stopa lombardowa': 'Lombard rate',
    'Stopa depozytowa': 'Deposit rate',
    'Stopa redyskontowa weksli': 'Rediscount rate',
    'Stopa dyskontowa weksli': 'Discount rate',
};

async function fetchNBPRates(): Promise<{ rates: NBPRate[]; publishDate: string }> {
    const res = await fetch(
        'https://static.nbp.pl/dane/stopy/stopy_procentowe.xml',
        {
            next: { revalidate: 86400 }, // Cache 24h — rates rarely change
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; EcoDashboard/1.0)',
                'Accept': 'application/xml, text/xml',
            },
        }
    );

    if (!res.ok) throw new Error(`NBP XML error: ${res.status}`);
    const xml = await res.text();

    const rates: NBPRate[] = [];

    // Extract publish date
    const pubMatch = xml.match(/data_publikacji="([^"]+)"/);
    const publishDate = pubMatch ? pubMatch[1] : '';

    // Parse each <pozycja> element from the first table (stoproc = basic rates)
    // Only parse items from the first <tabela id="stoproc">
    const stroprocMatch = xml.match(/<tabela id="stoproc"[^>]*>([\s\S]*?)<\/tabela>/);
    const stroprocBlock = stroprocMatch ? stroprocMatch[1] : xml;

    const pozycjaRegex = /<pozycja\s([^>]+)\/?\s*>/g;
    let match;
    while ((match = pozycjaRegex.exec(stroprocBlock)) !== null) {
        const attrs = match[1];

        // Extract individual attributes
        const nazwaMatch = attrs.match(/nazwa="([^"]+)"/);
        const oprMatch = attrs.match(/oprocentowanie="([^"]+)"/);
        const odMatch = attrs.match(/obowiazuje_od="([^"]+)"/);

        if (nazwaMatch && oprMatch) {
            const name = nazwaMatch[1];
            const value = parseFloat(oprMatch[1].replace(',', '.'));
            const validFrom = odMatch ? odMatch[1] : publishDate;

            rates.push({
                name,
                nameEn: NAME_MAP[name] || name,
                value,
                validFrom,
            });
        }
    }

    return { rates, publishDate };
}

export async function GET() {
    try {
        const result = await withCache(
            'interest_rates',
            'nbp_rates',
            async () => {
                const { rates, publishDate } = await fetchNBPRates();
                return {
                    timestamp: new Date().toISOString(),
                    source: 'static.nbp.pl/dane/stopy/stopy_procentowe.xml',
                    publishDate,
                    rates,
                };
            },
            'NBP XML',
            24 * 3600 * 1000
        );

        if (!result.rates?.length) {
            return NextResponse.json({
                error: 'Could not parse NBP XML — format may have changed',
                fallback: true,
                rates: [],
            }, { status: 206 });
        }

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
