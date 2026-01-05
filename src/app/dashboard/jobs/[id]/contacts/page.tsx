import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { addContact, deleteContact } from '../../actions-networking'
import { Plus, Trash2, Mail, Linkedin, User } from 'lucide-react'

export default async function JobContactsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { id } = await params

    const { data: contacts } = await supabase
        .from('job_contacts')
        .select('*')
        .eq('job_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
                <div className="border-b border-gray-200 pb-6 mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">Networking & Contacts</h3>
                        <p className="text-gray-500 text-sm">
                            Keep track of recruiters and referrals for this role.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Add Contact Form */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Contact
                        </h4>
                        <form action={addContact} className="space-y-4">
                            <input type="hidden" name="jobId" value={id} />
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase">Name *</label>
                                <input name="name" required className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm p-2" placeholder="e.g. Sarah Recruiter" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase">Role</label>
                                <input name="role" className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm p-2" placeholder="e.g. Hiring Manager" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase">Email</label>
                                <input name="email" type="email" className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm p-2" placeholder="sarah@company.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase">LinkedIn URL</label>
                                <input name="linkedinUrl" type="url" className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm p-2" placeholder="https://linkedin.com/in/..." />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase">Notes</label>
                                <textarea name="notes" rows={3} className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm p-2" placeholder="Met at career fair..." />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition text-sm font-medium">Add Contact</button>
                        </form>
                    </div>

                    {/* Contacts List */}
                    <div className="md:col-span-2 space-y-4">
                        {contacts && contacts.length > 0 ? (
                            contacts.map((contact: any) => (
                                <div key={contact.id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow flex justify-between items-start group">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-1">
                                            <h5 className="text-lg font-bold text-gray-900 mr-3">{contact.name}</h5>
                                            {contact.role && (
                                                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-100 font-medium">
                                                    {contact.role}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                                            {contact.email && (
                                                <a href={`mailto:${contact.email}`} className="flex items-center hover:text-indigo-600">
                                                    <Mail className="h-4 w-4 mr-1.5" />
                                                    {contact.email}
                                                </a>
                                            )}
                                            {contact.linkedin_url && (
                                                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-600">
                                                    <Linkedin className="h-4 w-4 mr-1.5" />
                                                    LinkedIn Profile
                                                </a>
                                            )}
                                        </div>

                                        {contact.notes && (
                                            <p className="mt-3 text-gray-600 text-sm bg-gray-50 p-3 rounded border-l-2 border-gray-300 italic">
                                                "{contact.notes}"
                                            </p>
                                        )}
                                    </div>
                                    <form action={deleteContact}>
                                        <input type="hidden" name="contactId" value={contact.id} />
                                        <input type="hidden" name="jobId" value={id} />
                                        <button type="submit" className="text-gray-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition opacity-0 group-hover:opacity-100" title="Delete Contact">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </form>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <User className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 font-medium">No contacts added yet.</p>
                                <p className="text-gray-400 text-sm">Add people you've spoken to at this company.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
