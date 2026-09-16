import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { DetailDelete } from "@/components/detail-delete";
import { DetailTitle } from "@/components/detail-title";
import { StatusToggle } from "@/components/status-toggle";
import { getTodo } from "@/lib/store";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) {
        return { title: "Todo Not Found" };
    }

    const todo = await getTodo(numId);
    if (!todo) {
        return { title: "Todo Not Found" };
    }

    return {
        title: `${todo.todo} | Todos`,
        description: `Details and management for todo #${todo.id}`,
    };
}

/**
 * Server Component. Renders page layout, card chrome, and metadata on the server.
 * Only the interactive elements (title editor, status toggle, delete) are client leaves.
 */
export default async function TodoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const numId = Number(id);

    if (Number.isNaN(numId)) {
        notFound();
    }

    const todo = await getTodo(numId);
    if (!todo) {
        notFound();
    }

    return (
        <main className="page">
            <div className="detail-view">
                <nav className="detail-nav">
                    <Link href="/" className="back-link">
                        <ArrowLeftIcon aria-hidden />
                        Back to todos
                    </Link>
                </nav>

                <article className="detail-card">
                    <header className="detail-card-header">
                        <div className="detail-badges">
                            <span className="badge-id">#{todo.id}</span>
                            <StatusToggle
                                id={todo.id}
                                completed={todo.completed}
                                label={todo.todo}
                            />
                        </div>
                        <DetailDelete id={todo.id} label={todo.todo} />
                    </header>

                    <div className="detail-card-body">
                        <DetailTitle
                            id={todo.id}
                            text={todo.todo}
                            completed={todo.completed}
                        />
                    </div>

                    <footer className="detail-card-footer">
                        <dl className="detail-meta-grid">
                            <div>
                                <dt>Todo ID</dt>
                                <dd>#{todo.id}</dd>
                            </div>
                            <div>
                                <dt>Status</dt>
                                <dd>{todo.completed ? "Completed" : "Open"}</dd>
                            </div>
                            <div>
                                <dt>Assigned User</dt>
                                <dd>User #{todo.userId}</dd>
                            </div>
                        </dl>
                    </footer>
                </article>
            </div>
        </main>
    );
}
