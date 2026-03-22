interface PortraitProps {
  className?: string;
}

export function SheriffPortrait({ className }: PortraitProps) {
  return (
    <svg
      viewBox="0 0 190 240"
      className={className}
      role="img"
      aria-label="Task Agent Sheriff"
      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}
    >
      <defs>
        <linearGradient id="lskinG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8844a" />
          <stop offset="100%" stopColor="#a06030" />
        </linearGradient>
        <linearGradient id="lcoatG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b4c28" />
          <stop offset="100%" stopColor="#3a2810" />
        </linearGradient>
        <linearGradient id="ljeansG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a5a7a" />
          <stop offset="100%" stopColor="#1a2a3a" />
        </linearGradient>
        <linearGradient id="lhatG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a3010" />
          <stop offset="100%" stopColor="#2a1808" />
        </linearGradient>
      </defs>
      <ellipse cx="95" cy="235" rx="42" ry="5" fill="rgba(0,0,0,0.35)" />
      <rect x="62" y="158" width="26" height="58" rx="4" fill="url(#ljeansG)" />
      <rect x="98" y="158" width="26" height="58" rx="4" fill="url(#ljeansG)" />
      <rect x="58" y="208" width="34" height="18" rx="3" fill="#2a1808" />
      <rect x="94" y="208" width="34" height="18" rx="3" fill="#2a1808" />
      <circle cx="60" cy="222" r="3" fill="#c8a020" opacity="0.8" />
      <circle cx="96" cy="222" r="3" fill="#c8a020" opacity="0.8" />
      <rect x="55" y="100" width="80" height="62" rx="5" fill="url(#lcoatG)" />
      <polygon points="95,108 75,108 70,140 95,138" fill="#5a3a18" opacity="0.9" />
      <polygon points="95,108 115,108 120,140 95,138" fill="#5a3a18" opacity="0.9" />
      <rect x="78" y="105" width="34" height="58" rx="3" fill="#3a2810" opacity="0.8" />
      <circle cx="95" cy="118" r="2.5" fill="#c8a020" opacity="0.9" />
      <circle cx="95" cy="128" r="2.5" fill="#c8a020" opacity="0.9" />
      <circle cx="95" cy="138" r="2.5" fill="#c8a020" opacity="0.9" />
      <circle cx="82" cy="114" r="7" fill="#e8a020" opacity="0.2" stroke="#e8a020" strokeWidth="1" />
      <text x="77" y="118" fontSize="8" fill="#e8a020" opacity="0.9">
        ★
      </text>
      <rect x="55" y="155" width="80" height="8" rx="2" fill="#4a2808" />
      <rect x="87" y="155" width="16" height="8" rx="1" fill="#c8a020" opacity="0.8" />
      <rect x="116" y="158" width="16" height="28" rx="3" fill="#3a2008" />

      <g>
        <rect x="22" y="100" width="32" height="13" rx="5" fill="url(#lcoatG)" />
        <rect x="14" y="96" width="13" height="20" rx="4" fill="url(#lcoatG)" />
        <ellipse cx="13" cy="118" rx="6" ry="6" fill="url(#lskinG)" />
        <g>
          <rect x="-10" y="113" width="24" height="7" rx="2" fill="#282020" />
          <rect x="-1" y="116" width="5" height="11" rx="1" fill="#282020" />
          <circle cx="6" cy="116" r="5" fill="#1a1818" stroke="#363030" strokeWidth="0.5" />
          <rect x="-12" y="114" width="6" height="5" rx="1" fill="#1a1818" />
        </g>
      </g>
      <rect x="136" y="106" width="32" height="13" rx="5" fill="url(#lcoatG)" />
      <rect x="164" y="103" width="13" height="20" rx="4" fill="url(#lcoatG)" />
      <ellipse cx="175" cy="126" rx="6" ry="6" fill="url(#lskinG)" />
      <rect x="82" y="87" width="26" height="15" rx="2" fill="#b07040" />
      <polygon points="82,87 108,87 105,100 95,105 85,100" fill="#c0392b" opacity="0.85" />
      <polygon points="95,105 90,115 95,112 100,115" fill="#c0392b" opacity="0.7" />
      <ellipse cx="95" cy="68" rx="28" ry="30" fill="url(#lskinG)" />
      <ellipse cx="84" cy="65" rx="5" ry="4" fill="#2a1808" />
      <ellipse cx="106" cy="65" rx="5" ry="4" fill="#2a1808" />
      <circle cx="84" cy="63" r="2" fill="#fff" opacity="0.5" />
      <circle cx="106" cy="63" r="2" fill="#fff" opacity="0.5" />
      <line x1="79" y1="59" x2="89" y2="61" stroke="#5a3010" strokeWidth="2" strokeLinecap="round" />
      <line x1="101" y1="61" x2="111" y2="59" stroke="#5a3010" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="95" cy="74" rx="3" ry="4" fill="#a06030" opacity="0.5" />
      <path d="M84,79 Q90,83 95,81 Q100,79 106,81" stroke="#7a3820" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="67" cy="68" rx="5" ry="7" fill="#b07040" />
      <ellipse cx="123" cy="68" rx="5" ry="7" fill="#b07040" />
      <ellipse cx="95" cy="44" rx="44" ry="10" fill="#2a1808" stroke="#4a2c10" strokeWidth="0.5" />
      <rect x="66" y="10" width="58" height="36" rx="6" fill="url(#lhatG)" />
      <ellipse cx="95" cy="10" rx="29" ry="8" fill="#3a2010" />
      <rect x="66" y="40" width="58" height="7" rx="0" fill="#5a3418" />
      <rect x="66" y="41" width="58" height="2" fill="#c8a020" opacity="0.4" />
      <rect x="108" y="40" width="10" height="7" rx="1" fill="#c8a020" opacity="0.5" />
      <text x="95" y="238" textAnchor="middle" fontFamily="Rye,cursive" fontSize="8" fill="#8a6a30" letterSpacing="1">
        THE SHERIFF
      </text>
    </svg>
  );
}

export function OutlawPortrait({ className }: PortraitProps) {
  return (
    <svg
      viewBox="0 0 190 240"
      className={className}
      role="img"
      aria-label="Red-Team Outlaw"
      style={{ transform: 'scaleX(-1)', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.7))' }}
    >
      <defs>
        <linearGradient id="obskinG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b07040" />
          <stop offset="100%" stopColor="#804820" />
        </linearGradient>
        <linearGradient id="obcoatG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e0e04" />
          <stop offset="100%" stopColor="#100804" />
        </linearGradient>
        <linearGradient id="obpantsG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a2010" />
          <stop offset="100%" stopColor="#2a1008" />
        </linearGradient>
        <linearGradient id="obhatG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#100804" />
          <stop offset="100%" stopColor="#080402" />
        </linearGradient>
      </defs>
      <ellipse cx="95" cy="235" rx="42" ry="5" fill="rgba(0,0,0,0.45)" />
      <rect x="62" y="158" width="26" height="58" rx="4" fill="url(#obpantsG)" />
      <rect x="98" y="158" width="26" height="58" rx="4" fill="url(#obpantsG)" />
      <rect x="60" y="160" width="8" height="48" rx="2" fill="#3a1808" opacity="0.7" />
      <rect x="118" y="160" width="8" height="48" rx="2" fill="#3a1808" opacity="0.7" />
      <rect x="57" y="206" width="35" height="20" rx="3" fill="#1a0c04" />
      <rect x="94" y="206" width="35" height="20" rx="3" fill="#1a0c04" />
      <rect x="52" y="98" width="86" height="76" rx="5" fill="url(#obcoatG)" />
      <polygon points="62,126 80,126 80,152 62,148" fill="#8b1a10" opacity="0.45" />
      <polygon points="128,126 110,126 110,152 128,148" fill="#8b1a10" opacity="0.45" />
      <path d="M62,115 Q95,109 128,115" stroke="#4a2808" strokeWidth="5" fill="none" opacity="0.9" />
      <rect x="66" y="111" width="3.5" height="8" rx="1" fill="#c8a020" opacity="0.8" />
      <rect x="73" y="110" width="3.5" height="8" rx="1" fill="#c8a020" opacity="0.8" />
      <rect x="80" y="109" width="3.5" height="8" rx="1" fill="#c8a020" opacity="0.8" />
      <rect x="87" y="109" width="3.5" height="8" rx="1" fill="#c8a020" opacity="0.8" />
      <rect x="100" y="109" width="3.5" height="8" rx="1" fill="#c8a020" opacity="0.8" />
      <rect x="107" y="110" width="3.5" height="8" rx="1" fill="#c8a020" opacity="0.8" />
      <rect x="114" y="111" width="3.5" height="8" rx="1" fill="#c8a020" opacity="0.8" />
      <rect x="52" y="148" width="86" height="7" rx="2" fill="#2a1404" />
      <rect x="83" y="148" width="24" height="7" rx="1" fill="#2a1404" stroke="#c8a020" strokeWidth="0.4" opacity="0.8" />
      <text x="86" y="154" fontSize="7" fill="#c8a020" opacity="0.7">
        ☠
      </text>
      <rect x="52" y="152" width="14" height="26" rx="3" fill="#1a0c04" />

      <g>
        <rect x="22" y="100" width="32" height="13" rx="5" fill="url(#obcoatG)" />
        <rect x="14" y="96" width="13" height="20" rx="4" fill="url(#obcoatG)" />
        <ellipse cx="13" cy="118" rx="6" ry="6" fill="url(#obskinG)" />
        <g>
          <rect x="-10" y="113" width="24" height="7" rx="2" fill="#1a1010" />
          <rect x="-1" y="116" width="5" height="11" rx="1" fill="#1a1010" />
          <circle cx="6" cy="116" r="5" fill="#0e0c0c" stroke="#282828" strokeWidth="0.5" />
          <rect x="-12" y="114" width="6" height="5" rx="1" fill="#0e0c0c" />
        </g>
      </g>

      <rect x="136" y="106" width="32" height="13" rx="5" fill="url(#obcoatG)" />
      <rect x="164" y="103" width="13" height="20" rx="4" fill="url(#obcoatG)" />
      <ellipse cx="175" cy="126" rx="6" ry="6" fill="url(#obskinG)" />
      <rect x="82" y="88" width="26" height="13" rx="2" fill="#904820" />
      <ellipse cx="95" cy="65" rx="26" ry="28" fill="url(#obskinG)" />
      <rect x="70" y="67" width="50" height="22" rx="4" fill="#c0392b" opacity="0.92" />
      <ellipse cx="118" cy="73" rx="5" ry="4" fill="#8b1a10" opacity="0.8" />
      <line x1="72" y1="73" x2="118" y2="71" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <ellipse cx="83" cy="60" rx="6" ry="4" fill="#1a0c04" />
      <ellipse cx="107" cy="60" rx="6" ry="4" fill="#1a0c04" />
      <circle cx="83" cy="59" r="2.5" fill="#c0392b" opacity="0.75" />
      <circle cx="107" cy="59" r="2.5" fill="#c0392b" opacity="0.75" />
      <circle cx="84" cy="58" r="1" fill="#fff" opacity="0.4" />
      <circle cx="108" cy="58" r="1" fill="#fff" opacity="0.4" />
      <line x1="77" y1="53" x2="89" y2="56" stroke="#1a0804" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="101" y1="56" x2="113" y2="53" stroke="#1a0804" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="78" y1="55" x2="87" y2="65" stroke="rgba(50,10,0,0.45)" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="69" cy="65" rx="5" ry="7" fill="#904820" />
      <ellipse cx="121" cy="65" rx="5" ry="7" fill="#904820" />
      <ellipse cx="95" cy="34" rx="46" ry="10" fill="#080402" stroke="#100806" strokeWidth="0.5" />
      <rect x="66" y="6" width="58" height="30" rx="5" fill="url(#obhatG)" />
      <ellipse cx="95" cy="6" rx="29" ry="7" fill="#080402" />
      <rect x="66" y="31" width="58" height="6" rx="0" fill="#7a1808" opacity="0.85" />
      <text x="82" y="36" fontSize="7" fill="#c0392b" opacity="0.7">
        ☠
      </text>
      <circle cx="112" cy="18" r="3" fill="#050302" stroke="rgba(80,40,10,0.3)" strokeWidth="0.5" />
      <text
        x="95"
        y="238"
        textAnchor="middle"
        fontFamily="Rye,cursive"
        fontSize="8"
        fill="#8b1a10"
        letterSpacing="1"
        transform="translate(190 0) scale(-1 1)"
      >
        THE OUTLAW
      </text>
    </svg>
  );
}
