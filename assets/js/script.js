const views = Array.from(document.querySelectorAll('.modal-view'));
const progressDots = Array.from(document.querySelectorAll('.progress__dot'));
const modalShell = document.querySelector('.modal-shell');
const openModalButton = document.querySelector('#open-modal-btn');
const closeModalButton = document.querySelector('.close-btn');
const taxCardFileInput = document.querySelector('#tax-card-file');
const taxCardCameraInput = document.querySelector('#tax-card-camera');
const openCameraBtn = document.querySelector('#open-camera-btn');
const fileStatusText = document.querySelector('[data-file-status]');
const uploadZone = document.querySelector('.modal-view--step2 .upload-zone');
const uploadPreviewImage = document.querySelector('.upload-preview-image');
const customSelectControls = Array.from(document.querySelectorAll('[data-custom-select]'));
const stepForm = document.querySelector('.step-form');
const modalStage = document.querySelector('.modal-stage');
const applicantNameInput = document.querySelector('#applicant-name');
const applicantPhoneInput = document.querySelector('#applicant-phone');
const consentInput = document.querySelector('.consent-check__input');
const step2SubmitButton = document.querySelector('.modal-view--step2 [data-next]');

// Governorates data
const governoratesData = [
  { "id": "10000000-0000-4000-a000-000000000001", "name": "القاهرة" },
  { "id": "10000000-0000-4000-a000-000000000002", "name": "الإسكندرية" },
  { "id": "10000000-0000-4000-a000-000000000003", "name": "الجيزة" },
  { "id": "10000000-0000-4000-a000-000000000004", "name": "الدقهلية" },
  { "id": "10000000-0000-4000-a000-000000000005", "name": "الشرقية" },
  { "id": "10000000-0000-4000-a000-000000000006", "name": "البحيرة" },
  { "id": "10000000-0000-4000-a000-000000000007", "name": "الغربية" },
  { "id": "10000000-0000-4000-a000-000000000008", "name": "المنوفية" },
  { "id": "10000000-0000-4000-a000-000000000009", "name": "القليوبية" },
  { "id": "10000000-0000-4000-a000-000000000010", "name": "دمياط" },
  { "id": "10000000-0000-4000-a000-000000000011", "name": "كفر الشيخ" },
  { "id": "10000000-0000-4000-a000-000000000012", "name": "بورسعيد" },
  { "id": "10000000-0000-4000-a000-000000000013", "name": "الإسماعيلية" },
  { "id": "10000000-0000-4000-a000-000000000014", "name": "السويس" },
  { "id": "10000000-0000-4000-a000-000000000015", "name": "شمال سيناء" },
  { "id": "10000000-0000-4000-a000-000000000016", "name": "جنوب سيناء" },
  { "id": "10000000-0000-4000-a000-000000000017", "name": "الفيوم" },
  { "id": "10000000-0000-4000-a000-000000000018", "name": "بني سويف" },
  { "id": "10000000-0000-4000-a000-000000000019", "name": "المنيا" },
  { "id": "10000000-0000-4000-a000-000000000020", "name": "أسيوط" },
  { "id": "10000000-0000-4000-a000-000000000021", "name": "سوهاج" },
  { "id": "10000000-0000-4000-a000-000000000022", "name": "قنا" },
  { "id": "10000000-0000-4000-a000-000000000023", "name": "الأقصر" },
  { "id": "10000000-0000-4000-a000-000000000024", "name": "أسوان" },
  { "id": "10000000-0000-4000-a000-000000000025", "name": "البحر الأحمر" },
  { "id": "10000000-0000-4000-a000-000000000026", "name": "الوادي الجديد" },
  { "id": "10000000-0000-4000-a000-000000000027", "name": "مطروح" }
];

let uploadedImageUrl = null;

const validationMessages = {
  name: document.querySelector('[data-error-for="name"]'),
  phone: document.querySelector('[data-error-for="phone"]'),
  governorate: document.querySelector('[data-error-for="governorate"]'),
  taxCard: document.querySelector('[data-error-for="tax-card"]'),
  'tax-number': document.querySelector('[data-error-for="tax-number"]'),
  'company-name': document.querySelector('[data-error-for="company-name"]'),
  'verified-tax-number': document.querySelector('[data-error-for="verified-tax-number"]'),
  'verified-company-name': document.querySelector('[data-error-for="verified-company-name"]'),
  consent: document.querySelector('[data-error-for="consent"]'),
};
const maxStep = Math.max(...views.map((view) => parseFloat(view.dataset.step) || 1));
let currentStep = 1;
let previewObjectUrl = null;
let transitionTimeoutId = null;
let firstStepBaselineHeight = 0;

function openModal() {
  if (!modalShell) {
    return;
  }

  if (typeof modalShell.showModal === 'function') {
    if (!modalShell.open) {
      modalShell.showModal();
    }
  } else {
    modalShell.setAttribute('open', '');
  }

  updateStageHeight(getViewByStep(currentStep));
}

function closeModal() {
  if (!modalShell) {
    return;
  }

  if (typeof modalShell.close === 'function') {
    if (modalShell.open) {
      modalShell.close();
    }
  } else {
    modalShell.removeAttribute('open');
  }
}

function setValidationMessage(key, message) {
  const messageElement = validationMessages[key];
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.hidden = !message;
}

function setValidationState(element, isInvalid) {
  if (!element) {
    return;
  }

  element.classList.toggle('has-error', isInvalid);
}

function clearValidationErrors() {
  setValidationMessage('name', '');
  setValidationMessage('phone', '');
  setValidationMessage('governorate', '');
  setValidationMessage('taxCard', '');
  setValidationMessage('consent', '');

  setValidationState(applicantNameInput?.closest('.field'), false);
  setValidationState(applicantPhoneInput?.closest('.field'), false);
  setValidationState(document.querySelector('.field.custom-select'), false);
  setValidationState(uploadZone, false);
  setValidationState(document.querySelector('.consent-check'), false);
}

function syncStep2SubmitButtonState() {
  if (!step2SubmitButton) {
    return;
  }

  step2SubmitButton.disabled = !consentInput?.checked;
}

function getViewByStep(step) {
  return views.find((view) => parseFloat(view.dataset.step) === step) || null;
}

function updateFirstStepBaselineHeight() {
  const firstStepView = getViewByStep(1);
  const measuredHeight = firstStepView?.scrollHeight || 0;
  if (measuredHeight > 0) {
    firstStepBaselineHeight = measuredHeight;
  }
}

function updateStageHeight(view) {
  if (!modalStage || !view) {
    return;
  }

  if (modalShell) {
    modalShell.dataset.activeStep = String(currentStep);
  }

  modalStage.dataset.activeStep = String(currentStep);

  if (currentStep === 1) {
    updateFirstStepBaselineHeight();
  }

  if (currentStep === 3) {
    if (firstStepBaselineHeight > 0) {
      modalStage.style.height = `${firstStepBaselineHeight}px`;
      return;
    }

    const firstStepView = getViewByStep(1);
    const fallbackFirstStepHeight = firstStepView?.scrollHeight || 0;
    if (fallbackFirstStepHeight > 0) {
      modalStage.style.height = `${fallbackFirstStepHeight}px`;
      return;
    }
  }

  modalStage.style.height = `${view.scrollHeight}px`;
}

function getEgyptianPhoneValidationMessage(rawPhoneValue) {
  const digits = rawPhoneValue.replace(/\D/g, '');
  const localDigits = digits.startsWith('20') ? digits.slice(2) : digits;
  const hasValidPrefix = /^(?:01[0125])/.test(localDigits);
  const expectedLength = digits.startsWith('20') ? 12 : 11;

  if (!hasValidPrefix) {
    return 'يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 010 أو 011 أو 012 أو 015.';
  }

  if (digits.length !== expectedLength) {
    return digits.startsWith('20')
      ? 'يرجى إدخال رقم مكون من 12 رقمًا عند استخدام 20 في البداية.'
      : 'يرجى إدخال رقم مكون من 11 رقمًا.';
  }

  if (!/^(?:20)?01[0125]\d{8}$/.test(digits)) {
    return 'يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 010 أو 011 أو 012 أو 015.';
  }

  return '';
}

function getTaxNumberValidationMessage(rawTaxValue) {
  const digits = rawTaxValue.replace(/\D/g, '');
  
  if (!digits || digits.length === 0) {
    return 'يرجى إدخال رقم البطاقة الضريبية.';
  }
  
  if (digits.length !== 9) {
    return `يرجى إدخال رقم بطاقة ضريبية مكون من 9 أرقام فقط (لديك ${digits.length} أرقام حاليًا).`;
  }
  
  return '';
}

function validateStep2() {
  clearValidationErrors();

  const uploadSection = document.querySelector('#upload-section');
  const verificationOverlay = document.querySelector('#verification-overlay');
  const verifiedTaxCardSection = document.querySelector('#verified-tax-card-section');
  const isShowingVerification = verificationOverlay && !verificationOverlay.hidden;
  const isShowingVerified = verifiedTaxCardSection && !verifiedTaxCardSection.hidden;

  // If showing verification overlay, validate those fields
  if (isShowingVerification) {
    const taxNumber = document.querySelector('#tax-number')?.value.trim() || '';
    const companyName = document.querySelector('#company-name')?.value.trim() || '';
    
    let isValid = true;
    const invalidTargets = [];

    const taxErrorMessage = getTaxNumberValidationMessage(taxNumber);
    if (taxErrorMessage) {
      const taxNumberField = document.querySelector('#tax-number')?.closest('.field');
      if (taxNumberField) {
        setValidationState(taxNumberField, true);
      }
      setValidationMessage('tax-number', taxErrorMessage);
      isValid = false;
      invalidTargets.push(document.querySelector('#tax-number'));
    }

    if (!companyName) {
      const companyNameField = document.querySelector('#company-name')?.closest('.field');
      if (companyNameField) {
        setValidationState(companyNameField, true);
      }
      setValidationMessage('company-name', 'يرجى إدخال اسم الشركة');
      isValid = false;
      invalidTargets.push(document.querySelector('#company-name'));
    }

    const firstInvalidTarget = invalidTargets.find((target) => target instanceof HTMLElement);
    firstInvalidTarget?.focus?.();

    return isValid;
  }

  // If showing verified tax card section, validate ALL fields
  if (isShowingVerified) {
    const nameValue = applicantNameInput?.value.trim() || '';
    const phoneValue = applicantPhoneInput?.value.replace(/\s+/g, '') || '';
    const selectedGovernorate = document.querySelector('[data-custom-select] input[type="hidden"]')?.value.trim() || '';
    const verifiedTaxNumber = document.querySelector('#verified-tax-number')?.value.trim() || '';
    const verifiedCompanyName = document.querySelector('#verified-company-name')?.value.trim() || '';
    const consentChecked = Boolean(consentInput?.checked);
    
    let isValid = true;
    const invalidTargets = [];

    // Validate personal data
    if (nameValue.length < 2) {
      setValidationState(applicantNameInput?.closest('.field'), true);
      setValidationMessage('name', 'يرجى إدخال اسم صحيح.');
      isValid = false;
      invalidTargets.push(applicantNameInput);
    }

    const phoneErrorMessage = getEgyptianPhoneValidationMessage(phoneValue);
    if (phoneErrorMessage) {
      setValidationState(applicantPhoneInput?.closest('.field'), true);
      setValidationMessage('phone', phoneErrorMessage);
      isValid = false;
      invalidTargets.push(applicantPhoneInput);
    }

    if (!selectedGovernorate || selectedGovernorate === 'اختر المحافظة') {
      const customSelectField = document.querySelector('.field.custom-select');
      setValidationState(customSelectField, true);
      setValidationMessage('governorate', 'يرجى اختيار المحافظة.');
      isValid = false;
      invalidTargets.push(customSelectField?.querySelector('.custom-select__trigger'));
    }

    // Validate verified fields
    if (getTaxNumberValidationMessage(verifiedTaxNumber)) {
      const taxNumberField = document.querySelector('#verified-tax-number')?.closest('.field');
      if (taxNumberField) {
        setValidationState(taxNumberField, true);
      }
      setValidationMessage('verified-tax-number', getTaxNumberValidationMessage(verifiedTaxNumber));
      isValid = false;
      invalidTargets.push(document.querySelector('#verified-tax-number'));
    }

    if (!verifiedCompanyName) {
      const companyNameField = document.querySelector('#verified-company-name')?.closest('.field');
      if (companyNameField) {
        setValidationState(companyNameField, true);
      }
      setValidationMessage('verified-company-name', 'يرجى إدخال اسم الشركة');
      isValid = false;
      invalidTargets.push(document.querySelector('#verified-company-name'));
    }

    if (!consentChecked) {
      const consentCheck = document.querySelector('.consent-check');
      setValidationState(consentCheck, true);
      setValidationMessage('consent', 'يرجى الموافقة على مشاركة البيانات.');
      invalidTargets.push(consentInput);
    }

    const firstInvalidTarget = invalidTargets.find((target) => target instanceof HTMLElement);
    firstInvalidTarget?.focus?.();

    return invalidTargets.length === 0;
  }

  // Standard step 2 validation (before image selection)
  const nameValue = applicantNameInput?.value.trim() || '';
  const phoneValue = applicantPhoneInput?.value.replace(/\s+/g, '') || '';
  const selectedGovernorate = document.querySelector('[data-custom-select] input[type="hidden"]')?.value.trim() || '';
  const selectedFile = taxCardFileInput?.files?.[0] || taxCardCameraInput?.files?.[0] || null;
  const consentChecked = Boolean(consentInput?.checked);

  const invalidTargets = [];

  if (nameValue.length < 2) {
    setValidationState(applicantNameInput?.closest('.field'), true);
    setValidationMessage('name', 'يرجى إدخال اسم صحيح.');
    invalidTargets.push(applicantNameInput);
  }

  const phoneErrorMessage = getEgyptianPhoneValidationMessage(phoneValue);

  if (phoneErrorMessage) {
    setValidationState(applicantPhoneInput?.closest('.field'), true);
    setValidationMessage('phone', phoneErrorMessage);
    invalidTargets.push(applicantPhoneInput);
  }

  if (!selectedGovernorate || selectedGovernorate === 'اختر المحافظة') {
    const customSelectField = document.querySelector('.field.custom-select');
    setValidationState(customSelectField, true);
    setValidationMessage('governorate', 'يرجى اختيار المحافظة.');
    invalidTargets.push(customSelectField?.querySelector('.custom-select__trigger'));
  }

  if (!selectedFile) {
    setValidationState(uploadZone, true);
    setValidationMessage('taxCard', 'يرجى رفع صورة البطاقة الضريبية.');
    invalidTargets.push(taxCardFileInput);
  }

  if (!consentChecked) {
    const consentCheck = document.querySelector('.consent-check');
    setValidationState(consentCheck, true);
    setValidationMessage('consent', 'يرجى الموافقة على مشاركة البيانات.');
    invalidTargets.push(consentInput);
  }

  const firstInvalidTarget = invalidTargets.find((target) => target instanceof HTMLElement);
  firstInvalidTarget?.focus?.();

  return invalidTargets.length === 0;
}

function closeCustomSelects(exceptControl = null) {
  customSelectControls.forEach((control) => {
    if (control !== exceptControl) {
      control.classList.remove('is-open');
      const trigger = control.querySelector('.custom-select__trigger');
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

customSelectControls.forEach((control) => {
  const trigger = control.querySelector('.custom-select__trigger');
  const valueLabel = control.querySelector('.custom-select__value');
  const hiddenInput = control.querySelector('input[type="hidden"]');
  const options = Array.from(control.querySelectorAll('.custom-select__option'));

  if (!trigger || !valueLabel || options.length === 0) {
    return;
  }

  trigger.addEventListener('click', () => {
    const shouldOpen = !control.classList.contains('is-open');
    closeCustomSelects(shouldOpen ? control : null);
    control.classList.toggle('is-open', shouldOpen);
    trigger.setAttribute('aria-expanded', String(shouldOpen));
  });

  options.forEach((option) => {
    option.addEventListener('click', () => {
      const selectedValue = option.dataset.value || option.textContent?.trim() || '';
      valueLabel.textContent = selectedValue;
      if (hiddenInput) {
        hiddenInput.value = selectedValue;
      }

      options.forEach((otherOption) => {
        otherOption.classList.remove('is-selected');
        const parent = otherOption.closest('.custom-select__item');
        if (parent) {
          delete parent.dataset.selected;
        }
      });

      option.classList.add('is-selected');
      const selectedParent = option.closest('.custom-select__item');
      if (selectedParent) {
        selectedParent.dataset.selected = 'true';
      }

      setValidationState(control.closest('.field.custom-select'), false);
      setValidationMessage('governorate', '');

      control.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    });
  });
});

function applyFilePreview(file) {
  setValidationState(uploadZone, false);
  setValidationMessage('taxCard', '');

  if (fileStatusText) {
    fileStatusText.textContent = file ? file.name : 'لم يتم اختيار ملف';
  }

  if (!uploadZone || !uploadPreviewImage) {
    return;
  }

  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }

  if (file?.type.startsWith('image/')) {
    previewObjectUrl = URL.createObjectURL(file);
    uploadPreviewImage.src = previewObjectUrl;
    uploadZone.classList.add('has-preview');
    
    // Show verification overlay
    const verificationOverlay = document.querySelector('#verification-overlay');
    const uploadSection = document.querySelector('#upload-section');
    const verificationImage = document.querySelector('#verification-preview-image');
    const stepForm = document.querySelector('.step-form');
    const consentCheck = document.querySelector('.consent-check');
    const consentMessage = document.querySelector('.consent-message');
    const modalFooter = document.querySelector('.modal-footer');
    
    if (uploadSection && verificationOverlay && verificationImage) {
      verificationImage.src = previewObjectUrl;
      uploadSection.hidden = true;
      verificationOverlay.hidden = false;
      
      // Hide all form elements except overlay
      if (stepForm) {
        Array.from(stepForm.children).forEach(child => {
          if (child.id !== 'verification-overlay') {
            child.style.display = 'none';
          }
        });
      }
      
      // Hide consent and footer
      if (consentCheck) consentCheck.style.display = 'none';
      if (consentMessage) consentMessage.style.display = 'none';
      if (modalFooter) modalFooter.style.display = 'none';
    }
    return;
  }

  uploadPreviewImage.removeAttribute('src');
  uploadZone.classList.remove('has-preview');
}

if (taxCardFileInput) {
  taxCardFileInput.addEventListener('change', () => {
    applyFilePreview(taxCardFileInput.files?.[0]);
  });
}

if (taxCardCameraInput) {
  taxCardCameraInput.addEventListener('change', () => {
    applyFilePreview(taxCardCameraInput.files?.[0]);
  });
}

const uploadAreaTrigger = document.querySelector('#upload-area-trigger');

// Camera button handler - fires first, prevents other handlers
if (openCameraBtn && taxCardCameraInput) {
  openCameraBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('camera button clicked');

    taxCardCameraInput.click();
  });
}

// Upload area handler - opens file picker only if not clicking camera button
if (uploadAreaTrigger && taxCardFileInput) {
  uploadAreaTrigger.addEventListener('click', (e) => {
    // Don't trigger file picker if clicking on the camera button
    if (e.target === openCameraBtn || openCameraBtn?.contains(e.target)) {
      return;
    }
    taxCardFileInput.click();
  });
  
  uploadAreaTrigger.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Don't trigger file picker if focused on the camera button
      if (e.target === openCameraBtn) {
        return;
      }
      e.preventDefault();
      taxCardFileInput.click();
    }
  });
}

applicantNameInput?.addEventListener('input', () => {
  setValidationState(applicantNameInput.closest('.field'), false);
  setValidationMessage('name', '');
});

applicantPhoneInput?.addEventListener('input', () => {
  setValidationState(applicantPhoneInput.closest('.field'), false);
  setValidationMessage('phone', '');
});

consentInput?.addEventListener('change', () => {
  setValidationState(document.querySelector('.consent-check'), false);
  setValidationMessage('consent', '');
  syncStep2SubmitButtonState();
});

syncStep2SubmitButtonState();

// Verification overlay handlers
const editImageBtn = document.querySelector('#edit-image-btn');
const confirmVerificationBtn = document.querySelector('#confirm-verification-btn');
const verificationOverlay = document.querySelector('#verification-overlay');

if (editImageBtn) {
  editImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Hide overlay and show upload section
    const uploadSection = document.querySelector('#upload-section');
    const stepForm = document.querySelector('.step-form');
    const consentCheck = document.querySelector('.consent-check');
    const consentMessage = document.querySelector('.consent-message');
    const modalFooter = document.querySelector('.modal-footer');
    
    if (uploadSection && verificationOverlay) {
      uploadSection.hidden = false;
      verificationOverlay.hidden = true;
      
      // Show all form elements again
      if (stepForm) {
        Array.from(stepForm.children).forEach(child => {
          if (child.style.display === 'none') {
            child.style.display = '';
          }
        });
      }
      
      // Show consent and footer
      if (consentCheck) consentCheck.style.display = '';
      if (consentMessage) consentMessage.style.display = '';
      if (modalFooter) modalFooter.style.display = '';
    }
    
    // Clear the file inputs
    if (taxCardFileInput) taxCardFileInput.value = '';
    if (taxCardCameraInput) taxCardCameraInput.value = '';
  });
}

if (confirmVerificationBtn) {
  confirmVerificationBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (validateStep2()) {
      // Fade-out the verification overlay with CSS transition
      const verificationOverlay = document.querySelector('#verification-overlay');
      if (verificationOverlay) {
        // Remove the animation class first to allow transition
        verificationOverlay.style.animation = 'none';
        // Trigger fade-out via opacity
        setTimeout(() => {
          verificationOverlay.hidden = true;
          // Reset animation for next time
          verificationOverlay.style.animation = '';
        }, 300);
      }
      
      // Get the verified data from overlay fields
      const overlayTaxNumber = document.querySelector('#tax-number')?.value || '';
      const overlayCompanyName = document.querySelector('#company-name')?.value || '';
      const overlayImage = document.querySelector('#verification-preview-image')?.src;
      
      // Store the image URL for API submission
      uploadedImageUrl = overlayImage;
      
      // Hide upload trigger area
      const uploadAreaTrigger = document.querySelector('#upload-area-trigger');
      if (uploadAreaTrigger) {
        uploadAreaTrigger.hidden = true;
      }
      
      // Show verified tax card section
      const verifiedSection = document.querySelector('#verified-tax-card-section');
      if (verifiedSection) {
        verifiedSection.hidden = false;
        
        // Set the verified image
        const verifiedImage = document.querySelector('#verified-preview-image');
        if (verifiedImage && overlayImage) {
          verifiedImage.src = overlayImage;
        }
        
        // Set the verified fields
        const verifiedTaxNumber = document.querySelector('#verified-tax-number');
        const verifiedCompanyName = document.querySelector('#verified-company-name');
        
        if (verifiedTaxNumber) {
          verifiedTaxNumber.value = overlayTaxNumber;
        }
        if (verifiedCompanyName) {
          verifiedCompanyName.value = overlayCompanyName;
        }
      }
    }
  });
}

// Add input listeners to verification fields to enable/disable confirm button
const taxNumberInput = document.querySelector('#tax-number');
const companyNameInput = document.querySelector('#company-name');

function updateConfirmButtonState() {
  if (confirmVerificationBtn) {
    const taxNumber = taxNumberInput?.value.trim() || '';
    const companyName = companyNameInput?.value.trim() || '';
    confirmVerificationBtn.disabled = !taxNumber || !companyName;
  }
}

if (taxNumberInput) {
  taxNumberInput.addEventListener('input', updateConfirmButtonState);
}

if (companyNameInput) {
  companyNameInput.addEventListener('input', updateConfirmButtonState);
}

// Edit verified image button listener
const editVerifiedImageBtn = document.querySelector('#edit-verified-image-btn');
if (editVerifiedImageBtn) {
  editVerifiedImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Show the verification overlay again
    const verificationOverlay = document.querySelector('#verification-overlay');
    if (verificationOverlay) {
      verificationOverlay.hidden = false;
    }
    
    // Hide the verified section
    const verifiedSection = document.querySelector('#verified-tax-card-section');
    if (verifiedSection) {
      verifiedSection.hidden = true;
    }
    
    // Show upload trigger area
    const uploadAreaTrigger = document.querySelector('#upload-area-trigger');
    if (uploadAreaTrigger) {
      uploadAreaTrigger.hidden = false;
    }
  });
}

openModalButton?.addEventListener('click', openModal);
closeModalButton?.addEventListener('click', closeModal);

function setActiveStep(step) {
  const nextStep = Math.min(Math.max(step, 1), maxStep);
  if (nextStep === currentStep) {
    return;
  }

  const previousStep = currentStep;
  const previousView = getViewByStep(previousStep);
  const nextView = getViewByStep(nextStep);
  if (!nextView) {
    return;
  }

  const direction = nextStep > previousStep ? 'forward' : 'backward';

  if (previousStep === 1 && previousView) {
    const liveFirstStepHeight = previousView.scrollHeight;
    if (liveFirstStepHeight > 0) {
      firstStepBaselineHeight = liveFirstStepHeight;
    }
  }

  clearTimeout(transitionTimeoutId);

  if (modalStage) {
    modalStage.dataset.transitioning = 'true';
    modalStage.dataset.direction = direction;
  }

  if (previousView) {
    previousView.classList.remove('is-active', 'is-leaving-forward', 'is-leaving-backward');
    previousView.classList.add(`is-leaving-${direction}`);
    previousView.setAttribute('aria-hidden', 'true');
  }

  nextView.classList.remove('is-leaving-forward', 'is-leaving-backward');
  nextView.classList.add('is-active');
  nextView.setAttribute('aria-hidden', 'false');

  currentStep = nextStep;

  views.forEach((view) => {
    const viewStep = Number(view.dataset.step);
    if (viewStep !== nextStep && viewStep !== previousStep) {
      view.classList.remove('is-active', 'is-leaving-forward', 'is-leaving-backward');
      view.setAttribute('aria-hidden', 'true');
    }
  });

  updateStageHeight(nextView);

  transitionTimeoutId = setTimeout(() => {
    if (previousView) {
      previousView.classList.remove('is-leaving-forward', 'is-leaving-backward');
    }

    if (modalStage) {
      delete modalStage.dataset.transitioning;
    }

    updateStageHeight(nextView);
  }, 360);

  progressDots.forEach((dot, index) => {
    dot.classList.toggle('is-active', index + 1 === currentStep);
  });
}

window.addEventListener('resize', () => {
  if (currentStep === 1) {
    updateFirstStepBaselineHeight();
  }

  updateStageHeight(getViewByStep(currentStep));
});

updateStageHeight(getViewByStep(currentStep));
if (modalShell) {
  modalShell.dataset.activeStep = String(currentStep);
}
if (modalStage) {
  modalStage.dataset.activeStep = String(currentStep);
}

function resetForm() {
  // Clear form fields
  if (applicantNameInput) applicantNameInput.value = '';
  if (applicantPhoneInput) applicantPhoneInput.value = '';
  if (consentInput) consentInput.checked = false;
  
  // Reset governorate
  const governorateInput = document.querySelector('[data-custom-select] input[type="hidden"]');
  if (governorateInput) governorateInput.value = 'اختر المحافظة';
  const governorateButton = document.querySelector('.custom-select__value');
  if (governorateButton) governorateButton.textContent = 'اختر المحافظة';
  
  // Reset overlay and verified fields
  document.querySelector('#tax-number').value = '';
  document.querySelector('#company-name').value = '';
  document.querySelector('#verified-tax-number').value = '';
  document.querySelector('#verified-company-name').value = '';
  
  // Reset file upload state
  uploadedImageUrl = null;
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
  
  const taxCardFileInput = document.querySelector('#tax-card-file');
  const taxCardCameraInput = document.querySelector('#tax-card-camera');
  if (taxCardFileInput) taxCardFileInput.value = '';
  if (taxCardCameraInput) taxCardCameraInput.value = '';
  
  // Hide verification overlay
  const verificationOverlay = document.querySelector('#verification-overlay');
  if (verificationOverlay) verificationOverlay.hidden = true;
  
  // Hide verified section
  const verifiedSection = document.querySelector('#verified-tax-card-section');
  if (verifiedSection) verifiedSection.hidden = true;
  
  // Show upload section
  const uploadSection = document.querySelector('#upload-section');
  if (uploadSection) uploadSection.hidden = false;
  
  // Show upload trigger
  const uploadAreaTrigger = document.querySelector('#upload-area-trigger');
  if (uploadAreaTrigger) uploadAreaTrigger.hidden = false;
  
  // Show form elements
  const stepForm = document.querySelector('.step-form');
  if (stepForm) {
    Array.from(stepForm.children).forEach(child => {
      if (child.style) child.style.display = '';
    });
  }
  
  // Show consent and footer
  const consentCheck = document.querySelector('.consent-check');
  const consentMessage = document.querySelector('.consent-message');
  const modalFooter = document.querySelector('.modal-footer.step2-footer');
  if (consentCheck) consentCheck.style.display = '';
  if (consentMessage) consentMessage.style.display = '';
  if (modalFooter) modalFooter.style.display = '';
  
  // Clear validation errors
  clearValidationErrors();
}

async function submitFormToAPI() {
  try {
    // Get form data
    const name = applicantNameInput?.value.trim() || '';
    const phone = applicantPhoneInput?.value.replace(/\s+/g, '') || '';
    const governorateName = document.querySelector('[data-custom-select] input[type="hidden"]')?.value.trim() || '';
    const taxNumber = document.querySelector('#verified-tax-number')?.value.trim() || '';
    const companyName = document.querySelector('#verified-company-name')?.value.trim() || '';
    const consentChecked = Boolean(consentInput?.checked);
    
    // Find governorate ID
    const governorate = governoratesData.find(g => g.name === governorateName);
    const governorateId = governorate?.id || '';
    
    // Format phone number with +2 prefix
    const mobileNumber = phone.startsWith('+') ? phone : '+2' + phone;
    
    // Prepare API request body
    const requestBody = {
      name: name,
      mobileNumber: mobileNumber,
      governorateId: governorateId,
      taxRegistrationNumber: taxNumber,
      companyName: companyName,
      taxCardImageUrl: uploadedImageUrl,
      consentToDataSharing: consentChecked
    };
    
    console.log('Submitting form:', requestBody);
    
    // Call API
    const response = await fetch('http://192.168.50.20:30010/api/partners/eand/sme-leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    if (response.status === 201 && data.status === 201) {
      // Success - move to step 3
      setActiveStep(3);
    } else {
      // Error - show error message
      console.error('API Error:', data);
      alert('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.');
    }
  } catch (error) {
    console.error('Submit error:', error);
    alert('حدث خطأ في الاتصال بالخادم. يرجى التحقق من الاتصال وحاول مرة أخرى.');
  }
}

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (!target.closest('[data-custom-select]')) {
    closeCustomSelects();
  }

  const nextTrigger = target.closest('[data-next]');
  if (nextTrigger) {
    // Validate step 2 regardless of whether button is in form
    if (currentStep === 2 && !validateStep2()) {
      return;
    }

    // If on step 2, submit to API
    if (currentStep === 2) {
      submitFormToAPI();
      return;
    }

    setActiveStep(currentStep + 1);
  }

  if (target.closest('[data-prev]')) {
    setActiveStep(currentStep - 1);
  }

  if (target.closest('[data-reset]')) {
    resetForm();
    setActiveStep(1);
  }

  if (target.closest('.pill')) {
    const optionRow = target.closest('.option-row');
    if (!optionRow) {
      return;
    }

    optionRow.querySelectorAll('.pill').forEach((pill) => {
      pill.classList.remove('is-selected');
    });

    target.classList.add('is-selected');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeCustomSelects();
  }
});
