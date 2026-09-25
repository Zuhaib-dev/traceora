# @traceora/react

React instrumentation for Traceora. 

Traceora connects React's lifecycle, your network requests, and your unhandled errors into a single, comprehensive timeline.

## Installation

```bash
npm install @traceora/react @traceora/core
```

## Quick Start

1. Wrap your application in the Traceora Provider and Error Boundary:

```tsx
import { TraceoraProvider, TraceoraErrorBoundary, TraceoraDevtools } from "@traceora/react";

function App() {
  return (
    <TraceoraProvider>
      <TraceoraErrorBoundary>
        <YourApp />
        
        {/* Floating timeline overlay for development */}
        <TraceoraDevtools />
      </TraceoraErrorBoundary>
    </TraceoraProvider>
  );
}
```

2. Trace your components:

```tsx
import { useComponentTrace, useTrace } from "@traceora/react";

export function UserProfile() {
  // Automatically traces Mounts, Renders, and Unmounts
  useComponentTrace("UserProfile");
  
  const startTrace = useTrace();

  const handleSave = () => {
    // Links this click and any subsequent API calls to the same Trace ID
    const trace = startTrace("Save_Profile");
    
    // The native window.fetch is already instrumented!
    fetch('/api/save', { method: 'POST' }); 
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

## Author

Created by [Zuhaib Rashid](https://zuhaibrashid.com) | [GitHub: zuhaib-dev](https://github.com/zuhaib-dev/traceora)
