import Header from "@/components/shared/header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        {children}
      </main>
      <footer className="border-t">
        <div className="container py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Karigar Kart. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
