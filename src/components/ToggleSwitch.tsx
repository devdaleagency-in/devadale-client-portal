interface ToggleSwitchProps {
  enabled: boolean;
  onClick: () => void;
  label: string;
}

export default function ToggleSwitch({ enabled, onClick, label }: ToggleSwitchProps) {
  const trackClass = enabled
    ? 'bg-blue-600 border-blue-600'
    : 'bg-gray-300 dark:bg-gray-500 border-gray-400 dark:border-gray-400';

  return (
    <button
      type="button"
      role="switch"
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors overflow-hidden ${trackClass}`}
      aria-label={label}
      aria-checked={enabled}
    >
      <span
        className={`absolute top-1 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? 'translate-x-[22px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
