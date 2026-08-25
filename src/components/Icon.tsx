interface IconProps {
  name: IconName;
  label: string;
}

export type IconName =
  | "gamepad"
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
  | "trophy"
  | "results"

  | "person"
  | "code"
  | "up"
  | "down";

const PATHS: Record<IconName, JSX.Element> = {
  gamepad: (
    <>
      <path d="M6 9h4M8 7v4" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
      <line x1="18" y1="12" x2="18.01" y2="12" />
      <path d="M7.5 5h9A4.5 4.5 0 0 1 21 9.5v3A4.5 4.5 0 0 1 16.5 17c-1.2 0-2.3-.5-3.1-1.3l-.4-.4a2 2 0 0 0-2.8 0l-.4.4A4.5 4.5 0 0 1 6.5 17 4.5 4.5 0 0 1 2 12.5v-3A4.5 4.5 0 0 1 6.5 5h1z" />
    </>
  ),
  next: (
    <>
      <path d="M5 4l10 8-10 8V4z" />
      <line x1="19" y1="4" x2="19" y2="20" />
    </>
  ),
  restart: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <polyline points="3 3 3 8 8 8" />
    </>
  ),
  home: (
    <>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </>
  ),
  leave: (
    <>
      <path d="M15 3h5v18h-5" />
      <path d="M10 9l-4 3 4 3" />
      <line x1="6" y1="12" x2="14" y2="12" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  cross: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </>
  ),
  friends: (
    <>
      <circle cx="8.5" cy="8" r="3.5" />
      <path d="M3 21c0-3.2 2.5-5.8 5.5-5.8s5.5 2.6 5.5 5.8" />
      <circle cx="17" cy="9" r="3" />
      <path d="M13.5 21c0-2.7 1.6-5 3.5-5s3.5 2.3 3.5 5" />
    </>
  ),
  create: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  join: (
    <>
      <line x1="1" y1="12" x2="7" y2="12" />
      <polyline points="7 7 12 12 7 17" />
      <circle cx="17" cy="8" r="3" />
      <path d="M12 21c0-3.2 2.2-5.8 5-5.8s5 2.6 5 5.8" />
      <circle cx="22" cy="9" r="2" />
      <path d="M18.5 21c0-2.4 1.5-4.2 3.5-4.2s3.5 1.8 3.5 4.2" />
    </>
  ),
  submit: (
    <>
      <line x1="3" y1="12" x2="21" y2="12" />
      <polyline points="14 5 21 12 14 19" />
    </>
  ),
  share: (
    <>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v6a5 5 0 0 1-10 0V4z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3" />
    </>
  ),
  results: (
    <>
      <path d="M5 3v18" />
      <path d="M5 4h11l-2 4 2 4H5" />
    </>
  ),

  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" />
    </>
  ),
  code: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l8-8" />
      <line x1="16" y1="7" x2="19" y2="10" />
    </>
  ),
  up: (
    <>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </>
  ),
  down: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </>
  ),
};

export default function Icon({ name, label }: IconProps) {
  return (
    <span className="icon" role="img" aria-label={label}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {PATHS[name]}
      </svg>
    </span>
  );
}