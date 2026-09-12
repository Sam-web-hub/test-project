import { NextResponse } from "next/server";
import { LOCAL_ID_BASE, MAX_TODO_LENGTH } from "@/lib/types";

let nextLocalId = LOCAL_ID_BASE;

export async function GET() {
  try {
    const res = await fetch("https://dummyjson.com/todos?limit=20");
    if (!res.ok) {
      return NextResponse.json(
        { error: `DummyJSON API returned status ${res.status}` },
        { status: res.status },
      );
    }
    const data = await res.json();
    if (!data || !Array.isArray(data.todos)) {
      return NextResponse.json(
        { error: "Unexpected response shape from DummyJSON API" },
        { status: 502 },
      );
    }
    return NextResponse.json(data.todos);
  } catch (err) {
    console.error("Failed to fetch todos from DummyJSON API:", err);
    return NextResponse.json(
      { error: "Failed to fetch todos from DummyJSON API" },
      { status: 503 },
    );
  }
}

export async function POST(req: Request) {
    let body: unknown;
    try {
        body = await req.json();
    } catch (err) {
      console.error("Failed to parse JSON in request body:", err);
        return NextResponse.json(
            { error: "Invalid JSON in request body", err },
            { status: 400 }
        );
    }

    const text =
        typeof body === "object" && body !== null && "todo" in body && typeof (body as { todo: unknown }).todo === "string"
            ? (body as { todo: string }).todo.trim()
            : "";

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
    return NextResponse.json(todo, { status: 201 });
}
