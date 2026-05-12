const Qe = {
  colorScheme: "light",
  spacing: "comfortable"
}, Ye = (m, s) => {
  m.dispatchEvent(
    new CustomEvent("openai:set_globals", {
      detail: { globals: s }
    })
  ), m.postMessage(
    {
      jsonrpc: "2.0",
      method: "ui/notifications/tool-result",
      params: {
        structuredContent: s.toolOutput,
        toolOutput: s.toolOutput,
        _meta: s._meta
      }
    },
    "*"
  );
}, Xe = (m, s, j) => {
  const b = m.contentWindow;
  if (!b) return;
  const w = {
    ...s,
    setWidgetState(p) {
      return s.widgetState = typeof p == "function" ? p(s.widgetState) : p, w.widgetState = s.widgetState, j?.(s.widgetState), Ye(b, s), Promise.resolve(s.widgetState);
    },
    setOpenInAppUrl(p) {
      return s.openInAppUrl = p, w.openInAppUrl = p, Promise.resolve(p);
    },
    callTool(p, S) {
      const A = p === "submit_trip_clarification" ? "Storybook captured the trip clarification answers." : `Storybook called ${p}.`;
      return Promise.resolve({
        structuredContent: {
          result: A,
          tool: p,
          input: S
        },
        result: A,
        content: [{ type: "text", text: A }],
        _meta: { "openai/closeWidget": p === "submit_trip_clarification" }
      });
    },
    sendFollowUpMessage(p) {
      return console.info("Storybook follow-up message:", p), Promise.resolve();
    },
    requestClose() {
      return console.info("Storybook widget close requested"), Promise.resolve();
    }
  };
  b.openai = w, Ye(b, s);
}, ot = ({
  url: m,
  mockData: s,
  data: j,
  toolOutput: b,
  toolInput: w = {},
  widgetState: p = {},
  displayMode: S = "inline",
  theme: A = Qe,
  height: z = "700px",
  width: Q = "min(900px, 100%)",
  onStateChange: M,
  _meta: L = {}
}) => {
  const I = {
    toolInput: w,
    toolOutput: b ?? j ?? s,
    displayMode: S,
    theme: A,
    widgetState: p,
    _meta: L
  }, $ = document.createElement("div");
  $.style.width = Q, $.style.margin = "0 auto";
  const C = document.createElement("iframe");
  return C.src = m, C.title = `Widget preview: ${m}`, C.style.width = "100%", C.style.height = z, C.style.border = "none", C.addEventListener("load", () => {
    Xe(C, I, M);
  }), $.appendChild(C), $;
};
var ye = { exports: {} }, ce = {};
var Le;
function Ke() {
  if (Le) return ce;
  Le = 1;
  var m = /* @__PURE__ */ Symbol.for("react.transitional.element"), s = /* @__PURE__ */ Symbol.for("react.fragment");
  function j(b, w, p) {
    var S = null;
    if (p !== void 0 && (S = "" + p), w.key !== void 0 && (S = "" + w.key), "key" in w) {
      p = {};
      for (var A in w)
        A !== "key" && (p[A] = w[A]);
    } else p = w;
    return w = p.ref, {
      $$typeof: m,
      type: b,
      key: S,
      ref: w !== void 0 ? w : null,
      props: p
    };
  }
  return ce.Fragment = s, ce.jsx = j, ce.jsxs = j, ce;
}
var fe = {}, ve = { exports: {} }, l = {};
var Ie;
function Ve() {
  if (Ie) return l;
  Ie = 1;
  var m = /* @__PURE__ */ Symbol.for("react.transitional.element"), s = /* @__PURE__ */ Symbol.for("react.portal"), j = /* @__PURE__ */ Symbol.for("react.fragment"), b = /* @__PURE__ */ Symbol.for("react.strict_mode"), w = /* @__PURE__ */ Symbol.for("react.profiler"), p = /* @__PURE__ */ Symbol.for("react.consumer"), S = /* @__PURE__ */ Symbol.for("react.context"), A = /* @__PURE__ */ Symbol.for("react.forward_ref"), z = /* @__PURE__ */ Symbol.for("react.suspense"), Q = /* @__PURE__ */ Symbol.for("react.memo"), M = /* @__PURE__ */ Symbol.for("react.lazy"), L = /* @__PURE__ */ Symbol.for("react.activity"), G = Symbol.iterator;
  function I(t) {
    return t === null || typeof t != "object" ? null : (t = G && t[G] || t["@@iterator"], typeof t == "function" ? t : null);
  }
  var $ = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, C = Object.assign, X = {};
  function W(t, n, a) {
    this.props = t, this.context = n, this.refs = X, this.updater = a || $;
  }
  W.prototype.isReactComponent = {}, W.prototype.setState = function(t, n) {
    if (typeof t != "object" && typeof t != "function" && t != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, t, n, "setState");
  }, W.prototype.forceUpdate = function(t) {
    this.updater.enqueueForceUpdate(this, t, "forceUpdate");
  };
  function K() {
  }
  K.prototype = W.prototype;
  function re(t, n, a) {
    this.props = t, this.context = n, this.refs = X, this.updater = a || $;
  }
  var V = re.prototype = new K();
  V.constructor = re, C(V, W.prototype), V.isPureReactComponent = !0;
  var D = Array.isArray;
  function ne() {
  }
  var g = { H: null, A: null, T: null, S: null }, se = Object.prototype.hasOwnProperty;
  function P(t, n, a) {
    var i = a.ref;
    return {
      $$typeof: m,
      type: t,
      key: n,
      ref: i !== void 0 ? i : null,
      props: a
    };
  }
  function Z(t, n) {
    return P(t.type, n, t.props);
  }
  function oe(t) {
    return typeof t == "object" && t !== null && t.$$typeof === m;
  }
  function R(t) {
    var n = { "=": "=0", ":": "=2" };
    return "$" + t.replace(/[=:]/g, function(a) {
      return n[a];
    });
  }
  var J = /\/+/g;
  function q(t, n) {
    return typeof t == "object" && t !== null && t.key != null ? R("" + t.key) : n.toString(36);
  }
  function U(t) {
    switch (t.status) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw t.reason;
      default:
        switch (typeof t.status == "string" ? t.then(ne, ne) : (t.status = "pending", t.then(
          function(n) {
            t.status === "pending" && (t.status = "fulfilled", t.value = n);
          },
          function(n) {
            t.status === "pending" && (t.status = "rejected", t.reason = n);
          }
        )), t.status) {
          case "fulfilled":
            return t.value;
          case "rejected":
            throw t.reason;
        }
    }
    throw t;
  }
  function N(t, n, a, i, _) {
    var h = typeof t;
    (h === "undefined" || h === "boolean") && (t = null);
    var f = !1;
    if (t === null) f = !0;
    else
      switch (h) {
        case "bigint":
        case "string":
        case "number":
          f = !0;
          break;
        case "object":
          switch (t.$$typeof) {
            case m:
            case s:
              f = !0;
              break;
            case M:
              return f = t._init, N(
                f(t._payload),
                n,
                a,
                i,
                _
              );
          }
      }
    if (f)
      return _ = _(t), f = i === "" ? "." + q(t, 0) : i, D(_) ? (a = "", f != null && (a = f.replace(J, "$&/") + "/"), N(_, n, a, "", function(F) {
        return F;
      })) : _ != null && (oe(_) && (_ = Z(
        _,
        a + (_.key == null || t && t.key === _.key ? "" : ("" + _.key).replace(
          J,
          "$&/"
        ) + "/") + f
      )), n.push(_)), 1;
    f = 0;
    var k = i === "" ? "." : i + ":";
    if (D(t))
      for (var O = 0; O < t.length; O++)
        i = t[O], h = k + q(i, O), f += N(
          i,
          n,
          a,
          h,
          _
        );
    else if (O = I(t), typeof O == "function")
      for (t = O.call(t), O = 0; !(i = t.next()).done; )
        i = i.value, h = k + q(i, O++), f += N(
          i,
          n,
          a,
          h,
          _
        );
    else if (h === "object") {
      if (typeof t.then == "function")
        return N(
          U(t),
          n,
          a,
          i,
          _
        );
      throw n = String(t), Error(
        "Objects are not valid as a React child (found: " + (n === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : n) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return f;
  }
  function x(t, n, a) {
    if (t == null) return t;
    var i = [], _ = 0;
    return N(t, i, "", "", function(h) {
      return n.call(a, h, _++);
    }), i;
  }
  function ee(t) {
    if (t._status === -1) {
      var n = t._result;
      n = n(), n.then(
        function(a) {
          (t._status === 0 || t._status === -1) && (t._status = 1, t._result = a);
        },
        function(a) {
          (t._status === 0 || t._status === -1) && (t._status = 2, t._result = a);
        }
      ), t._status === -1 && (t._status = 0, t._result = n);
    }
    if (t._status === 1) return t._result.default;
    throw t._result;
  }
  var B = typeof reportError == "function" ? reportError : function(t) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var n = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof t == "object" && t !== null && typeof t.message == "string" ? String(t.message) : String(t),
        error: t
      });
      if (!window.dispatchEvent(n)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", t);
      return;
    }
    console.error(t);
  }, ue = {
    map: x,
    forEach: function(t, n, a) {
      x(
        t,
        function() {
          n.apply(this, arguments);
        },
        a
      );
    },
    count: function(t) {
      var n = 0;
      return x(t, function() {
        n++;
      }), n;
    },
    toArray: function(t) {
      return x(t, function(n) {
        return n;
      }) || [];
    },
    only: function(t) {
      if (!oe(t))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return t;
    }
  };
  return l.Activity = L, l.Children = ue, l.Component = W, l.Fragment = j, l.Profiler = w, l.PureComponent = re, l.StrictMode = b, l.Suspense = z, l.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = g, l.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(t) {
      return g.H.useMemoCache(t);
    }
  }, l.cache = function(t) {
    return function() {
      return t.apply(null, arguments);
    };
  }, l.cacheSignal = function() {
    return null;
  }, l.cloneElement = function(t, n, a) {
    if (t == null)
      throw Error(
        "The argument must be a React element, but you passed " + t + "."
      );
    var i = C({}, t.props), _ = t.key;
    if (n != null)
      for (h in n.key !== void 0 && (_ = "" + n.key), n)
        !se.call(n, h) || h === "key" || h === "__self" || h === "__source" || h === "ref" && n.ref === void 0 || (i[h] = n[h]);
    var h = arguments.length - 2;
    if (h === 1) i.children = a;
    else if (1 < h) {
      for (var f = Array(h), k = 0; k < h; k++)
        f[k] = arguments[k + 2];
      i.children = f;
    }
    return P(t.type, _, i);
  }, l.createContext = function(t) {
    return t = {
      $$typeof: S,
      _currentValue: t,
      _currentValue2: t,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, t.Provider = t, t.Consumer = {
      $$typeof: p,
      _context: t
    }, t;
  }, l.createElement = function(t, n, a) {
    var i, _ = {}, h = null;
    if (n != null)
      for (i in n.key !== void 0 && (h = "" + n.key), n)
        se.call(n, i) && i !== "key" && i !== "__self" && i !== "__source" && (_[i] = n[i]);
    var f = arguments.length - 2;
    if (f === 1) _.children = a;
    else if (1 < f) {
      for (var k = Array(f), O = 0; O < f; O++)
        k[O] = arguments[O + 2];
      _.children = k;
    }
    if (t && t.defaultProps)
      for (i in f = t.defaultProps, f)
        _[i] === void 0 && (_[i] = f[i]);
    return P(t, h, _);
  }, l.createRef = function() {
    return { current: null };
  }, l.forwardRef = function(t) {
    return { $$typeof: A, render: t };
  }, l.isValidElement = oe, l.lazy = function(t) {
    return {
      $$typeof: M,
      _payload: { _status: -1, _result: t },
      _init: ee
    };
  }, l.memo = function(t, n) {
    return {
      $$typeof: Q,
      type: t,
      compare: n === void 0 ? null : n
    };
  }, l.startTransition = function(t) {
    var n = g.T, a = {};
    g.T = a;
    try {
      var i = t(), _ = g.S;
      _ !== null && _(a, i), typeof i == "object" && i !== null && typeof i.then == "function" && i.then(ne, B);
    } catch (h) {
      B(h);
    } finally {
      n !== null && a.types !== null && (n.types = a.types), g.T = n;
    }
  }, l.unstable_useCacheRefresh = function() {
    return g.H.useCacheRefresh();
  }, l.use = function(t) {
    return g.H.use(t);
  }, l.useActionState = function(t, n, a) {
    return g.H.useActionState(t, n, a);
  }, l.useCallback = function(t, n) {
    return g.H.useCallback(t, n);
  }, l.useContext = function(t) {
    return g.H.useContext(t);
  }, l.useDebugValue = function() {
  }, l.useDeferredValue = function(t, n) {
    return g.H.useDeferredValue(t, n);
  }, l.useEffect = function(t, n) {
    return g.H.useEffect(t, n);
  }, l.useEffectEvent = function(t) {
    return g.H.useEffectEvent(t);
  }, l.useId = function() {
    return g.H.useId();
  }, l.useImperativeHandle = function(t, n, a) {
    return g.H.useImperativeHandle(t, n, a);
  }, l.useInsertionEffect = function(t, n) {
    return g.H.useInsertionEffect(t, n);
  }, l.useLayoutEffect = function(t, n) {
    return g.H.useLayoutEffect(t, n);
  }, l.useMemo = function(t, n) {
    return g.H.useMemo(t, n);
  }, l.useOptimistic = function(t, n) {
    return g.H.useOptimistic(t, n);
  }, l.useReducer = function(t, n, a) {
    return g.H.useReducer(t, n, a);
  }, l.useRef = function(t) {
    return g.H.useRef(t);
  }, l.useState = function(t) {
    return g.H.useState(t);
  }, l.useSyncExternalStore = function(t, n, a) {
    return g.H.useSyncExternalStore(
      t,
      n,
      a
    );
  }, l.useTransition = function() {
    return g.H.useTransition();
  }, l.version = "19.2.6", l;
}
var le = { exports: {} };
le.exports;
var De;
function Ze() {
  return De || (De = 1, (function(m, s) {
    process.env.NODE_ENV !== "production" && (function() {
      function j(e, r) {
        Object.defineProperty(p.prototype, e, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              r[0],
              r[1]
            );
          }
        });
      }
      function b(e) {
        return e === null || typeof e != "object" ? null : (e = Re && e[Re] || e["@@iterator"], typeof e == "function" ? e : null);
      }
      function w(e, r) {
        e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
        var o = e + "." + r;
        Te[o] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          r,
          e
        ), Te[o] = !0);
      }
      function p(e, r, o) {
        this.props = e, this.context = r, this.refs = Ee, this.updater = o || we;
      }
      function S() {
      }
      function A(e, r, o) {
        this.props = e, this.context = r, this.refs = Ee, this.updater = o || we;
      }
      function z() {
      }
      function Q(e) {
        return "" + e;
      }
      function M(e) {
        try {
          Q(e);
          var r = !1;
        } catch {
          r = !0;
        }
        if (r) {
          r = console;
          var o = r.error, u = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
          return o.call(
            r,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            u
          ), Q(e);
        }
      }
      function L(e) {
        if (e == null) return null;
        if (typeof e == "function")
          return e.$$typeof === qe ? null : e.displayName || e.name || null;
        if (typeof e == "string") return e;
        switch (e) {
          case t:
            return "Fragment";
          case a:
            return "Profiler";
          case n:
            return "StrictMode";
          case f:
            return "Suspense";
          case k:
            return "SuspenseList";
          case ge:
            return "Activity";
        }
        if (typeof e == "object")
          switch (typeof e.tag == "number" && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), e.$$typeof) {
            case ue:
              return "Portal";
            case _:
              return e.displayName || "Context";
            case i:
              return (e._context.displayName || "Context") + ".Consumer";
            case h:
              var r = e.render;
              return e = e.displayName, e || (e = r.displayName || r.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
            case O:
              return r = e.displayName || null, r !== null ? r : L(e.type) || "Memo";
            case F:
              r = e._payload, e = e._init;
              try {
                return L(e(r));
              } catch {
              }
          }
        return null;
      }
      function G(e) {
        if (e === t) return "<>";
        if (typeof e == "object" && e !== null && e.$$typeof === F)
          return "<...>";
        try {
          var r = L(e);
          return r ? "<" + r + ">" : "<...>";
        } catch {
          return "<...>";
        }
      }
      function I() {
        var e = y.A;
        return e === null ? null : e.getOwner();
      }
      function $() {
        return Error("react-stack-top-frame");
      }
      function C(e) {
        if (pe.call(e, "key")) {
          var r = Object.getOwnPropertyDescriptor(e, "key").get;
          if (r && r.isReactWarning) return !1;
        }
        return e.key !== void 0;
      }
      function X(e, r) {
        function o() {
          Ae || (Ae = !0, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            r
          ));
        }
        o.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: o,
          configurable: !0
        });
      }
      function W() {
        var e = L(this.type);
        return Ce[e] || (Ce[e] = !0, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        )), e = this.props.ref, e !== void 0 ? e : null;
      }
      function K(e, r, o, u, c, v) {
        var d = o.ref;
        return e = {
          $$typeof: B,
          type: e,
          key: r,
          props: o,
          _owner: u
        }, (d !== void 0 ? d : null) !== null ? Object.defineProperty(e, "ref", {
          enumerable: !1,
          get: W
        }) : Object.defineProperty(e, "ref", { enumerable: !1, value: null }), e._store = {}, Object.defineProperty(e._store, "validated", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: 0
        }), Object.defineProperty(e, "_debugInfo", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: null
        }), Object.defineProperty(e, "_debugStack", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: c
        }), Object.defineProperty(e, "_debugTask", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: v
        }), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
      }
      function re(e, r) {
        return r = K(
          e.type,
          r,
          e.props,
          e._owner,
          e._debugStack,
          e._debugTask
        ), e._store && (r._store.validated = e._store.validated), r;
      }
      function V(e) {
        D(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e !== null && e.$$typeof === F && (e._payload.status === "fulfilled" ? D(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
      }
      function D(e) {
        return typeof e == "object" && e !== null && e.$$typeof === B;
      }
      function ne(e) {
        var r = { "=": "=0", ":": "=2" };
        return "$" + e.replace(/[=:]/g, function(o) {
          return r[o];
        });
      }
      function g(e, r) {
        return typeof e == "object" && e !== null && e.key != null ? (M(e.key), ne("" + e.key)) : r.toString(36);
      }
      function se(e) {
        switch (e.status) {
          case "fulfilled":
            return e.value;
          case "rejected":
            throw e.reason;
          default:
            switch (typeof e.status == "string" ? e.then(z, z) : (e.status = "pending", e.then(
              function(r) {
                e.status === "pending" && (e.status = "fulfilled", e.value = r);
              },
              function(r) {
                e.status === "pending" && (e.status = "rejected", e.reason = r);
              }
            )), e.status) {
              case "fulfilled":
                return e.value;
              case "rejected":
                throw e.reason;
            }
        }
        throw e;
      }
      function P(e, r, o, u, c) {
        var v = typeof e;
        (v === "undefined" || v === "boolean") && (e = null);
        var d = !1;
        if (e === null) d = !0;
        else
          switch (v) {
            case "bigint":
            case "string":
            case "number":
              d = !0;
              break;
            case "object":
              switch (e.$$typeof) {
                case B:
                case ue:
                  d = !0;
                  break;
                case F:
                  return d = e._init, P(
                    d(e._payload),
                    r,
                    o,
                    u,
                    c
                  );
              }
          }
        if (d) {
          d = e, c = c(d);
          var T = u === "" ? "." + g(d, 0) : u;
          return Oe(c) ? (o = "", T != null && (o = T.replace(Pe, "$&/") + "/"), P(c, r, o, "", function(te) {
            return te;
          })) : c != null && (D(c) && (c.key != null && (d && d.key === c.key || M(c.key)), o = re(
            c,
            o + (c.key == null || d && d.key === c.key ? "" : ("" + c.key).replace(
              Pe,
              "$&/"
            ) + "/") + T
          ), u !== "" && d != null && D(d) && d.key == null && d._store && !d._store.validated && (o._store.validated = 2), c = o), r.push(c)), 1;
        }
        if (d = 0, T = u === "" ? "." : u + ":", Oe(e))
          for (var E = 0; E < e.length; E++)
            u = e[E], v = T + g(u, E), d += P(
              u,
              r,
              o,
              v,
              c
            );
        else if (E = b(e), typeof E == "function")
          for (E === e.entries && (je || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), je = !0), e = E.call(e), E = 0; !(u = e.next()).done; )
            u = u.value, v = T + g(u, E++), d += P(
              u,
              r,
              o,
              v,
              c
            );
        else if (v === "object") {
          if (typeof e.then == "function")
            return P(
              se(e),
              r,
              o,
              u,
              c
            );
          throw r = String(e), Error(
            "Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return d;
      }
      function Z(e, r, o) {
        if (e == null) return e;
        var u = [], c = 0;
        return P(e, u, "", "", function(v) {
          return r.call(o, v, c++);
        }), u;
      }
      function oe(e) {
        if (e._status === -1) {
          var r = e._ioInfo;
          r != null && (r.start = r.end = performance.now()), r = e._result;
          var o = r();
          if (o.then(
            function(c) {
              if (e._status === 0 || e._status === -1) {
                e._status = 1, e._result = c;
                var v = e._ioInfo;
                v != null && (v.end = performance.now()), o.status === void 0 && (o.status = "fulfilled", o.value = c);
              }
            },
            function(c) {
              if (e._status === 0 || e._status === -1) {
                e._status = 2, e._result = c;
                var v = e._ioInfo;
                v != null && (v.end = performance.now()), o.status === void 0 && (o.status = "rejected", o.reason = c);
              }
            }
          ), r = e._ioInfo, r != null) {
            r.value = o;
            var u = o.displayName;
            typeof u == "string" && (r.name = u);
          }
          e._status === -1 && (e._status = 0, e._result = o);
        }
        if (e._status === 1)
          return r = e._result, r === void 0 && console.error(
            `lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))

Did you accidentally put curly braces around the import?`,
            r
          ), "default" in r || console.error(
            `lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))`,
            r
          ), r.default;
        throw e._result;
      }
      function R() {
        var e = y.H;
        return e === null && console.error(
          `Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.`
        ), e;
      }
      function J() {
        y.asyncTransitions--;
      }
      function q(e) {
        if (de === null)
          try {
            var r = ("require" + Math.random()).slice(0, 7);
            de = (m && m[r]).call(
              m,
              "timers"
            ).setImmediate;
          } catch {
            de = function(u) {
              $e === !1 && ($e = !0, typeof MessageChannel > "u" && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var c = new MessageChannel();
              c.port1.onmessage = u, c.port2.postMessage(void 0);
            };
          }
        return de(e);
      }
      function U(e) {
        return 1 < e.length && typeof AggregateError == "function" ? new AggregateError(e) : e[0];
      }
      function N(e, r) {
        r !== _e - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        ), _e = r;
      }
      function x(e, r, o) {
        var u = y.actQueue;
        if (u !== null)
          if (u.length !== 0)
            try {
              ee(u), q(function() {
                return x(e, r, o);
              });
              return;
            } catch (c) {
              y.thrownErrors.push(c);
            }
          else y.actQueue = null;
        0 < y.thrownErrors.length ? (u = U(y.thrownErrors), y.thrownErrors.length = 0, o(u)) : r(e);
      }
      function ee(e) {
        if (!he) {
          he = !0;
          var r = 0;
          try {
            for (; r < e.length; r++) {
              var o = e[r];
              do {
                y.didUsePromise = !1;
                var u = o(!1);
                if (u !== null) {
                  if (y.didUsePromise) {
                    e[r] = o, e.splice(0, r);
                    return;
                  }
                  o = u;
                } else break;
              } while (!0);
            }
            e.length = 0;
          } catch (c) {
            e.splice(0, r + 1), y.thrownErrors.push(c);
          } finally {
            he = !1;
          }
        }
      }
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var B = /* @__PURE__ */ Symbol.for("react.transitional.element"), ue = /* @__PURE__ */ Symbol.for("react.portal"), t = /* @__PURE__ */ Symbol.for("react.fragment"), n = /* @__PURE__ */ Symbol.for("react.strict_mode"), a = /* @__PURE__ */ Symbol.for("react.profiler"), i = /* @__PURE__ */ Symbol.for("react.consumer"), _ = /* @__PURE__ */ Symbol.for("react.context"), h = /* @__PURE__ */ Symbol.for("react.forward_ref"), f = /* @__PURE__ */ Symbol.for("react.suspense"), k = /* @__PURE__ */ Symbol.for("react.suspense_list"), O = /* @__PURE__ */ Symbol.for("react.memo"), F = /* @__PURE__ */ Symbol.for("react.lazy"), ge = /* @__PURE__ */ Symbol.for("react.activity"), Re = Symbol.iterator, Te = {}, we = {
        isMounted: function() {
          return !1;
        },
        enqueueForceUpdate: function(e) {
          w(e, "forceUpdate");
        },
        enqueueReplaceState: function(e) {
          w(e, "replaceState");
        },
        enqueueSetState: function(e) {
          w(e, "setState");
        }
      }, be = Object.assign, Ee = {};
      Object.freeze(Ee), p.prototype.isReactComponent = {}, p.prototype.setState = function(e, r) {
        if (typeof e != "object" && typeof e != "function" && e != null)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, e, r, "setState");
      }, p.prototype.forceUpdate = function(e) {
        this.updater.enqueueForceUpdate(this, e, "forceUpdate");
      };
      var Y = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      };
      for (ie in Y)
        Y.hasOwnProperty(ie) && j(ie, Y[ie]);
      S.prototype = p.prototype, Y = A.prototype = new S(), Y.constructor = A, be(Y, p.prototype), Y.isPureReactComponent = !0;
      var Oe = Array.isArray, qe = /* @__PURE__ */ Symbol.for("react.client.reference"), y = {
        H: null,
        A: null,
        T: null,
        S: null,
        actQueue: null,
        asyncTransitions: 0,
        isBatchingLegacy: !1,
        didScheduleLegacyUpdate: !1,
        didUsePromise: !1,
        thrownErrors: [],
        getCurrentStack: null,
        recentlyCreatedOwnerStacks: 0
      }, pe = Object.prototype.hasOwnProperty, ke = console.createTask ? console.createTask : function() {
        return null;
      };
      Y = {
        react_stack_bottom_frame: function(e) {
          return e();
        }
      };
      var Ae, Se, Ce = {}, ze = Y.react_stack_bottom_frame.bind(
        Y,
        $
      )(), Ge = ke(G($)), je = !1, Pe = /\/+/g, Ne = typeof reportError == "function" ? reportError : function(e) {
        if (typeof window == "object" && typeof window.ErrorEvent == "function") {
          var r = new window.ErrorEvent("error", {
            bubbles: !0,
            cancelable: !0,
            message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e),
            error: e
          });
          if (!window.dispatchEvent(r)) return;
        } else if (typeof process == "object" && typeof process.emit == "function") {
          process.emit("uncaughtException", e);
          return;
        }
        console.error(e);
      }, $e = !1, de = null, _e = 0, me = !1, he = !1, Me = typeof queueMicrotask == "function" ? function(e) {
        queueMicrotask(function() {
          return queueMicrotask(e);
        });
      } : q;
      Y = Object.freeze({
        __proto__: null,
        c: function(e) {
          return R().useMemoCache(e);
        }
      });
      var ie = {
        map: Z,
        forEach: function(e, r, o) {
          Z(
            e,
            function() {
              r.apply(this, arguments);
            },
            o
          );
        },
        count: function(e) {
          var r = 0;
          return Z(e, function() {
            r++;
          }), r;
        },
        toArray: function(e) {
          return Z(e, function(r) {
            return r;
          }) || [];
        },
        only: function(e) {
          if (!D(e))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return e;
        }
      };
      s.Activity = ge, s.Children = ie, s.Component = p, s.Fragment = t, s.Profiler = a, s.PureComponent = A, s.StrictMode = n, s.Suspense = f, s.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = y, s.__COMPILER_RUNTIME = Y, s.act = function(e) {
        var r = y.actQueue, o = _e;
        _e++;
        var u = y.actQueue = r !== null ? r : [], c = !1;
        try {
          var v = e();
        } catch (E) {
          y.thrownErrors.push(E);
        }
        if (0 < y.thrownErrors.length)
          throw N(r, o), e = U(y.thrownErrors), y.thrownErrors.length = 0, e;
        if (v !== null && typeof v == "object" && typeof v.then == "function") {
          var d = v;
          return Me(function() {
            c || me || (me = !0, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          }), {
            then: function(E, te) {
              c = !0, d.then(
                function(ae) {
                  if (N(r, o), o === 0) {
                    try {
                      ee(u), q(function() {
                        return x(
                          ae,
                          E,
                          te
                        );
                      });
                    } catch (Fe) {
                      y.thrownErrors.push(Fe);
                    }
                    if (0 < y.thrownErrors.length) {
                      var Be = U(
                        y.thrownErrors
                      );
                      y.thrownErrors.length = 0, te(Be);
                    }
                  } else E(ae);
                },
                function(ae) {
                  N(r, o), 0 < y.thrownErrors.length && (ae = U(
                    y.thrownErrors
                  ), y.thrownErrors.length = 0), te(ae);
                }
              );
            }
          };
        }
        var T = v;
        if (N(r, o), o === 0 && (ee(u), u.length !== 0 && Me(function() {
          c || me || (me = !0, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), y.actQueue = null), 0 < y.thrownErrors.length)
          throw e = U(y.thrownErrors), y.thrownErrors.length = 0, e;
        return {
          then: function(E, te) {
            c = !0, o === 0 ? (y.actQueue = u, q(function() {
              return x(
                T,
                E,
                te
              );
            })) : E(T);
          }
        };
      }, s.cache = function(e) {
        return function() {
          return e.apply(null, arguments);
        };
      }, s.cacheSignal = function() {
        return null;
      }, s.captureOwnerStack = function() {
        var e = y.getCurrentStack;
        return e === null ? null : e();
      }, s.cloneElement = function(e, r, o) {
        if (e == null)
          throw Error(
            "The argument must be a React element, but you passed " + e + "."
          );
        var u = be({}, e.props), c = e.key, v = e._owner;
        if (r != null) {
          var d;
          e: {
            if (pe.call(r, "ref") && (d = Object.getOwnPropertyDescriptor(
              r,
              "ref"
            ).get) && d.isReactWarning) {
              d = !1;
              break e;
            }
            d = r.ref !== void 0;
          }
          d && (v = I()), C(r) && (M(r.key), c = "" + r.key);
          for (T in r)
            !pe.call(r, T) || T === "key" || T === "__self" || T === "__source" || T === "ref" && r.ref === void 0 || (u[T] = r[T]);
        }
        var T = arguments.length - 2;
        if (T === 1) u.children = o;
        else if (1 < T) {
          d = Array(T);
          for (var E = 0; E < T; E++)
            d[E] = arguments[E + 2];
          u.children = d;
        }
        for (u = K(
          e.type,
          c,
          u,
          v,
          e._debugStack,
          e._debugTask
        ), c = 2; c < arguments.length; c++)
          V(arguments[c]);
        return u;
      }, s.createContext = function(e) {
        return e = {
          $$typeof: _,
          _currentValue: e,
          _currentValue2: e,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        }, e.Provider = e, e.Consumer = {
          $$typeof: i,
          _context: e
        }, e._currentRenderer = null, e._currentRenderer2 = null, e;
      }, s.createElement = function(e, r, o) {
        for (var u = 2; u < arguments.length; u++)
          V(arguments[u]);
        u = {};
        var c = null;
        if (r != null)
          for (E in Se || !("__self" in r) || "key" in r || (Se = !0, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), C(r) && (M(r.key), c = "" + r.key), r)
            pe.call(r, E) && E !== "key" && E !== "__self" && E !== "__source" && (u[E] = r[E]);
        var v = arguments.length - 2;
        if (v === 1) u.children = o;
        else if (1 < v) {
          for (var d = Array(v), T = 0; T < v; T++)
            d[T] = arguments[T + 2];
          Object.freeze && Object.freeze(d), u.children = d;
        }
        if (e && e.defaultProps)
          for (E in v = e.defaultProps, v)
            u[E] === void 0 && (u[E] = v[E]);
        c && X(
          u,
          typeof e == "function" ? e.displayName || e.name || "Unknown" : e
        );
        var E = 1e4 > y.recentlyCreatedOwnerStacks++;
        return K(
          e,
          c,
          u,
          I(),
          E ? Error("react-stack-top-frame") : ze,
          E ? ke(G(e)) : Ge
        );
      }, s.createRef = function() {
        var e = { current: null };
        return Object.seal(e), e;
      }, s.forwardRef = function(e) {
        e != null && e.$$typeof === O ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : typeof e != "function" ? console.error(
          "forwardRef requires a render function but was given %s.",
          e === null ? "null" : typeof e
        ) : e.length !== 0 && e.length !== 2 && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        ), e != null && e.defaultProps != null && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var r = { $$typeof: h, render: e }, o;
        return Object.defineProperty(r, "displayName", {
          enumerable: !1,
          configurable: !0,
          get: function() {
            return o;
          },
          set: function(u) {
            o = u, e.name || e.displayName || (Object.defineProperty(e, "name", { value: u }), e.displayName = u);
          }
        }), r;
      }, s.isValidElement = D, s.lazy = function(e) {
        e = { _status: -1, _result: e };
        var r = {
          $$typeof: F,
          _payload: e,
          _init: oe
        }, o = {
          name: "lazy",
          start: -1,
          end: -1,
          value: null,
          owner: null,
          debugStack: Error("react-stack-top-frame"),
          debugTask: console.createTask ? console.createTask("lazy()") : null
        };
        return e._ioInfo = o, r._debugInfo = [{ awaited: o }], r;
      }, s.memo = function(e, r) {
        e == null && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          e === null ? "null" : typeof e
        ), r = {
          $$typeof: O,
          type: e,
          compare: r === void 0 ? null : r
        };
        var o;
        return Object.defineProperty(r, "displayName", {
          enumerable: !1,
          configurable: !0,
          get: function() {
            return o;
          },
          set: function(u) {
            o = u, e.name || e.displayName || (Object.defineProperty(e, "name", { value: u }), e.displayName = u);
          }
        }), r;
      }, s.startTransition = function(e) {
        var r = y.T, o = {};
        o._updatedFibers = /* @__PURE__ */ new Set(), y.T = o;
        try {
          var u = e(), c = y.S;
          c !== null && c(o, u), typeof u == "object" && u !== null && typeof u.then == "function" && (y.asyncTransitions++, u.then(J, J), u.then(z, Ne));
        } catch (v) {
          Ne(v);
        } finally {
          r === null && o._updatedFibers && (e = o._updatedFibers.size, o._updatedFibers.clear(), 10 < e && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), r !== null && o.types !== null && (r.types !== null && r.types !== o.types && console.error(
            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
          ), r.types = o.types), y.T = r;
        }
      }, s.unstable_useCacheRefresh = function() {
        return R().useCacheRefresh();
      }, s.use = function(e) {
        return R().use(e);
      }, s.useActionState = function(e, r, o) {
        return R().useActionState(
          e,
          r,
          o
        );
      }, s.useCallback = function(e, r) {
        return R().useCallback(e, r);
      }, s.useContext = function(e) {
        var r = R();
        return e.$$typeof === i && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        ), r.useContext(e);
      }, s.useDebugValue = function(e, r) {
        return R().useDebugValue(e, r);
      }, s.useDeferredValue = function(e, r) {
        return R().useDeferredValue(e, r);
      }, s.useEffect = function(e, r) {
        return e == null && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        ), R().useEffect(e, r);
      }, s.useEffectEvent = function(e) {
        return R().useEffectEvent(e);
      }, s.useId = function() {
        return R().useId();
      }, s.useImperativeHandle = function(e, r, o) {
        return R().useImperativeHandle(e, r, o);
      }, s.useInsertionEffect = function(e, r) {
        return e == null && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        ), R().useInsertionEffect(e, r);
      }, s.useLayoutEffect = function(e, r) {
        return e == null && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        ), R().useLayoutEffect(e, r);
      }, s.useMemo = function(e, r) {
        return R().useMemo(e, r);
      }, s.useOptimistic = function(e, r) {
        return R().useOptimistic(e, r);
      }, s.useReducer = function(e, r, o) {
        return R().useReducer(e, r, o);
      }, s.useRef = function(e) {
        return R().useRef(e);
      }, s.useState = function(e) {
        return R().useState(e);
      }, s.useSyncExternalStore = function(e, r, o) {
        return R().useSyncExternalStore(
          e,
          r,
          o
        );
      }, s.useTransition = function() {
        return R().useTransition();
      }, s.version = "19.2.6", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  })(le, le.exports)), le.exports;
}
var Ue;
function Je() {
  return Ue || (Ue = 1, process.env.NODE_ENV === "production" ? ve.exports = Ve() : ve.exports = Ze()), ve.exports;
}
var xe;
function et() {
  return xe || (xe = 1, process.env.NODE_ENV !== "production" && (function() {
    function m(t) {
      if (t == null) return null;
      if (typeof t == "function")
        return t.$$typeof === oe ? null : t.displayName || t.name || null;
      if (typeof t == "string") return t;
      switch (t) {
        case X:
          return "Fragment";
        case K:
          return "Profiler";
        case W:
          return "StrictMode";
        case ne:
          return "Suspense";
        case g:
          return "SuspenseList";
        case Z:
          return "Activity";
      }
      if (typeof t == "object")
        switch (typeof t.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), t.$$typeof) {
          case C:
            return "Portal";
          case V:
            return t.displayName || "Context";
          case re:
            return (t._context.displayName || "Context") + ".Consumer";
          case D:
            var n = t.render;
            return t = t.displayName, t || (t = n.displayName || n.name || "", t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef"), t;
          case se:
            return n = t.displayName || null, n !== null ? n : m(t.type) || "Memo";
          case P:
            n = t._payload, t = t._init;
            try {
              return m(t(n));
            } catch {
            }
        }
      return null;
    }
    function s(t) {
      return "" + t;
    }
    function j(t) {
      try {
        s(t);
        var n = !1;
      } catch {
        n = !0;
      }
      if (n) {
        n = console;
        var a = n.error, i = typeof Symbol == "function" && Symbol.toStringTag && t[Symbol.toStringTag] || t.constructor.name || "Object";
        return a.call(
          n,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          i
        ), s(t);
      }
    }
    function b(t) {
      if (t === X) return "<>";
      if (typeof t == "object" && t !== null && t.$$typeof === P)
        return "<...>";
      try {
        var n = m(t);
        return n ? "<" + n + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function w() {
      var t = R.A;
      return t === null ? null : t.getOwner();
    }
    function p() {
      return Error("react-stack-top-frame");
    }
    function S(t) {
      if (J.call(t, "key")) {
        var n = Object.getOwnPropertyDescriptor(t, "key").get;
        if (n && n.isReactWarning) return !1;
      }
      return t.key !== void 0;
    }
    function A(t, n) {
      function a() {
        N || (N = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          n
        ));
      }
      a.isReactWarning = !0, Object.defineProperty(t, "key", {
        get: a,
        configurable: !0
      });
    }
    function z() {
      var t = m(this.type);
      return x[t] || (x[t] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), t = this.props.ref, t !== void 0 ? t : null;
    }
    function Q(t, n, a, i, _, h) {
      var f = a.ref;
      return t = {
        $$typeof: $,
        type: t,
        key: n,
        props: a,
        _owner: i
      }, (f !== void 0 ? f : null) !== null ? Object.defineProperty(t, "ref", {
        enumerable: !1,
        get: z
      }) : Object.defineProperty(t, "ref", { enumerable: !1, value: null }), t._store = {}, Object.defineProperty(t._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(t, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(t, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: _
      }), Object.defineProperty(t, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: h
      }), Object.freeze && (Object.freeze(t.props), Object.freeze(t)), t;
    }
    function M(t, n, a, i, _, h) {
      var f = n.children;
      if (f !== void 0)
        if (i)
          if (q(f)) {
            for (i = 0; i < f.length; i++)
              L(f[i]);
            Object.freeze && Object.freeze(f);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else L(f);
      if (J.call(n, "key")) {
        f = m(t);
        var k = Object.keys(n).filter(function(F) {
          return F !== "key";
        });
        i = 0 < k.length ? "{key: someKey, " + k.join(": ..., ") + ": ...}" : "{key: someKey}", ue[f + i] || (k = 0 < k.length ? "{" + k.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          i,
          f,
          k,
          f
        ), ue[f + i] = !0);
      }
      if (f = null, a !== void 0 && (j(a), f = "" + a), S(n) && (j(n.key), f = "" + n.key), "key" in n) {
        a = {};
        for (var O in n)
          O !== "key" && (a[O] = n[O]);
      } else a = n;
      return f && A(
        a,
        typeof t == "function" ? t.displayName || t.name || "Unknown" : t
      ), Q(
        t,
        f,
        a,
        w(),
        _,
        h
      );
    }
    function L(t) {
      G(t) ? t._store && (t._store.validated = 1) : typeof t == "object" && t !== null && t.$$typeof === P && (t._payload.status === "fulfilled" ? G(t._payload.value) && t._payload.value._store && (t._payload.value._store.validated = 1) : t._store && (t._store.validated = 1));
    }
    function G(t) {
      return typeof t == "object" && t !== null && t.$$typeof === $;
    }
    var I = Je(), $ = /* @__PURE__ */ Symbol.for("react.transitional.element"), C = /* @__PURE__ */ Symbol.for("react.portal"), X = /* @__PURE__ */ Symbol.for("react.fragment"), W = /* @__PURE__ */ Symbol.for("react.strict_mode"), K = /* @__PURE__ */ Symbol.for("react.profiler"), re = /* @__PURE__ */ Symbol.for("react.consumer"), V = /* @__PURE__ */ Symbol.for("react.context"), D = /* @__PURE__ */ Symbol.for("react.forward_ref"), ne = /* @__PURE__ */ Symbol.for("react.suspense"), g = /* @__PURE__ */ Symbol.for("react.suspense_list"), se = /* @__PURE__ */ Symbol.for("react.memo"), P = /* @__PURE__ */ Symbol.for("react.lazy"), Z = /* @__PURE__ */ Symbol.for("react.activity"), oe = /* @__PURE__ */ Symbol.for("react.client.reference"), R = I.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, J = Object.prototype.hasOwnProperty, q = Array.isArray, U = console.createTask ? console.createTask : function() {
      return null;
    };
    I = {
      react_stack_bottom_frame: function(t) {
        return t();
      }
    };
    var N, x = {}, ee = I.react_stack_bottom_frame.bind(
      I,
      p
    )(), B = U(b(p)), ue = {};
    fe.Fragment = X, fe.jsx = function(t, n, a) {
      var i = 1e4 > R.recentlyCreatedOwnerStacks++;
      return M(
        t,
        n,
        a,
        !1,
        i ? Error("react-stack-top-frame") : ee,
        i ? U(b(t)) : B
      );
    }, fe.jsxs = function(t, n, a) {
      var i = 1e4 > R.recentlyCreatedOwnerStacks++;
      return M(
        t,
        n,
        a,
        !0,
        i ? Error("react-stack-top-frame") : ee,
        i ? U(b(t)) : B
      );
    };
  })()), fe;
}
var He;
function tt() {
  return He || (He = 1, process.env.NODE_ENV === "production" ? ye.exports = Ke() : ye.exports = et()), ye.exports;
}
var H = tt();
const rt = {
  inbox: "Inbox",
  shortlisted: "Shortlist",
  booked: "Booked",
  itinerary_draft: "Itinerary draft",
  missing_pieces: "Missing pieces"
}, nt = (m) => typeof m == "string" ? m : m.title || m.raw_content || "Saved option", We = (m) => typeof m == "string" ? [] : [m.item_type, m.price_note, m.date_note, m.location_note].filter(
  Boolean
);
function ut({ board: m }) {
  const s = m.lanes ?? {}, j = Object.entries(s).filter(([, b]) => b.length > 0);
  return /* @__PURE__ */ H.jsxs("section", { className: "travel-trip-board", "aria-label": "Trip board", children: [
    /* @__PURE__ */ H.jsxs("header", { children: [
      /* @__PURE__ */ H.jsx("p", { children: m.trip?.destination || "Trip workspace" }),
      /* @__PURE__ */ H.jsx("h1", { children: m.trip?.title || "Trip board" })
    ] }),
    /* @__PURE__ */ H.jsx("div", { className: "travel-trip-board__lanes", children: j.map(([b, w]) => /* @__PURE__ */ H.jsxs("section", { className: "travel-trip-board__lane", children: [
      /* @__PURE__ */ H.jsx("h2", { children: rt[b] ?? b.replaceAll("_", " ") }),
      /* @__PURE__ */ H.jsx("ul", { children: w.slice(0, 6).map((p, S) => /* @__PURE__ */ H.jsxs("li", { children: [
        /* @__PURE__ */ H.jsx("strong", { children: nt(p) }),
        We(p).length > 0 ? /* @__PURE__ */ H.jsx("span", { children: We(p).join(" · ") }) : null
      ] }, typeof p == "string" ? `${b}-${S}` : p.id)) })
    ] }, b)) })
  ] });
}
export {
  ut as TripBoard,
  ot as renderWidget
};
