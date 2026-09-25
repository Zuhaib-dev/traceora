import { useState } from 'react'
import { useComponentTrace, useTrace, useTraceora, TraceoraDevtools } from '@traceora/react'
import './App.css'

function App() {
  // Automatically trace Mount, Render, and Unmount
  useComponentTrace("App");
  
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
            trace.emit({ type: "STATE_CHANGE", source: "setCount", metadata: { from: count, to: count + 1 } });
            
            setCount((c) => c + 1);
            
            // Simulate a real network request grouped in the same trace!
            // The global fetch has been instrumented by Traceora.
            fetch("https://jsonplaceholder.typicode.com/todos/1")
              .then(res => res.json())
              .then(data => {
                // Log when we finally process the data
                trace.emit({ type: "STATE_CHANGE", source: "Process Data", metadata: { data } });
              });
          }}
        >
          Count is {count}
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
