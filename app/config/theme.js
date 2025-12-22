// /app/config/theme.js
export const theme = {
  colors: {
    primary: "#00E0FF",        // Neon cyan
    secondary: "#FF00E0",      // Neon magenta
    accent: "#00FFA3",         // Electric green
    background: "#0A0F1F",     // Deep dark navy
    surface: "#12172A",        // Slightly lighter background
    textPrimary: "#E8ECF3",
    textSecondary: "#9BA0B4",
    warning: "#FFAD33",
    error: "#FF3366",
  },
  gradients: {
    neonGlow: "linear-gradient(135deg, #00E0FF 0%, #FF00E0 100%)",
    spawnPulse: "linear-gradient(90deg, #00FFA3, #00E0FF, #FF00E0)",
  },
  shadows: {
    soft: "0 0 20px rgba(0, 224, 255, 0.15)",
    hard: "0 0 40px rgba(255, 0, 224, 0.3)",
    inner: "inset 0 0 15px rgba(0, 255, 163, 0.25)",
  },
  transitions: {
    fast: "all 0.15s ease-in-out",
    smooth: "all 0.35s ease-in-out",
  },
  radii: {
    small: "6px",
    medium: "10px",
    large: "16px",
    round: "50%",
  },
  blur: {
    light: "backdrop-filter: blur(8px)",
    heavy: "backdrop-filter: blur(20px)",
  },
  font: {
    family: "'Inter', 'Poppins', sans-serif",
    size: {
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.25rem",
      xl: "1.5rem",
    },
    weight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },
};

export default theme;
