/** Server Component. Matches the real table card layout to eliminate layout shift. */
export function TableSkeleton() {
    return (
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" aria-hidden="true">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-white text-[13px] font-medium text-slate-500">
                            <th className="w-12 px-4 py-3 text-center" />
                            <th className="py-3 px-3 font-medium text-slate-700">Todo</th>
                            <th className="py-3 px-4 w-32 font-medium text-slate-700 text-center">Status</th>
                            <th className="py-3 px-4 w-24 font-medium text-slate-700 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {Array.from({ length: 6 }, (_, i) => (
                            <tr key={i} className="border-b border-slate-100">
                                <td className="px-4 py-3.5 text-center align-middle">
                                    <div className="flex items-center justify-center">
                                        <span className="bar bar-box" />
                                    </div>
                                </td>
                                <td className="py-3.5 px-3 align-middle">
                                    <span className="bar" style={{ width: `${45 + ((i * 13) % 40)}%` }} />
                                </td>
                                <td className="py-3.5 px-4 align-middle text-center">
                                    <div className="flex justify-center">
                                        <span className="bar bar-pill" />
                                    </div>
                                </td>
                                <td className="py-3.5 px-4 align-middle text-right pr-6">
                                    <div className="flex justify-end gap-1.5">
                                        <span className="bar bar-box" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
