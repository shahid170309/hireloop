interface CompanyAvatarProps {
  company: string;
  size?: "sm" | "md" | "lg";
}

const PALETTES = [
  "bg-[#EEF2FF] text-[#3730A3] border-[#E0E7FF]",
  "bg-[#ECFDF5] text-[#065F46] border-[#D1FAE5]",
  "bg-[#EFF6FF] text-[#1E40AF] border-[#DBEAFE]",
  "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
  "bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]",
  "bg-[#F1F5F9] text-[#1E293B] border-[#E2E8F0]",
];

export function CompanyAvatar({ company, size = "md" }: CompanyAvatarProps) {
  const clean = company.trim() || "H";
  const words = clean.split(/\s+/).filter(Boolean);
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : clean.slice(0, 2).toUpperCase();

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) % PALETTES.length;
  }
  const colorClass = PALETTES[Math.abs(hash) % PALETTES.length];

  const sizeClass =
    size === "sm"
      ? "w-8 h-8 rounded-lg text-xs"
      : size === "lg"
      ? "w-12 h-12 rounded-xl text-base"
      : "w-10 h-10 rounded-xl text-sm";

  return (
    <div
      className={`${sizeClass} ${colorClass} border font-display font-bold flex items-center justify-center shrink-0 select-none`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
