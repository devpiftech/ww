
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { MultiplayerProvider } from "./context/MultiplayerContext";

import Index from "./pages/Index";
import SlotMachine from "./pages/SlotMachine";
import Games from "./pages/Games";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import PlaceholderGame from "./pages/PlaceholderGame";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import Sportsbook from "./pages/Sportsbook";
import Quiz from "./pages/Quiz";
import Tournaments from "./pages/Tournaments";

// Slot machine variations
import ClassicSlotMachine from "./components/slots/ClassicSlotMachine";
import FruitySlotMachine from "./components/slots/FruitySlotMachine";
import SpaceSlotMachine from "./components/slots/SpaceSlotMachine";
import JackpotSlotMachine from "./components/slots/JackpotSlotMachine";

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ChatProvider>
          <MultiplayerProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/games" element={<Games />} />
                <Route path="/slots" element={<SlotMachine />} />
                
                {/* Slot machine variations */}
                <Route path="/slots/classic" element={<ClassicSlotMachine />} />
                <Route path="/slots/fruity" element={<FruitySlotMachine />} />
                <Route path="/slots/space" element={<SpaceSlotMachine />} />
                <Route path="/slots/jackpot" element={<JackpotSlotMachine />} />
                
                {/* Sportsbook */}
                <Route path="/sportsbook" element={<Sportsbook />} />
                
                {/* Tournaments */}
                <Route path="/tournaments" element={<Tournaments />} />
                
                <Route path="/profile" element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                } />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<AdminDashboard />} />
                
                {/* New dedicated Quiz route */}
                <Route path="/quiz" element={<Quiz />} />
                
                {/* Game routes - implemented games */}
                <Route path="/blackjack" element={<PlaceholderGame title="Blackjack" />} />
                <Route path="/cointoss" element={<PlaceholderGame title="Coin Toss" />} />
                <Route path="/highlow" element={<PlaceholderGame title="High Low" />} />
                <Route path="/picknumber" element={<PlaceholderGame title="Lucky Number" />} />
                
                {/* Game routes - still using placeholder */}
                <Route path="/poker" element={<PlaceholderGame title="Video Poker" />} />
                <Route path="/roulette-eu" element={<PlaceholderGame title="European Roulette" />} />
                <Route path="/roulette-us" element={<PlaceholderGame title="American Roulette" />} />
                <Route path="/dice" element={<PlaceholderGame title="Casino Dice" />} />
                <Route path="/racing" element={<PlaceholderGame title="Virtual Racing" />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </MultiplayerProvider>
        </ChatProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
