
"use client";

import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function HeroBanner() {
  const images = PlaceHolderImages.filter(img => img.id.startsWith('project-'));

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-4xl font-headline font-bold leading-tight md:text-5xl">
              건설 현장 민원을<br />쉽게 관리하세요
            </h1>
            <p className="text-lg text-blue-100 max-w-md">
              진행중 · 유보 · 완료 상태를 한눈에 확인하고,<br />
              체계적인 대응 방안과 보상 사례를 공유하여 효율적인 민원 관리를 지원합니다.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image) => (
                  <CarouselItem key={image.id}>
                    <div className="relative aspect-[2/1] overflow-hidden rounded-2xl shadow-2xl border-4 border-white/20">
                      <Image
                        src={image.imageUrl}
                        alt={image.description}
                        fill
                        className="object-cover"
                        data-ai-hint={image.imageHint}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-sm font-medium">{image.description}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute -bottom-8 right-12 flex gap-2">
                <CarouselPrevious className="relative left-0 translate-y-0 bg-white/20 text-white hover:bg-white/40 border-none" />
                <CarouselNext className="relative right-0 translate-y-0 bg-white/20 text-white hover:bg-white/40 border-none" />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-blue-400/10 blur-2xl" />
    </section>
  );
}
