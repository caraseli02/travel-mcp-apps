function en(e, r) {
  for (var o = 0; o < r.length; o++) {
    const s = r[o];
    if (typeof s != "string" && !Array.isArray(s)) {
      for (const i in s)
        if (i !== "default" && !(i in e)) {
          const l = Object.getOwnPropertyDescriptor(s, i);
          l && Object.defineProperty(e, i, l.get ? l : {
            enumerable: !0,
            get: () => s[i]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }));
}
var Ge = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function tn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var qe = { exports: {} }, Se = {};
var Mt;
function rn() {
  if (Mt) return Se;
  Mt = 1;
  var e = /* @__PURE__ */ Symbol.for("react.transitional.element"), r = /* @__PURE__ */ Symbol.for("react.fragment");
  function o(s, i, l) {
    var h = null;
    if (l !== void 0 && (h = "" + l), i.key !== void 0 && (h = "" + i.key), "key" in i) {
      l = {};
      for (var p in i)
        p !== "key" && (l[p] = i[p]);
    } else l = i;
    return i = l.ref, {
      $$typeof: e,
      type: s,
      key: h,
      ref: i !== void 0 ? i : null,
      props: l
    };
  }
  return Se.Fragment = r, Se.jsx = o, Se.jsxs = o, Se;
}
var ke = {}, He = { exports: {} }, $ = {};
var Pt;
function nn() {
  if (Pt) return $;
  Pt = 1;
  var e = /* @__PURE__ */ Symbol.for("react.transitional.element"), r = /* @__PURE__ */ Symbol.for("react.portal"), o = /* @__PURE__ */ Symbol.for("react.fragment"), s = /* @__PURE__ */ Symbol.for("react.strict_mode"), i = /* @__PURE__ */ Symbol.for("react.profiler"), l = /* @__PURE__ */ Symbol.for("react.consumer"), h = /* @__PURE__ */ Symbol.for("react.context"), p = /* @__PURE__ */ Symbol.for("react.forward_ref"), f = /* @__PURE__ */ Symbol.for("react.suspense"), c = /* @__PURE__ */ Symbol.for("react.memo"), g = /* @__PURE__ */ Symbol.for("react.lazy"), u = /* @__PURE__ */ Symbol.for("react.activity"), d = Symbol.iterator;
  function x(a) {
    return a === null || typeof a != "object" ? null : (a = d && a[d] || a["@@iterator"], typeof a == "function" ? a : null);
  }
  var j = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, E = Object.assign, w = {};
  function A(a, v, N) {
    this.props = a, this.context = v, this.refs = w, this.updater = N || j;
  }
  A.prototype.isReactComponent = {}, A.prototype.setState = function(a, v) {
    if (typeof a != "object" && typeof a != "function" && a != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, a, v, "setState");
  }, A.prototype.forceUpdate = function(a) {
    this.updater.enqueueForceUpdate(this, a, "forceUpdate");
  };
  function R() {
  }
  R.prototype = A.prototype;
  function I(a, v, N) {
    this.props = a, this.context = v, this.refs = w, this.updater = N || j;
  }
  var M = I.prototype = new R();
  M.constructor = I, E(M, A.prototype), M.isPureReactComponent = !0;
  var b = Array.isArray;
  function S() {
  }
  var k = { H: null, A: null, T: null, S: null }, L = Object.prototype.hasOwnProperty;
  function Y(a, v, N) {
    var T = N.ref;
    return {
      $$typeof: e,
      type: a,
      key: v,
      ref: T !== void 0 ? T : null,
      props: N
    };
  }
  function K(a, v) {
    return Y(a.type, v, a.props);
  }
  function Z(a) {
    return typeof a == "object" && a !== null && a.$$typeof === e;
  }
  function D(a) {
    var v = { "=": "=0", ":": "=2" };
    return "$" + a.replace(/[=:]/g, function(N) {
      return v[N];
    });
  }
  var te = /\/+/g;
  function re(a, v) {
    return typeof a == "object" && a !== null && a.key != null ? D("" + a.key) : v.toString(36);
  }
  function z(a) {
    switch (a.status) {
      case "fulfilled":
        return a.value;
      case "rejected":
        throw a.reason;
      default:
        switch (typeof a.status == "string" ? a.then(S, S) : (a.status = "pending", a.then(
          function(v) {
            a.status === "pending" && (a.status = "fulfilled", a.value = v);
          },
          function(v) {
            a.status === "pending" && (a.status = "rejected", a.reason = v);
          }
        )), a.status) {
          case "fulfilled":
            return a.value;
          case "rejected":
            throw a.reason;
        }
    }
    throw a;
  }
  function F(a, v, N, T, B) {
    var G = typeof a;
    (G === "undefined" || G === "boolean") && (a = null);
    var O = !1;
    if (a === null) O = !0;
    else
      switch (G) {
        case "bigint":
        case "string":
        case "number":
          O = !0;
          break;
        case "object":
          switch (a.$$typeof) {
            case e:
            case r:
              O = !0;
              break;
            case g:
              return O = a._init, F(
                O(a._payload),
                v,
                N,
                T,
                B
              );
          }
      }
    if (O)
      return B = B(a), O = T === "" ? "." + re(a, 0) : T, b(B) ? (N = "", O != null && (N = O.replace(te, "$&/") + "/"), F(B, v, N, "", function(de) {
        return de;
      })) : B != null && (Z(B) && (B = K(
        B,
        N + (B.key == null || a && a.key === B.key ? "" : ("" + B.key).replace(
          te,
          "$&/"
        ) + "/") + O
      )), v.push(B)), 1;
    O = 0;
    var X = T === "" ? "." : T + ":";
    if (b(a))
      for (var Q = 0; Q < a.length; Q++)
        T = a[Q], G = X + re(T, Q), O += F(
          T,
          v,
          N,
          G,
          B
        );
    else if (Q = x(a), typeof Q == "function")
      for (a = Q.call(a), Q = 0; !(T = a.next()).done; )
        T = T.value, G = X + re(T, Q++), O += F(
          T,
          v,
          N,
          G,
          B
        );
    else if (G === "object") {
      if (typeof a.then == "function")
        return F(
          z(a),
          v,
          N,
          T,
          B
        );
      throw v = String(a), Error(
        "Objects are not valid as a React child (found: " + (v === "[object Object]" ? "object with keys {" + Object.keys(a).join(", ") + "}" : v) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return O;
  }
  function oe(a, v, N) {
    if (a == null) return a;
    var T = [], B = 0;
    return F(a, T, "", "", function(G) {
      return v.call(N, G, B++);
    }), T;
  }
  function le(a) {
    if (a._status === -1) {
      var v = a._result;
      v = v(), v.then(
        function(N) {
          (a._status === 0 || a._status === -1) && (a._status = 1, a._result = N);
        },
        function(N) {
          (a._status === 0 || a._status === -1) && (a._status = 2, a._result = N);
        }
      ), a._status === -1 && (a._status = 0, a._result = v);
    }
    if (a._status === 1) return a._result.default;
    throw a._result;
  }
  var ue = typeof reportError == "function" ? reportError : function(a) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var v = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof a == "object" && a !== null && typeof a.message == "string" ? String(a.message) : String(a),
        error: a
      });
      if (!window.dispatchEvent(v)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", a);
      return;
    }
    console.error(a);
  }, pe = {
    map: oe,
    forEach: function(a, v, N) {
      oe(
        a,
        function() {
          v.apply(this, arguments);
        },
        N
      );
    },
    count: function(a) {
      var v = 0;
      return oe(a, function() {
        v++;
      }), v;
    },
    toArray: function(a) {
      return oe(a, function(v) {
        return v;
      }) || [];
    },
    only: function(a) {
      if (!Z(a))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return a;
    }
  };
  return $.Activity = u, $.Children = pe, $.Component = A, $.Fragment = o, $.Profiler = i, $.PureComponent = I, $.StrictMode = s, $.Suspense = f, $.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = k, $.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(a) {
      return k.H.useMemoCache(a);
    }
  }, $.cache = function(a) {
    return function() {
      return a.apply(null, arguments);
    };
  }, $.cacheSignal = function() {
    return null;
  }, $.cloneElement = function(a, v, N) {
    if (a == null)
      throw Error(
        "The argument must be a React element, but you passed " + a + "."
      );
    var T = E({}, a.props), B = a.key;
    if (v != null)
      for (G in v.key !== void 0 && (B = "" + v.key), v)
        !L.call(v, G) || G === "key" || G === "__self" || G === "__source" || G === "ref" && v.ref === void 0 || (T[G] = v[G]);
    var G = arguments.length - 2;
    if (G === 1) T.children = N;
    else if (1 < G) {
      for (var O = Array(G), X = 0; X < G; X++)
        O[X] = arguments[X + 2];
      T.children = O;
    }
    return Y(a.type, B, T);
  }, $.createContext = function(a) {
    return a = {
      $$typeof: h,
      _currentValue: a,
      _currentValue2: a,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, a.Provider = a, a.Consumer = {
      $$typeof: l,
      _context: a
    }, a;
  }, $.createElement = function(a, v, N) {
    var T, B = {}, G = null;
    if (v != null)
      for (T in v.key !== void 0 && (G = "" + v.key), v)
        L.call(v, T) && T !== "key" && T !== "__self" && T !== "__source" && (B[T] = v[T]);
    var O = arguments.length - 2;
    if (O === 1) B.children = N;
    else if (1 < O) {
      for (var X = Array(O), Q = 0; Q < O; Q++)
        X[Q] = arguments[Q + 2];
      B.children = X;
    }
    if (a && a.defaultProps)
      for (T in O = a.defaultProps, O)
        B[T] === void 0 && (B[T] = O[T]);
    return Y(a, G, B);
  }, $.createRef = function() {
    return { current: null };
  }, $.forwardRef = function(a) {
    return { $$typeof: p, render: a };
  }, $.isValidElement = Z, $.lazy = function(a) {
    return {
      $$typeof: g,
      _payload: { _status: -1, _result: a },
      _init: le
    };
  }, $.memo = function(a, v) {
    return {
      $$typeof: c,
      type: a,
      compare: v === void 0 ? null : v
    };
  }, $.startTransition = function(a) {
    var v = k.T, N = {};
    k.T = N;
    try {
      var T = a(), B = k.S;
      B !== null && B(N, T), typeof T == "object" && T !== null && typeof T.then == "function" && T.then(S, ue);
    } catch (G) {
      ue(G);
    } finally {
      v !== null && N.types !== null && (v.types = N.types), k.T = v;
    }
  }, $.unstable_useCacheRefresh = function() {
    return k.H.useCacheRefresh();
  }, $.use = function(a) {
    return k.H.use(a);
  }, $.useActionState = function(a, v, N) {
    return k.H.useActionState(a, v, N);
  }, $.useCallback = function(a, v) {
    return k.H.useCallback(a, v);
  }, $.useContext = function(a) {
    return k.H.useContext(a);
  }, $.useDebugValue = function() {
  }, $.useDeferredValue = function(a, v) {
    return k.H.useDeferredValue(a, v);
  }, $.useEffect = function(a, v) {
    return k.H.useEffect(a, v);
  }, $.useEffectEvent = function(a) {
    return k.H.useEffectEvent(a);
  }, $.useId = function() {
    return k.H.useId();
  }, $.useImperativeHandle = function(a, v, N) {
    return k.H.useImperativeHandle(a, v, N);
  }, $.useInsertionEffect = function(a, v) {
    return k.H.useInsertionEffect(a, v);
  }, $.useLayoutEffect = function(a, v) {
    return k.H.useLayoutEffect(a, v);
  }, $.useMemo = function(a, v) {
    return k.H.useMemo(a, v);
  }, $.useOptimistic = function(a, v) {
    return k.H.useOptimistic(a, v);
  }, $.useReducer = function(a, v, N) {
    return k.H.useReducer(a, v, N);
  }, $.useRef = function(a) {
    return k.H.useRef(a);
  }, $.useState = function(a) {
    return k.H.useState(a);
  }, $.useSyncExternalStore = function(a, v, N) {
    return k.H.useSyncExternalStore(
      a,
      v,
      N
    );
  }, $.useTransition = function() {
    return k.H.useTransition();
  }, $.version = "19.2.6", $;
}
var Oe = { exports: {} };
Oe.exports;
var Dt;
function on() {
  return Dt || (Dt = 1, (function(e, r) {
    process.env.NODE_ENV !== "production" && (function() {
      function o(n, m) {
        Object.defineProperty(l.prototype, n, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              m[0],
              m[1]
            );
          }
        });
      }
      function s(n) {
        return n === null || typeof n != "object" ? null : (n = bt && n[bt] || n["@@iterator"], typeof n == "function" ? n : null);
      }
      function i(n, m) {
        n = (n = n.constructor) && (n.displayName || n.name) || "ReactClass";
        var _ = n + "." + m;
        _t[_] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          m,
          n
        ), _t[_] = !0);
      }
      function l(n, m, _) {
        this.props = n, this.context = m, this.refs = nt, this.updater = _ || wt;
      }
      function h() {
      }
      function p(n, m, _) {
        this.props = n, this.context = m, this.refs = nt, this.updater = _ || wt;
      }
      function f() {
      }
      function c(n) {
        return "" + n;
      }
      function g(n) {
        try {
          c(n);
          var m = !1;
        } catch {
          m = !0;
        }
        if (m) {
          m = console;
          var _ = m.error, C = typeof Symbol == "function" && Symbol.toStringTag && n[Symbol.toStringTag] || n.constructor.name || "Object";
          return _.call(
            m,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            C
          ), c(n);
        }
      }
      function u(n) {
        if (n == null) return null;
        if (typeof n == "function")
          return n.$$typeof === Kr ? null : n.displayName || n.name || null;
        if (typeof n == "string") return n;
        switch (n) {
          case a:
            return "Fragment";
          case N:
            return "Profiler";
          case v:
            return "StrictMode";
          case O:
            return "Suspense";
          case X:
            return "SuspenseList";
          case xt:
            return "Activity";
        }
        if (typeof n == "object")
          switch (typeof n.tag == "number" && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), n.$$typeof) {
            case pe:
              return "Portal";
            case B:
              return n.displayName || "Context";
            case T:
              return (n._context.displayName || "Context") + ".Consumer";
            case G:
              var m = n.render;
              return n = n.displayName, n || (n = m.displayName || m.name || "", n = n !== "" ? "ForwardRef(" + n + ")" : "ForwardRef"), n;
            case Q:
              return m = n.displayName || null, m !== null ? m : u(n.type) || "Memo";
            case de:
              m = n._payload, n = n._init;
              try {
                return u(n(m));
              } catch {
              }
          }
        return null;
      }
      function d(n) {
        if (n === a) return "<>";
        if (typeof n == "object" && n !== null && n.$$typeof === de)
          return "<...>";
        try {
          var m = u(n);
          return m ? "<" + m + ">" : "<...>";
        } catch {
          return "<...>";
        }
      }
      function x() {
        var n = q.A;
        return n === null ? null : n.getOwner();
      }
      function j() {
        return Error("react-stack-top-frame");
      }
      function E(n) {
        if (ze.call(n, "key")) {
          var m = Object.getOwnPropertyDescriptor(n, "key").get;
          if (m && m.isReactWarning) return !1;
        }
        return n.key !== void 0;
      }
      function w(n, m) {
        function _() {
          Nt || (Nt = !0, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            m
          ));
        }
        _.isReactWarning = !0, Object.defineProperty(n, "key", {
          get: _,
          configurable: !0
        });
      }
      function A() {
        var n = u(this.type);
        return Tt[n] || (Tt[n] = !0, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        )), n = this.props.ref, n !== void 0 ? n : null;
      }
      function R(n, m, _, C, P, H) {
        var U = _.ref;
        return n = {
          $$typeof: ue,
          type: n,
          key: m,
          props: _,
          _owner: C
        }, (U !== void 0 ? U : null) !== null ? Object.defineProperty(n, "ref", {
          enumerable: !1,
          get: A
        }) : Object.defineProperty(n, "ref", { enumerable: !1, value: null }), n._store = {}, Object.defineProperty(n._store, "validated", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: 0
        }), Object.defineProperty(n, "_debugInfo", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: null
        }), Object.defineProperty(n, "_debugStack", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: P
        }), Object.defineProperty(n, "_debugTask", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: H
        }), Object.freeze && (Object.freeze(n.props), Object.freeze(n)), n;
      }
      function I(n, m) {
        return m = R(
          n.type,
          m,
          n.props,
          n._owner,
          n._debugStack,
          n._debugTask
        ), n._store && (m._store.validated = n._store.validated), m;
      }
      function M(n) {
        b(n) ? n._store && (n._store.validated = 1) : typeof n == "object" && n !== null && n.$$typeof === de && (n._payload.status === "fulfilled" ? b(n._payload.value) && n._payload.value._store && (n._payload.value._store.validated = 1) : n._store && (n._store.validated = 1));
      }
      function b(n) {
        return typeof n == "object" && n !== null && n.$$typeof === ue;
      }
      function S(n) {
        var m = { "=": "=0", ":": "=2" };
        return "$" + n.replace(/[=:]/g, function(_) {
          return m[_];
        });
      }
      function k(n, m) {
        return typeof n == "object" && n !== null && n.key != null ? (g(n.key), S("" + n.key)) : m.toString(36);
      }
      function L(n) {
        switch (n.status) {
          case "fulfilled":
            return n.value;
          case "rejected":
            throw n.reason;
          default:
            switch (typeof n.status == "string" ? n.then(f, f) : (n.status = "pending", n.then(
              function(m) {
                n.status === "pending" && (n.status = "fulfilled", n.value = m);
              },
              function(m) {
                n.status === "pending" && (n.status = "rejected", n.reason = m);
              }
            )), n.status) {
              case "fulfilled":
                return n.value;
              case "rejected":
                throw n.reason;
            }
        }
        throw n;
      }
      function Y(n, m, _, C, P) {
        var H = typeof n;
        (H === "undefined" || H === "boolean") && (n = null);
        var U = !1;
        if (n === null) U = !0;
        else
          switch (H) {
            case "bigint":
            case "string":
            case "number":
              U = !0;
              break;
            case "object":
              switch (n.$$typeof) {
                case ue:
                case pe:
                  U = !0;
                  break;
                case de:
                  return U = n._init, Y(
                    U(n._payload),
                    m,
                    _,
                    C,
                    P
                  );
              }
          }
        if (U) {
          U = n, P = P(U);
          var J = C === "" ? "." + k(U, 0) : C;
          return Et(P) ? (_ = "", J != null && (_ = J.replace(kt, "$&/") + "/"), Y(P, m, _, "", function(be) {
            return be;
          })) : P != null && (b(P) && (P.key != null && (U && U.key === P.key || g(P.key)), _ = I(
            P,
            _ + (P.key == null || U && U.key === P.key ? "" : ("" + P.key).replace(
              kt,
              "$&/"
            ) + "/") + J
          ), C !== "" && U != null && b(U) && U.key == null && U._store && !U._store.validated && (_._store.validated = 2), P = _), m.push(P)), 1;
        }
        if (U = 0, J = C === "" ? "." : C + ":", Et(n))
          for (var W = 0; W < n.length; W++)
            C = n[W], H = J + k(C, W), U += Y(
              C,
              m,
              _,
              H,
              P
            );
        else if (W = s(n), typeof W == "function")
          for (W === n.entries && (St || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), St = !0), n = W.call(n), W = 0; !(C = n.next()).done; )
            C = C.value, H = J + k(C, W++), U += Y(
              C,
              m,
              _,
              H,
              P
            );
        else if (H === "object") {
          if (typeof n.then == "function")
            return Y(
              L(n),
              m,
              _,
              C,
              P
            );
          throw m = String(n), Error(
            "Objects are not valid as a React child (found: " + (m === "[object Object]" ? "object with keys {" + Object.keys(n).join(", ") + "}" : m) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return U;
      }
      function K(n, m, _) {
        if (n == null) return n;
        var C = [], P = 0;
        return Y(n, C, "", "", function(H) {
          return m.call(_, H, P++);
        }), C;
      }
      function Z(n) {
        if (n._status === -1) {
          var m = n._ioInfo;
          m != null && (m.start = m.end = performance.now()), m = n._result;
          var _ = m();
          if (_.then(
            function(P) {
              if (n._status === 0 || n._status === -1) {
                n._status = 1, n._result = P;
                var H = n._ioInfo;
                H != null && (H.end = performance.now()), _.status === void 0 && (_.status = "fulfilled", _.value = P);
              }
            },
            function(P) {
              if (n._status === 0 || n._status === -1) {
                n._status = 2, n._result = P;
                var H = n._ioInfo;
                H != null && (H.end = performance.now()), _.status === void 0 && (_.status = "rejected", _.reason = P);
              }
            }
          ), m = n._ioInfo, m != null) {
            m.value = _;
            var C = _.displayName;
            typeof C == "string" && (m.name = C);
          }
          n._status === -1 && (n._status = 0, n._result = _);
        }
        if (n._status === 1)
          return m = n._result, m === void 0 && console.error(
            `lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))

Did you accidentally put curly braces around the import?`,
            m
          ), "default" in m || console.error(
            `lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))`,
            m
          ), m.default;
        throw n._result;
      }
      function D() {
        var n = q.H;
        return n === null && console.error(
          `Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.`
        ), n;
      }
      function te() {
        q.asyncTransitions--;
      }
      function re(n) {
        if (Fe === null)
          try {
            var m = ("require" + Math.random()).slice(0, 7);
            Fe = (e && e[m]).call(
              e,
              "timers"
            ).setImmediate;
          } catch {
            Fe = function(C) {
              At === !1 && (At = !0, typeof MessageChannel > "u" && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var P = new MessageChannel();
              P.port1.onmessage = C, P.port2.postMessage(void 0);
            };
          }
        return Fe(n);
      }
      function z(n) {
        return 1 < n.length && typeof AggregateError == "function" ? new AggregateError(n) : n[0];
      }
      function F(n, m) {
        m !== Be - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        ), Be = m;
      }
      function oe(n, m, _) {
        var C = q.actQueue;
        if (C !== null)
          if (C.length !== 0)
            try {
              le(C), re(function() {
                return oe(n, m, _);
              });
              return;
            } catch (P) {
              q.thrownErrors.push(P);
            }
          else q.actQueue = null;
        0 < q.thrownErrors.length ? (C = z(q.thrownErrors), q.thrownErrors.length = 0, _(C)) : m(n);
      }
      function le(n) {
        if (!ot) {
          ot = !0;
          var m = 0;
          try {
            for (; m < n.length; m++) {
              var _ = n[m];
              do {
                q.didUsePromise = !1;
                var C = _(!1);
                if (C !== null) {
                  if (q.didUsePromise) {
                    n[m] = _, n.splice(0, m);
                    return;
                  }
                  _ = C;
                } else break;
              } while (!0);
            }
            n.length = 0;
          } catch (P) {
            n.splice(0, m + 1), q.thrownErrors.push(P);
          } finally {
            ot = !1;
          }
        }
      }
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var ue = /* @__PURE__ */ Symbol.for("react.transitional.element"), pe = /* @__PURE__ */ Symbol.for("react.portal"), a = /* @__PURE__ */ Symbol.for("react.fragment"), v = /* @__PURE__ */ Symbol.for("react.strict_mode"), N = /* @__PURE__ */ Symbol.for("react.profiler"), T = /* @__PURE__ */ Symbol.for("react.consumer"), B = /* @__PURE__ */ Symbol.for("react.context"), G = /* @__PURE__ */ Symbol.for("react.forward_ref"), O = /* @__PURE__ */ Symbol.for("react.suspense"), X = /* @__PURE__ */ Symbol.for("react.suspense_list"), Q = /* @__PURE__ */ Symbol.for("react.memo"), de = /* @__PURE__ */ Symbol.for("react.lazy"), xt = /* @__PURE__ */ Symbol.for("react.activity"), bt = Symbol.iterator, _t = {}, wt = {
        isMounted: function() {
          return !1;
        },
        enqueueForceUpdate: function(n) {
          i(n, "forceUpdate");
        },
        enqueueReplaceState: function(n) {
          i(n, "replaceState");
        },
        enqueueSetState: function(n) {
          i(n, "setState");
        }
      }, jt = Object.assign, nt = {};
      Object.freeze(nt), l.prototype.isReactComponent = {}, l.prototype.setState = function(n, m) {
        if (typeof n != "object" && typeof n != "function" && n != null)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, n, m, "setState");
      }, l.prototype.forceUpdate = function(n) {
        this.updater.enqueueForceUpdate(this, n, "forceUpdate");
      };
      var fe = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      };
      for (Te in fe)
        fe.hasOwnProperty(Te) && o(Te, fe[Te]);
      h.prototype = l.prototype, fe = p.prototype = new h(), fe.constructor = p, jt(fe, l.prototype), fe.isPureReactComponent = !0;
      var Et = Array.isArray, Kr = /* @__PURE__ */ Symbol.for("react.client.reference"), q = {
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
      }, ze = Object.prototype.hasOwnProperty, Rt = console.createTask ? console.createTask : function() {
        return null;
      };
      fe = {
        react_stack_bottom_frame: function(n) {
          return n();
        }
      };
      var Nt, Ct, Tt = {}, Xr = fe.react_stack_bottom_frame.bind(
        fe,
        j
      )(), Qr = Rt(d(j)), St = !1, kt = /\/+/g, Ot = typeof reportError == "function" ? reportError : function(n) {
        if (typeof window == "object" && typeof window.ErrorEvent == "function") {
          var m = new window.ErrorEvent("error", {
            bubbles: !0,
            cancelable: !0,
            message: typeof n == "object" && n !== null && typeof n.message == "string" ? String(n.message) : String(n),
            error: n
          });
          if (!window.dispatchEvent(m)) return;
        } else if (typeof process == "object" && typeof process.emit == "function") {
          process.emit("uncaughtException", n);
          return;
        }
        console.error(n);
      }, At = !1, Fe = null, Be = 0, Ue = !1, ot = !1, It = typeof queueMicrotask == "function" ? function(n) {
        queueMicrotask(function() {
          return queueMicrotask(n);
        });
      } : re;
      fe = Object.freeze({
        __proto__: null,
        c: function(n) {
          return D().useMemoCache(n);
        }
      });
      var Te = {
        map: K,
        forEach: function(n, m, _) {
          K(
            n,
            function() {
              m.apply(this, arguments);
            },
            _
          );
        },
        count: function(n) {
          var m = 0;
          return K(n, function() {
            m++;
          }), m;
        },
        toArray: function(n) {
          return K(n, function(m) {
            return m;
          }) || [];
        },
        only: function(n) {
          if (!b(n))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return n;
        }
      };
      r.Activity = xt, r.Children = Te, r.Component = l, r.Fragment = a, r.Profiler = N, r.PureComponent = p, r.StrictMode = v, r.Suspense = O, r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = q, r.__COMPILER_RUNTIME = fe, r.act = function(n) {
        var m = q.actQueue, _ = Be;
        Be++;
        var C = q.actQueue = m !== null ? m : [], P = !1;
        try {
          var H = n();
        } catch (W) {
          q.thrownErrors.push(W);
        }
        if (0 < q.thrownErrors.length)
          throw F(m, _), n = z(q.thrownErrors), q.thrownErrors.length = 0, n;
        if (H !== null && typeof H == "object" && typeof H.then == "function") {
          var U = H;
          return It(function() {
            P || Ue || (Ue = !0, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          }), {
            then: function(W, be) {
              P = !0, U.then(
                function(Re) {
                  if (F(m, _), _ === 0) {
                    try {
                      le(C), re(function() {
                        return oe(
                          Re,
                          W,
                          be
                        );
                      });
                    } catch (Jr) {
                      q.thrownErrors.push(Jr);
                    }
                    if (0 < q.thrownErrors.length) {
                      var Zr = z(
                        q.thrownErrors
                      );
                      q.thrownErrors.length = 0, be(Zr);
                    }
                  } else W(Re);
                },
                function(Re) {
                  F(m, _), 0 < q.thrownErrors.length && (Re = z(
                    q.thrownErrors
                  ), q.thrownErrors.length = 0), be(Re);
                }
              );
            }
          };
        }
        var J = H;
        if (F(m, _), _ === 0 && (le(C), C.length !== 0 && It(function() {
          P || Ue || (Ue = !0, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), q.actQueue = null), 0 < q.thrownErrors.length)
          throw n = z(q.thrownErrors), q.thrownErrors.length = 0, n;
        return {
          then: function(W, be) {
            P = !0, _ === 0 ? (q.actQueue = C, re(function() {
              return oe(
                J,
                W,
                be
              );
            })) : W(J);
          }
        };
      }, r.cache = function(n) {
        return function() {
          return n.apply(null, arguments);
        };
      }, r.cacheSignal = function() {
        return null;
      }, r.captureOwnerStack = function() {
        var n = q.getCurrentStack;
        return n === null ? null : n();
      }, r.cloneElement = function(n, m, _) {
        if (n == null)
          throw Error(
            "The argument must be a React element, but you passed " + n + "."
          );
        var C = jt({}, n.props), P = n.key, H = n._owner;
        if (m != null) {
          var U;
          e: {
            if (ze.call(m, "ref") && (U = Object.getOwnPropertyDescriptor(
              m,
              "ref"
            ).get) && U.isReactWarning) {
              U = !1;
              break e;
            }
            U = m.ref !== void 0;
          }
          U && (H = x()), E(m) && (g(m.key), P = "" + m.key);
          for (J in m)
            !ze.call(m, J) || J === "key" || J === "__self" || J === "__source" || J === "ref" && m.ref === void 0 || (C[J] = m[J]);
        }
        var J = arguments.length - 2;
        if (J === 1) C.children = _;
        else if (1 < J) {
          U = Array(J);
          for (var W = 0; W < J; W++)
            U[W] = arguments[W + 2];
          C.children = U;
        }
        for (C = R(
          n.type,
          P,
          C,
          H,
          n._debugStack,
          n._debugTask
        ), P = 2; P < arguments.length; P++)
          M(arguments[P]);
        return C;
      }, r.createContext = function(n) {
        return n = {
          $$typeof: B,
          _currentValue: n,
          _currentValue2: n,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        }, n.Provider = n, n.Consumer = {
          $$typeof: T,
          _context: n
        }, n._currentRenderer = null, n._currentRenderer2 = null, n;
      }, r.createElement = function(n, m, _) {
        for (var C = 2; C < arguments.length; C++)
          M(arguments[C]);
        C = {};
        var P = null;
        if (m != null)
          for (W in Ct || !("__self" in m) || "key" in m || (Ct = !0, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), E(m) && (g(m.key), P = "" + m.key), m)
            ze.call(m, W) && W !== "key" && W !== "__self" && W !== "__source" && (C[W] = m[W]);
        var H = arguments.length - 2;
        if (H === 1) C.children = _;
        else if (1 < H) {
          for (var U = Array(H), J = 0; J < H; J++)
            U[J] = arguments[J + 2];
          Object.freeze && Object.freeze(U), C.children = U;
        }
        if (n && n.defaultProps)
          for (W in H = n.defaultProps, H)
            C[W] === void 0 && (C[W] = H[W]);
        P && w(
          C,
          typeof n == "function" ? n.displayName || n.name || "Unknown" : n
        );
        var W = 1e4 > q.recentlyCreatedOwnerStacks++;
        return R(
          n,
          P,
          C,
          x(),
          W ? Error("react-stack-top-frame") : Xr,
          W ? Rt(d(n)) : Qr
        );
      }, r.createRef = function() {
        var n = { current: null };
        return Object.seal(n), n;
      }, r.forwardRef = function(n) {
        n != null && n.$$typeof === Q ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : typeof n != "function" ? console.error(
          "forwardRef requires a render function but was given %s.",
          n === null ? "null" : typeof n
        ) : n.length !== 0 && n.length !== 2 && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          n.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        ), n != null && n.defaultProps != null && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var m = { $$typeof: G, render: n }, _;
        return Object.defineProperty(m, "displayName", {
          enumerable: !1,
          configurable: !0,
          get: function() {
            return _;
          },
          set: function(C) {
            _ = C, n.name || n.displayName || (Object.defineProperty(n, "name", { value: C }), n.displayName = C);
          }
        }), m;
      }, r.isValidElement = b, r.lazy = function(n) {
        n = { _status: -1, _result: n };
        var m = {
          $$typeof: de,
          _payload: n,
          _init: Z
        }, _ = {
          name: "lazy",
          start: -1,
          end: -1,
          value: null,
          owner: null,
          debugStack: Error("react-stack-top-frame"),
          debugTask: console.createTask ? console.createTask("lazy()") : null
        };
        return n._ioInfo = _, m._debugInfo = [{ awaited: _ }], m;
      }, r.memo = function(n, m) {
        n == null && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          n === null ? "null" : typeof n
        ), m = {
          $$typeof: Q,
          type: n,
          compare: m === void 0 ? null : m
        };
        var _;
        return Object.defineProperty(m, "displayName", {
          enumerable: !1,
          configurable: !0,
          get: function() {
            return _;
          },
          set: function(C) {
            _ = C, n.name || n.displayName || (Object.defineProperty(n, "name", { value: C }), n.displayName = C);
          }
        }), m;
      }, r.startTransition = function(n) {
        var m = q.T, _ = {};
        _._updatedFibers = /* @__PURE__ */ new Set(), q.T = _;
        try {
          var C = n(), P = q.S;
          P !== null && P(_, C), typeof C == "object" && C !== null && typeof C.then == "function" && (q.asyncTransitions++, C.then(te, te), C.then(f, Ot));
        } catch (H) {
          Ot(H);
        } finally {
          m === null && _._updatedFibers && (n = _._updatedFibers.size, _._updatedFibers.clear(), 10 < n && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), m !== null && _.types !== null && (m.types !== null && m.types !== _.types && console.error(
            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
          ), m.types = _.types), q.T = m;
        }
      }, r.unstable_useCacheRefresh = function() {
        return D().useCacheRefresh();
      }, r.use = function(n) {
        return D().use(n);
      }, r.useActionState = function(n, m, _) {
        return D().useActionState(
          n,
          m,
          _
        );
      }, r.useCallback = function(n, m) {
        return D().useCallback(n, m);
      }, r.useContext = function(n) {
        var m = D();
        return n.$$typeof === T && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        ), m.useContext(n);
      }, r.useDebugValue = function(n, m) {
        return D().useDebugValue(n, m);
      }, r.useDeferredValue = function(n, m) {
        return D().useDeferredValue(n, m);
      }, r.useEffect = function(n, m) {
        return n == null && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        ), D().useEffect(n, m);
      }, r.useEffectEvent = function(n) {
        return D().useEffectEvent(n);
      }, r.useId = function() {
        return D().useId();
      }, r.useImperativeHandle = function(n, m, _) {
        return D().useImperativeHandle(n, m, _);
      }, r.useInsertionEffect = function(n, m) {
        return n == null && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        ), D().useInsertionEffect(n, m);
      }, r.useLayoutEffect = function(n, m) {
        return n == null && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        ), D().useLayoutEffect(n, m);
      }, r.useMemo = function(n, m) {
        return D().useMemo(n, m);
      }, r.useOptimistic = function(n, m) {
        return D().useOptimistic(n, m);
      }, r.useReducer = function(n, m, _) {
        return D().useReducer(n, m, _);
      }, r.useRef = function(n) {
        return D().useRef(n);
      }, r.useState = function(n) {
        return D().useState(n);
      }, r.useSyncExternalStore = function(n, m, _) {
        return D().useSyncExternalStore(
          n,
          m,
          _
        );
      }, r.useTransition = function() {
        return D().useTransition();
      }, r.version = "19.2.6", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  })(Oe, Oe.exports)), Oe.exports;
}
var $t;
function Qe() {
  return $t || ($t = 1, process.env.NODE_ENV === "production" ? He.exports = nn() : He.exports = on()), He.exports;
}
var Lt;
function sn() {
  return Lt || (Lt = 1, process.env.NODE_ENV !== "production" && (function() {
    function e(a) {
      if (a == null) return null;
      if (typeof a == "function")
        return a.$$typeof === Z ? null : a.displayName || a.name || null;
      if (typeof a == "string") return a;
      switch (a) {
        case w:
          return "Fragment";
        case R:
          return "Profiler";
        case A:
          return "StrictMode";
        case S:
          return "Suspense";
        case k:
          return "SuspenseList";
        case K:
          return "Activity";
      }
      if (typeof a == "object")
        switch (typeof a.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), a.$$typeof) {
          case E:
            return "Portal";
          case M:
            return a.displayName || "Context";
          case I:
            return (a._context.displayName || "Context") + ".Consumer";
          case b:
            var v = a.render;
            return a = a.displayName, a || (a = v.displayName || v.name || "", a = a !== "" ? "ForwardRef(" + a + ")" : "ForwardRef"), a;
          case L:
            return v = a.displayName || null, v !== null ? v : e(a.type) || "Memo";
          case Y:
            v = a._payload, a = a._init;
            try {
              return e(a(v));
            } catch {
            }
        }
      return null;
    }
    function r(a) {
      return "" + a;
    }
    function o(a) {
      try {
        r(a);
        var v = !1;
      } catch {
        v = !0;
      }
      if (v) {
        v = console;
        var N = v.error, T = typeof Symbol == "function" && Symbol.toStringTag && a[Symbol.toStringTag] || a.constructor.name || "Object";
        return N.call(
          v,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          T
        ), r(a);
      }
    }
    function s(a) {
      if (a === w) return "<>";
      if (typeof a == "object" && a !== null && a.$$typeof === Y)
        return "<...>";
      try {
        var v = e(a);
        return v ? "<" + v + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function i() {
      var a = D.A;
      return a === null ? null : a.getOwner();
    }
    function l() {
      return Error("react-stack-top-frame");
    }
    function h(a) {
      if (te.call(a, "key")) {
        var v = Object.getOwnPropertyDescriptor(a, "key").get;
        if (v && v.isReactWarning) return !1;
      }
      return a.key !== void 0;
    }
    function p(a, v) {
      function N() {
        F || (F = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          v
        ));
      }
      N.isReactWarning = !0, Object.defineProperty(a, "key", {
        get: N,
        configurable: !0
      });
    }
    function f() {
      var a = e(this.type);
      return oe[a] || (oe[a] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), a = this.props.ref, a !== void 0 ? a : null;
    }
    function c(a, v, N, T, B, G) {
      var O = N.ref;
      return a = {
        $$typeof: j,
        type: a,
        key: v,
        props: N,
        _owner: T
      }, (O !== void 0 ? O : null) !== null ? Object.defineProperty(a, "ref", {
        enumerable: !1,
        get: f
      }) : Object.defineProperty(a, "ref", { enumerable: !1, value: null }), a._store = {}, Object.defineProperty(a._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(a, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(a, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: B
      }), Object.defineProperty(a, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: G
      }), Object.freeze && (Object.freeze(a.props), Object.freeze(a)), a;
    }
    function g(a, v, N, T, B, G) {
      var O = v.children;
      if (O !== void 0)
        if (T)
          if (re(O)) {
            for (T = 0; T < O.length; T++)
              u(O[T]);
            Object.freeze && Object.freeze(O);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else u(O);
      if (te.call(v, "key")) {
        O = e(a);
        var X = Object.keys(v).filter(function(de) {
          return de !== "key";
        });
        T = 0 < X.length ? "{key: someKey, " + X.join(": ..., ") + ": ...}" : "{key: someKey}", pe[O + T] || (X = 0 < X.length ? "{" + X.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          T,
          O,
          X,
          O
        ), pe[O + T] = !0);
      }
      if (O = null, N !== void 0 && (o(N), O = "" + N), h(v) && (o(v.key), O = "" + v.key), "key" in v) {
        N = {};
        for (var Q in v)
          Q !== "key" && (N[Q] = v[Q]);
      } else N = v;
      return O && p(
        N,
        typeof a == "function" ? a.displayName || a.name || "Unknown" : a
      ), c(
        a,
        O,
        N,
        i(),
        B,
        G
      );
    }
    function u(a) {
      d(a) ? a._store && (a._store.validated = 1) : typeof a == "object" && a !== null && a.$$typeof === Y && (a._payload.status === "fulfilled" ? d(a._payload.value) && a._payload.value._store && (a._payload.value._store.validated = 1) : a._store && (a._store.validated = 1));
    }
    function d(a) {
      return typeof a == "object" && a !== null && a.$$typeof === j;
    }
    var x = Qe(), j = /* @__PURE__ */ Symbol.for("react.transitional.element"), E = /* @__PURE__ */ Symbol.for("react.portal"), w = /* @__PURE__ */ Symbol.for("react.fragment"), A = /* @__PURE__ */ Symbol.for("react.strict_mode"), R = /* @__PURE__ */ Symbol.for("react.profiler"), I = /* @__PURE__ */ Symbol.for("react.consumer"), M = /* @__PURE__ */ Symbol.for("react.context"), b = /* @__PURE__ */ Symbol.for("react.forward_ref"), S = /* @__PURE__ */ Symbol.for("react.suspense"), k = /* @__PURE__ */ Symbol.for("react.suspense_list"), L = /* @__PURE__ */ Symbol.for("react.memo"), Y = /* @__PURE__ */ Symbol.for("react.lazy"), K = /* @__PURE__ */ Symbol.for("react.activity"), Z = /* @__PURE__ */ Symbol.for("react.client.reference"), D = x.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, te = Object.prototype.hasOwnProperty, re = Array.isArray, z = console.createTask ? console.createTask : function() {
      return null;
    };
    x = {
      react_stack_bottom_frame: function(a) {
        return a();
      }
    };
    var F, oe = {}, le = x.react_stack_bottom_frame.bind(
      x,
      l
    )(), ue = z(s(l)), pe = {};
    ke.Fragment = w, ke.jsx = function(a, v, N) {
      var T = 1e4 > D.recentlyCreatedOwnerStacks++;
      return g(
        a,
        v,
        N,
        !1,
        T ? Error("react-stack-top-frame") : le,
        T ? z(s(a)) : ue
      );
    }, ke.jsxs = function(a, v, N) {
      var T = 1e4 > D.recentlyCreatedOwnerStacks++;
      return g(
        a,
        v,
        N,
        !0,
        T ? Error("react-stack-top-frame") : le,
        T ? z(s(a)) : ue
      );
    };
  })()), ke;
}
var zt;
function an() {
  return zt || (zt = 1, process.env.NODE_ENV === "production" ? qe.exports = rn() : qe.exports = sn()), qe.exports;
}
var t = an(), y = Qe();
const V = /* @__PURE__ */ tn(y), or = /* @__PURE__ */ en({
  __proto__: null,
  default: V
}, [y]);
function sr(e) {
  var r, o, s = "";
  if (typeof e == "string" || typeof e == "number") s += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var i = e.length;
    for (r = 0; r < i; r++) e[r] && (o = sr(e[r])) && (s && (s += " "), s += o);
  } else for (o in e) e[o] && (s && (s += " "), s += o);
  return s;
}
function ce() {
  for (var e, r, o = 0, s = "", i = arguments.length; o < i; o++) (e = arguments[o]) && (r = sr(e)) && (s && (s += " "), s += r);
  return s;
}
const cn = (e) => {
  const r = y.Children.toArray(e), o = [];
  let s = "";
  const i = () => {
    s !== "" && (o.push(s), s = "");
  };
  for (const l of r)
    if (!(l == null || typeof l == "boolean")) {
      if (typeof l == "string" || typeof l == "number") {
        s += String(l);
        continue;
      }
      i(), o.push(l);
    }
  return i(), o;
}, ft = (e) => {
  const r = cn(e), o = y.Children.count(r);
  return y.Children.map(r, (s) => {
    if (typeof s == "string" && s.trim())
      return o <= 1 ? s : t.jsx("span", { children: s });
    if (y.isValidElement(s)) {
      const i = s, { children: l, ...h } = i.props;
      return l != null ? y.cloneElement(i, h, ft(l)) : i;
    }
    return s;
  });
}, ln = "_Badge_1viyg_1", un = {
  Badge: ln
}, se = ({ children: e, className: r, variant: o = "soft", color: s = "secondary", size: i = "sm", pill: l, ...h }) => t.jsx("div", { className: ce(un.Badge, r), "data-color": s, "data-size": i, "data-pill": l ? "" : void 0, "data-variant": o, ...h, children: ft(e) }), dn = { DEV: !1, MODE: "production" }, ar = typeof import.meta < "u" ? dn : void 0, ir = typeof process < "u" && process.env?.NODE_ENV ? process.env?.NODE_ENV : "production", fn = ir === "development" || !!ar?.DEV, pn = typeof navigator < "u" && /(jsdom|happy-dom)/i.test(navigator.userAgent) || typeof globalThis.happyDOM == "object", cr = ir === "test" || ar?.MODE === "test" || pn, mn = typeof window < "u", lr = typeof document < "u", hn = mn && lr, gn = (e) => {
  const r = e.currentTarget;
  if (!(r instanceof HTMLElement))
    return;
  const o = r.offsetWidth;
  let s = 0.985;
  o <= 80 ? s = 0.96 : o <= 150 ? s = 0.97 : o <= 220 ? s = 0.98 : o > 600 && (s = 0.995), r.style.setProperty("--scale", s.toString());
}, Ft = (e, r) => {
  const o = () => {
    const h = setTimeout(e);
    return () => {
      clearTimeout(h);
    };
  };
  if (!hn || typeof window.requestAnimationFrame != "function" || lr && document.visibilityState === "hidden")
    return o();
  let i = 2, l = window.requestAnimationFrame(function h() {
    i -= 1, i === 0 ? e() : l = window.requestAnimationFrame(h);
  });
  return () => {
    typeof window.cancelAnimationFrame == "function" && window.cancelAnimationFrame(l);
  };
}, ur = (e) => Object.keys(e).reduce((o, s) => {
  const i = e[s];
  if (i || i === 0) {
    const l = s.startsWith("--") ? "" : "--", h = typeof i == "number" ? `${i}px` : i;
    o[`${l}${s}`] = h;
  }
  return o;
}, {});
y.createContext(null);
var st, Bt;
function yn() {
  if (Bt) return st;
  Bt = 1;
  var e = "Expected a function", r = NaN, o = "[object Symbol]", s = /^\s+|\s+$/g, i = /^[-+]0x[0-9a-f]+$/i, l = /^0b[01]+$/i, h = /^0o[0-7]+$/i, p = parseInt, f = typeof Ge == "object" && Ge && Ge.Object === Object && Ge, c = typeof self == "object" && self && self.Object === Object && self, g = f || c || Function("return this")(), u = Object.prototype, d = u.toString, x = Math.max, j = Math.min, E = function() {
    return g.Date.now();
  };
  function w(b, S, k) {
    var L, Y, K, Z, D, te, re = 0, z = !1, F = !1, oe = !0;
    if (typeof b != "function")
      throw new TypeError(e);
    S = M(S) || 0, A(k) && (z = !!k.leading, F = "maxWait" in k, K = F ? x(M(k.maxWait) || 0, S) : K, oe = "trailing" in k ? !!k.trailing : oe);
    function le(O) {
      var X = L, Q = Y;
      return L = Y = void 0, re = O, Z = b.apply(Q, X), Z;
    }
    function ue(O) {
      return re = O, D = setTimeout(v, S), z ? le(O) : Z;
    }
    function pe(O) {
      var X = O - te, Q = O - re, de = S - X;
      return F ? j(de, K - Q) : de;
    }
    function a(O) {
      var X = O - te, Q = O - re;
      return te === void 0 || X >= S || X < 0 || F && Q >= K;
    }
    function v() {
      var O = E();
      if (a(O))
        return N(O);
      D = setTimeout(v, pe(O));
    }
    function N(O) {
      return D = void 0, oe && L ? le(O) : (L = Y = void 0, Z);
    }
    function T() {
      D !== void 0 && clearTimeout(D), re = 0, L = te = Y = D = void 0;
    }
    function B() {
      return D === void 0 ? Z : N(E());
    }
    function G() {
      var O = E(), X = a(O);
      if (L = arguments, Y = this, te = O, X) {
        if (D === void 0)
          return ue(te);
        if (F)
          return D = setTimeout(v, S), le(te);
      }
      return D === void 0 && (D = setTimeout(v, S)), Z;
    }
    return G.cancel = T, G.flush = B, G;
  }
  function A(b) {
    var S = typeof b;
    return !!b && (S == "object" || S == "function");
  }
  function R(b) {
    return !!b && typeof b == "object";
  }
  function I(b) {
    return typeof b == "symbol" || R(b) && d.call(b) == o;
  }
  function M(b) {
    if (typeof b == "number")
      return b;
    if (I(b))
      return r;
    if (A(b)) {
      var S = typeof b.valueOf == "function" ? b.valueOf() : b;
      b = A(S) ? S + "" : S;
    }
    if (typeof b != "string")
      return b === 0 ? b : +b;
    b = b.replace(s, "");
    var k = l.test(b);
    return k || h.test(b) ? p(b.slice(2), k ? 2 : 8) : i.test(b) ? r : +b;
  }
  return st = w, st;
}
yn();
var vn = typeof window < "u" ? y.useLayoutEffect : y.useEffect;
function xn() {
  const e = y.useRef(!1);
  return y.useEffect(() => (e.current = !0, () => {
    e.current = !1;
  }), []), y.useCallback(() => e.current, []);
}
var Ut = {
  width: void 0,
  height: void 0
};
function bn(e) {
  const { ref: r, box: o = "content-box" } = e, [{ width: s, height: i }, l] = y.useState(Ut), h = xn(), p = y.useRef({ ...Ut }), f = y.useRef(void 0);
  return f.current = e.onResize, y.useEffect(() => {
    if (!r.current || typeof window > "u" || !("ResizeObserver" in window))
      return;
    const c = new ResizeObserver(([g]) => {
      const u = o === "border-box" ? "borderBoxSize" : o === "device-pixel-content-box" ? "devicePixelContentBoxSize" : "contentBoxSize", d = Gt(g, u, "inlineSize"), x = Gt(g, u, "blockSize");
      if (p.current.width !== d || p.current.height !== x) {
        const E = { width: d, height: x };
        p.current.width = d, p.current.height = x, f.current ? f.current(E) : h() && l(E);
      }
    });
    return c.observe(r.current, { box: o }), () => {
      c.disconnect();
    };
  }, [o, r, h]), { width: s, height: i };
}
function Gt(e, r, o) {
  return e[r] ? Array.isArray(e[r]) ? e[r][0][o] : (
    // @ts-ignore Support Firefox's non-standard behavior
    e[r][o]
  ) : r === "contentBoxSize" ? e.contentRect[o === "inlineSize" ? "width" : "height"] : void 0;
}
function _n(e, r) {
  const o = y.useRef(e);
  vn(() => {
    o.current = e;
  }, [e]), y.useEffect(() => {
    if (!r && r !== 0)
      return;
    const s = setTimeout(() => {
      o.current();
    }, r);
    return () => {
      clearTimeout(s);
    };
  }, [r]);
}
const wn = "_LoadingIndicator_7yl6f_1", jn = {
  LoadingIndicator: wn
}, En = ({ className: e, size: r, strokeWidth: o, style: s, ...i }) => t.jsx("div", { ...i, className: ce(jn.LoadingIndicator, e), style: s || ur({
  "indicator-size": r,
  "indicator-stroke": o
}) });
function Ze(e) {
  return (r) => {
    e.forEach((o) => {
      typeof o == "function" ? o(r) : o != null && (o.current = r);
    });
  };
}
const Rn = () => cr, qt = (e, r = !1, o = "TransitionGroup") => {
  const s = [];
  return y.Children.forEach(e, (i) => {
    if (i && typeof i == "object" && "key" in i && i.key)
      s.push(i);
    else if (r)
      throw new Error(`Child elements of <${o} /> must include a \`key\``);
  }), s;
}, Ne = () => {
}, Ce = (e) => {
  const r = y.useRef(e);
  return r.current = e, y.useCallback((o) => r.current(o), []);
};
function Nn(e, r, o, s) {
  const i = e.reduce((f, c) => ({ ...f, [c.key]: 1 }), {}), l = r.reduce((f, c) => ({ ...f, [c.component.key]: 1 }), {}), h = e.filter((f) => !l[f.key]).map(o), p = r.map((f) => ({
    ...f,
    component: e.find(({ key: c }) => c === f.component.key) || f.component,
    shouldRender: !!i[f.component.key]
  }));
  return s === "append" ? p.concat(h) : h.concat(p);
}
function Cn(e, r, o) {
  if ((cr || fn) && r && o > 1)
    throw new Error(`Cannot use forwardRef with multiple children in <${e} />`);
}
const Tn = "_TransitionGroupChild_1hv1z_1", Sn = {
  TransitionGroupChild: Tn
}, dr = {
  enter: !1,
  enterActive: !1,
  exit: !1,
  exitActive: !1,
  interrupted: !1
}, kn = (e) => ({
  ...dr,
  enter: !e
}), On = (e, r) => {
  switch (r.type) {
    case "enter-before":
      return {
        enter: !0,
        enterActive: !1,
        exit: !1,
        exitActive: !1,
        interrupted: e.interrupted || e.exit
      };
    case "enter-active":
      return {
        enter: !0,
        enterActive: !0,
        exit: !1,
        exitActive: !1,
        interrupted: !1
      };
    case "exit-before":
      return {
        enter: !1,
        enterActive: !1,
        exit: !0,
        exitActive: !1,
        interrupted: e.interrupted || e.enter
      };
    case "exit-active":
      return {
        enter: !1,
        enterActive: !1,
        exit: !0,
        exitActive: !0,
        interrupted: !1
      };
    default:
      return dr;
  }
}, An = ({ ref: e, as: r, children: o, className: s, transitionId: i, style: l, preventMountTransition: h, shouldRender: p, enterDuration: f, exitDuration: c, removeChild: g, onEnter: u, onEnterActive: d, onEnterComplete: x, onExit: j, onExitActive: E, onExitComplete: w }) => {
  const [A, R] = y.useReducer(On, kn(h || !1)), I = y.useRef(!1), M = y.useRef(null), b = y.useRef(f);
  b.current = f;
  const S = y.useRef(c);
  S.current = c;
  const k = y.useRef(null), L = y.useCallback((Y) => {
    const K = M.current;
    if (!(!K || Y === k.current))
      switch (k.current = Y, Y) {
        case "enter":
          u(K);
          break;
        case "enter-active":
          d(K);
          break;
        case "enter-complete":
          x(K);
          break;
        case "exit":
          j(K);
          break;
        case "exit-active":
          E(K);
          break;
        case "exit-complete":
          w(K);
          break;
      }
  }, [u, d, x, j, E, w]);
  return V.useLayoutEffect(() => {
    if (!p) {
      let Z;
      R({ type: "exit-before" }), L("exit");
      const D = Ft(() => {
        R({ type: "exit-active" }), L("exit-active"), Z = window.setTimeout(() => {
          L("exit-complete"), g();
        }, S.current);
      });
      return () => {
        D(), Z !== void 0 && clearTimeout(Z);
      };
    }
    if (h && !I.current) {
      I.current = !0;
      return;
    }
    let Y;
    R({ type: "enter-before" }), L("enter");
    const K = Ft(() => {
      R({ type: "enter-active" }), L("enter-active"), Y = window.setTimeout(() => {
        R({ type: "done" }), L("enter-complete");
      }, b.current);
    });
    return () => {
      K(), Y !== void 0 && clearTimeout(Y);
    };
  }, [
    p,
    // This value is immutable after <TransitionGroup> is created, and does not change on re-renders.
    h,
    g,
    L
  ]), y.useEffect(() => () => {
    I.current = !1;
  }, []), t.jsx(r, { ref: Ze([M, e]), className: ce(s, Sn.TransitionGroupChild), "data-transition-id": i, style: l, "data-entering": A.enter ? "" : void 0, "data-entering-active": A.enterActive ? "" : void 0, "data-exiting": A.exit ? "" : void 0, "data-exiting-active": A.exitActive ? "" : void 0, "data-interrupted": A.interrupted ? "" : void 0, children: o });
}, In = (e) => {
  const { enterMountDelay: r, preventMountTransition: o } = e, s = !o && r != null ? r : null, [i, l] = y.useState(s == null);
  return _n(() => l(!0), i ? null : s), i ? t.jsx(An, { ...e }) : null;
}, Mn = (e) => {
  const { ref: r, as: o = "span", children: s, className: i, transitionId: l, style: h, enterDuration: p = 0, exitDuration: f = 0, preventInitialTransition: c = !0, enterMountDelay: g, insertMethod: u = "append", disableAnimations: d = Rn() } = e, x = Ce(e.onEnter ?? Ne), j = Ce(e.onEnterActive ?? Ne), E = Ce(e.onEnterComplete ?? Ne), w = Ce(e.onExit ?? Ne), A = Ce(e.onExitActive ?? Ne), R = Ce(e.onExitComplete ?? Ne);
  y.Children.forEach(s, (S) => {
    if (S && !S.key)
      throw new Error("Child elements of <TransitionGroup /> must include a `key`");
  });
  const I = y.useCallback((S) => ({
    component: S,
    shouldRender: !0,
    removeChild: () => {
      b((k) => k.filter((L) => S.key !== L.component.key));
    },
    onEnter: x,
    onEnterActive: j,
    onEnterComplete: E,
    onExit: w,
    onExitActive: A,
    onExitComplete: R
  }), [x, j, E, w, A, R]), [M, b] = y.useState(() => qt(s).map((S) => ({
    ...I(S),
    // Lock this value to whatever the value was on initial render of the TransitionGroup.
    // It doesn't make sense to change this once it is mounted.
    preventMountTransition: c
  })));
  return y.useLayoutEffect(() => {
    b((S) => {
      const k = qt(s);
      return Nn(k, S, I, u);
    });
  }, [s, u, I]), Cn("TransitionGroup", r, y.Children.count(s)), d ? t.jsx(t.Fragment, { children: y.Children.map(s, (S) => t.jsx(
    o,
    {
      // @ts-expect-error -- TS is not happy about this forwardedRef, but it's fine.
      ref: r,
      className: i,
      style: h,
      "data-transition-id": l,
      children: S
    }
  )) }) : t.jsx(t.Fragment, { children: M.map(({ component: S, ...k }) => t.jsx(In, { ...k, as: o, className: i, transitionId: l, enterDuration: p, exitDuration: f, enterMountDelay: g, style: h, ref: r, children: S }, S.key)) });
}, Pn = "_Button_1864l_1", Dn = "_ButtonInner_1864l_4", $n = "_ButtonLoader_1864l_749", at = {
  Button: Pn,
  ButtonInner: Dn,
  ButtonLoader: $n
}, ee = (e) => {
  const {
    type: r = "button",
    color: o = "primary",
    variant: s = "solid",
    pill: i = !0,
    uniform: l = !1,
    size: h = "md",
    iconSize: p,
    gutterSize: f,
    loading: c,
    selected: g,
    block: u,
    opticallyAlign: d,
    children: x,
    className: j,
    onClick: E,
    disabled: w,
    disabledTone: A,
    // Defaults to `loading` state
    inert: R = c,
    ...I
  } = e, M = w || R, b = y.useCallback((S) => {
    w || E?.(S);
  }, [E, w]);
  return t.jsxs("button", {
    type: r,
    className: ce(at.Button, j),
    "data-color": o,
    "data-variant": s,
    "data-pill": i ? "" : void 0,
    "data-uniform": l ? "" : void 0,
    "data-size": h,
    "data-gutter-size": f,
    "data-icon-size": p,
    "data-loading": c ? "" : void 0,
    "data-selected": g ? "" : void 0,
    "data-block": u ? "" : void 0,
    "data-optically-align": d,
    onPointerEnter: gn,
    // Non-visual, accessible disablement
    // NOTE: Do not use literal `inert` because that is incorrect semantically
    disabled: M,
    "aria-disabled": M,
    tabIndex: M ? -1 : void 0,
    "data-disabled": w ? "" : void 0,
    "data-disabled-tone": w ? A : void 0,
    onClick: b,
    ...I,
    children: [t.jsx(Mn, { className: at.ButtonLoader, enterDuration: 250, exitDuration: 150, children: c && t.jsx(En, {}, "loader") }), t.jsx("span", { className: at.ButtonInner, children: ft(x) })]
  });
}, Ln = (e) => t.jsx("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "currentColor", ...e, children: t.jsx("path", { d: "M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM16.0755 7.93219C16.5272 8.25003 16.6356 8.87383 16.3178 9.32549L11.5678 16.0755C11.3931 16.3237 11.1152 16.4792 10.8123 16.4981C10.5093 16.517 10.2142 16.3973 10.0101 16.1727L7.51006 13.4227C7.13855 13.014 7.16867 12.3816 7.57733 12.0101C7.98598 11.6386 8.61843 11.6687 8.98994 12.0773L10.6504 13.9039L14.6822 8.17451C15 7.72284 15.6238 7.61436 16.0755 7.93219Z", fill: "currentColor" }) }), zn = (e) => t.jsxs("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "currentColor", ...e, children: [t.jsx("path", { d: "M13 12a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0v-4Zm-1-2.5A1.25 1.25 0 1 0 12 7a1.25 1.25 0 0 0 0 2.5Z" }), t.jsx("path", { fillRule: "evenodd", d: "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z", clipRule: "evenodd" })] }), Fn = (e) => t.jsxs("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "currentColor", ...e, children: [t.jsx("path", { d: "M10.42 2.006a4 4 0 0 1 3.159 0c.674.29 1.188.822 1.667 1.456.474.627 1 1.473 1.653 2.523l3.542 5.696c.72 1.16 1.3 2.09 1.682 2.854.384.766.654 1.517.59 2.292a4 4 0 0 1-1.604 2.886c-.625.463-1.405.63-2.258.709-.85.078-1.945.078-3.311.078H8.46c-1.366 0-2.46 0-3.31-.078-.854-.078-1.634-.246-2.26-.71a4 4 0 0 1-1.603-2.885c-.064-.775.206-1.526.59-2.292.383-.764.961-1.694 1.682-2.854l3.542-5.696c.653-1.05 1.18-1.896 1.653-2.523.48-.634.993-1.166 1.667-1.456Zm2.37 1.838a2 2 0 0 0-1.58 0c-.192.083-.448.28-.86.825-.413.544-.891 1.312-1.577 2.415l-3.488 5.61c-.755 1.214-1.283 2.066-1.62 2.737-.34.678-.402 1.02-.385 1.232a2 2 0 0 0 .802 1.443c.171.127.494.255 1.25.324.748.069 1.75.07 3.18.07h6.976c1.43 0 2.432-.001 3.18-.07.756-.069 1.079-.197 1.25-.324a2 2 0 0 0 .802-1.443c.017-.212-.045-.554-.385-1.232-.337-.671-.865-1.523-1.62-2.737l-3.488-5.61c-.686-1.103-1.164-1.87-1.576-2.415-.413-.546-.67-.742-.861-.825" }), t.jsx("path", { d: "M12 7.5a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1M10.851 15a1.15 1.15 0 1 1 2.3 0 1.15 1.15 0 0 1-2.3 0" })] }), Bn = "_Alert_1tr02_1", Un = "_Content_1tr02_145", Gn = "_Indicator_1tr02_156", qn = "_Message_1tr02_159", Hn = "_Title_1tr02_162", Wn = "_Description_1tr02_168", Yn = "_Actions_1tr02_173", je = {
  Alert: Bn,
  Content: Un,
  Indicator: Gn,
  Message: qn,
  Title: Hn,
  Description: Wn,
  Actions: Yn
}, Me = ({ color: e = "primary", variant: r = "outline", title: o, description: s, actions: i, actionsPlacement: l, indicator: h, className: p, actionsClassName: f, ref: c, ...g }) => {
  const u = y.useRef(null), d = y.useRef(null), [x, j] = y.useState("end"), { width: E } = bn({ ref: u });
  return y.useEffect(() => {
    const w = d.current?.clientWidth ?? 0;
    if (w && E) {
      const A = w > E / 3 ? "bottom" : "end";
      j(A);
    }
  }, [E]), t.jsxs("div", { ref: Ze([c, u]), className: ce(je.Alert, p), "data-variant": r, "data-color": e, role: e === "danger" ? "alert" : void 0, "data-actions-placement": l ?? x, ...g, children: [h === !1 ? null : t.jsx("div", { className: je.Indicator, children: h ?? t.jsx(Vn, { color: e }) }), t.jsxs("div", { className: je.Content, children: [t.jsxs("div", { className: je.Message, children: [o && t.jsx("div", { className: je.Title, children: o }), s && t.jsx("div", { className: je.Description, children: s })] }), i && t.jsx("div", { className: ce(je.Actions, f), ref: d, children: i })] })] });
}, Vn = ({ color: e }) => {
  switch (e) {
    case "warning":
    case "caution":
    case "danger":
      return t.jsx(Fn, {});
    case "success":
      return t.jsx(Ln, {});
    default:
      return t.jsx(zn, {});
  }
}, ge = (e) => (e || "Item").replaceAll("_", " ").replace(/\b\w/g, (r) => r.toUpperCase()), _e = (e, r = "EUR") => e == null || Number.isNaN(Number(e)) ? "Not set" : new Intl.NumberFormat("en", {
  style: "currency",
  currency: r,
  maximumFractionDigits: 0
}).format(Number(e)), Je = (e) => e.map((r) => r == null ? "" : String(r).trim()).filter(Boolean), Kn = "_EmptyMessage_1r5gu_1", Xn = "_IconBadge_1r5gu_16", Qn = "_Title_1r5gu_54", Zn = "_Description_1r5gu_69", Jn = "_ActionRow_1r5gu_77", Pe = {
  EmptyMessage: Kn,
  IconBadge: Xn,
  Title: Qn,
  Description: Zn,
  ActionRow: Jn
}, Ee = ({ children: e, className: r, fill: o = "static" }) => t.jsx("div", { className: ce(Pe.EmptyMessage, r), "data-fill": o, children: e }), eo = ({ size: e = "md", color: r = "secondary", children: o, className: s }) => t.jsx("div", { className: ce(Pe.IconBadge, s), "data-size": e, "data-color": r, children: o }), to = ({ children: e, className: r, color: o = "secondary" }) => t.jsx("div", { className: ce(Pe.Title, r), "data-color": o, children: e }), ro = ({ children: e, className: r }) => t.jsx("div", { className: ce(Pe.Description, r), children: e }), no = ({ children: e, className: r }) => t.jsx("div", { className: ce(Pe.ActionRow, r), children: e });
Ee.Icon = eo;
Ee.Title = to;
Ee.Description = ro;
Ee.ActionRow = no;
function ne({
  eyebrow: e,
  title: r,
  description: o,
  empty: s,
  emptyTitle: i = "No trip data",
  emptyDescription: l = "This widget is waiting for structured trip output.",
  error: h,
  children: p
}) {
  return /* @__PURE__ */ t.jsxs("section", { className: "mx-auto w-full max-w-4xl px-3 py-3 text-primary antialiased", children: [
    /* @__PURE__ */ t.jsxs("header", { className: "mb-3 flex flex-col gap-1", children: [
      /* @__PURE__ */ t.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-secondary", children: e }),
      /* @__PURE__ */ t.jsx("h1", { className: "heading-lg text-primary", children: r }),
      o ? /* @__PURE__ */ t.jsx("p", { className: "text-sm text-secondary", children: o }) : null
    ] }),
    h ? /* @__PURE__ */ t.jsx(Me, { color: "danger", variant: "soft", title: "Unable to render trip data", description: h }) : s ? /* @__PURE__ */ t.jsxs(Ee, { fill: "static", className: "min-h-64 rounded-2xl border border-subtle bg-surface", children: [
      /* @__PURE__ */ t.jsx(Ee.Title, { children: i }),
      /* @__PURE__ */ t.jsx(Ee.Description, { children: l })
    ] }) : p
  ] });
}
const Ht = {
  open_decisions: "Open",
  inbox: "Inbox",
  shortlisted: "Shortlisted",
  booked: "Booked",
  itinerary_draft: "Itinerary",
  missing_pieces: "Missing"
}, Wt = [
  "open_decisions",
  "shortlisted",
  "booked",
  "itinerary_draft",
  "missing_pieces",
  "inbox"
], oo = (e) => typeof e == "string" ? e : e.title || e.raw_content || "Saved option", Yt = (e) => typeof e == "string" ? ["Missing piece"] : Je([
  e.item_type ? ge(e.item_type) : null,
  e.day_label,
  e.price_note,
  e.date_note,
  e.location_note,
  e.notes || e.raw_content
]), so = (e) => "error" in e && !!e.error;
function ea({ board: e }) {
  const r = so(e), o = r ? {} : e, s = o.lanes ?? {}, i = [
    ...Wt.filter((u) => Array.isArray(s[u])),
    ...Object.keys(s).filter((u) => !Wt.includes(u))
  ], l = o.counts?.total ?? Object.values(s).reduce((u, d) => u + (Array.isArray(d) ? d.length : 0), 0), h = (Array.isArray(s.booked) ? s.booked.length : 0) + (Array.isArray(s.itinerary_draft) ? s.itinerary_draft.length : 0), p = l > 0 ? Math.round(h / l * 100) : 0, [f, c] = V.useState(null), g = f ? i.filter((u) => u === f) : i;
  return r ? /* @__PURE__ */ t.jsx(ne, { eyebrow: "Organize", title: "Trip Board", error: e.error, children: null }) : /* @__PURE__ */ t.jsx(
    ne,
    {
      eyebrow: "Organize",
      title: o.trip?.title || "Trip Board",
      description: `${l} saved item${l === 1 ? "" : "s"} across the workspace.`,
      empty: l === 0 && !o.trip?.title,
      emptyTitle: "No trip board data",
      children: /* @__PURE__ */ t.jsxs("article", { className: "overflow-hidden rounded-2xl border border-subtle bg-surface shadow-sm", children: [
        /* @__PURE__ */ t.jsxs("div", { className: "flex flex-col gap-3 border-b border-subtle p-4 sm:flex-row sm:items-end sm:justify-between", children: [
          /* @__PURE__ */ t.jsxs("div", { children: [
            /* @__PURE__ */ t.jsx("p", { className: "text-sm text-secondary", children: o.trip?.destination || "Trip workspace" }),
            /* @__PURE__ */ t.jsx("h2", { className: "heading-md mt-1 text-primary", children: "Planning state" })
          ] }),
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ t.jsxs(se, { color: p >= 50 ? "success" : "warning", pill: !0, children: [
              p,
              "% committed"
            ] }),
            /* @__PURE__ */ t.jsx(ee, { color: "secondary", variant: "soft", size: "sm", children: "Review gaps" })
          ] })
        ] }),
        /* @__PURE__ */ t.jsxs("div", { className: "flex gap-2 overflow-x-auto border-b border-subtle p-3", children: [
          /* @__PURE__ */ t.jsx(
            ee,
            {
              color: "secondary",
              variant: f === null ? "solid" : "soft",
              size: "sm",
              onClick: () => c(null),
              children: "All lanes"
            }
          ),
          i.map((u) => /* @__PURE__ */ t.jsx(
            ee,
            {
              color: "secondary",
              variant: f === u ? "solid" : "soft",
              size: "sm",
              onClick: () => c(u),
              children: Ht[u] ?? ge(u)
            },
            u
          ))
        ] }),
        /* @__PURE__ */ t.jsx("div", { className: "grid gap-px bg-subtle sm:grid-cols-2 xl:grid-cols-4", children: g.map((u) => {
          const d = Array.isArray(s[u]) ? s[u] : [];
          return /* @__PURE__ */ t.jsxs("section", { className: "min-h-48 bg-surface p-3", children: [
            /* @__PURE__ */ t.jsxs("div", { className: "mb-3 flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ t.jsx("h3", { className: "text-sm font-semibold text-primary", children: Ht[u] ?? ge(u) }),
              /* @__PURE__ */ t.jsx(se, { color: "secondary", variant: "soft", pill: !0, children: d.length })
            ] }),
            d.length === 0 ? /* @__PURE__ */ t.jsx("div", { className: "grid min-h-28 place-items-center rounded-xl border border-dashed border-subtle text-center text-sm text-tertiary", children: "Nothing here yet" }) : /* @__PURE__ */ t.jsx("div", { className: "space-y-2", children: d.slice(0, 6).map((x, j) => /* @__PURE__ */ t.jsxs(
              "div",
              {
                className: "rounded-xl border border-subtle bg-primary p-3",
                children: [
                  /* @__PURE__ */ t.jsx("p", { className: "text-sm font-semibold text-primary", children: oo(x) }),
                  Yt(x).length > 0 ? /* @__PURE__ */ t.jsx("p", { className: "mt-1 line-clamp-2 text-xs text-secondary", children: Yt(x).join(" · ") }) : null
                ]
              },
              typeof x == "string" ? `${u}-${j}` : x.id ?? `${u}-${j}`
            )) })
          ] }, u);
        }) }),
        Array.isArray(s.missing_pieces) && s.missing_pieces.length > 0 ? /* @__PURE__ */ t.jsx("div", { className: "p-3", children: /* @__PURE__ */ t.jsx(
          Me,
          {
            color: "warning",
            variant: "soft",
            title: "Open planning gaps",
            description: s.missing_pieces.join(" · ")
          }
        ) }) : null
      ] })
    }
  );
}
const ao = (e) => "error" in e && !!e.error, Vt = (e) => "title" in e ? e.title : ge(e.category);
function ta({ budget: e }) {
  if (ao(e))
    return /* @__PURE__ */ t.jsx(ne, { eyebrow: "Budget", title: "Spending tracker", error: e.error, children: null });
  const r = e.rows?.length ? e.rows : e.category_totals ?? [], o = e.currency || "EUR", s = e.spent ?? 0, i = e.target ?? 0, l = i > 0 ? Math.min(100, Math.round(s / i * 100)) : e.percent_used ?? 0;
  return /* @__PURE__ */ t.jsx(
    ne,
    {
      eyebrow: "Budget",
      title: e.trip?.title || "Spending tracker",
      description: "Only the values that change the next decision are surfaced.",
      empty: r.length === 0 && !e.trip?.title,
      emptyTitle: "No budget data",
      children: /* @__PURE__ */ t.jsxs("article", { className: "overflow-hidden rounded-2xl border border-subtle bg-surface shadow-sm", children: [
        /* @__PURE__ */ t.jsxs("div", { className: "grid gap-4 border-b border-subtle p-4 md:grid-cols-[1fr_220px]", children: [
          /* @__PURE__ */ t.jsxs("div", { children: [
            /* @__PURE__ */ t.jsx("p", { className: "text-sm text-secondary", children: "Planned spend" }),
            /* @__PURE__ */ t.jsxs("div", { className: "mt-1 text-3xl font-semibold text-primary", children: [
              _e(s, o),
              i > 0 ? /* @__PURE__ */ t.jsxs("span", { className: "text-base font-normal text-tertiary", children: [
                " / ",
                _e(i, o)
              ] }) : null
            ] }),
            /* @__PURE__ */ t.jsx("p", { className: "mt-2 text-sm text-secondary", children: i > 0 ? `${_e(Math.abs(e.remaining ?? i - s), o)} ${(e.remaining ?? i - s) >= 0 ? "remaining" : "over target"}` : "Add a target to compare planned spending." })
          ] }),
          /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-subtle bg-primary p-4", children: [
            /* @__PURE__ */ t.jsx("div", { className: "h-20 w-20 rounded-full bg-[conic-gradient(var(--color-primary)_0deg,var(--color-primary)_var(--trip-budget-degrees),var(--color-bg-secondary)_var(--trip-budget-degrees),var(--color-bg-secondary)_360deg)]", style: { "--trip-budget-degrees": `${Math.round(l / 100 * 360)}deg` } }),
            /* @__PURE__ */ t.jsxs("div", { children: [
              /* @__PURE__ */ t.jsxs(se, { color: l > 90 ? "warning" : "success", pill: !0, children: [
                l,
                "% used"
              ] }),
              /* @__PURE__ */ t.jsx("p", { className: "mt-2 text-sm text-secondary", children: "Budget health" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ t.jsx("div", { className: "divide-y divide-subtle", children: r.slice(0, 6).map((h, p) => {
          const f = h.amount ?? 0, c = i > 0 ? Math.min(100, Math.round(f / i * 100)) : 35;
          return /* @__PURE__ */ t.jsxs("div", { className: "grid gap-3 p-4 sm:grid-cols-[140px_1fr_90px] sm:items-center", children: [
            /* @__PURE__ */ t.jsx("div", { className: "text-sm font-semibold text-primary", children: Vt(h) }),
            /* @__PURE__ */ t.jsx("div", { className: "h-2 overflow-hidden rounded-full bg-secondary", children: /* @__PURE__ */ t.jsx("span", { className: "block h-full rounded-full bg-primary", style: { width: `${c}%` } }) }),
            /* @__PURE__ */ t.jsx("div", { className: "text-right text-sm font-semibold text-primary", children: _e(f, o) })
          ] }, `${Vt(h)}-${p}`);
        }) }),
        /* @__PURE__ */ t.jsxs("div", { className: "flex flex-wrap justify-end gap-2 border-t border-subtle bg-secondary p-4", children: [
          /* @__PURE__ */ t.jsx(ee, { color: "secondary", variant: "soft", size: "sm", children: "Find cheaper options" }),
          /* @__PURE__ */ t.jsx(ee, { color: "primary", variant: "solid", size: "sm", children: "Set alerts" })
        ] }),
        l > 90 ? /* @__PURE__ */ t.jsx("div", { className: "p-4", children: /* @__PURE__ */ t.jsx(
          Me,
          {
            color: "warning",
            variant: "soft",
            title: "Budget is tight",
            description: "Prioritize booked items and compare flexible plans before adding more holds."
          }
        ) }) : null
      ] })
    }
  );
}
var We = { exports: {} }, ae = {};
var Kt;
function io() {
  if (Kt) return ae;
  Kt = 1;
  var e = Qe();
  function r(f) {
    var c = "https://react.dev/errors/" + f;
    if (1 < arguments.length) {
      c += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var g = 2; g < arguments.length; g++)
        c += "&args[]=" + encodeURIComponent(arguments[g]);
    }
    return "Minified React error #" + f + "; visit " + c + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function o() {
  }
  var s = {
    d: {
      f: o,
      r: function() {
        throw Error(r(522));
      },
      D: o,
      C: o,
      L: o,
      m: o,
      X: o,
      S: o,
      M: o
    },
    p: 0,
    findDOMNode: null
  }, i = /* @__PURE__ */ Symbol.for("react.portal");
  function l(f, c, g) {
    var u = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: i,
      key: u == null ? null : "" + u,
      children: f,
      containerInfo: c,
      implementation: g
    };
  }
  var h = e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function p(f, c) {
    if (f === "font") return "";
    if (typeof c == "string")
      return c === "use-credentials" ? c : "";
  }
  return ae.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = s, ae.createPortal = function(f, c) {
    var g = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!c || c.nodeType !== 1 && c.nodeType !== 9 && c.nodeType !== 11)
      throw Error(r(299));
    return l(f, c, null, g);
  }, ae.flushSync = function(f) {
    var c = h.T, g = s.p;
    try {
      if (h.T = null, s.p = 2, f) return f();
    } finally {
      h.T = c, s.p = g, s.d.f();
    }
  }, ae.preconnect = function(f, c) {
    typeof f == "string" && (c ? (c = c.crossOrigin, c = typeof c == "string" ? c === "use-credentials" ? c : "" : void 0) : c = null, s.d.C(f, c));
  }, ae.prefetchDNS = function(f) {
    typeof f == "string" && s.d.D(f);
  }, ae.preinit = function(f, c) {
    if (typeof f == "string" && c && typeof c.as == "string") {
      var g = c.as, u = p(g, c.crossOrigin), d = typeof c.integrity == "string" ? c.integrity : void 0, x = typeof c.fetchPriority == "string" ? c.fetchPriority : void 0;
      g === "style" ? s.d.S(
        f,
        typeof c.precedence == "string" ? c.precedence : void 0,
        {
          crossOrigin: u,
          integrity: d,
          fetchPriority: x
        }
      ) : g === "script" && s.d.X(f, {
        crossOrigin: u,
        integrity: d,
        fetchPriority: x,
        nonce: typeof c.nonce == "string" ? c.nonce : void 0
      });
    }
  }, ae.preinitModule = function(f, c) {
    if (typeof f == "string")
      if (typeof c == "object" && c !== null) {
        if (c.as == null || c.as === "script") {
          var g = p(
            c.as,
            c.crossOrigin
          );
          s.d.M(f, {
            crossOrigin: g,
            integrity: typeof c.integrity == "string" ? c.integrity : void 0,
            nonce: typeof c.nonce == "string" ? c.nonce : void 0
          });
        }
      } else c == null && s.d.M(f);
  }, ae.preload = function(f, c) {
    if (typeof f == "string" && typeof c == "object" && c !== null && typeof c.as == "string") {
      var g = c.as, u = p(g, c.crossOrigin);
      s.d.L(f, g, {
        crossOrigin: u,
        integrity: typeof c.integrity == "string" ? c.integrity : void 0,
        nonce: typeof c.nonce == "string" ? c.nonce : void 0,
        type: typeof c.type == "string" ? c.type : void 0,
        fetchPriority: typeof c.fetchPriority == "string" ? c.fetchPriority : void 0,
        referrerPolicy: typeof c.referrerPolicy == "string" ? c.referrerPolicy : void 0,
        imageSrcSet: typeof c.imageSrcSet == "string" ? c.imageSrcSet : void 0,
        imageSizes: typeof c.imageSizes == "string" ? c.imageSizes : void 0,
        media: typeof c.media == "string" ? c.media : void 0
      });
    }
  }, ae.preloadModule = function(f, c) {
    if (typeof f == "string")
      if (c) {
        var g = p(c.as, c.crossOrigin);
        s.d.m(f, {
          as: typeof c.as == "string" && c.as !== "script" ? c.as : void 0,
          crossOrigin: g,
          integrity: typeof c.integrity == "string" ? c.integrity : void 0
        });
      } else s.d.m(f);
  }, ae.requestFormReset = function(f) {
    s.d.r(f);
  }, ae.unstable_batchedUpdates = function(f, c) {
    return f(c);
  }, ae.useFormState = function(f, c, g) {
    return h.H.useFormState(f, c, g);
  }, ae.useFormStatus = function() {
    return h.H.useHostTransitionStatus();
  }, ae.version = "19.2.6", ae;
}
var ie = {};
var Xt;
function co() {
  return Xt || (Xt = 1, process.env.NODE_ENV !== "production" && (function() {
    function e() {
    }
    function r(u) {
      return "" + u;
    }
    function o(u, d, x) {
      var j = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
      try {
        r(j);
        var E = !1;
      } catch {
        E = !0;
      }
      return E && (console.error(
        "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
        typeof Symbol == "function" && Symbol.toStringTag && j[Symbol.toStringTag] || j.constructor.name || "Object"
      ), r(j)), {
        $$typeof: c,
        key: j == null ? null : "" + j,
        children: u,
        containerInfo: d,
        implementation: x
      };
    }
    function s(u, d) {
      if (u === "font") return "";
      if (typeof d == "string")
        return d === "use-credentials" ? d : "";
    }
    function i(u) {
      return u === null ? "`null`" : u === void 0 ? "`undefined`" : u === "" ? "an empty string" : 'something with type "' + typeof u + '"';
    }
    function l(u) {
      return u === null ? "`null`" : u === void 0 ? "`undefined`" : u === "" ? "an empty string" : typeof u == "string" ? JSON.stringify(u) : typeof u == "number" ? "`" + u + "`" : 'something with type "' + typeof u + '"';
    }
    function h() {
      var u = g.H;
      return u === null && console.error(
        `Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.`
      ), u;
    }
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var p = Qe(), f = {
      d: {
        f: e,
        r: function() {
          throw Error(
            "Invalid form element. requestFormReset must be passed a form that was rendered by React."
          );
        },
        D: e,
        C: e,
        L: e,
        m: e,
        X: e,
        S: e,
        M: e
      },
      p: 0,
      findDOMNode: null
    }, c = /* @__PURE__ */ Symbol.for("react.portal"), g = p.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    typeof Map == "function" && Map.prototype != null && typeof Map.prototype.forEach == "function" && typeof Set == "function" && Set.prototype != null && typeof Set.prototype.clear == "function" && typeof Set.prototype.forEach == "function" || console.error(
      "React depends on Map and Set built-in types. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills"
    ), ie.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = f, ie.createPortal = function(u, d) {
      var x = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!d || d.nodeType !== 1 && d.nodeType !== 9 && d.nodeType !== 11)
        throw Error("Target container is not a DOM element.");
      return o(u, d, null, x);
    }, ie.flushSync = function(u) {
      var d = g.T, x = f.p;
      try {
        if (g.T = null, f.p = 2, u)
          return u();
      } finally {
        g.T = d, f.p = x, f.d.f() && console.error(
          "flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task."
        );
      }
    }, ie.preconnect = function(u, d) {
      typeof u == "string" && u ? d != null && typeof d != "object" ? console.error(
        "ReactDOM.preconnect(): Expected the `options` argument (second) to be an object but encountered %s instead. The only supported option at this time is `crossOrigin` which accepts a string.",
        l(d)
      ) : d != null && typeof d.crossOrigin != "string" && console.error(
        "ReactDOM.preconnect(): Expected the `crossOrigin` option (second argument) to be a string but encountered %s instead. Try removing this option or passing a string value instead.",
        i(d.crossOrigin)
      ) : console.error(
        "ReactDOM.preconnect(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.",
        i(u)
      ), typeof u == "string" && (d ? (d = d.crossOrigin, d = typeof d == "string" ? d === "use-credentials" ? d : "" : void 0) : d = null, f.d.C(u, d));
    }, ie.prefetchDNS = function(u) {
      if (typeof u != "string" || !u)
        console.error(
          "ReactDOM.prefetchDNS(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.",
          i(u)
        );
      else if (1 < arguments.length) {
        var d = arguments[1];
        typeof d == "object" && d.hasOwnProperty("crossOrigin") ? console.error(
          "ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. It looks like the you are attempting to set a crossOrigin property for this DNS lookup hint. Browsers do not perform DNS queries using CORS and setting this attribute on the resource hint has no effect. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.",
          l(d)
        ) : console.error(
          "ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.",
          l(d)
        );
      }
      typeof u == "string" && f.d.D(u);
    }, ie.preinit = function(u, d) {
      if (typeof u == "string" && u ? d == null || typeof d != "object" ? console.error(
        "ReactDOM.preinit(): Expected the `options` argument (second) to be an object with an `as` property describing the type of resource to be preinitialized but encountered %s instead.",
        l(d)
      ) : d.as !== "style" && d.as !== "script" && console.error(
        'ReactDOM.preinit(): Expected the `as` property in the `options` argument (second) to contain a valid value describing the type of resource to be preinitialized but encountered %s instead. Valid values for `as` are "style" and "script".',
        l(d.as)
      ) : console.error(
        "ReactDOM.preinit(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.",
        i(u)
      ), typeof u == "string" && d && typeof d.as == "string") {
        var x = d.as, j = s(x, d.crossOrigin), E = typeof d.integrity == "string" ? d.integrity : void 0, w = typeof d.fetchPriority == "string" ? d.fetchPriority : void 0;
        x === "style" ? f.d.S(
          u,
          typeof d.precedence == "string" ? d.precedence : void 0,
          {
            crossOrigin: j,
            integrity: E,
            fetchPriority: w
          }
        ) : x === "script" && f.d.X(u, {
          crossOrigin: j,
          integrity: E,
          fetchPriority: w,
          nonce: typeof d.nonce == "string" ? d.nonce : void 0
        });
      }
    }, ie.preinitModule = function(u, d) {
      var x = "";
      typeof u == "string" && u || (x += " The `href` argument encountered was " + i(u) + "."), d !== void 0 && typeof d != "object" ? x += " The `options` argument encountered was " + i(d) + "." : d && "as" in d && d.as !== "script" && (x += " The `as` option encountered was " + l(d.as) + "."), x ? console.error(
        "ReactDOM.preinitModule(): Expected up to two arguments, a non-empty `href` string and, optionally, an `options` object with a valid `as` property.%s",
        x
      ) : (x = d && typeof d.as == "string" ? d.as : "script", x) === "script" || (x = l(x), console.error(
        'ReactDOM.preinitModule(): Currently the only supported "as" type for this function is "script" but received "%s" instead. This warning was generated for `href` "%s". In the future other module types will be supported, aligning with the import-attributes proposal. Learn more here: (https://github.com/tc39/proposal-import-attributes)',
        x,
        u
      )), typeof u == "string" && (typeof d == "object" && d !== null ? (d.as == null || d.as === "script") && (x = s(
        d.as,
        d.crossOrigin
      ), f.d.M(u, {
        crossOrigin: x,
        integrity: typeof d.integrity == "string" ? d.integrity : void 0,
        nonce: typeof d.nonce == "string" ? d.nonce : void 0
      })) : d == null && f.d.M(u));
    }, ie.preload = function(u, d) {
      var x = "";
      if (typeof u == "string" && u || (x += " The `href` argument encountered was " + i(u) + "."), d == null || typeof d != "object" ? x += " The `options` argument encountered was " + i(d) + "." : typeof d.as == "string" && d.as || (x += " The `as` option encountered was " + i(d.as) + "."), x && console.error(
        'ReactDOM.preload(): Expected two arguments, a non-empty `href` string and an `options` object with an `as` property valid for a `<link rel="preload" as="..." />` tag.%s',
        x
      ), typeof u == "string" && typeof d == "object" && d !== null && typeof d.as == "string") {
        x = d.as;
        var j = s(
          x,
          d.crossOrigin
        );
        f.d.L(u, x, {
          crossOrigin: j,
          integrity: typeof d.integrity == "string" ? d.integrity : void 0,
          nonce: typeof d.nonce == "string" ? d.nonce : void 0,
          type: typeof d.type == "string" ? d.type : void 0,
          fetchPriority: typeof d.fetchPriority == "string" ? d.fetchPriority : void 0,
          referrerPolicy: typeof d.referrerPolicy == "string" ? d.referrerPolicy : void 0,
          imageSrcSet: typeof d.imageSrcSet == "string" ? d.imageSrcSet : void 0,
          imageSizes: typeof d.imageSizes == "string" ? d.imageSizes : void 0,
          media: typeof d.media == "string" ? d.media : void 0
        });
      }
    }, ie.preloadModule = function(u, d) {
      var x = "";
      typeof u == "string" && u || (x += " The `href` argument encountered was " + i(u) + "."), d !== void 0 && typeof d != "object" ? x += " The `options` argument encountered was " + i(d) + "." : d && "as" in d && typeof d.as != "string" && (x += " The `as` option encountered was " + i(d.as) + "."), x && console.error(
        'ReactDOM.preloadModule(): Expected two arguments, a non-empty `href` string and, optionally, an `options` object with an `as` property valid for a `<link rel="modulepreload" as="..." />` tag.%s',
        x
      ), typeof u == "string" && (d ? (x = s(
        d.as,
        d.crossOrigin
      ), f.d.m(u, {
        as: typeof d.as == "string" && d.as !== "script" ? d.as : void 0,
        crossOrigin: x,
        integrity: typeof d.integrity == "string" ? d.integrity : void 0
      })) : f.d.m(u));
    }, ie.requestFormReset = function(u) {
      f.d.r(u);
    }, ie.unstable_batchedUpdates = function(u, d) {
      return u(d);
    }, ie.useFormState = function(u, d, x) {
      return h().useFormState(u, d, x);
    }, ie.useFormStatus = function() {
      return h().useHostTransitionStatus();
    }, ie.version = "19.2.6", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  })()), ie;
}
var Qt;
function lo() {
  if (Qt) return We.exports;
  Qt = 1;
  function e() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) {
      if (process.env.NODE_ENV !== "production")
        throw new Error("^_^");
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e);
      } catch (r) {
        console.error(r);
      }
    }
  }
  return process.env.NODE_ENV === "production" ? (e(), We.exports = io()) : We.exports = co(), We.exports;
}
lo();
function Zt(e, r) {
  if (typeof e == "function")
    return e(r);
  e != null && (e.current = r);
}
function fr(...e) {
  return (r) => {
    let o = !1;
    const s = e.map((i) => {
      const l = Zt(i, r);
      return !o && typeof l == "function" && (o = !0), l;
    });
    if (o)
      return () => {
        for (let i = 0; i < s.length; i++) {
          const l = s[i];
          typeof l == "function" ? l() : Zt(e[i], null);
        }
      };
  };
}
function ve(...e) {
  return y.useCallback(fr(...e), e);
}
// @__NO_SIDE_EFFECTS__
function lt(e) {
  const r = /* @__PURE__ */ uo(e), o = y.forwardRef((s, i) => {
    const { children: l, ...h } = s, p = y.Children.toArray(l), f = p.find(po);
    if (f) {
      const c = f.props.children, g = p.map((u) => u === f ? y.Children.count(c) > 1 ? y.Children.only(null) : y.isValidElement(c) ? c.props.children : null : u);
      return /* @__PURE__ */ t.jsx(r, { ...h, ref: i, children: y.isValidElement(c) ? y.cloneElement(c, void 0, g) : null });
    }
    return /* @__PURE__ */ t.jsx(r, { ...h, ref: i, children: l });
  });
  return o.displayName = `${e}.Slot`, o;
}
// @__NO_SIDE_EFFECTS__
function uo(e) {
  const r = y.forwardRef((o, s) => {
    const { children: i, ...l } = o;
    if (y.isValidElement(i)) {
      const h = ho(i), p = mo(l, i.props);
      return i.type !== y.Fragment && (p.ref = s ? fr(s, h) : h), y.cloneElement(i, p);
    }
    return y.Children.count(i) > 1 ? y.Children.only(null) : null;
  });
  return r.displayName = `${e}.SlotClone`, r;
}
var fo = /* @__PURE__ */ Symbol("radix.slottable");
function po(e) {
  return y.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === fo;
}
function mo(e, r) {
  const o = { ...r };
  for (const s in r) {
    const i = e[s], l = r[s];
    /^on[A-Z]/.test(s) ? i && l ? o[s] = (...p) => {
      const f = l(...p);
      return i(...p), f;
    } : i && (o[s] = i) : s === "style" ? o[s] = { ...i, ...l } : s === "className" && (o[s] = [i, l].filter(Boolean).join(" "));
  }
  return { ...e, ...o };
}
function ho(e) {
  let r = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, o = r && "isReactWarning" in r && r.isReactWarning;
  return o ? e.ref : (r = Object.getOwnPropertyDescriptor(e, "ref")?.get, o = r && "isReactWarning" in r && r.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
var go = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
], xe = go.reduce((e, r) => {
  const o = /* @__PURE__ */ lt(`Primitive.${r}`), s = y.forwardRef((i, l) => {
    const { asChild: h, ...p } = i, f = h ? o : r;
    return typeof window < "u" && (window[/* @__PURE__ */ Symbol.for("radix-ui")] = !0), /* @__PURE__ */ t.jsx(f, { ...p, ref: l });
  });
  return s.displayName = `Primitive.${r}`, { ...e, [r]: s };
}, {});
function De(e, r = []) {
  let o = [];
  function s(l, h) {
    const p = y.createContext(h), f = o.length;
    o = [...o, h];
    const c = (u) => {
      const { scope: d, children: x, ...j } = u, E = d?.[e]?.[f] || p, w = y.useMemo(() => j, Object.values(j));
      return /* @__PURE__ */ t.jsx(E.Provider, { value: w, children: x });
    };
    c.displayName = l + "Provider";
    function g(u, d) {
      const x = d?.[e]?.[f] || p, j = y.useContext(x);
      if (j) return j;
      if (h !== void 0) return h;
      throw new Error(`\`${u}\` must be used within \`${l}\``);
    }
    return [c, g];
  }
  const i = () => {
    const l = o.map((h) => y.createContext(h));
    return function(p) {
      const f = p?.[e] || l;
      return y.useMemo(
        () => ({ [`__scope${e}`]: { ...p, [e]: f } }),
        [p, f]
      );
    };
  };
  return i.scopeName = e, [s, yo(i, ...r)];
}
function yo(...e) {
  const r = e[0];
  if (e.length === 1) return r;
  const o = () => {
    const s = e.map((i) => ({
      useScope: i(),
      scopeName: i.scopeName
    }));
    return function(l) {
      const h = s.reduce((p, { useScope: f, scopeName: c }) => {
        const u = f(l)[`__scope${c}`];
        return { ...p, ...u };
      }, {});
      return y.useMemo(() => ({ [`__scope${r.scopeName}`]: h }), [h]);
    };
  };
  return o.scopeName = r.scopeName, o;
}
function vo(e) {
  const r = e + "CollectionProvider", [o, s] = De(r), [i, l] = o(
    r,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), h = (E) => {
    const { scope: w, children: A } = E, R = V.useRef(null), I = V.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ t.jsx(i, { scope: w, itemMap: I, collectionRef: R, children: A });
  };
  h.displayName = r;
  const p = e + "CollectionSlot", f = /* @__PURE__ */ lt(p), c = V.forwardRef(
    (E, w) => {
      const { scope: A, children: R } = E, I = l(p, A), M = ve(w, I.collectionRef);
      return /* @__PURE__ */ t.jsx(f, { ref: M, children: R });
    }
  );
  c.displayName = p;
  const g = e + "CollectionItemSlot", u = "data-radix-collection-item", d = /* @__PURE__ */ lt(g), x = V.forwardRef(
    (E, w) => {
      const { scope: A, children: R, ...I } = E, M = V.useRef(null), b = ve(w, M), S = l(g, A);
      return V.useEffect(() => (S.itemMap.set(M, { ref: M, ...I }), () => {
        S.itemMap.delete(M);
      })), /* @__PURE__ */ t.jsx(d, { [u]: "", ref: b, children: R });
    }
  );
  x.displayName = g;
  function j(E) {
    const w = l(e + "CollectionConsumer", E);
    return V.useCallback(() => {
      const R = w.collectionRef.current;
      if (!R) return [];
      const I = Array.from(R.querySelectorAll(`[${u}]`));
      return Array.from(w.itemMap.values()).sort(
        (S, k) => I.indexOf(S.ref.current) - I.indexOf(k.ref.current)
      );
    }, [w.collectionRef, w.itemMap]);
  }
  return [
    { Provider: h, Slot: c, ItemSlot: x },
    j,
    s
  ];
}
function me(e, r, { checkForDefaultPrevented: o = !0 } = {}) {
  return function(i) {
    if (e?.(i), o === !1 || !i.defaultPrevented)
      return r?.(i);
  };
}
var Ie = globalThis?.document ? y.useLayoutEffect : () => {
}, xo = or[" useInsertionEffect ".trim().toString()] || Ie;
function pt({
  prop: e,
  defaultProp: r,
  onChange: o = () => {
  },
  caller: s
}) {
  const [i, l, h] = bo({
    defaultProp: r,
    onChange: o
  }), p = e !== void 0, f = p ? e : i;
  {
    const g = y.useRef(e !== void 0);
    y.useEffect(() => {
      const u = g.current;
      u !== p && console.warn(
        `${s} is changing from ${u ? "controlled" : "uncontrolled"} to ${p ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), g.current = p;
    }, [p, s]);
  }
  const c = y.useCallback(
    (g) => {
      if (p) {
        const u = _o(g) ? g(e) : g;
        u !== e && h.current?.(u);
      } else
        l(g);
    },
    [p, e, l, h]
  );
  return [f, c];
}
function bo({
  defaultProp: e,
  onChange: r
}) {
  const [o, s] = y.useState(e), i = y.useRef(o), l = y.useRef(r);
  return xo(() => {
    l.current = r;
  }, [r]), y.useEffect(() => {
    i.current !== o && (l.current?.(o), i.current = o);
  }, [o, i]), [o, s, l];
}
function _o(e) {
  return typeof e == "function";
}
function wo(e, r) {
  return y.useReducer((o, s) => r[o][s] ?? o, e);
}
var mt = (e) => {
  const { present: r, children: o } = e, s = jo(r), i = typeof o == "function" ? o({ present: s.isPresent }) : y.Children.only(o), l = ve(s.ref, Eo(i));
  return typeof o == "function" || s.isPresent ? y.cloneElement(i, { ref: l }) : null;
};
mt.displayName = "Presence";
function jo(e) {
  const [r, o] = y.useState(), s = y.useRef(null), i = y.useRef(e), l = y.useRef("none"), h = e ? "mounted" : "unmounted", [p, f] = wo(h, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  return y.useEffect(() => {
    const c = Ye(s.current);
    l.current = p === "mounted" ? c : "none";
  }, [p]), Ie(() => {
    const c = s.current, g = i.current;
    if (g !== e) {
      const d = l.current, x = Ye(c);
      e ? f("MOUNT") : x === "none" || c?.display === "none" ? f("UNMOUNT") : f(g && d !== x ? "ANIMATION_OUT" : "UNMOUNT"), i.current = e;
    }
  }, [e, f]), Ie(() => {
    if (r) {
      let c;
      const g = r.ownerDocument.defaultView ?? window, u = (x) => {
        const E = Ye(s.current).includes(CSS.escape(x.animationName));
        if (x.target === r && E && (f("ANIMATION_END"), !i.current)) {
          const w = r.style.animationFillMode;
          r.style.animationFillMode = "forwards", c = g.setTimeout(() => {
            r.style.animationFillMode === "forwards" && (r.style.animationFillMode = w);
          });
        }
      }, d = (x) => {
        x.target === r && (l.current = Ye(s.current));
      };
      return r.addEventListener("animationstart", d), r.addEventListener("animationcancel", u), r.addEventListener("animationend", u), () => {
        g.clearTimeout(c), r.removeEventListener("animationstart", d), r.removeEventListener("animationcancel", u), r.removeEventListener("animationend", u);
      };
    } else
      f("ANIMATION_END");
  }, [r, f]), {
    isPresent: ["mounted", "unmountSuspended"].includes(p),
    ref: y.useCallback((c) => {
      s.current = c ? getComputedStyle(c) : null, o(c);
    }, [])
  };
}
function Ye(e) {
  return e?.animationName || "none";
}
function Eo(e) {
  let r = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, o = r && "isReactWarning" in r && r.isReactWarning;
  return o ? e.ref : (r = Object.getOwnPropertyDescriptor(e, "ref")?.get, o = r && "isReactWarning" in r && r.isReactWarning, o ? e.props.ref : e.props.ref || e.ref);
}
var Ro = or[" useId ".trim().toString()] || (() => {
}), No = 0;
function Co(e) {
  const [r, o] = y.useState(Ro());
  return Ie(() => {
    o((s) => s ?? String(No++));
  }, [e]), r ? `radix-${r}` : "";
}
var To = y.createContext(void 0);
function pr(e) {
  const r = y.useContext(To);
  return e || r || "ltr";
}
function So(e) {
  const r = y.useRef(e);
  return y.useEffect(() => {
    r.current = e;
  }), y.useMemo(() => (...o) => r.current?.(...o), []);
}
function mr(e) {
  const r = y.useRef({ value: e, previous: e });
  return y.useMemo(() => (r.current.value !== e && (r.current.previous = r.current.value, r.current.value = e), r.current.previous), [e]);
}
function hr(e) {
  const [r, o] = y.useState(void 0);
  return Ie(() => {
    if (e) {
      o({ width: e.offsetWidth, height: e.offsetHeight });
      const s = new ResizeObserver((i) => {
        if (!Array.isArray(i) || !i.length)
          return;
        const l = i[0];
        let h, p;
        if ("borderBoxSize" in l) {
          const f = l.borderBoxSize, c = Array.isArray(f) ? f[0] : f;
          h = c.inlineSize, p = c.blockSize;
        } else
          h = e.offsetWidth, p = e.offsetHeight;
        o({ width: h, height: p });
      });
      return s.observe(e, { box: "border-box" }), () => s.unobserve(e);
    } else
      o(void 0);
  }, [e]), r;
}
var et = "Checkbox", [ko] = De(et), [Oo, ht] = ko(et);
function Ao(e) {
  const {
    __scopeCheckbox: r,
    checked: o,
    children: s,
    defaultChecked: i,
    disabled: l,
    form: h,
    name: p,
    onCheckedChange: f,
    required: c,
    value: g = "on",
    // @ts-expect-error
    internal_do_not_use_render: u
  } = e, [d, x] = pt({
    prop: o,
    defaultProp: i ?? !1,
    onChange: f,
    caller: et
  }), [j, E] = y.useState(null), [w, A] = y.useState(null), R = y.useRef(!1), I = j ? !!h || !!j.closest("form") : (
    // We set this to true by default so that events bubble to forms without JS (SSR)
    !0
  ), M = {
    checked: d,
    disabled: l,
    setChecked: x,
    control: j,
    setControl: E,
    name: p,
    form: h,
    value: g,
    hasConsumerStoppedPropagationRef: R,
    required: c,
    defaultChecked: we(i) ? !1 : i,
    isFormControl: I,
    bubbleInput: w,
    setBubbleInput: A
  };
  return /* @__PURE__ */ t.jsx(
    Oo,
    {
      scope: r,
      ...M,
      children: Io(u) ? u(M) : s
    }
  );
}
var gr = "CheckboxTrigger", yr = y.forwardRef(
  ({ __scopeCheckbox: e, onKeyDown: r, onClick: o, ...s }, i) => {
    const {
      control: l,
      value: h,
      disabled: p,
      checked: f,
      required: c,
      setControl: g,
      setChecked: u,
      hasConsumerStoppedPropagationRef: d,
      isFormControl: x,
      bubbleInput: j
    } = ht(gr, e), E = ve(i, g), w = y.useRef(f);
    return y.useEffect(() => {
      const A = l?.form;
      if (A) {
        const R = () => u(w.current);
        return A.addEventListener("reset", R), () => A.removeEventListener("reset", R);
      }
    }, [l, u]), /* @__PURE__ */ t.jsx(
      xe.button,
      {
        type: "button",
        role: "checkbox",
        "aria-checked": we(f) ? "mixed" : f,
        "aria-required": c,
        "data-state": jr(f),
        "data-disabled": p ? "" : void 0,
        disabled: p,
        value: h,
        ...s,
        ref: E,
        onKeyDown: me(r, (A) => {
          A.key === "Enter" && A.preventDefault();
        }),
        onClick: me(o, (A) => {
          u((R) => we(R) ? !0 : !R), j && x && (d.current = A.isPropagationStopped(), d.current || A.stopPropagation());
        })
      }
    );
  }
);
yr.displayName = gr;
var vr = y.forwardRef(
  (e, r) => {
    const {
      __scopeCheckbox: o,
      name: s,
      checked: i,
      defaultChecked: l,
      required: h,
      disabled: p,
      value: f,
      onCheckedChange: c,
      form: g,
      ...u
    } = e;
    return /* @__PURE__ */ t.jsx(
      Ao,
      {
        __scopeCheckbox: o,
        checked: i,
        defaultChecked: l,
        disabled: p,
        required: h,
        onCheckedChange: c,
        name: s,
        form: g,
        value: f,
        internal_do_not_use_render: ({ isFormControl: d }) => /* @__PURE__ */ t.jsxs(t.Fragment, { children: [
          /* @__PURE__ */ t.jsx(
            yr,
            {
              ...u,
              ref: r,
              __scopeCheckbox: o
            }
          ),
          d && /* @__PURE__ */ t.jsx(
            wr,
            {
              __scopeCheckbox: o
            }
          )
        ] })
      }
    );
  }
);
vr.displayName = et;
var xr = "CheckboxIndicator", br = y.forwardRef(
  (e, r) => {
    const { __scopeCheckbox: o, forceMount: s, ...i } = e, l = ht(xr, o);
    return /* @__PURE__ */ t.jsx(
      mt,
      {
        present: s || we(l.checked) || l.checked === !0,
        children: /* @__PURE__ */ t.jsx(
          xe.span,
          {
            "data-state": jr(l.checked),
            "data-disabled": l.disabled ? "" : void 0,
            ...i,
            ref: r,
            style: { pointerEvents: "none", ...e.style }
          }
        )
      }
    );
  }
);
br.displayName = xr;
var _r = "CheckboxBubbleInput", wr = y.forwardRef(
  ({ __scopeCheckbox: e, ...r }, o) => {
    const {
      control: s,
      hasConsumerStoppedPropagationRef: i,
      checked: l,
      defaultChecked: h,
      required: p,
      disabled: f,
      name: c,
      value: g,
      form: u,
      bubbleInput: d,
      setBubbleInput: x
    } = ht(_r, e), j = ve(o, x), E = mr(l), w = hr(s);
    y.useEffect(() => {
      const R = d;
      if (!R) return;
      const I = window.HTMLInputElement.prototype, b = Object.getOwnPropertyDescriptor(
        I,
        "checked"
      ).set, S = !i.current;
      if (E !== l && b) {
        const k = new Event("click", { bubbles: S });
        R.indeterminate = we(l), b.call(R, we(l) ? !1 : l), R.dispatchEvent(k);
      }
    }, [d, E, l, i]);
    const A = y.useRef(we(l) ? !1 : l);
    return /* @__PURE__ */ t.jsx(
      xe.input,
      {
        type: "checkbox",
        "aria-hidden": !0,
        defaultChecked: h ?? A.current,
        required: p,
        disabled: f,
        name: c,
        value: g,
        form: u,
        ...r,
        tabIndex: -1,
        ref: j,
        style: {
          ...r.style,
          ...w,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          // We transform because the input is absolutely positioned but we have
          // rendered it **after** the button. This pulls it back to sit on top
          // of the button.
          transform: "translateX(-100%)"
        }
      }
    );
  }
);
wr.displayName = _r;
function Io(e) {
  return typeof e == "function";
}
function we(e) {
  return e === "indeterminate";
}
function jr(e) {
  return we(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
var it = "rovingFocusGroup.onEntryFocus", Mo = { bubbles: !1, cancelable: !0 }, $e = "RovingFocusGroup", [ut, Er, Po] = vo($e), [Do, Rr] = De(
  $e,
  [Po]
), [$o, Lo] = Do($e), Nr = y.forwardRef(
  (e, r) => /* @__PURE__ */ t.jsx(ut.Provider, { scope: e.__scopeRovingFocusGroup, children: /* @__PURE__ */ t.jsx(ut.Slot, { scope: e.__scopeRovingFocusGroup, children: /* @__PURE__ */ t.jsx(zo, { ...e, ref: r }) }) })
);
Nr.displayName = $e;
var zo = y.forwardRef((e, r) => {
  const {
    __scopeRovingFocusGroup: o,
    orientation: s,
    loop: i = !1,
    dir: l,
    currentTabStopId: h,
    defaultCurrentTabStopId: p,
    onCurrentTabStopIdChange: f,
    onEntryFocus: c,
    preventScrollOnEntryFocus: g = !1,
    ...u
  } = e, d = y.useRef(null), x = ve(r, d), j = pr(l), [E, w] = pt({
    prop: h,
    defaultProp: p ?? null,
    onChange: f,
    caller: $e
  }), [A, R] = y.useState(!1), I = So(c), M = Er(o), b = y.useRef(!1), [S, k] = y.useState(0);
  return y.useEffect(() => {
    const L = d.current;
    if (L)
      return L.addEventListener(it, I), () => L.removeEventListener(it, I);
  }, [I]), /* @__PURE__ */ t.jsx(
    $o,
    {
      scope: o,
      orientation: s,
      dir: j,
      loop: i,
      currentTabStopId: E,
      onItemFocus: y.useCallback(
        (L) => w(L),
        [w]
      ),
      onItemShiftTab: y.useCallback(() => R(!0), []),
      onFocusableItemAdd: y.useCallback(
        () => k((L) => L + 1),
        []
      ),
      onFocusableItemRemove: y.useCallback(
        () => k((L) => L - 1),
        []
      ),
      children: /* @__PURE__ */ t.jsx(
        xe.div,
        {
          tabIndex: A || S === 0 ? -1 : 0,
          "data-orientation": s,
          ...u,
          ref: x,
          style: { outline: "none", ...e.style },
          onMouseDown: me(e.onMouseDown, () => {
            b.current = !0;
          }),
          onFocus: me(e.onFocus, (L) => {
            const Y = !b.current;
            if (L.target === L.currentTarget && Y && !A) {
              const K = new CustomEvent(it, Mo);
              if (L.currentTarget.dispatchEvent(K), !K.defaultPrevented) {
                const Z = M().filter((F) => F.focusable), D = Z.find((F) => F.active), te = Z.find((F) => F.id === E), z = [D, te, ...Z].filter(
                  Boolean
                ).map((F) => F.ref.current);
                Sr(z, g);
              }
            }
            b.current = !1;
          }),
          onBlur: me(e.onBlur, () => R(!1))
        }
      )
    }
  );
}), Cr = "RovingFocusGroupItem", Tr = y.forwardRef(
  (e, r) => {
    const {
      __scopeRovingFocusGroup: o,
      focusable: s = !0,
      active: i = !1,
      tabStopId: l,
      children: h,
      ...p
    } = e, f = Co(), c = l || f, g = Lo(Cr, o), u = g.currentTabStopId === c, d = Er(o), { onFocusableItemAdd: x, onFocusableItemRemove: j, currentTabStopId: E } = g;
    return y.useEffect(() => {
      if (s)
        return x(), () => j();
    }, [s, x, j]), /* @__PURE__ */ t.jsx(
      ut.ItemSlot,
      {
        scope: o,
        id: c,
        focusable: s,
        active: i,
        children: /* @__PURE__ */ t.jsx(
          xe.span,
          {
            tabIndex: u ? 0 : -1,
            "data-orientation": g.orientation,
            ...p,
            ref: r,
            onMouseDown: me(e.onMouseDown, (w) => {
              s ? g.onItemFocus(c) : w.preventDefault();
            }),
            onFocus: me(e.onFocus, () => g.onItemFocus(c)),
            onKeyDown: me(e.onKeyDown, (w) => {
              if (w.key === "Tab" && w.shiftKey) {
                g.onItemShiftTab();
                return;
              }
              if (w.target !== w.currentTarget) return;
              const A = Uo(w, g.orientation, g.dir);
              if (A !== void 0) {
                if (w.metaKey || w.ctrlKey || w.altKey || w.shiftKey) return;
                w.preventDefault();
                let I = d().filter((M) => M.focusable).map((M) => M.ref.current);
                if (A === "last") I.reverse();
                else if (A === "prev" || A === "next") {
                  A === "prev" && I.reverse();
                  const M = I.indexOf(w.currentTarget);
                  I = g.loop ? Go(I, M + 1) : I.slice(M + 1);
                }
                setTimeout(() => Sr(I));
              }
            }),
            children: typeof h == "function" ? h({ isCurrentTabStop: u, hasTabStop: E != null }) : h
          }
        )
      }
    );
  }
);
Tr.displayName = Cr;
var Fo = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function Bo(e, r) {
  return r !== "rtl" ? e : e === "ArrowLeft" ? "ArrowRight" : e === "ArrowRight" ? "ArrowLeft" : e;
}
function Uo(e, r, o) {
  const s = Bo(e.key, o);
  if (!(r === "vertical" && ["ArrowLeft", "ArrowRight"].includes(s)) && !(r === "horizontal" && ["ArrowUp", "ArrowDown"].includes(s)))
    return Fo[s];
}
function Sr(e, r = !1) {
  const o = document.activeElement;
  for (const s of e)
    if (s === o || (s.focus({ preventScroll: r }), document.activeElement !== o)) return;
}
function Go(e, r) {
  return e.map((o, s) => e[(r + s) % e.length]);
}
var qo = Nr, Ho = Tr, gt = "Radio", [Wo, kr] = De(gt), [Yo, Vo] = Wo(gt), Or = y.forwardRef(
  (e, r) => {
    const {
      __scopeRadio: o,
      name: s,
      checked: i = !1,
      required: l,
      disabled: h,
      value: p = "on",
      onCheck: f,
      form: c,
      ...g
    } = e, [u, d] = y.useState(null), x = ve(r, (w) => d(w)), j = y.useRef(!1), E = u ? c || !!u.closest("form") : !0;
    return /* @__PURE__ */ t.jsxs(Yo, { scope: o, checked: i, disabled: h, children: [
      /* @__PURE__ */ t.jsx(
        xe.button,
        {
          type: "button",
          role: "radio",
          "aria-checked": i,
          "data-state": Pr(i),
          "data-disabled": h ? "" : void 0,
          disabled: h,
          value: p,
          ...g,
          ref: x,
          onClick: me(e.onClick, (w) => {
            i || f?.(), E && (j.current = w.isPropagationStopped(), j.current || w.stopPropagation());
          })
        }
      ),
      E && /* @__PURE__ */ t.jsx(
        Mr,
        {
          control: u,
          bubbles: !j.current,
          name: s,
          value: p,
          checked: i,
          required: l,
          disabled: h,
          form: c,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Or.displayName = gt;
var Ar = "RadioIndicator", Ir = y.forwardRef(
  (e, r) => {
    const { __scopeRadio: o, forceMount: s, ...i } = e, l = Vo(Ar, o);
    return /* @__PURE__ */ t.jsx(mt, { present: s || l.checked, children: /* @__PURE__ */ t.jsx(
      xe.span,
      {
        "data-state": Pr(l.checked),
        "data-disabled": l.disabled ? "" : void 0,
        ...i,
        ref: r
      }
    ) });
  }
);
Ir.displayName = Ar;
var Ko = "RadioBubbleInput", Mr = y.forwardRef(
  ({
    __scopeRadio: e,
    control: r,
    checked: o,
    bubbles: s = !0,
    ...i
  }, l) => {
    const h = y.useRef(null), p = ve(h, l), f = mr(o), c = hr(r);
    return y.useEffect(() => {
      const g = h.current;
      if (!g) return;
      const u = window.HTMLInputElement.prototype, x = Object.getOwnPropertyDescriptor(
        u,
        "checked"
      ).set;
      if (f !== o && x) {
        const j = new Event("click", { bubbles: s });
        x.call(g, o), g.dispatchEvent(j);
      }
    }, [f, o, s]), /* @__PURE__ */ t.jsx(
      xe.input,
      {
        type: "radio",
        "aria-hidden": !0,
        defaultChecked: o,
        ...i,
        tabIndex: -1,
        ref: p,
        style: {
          ...i.style,
          ...c,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
Mr.displayName = Ko;
function Pr(e) {
  return e ? "checked" : "unchecked";
}
var Xo = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], tt = "RadioGroup", [Qo] = De(tt, [
  Rr,
  kr
]), Dr = Rr(), $r = kr(), [Zo, Jo] = Qo(tt), Lr = y.forwardRef(
  (e, r) => {
    const {
      __scopeRadioGroup: o,
      name: s,
      defaultValue: i,
      value: l,
      required: h = !1,
      disabled: p = !1,
      orientation: f,
      dir: c,
      loop: g = !0,
      onValueChange: u,
      ...d
    } = e, x = Dr(o), j = pr(c), [E, w] = pt({
      prop: l,
      defaultProp: i ?? null,
      onChange: u,
      caller: tt
    });
    return /* @__PURE__ */ t.jsx(
      Zo,
      {
        scope: o,
        name: s,
        required: h,
        disabled: p,
        value: E,
        onValueChange: w,
        children: /* @__PURE__ */ t.jsx(
          qo,
          {
            asChild: !0,
            ...x,
            orientation: f,
            dir: j,
            loop: g,
            children: /* @__PURE__ */ t.jsx(
              xe.div,
              {
                role: "radiogroup",
                "aria-required": h,
                "aria-orientation": f,
                "data-disabled": p ? "" : void 0,
                dir: j,
                ...d,
                ref: r
              }
            )
          }
        )
      }
    );
  }
);
Lr.displayName = tt;
var zr = "RadioGroupItem", Fr = y.forwardRef(
  (e, r) => {
    const { __scopeRadioGroup: o, disabled: s, ...i } = e, l = Jo(zr, o), h = l.disabled || s, p = Dr(o), f = $r(o), c = y.useRef(null), g = ve(r, c), u = l.value === i.value, d = y.useRef(!1);
    return y.useEffect(() => {
      const x = (E) => {
        Xo.includes(E.key) && (d.current = !0);
      }, j = () => d.current = !1;
      return document.addEventListener("keydown", x), document.addEventListener("keyup", j), () => {
        document.removeEventListener("keydown", x), document.removeEventListener("keyup", j);
      };
    }, []), /* @__PURE__ */ t.jsx(
      Ho,
      {
        asChild: !0,
        ...p,
        focusable: !h,
        active: u,
        children: /* @__PURE__ */ t.jsx(
          Or,
          {
            disabled: h,
            required: l.required,
            checked: u,
            ...f,
            ...i,
            name: l.name,
            ref: g,
            onCheck: () => l.onValueChange(i.value),
            onKeyDown: me((x) => {
              x.key === "Enter" && x.preventDefault();
            }),
            onFocus: me(i.onFocus, () => {
              d.current && c.current?.click();
            })
          }
        )
      }
    );
  }
);
Fr.displayName = zr;
var es = "RadioGroupIndicator", Br = y.forwardRef(
  (e, r) => {
    const { __scopeRadioGroup: o, ...s } = e, i = $r(o);
    return /* @__PURE__ */ t.jsx(Ir, { ...i, ...s, ref: r });
  }
);
Br.displayName = es;
var ts = Lr, rs = Fr, ns = Br;
const os = "_Container_1tuad_1", ss = "_Checkbox_1tuad_22", as = "_CheckMark_1tuad_92", is = "_Label_1tuad_162", Ve = {
  Container: os,
  Checkbox: ss,
  CheckMark: as,
  Label: is
}, cs = ({ className: e, label: r, id: o, disabled: s, orientation: i = "left", ...l }) => {
  const h = y.useId(), p = o ?? h;
  return t.jsxs("div", { "data-disabled": s ? "" : void 0, "data-has-label": r ? "" : void 0, "data-orientation": i, className: ce(e, Ve.Container), children: [t.jsx(vr, { className: Ve.Checkbox, id: p, disabled: s, ...l, children: t.jsx(br, { className: Ve.CheckMark }) }), r && t.jsx("label", { htmlFor: p, className: Ve.Label, onMouseDown: (f) => {
    !f.defaultPrevented && f.detail > 1 && f.preventDefault();
  }, children: r })] });
}, ls = "_Container_1a6nz_1", us = "_Input_1a6nz_229", Jt = {
  Container: ls,
  Input: us
}, ds = (e) => {
  const r = y.useRef(null), s = `search-ui-input-${y.useId()}`, {
    id: i,
    name: l,
    type: h = "text",
    variant: p = "outline",
    size: f = "md",
    gutterSize: c,
    className: g,
    autoComplete: u,
    disabled: d = !1,
    readOnly: x = !1,
    invalid: j = !1,
    // Default to `true` when the field declares autofill semantics.
    allowAutofillExtensions: E = h === "password" || !!l || !!u && u !== "off",
    onFocus: w,
    onBlur: A,
    onAnimationStart: R,
    onAutofill: I,
    autoSelect: M,
    startAdornment: b,
    endAdornment: S,
    pill: k,
    opticallyAlign: L,
    ref: Y,
    ...K
  } = e, Z = (z) => {
    const F = r.current;
    if (!z.target || !(z.target instanceof Element) || !F || F.contains(z.target) || z.target.closest("button, [type='button'], [role='button'], [role='menuitem']"))
      return;
    z.preventDefault(), document.activeElement !== F && F.focus();
    const { left: oe, top: le } = F.getBoundingClientRect(), { clientX: ue, clientY: pe } = z, a = pe < le || ue < oe;
    if (z.detail === 1)
      if (a)
        F.setSelectionRange(0, 0);
      else {
        const v = F.value.length;
        F.setSelectionRange(v, v);
      }
    else if (z.detail === 2) {
      const v = F.value.match(/\w+|[^\w\s]/g) || [], N = a ? v.at(0) : v.at(-1);
      if (N) {
        const T = a ? F.value.indexOf(N) : F.value.lastIndexOf(N);
        F.setSelectionRange(T, T + N.length);
      }
    } else
      F.select();
  }, [D, te] = y.useState(!1);
  y.useEffect(() => {
    M && r.current?.select();
  }, [M]);
  const re = (z) => {
    R?.(z), z.animationName === "native-autofill-in" && I?.();
  };
  return t.jsxs("div", { className: ce(Jt.Container, g), "data-variant": p, "data-size": f, "data-gutter-size": c, "data-focused": D, "data-disabled": d ? "" : void 0, "data-readonly": x ? "" : void 0, "data-invalid": j ? "" : void 0, "data-pill": k ? "" : void 0, "data-optically-align": L, "data-has-start-adornment": b ? "" : void 0, "data-has-end-adornment": S ? "" : void 0, onMouseDown: Z, children: [b, t.jsx("input", { ...K, ref: Ze([Y, r]), id: i || (E ? void 0 : s), className: Jt.Input, type: h, name: l, autoComplete: u, readOnly: x, disabled: d, onFocus: (z) => {
    te(!0), w?.(z);
  }, onBlur: (z) => {
    te(!1), A?.(z);
  }, onAnimationStart: re, "data-lpignore": E ? void 0 : !0, "data-1p-ignore": E ? void 0 : !0 }), S] });
}, fs = "_RadioGroup_onrfm_1", ps = "_RadioLabel_onrfm_9", ms = "_RadioIndicatorWrapper_onrfm_26", hs = "_RadioItem_onrfm_43", gs = "_RadioIndicator_onrfm_26", Ae = {
  RadioGroup: fs,
  RadioLabel: ps,
  RadioIndicatorWrapper: ms,
  RadioItem: hs,
  RadioIndicator: gs
}, Ur = y.createContext(null), ys = () => {
  const e = y.use(Ur);
  if (!e)
    throw new Error("RadioGroup components must be wrapped in <RadioGroup />");
  return e;
}, dt = ({ onChange: e, children: r, className: o, direction: s = "row", disabled: i = !1, ...l }) => {
  const h = y.useMemo(() => ({
    disabled: i,
    direction: s
  }), [i, s]);
  return t.jsx(Ur, { value: h, children: t.jsx(ts, { className: ce(Ae.RadioGroup, o), "data-direction": s, onValueChange: e, disabled: i, ...l, children: r }) });
}, vs = ({ value: e, disabled: r = !1, required: o, children: s, className: i, block: l = !1, ...h }) => {
  const { disabled: p } = ys(), f = p || r, c = y.useId(), g = `${e}-${c}`;
  return (
    // Providing an extra wrapper enables `label` to be inline-flex, avoiding clickable whitespace
    // when radio options are of varied lengths.
    // NOTE: Important that this is `flex` to prevent the `inline-flex` label from extra, unintentional whitespace.
    t.jsx("div", { className: "flex", ...h, children: t.jsxs("label", { htmlFor: g, className: ce(Ae.RadioLabel, i), "data-disabled": f ? "" : void 0, "data-block": l ? "" : void 0, onMouseDown: (u) => {
      !u.defaultPrevented && u.detail > 1 && u.preventDefault();
    }, children: [t.jsx("div", { className: Ae.RadioIndicatorWrapper, children: t.jsx(rs, { id: g, value: e, disabled: f, required: o, className: Ae.RadioItem, children: t.jsx(ns, { className: Ae.RadioIndicator }) }) }), s] }) })
  );
};
dt.Item = vs;
const xs = "_Container_13560_1", bs = "_Textarea_13560_174", er = {
  Container: xs,
  Textarea: bs
}, _s = (e) => {
  const r = y.useRef(null), s = `search-ui-input-${y.useId()}`, {
    id: i,
    name: l,
    variant: h = "outline",
    size: p = "md",
    gutterSize: f,
    className: c,
    autoComplete: g,
    disabled: u = !1,
    readOnly: d = !1,
    invalid: x = !1,
    // Default to `true` when presence of `name`
    allowAutofillExtensions: j = !!l,
    onFocus: E,
    onBlur: w,
    onAnimationStart: A,
    onAutofill: R,
    autoSelect: I,
    rows: M = 3,
    maxRows: b,
    autoResize: S,
    ref: k,
    onChange: L,
    ...Y
  } = e, [K, Z] = y.useState(!1), D = S ? Math.max(b ?? 10, M) : M;
  y.useEffect(() => {
    I && r.current?.select();
  }, [I]);
  const te = (z) => {
    A?.(z), z.animationName === "native-autofill-in" && R?.();
  }, re = y.useCallback(() => {
    if (!S || !r.current || D === void 0)
      return;
    r.current.style.height = "0px";
    const z = r.current.scrollHeight;
    r.current.style.height = z + "px";
  }, [S, D]);
  return y.useEffect(() => {
    re();
  }, [e.value, M, re]), t.jsx("div", { className: ce(er.Container, c), "data-variant": h, "data-size": p, "data-gutter-size": f, "data-focused": K, "data-disabled": u ? "" : void 0, "data-readonly": d ? "" : void 0, "data-invalid": x ? "" : void 0, style: ur({
    "textarea-min-rows": `${M}`,
    "textarea-max-rows": `${D}`
  }), children: t.jsx("textarea", { ...Y, onChange: (z) => {
    L?.(z), re();
  }, ref: Ze([r, k]), id: i || (j ? void 0 : s), className: er.Textarea, name: l, readOnly: d, disabled: u, rows: M, onFocus: (z) => {
    Z(!0), E?.(z);
  }, onBlur: (z) => {
    Z(!1), w?.(z);
  }, onAnimationStart: te, "data-lpignore": j ? void 0 : !0, "data-1p-ignore": j ? void 0 : !0 }) });
}, ws = (e) => "error" in e && !!e.error;
function ra({
  clarification: e
}) {
  const [r, o] = V.useState(
    "current_index" in e ? e.current_index ?? 0 : 0
  ), [s, i] = V.useState(!1);
  if (V.useEffect(() => {
    "current_index" in e && (o(e.current_index ?? 0), i(!1));
  }, [
    "session_id" in e ? e.session_id : null,
    "current_index" in e ? e.current_index : null
  ]), ws(e))
    return /* @__PURE__ */ t.jsx(ne, { eyebrow: "Clarify", title: "Trip Clarification", error: e.error, children: null });
  const l = e.questions ?? [], h = Math.min(Math.max(r, 0), Math.max(l.length - 1, 0)), p = l[h] ?? l[0], f = e.total_questions ?? l.length, c = h + 1 >= l.length, g = () => {
    if (c) {
      i(!0);
      return;
    }
    o((u) => Math.min(u + 1, l.length - 1));
  };
  return /* @__PURE__ */ t.jsx(
    ne,
    {
      eyebrow: "Clarify",
      title: e.destination ? `Plan ${e.destination}` : "Trip Clarification",
      description: "Collect only the missing fields needed to continue planning.",
      empty: !p,
      emptyTitle: "No questions needed",
      emptyDescription: "The request already has enough structure to continue.",
      children: /* @__PURE__ */ t.jsxs("article", { className: "rounded-2xl border border-subtle bg-surface p-4 shadow-sm", children: [
        /* @__PURE__ */ t.jsxs("div", { className: "mb-4 flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ t.jsx(se, { color: "info", pill: !0, children: s ? "Ready to continue" : `Question ${h + 1} of ${f}` }),
          p?.required ? /* @__PURE__ */ t.jsx(se, { color: "warning", children: "Required" }) : /* @__PURE__ */ t.jsx(se, { color: "secondary", children: "Optional" })
        ] }),
        s ? /* @__PURE__ */ t.jsxs("div", { className: "rounded-xl border border-subtle bg-primary p-4", children: [
          /* @__PURE__ */ t.jsx("h2", { className: "text-base font-semibold text-primary", children: "Clarification complete" }),
          /* @__PURE__ */ t.jsx("p", { className: "mt-1 text-sm text-secondary", children: "Answers are ready for the next planning step." })
        ] }) : /* @__PURE__ */ t.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ t.jsx("h2", { className: "heading-md text-primary", children: p?.prompt }),
          p?.reason ? /* @__PURE__ */ t.jsx("p", { className: "text-sm text-secondary", children: p.reason }) : null,
          p?.answer_type === "single_choice" ? /* @__PURE__ */ t.jsx(
            dt,
            {
              "aria-label": p.prompt,
              defaultValue: p.options?.[0]?.value,
              direction: "col",
              className: "grid gap-2 pt-2",
              children: p.options.map((u) => /* @__PURE__ */ t.jsx(dt.Item, { value: u.value, children: u.label }, u.id))
            },
            p.id
          ) : p?.answer_type === "multi_choice" ? /* @__PURE__ */ t.jsx("div", { className: "grid gap-2 pt-2", children: p.options.map((u) => /* @__PURE__ */ t.jsx(cs, { value: u.value, label: u.label }, u.id)) }) : /* @__PURE__ */ t.jsx(_s, { placeholder: "Add details...", rows: 4 }, p?.id),
          p?.allow_free_text && p.answer_type !== "free_text" ? /* @__PURE__ */ t.jsx(ds, { placeholder: "Or type a custom answer" }, `${p.id}-custom`) : null
        ] }),
        /* @__PURE__ */ t.jsxs("div", { className: "mt-5 flex flex-wrap justify-between gap-2 border-t border-subtle pt-4", children: [
          /* @__PURE__ */ t.jsx(
            ee,
            {
              color: "secondary",
              variant: "soft",
              size: "sm",
              disabled: h === 0 && !s,
              onClick: () => {
                if (s) {
                  i(!1), o(Math.max(l.length - 1, 0));
                  return;
                }
                o((u) => Math.max(u - 1, 0));
              },
              children: "Previous"
            }
          ),
          /* @__PURE__ */ t.jsxs("div", { className: "flex gap-2", children: [
            !s && p?.allow_skip ? /* @__PURE__ */ t.jsx(ee, { color: "secondary", variant: "ghost", size: "sm", onClick: g, children: "Skip" }) : null,
            /* @__PURE__ */ t.jsx(
              ee,
              {
                color: "primary",
                variant: "solid",
                size: "sm",
                onClick: s ? () => {
                  i(!1), o(0);
                } : g,
                children: s ? "Review answers" : c ? "Submit" : "Next"
              }
            )
          ] })
        ] })
      ] })
    }
  );
}
const js = (e) => "error" in e && !!e.error;
function na({ inbox: e }) {
  if (js(e))
    return /* @__PURE__ */ t.jsx(ne, { eyebrow: "Capture", title: "Trip Inbox", error: e.error, children: null });
  const r = e.items ?? [];
  return /* @__PURE__ */ t.jsx(
    ne,
    {
      eyebrow: "Capture",
      title: e.trip?.title || "Trip Inbox",
      description: `${r.length} saved fragment${r.length === 1 ? "" : "s"} waiting for triage.`,
      empty: r.length === 0,
      emptyTitle: "Inbox is empty",
      emptyDescription: "Saved travel ideas and notes will appear here before they move to the trip board.",
      children: /* @__PURE__ */ t.jsxs("article", { className: "rounded-2xl border border-subtle bg-surface shadow-sm", children: [
        /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-subtle p-4", children: [
          /* @__PURE__ */ t.jsxs("div", { children: [
            /* @__PURE__ */ t.jsx("h2", { className: "heading-md text-primary", children: "Saved fragments" }),
            /* @__PURE__ */ t.jsx("p", { className: "mt-1 text-sm text-secondary", children: "Quickly classify raw notes into trip decisions." })
          ] }),
          /* @__PURE__ */ t.jsxs(se, { color: "info", pill: !0, children: [
            r.length,
            " inbox"
          ] })
        ] }),
        /* @__PURE__ */ t.jsx("div", { className: "divide-y divide-subtle", children: r.map((o, s) => {
          const i = Je([o.source_label, o.notes || o.raw_content]);
          return /* @__PURE__ */ t.jsxs("section", { className: "grid gap-3 p-4 sm:grid-cols-[1fr_auto]", children: [
            /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ t.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ t.jsx("h3", { className: "text-base font-semibold text-primary", children: o.title || "Saved idea" }),
                /* @__PURE__ */ t.jsx(se, { color: "secondary", variant: "soft", pill: !0, children: ge(o.item_type) })
              ] }),
              i.length > 0 ? /* @__PURE__ */ t.jsx("p", { className: "mt-2 text-sm text-secondary", children: i.join(" · ") }) : null
            ] }),
            /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ t.jsx(ee, { color: "secondary", variant: "soft", size: "sm", children: "Shortlist" }),
              /* @__PURE__ */ t.jsx(ee, { color: "primary", variant: "solid", size: "sm", children: "Add to board" })
            ] })
          ] }, `${o.title}-${s}`);
        }) })
      ] })
    }
  );
}
const Es = (e) => "error" in e && !!e.error, Rs = (e, r) => String(e.label ?? "").match(/\d+/)?.[0] ?? String(r + 1), ct = (e) => Je([e.location_note, e.price_note, e.notes]);
function oa({ itinerary: e }) {
  const r = Es(e), o = r ? {} : e, s = o.days ?? [], i = o.counts?.scheduled ?? s.reduce((u, d) => u + (d.items?.length ?? 0), 0), [l, h] = V.useState(0), [p, f] = V.useState(null), c = s[l] ?? s[0], g = c?.items?.find((u, d) => `${u.title}-${d}` === p) ?? c?.items?.[0] ?? null;
  return r ? /* @__PURE__ */ t.jsx(ne, { eyebrow: "Schedule", title: "Day by day", error: e.error, children: null }) : /* @__PURE__ */ t.jsx(
    ne,
    {
      eyebrow: "Schedule",
      title: o.trip?.title || "Day by day",
      description: `${i} scheduled item${i === 1 ? "" : "s"}.`,
      empty: s.length === 0,
      emptyTitle: "No itinerary yet",
      emptyDescription: "Scheduled trip items will appear here once the plan has dated commitments.",
      children: /* @__PURE__ */ t.jsxs("article", { className: "overflow-hidden rounded-xl border border-[var(--color-border)] bg-surface shadow-sm", children: [
        /* @__PURE__ */ t.jsx("div", { className: "flex gap-2 overflow-x-auto border-b border-[var(--color-border)] p-3", children: s.map((u, d) => /* @__PURE__ */ t.jsx(
          ee,
          {
            color: "secondary",
            variant: l === d ? "solid" : "soft",
            size: "sm",
            onClick: () => {
              h(d), f(null);
            },
            children: u.label || `Day ${d + 1}`
          },
          `${u.label}-${d}`
        )) }),
        /* @__PURE__ */ t.jsx("div", { children: s.map((u, d) => /* @__PURE__ */ t.jsxs(
          "section",
          {
            className: l === d ? "grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_280px]" : "hidden",
            children: [
              /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ t.jsxs("div", { className: "mb-3 flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ t.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-secondary text-sm font-semibold text-primary", children: Rs(u, d) }),
                  /* @__PURE__ */ t.jsx("h2", { className: "text-base font-semibold text-primary", children: u.label || "Scheduled" }),
                  /* @__PURE__ */ t.jsxs(se, { color: "secondary", variant: "soft", pill: !0, children: [
                    u.items?.length ?? 0,
                    " items"
                  ] })
                ] }),
                /* @__PURE__ */ t.jsx("div", { className: "space-y-2", children: (u.items ?? []).map((x, j) => {
                  const E = `${x.title}-${j}`, w = p === E || p == null && j === 0;
                  return /* @__PURE__ */ t.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => f(E),
                      className: `grid w-full grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-lg border p-3 text-left transition ${w ? "border-[var(--color-border-primary-outline)] bg-secondary shadow-sm" : "border-[var(--color-border)] bg-primary hover:border-[var(--color-border-secondary-outline-hover)]"}`,
                      children: [
                        /* @__PURE__ */ t.jsx("p", { className: "pt-0.5 text-xs font-semibold text-tertiary", children: x.schedule_label || "Plan" }),
                        /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
                          /* @__PURE__ */ t.jsx("p", { className: "truncate text-sm font-semibold text-primary", children: x.title || "Saved item" }),
                          ct(x).length > 0 ? /* @__PURE__ */ t.jsx("p", { className: "mt-1 text-xs leading-snug text-secondary", children: ct(x).join(" · ") }) : null
                        ] })
                      ]
                    },
                    E
                  );
                }) })
              ] }),
              g ? /* @__PURE__ */ t.jsxs("aside", { className: "rounded-lg border border-[var(--color-border)] bg-primary p-4", children: [
                /* @__PURE__ */ t.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-tertiary", children: "Focused item" }),
                /* @__PURE__ */ t.jsx("h3", { className: "mt-1 text-sm font-semibold text-primary", children: g.title }),
                /* @__PURE__ */ t.jsx("p", { className: "mt-1 text-xs leading-snug text-secondary", children: ct(g).join(" · ") || "No extra details yet." }),
                /* @__PURE__ */ t.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
                  /* @__PURE__ */ t.jsx(ee, { color: "primary", variant: "solid", size: "sm", children: "Alternatives" }),
                  /* @__PURE__ */ t.jsx(ee, { color: "secondary", variant: "soft", size: "sm", children: "Move" })
                ] })
              ] }) : null
            ]
          },
          `${u.label}-${d}`
        )) }),
        o.gaps?.length ? /* @__PURE__ */ t.jsx("div", { className: "border-t border-[var(--color-border)] p-4", children: /* @__PURE__ */ t.jsx(
          Me,
          {
            color: "warning",
            variant: "soft",
            title: "Schedule gaps",
            description: o.gaps.join(" · ")
          }
        ) }) : null
      ] })
    }
  );
}
const Ns = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Cs = (e) => e.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (r, o, s) => s ? s.toUpperCase() : o.toLowerCase()
), tr = (e) => {
  const r = Cs(e);
  return r.charAt(0).toUpperCase() + r.slice(1);
}, Gr = (...e) => e.filter((r, o, s) => !!r && r.trim() !== "" && s.indexOf(r) === o).join(" ").trim(), Ts = (e) => {
  for (const r in e)
    if (r.startsWith("aria-") || r === "role" || r === "title")
      return !0;
};
var Ss = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const ks = y.forwardRef(
  ({
    color: e = "currentColor",
    size: r = 24,
    strokeWidth: o = 2,
    absoluteStrokeWidth: s,
    className: i = "",
    children: l,
    iconNode: h,
    ...p
  }, f) => y.createElement(
    "svg",
    {
      ref: f,
      ...Ss,
      width: r,
      height: r,
      stroke: e,
      strokeWidth: s ? Number(o) * 24 / Number(r) : o,
      className: Gr("lucide", i),
      ...!l && !Ts(p) && { "aria-hidden": "true" },
      ...p
    },
    [
      ...h.map(([c, g]) => y.createElement(c, g)),
      ...Array.isArray(l) ? l : [l]
    ]
  )
);
const ye = (e, r) => {
  const o = y.forwardRef(
    ({ className: s, ...i }, l) => y.createElement(ks, {
      ref: l,
      iconNode: r,
      className: Gr(
        `lucide-${Ns(tr(e))}`,
        `lucide-${e}`,
        s
      ),
      ...i
    })
  );
  return o.displayName = tr(e), o;
};
const Os = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M16 14h.01", key: "1gbofw" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M16 18h.01", key: "kzsmim" }]
], As = ye("calendar-days", Os);
const Is = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]], Ms = ye("check", Is);
const Ps = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]], Ds = ye("chevron-left", Ps);
const $s = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]], Ls = ye("chevron-right", $s);
const zs = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8", key: "1h4pet" }],
  ["path", { d: "M12 18V6", key: "zqpxq5" }]
], Fs = ye("circle-dollar-sign", zs);
const Bs = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
], Us = ye("image", Bs);
const Gs = [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
], qr = ye("map-pin", Gs);
const qs = [["path", { d: "M5 12h14", key: "1ays0h" }]], Hs = ye("minus", qs);
const Ws = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
], Ys = ye("plus", Ws);
const Vs = [
  [
    "path",
    {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }
  ]
], Ks = ye("star", Vs), Le = (e) => "error" in e && !!e.error, rt = {
  lodging: "Lodging",
  food: "Food",
  activity: "Activities",
  transit: "Transit",
  neighborhood: "Areas",
  flight: "Flights"
}, Hr = {
  inbox: "Inbox",
  shortlisted: "Shortlisted",
  recommended: "Recommended",
  selected: "Selected",
  booked: "Booked",
  open: "Open"
}, rr = (e) => Je([
  e.neighborhood,
  e.schedule_label,
  e.price_note,
  e.distance_note,
  e.source
]), Xe = (e, r) => Array.from(new Set(e.map((o) => o[r]).filter(Boolean).map(String))), Wr = (e, r) => e.find((o) => o.id === r) ?? e[0] ?? null;
function yt({
  value: e,
  options: r,
  onChange: o
}) {
  return /* @__PURE__ */ t.jsxs("div", { className: "flex gap-2 overflow-x-auto pb-1", children: [
    /* @__PURE__ */ t.jsx(
      ee,
      {
        color: "secondary",
        variant: e === "all" ? "solid" : "soft",
        size: "sm",
        onClick: () => o("all"),
        children: "All"
      }
    ),
    r.map((s) => /* @__PURE__ */ t.jsx(
      ee,
      {
        color: "secondary",
        variant: e === s ? "solid" : "soft",
        size: "sm",
        onClick: () => o(s),
        children: rt[s] ?? ge(s)
      },
      s
    ))
  ] });
}
function Xs({
  option: e,
  selected: r,
  onClick: o
}) {
  const s = /* @__PURE__ */ t.jsxs("div", { className: "flex items-start gap-3", children: [
    e.image_url ? /* @__PURE__ */ t.jsx(
      "img",
      {
        src: e.image_url,
        alt: "",
        className: "h-16 w-16 flex-none rounded-lg object-cover",
        loading: "lazy"
      }
    ) : null,
    /* @__PURE__ */ t.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ t.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ t.jsx("p", { className: "truncate text-sm font-semibold text-primary", children: e.title }),
          /* @__PURE__ */ t.jsx("p", { className: "mt-1 text-xs text-secondary", children: e.subtitle })
        ] }),
        e.score ? /* @__PURE__ */ t.jsx(se, { color: e.score >= 90 ? "success" : "secondary", variant: "soft", pill: !0, children: e.score }) : null
      ] }),
      /* @__PURE__ */ t.jsxs("div", { className: "mt-3 flex flex-wrap gap-1.5", children: [
        /* @__PURE__ */ t.jsx(se, { color: "secondary", variant: "soft", children: rt[e.category] ?? ge(e.category) }),
        e.status ? /* @__PURE__ */ t.jsx(se, { color: e.status === "booked" ? "success" : "info", variant: "soft", children: Hr[e.status] ?? ge(e.status) }) : null
      ] }),
      rr(e).length ? /* @__PURE__ */ t.jsx("p", { className: "mt-3 line-clamp-2 text-xs leading-snug text-secondary", children: rr(e).join(" · ") }) : null
    ] })
  ] });
  return o ? /* @__PURE__ */ t.jsx(
    "button",
    {
      type: "button",
      onClick: o,
      className: `w-full rounded-xl border p-3 text-left transition ${r ? "border-[var(--color-border-primary-outline)] bg-secondary shadow-sm" : "border-[var(--color-border)] bg-primary hover:border-[var(--color-border-secondary-outline-hover)]"}`,
      children: s
    }
  ) : /* @__PURE__ */ t.jsx("div", { className: "rounded-xl border border-[var(--color-border)] bg-primary p-3", children: s });
}
function vt({
  option: e,
  action: r,
  secondaryAction: o
}) {
  const [s, i] = V.useState(null);
  return V.useEffect(() => i(null), [e?.id]), e ? /* @__PURE__ */ t.jsxs("aside", { className: "rounded-xl border border-[var(--color-border)] bg-primary p-4", children: [
    e.image_url ? /* @__PURE__ */ t.jsx(
      "img",
      {
        src: e.image_url,
        alt: "",
        className: "mb-4 aspect-[4/3] w-full rounded-xl object-cover",
        loading: "lazy"
      }
    ) : null,
    /* @__PURE__ */ t.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ t.jsxs("div", { children: [
        /* @__PURE__ */ t.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-tertiary", children: "Focused option" }),
        /* @__PURE__ */ t.jsx("h3", { className: "mt-1 text-base font-semibold text-primary", children: e.title })
      ] }),
      e.recommended ? /* @__PURE__ */ t.jsxs(se, { color: "success", variant: "soft", children: [
        /* @__PURE__ */ t.jsx(Ks, { className: "h-3.5 w-3.5" }),
        "Pick"
      ] }) : null
    ] }),
    /* @__PURE__ */ t.jsx("p", { className: "mt-2 text-sm text-secondary", children: e.description || e.subtitle }),
    /* @__PURE__ */ t.jsxs("div", { className: "mt-3 grid gap-2 text-xs text-secondary", children: [
      e.price ? /* @__PURE__ */ t.jsxs("p", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ t.jsx(Fs, { className: "h-3.5 w-3.5" }),
        _e(e.price, e.currency)
      ] }) : null,
      e.schedule_label ? /* @__PURE__ */ t.jsxs("p", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ t.jsx(As, { className: "h-3.5 w-3.5" }),
        e.schedule_label
      ] }) : null,
      e.neighborhood ? /* @__PURE__ */ t.jsxs("p", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ t.jsx(qr, { className: "h-3.5 w-3.5" }),
        e.neighborhood
      ] }) : null
    ] }),
    e.pros?.length || e.cons?.length ? /* @__PURE__ */ t.jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [
      e.pros?.length ? /* @__PURE__ */ t.jsxs("div", { children: [
        /* @__PURE__ */ t.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-tertiary", children: "Pros" }),
        /* @__PURE__ */ t.jsx("ul", { className: "mt-1 space-y-1 text-xs text-secondary", children: e.pros.map((l) => /* @__PURE__ */ t.jsxs("li", { children: [
          "+ ",
          l
        ] }, l)) })
      ] }) : null,
      e.cons?.length ? /* @__PURE__ */ t.jsxs("div", { children: [
        /* @__PURE__ */ t.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-tertiary", children: "Tradeoffs" }),
        /* @__PURE__ */ t.jsx("ul", { className: "mt-1 space-y-1 text-xs text-secondary", children: e.cons.map((l) => /* @__PURE__ */ t.jsxs("li", { children: [
          "- ",
          l
        ] }, l)) })
      ] }) : null
    ] }) : null,
    /* @__PURE__ */ t.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
      r ? /* @__PURE__ */ t.jsx(ee, { color: "primary", variant: "solid", size: "sm", onClick: () => i(`${r}: ${e.title}`), children: r }) : null,
      o ? /* @__PURE__ */ t.jsx(
        ee,
        {
          color: "secondary",
          variant: "soft",
          size: "sm",
          onClick: () => i(`${o}: ${e.title}`),
          children: o
        }
      ) : null
    ] }),
    s ? /* @__PURE__ */ t.jsx("p", { className: "mt-3 text-xs text-secondary", children: s }) : null
  ] }) : /* @__PURE__ */ t.jsx("div", { className: "rounded-xl border border-dashed border-[var(--color-border)] p-4 text-sm text-secondary", children: "Select an item to see details." });
}
const Yr = () => {
  if (!(typeof window > "u"))
    return window.openai;
}, nr = (e, r) => {
  const o = Yr()?.widgetState?.[e];
  return o === void 0 ? r : o;
};
function he(e, r) {
  const [o, s] = V.useState(() => nr(e, r)), i = V.useCallback(
    (l) => {
      s((h) => {
        const p = typeof l == "function" ? l(h) : l, f = Yr();
        if (f?.setWidgetState) {
          const g = { ...f.widgetState ?? {}, [e]: p };
          f.widgetState = g, Promise.resolve(f.setWidgetState(g)).catch(() => {
          });
        }
        return p;
      });
    },
    [e]
  );
  return V.useEffect(() => {
    s(nr(e, r));
  }, [r, e]), [o, i];
}
function sa({ data: e }) {
  const r = "items" in e ? e.items ?? [] : [], [o, s] = he("travel-cart:items", r), [i, l] = he("travel-cart:feedback", null);
  if (V.useEffect(() => {
    "items" in e && (s(e.items ?? []), l(null));
  }, [e, l, s]), Le(e))
    return /* @__PURE__ */ t.jsx(ne, { eyebrow: "Package", title: "Draft Trip Cart", error: e.error, children: null });
  const h = o.reduce((p, f) => p + f.price * f.quantity, 0);
  return /* @__PURE__ */ t.jsx(
    ne,
    {
      eyebrow: "Package",
      title: e.trip?.title || "Draft trip cart",
      description: "Mock selected-trip package for review before any real booking step.",
      empty: o.length === 0,
      emptyTitle: "No selected trip items",
      children: /* @__PURE__ */ t.jsx("article", { className: "overflow-hidden rounded-xl border border-[var(--color-border)] bg-surface shadow-sm", children: /* @__PURE__ */ t.jsxs("div", { className: "grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_300px]", children: [
        /* @__PURE__ */ t.jsx("div", { className: "space-y-2", children: o.map((p) => /* @__PURE__ */ t.jsxs(
          "div",
          {
            className: `grid gap-3 rounded-xl border border-[var(--color-border)] bg-primary p-3 ${p.image_url ? "sm:grid-cols-[72px_1fr_auto]" : "sm:grid-cols-[1fr_auto]"}`,
            children: [
              p.image_url ? /* @__PURE__ */ t.jsx(
                "img",
                {
                  src: p.image_url,
                  alt: "",
                  className: "h-[72px] w-[72px] rounded-lg object-cover",
                  loading: "lazy"
                }
              ) : null,
              /* @__PURE__ */ t.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ t.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ t.jsx("p", { className: "text-sm font-semibold text-primary", children: p.title }),
                  /* @__PURE__ */ t.jsx(se, { color: p.ready ? "success" : "warning", variant: "soft", children: p.ready ? "Ready" : "Needs review" })
                ] }),
                /* @__PURE__ */ t.jsx("p", { className: "mt-1 text-xs text-secondary", children: p.subtitle }),
                p.warning ? /* @__PURE__ */ t.jsx("p", { className: "mt-2 text-xs text-secondary", children: p.warning }) : null
              ] }),
              /* @__PURE__ */ t.jsxs("div", { className: "flex items-center justify-between gap-3 sm:flex-col sm:items-end", children: [
                /* @__PURE__ */ t.jsx("p", { className: "text-sm font-semibold text-primary", children: _e(p.price * p.quantity, e.currency) }),
                /* @__PURE__ */ t.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ t.jsx(
                    ee,
                    {
                      "aria-label": `Decrease ${p.title} quantity`,
                      color: "secondary",
                      variant: "soft",
                      size: "sm",
                      onClick: () => s(
                        (f) => f.map(
                          (c) => c.id === p.id ? { ...c, quantity: c.quantity - 1 } : c
                        ).filter((c) => c.quantity > 0)
                      ),
                      children: /* @__PURE__ */ t.jsx(Hs, { className: "h-3.5 w-3.5" })
                    }
                  ),
                  /* @__PURE__ */ t.jsx("span", { className: "w-5 text-center text-sm text-secondary", children: p.quantity }),
                  /* @__PURE__ */ t.jsx(
                    ee,
                    {
                      "aria-label": `Increase ${p.title} quantity`,
                      color: "secondary",
                      variant: "soft",
                      size: "sm",
                      onClick: () => s(
                        (f) => f.map(
                          (c) => c.id === p.id ? { ...c, quantity: c.quantity + 1 } : c
                        )
                      ),
                      children: /* @__PURE__ */ t.jsx(Ys, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] })
              ] })
            ]
          },
          p.id
        )) }),
        /* @__PURE__ */ t.jsxs("aside", { className: "rounded-xl border border-[var(--color-border)] bg-primary p-4", children: [
          /* @__PURE__ */ t.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-tertiary", children: "Draft package" }),
          /* @__PURE__ */ t.jsxs("div", { className: "mt-3 flex items-end justify-between", children: [
            /* @__PURE__ */ t.jsx("span", { className: "text-sm text-secondary", children: "Estimated total" }),
            /* @__PURE__ */ t.jsx("span", { className: "text-2xl font-semibold text-primary", children: _e(h, e.currency) })
          ] }),
          /* @__PURE__ */ t.jsx("div", { className: "mt-4 space-y-2", children: (e.readiness ?? []).map((p) => /* @__PURE__ */ t.jsxs("p", { className: "flex items-center gap-2 text-xs text-secondary", children: [
            /* @__PURE__ */ t.jsx(Ms, { className: "h-3.5 w-3.5" }),
            p
          ] }, p)) }),
          e.warnings?.length ? /* @__PURE__ */ t.jsx("div", { className: "mt-4", children: /* @__PURE__ */ t.jsx(Me, { color: "warning", variant: "soft", title: "Before booking", description: e.warnings.join(" · ") }) }) : null,
          /* @__PURE__ */ t.jsx("div", { className: "mt-4", children: /* @__PURE__ */ t.jsx(
            ee,
            {
              color: "primary",
              variant: "solid",
              size: "sm",
              onClick: () => l("Next steps are ready for review."),
              children: "Review next steps"
            }
          ) }),
          i ? /* @__PURE__ */ t.jsx("p", { className: "mt-3 text-xs text-secondary", children: i }) : null
        ] })
      ] }) })
    }
  );
}
function aa({ data: e }) {
  const [r, o] = he("travel-comparison:category", "all"), [s, i] = he("travel-comparison:index", 0), l = Le(e), h = l ? [] : e.options ?? [], p = h.filter((g) => r === "all" || g.category === r), f = Math.min(s, Math.max(p.length - 1, 0)), c = p[f] ?? null;
  return V.useEffect(() => i(0), [r, i]), l ? /* @__PURE__ */ t.jsx(ne, { eyebrow: "Compare", title: "Travel Comparison", error: e.error, children: null }) : /* @__PURE__ */ t.jsx(
    ne,
    {
      eyebrow: "Compare",
      title: "Shortlist comparison",
      description: "Review the strongest options without losing the decision context.",
      empty: h.length === 0,
      emptyTitle: "Nothing to compare",
      children: /* @__PURE__ */ t.jsxs("article", { className: "overflow-hidden rounded-xl border border-[var(--color-border)] bg-surface shadow-sm", children: [
        /* @__PURE__ */ t.jsx("div", { className: "border-b border-[var(--color-border)] p-4", children: /* @__PURE__ */ t.jsx(yt, { value: r, options: Xe(h, "category"), onChange: o }) }),
        /* @__PURE__ */ t.jsxs("div", { className: "grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_300px]", children: [
          /* @__PURE__ */ t.jsxs("div", { children: [
            /* @__PURE__ */ t.jsxs("div", { className: "mb-3 flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ t.jsx("p", { className: "text-sm text-secondary", children: p.length ? `${f + 1} of ${p.length}` : "No matches" }),
              /* @__PURE__ */ t.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ t.jsx(
                  ee,
                  {
                    "aria-label": "Previous option",
                    color: "secondary",
                    variant: "soft",
                    size: "sm",
                    disabled: f === 0,
                    onClick: () => i((g) => Math.max(g - 1, 0)),
                    children: /* @__PURE__ */ t.jsx(Ds, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ t.jsx(
                  ee,
                  {
                    "aria-label": "Next option",
                    color: "secondary",
                    variant: "soft",
                    size: "sm",
                    disabled: f + 1 >= p.length,
                    onClick: () => i((g) => Math.min(g + 1, p.length - 1)),
                    children: /* @__PURE__ */ t.jsx(Ls, { className: "h-4 w-4" })
                  }
                )
              ] })
            ] }),
            c ? /* @__PURE__ */ t.jsxs("div", { className: "rounded-2xl border border-[var(--color-border)] bg-primary p-5", children: [
              c.image_url ? /* @__PURE__ */ t.jsx(
                "img",
                {
                  src: c.image_url,
                  alt: "",
                  className: "mb-4 aspect-[16/9] w-full rounded-xl object-cover",
                  loading: "lazy"
                }
              ) : null,
              /* @__PURE__ */ t.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
                /* @__PURE__ */ t.jsxs("div", { children: [
                  /* @__PURE__ */ t.jsx(se, { color: c.recommended ? "success" : "secondary", variant: "soft", children: c.recommended ? "Recommended" : rt[c.category] ?? ge(c.category) }),
                  /* @__PURE__ */ t.jsx("h2", { className: "mt-3 text-xl font-semibold text-primary", children: c.title }),
                  /* @__PURE__ */ t.jsx("p", { className: "mt-2 text-sm text-secondary", children: c.description || c.subtitle })
                ] }),
                c.score ? /* @__PURE__ */ t.jsx("div", { className: "text-3xl font-semibold text-primary", children: c.score }) : null
              ] }),
              /* @__PURE__ */ t.jsxs("div", { className: "mt-5 grid gap-3 sm:grid-cols-3", children: [
                /* @__PURE__ */ t.jsxs("div", { className: "rounded-xl bg-secondary p-3", children: [
                  /* @__PURE__ */ t.jsx("p", { className: "text-xs text-tertiary", children: "Price" }),
                  /* @__PURE__ */ t.jsx("p", { className: "mt-1 text-sm font-semibold text-primary", children: c.price ? _e(c.price, c.currency) : c.price_note || "Flexible" })
                ] }),
                /* @__PURE__ */ t.jsxs("div", { className: "rounded-xl bg-secondary p-3", children: [
                  /* @__PURE__ */ t.jsx("p", { className: "text-xs text-tertiary", children: "Area" }),
                  /* @__PURE__ */ t.jsx("p", { className: "mt-1 text-sm font-semibold text-primary", children: c.neighborhood || "Not set" })
                ] }),
                /* @__PURE__ */ t.jsxs("div", { className: "rounded-xl bg-secondary p-3", children: [
                  /* @__PURE__ */ t.jsx("p", { className: "text-xs text-tertiary", children: "Timing" }),
                  /* @__PURE__ */ t.jsx("p", { className: "mt-1 text-sm font-semibold text-primary", children: c.schedule_label || "Flexible" })
                ] })
              ] })
            ] }) : /* @__PURE__ */ t.jsx("div", { className: "rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-secondary", children: "Choose another category to compare options." })
          ] }),
          /* @__PURE__ */ t.jsx(vt, { option: c, action: "Choose option", secondaryAction: "Save for later" })
        ] })
      ] })
    }
  );
}
const Qs = {}, Ke = Qs?.VITE_MAPBOX_ACCESS_TOKEN ?? "";
function ia({ data: e }) {
  const [r, o] = he("travel-map:category", "all"), [s, i] = he("travel-map:selected-id", null), [l, h] = V.useState(null), [p, f] = V.useState(!1), c = V.useRef(null), g = V.useRef(null), u = V.useRef(null), d = V.useRef([]), x = Le(e), j = V.useMemo(
    () => x ? [] : (e.options ?? []).filter((R) => R.coordinates),
    [e, x]
  ), E = V.useMemo(
    () => j.filter((R) => r === "all" || R.category === r),
    [r, j]
  ), w = Wr(E, s), A = V.useMemo(
    () => E.filter((R) => R.coordinates?.lat != null && R.coordinates?.lon != null),
    [E]
  );
  return V.useEffect(() => {
    if (!c.current || u.current || !Ke) return;
    let R = !1, I = null;
    return (async () => {
      try {
        const b = await import("./mapbox-gl.js").then((L) => L.m);
        if (R || !c.current) return;
        b.default.accessToken = Ke, g.current = b;
        const S = j[0]?.coordinates, k = new b.default.Map({
          container: c.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: S?.lon != null && S?.lat != null ? [S.lon, S.lat] : [4.8952, 52.3702],
          zoom: 12,
          attributionControl: !1
        });
        k.addControl(new b.default.NavigationControl({ showCompass: !1 }), "top-right"), k.on("error", () => h("Map tiles are unavailable, showing a local map preview.")), u.current = k, f(!0), requestAnimationFrame(() => k.resize()), I = () => k.resize(), window.addEventListener("resize", I);
      } catch (b) {
        R || h(b instanceof Error ? b.message : "Map failed to initialize.");
      }
    })(), () => {
      R = !0, I && window.removeEventListener("resize", I), d.current.forEach((b) => b.remove()), d.current = [], u.current?.remove(), u.current = null, g.current = null, f(!1);
    };
  }, [j]), V.useEffect(() => {
    const R = u.current, I = g.current;
    if (!p || !R || !I) return;
    d.current.forEach((b) => b.remove()), d.current = [], A.forEach((b) => {
      if (b.coordinates?.lon == null || b.coordinates.lat == null) return;
      const S = new I.default.Marker({ color: b.id === w?.id ? "#111111" : "#F46C21" }).setLngLat([b.coordinates.lon, b.coordinates.lat]).addTo(R);
      S.getElement().style.cursor = "pointer", S.getElement().addEventListener("click", () => i(b.id)), d.current.push(S);
    });
    const M = A.map((b) => b.coordinates).filter((b) => b?.lon != null && b.lat != null).map((b) => [b.lon, b.lat]);
    if (M.length === 1)
      R.flyTo({ center: M[0], zoom: 13 });
    else if (M.length > 1) {
      const b = M.reduce(
        (S, k) => S.extend(k),
        new I.default.LngLatBounds(M[0], M[0])
      );
      R.fitBounds(b, { padding: 72, animate: !0, maxZoom: 13 });
    }
  }, [p, A, w?.id, i]), V.useEffect(() => {
    const R = u.current;
    !p || !R || !w?.coordinates?.lon || !w.coordinates.lat || R.flyTo({
      center: [w.coordinates.lon, w.coordinates.lat],
      zoom: 14,
      speed: 1.2,
      curve: 1.6
    });
  }, [p, w?.id]), x ? /* @__PURE__ */ t.jsx(ne, { eyebrow: "Map", title: "Travel Map", error: e.error, children: null }) : /* @__PURE__ */ t.jsx(
    ne,
    {
      eyebrow: "Map",
      title: "Amsterdam planning map",
      description: "Use geography to understand tradeoffs between stays, food, activities, and transit.",
      empty: j.length === 0,
      emptyTitle: "No mapped places",
      children: /* @__PURE__ */ t.jsxs("article", { className: "overflow-hidden rounded-xl border border-[var(--color-border)] bg-surface shadow-sm", children: [
        /* @__PURE__ */ t.jsx("div", { className: "border-b border-[var(--color-border)] p-4", children: /* @__PURE__ */ t.jsx(yt, { value: r, options: Xe(j, "category"), onChange: o }) }),
        /* @__PURE__ */ t.jsxs("div", { className: "grid gap-0 md:grid-cols-[minmax(0,1fr)_300px]", children: [
          /* @__PURE__ */ t.jsxs("div", { className: "relative min-h-[420px] overflow-hidden bg-[#e6f0ec]", children: [
            l || !Ke ? /* @__PURE__ */ t.jsx(Zs, { options: E, selectedId: w?.id ?? null, onSelect: i }) : null,
            /* @__PURE__ */ t.jsx(
              "div",
              {
                ref: c,
                className: `absolute inset-0 ${l || !Ke ? "opacity-0" : "opacity-100"}`,
                style: { position: "absolute", inset: 0 }
              }
            ),
            /* @__PURE__ */ t.jsx("div", { className: "absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-secondary shadow-sm", children: l ? "Local map preview" : "Live Mapbox preview" })
          ] }),
          /* @__PURE__ */ t.jsxs("div", { className: "border-t border-[var(--color-border)] p-4 md:border-l md:border-t-0", children: [
            /* @__PURE__ */ t.jsx(vt, { option: w, action: "Focus route", secondaryAction: "Add stop" }),
            /* @__PURE__ */ t.jsx("div", { className: "mt-3 grid gap-2", children: E.map((R) => /* @__PURE__ */ t.jsxs(
              "button",
              {
                type: "button",
                onClick: () => i(R.id),
                className: `rounded-lg border p-2 text-left text-xs transition ${w?.id === R.id ? "border-[var(--color-border-primary-outline)] bg-secondary" : "border-[var(--color-border)] bg-primary"}`,
                children: [
                  /* @__PURE__ */ t.jsx("span", { className: "font-semibold text-primary", children: R.title }),
                  /* @__PURE__ */ t.jsx("span", { className: "block text-secondary", children: R.neighborhood })
                ]
              },
              R.id
            )) })
          ] })
        ] })
      ] })
    }
  );
}
function Zs({
  options: e,
  selectedId: r,
  onSelect: o
}) {
  return /* @__PURE__ */ t.jsxs("div", { className: "absolute inset-0", children: [
    /* @__PURE__ */ t.jsxs("div", { className: "absolute inset-0 opacity-60", children: [
      /* @__PURE__ */ t.jsx("div", { className: "absolute left-[12%] top-[22%] h-[1px] w-[80%] rotate-[-18deg] bg-[#9fb8ac]" }),
      /* @__PURE__ */ t.jsx("div", { className: "absolute left-[8%] top-[58%] h-[1px] w-[90%] rotate-[10deg] bg-[#9fb8ac]" }),
      /* @__PURE__ */ t.jsx("div", { className: "absolute left-[42%] top-0 h-full w-[1px] rotate-[24deg] bg-[#b9c9c0]" }),
      /* @__PURE__ */ t.jsx("div", { className: "absolute left-[66%] top-0 h-full w-[1px] rotate-[-12deg] bg-[#b9c9c0]" })
    ] }),
    e.map((s) => {
      const i = r === s.id;
      return /* @__PURE__ */ t.jsx(
        "button",
        {
          type: "button",
          "aria-label": `Select ${s.title} on map`,
          onClick: () => o(s.id),
          className: `absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm transition ${i ? "border-black bg-black text-white" : "border-white bg-white text-primary hover:bg-secondary"}`,
          style: {
            left: `${s.coordinates?.x ?? 50}%`,
            top: `${s.coordinates?.y ?? 50}%`
          },
          children: rt[s.category]?.slice(0, 1) ?? "P"
        },
        s.id
      );
    })
  ] });
}
function ca({ data: e }) {
  const [r, o] = he("travel-album:active-id", null), [s, i] = he("travel-album:feedback", null);
  if (Le(e))
    return /* @__PURE__ */ t.jsx(ne, { eyebrow: "Inspire", title: "Travel Album", error: e.error, children: null });
  const l = e.media ?? [], h = l.find((p) => p.id === r) ?? l[0] ?? null;
  return /* @__PURE__ */ t.jsx(
    ne,
    {
      eyebrow: "Inspire",
      title: "Trip inspiration album",
      description: "Review destination cues and saved places before committing the plan.",
      empty: l.length === 0,
      emptyTitle: "No trip media",
      children: /* @__PURE__ */ t.jsxs("article", { className: "overflow-hidden rounded-xl border border-[var(--color-border)] bg-surface shadow-sm", children: [
        h ? /* @__PURE__ */ t.jsx(Js, { item: h, onAttach: () => i(`Attached: ${h.title}`), feedback: s }) : null,
        /* @__PURE__ */ t.jsx("div", { className: "grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4", children: l.map((p) => /* @__PURE__ */ t.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              o(p.id), i(null);
            },
            className: `rounded-xl border p-2 text-left transition ${h?.id === p.id ? "border-[var(--color-border-primary-outline)] bg-secondary" : "border-[var(--color-border)] bg-primary"}`,
            children: [
              /* @__PURE__ */ t.jsx(Vr, { item: p, compact: !0 }),
              /* @__PURE__ */ t.jsx("p", { className: "mt-2 text-sm font-semibold text-primary", children: p.title }),
              /* @__PURE__ */ t.jsx("p", { className: "text-xs text-secondary", children: p.subtitle })
            ]
          },
          p.id
        )) })
      ] })
    }
  );
}
function Js({
  item: e,
  onAttach: r,
  feedback: o
}) {
  return /* @__PURE__ */ t.jsxs("div", { className: "grid gap-5 border-b border-[var(--color-border)] p-4 md:grid-cols-[minmax(0,1fr)_360px]", children: [
    /* @__PURE__ */ t.jsx(Vr, { item: e }),
    /* @__PURE__ */ t.jsxs("div", { className: "flex min-w-0 flex-col items-start justify-between rounded-xl border border-[var(--color-border)] bg-primary p-4", children: [
      /* @__PURE__ */ t.jsxs("div", { children: [
        /* @__PURE__ */ t.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ t.jsxs(se, { color: "info", variant: "soft", children: [
            /* @__PURE__ */ t.jsx(Us, { className: "h-3.5 w-3.5" }),
            ge(e.category)
          ] }),
          /* @__PURE__ */ t.jsxs(se, { color: "secondary", variant: "soft", children: [
            /* @__PURE__ */ t.jsx(qr, { className: "h-3.5 w-3.5" }),
            e.location
          ] })
        ] }),
        /* @__PURE__ */ t.jsx("p", { className: "mt-4 text-xs font-semibold uppercase tracking-wide text-tertiary", children: "Selected inspiration" }),
        /* @__PURE__ */ t.jsx("h2", { className: "mt-1 text-xl font-semibold leading-tight text-primary", children: e.title }),
        /* @__PURE__ */ t.jsx("p", { className: "mt-3 text-sm leading-6 text-secondary", children: e.description })
      ] }),
      /* @__PURE__ */ t.jsxs("div", { className: "mt-5 w-full", children: [
        /* @__PURE__ */ t.jsxs("div", { className: "mb-3 grid gap-2 text-xs text-secondary sm:grid-cols-2", children: [
          /* @__PURE__ */ t.jsxs("div", { className: "rounded-lg bg-secondary px-3 py-2", children: [
            /* @__PURE__ */ t.jsx("span", { className: "block font-semibold text-primary", children: "Use for" }),
            /* @__PURE__ */ t.jsx("span", { children: e.subtitle })
          ] }),
          /* @__PURE__ */ t.jsxs("div", { className: "rounded-lg bg-secondary px-3 py-2", children: [
            /* @__PURE__ */ t.jsx("span", { className: "block font-semibold text-primary", children: "Context" }),
            /* @__PURE__ */ t.jsx("span", { children: e.location })
          ] })
        ] }),
        /* @__PURE__ */ t.jsx(ee, { color: "primary", variant: "solid", size: "sm", onClick: r, children: "Attach to trip" }),
        o ? /* @__PURE__ */ t.jsx("p", { className: "mt-3 text-xs text-secondary", children: o }) : null
      ] })
    ] })
  ] });
}
function Vr({ item: e, compact: r }) {
  return /* @__PURE__ */ t.jsxs("div", { className: `relative overflow-hidden rounded-xl ${r ? "aspect-[4/3]" : "min-h-64"}`, children: [
    /* @__PURE__ */ t.jsx("img", { src: e.image_url, alt: "", className: "absolute inset-0 h-full w-full object-cover", loading: "lazy" }),
    /* @__PURE__ */ t.jsx("div", { className: `absolute inset-0 bg-gradient-to-br ${e.gradient} opacity-30` }),
    /* @__PURE__ */ t.jsx("div", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-black/70 shadow-sm", children: e.location })
  ] });
}
function la({ data: e }) {
  const [r, o] = he("travel-options-list:category", "all"), [s, i] = he("travel-options-list:status", "all"), [l, h] = he("travel-options-list:selected-id", null);
  if (Le(e))
    return /* @__PURE__ */ t.jsx(ne, { eyebrow: "Organize", title: "Travel Options", error: e.error, children: null });
  const p = e.options ?? [], f = p.filter(
    (g) => (r === "all" || g.category === r) && (s === "all" || g.status === s)
  ), c = Wr(f, l);
  return /* @__PURE__ */ t.jsx(
    ne,
    {
      eyebrow: "Organize",
      title: e.trip?.title || "Travel Options",
      description: `${p.length} saved option${p.length === 1 ? "" : "s"} ready for review.`,
      empty: p.length === 0,
      emptyTitle: "No saved options",
      emptyDescription: "Hotels, flights, restaurants, and activities will appear here once saved.",
      children: /* @__PURE__ */ t.jsxs("article", { className: "overflow-hidden rounded-xl border border-[var(--color-border)] bg-surface shadow-sm", children: [
        /* @__PURE__ */ t.jsxs("div", { className: "space-y-3 border-b border-[var(--color-border)] p-4", children: [
          /* @__PURE__ */ t.jsx(yt, { value: r, options: Xe(p, "category"), onChange: o }),
          /* @__PURE__ */ t.jsxs("div", { className: "flex gap-2 overflow-x-auto pb-1", children: [
            /* @__PURE__ */ t.jsx(
              ee,
              {
                color: "secondary",
                variant: s === "all" ? "solid" : "soft",
                size: "sm",
                onClick: () => i("all"),
                children: "Any status"
              }
            ),
            Xe(p, "status").map((g) => /* @__PURE__ */ t.jsx(
              ee,
              {
                color: "secondary",
                variant: s === g ? "solid" : "soft",
                size: "sm",
                onClick: () => i(g),
                children: Hr[g] ?? ge(g)
              },
              g
            ))
          ] })
        ] }),
        /* @__PURE__ */ t.jsxs("div", { className: "grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_300px]", children: [
          /* @__PURE__ */ t.jsx("div", { className: "grid auto-rows-max content-start gap-2", children: f.length ? f.map((g) => /* @__PURE__ */ t.jsx(
            Xs,
            {
              option: g,
              selected: c?.id === g.id,
              onClick: () => h(g.id)
            },
            g.id
          )) : /* @__PURE__ */ t.jsx("div", { className: "rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-secondary", children: "No options match this filter." }) }),
          /* @__PURE__ */ t.jsx(vt, { option: c, action: "Compare", secondaryAction: "Add to itinerary" })
        ] })
      ] })
    }
  );
}
export {
  sa as T,
  aa as a,
  ia as b,
  ca as c,
  la as d,
  ea as e,
  ta as f,
  tn as g,
  ra as h,
  na as i,
  oa as j
};
