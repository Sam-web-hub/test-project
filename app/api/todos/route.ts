import { NextResponse } from "next/server";
import { LOCAL_ID_BASE, MAX_TODO_LENGTH } from "@/lib/types";

let nextLocalId = LOCAL_ID_BASE;

export async function GET() {
    const res = await fetch("https://dummyjson.com/todos?limit=20");
    const data = await res.json();
    return NextResponse.json(data.todos);
}

export async function POST(req: Request) {
    const body = await req.json();
    const text = typeof body.todo === "string" ? body.todo.trim() : "";
    if (!text || text.length > MAX_TODO_LENGTH) {
        return NextResponse.json(
            { error: `Todo text must be 1-${MAX_TODO_LENGTH} characters` },
            { status: 400 }
        );
    }
    const todo = {
        id: nextLocalId++,
        todo: text,
        completed: false,
        userId: 1,
    };
    return NextResponse.json(todo, {status: 201});
}