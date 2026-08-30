(function (global) {
    "use strict";

    var STORAGE_KEY = "rp.language";
    var DEFAULT_LANGUAGE = "en";
    var SUPPORTED = ["en", "zh-CN"];
    var dictionaries = { en: {}, "zh-CN": {} };

    function normalize(language) {
        if (!language) return DEFAULT_LANGUAGE;
        var value = String(language).toLowerCase();
        if (value === "zh" || value.indexOf("zh-") === 0) return "zh-CN";
        return "en";
    }

    function storedLanguage() {
        try {
            var saved = global.localStorage.getItem(STORAGE_KEY);
            if (saved) return normalize(saved);
        } catch (error) {
            // localStorage may be unavailable in privacy modes.
        }
        return normalize(global.navigator && global.navigator.language);
    }

    var currentLanguage = storedLanguage();

    function merge(target, source) {
        Object.keys(source || {}).forEach(function (key) {
            target[key] = source[key];
        });
    }

    function translate(key, variables) {
        var value = dictionaries[currentLanguage][key];
        if (value === undefined) value = dictionaries.en[key];
        if (value === undefined) return key;
        return String(value).replace(/\{\{(\w+)\}\}/g, function (_, name) {
            return variables && variables[name] !== undefined ? variables[name] : "";
        });
    }

    function apply(root) {
        var scope = root || document;
        var elements = scope.querySelectorAll("[data-i18n]");
        Array.prototype.forEach.call(elements, function (element) {
            element.textContent = translate(element.getAttribute("data-i18n"));
        });
        var placeholders = scope.querySelectorAll("[data-i18n-placeholder]");
        Array.prototype.forEach.call(placeholders, function (element) {
            element.setAttribute("placeholder", translate(element.getAttribute("data-i18n-placeholder")));
        });
        var titles = scope.querySelectorAll("[data-i18n-title]");
        Array.prototype.forEach.call(titles, function (element) {
            element.setAttribute("title", translate(element.getAttribute("data-i18n-title")));
        });
        document.documentElement.lang = currentLanguage;
        document.dispatchEvent(new CustomEvent("rp-language-applied", {
            detail: { language: currentLanguage }
        }));
    }

    function setLanguage(language) {
        var normalized = normalize(language);
        if (SUPPORTED.indexOf(normalized) === -1) normalized = DEFAULT_LANGUAGE;
        try {
            global.localStorage.setItem(STORAGE_KEY, normalized);
        } catch (error) {
            // The selection still applies for the current page.
        }
        if (normalized === currentLanguage) return;
        currentLanguage = normalized;
        global.location.reload();
    }

    function mountSelector(container) {
        if (document.getElementById("rp-language-selector")) return;
        var host = container || document.body;
        var wrapper = document.createElement("div");
        wrapper.id = "rp-language-selector";
        wrapper.setAttribute("aria-label", translate("common.language"));
        wrapper.innerHTML = "<span aria-hidden=\"true\">🌐</span>" +
            "<select id=\"rp-language-select\" aria-label=\"" + translate("common.language") + "\">" +
            "<option value=\"zh-CN\">简体中文</option>" +
            "<option value=\"en\">English</option>" +
            "</select>";
        host.appendChild(wrapper);
        var select = document.getElementById("rp-language-select");
        select.value = currentLanguage;
        select.addEventListener("change", function () {
            setLanguage(select.value);
        });
    }

    function add(language, messages) {
        var normalized = normalize(language);
        if (!dictionaries[normalized]) dictionaries[normalized] = {};
        merge(dictionaries[normalized], messages);
    }

    function init(options) {
        options = options || {};
        function ready() {
            apply(document);
            if (options.selector !== false) mountSelector(options.selectorContainer);
        }
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", ready);
        } else {
            ready();
        }
    }

    global.RP_I18N = {
        add: add,
        apply: apply,
        getLanguage: function () { return currentLanguage; },
        init: init,
        setLanguage: setLanguage,
        t: translate
    };
})(window);
