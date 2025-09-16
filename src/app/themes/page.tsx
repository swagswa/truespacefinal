'use client';

import { BeamsBackground } from "@/components/ui/beams-background";
import ThemesList from "@/components/ThemesList";
import BackendStatus from "@/components/BackendStatus";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ThemesPage() {
  const router = useRouter();

  return (
    <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
      <div className="relative z-10 min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <h1 className="text-3xl font-bold text-white">
                Образовательные темы
              </h1>
            </div>
            
            <BackendStatus />
          </div>

          {/* Themes List */}
          <ThemesList />
        </div>
      </div>
    </BeamsBackground>
  );
}