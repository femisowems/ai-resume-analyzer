'use client'

import { StructuredResumeContent } from "@/lib/types"
import { Edit2 } from "lucide-react"

interface Props {
    content: StructuredResumeContent
}

function Section({ title, children, onEdit }: { title: string, children: React.ReactNode, onEdit?: () => void }) {
    return (
        <div className="mb-8 group relative">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-1">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">{title}</h3>
                <button
                    onClick={onEdit}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600 transition-all"
                    title="Edit Section"
                >
                    <Edit2 className="h-3 w-3" />
                </button>
            </div>
            <div className="text-gray-800 text-sm leading-relaxed">
                {children}
            </div>
        </div>
    )
}

export default function StructuredResumeViewer({ content }: Props) {
    return (
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl min-h-[800px] p-8 md:p-12 font-sans relative">
            {/* Contact Header (Simple Render) */}
            <div className="text-center mb-8 pb-8 border-b border-gray-100">
                {/* Name would come from resume root in real app, hacking here or using content only */}
                <div className="text-sm text-gray-600">{content.contact_info?.content || 'No contact info parsed'}</div>
            </div>

            {/* Summary */}
            {content.summary && (
                <Section title="Professional Summary">
                    <p>{content.summary.content}</p>
                </Section>
            )}

            {/* Experience */}
            {content.experience && content.experience.length > 0 && (
                <Section title="Experience">
                    <div className="space-y-6">
                        {content.experience.map((exp) => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-gray-900">{exp.role}</h4>
                                    <span className="text-xs text-gray-500 font-medium">{exp.duration}</span>
                                </div>
                                <div className="text-xs text-indigo-800 font-semibold mb-2">{exp.company} {exp.location ? `— ${exp.location}` : ''}</div>
                                <ul className="list-disc list-outside ml-4 space-y-1.5 text-gray-700">
                                    {exp.bullets.map((bullet, idx) => (
                                        <li key={idx} className="group/li relative pl-1 hover:text-gray-900">
                                            {/* Hover effect to show specific bullet improvement hint could go here */}
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Projects */}
            {content.projects && content.projects.length > 0 && (
                <Section title="Projects">
                    <div className="space-y-6">
                        {content.projects.map((proj) => (
                            <div key={proj.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-gray-900">{proj.name}</h4>
                                </div>
                                <ul className="list-disc list-outside ml-4 space-y-1.5 text-gray-700">
                                    {proj.bullets.map((bullet, idx) => (
                                        <li key={idx}>{bullet}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Section>
            )}


            {/* Education */}
            {content.education && content.education.length > 0 && (
                <Section title="Education">
                    <div className="space-y-4">
                        {content.education.map((edu) => (
                            <div key={edu.id}>
                                <div className="flex justify-between font-bold text-gray-900">
                                    <span>{edu.school}</span>
                                    <span className="text-xs font-normal text-gray-500">{edu.year}</span>
                                </div>
                                <div className="text-xs">{edu.degree}</div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Skills */}
            {content.skills && (
                <Section title="Skills">
                    <p>{content.skills.content || (content.skills.list || []).join(', ')}</p>
                </Section>
            )}

        </div>
    )
}
