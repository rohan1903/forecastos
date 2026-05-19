import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({ title = "Weather search failed", message }: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-red-300/25 bg-red-500/10 p-5 text-red-50">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-200" />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-red-100/85">{message}</p>
        </div>
      </div>
    </div>
  );
}
