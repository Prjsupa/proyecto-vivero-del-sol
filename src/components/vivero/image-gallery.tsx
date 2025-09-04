'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const galleryImages = [
  { src: 'https://picsum.photos/800/600?random=11', alt: 'Beautifully arranged potted plants', hint: 'potted plants' },
  { src: 'https://picsum.photos/800/600?random=12', alt: 'A modern landscaping project', hint: 'landscaping' },
  { src: 'https://picsum.photos/800/600?random=13', alt: 'A lush green vertical garden', hint: 'vertical garden' },
  { src: 'https://picsum.photos/800/600?random=14', alt: 'Sunlight filtering through large leaves', hint: 'plant sunlight' },
  { src: 'https://picsum.photos/800/600?random=15', alt: 'A serene garden pathway', hint: 'garden path' },
];

export function ImageGallery() {
  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full max-w-5xl mx-auto"
    >
      <CarouselContent>
        {galleryImages.map((image, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card className="overflow-hidden">
                <CardContent className="flex aspect-square items-center justify-center p-0">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    data-ai-hint={image.hint}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="ml-14" />
      <CarouselNext className="mr-14" />
    </Carousel>
  );
}
