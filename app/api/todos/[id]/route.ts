import { NextResponse } from "next/server";
import { LOCAL_ID_BASE, MAX_TODO_LENGTH } from "@/lib/types";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  if (typeof body.todo === "string" && body.todo.length > MAX_TODO_LENGTH) {
    return NextResponse.json(
      { error: `Todo text must be ${MAX_TODO_LENGTH} characters or less` },
      { status: 400 }
    );
  }
  if (Number(id) >= LOCAL_ID_BASE) {
    return NextResponse.json({
      id: Number(id),
      todo: typeof body.todo === "string" ? body.todo : "",
      completed: typeof body.completed === "boolean" ? body.completed : false,
    });
  }
  const res = await fetch(`https://dummyjson.com/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (Number(id) >= LOCAL_ID_BASE) {
    return NextResponse.json({ id: Number(id), isDeleted: true });
  }
  const res = await fetch(`https://dummyjson.com/todos/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  return NextResponse.json(data);
}