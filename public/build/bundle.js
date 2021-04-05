
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35734/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
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
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
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
    	let t2;
    	let nav_style_value;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			p = element("p");
    			t0 = text("Col·labora a millorar l'experiència d'usuari, ");
    			a = element("a");
    			a.textContent = "participa en la nostra recerca";
    			t2 = text("  ›");
    			attr_dev(a, "href", "#");
    			add_location(a, file, 9, 67, 408);
    			attr_dev(p, "class", "banner svelte-vl8xrz");
    			add_location(p, file, 9, 2, 343);
    			attr_dev(div, "class", "col-wide middle center");
    			add_location(div, file, 8, 2, 304);

    			attr_dev(nav, "style", nav_style_value = "border-bottom-color: " + themes[/*theme*/ ctx[0]]["muted"] + "; " + (/*filled*/ ctx[1]
    			? "background-color: " + themes[/*theme*/ ctx[0]]["background"] + ";"
    			: ""));

    			attr_dev(nav, "class", "svelte-vl8xrz");
    			add_location(nav, file, 7, 0, 167);
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
    			append_dev(p, t2);
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

    /* src/App.svelte generated by Svelte v3.29.7 */
    const file$7 = "src/App.svelte";

    // (52:0) <Header bgimage="./img/bg-dark.jpg" bgfixed={true} theme="dark">
    function create_default_slot_9(ctx) {
    	let h1;
    	let t1;
    	let br0;
    	let t2;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let div;
    	let t7;
    	let br1;
    	let t8;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Àmbit de salut mental i addiccions";
    			t1 = space();
    			br0 = element("br");
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Observatori del sistema de salut de Catalunya";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "Central de resultats";
    			t6 = space();
    			div = element("div");
    			t7 = text("Desplaça't per veure l'informe");
    			br1 = element("br");
    			t8 = space();
    			img = element("img");
    			attr_dev(h1, "class", "text-shadow");
    			add_location(h1, file$7, 52, 1, 1233);
    			add_location(br0, file$7, 53, 1, 1299);
    			attr_dev(p0, "class", "inset-medium text-big text-shadow");
    			add_location(p0, file$7, 54, 1, 1305);
    			attr_dev(p1, "class", "inset-medium text-big text-shadow");
    			add_location(p1, file$7, 57, 1, 1406);
    			add_location(br1, file$7, 61, 32, 1566);
    			if (img.src !== (img_src_value = "./img/scroll-down-white.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svg-icon bounce svelte-z3ai4u");
    			attr_dev(img, "alt", "down arrow");
    			add_location(img, file$7, 62, 2, 1575);
    			attr_dev(div, "class", "text-shadow");
    			set_style(div, "margin-top", "48px");
    			add_location(div, file$7, 60, 1, 1482);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, t7);
    			append_dev(div, br1);
    			append_dev(div, t8);
    			append_dev(div, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(52:0) <Header bgimage=\\\"./img/bg-dark.jpg\\\" bgfixed={true} theme=\\\"dark\\\">",
    		ctx
    	});

    	return block;
    }

    // (67:0) <Filler theme="dark">
    function create_default_slot_8(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Informe 2020";
    			attr_dev(p, "class", "text-big");
    			add_location(p, file$7, 67, 1, 1699);
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
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(67:0) <Filler theme=\\\"dark\\\">",
    		ctx
    	});

    	return block;
    }

    // (73:0) <Section>
    function create_default_slot_7(ctx) {
    	let h2;
    	let t1;
    	let h3;
    	let t3;
    	let p0;
    	let t5;
    	let p1;
    	let t7;
    	let blockquote;
    	let t9;
    	let p2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Salut mental comunitària d’adults: centres de salut mental d’adults (CSMA)";
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "La meitat dels pacients atesos pels CSMA són pacients crònics (51,1%) i un de cada tres pacient crònic complex (32,3%)";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Els 76 centres de salut mental d’adults (CSMA) que donen servei a la xarxa pública de salut de Catalunya tenen assignada una població de 5.969.735 persones de 18 anys o més (51,3% dones i 48,7% homes), el que suposa una mitjana d’un CSMA per cada 78.550 persones.";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "L’import de la contractació del conjunt de CSMA va ser de 51.363.489 €, que suposa una mitjana de 675.835€ per centre i de gairebé 304,5 € per persona atesa. El pressupost ha crescut un 9,3% respecte el 2016.";
    			t7 = space();
    			blockquote = element("blockquote");
    			blockquote.textContent = "\"Una de cada 7 persones ateses per un CSMA\n\t\tté un nivell socioeconòmic molt baix.\"";
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "L’any 2017, un total de 168.688 persones van ésser ateses en algun CSMA (59,6% dones i 40,4% homes), concretament el 2,7% de la població adulta (3,1% de les dones i 2,2% dels homes).";
    			add_location(h2, file$7, 73, 1, 1763);
    			add_location(h3, file$7, 74, 1, 1848);
    			add_location(p0, file$7, 75, 1, 1977);
    			add_location(p1, file$7, 78, 1, 2255);
    			attr_dev(blockquote, "class", "text-indent");
    			add_location(blockquote, file$7, 81, 1, 2478);
    			add_location(p2, file$7, 85, 1, 2613);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, blockquote, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(blockquote);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(73:0) <Section>",
    		ctx
    	});

    	return block;
    }

    // (94:0) <Section>
    function create_default_slot_6(ctx) {
    	let h2;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Gràfic dinàmic";
    			t1 = space();
    			p = element("p");
    			p.textContent = "La visualització a continuació recull dades territorials de visites realitzades als Centres de Salut Mental de Catalunya. \n\t\tDesplaça per veure'n més.";
    			add_location(h2, file$7, 94, 1, 2845);
    			add_location(p, file$7, 95, 1, 2870);
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
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(94:0) <Section>",
    		ctx
    	});

    	return block;
    }

    // (103:0) <Section>
    function create_default_slot_5(ctx) {
    	let h2;
    	let t1;
    	let p0;
    	let t3;
    	let p1;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "La depressió és el diagnòstic més freqüent i l’esquizofrènia és el que genera més visites";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "En una anàlisi en detall dels diagnòstics, s’observa que en el 2017 la\n\t\tdepressió va continuar essent el més freqüent, present en una ter-\n\t\tcera part de la població atesa (39,4% de les dones i 23,7% dels ho-\n\t\tmes).";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "A l’altre extrem, la demència estava present únicament en un\n\t\t1,1% dels pacients (1,0% en dones i 1,2% en homes). El diagnòstic\n\t\tque va suposar un major nombre de visites és l’esquizofrènia, amb\n\t\tuna mitjana de 13,4 visites a l’any (12,7 en dones i 13,8 en homes).\n\t\tA continuació, si bé amb un volum menor, trobem les altres psicosis\n\t\t(10,3) i el trastorn bipolar (9,5).";
    			add_location(h2, file$7, 103, 1, 3068);
    			add_location(p0, file$7, 104, 1, 3168);
    			add_location(p1, file$7, 110, 1, 3401);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(103:0) <Section>",
    		ctx
    	});

    	return block;
    }

    // (121:0) <Media col="full" height={600} caption="L'explicació del contingut previ">
    function create_default_slot_4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Gràfic o mèdia en ample complert";
    			attr_dev(div, "class", "media svelte-z3ai4u");
    			add_location(div, file$7, 121, 1, 3877);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(121:0) <Media col=\\\"full\\\" height={600} caption=\\\"L'explicació del contingut previ\\\">",
    		ctx
    	});

    	return block;
    }

    // (127:0) <Section>
    function create_default_slot_3(ctx) {
    	let h2;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "L'estat dels Centres de Salut Mental a Catalunya";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Els serveis d’atenció ambulatòria d’adults compten amb 76 centres\n\t\tde salut mental d’adults (CSMA) que durant l’any 2017 van atendre\n\t\ta 168.688 persones.";
    			add_location(h2, file$7, 127, 1, 3969);
    			attr_dev(p, "class", "mb");
    			add_location(p, file$7, 128, 1, 4029);
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
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(127:0) <Section>",
    		ctx
    	});

    	return block;
    }

    // (140:0) <Section>
    function create_default_slot_2(ctx) {
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
    			add_location(h2, file$7, 140, 1, 4249);
    			add_location(p, file$7, 141, 1, 4333);
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
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(140:0) <Section>",
    		ctx
    	});

    	return block;
    }

    // (147:0) <Media col="wide" grid="narrow" caption="Fes click per descarregar.">
    function create_default_slot_1(ctx) {
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "2020";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "2019";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "2018";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "2017";
    			attr_dev(div0, "class", "media svelte-z3ai4u");
    			add_location(div0, file$7, 150, 0, 4545);
    			attr_dev(div1, "class", "media svelte-z3ai4u");
    			add_location(div1, file$7, 151, 0, 4575);
    			attr_dev(div2, "class", "media svelte-z3ai4u");
    			add_location(div2, file$7, 152, 0, 4605);
    			attr_dev(div3, "class", "media svelte-z3ai4u");
    			add_location(div3, file$7, 153, 0, 4635);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(147:0) <Media col=\\\"wide\\\" grid=\\\"narrow\\\" caption=\\\"Fes click per descarregar.\\\">",
    		ctx
    	});

    	return block;
    }

    // (157:0) <Section>
    function create_default_slot(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Descarrega la totalitat de les dades al portal de Transparència i Dades Obertes de la Generalitat.";
    			add_location(p, file$7, 157, 1, 4686);
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(157:0) <Section>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let uxresearch;
    	let t0;
    	let header;
    	let t1;
    	let filler;
    	let t2;
    	let section0;
    	let t3;
    	let divider0;
    	let t4;
    	let section1;
    	let t5;
    	let divider1;
    	let t6;
    	let section2;
    	let t7;
    	let media0;
    	let t8;
    	let divider2;
    	let t9;
    	let section3;
    	let t10;
    	let divider3;
    	let t11;
    	let section4;
    	let t12;
    	let media1;
    	let t13;
    	let section5;
    	let t14;
    	let footer;
    	let current;
    	uxresearch = new UXResearch({ $$inline: true });

    	header = new Header({
    			props: {
    				bgimage: "./img/bg-dark.jpg",
    				bgfixed: true,
    				theme: "dark",
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	filler = new Filler({
    			props: {
    				theme: "dark",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section0 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	divider0 = new Divider({ $$inline: true });

    	section1 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	divider1 = new Divider({ $$inline: true });

    	section2 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	media0 = new Media({
    			props: {
    				col: "full",
    				height: 600,
    				caption: "L'explicació del contingut previ",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	divider2 = new Divider({ $$inline: true });

    	section3 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	divider3 = new Divider({ $$inline: true });

    	section4 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	media1 = new Media({
    			props: {
    				col: "wide",
    				grid: "narrow",
    				caption: "Fes click per descarregar.",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section5 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot] },
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
    			create_component(filler.$$.fragment);
    			t2 = space();
    			create_component(section0.$$.fragment);
    			t3 = space();
    			create_component(divider0.$$.fragment);
    			t4 = space();
    			create_component(section1.$$.fragment);
    			t5 = space();
    			create_component(divider1.$$.fragment);
    			t6 = space();
    			create_component(section2.$$.fragment);
    			t7 = space();
    			create_component(media0.$$.fragment);
    			t8 = space();
    			create_component(divider2.$$.fragment);
    			t9 = space();
    			create_component(section3.$$.fragment);
    			t10 = space();
    			create_component(divider3.$$.fragment);
    			t11 = space();
    			create_component(section4.$$.fragment);
    			t12 = space();
    			create_component(media1.$$.fragment);
    			t13 = space();
    			create_component(section5.$$.fragment);
    			t14 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(uxresearch, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(header, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(filler, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(section0, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(divider0, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(section1, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(divider1, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(section2, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(media0, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(divider2, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(section3, target, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(divider3, target, anchor);
    			insert_dev(target, t11, anchor);
    			mount_component(section4, target, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(media1, target, anchor);
    			insert_dev(target, t13, anchor);
    			mount_component(section5, target, anchor);
    			insert_dev(target, t14, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				header_changes.$$scope = { dirty, ctx };
    			}

    			header.$set(header_changes);
    			const filler_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				filler_changes.$$scope = { dirty, ctx };
    			}

    			filler.$set(filler_changes);
    			const section0_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    			const section2_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				section2_changes.$$scope = { dirty, ctx };
    			}

    			section2.$set(section2_changes);
    			const media0_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				media0_changes.$$scope = { dirty, ctx };
    			}

    			media0.$set(media0_changes);
    			const section3_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				section3_changes.$$scope = { dirty, ctx };
    			}

    			section3.$set(section3_changes);
    			const section4_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				section4_changes.$$scope = { dirty, ctx };
    			}

    			section4.$set(section4_changes);
    			const media1_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				media1_changes.$$scope = { dirty, ctx };
    			}

    			media1.$set(media1_changes);
    			const section5_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				section5_changes.$$scope = { dirty, ctx };
    			}

    			section5.$set(section5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uxresearch.$$.fragment, local);
    			transition_in(header.$$.fragment, local);
    			transition_in(filler.$$.fragment, local);
    			transition_in(section0.$$.fragment, local);
    			transition_in(divider0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(divider1.$$.fragment, local);
    			transition_in(section2.$$.fragment, local);
    			transition_in(media0.$$.fragment, local);
    			transition_in(divider2.$$.fragment, local);
    			transition_in(section3.$$.fragment, local);
    			transition_in(divider3.$$.fragment, local);
    			transition_in(section4.$$.fragment, local);
    			transition_in(media1.$$.fragment, local);
    			transition_in(section5.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uxresearch.$$.fragment, local);
    			transition_out(header.$$.fragment, local);
    			transition_out(filler.$$.fragment, local);
    			transition_out(section0.$$.fragment, local);
    			transition_out(divider0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(divider1.$$.fragment, local);
    			transition_out(section2.$$.fragment, local);
    			transition_out(media0.$$.fragment, local);
    			transition_out(divider2.$$.fragment, local);
    			transition_out(section3.$$.fragment, local);
    			transition_out(divider3.$$.fragment, local);
    			transition_out(section4.$$.fragment, local);
    			transition_out(media1.$$.fragment, local);
    			transition_out(section5.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(uxresearch, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(filler, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(section0, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(divider0, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(section1, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(divider1, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(section2, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(media0, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(divider2, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(section3, detaching);
    			if (detaching) detach_dev(t10);
    			destroy_component(divider3, detaching);
    			if (detaching) detach_dev(t11);
    			destroy_component(section4, detaching);
    			if (detaching) detach_dev(t12);
    			destroy_component(media1, detaching);
    			if (detaching) detach_dev(t13);
    			destroy_component(section5, detaching);
    			if (detaching) detach_dev(t14);
    			destroy_component(footer, detaching);
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

    const rawdata = "./data/data.csv";

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let theme = "light";
    	setContext("theme", theme);
    	setColors(themes, theme);
    	let data;

    	getData(rawdata).then(result => data = result).then(() => {
    		data.map(d => {
    			return {
    				any: d.any,
    				id_rs: d.id_rs,
    				rs: d.rs,
    				id_aga: d.id_aga,
    				aga: d.aga,
    				sexe: d.sexe,
    				edat: d.grup_edat,
    				nou_pacient: d.nou_pacient,
    				nse_baix: d.nse_baix,
    				pcsm: d.pcsm,
    				pccsm: d.pccsm,
    				pacients: +d.pacients,
    				visites: +d.visites
    			};
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
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
    		theme,
    		rawdata,
    		data
    	});

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) theme = $$props.theme;
    		if ("data" in $$props) data = $$props.data;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
