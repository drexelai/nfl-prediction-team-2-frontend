import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function GameDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900/0 to-slate-900/0 pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="h-10 w-32 bg-slate-800/50 rounded-lg mb-6 animate-pulse" />

        <div className="h-10 w-40 bg-slate-800/50 rounded-full mb-8 animate-pulse" />

        <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-32 h-32 bg-slate-800/50 rounded-full animate-pulse" />
                <div className="space-y-2 w-full">
                  <div className="h-8 bg-slate-800/50 rounded mx-auto w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-800/50 rounded mx-auto w-1/2 animate-pulse" />
                </div>
                <div className="h-16 w-24 bg-slate-800/50 rounded-lg animate-pulse" />
              </div>

              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="h-10 w-20 bg-slate-800/50 rounded-lg animate-pulse" />
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-32 h-32 bg-slate-800/50 rounded-full animate-pulse" />
                <div className="space-y-2 w-full">
                  <div className="h-8 bg-slate-800/50 rounded mx-auto w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-800/50 rounded mx-auto w-1/2 animate-pulse" />
                </div>
                <div className="h-16 w-24 bg-slate-800/50 rounded-lg animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl mb-8">
          <CardHeader>
            <div className="h-6 w-48 bg-slate-800/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 bg-slate-800/50 rounded animate-pulse" />
                <div className="h-6 w-full bg-slate-800/50 rounded animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

