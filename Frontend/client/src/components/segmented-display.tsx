interface SegmentedDisplayProps {
  value: string | number
  className?: string
}

export function SegmentedDisplay({ value, className = "" }: SegmentedDisplayProps) {
  return (
    <div className={`font-mono tracking-wider ${className}`}>
      {value
        .toString()
        .split("")
        .map((digit, index) => (
          <span
            key={index}
            className="inline-block min-w-[0.6em] text-center"
            style={{
              textShadow: "0 0 10px rgba(0, 163, 255, 0.5)",
            }}
          >
            {digit}
          </span>
        ))}
    </div>
  )
}

