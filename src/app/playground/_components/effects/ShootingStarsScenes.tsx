import ShootingStars from "@/app/components/ShootingStars";

export function Cluster() {
  return <ShootingStars meteors={false} forceDark />;
}

export function MeteorSky() {
  return <ShootingStars forceDark />;
}
