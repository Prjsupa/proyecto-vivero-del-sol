import Image from "next/image";
import { Header } from "@/components/vivero/header";
import { Footer } from "@/components/vivero/footer";
import { PlantCatalog } from "@/components/vivero/plant-catalog";
import { ImageGallery } from "@/components/vivero/image-gallery";
import { ExpertChat } from "@/components/vivero/expert-chat";
import { ContactForm } from "@/components/vivero/contact-form";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/definitions";

async function getPlantProducts(): Promise<Product[]> {
  const supabase = createClient();
  const plantCategories = ['Planta de interior', 'Planta de exterior', 'Planta frutal', 'Planta ornamental', 'Suculenta'];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('category', plantCategories)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching plant products:', error);
    return [];
  }

  return data;
}


export default async function Home() {
  const plants = await getPlantProducts();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section
          id="home"
          className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white"
        >
          <Image
            src="https://picsum.photos/1920/1080"
            alt="Lush garden"
            data-ai-hint="lush garden"
            fill
            className="object-cover -z-10"
            priority
          />
          <div className="absolute inset-0 bg-black/50 -z-10" />
          <div className="container px-4 md:px-6 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline tracking-wider text-shadow-lg">
              Vivero Del Sol Digital
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl font-body">
              Your digital gateway to the world of plants. Find your perfect green companion.
            </p>
            <a href="#catalog">
              <Button size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg">
                Explore Plants
              </Button>
            </a>
          </div>
        </section>

        <section id="catalog" className="py-16 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">Our Plant Catalog</h2>
            <PlantCatalog products={plants} />
          </div>
        </section>

        <section id="gallery" className="py-16 md:py-24 bg-background">
           <div className="container px-4 md:px-6">
             <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">Inspiration Gallery</h2>
             <ImageGallery />
           </div>
        </section>
        
        <section id="contact" className="py-16 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-headline mb-4">Expert Advice</h2>
                <p className="text-muted-foreground mb-8">Have a question? Chat with our virtual assistant for quick tips or send us a message for more detailed help from our plant experts.</p>
                <ExpertChat />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-headline mb-4">Contact Us</h2>
                 <p className="text-muted-foreground mb-8">For inquiries or special requests, please fill out the form below.</p>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
