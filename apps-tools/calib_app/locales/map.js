(function () {
    "use strict";
    window.CALIB_I18N_TEXT_MAP = {
        "Device is already in use by another user.": "calib.device_busy",
        "Connection with device is lost.": "calib.connection_lost",
        "CLOSE": "calib.close", "DEFAULT": "calib.default", "DISABLE": "calib.disable",
        "SAVE": "calib.save", "RESET": "calib.reset", "FACTORY": "calib.factory",
        "EEPROM": "calib.eeprom", "Calibration application": "calib.title",
        "AUTO DC": "calib.auto_dc", "MANUAL DC": "calib.manual_dc",
        "AUTO AC/DC": "calib.auto_acdc", "MANUAL AC/DC": "calib.manual_acdc",
        "AUTO FREQUENCY": "calib.auto_frequency", "MANUAL FREQUENCY": "calib.manual_frequency",
        "MODE": "calib.mode", "VALUE": "calib.value", "STATE": "calib.state",
        "Before": "calib.before", "After": "calib.after", "Channel": "calib.channel",
        "Calib parameters": "calib.parameters", "Uses FPGA": "calib.uses_fpga",
        "Gain:": "calib.gain", "Value measurement mode": "calib.measurement_mode",
        "Filter in FPGA": "calib.fpga_filter", "Decimation:": "calib.decimation",
        "Hysteresis (V):": "calib.hysteresis", "AUTO": "calib.auto",
        "Oops, something went wrong": "calib.error_title",
        "Please send us the report and help us to fix this issue": "calib.report_request",
        "Thank you!": "calib.thank_you", "Send report": "calib.send_report",
        "Restart Application": "calib.restart", "Calibration": "calib.calibration",
        "Reference voltage:": "calib.reference_voltage", "Bypass:": "calib.bypass",
        "Keep current values": "calib.keep_values", "Restore default settings": "calib.restore_defaults",
        "Disable (set to zero)": "calib.disable_zero", "Ok": "calib.ok", "Cancel": "calib.cancel",
        "Calibrate": "calib.calibrate", "Auto calibration": "calib.auto_calibration",
        "Filter parameters:": "calib.filter_parameters", "Channels:": "calib.channels",
        "EEPROM values": "calib.eeprom_values", "EEPROM Info": "calib.eeprom_info",
        "Factory zone": "calib.factory_zone", "User zone": "calib.user_zone", "SHOW": "calib.show",
        "FACTORY BACKUP": "calib.factory_backup", "USER BACKUP": "calib.user_backup",
        "USER RESTORE": "calib.user_restore"
    };

    function format(key, values) {
        return Object.keys(values).reduce(function (text, name) {
            return text.replace(new RegExp("\\{" + name + "\\}", "g"), values[name]);
        }, RP_I18N.t(key));
    }

    function stepName(source) {
        var fixed = {
            "Reset to default": "calib.step.reset_default",
            "Prepare": "calib.step.prepare",
            "LV mode": "calib.step.lv_mode",
            "HV mode": "calib.step.hv_mode",
            "Save calibration values": "calib.step.save_values",
            "Calibration complete": "calib.step.complete"
        };
        if (fixed[source]) return RP_I18N.t(fixed[source]);

        var match = source.match(/^(Enable|Disable) DAC(?: \((x[15])\))?$/);
        if (match) return format(match[1] === "Enable" ? "calib.step.enable_dac" : "calib.step.disable_dac", {
            gain: match[2] ? " (" + match[2] + ")" : ""
        });

        match = source.match(/^ADC set in (HV|LV)(\/AC)?$/);
        if (match) return format("calib.step.adc_set", {
            mode: RP_I18N.getLanguage() === "zh-CN" ? (match[1] === "HV" ? "高压" : "低压") + (match[2] ? "交流" : "") : match[1] + (match[2] || "")
        });

        match = source.match(/^Set (1:(?:1|20)) DC mode$/);
        if (match) return format("calib.step.set_dc_mode", { range: match[1] });

        match = source.match(/^ADC (gain|offset)( DC)?\s+\((1:(?:1|20))\)(\/AC)?$/);
        if (match) return format("calib.step.adc_adjust", {
            kind: RP_I18N.getLanguage() === "zh-CN" ? (match[1] === "gain" ? "增益" : "偏移") : match[1],
            signal: match[2] || "",
            range: match[3],
            ac: match[4] || ""
        });

        match = source.match(/^DAC (Gain|Offset) (First|Second|Third) Stage(?: \((x[15])\))?$/);
        if (match) return format("calib.step.dac_adjust", {
            kind: RP_I18N.getLanguage() === "zh-CN" ? (match[1] === "Gain" ? "增益" : "偏移") : match[1],
            stage: RP_I18N.getLanguage() === "zh-CN" ? ({ First: "一", Second: "二", Third: "三" })[match[2]] : match[2],
            gain: match[3] ? " (" + match[3] + ")" : ""
        });
        return source;
    }

    function hint(source) {
        if (!source) return "";
        if (source === "Choose what to do with the filter") return RP_I18N.t("calib.hint.choose_filter");
        var clean = source.replace(/\.\.$/, ".");
        var modeMatch = clean.match(/^Please set (HV|LV) mode and /);
        var mode = "";
        if (modeMatch) {
            mode = RP_I18N.getLanguage() === "zh-CN" ? "切换到" + (modeMatch[1] === "HV" ? "高压" : "低压") + "模式，并" : "set " + modeMatch[1] + " mode and ";
            clean = clean.slice(modeMatch[0].length - 8);
        }
        var load = clean.indexOf("(50 Ohm load)") !== -1;
        var inputs = clean.indexOf("IN3") !== -1 ? "IN1、IN2、IN3、IN4" : "IN1、IN2";
        var values = {
            mode: mode,
            inputs: RP_I18N.getLanguage() === "zh-CN" ? inputs : inputs.replace(/、/g, ", ").replace(", IN4", " and IN4"),
            load: load ? (RP_I18N.getLanguage() === "zh-CN" ? "（50 Ω 负载）" : " (50 Ohm load)") : ""
        };
        if (/to GND\.$/.test(clean)) return format("calib.hint.connect_ground", values);
        if (/to reference DC source\.$/.test(clean)) return format("calib.hint.connect_reference", values);
        if (/connect OUT1 to IN1 and OUT2 to IN2/.test(clean)) return format("calib.hint.connect_outputs", values);
        return source;
    }

    window.CALIB_I18N = { format: format, hint: hint, stepName: stepName };
}());
