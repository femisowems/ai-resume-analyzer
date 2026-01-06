import { z } from 'zod';

/**
 * Single Score Contract as requested by the user.
 * Ensures data integrity between AI output, DB storage, and UI rendering.
 */
export const AnalysisResultSchema = z.object({
    total: z.number().min(0).max(100),
    breakdown: z.object({
        ats: z.number().min(0).max(100),
        impact: z.number().min(0).max(100),
        keywords: z.number().min(0).max(100),
        clarity: z.number().min(0).max(100),
    }),
    explanation: z.object({
        ats: z.array(z.string()),
        impact: z.array(z.string()),
        keywords: z.array(z.string()),
        clarity: z.array(z.string()),
    }),
    // Preserve existing functionality for keywords and suggestions
    keywords: z.object({
        present: z.array(z.string()),
        missing: z.array(z.string()),
        irrelevant: z.array(z.string()),
    }),
    suggestions: z.array(z.object({
        id: z.string(),
        type: z.enum(['impact', 'ats', 'clarity', 'formatting', 'tone', 'general']),
        severity: z.enum(['high', 'medium', 'low']),
        section_target: z.enum(['summary', 'experience', 'projects', 'education', 'skills', 'general']),
        description: z.string(),
        proposed_fix: z.string(),
    })),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

/**
 * Helper to safely parse analysis result with defaults
 */
export function safeParseAnalysis(data: any): AnalysisResult {
    const result = AnalysisResultSchema.safeParse(data);
    if (result.success) return result.data;

    // Log error in dev mode if data isn't empty (we expect {} for pending)
    if (process.env.NODE_ENV === 'development' && data && Object.keys(data).length > 0) {
        console.warn('[Analysis Validation Error]:', result.error.format());
    }

    // Fallback / Defaults
    return {
        total: data?.total || data?.overall_score || data?.score || 0,
        breakdown: {
            ats: data?.breakdown?.ats || data?.sub_scores?.ats_compatibility || 0,
            impact: data?.breakdown?.impact || data?.sub_scores?.impact_metrics || 0,
            keywords: data?.breakdown?.keywords || data?.sub_scores?.keyword_match || 0,
            clarity: data?.breakdown?.clarity || data?.sub_scores?.clarity || 0,
        },
        explanation: {
            ats: data?.explanation?.ats || [],
            impact: data?.explanation?.impact || [],
            keywords: data?.explanation?.keywords || [],
            clarity: data?.explanation?.clarity || [],
        },
        keywords: data?.keywords || { present: [], missing: [], irrelevant: [] },
        suggestions: data?.suggestions || [],
    };
}
