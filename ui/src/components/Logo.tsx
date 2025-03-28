import React from "react";

interface LogoProps {
  size?: number;
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 40, animated = true }) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          animated ? "group" : ""
        }`}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="20"
            cy="20"
            r="18"
            className="fill-flame-100/30 dark:fill-flame-800/30"
          />

          <path
            d="M20 4L33.6603 28H6.33975L20 4Z"
            className={`fill-flame-500 dark:fill-flame-400 ${
              animated
                ? "group-hover:fill-flame-600 transition-colors duration-300"
                : ""
            }`}
          />

          <path
            d="M20 36C28.8366 36 36 28.8366 36 20C36 11.1634 28.8366 4 20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36Z"
            className={`fill-none stroke-flame-700 dark:stroke-flame-300 ${
              animated
                ? "group-hover:stroke-flame-500 transition-colors duration-300"
                : ""
            }`}
            strokeWidth="2"
            strokeDasharray="4 2"
            strokeLinecap="round"
          />

          <path
            d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28"
            className={`fill-none stroke-flame-600 dark:stroke-flame-200 ${
              animated
                ? "group-hover:stroke-flame-400 transition-colors duration-300"
                : ""
            }`}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <circle
            cx="20"
            cy="20"
            r="2.5"
            className={`fill-flame-400 dark:fill-flame-300 ${
              animated
                ? "group-hover:fill-flame-500 transition-all duration-300 group-hover:scale-125"
                : ""
            }`}
          />

          {animated && (
            <>
              <circle
                cx="15"
                cy="15"
                r="0.8"
                className="fill-flame-300 dark:fill-flame-200 animate-pulse-subtle"
                style={{ animationDelay: "0.2s" }}
              />
              <circle
                cx="25"
                cy="15"
                r="0.8"
                className="fill-flame-300 dark:fill-flame-200 animate-pulse-subtle"
                style={{ animationDelay: "0.5s" }}
              />
              <circle
                cx="20"
                cy="10"
                r="0.8"
                className="fill-flame-300 dark:fill-flame-200 animate-pulse-subtle"
                style={{ animationDelay: "0.8s" }}
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

export default Logo;
