"use client";
import { SCENARIOS } from "@/components/dashboard/data";

// Descriptions for the role-plays in SCENARIOS; unknown names still render with a default.
const INFO: Record<string, { icon: string; text: string; skills: string[] }> = {
  "Free conversation": { icon: "💬", text: "A relaxed chat about today's topic — the easiest way to warm up.", skills: ["fluency", "confidence"] },
  "Job interview": { icon: "💼", text: "Answer common interview questions about your experience, strengths and goals.", skills: ["past tenses", "formal tone"] },
  "Small talk / networking": { icon: "🤝", text: "Introduce yourself, find common ground and keep a conversation going.", skills: ["questions", "follow-ups"] },
  "At a restaurant": { icon: "🍽️", text: "Order food, ask about the menu, handle a wrong order politely.", skills: ["requests", "polite forms"] },
  "Business meeting": { icon: "📊", text: "Share updates, agree and disagree, and propose next steps.", skills: ["opinions", "hedging"] },
  "Travel & airport": { icon: "✈️", text: "Check in, ask for directions and sort out a delayed flight.", skills: ["questions", "problem solving"] },
  "Doctor's appointment": { icon: "🩺", text: "Describe symptoms, understand advice and ask about medicine.", skills: ["present perfect", "describing"] },
  "Debate a topic": { icon: "⚖️", text: "Defend an opinion, respond to counter-arguments and conclude.", skills: ["linking words", "persuasion"] },
  "Phone / customer service": { icon: "📞", text: "Make a complaint, explain a problem and ask for a solution by phone.", skills: ["clarity", "politeness"] },
  "Making friends": { icon: "😊", text: "Talk about hobbies, weekends and plans with someone new.", skills: ["casual English", "phrasal verbs"] },
  "Negotiation": { icon: "🤲", text: "Negotiate a price or a deadline and reach a compromise.", skills: ["conditionals", "persuasion"] },
  "Presentation Q&A": { icon: "🎤", text: "Handle questions after a presentation, including tough ones.", skills: ["clarifying", "structuring"] },
};

export default function Scenarios({ onStart }: { onStart: (scenario: string) => void }) {
  return (
    <div className="scenario-grid">
      {SCENARIOS.map((s) => {
        const info = INFO[s] || { icon: "🎭", text: "Role-play this situation with your coach.", skills: [] };
        return (
          <article key={s} className="scenario">
            <div className="scenario__icon" aria-hidden>{info.icon}</div>
            <h3>{s}</h3>
            <p>{info.text}</p>
            {info.skills.length > 0 && <div className="chips">{info.skills.map((k) => <span key={k} className="chip-tag">{k}</span>)}</div>}
            <button className="btn sm" onClick={() => onStart(s)}>▶ Start role-play</button>
          </article>
        );
      })}
    </div>
  );
}
