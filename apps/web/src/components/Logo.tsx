import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
  to?: string
}

export function Logo({ className = '', to = '/' }: LogoProps) {
  return (
    <Link to={to} className={`flex items-center hover:opacity-90 transition-opacity select-none ${className}`}>
      <img src="/logoayePREP.png" alt="ayePREP Logo" className="h-10 w-auto object-contain" />
    </Link>
  )
}
