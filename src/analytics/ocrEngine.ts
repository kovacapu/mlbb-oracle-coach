import Tesseract from 'tesseract.js';
import { getAllHeroes } from '../data/heroes';

export interface OCRResult {
    success: boolean;
    confidence: number;
    data: {
        kills?: number;
        deaths?: number;
        assists?: number;
        gold?: number;
        heroId?: string;
        heroName?: string;
        result?: 'Victory' | 'Defeat';
    };
    errorMsg?: string;
}

// ─── Image Preprocessing ────────────────────────────────────────────────────

/**
 * Converts image to high-contrast grayscale using Canvas API.
 * MLBB score screens have bright numbers on dark backgrounds — boosting
 * contrast dramatically improves Tesseract accuracy.
 */
const preprocessImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Scale down if very large (e.g. 4K phone screenshots) — Tesseract is faster on smaller images
            const MAX_DIM = 1600;
            const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);

            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const d = imageData.data;

            for (let i = 0; i < d.length; i += 4) {
                // Luminance-weighted grayscale
                const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

                // S-curve contrast enhancement
                // Dark pixels get darker, bright pixels get brighter
                let enhanced: number;
                if (gray < 80) {
                    enhanced = gray * 0.4;          // crush shadows
                } else if (gray < 160) {
                    enhanced = gray * 0.8;           // moderate mid-tones
                } else {
                    enhanced = Math.min(255, gray * 1.25); // lift highlights
                }

                d[i] = d[i + 1] = d[i + 2] = enhanced;
                // alpha unchanged
            }

            ctx.putImageData(imageData, 0, 0);
            canvas.toBlob(
                blob => {
                    URL.revokeObjectURL(objectUrl);
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas toBlob failed'));
                },
                'image/png',
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Image load failed'));
        };

        img.src = objectUrl;
    });
};

// ─── Hero Name Fuzzy Matching ────────────────────────────────────────────────

/**
 * Searches OCR text for any known hero name using case-insensitive whole-word
 * matching. Returns the hero id if found.
 */
const detectHeroFromText = (text: string): { heroId: string; heroName: string } | null => {
    const normalized = text.toLowerCase().replace(/[^a-z0-9 \-]/g, ' ');
    const heroes = getAllHeroes();

    // Sort by name length descending so "Yu Zhong" is matched before "Yu"
    const sorted = [...heroes].sort((a, b) => b.name.length - a.name.length);

    for (const hero of sorted) {
        // Normalize hero name the same way
        const heroNorm = hero.name.toLowerCase().replace(/[^a-z0-9 \-]/g, ' ').trim();
        // Allow partial match: hero name appears as a substring of a word (e.g. "layla" in text)
        if (normalized.includes(heroNorm)) {
            return { heroId: hero.id, heroName: hero.name };
        }
    }
    return null;
};

// ─── Match Result Detection ──────────────────────────────────────────────────

/**
 * Looks for Victory / Defeat / Turkish equivalents in OCR text.
 */
const detectResultFromText = (text: string): 'Victory' | 'Defeat' | null => {
    const upper = text.toUpperCase();

    // Victory patterns (EN + TR)
    if (/\b(VICTORY|GALİBİYET|GALİP|KAZAND[Iİ])\b/.test(upper)) return 'Victory';
    // Defeat patterns (EN + TR)
    if (/\b(DEFEAT|MAĞLUBIYET|MAĞLUP|KAYBETT[İI])\b/.test(upper)) return 'Defeat';

    return null;
};

// ─── KDA Extraction ──────────────────────────────────────────────────────────

interface KDAExtract {
    kills: number;
    deaths: number;
    assists: number;
}

const extractKDA = (text: string): KDAExtract | null => {
    // Strategy 1 — explicit "K / D / A" labels (most reliable)
    const labeled = text.match(/(?:KDA|K\s*[/:]\s*D\s*[/:]\s*A)[^\d]*(\d{1,2})\s*[/|\\]\s*(\d{1,2})\s*[/|\\]\s*(\d{1,2})/i);
    if (labeled) {
        return {
            kills: parseInt(labeled[1], 10),
            deaths: parseInt(labeled[2], 10),
            assists: parseInt(labeled[3], 10),
        };
    }

    // Strategy 2 — three numbers separated by / or | with optional spaces
    const simple = text.match(/\b(\d{1,2})\s*[/|\\]\s*(\d{1,2})\s*[/|\\]\s*(\d{1,2})\b/);
    if (simple) {
        return {
            kills: parseInt(simple[1], 10),
            deaths: parseInt(simple[2], 10),
            assists: parseInt(simple[3], 10),
        };
    }

    // Strategy 3 — "Kills: 10  Deaths: 3  Assists: 7" keyword style
    const killsMatch = text.match(/(?:kills?|öldürme)[^\d]*(\d{1,2})/i);
    const deathsMatch = text.match(/(?:deaths?|ölüm)[^\d]*(\d{1,2})/i);
    const assistsMatch = text.match(/(?:assists?|destek)[^\d]*(\d{1,2})/i);
    if (killsMatch && deathsMatch) {
        return {
            kills: parseInt(killsMatch[1], 10),
            deaths: parseInt(deathsMatch[1], 10),
            assists: assistsMatch ? parseInt(assistsMatch[1], 10) : 0,
        };
    }

    // Strategy 4 — MLBB column layout: "K D A" header followed by three numbers
    // OCR often reads columns as space/newline separated: "8 2 5" or "8\n2\n5"
    const kdaHeader = text.match(/\bK\s+D\s+A\b[^\d]*(\d{1,2})\D+(\d{1,2})\D+(\d{1,2})/i);
    if (kdaHeader) {
        return {
            kills: parseInt(kdaHeader[1], 10),
            deaths: parseInt(kdaHeader[2], 10),
            assists: parseInt(kdaHeader[3], 10),
        };
    }

    // Strategy 5 — MLBB scoreboard format: "K D A GOLD" on same line
    // e.g. "3 6 6 9013" or "krc Kovac 3 6 6 9013 6.4"
    // Pattern: three 1-2 digit numbers followed by a 4-5 digit gold value
    const scoreboardLine = text.match(/\b(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{4,5})\b/);
    if (scoreboardLine) {
        const k = parseInt(scoreboardLine[1], 10);
        const d = parseInt(scoreboardLine[2], 10);
        const a = parseInt(scoreboardLine[3], 10);
        if (k <= 30 && d <= 30 && a <= 30) {
            return { kills: k, deaths: d, assists: a };
        }
    }

    // Strategy 6 — Three standalone small numbers on same line (exactly 3)
    const allLines = text.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);
    for (const line of allLines) {
        const nums = line.match(/\b(\d{1,2})\b/g);
        if (nums && nums.length === 3) {
            const [k, d, a] = nums.map(Number);
            if (k <= 30 && d <= 30 && a <= 30) {
                return { kills: k, deaths: d, assists: a };
            }
        }
    }

    // Strategy 7 — Last resort: first valid triplet ≤20 in all text
    const allNums = (text.match(/\b\d{1,2}\b/g) || []).map(Number).filter(n => n <= 30);
    for (let i = 0; i <= allNums.length - 3; i++) {
        const [k, d, a] = allNums.slice(i, i + 3);
        if (k <= 20 && d <= 20 && a <= 20) {
            return { kills: k, deaths: d, assists: a };
        }
    }

    return null;
};

// ─── Gold Extraction ─────────────────────────────────────────────────────────

const extractGold = (text: string): number | undefined => {
    const goldMatch = text.match(/(?:Gold|Alt[ı1i]n|G)\s*[:]?\s*(\d{1,2}[.,]?\d+k?|\d{3,6})/i);
    if (!goldMatch) return undefined;

    let raw = goldMatch[1].toLowerCase().replace(',', '.');
    if (raw.includes('k')) {
        return Math.round(parseFloat(raw.replace('k', '')) * 1000);
    }
    return parseInt(raw.replace('.', ''), 10);
};

// ─── Player Row Extraction ────────────────────────────────────────────────────

/**
 * If playerName is given, find the scoreboard line containing the name
 * and extract K/D/A from it. MLBB format: "nickname  K  D  A  GOLD"
 */
const extractKDAForPlayer = (fullText: string, playerName: string): KDAExtract | null => {
    const nameLower = playerName.toLowerCase().trim();
    if (!nameLower) return null;

    const lines = fullText.split(/[\n\r]+/);
    for (const line of lines) {
        if (!line.toLowerCase().includes(nameLower)) continue;

        // Pattern: K D A GOLD on the same line
        const m = line.match(/\b(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{3,5})\b/);
        if (m) {
            const k = parseInt(m[1], 10);
            const d = parseInt(m[2], 10);
            const a = parseInt(m[3], 10);
            if (k <= 30 && d <= 30 && a <= 30) {
                return { kills: k, deaths: d, assists: a };
            }
        }

        // Fallback: any three small numbers on this line
        const nums = (line.match(/\b\d{1,2}\b/g) || []).map(Number).filter(n => n <= 30);
        if (nums.length >= 3) {
            return { kills: nums[0], deaths: nums[1], assists: nums[2] };
        }
    }
    return null;
};

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * The Vision Engine (Oracle V10)
 * Scans a Mobile Legends post-match screenshot and extracts K/D/A, gold,
 * hero name, and match result using Tesseract OCR + image preprocessing.
 *
 * @param playerName  Optional in-game nickname — when provided, finds the
 *                    player's specific row in a 10-player scoreboard.
 */
export const scanMatchResult = async (
    imageFile: File,
    language: string = 'eng',
    playerName?: string,
): Promise<OCRResult> => {
    try {
        // Step 1: Preprocess image for better OCR accuracy
        let ocrSource: Blob | File = imageFile;
        try {
            ocrSource = await preprocessImage(imageFile);
        } catch {
            // If preprocessing fails (e.g. unsupported image type), fall back to raw file
        }

        // Step 2: Run Tesseract
        // 'tur' dil paketi her zaman yüklü olmayabilir — eng ile fallback
        let worker: Awaited<ReturnType<typeof Tesseract.createWorker>>;
        try {
            worker = await Tesseract.createWorker(language);
        } catch {
            worker = await Tesseract.createWorker('eng');
        }
        await worker.setParameters({
            tessedit_pageseg_mode: '6' as never, // PSM 6 = uniform block
        });

        const { data: { text, confidence } } = await worker.recognize(ocrSource as File);
        await worker.terminate();

        // Step 3: Extract data from text
        // Keep original multi-line text for player row search
        const multiLineText = text;
        const rawText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');

        // If playerName given, search for their specific row first
        const playerKDA = playerName ? extractKDAForPlayer(multiLineText, playerName) : null;
        const kda = playerKDA ?? extractKDA(rawText);
        const gold = extractGold(rawText);
        const heroMatch = detectHeroFromText(rawText);
        const matchResult = detectResultFromText(rawText);

        // Need at least KDA to be useful
        const hasData = kda !== null || gold !== undefined;

        if (!hasData) {
            // Low confidence fallback message
            if (confidence < 30) {
                return {
                    success: false,
                    confidence,
                    data: {},
                    errorMsg: 'ocr_error_low_confidence',
                };
            }
            return {
                success: false,
                confidence,
                data: {},
                errorMsg: 'ocr_error_no_data_found',
            };
        }

        return {
            success: true,
            confidence,
            data: {
                ...(kda ? { kills: kda.kills, deaths: kda.deaths, assists: kda.assists } : {}),
                ...(gold !== undefined ? { gold } : {}),
                ...(heroMatch ? { heroId: heroMatch.heroId, heroName: heroMatch.heroName } : {}),
                ...(matchResult ? { result: matchResult } : {}),
            },
        };

    } catch {
        return {
            success: false,
            confidence: 0,
            data: {},
            errorMsg: 'ocr_error_engine_failed',
        };
    }
};
