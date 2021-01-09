import { useRouter } from '../components'

export const useMatch = () => {
  return useRouter().match
}
