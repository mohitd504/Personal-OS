"use client";
import { useEffect, useRef, useState } from "react";
import { SCENARIOS, OPT } from "@/components/dashboard/data";
import { keys, parseScores, type ChatMsg, type EngDay } from "../english-core";
import { post } from "../api";
import { Busy, Empty, Md, MicButton, SaveSelection, StepHeader, useStored, type StepProps } from "../shared";

export default function SpeakStep({ date, topic, speech, onChange, saveWord, notify, scenarioRequest, onScenarioHandled }: StepProps & {
  scenarioRequest?: string | null; onScenarioHandled?: () => void;
}) {
  const [day, save] = useStored<EngDay>(keys.day(date), {}, onChange);
  const chat: ChatMsg[] = Array.isArray(day.chat) ? day.chat : [];
  const chatRef = useRef(chat);
  chatRef.current = chat;
  const [scenario, setScenario] = useState("Free conversation");
  const [pending, setPending] = useState<string | null>(null); // scenario waiting for "replace chat?" confirmation
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<"" | "chat" | "report">("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [chat.length]);

  const convTopic = (sc: string) => sc && sc !== "Free conversation" ? `Role-play scenario: ${sc}. Stay in character as the other person in this scenario.` : topic;

  const send = async (msgText: string | null, sc = scenario, base = chatRef.current) => {
    const first = msgText == null;
    if (!first && !msgText.trim()) return;
    const msgs: ChatMsg[] = first ? [] : [...base, { role: "user", content: msgText.trim() }];
    if (!first) { save({ chat: msgs }); setText(""); }
    setBusy("chat");
    const { data, error } = await post("/api/english-chat", { messages: msgs, topic: convTopic(sc) });
    setBusy("");
    if (!data?.reply) { notify(error || "Chat failed — try again.", "error"); return; }
    save({ chat: [...msgs, { role: "bot", content: data.reply, corrected: data.corrected || "", issues: Array.isArray(data.issues) ? data.issues : [] }] });
    speech.speak((data.corrected ? "Say: " + data.corrected + ". " : "") + data.reply);
  };

  const startScenario = (sc: string) => {
    setScenario(sc); setPending(null);
    save({ chat: [], report: "" });
    void send(null, sc, []);
  };
  const chooseScenario = (sc: string) => { if (chat.length) setPending(sc); else { setScenario(sc); } };

  // Scenario launched from the Scenarios tab.
  useEffect(() => {
    if (!scenarioRequest) return;
    if (chat.length) setPending(scenarioRequest); else startScenario(scenarioRequest);
    onScenarioHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioRequest]);

  const getReport = async () => {
    if (!chat.some((m) => m.role === "user")) { notify("Answer a few questions first.", "info"); return; }
    setBusy("report");
    const { data, error } = await post("/api/english-feedback", { messages: chat });
    setBusy("");
    if (data?.report) { save({ report: data.report }); notify("Session scored", "ok"); } else notify(error || "Couldn't score the session.", "error");
  };

  const scores = parseScores(day.report);
  const userTurns = chat.filter((m) => m.role === "user").length;

  return (
    <section className="step-card">
      <StepHeader step="speak" subtitle={scenario === "Free conversation" ? topic : `Role-play: ${scenario}`} actions={<>
        <button className="btn ghost sm" onClick={() => { speech.setVoiceOn(!speech.voiceOn); speech.stopVoice(); }} aria-pressed={speech.voiceOn}>{speech.voiceOn ? "🔊 Voice on" : "🔇 Voice off"}</button>
        {chat.length > 0 && <SaveSelection saveWord={saveWord} notify={notify} />}
      </>} />

      <div className="speak-bar">
        <label className="muted" htmlFor="eng-scenario">Scenario</label>
        <select id="eng-scenario" className="in" value={scenario} onChange={(e) => chooseScenario(e.target.value)}>
          {SCENARIOS.map((s) => <option key={s} value={s} style={OPT}>{s}</option>)}
        </select>
        <span className="muted speak-bar__turns">{userTurns} {userTurns === 1 ? "answer" : "answers"}{userTurns >= 4 || day.report ? " · ✓ step complete" : ` · ${4 - userTurns} more to complete`}</span>
      </div>

      {pending && (
        <div className="confirm">
          <span>Start <b>{pending}</b>? This replaces today's conversation.</span>
          <div className="row"><button className="btn sm" onClick={() => startScenario(pending)}>Start fresh</button><button className="btn ghost sm" onClick={() => setPending(null)}>Keep current</button></div>
        </div>
      )}

      {!chat.length ? (
        <Empty icon="💬" title="Talk with your coach" text="Your coach asks questions and chats naturally. Every answer gets a gentle correction — say it out loud or type it."
          action={<button className="btn" onClick={() => send(null)} disabled={busy === "chat"}>{busy === "chat" ? <Busy label="Starting…" /> : "▶ Start conversation"}</button>} />
      ) : (
        <div className="chat" aria-live="polite">
          {chat.map((m, i) => (
            <div key={i} className={`chat__row chat__row--${m.role}`}>
              {m.role === "bot" && (m.corrected || m.issues?.length) ? (
                <div className="fix-note">
                  {m.corrected && <div className="fix-note__say"><span>Better:</span> {m.corrected}</div>}
                  {m.issues?.map((it, j) => <div key={j} className="fix-note__issue">{/pronounc/i.test(it) ? "🗣️" : "•"} {it}</div>)}
                </div>
              ) : null}
              <div className={`bubble bubble--${m.role}`}>
                {m.content}
                {m.role === "bot" && <button className="bubble__play" onClick={() => speech.speak(m.content, true)} aria-label="Hear again">🔊</button>}
              </div>
            </div>
          ))}
          {busy === "chat" && <div className="chat__row chat__row--bot"><div className="bubble bubble--bot typing" aria-label="Coach is typing"><i /><i /><i /></div></div>}
          <div ref={endRef} />
        </div>
      )}

      {chat.length > 0 && (
        <div className="composer">
          <MicButton speech={speech} ctx="chat" onText={(t) => send(t)} label="Tap to answer" stopLabel="Tap to send" disabled={busy === "chat"} notify={notify} />
          <div className="composer__type">
            <input className="in" value={speech.listening && speech.ctx === "chat" ? speech.transcript : text} onChange={(e) => setText(e.target.value)} placeholder="…or type your answer" onKeyDown={(e) => { if (e.key === "Enter") send(text); }} disabled={speech.listening} aria-label="Your answer" />
            <button className="btn sm" onClick={() => send(text)} disabled={busy === "chat" || !text.trim()}>Send</button>
          </div>
          <div className="composer__end">
            <button className="btn ghost sm" onClick={getReport} disabled={busy === "report"}>{busy === "report" ? <Busy label="Scoring…" /> : "🏁 Finish & score"}</button>
            <button className="btn ghost sm" onClick={() => save({ chat: [], report: "" })}>Clear</button>
          </div>
        </div>
      )}

      {day.report && (
        <div className="report">
          <div className="report__scores">
            {([["Overall", scores.overall], ["Fluency", scores.fluency], ["Grammar", scores.grammar], ["Vocabulary", scores.vocabulary]] as const).map(([l, v]) => (
              <div key={l} className="score-chip"><span>{l}</span><b>{v ?? "—"}</b></div>
            ))}
            {scores.level && <div className="score-chip score-chip--level"><span>Level</span><b>{scores.level}</b></div>}
          </div>
          <Md text={day.report} />
        </div>
      )}
    </section>
  );
}
