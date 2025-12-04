import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-block mb-6">
              <div className="text-6xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                🏈
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              NFL Predictions
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
              View live scores, schedules, and AI-powered predictions for all NFL games
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/games"
              className="group relative px-8 py-4 bg-linear-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-white text-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 w-full sm:w-auto"
            >
              <span className="relative z-10">View Games</span>
              <div className="absolute inset-0 bg-linear-to-r from-purple-700 to-pink-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <Link
              href="/games"
              className="px-8 py-4 glass-button rounded-lg font-semibold text-white text-lg hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              Explore Schedule
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="glass-card p-6 rounded-xl hover:scale-105 transition-all duration-300">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Live Schedules
              </h3>
              <p className="text-gray-400">
                View current week and full season schedules with real-time updates
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl hover:scale-105 transition-all duration-300">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Game Statistics
              </h3>
              <p className="text-gray-400">
                Access detailed box scores and player statistics for every game
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl hover:scale-105 transition-all duration-300">
              <div className="text-3xl mb-4">🔮</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Predictions
              </h3>
              <p className="text-gray-400">
                Get intelligent predictions powered by advanced analytics
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
