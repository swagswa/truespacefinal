"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { Code, Brain, Palette, BarChart3, Shield, Rocket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex flex-col items-center justify-center mb-3 mt-8">
            <Image 
              src="/logo.svg" 
              alt="TrueSpace Logo" 
              width={80} 
              height={80}
              className="filter brightness-0 invert mb-4"
            />
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              TrueSpace
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Образовательная Платформа
          </p>
          
          {/* Lesson Topics */}
          <div className="mt-10 w-full">
            <h2 className="text-xl font-medium text-white/90 mb-8 text-center">
              Выберите направление обучения
            </h2>
            
            <div className="max-w-md mx-auto space-y-3">
               {/* AI Coding */}
               <Button 
                 variant="outline"
                 className="group w-full h-auto p-4 flex items-start justify-start space-x-4 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]"
                 size="lg"
               >
                 <Code className="h-5 w-5 text-white flex-shrink-0 group-hover:rotate-12 transition-transform duration-300 mt-0.5" />
                 <div className="flex flex-col items-start group-hover:translate-x-1 transition-transform duration-300">
                   <div className="text-base font-medium">ИИ Кодинг</div>
                   <div className="text-sm text-gray-400 mt-1">Программирование с помощью ИИ</div>
                 </div>
               </Button>
               
               {/* AI Assistants */}
               <Button 
                 variant="outline"
                 className="group w-full h-auto p-4 flex items-start justify-start space-x-4 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]"
                 size="lg"
               >
                 <Brain className="h-5 w-5 text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300 mt-0.5" />
                 <div className="flex flex-col items-start group-hover:translate-x-1 transition-transform duration-300">
                   <div className="text-base font-medium">ИИ Ассистенты</div>
                   <div className="text-sm text-gray-400 mt-1">ChatGPT, Claude и другие помощники</div>
                 </div>
               </Button>
               
               {/* Generative AI */}
               <Button 
                 variant="outline"
                 className="group w-full h-auto p-4 flex items-start justify-start space-x-4 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]"
                 size="lg"
               >
                 <Palette className="h-5 w-5 text-white flex-shrink-0 group-hover:-rotate-12 transition-transform duration-300 mt-0.5" />
                 <div className="flex flex-col items-start group-hover:translate-x-1 transition-transform duration-300">
                   <div className="text-base font-medium">Генеративный ИИ</div>
                   <div className="text-sm text-gray-400 mt-1">Создание контента с помощью ИИ</div>
                 </div>
               </Button>
               
               {/* Machine Learning */}
               <Button 
                 variant="outline"
                 className="group w-full h-auto p-4 flex items-start justify-start space-x-4 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]"
                 size="lg"
               >
                 <BarChart3 className="h-5 w-5 text-white flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 mt-0.5" />
                 <div className="flex flex-col items-start group-hover:translate-x-1 transition-transform duration-300">
                   <div className="text-base font-medium">Машинное обучение</div>
                   <div className="text-sm text-gray-400 mt-1">Основы ML и нейронных сетей</div>
                 </div>
               </Button>
               
               {/* AI Ethics */}
               <Button 
                 variant="outline"
                 className="group w-full h-auto p-4 flex items-start justify-start space-x-4 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]"
                 size="lg"
               >
                 <Shield className="h-5 w-5 text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300 mt-0.5" />
                 <div className="flex flex-col items-start group-hover:translate-x-1 transition-transform duration-300">
                   <div className="text-base font-medium">Этика ИИ</div>
                   <div className="text-sm text-gray-400 mt-1">Безопасность и ответственность</div>
                 </div>
               </Button>
               
               {/* Future Tech */}
               <Button 
                 variant="outline"
                 className="group w-full h-auto p-4 flex items-start justify-start space-x-4 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]"
                 size="lg"
               >
                 <Rocket className="h-5 w-5 text-white flex-shrink-0 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300 mt-0.5" />
                 <div className="flex flex-col items-start group-hover:translate-x-1 transition-transform duration-300">
                   <div className="text-base font-medium">Будущее ИИ</div>
                   <div className="text-sm text-gray-400 mt-1">Тренды и перспективы развития</div>
                 </div>
               </Button>
             </div>
          </div>
        </div>
      </div>
    </BeamsBackground>
  );
}
