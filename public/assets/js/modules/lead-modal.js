import {
  createWebinarLead,
  registerWebinarIntent,
  trackWebinarEvent,
} from "./lead-funnel-api.js?v=20260808-4";

const FORM_ERROR = "Não conseguimos registrar agora. Tente novamente em instantes.";
const INTENT_ERROR = "Não conseguimos verificar agora. Tente novamente em instantes.";

function firstControl(step) {
  return step.querySelector("input");
}

function validationMessage(step) {
  const radios = [...step.querySelectorAll('input[type="radio"]')];
  if (radios.length && !radios.some((radio) => radio.checked)) return "Escolha uma opção.";

  const input = firstControl(step);
  if (!input?.value.trim()) return "Preencha este campo.";
  if (input.type === "email" && input.validity.typeMismatch) return "Digite um e-mail válido.";
  return "";
}

export function initLeadModal(root, triggers = []) {
  if (!root || typeof root.showModal !== "function") return () => {};

  const formView = root.querySelector('[data-js="lead-form-view"]');
  const offerView = root.querySelector('[data-js="lead-offer-view"]');
  const successView = root.querySelector('[data-js="lead-success-view"]');
  const form = root.querySelector('[data-js="lead-form"]');
  const steps = [...root.querySelectorAll('[data-js="lead-step"]')];
  const stepLabel = root.querySelector('[data-js="lead-step-label"]');
  const progress = root.querySelector('[data-js="lead-progress"]');
  const back = root.querySelector('[data-js="lead-back"]');
  const next = root.querySelector('[data-js="lead-next"]');
  const submit = root.querySelector('[data-js="lead-submit"]');
  const submitLabel = root.querySelector('[data-js="lead-submit-label"]');
  const formError = root.querySelector('[data-js="lead-error"]');
  const intent = root.querySelector('[data-js="lead-intent"]');
  const intentLabel = root.querySelector('[data-js="lead-intent-label"]');
  const intentError = root.querySelector('[data-js="lead-intent-error"]');
  const closeButtons = root.querySelectorAll('[data-js="lead-modal-close"], [data-js="lead-success-close"]');
  const listeners = new AbortController();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let index = 0;
  let leadId = "";
  let leadEmail = "";
  let opener = null;
  let choiceTimer = 0;
  let requestController = null;
  let backdropPressed = false;
  let isBusy = false;
  let stepAnimation = null;

  function animateStep(step, direction) {
    stepAnimation?.cancel();
    stepAnimation = null;
    if (reducedMotion.matches || !root.open) return;

    stepAnimation = step.animate(
      [
        { opacity: 0, transform: `translateX(${direction * 0.875}rem)` },
        { opacity: 1, transform: "translateX(0)" },
      ],
      { duration: 240, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
  }

  function clearError(target = formError) {
    target.hidden = true;
    target.textContent = "";
    steps.forEach((step) => step.removeAttribute("data-invalid"));
    steps.flatMap((step) => [...step.querySelectorAll("input")]).forEach((input) => {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    });
  }

  function setError(target, message, step = null) {
    target.textContent = message;
    target.hidden = false;
    if (step) {
      step.dataset.invalid = "true";
      [...step.querySelectorAll("input")].forEach((input) => {
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", "lead-form-error");
      });
      firstControl(step)?.focus();
    }
  }

  function showStep(nextIndex, focus = true) {
    window.clearTimeout(choiceTimer);
    choiceTimer = 0;
    const previousIndex = index;
    index = Math.max(0, Math.min(nextIndex, steps.length - 1));
    clearError();
    steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== index; });
    stepLabel.textContent = `Pergunta ${index + 1} de ${steps.length}`;
    progress.value = index + 1;
    progress.textContent = `${index + 1} de ${steps.length}`;
    back.disabled = index === 0;
    next.hidden = index === steps.length - 1;
    submit.hidden = index !== steps.length - 1;
    if (focus && index !== previousIndex) animateStep(steps[index], index > previousIndex ? 1 : -1);
    if (focus) requestAnimationFrame(() => firstControl(steps[index])?.focus());
  }

  function setView(view) {
    formView.hidden = view !== "form";
    offerView.hidden = view !== "offer";
    successView.hidden = view !== "success";
    root.dataset.state = view;
  }

  function resetModal() {
    window.clearTimeout(choiceTimer);
    stepAnimation?.cancel();
    requestController?.abort();
    requestController = null;
    leadId = "";
    leadEmail = "";
    form.reset();
    form.removeAttribute("aria-busy");
    submit.disabled = false;
    submitLabel.textContent = "Ver minha condição";
    intent.disabled = false;
    intentLabel.textContent = "Quero garantir acesso";
    isBusy = false;
    clearError();
    clearError(intentError);
    setView("form");
    showStep(0, false);
  }

  function openModal(event) {
    opener = event.currentTarget;
    resetModal();
    root.showModal();
    document.body.dataset.modalOpen = "true";
    trackWebinarEvent("form_start_webinar");
    requestAnimationFrame(() => firstControl(steps[0])?.focus());
  }

  function closeModal() {
    requestController?.abort();
    if (root.open) root.close();
  }

  async function submitLead() {
    if (isBusy) return;
    isBusy = true;
    form.setAttribute("aria-busy", "true");
    submit.disabled = true;
    back.disabled = true;
    submitLabel.textContent = "Enviando...";
    clearError();
    requestController = new AbortController();

    const answers = Object.fromEntries(
      [...new FormData(form).entries()].map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
    );

    try {
      const result = await createWebinarLead(answers, requestController.signal);
      leadId = result.leadId;
      leadEmail = answers.email;
      trackWebinarEvent("form_submit_webinar");
      setView("offer");
      requestAnimationFrame(() => root.querySelector("#lead-offer-title")?.focus());
    } catch (error) {
      if (error.name !== "AbortError") setError(formError, FORM_ERROR);
    } finally {
      form.removeAttribute("aria-busy");
      submit.disabled = false;
      submitLabel.textContent = "Ver minha condição";
      back.disabled = index === 0;
      isBusy = false;
      requestController = null;
    }
  }

  function onFormSubmit(event) {
    event.preventDefault();
    if (isBusy) return;
    const currentStep = steps[index];
    const message = validationMessage(currentStep);
    if (message) {
      setError(formError, message, currentStep);
      return;
    }

    if (index < steps.length - 1) {
      showStep(index + 1);
      return;
    }

    submitLead();
  }

  async function registerIntent() {
    if (!leadId || intent.disabled) return;
    clearError(intentError);
    intent.disabled = true;
    intentLabel.textContent = "Verificando disponibilidade...";
    requestController = new AbortController();
    trackWebinarEvent("checkout_click_webinar", { charged: false });

    try {
      await registerWebinarIntent({ leadId, email: leadEmail }, requestController.signal);
      setView("success");
      requestAnimationFrame(() => root.querySelector("#lead-success-title")?.focus());
    } catch (error) {
      if (error.name !== "AbortError") setError(intentError, INTENT_ERROR);
      intent.disabled = false;
      intentLabel.textContent = "Quero garantir acesso";
    } finally {
      requestController = null;
    }
  }

  for (const trigger of triggers) {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(event);
    }, { signal: listeners.signal });
  }

  form.addEventListener("submit", onFormSubmit, { signal: listeners.signal });
  back.addEventListener("click", () => showStep(index - 1), { signal: listeners.signal });
  form.addEventListener("input", () => clearError(), { signal: listeners.signal });
  form.addEventListener("change", (event) => {
    clearError();
    if (event.target.matches('input[type="radio"]') && index < steps.length - 1) {
      window.clearTimeout(choiceTimer);
      choiceTimer = window.setTimeout(() => showStep(index + 1), 180);
    }
  }, { signal: listeners.signal });
  intent.addEventListener("click", registerIntent, { signal: listeners.signal });
  closeButtons.forEach((button) => button.addEventListener("click", closeModal, { signal: listeners.signal }));
  root.addEventListener("cancel", (event) => { event.preventDefault(); closeModal(); }, { signal: listeners.signal });
  root.addEventListener("pointerdown", (event) => { backdropPressed = event.target === root; }, { signal: listeners.signal });
  root.addEventListener("click", (event) => {
    if (backdropPressed && event.target === root) closeModal();
    backdropPressed = false;
  }, { signal: listeners.signal });
  root.addEventListener("close", () => {
    delete document.body.dataset.modalOpen;
    window.clearTimeout(choiceTimer);
    stepAnimation?.cancel();
    if (opener?.isConnected) opener.focus();
  }, { signal: listeners.signal });

  trackWebinarEvent("page_view_webinar");

  return () => {
    listeners.abort();
    requestController?.abort();
    window.clearTimeout(choiceTimer);
    stepAnimation?.cancel();
    delete document.body.dataset.modalOpen;
  };
}
