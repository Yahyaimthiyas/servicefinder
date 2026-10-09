import React from "react"
import { Link as RouterLink } from "react-router-dom"

export function Link({ href, to, ...props }) {
  // Map href to to for react-router-dom compatibility
  return <RouterLink to={to || href || "#"} {...props} />
}

export default Link
