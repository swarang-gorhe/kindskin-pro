import { fetchAdminProducts, fetchDashboardSummary, fetchAdminOrders } from "@/lib/admin-server/data";
import {
  updateProduct,
  adjustProductStock,
  deactivateProduct,
} from "@/lib/admin-server/products";
import {
  listDiscounts,
  createDiscount,
  updateDiscount,
} from "@/lib/admin-server/discounts";
import { getServiceSupabase } from "@/lib/admin-server/auth";

export type AssistantToolResult = {
  tool: string;
  success: boolean;
  summary: string;
  data?: unknown;
};

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "list_products",
      description: "List all products with stock, price, and status",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_dashboard",
      description: "Get dashboard summary: orders, revenue, low stock",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_orders",
      description: "List recent orders, optionally filtered by status",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description: "Filter: pending, confirmed, processing, shipped, delivered, cancelled",
          },
          limit: { type: "number", description: "Max orders to return (default 10)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_product",
      description: "Add a new product to the catalog",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          slug: { type: "string" },
          price: { type: "number" },
          category: { type: "string" },
          tagline: { type: "string" },
          description: { type: "string" },
          image: { type: "string" },
          stock_quantity: { type: "number" },
        },
        required: ["name", "price"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_product",
      description: "Update an existing product by slug or name",
      parameters: {
        type: "object",
        properties: {
          slug_or_id: { type: "string", description: "Product slug or ID" },
          name: { type: "string" },
          price: { type: "number" },
          tagline: { type: "string" },
          description: { type: "string" },
          image: { type: "string" },
          images: { type: "array", items: { type: "string" } },
          stock_quantity: { type: "number" },
          is_active: { type: "boolean" },
        },
        required: ["slug_or_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "adjust_stock",
      description: "Increase or decrease product stock",
      parameters: {
        type: "object",
        properties: {
          slug_or_id: { type: "string" },
          change_amount: {
            type: "number",
            description: "Positive to add, negative to remove",
          },
          note: { type: "string" },
        },
        required: ["slug_or_id", "change_amount"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_discount",
      description: "Create a discount / coupon code",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string" },
          name: { type: "string" },
          discount_type: { type: "string", enum: ["percentage", "fixed"] },
          value: { type: "number" },
          min_order_amount: { type: "number" },
          max_uses: { type: "number" },
        },
        required: ["code", "name", "value"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_discounts",
      description: "List all discount codes",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

async function resolveProductId(slugOrName: string): Promise<string | null> {
  const { products } = await fetchAdminProducts();
  const q = slugOrName.toLowerCase();
  const match = products.find(
    (p) =>
      p.slug.toLowerCase() === q ||
      p.id.toLowerCase() === q ||
      p.name.toLowerCase().includes(q)
  );
  return match?.id ?? match?.slug ?? null;
}

export async function executeAssistantTool(
  name: string,
  args: Record<string, unknown>
): Promise<AssistantToolResult> {
  try {
    switch (name) {
      case "list_products": {
        const { products, source } = await fetchAdminProducts();
        return {
          tool: name,
          success: true,
          summary: `Found ${products.length} products (${source})`,
          data: products.map((p) => ({
            slug: p.slug,
            name: p.name,
            price: p.price,
            stock: p.stock_quantity,
            active: p.is_active,
            category: p.category,
          })),
        };
      }
      case "get_dashboard": {
        const data = await fetchDashboardSummary();
        return {
          tool: name,
          success: true,
          summary: `Dashboard: ${data.orders_today} orders today, ${data.low_stock_count} low stock`,
          data,
        };
      }
      case "list_orders": {
        const res = await fetchAdminOrders({
          status: args.status ? String(args.status) : null,
          limit: Number(args.limit ?? 10),
        });
        return {
          tool: name,
          success: true,
          summary: `Found ${res.orders.length} orders`,
          data: res.orders,
        };
      }
      case "create_product": {
        const service = getServiceSupabase();
        if (!service) {
          return {
            tool: name,
            success: false,
            summary: "Database not configured — add SUPABASE_SERVICE_KEY on Vercel",
          };
        }
        const slug = String(args.slug ?? args.name ?? "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
        const product = await updateProduct(slug, {
          slug,
          name: args.name,
          price: args.price,
          category: args.category ?? "General",
          tagline: args.tagline ?? "",
          description: args.description ?? "",
          image: args.image ?? "",
          stock_quantity: args.stock_quantity ?? 0,
          images: args.image ? [String(args.image)] : [],
          benefits: [],
        });
        return {
          tool: name,
          success: true,
          summary: `Created product "${product.name}" (₹${product.price})`,
          data: product,
        };
      }
      case "update_product": {
        const id = await resolveProductId(String(args.slug_or_id));
        if (!id) {
          return { tool: name, success: false, summary: "Product not found" };
        }
        const { slug_or_id: _, ...updates } = args;
        const product = await updateProduct(id, updates);
        return {
          tool: name,
          success: true,
          summary: `Updated "${product.name}"`,
          data: product,
        };
      }
      case "adjust_stock": {
        const id = await resolveProductId(String(args.slug_or_id));
        if (!id) {
          return { tool: name, success: false, summary: "Product not found" };
        }
        const product = await adjustProductStock(
          id,
          Number(args.change_amount),
          String(args.note ?? "AI assistant adjustment")
        );
        return {
          tool: name,
          success: true,
          summary: `Stock for "${product.name}" is now ${product.stock_quantity}`,
          data: { name: product.name, stock: product.stock_quantity },
        };
      }
      case "create_discount": {
        const discount = await createDiscount({
          code: args.code,
          name: args.name,
          discount_type: args.discount_type ?? "percentage",
          value: args.value,
          min_order_amount: args.min_order_amount ?? 0,
          max_uses: args.max_uses ?? null,
          is_active: true,
        });
        return {
          tool: name,
          success: true,
          summary: `Created coupon ${discount.code} (${discount.discount_type === "percentage" ? discount.value + "%" : "₹" + discount.value})`,
          data: discount,
        };
      }
      case "list_discounts": {
        const { discounts, table_ready } = await listDiscounts();
        return {
          tool: name,
          success: true,
          summary: table_ready
            ? `Found ${discounts.length} discount codes`
            : "Discounts table not set up — run migration 005",
          data: discounts,
        };
      }
      default:
        return { tool: name, success: false, summary: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return {
      tool: name,
      success: false,
      summary: err instanceof Error ? err.message : "Tool execution failed",
    };
  }
}

const SYSTEM_PROMPT = `You are Jarvis — the professional AI admin assistant for KindSkin Co.

You help admins manage:
- Products (list, create, update, stock adjustments)
- Orders (check status, recent orders)
- Discounts / coupon codes
- Dashboard metrics

Be concise, professional, and action-oriented. When the user asks you to do something, use the available tools to execute it, then summarize what you did.

Currency is INR (₹). The storefront sells natural skincare: Aloe Vera Gel, Lip Balm, Abhyang Tel.

If database is not configured, explain they need SUPABASE_SERVICE_KEY on Vercel and SQL migrations applied.`;

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  name?: string;
};

async function callOpenAI(messages: ChatMessage[]) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      temperature: 0.4,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err.slice(0, 200)}`);
  }

  return res.json();
}

function fallbackResponse(
  userMessage: string,
  toolResults: AssistantToolResult[]
): string {
  if (toolResults.length > 0) {
    return toolResults.map((r) => `**${r.tool}:** ${r.summary}`).join("\n\n");
  }

  const lower = userMessage.toLowerCase();

  if (lower.includes("product") || lower.includes("stock")) {
    return "I can help with products. Try:\n\n- *\"List all products\"*\n- *\"Add 10 stock to aloe vera gel\"*\n- *\"Update lip balm price to 60\"*\n\nFor full AI capabilities, add `OPENAI_API_KEY` to Vercel.";
  }
  if (lower.includes("order")) {
    return "Ask me *\"Show recent orders\"* or *\"List pending orders\"* to check order status.";
  }
  if (lower.includes("discount") || lower.includes("coupon")) {
    return "Ask me *\"Create a 15% off coupon named SUMMER15\"* or *\"List all discounts\"*.";
  }
  if (lower.includes("dashboard") || lower.includes("revenue")) {
    return "Ask *\"Show dashboard summary\"* for orders, revenue, and low-stock alerts.";
  }

  return `I'm **Jarvis**, your KindSkin admin assistant. I can help with:

- **Products** — add, edit, adjust stock
- **Orders** — check status and recent orders  
- **Discounts** — create and manage coupon codes
- **Dashboard** — revenue and low-stock overview

What would you like to do?`;
}

function detectIntentTools(message: string): { name: string; args: Record<string, unknown> }[] {
  const lower = message.toLowerCase();
  const tools: { name: string; args: Record<string, unknown> }[] = [];

  if (
    lower.includes("list product") ||
    lower.includes("show product") ||
    lower.includes("all product") ||
    lower.includes("what product")
  ) {
    tools.push({ name: "list_products", args: {} });
  }
  if (lower.includes("dashboard") || lower.includes("revenue") || lower.includes("summary")) {
    tools.push({ name: "get_dashboard", args: {} });
  }
  if (lower.includes("order")) {
    const statusMatch = lower.match(
      /(pending|confirmed|processing|shipped|delivered|cancelled)/
    );
    tools.push({
      name: "list_orders",
      args: { status: statusMatch?.[1], limit: 10 },
    });
  }
  if (lower.includes("discount") || lower.includes("coupon")) {
    if (lower.includes("create") || lower.includes("generate") || lower.includes("make")) {
      const codeMatch = message.match(/\b([A-Z][A-Z0-9]{3,})\b/);
      const pctMatch = lower.match(/(\d+)\s*%/);
      tools.push({
        name: "create_discount",
        args: {
          code: codeMatch?.[1] ?? "SAVE10",
          name: "AI Generated Discount",
          discount_type: "percentage",
          value: pctMatch ? Number(pctMatch[1]) : 10,
        },
      });
    } else {
      tools.push({ name: "list_discounts", args: {} });
    }
  }
  if (lower.includes("stock") || lower.includes("restock")) {
    const amountMatch = lower.match(/(\+|-)?\s*(\d+)/);
    const slugMatch = lower.match(
      /(aloe|lip.?balm|abhyang|tel|vera|gel)/
    );
    let slug = "aloe-vera-gel";
    if (slugMatch) {
      if (slugMatch[0].includes("lip")) slug = "lip-balm";
      else if (slugMatch[0].includes("abhyang") || slugMatch[0].includes("tel"))
        slug = "abhyang-tel";
    }
    tools.push({
      name: "adjust_stock",
      args: {
        slug_or_id: slug,
        change_amount: amountMatch ? Number(amountMatch[2]) : 10,
        note: "AI assistant restock",
      },
    });
  }

  return tools;
}

export async function runAdminAssistant(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<{ reply: string; actions: AssistantToolResult[] }> {
  const actions: AssistantToolResult[] = [];

  try {
    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-6).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    const completion = await callOpenAI(messages);

    if (completion) {
      const choice = completion.choices?.[0]?.message;

      if (choice?.tool_calls?.length) {
        const toolMessages: Record<string, unknown>[] = [
          ...messages,
          {
            role: "assistant",
            content: choice.content ?? null,
            tool_calls: choice.tool_calls,
          },
        ];

        for (const tc of choice.tool_calls) {
          const fn = tc.function;
          const args = JSON.parse(fn.arguments || "{}");
          const result = await executeAssistantTool(fn.name, args);
          actions.push(result);
          toolMessages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          });
        }

        const followUp = await callOpenAI(
          toolMessages as unknown as ChatMessage[]
        );
        const reply =
          followUp?.choices?.[0]?.message?.content ??
          actions.map((a) => a.summary).join("\n");
        return { reply, actions };
      }

      if (choice?.content) {
        return { reply: choice.content, actions };
      }
    }
  } catch {
    // fall through to intent detection
  }

  const intentTools = detectIntentTools(userMessage);
  for (const t of intentTools) {
    const result = await executeAssistantTool(t.name, t.args);
    actions.push(result);
  }

  return {
    reply: fallbackResponse(userMessage, actions),
    actions,
  };
}
