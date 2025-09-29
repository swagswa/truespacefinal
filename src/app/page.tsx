"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { UserSession } from "@/components/ui/user-session";
import { Loader2, Heart, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useThemes } from "@/lib/hooks/useThemes";
import { renderIcon } from "@/lib/utils/icons";

export default function Home() {
  const router = useRouter();
  const { themes, loading, error } = useThemes();

  return (
    <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
      <UserSession />
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center">
          <div className="flex flex-col items-center justify-center mb-3">
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
          
          {/* Quick Access Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={() => router.push('/favorites')}
              variant="outline"
              className="group flex items-center space-x-3 bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all duration-300 px-6 py-3"
            >
              <Heart className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Избранные уроки</span>
            </Button>
            
            <Button 
              onClick={() => router.push('/completed')}
              variant="outline"
              className="group flex items-center space-x-3 bg-green-500/10 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 text-green-400 hover:text-green-300 transition-all duration-300 px-6 py-3"
            >
              <CheckCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Завершенные уроки</span>
            </Button>
          </div>

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
              ) : themes && themes.length > 0 ? (
                themes.map((theme) => {
                  return (
                    <Button 
                      key={theme.id}
                      onClick={() => {
                        // Используем новые динамические маршруты
                        router.push(`/topic/${theme.slug}`);
                      }}
                      variant="outline"
                      className="group w-full h-auto p-4 flex items-start justify-start space-x-4 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]"
                      size="lg"
                    >
                      {renderIcon(theme.icon || 'book', "h-5 w-5 text-white flex-shrink-0 group-hover:rotate-12 transition-transform duration-300 mt-0.5")}
                      <div className="flex flex-col items-start group-hover:translate-x-1 transition-transform duration-300">
                        <div className="text-base font-medium">{theme.title}</div>
                        <div className="text-sm text-gray-400 mt-1">{theme.description}</div>
                      </div>
                    </Button>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Темы не найдены</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BeamsBackground>
  );
}
