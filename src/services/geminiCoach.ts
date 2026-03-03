import { getHeroById } from '../data/heroes';
import { getItemById } from '../data/items';
import { getEmblemById } from '../data/emblems';
import { SPELLS } from '../data/spells';
import type { MatchRecord } from '../types';

const GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GeminiMatchInput {
    heroId: string;
    kills: number;
    deaths: number;
    assists: number;
    result: 'Victory' | 'Defeat';
    itemIds: string[];
    emblemId?: string;
    spellId?: string;
    playStyle: string;
}

function buildPrompt(match: GeminiMatchInput, recentMatches: MatchRecord[]): string {
    const hero = getHeroById(match.heroId);
    const heroName = hero ? hero.name : match.heroId;
    const heroRoles = hero ? hero.roles.join(', ') : 'Bilinmiyor';
    const itemNames = match.itemIds
        .map(id => getItemById(id)?.name ?? id)
        .filter(Boolean)
        .join(', ') || 'Yok';
    const emblemName = match.emblemId ? (getEmblemById(match.emblemId)?.name ?? match.emblemId) : 'Yok';
    const spellName = match.spellId ? (SPELLS[match.spellId]?.name ?? match.spellId) : 'Yok';
    const safeDeaths = match.deaths === 0 ? 1 : match.deaths;
    const kda = ((match.kills + match.assists) / safeDeaths).toFixed(2);
    const resultText = match.result === 'Victory' ? 'Galibiyet' : 'Mağlubiyet';
    const playstyleText = {
        'Aggressive Carry': 'Agresif Carry',
        'Supportive': 'Destekleyici',
        'Risky/Overextended': 'Riskli/Fazla İleri Gitme',
        'Balanced': 'Dengeli',
    }[match.playStyle] ?? match.playStyle;

    let historySection = '';
    if (recentMatches.length > 0) {
        const historyLines = recentMatches.slice(0, 5).map(m => {
            const h = getHeroById(m.hero_id ?? m.heroId);
            const hName = h ? h.name : (m.hero_id ?? m.heroId);
            const r = m.result === 'Victory' ? 'Galibiyet' : 'Mağlubiyet';
            const sd = m.deaths === 0 ? 1 : m.deaths;
            const hKda = ((m.kills + m.assists) / sd).toFixed(1);
            return `  - ${hName}: ${m.kills}/${m.deaths}/${m.assists} (KDA ${hKda}) → ${r}`;
        });
        historySection = `\nSon ${recentMatches.length} Maç Geçmişi:\n${historyLines.join('\n')}`;
    }

    return `Sen bir Mobile Legends: Bang Bang uzman koçusun. Oyuncunun son maçını analiz et ve Türkçe, samimi ve kişisel bir koçluk notu yaz.

Son Maç Bilgileri:
- Kahraman: ${heroName} (${heroRoles})
- Skor: ${match.kills}/${match.deaths}/${match.assists}
- KDA: ${kda}
- Sonuç: ${resultText}
- Eşyalar: ${itemNames}
- Amblem: ${emblemName}
- Savaş Büyüsü: ${spellName}
- Tespit Edilen Oyun Tarzı: ${playstyleText}
${historySection}

Lütfen şunları içeren 3-4 cümlelik kişisel koçluk notu yaz:
1. Bu maçın olumlu veya olumsuz bir değerlendirmesi (KDA ve sonuca göre)
2. Eğer kalıp varsa (örn: son 3 maçta ölüm sayısı yüksek) bunu belirt
3. Somut ve uygulanabilir 1-2 ipucu (pozisyon, eşya, strateji)
4. Motivasyonel bir kapanış

Sadece koçluk notunu yaz, başka bir şey ekleme. Samimi, destekleyici ve MLBB'ye özgü ol.`;
}

export async function generateGeminiCoachNote(
    match: GeminiMatchInput,
    recentMatches: MatchRecord[],
): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) {
        throw new Error('Gemini API anahtarı yapılandırılmamış.');
    }

    const prompt = buildPrompt(match, recentMatches);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: 350,
                temperature: 0.75,
            },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API hatası (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!text) throw new Error('Gemini boş yanıt döndürdü.');
    return text.trim();
}
