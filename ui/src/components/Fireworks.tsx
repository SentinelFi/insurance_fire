import React, { useEffect, useState } from "react";

type FireworkParticle = {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  opacity: number;
};

const Fireworks = ({
  show,
  onComplete,
  intensity = "medium",
}: {
  show: boolean;
  onComplete: () => void;
  intensity?: "low" | "medium" | "high";
}) => {
  const [particles, setParticles] = useState<FireworkParticle[]>([]);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }

    const colors = [
      "#FFA500",
      "#FF4500",
      "#FFD700",
      "#FF6347",
      "#FF8C00",
      "#FFC107",
      "#FF5722",
    ];

    const newParticles: FireworkParticle[] = [];

    let burstCount = 3;
    let particlesPerBurst = 30;

    if (intensity === "low") {
      burstCount = 2;
      particlesPerBurst = 20;
    } else if (intensity === "high") {
      burstCount = 5;
      particlesPerBurst = 40;
    }

    for (let burst = 0; burst < burstCount; burst++) {
      const burstX =
        Math.random() * (window.innerWidth * 0.7) + window.innerWidth * 0.15;
      const burstY =
        Math.random() * (window.innerHeight * 0.5) + window.innerHeight * 0.2;

      for (let i = 0; i < particlesPerBurst; i++) {
        newParticles.push({
          id: burst * 100 + i,
          x: burstX,
          y: burstY,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 2,
          opacity: 1,
        });
      }
    }

    setParticles(newParticles);

    let frame = 0;
    const maxFrames = 90; // Longer animation
    const animate = () => {
      frame++;

      if (frame >= maxFrames) {
        onComplete();
        return;
      }

      setParticles(
        (prev) =>
          prev
            .map((particle) => {
              // Random movement in a circular pattern with some randomness
              const angle =
                (particle.id % 30) * ((Math.PI * 2) / 30) +
                (Math.random() * 0.2 - 0.1);
              const distance = frame * 3;
              const gravity = frame * 0.05; // Reduced gravity effect

              return {
                ...particle,
                x:
                  particle.x +
                  Math.cos(angle) * distance * 0.1 +
                  (Math.random() * 0.5 - 0.25),
                y:
                  particle.y +
                  Math.sin(angle) * distance * 0.1 +
                  gravity +
                  (Math.random() * 0.5 - 0.25),
                size: particle.size * (1 - (frame / maxFrames) * 0.7), // Gradually reduce size
                opacity: 1 - (frame / maxFrames) * (1 + Math.random() * 0.2),
              };
            })
            .filter((particle) => particle.opacity > 0) // Remove faded particles
      );

      requestAnimationFrame(animate);
    };

    const animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, [show, onComplete, intensity]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <div className="relative w-full h-full">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              transition: "opacity 0.1s",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Fireworks;
