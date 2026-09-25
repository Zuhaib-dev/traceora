import { useState } from 'react'
import { useTrace, TraceoraDevtools } from '@traceora/react'
import './App.css'

function App() {
  // Get access to the trace starter
  const startTrace = useTrace();
  
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Traceora Playground</h1>
      <p>Check your browser console or the Traceora devtools (coming soon) to see events!</p>
      
      <div style={{ margin: '2rem 0' }}>
        <button
          style={{ padding: '10px 20px', fontSize: '1.2rem', cursor: 'pointer' }}
          onClick={() => {
            // Start a trace for this interaction
            const trace = startTrace("App.CounterButton_Click", { action: "increment", currentCount: count });
            
            // Log a fake internal event inside this trace
            trace.emit({ type: "STATE_CHANGE", source: "setCount", metadata: { from: count, to: (count as number) + 1 } });
            
            setCount((c) => (c as number) + 1);
            
            // Simulate a real network request grouped in the same trace!
            // The global fetch has been instrumented by Traceora.
            fetch("http://localhost:4000/api/users")
              .then(res => res.json())
              .then(data => {
                // Log when we finally process the data
                trace.emit({ type: "STATE_CHANGE", source: "Process Data", metadata: { data } });
              });
          }}
        >
          Count is {(count as number).toFixed(0)}
        </button>
      </div>

      <div style={{ margin: '2rem 0', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          style={{ padding: '10px 20px', fontSize: '1rem', cursor: 'pointer', background: '#e03131', color: '#fff', border: 'none', borderRadius: '4px' }}
          onClick={() => {
            // Trigger 10 renders instantly
            for(let i=0; i<10; i++) setCount(c => c + 1);
          }}
        >
          Spam Renders
        </button>

        <button
          style={{ padding: '10px 20px', fontSize: '1rem', cursor: 'pointer', background: '#1971c2', color: '#fff', border: 'none', borderRadius: '4px' }}
          onClick={() => {
            // Fire API request that triggers backend errors
            fetch("http://localhost:4000/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: 5000 }) });
          }}
        >
          Checkout API
        </button>

        <button
          style={{ padding: '10px 20px', fontSize: '1rem', cursor: 'pointer', background: '#e8590c', color: '#fff', border: 'none', borderRadius: '4px' }}
          onClick={() => {
            // Throw an error during a click handler (caught by window.onerror)
            throw new Error("Whoops! Unhandled click error");
          }}
        >
          Throw Error
        </button>

        <button
          style={{ padding: '10px 20px', fontSize: '1rem', cursor: 'pointer', background: '#d9480f', color: '#fff', border: 'none', borderRadius: '4px' }}
          onClick={() => {
            // Force a React render crash (caught by ErrorBoundary)
            setCount("CRASH_ME" as any);
          }}
        >
          Crash React
        </button>

        <button
          style={{ padding: '10px 20px', fontSize: '1rem', cursor: 'pointer', background: '#20c997', color: '#fff', border: 'none', borderRadius: '4px' }}
          onClick={() => {
            console.warn("This is a warning! Traceora intercepts this.");
          }}
        >
          Console Warn
        </button>

        <button
          style={{ padding: '10px 20px', fontSize: '1rem', cursor: 'pointer', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '4px' }}
          onClick={() => {
            console.error("This is a console error! Traceora intercepts this.");
          }}
        >
          Console Error
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Instructions</h3>
        <p>1. Check out the floating Traceora panel in the bottom right!</p>
        <p>2. Interact with the app to see events populate in real-time.</p>
      </div>

      <TraceoraDevtools />
    </div>
  )
}

export default App
