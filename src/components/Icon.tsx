interface IconProps {
  name: IconName;
  label: string;
}

export type IconName =
  | "play"
  | "next"
  | "restart"
  | "home"
  | "leave"
  | "check"
  | "cross"
  | "clock"
  | "friends"
  | "create"
  | "join"
  | "submit"
  | "share"
  | "wait"
  | "trophy"
  | "results"
  | "warning"
  | "person"
  | "code";

const GLYPHS: Record<IconName, string> = {
  play: "▶",
  next: "⏭",
  restart: "↻",
  home: "⌂",
  leave: "🚪",
  check: "✓",
  cross: "✕",
  clock: "⏱",
  friends: "👥",
  create: "➕",
  join: "🔑",
  submit: "➤",
  share: "🔗",
  wait: "⏳",
  trophy: "🏆",
  results: "🏁",
  warning: "⚠",
  person: "👤",
  code: "🔑",
};

export default function Icon({ name, label }: IconProps) {
  return (
    <span className="icon" role="img" aria-label={label}>
      {GLYPHS[name]}
    </span>
  );
}