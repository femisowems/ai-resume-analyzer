
const BRANDFETCH_API_KEY = process.env.BRANDFETCH_API_KEY;

export interface BrandfetchBrand {
    name: string;
    domain: string;
    claimed: boolean;
    description: string;
    links: {
        name: string;
        url: string;
    }[];
    logos: {
        type: 'logo' | 'icon' | 'symbol';
        theme?: 'dark' | 'light'; // Some logos might not have theme
        formats: {
            src: string;
            background: string | null;
            format: 'svg' | 'png' | 'jpeg';
            size?: number;
            width?: number;
            height?: number;
        }[];
    }[];
    colors: {
        hex: string;
        type: string;
        brightness: number;
    }[];
    fonts: {
        name: string;
        type: string;
        origin: string;
        originId: string;
        weights: number[];
    }[];
    images: {
        type: string;
        formats: {
            src: string;
            background: string | null;
            format: string;
            size: number;
            width: number;
            height: number;
        }[];
    }[];
}

/**
 * Extracts the domain from a URL or specific string.
 * @param url The URL or text containing a domain.
 */
export function extractDomain(url: string): string | null {
    try {
        // If it doesn't start with http, add it for parsing
        const protocolUrl = url.startsWith('http') ? url : `https://${url}`;
        const hostname = new URL(protocolUrl).hostname;

        // Remove www.
        const cleanHostname = hostname.replace(/^www\./, '');

        // Simple validation: must have at least one dot and not be empty
        if (cleanHostname.includes('.') && cleanHostname.length > 3) {
            return cleanHostname;
        }
        return null;
    } catch (e) {
        return null;
    }
}

/**
 * Fetches brand data from Brandfetch API.
 * @param domain The domain to lookup (e.g. 'stripe.com')
 */
export async function fetchBrand(domain: string): Promise<BrandfetchBrand | null> {
    if (!BRANDFETCH_API_KEY) {
        console.warn('BRANDFETCH_API_KEY is not set');
        return null;
    }

    try {
        const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${BRANDFETCH_API_KEY}`,
            },
            next: { revalidate: 3600 * 24 * 30 }, // Cache specifically for this fetch if using Next.js cache
        });

        if (!response.ok) {
            if (response.status === 404) {
                // Try search if direct domain lookup failed (rare but happens if domain is weird)
                // For now, return null as 404 means they don't have it tracked by that domain
                return null;
            }
            if (response.status === 429) {
                console.warn('Brandfetch rate limit exceeded');
                return null;
            }
            console.error(`Brandfetch API error: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data as BrandfetchBrand;
    } catch (error) {
        console.error('Error fetching brand from Brandfetch:', error);
        return null;
    }
}

/**
 * Helper to get the best logo from the Brandfetch response.
 * Be specific about what "best" means:
 * 1. Icon/Symbol/Logo priority
 * 2. SVG preferred over PNG
 * 3. Transparent background preferred
 */
export function getBestLogoUrl(brand: BrandfetchBrand): string | null {
    if (!brand.logos || brand.logos.length === 0) return null;

    // We prefer 'icon' or 'symbol' for small avatars, 'logo' for full headers.
    // For the jobs card, an icon/symbol is usually better than a wide wordmark.
    const icon = brand.logos.find(l => l.type === 'icon' || l.type === 'symbol');
    const logo = brand.logos.find(l => l.type === 'logo');

    const target = icon || logo || brand.logos[0];

    // Prefer SVG, then PNG
    const svg = target.formats.find(f => f.format === 'svg');
    const png = target.formats.find(f => f.format === 'png');

    return svg?.src || png?.src || target.formats[0]?.src || null;
}
