import { listTodos } from "@/lib/store";
import { RowDelete } from "./row-delete";
import { RowSelect } from "./row-select";
import { RowShell } from "./row-shell";
import { StatusToggle } from "./status-toggle";
import { RowText } from "./row-text";
import { SelectAll } from "./select-all";

/**
 * Server Component. Fetches, sorts and renders every row's markup.
 * Renders the rounded white card table container and the tasks total footer
 * matching design/screen.png.
 */
export async function TodoTable() {
    const todos = await listTodos();
    const ids = todos.map((t) => t.id);
    const completedCount = todos.filter((t) => t.completed).length;

    if (todos.length === 0) {
        return (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
                <p className="text-slate-500 text-sm">No tasks in your list yet. Add your first todo above.</p>
            </div>
        );
    }

    return (
        <div>
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" data-purpose="todo-list-table">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-white text-[13px] font-medium text-slate-500">
                                <th scope="col" className="w-12 px-4 py-3 text-center">
                                    <div className="flex items-center justify-center">
                                        <SelectAll ids={ids} />
                                    </div>
                                </th>
                                <th scope="col" className="py-3 px-3 font-medium text-slate-700">
                                    Todo
                                </th>
                                <th scope="col" className="py-3 px-4 w-32 font-medium text-slate-700 text-center">
                                    Status
                                </th>
                                <th scope="col" className="py-3 px-4 w-24 font-medium text-slate-700 text-right pr-6">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {todos.map((todo) => (
                                <RowShell key={todo.id} id={todo.id} completed={todo.completed}>
                                    <td className="px-4 py-3.5 text-center align-middle">
                                        <div className="flex items-center justify-center">
                                            <RowSelect id={todo.id} label={todo.todo} />
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-3 align-middle">
                                        <RowText id={todo.id} text={todo.todo} completed={todo.completed} />
                                    </td>
                                    <td className="py-3.5 px-4 align-middle text-center">
                                        <StatusToggle id={todo.id} completed={todo.completed} label={todo.todo} />
                                    </td>
                                    <td className="py-3.5 px-4 align-middle text-right pr-6">
                                        <div className="inline-flex items-center justify-end gap-1.5">
                                            <RowDelete id={todo.id} label={todo.todo} />
                                        </div>
                                    </td>
                                </RowShell>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <footer className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 px-2 gap-2" data-purpose="app-footer">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-500">{todos.length} tasks total</span>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {completedCount} completed
                    </span>
                </div>
                <div>
                    <span>Click checkbox to select or manage bulk state</span>
                </div>
            </footer>
        </div>
    );
}