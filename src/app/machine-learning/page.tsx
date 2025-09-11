"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { Brain, ArrowLeft, Archive, Calendar } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MachineLearningPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
      {/* Back Button at top */}
      <Button 
        onClick={handleBack}
        variant="outline"
        className="absolute top-4 left-4 z-[9999] group flex items-center space-x-2 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]"
        size="sm"
        style={{ pointerEvents: 'auto' }}
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
        <span>Назад</span>
      </Button>
      
      {/* Main content */}
      <div className="flex flex-col items-center min-h-screen px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="text-center">
          <div className="flex flex-col items-center justify-center mb-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Машинное обучение
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Алгоритмы и методы машинного обучения
          </p>
          
          {/* Course Options */}
          <div className="max-w-md mx-auto space-y-3">
            {/* Sprint September 2025 */}
            <Button 
              onClick={() => router.push('/machine-learning/sprint-september')}
              variant="outline"
              className="group w-full h-auto p-4 flex items-start justify-start space-x-4 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98] pointer-events-auto"
              size="lg"
            >
              <Calendar className="h-5 w-5 text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300 mt-0.5" />
              <div className="flex flex-col items-start group-hover:translate-x-1 transition-transform duration-300">
                <div className="text-base font-medium">Спринт сентябрь 2025</div>
                <div className="text-sm text-gray-400 mt-1">Актуальный курс машинного обучения</div>
              </div>
            </Button>
            
            {/* Archive */}
            <Button 
              onClick={() => router.push('/machine-learning/archive')}
              variant="outline"
              className="group w-full h-auto p-4 flex items-start justify-start space-x-4 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98] pointer-events-auto"
              size="lg"
            >
              <Archive className="h-5 w-5 text-white flex-shrink-0 group-hover:rotate-12 transition-transform duration-300 mt-0.5" />
              <div className="flex flex-col items-start group-hover:translate-x-1 transition-transform duration-300">
                <div className="text-base font-medium">Архив</div>
                <div className="text-sm text-gray-400 mt-1">Все предыдущие уроки и материалы</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </BeamsBackground>
  );
}