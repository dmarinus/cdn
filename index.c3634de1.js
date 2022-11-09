(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const app = "";
function noop() {
}
const identity = (x) => x;
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
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
function set_store_value(store, ret, value) {
  store.set(value);
  return ret;
}
const is_client = typeof window !== "undefined";
let now = is_client ? () => window.performance.now() : () => Date.now();
let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
const tasks = /* @__PURE__ */ new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0)
    raf(run_tasks);
}
function loop(callback) {
  let task;
  if (tasks.size === 0)
    raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
function append(target, node) {
  target.appendChild(node);
}
function get_root_for_style(node) {
  if (!node)
    return document;
  const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
  if (root && root.host) {
    return root;
  }
  return node.ownerDocument;
}
function append_empty_stylesheet(node) {
  const style_element = element("style");
  append_stylesheet(get_root_for_style(node), style_element);
  return style_element.sheet;
}
function append_stylesheet(node, style) {
  append(node.head || node, style);
  return style.sheet;
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
  for (let i = 0; i < iterations.length; i += 1) {
    if (iterations[i])
      iterations[i].d(detaching);
  }
}
function element(name) {
  return document.createElement(name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function empty() {
  return text("");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
  return function(event) {
    event.preventDefault();
    return fn.call(this, event);
  };
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.wholeText !== data)
    text2.data = data;
}
function set_input_value(input, value) {
  input.value = value == null ? "" : value;
}
function set_style(node, key, value, important) {
  if (value === null) {
    node.style.removeProperty(key);
  } else {
    node.style.setProperty(key, value, important ? "important" : "");
  }
}
function select_option(select, value) {
  for (let i = 0; i < select.options.length; i += 1) {
    const option = select.options[i];
    if (option.__value === value) {
      option.selected = true;
      return;
    }
  }
  select.selectedIndex = -1;
}
function select_value(select) {
  const selected_option = select.querySelector(":checked") || select.options[0];
  return selected_option && selected_option.__value;
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, cancelable, detail);
  return e;
}
const managed_styles = /* @__PURE__ */ new Map();
let active = 0;
function hash(str) {
  let hash2 = 5381;
  let i = str.length;
  while (i--)
    hash2 = (hash2 << 5) - hash2 ^ str.charCodeAt(i);
  return hash2 >>> 0;
}
function create_style_information(doc, node) {
  const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
  managed_styles.set(doc, info);
  return info;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
  const step = 16.666 / duration;
  let keyframes = "{\n";
  for (let p = 0; p <= 1; p += step) {
    const t = a + (b - a) * ease(p);
    keyframes += p * 100 + `%{${fn(t, 1 - t)}}
`;
  }
  const rule = keyframes + `100% {${fn(b, 1 - b)}}
}`;
  const name = `__svelte_${hash(rule)}_${uid}`;
  const doc = get_root_for_style(node);
  const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
  if (!rules[name]) {
    rules[name] = true;
    stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
  }
  const animation = node.style.animation || "";
  node.style.animation = `${animation ? `${animation}, ` : ""}${name} ${duration}ms linear ${delay}ms 1 both`;
  active += 1;
  return name;
}
function delete_rule(node, name) {
  const previous = (node.style.animation || "").split(", ");
  const next = previous.filter(
    name ? (anim) => anim.indexOf(name) < 0 : (anim) => anim.indexOf("__svelte") === -1
  );
  const deleted = previous.length - next.length;
  if (deleted) {
    node.style.animation = next.join(", ");
    active -= deleted;
    if (!active)
      clear_rules();
  }
}
function clear_rules() {
  raf(() => {
    if (active)
      return;
    managed_styles.forEach((info) => {
      const { ownerNode } = info.stylesheet;
      if (ownerNode)
        detach(ownerNode);
    });
    managed_styles.clear();
  });
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}
function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail, { cancelable = false } = {}) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail, { cancelable });
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
      return !event.defaultPrevented;
    }
    return true;
  };
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
function add_flush_callback(fn) {
  flush_callbacks.push(fn);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  const saved_component = current_component;
  do {
    while (flushidx < dirty_components.length) {
      const component = dirty_components[flushidx];
      flushidx++;
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
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
  seen_callbacks.clear();
  set_current_component(saved_component);
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
let promise;
function wait() {
  if (!promise) {
    promise = Promise.resolve();
    promise.then(() => {
      promise = null;
    });
  }
  return promise;
}
function dispatch(node, direction, kind) {
  node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
}
const outroing = /* @__PURE__ */ new Set();
let outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
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
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  } else if (callback) {
    callback();
  }
}
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
  let config = fn(node, params);
  let running = false;
  let animation_name;
  let task;
  let uid = 0;
  function cleanup() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  function go() {
    const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
    if (css)
      animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
    tick(0, 1);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    if (task)
      task.abort();
    running = true;
    add_render_callback(() => dispatch(node, true, "start"));
    task = loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick(1, 0);
          dispatch(node, true, "end");
          cleanup();
          return running = false;
        }
        if (now2 >= start_time) {
          const t = easing((now2 - start_time) / duration);
          tick(t, 1 - t);
        }
      }
      return running;
    });
  }
  let started = false;
  return {
    start() {
      if (started)
        return;
      started = true;
      delete_rule(node);
      if (is_function(config)) {
        config = config();
        wait().then(go);
      } else {
        go();
      }
    },
    invalidate() {
      started = false;
    },
    end() {
      if (running) {
        cleanup();
        running = false;
      }
    }
  };
}
function create_bidirectional_transition(node, fn, params, intro) {
  let config = fn(node, params);
  let t = intro ? 0 : 1;
  let running_program = null;
  let pending_program = null;
  let animation_name = null;
  function clear_animation() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  function init2(program, duration) {
    const d = program.b - t;
    duration *= Math.abs(d);
    return {
      a: t,
      b: program.b,
      d,
      duration,
      start: program.start,
      end: program.start + duration,
      group: program.group
    };
  }
  function go(b) {
    const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
    const program = {
      start: now() + delay,
      b
    };
    if (!b) {
      program.group = outros;
      outros.r += 1;
    }
    if (running_program || pending_program) {
      pending_program = program;
    } else {
      if (css) {
        clear_animation();
        animation_name = create_rule(node, t, b, duration, delay, easing, css);
      }
      if (b)
        tick(0, 1);
      running_program = init2(program, duration);
      add_render_callback(() => dispatch(node, b, "start"));
      loop((now2) => {
        if (pending_program && now2 > pending_program.start) {
          running_program = init2(pending_program, duration);
          pending_program = null;
          dispatch(node, running_program.b, "start");
          if (css) {
            clear_animation();
            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
          }
        }
        if (running_program) {
          if (now2 >= running_program.end) {
            tick(t = running_program.b, 1 - t);
            dispatch(node, running_program.b, "end");
            if (!pending_program) {
              if (running_program.b) {
                clear_animation();
              } else {
                if (!--running_program.group.r)
                  run_all(running_program.group.c);
              }
            }
            running_program = null;
          } else if (now2 >= running_program.start) {
            const p = now2 - running_program.start;
            t = running_program.a + running_program.d * easing(p / running_program.duration);
            tick(t, 1 - t);
          }
        }
        return !!(running_program || pending_program);
      });
    }
  }
  return {
    run(b) {
      if (is_function(config)) {
        wait().then(() => {
          config = config();
          go(b);
        });
      } else {
        go(b);
      }
    },
    end() {
      clear_animation();
      running_program = pending_program = null;
    }
  };
}
function bind(component, name, callback) {
  const index = component.$$.props[name];
  if (index !== void 0) {
    component.$$.bound[index] = callback;
    callback(component.$$.ctx[index]);
  }
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor, customElement) {
  const { fragment, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
      if (component.$$.on_destroy) {
        component.$$.on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
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
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: [],
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
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
    if (!is_function(callback)) {
      return noop;
    }
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
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
const subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
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
  function update2(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update: update2, subscribe: subscribe2 };
}
const container = writable();
const user = writable();
const insights = writable();
const missingProducts = writable([]);
const missingPrices = writable([]);
const prompt = writable();
const screen = writable();
const Insights_svelte_svelte_type_style_lang = "";
function create_else_block_2(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      attr(div, "class", "loader");
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function create_if_block_4$1(ctx) {
  let p0;
  let i0;
  let t0;
  let b0;
  let t1_value = ctx[0].TEAM.reduce(func$1, 0) + ctx[0].labelledSinceUpdate + "";
  let t1;
  let p1;
  let p2;
  let i1;
  let t2;
  let b1;
  let t3_value = ctx[0].TEAM.reduce(func_1$1, 0) + "";
  let t3;
  return {
    c() {
      p0 = element("p");
      i0 = element("i");
      t0 = text(" Items processed today : ");
      b0 = element("b");
      t1 = text(t1_value);
      p1 = element("p");
      p2 = element("p");
      i1 = element("i");
      t2 = text(" Boxes processed today : ");
      b1 = element("b");
      t3 = text(t3_value);
      attr(i0, "class", "fas fa-tag");
      attr(i1, "class", "fas fa-box");
    },
    m(target, anchor) {
      insert(target, p0, anchor);
      append(p0, i0);
      append(p0, t0);
      append(p0, b0);
      append(b0, t1);
      insert(target, p1, anchor);
      insert(target, p2, anchor);
      append(p2, i1);
      append(p2, t2);
      append(p2, b1);
      append(b1, t3);
    },
    p(ctx2, dirty) {
      if (dirty & 1 && t1_value !== (t1_value = ctx2[0].TEAM.reduce(func$1, 0) + ctx2[0].labelledSinceUpdate + ""))
        set_data(t1, t1_value);
      if (dirty & 1 && t3_value !== (t3_value = ctx2[0].TEAM.reduce(func_1$1, 0) + ""))
        set_data(t3, t3_value);
    },
    d(detaching) {
      if (detaching)
        detach(p0);
      if (detaching)
        detach(p1);
      if (detaching)
        detach(p2);
    }
  };
}
function create_if_block_3$1(ctx) {
  let h3;
  let mounted;
  let dispose;
  return {
    c() {
      h3 = element("h3");
      h3.innerHTML = `<i class="fas fa-external-link"></i>`;
      attr(h3, "class", "icon-btn");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      if (!mounted) {
        dispose = listen(h3, "click", ctx[4]);
        mounted = true;
      }
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(h3);
      mounted = false;
      dispose();
    }
  };
}
function create_else_block_1$1(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      attr(div, "class", "loader");
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function create_if_block_2$2(ctx) {
  let p0;
  let i0;
  let t0;
  let b0;
  let t1_value = ctx[0].TEAM.reduce(func_2, 0) + ctx[0].labelledSinceUpdate + "";
  let t1;
  let p1;
  let p2;
  let i1;
  let t2;
  let b1;
  let t3_value = ctx[0].TEAM.reduce(func_3, 0) + "";
  let t3;
  return {
    c() {
      p0 = element("p");
      i0 = element("i");
      t0 = text(" Items processed today : ");
      b0 = element("b");
      t1 = text(t1_value);
      p1 = element("p");
      p2 = element("p");
      i1 = element("i");
      t2 = text(" Boxes processed today : ");
      b1 = element("b");
      t3 = text(t3_value);
      attr(i0, "class", "fas fa-tag");
      attr(i1, "class", "fas fa-box");
    },
    m(target, anchor) {
      insert(target, p0, anchor);
      append(p0, i0);
      append(p0, t0);
      append(p0, b0);
      append(b0, t1);
      insert(target, p1, anchor);
      insert(target, p2, anchor);
      append(p2, i1);
      append(p2, t2);
      append(p2, b1);
      append(b1, t3);
    },
    p(ctx2, dirty) {
      if (dirty & 1 && t1_value !== (t1_value = ctx2[0].TEAM.reduce(func_2, 0) + ctx2[0].labelledSinceUpdate + ""))
        set_data(t1, t1_value);
      if (dirty & 1 && t3_value !== (t3_value = ctx2[0].TEAM.reduce(func_3, 0) + ""))
        set_data(t3, t3_value);
    },
    d(detaching) {
      if (detaching)
        detach(p0);
      if (detaching)
        detach(p1);
      if (detaching)
        detach(p2);
    }
  };
}
function create_if_block$9(ctx) {
  let div1;
  let div0;
  let h30;
  let t2;
  let h31;
  let t3;
  let br;
  let t4;
  let t5;
  let canvas;
  let mounted;
  let dispose;
  function select_block_type_2(ctx2, dirty) {
    if (ctx2[0])
      return create_if_block_1$3;
    return create_else_block$1;
  }
  let current_block_type = select_block_type_2(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      h30 = element("h3");
      h30.innerHTML = `<i class="fas fa-exclamation-triangle"></i>  <i>Issues</i>`;
      t2 = space();
      h31 = element("h3");
      h31.innerHTML = `<i class="fas fa-external-link"></i>`;
      t3 = space();
      br = element("br");
      t4 = space();
      if_block.c();
      t5 = space();
      canvas = element("canvas");
      attr(h31, "class", "icon-btn");
      set_style(div0, "display", "flex");
      set_style(div0, "justify-content", "space-between");
      attr(canvas, "id", "issuesChart");
      attr(div1, "class", "insight-cont svelte-fjggbm");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      append(div0, h30);
      append(div0, t2);
      append(div0, h31);
      append(div1, t3);
      append(div1, br);
      append(div1, t4);
      if_block.m(div1, null);
      append(div1, t5);
      append(div1, canvas);
      if (!mounted) {
        dispose = listen(h31, "click", ctx[5]);
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type_2(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(div1, t5);
        }
      }
    },
    d(detaching) {
      if (detaching)
        detach(div1);
      if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function create_else_block$1(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      attr(div, "class", "loader");
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function create_if_block_1$3(ctx) {
  let p0;
  let i0;
  let t0;
  let b0;
  let t1_value = ctx[0].ISSUES.reduce(func_4, 0) + "";
  let t1;
  let p1;
  let p2;
  let i1;
  let t2;
  let b1;
  let t3_value = ctx[0].ISSUES.reduce(func_5, 0) + "";
  let t3;
  return {
    c() {
      p0 = element("p");
      i0 = element("i");
      t0 = text(" Open issues today : ");
      b0 = element("b");
      t1 = text(t1_value);
      p1 = element("p");
      p2 = element("p");
      i1 = element("i");
      t2 = text(" Boxes affected : ");
      b1 = element("b");
      t3 = text(t3_value);
      attr(i0, "class", "fas fa-exclamation-triangle");
      attr(i1, "class", "fas fa-box");
    },
    m(target, anchor) {
      insert(target, p0, anchor);
      append(p0, i0);
      append(p0, t0);
      append(p0, b0);
      append(b0, t1);
      insert(target, p1, anchor);
      insert(target, p2, anchor);
      append(p2, i1);
      append(p2, t2);
      append(p2, b1);
      append(b1, t3);
    },
    p(ctx2, dirty) {
      if (dirty & 1 && t1_value !== (t1_value = ctx2[0].ISSUES.reduce(func_4, 0) + ""))
        set_data(t1, t1_value);
      if (dirty & 1 && t3_value !== (t3_value = ctx2[0].ISSUES.reduce(func_5, 0) + ""))
        set_data(t3, t3_value);
    },
    d(detaching) {
      if (detaching)
        detach(p0);
      if (detaching)
        detach(p1);
      if (detaching)
        detach(p2);
    }
  };
}
function create_fragment$i(ctx) {
  let main;
  let div1;
  let div0;
  let h30;
  let t2;
  let h31;
  let t3;
  let br0;
  let t4;
  let t5;
  let canvas0;
  let t6;
  let div3;
  let div2;
  let h32;
  let t9;
  let t10;
  let br1;
  let t11;
  let t12;
  let canvas1;
  let t13;
  let mounted;
  let dispose;
  function select_block_type(ctx2, dirty) {
    if (ctx2[0])
      return create_if_block_4$1;
    return create_else_block_2;
  }
  let current_block_type = select_block_type(ctx);
  let if_block0 = current_block_type(ctx);
  let if_block1 = ctx[1] && ctx[1].IS_SUPER_USER == "Y" && create_if_block_3$1(ctx);
  function select_block_type_1(ctx2, dirty) {
    if (ctx2[0])
      return create_if_block_2$2;
    return create_else_block_1$1;
  }
  let current_block_type_1 = select_block_type_1(ctx);
  let if_block2 = current_block_type_1(ctx);
  let if_block3 = ctx[1] && ctx[1].IS_SUPER_USER == "Y" && create_if_block$9(ctx);
  return {
    c() {
      main = element("main");
      div1 = element("div");
      div0 = element("div");
      h30 = element("h3");
      h30.innerHTML = `<i class="fas fa-user"></i>  <i>My Performance</i>`;
      t2 = space();
      h31 = element("h3");
      h31.innerHTML = `<i class="fas fa-external-link"></i>`;
      t3 = space();
      br0 = element("br");
      t4 = space();
      if_block0.c();
      t5 = space();
      canvas0 = element("canvas");
      t6 = space();
      div3 = element("div");
      div2 = element("div");
      h32 = element("h3");
      h32.innerHTML = `<i class="fas fa-users"></i>  <i>Team Performance</i>`;
      t9 = space();
      if (if_block1)
        if_block1.c();
      t10 = space();
      br1 = element("br");
      t11 = space();
      if_block2.c();
      t12 = space();
      canvas1 = element("canvas");
      t13 = space();
      if (if_block3)
        if_block3.c();
      attr(h31, "class", "icon-btn");
      set_style(div0, "display", "flex");
      set_style(div0, "justify-content", "space-between");
      attr(canvas0, "id", "myPerformanceChart");
      attr(div1, "class", "insight-cont svelte-fjggbm");
      set_style(div2, "display", "flex");
      set_style(div2, "justify-content", "space-between");
      attr(canvas1, "id", "teamPerformanceChart");
      attr(div3, "class", "insight-cont svelte-fjggbm");
      attr(main, "class", "svelte-fjggbm");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, div1);
      append(div1, div0);
      append(div0, h30);
      append(div0, t2);
      append(div0, h31);
      append(div1, t3);
      append(div1, br0);
      append(div1, t4);
      if_block0.m(div1, null);
      append(div1, t5);
      append(div1, canvas0);
      append(main, t6);
      append(main, div3);
      append(div3, div2);
      append(div2, h32);
      append(div2, t9);
      if (if_block1)
        if_block1.m(div2, null);
      append(div3, t10);
      append(div3, br1);
      append(div3, t11);
      if_block2.m(div3, null);
      append(div3, t12);
      append(div3, canvas1);
      append(main, t13);
      if (if_block3)
        if_block3.m(main, null);
      if (!mounted) {
        dispose = listen(h31, "click", ctx[3]);
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block0) {
        if_block0.p(ctx2, dirty);
      } else {
        if_block0.d(1);
        if_block0 = current_block_type(ctx2);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div1, t5);
        }
      }
      if (ctx2[1] && ctx2[1].IS_SUPER_USER == "Y") {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_3$1(ctx2);
          if_block1.c();
          if_block1.m(div2, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx2)) && if_block2) {
        if_block2.p(ctx2, dirty);
      } else {
        if_block2.d(1);
        if_block2 = current_block_type_1(ctx2);
        if (if_block2) {
          if_block2.c();
          if_block2.m(div3, t12);
        }
      }
      if (ctx2[1] && ctx2[1].IS_SUPER_USER == "Y") {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
        } else {
          if_block3 = create_if_block$9(ctx2);
          if_block3.c();
          if_block3.m(main, null);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      if_block0.d();
      if (if_block1)
        if_block1.d();
      if_block2.d();
      if (if_block3)
        if_block3.d();
      mounted = false;
      dispose();
    }
  };
}
const func$1 = (a, c) => a + c.ITEMS;
const func_1$1 = (a, c) => a + c.BOXES;
const func_2 = (a, c) => a + c.TEAM_ITEMS;
const func_3 = (a, c) => a + c.TEAM_BOXES;
const func_4 = (a, c) => a + c.ITEMS;
const func_5 = (a, c) => a + c.BOXES;
function instance$i($$self, $$props, $$invalidate) {
  let $user;
  let $insights;
  let $screen;
  component_subscribe($$self, user, ($$value) => $$invalidate(1, $user = $$value));
  component_subscribe($$self, insights, ($$value) => $$invalidate(0, $insights = $$value));
  component_subscribe($$self, screen, ($$value) => $$invalidate(2, $screen = $$value));
  var myPerformanceChart;
  var teamPerformanceChart;
  var issuesChart;
  const updateCharts = () => {
    if (!$insights)
      return;
    if (!myPerformanceChart)
      initCharts();
    myPerformanceChart.data.labels = [];
    myPerformanceChart.data.datasets[0].data = [];
    myPerformanceChart.data.datasets[1].data = [];
    $insights.TEAM.forEach((hh) => {
      myPerformanceChart.data.labels.push(hh.HOUR + "h");
      myPerformanceChart.data.datasets[0].data.push(hh.ITEMS);
      myPerformanceChart.data.datasets[1].data.push(hh.TEAM_AVG_ITEMS);
    });
    myPerformanceChart.update();
    teamPerformanceChart.data.labels = [];
    teamPerformanceChart.data.datasets[0].data = [];
    $insights.TEAM.forEach((hh) => {
      teamPerformanceChart.data.labels.push(hh.HOUR + "h");
      teamPerformanceChart.data.datasets[0].data.push(hh.TEAM_ITEMS);
    });
    teamPerformanceChart.update();
    if ($user.IS_SUPER_USER == "Y") {
      issuesChart.data.labels = [];
      issuesChart.data.datasets[0].data = [];
      $insights.ISSUES.forEach((i) => {
        issuesChart.data.labels.push(i.ERROR);
        issuesChart.data.datasets[0].data.push(i.BOXES);
      });
      issuesChart.update();
    }
  };
  const initCharts = () => {
    var lastHour = $insights.TEAM[$insights.TEAM.length - 1];
    var ownColor = lastHour.ITEMS >= lastHour.TEAM_AVG_ITEMS ? "#91ff66" : "#ff6666";
    myPerformanceChart = new Chart(
      document.getElementById("myPerformanceChart"),
      {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Items Processed",
              backgroundColor: ownColor,
              borderColor: ownColor,
              data: []
            },
            {
              label: "Team Average",
              backgroundColor: "rgb(98, 142, 153)",
              borderColor: "rgb(98, 142, 153)",
              data: []
            }
          ]
        },
        options: {
          plugins: {
            legend: { position: "bottom", align: "start" },
            tooltips: {
              callbacks: {
                label(tooltipItem) {
                  return tooltipItem.yLabel;
                }
              }
            }
          }
        }
      }
    );
    teamPerformanceChart = new Chart(
      document.getElementById("teamPerformanceChart"),
      {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Items Processed",
              backgroundColor: "rgb(98, 142, 153)",
              borderColor: "rgb(98, 142, 153)",
              data: []
            }
          ]
        },
        options: {
          plugins: {
            legend: { display: false },
            tooltips: {
              callbacks: {
                label(tooltipItem) {
                  return tooltipItem.yLabel;
                }
              }
            }
          }
        }
      }
    );
    if ($user.IS_SUPER_USER == "Y") {
      issuesChart = new Chart(
        document.getElementById("issuesChart"),
        {
          type: "bar",
          data: {
            labels: [],
            datasets: [
              {
                label: "Boxes affected",
                backgroundColor: "rgb(98, 142, 153)",
                borderColor: "rgb(98, 142, 153)",
                data: []
              }
            ]
          },
          options: {
            indexAxis: "y",
            plugins: {
              legend: { display: false },
              tooltips: {
                callbacks: {
                  label(tooltipItem) {
                    return tooltipItem.yLabel;
                  }
                }
              }
            }
          }
        }
      );
    }
  };
  const click_handler = () => set_store_value(screen, $screen = "expandMyPerformance", $screen);
  const click_handler_1 = () => set_store_value(screen, $screen = "expandTeamPerformance", $screen);
  const click_handler_2 = () => set_store_value(screen, $screen = "expandIssues", $screen);
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 1) {
      updateCharts();
    }
  };
  return [$insights, $user, $screen, click_handler, click_handler_1, click_handler_2];
}
class Insights extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$i, create_fragment$i, safe_not_equal, {});
  }
}
function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
  const o = +getComputedStyle(node).opacity;
  return {
    delay,
    duration,
    easing,
    css: (t) => `opacity: ${t * o}`
  };
}
const MissingStorePrompt_svelte_svelte_type_style_lang = "";
function create_fragment$h(ctx) {
  let main;
  let h2;
  let t1;
  let div;
  let button0;
  let t3;
  let button1;
  let main_intro;
  let mounted;
  let dispose;
  return {
    c() {
      main = element("main");
      h2 = element("h2");
      h2.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Customer not set up!`;
      t1 = space();
      div = element("div");
      button0 = element("button");
      button0.textContent = "Cancel";
      t3 = space();
      button1 = element("button");
      button1.textContent = "Put on HOLD";
      attr(button1, "class", "hotbtn");
      attr(div, "class", "prompt-buttons svelte-1e8liqq");
      attr(main, "class", "svelte-1e8liqq");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, h2);
      append(main, t1);
      append(main, div);
      append(div, button0);
      append(div, t3);
      append(div, button1);
      if (!mounted) {
        dispose = [
          listen(button0, "click", prevent_default(ctx[0])),
          listen(button1, "click", prevent_default(ctx[1]))
        ];
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (!main_intro) {
        add_render_callback(() => {
          main_intro = create_in_transition(main, fade, {});
          main_intro.start();
        });
      }
    },
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$h($$self, $$props, $$invalidate) {
  let $prompt;
  let $container;
  let $user;
  component_subscribe($$self, prompt, ($$value) => $$invalidate(2, $prompt = $$value));
  component_subscribe($$self, container, ($$value) => $$invalidate(3, $container = $$value));
  component_subscribe($$self, user, ($$value) => $$invalidate(4, $user = $$value));
  const clickCancel = () => {
    set_store_value(container, $container = null, $container);
    set_store_value(prompt, $prompt = null, $prompt);
  };
  const clickConfirm = () => {
    console.log("Store NF, PUT on hold clicked");
    apex.server.process("HoldContainer", {
      x01: $container.id,
      x02: "STORE NOT FOUND",
      x03: $user.SITE
    });
    set_store_value(container, $container = null, $container);
    set_store_value(prompt, $prompt = null, $prompt);
  };
  return [clickCancel, clickConfirm];
}
class MissingStorePrompt extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$h, create_fragment$h, safe_not_equal, {});
  }
}
const MissingDataPrompt_svelte_svelte_type_style_lang = "";
function create_if_block$8(ctx) {
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      button.textContent = "Continue Anyway";
    },
    m(target, anchor) {
      insert(target, button, anchor);
      if (!mounted) {
        dispose = listen(button, "click", prevent_default(ctx[2]));
        mounted = true;
      }
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$g(ctx) {
  let main;
  let h2;
  let t3;
  let div;
  let button0;
  let t5;
  let t6;
  let button1;
  let main_intro;
  let mounted;
  let dispose;
  let if_block = ctx[0].IS_SUPER_USER == "Y" && create_if_block$8(ctx);
  return {
    c() {
      main = element("main");
      h2 = element("h2");
      h2.innerHTML = `<i class="fas fa-exclamation-triangle"></i> There is product / price
        <b>data missing</b> for this container...`;
      t3 = space();
      div = element("div");
      button0 = element("button");
      button0.textContent = "Cancel";
      t5 = space();
      if (if_block)
        if_block.c();
      t6 = space();
      button1 = element("button");
      button1.textContent = "Put on HOLD";
      attr(button1, "class", "hotbtn");
      attr(div, "class", "prompt-buttons svelte-1e8liqq");
      attr(main, "class", "svelte-1e8liqq");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, h2);
      append(main, t3);
      append(main, div);
      append(div, button0);
      append(div, t5);
      if (if_block)
        if_block.m(div, null);
      append(div, t6);
      append(div, button1);
      if (!mounted) {
        dispose = [
          listen(button0, "click", prevent_default(ctx[1])),
          listen(button1, "click", prevent_default(ctx[3]))
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (ctx2[0].IS_SUPER_USER == "Y") {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$8(ctx2);
          if_block.c();
          if_block.m(div, t6);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i(local) {
      if (!main_intro) {
        add_render_callback(() => {
          main_intro = create_in_transition(main, fade, {});
          main_intro.start();
        });
      }
    },
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      if (if_block)
        if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$g($$self, $$props, $$invalidate) {
  let $container;
  let $user;
  let $missingPrices;
  let $missingProducts;
  component_subscribe($$self, container, ($$value) => $$invalidate(4, $container = $$value));
  component_subscribe($$self, user, ($$value) => $$invalidate(0, $user = $$value));
  component_subscribe($$self, missingPrices, ($$value) => $$invalidate(5, $missingPrices = $$value));
  component_subscribe($$self, missingProducts, ($$value) => $$invalidate(6, $missingProducts = $$value));
  const clickCancel = () => {
    set_store_value(container, $container = null, $container);
    set_store_value(missingPrices, $missingPrices = [], $missingPrices);
    set_store_value(missingProducts, $missingProducts = [], $missingProducts);
  };
  const clickContinue = () => {
    console.log("continue clicked");
    set_store_value(missingPrices, $missingPrices = [], $missingPrices);
    set_store_value(missingProducts, $missingProducts = [], $missingProducts);
  };
  const clickConfirm = () => {
    console.log("Store Price/product, PUT on hold clicked");
    $missingProducts.forEach((l) => {
      apex.server.process("HoldContainer", {
        x01: l.CONTAINER_ID,
        x02: "SKU NOT FOUND",
        x03: $user.SITE,
        x04: l.SKU_CODE,
        x05: l.QTY_ORDERED
      });
    });
    $missingPrices.forEach((l) => {
      apex.server.process("HoldContainer", {
        x01: l.CONTAINER_ID,
        x02: "PRICE NOT FOUND",
        x03: $user.SITE,
        x04: l.SKU_CODE,
        x05: l.QTY_ORDERED
      });
    });
    apex.message.showPageSuccess("Container " + $container.id + " put on HOLD!");
    set_store_value(container, $container = null, $container);
  };
  return [$user, clickCancel, clickContinue, clickConfirm];
}
class MissingDataPrompt extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$g, create_fragment$g, safe_not_equal, {});
  }
}
const ContainerHeader_svelte_svelte_type_style_lang = "";
function create_if_block$7(ctx) {
  let button0;
  let t1;
  let button1;
  let mounted;
  let dispose;
  return {
    c() {
      button0 = element("button");
      button0.innerHTML = `Delete <i class="fa-solid fa-trash"></i>`;
      t1 = space();
      button1 = element("button");
      button1.innerHTML = `Reset <i class="fa-solid fa-undo"></i>`;
    },
    m(target, anchor) {
      insert(target, button0, anchor);
      insert(target, t1, anchor);
      insert(target, button1, anchor);
      if (!mounted) {
        dispose = [
          listen(button0, "click", prevent_default(ctx[2])),
          listen(button1, "click", prevent_default(ctx[3]))
        ];
        mounted = true;
      }
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(button0);
      if (detaching)
        detach(t1);
      if (detaching)
        detach(button1);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_fragment$f(ctx) {
  var _a;
  let main;
  let h1;
  let i0;
  let t0;
  let t1_value = ctx[0].id + "";
  let t1;
  let t2;
  let h20;
  let b;
  let t4_value = ctx[0].store + "";
  let t4;
  let t5;
  let h21;
  let t6_value = ((_a = ctx[0].qtyLabelled) != null ? _a : 0) + "";
  let t6;
  let t7;
  let t8_value = ctx[0].total + "";
  let t8;
  let t9;
  let small;
  let t11;
  let div;
  let t12;
  let button;
  let mounted;
  let dispose;
  let if_block = ctx[1].IS_SUPER_USER == "Y" && create_if_block$7(ctx);
  return {
    c() {
      main = element("main");
      h1 = element("h1");
      i0 = element("i");
      t0 = space();
      t1 = text(t1_value);
      t2 = space();
      h20 = element("h2");
      b = element("b");
      b.textContent = "Store: ";
      t4 = text(t4_value);
      t5 = space();
      h21 = element("h2");
      t6 = text(t6_value);
      t7 = text(" / ");
      t8 = text(t8_value);
      t9 = space();
      small = element("small");
      small.textContent = "Pcs Labelled";
      t11 = space();
      div = element("div");
      if (if_block)
        if_block.c();
      t12 = space();
      button = element("button");
      button.innerHTML = `Finish <i class="fa-solid fa-check"></i>`;
      attr(i0, "class", "fas fa-box");
      attr(h20, "class", "store svelte-1m0yd0m");
      attr(div, "class", "buttons svelte-1m0yd0m");
      attr(main, "class", "svelte-1m0yd0m");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, h1);
      append(h1, i0);
      append(h1, t0);
      append(h1, t1);
      append(main, t2);
      append(main, h20);
      append(h20, b);
      append(h20, t4);
      append(main, t5);
      append(main, h21);
      append(h21, t6);
      append(h21, t7);
      append(h21, t8);
      append(h21, t9);
      append(h21, small);
      append(main, t11);
      append(main, div);
      if (if_block)
        if_block.m(div, null);
      append(div, t12);
      append(div, button);
      if (!mounted) {
        dispose = listen(button, "click", prevent_default(ctx[4]));
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      var _a2;
      if (dirty & 1 && t1_value !== (t1_value = ctx2[0].id + ""))
        set_data(t1, t1_value);
      if (dirty & 1 && t4_value !== (t4_value = ctx2[0].store + ""))
        set_data(t4, t4_value);
      if (dirty & 1 && t6_value !== (t6_value = ((_a2 = ctx2[0].qtyLabelled) != null ? _a2 : 0) + ""))
        set_data(t6, t6_value);
      if (dirty & 1 && t8_value !== (t8_value = ctx2[0].total + ""))
        set_data(t8, t8_value);
      if (ctx2[1].IS_SUPER_USER == "Y") {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$7(ctx2);
          if_block.c();
          if_block.m(div, t12);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      if (if_block)
        if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function instance$f($$self, $$props, $$invalidate) {
  let $prompt;
  let $container;
  let $user;
  component_subscribe($$self, prompt, ($$value) => $$invalidate(5, $prompt = $$value));
  component_subscribe($$self, container, ($$value) => $$invalidate(0, $container = $$value));
  component_subscribe($$self, user, ($$value) => $$invalidate(1, $user = $$value));
  const clickDelete = (e) => set_store_value(prompt, $prompt = "deleteContainer", $prompt);
  const clickReset = (e) => set_store_value(prompt, $prompt = "resetContainer", $prompt);
  const clickFinish = (e) => {
    if ($container.total == $container.qtyLabelled) {
      apex.server.process("FinishContainer", { x01: $container.id, x02: $user.SITE });
      apex.message.showPageSuccess("Container " + $container.id + " finished!");
      set_store_value(container, $container = null, $container);
    } else {
      set_store_value(prompt, $prompt = "finishShortage", $prompt);
    }
  };
  return [$container, $user, clickDelete, clickReset, clickFinish];
}
class ContainerHeader extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$f, create_fragment$f, safe_not_equal, {});
  }
}
const BarcodeScan_svelte_svelte_type_style_lang = "";
function create_if_block_2$1(ctx) {
  let b;
  return {
    c() {
      b = element("b");
      b.textContent = "RFID";
      set_style(b, "color", "green");
    },
    m(target, anchor) {
      insert(target, b, anchor);
    },
    d(detaching) {
      if (detaching)
        detach(b);
    }
  };
}
function create_if_block_1$2(ctx) {
  let div;
  let label;
  let t1;
  let input_1;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      label = element("label");
      label.textContent = "Print On Demand";
      t1 = space();
      input_1 = element("input");
      attr(label, "for", "prnt");
      attr(input_1, "type", "checkbox");
      attr(input_1, "class", "svelte-s1qst3");
      attr(div, "class", "pod svelte-s1qst3");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, label);
      append(div, t1);
      append(div, input_1);
      input_1.checked = ctx[0];
      if (!mounted) {
        dispose = listen(input_1, "change", ctx[6]);
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 1) {
        input_1.checked = ctx2[0];
      }
    },
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      dispose();
    }
  };
}
function create_if_block$6(ctx) {
  let p;
  let i;
  let t;
  return {
    c() {
      p = element("p");
      i = element("i");
      t = text(ctx[1]);
      attr(i, "class", "fas fa-exclamation-circle");
      set_style(i, "color", "red");
      attr(p, "class", "err-msg");
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, i);
      append(p, t);
    },
    p(ctx2, dirty) {
      if (dirty & 2)
        set_data(t, ctx2[1]);
    },
    d(detaching) {
      if (detaching)
        detach(p);
    }
  };
}
function create_fragment$e(ctx) {
  let main;
  let div;
  let h2;
  let i0;
  let t0;
  let i1;
  let t2;
  let t3;
  let t4;
  let input_1;
  let t5;
  let mounted;
  let dispose;
  let if_block0 = ctx[4].printType == "R" && create_if_block_2$1();
  let if_block1 = ctx[3].IS_SUPER_USER == "Y" && create_if_block_1$2(ctx);
  let if_block2 = ctx[1] && create_if_block$6(ctx);
  return {
    c() {
      main = element("main");
      div = element("div");
      h2 = element("h2");
      i0 = element("i");
      t0 = space();
      i1 = element("i");
      i1.textContent = "Scan Item Barcode";
      t2 = space();
      if (if_block0)
        if_block0.c();
      t3 = space();
      if (if_block1)
        if_block1.c();
      t4 = space();
      input_1 = element("input");
      t5 = space();
      if (if_block2)
        if_block2.c();
      attr(i0, "class", "fas fa-tag");
      attr(div, "class", "title-bar svelte-s1qst3");
      attr(input_1, "type", "text");
      attr(input_1, "class", "txtbox");
      attr(main, "class", "svelte-s1qst3");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, div);
      append(div, h2);
      append(h2, i0);
      append(h2, t0);
      append(h2, i1);
      append(h2, t2);
      if (if_block0)
        if_block0.m(h2, null);
      append(div, t3);
      if (if_block1)
        if_block1.m(div, null);
      append(main, t4);
      append(main, input_1);
      ctx[7](input_1);
      append(main, t5);
      if (if_block2)
        if_block2.m(main, null);
      if (!mounted) {
        dispose = listen(input_1, "keydown", ctx[5]);
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (ctx2[4].printType == "R") {
        if (if_block0)
          ;
        else {
          if_block0 = create_if_block_2$1();
          if_block0.c();
          if_block0.m(h2, null);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (ctx2[3].IS_SUPER_USER == "Y") {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_1$2(ctx2);
          if_block1.c();
          if_block1.m(div, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (ctx2[1]) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block$6(ctx2);
          if_block2.c();
          if_block2.m(main, null);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      ctx[7](null);
      if (if_block2)
        if_block2.d();
      mounted = false;
      dispose();
    }
  };
}
function instance$e($$self, $$props, $$invalidate) {
  let $user;
  let $container;
  let $prompt;
  let $insights;
  component_subscribe($$self, user, ($$value) => $$invalidate(3, $user = $$value));
  component_subscribe($$self, container, ($$value) => $$invalidate(4, $container = $$value));
  component_subscribe($$self, prompt, ($$value) => $$invalidate(8, $prompt = $$value));
  component_subscribe($$self, insights, ($$value) => $$invalidate(9, $insights = $$value));
  let printOnDemand = false;
  let errorMsg;
  let input;
  onMount(() => input.focus());
  const scan = (e) => {
    if (e.keyCode == 13 || e.keyCode == 9) {
      e.preventDefault();
      $$invalidate(1, errorMsg = null);
      var printRFID = e.target.value.startsWith("RFID");
      var bc = e.target.value.replace("RFID", "");
      e.target.value = "";
      e.target.focus();
      if (bc.length < 12 || bc.length > 13) {
        $$invalidate(1, errorMsg = "Invalid barcode!");
        return;
      }
      if (printOnDemand) {
        $$invalidate(0, printOnDemand = false);
      } else {
        var line = $container.lines.find((l) => l.EAN_CODE == bc || l.UPC_CODE == bc);
        if (!line) {
          set_store_value(prompt, $prompt = { name: "tooMuch" }, $prompt);
          return;
        }
        if (line.QTY_FINISHED >= line.QTY_ORDERED) {
          set_store_value(prompt, $prompt = { name: "tooMuch", sku: line.SKU_CODE }, $prompt);
          return;
        }
        line.QTY_FINISHED++;
        set_store_value(insights, $insights.labelledSinceUpdate++, $insights);
        set_store_value(container, $container.qtyLabelled = $container.lines.reduce((a, c) => a + c.QTY_FINISHED, 0), $container);
      }
      var ip = printRFID ? $user.RFID_IP : $user.ZEBRA_IP;
      if (!ip || ip == "0.0.0.0") {
        set_store_value(prompt, $prompt = "printerNotSet", $prompt);
        return;
      }
      apex.server.process(
        "PrintLabel",
        {
          x01: bc,
          x02: $container.id,
          x03: $container.store,
          x04: printRFID ? "R" : "Z",
          x05: ip,
          x06: $user.SITE
        },
        {
          success: (res) => {
            console.log(res);
          }
        }
      );
    }
  };
  function input_1_change_handler() {
    printOnDemand = this.checked;
    $$invalidate(0, printOnDemand);
  }
  function input_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      input = $$value;
      $$invalidate(2, input);
    });
  }
  return [
    printOnDemand,
    errorMsg,
    input,
    $user,
    $container,
    scan,
    input_1_change_handler,
    input_1_binding
  ];
}
class BarcodeScan extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$e, create_fragment$e, safe_not_equal, {});
  }
}
const ContainerLines_svelte_svelte_type_style_lang = "";
function get_each_context$3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[1] = list[i];
  return child_ctx;
}
function create_each_block$3(ctx) {
  var _a, _b;
  let div7;
  let div0;
  let b0;
  let t0_value = ctx[1].SKU_CODE + "";
  let t0;
  let t1;
  let div1;
  let t2_value = ctx[1].STYLE + "";
  let t2;
  let t3;
  let div2;
  let t4_value = ctx[1].COLOUR_CODE + "";
  let t4;
  let t5;
  let div3;
  let t6_value = ctx[1].SIZE_CODE + "";
  let t6;
  let t7;
  let div4;
  let t8_value = ctx[1].QTY_ORDERED + "";
  let t8;
  let t9;
  let div5;
  let t10_value = ((_a = ctx[1].QTY_FINISHED) != null ? _a : 0) + "";
  let t10;
  let t11;
  let div6;
  let b1;
  let t12_value = ((_b = ctx[1].MSG) != null ? _b : "") + "";
  let t12;
  let t13;
  let div7_class_value;
  return {
    c() {
      div7 = element("div");
      div0 = element("div");
      b0 = element("b");
      t0 = text(t0_value);
      t1 = space();
      div1 = element("div");
      t2 = text(t2_value);
      t3 = space();
      div2 = element("div");
      t4 = text(t4_value);
      t5 = space();
      div3 = element("div");
      t6 = text(t6_value);
      t7 = space();
      div4 = element("div");
      t8 = text(t8_value);
      t9 = space();
      div5 = element("div");
      t10 = text(t10_value);
      t11 = space();
      div6 = element("div");
      b1 = element("b");
      t12 = text(t12_value);
      t13 = space();
      attr(div0, "class", "cell svelte-1sl3ocf");
      attr(div1, "class", "cell svelte-1sl3ocf");
      attr(div2, "class", "cell svelte-1sl3ocf");
      attr(div3, "class", "cell svelte-1sl3ocf");
      attr(div4, "class", "cell big svelte-1sl3ocf");
      attr(div5, "class", "cell big svelte-1sl3ocf");
      attr(div6, "class", "cell svelte-1sl3ocf");
      set_style(div6, "color", "red");
      attr(div7, "class", div7_class_value = "tblrow " + (ctx[1].MSG ? "red" : ctx[1].QTY_ORDERED == ctx[1].QTY_FINISHED ? "green" : ctx[1].QTY_ORDERED < ctx[1].QTY_FINISHED ? "yellow" : "") + " svelte-1sl3ocf");
    },
    m(target, anchor) {
      insert(target, div7, anchor);
      append(div7, div0);
      append(div0, b0);
      append(b0, t0);
      append(div7, t1);
      append(div7, div1);
      append(div1, t2);
      append(div7, t3);
      append(div7, div2);
      append(div2, t4);
      append(div7, t5);
      append(div7, div3);
      append(div3, t6);
      append(div7, t7);
      append(div7, div4);
      append(div4, t8);
      append(div7, t9);
      append(div7, div5);
      append(div5, t10);
      append(div7, t11);
      append(div7, div6);
      append(div6, b1);
      append(b1, t12);
      append(div7, t13);
    },
    p(ctx2, dirty) {
      var _a2, _b2;
      if (dirty & 1 && t0_value !== (t0_value = ctx2[1].SKU_CODE + ""))
        set_data(t0, t0_value);
      if (dirty & 1 && t2_value !== (t2_value = ctx2[1].STYLE + ""))
        set_data(t2, t2_value);
      if (dirty & 1 && t4_value !== (t4_value = ctx2[1].COLOUR_CODE + ""))
        set_data(t4, t4_value);
      if (dirty & 1 && t6_value !== (t6_value = ctx2[1].SIZE_CODE + ""))
        set_data(t6, t6_value);
      if (dirty & 1 && t8_value !== (t8_value = ctx2[1].QTY_ORDERED + ""))
        set_data(t8, t8_value);
      if (dirty & 1 && t10_value !== (t10_value = ((_a2 = ctx2[1].QTY_FINISHED) != null ? _a2 : 0) + ""))
        set_data(t10, t10_value);
      if (dirty & 1 && t12_value !== (t12_value = ((_b2 = ctx2[1].MSG) != null ? _b2 : "") + ""))
        set_data(t12, t12_value);
      if (dirty & 1 && div7_class_value !== (div7_class_value = "tblrow " + (ctx2[1].MSG ? "red" : ctx2[1].QTY_ORDERED == ctx2[1].QTY_FINISHED ? "green" : ctx2[1].QTY_ORDERED < ctx2[1].QTY_FINISHED ? "yellow" : "") + " svelte-1sl3ocf")) {
        attr(div7, "class", div7_class_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(div7);
    }
  };
}
function create_fragment$d(ctx) {
  let main;
  let div6;
  let t11;
  let each_value = ctx[0].lines;
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
  }
  return {
    c() {
      main = element("main");
      div6 = element("div");
      div6.innerHTML = `<div class="cell header svelte-1sl3ocf">SKU</div> 
        <div class="cell header svelte-1sl3ocf">Description</div> 
        <div class="cell header svelte-1sl3ocf">Colour</div> 
        <div class="cell header svelte-1sl3ocf">Size</div> 
        <div class="cell header svelte-1sl3ocf">Qty Expected</div> 
        <div class="cell header svelte-1sl3ocf">Qty Labelled</div>`;
      t11 = space();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div6, "class", "tblrow svelte-1sl3ocf");
      attr(main, "class", "svelte-1sl3ocf");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, div6);
      append(main, t11);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(main, null);
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1) {
        each_value = ctx2[0].lines;
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$3(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$3(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(main, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance$d($$self, $$props, $$invalidate) {
  let $container;
  component_subscribe($$self, container, ($$value) => $$invalidate(0, $container = $$value));
  return [$container];
}
class ContainerLines extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$d, create_fragment$d, safe_not_equal, {});
  }
}
const DeleteContainerPrompt_svelte_svelte_type_style_lang = "";
function create_fragment$c(ctx) {
  let main;
  let h2;
  let t3;
  let div;
  let button0;
  let t5;
  let button1;
  let main_intro;
  let mounted;
  let dispose;
  return {
    c() {
      main = element("main");
      h2 = element("h2");
      h2.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Are you sure you want to <b>delete</b> this container?`;
      t3 = space();
      div = element("div");
      button0 = element("button");
      button0.textContent = "Cancel";
      t5 = space();
      button1 = element("button");
      button1.textContent = "Delete";
      attr(button1, "class", "hotbtn");
      attr(div, "class", "prompt-buttons svelte-1d5pkmm");
      attr(main, "class", "svelte-1d5pkmm");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, h2);
      append(main, t3);
      append(main, div);
      append(div, button0);
      append(div, t5);
      append(div, button1);
      if (!mounted) {
        dispose = [
          listen(button0, "click", prevent_default(ctx[0])),
          listen(button1, "click", prevent_default(ctx[1]))
        ];
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (!main_intro) {
        add_render_callback(() => {
          main_intro = create_in_transition(main, fade, {});
          main_intro.start();
        });
      }
    },
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$c($$self, $$props, $$invalidate) {
  let $prompt;
  let $container;
  let $user;
  component_subscribe($$self, prompt, ($$value) => $$invalidate(2, $prompt = $$value));
  component_subscribe($$self, container, ($$value) => $$invalidate(3, $container = $$value));
  component_subscribe($$self, user, ($$value) => $$invalidate(4, $user = $$value));
  const clickCancel = () => {
    set_store_value(prompt, $prompt = null, $prompt);
  };
  const clickConfirm = () => {
    apex.server.process("DeleteContainer", { x01: $container.id, x02: $user.SITE });
    apex.message.showPageSuccess("Container " + $container.id + " deleted!");
    set_store_value(prompt, $prompt = null, $prompt);
  };
  return [clickCancel, clickConfirm];
}
class DeleteContainerPrompt extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$c, create_fragment$c, safe_not_equal, {});
  }
}
const ResetContainerPrompt_svelte_svelte_type_style_lang = "";
function create_fragment$b(ctx) {
  let main;
  let h2;
  let t3;
  let div;
  let button0;
  let t5;
  let button1;
  let main_intro;
  let mounted;
  let dispose;
  return {
    c() {
      main = element("main");
      h2 = element("h2");
      h2.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Are you sure you want to <b>reset</b> this container?`;
      t3 = space();
      div = element("div");
      button0 = element("button");
      button0.textContent = "Cancel";
      t5 = space();
      button1 = element("button");
      button1.textContent = "Reset";
      attr(button1, "class", "hotbtn");
      attr(div, "class", "prompt-buttons svelte-1d5pkmm");
      attr(main, "class", "svelte-1d5pkmm");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, h2);
      append(main, t3);
      append(main, div);
      append(div, button0);
      append(div, t5);
      append(div, button1);
      if (!mounted) {
        dispose = [
          listen(button0, "click", prevent_default(ctx[0])),
          listen(button1, "click", prevent_default(ctx[1]))
        ];
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (!main_intro) {
        add_render_callback(() => {
          main_intro = create_in_transition(main, fade, {});
          main_intro.start();
        });
      }
    },
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$b($$self, $$props, $$invalidate) {
  let $prompt;
  let $container;
  let $user;
  component_subscribe($$self, prompt, ($$value) => $$invalidate(2, $prompt = $$value));
  component_subscribe($$self, container, ($$value) => $$invalidate(3, $container = $$value));
  component_subscribe($$self, user, ($$value) => $$invalidate(4, $user = $$value));
  const clickCancel = () => {
    set_store_value(prompt, $prompt = null, $prompt);
  };
  const clickConfirm = () => {
    apex.server.process("ResetContainer", { x01: $container.id, x02: $user.SITE }, {
      success: (res) => {
        apex.message.showPageSuccess("Container " + $container.id + " reset!");
      }
    });
    $container.lines.forEach((l) => l.QTY_FINISHED = 0);
    set_store_value(container, $container.qtyLabelled = 0, $container);
    set_store_value(prompt, $prompt = null, $prompt);
  };
  return [clickCancel, clickConfirm];
}
class ResetContainerPrompt extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$b, create_fragment$b, safe_not_equal, {});
  }
}
const FinishShortagePrompt_svelte_svelte_type_style_lang = "";
function create_if_block$5(ctx) {
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      button.textContent = "Finish Anyway";
    },
    m(target, anchor) {
      insert(target, button, anchor);
      if (!mounted) {
        dispose = listen(button, "click", prevent_default(ctx[2]));
        mounted = true;
      }
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$a(ctx) {
  let main;
  let h2;
  let t1;
  let div;
  let button0;
  let t3;
  let t4;
  let button1;
  let main_intro;
  let mounted;
  let dispose;
  let if_block = ctx[0].IS_SUPER_USER == "Y" && create_if_block$5(ctx);
  return {
    c() {
      main = element("main");
      h2 = element("h2");
      h2.innerHTML = `<i class="fas fa-exclamation-triangle"></i> There are items missing from the
        container!`;
      t1 = space();
      div = element("div");
      button0 = element("button");
      button0.textContent = "Cancel";
      t3 = space();
      if (if_block)
        if_block.c();
      t4 = space();
      button1 = element("button");
      button1.textContent = "Put on HOLD";
      attr(button1, "class", "hotbtn");
      attr(div, "class", "prompt-buttons svelte-107ej6u");
      attr(main, "class", "svelte-107ej6u");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, h2);
      append(main, t1);
      append(main, div);
      append(div, button0);
      append(div, t3);
      if (if_block)
        if_block.m(div, null);
      append(div, t4);
      append(div, button1);
      if (!mounted) {
        dispose = [
          listen(button0, "click", prevent_default(ctx[1])),
          listen(button1, "click", prevent_default(ctx[3]))
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (ctx2[0].IS_SUPER_USER == "Y") {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$5(ctx2);
          if_block.c();
          if_block.m(div, t4);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i(local) {
      if (!main_intro) {
        add_render_callback(() => {
          main_intro = create_in_transition(main, fade, {});
          main_intro.start();
        });
      }
    },
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      if (if_block)
        if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$a($$self, $$props, $$invalidate) {
  let $container;
  let $prompt;
  let $user;
  component_subscribe($$self, container, ($$value) => $$invalidate(4, $container = $$value));
  component_subscribe($$self, prompt, ($$value) => $$invalidate(5, $prompt = $$value));
  component_subscribe($$self, user, ($$value) => $$invalidate(0, $user = $$value));
  const clickCancel = () => {
    set_store_value(prompt, $prompt = null, $prompt);
  };
  const clickFinishAnyway = () => {
    apex.server.process("FinishContainer", { x01: $container.id, x02: $user.SITE });
    apex.message.showPageSuccess("Container " + $container.id + " finished!");
    set_store_value(prompt, $prompt = null, $prompt);
    set_store_value(container, $container = null, $container);
  };
  const clickHold = () => {
    $container.lines.forEach((l) => {
      apex.server.process("UpdateQtyFinished", {
        x01: $container.id,
        x02: $user.SITE,
        x03: l.SKU_CODE,
        x04: l.QTY_FINISHED
      });
      if (l.QTY_FINISHED < l.QTY_ORDERED) {
        apex.server.process("HoldContainer", {
          x01: $container.id,
          x02: "MISSING",
          x03: $user.SITE,
          x04: l.SKU_CODE,
          x05: l.QTY_ORDERED - l.QTY_FINISHED
        });
      }
    });
    apex.message.showPageSuccess("Container " + $container.id + " put on HOLD!");
    set_store_value(prompt, $prompt = null, $prompt);
    set_store_value(container, $container = null, $container);
  };
  return [$user, clickCancel, clickFinishAnyway, clickHold];
}
class FinishShortagePrompt extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$a, create_fragment$a, safe_not_equal, {});
  }
}
function create_if_block$4(ctx) {
  let p;
  let i;
  let t0;
  let t1;
  return {
    c() {
      p = element("p");
      i = element("i");
      t0 = space();
      t1 = text(ctx[0]);
      attr(i, "class", "fas fa-exclamation-circle");
      set_style(i, "color", "red");
      attr(p, "class", "err-msg");
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, i);
      append(p, t0);
      append(p, t1);
    },
    p(ctx2, dirty) {
      if (dirty & 1)
        set_data(t1, ctx2[0]);
    },
    d(detaching) {
      if (detaching)
        detach(p);
    }
  };
}
function create_fragment$9(ctx) {
  let main;
  let h2;
  let t2;
  let input_1;
  let t3;
  let main_intro;
  let mounted;
  let dispose;
  let if_block = ctx[0] && create_if_block$4(ctx);
  return {
    c() {
      main = element("main");
      h2 = element("h2");
      h2.innerHTML = `<i class="fas fa-box"></i>  <i>Scan Container Barcode</i>`;
      t2 = space();
      input_1 = element("input");
      t3 = space();
      if (if_block)
        if_block.c();
      attr(input_1, "class", "txtbox");
      attr(input_1, "type", "text");
      attr(main, "class", "cont");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, h2);
      append(main, t2);
      append(main, input_1);
      ctx[3](input_1);
      append(main, t3);
      if (if_block)
        if_block.m(main, null);
      if (!mounted) {
        dispose = listen(input_1, "keydown", ctx[2]);
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (ctx2[0]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$4(ctx2);
          if_block.c();
          if_block.m(main, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i(local) {
      if (!main_intro) {
        add_render_callback(() => {
          main_intro = create_in_transition(main, fade, {});
          main_intro.start();
        });
      }
    },
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      ctx[3](null);
      if (if_block)
        if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function instance$9($$self, $$props, $$invalidate) {
  let $missingPrices;
  let $missingProducts;
  let $container;
  let $prompt;
  component_subscribe($$self, missingPrices, ($$value) => $$invalidate(4, $missingPrices = $$value));
  component_subscribe($$self, missingProducts, ($$value) => $$invalidate(5, $missingProducts = $$value));
  component_subscribe($$self, container, ($$value) => $$invalidate(6, $container = $$value));
  component_subscribe($$self, prompt, ($$value) => $$invalidate(7, $prompt = $$value));
  let errorMsg;
  let input;
  onMount(() => input.focus());
  const containerScanned = (e) => {
    if (e.keyCode == 13 || e.keyCode == 9) {
      e.preventDefault();
      openContainer(e.target.value);
    }
  };
  const openContainer = (containerId) => {
    $$invalidate(0, errorMsg = null);
    set_store_value(missingPrices, $missingPrices = [], $missingPrices);
    set_store_value(missingProducts, $missingProducts = [], $missingProducts);
    apex.server.process("OpenContainer", { x01: containerId }, {
      success: (res) => {
        console.log(res);
        if (!res.data || res.data.length < 1) {
          $$invalidate(0, errorMsg = "Container not found!");
          return;
        }
        set_store_value(
          container,
          $container = {
            id: res.data[0].CONTAINER_ID,
            store: res.data[0].STORE,
            printType: res.data[0].PRINT_TYPE,
            creationDate: res.data[0].CREATION_DATE,
            creationTime: res.data[0].CREATION_TIME,
            total: res.data.reduce((a, c) => a + c.QTY_ORDERED, 0),
            qtyLabelled: res.data.reduce((a, c) => a + c.QTY_FINISHED, 0),
            oldContainer: res.data[0].OLD_CONTAINER,
            lines: res.data
          },
          $container
        );
        if ($container.oldContainer == "Y")
          set_store_value(prompt, $prompt = "oldContainer", $prompt);
        if ($container.lines.find((l) => !l.JURISDICTION))
          set_store_value(prompt, $prompt = "missingStore", $prompt);
        set_store_value(missingProducts, $missingProducts = $container.lines.filter((l) => !l.EAN_CODE), $missingProducts);
        set_store_value(missingPrices, $missingPrices = $container.lines.filter((l) => !l.CURRENT_PRICE), $missingPrices);
        $missingProducts.forEach((m) => m.MSG = "Missing SKU!");
        $missingPrices.forEach((m) => m.MSG = "Missing Price!");
      }
    });
  };
  function input_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      input = $$value;
      $$invalidate(1, input);
    });
  }
  return [errorMsg, input, containerScanned, input_1_binding];
}
class ContainerScan extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$9, create_fragment$9, safe_not_equal, {});
  }
}
const TooMuchPrompt_svelte_svelte_type_style_lang = "";
function create_fragment$8(ctx) {
  let main;
  let h2;
  let i;
  let t0;
  let t1_value = ctx[0].sku ? "You have already labelled the expected number of items for this SKU!" : "This item does not belong in this container!";
  let t1;
  let t2;
  let div;
  let button0;
  let t4;
  let button1;
  let main_intro;
  let mounted;
  let dispose;
  return {
    c() {
      main = element("main");
      h2 = element("h2");
      i = element("i");
      t0 = space();
      t1 = text(t1_value);
      t2 = space();
      div = element("div");
      button0 = element("button");
      button0.textContent = "Cancel";
      t4 = space();
      button1 = element("button");
      button1.textContent = "Mark as Too Much";
      attr(i, "class", "fas fa-exclamation-triangle");
      attr(button1, "class", "hotbtn");
      attr(div, "class", "prompt-buttons svelte-1d5pkmm");
      attr(main, "class", "svelte-1d5pkmm");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, h2);
      append(h2, i);
      append(h2, t0);
      append(h2, t1);
      append(main, t2);
      append(main, div);
      append(div, button0);
      append(div, t4);
      append(div, button1);
      if (!mounted) {
        dispose = [
          listen(button0, "click", prevent_default(ctx[1])),
          listen(button1, "click", prevent_default(ctx[2]))
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1 && t1_value !== (t1_value = ctx2[0].sku ? "You have already labelled the expected number of items for this SKU!" : "This item does not belong in this container!"))
        set_data(t1, t1_value);
    },
    i(local) {
      if (!main_intro) {
        add_render_callback(() => {
          main_intro = create_in_transition(main, fade, {});
          main_intro.start();
        });
      }
    },
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$8($$self, $$props, $$invalidate) {
  let $prompt;
  let $container;
  let $user;
  component_subscribe($$self, prompt, ($$value) => $$invalidate(0, $prompt = $$value));
  component_subscribe($$self, container, ($$value) => $$invalidate(3, $container = $$value));
  component_subscribe($$self, user, ($$value) => $$invalidate(4, $user = $$value));
  const clickCancel = () => {
    set_store_value(prompt, $prompt = null, $prompt);
  };
  const clickConfirm = () => {
    console.log("Store NF, PUT on hold clicked");
    apex.server.process("MarkTooMuch", {
      x01: $container.id,
      x02: $user.SITE,
      x03: $prompt.sku ? $prompt.sku : "WRONG SKU"
    });
    if ($prompt.sku)
      $container.lines.find((l) => l.SKU_CODE == $prompt.sku).MSG = "TOO MUCH";
    set_store_value(prompt, $prompt = null, $prompt);
  };
  return [$prompt, clickCancel, clickConfirm];
}
class TooMuchPrompt extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$8, create_fragment$8, safe_not_equal, {});
  }
}
const PrinterSettings_svelte_svelte_type_style_lang = "";
function get_each_context$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[10] = list[i];
  return child_ctx;
}
function get_each_context_1$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[10] = list[i];
  return child_ctx;
}
function create_each_block_1$1(ctx) {
  let option;
  let t_value = ctx[10].PRINTER_NAME + "";
  let t;
  let option_value_value;
  return {
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = option_value_value = ctx[10];
      option.value = option.__value;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p(ctx2, dirty) {
      if (dirty & 1 && t_value !== (t_value = ctx2[10].PRINTER_NAME + ""))
        set_data(t, t_value);
      if (dirty & 1 && option_value_value !== (option_value_value = ctx2[10])) {
        option.__value = option_value_value;
        option.value = option.__value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
function create_each_block$2(ctx) {
  let option;
  let t_value = ctx[10].PRINTER_NAME + "";
  let t;
  let option_value_value;
  return {
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = option_value_value = ctx[10];
      option.value = option.__value;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p(ctx2, dirty) {
      if (dirty & 1 && t_value !== (t_value = ctx2[10].PRINTER_NAME + ""))
        set_data(t, t_value);
      if (dirty & 1 && option_value_value !== (option_value_value = ctx2[10])) {
        option.__value = option_value_value;
        option.value = option.__value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
function create_fragment$7(ctx) {
  let main;
  let div0;
  let t0;
  let h2;
  let t2;
  let div2;
  let div1;
  let h30;
  let t4;
  let select0;
  let option0;
  let t5_value = ctx[1].PRINTER_NAME + "";
  let t5;
  let t6;
  let p0;
  let i2;
  let b0;
  let t8_value = ctx[1].PRINTER_IP + "";
  let t8;
  let t9;
  let div4;
  let div3;
  let h31;
  let t11;
  let select1;
  let option1;
  let t12_value = ctx[2].PRINTER_NAME + "";
  let t12;
  let t13;
  let p1;
  let i3;
  let b1;
  let t15_value = ctx[2].PRINTER_IP + "";
  let t15;
  let t16;
  let div5;
  let button0;
  let t18;
  let button1;
  let main_intro;
  let mounted;
  let dispose;
  let each_value_1 = ctx[0].filter(func);
  let each_blocks_1 = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
  }
  let each_value = ctx[0].filter(func_1);
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
  }
  return {
    c() {
      main = element("main");
      div0 = element("div");
      div0.innerHTML = `<i class="fas fa-times"></i>`;
      t0 = space();
      h2 = element("h2");
      h2.innerHTML = `<i class="fas fa-print"></i> Printer Settings`;
      t2 = space();
      div2 = element("div");
      div1 = element("div");
      h30 = element("h3");
      h30.textContent = "Zebra Printer";
      t4 = space();
      select0 = element("select");
      option0 = element("option");
      t5 = text(t5_value);
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].c();
      }
      t6 = space();
      p0 = element("p");
      i2 = element("i");
      b0 = element("b");
      b0.textContent = "IP Address: ";
      t8 = text(t8_value);
      t9 = space();
      div4 = element("div");
      div3 = element("div");
      h31 = element("h3");
      h31.textContent = "RFID Printer";
      t11 = space();
      select1 = element("select");
      option1 = element("option");
      t12 = text(t12_value);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t13 = space();
      p1 = element("p");
      i3 = element("i");
      b1 = element("b");
      b1.textContent = "IP Address: ";
      t15 = text(t15_value);
      t16 = space();
      div5 = element("div");
      button0 = element("button");
      button0.innerHTML = `Close <i class="fas fa-times"></i>`;
      t18 = space();
      button1 = element("button");
      button1.innerHTML = `Save <i class="fas fa-save"></i>`;
      attr(div0, "class", "icon-btn close-btn");
      attr(h2, "class", "svelte-q2cvwp");
      option0.__value = ctx[1];
      option0.value = option0.__value;
      attr(select0, "class", "svelte-q2cvwp");
      if (ctx[1] === void 0)
        add_render_callback(() => ctx[7].call(select0));
      attr(div1, "class", "w1 svelte-q2cvwp");
      attr(div2, "class", "printer svelte-q2cvwp");
      option1.__value = ctx[2];
      option1.value = option1.__value;
      option1.selected = true;
      attr(select1, "class", "svelte-q2cvwp");
      if (ctx[2] === void 0)
        add_render_callback(() => ctx[8].call(select1));
      attr(div3, "class", "w1 svelte-q2cvwp");
      attr(div4, "class", "printer svelte-q2cvwp");
      attr(button1, "class", "hotbtn");
      attr(div5, "class", "buttons svelte-q2cvwp");
      attr(main, "class", "cont");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, div0);
      append(main, t0);
      append(main, h2);
      append(main, t2);
      append(main, div2);
      append(div2, div1);
      append(div1, h30);
      append(div1, t4);
      append(div1, select0);
      append(select0, option0);
      append(option0, t5);
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].m(select0, null);
      }
      select_option(select0, ctx[1]);
      append(div2, t6);
      append(div2, p0);
      append(p0, i2);
      append(i2, b0);
      append(i2, t8);
      append(main, t9);
      append(main, div4);
      append(div4, div3);
      append(div3, h31);
      append(div3, t11);
      append(div3, select1);
      append(select1, option1);
      append(option1, t12);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(select1, null);
      }
      select_option(select1, ctx[2]);
      append(div4, t13);
      append(div4, p1);
      append(p1, i3);
      append(i3, b1);
      append(i3, t15);
      append(main, t16);
      append(main, div5);
      append(div5, button0);
      append(div5, t18);
      append(div5, button1);
      if (!mounted) {
        dispose = [
          listen(div0, "click", ctx[6]),
          listen(select0, "change", ctx[7]),
          listen(select1, "change", ctx[8]),
          listen(button0, "click", prevent_default(ctx[4])),
          listen(button1, "click", prevent_default(ctx[5]))
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 2 && t5_value !== (t5_value = ctx2[1].PRINTER_NAME + ""))
        set_data(t5, t5_value);
      if (dirty & 3) {
        option0.__value = ctx2[1];
        option0.value = option0.__value;
      }
      if (dirty & 1) {
        each_value_1 = ctx2[0].filter(func);
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1$1(ctx2, each_value_1, i);
          if (each_blocks_1[i]) {
            each_blocks_1[i].p(child_ctx, dirty);
          } else {
            each_blocks_1[i] = create_each_block_1$1(child_ctx);
            each_blocks_1[i].c();
            each_blocks_1[i].m(select0, null);
          }
        }
        for (; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].d(1);
        }
        each_blocks_1.length = each_value_1.length;
      }
      if (dirty & 3) {
        select_option(select0, ctx2[1]);
      }
      if (dirty & 2 && t8_value !== (t8_value = ctx2[1].PRINTER_IP + ""))
        set_data(t8, t8_value);
      if (dirty & 4 && t12_value !== (t12_value = ctx2[2].PRINTER_NAME + ""))
        set_data(t12, t12_value);
      if (dirty & 5) {
        option1.__value = ctx2[2];
        option1.value = option1.__value;
      }
      if (dirty & 1) {
        each_value = ctx2[0].filter(func_1);
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$2(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select1, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty & 5) {
        select_option(select1, ctx2[2]);
      }
      if (dirty & 4 && t15_value !== (t15_value = ctx2[2].PRINTER_IP + ""))
        set_data(t15, t15_value);
    },
    i(local) {
      if (!main_intro) {
        add_render_callback(() => {
          main_intro = create_in_transition(main, fade, {});
          main_intro.start();
        });
      }
    },
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      destroy_each(each_blocks_1, detaching);
      destroy_each(each_blocks, detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
const func = (p) => p.TYPE == "Z";
const func_1 = (p) => p.TYPE == "R";
function instance$7($$self, $$props, $$invalidate) {
  let $screen;
  let $user;
  component_subscribe($$self, screen, ($$value) => $$invalidate(3, $screen = $$value));
  component_subscribe($$self, user, ($$value) => $$invalidate(9, $user = $$value));
  let availablePrinters = [];
  let z = {
    PRINTER_NAME: $user.ZEBRA_NAME,
    PRINTER_IP: $user.ZEBRA_IP
  };
  let r = {
    PRINTER_NAME: $user.RFID_NAME,
    PRINTER_IP: $user.RFID_IP
  };
  apex.server.process("GetPrinters", { x01: $user.SITE }, {
    success: (res) => {
      $$invalidate(0, availablePrinters = res.Printers);
    }
  });
  const clickCancel = () => {
    set_store_value(screen, $screen = null, $screen);
  };
  const clickSave = () => {
    set_store_value(user, $user.ZEBRA_NAME = z.PRINTER_NAME, $user);
    set_store_value(user, $user.ZEBRA_IP = z.PRINTER_IP, $user);
    set_store_value(user, $user.RFID_NAME = r.PRINTER_NAME, $user);
    set_store_value(user, $user.RFID_IP = r.PRINTER_IP, $user);
    apex.server.process("SavePrinter", { x01: $user.ZEBRA_NAME, x02: "Z" });
    apex.server.process("SavePrinter", { x01: $user.RFID_NAME, x02: "R" });
    set_store_value(screen, $screen = null, $screen);
  };
  const click_handler = () => set_store_value(screen, $screen = null, $screen);
  function select0_change_handler() {
    z = select_value(this);
    $$invalidate(1, z);
    $$invalidate(0, availablePrinters);
  }
  function select1_change_handler() {
    r = select_value(this);
    $$invalidate(2, r);
    $$invalidate(0, availablePrinters);
  }
  return [
    availablePrinters,
    z,
    r,
    $screen,
    clickCancel,
    clickSave,
    click_handler,
    select0_change_handler,
    select1_change_handler
  ];
}
class PrinterSettings extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$7, create_fragment$7, safe_not_equal, {});
  }
}
const ExpandIssues_svelte_svelte_type_style_lang = "";
function create_fragment$6(ctx) {
  let main;
  let div0;
  let t0;
  let h2;
  let t2;
  let div1;
  let main_intro;
  let mounted;
  let dispose;
  return {
    c() {
      main = element("main");
      div0 = element("div");
      div0.innerHTML = `<i class="fas fa-times"></i>`;
      t0 = space();
      h2 = element("h2");
      h2.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Issues`;
      t2 = space();
      div1 = element("div");
      attr(div0, "class", "icon-btn close-btn");
      attr(h2, "class", "svelte-1hq1lt0");
      attr(div1, "id", "rp-cont");
      attr(main, "class", "cont svelte-1hq1lt0");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, div0);
      append(main, t0);
      append(main, h2);
      append(main, t2);
      append(main, div1);
      if (!mounted) {
        dispose = listen(div0, "click", ctx[1]);
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (!main_intro) {
        add_render_callback(() => {
          main_intro = create_in_transition(main, fade, {});
          main_intro.start();
        });
      }
    },
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      mounted = false;
      dispose();
    }
  };
}
function instance$6($$self, $$props, $$invalidate) {
  let $screen;
  component_subscribe($$self, screen, ($$value) => $$invalidate(0, $screen = $$value));
  onMount(() => {
    jQuery("#rp-cont").append(jQuery("#rpIss").detach());
    apex.region("rpIss").refresh();
  });
  onDestroy(() => {
    jQuery("#rpIssTray").append(jQuery("#rpIss").detach());
  });
  const click_handler = () => set_store_value(screen, $screen = null, $screen);
  return [$screen, click_handler];
}
class ExpandIssues extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$6, create_fragment$6, safe_not_equal, {});
  }
}
const DatePicker_svelte_svelte_type_style_lang = "";
function create_fragment$5(ctx) {
  let main;
  let input;
  let mounted;
  let dispose;
  return {
    c() {
      main = element("main");
      input = element("input");
      attr(input, "type", "date");
      attr(input, "class", "svelte-jwhp7g");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, input);
      set_input_value(input, ctx[0]);
      if (!mounted) {
        dispose = [
          listen(input, "input", ctx[2]),
          listen(input, "change", ctx[1])
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1) {
        set_input_value(input, ctx2[0]);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$5($$self, $$props, $$invalidate) {
  const dispatch2 = createEventDispatcher();
  const getDateString = (date, delimiter) => {
    if (!date)
      date = new Date();
    if (!delimiter)
      delimiter = "-";
    var month = "" + (date.getMonth() + 1);
    var day = "" + date.getDate();
    var year = date.getFullYear();
    if (month.length < 2)
      month = "0" + month;
    if (day.length < 2)
      day = "0" + day;
    return [year, month, day].join(delimiter);
  };
  let { value = getDateString() } = $$props;
  const change = (e) => {
    dispatch2("change", e);
  };
  function input_input_handler() {
    value = this.value;
    $$invalidate(0, value);
  }
  $$self.$$set = ($$props2) => {
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
  };
  return [value, change, input_input_handler];
}
class DatePicker extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$5, create_fragment$5, safe_not_equal, { value: 0 });
  }
}
const SelectButton_svelte_svelte_type_style_lang = "";
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[5] = list[i];
  return child_ctx;
}
function create_each_block$1(ctx) {
  let div;
  let t_value = ctx[5] + "";
  let t;
  let div_class_value;
  let mounted;
  let dispose;
  function click_handler() {
    return ctx[3](ctx[5]);
  }
  return {
    c() {
      div = element("div");
      t = text(t_value);
      attr(div, "class", div_class_value = "item " + (ctx[0] == ctx[5] ? "selected" : "") + " svelte-1rnos2u");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
      if (!mounted) {
        dispose = listen(div, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && t_value !== (t_value = ctx[5] + ""))
        set_data(t, t_value);
      if (dirty & 3 && div_class_value !== (div_class_value = "item " + (ctx[0] == ctx[5] ? "selected" : "") + " svelte-1rnos2u")) {
        attr(div, "class", div_class_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$4(ctx) {
  let main;
  let each_value = ctx[1];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  }
  return {
    c() {
      main = element("main");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(main, "class", "svelte-1rnos2u");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(main, null);
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 7) {
        each_value = ctx2[1];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$1(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(main, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance$4($$self, $$props, $$invalidate) {
  const dispatch2 = createEventDispatcher();
  let { value } = $$props;
  let { options } = $$props;
  const select = (option) => {
    $$invalidate(0, value = option);
    dispatch2("change", { value });
  };
  const click_handler = (option) => select(option);
  $$self.$$set = ($$props2) => {
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("options" in $$props2)
      $$invalidate(1, options = $$props2.options);
  };
  return [value, options, select, click_handler];
}
class SelectButton extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$4, create_fragment$4, safe_not_equal, { value: 0, options: 1 });
  }
}
const ExpandMyPerformance_svelte_svelte_type_style_lang = "";
function create_if_block$3(ctx) {
  let i1;
  let i1_transition;
  let current;
  return {
    c() {
      i1 = element("i");
      i1.innerHTML = `<i class="fas fa-spinner"></i> Fetching data...`;
    },
    m(target, anchor) {
      insert(target, i1, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (!i1_transition)
          i1_transition = create_bidirectional_transition(i1, fade, {}, true);
        i1_transition.run(1);
      });
      current = true;
    },
    o(local) {
      if (!i1_transition)
        i1_transition = create_bidirectional_transition(i1, fade, {}, false);
      i1_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(i1);
      if (detaching && i1_transition)
        i1_transition.end();
    }
  };
}
function create_fragment$3(ctx) {
  let main;
  let div0;
  let t0;
  let h2;
  let t2;
  let div1;
  let p0;
  let t4;
  let p1;
  let t6;
  let p2;
  let t8;
  let selectbutton;
  let updating_value;
  let t9;
  let datepicker0;
  let updating_value_1;
  let t10;
  let datepicker1;
  let updating_value_2;
  let t11;
  let canvas;
  let t12;
  let p3;
  let main_intro;
  let current;
  let mounted;
  let dispose;
  function selectbutton_value_binding(value) {
    ctx[7](value);
  }
  let selectbutton_props = {
    options: ["Hourly", "Daily", "Weekly", "Monthly"]
  };
  if (ctx[0] !== void 0) {
    selectbutton_props.value = ctx[0];
  }
  selectbutton = new SelectButton({ props: selectbutton_props });
  binding_callbacks.push(() => bind(selectbutton, "value", selectbutton_value_binding));
  selectbutton.$on("change", ctx[5]);
  function datepicker0_value_binding(value) {
    ctx[8](value);
  }
  let datepicker0_props = {};
  if (ctx[1] !== void 0) {
    datepicker0_props.value = ctx[1];
  }
  datepicker0 = new DatePicker({ props: datepicker0_props });
  binding_callbacks.push(() => bind(datepicker0, "value", datepicker0_value_binding));
  datepicker0.$on("change", ctx[5]);
  function datepicker1_value_binding(value) {
    ctx[9](value);
  }
  let datepicker1_props = {};
  if (ctx[2] !== void 0) {
    datepicker1_props.value = ctx[2];
  }
  datepicker1 = new DatePicker({ props: datepicker1_props });
  binding_callbacks.push(() => bind(datepicker1, "value", datepicker1_value_binding));
  datepicker1.$on("change", ctx[5]);
  let if_block = ctx[3] && create_if_block$3();
  return {
    c() {
      main = element("main");
      div0 = element("div");
      div0.innerHTML = `<i class="fas fa-times"></i>`;
      t0 = space();
      h2 = element("h2");
      h2.innerHTML = `<i class="fas fa-user"></i> My Performance`;
      t2 = space();
      div1 = element("div");
      p0 = element("p");
      p0.innerHTML = `<i>Interval</i>`;
      t4 = space();
      p1 = element("p");
      p1.innerHTML = `<i>Between</i>`;
      t6 = space();
      p2 = element("p");
      p2.innerHTML = `<i>And</i>`;
      t8 = space();
      create_component(selectbutton.$$.fragment);
      t9 = space();
      create_component(datepicker0.$$.fragment);
      t10 = space();
      create_component(datepicker1.$$.fragment);
      t11 = space();
      canvas = element("canvas");
      t12 = space();
      p3 = element("p");
      if (if_block)
        if_block.c();
      attr(div0, "class", "icon-btn close-btn");
      attr(h2, "class", "svelte-1qs4mnx");
      attr(div1, "class", "filters svelte-1qs4mnx");
      attr(canvas, "id", "expandChart");
      attr(p3, "class", "msg svelte-1qs4mnx");
      attr(main, "class", "cont svelte-1qs4mnx");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, div0);
      append(main, t0);
      append(main, h2);
      append(main, t2);
      append(main, div1);
      append(div1, p0);
      append(div1, t4);
      append(div1, p1);
      append(div1, t6);
      append(div1, p2);
      append(div1, t8);
      mount_component(selectbutton, div1, null);
      append(div1, t9);
      mount_component(datepicker0, div1, null);
      append(div1, t10);
      mount_component(datepicker1, div1, null);
      append(main, t11);
      append(main, canvas);
      append(main, t12);
      append(main, p3);
      if (if_block)
        if_block.m(p3, null);
      current = true;
      if (!mounted) {
        dispose = listen(div0, "click", ctx[6]);
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      const selectbutton_changes = {};
      if (!updating_value && dirty & 1) {
        updating_value = true;
        selectbutton_changes.value = ctx2[0];
        add_flush_callback(() => updating_value = false);
      }
      selectbutton.$set(selectbutton_changes);
      const datepicker0_changes = {};
      if (!updating_value_1 && dirty & 2) {
        updating_value_1 = true;
        datepicker0_changes.value = ctx2[1];
        add_flush_callback(() => updating_value_1 = false);
      }
      datepicker0.$set(datepicker0_changes);
      const datepicker1_changes = {};
      if (!updating_value_2 && dirty & 4) {
        updating_value_2 = true;
        datepicker1_changes.value = ctx2[2];
        add_flush_callback(() => updating_value_2 = false);
      }
      datepicker1.$set(datepicker1_changes);
      if (ctx2[3]) {
        if (if_block) {
          if (dirty & 8) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$3();
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(p3, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(selectbutton.$$.fragment, local);
      transition_in(datepicker0.$$.fragment, local);
      transition_in(datepicker1.$$.fragment, local);
      transition_in(if_block);
      if (!main_intro) {
        add_render_callback(() => {
          main_intro = create_in_transition(main, fade, {});
          main_intro.start();
        });
      }
      current = true;
    },
    o(local) {
      transition_out(selectbutton.$$.fragment, local);
      transition_out(datepicker0.$$.fragment, local);
      transition_out(datepicker1.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(main);
      destroy_component(selectbutton);
      destroy_component(datepicker0);
      destroy_component(datepicker1);
      if (if_block)
        if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function instance$3($$self, $$props, $$invalidate) {
  let $user;
  let $insights;
  let $screen;
  component_subscribe($$self, user, ($$value) => $$invalidate(12, $user = $$value));
  component_subscribe($$self, insights, ($$value) => $$invalidate(13, $insights = $$value));
  component_subscribe($$self, screen, ($$value) => $$invalidate(4, $screen = $$value));
  let interval = "Hourly";
  let startDate;
  let endDate;
  let data = $insights.TEAM.map((t) => {
    return { ...t, INTERVAL: t.HOUR + "h" };
  });
  var chart;
  const initChart = () => {
    chart = new Chart(
      document.getElementById("expandChart"),
      {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Items Processed",
              backgroundColor: "rgb(145, 192, 204)",
              borderColor: "rgb(145, 192, 204)",
              data: []
            },
            {
              label: "Team Average",
              backgroundColor: "rgb(98, 142, 153)",
              borderColor: "rgb(98, 142, 153)",
              data: []
            }
          ]
        },
        options: {
          plugins: {
            legend: { position: "bottom", align: "start" },
            tooltips: {
              callbacks: {
                label(tooltipItem) {
                  return tooltipItem.yLabel;
                }
              }
            }
          }
        }
      }
    );
  };
  const updateChart = () => {
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.data.datasets[1].data = [];
    data.forEach((d) => {
      chart.data.labels.push(d.INTERVAL);
      chart.data.datasets[0].data.push(d.ITEMS);
      chart.data.datasets[1].data.push(d.TEAM_AVG_ITEMS);
    });
    chart.update();
  };
  onMount(() => {
    initChart();
    updateChart();
  });
  const changeFilters = () => {
    console.log("filters changed", interval, startDate, endDate);
    fetchData();
  };
  let fetching;
  const fetchData = () => {
    $$invalidate(3, fetching = true);
    apex.server.process(
      "GetExpandPerformance",
      {
        x01: $user.SITE,
        x02: interval,
        x03: startDate,
        x04: endDate
      },
      {
        success: (res) => {
          console.log(res.data);
          data = res.total;
          $$invalidate(3, fetching = false);
          updateChart();
        }
      }
    );
  };
  const click_handler = () => set_store_value(screen, $screen = null, $screen);
  function selectbutton_value_binding(value) {
    interval = value;
    $$invalidate(0, interval);
  }
  function datepicker0_value_binding(value) {
    startDate = value;
    $$invalidate(1, startDate);
  }
  function datepicker1_value_binding(value) {
    endDate = value;
    $$invalidate(2, endDate);
  }
  return [
    interval,
    startDate,
    endDate,
    fetching,
    $screen,
    changeFilters,
    click_handler,
    selectbutton_value_binding,
    datepicker0_value_binding,
    datepicker1_value_binding
  ];
}
class ExpandMyPerformance extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {});
  }
}
const ExpandTeamPerformance_svelte_svelte_type_style_lang = "";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[23] = list[i];
  child_ctx[24] = list;
  child_ctx[25] = i;
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[26] = list[i];
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[29] = list[i];
  return child_ctx;
}
function create_if_block_1$1(ctx) {
  let previous_key = ctx[4].data.labels;
  let key_block_anchor;
  let key_block = create_key_block(ctx);
  return {
    c() {
      key_block.c();
      key_block_anchor = empty();
    },
    m(target, anchor) {
      key_block.m(target, anchor);
      insert(target, key_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & 16 && safe_not_equal(previous_key, previous_key = ctx2[4].data.labels)) {
        key_block.d(1);
        key_block = create_key_block(ctx2);
        key_block.c();
        key_block.m(key_block_anchor.parentNode, key_block_anchor);
      } else {
        key_block.p(ctx2, dirty);
      }
    },
    d(detaching) {
      if (detaching)
        detach(key_block_anchor);
      key_block.d(detaching);
    }
  };
}
function create_each_block_2(ctx) {
  let div;
  let t_value = ctx[29] + "";
  let t;
  return {
    c() {
      div = element("div");
      t = text(t_value);
      attr(div, "class", "chcell svelte-46ebrj");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & 16 && t_value !== (t_value = ctx2[29] + ""))
        set_data(t, t_value);
    },
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function create_each_block_1(ctx) {
  let div;
  let t_value = (ctx[26] ? ctx[26] : "") + "";
  let t;
  return {
    c() {
      div = element("div");
      t = text(t_value);
      attr(div, "class", "cell svelte-46ebrj");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & 16 && t_value !== (t_value = (ctx2[26] ? ctx2[26] : "") + ""))
        set_data(t, t_value);
    },
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function create_each_block(ctx) {
  let div1;
  let input;
  let input_checked_value;
  let t0;
  let div0;
  let t1;
  let t2_value = ctx[23].label + "";
  let t2;
  let t3;
  let each_1_anchor;
  let mounted;
  let dispose;
  function change_handler() {
    return ctx[15](ctx[23], ctx[24], ctx[25]);
  }
  let each_value_1 = ctx[23].data;
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  return {
    c() {
      div1 = element("div");
      input = element("input");
      t0 = space();
      div0 = element("div");
      t1 = space();
      t2 = text(t2_value);
      t3 = space();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
      attr(input, "type", "checkbox");
      attr(input, "name", "chkHide");
      input.checked = input_checked_value = !ctx[23].hidden;
      attr(input, "class", "svelte-46ebrj");
      attr(div0, "class", "colordot svelte-46ebrj");
      set_style(div0, "background-color", ctx[23].backgroundColor);
      attr(div1, "class", "rhcell svelte-46ebrj");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, input);
      append(div1, t0);
      append(div1, div0);
      append(div1, t1);
      append(div1, t2);
      insert(target, t3, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(target, anchor);
      }
      insert(target, each_1_anchor, anchor);
      if (!mounted) {
        dispose = listen(input, "change", change_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & 16 && input_checked_value !== (input_checked_value = !ctx[23].hidden)) {
        input.checked = input_checked_value;
      }
      if (dirty[0] & 16) {
        set_style(div0, "background-color", ctx[23].backgroundColor);
      }
      if (dirty[0] & 16 && t2_value !== (t2_value = ctx[23].label + ""))
        set_data(t2, t2_value);
      if (dirty[0] & 16) {
        each_value_1 = ctx[23].data;
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
    },
    d(detaching) {
      if (detaching)
        detach(div1);
      if (detaching)
        detach(t3);
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach(each_1_anchor);
      mounted = false;
      dispose();
    }
  };
}
function create_key_block(ctx) {
  let div1;
  let div0;
  let input;
  let t0;
  let i;
  let t2;
  let t3;
  let mounted;
  let dispose;
  let each_value_2 = ctx[4].data.labels;
  let each_blocks_1 = [];
  for (let i2 = 0; i2 < each_value_2.length; i2 += 1) {
    each_blocks_1[i2] = create_each_block_2(get_each_context_2(ctx, each_value_2, i2));
  }
  let each_value = ctx[4].data.datasets;
  let each_blocks = [];
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    each_blocks[i2] = create_each_block(get_each_context(ctx, each_value, i2));
  }
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      input = element("input");
      t0 = space();
      i = element("i");
      i.textContent = "Show in Chart";
      t2 = space();
      for (let i2 = 0; i2 < each_blocks_1.length; i2 += 1) {
        each_blocks_1[i2].c();
      }
      t3 = space();
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      attr(input, "type", "checkbox");
      attr(div0, "class", "chcell svelte-46ebrj");
      attr(div1, "class", "table svelte-46ebrj");
      set_style(div1, "display", "grid");
      set_style(div1, "grid-template-columns", "3fr repeat(" + ctx[4].data.labels.length + ",1fr)");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      append(div0, input);
      input.checked = ctx[5];
      append(div0, t0);
      append(div0, i);
      append(div1, t2);
      for (let i2 = 0; i2 < each_blocks_1.length; i2 += 1) {
        each_blocks_1[i2].m(div1, null);
      }
      append(div1, t3);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(div1, null);
      }
      if (!mounted) {
        dispose = [
          listen(input, "change", ctx[14]),
          listen(input, "change", ctx[8])
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & 32) {
        input.checked = ctx2[5];
      }
      if (dirty[0] & 16) {
        each_value_2 = ctx2[4].data.labels;
        let i2;
        for (i2 = 0; i2 < each_value_2.length; i2 += 1) {
          const child_ctx = get_each_context_2(ctx2, each_value_2, i2);
          if (each_blocks_1[i2]) {
            each_blocks_1[i2].p(child_ctx, dirty);
          } else {
            each_blocks_1[i2] = create_each_block_2(child_ctx);
            each_blocks_1[i2].c();
            each_blocks_1[i2].m(div1, t3);
          }
        }
        for (; i2 < each_blocks_1.length; i2 += 1) {
          each_blocks_1[i2].d(1);
        }
        each_blocks_1.length = each_value_2.length;
      }
      if (dirty[0] & 16) {
        each_value = ctx2[4].data.datasets;
        let i2;
        for (i2 = 0; i2 < each_value.length; i2 += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i2);
          if (each_blocks[i2]) {
            each_blocks[i2].p(child_ctx, dirty);
          } else {
            each_blocks[i2] = create_each_block(child_ctx);
            each_blocks[i2].c();
            each_blocks[i2].m(div1, null);
          }
        }
        for (; i2 < each_blocks.length; i2 += 1) {
          each_blocks[i2].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty[0] & 16) {
        set_style(div1, "grid-template-columns", "3fr repeat(" + ctx2[4].data.labels.length + ",1fr)");
      }
    },
    d(detaching) {
      if (detaching)
        detach(div1);
      destroy_each(each_blocks_1, detaching);
      destroy_each(each_blocks, detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block$2(ctx) {
  let i1;
  let i1_transition;
  let current;
  return {
    c() {
      i1 = element("i");
      i1.innerHTML = `<i class="fas fa-spinner"></i> Fetching data...`;
    },
    m(target, anchor) {
      insert(target, i1, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (!i1_transition)
          i1_transition = create_bidirectional_transition(i1, fade, {}, true);
        i1_transition.run(1);
      });
      current = true;
    },
    o(local) {
      if (!i1_transition)
        i1_transition = create_bidirectional_transition(i1, fade, {}, false);
      i1_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(i1);
      if (detaching && i1_transition)
        i1_transition.end();
    }
  };
}
function create_fragment$2(ctx) {
  let main;
  let div0;
  let t0;
  let h2;
  let t2;
  let div1;
  let p0;
  let t4;
  let p1;
  let t6;
  let p2;
  let t8;
  let selectbutton;
  let updating_value;
  let t9;
  let datepicker0;
  let updating_value_1;
  let t10;
  let datepicker1;
  let updating_value_2;
  let t11;
  let h30;
  let t13;
  let canvas0;
  let t14;
  let h31;
  let t16;
  let canvas1;
  let t17;
  let t18;
  let p3;
  let main_intro;
  let current;
  let mounted;
  let dispose;
  function selectbutton_value_binding(value) {
    ctx[11](value);
  }
  let selectbutton_props = {
    options: ["Hourly", "Daily", "Weekly", "Monthly"]
  };
  if (ctx[0] !== void 0) {
    selectbutton_props.value = ctx[0];
  }
  selectbutton = new SelectButton({ props: selectbutton_props });
  binding_callbacks.push(() => bind(selectbutton, "value", selectbutton_value_binding));
  selectbutton.$on("change", ctx[9]);
  function datepicker0_value_binding(value) {
    ctx[12](value);
  }
  let datepicker0_props = {};
  if (ctx[1] !== void 0) {
    datepicker0_props.value = ctx[1];
  }
  datepicker0 = new DatePicker({ props: datepicker0_props });
  binding_callbacks.push(() => bind(datepicker0, "value", datepicker0_value_binding));
  datepicker0.$on("change", ctx[9]);
  function datepicker1_value_binding(value) {
    ctx[13](value);
  }
  let datepicker1_props = {};
  if (ctx[2] !== void 0) {
    datepicker1_props.value = ctx[2];
  }
  datepicker1 = new DatePicker({ props: datepicker1_props });
  binding_callbacks.push(() => bind(datepicker1, "value", datepicker1_value_binding));
  datepicker1.$on("change", ctx[9]);
  let if_block0 = ctx[3].users && create_if_block_1$1(ctx);
  let if_block1 = ctx[6] && create_if_block$2();
  return {
    c() {
      main = element("main");
      div0 = element("div");
      div0.innerHTML = `<i class="fas fa-times"></i>`;
      t0 = space();
      h2 = element("h2");
      h2.innerHTML = `<i class="fas fa-users"></i> Team Performance`;
      t2 = space();
      div1 = element("div");
      p0 = element("p");
      p0.innerHTML = `<i>Interval</i>`;
      t4 = space();
      p1 = element("p");
      p1.innerHTML = `<i>Between</i>`;
      t6 = space();
      p2 = element("p");
      p2.innerHTML = `<i>And</i>`;
      t8 = space();
      create_component(selectbutton.$$.fragment);
      t9 = space();
      create_component(datepicker0.$$.fragment);
      t10 = space();
      create_component(datepicker1.$$.fragment);
      t11 = space();
      h30 = element("h3");
      h30.innerHTML = `<i class="fas fa-chart-line"></i> Total production`;
      t13 = space();
      canvas0 = element("canvas");
      t14 = space();
      h31 = element("h3");
      h31.innerHTML = `<i class="fas fa-chart-line"></i> User Performance`;
      t16 = space();
      canvas1 = element("canvas");
      t17 = space();
      if (if_block0)
        if_block0.c();
      t18 = space();
      p3 = element("p");
      if (if_block1)
        if_block1.c();
      attr(div0, "class", "icon-btn close-btn");
      attr(h2, "class", "svelte-46ebrj");
      attr(div1, "class", "filters svelte-46ebrj");
      attr(h30, "class", "svelte-46ebrj");
      attr(canvas0, "id", "totalChart");
      attr(h31, "class", "svelte-46ebrj");
      attr(canvas1, "id", "userChart");
      attr(p3, "class", "msg svelte-46ebrj");
      attr(main, "class", "cont svelte-46ebrj");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, div0);
      append(main, t0);
      append(main, h2);
      append(main, t2);
      append(main, div1);
      append(div1, p0);
      append(div1, t4);
      append(div1, p1);
      append(div1, t6);
      append(div1, p2);
      append(div1, t8);
      mount_component(selectbutton, div1, null);
      append(div1, t9);
      mount_component(datepicker0, div1, null);
      append(div1, t10);
      mount_component(datepicker1, div1, null);
      append(main, t11);
      append(main, h30);
      append(main, t13);
      append(main, canvas0);
      append(main, t14);
      append(main, h31);
      append(main, t16);
      append(main, canvas1);
      append(main, t17);
      if (if_block0)
        if_block0.m(main, null);
      append(main, t18);
      append(main, p3);
      if (if_block1)
        if_block1.m(p3, null);
      current = true;
      if (!mounted) {
        dispose = listen(div0, "click", ctx[10]);
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      const selectbutton_changes = {};
      if (!updating_value && dirty[0] & 1) {
        updating_value = true;
        selectbutton_changes.value = ctx2[0];
        add_flush_callback(() => updating_value = false);
      }
      selectbutton.$set(selectbutton_changes);
      const datepicker0_changes = {};
      if (!updating_value_1 && dirty[0] & 2) {
        updating_value_1 = true;
        datepicker0_changes.value = ctx2[1];
        add_flush_callback(() => updating_value_1 = false);
      }
      datepicker0.$set(datepicker0_changes);
      const datepicker1_changes = {};
      if (!updating_value_2 && dirty[0] & 4) {
        updating_value_2 = true;
        datepicker1_changes.value = ctx2[2];
        add_flush_callback(() => updating_value_2 = false);
      }
      datepicker1.$set(datepicker1_changes);
      if (ctx2[3].users) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_1$1(ctx2);
          if_block0.c();
          if_block0.m(main, t18);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (ctx2[6]) {
        if (if_block1) {
          if (dirty[0] & 64) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block$2();
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(p3, null);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(selectbutton.$$.fragment, local);
      transition_in(datepicker0.$$.fragment, local);
      transition_in(datepicker1.$$.fragment, local);
      transition_in(if_block1);
      if (!main_intro) {
        add_render_callback(() => {
          main_intro = create_in_transition(main, fade, {});
          main_intro.start();
        });
      }
      current = true;
    },
    o(local) {
      transition_out(selectbutton.$$.fragment, local);
      transition_out(datepicker0.$$.fragment, local);
      transition_out(datepicker1.$$.fragment, local);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(main);
      destroy_component(selectbutton);
      destroy_component(datepicker0);
      destroy_component(datepicker1);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      mounted = false;
      dispose();
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  let $user;
  let $insights;
  let $screen;
  component_subscribe($$self, user, ($$value) => $$invalidate(17, $user = $$value));
  component_subscribe($$self, insights, ($$value) => $$invalidate(18, $insights = $$value));
  component_subscribe($$self, screen, ($$value) => $$invalidate(7, $screen = $$value));
  let interval = "Hourly";
  let startDate;
  let endDate;
  var colors = [
    "#FF6633",
    "#FFB399",
    "#FF33FF",
    "#FFFF99",
    "#00B3E6",
    "#E6B333",
    "#3366E6",
    "#999966",
    "#99FF99",
    "#B34D4D",
    "#80B300",
    "#809900",
    "#E6B3B3",
    "#6680B3",
    "#66991A",
    "#FF99E6",
    "#CCFF1A",
    "#FF1A66",
    "#E6331A",
    "#33FFCC",
    "#66994D",
    "#B366CC",
    "#4D8000",
    "#B33300",
    "#CC80CC",
    "#66664D",
    "#991AFF",
    "#E666FF",
    "#4DB3FF",
    "#1AB399",
    "#E666B3",
    "#33991A",
    "#CC9999",
    "#B3B31A",
    "#00E680",
    "#4D8066",
    "#809980",
    "#E6FF80",
    "#1AFF33",
    "#999933",
    "#FF3380",
    "#CCCC00",
    "#66E64D",
    "#4D80CC",
    "#9900B3",
    "#E64D66",
    "#4DB380",
    "#FF4D4D",
    "#99E6E6",
    "#6666FF",
    "#FF6633",
    "#FFB399",
    "#FF33FF",
    "#FFFF99",
    "#00B3E6",
    "#E6B333",
    "#3366E6",
    "#999966",
    "#99FF99",
    "#B34D4D",
    "#80B300",
    "#809900",
    "#E6B3B3",
    "#6680B3",
    "#66991A",
    "#FF99E6",
    "#CCFF1A",
    "#FF1A66",
    "#E6331A",
    "#33FFCC",
    "#66994D",
    "#B366CC",
    "#4D8000",
    "#B33300",
    "#CC80CC",
    "#66664D",
    "#991AFF",
    "#E666FF",
    "#4DB3FF",
    "#1AB399",
    "#E666B3",
    "#33991A",
    "#CC9999",
    "#B3B31A",
    "#00E680",
    "#4D8066",
    "#809980",
    "#E6FF80",
    "#1AFF33",
    "#999933",
    "#FF3380",
    "#CCCC00",
    "#66E64D",
    "#4D80CC",
    "#9900B3",
    "#E64D66",
    "#4DB380",
    "#FF4D4D",
    "#99E6E6",
    "#6666FF"
  ];
  let data = {
    total: $insights.TEAM.map((t) => {
      return { ...t, INTERVAL: t.HOUR };
    })
  };
  var totalChart;
  let userChart;
  let showAllInUserChart = true;
  const setShowAllInUserChart = (e) => {
    document.getElementsByName("chkHide").forEach((chk) => {
      chk.checked = e.target.checked;
    });
    userChart.data.datasets.forEach((ds) => {
      ds.hidden = !e.target.checked;
    });
    console.log(userChart.data.datasets);
    userChart.update();
  };
  const initCharts = () => {
    totalChart = new Chart(
      document.getElementById("totalChart"),
      {
        type: "line",
        data: { labels: [], datasets: [] },
        options: {
          plugins: {
            legend: { position: "bottom", align: "start" },
            tooltips: {
              callbacks: {
                label(tooltipItem) {
                  return tooltipItem.yLabel;
                }
              }
            }
          }
        }
      }
    );
    $$invalidate(4, userChart = new Chart(
      document.getElementById("userChart"),
      {
        type: "line",
        data: { labels: [], datasets: [] },
        options: {
          plugins: {
            legend: { display: false },
            tooltips: {
              callbacks: {
                label(tooltipItem) {
                  return tooltipItem.yLabel;
                }
              }
            }
          }
        }
      }
    ));
  };
  const updateCharts = () => {
    totalChart.data.labels = [];
    totalChart.data.datasets = [];
    totalChart.data.datasets.push({
      label: "Total Items Processed",
      backgroundColor: "rgb(98, 142, 153)",
      borderColor: "rgb(98, 142, 153)",
      data: []
    });
    data.total.forEach((d) => {
      totalChart.data.labels.push(d.INTERVAL);
      totalChart.data.datasets[0].data.push(d.TEAM_ITEMS);
    });
    totalChart.update();
    if (data.users) {
      $$invalidate(4, userChart.data.labels = [], userChart);
      $$invalidate(4, userChart.data.datasets = [], userChart);
      data.users.forEach((d) => {
        if (!userChart.data.labels.find((l) => l == d.INTERVAL))
          userChart.data.labels.push(d.INTERVAL);
        if (!userChart.data.datasets.find((s) => s.label == d.USERNAME)) {
          userChart.data.datasets.push({ label: d.USERNAME, data: [] });
        }
      });
      userChart.data.labels.forEach((i) => {
        userChart.data.datasets.forEach((u, index) => {
          u.backgroundColor = colors[index];
          u.borderColor = colors[index];
          var line = data.users.find((d) => d.USERNAME == u.label && d.INTERVAL == i);
          u.data.push(line ? line.ITEMS : null);
        });
      });
      userChart.update();
    }
  };
  onMount(() => {
    initCharts();
    updateCharts();
    fetchData();
  });
  const changeFilters = () => {
    console.log("filters changed", interval, startDate, endDate);
    fetchData();
  };
  let fetching;
  const fetchData = () => {
    $$invalidate(6, fetching = true);
    apex.server.process(
      "GetExpandPerformance",
      {
        x01: $user.SITE,
        x02: interval,
        x03: startDate,
        x04: endDate
      },
      {
        success: (res) => {
          $$invalidate(3, data = res);
          $$invalidate(6, fetching = false);
          updateCharts();
        }
      }
    );
  };
  const click_handler = () => set_store_value(screen, $screen = null, $screen);
  function selectbutton_value_binding(value) {
    interval = value;
    $$invalidate(0, interval);
  }
  function datepicker0_value_binding(value) {
    startDate = value;
    $$invalidate(1, startDate);
  }
  function datepicker1_value_binding(value) {
    endDate = value;
    $$invalidate(2, endDate);
  }
  function input_change_handler() {
    showAllInUserChart = this.checked;
    $$invalidate(5, showAllInUserChart);
  }
  const change_handler = (set, each_value, set_index) => {
    $$invalidate(4, each_value[set_index].hidden = !set.hidden, userChart);
    userChart.update();
  };
  return [
    interval,
    startDate,
    endDate,
    data,
    userChart,
    showAllInUserChart,
    fetching,
    $screen,
    setShowAllInUserChart,
    changeFilters,
    click_handler,
    selectbutton_value_binding,
    datepicker0_value_binding,
    datepicker1_value_binding,
    input_change_handler,
    change_handler
  ];
}
class ExpandTeamPerformance extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, null, [-1, -1]);
  }
}
const OldContainerPrompt_svelte_svelte_type_style_lang = "";
function create_if_block$1(ctx) {
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      button.textContent = "Continue Anyway";
    },
    m(target, anchor) {
      insert(target, button, anchor);
      if (!mounted) {
        dispose = listen(button, "click", prevent_default(ctx[2]));
        mounted = true;
      }
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$1(ctx) {
  let main;
  let h2;
  let t3;
  let div;
  let t4;
  let button;
  let main_intro;
  let mounted;
  let dispose;
  let if_block = ctx[0].IS_SUPER_USER == "Y" && create_if_block$1(ctx);
  return {
    c() {
      main = element("main");
      h2 = element("h2");
      h2.innerHTML = `<i class="fas fa-exclamation-triangle"></i> This container ID has been used before! Please bring this box to the <b>problem solver</b> for repacking...`;
      t3 = space();
      div = element("div");
      if (if_block)
        if_block.c();
      t4 = space();
      button = element("button");
      button.textContent = "Ok";
      attr(button, "class", "hotbtn");
      attr(div, "class", "prompt-buttons svelte-1e8liqq");
      attr(main, "class", "svelte-1e8liqq");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      append(main, h2);
      append(main, t3);
      append(main, div);
      if (if_block)
        if_block.m(div, null);
      append(div, t4);
      append(div, button);
      if (!mounted) {
        dispose = listen(button, "click", prevent_default(ctx[1]));
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (ctx2[0].IS_SUPER_USER == "Y") {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$1(ctx2);
          if_block.c();
          if_block.m(div, t4);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i(local) {
      if (!main_intro) {
        add_render_callback(() => {
          main_intro = create_in_transition(main, fade, {});
          main_intro.start();
        });
      }
    },
    o: noop,
    d(detaching) {
      if (detaching)
        detach(main);
      if (if_block)
        if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let $prompt;
  let $missingProducts;
  let $missingPrices;
  let $container;
  let $user;
  component_subscribe($$self, prompt, ($$value) => $$invalidate(3, $prompt = $$value));
  component_subscribe($$self, missingProducts, ($$value) => $$invalidate(4, $missingProducts = $$value));
  component_subscribe($$self, missingPrices, ($$value) => $$invalidate(5, $missingPrices = $$value));
  component_subscribe($$self, container, ($$value) => $$invalidate(6, $container = $$value));
  component_subscribe($$self, user, ($$value) => $$invalidate(0, $user = $$value));
  const clickOk = () => {
    set_store_value(container, $container = null, $container);
    set_store_value(missingPrices, $missingPrices = [], $missingPrices);
    set_store_value(missingProducts, $missingProducts = [], $missingProducts);
    set_store_value(prompt, $prompt = "", $prompt);
  };
  const clickContinue = () => {
    console.log("continue clicked");
    set_store_value(missingPrices, $missingPrices = [], $missingPrices);
    set_store_value(missingProducts, $missingProducts = [], $missingProducts);
    set_store_value(prompt, $prompt = "", $prompt);
  };
  return [$user, clickOk, clickContinue];
}
class OldContainerPrompt extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
  }
}
const App_svelte_svelte_type_style_lang = "";
function create_else_block_1(ctx) {
  let containerscan;
  let current;
  containerscan = new ContainerScan({});
  return {
    c() {
      create_component(containerscan.$$.fragment);
    },
    m(target, anchor) {
      mount_component(containerscan, target, anchor);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(containerscan.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(containerscan.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(containerscan, detaching);
    }
  };
}
function create_if_block_4(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [
    create_if_block_5,
    create_if_block_6,
    create_if_block_7,
    create_if_block_8,
    create_if_block_9,
    create_if_block_10,
    create_if_block_11,
    create_else_block
  ];
  const if_blocks = [];
  function select_block_type_1(ctx2, dirty) {
    var _a;
    if (ctx2[2] == "missingStore")
      return 0;
    if (ctx2[2] == "oldContainer")
      return 1;
    if (ctx2[3].length > 0 || ctx2[4].length > 0)
      return 2;
    if (ctx2[2] == "deleteContainer")
      return 3;
    if (ctx2[2] == "resetContainer")
      return 4;
    if (ctx2[2] == "finishShortage")
      return 5;
    if (((_a = ctx2[2]) == null ? void 0 : _a.name) == "tooMuch")
      return 6;
    return 7;
  }
  current_block_type_index = select_block_type_1(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_blocks[current_block_type_index].m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type_1(ctx2);
      if (current_block_type_index !== previous_block_index) {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        }
        transition_in(if_block, 1);
        if_block.m(if_block_anchor.parentNode, if_block_anchor);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if_blocks[current_block_type_index].d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_if_block_3(ctx) {
  let expandissues;
  let current;
  expandissues = new ExpandIssues({});
  return {
    c() {
      create_component(expandissues.$$.fragment);
    },
    m(target, anchor) {
      mount_component(expandissues, target, anchor);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(expandissues.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(expandissues.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(expandissues, detaching);
    }
  };
}
function create_if_block_2(ctx) {
  let expandteamperformance;
  let current;
  expandteamperformance = new ExpandTeamPerformance({});
  return {
    c() {
      create_component(expandteamperformance.$$.fragment);
    },
    m(target, anchor) {
      mount_component(expandteamperformance, target, anchor);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(expandteamperformance.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(expandteamperformance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(expandteamperformance, detaching);
    }
  };
}
function create_if_block_1(ctx) {
  let expandmyperformance;
  let current;
  expandmyperformance = new ExpandMyPerformance({});
  return {
    c() {
      create_component(expandmyperformance.$$.fragment);
    },
    m(target, anchor) {
      mount_component(expandmyperformance, target, anchor);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(expandmyperformance.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(expandmyperformance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(expandmyperformance, detaching);
    }
  };
}
function create_if_block(ctx) {
  let printersettings;
  let current;
  printersettings = new PrinterSettings({});
  return {
    c() {
      create_component(printersettings.$$.fragment);
    },
    m(target, anchor) {
      mount_component(printersettings, target, anchor);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(printersettings.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(printersettings.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(printersettings, detaching);
    }
  };
}
function create_else_block(ctx) {
  let div;
  let containerheader;
  let t0;
  let barcodescan;
  let t1;
  let containerlines;
  let div_intro;
  let current;
  containerheader = new ContainerHeader({});
  barcodescan = new BarcodeScan({});
  containerlines = new ContainerLines({});
  return {
    c() {
      div = element("div");
      create_component(containerheader.$$.fragment);
      t0 = space();
      create_component(barcodescan.$$.fragment);
      t1 = space();
      create_component(containerlines.$$.fragment);
      attr(div, "class", "wr4 svelte-auuvwb");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(containerheader, div, null);
      append(div, t0);
      mount_component(barcodescan, div, null);
      append(div, t1);
      mount_component(containerlines, div, null);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(containerheader.$$.fragment, local);
      transition_in(barcodescan.$$.fragment, local);
      transition_in(containerlines.$$.fragment, local);
      if (!div_intro) {
        add_render_callback(() => {
          div_intro = create_in_transition(div, fade, {});
          div_intro.start();
        });
      }
      current = true;
    },
    o(local) {
      transition_out(containerheader.$$.fragment, local);
      transition_out(barcodescan.$$.fragment, local);
      transition_out(containerlines.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(containerheader);
      destroy_component(barcodescan);
      destroy_component(containerlines);
    }
  };
}
function create_if_block_11(ctx) {
  let toomuchprompt;
  let current;
  toomuchprompt = new TooMuchPrompt({});
  return {
    c() {
      create_component(toomuchprompt.$$.fragment);
    },
    m(target, anchor) {
      mount_component(toomuchprompt, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(toomuchprompt.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(toomuchprompt.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(toomuchprompt, detaching);
    }
  };
}
function create_if_block_10(ctx) {
  let finishshortageprompt;
  let current;
  finishshortageprompt = new FinishShortagePrompt({});
  return {
    c() {
      create_component(finishshortageprompt.$$.fragment);
    },
    m(target, anchor) {
      mount_component(finishshortageprompt, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(finishshortageprompt.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(finishshortageprompt.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(finishshortageprompt, detaching);
    }
  };
}
function create_if_block_9(ctx) {
  let resetcontainerprompt;
  let current;
  resetcontainerprompt = new ResetContainerPrompt({});
  return {
    c() {
      create_component(resetcontainerprompt.$$.fragment);
    },
    m(target, anchor) {
      mount_component(resetcontainerprompt, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(resetcontainerprompt.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(resetcontainerprompt.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(resetcontainerprompt, detaching);
    }
  };
}
function create_if_block_8(ctx) {
  let deletecontainerprompt;
  let current;
  deletecontainerprompt = new DeleteContainerPrompt({});
  return {
    c() {
      create_component(deletecontainerprompt.$$.fragment);
    },
    m(target, anchor) {
      mount_component(deletecontainerprompt, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(deletecontainerprompt.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(deletecontainerprompt.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(deletecontainerprompt, detaching);
    }
  };
}
function create_if_block_7(ctx) {
  let missingdataprompt;
  let current;
  missingdataprompt = new MissingDataPrompt({});
  return {
    c() {
      create_component(missingdataprompt.$$.fragment);
    },
    m(target, anchor) {
      mount_component(missingdataprompt, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(missingdataprompt.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(missingdataprompt.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(missingdataprompt, detaching);
    }
  };
}
function create_if_block_6(ctx) {
  let oldcontainerprompt;
  let current;
  oldcontainerprompt = new OldContainerPrompt({});
  return {
    c() {
      create_component(oldcontainerprompt.$$.fragment);
    },
    m(target, anchor) {
      mount_component(oldcontainerprompt, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(oldcontainerprompt.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(oldcontainerprompt.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(oldcontainerprompt, detaching);
    }
  };
}
function create_if_block_5(ctx) {
  let missingstoreprompt;
  let current;
  missingstoreprompt = new MissingStorePrompt({});
  return {
    c() {
      create_component(missingstoreprompt.$$.fragment);
    },
    m(target, anchor) {
      mount_component(missingstoreprompt, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(missingstoreprompt.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(missingstoreprompt.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(missingstoreprompt, detaching);
    }
  };
}
function create_fragment(ctx) {
  let main;
  let insights_1;
  let t0;
  let div2;
  let div1;
  let div0;
  let current_block_type_index;
  let if_block;
  let t1;
  let button;
  let div2_intro;
  let current;
  let mounted;
  let dispose;
  insights_1 = new Insights({});
  const if_block_creators = [
    create_if_block,
    create_if_block_1,
    create_if_block_2,
    create_if_block_3,
    create_if_block_4,
    create_else_block_1
  ];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[0] == "printerSettings")
      return 0;
    if (ctx2[0] == "expandMyPerformance")
      return 1;
    if (ctx2[0] == "expandTeamPerformance")
      return 2;
    if (ctx2[0] == "expandIssues")
      return 3;
    if (ctx2[1])
      return 4;
    return 5;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      main = element("main");
      create_component(insights_1.$$.fragment);
      t0 = space();
      div2 = element("div");
      div1 = element("div");
      div0 = element("div");
      if_block.c();
      t1 = space();
      button = element("button");
      attr(div0, "class", "wr3 svelte-auuvwb");
      attr(div1, "class", "wr2 svelte-auuvwb");
      attr(button, "id", "btnPrinterSettings");
      set_style(button, "display", "none");
      attr(div2, "class", "wr1 svelte-auuvwb");
      attr(main, "class", "svelte-auuvwb");
    },
    m(target, anchor) {
      insert(target, main, anchor);
      mount_component(insights_1, main, null);
      append(main, t0);
      append(main, div2);
      append(div2, div1);
      append(div1, div0);
      if_blocks[current_block_type_index].m(div0, null);
      append(div2, t1);
      append(div2, button);
      current = true;
      if (!mounted) {
        dispose = listen(button, "click", prevent_default(ctx[5]));
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(div0, null);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(insights_1.$$.fragment, local);
      transition_in(if_block);
      if (!div2_intro) {
        add_render_callback(() => {
          div2_intro = create_in_transition(div2, fade, {});
          div2_intro.start();
        });
      }
      current = true;
    },
    o(local) {
      transition_out(insights_1.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(main);
      destroy_component(insights_1);
      if_blocks[current_block_type_index].d();
      mounted = false;
      dispose();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let $insights;
  let $user;
  let $screen;
  let $container;
  let $prompt;
  let $missingProducts;
  let $missingPrices;
  component_subscribe($$self, insights, ($$value) => $$invalidate(6, $insights = $$value));
  component_subscribe($$self, user, ($$value) => $$invalidate(7, $user = $$value));
  component_subscribe($$self, screen, ($$value) => $$invalidate(0, $screen = $$value));
  component_subscribe($$self, container, ($$value) => $$invalidate(1, $container = $$value));
  component_subscribe($$self, prompt, ($$value) => $$invalidate(2, $prompt = $$value));
  component_subscribe($$self, missingProducts, ($$value) => $$invalidate(3, $missingProducts = $$value));
  component_subscribe($$self, missingPrices, ($$value) => $$invalidate(4, $missingPrices = $$value));
  apex.server.process("GetUserInfo", {}, {
    success: (res) => {
      set_store_value(user, $user = res.data[0], $user);
      console.log("User info", $user);
      apex.item("P5_SITE").setValue($user.SITE);
      fetchInsights();
      setInterval(fetchInsights, 3e4);
    }
  });
  const fetchInsights = () => {
    apex.server.process("GetPerformance", { x01: $user.SITE }, {
      success: (res) => {
        set_store_value(insights, $insights = res, $insights);
        set_store_value(insights, $insights.labelledSinceUpdate = 0, $insights);
        console.log("Insights data updated", $insights);
      }
    });
  };
  const click_handler = () => set_store_value(screen, $screen = "printerSettings", $screen);
  return [$screen, $container, $prompt, $missingProducts, $missingPrices, click_handler];
}
class App extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {});
  }
}
new App({
  target: document.getElementsByClassName("t-Body-contentInner")[0]
});
