import express from "express";
import cors from "cors";
import { traceora, emitTraceEvent } from "@traceora/express";

const app = express();

// 1. Enable CORS and expose the custom header so the frontend can read it!
app.use(cors({
  exposedHeaders: ["X-Traceora-Events"],
}));

app.use(express.json());

// 2. Add the Traceora middleware to intercept incoming requests
app.use(traceora());

app.get("/api/users", async (req, res) => {
  // Simulate a database query delay
  await new Promise(r => setTimeout(r, 200));

  // 3. Emit a backend event! (e.g. a mocked SQL query)
  emitTraceEvent({
    type: "STATE_CHANGE", // We can use STATE_CHANGE or a custom DB_QUERY type
    source: "MySQL",
    metadata: {
      query: "SELECT * FROM users WHERE active = 1",
      durationMs: 145,
      rowsReturned: 3
    }
  });

  // 4. Return response. Traceora will automatically inject the events into headers!
  res.json([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ]);
});

app.post("/api/checkout", async (req, res) => {
  emitTraceEvent({
    type: "NETWORK_REQUEST",
    source: "Stripe API",
    metadata: {
      endpoint: "POST /v1/charges",
      amount: req.body.amount || 0
    }
  });
  
  await new Promise(r => setTimeout(r, 300));
  
  emitTraceEvent({
    type: "ERROR",
    source: "Payment Processor",
    metadata: {
      error: "Insufficient funds in test account"
    }
  });

  res.status(400).json({ error: "Payment failed" });
});

app.listen(4000, () => {
  console.log("🚀 Express Playground running on http://localhost:4000");
});
