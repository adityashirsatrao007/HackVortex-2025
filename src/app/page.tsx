
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/header";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, MapPin, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-7xl/none text-primary">
                    Connect with Skilled Artisans, Instantly.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Karigar Kart is your trusted platform to find and book verified artisans and workers for all your home and professional needs.
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 min-[400px]:flex-row min-[400px]:items-center">
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg">
                    <Link href="/signup">Get Started</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="shadow hover:shadow-md">
                    <Link href="/dashboard">Find Artisans</Link> 
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                alt="Hero"
                data-ai-hint="artisans tools"
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-shadow"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose Karigar Kart?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We provide a seamless, secure, and reliable way to connect with local professionals.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">Verified Artisans</h3>
                </div>
                <p className="text-sm text-muted-foreground pt-1">
                  All artisans are verified for your safety and peace of mind. (Aadhaar, Selfie + GPS).
                </p>
              </div>
              <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <MapPin className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">Location-Based Search</h3>
                </div>
                <p className="text-sm text-muted-foreground pt-1">
                  Find skilled professionals near you with our easy-to-use map interface.
                </p>
              </div>
              <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                <div className="flex items-center gap-3">
                   <Star className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">Ratings & Reviews</h3>
                </div>
                <p className="text-sm text-muted-foreground pt-1">
                  Make informed decisions based on genuine customer feedback and ratings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Getting Help is Easy
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Three simple steps to connect with the right professional for your job.
              </p>
            </div>
            <div className="mx-auto w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-card/80 transition-colors">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-md">1</div>
                <h3 className="font-semibold text-lg mt-3">Search & Discover</h3>
                <p className="text-sm text-muted-foreground">Find artisans by skill and location.</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-card/80 transition-colors">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-md">2</div>
                <h3 className="font-semibold text-lg mt-3">Book & Confirm</h3>
                <p className="text-sm text-muted-foreground">Request a booking at your preferred time.</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-card/80 transition-colors">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-md">3</div>
                <h3 className="font-semibold text-lg mt-3">Rate & Review</h3>
                <p className="text-sm text-muted-foreground">Share your experience after the job is done.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Karigar Kart. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
