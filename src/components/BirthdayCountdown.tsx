import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface BirthdayData {
  name: string;
  birthDate: string;
}

const motivationalQuotes = [
  "🎂 Age is merely the number of years the world has been enjoying you!",
  "🌟 Every birthday is a gift. Every day is a gift. That's why it's called the present!",
  "🎈 Growing older is mandatory, but growing up is optional!",
  "🎊 The more candles, the bigger the wish!",
  "🎁 Birthdays are nature's way of telling us to eat more cake!",
  "🌈 Life should not only be lived, it should be celebrated!",
  "✨ Another year older, another year wiser, another year more awesome!",
];

const Confetti: React.FC = () => {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => i);
  const colors = ['birthday-pink', 'birthday-purple', 'birthday-blue', 'birthday-yellow', 'birthday-green', 'birthday-orange'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece}
          className={`absolute w-3 h-3 bg-${colors[piece % colors.length]} confetti rounded-sm opacity-80`}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

const BirthdayCountdown: React.FC = () => {
  const [birthdayData, setBirthdayData] = useState<BirthdayData>({ name: '', birthDate: '' });
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isBirthday, setIsBirthday] = useState(false);
  const [isSet, setIsSet] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quote, setQuote] = useState('');

  const calculateTimeLeft = useCallback((targetDate: Date): TimeLeft => {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }, []);

  const getNextBirthday = useCallback((birthDate: string): Date => {
    const today = new Date();
    const birth = new Date(birthDate);
    const thisYear = today.getFullYear();
    
    let nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate());
    
    // If birthday has passed this year, set for next year
    if (nextBirthday < today) {
      nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate());
    }
    
    return nextBirthday;
  }, []);

  const calculateProgress = useCallback((birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    const thisYear = today.getFullYear();
    
    const lastBirthday = new Date(thisYear, birth.getMonth(), birth.getDate());
    if (lastBirthday > today) {
      lastBirthday.setFullYear(thisYear - 1);
    }
    
    const nextBirthday = getNextBirthday(birthDate);
    const totalDays = Math.floor((nextBirthday.getTime() - lastBirthday.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.floor((today.getTime() - lastBirthday.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
  }, [getNextBirthday]);

  const checkIfBirthday = useCallback((birthDate: string): boolean => {
    const today = new Date();
    const birth = new Date(birthDate);
    
    return today.getDate() === birth.getDate() && today.getMonth() === birth.getMonth();
  }, []);

  const getDailyQuote = useCallback((): string => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return motivationalQuotes[dayOfYear % motivationalQuotes.length];
  }, []);

  const loadFromStorage = useCallback(() => {
    const saved = localStorage.getItem('birthdayData');
    if (saved) {
      const data = JSON.parse(saved);
      setBirthdayData(data);
      setIsSet(true);
      setIsBirthday(checkIfBirthday(data.birthDate));
      setProgress(calculateProgress(data.birthDate));
    }
  }, [checkIfBirthday, calculateProgress]);

  const saveToStorage = useCallback((data: BirthdayData) => {
    localStorage.setItem('birthdayData', JSON.stringify(data));
  }, []);

  useEffect(() => {
    loadFromStorage();
    setQuote(getDailyQuote());
  }, [loadFromStorage, getDailyQuote]);

  useEffect(() => {
    if (!isSet || !birthdayData.birthDate) return;

    const timer = setInterval(() => {
      const nextBirthday = getNextBirthday(birthdayData.birthDate);
      const timeLeftData = calculateTimeLeft(nextBirthday);
      setTimeLeft(timeLeftData);
      
      const isCurrentlyBirthday = checkIfBirthday(birthdayData.birthDate);
      setIsBirthday(isCurrentlyBirthday);
      
      if (!isCurrentlyBirthday) {
        setProgress(calculateProgress(birthdayData.birthDate));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isSet, birthdayData.birthDate, calculateTimeLeft, getNextBirthday, checkIfBirthday, calculateProgress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (birthdayData.birthDate) {
      setIsSet(true);
      setIsBirthday(checkIfBirthday(birthdayData.birthDate));
      setProgress(calculateProgress(birthdayData.birthDate));
      saveToStorage(birthdayData);
    }
  };

  const handleReset = () => {
    setIsSet(false);
    setBirthdayData({ name: '', birthDate: '' });
    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    setIsBirthday(false);
    setProgress(0);
    localStorage.removeItem('birthdayData');
  };

  const CountdownCard: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
    <div className={`p-6 rounded-2xl bg-gradient-to-br from-card to-secondary border border-${color} countdown-glow transition-all duration-300 hover:scale-105`}>
      <div className={`text-4xl md:text-5xl font-bold text-${color} text-center mb-2`}>
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-sm text-muted-foreground text-center uppercase tracking-wide">
        {label}
      </div>
    </div>
  );

  if (isBirthday) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Confetti />
        <div className="w-full max-w-2xl">
          <Card className="birthday-pulse border-birthday-pink bg-gradient-to-br from-card via-card to-birthday-pink/10">
            <CardContent className="p-8 text-center">
              <div className="text-8xl mb-6 float">🎉</div>
              <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
                Happy Birthday{birthdayData.name ? `, ${birthdayData.name}` : ''}!
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                🎂 Hope your special day is filled with happiness and cake! 🎂
              </p>
              <div className="flex gap-4 justify-center text-4xl mb-8">
                <span className="float" style={{ animationDelay: '0s' }}>🎈</span>
                <span className="float" style={{ animationDelay: '0.5s' }}>🎊</span>
                <span className="float" style={{ animationDelay: '1s' }}>🎁</span>
                <span className="float" style={{ animationDelay: '1.5s' }}>🥳</span>
                <span className="float" style={{ animationDelay: '2s' }}>🎀</span>
              </div>
              <Button onClick={handleReset} variant="outline" size="lg" className="mt-4">
                🎯 Plan Next Year's Countdown
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isSet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4 float">🎂</div>
              <CardTitle className="text-3xl gradient-text">Birthday Countdown</CardTitle>
              <p className="text-muted-foreground">Let's count down to your special day!</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Your Name (Optional) 👤
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={birthdayData.name}
                    onChange={(e) => setBirthdayData({ ...birthdayData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="birthdate" className="text-sm font-medium">
                    Your Birthday 📅
                  </Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={birthdayData.birthDate}
                    onChange={(e) => setBirthdayData({ ...birthdayData, birthDate: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-birthday-purple to-birthday-pink hover:from-birthday-pink hover:to-birthday-purple transition-all duration-300"
                  size="lg"
                >
                  🚀 Start Countdown
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
            {birthdayData.name ? `${birthdayData.name}'s` : 'Your'} Birthday Countdown
          </h1>
          <p className="text-muted-foreground text-lg">🎉 The excitement is building! 🎉</p>
        </div>

        {/* Progress Bar */}
        <Card className="border-birthday-purple/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">Progress to Birthday</span>
              <span className="text-sm text-birthday-purple font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {progress < 50 ? "🌱 Still growing the excitement!" : progress < 80 ? "🌸 Getting closer!" : "🌟 Almost there!"}
            </p>
          </CardContent>
        </Card>

        {/* Countdown Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CountdownCard value={timeLeft.days} label="Days" color="birthday-pink" />
          <CountdownCard value={timeLeft.hours} label="Hours" color="birthday-purple" />
          <CountdownCard value={timeLeft.minutes} label="Minutes" color="birthday-blue" />
          <CountdownCard value={timeLeft.seconds} label="Seconds" color="birthday-yellow" />
        </div>

        {/* Quote Card */}
        <Card className="border-birthday-orange/20 bg-gradient-to-r from-card to-birthday-orange/5">
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-3">💭</div>
            <p className="text-lg italic text-foreground">{quote}</p>
          </CardContent>
        </Card>

        {/* Reset Button */}
        <div className="text-center">
          <Button 
            onClick={handleReset} 
            variant="outline" 
            size="lg"
            className="border-birthday-pink/30 hover:bg-birthday-pink/10 hover:border-birthday-pink/50 transition-all duration-300"
          >
            🔄 Reset Countdown
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BirthdayCountdown;