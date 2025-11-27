import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Gift, Copy, Check } from "lucide-react";
import type { Prize, Coupon } from "@shared/schema";

interface FortuneWheelProps {
  prizes: Prize[];
  spinsRemaining: number;
  onSpin: () => Promise<{ prize: Prize; coupon: Coupon } | null>;
  onBuySpins: () => void;
  isSpinning: boolean;
}

export default function FortuneWheel({
  prizes,
  spinsRemaining,
  onSpin,
  onBuySpins,
  isSpinning,
}: FortuneWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<{ prize: Prize; coupon: Coupon } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const segmentColors = [
    "#DC2626", // Red
    "#FFFFFF", // White
    "#991B1B", // Dark red
    "#FEE2E2", // Light red/pink
    "#B91C1C", // Medium red
    "#FECACA", // Lighter pink
    "#7F1D1D", // Very dark red
    "#FEF2F2", // Almost white
  ];

  const handleSpin = async () => {
    if (isSpinning || spinsRemaining <= 0) return;

    setShowResult(false);
    setWonPrize(null);
    setCopied(false);

    const result = await onSpin();
    
    if (result) {
      const prizeIndex = prizes.findIndex(p => p.id === result.prize.id);
      const segmentAngle = 360 / prizes.length;
      const prizeAngle = prizeIndex * segmentAngle;
      const randomOffset = Math.random() * (segmentAngle * 0.6) - (segmentAngle * 0.3);
      const spins = 5 + Math.floor(Math.random() * 3);
      const finalRotation = rotation + (spins * 360) + (360 - prizeAngle) + randomOffset;
      
      setRotation(finalRotation);
      
      setTimeout(() => {
        setWonPrize(result);
        setShowResult(true);
      }, 4000);
    }
  };

  const copyToClipboard = () => {
    if (wonPrize?.coupon.code) {
      navigator.clipboard.writeText(wonPrize.coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderWheelSegments = () => {
    if (prizes.length === 0) return null;
    
    const segmentAngle = 360 / prizes.length;
    
    return prizes.map((prize, index) => {
      const angle = index * segmentAngle;
      const color = segmentColors[index % segmentColors.length];
      const textColor = color === "#FFFFFF" || color === "#FEE2E2" || color === "#FECACA" || color === "#FEF2F2" 
        ? "#991B1B" 
        : "#FFFFFF";
      
      return (
        <g key={prize.id} transform={`rotate(${angle} 200 200)`}>
          <path
            d={`M 200 200 L 200 20 A 180 180 0 0 1 ${200 + 180 * Math.sin((segmentAngle * Math.PI) / 180)} ${200 - 180 * Math.cos((segmentAngle * Math.PI) / 180)} Z`}
            fill={color}
            stroke="#991B1B"
            strokeWidth="2"
          />
          <text
            x="200"
            y="80"
            textAnchor="middle"
            fill={textColor}
            fontSize="11"
            fontWeight="600"
            transform={`rotate(${segmentAngle / 2} 200 200)`}
            className="font-display"
          >
            {prize.name.length > 15 ? prize.name.substring(0, 15) + "..." : prize.name}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Spins Counter */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Sparkles className="w-5 h-5 mr-2" />
          {spinsRemaining} Spins Remaining
        </Badge>
        {spinsRemaining === 0 && (
          <Button onClick={onBuySpins} data-testid="button-buy-spins">
            Buy More Spins (Rs 10)
          </Button>
        )}
      </div>

      {/* Wheel Container and Results Container */}
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="relative flex justify-center">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-40">
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-primary drop-shadow-lg" />
          </div>

          {/* Wheel - Clickable */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || spinsRemaining <= 0}
            className="relative w-[400px] h-[400px] cursor-pointer disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            data-testid="button-wheel-tap"
          >
            <div
              ref={wheelRef}
              className="relative w-full h-full transition-transform duration-[4s] ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                <circle cx="200" cy="200" r="195" fill="#991B1B" stroke="#7F1D1D" strokeWidth="4" />
                <circle cx="200" cy="200" r="180" fill="none" stroke="#DC2626" strokeWidth="2" />
                {renderWheelSegments()}
                <circle cx="200" cy="200" r="30" fill="#991B1B" stroke="#7F1D1D" strokeWidth="4" />
                <circle cx="200" cy="200" r="20" fill="#DC2626" />
              </svg>
            </div>

            {/* Spin Button Text - Centered */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-primary hover:bg-primary/90 disabled:bg-muted-foreground flex items-center justify-center font-display font-bold text-lg text-white drop-shadow-lg pointer-events-none">
              {isSpinning ? "..." : "TAP"}
            </div>
          </button>
        </div>

        {/* Prize Result - Fixed at bottom */}
        {showResult && wonPrize && (
          <Card className="w-full max-w-md border-primary animate-in fade-in zoom-in duration-300 z-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Congratulations!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-lg">You won:</p>
              <p className="font-display font-bold text-2xl text-primary">
                {wonPrize.prize.name}
              </p>
              <p className="text-muted-foreground">{wonPrize.prize.description}</p>
              
              <div className="bg-muted rounded-lg p-4 mt-4">
                <p className="text-sm text-muted-foreground mb-2">Your Coupon Code:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-xl font-mono font-bold tracking-wider">
                    {wonPrize.coupon.code}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={copyToClipboard}
                    data-testid="button-copy-coupon"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Value: Rs {wonPrize.coupon.value}
                </p>
              </div>
              
              <Button className="w-full mt-4" asChild>
                <a href="/products" data-testid="link-use-coupon">
                  Use Coupon Now
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
