import React from "react";
import { createPortal } from "react-dom";
import { ClipboardList, Keyboard, Mic2 } from "lucide-react";
import { AppLanguage, useLanguage } from "../i18n";
import {
  createIntroProfileDraft,
  saveIntroProfile,
} from "../utils/introProfile";

export const VOICE_FIRST_ENTRY_SEEN_KEY = "rhythm_voice_entry_seen_v1";
export const PROFILE_INTRO_KEY = "rhythm_intro_profile_v1";

export function voiceFirstEntryCopy(language: AppLanguage) {
  if (language === "ar")
    return {
      prompt: "ما الذي أتى بك إلينا؟ احكِ لي قليلاً عنك.",
      helper: "قبل أن تبدأ، أحتاج أن أعرفك قليلاً. اختر الطريقة الأسهل لك.",
      start: "ابدأ بالكلام",
      type: "أفضل الكتابة",
      form: "نموذج سريع",
      hint: "يمكنك التحدث بحرية، الكتابة بحرية، أو الإجابة عن بعض الأسئلة القصيرة.",
      formTitle: "أخبرني بسرعة عن وضعك الآن",
      formHelp: "لا نحتاج إلى الكمال — فقط نقطة بداية تساعد ريثم على فهمك.",
      goal: "ما الذي تريد تغييره أو فهمه؟",
      weight: "الوزن (اختياري)",
      weightError: "أدخل وزناً صالحاً مثل 72 أو 72.5",
      hunger: "الجوع الآن",
      energy: "الطاقة الآن",
      rhythm: "نمط الأكل",
      low: "منخفض",
      high: "مرتفع",
      regular: "منتظم غالباً",
      irregular: "غير منتظم غالباً",
      mixed: "يختلف من يوم لآخر",
      save: "ابدأ مع ريثم",
      back: "رجوع",
      kg: "كغ",
    };
  if (language === "de")
    return {
      prompt: "Was führt dich zu uns? Erzähl ein bisschen von dir.",
      helper:
        "Bevor du startest, möchte Moment dich kurz kennenlernen. Wähle den Weg, der für dich am leichtesten ist.",
      start: "Erzählen",
      type: "Frei schreiben",
      form: "Kurzformular",
      hint: "Du kannst frei reden, frei schreiben oder ein paar kurze Fragen beantworten.",
      formTitle: "Gib Moment einen kurzen Ausgangspunkt",
      formHelp:
        "Es muss nicht perfekt sein. Ein paar Angaben reichen, damit dein Start persönlich wird.",
      goal: "Was möchtest du verändern oder besser verstehen?",
      weight: "Gewicht (optional)",
      weightError: "Bitte gib ein gültiges Gewicht ein, z. B. 72 oder 72,5.",
      hunger: "Hunger gerade",
      energy: "Energie gerade",
      rhythm: "Essrhythmus",
      low: "Niedrig",
      high: "Hoch",
      regular: "Meist regelmäßig",
      irregular: "Oft unregelmäßig",
      mixed: "Unterschiedlich",
      save: "Mit Moment starten",
      back: "Zurück",
      kg: "kg",
    };
  if (language === "fr")
    return {
      prompt: "Qu’est-ce qui t’amène ici ? Parle-moi un peu de toi.",
      helper:
        "Avant de commencer, Moment a besoin de te connaître un peu. Choisis la façon la plus simple pour toi.",
      start: "Raconter",
      type: "Écrire librement",
      form: "Formulaire rapide",
      hint: "Tu peux parler librement, écrire librement ou répondre à quelques questions courtes.",
      formTitle: "Donne à Moment un point de départ",
      formHelp:
        "Pas besoin que ce soit parfait. Quelques informations suffisent pour personnaliser ton départ.",
      goal: "Que veux-tu changer ou mieux comprendre ?",
      weight: "Poids (facultatif)",
      weightError: "Saisis un poids valide, par exemple 72 ou 72,5.",
      hunger: "Faim maintenant",
      energy: "Énergie maintenant",
      rhythm: "Rythme des repas",
      low: "Faible",
      high: "Élevé",
      regular: "Plutôt régulier",
      irregular: "Souvent irrégulier",
      mixed: "Variable",
      save: "Commencer avec Moment",
      back: "Retour",
      kg: "kg",
    };
  return {
    prompt: "What brings you here? Tell me a little about you.",
    helper:
      "Before you start, Moment needs a little context. Choose the easiest way for you.",
    start: "Tell me",
    type: "Write freely",
    form: "Quick form",
    hint: "You can speak freely, write freely, or answer a few short questions.",
    formTitle: "Give Moment a quick starting point",
    formHelp:
      "It does not need to be perfect. A few details are enough to make your start personal.",
    goal: "What would you like to change or understand better?",
    weight: "Weight (optional)",
    weightError: "Enter a valid weight, for example 72 or 72.5.",
    hunger: "Hunger right now",
    energy: "Energy right now",
    rhythm: "Eating rhythm",
    low: "Low",
    high: "High",
    regular: "Mostly regular",
    irregular: "Often irregular",
    mixed: "Varies day to day",
    save: "Start with Moment",
    back: "Back",
    kg: "kg",
  };
}

export function parseOnboardingWeight(
  value: string,
): number | null | undefined {
  const raw = value.trim();
  if (!raw) return undefined;
  const normalized = raw
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\u066B/g, ".");
  if (!/^\d{1,3}(?:[.,]\d{1,2})?$/.test(normalized)) return null;
  const parsed = Number(normalized.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 20 && parsed <= 400
    ? parsed
    : null;
}
export function sanitizeOnboardingWeightInput(value: string): string {
  return value
    .replace(/[^0-9\u0660-\u0669\u06F0-\u06F9.,\u066B]/g, "")
    .slice(0, 6);
}
export function getOnboardingWeightSelection(
  value: string,
  selection: number | null,
  previousValue = "",
): number {
  const sanitized = sanitizeOnboardingWeightInput(value);
  // Chromium can report selectionStart=0 for the first input event in a
  // freshly focused controlled field. Restoring that stale position would
  // put the next digit before the first (82 becomes 28), even with dir=ltr.
  // Only correct this initial insertion; preserve deliberate edits later.
  if (!previousValue && sanitized && selection === 0) {
    return sanitized.length;
  }
  return sanitizeOnboardingWeightInput(
    value.slice(0, selection ?? value.length),
  ).length;
}
export function resolveOnboardingWeightSelectionBeforeInput(
  tracked: { start: number | null; end: number | null } | null,
  reportedStart: number | null,
  reportedEnd: number | null,
): { start: number | null; end: number | null } {
  // React's last onSelect snapshot can lag behind the browser caret after
  // the first digit. A collapsed native caret that has advanced must not be
  // replaced by that stale zero (typing 8 then 2 would otherwise become 28).
  // Keep deliberate Home/Arrow edits: onKeyUp refreshes the tracked position.
  if (
    tracked &&
    tracked.start !== null &&
    tracked.end !== null &&
    reportedStart !== null &&
    reportedEnd !== null &&
    tracked.start === tracked.end &&
    reportedStart === reportedEnd
  ) {
    const caret = Math.max(tracked.start, reportedStart);
    return { start: caret, end: caret };
  }
  return {
    start: tracked?.start ?? reportedStart,
    end: tracked?.end ?? reportedEnd,
  };
}
export function reconcileOnboardingWeightInput(
  previousValue: string,
  rawValue: string,
  inputType: string,
  data: string | null,
  selectionStartBefore: number | null,
  selectionEndBefore: number | null,
): { value: string; selection: number } {
  if (
    inputType === "insertText" &&
    data &&
    selectionStartBefore !== null &&
    selectionEndBefore !== null
  ) {
    const inserted = sanitizeOnboardingWeightInput(data);
    const start = Math.max(0, Math.min(previousValue.length, selectionStartBefore));
    const end = Math.max(start, Math.min(previousValue.length, selectionEndBefore));
    const value = sanitizeOnboardingWeightInput(
      previousValue.slice(0, start) + inserted + previousValue.slice(end),
    );
    return { value, selection: start + inserted.length };
  }
  const value = sanitizeOnboardingWeightInput(rawValue);
  return {
    value,
    selection: getOnboardingWeightSelection(
      rawValue,
      selectionEndBefore,
      previousValue,
    ),
  };
}
export function shouldShowVoiceFirstEntry(storage: Pick<Storage, "getItem">) {
  return !storage.getItem(PROFILE_INTRO_KEY);
}
export function getModalFocusTargetIndex(
  activeIndex: number,
  focusableCount: number,
  shiftKey: boolean,
): number | null {
  if (focusableCount <= 0) return null;
  if (activeIndex < 0) return shiftKey ? focusableCount - 1 : 0;
  if (shiftKey && activeIndex === 0) return focusableCount - 1;
  if (!shiftKey && activeIndex === focusableCount - 1) return 0;
  return null;
}
interface Props {
  onStart: () => void;
  onType: () => void;
}
export type FormState = {
  goal: string;
  weight: string;
  hunger: number;
  energy: number;
  rhythm: "regular" | "irregular" | "mixed";
};
type TouchedState = { hunger: boolean; energy: boolean; rhythm: boolean };
export const updateOnboardingForm = <K extends keyof FormState>(
  current: FormState,
  key: K,
  value: FormState[K],
): FormState => ({ ...current, [key]: value });
export const VoiceFirstEntryOverlay: React.FC<Props> = ({
  onStart,
  onType,
}) => {
  const { language } = useLanguage();
  const copy = voiceFirstEntryCopy(language);
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const micRef = React.useRef<HTMLButtonElement | null>(null);
  const formRef = React.useRef<HTMLButtonElement | null>(null);
  const goalRef = React.useRef<HTMLTextAreaElement | null>(null);
  const weightBeforeInputRef = React.useRef<{
    value: string;
    start: number | null;
    end: number | null;
  } | null>(null);
  const weightSelectionRef = React.useRef<{
    start: number | null;
    end: number | null;
  } | null>(null);
  const returnToFormTriggerRef = React.useRef(false);
  const submitInFlightRef = React.useRef(false);
  const [isOpen, setIsOpen] = React.useState(() => {
    try {
      return shouldShowVoiceFirstEntry(localStorage);
    } catch {
      return true;
    }
  });
  const [portalReady, setPortalReady] = React.useState(false);
  const [mode, setMode] = React.useState<"choice" | "form">("choice");
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<FormState>({
    goal: "",
    weight: "",
    hunger: 3,
    energy: 3,
    rhythm: "mixed",
  });
  const [touched, setTouched] = React.useState<TouchedState>({
    hunger: false,
    energy: false,
    rhythm: false,
  });
  const parsedWeight = parseOnboardingWeight(form.weight);
  const weightInvalid = parsedWeight === null;
  React.useEffect(() => setPortalReady(true), []);
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const syncGate = () => {
      let hasProfile = false;
      try {
        hasProfile = Boolean(localStorage.getItem(PROFILE_INTRO_KEY));
      } catch {}
      if (hasProfile) {
        setIsOpen(false);
        return;
      }
      const downstream = Boolean(
        document.querySelector(
          '[data-profile-onboarding="true"], [data-testid="profile-intro-modal"]',
        ),
      );
      if (!downstream) setIsOpen(true);
    };
    const observer = new MutationObserver(syncGate);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("storage", syncGate);
    return () => {
      observer.disconnect();
      window.removeEventListener("storage", syncGate);
    };
  }, []);
  React.useEffect(() => {
    if (!isOpen || !portalReady || typeof document === "undefined") return;
    const root = document.getElementById("root");
    const previousOverflow = document.body.style.overflow;
    const previousAriaHidden = root?.getAttribute("aria-hidden");
    const wasInert = root?.hasAttribute("inert") ?? false;
    document.body.style.overflow = "hidden";
    root?.setAttribute("inert", "");
    root?.setAttribute("aria-hidden", "true");
    const frame = window.requestAnimationFrame(() => {
      if (mode === "form") {
        goalRef.current?.focus({ preventScroll: true });
        return;
      }
      const target = returnToFormTriggerRef.current
        ? formRef.current
        : micRef.current;
      returnToFormTriggerRef.current = false;
      target?.focus({ preventScroll: true });
    });
    const keepFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusableNodes = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      const focusable = Array.from<HTMLElement>(focusableNodes ?? []).filter(
        (element) =>
          element.getAttribute("aria-hidden") !== "true" &&
          !element.hasAttribute("hidden"),
      );
      const activeIndex = focusable.indexOf(
        document.activeElement as HTMLElement,
      );
      const targetIndex = getModalFocusTargetIndex(
        activeIndex,
        focusable.length,
        event.shiftKey,
      );
      if (targetIndex === null) return;
      event.preventDefault();
      focusable[targetIndex]?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", keepFocus, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", keepFocus, true);
      document.body.style.overflow = previousOverflow;
      if (root) {
        if (!wasInert) root.removeAttribute("inert");
        if (previousAriaHidden === null) root.removeAttribute("aria-hidden");
        else root.setAttribute("aria-hidden", previousAriaHidden);
      }
    };
  }, [isOpen, portalReady, mode]);
  if (!isOpen || !portalReady || typeof document === "undefined") return null;
  const start = () => {
    setIsOpen(false);
    onStart();
  };
  const type = () => {
    setIsOpen(false);
    onType();
  };
  const submitForm = async () => {
    if (
      !form.goal.trim() ||
      saving ||
      weightInvalid ||
      submitInFlightRef.current
    )
      return;
    submitInFlightRef.current = true;
    setSaving(true);
    try {
      const parts = [form.goal.trim()];
      if (touched.hunger) parts.push(`${copy.hunger}: ${form.hunger}/5`);
      if (touched.energy) parts.push(`${copy.energy}: ${form.energy}/5`);
      if (touched.rhythm) {
        const rhythmLabel =
          form.rhythm === "regular"
            ? copy.regular
            : form.rhythm === "irregular"
              ? copy.irregular
              : copy.mixed;
        parts.push(`${copy.rhythm}: ${rhythmLabel}`);
      }
      if (parsedWeight !== undefined)
        parts.push(`${copy.weight}: ${parsedWeight} ${copy.kg}`);
      const draft = await createIntroProfileDraft(parts.join(". "), language);
      saveIntroProfile(draft);
      setIsOpen(false);
    } finally {
      submitInFlightRef.current = false;
      setSaving(false);
    }
  };
  return createPortal(
    <div
      ref={dialogRef}
      data-testid="voice-first-entry-overlay"
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#211F1B]/72 px-5 py-8 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-first-entry-title"
      aria-describedby="voice-first-entry-description"
    >
      <section
        className="w-full max-w-md"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        {mode === "choice" ? (
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-white/65">
              {language === "ar" ? "ريثم" : "Moment"}
            </p>
            <h1
              id="voice-first-entry-title"
              className="mt-5 text-4xl font-display font-black leading-tight text-white sm:text-5xl"
            >
              {copy.prompt}
            </h1>
            <p
              id="voice-first-entry-description"
              className="mx-auto mt-4 max-w-sm text-base font-medium leading-7 text-white/75"
            >
              {copy.helper}
            </p>
            <div className="mt-8 flex justify-center">
              <button
                ref={micRef}
                data-testid="voice-first-entry-mic"
                type="button"
                onClick={start}
                aria-label={copy.start}
                className="group relative grid h-28 w-28 place-items-center rounded-full bg-[#F4EEE4] text-[#293D34] shadow-[0_24px_80px_rgba(0,0,0,.38)] outline-none transition-transform active:scale-95 focus-visible:ring-4 focus-visible:ring-white/70"
              >
                <Mic2 className="relative h-11 w-11 stroke-[2.2]" />
              </button>
            </div>
            <p className="mx-auto mt-5 max-w-sm text-sm font-bold leading-6 text-white/80">
              {copy.hint}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                data-testid="voice-first-entry-type"
                type="button"
                onClick={type}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/30 px-4 py-3 text-sm font-black text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <Keyboard className="h-4 w-4" />
                {copy.type}
              </button>
              <button
                ref={formRef}
                data-testid="voice-first-entry-form"
                type="button"
                onClick={() => setMode("form")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/30 px-4 py-3 text-sm font-black text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <ClipboardList className="h-4 w-4" />
                {copy.form}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[30px] bg-[#FCFAF6] p-5 shadow-2xl sm:p-7">
            <button
              data-testid="voice-first-entry-back"
              type="button"
              onClick={() => {
                returnToFormTriggerRef.current = true;
                setMode("choice");
              }}
              className="min-h-11 rounded-full px-2 text-sm font-black text-[#556057]"
            >
              ← {copy.back}
            </button>
            <h1
              id="voice-first-entry-title"
              className="mt-3 text-3xl font-display font-black leading-tight text-[#252824]"
            >
              {copy.formTitle}
            </h1>
            <p
              id="voice-first-entry-description"
              className="mt-2 text-sm font-medium leading-6 text-[#747067]"
            >
              {copy.formHelp}
            </p>
            <label className="mt-5 block text-sm font-black text-[#3D403A]">
              {copy.goal}
              <textarea
                ref={goalRef}
                data-testid="onboarding-goal"
                rows={3}
                value={form.goal}
                onChange={(e) =>
                  setForm((current) =>
                    updateOnboardingForm(current, "goal", e.target.value),
                  )
                }
                className="mt-2 w-full resize-none rounded-2xl border border-[#DDD5C9] bg-white px-4 py-3 font-medium outline-none focus:border-[#293D34]"
              />
            </label>
            <label className="mt-4 block text-sm font-black text-[#3D403A]">
              {copy.weight}
              <div className="mt-2 flex items-center gap-2">
                <input
                  data-testid="onboarding-weight"
                  inputMode="decimal"
                  dir="ltr"
                  defaultValue={form.weight}
                  aria-invalid={weightInvalid || undefined}
                  aria-describedby={
                    weightInvalid ? "onboarding-weight-error" : undefined
                  }
                  onFocus={(e) => {
                    const input = e.currentTarget;
                    weightSelectionRef.current = {
                      start: input.selectionStart,
                      end: input.selectionEnd,
                    };
                  }}
                  onSelect={(e) => {
                    const input = e.currentTarget;
                    weightSelectionRef.current = {
                      start: input.selectionStart,
                      end: input.selectionEnd,
                    };
                  }}
                  onKeyUp={(e) => {
                    // Capture the settled caret after typing or keyboard
                    // navigation (including Home) instead of trusting a
                    // possibly stale onSelect snapshot on the next input.
                    const input = e.currentTarget;
                    weightSelectionRef.current = {
                      start: input.selectionStart,
                      end: input.selectionEnd,
                    };
                  }}
                  onBeforeInput={(e) => {
                    const input = e.currentTarget;
                    const selection =
                      resolveOnboardingWeightSelectionBeforeInput(
                        weightSelectionRef.current,
                        input.selectionStart,
                        input.selectionEnd,
                      );
                    weightBeforeInputRef.current = {
                      value: input.value,
                      start: selection.start,
                      end: selection.end,
                    };
                  }}
                  onChange={(e) => {
                    // Reconstruct insertText from the selection captured before
                    // Chromium mutates the RTL numeral. This preserves logical
                    // order (٨ then ٢ stays ٨٢) while still allowing deliberate
                    // Home/start edits because their pre-input caret is zero.
                    const input = e.currentTarget;
                    const native = e.nativeEvent as InputEvent;
                    const before = weightBeforeInputRef.current;
                    const reconciled = reconcileOnboardingWeightInput(
                      before?.value ?? form.weight,
                      input.value,
                      native.inputType,
                      native.data,
                      before?.start ?? input.selectionStart,
                      before?.end ?? input.selectionEnd,
                    );
                    weightBeforeInputRef.current = null;
                    input.value = reconciled.value;
                    input.setSelectionRange(
                      reconciled.selection,
                      reconciled.selection,
                    );
                    weightSelectionRef.current = {
                      start: reconciled.selection,
                      end: reconciled.selection,
                    };
                    setForm((current) =>
                      updateOnboardingForm(
                        current,
                        "weight",
                        reconciled.value,
                      ),
                    );
                  }}
                  className="min-h-12 w-full rounded-2xl border border-[#DDD5C9] bg-white px-4 font-medium outline-none focus:border-[#293D34]"
                />
                <span className="font-bold text-[#747067]">{copy.kg}</span>
              </div>
              {weightInvalid && (
                <span
                  id="onboarding-weight-error"
                  data-testid="onboarding-weight-error"
                  role="alert"
                  className="mt-2 block text-xs font-bold text-red-700"
                >
                  {copy.weightError}
                </span>
              )}
            </label>
            <label className="mt-4 block text-sm font-black text-[#3D403A]">
              {copy.hunger}
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-[#747067]">{copy.low}</span>
                <input
                  data-testid="onboarding-hunger"
                  type="range"
                  min="1"
                  max="5"
                  value={form.hunger}
                  onChange={(e) => {
                    setForm((current) =>
                      updateOnboardingForm(
                        current,
                        "hunger",
                        Number(e.target.value),
                      ),
                    );
                    setTouched((current) => ({ ...current, hunger: true }));
                  }}
                  className="w-full"
                />
                <span className="min-w-6 text-center font-black text-[#293D34]">
                  {form.hunger}
                </span>
                <span className="text-xs text-[#747067]">{copy.high}</span>
              </div>
            </label>
            <label className="mt-4 block text-sm font-black text-[#3D403A]">
              {copy.energy}
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-[#747067]">{copy.low}</span>
                <input
                  data-testid="onboarding-energy"
                  type="range"
                  min="1"
                  max="5"
                  value={form.energy}
                  onChange={(e) => {
                    setForm((current) =>
                      updateOnboardingForm(
                        current,
                        "energy",
                        Number(e.target.value),
                      ),
                    );
                    setTouched((current) => ({ ...current, energy: true }));
                  }}
                  className="w-full"
                />
                <span className="min-w-6 text-center font-black text-[#293D34]">
                  {form.energy}
                </span>
                <span className="text-xs text-[#747067]">{copy.high}</span>
              </div>
            </label>
            <label className="mt-4 block text-sm font-black text-[#3D403A]">
              {copy.rhythm}
              <select
                data-testid="onboarding-rhythm"
                value={form.rhythm}
                onChange={(e) => {
                  setForm((current) =>
                    updateOnboardingForm(
                      current,
                      "rhythm",
                      e.target.value as FormState["rhythm"],
                    ),
                  );
                  setTouched((current) => ({ ...current, rhythm: true }));
                }}
                className="mt-2 min-h-12 w-full rounded-2xl border border-[#DDD5C9] bg-white px-4 font-medium outline-none focus:border-[#293D34]"
              >
                <option value="regular">{copy.regular}</option>
                <option value="irregular">{copy.irregular}</option>
                <option value="mixed">{copy.mixed}</option>
              </select>
            </label>
            <button
              data-testid="onboarding-form-save"
              type="button"
              disabled={!form.goal.trim() || saving || weightInvalid}
              onClick={() => void submitForm()}
              className="mt-6 min-h-12 w-full rounded-2xl bg-[#293D34] px-5 py-3 font-black text-white disabled:opacity-40"
            >
              {saving ? "…" : copy.save}
            </button>
          </div>
        )}
      </section>
    </div>,
    document.body,
  );
};
