import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

/**
 * Server Component loading skeleton for /todos/[id].
 * Prevents layout shift and provides shimmer feedback during streaming and cold starts.
 */
export default function TodoLoading() {
    return (
        <main className="page" aria-busy="true" aria-label="Loading todo details">
            <div className="detail-view">
                <nav className="detail-nav">
                    <Link href="/" className="back-link">
                        <ArrowLeftIcon aria-hidden />
                        Back to todos
                    </Link>
                </nav>

                <article className="detail-card skeleton" aria-hidden="true">
                    <header className="detail-card-header">
                        <div className="detail-badges">
                            <span className="bar bar-pill" style={{ width: "3.2rem" }} />
                            <span className="bar bar-pill" />
                        </div>
                        <span className="bar bar-btn" />
                    </header>

                    <div className="detail-card-body">
                        <div className="detail-title-row">
                            <span className="bar bar-title" />
                            <span className="bar bar-box" />
                        </div>
                    </div>

                    <footer className="detail-card-footer">
                        <dl className="detail-meta-grid">
                            <div>
                                <dt>Todo ID</dt>
                                <dd>
                                    <span className="bar" style={{ width: "2.5rem" }} />
                                </dd>
                            </div>
                            <div>
                                <dt>Status</dt>
                                <dd>
                                    <span className="bar" style={{ width: "4rem" }} />
                                </dd>
                            </div>
                            <div>
                                <dt>Assigned User</dt>
                                <dd>
                                    <span className="bar" style={{ width: "4.5rem" }} />
                                </dd>
                            </div>
                        </dl>
                    </footer>
                </article>
            </div>
        </main>
    );
}
