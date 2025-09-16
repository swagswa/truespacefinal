"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { Code, Brain, Palette, BarChart3, Shield, Rocket, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useThemes } from "@/lib/hooks/useThemes";

// Маппинг иконок
const iconMap = {
  Code: Code,
  Brain: Brain,
  Palette: Palette,
  BarChart3: BarChart3,
  Shield: Shield,
  Rocket: Rocket
};

export default function Home() {
  const router = useRouter();
  const { themes, loading, error } = useThemes();

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
              className="filter brightness-0 invert mb-4 cursor-pointer hover:scale-110 transition-transform duration-300"
              onClick={() => router.push('/admin')}
            />
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              TrueSpace
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Образовательная Платформа
          </p>
          

          
          {/* Lesson Topics */}
          <div className="mt-10 w-full">
            <h2 className="text-xl font-medium text-white/90 mb-8 text-center">
              Выберите направление обучения
            </h2>
            
            <div className="max-w-md mx-auto space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                  <span className="ml-2 text-white">Загрузка тем...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-400 mb-4">Ошибка загрузки тем: {error}</p>
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Попробовать снова
                  </Button>
                </div>
              ) : (
                themes.map((theme, index) => {
                  // Используем индекс для выбора иконки из массива
                  const iconKeys = Object.keys(iconMap);
                  const iconKey = iconKeys[index % iconKeys.length];
                  const IconComponent = iconMap[iconKey as keyof typeof iconMap] || Code;
                  
                  return (
                    <Button 
                      key={theme.id}
                      onClick={() => {
                        // Маппинг slug к соответствующим страницам
                        const routeMapping: { [key: string]: string } = {
                          'ii-assistenty': '/ai-assistants',
                          'ai-coding': '/ai-coding',
                          'generativnyj-ii': '/generative-ai',
                          'mashinnoe-obuchenie': '/machine-learning',
                          'etika-ii': '/ai-ethics',
                          'budushchee-ii': '/future-ai'
                        };
                        
                        const route = routeMapping[theme.slug] || `/themes/${theme.slug}`;
                        router.push(route);
                      }}
                      variant="outline"
                      className="group w-full h-auto p-4 flex items-start justify-start space-x-4 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]"
                      size="lg"
                    >
                      <IconComponent className="h-5 w-5 text-white flex-shrink-0 group-hover:rotate-12 transition-transform duration-300 mt-0.5" />
                      <div className="flex flex-col items-start group-hover:translate-x-1 transition-transform duration-300">
                        <div className="text-base font-medium">{theme.title}</div>
                        <div className="text-sm text-gray-400 mt-1">{theme.description}</div>
                      </div>
                    </Button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </BeamsBackground>
  );
}
