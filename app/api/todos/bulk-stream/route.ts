import { LOCAL_ID_BASE } from "@/lib/types";

export async function POST(req: Request) {
  const { ids, action } = (await req.json()) as {
    ids: number[];
    action: "delete" | "complete" | "incomplete";
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (const id of ids) {
        let ok = true;
        if (id < LOCAL_ID_BASE) {
          try {
            const url = `https://dummyjson.com/todos/${id}`;
            await fetch(url, {
              method: action === "delete" ? "DELETE" : "PUT",
              headers: { "Content-Type": "application/json" },
              body:
                action === "complete" || action === "incomplete"
                  ? JSON.stringify({ completed: action === "complete" })
                  : undefined,
            });
          } catch {
            ok = false;
          }
        }
        controller.enqueue(
          encoder.encode(JSON.stringify({ id, status: ok ? "success" : "failed" }) + "\n")
        );
        await new Promise((r) => setTimeout(r, 400));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain" },
  });
}