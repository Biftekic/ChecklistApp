import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export function Footer() {
  const footerLinks = {
    Product: [
      { name: 'Templates', href: '/templates' },
      { name: 'AI Analysis', href: '/ai-analysis' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Features', href: '/features' },
    ],
    Company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' },
    ],
    Legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
    Support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Documentation', href: '/docs' },
      { name: 'API', href: '/api' },
    ],
  };

  return (
    <footer className="border-t bg-background safe-bottom">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <span className="font-bold">ChecklistApp</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Professional service checklists made simple.
            </p>
          </div>
          
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-3 text-sm font-semibold">{category}</h3>
              <ul className="space-y-2 text-sm">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ChecklistApp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}