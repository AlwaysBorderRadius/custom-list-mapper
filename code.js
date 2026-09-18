function init() {
    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] loaded v1.8.6");

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // HOOKS
    // Note: Seanime compiles each hook callback in an isolated runtime, so the merge logic must be
    // fully self-contained (it cannot access outer variables). It is duplicated between the two hooks.
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    if (typeof $app.onGetAnimeCollection === "function") {
        $app.onGetAnimeCollection(function (e) {
            try {
                (function (e) {
                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] onGetAnimeCollection fired");

                    try {
                        var _dgGet = function (o, a, b) { if (o == null) return undefined; var v = o[a]; return (v === undefined && b !== undefined) ? o[b] : v; };
                        var _dac = e.animeCollection || e.AnimeCollection;
                        var _dcol = _dgGet(_dac, "mediaListCollection", "MediaListCollection") || {};
                        var _dlists = _dgGet(_dcol, "lists", "Lists") || [];
                        var _diag = { lists: _dlists.length, status: 0, custom: 0, entries: 0 };
                        for (var _a = 0; _a < _dlists.length; _a++) {
                            var _dl = _dlists[_a] || {};
                            var _ds = _dgGet(_dl, "status", "Status");
                            var _dc = (_dl.isCustomList === true || _dl.IsCustomList === true) || (_ds == null);
                            if (_dc) _diag.custom++; else if (_ds != null) _diag.status++;
                            var _de = _dgGet(_dl, "entries", "Entries") || [];
                            for (var _b = 0; _b < _de.length; _b++) {
                                var _en = _de[_b];
                                _diag.entries++;
                                if (_en == null || (_en.media || _en.Media) == null) {
                                    if (typeof console !== "undefined" && console.log) console.log("[clm:diag] NULL-MEDIA hook=onGetAnimeCollection list=" + ((_dl.name || _dl.Name) || "?") + " status=" + (_ds == null ? "?" : _ds) + " idx=" + _b);
                                }
                            }
                        }
                        if (typeof console !== "undefined" && console.log) console.log("[clm:diag] onGetAnimeCollection fired ts=" + (typeof Date !== "undefined" && Date.now ? Date.now() : "?") + " lists=" + _diag.lists + " status=" + _diag.status + " custom=" + _diag.custom + " entries=" + _diag.entries + " ac=" + (_dac ? 1 : 0) + " col=" + (_dcol ? 1 : 0));
                    } catch (_errD) { }

                    var get = function (o, a, b) {
                        if (o == null) return undefined;
                        var v = o[a];
                        return (v === undefined && b !== undefined) ? o[b] : v;
                    };
                    var normList = function (v) {
                        if (v == null || !v.push) return [];
                        var seen = {}, out = [];
                        for (var i = 0; i < v.length; i++) {
                            if (typeof v[i] !== "string") continue;
                            var t = v[i].trim();
                            if (t && !seen[t]) { seen[t] = true; out.push(t); }
                        }
                        return out;
                    };
                    var midOf = function (en) {
                        if (en == null) return undefined;
                        var m = en.media || en.Media;
                        if (m != null) {
                            if (m.id !== undefined) return m.id;
                            if (m.Id !== undefined) return m.Id;
                        }
                        if (en.mediaId !== undefined) return en.mediaId;
                        if (en.MediaId !== undefined) return en.MediaId;
                        return undefined;
                    };
                    var copyObj = function (obj) {
                        var out = {};
                        if (obj == null) return out;
                        for (var key in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key];
                        }
                        return out;
                    };
                    var STATUS_ORDER = ["CURRENT", "REPEATING", "PLANNING", "PAUSED", "COMPLETED", "DROPPED"];

                    var _uiLang = "es";
                    try { var _sl = $storage.get("lang"); if (_sl === "en") _uiLang = "en"; } catch (err) { }

                    var mapping = {};
                    var m1 = $store.get("mapping");
                    if (m1) {
                        mapping = m1;
                    } else if (typeof $storage !== "undefined") {
                        try { mapping = $storage.get("mapping") || {}; } catch (err) { mapping = {}; }
                    }

                    var ac = e.animeCollection || e.AnimeCollection;
                    var col = get(ac, "mediaListCollection", "MediaListCollection") || {};
                    var lists = get(col, "lists", "Lists") || [];
                    if (!lists.length) {
                        if (typeof console !== "undefined" && console.log) console.log("[clm:diag] EMPTY-CACHE normalized-hook -> raw-fresh (lists=0)");
                    }

                    var customByName = {};
                    var customCount = 0;
                    var customSource = "none";
                    try {
                        var raw = $anilist.getRawAnimeCollection(false);
                        var rawCol = get(raw, "mediaListCollection", "MediaListCollection") || {};
                        var rawLists = get(rawCol, "lists", "Lists") || [];
                        for (var i = 0; i < rawLists.length; i++) {
                            var rl = rawLists[i];
                            var isCustom = (rl.isCustomList === true || rl.IsCustomList === true) || (rl.status == null && rl.Status == null);
                            var nm = rl.name || rl.Name;
                            if (isCustom && nm) {
                                customByName[nm] = get(rl, "entries", "Entries") || [];
                                customCount++;
                            }
                        }
                        if (customCount > 0) customSource = "raw-cache";
                    } catch (err) {
                        if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] failed to read raw collection: " + (err && err.message ? err.message : err));
                    }
                    if (customCount === 0) {
                        try {
                            var raw2 = $anilist.getRawAnimeCollection(true);
                            var rawCol2 = get(raw2, "mediaListCollection", "MediaListCollection") || {};
                            var rawLists2 = get(rawCol2, "lists", "Lists") || [];
                            for (var i2 = 0; i2 < rawLists2.length; i2++) {
                                var rl2 = rawLists2[i2];
                                var isCustom2 = (rl2.isCustomList === true || rl2.IsCustomList === true) || (rl2.status == null && rl2.Status == null);
                                var nm2 = rl2.name || rl2.Name;
                                if (isCustom2 && nm2) {
                                    customByName[nm2] = get(rl2, "entries", "Entries") || [];
                                    customCount++;
                                }
                            }
                            if (customCount > 0) customSource = "raw-fresh";
                        } catch (err) {
                            if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] failed to refresh raw collection: " + (err && err.message ? err.message : err));
                        }
                    }
                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] custom lists found (" + customSource + "): " + customCount);

                    var STATUS_NAMES = _uiLang === "en" ? {
                        CURRENT: "Watching",
                        REPEATING: "Repeating",
                        PLANNING: "Planning",
                        PAUSED: "Paused",
                        COMPLETED: "Completed",
                        DROPPED: "Dropped"
                    } : {
                        CURRENT: "En reproducción",
                        REPEATING: "Repitiendo",
                        PLANNING: "Planeado",
                        PAUSED: "En pausa",
                        COMPLETED: "Completado",
                        DROPPED: "Descartado"
                    };

                    // Only lists with a status are pre-existing status lists.
                    // Build the served collection as the 6 virtual status lists.
                    var claimed = {};
                    var served = [];
                    var injected = 0;
                    for (var q = 0; q < STATUS_ORDER.length; q++) {
                        var target = STATUS_ORDER[q];
                        var targetList = { name: STATUS_NAMES[target] || target, status: target, isCustomList: false, entries: [] };
                        var targetArr = targetList.entries;
                        // Preserve original entries of this status (if any)
                        for (var j = 0; j < lists.length; j++) {
                            var lj = lists[j] || {};
                            var st0 = get(lj, "status", "Status");
                            if (st0 !== target) continue;
                            var ents0 = get(lj, "entries", "Entries") || [];
                            for (var k = 0; k < ents0.length; k++) {
                                var eOrig = ents0[k];
                                if (eOrig == null || (eOrig.media || eOrig.Media) == null) {
                                    if (typeof console !== "undefined" && console.log) console.log("[custom-list-mapper] skipped original entry without media: list=" + target + " mediaId=" + (eOrig ? (eOrig.mediaId !== undefined ? eOrig.mediaId : eOrig.MediaId) : "?"));
                                    continue;
                                }
                                var mOrig = midOf(eOrig);
                                if (mOrig !== undefined) claimed[mOrig] = true;
                                targetArr.push(copyObj(eOrig));
                            }
                        }
                        // Inject entries from the mapped custom lists
                        var names = mapping[target] ? normList(mapping[target]) : [];
                        for (var n = 0; n < names.length; n++) {
                            var entryArr = customByName[names[n]];
                            if (!entryArr) {
                                if (typeof $debug !== "undefined" && $debug.warn) $debug.warn("[custom-list-mapper] custom list not found: " + names[n]);
                                continue;
                            }
                            for (var e2 = 0; e2 < entryArr.length; e2++) {
                                var en = entryArr[e2];
                                if (en == null || (en.media || en.Media) == null) {
                                    if (typeof console !== "undefined" && console.log) console.log("[custom-list-mapper] skipped mapped entry without media: list=" + names[n] + " mediaId=" + (en ? (en.mediaId !== undefined ? en.mediaId : en.MediaId) : "?"));
                                    continue;
                                }
                                var mid = midOf(en);
                                if (mid === undefined) continue;
                                if (claimed[mid]) continue;
                                claimed[mid] = true;
                                var copy = copyObj(en);
                                copy.status = target;
                                targetArr.push(copy);
                                injected++;
                            }
                        }
                        served.push(targetList);
                    }

                    // Serve a detached, shallow copy of the collection (race-safe: never mutate the cached instance)
                    if (ac && col) {
                        var servCol = copyObj(col);
                        servCol.lists = served;
                        var ac2 = copyObj(ac);
                        if (ac.mediaListCollection) ac2.mediaListCollection = servCol;
                        else ac2.MediaListCollection = servCol;
                        e.animeCollection = ac2;
                    }

                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] served " + served.length + " status list(s), injected " + injected + " entries");
                    if (typeof console !== "undefined" && console.log) console.log("[clm:diag] normalized served lists=" + served.length + " injected=" + injected);
                })(e);
            } catch (err) {
                if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] onGetAnimeCollection error: " + (err && err.message ? err.message : err));
            }
            e.next();
        });
    }

    if (typeof $app.onGetCachedAnimeCollection === "function") {
        $app.onGetCachedAnimeCollection(function (e) {
            try {
                (function (e) {
                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] onGetCachedAnimeCollection fired");

                    try {
                        var _dgGet = function (o, a, b) { if (o == null) return undefined; var v = o[a]; return (v === undefined && b !== undefined) ? o[b] : v; };
                        var _dac = e.animeCollection || e.AnimeCollection;
                        var _dcol = _dgGet(_dac, "mediaListCollection", "MediaListCollection") || {};
                        var _dlists = _dgGet(_dcol, "lists", "Lists") || [];
                        var _diag = { lists: _dlists.length, status: 0, custom: 0, entries: 0 };
                        for (var _a = 0; _a < _dlists.length; _a++) {
                            var _dl = _dlists[_a] || {};
                            var _ds = _dgGet(_dl, "status", "Status");
                            var _dc = (_dl.isCustomList === true || _dl.IsCustomList === true) || (_ds == null);
                            if (_dc) _diag.custom++; else if (_ds != null) _diag.status++;
                            var _de = _dgGet(_dl, "entries", "Entries") || [];
                            for (var _b = 0; _b < _de.length; _b++) {
                                var _en = _de[_b];
                                _diag.entries++;
                                if (_en == null || (_en.media || _en.Media) == null) {
                                    if (typeof console !== "undefined" && console.log) console.log("[clm:diag] NULL-MEDIA hook=onGetCachedAnimeCollection list=" + ((_dl.name || _dl.Name) || "?") + " status=" + (_ds == null ? "?" : _ds) + " idx=" + _b);
                                }
                            }
                        }
                        if (typeof console !== "undefined" && console.log) console.log("[clm:diag] onGetCachedAnimeCollection fired ts=" + (typeof Date !== "undefined" && Date.now ? Date.now() : "?") + " lists=" + _diag.lists + " status=" + _diag.status + " custom=" + _diag.custom + " entries=" + _diag.entries + " ac=" + (_dac ? 1 : 0) + " col=" + (_dcol ? 1 : 0));
                    } catch (_errD) { }

                    var get = function (o, a, b) {
                        if (o == null) return undefined;
                        var v = o[a];
                        return (v === undefined && b !== undefined) ? o[b] : v;
                    };
                    var normList = function (v) {
                        if (v == null || !v.push) return [];
                        var seen = {}, out = [];
                        for (var i = 0; i < v.length; i++) {
                            if (typeof v[i] !== "string") continue;
                            var t = v[i].trim();
                            if (t && !seen[t]) { seen[t] = true; out.push(t); }
                        }
                        return out;
                    };
                    var midOf = function (en) {
                        if (en == null) return undefined;
                        var m = en.media || en.Media;
                        if (m != null) {
                            if (m.id !== undefined) return m.id;
                            if (m.Id !== undefined) return m.Id;
                        }
                        if (en.mediaId !== undefined) return en.mediaId;
                        if (en.MediaId !== undefined) return en.MediaId;
                        return undefined;
                    };
                    var copyObj = function (obj) {
                        var out = {};
                        if (obj == null) return out;
                        for (var key in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key];
                        }
                        return out;
                    };
                    var STATUS_ORDER = ["CURRENT", "REPEATING", "PLANNING", "PAUSED", "COMPLETED", "DROPPED"];

                    var _uiLang = "es";
                    try { var _sl = $storage.get("lang"); if (_sl === "en") _uiLang = "en"; } catch (err) { }

                    var mapping = {};
                    var m1 = $store.get("mapping");
                    if (m1) {
                        mapping = m1;
                    } else if (typeof $storage !== "undefined") {
                        try { mapping = $storage.get("mapping") || {}; } catch (err) { mapping = {}; }
                    }

                    var ac = e.animeCollection || e.AnimeCollection;
                    var col = get(ac, "mediaListCollection", "MediaListCollection") || {};
                    var lists = get(col, "lists", "Lists") || [];
                    if (!lists.length) {
                        if (typeof console !== "undefined" && console.log) console.log("[clm:diag] EMPTY-CACHE normalized-hook -> raw-fresh (lists=0)");
                    }

                    var customByName = {};
                    var customCount = 0;
                    var customSource = "none";
                    try {
                        var raw = $anilist.getRawAnimeCollection(false);
                        var rawCol = get(raw, "mediaListCollection", "MediaListCollection") || {};
                        var rawLists = get(rawCol, "lists", "Lists") || [];
                        for (var i = 0; i < rawLists.length; i++) {
                            var rl = rawLists[i];
                            var isCustom = (rl.isCustomList === true || rl.IsCustomList === true) || (rl.status == null && rl.Status == null);
                            var nm = rl.name || rl.Name;
                            if (isCustom && nm) {
                                customByName[nm] = get(rl, "entries", "Entries") || [];
                                customCount++;
                            }
                        }
                        if (customCount > 0) customSource = "raw-cache";
                    } catch (err) {
                        if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] failed to read raw collection: " + (err && err.message ? err.message : err));
                    }
                    if (customCount === 0) {
                        try {
                            var raw2 = $anilist.getRawAnimeCollection(true);
                            var rawCol2 = get(raw2, "mediaListCollection", "MediaListCollection") || {};
                            var rawLists2 = get(rawCol2, "lists", "Lists") || [];
                            for (var i2 = 0; i2 < rawLists2.length; i2++) {
                                var rl2 = rawLists2[i2];
                                var isCustom2 = (rl2.isCustomList === true || rl2.IsCustomList === true) || (rl2.status == null && rl2.Status == null);
                                var nm2 = rl2.name || rl2.Name;
                                if (isCustom2 && nm2) {
                                    customByName[nm2] = get(rl2, "entries", "Entries") || [];
                                    customCount++;
                                }
                            }
                            if (customCount > 0) customSource = "raw-fresh";
                        } catch (err) {
                            if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] failed to refresh raw collection: " + (err && err.message ? err.message : err));
                        }
                    }
                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] custom lists found (" + customSource + "): " + customCount);

                    var STATUS_NAMES = _uiLang === "en" ? {
                        CURRENT: "Watching",
                        REPEATING: "Repeating",
                        PLANNING: "Planning",
                        PAUSED: "Paused",
                        COMPLETED: "Completed",
                        DROPPED: "Dropped"
                    } : {
                        CURRENT: "En reproducción",
                        REPEATING: "Repitiendo",
                        PLANNING: "Planeado",
                        PAUSED: "En pausa",
                        COMPLETED: "Completado",
                        DROPPED: "Descartado"
                    };

                    // Only lists with a status are pre-existing status lists.
                    // Build the served collection as the 6 virtual status lists.
                    var claimed = {};
                    var served = [];
                    var injected = 0;
                    for (var q = 0; q < STATUS_ORDER.length; q++) {
                        var target = STATUS_ORDER[q];
                        var targetList = { name: STATUS_NAMES[target] || target, status: target, isCustomList: false, entries: [] };
                        var targetArr = targetList.entries;
                        // Preserve original entries of this status (if any)
                        for (var j = 0; j < lists.length; j++) {
                            var lj = lists[j] || {};
                            var st0 = get(lj, "status", "Status");
                            if (st0 !== target) continue;
                            var ents0 = get(lj, "entries", "Entries") || [];
                            for (var k = 0; k < ents0.length; k++) {
                                var eOrig = ents0[k];
                                if (eOrig == null || (eOrig.media || eOrig.Media) == null) {
                                    if (typeof console !== "undefined" && console.log) console.log("[custom-list-mapper] skipped original entry without media: list=" + target + " mediaId=" + (eOrig ? (eOrig.mediaId !== undefined ? eOrig.mediaId : eOrig.MediaId) : "?"));
                                    continue;
                                }
                                var mOrig = midOf(eOrig);
                                if (mOrig !== undefined) claimed[mOrig] = true;
                                targetArr.push(copyObj(eOrig));
                            }
                        }
                        // Inject entries from the mapped custom lists
                        var names = mapping[target] ? normList(mapping[target]) : [];
                        for (var n = 0; n < names.length; n++) {
                            var entryArr = customByName[names[n]];
                            if (!entryArr) {
                                if (typeof $debug !== "undefined" && $debug.warn) $debug.warn("[custom-list-mapper] custom list not found: " + names[n]);
                                continue;
                            }
                            for (var e2 = 0; e2 < entryArr.length; e2++) {
                                var en = entryArr[e2];
                                if (en == null || (en.media || en.Media) == null) {
                                    if (typeof console !== "undefined" && console.log) console.log("[custom-list-mapper] skipped mapped entry without media: list=" + names[n] + " mediaId=" + (en ? (en.mediaId !== undefined ? en.mediaId : en.MediaId) : "?"));
                                    continue;
                                }
                                var mid = midOf(en);
                                if (mid === undefined) continue;
                                if (claimed[mid]) continue;
                                claimed[mid] = true;
                                var copy = copyObj(en);
                                copy.status = target;
                                targetArr.push(copy);
                                injected++;
                            }
                        }
                        served.push(targetList);
                    }

                    // Serve a detached, shallow copy of the collection (race-safe: never mutate the cached instance)
                    if (ac && col) {
                        var servCol = copyObj(col);
                        servCol.lists = served;
                        var ac2 = copyObj(ac);
                        if (ac.mediaListCollection) ac2.mediaListCollection = servCol;
                        else ac2.MediaListCollection = servCol;
                        e.animeCollection = ac2;
                    }

                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] served " + served.length + " status list(s), injected " + injected + " entries");
                    if (typeof console !== "undefined" && console.log) console.log("[clm:diag] normalized served lists=" + served.length + " injected=" + injected);
                })(e);
            } catch (err) {
                if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] onGetCachedAnimeCollection error: " + (err && err.message ? err.message : err));
            }
            e.next();
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // RAW COLLECTION HOOKS
    // The Lists page and the "My Lists" home row read the RAW collection (custom lists retained).
    // Here we inject the mapped custom-list entries into the existing status lists, keeping the
    // custom lists untouched. Like the hooks above, each callback runs in an isolated runtime, so
    // the logic is fully self-contained / duplicated.
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    if (typeof $app.onGetRawAnimeCollection === "function") {
        $app.onGetRawAnimeCollection(function (e) {
            try {
                (function (e) {
                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] onGetRawAnimeCollection fired");

                    try {
                        var _dgGet = function (o, a, b) { if (o == null) return undefined; var v = o[a]; return (v === undefined && b !== undefined) ? o[b] : v; };
                        var _dac = e.animeCollection || e.AnimeCollection;
                        var _dcol = _dgGet(_dac, "mediaListCollection", "MediaListCollection") || {};
                        var _dlists = _dgGet(_dcol, "lists", "Lists") || [];
                        var _diag = { lists: _dlists.length, status: 0, custom: 0, entries: 0 };
                        for (var _a = 0; _a < _dlists.length; _a++) {
                            var _dl = _dlists[_a] || {};
                            var _ds = _dgGet(_dl, "status", "Status");
                            var _dc = (_dl.isCustomList === true || _dl.IsCustomList === true) || (_ds == null);
                            if (_dc) _diag.custom++; else if (_ds != null) _diag.status++;
                            var _de = _dgGet(_dl, "entries", "Entries") || [];
                            for (var _b = 0; _b < _de.length; _b++) {
                                var _en = _de[_b];
                                _diag.entries++;
                                if (_en == null || (_en.media || _en.Media) == null) {
                                    if (typeof console !== "undefined" && console.log) console.log("[clm:diag] NULL-MEDIA hook=onGetRawAnimeCollection list=" + ((_dl.name || _dl.Name) || "?") + " status=" + (_ds == null ? "?" : _ds) + " idx=" + _b);
                                }
                            }
                        }
                        if (typeof console !== "undefined" && console.log) console.log("[clm:diag] onGetRawAnimeCollection fired ts=" + (typeof Date !== "undefined" && Date.now ? Date.now() : "?") + " lists=" + _diag.lists + " status=" + _diag.status + " custom=" + _diag.custom + " entries=" + _diag.entries + " ac=" + (_dac ? 1 : 0) + " col=" + (_dcol ? 1 : 0));
                    } catch (_errD) { }

                    var get = function (o, a, b) {
                        if (o == null) return undefined;
                        var v = o[a];
                        return (v === undefined && b !== undefined) ? o[b] : v;
                    };
                    var normList = function (v) {
                        if (v == null || !v.push) return [];
                        var seen = {}, out = [];
                        for (var i = 0; i < v.length; i++) {
                            if (typeof v[i] !== "string") continue;
                            var t = v[i].trim();
                            if (t && !seen[t]) { seen[t] = true; out.push(t); }
                        }
                        return out;
                    };
                    var midOf = function (en) {
                        if (en == null) return undefined;
                        var m = en.media || en.Media;
                        if (m != null) {
                            if (m.id !== undefined) return m.id;
                            if (m.Id !== undefined) return m.Id;
                        }
                        if (en.mediaId !== undefined) return en.mediaId;
                        if (en.MediaId !== undefined) return en.MediaId;
                        return undefined;
                    };
                    var copyObj = function (obj) {
                        var out = {};
                        if (obj == null) return out;
                        for (var key in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key];
                        }
                        return out;
                    };
                    var STATUS_ORDER = ["CURRENT", "REPEATING", "PLANNING", "PAUSED", "COMPLETED", "DROPPED"];

                    var mapping = {};
                    var m1 = $store.get("mapping");
                    if (m1) {
                        mapping = m1;
                    } else if (typeof $storage !== "undefined") {
                        try { mapping = $storage.get("mapping") || {}; } catch (err) { mapping = {}; }
                    }

                    var ac = e.animeCollection || e.AnimeCollection;
                    var col = get(ac, "mediaListCollection", "MediaListCollection") || {};
                    var lists = get(col, "lists", "Lists") || [];

                    var customByName = {};
                    var claimed = {};
                    var statusByName = {};
                    for (var i = 0; i < lists.length; i++) {
                        var l = lists[i] || {};
                        var st = get(l, "status", "Status");
                        var isCustom = (l.isCustomList === true || l.IsCustomList === true) || (st == null);
                        var nm = l.name || l.Name;
                        var ents = get(l, "entries", "Entries") || [];
                        if (isCustom) {
                            if (nm) customByName[nm] = ents;
                            continue;
                        }
                        if (st != null && nm) statusByName[st] = l;
                        for (var k = 0; k < ents.length; k++) {
                            var mid0 = midOf(ents[k]);
                            if (mid0 !== undefined) claimed[mid0] = true;
                        }
                    }

                    var injected = 0;
                    // Build detached raw lists: status lists get a fresh entries array so injections never
                    // mutate the shared cached raw collection (avoids race panics under concurrent requests).
                    // The raw path MUST inject too: the "My Lists" page consumes the raw collection.
                    var newLists = [];
                    var statusByName2 = {};
                    for (var li = 0; li < lists.length; li++) {
                        var ol = lists[li] || {};
                        var ost = get(ol, "status", "Status");
                        if (ost != null) {
                            var cl = copyObj(ol);
                            var entArr0 = get(ol, "entries", "Entries") || [];
                            cl.entries = entArr0.slice();
                            cl.Entries = cl.entries;
                            newLists.push(cl);
                            statusByName2[ost] = cl;
                        } else {
                            newLists.push(ol);
                        }
                    }
                    for (var q = 0; q < STATUS_ORDER.length; q++) {
                        var target = STATUS_ORDER[q];
                        var names = mapping[target] ? normList(mapping[target]) : [];
                        if (!names.length) continue;
                        var targetList = statusByName2[target];
                        if (!targetList) {
                            targetList = { name: target, status: target, isCustomList: false, entries: [], Entries: [] };
                            statusByName2[target] = targetList;
                            newLists.push(targetList);
                        }
                        var targetArr = get(targetList, "entries", "Entries");
                        if (!targetArr || !targetArr.push) {
                            targetArr = [];
                            if (targetList.entries !== undefined) targetList.entries = targetArr; else targetList.Entries = targetArr;
                        }
                        for (var n = 0; n < names.length; n++) {
                            var entryArr = customByName[names[n]];
                            if (!entryArr) continue;
                            for (var e2 = 0; e2 < entryArr.length; e2++) {
                                var en = entryArr[e2];
                                if (en == null || (en.media || en.Media) == null) {
                                    if (typeof console !== "undefined" && console.log) console.log("[custom-list-mapper] skipped mapped entry without media: list=" + names[n] + " mediaId=" + (en ? (en.mediaId !== undefined ? en.mediaId : en.MediaId) : "?"));
                                    continue;
                                }
                                var mid = midOf(en);
                                if (mid === undefined || claimed[mid]) continue;
                                claimed[mid] = true;
                                var copy = copyObj(en);
                                copy.status = target;
                                targetArr.push(copy);
                                injected++;
                            }
                        }
                    }
                    // Serve a detached copy of the raw collection (race-safe: never mutate the cached instance)
                    if (ac && col) {
                        var servCol = copyObj(col);
                        servCol.lists = newLists;
                        var ac2raw = copyObj(ac);
                        if (ac.mediaListCollection) ac2raw.mediaListCollection = servCol;
                        else ac2raw.MediaListCollection = servCol;
                        e.animeCollection = ac2raw;
                    }

                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] raw: injected " + injected + " entries (custom lists kept: " + Object.keys(customByName).length + ")");
                    if (typeof console !== "undefined" && console.log) console.log("[clm:diag] raw served lists=" + newLists.length + " injected=" + injected + " customKept=" + (Object.keys(customByName).length));
                })(e);
            } catch (err) {
                if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] onGetRawAnimeCollection error: " + (err && err.message ? err.message : err));
            }
            e.next();
        });
    }

    if (typeof $app.onGetCachedRawAnimeCollection === "function") {
        $app.onGetCachedRawAnimeCollection(function (e) {
            try {
                (function (e) {
                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] onGetCachedRawAnimeCollection fired");

                    try {
                        var _dgGet = function (o, a, b) { if (o == null) return undefined; var v = o[a]; return (v === undefined && b !== undefined) ? o[b] : v; };
                        var _dac = e.animeCollection || e.AnimeCollection;
                        var _dcol = _dgGet(_dac, "mediaListCollection", "MediaListCollection") || {};
                        var _dlists = _dgGet(_dcol, "lists", "Lists") || [];
                        var _diag = { lists: _dlists.length, status: 0, custom: 0, entries: 0 };
                        for (var _a = 0; _a < _dlists.length; _a++) {
                            var _dl = _dlists[_a] || {};
                            var _ds = _dgGet(_dl, "status", "Status");
                            var _dc = (_dl.isCustomList === true || _dl.IsCustomList === true) || (_ds == null);
                            if (_dc) _diag.custom++; else if (_ds != null) _diag.status++;
                            var _de = _dgGet(_dl, "entries", "Entries") || [];
                            for (var _b = 0; _b < _de.length; _b++) {
                                var _en = _de[_b];
                                _diag.entries++;
                                if (_en == null || (_en.media || _en.Media) == null) {
                                    if (typeof console !== "undefined" && console.log) console.log("[clm:diag] NULL-MEDIA hook=onGetCachedRawAnimeCollection list=" + ((_dl.name || _dl.Name) || "?") + " status=" + (_ds == null ? "?" : _ds) + " idx=" + _b);
                                }
                            }
                        }
                        if (typeof console !== "undefined" && console.log) console.log("[clm:diag] onGetCachedRawAnimeCollection fired ts=" + (typeof Date !== "undefined" && Date.now ? Date.now() : "?") + " lists=" + _diag.lists + " status=" + _diag.status + " custom=" + _diag.custom + " entries=" + _diag.entries + " ac=" + (_dac ? 1 : 0) + " col=" + (_dcol ? 1 : 0));
                    } catch (_errD) { }

                    var get = function (o, a, b) {
                        if (o == null) return undefined;
                        var v = o[a];
                        return (v === undefined && b !== undefined) ? o[b] : v;
                    };
                    var normList = function (v) {
                        if (v == null || !v.push) return [];
                        var seen = {}, out = [];
                        for (var i = 0; i < v.length; i++) {
                            if (typeof v[i] !== "string") continue;
                            var t = v[i].trim();
                            if (t && !seen[t]) { seen[t] = true; out.push(t); }
                        }
                        return out;
                    };
                    var midOf = function (en) {
                        if (en == null) return undefined;
                        var m = en.media || en.Media;
                        if (m != null) {
                            if (m.id !== undefined) return m.id;
                            if (m.Id !== undefined) return m.Id;
                        }
                        if (en.mediaId !== undefined) return en.mediaId;
                        if (en.MediaId !== undefined) return en.MediaId;
                        return undefined;
                    };
                    var copyObj = function (obj) {
                        var out = {};
                        if (obj == null) return out;
                        for (var key in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key];
                        }
                        return out;
                    };
                    var STATUS_ORDER = ["CURRENT", "REPEATING", "PLANNING", "PAUSED", "COMPLETED", "DROPPED"];

                    var mapping = {};
                    var m1 = $store.get("mapping");
                    if (m1) {
                        mapping = m1;
                    } else if (typeof $storage !== "undefined") {
                        try { mapping = $storage.get("mapping") || {}; } catch (err) { mapping = {}; }
                    }

                    var ac = e.animeCollection || e.AnimeCollection;
                    var col = get(ac, "mediaListCollection", "MediaListCollection") || {};
                    var lists = get(col, "lists", "Lists") || [];

                    var customByName = {};
                    var claimed = {};
                    var statusByName = {};
                    for (var i = 0; i < lists.length; i++) {
                        var l = lists[i] || {};
                        var st = get(l, "status", "Status");
                        var isCustom = (l.isCustomList === true || l.IsCustomList === true) || (st == null);
                        var nm = l.name || l.Name;
                        var ents = get(l, "entries", "Entries") || [];
                        if (isCustom) {
                            if (nm) customByName[nm] = ents;
                            continue;
                        }
                        if (st != null && nm) statusByName[st] = l;
                        for (var k = 0; k < ents.length; k++) {
                            var mid0 = midOf(ents[k]);
                            if (mid0 !== undefined) claimed[mid0] = true;
                        }
                    }

                    var injected = 0;
                    // Build detached raw lists: status lists get a fresh entries array so injections never
                    // mutate the shared cached raw collection (avoids race panics under concurrent requests).
                    // The raw path MUST inject too: the "My Lists" page consumes the raw collection.
                    var newLists = [];
                    var statusByName2 = {};
                    for (var li = 0; li < lists.length; li++) {
                        var ol = lists[li] || {};
                        var ost = get(ol, "status", "Status");
                        if (ost != null) {
                            var cl = copyObj(ol);
                            var entArr0 = get(ol, "entries", "Entries") || [];
                            cl.entries = entArr0.slice();
                            cl.Entries = cl.entries;
                            newLists.push(cl);
                            statusByName2[ost] = cl;
                        } else {
                            newLists.push(ol);
                        }
                    }
                    for (var q = 0; q < STATUS_ORDER.length; q++) {
                        var target = STATUS_ORDER[q];
                        var names = mapping[target] ? normList(mapping[target]) : [];
                        if (!names.length) continue;
                        var targetList = statusByName2[target];
                        if (!targetList) {
                            targetList = { name: target, status: target, isCustomList: false, entries: [], Entries: [] };
                            statusByName2[target] = targetList;
                            newLists.push(targetList);
                        }
                        var targetArr = get(targetList, "entries", "Entries");
                        if (!targetArr || !targetArr.push) {
                            targetArr = [];
                            if (targetList.entries !== undefined) targetList.entries = targetArr; else targetList.Entries = targetArr;
                        }
                        for (var n = 0; n < names.length; n++) {
                            var entryArr = customByName[names[n]];
                            if (!entryArr) continue;
                            for (var e2 = 0; e2 < entryArr.length; e2++) {
                                var en = entryArr[e2];
                                if (en == null || (en.media || en.Media) == null) {
                                    if (typeof console !== "undefined" && console.log) console.log("[custom-list-mapper] skipped mapped entry without media: list=" + names[n] + " mediaId=" + (en ? (en.mediaId !== undefined ? en.mediaId : en.MediaId) : "?"));
                                    continue;
                                }
                                var mid = midOf(en);
                                if (mid === undefined || claimed[mid]) continue;
                                claimed[mid] = true;
                                var copy = copyObj(en);
                                copy.status = target;
                                targetArr.push(copy);
                                injected++;
                            }
                        }
                    }
                    // Serve a detached copy of the raw collection (race-safe: never mutate the cached instance)
                    if (ac && col) {
                        var servCol = copyObj(col);
                        servCol.lists = newLists;
                        var ac2raw = copyObj(ac);
                        if (ac.mediaListCollection) ac2raw.mediaListCollection = servCol;
                        else ac2raw.MediaListCollection = servCol;
                        e.animeCollection = ac2raw;
                    }

                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] raw-cached: injected " + injected + " entries (custom lists kept: " + Object.keys(customByName).length + ")");
                    if (typeof console !== "undefined" && console.log) console.log("[clm:diag] raw-cached served lists=" + newLists.length + " injected=" + injected + " customKept=" + (Object.keys(customByName).length));
                })(e);
            } catch (err) {
                if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] onGetCachedRawAnimeCollection error: " + (err && err.message ? err.message : err));
            }
            e.next();
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // UI (webview settings page)
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    if (typeof $ui !== "undefined" && $ui.register) {
        $ui.register(function (ctx) {
            try {
                var STATUSES = [
                    { key: "CURRENT", label: "En reproducción" },
                    { key: "REPEATING", label: "Repitiendo" },
                    { key: "PLANNING", label: "Planeado" },
                    { key: "PAUSED", label: "En pausa" },
                    { key: "COMPLETED", label: "Completado" },
                    { key: "DROPPED", label: "Descartado" }
                ];

                var uiLang = ctx.state("es");
                try {
                    var _slr = $storage.get("lang");
                    if (_slr === "es" || _slr === "en") uiLang.set(_slr);
                } catch (err) { }

                var panel = ctx.newWebview({
                    slot: "screen",
                    fullWidth: true,
                    autoHeight: true
                });

                // ---- Tray: button in the "Tray Plugins" menu -> full-screen webview ----
                var tray = ctx.newTray({
                    tooltipText: "Custom Lists to Status",
                    iconUrl: "",
                    withContent: false,
                    isDrawer: false
                });
                tray.onClick(function () {
                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[tray] clicked, opening full-screen webview");
                    ctx.screen.navigateTo("/webview", { id: "custom-list-mapper" });
                });

                // ---- Pipeline telemetry: client mount -> content -> iframe load ----
                panel.onMount(function () {
                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[webview] onMount fired");
                });
                panel.onLoad(function () {
                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[webview] onLoad fired");
                });

                // ---- Load persisted mapping and prime the shared in-memory store ----
                function loadMapping() {
                    var m = {};
                    var saved = null;
                    try {
                        if (typeof $storage !== "undefined") saved = $storage.get("mapping");
                    } catch (err) {
                        if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] $storage.get failed: " + (err && err.message ? err.message : err));
                    }
                    if (saved) m = saved;
                    STATUSES.forEach(function (s) {
                        if (!m[s.key] || !m[s.key].push) m[s.key] = [];
                    });
                    return m;
                }

                var mapping = ctx.state(loadMapping());
                try {
                    if (typeof $storage !== "undefined") $store.set("mapping", mapping.get());
                } catch (err) {
                    if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] $store.set failed: " + (err && err.message ? err.message : err));
                }

                // ---- Custom list names: diagnostics + source selection + snapshot (guarded) ----
                var customLists = ctx.state([]);
                var manualLists = ctx.state([]);
                var loadError = null;

                try {
                    var _extras = (typeof $storage !== "undefined") ? $storage.get("extraLists") : null;
                    if (_extras && _extras.push) {
                        var _ee = _extras.filter(function (x) { return typeof x === "string"; });
                        if (_ee && _ee.length) manualLists.set(_ee);
                    }
                } catch (err) { }

                var get = function (o, a, b) {
                    if (o == null) return undefined;
                    var v = o[a];
                    return (v === undefined && b !== undefined) ? o[b] : v;
                };
                var getLists = function (raw) {
                    var col = (raw && (raw.mediaListCollection || raw.MediaListCollection)) || null;
                    return (col && (col.lists || col.Lists)) || [];
                };
                var isCustomList = function (l) {
                    if (!l) return false;
                    if (l.isCustomList === true || l.IsCustomList === true) return true;
                    return l.status == null && l.Status == null;
                };
                var readCustoms = function (raw) {
                    var byName = {};
                    var lists = getLists(raw);
                    for (var i = 0; i < lists.length; i++) {
                        var l = lists[i];
                        if (isCustomList(l) && (l.name || l.Name)) {
                            byName[l.name || l.Name] = get(l, "entries", "Entries") || [];
                        }
                    }
                    return { byName: byName, lists: lists };
                };
                var inspectDiag = function (label, raw, err) {
                    if (err) {
                        if (typeof $debug !== "undefined" && $debug.error) $debug.error("[diag] " + label + ": error -> " + (err && err.message ? err.message : err));
                        return null;
                    }
                    var lists = getLists(raw);
                    var byName = {};
                    var total = 0;
                    var customs = 0;
                    for (var i = 0; i < lists.length; i++) {
                        var l = lists[i];
                        var isC = isCustomList(l);
                        var n = get(l, "entries", "Entries") || [];
                        total += n.length;
                        if (isC) {
                            customs++;
                            if (l.name || l.Name) byName[l.name || l.Name] = n;
                        }
                    }
                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[diag] " + label + ": lists=" + lists.length + " customs=" + customs + " entries=" + total);
                    return { byName: byName, lists: lists };
                };
                var ENTRY_KEYS = ["id", "status", "scoreRaw", "score", "progress", "repeat", "private", "notes", "startedAt", "completedAt"];
                var MEDIA_KEYS = ["id", "idMal", "siteUrl", "status", "season", "type", "format", "seasonYear", "bannerImage", "episodes", "synonyms", "isAdult", "countryOfOrigin", "meanScore", "description", "genres", "duration", "title", "coverImage", "startDate", "endDate", "trailer", "nextAiringEpisode"];
                var copyKeys = function (src, keys) {
                    var out = {};
                    if (src == null) return out;
                    for (var i = 0; i < keys.length; i++) {
                        var k = keys[i];
                        if (src[k] !== undefined && src[k] !== null) out[k] = src[k];
                    }
                    return out;
                };
                var minimizeEntry = function (en) {
                    if (en == null) return null;
                    var out = copyKeys(en, ENTRY_KEYS);
                    var m = en.media || en.Media;
                    if (m) out.media = copyKeys(m, MEDIA_KEYS);
                    if (out.mediaId === undefined && out.media) out.mediaId = out.media.id;
                    return out;
                };
                var storeSnapshot = function (byName) {
                    var lists = {};
                    var count = 0;
                    var keys = Object.keys(byName);
                    for (var i = 0; i < keys.length; i++) {
                        var arr = byName[keys[i]] || [];
                        var mini = [];
                        for (var k = 0; k < arr.length; k++) mini.push(minimizeEntry(arr[k]));
                        lists[keys[i]] = mini;
                        count += mini.length;
                    }
                    var snap = { generatedAt: new Date().toISOString(), count: count, lists: lists };
                    if (typeof $storage === "undefined") return;
                    $storage.set("snapshot", snap);
                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[diag] snapshot stored: " + count + " entries in " + keys.length + " list(s)");
                };

                var mergeManualLists = function (namesArr) {
                    var out = namesArr.slice();
                    var extra = manualLists.get() || [];
                    for (var mi = 0; mi < extra.length; mi++) {
                        var en = extra[mi];
                        if (en && out.indexOf(en) < 0) out.push(en);
                    }
                    return out;
                };
                var loadCustomLists = function () {
                    var resCache = null;
                    var resBase = null;
                    var resFresh = null;
                    var resRel = null;
                    try { resCache = inspectDiag("RAW-cache", $anilist.getRawAnimeCollection(false), null); } catch (e5) { inspectDiag("RAW-cache", null, e5); }
                    try { resBase = inspectDiag("BASE-cache", $anilist.getAnimeCollection(false), null); } catch (e6) { inspectDiag("BASE-cache", null, e6); }
                    if (!resCache || Object.keys(resCache.byName).length === 0) {
                        try { resFresh = inspectDiag("RAW-fresh", $anilist.getRawAnimeCollection(true), null); } catch (e7) { inspectDiag("RAW-fresh", null, e7); }
                        if (!resFresh || Object.keys(resFresh.byName).length === 0) {
                            try { resRel = inspectDiag("REL-fresh", $anilist.getAnimeCollectionWithRelations(), null); } catch (e8) { inspectDiag("REL-fresh", null, e8); }
                        }
                    }
                    var cands = [];
                    if (resFresh && Object.keys(resFresh.byName).length > 0) cands.push({ s: "RAW-fresh", r: resFresh });
                    if (resRel && Object.keys(resRel.byName).length > 0) cands.push({ s: "REL-fresh", r: resRel });
                    if (resCache && Object.keys(resCache.byName).length > 0) cands.push({ s: "RAW-cache", r: resCache });
                    if (cands.length > 0) {
                        var namesArr = mergeManualLists(Object.keys(cands[0].r.byName));
                        customLists.set(namesArr);
                        if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] UI loaded " + namesArr.length + " custom list(s) from " + cands[0].s + " (manual=" + (manualLists.get() || []).length + ")");
                        try { storeSnapshot(cands[0].r.byName); } catch (e9) {
                            if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] snapshot store failed: " + (e9 && e9.message ? e9.message : e9));
                        }
                    } else {
                        if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] UI loaded 0 custom list(s) from all sources");
                    }
                };
                try { loadCustomLists(); } catch (err) {
                    loadError = (err && err.message) ? err.message : String(err);
                    if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] UI could not load custom lists: " + loadError);
                }

                // ---- Channels: sync state with the webview, handle save/reset ----
                panel.channel.sync("customLists", customLists);
                panel.channel.sync("manualLists", manualLists);
                panel.channel.sync("mapping", mapping);
                panel.channel.sync("lang", uiLang);

                panel.channel.on("setLang", function (next) {
                    if (next !== "es" && next !== "en") return;
                    uiLang.set(next);
                    try { if (typeof $storage !== "undefined") $storage.set("lang", next); } catch (err) { }
                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] language set to " + next);
                    panel.channel.sync("lang", uiLang);
                });

                panel.channel.on("manualAdd", function (name) {
                    try {
                        if (typeof name !== "string") return;
                        var t = name.trim();
                        if (!t) return;
                        var cur = manualLists.get() || [];
                        var known = customLists.get() || [];
                        if (cur.indexOf(t) >= 0 || known.indexOf(t) >= 0) {
                            ctx.toast.warning(uiLang.get() === "es" ? "Esa lista ya existe" : "That list already exists");
                            return;
                        }
                        cur = cur.slice();
                        cur.push(t);
                        manualLists.set(cur);
                        try { if (typeof $storage !== "undefined") $storage.set("extraLists", cur); } catch (err) { }
                        if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] manual list added: " + t);
                        loadCustomLists();
                        panel.channel.sync("manualLists", manualLists);
                        panel.channel.sync("customLists", customLists);
                        ctx.toast.success(uiLang.get() === "es" ? "Lista manual añadida" : "Manual list added");
                    } catch (err) {
                        if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] manualAdd failed: " + (err && err.message ? err.message : err));
                    }
                });

                panel.channel.on("manualRemove", function (name) {
                    try {
                        if (typeof name !== "string") return;
                        var cur = manualLists.get() || [];
                        var idx = cur.indexOf(name);
                        if (idx < 0) return;
                        cur = cur.slice();
                        cur.splice(idx, 1);
                        manualLists.set(cur);
                        try { if (typeof $storage !== "undefined") $storage.set("extraLists", cur); } catch (err) { }
                        if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] manual list removed: " + name);
                        loadCustomLists();
                        panel.channel.sync("manualLists", manualLists);
                        panel.channel.sync("customLists", customLists);
                        ctx.toast.success(uiLang.get() === "es" ? "Lista manual eliminada" : "Manual list removed");
                    } catch (err) {
                        if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] manualRemove failed: " + (err && err.message ? err.message : err));
                    }
                });

                panel.channel.on("save", function (nextMapping) {
                    try {
                        var cleaned = {};
                        STATUSES.forEach(function (s) {
                            var arr = [];
                            if (nextMapping && nextMapping[s.key] && nextMapping[s.key].push) {
                                var seen = {}, tmp = nextMapping[s.key];
                                for (var i = 0; i < tmp.length; i++) {
                                    if (typeof tmp[i] !== "string") continue;
                                    var t = tmp[i].trim();
                                    if (t && !seen[t]) { seen[t] = true; arr.push(t); }
                                }
                            }
                            cleaned[s.key] = arr;
                        });
                        mapping.set(cleaned);
                        try { $storage.set("mapping", cleaned); } catch (err) { }
                        try { $store.set("mapping", cleaned); } catch (err) { }
                        if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] mapping saved");
                        ctx.toast.success(uiLang.get() === "es" ? "Asignación de listas guardada" : "Custom list mapping saved");
                        try { $anilist.refreshAnimeCollection(); } catch (err) { }
                    } catch (err) {
                        if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] save failed: " + (err && err.message ? err.message : err));
                    }
                });

                panel.channel.on("reset", function () {
                    try {
                        var cleaned = {};
                        STATUSES.forEach(function (s) { cleaned[s.key] = []; });
                        mapping.set(cleaned);
                        try { $storage.set("mapping", cleaned); } catch (err) { }
                        try { $store.set("mapping", cleaned); } catch (err) { }
                        if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] mapping reset");
                        ctx.toast.success(uiLang.get() === "es" ? "Asignación restablecida" : "Custom list mapping reset");
                        try { $anilist.refreshAnimeCollection(); } catch (err) { }
                    } catch (err) {
                        if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] reset failed: " + (err && err.message ? err.message : err));
                    }
                });

                // ---- Diagnostics from inside the webview iframe ----
                panel.channel.on("uiDiag", function (d) {
                    try {
                        if (typeof $debug !== "undefined" && $debug.info) $debug.info("[webview] " + JSON.stringify(d));
                    } catch (err) { }
                });

                // ---- Render (always produces visible content) ----
                panel.setContent(function () {
                    var html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
    html { color-scheme: dark; overflow: hidden; }
    body {
        background: transparent;
        color: #e2e8f0;
        font-family: -apple-system, system-ui, sans-serif;
        margin: 0;
        padding: 20px;
    }
    #app { min-height: 60vh; }
    .card {
        background: #10161f;
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 12px;
        margin-bottom: 12px;
        overflow: hidden;
    }
    .head {
        display: flex; align-items: center; gap: 12px;
        padding: 14px 16px; cursor: pointer; user-select: none;
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; flex: 0 0 auto; }
    .head-label { font-weight: 600; flex: 1; }
    .badge {
        font-size: .75rem; background: #3b82f6; color: #fff;
        border-radius: 999px; padding: 2px 9px; font-weight: 600;
    }
    .chev { color: #94a3b8; transition: transform .15s; }
    .body { border-top: 1px solid rgba(255,255,255,.06); padding: 8px; max-height: 240px; overflow-y: auto; }
    .item {
        display: flex; align-items: center; gap: 10px;
        padding: 8px 10px; border-radius: 8px; cursor: pointer;
    }
    .item:hover { background: rgba(255,255,255,.04); }
    .item input { accent-color: #3b82f6; width: 15px; height: 15px; margin: 0; }
    .item span { font-size: .9rem; }
    .btn { border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-save { background: #3b82f6; color: #fff; font-weight: 600; }
    .btn-reset { background: rgba(255,255,255,.06); color: #e2e8f0; border: 1px solid rgba(255,255,255,.1); }
    .empty {
        padding: 24px; border-radius: 12px; text-align: center; opacity: .85;
        background: rgba(255,255,255,.03); border: 1px dashed rgba(255,255,255,.12);
    }
    .error {
        padding: 14px 16px; border-radius: 8px; margin-bottom: 12px;
        background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.35); color: #fca5a5;
        font-size: .85rem;
    }
</style>
</head>
<body>
<div id="app"></div>
<script>
(function () {
    var LANG = {
        es: {
            title: "Listas personalizadas a Estado",
            subtitle: "Elige qué listas personalizadas de AniList alimentan cada pestaña de estado. Los anime ocultos de las listas de estado solo aparecerán en la pestaña asignada dentro de Seanime.",
            manualTitle: "Listas manuales",
            manualSub: "Añade aquí nombres de listas personalizadas que AniList no devuelve (por ejemplo, listas vacías). Aparecerán en el selector de cada pestaña.",
            manualPlaceholder: "Nombre de la lista",
            manualAdd: "Añadir",
            manualRemove: "Quitar",
            sortOff: "Orden A-Z",
            sortOn: "Orden AniList",
            reset: "Restablecer",
            save: "Guardar asignación",
            empty: "Todavía no hay listas personalizadas cargadas. Si esto persiste, revisa los registros de depuración del plugin.",
            noBridge: "El puente del webview no está disponible (window.webview). Comprueba los logs de depuración del plugin.",
            errPrefix: "Error del webview: ",
            other: "English",
            st: { CURRENT: "En reproducción", REPEATING: "Repitiendo", PLANNING: "Planeado", PAUSED: "En pausa", COMPLETED: "Completado", DROPPED: "Descartado" }
        },
        en: {
            title: "Custom Lists to Status",
            subtitle: "Choose which AniList custom lists feed each status tab. Anime hidden from the status lists will only appear in the assigned tab inside Seanime.",
            manualTitle: "Manual lists",
            manualSub: "Add names of custom lists that AniList does not return (e.g. empty lists). They will appear in the selector of each tab.",
            manualPlaceholder: "List name",
            manualAdd: "Add",
            manualRemove: "Remove",
            sortOff: "Order A-Z",
            sortOn: "AniList order",
            reset: "Reset",
            save: "Save mapping",
            empty: "No custom lists loaded yet. If this persists, check the plugin debug logs.",
            noBridge: "The webview bridge is not available (window.webview). Check the plugin debug logs.",
            errPrefix: "Webview error: ",
            other: "Español",
            st: { CURRENT: "Watching", REPEATING: "Repeating", PLANNING: "Planning", PAUSED: "Paused", COMPLETED: "Completed", DROPPED: "Dropped" }
        }
    };
    var lang = "es";

    function tr() { return LANG[lang] || LANG.es; }

    function statusLabel(key) { var l = tr(); return (l.st && l.st[key]) || key; }

    var STATUSES = [
        { key: "CURRENT", color: "#3b82f6" },
        { key: "REPEATING", color: "#a855f7" },
        { key: "PLANNING", color: "#22c55e" },
        { key: "PAUSED", color: "#eab308" },
        { key: "COMPLETED", color: "#06b6d4" },
        { key: "DROPPED", color: "#ef4444" }
    ];

    var app = document.getElementById("app");
    var wv = window.webview;
    var customLists = [];
    var manualLists = [];
    var mapping = {};
    var selected = {};
    var open = {};
    var sortAlpha = false;
    STATUSES.forEach(function (s) { selected[s.key] = []; });

    function hasWv() { return wv && wv.on && wv.send; }

    function diag(stage, extra) {
        try {
            var data = { stage: stage, at: new Date().toISOString() };
            for (var k in (extra || {})) { if (Object.prototype.hasOwnProperty.call(extra, k)) data[k] = extra[k]; }
            data.hasBridge = hasWv();
            if (hasWv()) wv.send("uiDiag", data);
        } catch (err) {}
    }

    diag("boot", { hasApp: !!app, readyState: document.readyState });

    var didRender = false;

    if (hasWv()) {
        wv.on("customLists", function (names) {
            customLists = names || [];
            diag("customLists-received", { count: customLists.length });
            render();
        });
        wv.on("manualLists", function (names) {
            manualLists = names || [];
            diag("manualLists-received", { count: manualLists.length });
            render();
        });
        wv.on("mapping", function (m) {
            mapping = m || {};
            STATUSES.forEach(function (s) { selected[s.key] = (mapping[s.key] || []).slice(); });
            diag("mapping-received", { keys: Object.keys(mapping) });
            render();
        });
        wv.on("lang", function (l) {
            if (l === "es" || l === "en") lang = l;
            render();
        });
    } else {
        app.innerHTML = "<div class=\\"empty\\" style=\\"border-color:rgba(239,68,68,.5);\\">" + tr().noBridge + "</div>";
        diag("boot-no-bridge", {});
    }

    function sel(statusKey) { return selected[statusKey] || []; }

    function toggle(name, statusKey) {
        var arr = sel(statusKey);
        var idx = arr.indexOf(name);
        if (idx >= 0) arr.splice(idx, 1); else arr.push(name);
        render();
    }

    function toggleOpen(statusKey) { open[statusKey] = !open[statusKey]; render(); }

    function sortKey(nm) {
        var s = String(nm);
        var i = s.indexOf("|");
        if (i >= 0) s = s.slice(i + 1);
        return s.trim().toLowerCase();
    }

    function toggleSortMode() { sortAlpha = !sortAlpha; render(); }

    function toggleLang() {
        var next = lang === "es" ? "en" : "es";
        if (hasWv()) wv.send("setLang", next);
    }

    function esc(s) {
        return String(s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function renderManualCard() {
        var html = "";
        html += "<div class=\\"card\\">";
        html += "<div class=\\"head\\">";
        html += "<span class=\\"head-label\\">" + esc(tr().manualTitle) + "</span>";
        html += "</div>";
        html += "<div class=\\"body\\" style=\\"max-height:none;\\">";
        html += "<div style=\\"display:flex;gap:8px;margin-bottom:10px;\\">";
        html += "<input id=\\"manual-input\\" type=\\"text\\" placeholder=\\"" + esc(tr().manualPlaceholder) + "\\" style=\\"flex:1;min-width:0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:8px 10px;color:#e2e8f0;outline:none;\\">";
        html += "<button class=\\"btn btn-save\\" data-action=\\"manual-add\\">" + esc(tr().manualAdd) + "</button>";
        html += "</div>";
        html += "<div style=\\"font-size:.8rem;opacity:.6;margin-bottom:10px;\\">" + esc(tr().manualSub) + "</div>";
        if (manualLists.length) {
            for (var mi = 0; mi < manualLists.length; mi++) {
                var nm = manualLists[mi];
                html += "<div class=\\"item\\" style=\\"justify-content:space-between;\\">";
                html += "<span>" + esc(nm) + "</span>";
                html += "<button class=\\"btn btn-reset\\" data-action=\\"manual-remove\\" data-name=\\"" + esc(encodeURIComponent(nm)) + "\\" title=\\"" + esc(tr().manualRemove) + "\\">&#10005;</button>";
                html += "</div>";
            }
        }
        html += "</div>";
        html += "</div>";
        return html;
    }

    function render() {
        var html = "";
        html += "<div style=\\"max-width:100%;margin:0 auto;\\">";
        html += "<div style=\\"display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;gap:16px;flex-wrap:wrap;\\">";
        html += "<div>";
        html += "<div style=\\"font-size:1.25rem;font-weight:600;\\">" + esc(tr().title) + "</div>";
        html += "<div style=\\"font-size:.85rem;opacity:.6;margin-top:4px;\\">" + esc(tr().subtitle) + "</div>";
        html += "</div>";
        html += "<div style=\\"display:flex;gap:8px;\\">";
        html += "<button class=\\"btn btn-reset\\" data-action=\\"toggle-lang\\">" + esc(tr().other) + "</button>";
        html += "<button class=\\"btn btn-reset\\" data-action=\\"sort\\">" + (sortAlpha ? tr().sortOn : tr().sortOff) + "</button>";
        html += "<button class=\\"btn btn-reset\\" data-action=\\"reset\\">" + esc(tr().reset) + "</button>";
        html += "<button class=\\"btn btn-save\\" data-action=\\"save\\">" + esc(tr().save) + "</button>";
        html += "</div>";
        html += "</div>";

        html += renderManualCard();

        if (!customLists.length) {
            html += "<div class=\\"empty\\">" + esc(tr().empty) + "</div>";
        } else {
            var ordered = sortAlpha ? customLists.slice().sort(function (a, b) { return sortKey(a).localeCompare(sortKey(b), "es"); }) : customLists;
            STATUSES.forEach(function (s) {
                var isOpen = !!open[s.key];
                var count = sel(s.key).length;
                html += "<div class=\\"card\\">";
                html += "<div class=\\"head\\" data-action=\\"toggle-open\\" data-status=\\"" + s.key + "\\">";
                html += "<span class=\\"dot\\" style=\\"background:" + s.color + ";\\"></span>";
                html += "<span class=\\"head-label\\">" + esc(statusLabel(s.key)) + "</span>";
                if (count) html += "<span class=\\"badge\\">" + count + "</span>";
                html += "<span class=\\"chev\\" style=\\"transform:rotate(" + (isOpen ? "180deg" : "0deg") + ");\\">&#9662;</span>";
                html += "</div>";
                if (isOpen) {
                    html += "<div class=\\"body\\">";
                    ordered.forEach(function (name) {
                        var checked = sel(s.key).indexOf(name) >= 0;
                        html += "<label class=\\"item\\" data-action=\\"toggle\\" data-status=\\"" + s.key + "\\" data-name=\\"" + esc(encodeURIComponent(name)) + "\\">";
                        html += "<input type=\\"checkbox\\"" + (checked ? " checked" : "") + ">";
                        html += "<span style=\\"color:" + (checked ? "#e2e8f0" : "#94a3b8") + ";\\">" + esc(name) + "</span>";
                        html += "</label>";
                    });
                    html += "</div>";
                }
                html += "</div>";
            });
        }
        html += "</div>";
        var _bodies = app.querySelectorAll(".body");
        var _tops = [];
        for (var _bi = 0; _bi < _bodies.length; _bi++) _tops.push(_bodies[_bi].scrollTop);
        app.innerHTML = html;
        _bodies = app.querySelectorAll(".body");
        for (var _bi = 0; _bi < _bodies.length && _bi < _tops.length; _bi++) {
            if (_tops[_bi] > 0) _bodies[_bi].scrollTop = _tops[_bi];
        }
        didRender = true;
        diag("render-done", { height: document.body.scrollHeight, lists: customLists.length });
    }

    app.addEventListener("click", function (ev) {
        var t = ev.target;
        while (t && t !== app) {
            if (t.getAttribute && t.getAttribute("data-action")) break;
            t = t.parentNode;
        }
        if (!t || t === app || !t.getAttribute) return;
        var action = t.getAttribute("data-action");
        var statusKey = t.getAttribute("data-status");
        ev.preventDefault();
        if (action === "toggle-open") toggleOpen(statusKey);
        if (action === "sort") toggleSortMode();
        if (action === "toggle-lang") toggleLang();
        if (action === "toggle") {
            var raw = t.getAttribute("data-name");
            var name = raw;
            try { name = decodeURIComponent(raw); } catch (err) {}
            toggle(name, statusKey);
        }
        if (action === "save") sendSave();
        if (action === "reset") sendReset();
        if (action === "manual-add") {
            var inp = document.getElementById("manual-input");
            var val = inp ? inp.value : "";
            if (val && hasWv()) wv.send("manualAdd", val);
            if (inp) inp.value = "";
        }
        if (action === "manual-remove") {
            var mRaw = t.getAttribute("data-name");
            var mName = mRaw;
            try { mName = decodeURIComponent(mRaw); } catch (err) {}
            if (mName && hasWv()) wv.send("manualRemove", mName);
        }
    });

    function sendSave() {
        var out = {};
        STATUSES.forEach(function (s) { out[s.key] = sel(s.key).slice(); });
        if (hasWv()) wv.send("save", out);
    }

    function sendReset() {
        STATUSES.forEach(function (s) { selected[s.key] = []; });
        render();
        if (hasWv()) wv.send("reset", {});
    }

    try {
        render();
    } catch (err) {
        diag("script-error", { error: String(err) });
        app.innerHTML = "<div class=\\"error\\">" + esc(tr().errPrefix) + esc(String(err)) + "</div>";
    }

    setTimeout(function () {
        diag("settled", { height: document.body.scrollHeight, rendered: didRender, lists: customLists.length });
    }, 1200);
})();
<\/script>
</body>
</html>`;
                    if (typeof $debug !== "undefined" && $debug.info) $debug.info("[webview] content bytes = " + html.length);
                    return html;
                });

                if (typeof $debug !== "undefined" && $debug.info) $debug.info("[custom-list-mapper] UI registered (webview + tray ready)");
            } catch (err) {
                if (typeof $debug !== "undefined" && $debug.error) $debug.error("[custom-list-mapper] $ui.register error: " + (err && err.message ? err.message : err));
            }
        });
    }
}