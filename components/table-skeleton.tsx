/** Server Component. Column widths match the real table so nothing shifts. */
export function TableSkeleton() {
    return (
        <table className="table skeleton" aria-hidden>
            <thead>
                <tr>
                    <th className="col-select" />
                    <th>Todo</th>
                    <th className="col-status">Status</th>
                    <th className="col-actions" />
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: 6 }, (_, i) => (
                    <tr key={i}>
                        <td className="col-select">
                            <span className="bar bar-box" />
                        </td>
                        <td>
                            <span className="bar" style={{ width: `${45 + ((i * 13) % 40)}%` }} />
                        </td>
                        <td className="col-status">
                            <span className="bar bar-pill" />
                        </td>
                        <td className="col-actions">
                            <span className="bar bar-box" />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
