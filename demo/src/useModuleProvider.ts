import { useMediaQuery } from 'react-responsive'

// React hook that returns the directory name to be imported from.
export const useModuleProvider = () => {
  return useMediaQuery({ maxWidth: 990 }) ? 'mobile' : 'desktop'
}
