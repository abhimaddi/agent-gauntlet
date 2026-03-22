import { OutlawPortrait, SheriffPortrait } from '@/components/agent-portraits';
import type { RedTeamType, TaskAgentType } from '@/lib/sentinel/types';

export function AgentDuel({
  taskAgentType,
  redTeamType,
}: {
  taskAgentType: TaskAgentType;
  redTeamType: RedTeamType;
}) {
  return (
    <section className="shootout-scene fade-in">
      <svg className="scene-stars" viewBox="0 0 1000 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="80" cy="20" r="1" fill="#e8d0a0" opacity="0.6" />
        <circle cx="200" cy="10" r="1.5" fill="#e8d0a0" opacity="0.5" />
        <circle cx="350" cy="30" r="1" fill="#e8d0a0" opacity="0.7" />
        <circle cx="500" cy="8" r="1" fill="#e8d0a0" opacity="0.4" />
        <circle cx="650" cy="22" r="1.5" fill="#e8d0a0" opacity="0.6" />
        <circle cx="780" cy="12" r="1" fill="#e8d0a0" opacity="0.5" />
        <circle cx="920" cy="28" r="1" fill="#e8d0a0" opacity="0.7" />
        <circle cx="140" cy="45" r="1" fill="#e8d0a0" opacity="0.3" />
        <circle cx="420" cy="55" r="1" fill="#e8d0a0" opacity="0.4" />
        <circle cx="860" cy="40" r="1" fill="#e8d0a0" opacity="0.3" />
      </svg>

      <div className="scene-sun" aria-hidden="true" />

      <svg className="scene-hills" viewBox="0 0 1000 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path
          d="M0,120 Q80,40 180,70 Q280,95 380,50 Q480,10 560,60 Q640,95 720,45 Q820,0 900,55 Q950,80 1000,50 L1000,120Z"
          fill="#1a0a04"
          opacity="0.85"
        />
        <path
          d="M0,120 Q100,70 200,90 Q300,108 400,80 Q500,55 600,85 Q700,108 800,75 Q900,50 1000,80 L1000,120Z"
          fill="#0e0604"
          opacity="0.9"
        />
      </svg>

      <svg className="scene-cactus cactus-left-lg" width="50" height="110" viewBox="0 0 50 110" aria-hidden="true">
        <rect x="20" y="25" width="10" height="85" rx="5" fill="#1a3010" />
        <rect x="5" y="45" width="17" height="8" rx="4" fill="#1a3010" />
        <rect x="2" y="33" width="10" height="28" rx="5" fill="#1a3010" />
        <rect x="28" y="60" width="17" height="8" rx="4" fill="#1a3010" />
        <rect x="38" y="46" width="10" height="28" rx="5" fill="#1a3010" />
      </svg>
      <svg className="scene-cactus cactus-left-sm" width="30" height="70" viewBox="0 0 30 70" aria-hidden="true">
        <rect x="11" y="18" width="8" height="52" rx="4" fill="#1a3010" />
        <rect x="3" y="34" width="11" height="6" rx="3" fill="#1a3010" />
        <rect x="1" y="24" width="8" height="22" rx="4" fill="#1a3010" />
      </svg>
      <svg className="scene-cactus cactus-right-lg" width="50" height="110" viewBox="0 0 50 110" aria-hidden="true">
        <rect x="20" y="25" width="10" height="85" rx="5" fill="#1a3010" />
        <rect x="28" y="45" width="17" height="8" rx="4" fill="#1a3010" />
        <rect x="38" y="33" width="10" height="28" rx="5" fill="#1a3010" />
        <rect x="5" y="60" width="17" height="8" rx="4" fill="#1a3010" />
        <rect x="2" y="46" width="10" height="28" rx="5" fill="#1a3010" />
      </svg>
      <svg className="scene-cactus cactus-right-sm" width="30" height="70" viewBox="0 0 30 70" aria-hidden="true">
        <rect x="11" y="18" width="8" height="52" rx="4" fill="#1a3010" />
        <rect x="16" y="34" width="11" height="6" rx="3" fill="#1a3010" />
        <rect x="21" y="24" width="8" height="22" rx="4" fill="#1a3010" />
      </svg>

      <div className="battle-arena">
        <div className="agent-side left">
          <div className="agent-label al-task">Task Agent</div>
          <div className="agent-wrap">
            <SheriffPortrait className="agent-portrait" />
          </div>
          <div className="agent-name">{taskAgentType}</div>
          <div className="agent-policy">objective runner</div>
        </div>

        <div className="vs-center">
          <div className="vs-divider top" />
          <div className="vs-text">VS</div>
          <div className="vs-divider bot" />
        </div>

        <div className="agent-side right">
          <div className="agent-label al-red">Red-Team Agent</div>
          <div className="agent-wrap right-agent">
            <OutlawPortrait className="agent-portrait" />
          </div>
          <div className="agent-name">{redTeamType}</div>
          <div className="agent-policy red">attack planner</div>
        </div>
      </div>

      <div className="scene-ground" aria-hidden="true" />
    </section>
  );
}
