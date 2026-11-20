import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { services } from "../data";
import { supabase } from "../lib/supabase";
import { workspaceEndpoint } from "../lib/workspaceApi";
import { FormField, inquiryMode } from "./ProjectInquiryForm";
import { field } from "./ui";

const panel = "min-w-0 rounded-3xl border border-slate-200 bg-white p-5 text-ink shadow-card sm:p-8";

function registrationError(code?: string) {
  switch (code) {
    case "weak_password":
      return "Choose a stronger password, then submit again.";
    case "over_request_rate_limit":
      return "Too many attempts. Please wait a few minutes before trying again.";
    case "email_address_invalid":
      return "Enter a valid email address.";
    default:
      return "We couldn’t complete your registration. Try again or contact Klexford.";
  }
}

function emailDeliveryUnavailable(error: { code?: string; status?: number; message: string }) {
  if (error.code === "email_address_not_authorized" || error.code === "email_address_not_allowed" ||
      error.code === "over_email_send_rate_limit") return true;
  if (!error.code && /email address (?:is )?not authori[sz]ed/i.test(error.message)) return true;
  if (!error.code && error.status === 429 && /email (?:send )?rate limit exceeded/i.test(error.message)) return true;
  return (!error.code || error.code === "unexpected_failure") && (error.status ?? 0) >= 500 &&
    /(?:error|fail(?:ed|ure)|unable) (?:to )?send(?:ing)? (?:a |the )?(?:confirmation|verification) (?:e-?mail|message)/i.test(error.message);
}

export function ExpertRegistrationForm() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [result, setResult] = useState<"email" | "registered" | "application" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const pendingApplication = useRef<{ profileKey: string; requestId: string } | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  async function register(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase || submitting.current || signedIn) return;
    const data = new FormData(e.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (password !== data.get("confirm")) {
      setError("The passwords must match.");
      return;
    }
    if (!text("display_name") || !text("bio") || !text("availability")) {
      setError("Enter your name, professional bio and availability.");
      return;
    }
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text("display_name"))) {
      setError("Enter a name you’d like to use publicly. Your email belongs in the account email field.");
      return;
    }
    let portfolio = "";
    if (text("portfolio_url")) {
      try {
        const url = new URL(text("portfolio_url"));
        if (url.protocol !== "https:" || url.username || url.password || url.href.length > 2048) throw new Error();
        portfolio = url.href;
      } catch {
        setError("Use a public HTTPS link for your portfolio.");
        return;
      }
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const profile = {
        display_name: text("display_name"),
        specialty: text("specialty"),
        bio: text("bio"),
        portfolio_url: portfolio,
        availability: text("availability"),
        time_zone: text("time_zone"),
      };
      const email = text("email");
      const profileKey = JSON.stringify({ email, ...profile });
      if (pendingApplication.current?.profileKey !== profileKey) {
        const { data: account, error: failure } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: new URL("/expert", window.location.origin).href,
            data: { expert_registration: true, ...profile },
          },
        });
        if (!failure || failure.code === "user_already_exists" || failure.code === "email_exists") {
          setResult(account.session ? "registered" : "email");
          return;
        }
        if (!emailDeliveryUnavailable(failure)) {
          setError(registrationError(failure.code));
          return;
        }
        pendingApplication.current = { profileKey, requestId: crypto.randomUUID() };
      }
      // Delivery failed. Send the profile for an administrator to review and invite.
      const delivery = await inquiryMode();
      if (delivery === "email") throw new Error("Intake unavailable.");
      const department = services.find(s => s.title === profile.specialty)?.slug;
      if (!department) { setError("Choose your specialty."); return; }
      const response = await fetch(workspaceEndpoint("inquiries", delivery === "edge"), {
        method: "POST",
        credentials: "omit",
        redirect: "error",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: pendingApplication.current.requestId, kind: "expert", name: profile.display_name, email,
          data: {
            expertRegistration: "true", department, experience: profile.bio, portfolio: profile.portfolio_url,
            availability: profile.availability, timeZone: profile.time_zone, source: "/become-an-expert",
          },
        }),
      });
      if (!response.ok || (await response.json()).ok !== true) {
        setError("We couldn’t submit your application. Please try again.");
        return;
      }
      setResult("application");
    } catch {
      setError("We couldn’t reach the registration service. Check your connection and try again.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  if (!supabase) return <div className={panel} role="status">Expert registration is currently unavailable.</div>;
  if (result) return <section className={panel} role="status">
    <h2 className="text-2xl font-semibold">{result === "email" ? "Check your email" : result === "application" ? "Application received" : "Registration received"}</h2>
    <p className="mt-3 text-slate-600">{result === "email"
      ? "For a new account, follow the confirmation link in your email. If you already have an account, sign in to check its status."
      : result === "application"
        ? "An administrator will review your application. If approved, the team will contact you with an invitation to set your password and open your workspace."
        : "You can check your registration status while an administrator reviews your profile."}</p>
    {result === "application" ? <Link to="/experts" className="btn-primary mt-5">Meet the experts <ArrowRight size={16}/></Link> :
      <Link to="/expert" className="btn-primary mt-5">{result === "email" ? "Expert sign-in" : "Check registration status"} <ArrowRight size={16}/></Link>}
  </section>;
  if (signedIn === null) return <p className={panel} role="status">Checking your account…</p>;
  if (signedIn && !busy) return <section className={panel}>
    <h2 className="text-2xl font-semibold">You’re signed in</h2>
    <p className="mt-3 text-slate-600">Open your workspace to see your account status.</p>
    <Link to="/expert" className="btn-primary mt-5">Go to workspace <ArrowRight size={16}/></Link>
  </section>;

  return <form onSubmit={register} className={panel + " space-y-7"}>
    <fieldset disabled={busy} className="min-w-0"><legend className="text-xl font-semibold">Public profile</legend>
      <p className="mb-4 mt-1 text-sm text-slate-600">Once you verify your email and an admin approves your registration, these details appear on the Team &amp; Experts page.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Display name"><input name="display_name" autoComplete="name" required maxLength={160} className={field}/></FormField>
        <FormField label="Specialty"><select name="specialty" required defaultValue="" className={field}>
          <option value="" disabled>Select your specialty</option>
          {services.map(s => <option key={s.slug} value={s.title}>{s.title}</option>)}
        </select></FormField>
        <FormField label="Professional bio" wide><textarea name="bio" rows={3} maxLength={600} required placeholder="Describe your work and relevant experience." className={field}/></FormField>
        <FormField label="Portfolio or professional profile (optional)" wide><input name="portfolio_url" type="url" autoComplete="url" placeholder="https://" maxLength={2048} className={field}/></FormField>
      </div>
    </fieldset>
    <fieldset disabled={busy} className="min-w-0"><legend className="text-xl font-semibold">Private application details</legend>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormField label="Availability"><input name="availability" required maxLength={160} placeholder="Start date or hours per week" className={field}/></FormField>
        <FormField label="Time zone (optional)"><input name="time_zone" maxLength={80} className={field}/></FormField>
        <FormField label="Account email" wide><input type="email" name="email" autoComplete="email" required maxLength={254} className={field}/></FormField>
        <FormField label="Password"><input type="password" name="password" autoComplete="new-password" minLength={8} required placeholder="At least 8 characters" className={field}/></FormField>
        <FormField label="Confirm password"><input type="password" name="confirm" autoComplete="new-password" minLength={8} required className={field}/></FormField>
      </div>
    </fieldset>
    {error && <p role="alert" className="inquiry-error">{error}</p>}
    <button className="btn-primary" disabled={busy} aria-busy={busy}>{busy ? "Registering…" : "Register as an expert"}{busy ? <LoaderCircle className="inquiry-spinner" size={16}/> : <ArrowRight size={16}/>}</button>
  </form>;
}
