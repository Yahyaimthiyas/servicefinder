 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, memo, useCallback } from "react"
import { Link } from "@/components/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Search, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const FastNavigation = memo(() => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    closeMenu()
  }, [logout, closeMenu])

  // Simplified navigation based on user type
  const getNavItems = () => {
    if (!user) return [
      { href: "/", label: "Home" },
      { href: "/services", label: "Services" },
    ]

    switch (user.type) {
      case "customer":
        return [
          { href: "/customer/dashboard", label: "Dashboard" },
          { href: "/services", label: "Find Services" },
          { href: "/customer/bookings", label: "Bookings" },
        ]
      case "professional":
        return [
          // No navigation items for professionals - they use the dashboard navigation
        ]
      case "admin":
        return [
          { href: "/", label: "Home" },
          { href: "/admin", label: "Admin" },
        ]
      default:
        return [{ href: "/", label: "Home" }]
    }
  }

  const navItems = getNavItems()

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl hidden sm:block">ServiceFinder</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {_optionalChain([user, 'access', _ => _.name, 'optionalAccess', _2 => _2.charAt, 'call', _3 => _3(0), 'optionalAccess', _4 => _4.toUpperCase, 'call', _5 => _5()]) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {user.type}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t py-4">
            {user && (
              <div className="flex items-center space-x-3 px-3 py-3 mb-4 bg-muted/50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {_optionalChain([user, 'access', _6 => _6.name, 'optionalAccess', _7 => _7.charAt, 'call', _8 => _8(0), 'optionalAccess', _9 => _9.toUpperCase, 'call', _10 => _10()]) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {user.type}
                  </Badge>
                </div>
              </div>
            )}

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-foreground hover:bg-accent rounded-lg"
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full text-left px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg mt-4"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex space-x-2 px-3 py-4 border-t mt-4">
                <Button variant="ghost" size="sm" asChild className="flex-1">
                  <Link href="/login" onClick={closeMenu}>Login</Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link href="/signup" onClick={closeMenu}>Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
})

FastNavigation.displayName = "FastNavigation"

export { FastNavigation as Navigation }
