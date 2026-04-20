(function () {
  function createAutoFillController({ isElementFilled, fill }) {
    let intersectionObserver = null;
    let mutationObserver = null;
    let state = { _io: null, _fillTimeout: null, _ioCleanup: null, _isFilling: false, _formLoadedHandler: null };
    let lastUrl = location.href;

    function triggerFill(delay = 800) {
      clearTimeout(state._fillTimeout);
      state._fillTimeout = setTimeout(() => {
        state._isFilling = true;
        Promise.resolve(fill()).finally(() => {
          setTimeout(() => { state._isFilling = false; }, 2000);
        });
      }, delay);
    }

    function handleNavigation() {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        triggerFill(500);
      }
    }

    function cleanup() {
      if (state._io) {
        state._io.disconnect();
        state._io = null;
      }
      if (state._fillTimeout) {
        clearTimeout(state._fillTimeout);
        state._fillTimeout = null;
      }
      if (state._ioCleanup) {
        document.removeEventListener('click', state._ioCleanup, true);
        state._ioCleanup = null;
      }
      if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
      }
      if (state._formLoadedHandler) {
        window.removeEventListener('form-loaded', state._formLoadedHandler);
        state._formLoadedHandler = null;
      }
      window.removeEventListener('popstate', handleNavigation);
      if (window.__originalPushState) {
        history.pushState = window.__originalPushState;
        window.__originalPushState = null;
      }
      if (window.__originalReplaceState) {
        history.replaceState = window.__originalReplaceState;
        window.__originalReplaceState = null;
      }
    }

    function start(data) {
      if (!data?.autoFillEnabled) {
        cleanup();
        return;
      }

      cleanup();
      window.addEventListener('popstate', handleNavigation);

      window.__originalPushState = history.pushState;
      window.__originalReplaceState = history.replaceState;
      history.pushState = function (...args) {
        window.__originalPushState.apply(this, args);
        setTimeout(() => handleNavigation(), 500);
      };
      history.replaceState = function (...args) {
        window.__originalReplaceState.apply(this, args);
        setTimeout(() => handleNavigation(), 500);
      };

      const formContainers = document.querySelectorAll('form, .form-section, .form-container, [role="form"], .step-content');
      if (formContainers.length > 0) {
        const io = new IntersectionObserver((entries) => {
          if (state._isFilling) return;
          for (const entry of entries) {
            if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
              const allForms = document.querySelectorAll('input:not([type=hidden]):not([type=file]), select, textarea');
              let hasUnfilled = false;
              for (const form of allForms) {
                const style = form.ownerDocument.defaultView.getComputedStyle(form);
                if (style && style.display !== 'none' && style.visibility !== 'hidden' && !isElementFilled(form)) {
                  hasUnfilled = true;
                  break;
                }
              }
              if (!hasUnfilled) return;
              triggerFill(800);
              break;
            }
          }
        }, { threshold: [0.1] });

        formContainers.forEach((container) => io.observe(container));
        state._io = io;
      }

      mutationObserver = new MutationObserver((mutations) => {
        if (state._isFilling) return;
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && (mutation.addedNodes?.length || mutation.removedNodes?.length)) {
            triggerFill(400);
            return;
          }

          if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
            const target = mutation.target;
            const becameVisible = target.matches?.('input, select, textarea, form, .form-section, .step-content') &&
              target.ownerDocument.defaultView.getComputedStyle(target).display !== 'none' &&
              target.ownerDocument.defaultView.getComputedStyle(target).visibility !== 'hidden';
            if (becameVisible) {
              triggerFill(400);
              return;
            }
          }
        }
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'hidden', 'aria-hidden'],
      });

      const nextBtnClickHandler = function (e) {
        if (state._isFilling) return;
        const text = e.target.textContent?.toLowerCase() || '';
        const id = e.target.id?.toLowerCase() || '';
        const nextBtn = text.includes('下一步') || text.includes('next') ||
                        text.includes('继续') || text.includes('continue') ||
                        id.includes('next');
        if (nextBtn) triggerFill(1000);
      };
      document.addEventListener('click', nextBtnClickHandler, true);
      state._ioCleanup = nextBtnClickHandler;

      state._formLoadedHandler = () => triggerFill(300);
      window.addEventListener('form-loaded', state._formLoadedHandler);
    }

    return { start, cleanup };
  }

  const api = { createAutoFillController };

  if (typeof window !== 'undefined') {
    window.__BengaliAutofill__ = api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
