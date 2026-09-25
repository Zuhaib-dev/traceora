import { useState } from 'react'
import { useComponentTrace, useTrace, useTraceora } from '@traceora/react'
import './App.css'

function App() {
  // Automatically trace Mount, Render, and Unmount
  useComponentTrace("App");
  
  // Get access to the raw emitter for custom events
  const emitter = useTraceora();
  const startTrace = useTrace();
  
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Traceora Playground</h1>
      <p>Check your browser console or the Traceora devtools (coming soon) to see events!</p>
      
      <div style={{ margin: '2rem 0' }}>
        <button
          onClick={() => {
            // Start a trace for this interaction
            const trace = startTrace("App.CounterButton_Click", { action: "increment", currentCount: count });
            
            // Log a fake internal event inside this trace
            trace.emit({ type: "STATE_CHANGE", source: "setCount", metadata: { from: count, to: count + 1 } });
            
            setCount((c) => c + 1);
            
            // Simulate a network request grouped in the same trace
            setTimeout(() => {
              trace.emit({ type: "USER_INTERACTION", source: "API_RESPONSE_MOCK", metadata: { status: 200 } });
            }, 500);
          }}
        >
          Count is {count}
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Instructions</h3>
        <p>1. Open Developer Tools (F12)</p>
        <p>2. We haven't hooked up a console logger yet, but the <code>EventStore</code> in memory is capturing these!</p>
      </div>
    </div>
  )
}

export default App
