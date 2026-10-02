'use client';

import { ChatMessage } from '@/lib/types';
import DoctorCard from './DoctorCard';
import HospitalCard from './HospitalCard';
import TriageCard from './TriageCard';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-wrapper ${isUser ? 'message-user' : 'message-assistant'}`}>
      {!isUser && <div className="message-avatar">🤖</div>}
      <div className={`message-content ${isUser ? 'bubble-user' : 'bubble-assistant'}`}>
        {/* Render message text with line breaks */}
        <div className="message-text">
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* Render tool result cards */}
        {message.toolResults && message.toolResults.length > 0 && (
          <div className="tool-results">
            {message.toolResults.map((result, idx) => {
              if (result.type === 'doctors' && result.data.found && result.data.doctors) {
                return (
                  <div key={idx} className="result-section">
                    {result.data.doctors.map((doc: any, dIdx: number) => (
                      <DoctorCard key={dIdx} doctor={doc} />
                    ))}
                  </div>
                );
              }
              if (result.type === 'hospitals' && result.data.found && result.data.hospitals) {
                return (
                  <div key={idx} className="result-section">
                    {result.data.hospitals.map((hosp: any, hIdx: number) => (
                      <HospitalCard key={hIdx} hospital={hosp} />
                    ))}
                  </div>
                );
              }
              if (result.type === 'triage' && result.data.urgencyLevel) {
                return <TriageCard key={idx} triage={result.data} />;
              }
              return null;
            })}
          </div>
        )}
      </div>
      {isUser && <div className="message-avatar user-avatar">👤</div>}
    </div>
  );
}
