import { listTodos } from "@/lib/store";
import { RowDelete } from "./row-delete";
import { RowSelect } from "./row-select";
import { RowShell } from "./row-shell";
import { StatusToggle } from "./status-toggle";
import { RowText } from "./row-text";
import { SelectAll } from "./select-all";

/**
 * Server Component. Fetches, sorts and renders every row's markup.
 * Nothing in this file ships to the browser — the only JS on the page comes
 * from the small leaves it composes in. BulkBar now lives in page.tsx,
 * sticky alongside TodoForm, so it isn't rendered here.
 */
export async function TodoTable() {
    const todos = await listTodos();
    const ids = todos.map((t) => t.id);
    const open = todos.filter((t) => !t.completed).length;

    if (todos.length === 0) {
        return (
            <div className="empty">
                <p>Nothing here yet. Add your first todo above.</p>
            </div>
        );
    }

    return (
        <table className="table">
            <caption className="caption">
                {todos.length} todos, {open} still open
            </caption>
            <thead>
                <tr>
                    <th scope="col" className="col-select">
                        <SelectAll ids={ids} />
                    </th>
                    <th scope="col">Todo</th>
                    <th scope="col" className="col-status">
                        Status
                    </th>
                    <th scope="col" className="col-actions">
                        <span className="sr-only">Actions</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                {todos.map((todo) => (
                    <RowShell key={todo.id} id={todo.id} completed={todo.completed}>
                        <td className="col-select">
                            <RowSelect id={todo.id} label={todo.todo} />
                        </td>
                        <td>
                            <RowText id={todo.id} text={todo.todo} completed={todo.completed} />
                        </td>
                        <td className="col-status">
                            <StatusToggle id={todo.id} completed={todo.completed} label={todo.todo} />
                        </td>
                        <td className="col-actions">
                            <RowDelete id={todo.id} label={todo.todo} />
                        </td>
                    </RowShell>
                ))}
            </tbody>
        </table>
    );
}