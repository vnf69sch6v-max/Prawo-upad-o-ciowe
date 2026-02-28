// NBP interest rates — fetches from official XML endpoint
// https://static.nbp.pl/dane/stopy/stopy_procentowe.xml
import { NextResponse } from 'next/server';

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
            next: { revalidate: 86400 },
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

    // Extract the first table block (id="stoproc" = base rates)
    const tableMatch = xml.match(/<tabela[\s\S]*?id="stoproc"[\s\S]*?<\/tabela>/);
    const tableBlock = tableMatch ? tableMatch[0] : xml;

    // Split by <pozycja to get each rate entry
    const entries = tableBlock.split('<pozycja');

    for (const entry of entries) {
        const nazwaMatch = entry.match(/nazwa="([^"]+)"/);
        const oprMatch = entry.match(/oprocentowanie="([^"]+)"/);
        const odMatch = entry.match(/obowiazuje_od="([^"]+)"/);

        if (nazwaMatch && oprMatch) {
            const name = nazwaMatch[1];
            const value = parseFloat(oprMatch[1].replace(',', '.'));
            const validFrom = odMatch ? odMatch[1] : publishDate;

            // Only include main rates (skip reserve requirements etc.)
            if (NAME_MAP[name]) {
                rates.push({
                    name,
                    nameEn: NAME_MAP[name],
                    value,
                    validFrom,
                });
            }
        }
    }

    return { rates, publishDate };
}

export async function GET() {
    try {
        const { rates, publishDate } = await fetchNBPRates();

        if (rates.length === 0) {
            return NextResponse.json({
                error: 'Could not parse NBP XML — format may have changed',
                fallback: true,
                rates: [],
            }, { status: 206 });
        }

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            source: 'static.nbp.pl/dane/stopy/stopy_procentowe.xml',
            publishDate,
            rates,
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
