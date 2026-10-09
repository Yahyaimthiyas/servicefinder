import { useNavigate, useLocation, useParams, useSearchParams as useSearchParamsRouter } from "react-router-dom"

export function useRouter() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [searchParams] = useSearchParamsRouter()

  return {
    push: (url) => navigate(url),
    replace: (url) => navigate(url, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    pathname: location.pathname,
    query: {
      ...params,
      ...Object.fromEntries(searchParams.entries()),
    },
  }
}

export function usePathname() {
  const location = useLocation()
  return location.pathname
}

export function useSearchParams() {
  const [searchParams] = useSearchParamsRouter()
  return searchParams
}
