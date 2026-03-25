import Link from 'next/link'
import { Heart } from 'lucide-react'

const footerLinks = {
  product: [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Charities', href: '/charities' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-bauhaus-black text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-bauhaus-red rounded-full" />
                <div className="w-3 h-3 bg-bauhaus-blue rounded-full" />
                <div className="w-3 h-3 bg-bauhaus-yellow rounded-full" />
              </div>
              <span className="font-display font-bold text-lg">GolfDraw</span>
            </Link>
            <p className="text-bauhaus-gray text-sm mb-4">
              Play. Win. Give Back. Your golf scores could change lives.
            </p>
            <div className="flex items-center gap-2 text-sm text-bauhaus-gray">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-bauhaus-red fill-bauhaus-red" />
              <span>for charity</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-bauhaus-gray hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-bauhaus-gray hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-bauhaus-gray hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-bauhaus-gray">
              © {new Date().getFullYear()} GolfDraw. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-bauhaus-gray">
                50% of subscriptions go to prize pool
              </span>
              <span className="text-bauhaus-gray">•</span>
              <span className="text-sm text-bauhaus-gray">
                10%+ goes to charity
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
