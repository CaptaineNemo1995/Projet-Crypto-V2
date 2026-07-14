import { createContext, useContext, useState } from 'react'

// TraceProvider exposes { traceOn, setTraceOn } via useTrace().
// When traceOn is true, pages pass trace:true to compute calls and render
// the returned trace array in a <TracePanel/>.

const TraceContext = createContext({ traceOn: false, setTraceOn: () => {} })

export function TraceProvider({ children }) {
  const [traceOn, setTraceOn] = useState(false)
  return (
    <TraceContext.Provider value={{ traceOn, setTraceOn }}>
      {children}
    </TraceContext.Provider>
  )
}

export function useTrace() {
  return useContext(TraceContext)
}
