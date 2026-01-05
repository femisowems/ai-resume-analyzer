'use client'

import { JobContact } from '@/lib/types'
import { User, Mail, Linkedin, Plus } from 'lucide-react'

interface ContactsPanelProps {
    contacts: JobContact[]
    jobId: string
}

export function ContactsPanel({ contacts, jobId }: ContactsPanelProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Network & Contacts</h2>
                <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Contact
                </button>
            </div>

            {contacts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200 border-dashed">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <User className="h-12 w-12" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No Contacts Added</h3>
                    <p className="mt-1 text-sm text-gray-500">Track recruiters, hiring managers, and referrals.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {contacts.map((contact) => (
                        <div key={contact.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <span className="inline-block h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            {contact.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">{contact.name}</h3>
                                        <p className="text-sm text-gray-500">{contact.role}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between space-x-2">
                                    {contact.email && (
                                        <a href={`mailto:${contact.email}`} className="text-gray-400 hover:text-gray-600">
                                            <Mail className="h-5 w-5" />
                                        </a>
                                    )}
                                    {contact.linkedin_url && (
                                        <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                                            <Linkedin className="h-5 w-5" />
                                        </a>
                                    )}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contact.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                            contact.status === 'replied' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {contact.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
