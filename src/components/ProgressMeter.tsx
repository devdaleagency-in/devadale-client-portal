type ProgressMeterVariant = 'blue' | 'emerald' | 'amber';

interface ProgressMeterProps {
  value: number;
  max?: number;
  label: string;
  variant?: ProgressMeterVariant;
  className?: string;
}

const variantClass: Record<ProgressMeterVariant, string> = {
  blue: 'progress-meter--blue',
  emerald: 'progress-meter--emerald',
  amber: 'progress-meter--amber',
};

export default function ProgressMeter({
  value,
  max = 100,
  label,
  variant = 'blue',
  className = '',
}: ProgressMeterProps) {
  const clamped = Math.min(Math.max(value, 0), max);

  return (
    <progress
      value={clamped}
      max={max}
      aria-label={label}
      className={`progress-meter w-full ${variantClass[variant]} ${className}`}
    />
  );
}
