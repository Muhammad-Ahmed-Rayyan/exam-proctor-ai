/**
 * Logo component — SVG shield with checkmark + "Exam Proctor AI" wordmark.
 * Props:
 *   size: "sm" (navbar) | "lg" (landing / auth pages)
 */
const Logo = ({ size = "sm", dark = false }) => {
  const isLg = size === "lg";
  const shieldSize  = isLg ? 48 : 28;
  const titleSize   = isLg ? 28 : 16;
  const aiSize      = isLg ? 28 : 16;
  const gap         = isLg ? 14 : 8;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: `${gap}px` }}>
      {/* Shield SVG */}
      <svg
        width={shieldSize}
        height={shieldSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 2L4 7v9c0 7.18 5.15 13.89 12 15.48C22.85 29.89 28 23.18 28 16V7L16 2z"
          fill="#2563EB"
        />
        <path
          d="M11 16l3.5 3.5L21 12"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      <span style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
        <span style={{ fontWeight: 800, fontSize: `${titleSize}px`, color: dark ? "#FFFFFF" : "#0F172A", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
          Exam Proctor
        </span>
        <span style={{ fontWeight: 800, fontSize: `${aiSize}px`, color: "#2563EB", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
          &nbsp;AI
        </span>
      </span>
    </div>
  );
};

export default Logo;
