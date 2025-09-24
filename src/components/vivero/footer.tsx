export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto flex h-24 items-center justify-center px-4 md:px-6">
        <p className="text-center font-body text-sm">
          &copy; {new Date().getFullYear()} Vivero Del Sol Digital. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
