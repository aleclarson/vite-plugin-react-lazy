# vite-plugin-react-lazy

Dynamic imports (powered by React Suspense) for components and hooks.

## Get Started

1. Add the plugin to your Vite config:

```ts
import reactLazy from 'vite-plugin-react-lazy'

// In the "plugins" array
reactLazy({
  // Define which directories have identical filenames and exports.
  providers: {
    mobile: 'src/mobile',
    desktop: 'src/desktop',
  },
  // Define which module exports a `useModuleProvider` hook.
  resolver: 'src/useModuleProvider.js',
})
```

2. Create the resolver module:

```ts
import { useMediaQuery } from 'react-responsive'

// React hook that returns the directory name to be imported from.
export const useModuleProvider = () => {
  return useMediaQuery({ maxWidth: 990 }) ? 'mobile' : 'desktop'
}
```

3. Import from either provider in your components:

```ts
import React from 'react'
import { Header } from './mobile/Header'

const App = () => {
  return (
    <Header />
  )
}
```

4. Render `<Suspense>` providers around the dynamic elements:

```ts
import React, { Suspense } from 'react'
import { Header } from './mobile/Header'

const App = () => {
  return (
    <Suspense>
      <Header />
    </Suspense>
  )
}
```

5. All done! Now your app will dynamically load the modules it needs based on
   the return value of your `useModuleProvider` hook.
