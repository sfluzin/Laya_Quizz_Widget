import React, { useMemo, useState } from "react";

/**
 * Laya Quiz Widget (Option B: Hybrid-ready front end)
 * --------------------------------------------------
 * - Single-file React component you can inject into Shopify via ScriptTag or App Block.
 * - Mobile-first, TailwindCSS classes for styling.
 * - Collects answers, normalizes to variables, and POSTs to /api/diagnose.
 * - If API isn’t ready yet, it shows a local JSON preview of the payload.
 *
 * Usage (basic):
 *   <LayaQuizWidget apiUrl="/api/diagnose" brandColor="#1f7a66" />
 */

const QUESTIONS = [
  { id: "Q4", text: "How old are you?", type: "number", variable: "userAge" },
  {
    id: "Q5",
    text: "Which body type describes you the most?",
    type: "choice",
    variable: "bodyType",
    choices: ["Androgeneous", "Ectomorph", "Ecto-Endomorph", "Endomorph"],
  },
  {
    id: "Q6",
    text:
      "Do you have fat deposits between your inner thighs, in your belly (belly pouch), under the arms, in your love handles and buttocks consistently no matter if you lose weight and exercise?",
    type: "choice",
    variable: "hasHyperEstrogenicProfile",
    choices: ["Yes", "No"],
  },
  {
    id: "Q7",
    text: "What hair condition(s) apply to you?",
    type: "multi_choice",
    variables: {
      hasChinHair: { label: "I have thick hair on my chin and upper lips or jaw line (hirsutism)" },
      hasChestHair: { label: "I have thick hair on my breast and belly or back (hirsutism)" },
      hasAlopecia: { label: "I have alopecia but the women of my family have normal hair" },
      hasThinHair: { label: "I have very thin hair and a lack of density in certain places or bald patches" },
      hasHairFall: { label: "My hair are falling and are brittle" },
    },
  },
  {
    id: "Q8",
    text: "What skin condition applies to you?",
    type: "multi_choice",
    variables: {
      hasDrySkin: { label: "My skin is generally dry" },
      hasItchyDrySaggingSkin: { label: "My skin is itchy, dry, sagging and thin" },
      hasAdultAcnea: { label: "I have constant acnea even though I'm an adult" },
      hasChinNeckAcnea: { label: "I have acne on my chin and neck before my periods" },
      hasOilySkin: { label: "I have an excess of sebum" },
      hasMelasma: { label: "I have melasma on my upper lips, forehead or cheeks" },
      hasSensitiveSkin: { label: "My skin is constantly dry, irritated, or sensitive" },
      hasHotFlashesRednessRosacea: { label: "I get hot flashes and redness or aggravated rosacea" },
      hasThinSkin: { label: "  My skin is very thin" },
    },
  },
  {
    id: "Q9",
    text: "What's the length of your menstrual cycle ?",
    type: "multi_choice",
    variables: {
      hasRegularCycle: { label: "28 Days" },
      hasShortCycle: { label: "Less than 21 Days" },
      hasLongCycle: { label: "More than 28 Days" },
      hasIrregularCycle: { label: "It depends" },
    },
  },
  {
    id: "Q10",
    text: "How would you describe your menstruations ?",
    type: "multi_choice",
    variables: {
      hasIrregularPeriodFlowCramps: { label: "Irregular blood flow and cramps" },
      hasMenorrhagiaSymptoms: {
        label:
          "Bleeding for more than 7 days or Hemorrhagic blood flow (Passing blood clots larger than a quarter, changing protection in less than 2 hours), & interference with daily life.",
      },
      hasMissingIrregularCycle: {
        label: "Absence of menstruation or (sometimes) missing more than 3 cycles in a row or more",
      },
      hasPainfulPeriods: { label: "Excessively painful period cramps" },
      hasNormalPeriods: { label: "Regular, no cramps, normal flow" },
    },
  },
  {
    id: "Q11",
    text: "Were you diagnosed with one of the following condition?",
    type: "multi_choice",
    variables: {
      hasFibrocysticBreasts: { label: "Fibrocystic breast" },
      hasFibroids: { label: "Fibroid(s) in the uterus" },
      hasPCOS: { label: "Polycystic ovary syndrome" },
      hasEndometriosis: { label: "Endometriosis" },
      hasTeratoma: { label: "Teratoma" },
      hasBreastCancer: { label: "Breast cancer" },
      hasOvarianCancer: { label: "Ovarian Cancer" },
      hasCervixCancer: { label: "Cervix Cancer" },
    },
  },
  {
    id: "Q12",
    text:
      "Let's have a look at your estrogen levels, do you suffer from one or multiple conditions below:",
    type: "multi_choice",
    variables: {
      hasHotFlashes: { label: "Hot flashes" },
      hasPermanentWeightGain: { label: "Permanent Weight gain despite eating normally." },
      hasVaginalDryness: { label: "Vaginal dryness (feel sore or itchy in and around your vagina)" },
      hasRecurrentFatigueTroubleSleeping: { label: "Recurrent fatigue and trouble sleeping (Insomnia)" },
      hasDecreasedSexDrive: { label: "General constant decreased sex drive" },
      hasRecurrentUTIs: { label: "You keep getting Urinary Tract Infections (UTIs)" },
    },
  },
  {
    id: "Q13",
    text: "What periodic protection do you prefer?",
    type: "multi_choice",
    variables: {
      prefersTamponsWithApplicator: { label: "Tampons with applicator" },
      prefersTamponsWithoutApplicator: { label: "Tampons without applicator." },
      prefersPads: { label: "Pads" },
      prefersCup: { label: "Cup" },
      prefersMenstrualUnderwear: { label: "Menstrual underwear" },
      prefersFreeFlow: { label: "I go freeflow" },
    },
  },
  {
    id: "Q14",
    text: "How heavy is your flow?",
    type: "multi_choice",
    variables: {
      hasLightFlow: { label: "Light" },
      hasAverageFlow: { label: "Average" },
      hasSuperFlow: { label: "Super" },
      hasMaxiFlow: { label: "Maxi" },
    },
  },
  {
    id: "Q15",
    text: "On a scale of 1 to 10, how do you evaluate your periods pain?",
    type: "scale",
    variable: "crampSeverity",
    range: { min: 1, max: 10 },
  },
  {
    id: "Q16",
    text: "Were you diagnosed with one of the following conditions?",
    type: "multi_choice",
    variables: {
      hasBipolarDisorder: { label: "Bipolar disorder" },
      hasBorderlinePersonalityDisorder: { label: "Borderline Personality Disorder" },
      isDepressive: { label: "Diagnosed Major Depression disorder or episode" },
      hasAnxietyDisorder: { label: "Generalized Anxiety Disorder (GAD) or Panic Disorder" },
      hasFibromyalgia: { label: "Chronic fatigue syndrome or fibromyalgia" },
    },
  },
  {
    id: "Q17",
    text: "Are you taking one of the following treatment?",
    type: "multi_choice",
    variables: {
      takesBirthControlPill: {
        label: "Hormone contraceptive (birth control pill, IUD, hormonal implant, hormonal patch).",
      },
      takesAntidepressants: { label: "Antidepressants (SSRIs, SNRIs, tricyclics)" },
      takesAnxiolytics: { label: "Anxiolytics medication" },
      takesFertilityTreatment: { label: "Fertility treatments (gonadotropine, clomiphen..." },
      takesStimulants: { label: "Stimulants (ADHD meds; amphetamines, methylphenidate...)" },
      takesAntiepileptics: { label: "Antiepileptics (valproate, carbamazepine)" },
      takesBetaBlockers: { label: "Betablockers (for blood pressure, migraines)" },
      takesThyroidDrugs: { label: "Thyroid hormone replacement or antithyroid drugs" },
      takesGlucocorticoids: { label: "Glucocorticoids (prednisone, dexamethasone)" },
      takesMoodStabilizers: { label: "Mood stabilizers & antipsychotics" },
    },
  },
  {
    id: "Q18",
    text: "Part 1, PMS check: Do you suffer from the symptoms below?",
    type: "multi_choice",
    variables: {
      hasMoodSwings: { label: "Mood swings" },
      hasSadness: { label: "Sadness" },
      hasBrainFog: { label: "BrainFog" },
      hasDemotivation: { label: "Demotivation" },
      hasMigraine: { label: "Migraine" },
      hasBloating: { label: "Bloating" },
      hasBreastTenderness: { label: "Breast tenderness" },
      hasLowAnxiety: { label: "Low anxiety" },
      hasFoodCravings: { label: "Food cravings" },
      hasIrritability: { label: "Irritability" },
      hasTiredness: { label: "Tiredness" },
      hasTroubleSleeping: { label: "Trouble sleeping" },
      hasHormonalAcne: { label: "Hormonal acne (chin, one big pimple)" },
      hasHotFlashes: { label: "Hot flashes" },
      hasLowOrHighSexDrive: { label: "Low or high sex drive" },
      hasDigestiveIssues: { label: "Digestive track issues" },
      hasBackPain: { label: "Back pain" },
      hasNoSymptoms: { label: "I have no symptoms" },
    },
  },
  {
    id: "Q19",
    text: "Part 2, PMDD check: Do you suffer from the symptoms below?",
    type: "multi_choice",
    variables: {
      hasExtremeMoodSwings: { label: "Extreme Mood swings" },
      isHighlytensed: { label: "Feeling very tensed" },
      hasUncontrollableAnger: { label: "Uncontrollable anger" },
      hasDepression: { label: "Lasting feeling of deep sadness or depression" },
      hasPanicAttackOrAnxiety: { label: "High anxiety or panic attack" },
      hasDecreasedInterest: { label: "Decreased interest in usual activities" },
      hasDifficultyToFocus: { label: "Great difficulty to focus" },
      hasLethargy: { label: "Lethargy, constant lack of energy" },
      hasBingeEatingBehavior: { label: "Binge eating or intense food cravings" },
      hasInsomniaOrHypersomnia: { label: "Insomnia or Hypersomnia" },
      isOutOfControl: { label: "Feeling overwhelmed or out of control" },
      hasJointOrMusclePain: {
        label:
          "Joint or muscle pain (sprain, restless syndrome increased, inflammed articulations...)",
      },
      hasHeartIssues: { label: "Heart issues (tachycardia,  skipping beats, tight chest...)" },
      hasWaterRetention: { label: "Weight gain or sensation of bloating." },
      hasBreastTendernessOrSwelling: { label: "Painful breast tenderness or swelling" },
      hasCryingSpells: { label: "Crying spells" },
      hasIncreasedSensitivityToRejection: { label: "Increased sensitivity to rejection" },
      hasLastingAngerIrritability: { label: "Lasting irritability or anger" },
      hasIncreasedInterpersonalConflicts: { label: "Increased interpersonal conflicts" },
      hasSuicidalThoughts: { label: "Suicidal thoughts, self-harm thoughts" },
      hasSocialWithdrawal: { label: "Social withdrawal" },
      hasLastingHopelessness: { label: "Lasting hopelessness" },
      hasDizzinessOrFainting: { label: "Dizziness or fainting" },
      isConstantlyOnEdge: { label: "Constantly on edge" },
    },
  },
  {
    id: "Q20",
    text: "Check what is applicable?",
    type: "multi_choice",
    variables: {
      areSymptomsRelatedToMenstrualCycle: {
        label:
          "Symptoms appear 1 up to 2 weeks before your periods, start to improve within a few days after the onset of menses and become minimal or absent in the week postmenses.",
      },
      areSymptomsPresentInTwoConsecutiveCycles: {
        label: "Symptoms were present for at least two consecutive cycles.",
      },
      hasAggravatedLifeInterference: {
        label:
          "Symptoms are associated to clinically significant distress or negative interference with work, social activities and relationships.",
      },
    },
  },
];

// Normalization that mirrors your earlier mapping (English only for now)
const NORMALIZE = {
  bodyType: {
    Androgeneous: { isAndrogeneous: true },
    Ectomorph: { isEctoMorph: true },
    "Ecto-Endomorph": { isEctoEndomorph: true },
    Endomorph: { isEndomorph: true },
  },
  hasHyperEstrogenicProfile: { Yes: true, No: false },
};

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function StepDots({ total, current }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={classNames(
            "h-1.5 w-6 rounded-full",
            i === current ? "bg-black/80" : "bg-black/20"
          )}
        />
      ))}
    </div>
  );
}

function Question({ q, value, onChange }) {
  if (q.type === "number") {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">{q.text}</label>
        <input
          type="number"
          min={0}
          className="w-full rounded-xl border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
          value={value ?? ""}
          onChange={(e) => onChange(q.variable, Number(e.target.value))}
        />
      </div>
    );
  }
  if (q.type === "choice") {
    const selected = value ?? null;
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">{q.text}</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {q.choices.map((c) => (
            <button
              key={c}
              type="button"
              className={classNames(
                "rounded-xl border px-3 py-2 text-left transition",
                selected === c
                  ? "border-black bg-black text-white"
                  : "border-black/15 hover:border-black/40"
              )}
              onClick={() => onChange(q.variable, c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (q.type === "multi_choice") {
    const vars = q.variables || {};
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">{q.text}</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(vars).map(([vKey, vObj]) => {
            const checked = (value && value[vKey]) || false;
            return (
              <label
                key={vKey}
                className={classNames(
                  "cursor-pointer select-none rounded-xl border px-3 py-2",
                  checked ? "border-black bg-black text-white" : "border-black/15"
                )}
              >
                <input
                  type="checkbox"
                  className="mr-2 align-middle"
                  checked={checked}
                  onChange={(e) =>
                    onChange(q.id, {
                      ...(value || {}),
                      [vKey]: e.target.checked,
                    })
                  }
                />
                <span className="align-middle">{vObj.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }
  if (q.type === "scale") {
    const current = Number(value || q.range?.min || 1);
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">{q.text}</label>
        <input
          type="range"
          min={q.range?.min ?? 1}
          max={q.range?.max ?? 10}
          value={current}
          onChange={(e) => onChange(q.variable, Number(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-black/70">{current}</div>
      </div>
    );
  }
  return null;
}

function normalizePayload(raw) {
  const out = {};

  // direct numbers
  if (typeof raw.userAge === "number") out.userAge = raw.userAge;
  if (typeof raw.crampSeverity === "number") out.crampSeverity = raw.crampSeverity;

  // bodyType → boolean flags
  if (raw.bodyType && NORMALIZE.bodyType[raw.bodyType]) {
    Object.assign(out, NORMALIZE.bodyType[raw.bodyType]);
  }

  // hyperestrogenic yes/no
  if (raw.hasHyperEstrogenicProfile != null) {
    const mapped = NORMALIZE.hasHyperEstrogenicProfile[raw.hasHyperEstrogenicProfile];
    if (typeof mapped === "boolean") out.hasHyperEstrogenicProfile = mapped;
  }

  // multi_choice blocks: q.value is an object of booleans already
  [
    "Q7",
    "Q8",
    "Q9",
    "Q10",
    "Q11",
    "Q12",
    "Q13",
    "Q14",
    "Q16",
    "Q17",
    "Q18",
    "Q19",
    "Q20",
  ].forEach((qid) => {
    const block = raw[qid];
    if (block && typeof block === "object") {
      Object.entries(block).forEach(([k, v]) => {
        if (v === true) out[k] = true;
      });
    }
  });

  return out;
}

export default function LayaQuizWidget({ apiUrl = "/api/diagnose", brandColor = "#111" }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const totalSteps = QUESTIONS.length;

  const handleChange = (key, val) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const next = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const canNext = useMemo(() => {
    const q = QUESTIONS[step];
    if (!q) return false;
    if (q.type === "number") return answers[q.variable] != null && answers[q.variable] !== "";
    if (q.type === "choice") return !!answers[q.variable];
    if (q.type === "scale") return typeof answers[q.variable] === "number";
    if (q.type === "multi_choice") return !!answers[q.id];
    return true;
  }, [answers, step]);

  const onSubmit = async () => {
    setSubmitting(true);
    const normalized = normalizePayload(answers);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: normalized, raw: answers, consent: true }),
      });

      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setResult({ mode: "api", data, normalized });
    } catch (e) {
      // Fallback: show local preview if API not ready
      setResult({ mode: "local", normalized, message: "API not available; showing local payload." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-sans">
      <button
        onClick={() => setOpen(true)}
        className="rounded-2xl bg-black px-5 py-3 text-white shadow-md transition hover:opacity-90"
        style={{ backgroundColor: brandColor }}
      >
        Take the PMS & Cycle Check
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Laya Diagnostic</h2>
              <button
                className="rounded-full p-2 hover:bg-black/5"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {!result ? (
              <div>
                <StepDots total={totalSteps} current={step} />
                <div className="mt-4 space-y-4">
                  <Question
                    q={QUESTIONS[step]}
                    value={
                      QUESTIONS[step].type === "multi_choice"
                        ? answers[QUESTIONS[step].id]
                        : answers[QUESTIONS[step].variable]
                    }
                    onChange={(k, v) => handleChange(k, v)}
                  />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={prev}
                    disabled={step === 0}
                    className="rounded-xl border border-black/20 px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Back
                  </button>

                  {step < totalSteps - 1 ? (
                    <button
                      onClick={next}
                      disabled={!canNext}
                      className="rounded-xl bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
                      style={{ backgroundColor: canNext ? brandColor : "#333" }}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={onSubmit}
                      disabled={submitting}
                      className="rounded-xl bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
                      style={{ backgroundColor: brandColor }}
                    >
                      {submitting ? "Submitting…" : "See my results"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {result.mode === "api" ? (
                  <>
                    <h3 className="text-lg font-semibold">Your personalized results</h3>
                    <pre className="max-h-64 overflow-auto rounded-xl bg-black/5 p-3 text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold">Preview (API not connected)</h3>
                    <p className="text-sm text-black/70">{result.message}</p>
                    <div>
                      <div className="mb-1 text-sm font-medium">Normalized payload</div>
                      <pre className="max-h-64 overflow-auto rounded-xl bg-black/5 p-3 text-xs">
                        {JSON.stringify(result.normalized, null, 2)}
                      </pre>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <button
                    className="rounded-xl border border-black/20 px-4 py-2 text-sm"
                    onClick={() => {
                      setResult(null);
                      setStep(0);
                      setAnswers({});
                    }}
                  >
                    Retake Quiz
                  </button>
                  <button
                    className="rounded-xl bg-black px-5 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: brandColor }}
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
