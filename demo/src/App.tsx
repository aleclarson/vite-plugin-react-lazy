import React, { Suspense } from 'react'

import { useAppStyle } from './mobile/App'
import { Header } from './mobile/Header'

export const App = () => {
  const style = useAppStyle()
  return (
    <div style={style}>
      <Suspense fallback={<span>Loading header...</span>}>
        <Header />
      </Suspense>
    </div>
  )
}
