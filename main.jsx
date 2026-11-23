import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  BookOpen, GraduationCap, LayoutDashboard, Brain, ClipboardCheck,
  AlarmClock, Bell, Newspaper, Library, LogOut, Menu, X, Search,
  Send, Sparkles, Clock, CheckCircle2, CircleUserRound, Users,
  Plus, Trash2, ArrowRight, ShieldCheck, BookMarked, FileText,
  CalendarDays, ChevronRight, LockKeyhole, Mail, Eye, EyeOff
} from "lucide-react";
import "./style.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const logoUrl = "/complexlearn-logo.png";

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [demoUsers, setDemoUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cl_demo_users") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    if (!supabase) {
      const saved = localStorage.getItem("cl_demo_session");
      if (saved) {
        try { const parsed = JSON.parse(saved); setSession(parsed); setProfile(parsed); }
        catch { localStorage.removeItem("cl_demo_session"); }
      }
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) setProfile(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) return;
    const loadProfile = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      if (data) setProfile({ ...data, email: session.user.email });
      else setProfile({ id: session.user.id, email: session.user.email, full_name: session.user.email?.split("@")[0], role: "student" });
    };
    loadProfile();
  }, [session]);

  async function handleAuth(e) {
    e.preventDefault();
    setAuthError("");
    setAuthBusy(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const role = String(form.get("role") || "student");
    try {
      if (!email || password.length < 6) throw new Error("Enter a valid email and a password with at least 6 characters.");
      if (supabase) {
        if (authMode === "signup") {
          const { data, error } = await supabase.auth.signUp({
            email, password, options: { data: { full_name: name, role } }
          });
          if (error) throw error;
          if (data.session) {
            await supabase.from("profiles").upsert({ id: data.user.id, full_name: name, role });
            setProfile({ id: data.user.id, email, full_name: name, role });
          } else {
            setAuthError("Account created. Check your email to confirm it, then log in.");
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
        }
      } else {
        const users = JSON.parse(localStorage.getItem("cl_demo_users") || "[]");
        if (authMode === "signup") {
          if (!name) throw new Error("Please enter your name.");
          if (users.some(u => u.email === email)) throw new Error("An account with this email already exists.");
          const user = { id: crypto.randomUUID(), full_name: name, email, password, role };
          const next = [...users, user];
          localStorage.setItem("cl_demo_users", JSON.stringify(next));
          setDemoUsers(next);
          const safe = { id: user.id, full_name: name, email, role };
          localStorage.setItem("cl_demo_session", JSON.stringify(safe));
          setSession({ user: safe }); setProfile(safe);
        } else {
          const user = users.find(u => u.email === email && u.password === password);
          if (!user) throw new Error("Email or password is incorrect. Try creating a demo account first.");
          const safe = { id: user.id, full_name: user.full_name, email, role: user.role };
          localStorage.setItem("cl_demo_session", JSON.stringify(safe));
          setSession({ user: safe }); setProfile(safe);
        }
      }
    } catch (err) {
      setAuthError(err.message || "Something went wrong. Please try again.");
    } finally { setAuthBusy(false); }
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    else localStorage.removeItem("cl_demo_session");
    setSession(null); setProfile(null); setActive("dashboard");
  }

  if (!session) {
    return <AuthScreen mode={authMode} setMode={setAuthMode} onSubmit={handleAuth}
      error={authError} busy={authBusy} showPassword={showPassword}
      setShowPassword={setShowPassword} demo={!supabase} />;
  }

  const user = profile || session.user || {};
  const role = user.role || "student";
  const nav = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["ai", "AI Doubt Solver", Brain],
    ["tests", "Mock Tests", ClipboardCheck],
    ["planner", "Alarms & Reminders", AlarmClock],
    ["news", "Newspaper", Newspaper],
    ["library", "Digital Library", Library],
    ...(role === "teacher" ? [["teacher", "Teacher Corner", GraduationCap]] : [])
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand-row">
          <img src={logoUrl} alt="ComplexLearn logo" className="brand-logo" />
          <div><strong>ComplexLearn</strong><small>Learn Smarter, Grow Faster</small></div>
          <button className="icon-btn close-nav" onClick={() => setMobileNav(false)} aria-label="Close menu"><X /></button>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list">
          {nav.map(([id, label, Icon]) => (
            <button key={id} className={`nav-link ${active === id ? "active" : ""}`}
              onClick={() => { setActive(id); setMobileNav(false); }}>
              <Icon size={19} /><span>{label}</span>{active === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="secure-note"><ShieldCheck size={17}/><span>Your learning space</span></div>
          <button className="nav-link logout" onClick={logout}><LogOut size={18}/><span>Log out</span></button>
        </div>
      </aside>

      {mobileNav && <button className="scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu /></button>
          <div className="breadcrumb">ComplexLearn <ChevronRight size={14}/> <span>{nav.find(n => n[0] === active)?.[1] || "Dashboard"}</span></div>
          <div className="top-user">
            <div className="top-avatar">{(user.full_name || user.email || "C").slice(0,1).toUpperCase()}</div>
            <div className="top-user-text"><strong>{user.full_name || "Learner"}</strong><small>{role === "teacher" ? "Teacher" : "Student"}</small></div>
          </div>
        </header>
        <div className="page-content">
          {active === "dashboard" && <Dashboard user={user} role={role} setActive={setActive} />}
          {active === "ai" && <AiSolver />}
          {active === "tests" && <MockTests />}
          {active === "planner" && <Planner />}
          {active === "news" && <News />}
          {active === "library" && <DigitalLibrary />}
          {active === "teacher" && role === "teacher" && <TeacherCorner />}
        </div>
        <footer className="footer">© {new Date().getFullYear()} ComplexLearn · Learn Smarter, Grow Faster</footer>
      </main>
    </div>
  );
}

function AuthScreen({ mode, setMode, onSubmit, error, busy, showPassword, setShowPassword, demo }) {
  return <div className="auth-page">
    <div className="auth-left">
      <div className="auth-brand"><img src={logoUrl} alt="ComplexLearn" /><span>ComplexLearn</span></div>
      <div className="auth-hero">
        <span className="eyebrow"><Sparkles size={15}/> YOUR ALL-IN-ONE LEARNING SPACE</span>
        <h1>Learn smarter.<br/><em>Grow faster.</em></h1>
        <p>One place for curiosity, practice, planning and progress.</p>
        <div className="auth-points">
          <span><CheckCircle2/> AI-powered doubt support</span>
          <span><CheckCircle2/> Practice tests and learning tools</span>
          <span><CheckCircle2/> A library that travels with you</span>
        </div>
      </div>
      <div className="auth-left-foot">A brighter way to learn.</div>
    </div>
    <div className="auth-right">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="mobile-auth-logo"><img src={logoUrl} alt="ComplexLearn logo"/></div>
        <span className="eyebrow gold-text">{mode === "login" ? "WELCOME BACK" : "START YOUR JOURNEY"}</span>
        <h2>{mode === "login" ? "Sign in to your account" : "Create your account"}</h2>
        <p className="muted">{mode === "login" ? "Continue where your learning left off." : "Join ComplexLearn and build your learning habit."}</p>
        {mode === "signup" && <label>Full name<input name="name" placeholder="Enter your name" required autoComplete="name"/></label>}
        <label>Email address<div className="input-wrap"><Mail size={17}/><input name="email" type="email" placeholder="you@example.com" required autoComplete="email"/></div></label>
        <label>Password<div className="input-wrap"><LockKeyhole size={17}/><input name="password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" required minLength="6" autoComplete={mode === "login" ? "current-password" : "new-password"}/><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
        {mode === "signup" && <label>I am a
          <select name="role" defaultValue="student"><option value="student">Student</option><option value="teacher">Teacher</option></select>
        </label>}
        {error && <div className="error-box">{error}</div>}
        <button className="primary-btn full-btn" disabled={busy}>{busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"} <ArrowRight size={18}/></button>
        <div className="auth-switch">{mode === "login" ? "New to ComplexLearn?" : "Already have an account?"} <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Create account" : "Sign in"}</button></div>
        {demo && <div className="demo-notice"><ShieldCheck size={16}/><span><b>Demo mode:</b> accounts are saved only in this browser. Connect Supabase before public launch.</span></div>}
      </form>
    </div>
  </div>;
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Dashboard({ user, role, setActive }) {
  const firstName = (user.full_name || "Learner").split(" ")[0];
  const quick = [
    ["ai", Brain, "Ask AI", "Get help understanding a topic", "violet"],
    ["tests", ClipboardCheck, "Take a mock test", "Practice and check your progress", "blue"],
    ["planner", AlarmClock, "Plan your day", "Set an alarm or reminder", "gold"],
    ["library", Library, "Open library", "Explore learning resources", "green"]
  ];
  return <>
    <section className="welcome-banner">
      <div><span className="eyebrow light-eyebrow">YOUR LEARNING JOURNEY</span><h1>Good to see you, {firstName}.</h1><p>{role === "teacher" ? "Create a supportive space where students can learn and grow." : "Small steps every day lead to big achievements. What will you learn today?"}</p><button className="banner-btn" onClick={() => setActive(role === "teacher" ? "teacher" : "ai")}>{role === "teacher" ? "Open Teacher Corner" : "Ask a question"} <ArrowRight size={17}/></button></div>
      <div className="banner-art"><div className="art-circle"><GraduationCap size={76}/></div><span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✧</span></div>
    </section>
    <div className="section-title"><div><h2>Your workspace</h2><p>Everything you need, in one place.</p></div></div>
    <div className="quick-grid">{quick.map(([id, Icon, title, desc, color]) => <button className="quick-card" key={id} onClick={() => setActive(id)}><div className={`quick-icon ${color}`}><Icon size={22}/></div><h3>{title}</h3><p>{desc}</p><span className="card-arrow"><ArrowRight size={17}/></span></button>)}</div>
    <div className="bottom-grid">
      <div className="panel"><div className="panel-head"><div><h3>Learning tip</h3><p>A little guidance for today</p></div><Sparkles size={20}/></div><div className="tip-content"><div className="tip-icon"><BookOpen/></div><div><b>Try active recall</b><p>After reading a topic, close your book and explain the main ideas in your own words. It helps you check what you really understand.</p></div></div></div>
      <div className="panel"><div className="panel-head"><div><h3>Daily intention</h3><p>Make today count</p></div><CalendarDays size={20}/></div><p className="intention">“Progress is built one focused session at a time.”</p><button className="text-btn" onClick={() => setActive("planner")}>Plan a study session <ArrowRight size={15}/></button></div>
    </div>
  </>;
}

function AiSolver() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function ask(e) {
    e.preventDefault(); if (!question.trim()) return;
    setBusy(true); setError(""); setAnswer("");
    try {
      const response = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI service is not configured yet.");
      setAnswer(data.answer || "I couldn't create an answer. Please try again.");
    } catch (err) {
      setError(err.message + " You can still use the question box, but an administrator must configure the AI key on the server.");
    } finally { setBusy(false); }
  }
  return <>
    <PageHeading eyebrow="LEARN WITH CONFIDENCE" title="AI Doubt Solver" description="Ask a question and get a clear, step-by-step explanation."/>
    <div className="ai-layout">
      <div className="ai-main panel">
        <div className="ai-title"><div className="ai-orb"><Brain/></div><div><h2>What would you like to understand?</h2><p>Ask about a school subject, concept or problem.</p></div></div>
        <form onSubmit={ask}>
          <label className="question-label" htmlFor="question">Your question</label>
          <textarea id="question" value={question} onChange={e => setQuestion(e.target.value)} placeholder="For example: Explain photosynthesis in simple steps..." rows="5" maxLength="3000"/>
          <div className="form-foot"><span>{question.length}/3000 characters</span><button className="primary-btn" disabled={busy || !question.trim()}>{busy ? "Thinking..." : "Get explanation"} <Send size={17}/></button></div>
        </form>
        {error && <div className="error-box">{error}</div>}
        {answer && <div className="answer-box"><div className="answer-head"><Sparkles size={18}/> Explanation</div><div className="answer-text">{answer}</div></div>}
      </div>
      <aside className="panel ai-side"><h3>Get better answers</h3><ul><li>Ask one question at a time.</li><li>Mention your class or subject if useful.</li><li>Ask for an example when a topic feels difficult.</li><li>Check important answers with your teacher or textbook.</li></ul><div className="ai-side-note"><ShieldCheck size={18}/> Don't enter passwords or private information.</div></aside>
    </div>
  </>;
}

const quizQuestions = [
  { q: "Which part of a plant mainly absorbs water from the soil?", options: ["Leaves", "Roots", "Flowers", "Stem"], correct: 1, explain: "Roots absorb water and minerals from the soil." },
  { q: "What is 12 × 8?", options: ["86", "92", "96", "108"], correct: 2, explain: "12 multiplied by 8 equals 96." },
  { q: "Which gas do plants take in during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], correct: 2, explain: "Plants use carbon dioxide, water and light to make food." },
  { q: "A noun is a word that names a…", options: ["Person, place, thing or idea", "Action only", "Describing word", "Sound only"], correct: 0, explain: "A noun names a person, place, thing or idea." },
  { q: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correct: 1, explain: "A hexagon has six sides." }
];

function MockTests() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const score = quizQuestions.reduce((n, q, i) => n + (answers[i] === q.correct ? 1 : 0), 0);
  function reset() { setStarted(false); setIndex(0); setAnswers({}); setFinished(false); }
  if (!started) return <>
    <PageHeading eyebrow="PRACTICE MAKES PROGRESS" title="Mock Tests" description="Build confidence with short practice quizzes."/>
    <div className="test-card panel"><div className="test-illustration"><ClipboardCheck size={54}/></div><div className="test-info"><span className="pill">GENERAL KNOWLEDGE & BASICS</span><h2>Quick Learning Check</h2><p>A short five-question practice test covering science, maths and English basics.</p><div className="test-meta"><span><FileText size={16}/> 5 questions</span><span><Clock size={16}/> About 5 minutes</span></div><button className="primary-btn" onClick={() => setStarted(true)}>Start test <ArrowRight size={17}/></button></div></div>
  </>;
  if (finished) return <div className="panel result-card"><div className="result-icon"><CheckCircle2 size={42}/></div><span className="eyebrow">TEST COMPLETED</span><h1>{score} / {quizQuestions.length}</h1><h2>{score >= 4 ? "Excellent effort!" : "Good practice!"}</h2><p>You answered {score} questions correctly. Review the explanations and keep learning.</p><div className="review-list">{quizQuestions.map((q,i)=><div className="review-item" key={i}><b>{i+1}. {q.q}</b><p className={answers[i] === q.correct ? "correct-text" : "wrong-text"}>{answers[i] === q.correct ? "Correct" : "Not quite"} — {q.explain}</p></div>)}</div><button className="primary-btn" onClick={reset}>Try again</button></div>;
  const q = quizQuestions[index];
  return <div className="panel quiz-panel"><div className="quiz-top"><span className="pill">QUICK LEARNING CHECK</span><span>Question {index+1} of {quizQuestions.length}</span></div><div className="progress-track"><div style={{width: `${(index+1)/quizQuestions.length*100}%`}}/></div><h2>{q.q}</h2><div className="option-list">{q.options.map((option,i)=><button key={option} className={`option-btn ${answers[index] === i ? "selected" : ""}`} onClick={() => setAnswers({...answers, [index]: i})}><span>{String.fromCharCode(65+i)}</span>{option}</button>)}</div><div className="quiz-actions"><button className="secondary-btn" onClick={() => index ? setIndex(index-1) : reset()}>{index ? "Previous" : "Exit test"}</button><button className="primary-btn" disabled={answers[index] === undefined} onClick={() => index === quizQuestions.length-1 ? setFinished(true) : setIndex(index+1)}>{index === quizQuestions.length-1 ? "Finish test" : "Next question"} <ArrowRight size={16}/></button></div></div>;
}

function Planner() {
  const [reminders, setReminders] = useState(() => { try { return JSON.parse(localStorage.getItem("cl_reminders") || "[]"); } catch { return []; } });
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => localStorage.setItem("cl_reminders", JSON.stringify(reminders)), [reminders]);
  function addReminder(e) {
    e.preventDefault();
    if (!title.trim() || !date || !time) return;
    setReminders([...reminders, { id: crypto.randomUUID(), title: title.trim(), date, time, done: false }].sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time)));
    setTitle(""); setDate(""); setTime(""); setNotice("Reminder saved in this browser.");
  }
  async function enableNotifications() {
    if (!("Notification" in window)) { setNotice("Notifications are not supported in this browser."); return; }
    const permission = await Notification.requestPermission();
    setNotice(permission === "granted" ? "Browser notifications are enabled. Keep this site open for reminder alerts." : "Notification permission was not granted.");
  }
  return <>
    <PageHeading eyebrow="MAKE TIME FOR WHAT MATTERS" title="Alarms & Reminders" description="Organise study sessions, homework and important dates." action={<button className="secondary-btn" onClick={enableNotifications}><Bell size={16}/> Enable notifications</button>}/>
    <div className="planner-grid"><form className="panel reminder-form" onSubmit={addReminder}><div className="panel-head"><div><h3>New reminder</h3><p>Choose a date and time.</p></div><AlarmClock/></div><label>Reminder title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Revise maths chapter" required maxLength="100"/></label><div className="two-fields"><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label><label>Time<input type="time" value={time} onChange={e=>setTime(e.target.value)} required/></label></div><button className="primary-btn full-btn">Save reminder <Plus size={17}/></button>{notice && <p className="muted small">{notice}</p>}</form><div className="panel"><div className="panel-head"><div><h3>Your reminders</h3><p>{reminders.length} saved</p></div><CalendarDays/></div>{reminders.length === 0 ? <div className="empty-state"><AlarmClock size={34}/><b>No reminders yet</b><span>Add a study reminder to get started.</span></div> : <div className="reminder-list">{reminders.map(r=><div className={`reminder-item ${r.done?"done":""}`} key={r.id}><button className="check-btn" onClick={()=>setReminders(reminders.map(x=>x.id===r.id?{...x,done:!x.done}:x))}><CheckCircle2/></button><div><b>{r.title}</b><small>{r.date} · {r.time}</small></div><button className="icon-btn danger" onClick={()=>setReminders(reminders.filter(x=>x.id!==r.id))} aria-label="Delete reminder"><Trash2 size={17}/></button></div>)}</div>}</div></div>
    <p className="muted small">Note: reminders are stored in this browser. This starter version does not send alerts when the website is closed.</p>
  </>;
}

function News() {
  const items = [
    ["Google News – Education", "Browse education headlines and current affairs.", "https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZ4ZERBU0FtVnVLQUFQAQ?hl=en-IN&gl=IN&ceid=IN%3Aen", "Education"],
    ["The Hindu – Education", "Education news, policy and student updates.", "https://www.thehindu.com/education/", "Education"],
    ["ScienceDaily", "Read discoveries and science updates.", "https://www.sciencedaily.com/", "Science"],
    ["NASA – News", "Explore space, science and mission updates.", "https://www.nasa.gov/news/", "Science"]
  ];
  return <><PageHeading eyebrow="STAY CURIOUS" title="Newspaper & Updates" description="Explore trusted news and learning updates from external publishers."/><div className="news-grid">{items.map(([title,desc,url,tag])=><a className="news-card panel" href={url} target="_blank" rel="noreferrer" key={title}><span className="pill">{tag}</span><div className="news-icon"><Newspaper/></div><h3>{title}</h3><p>{desc}</p><span className="text-btn">Read latest <ArrowRight size={15}/></span></a>)}</div><p className="muted small">Links open publisher websites. ComplexLearn does not republish their articles.</p></>;
}

function DigitalLibrary() {
  const resources = [
    ["Khan Academy", "Free lessons and practice in maths, science and more.", "https://www.khanacademy.org/", "Lessons"],
    ["NCERT Textbooks", "Official NCERT textbook portal.", "https://ncert.nic.in/textbook.php", "Textbooks"],
    ["DIKSHA", "Digital learning resources from India's education platform.", "https://diksha.gov.in/", "Learning"],
    ["Project Gutenberg", "Explore public-domain books and literature.", "https://www.gutenberg.org/", "Books"],
    ["PhET Simulations", "Interactive science and maths simulations.", "https://phet.colorado.edu/", "Science"]
  ];
  return <><PageHeading eyebrow="READ · EXPLORE · DISCOVER" title="Digital Library" description="A starting collection of free educational resources."/><div className="library-grid">{resources.map(([title,desc,url,tag])=><a className="resource-card panel" href={url} target="_blank" rel="noreferrer" key={title}><div className="resource-icon"><BookMarked/></div><span className="pill">{tag}</span><h3>{title}</h3><p>{desc}</p><span className="text-btn">Open resource <ArrowRight size={15}/></span></a>)}</div></>;
}

function TeacherCorner() {
  const [announcement, setAnnouncement] = useState("");
  const [saved, setSaved] = useState("");
  return <><PageHeading eyebrow="TEACHER WORKSPACE" title="Teacher Corner" description="A simple space to prepare learning activities and class announcements."/><div className="teacher-grid"><div className="panel"><div className="panel-head"><div><h3>Class announcement</h3><p>Draft a message for your students.</p></div><Users/></div><textarea rows="5" value={announcement} onChange={e=>setAnnouncement(e.target.value)} placeholder="Write an announcement..."/><button className="primary-btn" disabled={!announcement.trim()} onClick={()=>setSaved(announcement)}>Save draft</button>{saved && <div className="answer-box"><b>Saved draft</b><p>{saved}</p><small>Stored for this page session only.</small></div>}</div><div className="panel"><div className="panel-head"><div><h3>Teaching checklist</h3><p>Plan your next lesson.</p></div><ClipboardCheck/></div><ul className="teacher-list"><li>Set a clear learning objective</li><li>Prepare examples and activities</li><li>Check student understanding</li><li>Share follow-up resources</li></ul></div></div></>;
}

createRoot(document.getElementById("root")).render(<App />);
