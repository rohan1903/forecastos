import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudRain,
  CloudSun,
  Sun,
  Zap,
} from "lucide-react";

type WeatherIconProps = {
  condition: string;
  className?: string;
};

export function WeatherIcon({ condition, className = "" }: WeatherIconProps) {
  const normalized = condition.toLowerCase();
  const shared = `h-8 w-8 ${className}`;

  if (normalized.includes("thunder") || normalized.includes("storm")) {
    return (
      <div className="relative">
        <CloudRain className={`${shared} text-slate-100`} />
        <Zap className="absolute -bottom-1 left-4 h-4 w-4 fill-amber-300 text-amber-300" />
      </div>
    );
  }

  if (normalized.includes("rain")) {
    return <CloudRain className={`${shared} text-sky-200`} />;
  }

  if (normalized.includes("drizzle")) {
    return <CloudDrizzle className={`${shared} text-sky-200`} />;
  }

  if (normalized.includes("mist") || normalized.includes("fog") || normalized.includes("haze")) {
    return <CloudFog className={`${shared} text-slate-100`} />;
  }

  if (normalized.includes("cloud")) {
    return <Cloud className={`${shared} text-slate-200`} />;
  }

  if (normalized.includes("clear")) {
    return <Sun className={`${shared} text-amber-300`} />;
  }

  return <CloudSun className={`${shared} text-amber-200`} />;
}
