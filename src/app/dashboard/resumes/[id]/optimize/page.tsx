'use client'

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { generateOptimizationAction, saveOptimizedVersionAction } from "../../actions";
import OptimizationHeader from "./components/OptimizationHeader";
import OptimizationSummary from "./components/OptimizationSummary";
import SectionComparisonCard from "./components/SectionComparisonCard";
import KeywordPanel from "./components/KeywordPanel";
import { StructuredResumeContent } from "@/lib/types";
import { OptimizationResult } from "@/lib/gemini";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

type ReviewState = {
    summary: boolean;
    experience: boolean;
    projects: boolean;
    education: boolean;
    skills: boolean;
}

export default function OptimizeResumePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();


    const resumeId = params.id as string;
    const jobId = searchParams.get('jobId') || '';

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [data, setData] = useState<{
        optimization: OptimizationResult;
        original: StructuredResumeContent;
        resumeTitle: string;
        jobTitle: string;
        companyName: string;
    } | null>(null);

    // Default to accepting all adjustments (User can opt-out)
    const [reviewState, setReviewState] = useState<ReviewState>({
        summary: true,
        experience: true,
        projects: true,
        education: true,
        skills: true
    });

    useEffect(() => {
        async function loadOptimization() {
            try {
                const result = await generateOptimizationAction(resumeId, jobId);
                setData(result);
            } catch (error) {
                console.error(error);
                toast.error("We couldn't generate the suggestions. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
        loadOptimization();
    }, [resumeId, jobId]);

    const handleSave = async () => {
        if (!data) return;
        setIsSaving(true);

        try {
            // Construct the final content based on choices
            const finalContent = {
                ...data.original, // Start with original structure

                // Overwrite with optimized sections if accepted
                summary: reviewState.summary ? data.optimization.rewritten_content.summary : data.original.summary,
                skills: reviewState.skills ? data.optimization.rewritten_content.skills : data.original.skills,
                // For arrays, we either take the full new list or full old list for MVP simplicity
                // A more advanced version would allow picking specific items
                experience: reviewState.experience ? data.optimization.rewritten_content.experience : data.original.experience,
                projects: reviewState.projects ? data.optimization.rewritten_content.projects : data.original.projects,
                // Education is rarely optimized but we include it
                education: reviewState.education ? (data.optimization.rewritten_content.education || data.original.education) : data.original.education,
            };

            const result = await saveOptimizedVersionAction(resumeId, finalContent, jobId);

            toast.success("Optimized Version Saved!");

            // Clean redirect
            router.push(`/dashboard/resumes/${resumeId}`);

        } catch (error: any) {
            toast.error(`Could not save the new version. ${error?.message || 'Try again.'}`);
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center animate-pulse">
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Match & Optimizing Profiles...</h2>
                <p className="text-gray-500 max-w-md">Gemini is rewriting your resume to target specific keywords and impact metrics. This usually takes about 10-15 seconds.</p>

                {/* Skeleton UI */}
                <div className="w-full max-w-3xl mt-12 space-y-4 opacity-50">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                    <div className="h-32 bg-gray-200 rounded w-full"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-96 bg-gray-200 rounded"></div>
                        <div className="h-96 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-red-500">Failed to load data.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <OptimizationHeader
                resumeTitle={data.resumeTitle}
                targetJobTitle={data.jobTitle}
                companyName={data.companyName}
                onSave={handleSave}
                isSaving={isSaving}
            />

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Main Content (3 cols) */}
                    <div className="lg:col-span-3 space-y-8">

                        <OptimizationSummary summary={data.optimization.summary} />

                        <SectionComparisonCard
                            title="Professional Summary"
                            type="text"
                            originalContent={data.original.summary?.content}
                            newContent={data.optimization.rewritten_content.summary?.content}
                            isAccepted={reviewState.summary}
                            onToggle={(val) => setReviewState({ ...reviewState, summary: val })}
                        />

                        <SectionComparisonCard
                            title="Experience"
                            type="complex"
                            originalContent={data.original.experience}
                            newContent={data.optimization.rewritten_content.experience}
                            isAccepted={reviewState.experience}
                            onToggle={(val) => setReviewState({ ...reviewState, experience: val })}
                        />

                        <SectionComparisonCard
                            title="Projects"
                            type="complex"
                            originalContent={data.original.projects}
                            newContent={data.optimization.rewritten_content.projects}
                            isAccepted={reviewState.projects}
                            onToggle={(val) => setReviewState({ ...reviewState, projects: val })}
                        />

                        <SectionComparisonCard
                            title="Skills"
                            type="list"
                            originalContent={data.original.skills?.content || data.original.skills?.list}
                            newContent={data.optimization.rewritten_content.skills?.content || data.optimization.rewritten_content.skills?.list}
                            isAccepted={reviewState.skills}
                            onToggle={(val) => setReviewState({ ...reviewState, skills: val })}
                        />

                        {/* Spacer for bottom scrolling */}
                        <div className="h-24"></div>

                    </div>

                    {/* Sidebar (1 col) */}
                    <div>
                        <KeywordPanel analysis={data.optimization.keyword_analysis} />
                    </div>

                </div>
            </main>
        </div>
    )
}
