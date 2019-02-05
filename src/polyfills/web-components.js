window.CustomElementRegistry = window.customElements = window.customElements || {
  define: function() {},
  get: function() {},
  whenDefined: function() {}
};

window.MutationObserver = window.MutationObserver || (function() {
  return {
    disconnect: function() {},
    observe: function() {},
    takeRecords: function() {}
  };
});

window.HTMLSlotElement = window.HTMLElement;
