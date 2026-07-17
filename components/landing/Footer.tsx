export default function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <img
            src="/verquo-icon.svg"
            alt="Verquo Icon"
            width={20}
            height={20}
            className="w-5 h-5 object-contain dark:hidden"
          />
          <img
            src="/verquo-icon-dark.svg"
            alt="Verquo Icon"
            width={20}
            height={20}
            className="w-5 h-5 object-contain hidden dark:block"
          />
          <span className="font-display text-sm font-medium text-foreground">Verquo</span>
        </div>
        <span>© 2026 Verquo AI. Platform for verified hiring evidence.</span>
        <div className="flex gap-4">
          <a id="footer-link-privacy" href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a id="footer-link-terms" href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a id="footer-link-contact" href="#" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
