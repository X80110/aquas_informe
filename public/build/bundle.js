
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35733/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.7' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var EOL = {},
        EOF = {},
        QUOTE = 34,
        NEWLINE = 10,
        RETURN = 13;

    function objectConverter(columns) {
      return new Function("d", "return {" + columns.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "] || \"\"";
      }).join(",") + "}");
    }

    function customConverter(columns, f) {
      var object = objectConverter(columns);
      return function(row, i) {
        return f(object(row), i, columns);
      };
    }

    // Compute unique columns in order of discovery.
    function inferColumns(rows) {
      var columnSet = Object.create(null),
          columns = [];

      rows.forEach(function(row) {
        for (var column in row) {
          if (!(column in columnSet)) {
            columns.push(columnSet[column] = column);
          }
        }
      });

      return columns;
    }

    function pad(value, width) {
      var s = value + "", length = s.length;
      return length < width ? new Array(width - length + 1).join(0) + s : s;
    }

    function formatYear(year) {
      return year < 0 ? "-" + pad(-year, 6)
        : year > 9999 ? "+" + pad(year, 6)
        : pad(year, 4);
    }

    function formatDate(date) {
      var hours = date.getUTCHours(),
          minutes = date.getUTCMinutes(),
          seconds = date.getUTCSeconds(),
          milliseconds = date.getUTCMilliseconds();
      return isNaN(date) ? "Invalid Date"
          : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
          + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
          : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
          : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
          : "");
    }

    function dsv(delimiter) {
      var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
          DELIMITER = delimiter.charCodeAt(0);

      function parse(text, f) {
        var convert, columns, rows = parseRows(text, function(row, i) {
          if (convert) return convert(row, i - 1);
          columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
        });
        rows.columns = columns || [];
        return rows;
      }

      function parseRows(text, f) {
        var rows = [], // output rows
            N = text.length,
            I = 0, // current character index
            n = 0, // current line number
            t, // current token
            eof = N <= 0, // current token followed by EOF?
            eol = false; // current token followed by EOL?

        // Strip the trailing newline.
        if (text.charCodeAt(N - 1) === NEWLINE) --N;
        if (text.charCodeAt(N - 1) === RETURN) --N;

        function token() {
          if (eof) return EOF;
          if (eol) return eol = false, EOL;

          // Unescape quotes.
          var i, j = I, c;
          if (text.charCodeAt(j) === QUOTE) {
            while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
            if ((i = I) >= N) eof = true;
            else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            return text.slice(j + 1, i - 1).replace(/""/g, "\"");
          }

          // Find next delimiter or newline.
          while (I < N) {
            if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            else if (c !== DELIMITER) continue;
            return text.slice(j, i);
          }

          // Return last token before EOF.
          return eof = true, text.slice(j, N);
        }

        while ((t = token()) !== EOF) {
          var row = [];
          while (t !== EOL && t !== EOF) row.push(t), t = token();
          if (f && (row = f(row, n++)) == null) continue;
          rows.push(row);
        }

        return rows;
      }

      function preformatBody(rows, columns) {
        return rows.map(function(row) {
          return columns.map(function(column) {
            return formatValue(row[column]);
          }).join(delimiter);
        });
      }

      function format(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
      }

      function formatBody(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return preformatBody(rows, columns).join("\n");
      }

      function formatRows(rows) {
        return rows.map(formatRow).join("\n");
      }

      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }

      function formatValue(value) {
        return value == null ? ""
            : value instanceof Date ? formatDate(value)
            : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
            : value;
      }

      return {
        parse: parse,
        parseRows: parseRows,
        format: format,
        formatBody: formatBody,
        formatRows: formatRows,
        formatRow: formatRow,
        formatValue: formatValue
      };
    }

    var csv = dsv(",");

    var csvParse = csv.parse;

    function autoType(object) {
      for (var key in object) {
        var value = object[key].trim(), number, m;
        if (!value) value = null;
        else if (value === "true") value = true;
        else if (value === "false") value = false;
        else if (value === "NaN") value = NaN;
        else if (!isNaN(number = +value)) value = number;
        else if (m = value.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)) {
          if (fixtz && !!m[4] && !m[7]) value = value.replace(/-/g, "/").replace(/T/, " ");
          value = new Date(value);
        }
        else continue;
        object[key] = value;
      }
      return object;
    }

    // https://github.com/d3/d3-dsv/issues/45
    const fixtz = new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours();

    function setColors(themes, theme) {
      for (let color in themes[theme]) {
        document.documentElement.style.setProperty('--' + color, themes[theme][color]);
      }
    }

    async function getData(url) {
      let response = await fetch(url);
      let string = await response.text();
    	let data = await csvParse(string, autoType);
      return data;
    }

    // CORE CONFIG
    const themes = {
      'light': {
        'text': '#222',
        'muted': '#777',
        'pale': '#f0f0f0',
        'background': '#fff'
      },
      'dark': {
        'text': '#fff',
        'muted': '#bbb',
        'pale': '#333',
        'background': '#222'
      }
    };

    // CONTENT CONFIG
    /* export const arees = [
    	{
    		code: '78',
    		name: 'Barcelona'
    	},
    	{
    		code: '71',
    		name: 'Alt Pirineu i Aran'
    	},
    	{
    		code: '67',
    		name: 'Catalunya Central'
    	},
    	{
    		code: '64',
    		name: 'Girona'
    	},
    	{
    		code: '63',
    		name: "Terres de l'Ebre"
    	},
    	{
    		code: '62',
    		name: 'Camp de Tarragona'
    	},
    	{
    		code: '61',
    		name: 'Lleida'
    	},
    	{
    		code: 'SE',
    		name: 'Sense Especificar'
    	},
    ];

    export const colors = [
    	[32, 96, 149],
    	[39, 160, 204],
    	[0, 60, 87],
    	[17, 140, 123],
    	[168, 189, 58],
    	[135, 26, 91],
    	[246, 96, 104],
    	[116, 108, 177],
    	[34, 208, 182]
    ];

    export const datakeys = {
    	pacients: 'Pacients',
    	visites: 'Visites',
    	sexe: 'Gènere',
    	tipus_centre: 'Tipus de centre',
    	grup_edat: "Grups d'edat",
    	pcsm: 'Pacient crònic',
    	pccsm: 'Pacient crònic complex',
    	any: 'Any',
    	
    }; */

    /* src/components/UXResearch.svelte generated by Svelte v3.29.7 */
    const file = "src/components/UXResearch.svelte";

    function create_fragment(ctx) {
    	let nav;
    	let div;
    	let p;
    	let t0;
    	let a;
    	let nav_style_value;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			p = element("p");
    			t0 = text("Aquesta web està en fase BETA. ");
    			a = element("a");
    			a.textContent = "Col·labora a millorar l'experiència d'usuari ›";
    			attr_dev(a, "href", "#");
    			add_location(a, file, 13, 52, 398);
    			attr_dev(p, "class", "banner svelte-vl8xrz");
    			add_location(p, file, 13, 2, 348);
    			attr_dev(div, "class", "col-wide middle center");
    			add_location(div, file, 12, 2, 309);

    			attr_dev(nav, "style", nav_style_value = "border-bottom-color: " + themes[/*theme*/ ctx[0]]["muted"] + "; " + (/*filled*/ ctx[1]
    			? "background-color: " + themes[/*theme*/ ctx[0]]["background"] + ";"
    			: ""));

    			attr_dev(nav, "class", "svelte-vl8xrz");
    			add_location(nav, file, 11, 0, 172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(p, a);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*theme, filled*/ 3 && nav_style_value !== (nav_style_value = "border-bottom-color: " + themes[/*theme*/ ctx[0]]["muted"] + "; " + (/*filled*/ ctx[1]
    			? "background-color: " + themes[/*theme*/ ctx[0]]["background"] + ";"
    			: ""))) {
    				attr_dev(nav, "style", nav_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("UXResearch", slots, []);
    	let { theme = getContext("theme") } = $$props;
    	let { filled = true } = $$props;
    	const writable_props = ["theme", "filled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UXResearch> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("filled" in $$props) $$invalidate(1, filled = $$props.filled);
    	};

    	$$self.$capture_state = () => ({ themes, getContext, theme, filled });

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("filled" in $$props) $$invalidate(1, filled = $$props.filled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, filled];
    }

    class UXResearch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { theme: 0, filled: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UXResearch",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get theme() {
    		throw new Error("<UXResearch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<UXResearch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<UXResearch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<UXResearch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.29.7 */
    const file$1 = "src/components/Header.svelte";

    function create_fragment$1(ctx) {
    	let header;
    	let div1;
    	let div0;
    	let header_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "center");
    			add_location(div0, file$1, 23, 2, 570);
    			attr_dev(div1, "class", "col-wide height-full middle");
    			add_location(div1, file$1, 22, 1, 526);
    			attr_dev(header, "style", header_style_value = "color: " + themes[/*theme*/ ctx[0]]["text"] + "; background-color: " + themes[/*theme*/ ctx[0]]["background"] + "; " + /*style*/ ctx[1]);
    			add_location(header, file$1, 21, 0, 419);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*theme, style*/ 3 && header_style_value !== (header_style_value = "color: " + themes[/*theme*/ ctx[0]]["text"] + "; background-color: " + themes[/*theme*/ ctx[0]]["background"] + "; " + /*style*/ ctx[1])) {
    				attr_dev(header, "style", header_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, ['default']);
    	let { theme = getContext("theme") } = $$props;
    	let { bgimage = null } = $$props;
    	let { bgfixed = false } = $$props;
    	let style = "";

    	if (bgimage) {
    		style += `background-image: url(${bgimage});`;
    	} else {
    		style += "background-image: none;";
    	}

    	if (bgfixed) {
    		style += " background-attachment: fixed;";
    	}

    	const writable_props = ["theme", "bgimage", "bgfixed"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("bgimage" in $$props) $$invalidate(2, bgimage = $$props.bgimage);
    		if ("bgfixed" in $$props) $$invalidate(3, bgfixed = $$props.bgfixed);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		themes,
    		getContext,
    		theme,
    		bgimage,
    		bgfixed,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("bgimage" in $$props) $$invalidate(2, bgimage = $$props.bgimage);
    		if ("bgfixed" in $$props) $$invalidate(3, bgfixed = $$props.bgfixed);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, style, bgimage, bgfixed, $$scope, slots];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { theme: 0, bgimage: 2, bgfixed: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get theme() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgimage() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgimage(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgfixed() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgfixed(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Section.svelte generated by Svelte v3.29.7 */
    const file$2 = "src/components/Section.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "col-medium");
    			add_location(div, file$2, 8, 1, 246);
    			set_style(section, "color", themes[/*theme*/ ctx[0]]["text"]);
    			set_style(section, "background-color", themes[/*theme*/ ctx[0]]["background"]);
    			add_location(section, file$2, 7, 0, 147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(section, "color", themes[/*theme*/ ctx[0]]["text"]);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(section, "background-color", themes[/*theme*/ ctx[0]]["background"]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Section", slots, ['default']);
    	let { theme = getContext("theme") } = $$props;
    	const writable_props = ["theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ themes, getContext, theme });

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, $$scope, slots];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get theme() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.29.7 */
    const file$3 = "src/components/Footer.svelte";

    // (15:2) {:else}
    function create_else_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "logo-img svelte-1aur6tw");
    			if (img.src !== (img_src_value = "./img/aquas.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Agència de Qualitat i Avaluació Sanitàries de Catalunya ");
    			add_location(img, file$3, 15, 2, 444);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(15:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:2) {#if theme == 'dark'}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "logo-img svelte-1aur6tw");
    			if (img.src !== (img_src_value = "./img/aquas.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Agència de Qualitat i Avaluació Sanitàries de Catalunya ");
    			add_location(img, file$3, 10, 2, 313);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(10:2) {#if theme == 'dark'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let footer;
    	let div1;
    	let t0;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let a0_stnyle_value;
    	let t2;
    	let li1;
    	let a1;
    	let t3;
    	let t4;
    	let hr;
    	let t5;
    	let div0;
    	let t6;
    	let a2;
    	let t7;

    	function select_block_type(ctx, dirty) {
    		if (/*theme*/ ctx[0] == "dark") return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div1 = element("div");
    			if_block.c();
    			t0 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t1 = text("Contacta'ns");
    			t2 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t3 = text("Privacitat i cookies");
    			t4 = space();
    			hr = element("hr");
    			t5 = space();
    			div0 = element("div");
    			t6 = text("Tot el contingut disponible al portal web Govern Obert de la Generalitat de Catalunya \n\t\t\t");
    			a2 = element("a");
    			t7 = text("AQuAS");
    			attr_dev(a0, "href", "https://aquas.gencat.cat/ca/contacte/");
    			attr_dev(a0, "class", "list__link svelte-1aur6tw");
    			attr_dev(a0, "stnyle", a0_stnyle_value = "color: " + themes[/*theme*/ ctx[0]]["muted"]);
    			add_location(a0, file$3, 21, 7, 585);
    			attr_dev(li0, "class", "svelte-1aur6tw");
    			add_location(li0, file$3, 21, 3, 581);
    			attr_dev(a1, "href", "http://web.gencat.cat/ca/menu-ajuda/ajuda/avis_legal/");
    			attr_dev(a1, "class", "list__link svelte-1aur6tw");
    			set_style(a1, "color", themes[/*theme*/ ctx[0]]["muted"]);
    			add_location(a1, file$3, 22, 7, 721);
    			attr_dev(li1, "class", "svelte-1aur6tw");
    			add_location(li1, file$3, 22, 3, 717);
    			attr_dev(ul, "class", "svelte-1aur6tw");
    			add_location(ul, file$3, 20, 2, 573);
    			set_style(hr, "border-top-color", themes[/*theme*/ ctx[0]]["muted"]);
    			attr_dev(hr, "class", "svelte-1aur6tw");
    			add_location(hr, file$3, 24, 2, 884);
    			attr_dev(a2, "href", "http://governobert.gencat.cat/ca/dades_obertes/");
    			attr_dev(a2, "class", "external-link svelte-1aur6tw");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "rel", "noopener");
    			set_style(a2, "color", themes[/*theme*/ ctx[0]]["muted"]);
    			add_location(a2, file$3, 27, 3, 1059);
    			attr_dev(div0, "class", "license svelte-1aur6tw");
    			add_location(div0, file$3, 25, 2, 944);
    			attr_dev(div1, "class", "col-wide");
    			attr_dev(div1, "data-analytics", "footer");
    			add_location(div1, file$3, 8, 1, 240);
    			set_style(footer, "color", themes[/*theme*/ ctx[0]]["text"]);
    			set_style(footer, "background-color", themes[/*theme*/ ctx[0]]["pale"]);
    			attr_dev(footer, "class", "svelte-1aur6tw");
    			add_location(footer, file$3, 7, 0, 147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div1);
    			if_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, t1);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, hr);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div0, t6);
    			append_dev(div0, a2);
    			append_dev(a2, t7);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, t0);
    				}
    			}

    			if (dirty & /*theme*/ 1 && a0_stnyle_value !== (a0_stnyle_value = "color: " + themes[/*theme*/ ctx[0]]["muted"])) {
    				attr_dev(a0, "stnyle", a0_stnyle_value);
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(a1, "color", themes[/*theme*/ ctx[0]]["muted"]);
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(hr, "border-top-color", themes[/*theme*/ ctx[0]]["muted"]);
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(a2, "color", themes[/*theme*/ ctx[0]]["muted"]);
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(footer, "color", themes[/*theme*/ ctx[0]]["text"]);
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(footer, "background-color", themes[/*theme*/ ctx[0]]["pale"]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	let { theme = getContext("theme") } = $$props;
    	const writable_props = ["theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	$$self.$capture_state = () => ({ themes, getContext, theme });

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get theme() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Filler.svelte generated by Svelte v3.29.7 */
    const file$4 = "src/components/Filler.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "col-medium height-full middle center");
    			add_location(div, file$4, 8, 1, 247);
    			set_style(section, "color", themes[/*theme*/ ctx[0]]["text"]);
    			set_style(section, "background-color", themes[/*theme*/ ctx[0]]["background"]);
    			add_location(section, file$4, 7, 0, 147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(section, "color", themes[/*theme*/ ctx[0]]["text"]);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(section, "background-color", themes[/*theme*/ ctx[0]]["background"]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Filler", slots, ['default']);
    	let { theme = getContext("theme") } = $$props;
    	const writable_props = ["theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Filler> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ themes, getContext, theme });

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, $$scope, slots];
    }

    class Filler extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filler",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get theme() {
    		throw new Error("<Filler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Filler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing. The function also has a property 'clear' 
     * that is a function which will clear the timer to prevent previously scheduled executions. 
     *
     * @source underscore.js
     * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
     * @param {Function} function to wrap
     * @param {Number} timeout in ms (`100`)
     * @param {Boolean} whether to execute at the beginning (`false`)
     * @api public
     */
    function debounce(func, wait, immediate){
      var timeout, args, context, timestamp, result;
      if (null == wait) wait = 100;

      function later() {
        var last = Date.now() - timestamp;

        if (last < wait && last >= 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            context = args = null;
          }
        }
      }
      var debounced = function(){
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }

        return result;
      };

      debounced.clear = function() {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      };
      
      debounced.flush = function() {
        if (timeout) {
          result = func.apply(context, args);
          context = args = null;
          
          clearTimeout(timeout);
          timeout = null;
        }
      };

      return debounced;
    }
    // Adds compatibility for ES modules
    debounce.debounce = debounce;

    var debounce_1 = debounce;

    /* src/components/Media.svelte generated by Svelte v3.29.7 */
    const file$5 = "src/components/Media.svelte";

    // (71:0) {#if caption}
    function create_if_block$1(ctx) {
    	let caption_1;
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			caption_1 = element("caption");
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "caption");
    			add_location(div0, file$5, 73, 4, 2138);
    			attr_dev(div1, "class", "col-medium");
    			add_location(div1, file$5, 72, 2, 2109);
    			set_style(caption_1, "color", themes[/*theme*/ ctx[0]]["text"]);
    			set_style(caption_1, "background-color", themes[/*theme*/ ctx[0]]["background"]);
    			add_location(caption_1, file$5, 71, 0, 2008);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, caption_1, anchor);
    			append_dev(caption_1, div1);
    			append_dev(div1, div0);
    			div0.innerHTML = /*caption*/ ctx[2];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*caption*/ 4) div0.innerHTML = /*caption*/ ctx[2];
    			if (dirty & /*theme*/ 1) {
    				set_style(caption_1, "color", themes[/*theme*/ ctx[0]]["text"]);
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(caption_1, "background-color", themes[/*theme*/ ctx[0]]["background"]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(caption_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(71:0) {#if caption}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let figure;
    	let div1;
    	let div0;
    	let div0_resize_listener;
    	let div1_class_value;
    	let t;
    	let if_block_anchor;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	let if_block = /*caption*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div0, "class", "grid svelte-1cmgk3l");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[11].call(div0));
    			add_location(div0, file$5, 65, 2, 1886);
    			attr_dev(div1, "class", div1_class_value = "col-" + /*col*/ ctx[1] + " svelte-1cmgk3l");
    			add_location(div1, file$5, 64, 1, 1860);
    			set_style(figure, "color", themes[/*theme*/ ctx[0]]["text"]);
    			set_style(figure, "background-color", themes[/*theme*/ ctx[0]]["background"]);
    			add_location(figure, file$5, 63, 0, 1761);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[10](div0);
    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[11].bind(div0));
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*col*/ 2 && div1_class_value !== (div1_class_value = "col-" + /*col*/ ctx[1] + " svelte-1cmgk3l")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(figure, "color", themes[/*theme*/ ctx[0]]["text"]);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(figure, "background-color", themes[/*theme*/ ctx[0]]["background"]);
    			}

    			if (/*caption*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[10](null);
    			div0_resize_listener();
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Media", slots, ['default']);

    	const colWidths = {
    		"narrow": 200,
    		"medium": 330,
    		"wide": 500
    	};

    	let { theme = getContext("theme") } = $$props;
    	let { col = "medium" } = $$props;
    	let { grid = null } = $$props;
    	let { caption = null } = $$props;
    	let { height = 200 } = $$props;
    	let { gap = 12 } = $$props;
    	let rowHeight = !Number.isNaN(height) ? height + "px" : height;
    	const minWidth = grid && colWidths[grid] ? colWidths[grid] : null;
    	let gridWidth;
    	let cols;
    	let el;
    	let divs;
    	let count;

    	onMount(() => {
    		resize();
    	});

    	const update = debounce_1.debounce(resize, 200);

    	function resize() {
    		if (el && !divs) {
    			let arr = [];
    			let children = el.childNodes;

    			children.forEach(child => {
    				if (child.nodeName == "DIV") {
    					arr.push(child);
    				}

    				
    			});

    			divs = arr;
    		}

    		
    		count = divs.length;

    		cols = !minWidth || gridWidth <= minWidth
    		? 1
    		: Math.floor(gridWidth / minWidth);

    		makeCols();
    	}

    	function makeCols() {
    		let r = Math.ceil(count / cols) > 1
    		? `-ms-grid-rows: ${rowHeight} (${gap}px ${rowHeight})[${Math.ceil(count / cols) - 1}]; grid-template-rows: ${rowHeight} repeat(${Math.ceil(count / cols) - 1}, ${gap}px ${rowHeight});`
    		: `-ms-grid-rows: ${rowHeight}; grid-template-rows: ${rowHeight};`;

    		let c = cols > 1
    		? `-ms-grid-columns: 1fr (${gap}px 1fr)[${cols - 1}]; grid-template-columns: 1fr repeat(${cols - 1}, ${gap}px 1fr);`
    		: "";

    		$$invalidate(4, el.style.cssText = r + c, el);

    		divs.forEach((div, i) => {
    			let col = i % cols * 2 + 1;
    			let row = Math.floor(i / cols) * 2 + 1;
    			div.style.cssText = `-ms-grid-column: ${col}; -ms-grid-row: ${row}; grid-column: ${col}; grid-row: ${row};`;
    		});
    	}

    	const writable_props = ["theme", "col", "grid", "caption", "height", "gap"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Media> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(4, el);
    		});
    	}

    	function div0_elementresize_handler() {
    		gridWidth = this.clientWidth;
    		$$invalidate(3, gridWidth);
    	}

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("col" in $$props) $$invalidate(1, col = $$props.col);
    		if ("grid" in $$props) $$invalidate(5, grid = $$props.grid);
    		if ("caption" in $$props) $$invalidate(2, caption = $$props.caption);
    		if ("height" in $$props) $$invalidate(6, height = $$props.height);
    		if ("gap" in $$props) $$invalidate(7, gap = $$props.gap);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		themes,
    		onMount,
    		getContext,
    		debounce: debounce_1.debounce,
    		colWidths,
    		theme,
    		col,
    		grid,
    		caption,
    		height,
    		gap,
    		rowHeight,
    		minWidth,
    		gridWidth,
    		cols,
    		el,
    		divs,
    		count,
    		update,
    		resize,
    		makeCols
    	});

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("col" in $$props) $$invalidate(1, col = $$props.col);
    		if ("grid" in $$props) $$invalidate(5, grid = $$props.grid);
    		if ("caption" in $$props) $$invalidate(2, caption = $$props.caption);
    		if ("height" in $$props) $$invalidate(6, height = $$props.height);
    		if ("gap" in $$props) $$invalidate(7, gap = $$props.gap);
    		if ("rowHeight" in $$props) rowHeight = $$props.rowHeight;
    		if ("gridWidth" in $$props) $$invalidate(3, gridWidth = $$props.gridWidth);
    		if ("cols" in $$props) cols = $$props.cols;
    		if ("el" in $$props) $$invalidate(4, el = $$props.el);
    		if ("divs" in $$props) divs = $$props.divs;
    		if ("count" in $$props) count = $$props.count;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*gridWidth*/ 8) {
    			 minWidth && gridWidth && update();
    		}
    	};

    	return [
    		theme,
    		col,
    		caption,
    		gridWidth,
    		el,
    		grid,
    		height,
    		gap,
    		$$scope,
    		slots,
    		div0_binding,
    		div0_elementresize_handler
    	];
    }

    class Media extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			theme: 0,
    			col: 1,
    			grid: 5,
    			caption: 2,
    			height: 6,
    			gap: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Media",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get theme() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get col() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set col(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get grid() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set grid(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get caption() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set caption(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gap() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gap(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Divider.svelte generated by Svelte v3.29.7 */
    const file$6 = "src/components/Divider.svelte";

    // (13:4) {:else}
    function create_else_block$1(ctx) {
    	let hr_1;

    	const block = {
    		c: function create() {
    			hr_1 = element("hr");
    			set_style(hr_1, "color", themes[/*theme*/ ctx[0]]["muted"]);
    			set_style(hr_1, "border", "none");
    			attr_dev(hr_1, "class", "svelte-1l2to1w");
    			add_location(hr_1, file$6, 13, 4, 376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*theme*/ 1) {
    				set_style(hr_1, "color", themes[/*theme*/ ctx[0]]["muted"]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(13:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#if hr}
    function create_if_block$2(ctx) {
    	let hr_1;

    	const block = {
    		c: function create() {
    			hr_1 = element("hr");
    			set_style(hr_1, "color", themes[/*theme*/ ctx[0]]["muted"]);
    			attr_dev(hr_1, "class", "svelte-1l2to1w");
    			add_location(hr_1, file$6, 11, 4, 314);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*theme*/ 1) {
    				set_style(hr_1, "color", themes[/*theme*/ ctx[0]]["muted"]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(11:4) {#if hr}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section;
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*hr*/ ctx[1]) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "col-medium");
    			add_location(div, file$6, 9, 1, 272);
    			set_style(section, "color", themes[/*theme*/ ctx[0]]["text"]);
    			set_style(section, "background-color", themes[/*theme*/ ctx[0]]["background"]);
    			add_location(section, file$6, 8, 0, 172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(section, "color", themes[/*theme*/ ctx[0]]["text"]);
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(section, "background-color", themes[/*theme*/ ctx[0]]["background"]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Divider", slots, []);
    	let { theme = getContext("theme") } = $$props;
    	let { hr = true } = $$props;
    	const writable_props = ["theme", "hr"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Divider> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("hr" in $$props) $$invalidate(1, hr = $$props.hr);
    	};

    	$$self.$capture_state = () => ({ themes, getContext, theme, hr });

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("hr" in $$props) $$invalidate(1, hr = $$props.hr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, hr];
    }

    class Divider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { theme: 0, hr: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Divider",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get theme() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hr() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hr(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let id = 1;

    function getId() {
      return `svelte-tabs-${id++}`;
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /* node_modules/svelte-tabs/src/Tabs.svelte generated by Svelte v3.29.7 */
    const file$7 = "node_modules/svelte-tabs/src/Tabs.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-tabs");
    			add_location(div, file$7, 97, 0, 2405);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "keydown", /*handleKeyDown*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TABS = {};

    function removeAndUpdateSelected(arr, item, selectedStore) {
    	const index = arr.indexOf(item);
    	arr.splice(index, 1);

    	selectedStore.update(selected => selected === item
    	? arr[index] || arr[arr.length - 1]
    	: selected);
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $selectedTab;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", slots, ['default']);
    	let { initialSelectedIndex = 0 } = $$props;
    	const tabElements = [];
    	const tabs = [];
    	const panels = [];
    	const controls = writable({});
    	const labeledBy = writable({});
    	const selectedTab = writable(null);
    	validate_store(selectedTab, "selectedTab");
    	component_subscribe($$self, selectedTab, value => $$invalidate(5, $selectedTab = value));
    	const selectedPanel = writable(null);

    	function registerItem(arr, item, selectedStore) {
    		arr.push(item);
    		selectedStore.update(selected => selected || item);
    		onDestroy(() => removeAndUpdateSelected(arr, item, selectedStore));
    	}

    	function selectTab(tab) {
    		const index = tabs.indexOf(tab);
    		selectedTab.set(tab);
    		selectedPanel.set(panels[index]);
    	}

    	setContext(TABS, {
    		registerTab(tab) {
    			registerItem(tabs, tab, selectedTab);
    		},
    		registerTabElement(tabElement) {
    			tabElements.push(tabElement);
    		},
    		registerPanel(panel) {
    			registerItem(panels, panel, selectedPanel);
    		},
    		selectTab,
    		selectedTab,
    		selectedPanel,
    		controls,
    		labeledBy
    	});

    	onMount(() => {
    		selectTab(tabs[initialSelectedIndex]);
    	});

    	afterUpdate(() => {
    		for (let i = 0; i < tabs.length; i++) {
    			controls.update(controlsData => ({
    				...controlsData,
    				[tabs[i].id]: panels[i].id
    			}));

    			labeledBy.update(labeledByData => ({
    				...labeledByData,
    				[panels[i].id]: tabs[i].id
    			}));
    		}
    	});

    	async function handleKeyDown(event) {
    		if (event.target.classList.contains("svelte-tabs__tab")) {
    			let selectedIndex = tabs.indexOf($selectedTab);

    			switch (event.key) {
    				case "ArrowRight":
    					selectedIndex += 1;
    					if (selectedIndex > tabs.length - 1) {
    						selectedIndex = 0;
    					}
    					selectTab(tabs[selectedIndex]);
    					tabElements[selectedIndex].focus();
    					break;
    				case "ArrowLeft":
    					selectedIndex -= 1;
    					if (selectedIndex < 0) {
    						selectedIndex = tabs.length - 1;
    					}
    					selectTab(tabs[selectedIndex]);
    					tabElements[selectedIndex].focus();
    			}
    		}
    	}

    	const writable_props = ["initialSelectedIndex"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("initialSelectedIndex" in $$props) $$invalidate(2, initialSelectedIndex = $$props.initialSelectedIndex);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TABS,
    		afterUpdate,
    		setContext,
    		onDestroy,
    		onMount,
    		tick,
    		writable,
    		initialSelectedIndex,
    		tabElements,
    		tabs,
    		panels,
    		controls,
    		labeledBy,
    		selectedTab,
    		selectedPanel,
    		removeAndUpdateSelected,
    		registerItem,
    		selectTab,
    		handleKeyDown,
    		$selectedTab
    	});

    	$$self.$inject_state = $$props => {
    		if ("initialSelectedIndex" in $$props) $$invalidate(2, initialSelectedIndex = $$props.initialSelectedIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedTab, handleKeyDown, initialSelectedIndex, $$scope, slots];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { initialSelectedIndex: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get initialSelectedIndex() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initialSelectedIndex(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-tabs/src/Tab.svelte generated by Svelte v3.29.7 */
    const file$8 = "node_modules/svelte-tabs/src/Tab.svelte";

    function create_fragment$8(ctx) {
    	let li;
    	let li_id_value;
    	let li_aria_controls_value;
    	let li_tabindex_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (default_slot) default_slot.c();
    			attr_dev(li, "role", "tab");
    			attr_dev(li, "id", li_id_value = /*tab*/ ctx[3].id);
    			attr_dev(li, "aria-controls", li_aria_controls_value = /*$controls*/ ctx[2][/*tab*/ ctx[3].id]);
    			attr_dev(li, "aria-selected", /*isSelected*/ ctx[1]);
    			attr_dev(li, "tabindex", li_tabindex_value = /*isSelected*/ ctx[1] ? 0 : -1);
    			attr_dev(li, "class", "svelte-tabs__tab svelte-1fbofsd");
    			toggle_class(li, "svelte-tabs__selected", /*isSelected*/ ctx[1]);
    			add_location(li, file$8, 45, 0, 812);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (default_slot) {
    				default_slot.m(li, null);
    			}

    			/*li_binding*/ ctx[9](li);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*click_handler*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$controls*/ 4 && li_aria_controls_value !== (li_aria_controls_value = /*$controls*/ ctx[2][/*tab*/ ctx[3].id])) {
    				attr_dev(li, "aria-controls", li_aria_controls_value);
    			}

    			if (!current || dirty & /*isSelected*/ 2) {
    				attr_dev(li, "aria-selected", /*isSelected*/ ctx[1]);
    			}

    			if (!current || dirty & /*isSelected*/ 2 && li_tabindex_value !== (li_tabindex_value = /*isSelected*/ ctx[1] ? 0 : -1)) {
    				attr_dev(li, "tabindex", li_tabindex_value);
    			}

    			if (dirty & /*isSelected*/ 2) {
    				toggle_class(li, "svelte-tabs__selected", /*isSelected*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    			/*li_binding*/ ctx[9](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $selectedTab;
    	let $controls;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tab", slots, ['default']);
    	let tabEl;
    	const tab = { id: getId() };
    	const { registerTab, registerTabElement, selectTab, selectedTab, controls } = getContext(TABS);
    	validate_store(selectedTab, "selectedTab");
    	component_subscribe($$self, selectedTab, value => $$invalidate(11, $selectedTab = value));
    	validate_store(controls, "controls");
    	component_subscribe($$self, controls, value => $$invalidate(2, $controls = value));
    	let isSelected;
    	registerTab(tab);

    	onMount(async () => {
    		await tick();
    		registerTabElement(tabEl);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tab> was created with unknown prop '${key}'`);
    	});

    	function li_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			tabEl = $$value;
    			$$invalidate(0, tabEl);
    		});
    	}

    	const click_handler = () => selectTab(tab);

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		tick,
    		getId,
    		TABS,
    		tabEl,
    		tab,
    		registerTab,
    		registerTabElement,
    		selectTab,
    		selectedTab,
    		controls,
    		isSelected,
    		$selectedTab,
    		$controls
    	});

    	$$self.$inject_state = $$props => {
    		if ("tabEl" in $$props) $$invalidate(0, tabEl = $$props.tabEl);
    		if ("isSelected" in $$props) $$invalidate(1, isSelected = $$props.isSelected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedTab*/ 2048) {
    			 $$invalidate(1, isSelected = $selectedTab === tab);
    		}
    	};

    	return [
    		tabEl,
    		isSelected,
    		$controls,
    		tab,
    		selectTab,
    		selectedTab,
    		controls,
    		$$scope,
    		slots,
    		li_binding,
    		click_handler
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* node_modules/svelte-tabs/src/TabList.svelte generated by Svelte v3.29.7 */

    const file$9 = "node_modules/svelte-tabs/src/TabList.svelte";

    function create_fragment$9(ctx) {
    	let ul;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			attr_dev(ul, "role", "tablist");
    			attr_dev(ul, "class", "svelte-tabs__tab-list svelte-12yby2a");
    			add_location(ul, file$9, 8, 0, 116);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabList", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class TabList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabList",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* node_modules/svelte-tabs/src/TabPanel.svelte generated by Svelte v3.29.7 */
    const file$a = "node_modules/svelte-tabs/src/TabPanel.svelte";

    // (26:2) {#if $selectedPanel === panel}
    function create_if_block$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(26:2) {#if $selectedPanel === panel}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let div_id_value;
    	let div_aria_labelledby_value;
    	let current;
    	let if_block = /*$selectedPanel*/ ctx[1] === /*panel*/ ctx[2] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "id", div_id_value = /*panel*/ ctx[2].id);
    			attr_dev(div, "aria-labelledby", div_aria_labelledby_value = /*$labeledBy*/ ctx[0][/*panel*/ ctx[2].id]);
    			attr_dev(div, "class", "svelte-tabs__tab-panel svelte-epfyet");
    			attr_dev(div, "role", "tabpanel");
    			add_location(div, file$a, 20, 0, 338);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$selectedPanel*/ ctx[1] === /*panel*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$selectedPanel*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$labeledBy*/ 1 && div_aria_labelledby_value !== (div_aria_labelledby_value = /*$labeledBy*/ ctx[0][/*panel*/ ctx[2].id])) {
    				attr_dev(div, "aria-labelledby", div_aria_labelledby_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $labeledBy;
    	let $selectedPanel;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabPanel", slots, ['default']);
    	const panel = { id: getId() };
    	const { registerPanel, selectedPanel, labeledBy } = getContext(TABS);
    	validate_store(selectedPanel, "selectedPanel");
    	component_subscribe($$self, selectedPanel, value => $$invalidate(1, $selectedPanel = value));
    	validate_store(labeledBy, "labeledBy");
    	component_subscribe($$self, labeledBy, value => $$invalidate(0, $labeledBy = value));
    	registerPanel(panel);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		getId,
    		TABS,
    		panel,
    		registerPanel,
    		selectedPanel,
    		labeledBy,
    		$labeledBy,
    		$selectedPanel
    	});

    	return [$labeledBy, $selectedPanel, panel, selectedPanel, labeledBy, $$scope, slots];
    }

    class TabPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabPanel",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/Tabs.svelte generated by Svelte v3.29.7 */
    const file$b = "src/components/Tabs.svelte";

    // (9:6) <Tab>
    function create_default_slot_10(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("2019");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(9:6) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (10:6) <Tab>
    function create_default_slot_9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("2018");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(10:6) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (11:6) <Tab>
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("2017");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(11:6) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (12:6) <Tab>
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("2016");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(12:6) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (8:4) <TabList>
    function create_default_slot_6(ctx) {
    	let tab0;
    	let t0;
    	let tab1;
    	let t1;
    	let tab2;
    	let t2;
    	let tab3;
    	let current;

    	tab0 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab1 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab2 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab3 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tab0.$$.fragment);
    			t0 = space();
    			create_component(tab1.$$.fragment);
    			t1 = space();
    			create_component(tab2.$$.fragment);
    			t2 = space();
    			create_component(tab3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tab1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tab2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tab3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tab0_changes.$$scope = { dirty, ctx };
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tab1_changes.$$scope = { dirty, ctx };
    			}

    			tab1.$set(tab1_changes);
    			const tab2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tab2_changes.$$scope = { dirty, ctx };
    			}

    			tab2.$set(tab2_changes);
    			const tab3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tab3_changes.$$scope = { dirty, ctx };
    			}

    			tab3.$set(tab3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			transition_in(tab2.$$.fragment, local);
    			transition_in(tab3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			transition_out(tab2.$$.fragment, local);
    			transition_out(tab3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tab1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tab2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tab3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(8:4) <TabList>",
    		ctx
    	});

    	return block;
    }

    // (15:4) <TabPanel>
    function create_default_slot_5(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "width", "100%");
    			attr_dev(iframe, "height", "520");
    			attr_dev(iframe, "frameborder", "0");
    			if (iframe.src !== (iframe_src_value = "https://x80110.carto.com/builder/69b68982-f518-404b-9cb2-f723ae856d51/embed")) attr_dev(iframe, "src", iframe_src_value);
    			iframe.allowFullscreen = true;
    			attr_dev(iframe, "webkitallowfullscreen", "");
    			attr_dev(iframe, "mozallowfullscreen", "");
    			attr_dev(iframe, "oallowfullscreen", "");
    			attr_dev(iframe, "msallowfullscreen", "");
    			add_location(iframe, file$b, 15, 6, 279);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(15:4) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (19:4) <TabPanel>
    function create_default_slot_4(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "width", "100%");
    			attr_dev(iframe, "height", "520");
    			attr_dev(iframe, "frameborder", "0");
    			if (iframe.src !== (iframe_src_value = "https://x80110.carto.com/builder/4db0dafe-f05e-44d2-87f5-b27bc3dd1149/embed")) attr_dev(iframe, "src", iframe_src_value);
    			iframe.allowFullscreen = true;
    			attr_dev(iframe, "webkitallowfullscreen", "");
    			attr_dev(iframe, "mozallowfullscreen", "");
    			attr_dev(iframe, "oallowfullscreen", "");
    			attr_dev(iframe, "msallowfullscreen", "");
    			add_location(iframe, file$b, 19, 6, 554);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(19:4) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (23:4) <TabPanel>
    function create_default_slot_3(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "width", "100%");
    			attr_dev(iframe, "height", "520");
    			attr_dev(iframe, "frameborder", "0");
    			if (iframe.src !== (iframe_src_value = "https://x80110.carto.com/builder/62da91fb-5713-40b0-bfcc-8a5bfe32565d/embed")) attr_dev(iframe, "src", iframe_src_value);
    			iframe.allowFullscreen = true;
    			attr_dev(iframe, "webkitallowfullscreen", "");
    			attr_dev(iframe, "mozallowfullscreen", "");
    			attr_dev(iframe, "oallowfullscreen", "");
    			attr_dev(iframe, "msallowfullscreen", "");
    			add_location(iframe, file$b, 23, 6, 829);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(23:4) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (27:4) <TabPanel>
    function create_default_slot_2(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "width", "100%");
    			attr_dev(iframe, "height", "520");
    			attr_dev(iframe, "frameborder", "0");
    			if (iframe.src !== (iframe_src_value = "https://x80110.carto.com/builder/c0a9b5aa-83e4-4586-a64c-205b337ae8eb/embed")) attr_dev(iframe, "src", iframe_src_value);
    			iframe.allowFullscreen = true;
    			attr_dev(iframe, "webkitallowfullscreen", "");
    			attr_dev(iframe, "mozallowfullscreen", "");
    			attr_dev(iframe, "oallowfullscreen", "");
    			attr_dev(iframe, "msallowfullscreen", "");
    			add_location(iframe, file$b, 27, 6, 1101);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(27:4) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (7:0) <Tabs>
    function create_default_slot_1(ctx) {
    	let tablist;
    	let t0;
    	let tabpanel0;
    	let t1;
    	let tabpanel1;
    	let t2;
    	let tabpanel2;
    	let t3;
    	let tabpanel3;
    	let current;

    	tablist = new TabList({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel0 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel1 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel2 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel3 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablist.$$.fragment);
    			t0 = space();
    			create_component(tabpanel0.$$.fragment);
    			t1 = space();
    			create_component(tabpanel1.$$.fragment);
    			t2 = space();
    			create_component(tabpanel2.$$.fragment);
    			t3 = space();
    			create_component(tabpanel3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablist, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tabpanel0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tabpanel1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tabpanel2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tabpanel3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablist_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tablist_changes.$$scope = { dirty, ctx };
    			}

    			tablist.$set(tablist_changes);
    			const tabpanel0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tabpanel0_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel0.$set(tabpanel0_changes);
    			const tabpanel1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tabpanel1_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel1.$set(tabpanel1_changes);
    			const tabpanel2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tabpanel2_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel2.$set(tabpanel2_changes);
    			const tabpanel3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tabpanel3_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel3.$set(tabpanel3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablist.$$.fragment, local);
    			transition_in(tabpanel0.$$.fragment, local);
    			transition_in(tabpanel1.$$.fragment, local);
    			transition_in(tabpanel2.$$.fragment, local);
    			transition_in(tabpanel3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablist.$$.fragment, local);
    			transition_out(tabpanel0.$$.fragment, local);
    			transition_out(tabpanel1.$$.fragment, local);
    			transition_out(tabpanel2.$$.fragment, local);
    			transition_out(tabpanel3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablist, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tabpanel0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tabpanel1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tabpanel2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tabpanel3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(7:0) <Tabs>",
    		ctx
    	});

    	return block;
    }

    // (6:0) <Section>
    function create_default_slot(ctx) {
    	let tabs;
    	let current;

    	tabs = new Tabs({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabs.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabs, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabs_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			tabs.$set(tabs_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabs, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(6:0) <Section>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Tabs, Tab, TabList, TabPanel, Section });
    	return [];
    }

    class Tabs_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs_1",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* node_modules/carbon-components-svelte/src/Button/ButtonSkeleton.svelte generated by Svelte v3.29.7 */

    const file$c = "node_modules/carbon-components-svelte/src/Button/ButtonSkeleton.svelte";

    // (38:0) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let mounted;
    	let dispose;
    	let div_levels = [/*$$restProps*/ ctx[3]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_attributes(div, div_data);
    			toggle_class(div, "bx--skeleton", true);
    			toggle_class(div, "bx--btn", true);
    			toggle_class(div, "bx--btn--field", /*size*/ ctx[1] === "field");
    			toggle_class(div, "bx--btn--sm", /*size*/ ctx[1] === "small" || /*small*/ ctx[2]);
    			add_location(div, file$c, 38, 2, 799);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*click_handler_1*/ ctx[8], false, false, false),
    					listen_dev(div, "mouseover", /*mouseover_handler_1*/ ctx[9], false, false, false),
    					listen_dev(div, "mouseenter", /*mouseenter_handler_1*/ ctx[10], false, false, false),
    					listen_dev(div, "mouseleave", /*mouseleave_handler_1*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			toggle_class(div, "bx--skeleton", true);
    			toggle_class(div, "bx--btn", true);
    			toggle_class(div, "bx--btn--field", /*size*/ ctx[1] === "field");
    			toggle_class(div, "bx--btn--sm", /*size*/ ctx[1] === "small" || /*small*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(38:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:0) {#if href}
    function create_if_block$4(ctx) {
    	let a;
    	let t_value = "" + "";
    	let t;
    	let a_rel_value;
    	let mounted;
    	let dispose;

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{
    			rel: a_rel_value = /*$$restProps*/ ctx[3].target === "_blank"
    			? "noopener noreferrer"
    			: undefined
    		},
    		{ role: "button" },
    		/*$$restProps*/ ctx[3]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			set_attributes(a, a_data);
    			toggle_class(a, "bx--skeleton", true);
    			toggle_class(a, "bx--btn", true);
    			toggle_class(a, "bx--btn--field", /*size*/ ctx[1] === "field");
    			toggle_class(a, "bx--btn--sm", /*size*/ ctx[1] === "small" || /*small*/ ctx[2]);
    			add_location(a, file$c, 21, 2, 406);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(a, "mouseover", /*mouseover_handler*/ ctx[5], false, false, false),
    					listen_dev(a, "mouseenter", /*mouseenter_handler*/ ctx[6], false, false, false),
    					listen_dev(a, "mouseleave", /*mouseleave_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				dirty & /*href*/ 1 && { href: /*href*/ ctx[0] },
    				dirty & /*$$restProps*/ 8 && a_rel_value !== (a_rel_value = /*$$restProps*/ ctx[3].target === "_blank"
    				? "noopener noreferrer"
    				: undefined) && { rel: a_rel_value },
    				{ role: "button" },
    				dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]
    			]));

    			toggle_class(a, "bx--skeleton", true);
    			toggle_class(a, "bx--btn", true);
    			toggle_class(a, "bx--btn--field", /*size*/ ctx[1] === "field");
    			toggle_class(a, "bx--btn--sm", /*size*/ ctx[1] === "small" || /*small*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(21:0) {#if href}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[0]) return create_if_block$4;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	const omit_props_names = ["href","size","small"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ButtonSkeleton", slots, []);
    	let { href = undefined } = $$props;
    	let { size = "default" } = $$props;
    	let { small = false } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler_1(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler_1(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("href" in $$new_props) $$invalidate(0, href = $$new_props.href);
    		if ("size" in $$new_props) $$invalidate(1, size = $$new_props.size);
    		if ("small" in $$new_props) $$invalidate(2, small = $$new_props.small);
    	};

    	$$self.$capture_state = () => ({ href, size, small });

    	$$self.$inject_state = $$new_props => {
    		if ("href" in $$props) $$invalidate(0, href = $$new_props.href);
    		if ("size" in $$props) $$invalidate(1, size = $$new_props.size);
    		if ("small" in $$props) $$invalidate(2, small = $$new_props.small);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		href,
    		size,
    		small,
    		$$restProps,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		click_handler_1,
    		mouseover_handler_1,
    		mouseenter_handler_1,
    		mouseleave_handler_1
    	];
    }

    class ButtonSkeleton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { href: 0, size: 1, small: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonSkeleton",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get href() {
    		throw new Error("<ButtonSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<ButtonSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<ButtonSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<ButtonSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<ButtonSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<ButtonSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Button/Button.svelte generated by Svelte v3.29.7 */
    const file$d = "node_modules/carbon-components-svelte/src/Button/Button.svelte";
    const get_default_slot_changes = dirty => ({ props: dirty[0] & /*buttonProps*/ 512 });
    const get_default_slot_context = ctx => ({ props: /*buttonProps*/ ctx[9] });

    // (153:0) {:else}
    function create_else_block$3(ctx) {
    	let button;
    	let t;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*hasIconOnly*/ ctx[0] && create_if_block_4(ctx);
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);
    	var switch_value = /*icon*/ ctx[3];

    	function switch_props(ctx) {
    		return {
    			props: {
    				"aria-hidden": "true",
    				class: "bx--btn__icon",
    				"aria-label": /*iconDescription*/ ctx[4]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	let button_levels = [/*buttonProps*/ ctx[9]];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			set_attributes(button, button_data);
    			add_location(button, file$d, 153, 2, 3981);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (switch_instance) {
    				mount_component(switch_instance, button, null);
    			}

    			/*button_binding*/ ctx[32](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler_2*/ ctx[23], false, false, false),
    					listen_dev(button, "mouseover", /*mouseover_handler_2*/ ctx[24], false, false, false),
    					listen_dev(button, "mouseenter", /*mouseenter_handler_2*/ ctx[25], false, false, false),
    					listen_dev(button, "mouseleave", /*mouseleave_handler_2*/ ctx[26], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*hasIconOnly*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 131072) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[17], dirty, null, null);
    				}
    			}

    			const switch_instance_changes = {};
    			if (dirty[0] & /*iconDescription*/ 16) switch_instance_changes["aria-label"] = /*iconDescription*/ ctx[4];

    			if (switch_value !== (switch_value = /*icon*/ ctx[3])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, button, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [dirty[0] & /*buttonProps*/ 512 && /*buttonProps*/ ctx[9]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			if (switch_instance) destroy_component(switch_instance);
    			/*button_binding*/ ctx[32](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(153:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (133:28) 
    function create_if_block_2(ctx) {
    	let a;
    	let t;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*hasIconOnly*/ ctx[0] && create_if_block_3(ctx);
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);
    	var switch_value = /*icon*/ ctx[3];

    	function switch_props(ctx) {
    		return {
    			props: {
    				"aria-hidden": "true",
    				class: "bx--btn__icon",
    				"aria-label": /*iconDescription*/ ctx[4]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	let a_levels = [/*buttonProps*/ ctx[9]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			set_attributes(a, a_data);
    			add_location(a, file$d, 134, 2, 3598);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if (if_block) if_block.m(a, null);
    			append_dev(a, t);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			if (switch_instance) {
    				mount_component(switch_instance, a, null);
    			}

    			/*a_binding*/ ctx[31](a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*click_handler_1*/ ctx[19], false, false, false),
    					listen_dev(a, "mouseover", /*mouseover_handler_1*/ ctx[20], false, false, false),
    					listen_dev(a, "mouseenter", /*mouseenter_handler_1*/ ctx[21], false, false, false),
    					listen_dev(a, "mouseleave", /*mouseleave_handler_1*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*hasIconOnly*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(a, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 131072) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[17], dirty, null, null);
    				}
    			}

    			const switch_instance_changes = {};
    			if (dirty[0] & /*iconDescription*/ 16) switch_instance_changes["aria-label"] = /*iconDescription*/ ctx[4];

    			if (switch_value !== (switch_value = /*icon*/ ctx[3])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, a, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [dirty[0] & /*buttonProps*/ 512 && /*buttonProps*/ ctx[9]]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			if (switch_instance) destroy_component(switch_instance);
    			/*a_binding*/ ctx[31](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(133:28) ",
    		ctx
    	});

    	return block;
    }

    // (131:13) 
    function create_if_block_1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope, buttonProps*/ 131584) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[17], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(131:13) ",
    		ctx
    	});

    	return block;
    }

    // (120:0) {#if skeleton}
    function create_if_block$5(ctx) {
    	let buttonskeleton;
    	let current;

    	const buttonskeleton_spread_levels = [
    		{ href: /*href*/ ctx[8] },
    		{ size: /*size*/ ctx[2] },
    		/*$$restProps*/ ctx[10],
    		{
    			style: /*hasIconOnly*/ ctx[0] && "width: 3rem;"
    		}
    	];

    	let buttonskeleton_props = {};

    	for (let i = 0; i < buttonskeleton_spread_levels.length; i += 1) {
    		buttonskeleton_props = assign(buttonskeleton_props, buttonskeleton_spread_levels[i]);
    	}

    	buttonskeleton = new ButtonSkeleton({
    			props: buttonskeleton_props,
    			$$inline: true
    		});

    	buttonskeleton.$on("click", /*click_handler*/ ctx[27]);
    	buttonskeleton.$on("mouseover", /*mouseover_handler*/ ctx[28]);
    	buttonskeleton.$on("mouseenter", /*mouseenter_handler*/ ctx[29]);
    	buttonskeleton.$on("mouseleave", /*mouseleave_handler*/ ctx[30]);

    	const block = {
    		c: function create() {
    			create_component(buttonskeleton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(buttonskeleton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const buttonskeleton_changes = (dirty[0] & /*href, size, $$restProps, hasIconOnly*/ 1285)
    			? get_spread_update(buttonskeleton_spread_levels, [
    					dirty[0] & /*href*/ 256 && { href: /*href*/ ctx[8] },
    					dirty[0] & /*size*/ 4 && { size: /*size*/ ctx[2] },
    					dirty[0] & /*$$restProps*/ 1024 && get_spread_object(/*$$restProps*/ ctx[10]),
    					dirty[0] & /*hasIconOnly*/ 1 && {
    						style: /*hasIconOnly*/ ctx[0] && "width: 3rem;"
    					}
    				])
    			: {};

    			buttonskeleton.$set(buttonskeleton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttonskeleton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttonskeleton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(buttonskeleton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(120:0) {#if skeleton}",
    		ctx
    	});

    	return block;
    }

    // (162:4) {#if hasIconOnly}
    function create_if_block_4(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*iconDescription*/ ctx[4]);
    			toggle_class(span, "bx--assistive-text", true);
    			add_location(span, file$d, 162, 6, 4130);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*iconDescription*/ 16) set_data_dev(t, /*iconDescription*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(162:4) {#if hasIconOnly}",
    		ctx
    	});

    	return block;
    }

    // (143:4) {#if hasIconOnly}
    function create_if_block_3(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*iconDescription*/ ctx[4]);
    			toggle_class(span, "bx--assistive-text", true);
    			add_location(span, file$d, 143, 6, 3742);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*iconDescription*/ 16) set_data_dev(t, /*iconDescription*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(143:4) {#if hasIconOnly}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_if_block_1, create_if_block_2, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*skeleton*/ ctx[6]) return 0;
    		if (/*as*/ ctx[5]) return 1;
    		if (/*href*/ ctx[8] && !/*disabled*/ ctx[7]) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"kind","size","isSelected","hasIconOnly","icon","iconDescription","tooltipAlignment","tooltipPosition","as","skeleton","disabled","href","tabindex","type","ref"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	const $$slots = compute_slots(slots);
    	let { kind = "primary" } = $$props;
    	let { size = "default" } = $$props;
    	let { isSelected = false } = $$props;
    	let { hasIconOnly = false } = $$props;
    	let { icon = undefined } = $$props;
    	let { iconDescription = undefined } = $$props;
    	let { tooltipAlignment = "center" } = $$props;
    	let { tooltipPosition = "bottom" } = $$props;
    	let { as = false } = $$props;
    	let { skeleton = false } = $$props;
    	let { disabled = false } = $$props;
    	let { href = undefined } = $$props;
    	let { tabindex = "0" } = $$props;
    	let { type = "button" } = $$props;
    	let { ref = null } = $$props;
    	const ctx = getContext("ComposedModal");

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler_1(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler_1(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler_1(event) {
    		bubble($$self, event);
    	}

    	function click_handler_2(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler_2(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler_2(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler_2(event) {
    		bubble($$self, event);
    	}

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			ref = $$value;
    			$$invalidate(1, ref);
    		});
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			ref = $$value;
    			$$invalidate(1, ref);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(10, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("kind" in $$new_props) $$invalidate(11, kind = $$new_props.kind);
    		if ("size" in $$new_props) $$invalidate(2, size = $$new_props.size);
    		if ("isSelected" in $$new_props) $$invalidate(12, isSelected = $$new_props.isSelected);
    		if ("hasIconOnly" in $$new_props) $$invalidate(0, hasIconOnly = $$new_props.hasIconOnly);
    		if ("icon" in $$new_props) $$invalidate(3, icon = $$new_props.icon);
    		if ("iconDescription" in $$new_props) $$invalidate(4, iconDescription = $$new_props.iconDescription);
    		if ("tooltipAlignment" in $$new_props) $$invalidate(13, tooltipAlignment = $$new_props.tooltipAlignment);
    		if ("tooltipPosition" in $$new_props) $$invalidate(14, tooltipPosition = $$new_props.tooltipPosition);
    		if ("as" in $$new_props) $$invalidate(5, as = $$new_props.as);
    		if ("skeleton" in $$new_props) $$invalidate(6, skeleton = $$new_props.skeleton);
    		if ("disabled" in $$new_props) $$invalidate(7, disabled = $$new_props.disabled);
    		if ("href" in $$new_props) $$invalidate(8, href = $$new_props.href);
    		if ("tabindex" in $$new_props) $$invalidate(15, tabindex = $$new_props.tabindex);
    		if ("type" in $$new_props) $$invalidate(16, type = $$new_props.type);
    		if ("ref" in $$new_props) $$invalidate(1, ref = $$new_props.ref);
    		if ("$$scope" in $$new_props) $$invalidate(17, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		kind,
    		size,
    		isSelected,
    		hasIconOnly,
    		icon,
    		iconDescription,
    		tooltipAlignment,
    		tooltipPosition,
    		as,
    		skeleton,
    		disabled,
    		href,
    		tabindex,
    		type,
    		ref,
    		getContext,
    		ButtonSkeleton,
    		ctx,
    		buttonProps
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("kind" in $$props) $$invalidate(11, kind = $$new_props.kind);
    		if ("size" in $$props) $$invalidate(2, size = $$new_props.size);
    		if ("isSelected" in $$props) $$invalidate(12, isSelected = $$new_props.isSelected);
    		if ("hasIconOnly" in $$props) $$invalidate(0, hasIconOnly = $$new_props.hasIconOnly);
    		if ("icon" in $$props) $$invalidate(3, icon = $$new_props.icon);
    		if ("iconDescription" in $$props) $$invalidate(4, iconDescription = $$new_props.iconDescription);
    		if ("tooltipAlignment" in $$props) $$invalidate(13, tooltipAlignment = $$new_props.tooltipAlignment);
    		if ("tooltipPosition" in $$props) $$invalidate(14, tooltipPosition = $$new_props.tooltipPosition);
    		if ("as" in $$props) $$invalidate(5, as = $$new_props.as);
    		if ("skeleton" in $$props) $$invalidate(6, skeleton = $$new_props.skeleton);
    		if ("disabled" in $$props) $$invalidate(7, disabled = $$new_props.disabled);
    		if ("href" in $$props) $$invalidate(8, href = $$new_props.href);
    		if ("tabindex" in $$props) $$invalidate(15, tabindex = $$new_props.tabindex);
    		if ("type" in $$props) $$invalidate(16, type = $$new_props.type);
    		if ("ref" in $$props) $$invalidate(1, ref = $$new_props.ref);
    		if ("buttonProps" in $$props) $$invalidate(9, buttonProps = $$new_props.buttonProps);
    	};

    	let buttonProps;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*ref*/ 2) {
    			 if (ctx && ref) {
    				ctx.declareRef(ref);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*icon*/ 8) {
    			 $$invalidate(0, hasIconOnly = icon && !$$slots.default);
    		}

    		 $$invalidate(9, buttonProps = {
    			type: href && !disabled ? undefined : type,
    			tabindex,
    			disabled,
    			href,
    			"aria-pressed": hasIconOnly && kind === "ghost" ? isSelected : undefined,
    			...$$restProps,
    			class: [
    				"bx--btn",
    				size === "field" && "bx--btn--field",
    				size === "small" && "bx--btn--sm",
    				kind && `bx--btn--${kind}`,
    				disabled && "bx--btn--disabled",
    				hasIconOnly && "bx--btn--icon-only",
    				hasIconOnly && "bx--tooltip__trigger",
    				hasIconOnly && "bx--tooltip--a11y",
    				hasIconOnly && tooltipPosition && `bx--tooltip--${tooltipPosition}`,
    				hasIconOnly && tooltipAlignment && `bx--tooltip--align-${tooltipAlignment}`,
    				hasIconOnly && isSelected && kind === "ghost" && "bx--btn--selected",
    				$$restProps.class
    			].filter(Boolean).join(" ")
    		});
    	};

    	return [
    		hasIconOnly,
    		ref,
    		size,
    		icon,
    		iconDescription,
    		as,
    		skeleton,
    		disabled,
    		href,
    		buttonProps,
    		$$restProps,
    		kind,
    		isSelected,
    		tooltipAlignment,
    		tooltipPosition,
    		tabindex,
    		type,
    		$$scope,
    		slots,
    		click_handler_1,
    		mouseover_handler_1,
    		mouseenter_handler_1,
    		mouseleave_handler_1,
    		click_handler_2,
    		mouseover_handler_2,
    		mouseenter_handler_2,
    		mouseleave_handler_2,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		a_binding,
    		button_binding
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$d,
    			create_fragment$d,
    			safe_not_equal,
    			{
    				kind: 11,
    				size: 2,
    				isSelected: 12,
    				hasIconOnly: 0,
    				icon: 3,
    				iconDescription: 4,
    				tooltipAlignment: 13,
    				tooltipPosition: 14,
    				as: 5,
    				skeleton: 6,
    				disabled: 7,
    				href: 8,
    				tabindex: 15,
    				type: 16,
    				ref: 1
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get kind() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set kind(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSelected() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSelected(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasIconOnly() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasIconOnly(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconDescription() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconDescription(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltipAlignment() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltipAlignment(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltipPosition() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltipPosition(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get as() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set as(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get skeleton() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set skeleton(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-icons-svelte/lib/ChevronDownGlyph/ChevronDownGlyph.svelte generated by Svelte v3.29.7 */

    const file$e = "node_modules/carbon-icons-svelte/lib/ChevronDownGlyph/ChevronDownGlyph.svelte";

    // (39:4) {#if title}
    function create_if_block$6(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[2]);
    			add_location(title_1, file$e, 39, 6, 1038);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(39:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (38:8)      
    function fallback_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*title*/ ctx[2] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(38:8)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let svg;
    	let path;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	let svg_levels = [
    		{ "data-carbon-icon": "ChevronDownGlyph" },
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 10 6" },
    		{ fill: "currentColor" },
    		{ width: "10" },
    		{ height: "6" },
    		{ class: /*className*/ ctx[0] },
    		{ preserveAspectRatio: "xMidYMid meet" },
    		{ style: /*style*/ ctx[3] },
    		{ id: /*id*/ ctx[1] },
    		/*attributes*/ ctx[4]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(path, "d", "M5 6L0 1 0.7 0.3 5 4.6 9.3 0.3 10 1z");
    			add_location(path, file$e, 36, 2, 952);
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$e, 22, 0, 633);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[10], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[11], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[12], false, false, false),
    					listen_dev(svg, "keyup", /*keyup_handler*/ ctx[13], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*title*/ 4) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ "data-carbon-icon": "ChevronDownGlyph" },
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 10 6" },
    				{ fill: "currentColor" },
    				{ width: "10" },
    				{ height: "6" },
    				(!current || dirty & /*className*/ 1) && { class: /*className*/ ctx[0] },
    				{ preserveAspectRatio: "xMidYMid meet" },
    				(!current || dirty & /*style*/ 8) && { style: /*style*/ ctx[3] },
    				(!current || dirty & /*id*/ 2) && { id: /*id*/ ctx[1] },
    				dirty & /*attributes*/ 16 && /*attributes*/ ctx[4]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ChevronDownGlyph", slots, ['default']);
    	let { class: className = undefined } = $$props;
    	let { id = undefined } = $$props;
    	let { tabindex = undefined } = $$props;
    	let { focusable = false } = $$props;
    	let { title = undefined } = $$props;
    	let { style = undefined } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keyup_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, className = $$new_props.class);
    		if ("id" in $$new_props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$new_props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$new_props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		id,
    		tabindex,
    		focusable,
    		title,
    		style,
    		ariaLabel,
    		ariaLabelledBy,
    		labelled,
    		attributes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(0, className = $$new_props.className);
    		if ("id" in $$props) $$invalidate(1, id = $$new_props.id);
    		if ("tabindex" in $$props) $$invalidate(5, tabindex = $$new_props.tabindex);
    		if ("focusable" in $$props) $$invalidate(6, focusable = $$new_props.focusable);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("style" in $$props) $$invalidate(3, style = $$new_props.style);
    		if ("ariaLabel" in $$props) $$invalidate(15, ariaLabel = $$new_props.ariaLabel);
    		if ("ariaLabelledBy" in $$props) $$invalidate(16, ariaLabelledBy = $$new_props.ariaLabelledBy);
    		if ("labelled" in $$props) $$invalidate(17, labelled = $$new_props.labelled);
    		if ("attributes" in $$props) $$invalidate(4, attributes = $$new_props.attributes);
    	};

    	let ariaLabel;
    	let ariaLabelledBy;
    	let labelled;
    	let attributes;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(15, ariaLabel = $$props["aria-label"]);
    		 $$invalidate(16, ariaLabelledBy = $$props["aria-labelledby"]);

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, title*/ 98308) {
    			 $$invalidate(17, labelled = ariaLabel || ariaLabelledBy || title);
    		}

    		if ($$self.$$.dirty & /*ariaLabel, ariaLabelledBy, labelled, tabindex, focusable*/ 229472) {
    			 $$invalidate(4, attributes = {
    				"aria-label": ariaLabel,
    				"aria-labelledby": ariaLabelledBy,
    				"aria-hidden": labelled ? undefined : true,
    				role: labelled ? "img" : undefined,
    				focusable: tabindex === "0" ? true : focusable,
    				tabindex
    			});
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		className,
    		id,
    		title,
    		style,
    		attributes,
    		tabindex,
    		focusable,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keyup_handler,
    		keydown_handler
    	];
    }

    class ChevronDownGlyph extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			class: 0,
    			id: 1,
    			tabindex: 5,
    			focusable: 6,
    			title: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChevronDownGlyph",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get class() {
    		throw new Error("<ChevronDownGlyph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ChevronDownGlyph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<ChevronDownGlyph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ChevronDownGlyph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<ChevronDownGlyph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<ChevronDownGlyph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusable() {
    		throw new Error("<ChevronDownGlyph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusable(value) {
    		throw new Error("<ChevronDownGlyph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ChevronDownGlyph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ChevronDownGlyph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ChevronDownGlyph>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ChevronDownGlyph>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Tabs/Tabs.svelte generated by Svelte v3.29.7 */
    const file$f = "node_modules/carbon-components-svelte/src/Tabs/Tabs.svelte";
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});

    // (132:6) {#if currentTab}
    function create_if_block$7(ctx) {
    	let t_value = /*currentTab*/ ctx[4].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentTab*/ 16 && t_value !== (t_value = /*currentTab*/ ctx[4].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(132:6) {#if currentTab}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div1;
    	let div0;
    	let a;
    	let t0;
    	let chevrondownglyph;
    	let div0_aria_label_value;
    	let t1;
    	let ul;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*currentTab*/ ctx[4] && create_if_block$7(ctx);

    	chevrondownglyph = new ChevronDownGlyph({
    			props: {
    				"aria-hidden": "true",
    				title: /*iconDescription*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let div1_levels = [{ role: "navigation" }, /*$$restProps*/ ctx[9]];
    	let div1_data = {};

    	for (let i = 0; i < div1_levels.length; i += 1) {
    		div1_data = assign(div1_data, div1_levels[i]);
    	}

    	const content_slot_template = /*#slots*/ ctx[13].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[12], get_content_slot_context);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			if (if_block) if_block.c();
    			t0 = space();
    			create_component(chevrondownglyph.$$.fragment);
    			t1 = space();
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			if (content_slot) content_slot.c();
    			attr_dev(a, "tabindex", "-1");
    			attr_dev(a, "href", /*triggerHref*/ ctx[2]);
    			toggle_class(a, "bx--tabs-trigger-text", true);
    			add_location(a, file$f, 122, 4, 2862);
    			attr_dev(div0, "role", "listbox");
    			attr_dev(div0, "tabindex", "0");
    			attr_dev(div0, "aria-label", div0_aria_label_value = /*$$props*/ ctx[10]["aria-label"] || "listbox");
    			toggle_class(div0, "bx--tabs-trigger", true);
    			add_location(div0, file$f, 109, 2, 2562);
    			attr_dev(ul, "role", "tablist");
    			toggle_class(ul, "bx--tabs__nav", true);
    			toggle_class(ul, "bx--tabs__nav--hidden", /*dropdownHidden*/ ctx[3]);
    			add_location(ul, file$f, 135, 2, 3189);
    			set_attributes(div1, div1_data);
    			toggle_class(div1, "bx--tabs", true);
    			toggle_class(div1, "bx--tabs--container", /*type*/ ctx[0] === "container");
    			add_location(div1, file$f, 103, 0, 2435);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			if (if_block) if_block.m(a, null);
    			append_dev(div0, t0);
    			mount_component(chevrondownglyph, div0, null);
    			append_dev(div1, t1);
    			append_dev(div1, ul);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			insert_dev(target, t2, anchor);

    			if (content_slot) {
    				content_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*click_handler*/ ctx[15], false, false, false),
    					listen_dev(a, "click", /*click_handler_1*/ ctx[16], false, false, false),
    					listen_dev(div0, "click", /*click_handler_2*/ ctx[17], false, false, false),
    					listen_dev(div0, "keypress", /*keypress_handler*/ ctx[14], false, false, false),
    					listen_dev(div0, "keypress", /*keypress_handler_1*/ ctx[18], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*currentTab*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(a, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*triggerHref*/ 4) {
    				attr_dev(a, "href", /*triggerHref*/ ctx[2]);
    			}

    			const chevrondownglyph_changes = {};
    			if (dirty & /*iconDescription*/ 2) chevrondownglyph_changes.title = /*iconDescription*/ ctx[1];
    			chevrondownglyph.$set(chevrondownglyph_changes);

    			if (!current || dirty & /*$$props*/ 1024 && div0_aria_label_value !== (div0_aria_label_value = /*$$props*/ ctx[10]["aria-label"] || "listbox")) {
    				attr_dev(div0, "aria-label", div0_aria_label_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			if (dirty & /*dropdownHidden*/ 8) {
    				toggle_class(ul, "bx--tabs__nav--hidden", /*dropdownHidden*/ ctx[3]);
    			}

    			set_attributes(div1, div1_data = get_spread_update(div1_levels, [
    				{ role: "navigation" },
    				dirty & /*$$restProps*/ 512 && /*$$restProps*/ ctx[9]
    			]));

    			toggle_class(div1, "bx--tabs", true);
    			toggle_class(div1, "bx--tabs--container", /*type*/ ctx[0] === "container");

    			if (content_slot) {
    				if (content_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(content_slot, content_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_content_slot_changes, get_content_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chevrondownglyph.$$.fragment, local);
    			transition_in(default_slot, local);
    			transition_in(content_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chevrondownglyph.$$.fragment, local);
    			transition_out(default_slot, local);
    			transition_out(content_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			destroy_component(chevrondownglyph);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (content_slot) content_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	const omit_props_names = ["selected","type","iconDescription","triggerHref"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $tabsById;
    	let $tabs;
    	let $content;
    	let $selectedTab;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", slots, ['default','content']);
    	let { selected = 0 } = $$props;
    	let { type = "default" } = $$props;
    	let { iconDescription = "Show menu options" } = $$props;
    	let { triggerHref = "#" } = $$props;
    	const dispatch = createEventDispatcher();
    	const tabs = writable([]);
    	validate_store(tabs, "tabs");
    	component_subscribe($$self, tabs, value => $$invalidate(21, $tabs = value));
    	const tabsById = derived(tabs, _ => _.reduce((a, c) => ({ ...a, [c.id]: c }), {}));
    	validate_store(tabsById, "tabsById");
    	component_subscribe($$self, tabsById, value => $$invalidate(20, $tabsById = value));
    	const selectedTab = writable(undefined);
    	validate_store(selectedTab, "selectedTab");
    	component_subscribe($$self, selectedTab, value => $$invalidate(24, $selectedTab = value));
    	const content = writable([]);
    	validate_store(content, "content");
    	component_subscribe($$self, content, value => $$invalidate(23, $content = value));
    	const contentById = derived(content, _ => _.reduce((a, c) => ({ ...a, [c.id]: c }), {}));
    	const selectedContent = writable(undefined);

    	setContext("Tabs", {
    		tabs,
    		contentById,
    		selectedTab,
    		selectedContent,
    		add: data => {
    			tabs.update(_ => [..._, { ...data, index: _.length }]);
    		},
    		addContent: data => {
    			content.update(_ => [..._, { ...data, index: _.length }]);
    		},
    		update: id => {
    			$$invalidate(19, currentIndex = $tabsById[id].index);
    		},
    		change: direction => {
    			let index = currentIndex + direction;

    			if (index < 0) {
    				index = $tabs.length - 1;
    			} else if (index >= $tabs.length) {
    				index = 0;
    			}

    			let disabled = $tabs[index].disabled;

    			while (disabled) {
    				index = index + direction;

    				if (index < 0) {
    					index = $tabs.length - 1;
    				} else if (index >= $tabs.length) {
    					index = 0;
    				}

    				disabled = $tabs[index].disabled;
    			}

    			$$invalidate(19, currentIndex = index);
    		}
    	});

    	afterUpdate(() => {
    		$$invalidate(11, selected = currentIndex);
    	});

    	let dropdownHidden = true;
    	let currentIndex = selected;

    	function keypress_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	const click_handler_1 = () => {
    		$$invalidate(3, dropdownHidden = !dropdownHidden);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(3, dropdownHidden = !dropdownHidden);
    	};

    	const keypress_handler_1 = () => {
    		$$invalidate(3, dropdownHidden = !dropdownHidden);
    	};

    	$$self.$$set = $$new_props => {
    		$$invalidate(10, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("selected" in $$new_props) $$invalidate(11, selected = $$new_props.selected);
    		if ("type" in $$new_props) $$invalidate(0, type = $$new_props.type);
    		if ("iconDescription" in $$new_props) $$invalidate(1, iconDescription = $$new_props.iconDescription);
    		if ("triggerHref" in $$new_props) $$invalidate(2, triggerHref = $$new_props.triggerHref);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		selected,
    		type,
    		iconDescription,
    		triggerHref,
    		createEventDispatcher,
    		afterUpdate,
    		setContext,
    		writable,
    		derived,
    		ChevronDownGlyph,
    		dispatch,
    		tabs,
    		tabsById,
    		selectedTab,
    		content,
    		contentById,
    		selectedContent,
    		dropdownHidden,
    		currentIndex,
    		$tabsById,
    		$tabs,
    		currentTab,
    		currentContent,
    		$content,
    		$selectedTab
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(10, $$props = assign(assign({}, $$props), $$new_props));
    		if ("selected" in $$props) $$invalidate(11, selected = $$new_props.selected);
    		if ("type" in $$props) $$invalidate(0, type = $$new_props.type);
    		if ("iconDescription" in $$props) $$invalidate(1, iconDescription = $$new_props.iconDescription);
    		if ("triggerHref" in $$props) $$invalidate(2, triggerHref = $$new_props.triggerHref);
    		if ("dropdownHidden" in $$props) $$invalidate(3, dropdownHidden = $$new_props.dropdownHidden);
    		if ("currentIndex" in $$props) $$invalidate(19, currentIndex = $$new_props.currentIndex);
    		if ("currentTab" in $$props) $$invalidate(4, currentTab = $$new_props.currentTab);
    		if ("currentContent" in $$props) $$invalidate(22, currentContent = $$new_props.currentContent);
    	};

    	let currentTab;
    	let currentContent;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selected*/ 2048) {
    			 $$invalidate(19, currentIndex = selected);
    		}

    		if ($$self.$$.dirty & /*$tabs, currentIndex*/ 2621440) {
    			 $$invalidate(4, currentTab = $tabs[currentIndex] || undefined);
    		}

    		if ($$self.$$.dirty & /*$content, currentIndex*/ 8912896) {
    			 $$invalidate(22, currentContent = $content[currentIndex] || undefined);
    		}

    		if ($$self.$$.dirty & /*currentIndex, currentTab, currentContent*/ 4718608) {
    			 {
    				dispatch("change", currentIndex);

    				if (currentTab) {
    					selectedTab.set(currentTab.id);
    				}

    				if (currentContent) {
    					selectedContent.set(currentContent.id);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*$selectedTab*/ 16777216) {
    			 if ($selectedTab) {
    				$$invalidate(3, dropdownHidden = true);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		type,
    		iconDescription,
    		triggerHref,
    		dropdownHidden,
    		currentTab,
    		tabs,
    		tabsById,
    		selectedTab,
    		content,
    		$$restProps,
    		$$props,
    		selected,
    		$$scope,
    		slots,
    		keypress_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		keypress_handler_1
    	];
    }

    class Tabs$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			selected: 11,
    			type: 0,
    			iconDescription: 1,
    			triggerHref: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get selected() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconDescription() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconDescription(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get triggerHref() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set triggerHref(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Tabs/Tab.svelte generated by Svelte v3.29.7 */
    const file$g = "node_modules/carbon-components-svelte/src/Tabs/Tab.svelte";

    // (84:10) {label}
    function fallback_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 2) set_data_dev(t, /*label*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(84:10) {label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let li;
    	let a;
    	let a_tabindex_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);
    	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);
    	let li_levels = [{ tabindex: "-1" }, { role: "presentation" }, /*$$restProps*/ ctx[10]];
    	let li_data = {};

    	for (let i = 0; i < li_levels.length; i += 1) {
    		li_data = assign(li_data, li_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(a, "role", "tab");
    			attr_dev(a, "tabindex", a_tabindex_value = /*disabled*/ ctx[3] ? "-1" : /*tabindex*/ ctx[4]);
    			attr_dev(a, "aria-selected", /*selected*/ ctx[6]);
    			attr_dev(a, "aria-disabled", /*disabled*/ ctx[3]);
    			attr_dev(a, "id", /*id*/ ctx[5]);
    			attr_dev(a, "href", /*href*/ ctx[2]);
    			toggle_class(a, "bx--tabs__nav-link", true);
    			add_location(a, file$g, 73, 2, 1562);
    			set_attributes(li, li_data);
    			toggle_class(li, "bx--tabs__nav-item", true);
    			toggle_class(li, "bx--tabs__nav-item--disabled", /*disabled*/ ctx[3]);
    			toggle_class(li, "bx--tabs__nav-item--selected", /*selected*/ ctx[6]);
    			add_location(li, file$g, 45, 0, 946);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(a, null);
    			}

    			/*a_binding*/ ctx[17](a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li, "click", prevent_default(/*click_handler*/ ctx[13]), false, true, false),
    					listen_dev(li, "click", prevent_default(/*click_handler_1*/ ctx[18]), false, true, false),
    					listen_dev(li, "mouseover", /*mouseover_handler*/ ctx[14], false, false, false),
    					listen_dev(li, "mouseenter", /*mouseenter_handler*/ ctx[15], false, false, false),
    					listen_dev(li, "mouseleave", /*mouseleave_handler*/ ctx[16], false, false, false),
    					listen_dev(li, "keydown", /*keydown_handler*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*label*/ 2) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty & /*disabled, tabindex*/ 24 && a_tabindex_value !== (a_tabindex_value = /*disabled*/ ctx[3] ? "-1" : /*tabindex*/ ctx[4])) {
    				attr_dev(a, "tabindex", a_tabindex_value);
    			}

    			if (!current || dirty & /*selected*/ 64) {
    				attr_dev(a, "aria-selected", /*selected*/ ctx[6]);
    			}

    			if (!current || dirty & /*disabled*/ 8) {
    				attr_dev(a, "aria-disabled", /*disabled*/ ctx[3]);
    			}

    			if (!current || dirty & /*id*/ 32) {
    				attr_dev(a, "id", /*id*/ ctx[5]);
    			}

    			if (!current || dirty & /*href*/ 4) {
    				attr_dev(a, "href", /*href*/ ctx[2]);
    			}

    			set_attributes(li, li_data = get_spread_update(li_levels, [
    				{ tabindex: "-1" },
    				{ role: "presentation" },
    				dirty & /*$$restProps*/ 1024 && /*$$restProps*/ ctx[10]
    			]));

    			toggle_class(li, "bx--tabs__nav-item", true);
    			toggle_class(li, "bx--tabs__nav-item--disabled", /*disabled*/ ctx[3]);
    			toggle_class(li, "bx--tabs__nav-item--selected", /*selected*/ ctx[6]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			/*a_binding*/ ctx[17](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	const omit_props_names = ["label","href","disabled","tabindex","id","ref"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $selectedTab;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tab", slots, ['default']);
    	let { label = "" } = $$props;
    	let { href = "#" } = $$props;
    	let { disabled = false } = $$props;
    	let { tabindex = "0" } = $$props;
    	let { id = "ccs-" + Math.random().toString(36) } = $$props;
    	let { ref = null } = $$props;
    	const { selectedTab, add, update, change } = getContext("Tabs");
    	validate_store(selectedTab, "selectedTab");
    	component_subscribe($$self, selectedTab, value => $$invalidate(21, $selectedTab = value));
    	add({ id, label, disabled });
    	let didMount = false;

    	onMount(() => {
    		tick().then(() => {
    			didMount = true;
    		});
    	});

    	afterUpdate(() => {
    		if (didMount && selected && ref) {
    			ref.focus();
    		}
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			ref = $$value;
    			$$invalidate(0, ref);
    		});
    	}

    	const click_handler_1 = () => {
    		if (!disabled) {
    			update(id);
    		}
    	};

    	const keydown_handler = ({ key }) => {
    		if (!disabled) {
    			if (key === "ArrowRight") {
    				change(1);
    			} else if (key === "ArrowLeft") {
    				change(-1);
    			} else if (key === " " || key === "Enter") {
    				update(id);
    			}
    		}
    	};

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(10, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("label" in $$new_props) $$invalidate(1, label = $$new_props.label);
    		if ("href" in $$new_props) $$invalidate(2, href = $$new_props.href);
    		if ("disabled" in $$new_props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ("tabindex" in $$new_props) $$invalidate(4, tabindex = $$new_props.tabindex);
    		if ("id" in $$new_props) $$invalidate(5, id = $$new_props.id);
    		if ("ref" in $$new_props) $$invalidate(0, ref = $$new_props.ref);
    		if ("$$scope" in $$new_props) $$invalidate(11, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		label,
    		href,
    		disabled,
    		tabindex,
    		id,
    		ref,
    		onMount,
    		afterUpdate,
    		getContext,
    		tick,
    		selectedTab,
    		add,
    		update,
    		change,
    		didMount,
    		selected,
    		$selectedTab
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("label" in $$props) $$invalidate(1, label = $$new_props.label);
    		if ("href" in $$props) $$invalidate(2, href = $$new_props.href);
    		if ("disabled" in $$props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ("tabindex" in $$props) $$invalidate(4, tabindex = $$new_props.tabindex);
    		if ("id" in $$props) $$invalidate(5, id = $$new_props.id);
    		if ("ref" in $$props) $$invalidate(0, ref = $$new_props.ref);
    		if ("didMount" in $$props) didMount = $$new_props.didMount;
    		if ("selected" in $$props) $$invalidate(6, selected = $$new_props.selected);
    	};

    	let selected;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedTab, id*/ 2097184) {
    			 $$invalidate(6, selected = $selectedTab === id);
    		}
    	};

    	return [
    		ref,
    		label,
    		href,
    		disabled,
    		tabindex,
    		id,
    		selected,
    		selectedTab,
    		update,
    		change,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		a_binding,
    		click_handler_1,
    		keydown_handler
    	];
    }

    class Tab$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			label: 1,
    			href: 2,
    			disabled: 3,
    			tabindex: 4,
    			id: 5,
    			ref: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get label() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/carbon-components-svelte/src/Tabs/TabContent.svelte generated by Svelte v3.29.7 */
    const file$h = "node_modules/carbon-components-svelte/src/Tabs/TabContent.svelte";

    function create_fragment$h(ctx) {
    	let div;
    	let div_aria_hidden_value;
    	let div_hidden_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	let div_levels = [
    		{ role: "tabpanel" },
    		{ "aria-labelledby": /*tabId*/ ctx[2] },
    		{
    			"aria-hidden": div_aria_hidden_value = !/*selected*/ ctx[1]
    		},
    		{
    			hidden: div_hidden_value = /*selected*/ ctx[1] ? undefined : ""
    		},
    		{ id: /*id*/ ctx[0] },
    		/*$$restProps*/ ctx[6]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			toggle_class(div, "bx--tab-content", true);
    			add_location(div, file$h, 15, 0, 374);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				{ role: "tabpanel" },
    				(!current || dirty & /*tabId*/ 4) && { "aria-labelledby": /*tabId*/ ctx[2] },
    				(!current || dirty & /*selected*/ 2 && div_aria_hidden_value !== (div_aria_hidden_value = !/*selected*/ ctx[1])) && { "aria-hidden": div_aria_hidden_value },
    				(!current || dirty & /*selected*/ 2 && div_hidden_value !== (div_hidden_value = /*selected*/ ctx[1] ? undefined : "")) && { hidden: div_hidden_value },
    				(!current || dirty & /*id*/ 1) && { id: /*id*/ ctx[0] },
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));

    			toggle_class(div, "bx--tab-content", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	const omit_props_names = ["id"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $selectedContent;
    	let $contentById;
    	let $tabs;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabContent", slots, ['default']);
    	let { id = "ccs-" + Math.random().toString(36) } = $$props;
    	const { selectedContent, addContent, tabs, contentById } = getContext("Tabs");
    	validate_store(selectedContent, "selectedContent");
    	component_subscribe($$self, selectedContent, value => $$invalidate(9, $selectedContent = value));
    	validate_store(tabs, "tabs");
    	component_subscribe($$self, tabs, value => $$invalidate(12, $tabs = value));
    	validate_store(contentById, "contentById");
    	component_subscribe($$self, contentById, value => $$invalidate(11, $contentById = value));
    	addContent({ id });

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("id" in $$new_props) $$invalidate(0, id = $$new_props.id);
    		if ("$$scope" in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		id,
    		getContext,
    		selectedContent,
    		addContent,
    		tabs,
    		contentById,
    		selected,
    		$selectedContent,
    		index,
    		$contentById,
    		tabId,
    		$tabs
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("id" in $$props) $$invalidate(0, id = $$new_props.id);
    		if ("selected" in $$props) $$invalidate(1, selected = $$new_props.selected);
    		if ("index" in $$props) $$invalidate(10, index = $$new_props.index);
    		if ("tabId" in $$props) $$invalidate(2, tabId = $$new_props.tabId);
    	};

    	let selected;
    	let index;
    	let tabId;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedContent, id*/ 513) {
    			 $$invalidate(1, selected = $selectedContent === id);
    		}

    		if ($$self.$$.dirty & /*$contentById, id*/ 2049) {
    			 $$invalidate(10, index = $contentById[id].index);
    		}

    		if ($$self.$$.dirty & /*$tabs, index*/ 5120) {
    			 $$invalidate(2, tabId = $tabs[index].id);
    		}
    	};

    	return [
    		id,
    		selected,
    		tabId,
    		selectedContent,
    		tabs,
    		contentById,
    		$$restProps,
    		$$scope,
    		slots
    	];
    }

    class TabContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabContent",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get id() {
    		throw new Error("<TabContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TabContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.7 */

    const file$i = "src/App.svelte";

    // (100:0) <Header bgimage="./img/bg-dark.jpg" bgfixed={true} theme="light">
    function create_default_slot_7$1(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let t2;
    	let br0;
    	let t3;
    	let t4;
    	let br1;
    	let t5;
    	let img0;
    	let img0_src_value;
    	let t6;
    	let br2;
    	let t7;
    	let div;
    	let t8;
    	let br3;
    	let t9;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Salut mental i adiccions";
    			t1 = space();
    			p = element("p");
    			t2 = text("Observatori del sistema de salut de Catalunya\n\t\t");
    			br0 = element("br");
    			t3 = text("\n\t\tCentral de resultats");
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			img0 = element("img");
    			t6 = space();
    			br2 = element("br");
    			t7 = space();
    			div = element("div");
    			t8 = text("Desplaça't per veure l'informe");
    			br3 = element("br");
    			t9 = space();
    			img1 = element("img");
    			add_location(h1, file$i, 100, 1, 2363);
    			add_location(br0, file$i, 103, 2, 2483);
    			attr_dev(p, "class", "inset-medium text-big");
    			add_location(p, file$i, 101, 1, 2399);
    			add_location(br1, file$i, 107, 1, 2520);
    			if (img0.src !== (img0_src_value = "./img/aquas-head.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "logo svelte-bj8qo7");
    			attr_dev(img0, "alt", "aquas catalunya");
    			add_location(img0, file$i, 108, 1, 2526);
    			add_location(br2, file$i, 109, 1, 2596);
    			add_location(br3, file$i, 111, 32, 2674);
    			if (img1.src !== (img1_src_value = "./img/scroll-down-black.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "svg-icon bounce svelte-bj8qo7");
    			attr_dev(img1, "alt", "down arrow");
    			add_location(img1, file$i, 112, 2, 2683);
    			attr_dev(div, "class", "");
    			set_style(div, "margin-top", "6em");
    			add_location(div, file$i, 110, 1, 2602);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			append_dev(p, br0);
    			append_dev(p, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, img0, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, t8);
    			append_dev(div, br3);
    			append_dev(div, t9);
    			append_dev(div, img1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(img0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(100:0) <Header bgimage=\\\"./img/bg-dark.jpg\\\" bgfixed={true} theme=\\\"light\\\">",
    		ctx
    	});

    	return block;
    }

    // (120:0) <Section>
    function create_default_slot_6$1(ctx) {
    	let p0;
    	let t1;
    	let h2;
    	let t3;
    	let h3;
    	let t5;
    	let p1;
    	let t7;
    	let p2;
    	let t9;
    	let blockquote;
    	let t11;
    	let p3;
    	let t13;
    	let p4;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "Informe 2020";
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "La xarxa d'atenció a la salut mental de Catalunya";
    			t3 = space();
    			h3 = element("h3");
    			h3.textContent = "La meitat dels pacients atesos pels CSMA són pacients crònics (51,1%) i un de cada tres pacient crònic complex (32,3%)";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "La salut mental i les addiccions conformen un dels serveis del sistema d’atenció sanitària pública de Catalunya. El trastorns mentals tenen un impacte important en la qualitat de vida de les persones i afecten tots els àmbits de relació interpersonal (familiar, laboral i social), motiu pel qual demanen una atenció concreta.";
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "A Catalunya, els centres d’atenció primària (CAP) són la peça clau per a la detecció precoç i el seguiment dels trastorns mentals lleus. Un equip de professionals especialistes en salut mental dona suport als equips d’atenció primària i s’integra als centres d’atenció primària. Quan la patologia és més complexa, l’assistència es presta en serveis especialitzats, fora dels CAP.";
    			t9 = space();
    			blockquote = element("blockquote");
    			blockquote.textContent = "Als CAP, equips multidisciplinaris integrats per psiquiatres, psicòlegs, treballadors socials i personal d’infermeria ofereixen assistència especialitzada en règim ambulatori (sense ingrés).";
    			t11 = space();
    			p3 = element("p");
    			p3.textContent = "La xarxa de centres d’atenció a la salut mental es divideix en dos tipus, en funció de l’edat del pacient: Centres de salut mental d’adults (CSMA), per a majors de 18 anys, i Centres de salut mental infantil juvenil (CSMIJ), per a infants i adolescents fins a la majoria d’edat.";
    			t13 = space();
    			p4 = element("p");
    			p4.textContent = "Per millorar la qualitat del sistema de salut de Catalunya, el Departament de Salut recull les dades assistencials. En aquest apartat hi trobareu representades les xifres referents a l’atenció prestada als centres de salut mental entre 2016 i 2019 mitjançant diversos gràfics.";
    			attr_dev(p0, "class", "text-big");
    			add_location(p0, file$i, 120, 1, 2798);
    			add_location(h2, file$i, 123, 1, 2841);
    			add_location(h3, file$i, 124, 1, 2901);
    			add_location(p1, file$i, 126, 1, 3032);
    			add_location(p2, file$i, 129, 1, 3371);
    			attr_dev(blockquote, "class", "text-indent");
    			add_location(blockquote, file$i, 133, 1, 3765);
    			add_location(p3, file$i, 138, 1, 4011);
    			add_location(p4, file$i, 141, 1, 4303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, blockquote, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, p4, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(blockquote);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(p4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(120:0) <Section>",
    		ctx
    	});

    	return block;
    }

    // (150:0) <Section>
    function create_default_slot_5$1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Pacients per Centres de Salut Mental de Catalunya l'any 2019";
    			add_location(h2, file$i, 150, 0, 4619);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(150:0) <Section>",
    		ctx
    	});

    	return block;
    }

    // (162:0) <Section>
    function create_default_slot_4$1(ctx) {
    	let h2;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let p3;
    	let t9;
    	let p4;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Les dades";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Actualment, amb les últimes dades disponibles (2019), la xarxa de centres d’atenció a la salut mental atén 236.366 persones, el 47% homes i el 53% dones (i el 13%, menors d’edat). Entre els quatre anys analitzats, 2017 és el que acumula més pacients, concretament 237.863.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Durant aquests quatre anys, els homes que han fet més ús dels centres de salut mental han estat els infants d’entre 6 i 12 anys (86.762 en total). A la banda contrària, els menors de sis anys han estat els que menys els han visitat (4.538 en conjunt).";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Pel que fa a les dones, el grup d’edat amb més pacients és el de 45-54 anys (95.030), mentre que les menors de sis anys també és el que acumula menys persones ateses (1.726).";
    			t7 = space();
    			p3 = element("p");
    			p3.textContent = "Els centres de salut mental que han atès més persones varia any rere any, tant pel que fa als adults com als menors d’edat. Així, es passa del CSM Adults Tortosa el 2016 (64 pacients per cada mil habitants per àrea de gestió assistencial) al mateix recurs el 2019 (60,6 pacients/mil habitants) entre els adults. I del CSMIJ Gironès-Pla de l'Estany de 2016 (41,5 pacients/mil habitants) al CSM Infantil i Juvenil Alta Ribagorça el 2019 (78 pacients/mil habitants).";
    			t9 = space();
    			p4 = element("p");
    			p4.textContent = "A l’extrem oposat, els centres que han atès menys persones són el CSM Adults Segarra, tant al 2016 (1,76 pacients/mil habitants) com al 2019 (1,20 pacients/mil habitants) per als majors d’edat. Mentre que a la xarxa d’infants i adolescents han estat el CSMIJ Badalona 1 Est Joan Obiols el 2016 (10,5 pacients/mil habitants) i el CSM Infantil i Juvenil La Mina el 2019 (3,5 pacients/mil habitants).";
    			add_location(h2, file$i, 162, 1, 4894);
    			add_location(p0, file$i, 163, 1, 4914);
    			add_location(p1, file$i, 166, 1, 5199);
    			add_location(p2, file$i, 169, 0, 5461);
    			add_location(p3, file$i, 172, 0, 5646);
    			add_location(p4, file$i, 175, 0, 6119);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p4, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(162:0) <Section>",
    		ctx
    	});

    	return block;
    }

    // (182:0) <Section>
    function create_default_slot_3$1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Exploreu les dades";
    			add_location(h2, file$i, 182, 0, 6549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(182:0) <Section>",
    		ctx
    	});

    	return block;
    }

    // (190:0) <Section>
    function create_default_slot_2$1(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Pacients atesos als centres de salut mental infantojuvenils";
    			add_location(h3, file$i, 190, 0, 6860);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(190:0) <Section>",
    		ctx
    	});

    	return block;
    }

    // (197:0) <Section>
    function create_default_slot_1$1(ctx) {
    	let h2;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Consulta els informes anuals complerts de la Central de Resultats d'AQuAS";
    			t1 = space();
    			p = element("p");
    			p.textContent = "A continuació trobaras els informes dels darrers anys elaborats per l'Observatori del sistema de salut de Catalunya.";
    			add_location(h2, file$i, 197, 1, 6980);
    			add_location(p, file$i, 198, 1, 7064);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(197:0) <Section>",
    		ctx
    	});

    	return block;
    }

    // (214:0) <Section>
    function create_default_slot$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Descarrega la totalitat de les dades al portal de Transparència i Dades Obertes de la Generalitat.";
    			add_location(p, file$i, 214, 1, 7426);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(214:0) <Section>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let uxresearch;
    	let t0;
    	let header;
    	let t1;
    	let section0;
    	let t2;
    	let section1;
    	let t3;
    	let div0;
    	let iframe0;
    	let iframe0_src_value;
    	let t4;
    	let divider0;
    	let t5;
    	let section2;
    	let t6;
    	let section3;
    	let t7;
    	let div1;
    	let iframe1;
    	let iframe1_src_value;
    	let t8;
    	let br0;
    	let t9;
    	let section4;
    	let t10;
    	let br1;
    	let t11;
    	let mapes;
    	let t12;
    	let divider1;
    	let t13;
    	let section5;
    	let t14;
    	let section6;
    	let t15;
    	let footer;
    	let current;
    	uxresearch = new UXResearch({ $$inline: true });

    	header = new Header({
    			props: {
    				bgimage: "./img/bg-dark.jpg",
    				bgfixed: true,
    				theme: "light",
    				$$slots: { default: [create_default_slot_7$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section0 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section1 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	divider0 = new Divider({ $$inline: true });

    	section2 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section3 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section4 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mapes = new Tabs_1({ $$inline: true });
    	divider1 = new Divider({ $$inline: true });

    	section5 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section6 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(uxresearch.$$.fragment);
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			create_component(section0.$$.fragment);
    			t2 = space();
    			create_component(section1.$$.fragment);
    			t3 = space();
    			div0 = element("div");
    			iframe0 = element("iframe");
    			t4 = space();
    			create_component(divider0.$$.fragment);
    			t5 = space();
    			create_component(section2.$$.fragment);
    			t6 = space();
    			create_component(section3.$$.fragment);
    			t7 = space();
    			div1 = element("div");
    			iframe1 = element("iframe");
    			t8 = space();
    			br0 = element("br");
    			t9 = space();
    			create_component(section4.$$.fragment);
    			t10 = space();
    			br1 = element("br");
    			t11 = space();
    			create_component(mapes.$$.fragment);
    			t12 = space();
    			create_component(divider1.$$.fragment);
    			t13 = space();
    			create_component(section5.$$.fragment);
    			t14 = space();
    			create_component(section6.$$.fragment);
    			t15 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(iframe0, "width", "80%");
    			attr_dev(iframe0, "height", "1184");
    			attr_dev(iframe0, "frameborder", "0");
    			if (iframe0.src !== (iframe0_src_value = "https://observablehq.com/embed/@oriolvidal/beeswarm-centres?cells=chart")) attr_dev(iframe0, "src", iframe0_src_value);
    			add_location(iframe0, file$i, 153, 1, 4721);
    			attr_dev(div0, "class", "embed svelte-bj8qo7");
    			add_location(div0, file$i, 152, 0, 4700);
    			attr_dev(iframe1, "width", "971");
    			attr_dev(iframe1, "height", "864");
    			attr_dev(iframe1, "frameborder", "0");
    			if (iframe1.src !== (iframe1_src_value = "https://observablehq.com/embed/9e82aa763befec21?cells=viewof+scale%2Cviewof+variable%2Cviewof+sex%2Cviewof+edat%2Cviewof+cronic%2Cviewof+nou%2Cviewof+baix%2Cchart")) attr_dev(iframe1, "src", iframe1_src_value);
    			add_location(iframe1, file$i, 185, 1, 6609);
    			attr_dev(div1, "class", "embed svelte-bj8qo7");
    			add_location(div1, file$i, 184, 0, 6588);
    			add_location(br0, file$i, 188, 0, 6845);
    			add_location(br1, file$i, 192, 0, 6940);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(uxresearch, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(header, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(section0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(section1, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, iframe0);
    			insert_dev(target, t4, anchor);
    			mount_component(divider0, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(section2, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(section3, target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, iframe1);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(section4, target, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t11, anchor);
    			mount_component(mapes, target, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(divider1, target, anchor);
    			insert_dev(target, t13, anchor);
    			mount_component(section5, target, anchor);
    			insert_dev(target, t14, anchor);
    			mount_component(section6, target, anchor);
    			insert_dev(target, t15, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				header_changes.$$scope = { dirty, ctx };
    			}

    			header.$set(header_changes);
    			const section0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    			const section2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				section2_changes.$$scope = { dirty, ctx };
    			}

    			section2.$set(section2_changes);
    			const section3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				section3_changes.$$scope = { dirty, ctx };
    			}

    			section3.$set(section3_changes);
    			const section4_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				section4_changes.$$scope = { dirty, ctx };
    			}

    			section4.$set(section4_changes);
    			const section5_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				section5_changes.$$scope = { dirty, ctx };
    			}

    			section5.$set(section5_changes);
    			const section6_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				section6_changes.$$scope = { dirty, ctx };
    			}

    			section6.$set(section6_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uxresearch.$$.fragment, local);
    			transition_in(header.$$.fragment, local);
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(divider0.$$.fragment, local);
    			transition_in(section2.$$.fragment, local);
    			transition_in(section3.$$.fragment, local);
    			transition_in(section4.$$.fragment, local);
    			transition_in(mapes.$$.fragment, local);
    			transition_in(divider1.$$.fragment, local);
    			transition_in(section5.$$.fragment, local);
    			transition_in(section6.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uxresearch.$$.fragment, local);
    			transition_out(header.$$.fragment, local);
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(divider0.$$.fragment, local);
    			transition_out(section2.$$.fragment, local);
    			transition_out(section3.$$.fragment, local);
    			transition_out(section4.$$.fragment, local);
    			transition_out(mapes.$$.fragment, local);
    			transition_out(divider1.$$.fragment, local);
    			transition_out(section5.$$.fragment, local);
    			transition_out(section6.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(uxresearch, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(section0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(section1, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t4);
    			destroy_component(divider0, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(section2, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(section3, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t9);
    			destroy_component(section4, detaching);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t11);
    			destroy_component(mapes, detaching);
    			if (detaching) detach_dev(t12);
    			destroy_component(divider1, detaching);
    			if (detaching) detach_dev(t13);
    			destroy_component(section5, detaching);
    			if (detaching) detach_dev(t14);
    			destroy_component(section6, detaching);
    			if (detaching) detach_dev(t15);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let theme = "light";
    	setContext("theme", theme);
    	setColors(themes, theme);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		setContext,
    		getData,
    		setColors,
    		themes,
    		UXResearch,
    		Header,
    		Section,
    		Footer,
    		Filler,
    		Media,
    		Divider,
    		Mapes: Tabs_1,
    		Tabs: Tabs$1,
    		Tab: Tab$1,
    		TabContent,
    		Button,
    		theme
    	});

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) theme = $$props.theme;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
