export default function SiteFooter() {
    return (
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto max-w-3xl px-4">
          © {new Date().getFullYear()} InwooLeeme. All rights reserved.
        </div>
      </footer>
    )
}