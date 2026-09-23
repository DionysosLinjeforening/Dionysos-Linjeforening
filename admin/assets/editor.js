//#region node_modules/svelte/src/internal/shared/utils.js
var e = Array.isArray, t = Array.prototype.indexOf, n = Array.prototype.includes, r = Array.from, i = Object.defineProperty, a = Object.getOwnPropertyDescriptor, o = Object.getOwnPropertyDescriptors, s = Object.prototype, c = Array.prototype, l = Object.getPrototypeOf, u = Object.isExtensible;
function d(e) {
	return typeof e == "function";
}
var f = () => {};
function p(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function m() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
function h(e, t) {
	if (Array.isArray(e)) return e;
	if (t === void 0 || !(Symbol.iterator in e)) return Array.from(e);
	let n = [];
	for (let r of e) if (n.push(r), n.length === t) break;
	return n;
}
var g = 1024, _ = 2048, v = 4096, y = 8192, b = 16384, x = 32768, S = 1 << 25, C = 65536, ee = 1 << 19, te = 1 << 20, ne = 1 << 25, re = 65536, ie = 1 << 21, ae = 1 << 22, oe = 1 << 23, se = Symbol("$state"), ce = Symbol("component"), le = Symbol("legacy props"), ue = Symbol(""), de = Symbol("attributes"), fe = Symbol("class"), pe = Symbol("style"), me = Symbol("text"), he = Symbol("form reset"), ge = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), _e = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml"), ve = {}, ye = Symbol("uninitialized"), be = "http://www.w3.org/1999/xhtml", xe = "http://www.w3.org/2000/svg", Se = "http://www.w3.org/1998/Math/MathML";
function Ce() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function we(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Te() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var Ee = !1;
function De(e) {
	Ee = e;
}
var Oe;
function ke(e) {
	if (e === null) throw we(), ve;
	return Oe = e;
}
function Ae() {
	return ke(/* @__PURE__ */ dn(Oe));
}
function w(e) {
	if (Ee) {
		if (/* @__PURE__ */ dn(Oe) !== null) throw we(), ve;
		Oe = e;
	}
}
function je(e = 1) {
	if (Ee) {
		for (var t = e, n = Oe; t--;) n = /* @__PURE__ */ dn(n);
		Oe = n;
	}
}
function Me(e = !0) {
	for (var t = 0, n = Oe;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ dn(n);
		e && n.remove(), n = i;
	}
}
function Ne(e) {
	if (!e || e.nodeType !== 8) throw we(), ve;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Pe(e) {
	return e === this.v;
}
function Fe(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Ie(e) {
	return !Fe(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function Le() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function T(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function Re(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function E() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function D(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function ze() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Be(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function Ve() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function He() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ue() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function We() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/internal/shared/clone.js
var Ge = [];
function Ke(e, t = !1, n = !1) {
	return qe(e, /* @__PURE__ */ new Map(), "", Ge, null, n);
}
function qe(t, n, r, i, a = null, o = !1) {
	if (typeof t == "object" && t) {
		var c = n.get(t);
		if (c !== void 0) return c;
		if (t instanceof Map) return new Map(t);
		if (t instanceof Set) return new Set(t);
		if (e(t)) {
			var u = Array(t.length);
			n.set(t, u), a !== null && n.set(a, u);
			for (var d = 0; d < t.length; d += 1) {
				var f = t[d];
				d in t && (u[d] = qe(f, n, r, i, null, o));
			}
			return u;
		}
		if (l(t) === s) {
			u = {}, n.set(t, u), a !== null && n.set(a, u);
			for (var p of Object.keys(t)) u[p] = qe(t[p], n, r, i, null, o);
			return u;
		}
		if (t instanceof Date) return t.getTime(), structuredClone(t);
		if (typeof t.toJSON == "function" && !o) return qe(t.toJSON(), n, r, i, t);
	}
	if (t instanceof EventTarget) return t;
	try {
		return structuredClone(t);
	} catch {
		return t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var Je = null;
function Ye(e) {
	Je = e;
}
function Xe(e, t = !1, n) {
	Je = {
		p: Je,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: Yn,
		l: null
	};
}
function Ze(e) {
	var t = Je, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) wn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Je = t.p, Qe(e);
}
function Qe(e = {}) {
	return i(e, ce, { value: !0 }), e;
}
function $e() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var et = [];
function tt() {
	var e = et;
	et = [], p(e);
}
function nt(e) {
	if (et.length === 0 && !Pt) {
		var t = et;
		queueMicrotask(() => {
			t === et && tt();
		});
	}
	et.push(e);
}
function rt() {
	for (; et.length > 0;) tt();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var it = ~(_ | v | g);
function at(e, t) {
	e.f = e.f & it | t;
}
function ot(e) {
	e.f & 512 || e.deps === null ? at(e, g) : at(e, v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function st(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= re, st(t.deps));
}
function ct(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), st(e.deps), at(e, g);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var lt = !1;
function ut(e) {
	var t = lt;
	try {
		return lt = !1, [e(), lt];
	} finally {
		lt = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function dt(e, t) {
	if (t) {
		let t = document.body;
		e.autofocus = !0, nt(() => {
			document.activeElement === t && e.focus();
		});
	}
}
function ft(e) {
	Ee && /* @__PURE__ */ un(e) !== null && fn(e);
}
var pt = !1;
function mt() {
	pt || (pt = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[he]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function ht(e) {
	var t = Kn, n = Yn;
	Jn(null), Xn(null);
	try {
		return e();
	} finally {
		Jn(t), Xn(n);
	}
}
function gt(e, t, n, r = n) {
	e.addEventListener(t, () => ht(n));
	let i = e[he];
	e[he] = i ? () => {
		i(), r(!0);
	} : () => r(!0), mt();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function _t(e, t, n, r) {
	let i = $e() ? xt : wt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = Yn, c = vt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				_n(e, s);
			}
			yt();
		}
	}
	var d = bt();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ Ct(e))).then(u).catch((e) => _n(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), yt();
	}) : f();
}
function vt() {
	var e = Yn, t = Kn, n = Je, r = jt;
	return function(i = !0) {
		Xn(e), Jn(t), Ye(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function yt(e = !0) {
	Xn(null), Jn(null), Ye(null), e && jt?.deactivate();
}
function bt() {
	var e = Yn, t = e.b, n = jt, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function xt(e) {
	var t = 2 | _;
	return Yn !== null && (Yn.f |= ee), {
		ctx: Je,
		deps: null,
		effects: null,
		equals: Pe,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: ye,
		wv: 0,
		parent: Yn,
		ac: null
	};
}
var St = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function Ct(e, t, n) {
	let r = Yn;
	r === null && Le();
	var i = void 0, a = Xt(ye), o = !Kn, s = /* @__PURE__ */ new Set();
	return Dn(() => {
		var t = Yn, n = m();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ge && n.reject(e);
			}).finally(yt);
		} catch (e) {
			n.reject(e), yt();
		}
		var c = jt;
		if (o) {
			if (t.f & 32768) var l = bt();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(St);
			else for (let e of s.values()) e.reject(St);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== St && (c.activate(), t ? (a.f |= oe, Qt(a, t)) : (a.f & 8388608 && (a.f ^= oe), Qt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), Sn(() => {
		for (let e of s) e.reject(St);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === i ? e(a) : t(i);
			}
			n.then(r, r);
		}
		t(i);
	});
}
/*#__NO_SIDE_EFFECTS__*/
function O(e) {
	let t = /* @__PURE__ */ xt(e);
	return Qn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function wt(e) {
	let t = /* @__PURE__ */ xt(e);
	return t.equals = Ie, t;
}
function Tt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) Pn(t[n]);
	}
}
function Et(e) {
	var t, n = Yn, r = e.parent;
	if (!Wn && r !== null && e.v !== ye && r.f & 24576) return Ce(), e.v;
	Xn(r);
	try {
		e.f &= ~re, Tt(e), t = ur(e);
	} finally {
		Xn(n);
	}
	return t;
}
function Dt(e) {
	var t = Et(e);
	if (!e.equals(t) && (e.wv = sr(), (!jt?.is_fork || e.deps === null) && (jt === null ? e.v = t : (jt.capture(e, t, !0), Mt?.capture(e, t, !0)), e.deps === null))) {
		at(e, g);
		return;
	}
	Wn || (k === null ? ot(e) : (xn() || jt?.is_fork) && k.set(e, t));
}
function Ot(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ht(() => {
		t.ac.abort(ge), t.ac = null;
	}), t.fn !== null && (t.teardown = f), pr(t, 0), Mn(t));
}
function kt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && mr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var At = null, jt = null, Mt = null, k = null, Nt = null, Pt = !1, Ft = !1, It = null, Lt = null, Rt = 0, zt = 1, Bt = class e {
	id = zt++;
	#e = !1;
	linked = !0;
	#t = null;
	#n = null;
	async_deriveds = /* @__PURE__ */ new Map();
	current = /* @__PURE__ */ new Map();
	previous = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = /* @__PURE__ */ new Set();
	#a = 0;
	#o = /* @__PURE__ */ new Map();
	#s = null;
	#c = [];
	#l = [];
	#u = /* @__PURE__ */ new Set();
	#d = /* @__PURE__ */ new Set();
	#f = /* @__PURE__ */ new Map();
	#p = /* @__PURE__ */ new Set();
	is_fork = !1;
	#m = !1;
	constructor() {
		At === null ? At = this : (At.#n = this, this.#t = At), At = this;
	}
	#h() {
		if (this.is_fork) return !0;
		for (let n of this.#o.keys()) {
			for (var e = n, t = !1; e.parent !== null;) {
				if (this.#f.has(e)) {
					t = !0;
					break;
				}
				e = e.parent;
			}
			if (!t) return !0;
		}
		return !1;
	}
	skip_effect(e) {
		this.#f.has(e) || this.#f.set(e, {
			d: [],
			m: []
		}), this.#p.delete(e);
	}
	unskip_effect(e, t = (e) => this.schedule(e)) {
		var n = this.#f.get(e);
		if (n) {
			this.#f.delete(e);
			for (var r of n.d) at(r, _), t(r);
			for (r of n.m) at(r, v), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Rt++ > 1e3 && (this.#x(), A());
		for (let e of this.#u) this.#d.delete(e), at(e, _), this.schedule(e);
		for (let e of this.#d) at(e, v), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = It = [], r = [], i = Lt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Kt(e), this.#h() || this.discard(), t;
		}
		if (jt = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (It = null, Lt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Gt(e, t);
			i.length > 0 && jt.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), Mt = this, Ut(r), Ut(n), Mt = null, this.#s?.resolve();
		var s = jt;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
			if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
		}
		s !== null && (Jt.clear(), s.#g());
	}
	#_(e, t, n) {
		e.f ^= g;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= g : i & 4 ? t.push(r) : cr(r) && (i & 16 && this.#d.add(r), mr(r));
				var o = r.first;
				if (o !== null) {
					r = o;
					continue;
				}
			}
			for (; r !== null;) {
				var s = r.next;
				if (s !== null) {
					r = s;
					break;
				}
				r = r.parent;
			}
		}
	}
	#v() {
		for (var e = this.#t; e !== null;) {
			if (!e.is_fork) {
				for (let [t, [, n]] of this.current) if (e.current.has(t) && !n) return e;
			}
			e = e.#t;
		}
		return null;
	}
	#y(e) {
		for (let [t, n] of e.current) !this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)), this.current.set(t, n);
		for (let [t, n] of e.async_deriveds) {
			let e = this.async_deriveds.get(t);
			e && n.promise.then(e.resolve).catch(e.reject);
		}
		e.async_deriveds.clear(), this.transfer_effects(e.#u, e.#d);
		let t = (e) => {
			var n = e.reactions;
			if (n !== null && !(e.f & 2 && !(e.f & 6144))) for (let e of n) {
				var r = e.f;
				if (r & 2) t(e);
				else {
					var i = e;
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), at(i, _), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), jt = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) ct(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== ye && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), k?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		jt = this;
	}
	deactivate() {
		jt = null, k = null;
	}
	flush() {
		try {
			Ft = !0, jt = this, this.#g();
		} finally {
			Rt = 0, Nt = null, It = null, Lt = null, Ft = !1, jt = null, k = null, Jt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(St);
		this.#x(), this.#s?.resolve();
	}
	register_created_effect(e) {
		this.#l.push(e);
	}
	increment(e, t) {
		if (this.#a += 1, e) {
			let e = this.#o.get(t) ?? 0;
			this.#o.set(t, e + 1);
		}
	}
	decrement(e, t) {
		if (--this.#a, e) {
			let e = this.#o.get(t) ?? 0;
			e === 1 ? this.#o.delete(t) : this.#o.set(t, e - 1);
		}
		this.#m || (this.#m = !0, nt(() => {
			this.#m = !1, this.linked && this.flush();
		}));
	}
	transfer_effects(e, t) {
		for (let t of e) this.#u.add(t);
		for (let e of t) this.#d.add(e);
		e.clear(), t.clear();
	}
	oncommit(e) {
		this.#r.add(e);
	}
	ondiscard(e) {
		this.#i.add(e);
	}
	settled() {
		return (this.#s ??= m()).promise;
	}
	static ensure() {
		if (jt === null) {
			let t = jt = new e();
			!Ft && !Pt && nt(() => {
				t.#e || t.flush();
			});
		}
		return jt;
	}
	apply() {
		k = null;
	}
	schedule(e) {
		if (Nt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (It !== null && t === Yn && (Kn === null || !(Kn.f & 2))) return;
			if (n & 96) {
				if (!(n & 1024)) return;
				t.f ^= g;
			}
		}
		this.#c.push(t);
	}
	#x() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? At = e : t.#t = e, this.linked = !1;
		}
	}
};
function Vt(e) {
	var t = Pt;
	Pt = !0;
	try {
		var n;
		for (e && (jt !== null && !jt.is_fork && jt.flush(), n = e());;) {
			if (rt(), jt === null) return n;
			jt.flush();
		}
	} finally {
		Pt = t;
	}
}
function A() {
	try {
		ze();
	} catch (e) {
		_n(e, Nt);
	}
}
var Ht = null;
function Ut(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && cr(r) && (Ht = /* @__PURE__ */ new Set(), mr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && In(r), Ht?.size > 0)) {
				Jt.clear();
				for (let e of Ht) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Ht.has(n) && (Ht.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || mr(n);
					}
				}
				Ht.clear();
			}
		}
		Ht = null;
	}
}
function Wt(e) {
	jt.schedule(e);
}
function Gt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), at(e, g);
		for (var n = e.first; n !== null;) Gt(n, t), n = n.next;
	}
}
function Kt(e) {
	at(e, g);
	for (var t = e.first; t !== null;) Kt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var qt = /* @__PURE__ */ new Set(), Jt = /* @__PURE__ */ new Map(), Yt = !1;
function Xt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Pe,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function j(e, t) {
	let n = Xt(e, t);
	return Qn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Zt(e, t = !1, n = !0) {
	let r = Xt(e);
	return t || (r.equals = Ie), r;
}
function M(e, t, n = !1) {
	return Kn !== null && (!qn || Kn.f & 131072) && $e() && Kn.f & 4325394 && (Zn === null || !Zn.has(e)) && Ue(), Qt(e, n ? nn(t) : t, Lt);
}
function Qt(e, t, n = null) {
	if (!e.equals(t)) {
		Wn ? Jt.set(e, t) : Jt.has(e) || Jt.set(e, e.v);
		var r = Bt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && Et(t), k === null && ot(t);
		}
		e.wv = sr(), tn(e, _, n), $e() && Yn !== null && Yn.f & 1024 && !(Yn.f & 96) && (tr === null ? nr([e]) : tr.push(e)), !r.is_fork && qt.size > 0 && !Yt && $t();
	}
	return t;
}
function $t() {
	Yt = !1;
	for (let e of qt) {
		e.f & 1024 && at(e, v);
		let t;
		try {
			t = cr(e);
		} catch {
			t = !0;
		}
		t && mr(e);
	}
	qt.clear();
}
function en(e) {
	M(e, e.v + 1);
}
function tn(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = $e(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === Yn)) {
			var l = (c & _) === 0;
			if (l && at(s, t), c & 131072) qt.add(s);
			else if (c & 2) {
				var u = s;
				k?.delete(u), c & 65536 || (c & 512 && (Yn === null || !(Yn.f & 2097152)) && (s.f |= re), tn(u, v, n));
			} else if (l) {
				var d = s;
				c & 16 && Ht !== null && Ht.add(d), n === null ? Wt(d) : n.push(d);
			}
		}
	}
}
function nn(t) {
	if (typeof t != "object" || !t || se in t || ce in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ j(0), u = null, d = ar, f = (e) => {
		if (ar === d) return e();
		var t = Kn, n = ar;
		Jn(null), or(d);
		var r = e();
		return Jn(t), or(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ j(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && Ve();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ j(n.value, u);
				return r.set(t, e), e;
			}) : M(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ j(ye, u));
					r.set(t, e), en(o);
				}
			} else M(n, ye), en(o);
			return !0;
		},
		get(e, n, i) {
			if (n === se) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ j(nn(s ? e[n] : ye), u)), r.set(n, o)), o !== void 0) {
				var c = R(o);
				return c === ye ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = R(i));
			} else if (n === void 0) {
				var a = r.get(t), o = a?.v;
				if (a !== void 0 && o !== ye) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return n;
		},
		has(e, t) {
			if (t === se) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== ye || Reflect.has(e, t);
			return (n !== void 0 || Yn !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ j(i ? nn(e[t]) : ye, u)), r.set(t, n)), R(n) === ye) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ j(ye, u)), r.set(d + "", p)) : M(p, ye);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ j(void 0, u)), M(c, nn(n)), r.set(t, c));
			else {
				l = c.v !== ye;
				var m = f(() => nn(n));
				M(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && M(g, _ + 1);
				}
				en(o);
			}
			return !0;
		},
		ownKeys(e) {
			R(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== ye;
			});
			for (var [n, i] of r) i.v !== ye && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			He();
		}
	});
}
var rn, an, on, sn;
function cn() {
	if (rn === void 0) {
		rn = window, an = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		on = a(t, "firstChild").get, sn = a(t, "nextSibling").get, u(e) && (e[fe] = void 0, e[de] = null, e[pe] = void 0, e.__e = void 0), u(n) && (n[me] = void 0);
	}
}
function ln(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function un(e) {
	return on.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function dn(e) {
	return sn.call(e);
}
function N(e, t) {
	if (!Ee) return /* @__PURE__ */ un(e);
	var n = /* @__PURE__ */ un(Oe);
	if (n === null) n = Oe.appendChild(ln());
	else if (t && n.nodeType !== 3) {
		var r = ln();
		return n?.before(r), ke(r), r;
	}
	return t && hn(n), ke(n), n;
}
function P(e, t = !1) {
	if (!Ee) {
		var n = /* @__PURE__ */ un(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ dn(n) : n;
	}
	if (t) {
		if (Oe?.nodeType !== 3) {
			var r = ln();
			return Oe?.before(r), ke(r), r;
		}
		hn(Oe);
	}
	return Oe;
}
function F(e, t = !1) {
	if (!Ee) return /* @__PURE__ */ un(e);
	var n = N(e, t);
	return w(e), n;
}
function I(e, t = 1, n = !1) {
	let r = Ee ? Oe : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ dn(r);
	if (!Ee) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = ln();
			return r === null ? i?.after(a) : r.before(a), ke(a), a;
		}
		hn(r);
	}
	return ke(r), r;
}
function fn(e) {
	e.textContent = "";
}
function pn() {
	return !1;
}
function mn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function hn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
function gn(e) {
	var t = Yn;
	if (t === null) return Kn.f |= oe, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	_n(e, t);
}
function _n(e, t) {
	if (!(t !== null && t.f & 16384)) {
		for (; t !== null;) {
			if (t.f & 128 && !(t.f & 33570816)) {
				if (!(t.f & 32768)) throw e;
				try {
					t.b.error(e);
					return;
				} catch (t) {
					e = t;
				}
			}
			t = t.parent;
		}
		throw e;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function vn(e) {
	Yn === null && (Kn === null && D(e), E()), Wn && Re(e);
}
function yn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function bn(e, t) {
	var n = Yn;
	n !== null && n.f & 8192 && (e |= y);
	var r = {
		ctx: Je,
		deps: null,
		nodes: null,
		f: e | _ | 512,
		first: null,
		fn: t,
		last: null,
		next: null,
		parent: n,
		b: n && n.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	jt?.register_created_effect(r);
	var i = r;
	if (e & 4) It === null ? Bt.ensure().schedule(r) : It.push(r);
	else if (t !== null) {
		try {
			mr(r);
		} catch (e) {
			throw Pn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= C));
	}
	if (i !== null && (i.parent = n, n !== null && yn(i, n), Kn !== null && Kn.f & 2 && !(e & 64))) {
		var a = Kn;
		(a.effects ??= []).push(i);
	}
	return r;
}
function xn() {
	return Kn !== null && !qn;
}
function Sn(e) {
	let t = bn(8, null);
	return at(t, g), t.teardown = e, t;
}
function Cn(e) {
	vn("$effect");
	var t = Yn.f;
	if (!Kn && t & 32 && Je !== null && !Je.i) {
		var n = Je;
		(n.e ??= []).push(e);
	} else return wn(e);
}
function wn(e) {
	return bn(4 | te, e);
}
function Tn(e) {
	Bt.ensure();
	let t = bn(64 | ee, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Ln(t, () => {
			Pn(t), n(void 0);
		}) : (Pn(t), n(void 0));
	});
}
function En(e) {
	return bn(4, e);
}
function Dn(e) {
	return bn(ae | ee, e);
}
function On(e, t = 0) {
	return bn(8 | t, e);
}
function L(e, t = [], n = [], r = []) {
	_t(r, t, n, (t) => {
		bn(8, () => {
			e(...t.map(R));
		});
	});
}
function kn(e, t = 0) {
	return bn(16 | t, e);
}
function An(e) {
	return bn(32 | ee, e);
}
function jn(e) {
	var t = e.teardown;
	if (t !== null) {
		let n = Wn, r = Kn;
		Gn(!0), Jn(null);
		try {
			t.call(null);
		} catch (t) {
			_n(t, e.parent);
		} finally {
			Gn(n), Jn(r);
		}
	}
}
function Mn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && ht(() => {
			e.abort(ge);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : Pn(n, t), n = r;
	}
}
function Nn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || Pn(t), t = n;
	}
}
function Pn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Fn(e.nodes.start, e.nodes.end), n = !0), e.f |= S, Mn(e, t && !n), pr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	jn(e), e.f ^= S, e.f |= b;
	var i = e.parent;
	i !== null && i.first !== null && In(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Fn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ dn(e);
		e.remove(), e = n;
	}
}
function In(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Ln(e, t, n = !0) {
	var r = [];
	e.f |= 256, Rn(e, r, !0);
	var i = () => {
		n && Pn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Rn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= y;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Rn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function zn(e) {
	e.f &= -257, Bn(e, !0);
}
function Bn(e, t) {
	if (!(e.f & 256) && e.f & 8192) {
		e.f ^= y, e.f & 1024 || (at(e, _), Bt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Bn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Vn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ dn(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Hn = null, Un = !1, Wn = !1;
function Gn(e) {
	Wn = e;
}
var Kn = null, qn = !1;
function Jn(e) {
	Kn = e;
}
var Yn = null;
function Xn(e) {
	Yn = e;
}
var Zn = null;
function Qn(e) {
	Kn !== null && (Zn ??= /* @__PURE__ */ new Set()).add(e);
}
var $n = null, er = 0, tr = null;
function nr(e) {
	tr = e;
}
var rr = 1, ir = 0, ar = ir;
function or(e) {
	ar = e;
}
function sr() {
	return ++rr;
}
function cr(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~re), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (cr(a) && Dt(a), a.wv > e.wv) return !0;
		}
		t & 512 && k === null && at(e, g);
	}
	return !1;
}
function lr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Zn !== null && Zn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? lr(a, t, !1) : t === a && (n ? at(a, _) : a.f & 1024 && at(a, v), Wt(a));
	}
}
function ur(e) {
	var t = $n, n = er, r = tr, i = Kn, a = Zn, o = Je, s = qn, c = ar, l = e.f;
	$n = null, er = 0, tr = null, Kn = l & 96 ? null : e, Zn = null, Ye(e.ctx), qn = !1, ar = ++ir, e.ac !== null && (ht(() => {
		e.ac.abort(ge);
	}), e.ac = null);
	try {
		e.f |= ie;
		var u = e.fn, d = u();
		e.f |= x;
		var f = dr(e);
		if ($e() && tr !== null && !qn && f !== null && !(e.f & 6146)) for (var p = 0; p < tr.length; p++) lr(tr[p], e);
		if (i !== null && i !== e) {
			if (ir++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = ir;
			if (t !== null) for (let e of t) e.rv = ir;
			tr !== null && (r === null ? r = tr : r.push(...tr));
		}
		return e.f & 8388608 && (e.f ^= oe), d;
	} catch (t) {
		return dr(e), gn(t);
	} finally {
		e.f ^= ie, $n = t, er = n, tr = r, Kn = i, Zn = a, Ye(o), qn = s, ar = c;
	}
}
function dr(e) {
	var t = e.deps, n = jt?.is_fork;
	if ($n !== null) {
		var r;
		if (n || pr(e, er), t !== null && er > 0) for (t.length = er + $n.length, r = 0; r < $n.length; r++) t[er + r] = $n[r];
		else e.deps = t = $n;
		if (xn() && e.f & 512) for (r = er; r < t.length; r++) (t[r].reactions ??= []).push(e);
	} else !n && t !== null && er < t.length && (pr(e, er), t.length = er);
	return t;
}
function fr(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && ($n === null || !n.call($n, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~re), s.v !== ye && ot(s), s.ac !== null && ht(() => {
			s.ac.abort(ge), s.ac = null, at(s, _);
		}), Ot(s), pr(s, 0);
	}
}
function pr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) fr(e, n[r]);
}
function mr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		at(e, g);
		var n = Yn, r = Un;
		Yn = e, Un = !(t & 96);
		try {
			t & 16777232 ? Nn(e) : Mn(e), jn(e);
			var i = ur(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = rr;
		} finally {
			Un = r, Yn = n;
		}
	}
}
async function hr() {
	await Promise.resolve(), Vt();
}
function R(e) {
	var t = !!(e.f & 2);
	if (Hn?.add(e), Kn !== null && !qn && !(Yn !== null && Yn.f & 16384) && (Zn === null || !Zn.has(e))) {
		var r = Kn.deps;
		if (Kn.f & 2097152) e.rv < ir && (e.rv = ir, $n === null && r !== null && r[er] === e ? er++ : $n === null ? $n = [e] : $n.push(e));
		else {
			Kn.deps ??= [], n.call(Kn.deps, e) || Kn.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [Kn] : n.call(i, Kn) || i.push(Kn);
		}
	}
	if (Wn && Jt.has(e)) return Jt.get(e);
	if (t) {
		var a = e;
		if (Wn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || _r(a)) && (o = Et(a)), Jt.set(a, o), o;
		}
		var s = !(a.f & 512) && !qn && Kn !== null && (Un || !!(Kn.f & 512)), c = (a.f & x) === 0;
		cr(a) && (s && (a.f |= 512), Dt(a)), s && !c && (kt(a), gr(a));
	}
	if (k?.has(e)) return k.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function gr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (kt(t), gr(t));
}
function _r(e) {
	if (e.v === ye) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Jt.has(t) || t.f & 2 && _r(t)) return !0;
	return !1;
}
function vr(e) {
	var t = qn;
	try {
		return qn = !0, e();
	} finally {
		qn = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var yr = ["touchstart", "touchmove"];
function br(e) {
	return yr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var xr = Symbol("events"), Sr = /* @__PURE__ */ new Set(), Cr = /* @__PURE__ */ new Set();
function wr(e) {
	if (!Ee) return;
	e.removeAttribute("onload"), e.removeAttribute("onerror");
	let t = e.__e;
	t !== void 0 && (e.__e = void 0, queueMicrotask(() => {
		e.isConnected && e.dispatchEvent(t);
	}));
}
function Tr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Ar.call(t, e), !e.cancelBubble) return ht(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? nt(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function Er(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = Tr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && Sn(() => {
		t.removeEventListener(e, o, a);
	});
}
function z(e, t, n) {
	(t[xr] ??= {})[e] = n;
}
function Dr(e) {
	for (var t = 0; t < e.length; t++) Sr.add(e[t]);
	for (var n of Cr) n(e);
}
var Or = null, kr = !1;
function Ar(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	Or = e, kr || (kr = !0, setTimeout(() => {
		kr = !1, Or = null;
	}));
	var s = 0, c = Or === e && e[xr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[xr] = t;
			return;
		}
		var u = a.indexOf(t);
		if (u === -1) return;
		l <= u && (s = l);
	}
	if (o = a[s] || e.target, o !== t) {
		i(e, "currentTarget", {
			configurable: !0,
			get() {
				return o || n;
			}
		});
		var d = Kn, f = Yn;
		Jn(null), Xn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[xr]?.[r];
					h != null && (!o.disabled || e.target === o) && h.call(o, e);
				} catch (e) {
					p ? m.push(e) : p = e;
				}
				if (e.cancelBubble) break;
				s++, o = s < a.length ? a[s] : null;
			}
			if (p) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw p;
			}
		} finally {
			e[xr] = t, delete e.currentTarget, Jn(d), Xn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var jr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Mr(e) {
	return jr?.createHTML(e) ?? e;
}
function Nr(e) {
	var t = mn("template");
	return t.innerHTML = Mr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Pr(e, t) {
	var n = Yn;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function B(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (Ee) return Pr(Oe, null), Oe;
		i === void 0 && (i = Nr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ un(i)));
		var t = r || an ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ un(t), s = t.lastChild;
			Pr(o, s);
		} else Pr(t, t);
		return t;
	};
}
function Fr(e = "") {
	if (!Ee) {
		var t = ln(e + "");
		return Pr(t, t), t;
	}
	var n = Oe;
	return n.nodeType === 3 ? hn(n) : (n.before(n = ln()), ke(n)), Pr(n, n), n;
}
function Ir() {
	if (Ee) return Pr(Oe, null), Oe;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = ln();
	return e.append(t, n), Pr(t, n), e;
}
function V(e, t) {
	if (Ee) {
		var n = Yn;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = Oe), Ae();
		return;
	}
	e !== null && e.before(t);
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function Lr(e) {
	let t = 0, n = Xt(0), r;
	return () => {
		xn() && (R(n), On(() => (t === 0 && (r = vr(() => e(() => en(n)))), t += 1, () => {
			nt(() => {
				--t, t === 0 && (r?.(), r = void 0, en(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var Rr = C | ee;
function zr(e, t, n, r) {
	new Br(e, t, n, r);
}
var Br = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = Ee ? Oe : null;
	#n;
	#r;
	#i;
	#a = null;
	#o = null;
	#s = null;
	#c = null;
	#l = 0;
	#u = 0;
	#d = !1;
	#f = /* @__PURE__ */ new Set();
	#p = /* @__PURE__ */ new Set();
	#m = null;
	#h = Lr(() => (this.#m = Xt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = Yn;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = Yn.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = kn(() => {
			if (Ee) {
				let e = this.#t;
				Ae();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, Rr), Ee && (this.#e = Oe);
	}
	#g() {
		try {
			this.#a = An(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		nt(r), t && (this.#s = An(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				Te();
				return;
			}
			t = !0, n && We(), this.#s !== null && Ln(this.#s, () => {
				this.#s = null;
			}), this.#S(() => {
				this.#b();
			});
		};
		return {
			reset: r,
			invoke_onerror: () => {
				try {
					n = !0, this.#n.onerror?.(e, r), n = !1;
				} catch (e) {
					_n(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = An(() => e(this.#e)), nt(() => {
			var e = this.#c = document.createDocumentFragment(), t = ln(), n = !1;
			if (e.append(t), this.#a = this.#S(() => {
				try {
					return An(() => this.#r(t));
				} catch (e) {
					try {
						this.error(e), n = !0;
					} catch (e) {
						_n(e, this.#i.parent);
					}
					return null;
				}
			}), this.#a === null) {
				this.#c = null, n && this.#x(jt);
				return;
			}
			this.#u === 0 && (this.#e.before(e), this.#c = null, Ln(this.#o, () => {
				this.#o = null;
			}), this.#x(jt));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = An(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Vn(this.#a, e);
				let t = this.#n.pending;
				this.#o = An(() => t(this.#e));
			} else this.#x(jt);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		ct(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = Yn, n = Kn, r = Je;
		Xn(this.#i), Jn(this.#i), Ye(this.#i.ctx);
		try {
			return Bt.ensure(), e();
		} finally {
			Xn(t), Jn(n), Ye(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Ln(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, nt(() => {
			this.#d = !1, this.#m && Qt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), R(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		jt?.is_fork ? (this.#a && jt.skip_effect(this.#a), this.#o && jt.skip_effect(this.#o), this.#s && jt.skip_effect(this.#s), jt.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (Pn(this.#a), null), this.#o &&= (Pn(this.#o), null), this.#s &&= (Pn(this.#s), null), Ee && (ke(this.#t), je(), ke(Me()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return An(() => {
						var r = Yn;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return _n(e, this.#i.parent), null;
				}
			}));
		};
		nt(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				_n(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => _n(e, this.#i && this.#i.parent)) : n(t);
		});
	}
}, Vr = !0;
function H(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[me] ??= e.nodeValue) && (e[me] = n, e.nodeValue = `${n}`);
}
function Hr(e, t) {
	return Wr(e, t);
}
var Ur = /* @__PURE__ */ new Map();
function Wr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	cn();
	var l = void 0, u = Tn(() => {
		var u = n ?? t.appendChild(ln());
		zr(u, { pending: () => {} }, (t) => {
			Xe({});
			var n = Je;
			if (o && (n.c = o), a && (i.$$events = a), Ee && Pr(t, null), Vr = s, l = e(t, i) || Qe(), Vr = !0, Ee && (Yn.nodes.end = Oe, Oe === null || Oe.nodeType !== 8 || Oe.data !== "]")) throw we(), ve;
			Ze();
		}, c);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!d.has(r)) {
					d.add(r);
					var i = br(r);
					for (let e of [t, document]) {
						var a = Ur.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Ur.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Ar, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(r(Sr)), Cr.add(f), () => {
			for (var e of d) for (let n of [t, document]) {
				var r = Ur.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Ar), r.delete(e), r.size === 0 && Ur.delete(n)) : r.set(e, i);
			}
			Cr.delete(f), u !== n && u.parentNode?.removeChild(u);
		};
	});
	return Gr.set(l, u), l;
}
var Gr = /* @__PURE__ */ new WeakMap(), Kr = class {
	anchor;
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ new Map();
	#n = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = !0;
	constructor(e, t = !0) {
		this.anchor = e, this.#i = t;
	}
	#a = (e) => {
		if (this.#e.has(e)) {
			var t = this.#e.get(e), n = this.#t.get(t);
			if (n) zn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (zn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (Pn(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Vn(r, t), t.append(ln()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else Pn(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Ln(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (Pn(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = jt, r = pn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = ln();
				i.append(a), this.#n.set(e, {
					effect: An(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, An(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else Ee && (this.anchor = Oe), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function U(e, t, n = !1) {
	var r;
	Ee && (r = Oe, Ae());
	var i = new Kr(e), a = n ? C : 0;
	function o(e, t) {
		if (Ee) {
			var n = Ne(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Me();
				ke(a), i.anchor = a, De(!1), i.ensure(e, t), De(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	kn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function qr(e, t) {
	return t;
}
function Jr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Ln(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Yr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			fn(d), d.append(u), e.items.clear();
		}
		Yr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Yr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= ne, Vn(a, document.createDocumentFragment())) : Pn(t[i], n);
	}
}
var Xr;
function Zr(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = Ee ? ke(/* @__PURE__ */ un(u)) : u.appendChild(ln());
	}
	Ee && Ae();
	var d = null, f = /* @__PURE__ */ wt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, $r(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= ne, ti(d, null, c)) : zn(d) : Ln(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: kn(() => {
			p = R(f);
			var e = p.length;
			let t = !1;
			Ee && Ne(c) === "[!" != (e === 0) && (c = Me(), ke(c), De(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = jt, v = pn(), y = 0; y < e; y += 1) {
				Ee && Oe.nodeType === 8 && Oe.data === "]" && (c = Oe, t = !0, De(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Qt(S.v, b), S.i && Qt(S.i, y), v && u.unskip_effect(S.e)) : (S = ei(l, h ? c : Xr ??= ln(), b, x, y, o, n, i), h || (S.e.f |= ne), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = An(() => s(c)) : (d = An(() => s(Xr ??= ln())), d.f |= ne)), e > r.size && T("", "", ""), Ee && e > 0 && ke(Me()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && De(!0), R(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, Ee && (c = Oe);
}
function Qr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function $r(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Qr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (zn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= ne, _ === l) ti(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), ni(e, d, _), ni(e, _, y), ti(_, y, n), d = _, p = [], m = [], l = Qr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) ti(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					ni(e, S.prev, C.next), ni(e, d, S), ni(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), ti(_, l, n), ni(e, _.prev, _.next), ni(e, _, d === null ? e.effect.first : d.next), ni(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Qr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Qr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Yr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var ee = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || ee.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && ee.push(l), l = Qr(l.next);
		var te = ee.length;
		if (te > 0) {
			var re = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < te; v += 1) ee[v].nodes?.a?.measure();
				for (v = 0; v < te; v += 1) ee[v].nodes?.a?.fix();
			}
			Jr(e, ee, re);
		}
	}
	o && nt(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function ei(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Xt(n) : /* @__PURE__ */ Zt(n, !1, !1) : null, l = o & 2 ? Xt(i) : null;
	return {
		v: c,
		i: l,
		e: An(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function ti(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ dn(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function ni(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function W(e, t, n = !1, r = !1, i = !1, a = !1) {
	var o = e, s = "";
	if (n) {
		var c = e;
		Ee && (o = ke(/* @__PURE__ */ un(c)));
	}
	L(() => {
		var e = Yn;
		if (s === (s = t() ?? "")) {
			Ee && Ae();
			return;
		}
		if (n && !Ee) {
			e.nodes = null, c.innerHTML = s, s !== "" && Pr(/* @__PURE__ */ un(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (Fn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (Ee) {
				for (var a = Oe.data, l = Ae(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ dn(l);
				if (l === null) throw we(), ve;
				Pr(Oe, u), o = ke(l);
				return;
			}
			var d = mn(r ? "svg" : i ? "math" : "template", r ? xe : i ? Se : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (Pr(/* @__PURE__ */ un(f), f.lastChild), r || i) for (; /* @__PURE__ */ un(f);) o.before(/* @__PURE__ */ un(f));
			else o.before(f);
		}
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/timing.js
var ri = () => performance.now(), ii = {
	tick: (e) => requestAnimationFrame(e),
	now: () => ri(),
	tasks: /* @__PURE__ */ new Set()
};
//#endregion
//#region node_modules/svelte/src/internal/client/loop.js
function ai() {
	let e = ii.now();
	ii.tasks.forEach((t) => {
		t.c(e) || (ii.tasks.delete(t), t.f());
	}), ii.tasks.size !== 0 && ii.tick(ai);
}
function oi(e) {
	let t;
	return ii.tasks.size === 0 && ii.tick(ai), {
		promise: new Promise((n) => {
			ii.tasks.add(t = {
				c: e,
				f: n
			});
		}),
		abort() {
			ii.tasks.delete(t);
		}
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/transitions.js
function si(e, t) {
	ht(() => {
		e.dispatchEvent(new CustomEvent(t));
	});
}
function ci(e) {
	if (e === "float") return "cssFloat";
	if (e === "offset") return "cssOffset";
	if (e.startsWith("--")) return e;
	let t = e.split("-");
	return t.length === 1 ? t[0] : t[0] + t.slice(1).map((e) => e[0].toUpperCase() + e.slice(1)).join("");
}
function li(e) {
	let t = {}, n = e.split(";");
	for (let e of n) {
		let [n, r] = e.split(":");
		if (!n || r === void 0) break;
		let i = ci(n.trim());
		t[i] = r.trim();
	}
	return t;
}
var ui = (e) => e;
function di(e, t, n, r) {
	var i = !!(e & 1), a = !!(e & 2), o = i && a, s = !!(e & 4), c = o ? "both" : i ? "in" : "out", l, u = t.inert, d = t.style.overflow, f, p;
	function m() {
		return ht(() => l ??= n()(t, r?.() ?? {}, { direction: c }));
	}
	var h = {
		is_global: s,
		in() {
			if (t.inert = u, !i) {
				p?.abort(), p?.reset?.();
				return;
			}
			a || f?.abort(), f = fi(t, m(), p, 1, () => {
				si(t, "introstart");
			}, () => {
				si(t, "introend"), f?.abort(), f = l = void 0, t.style.overflow = d;
			});
		},
		out(e) {
			if (!a) {
				e?.(), l = void 0;
				return;
			}
			t.inert = !0, p = fi(t, m(), f, 0, () => {
				si(t, "outrostart");
			}, () => {
				si(t, "outroend"), e?.();
			});
		},
		stop: () => {
			f?.abort(), p?.abort();
		}
	}, g = Yn;
	if ((g.nodes.t ??= []).push(h), i && Vr) {
		var _ = s;
		if (!_) {
			for (var v = g.parent; v && v.f & 65536;) for (; (v = v.parent) && !(v.f & 16););
			_ = !v || !!(v.f & 32768);
		}
		_ && En(() => {
			vr(() => h.in());
		});
	}
}
function fi(e, t, n, r, i, a) {
	var o = r === 1, s = !1;
	if (d(t)) {
		var c;
		return nt(() => {
			s || (c = fi(e, t({ direction: o ? "in" : "out" }), n, r, i, a));
		}), {
			abort: () => {
				s = !0, c?.abort();
			},
			deactivate: () => c.deactivate(),
			reset: () => c.reset(),
			t: () => c.t()
		};
	}
	if (n?.deactivate(), !t?.duration && !t?.delay) return i(), a(), {
		abort: f,
		deactivate: f,
		reset: f,
		t: () => r
	};
	let { delay: l = 0, css: u, tick: p, easing: m = ui } = t;
	var h, g = () => 1 - r;
	return nt(() => {
		if (!s) {
			var c = [];
			if (o && n === void 0 && (p && p(0, 1), u)) {
				var d = li(u(0, 1));
				c.push(d, d);
			}
			h = e.animate(c, {
				duration: l,
				fill: "forwards"
			}), h.onfinish = () => {
				h.cancel(), i();
				var o = n?.t() ?? 1 - r;
				n?.abort();
				var s = r - o, c = t.duration * Math.abs(s), l = [];
				if (c > 0) {
					var d = !1;
					if (u) for (var f = Math.ceil(c / (1e3 / 60)), _ = 0; _ <= f; _ += 1) {
						var v = o + s * m(_ / f), y = li(u(v, 1 - v));
						l.push(y), d ||= y.overflow === "hidden";
					}
					d && (e.style.overflow = "hidden"), g = () => {
						var e = h.currentTime;
						return o + s * m(e / c);
					}, p && oi(() => {
						if (h.playState !== "running") return !1;
						var e = g();
						return p(e, 1 - e), !0;
					});
				}
				h = e.animate(l, {
					duration: c,
					fill: "forwards"
				}), h.onfinish = () => {
					g = () => r, p?.(r, 1 - r), a();
				};
			};
		}
	}), {
		abort: () => {
			s = !0, h && (h.cancel(), h.effect = null, h.onfinish = f);
		},
		deactivate: () => {
			a = f;
		},
		reset: () => {
			r === 0 && p?.(1, 0);
		},
		t: () => g()
	};
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
var pi = [..." 	\n\r\f\xA0\v﻿"];
function mi(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || pi.includes(r[o - 1])) && (s === r.length || pi.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function hi(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function gi(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function _i(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(gi)), i && c.push(...Object.keys(i).map(gi));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = gi(e.substring(l, u).trim());
							if (!c.includes(p)) {
								f !== ";" && d++;
								var m = e.substring(l, d).trim();
								n += " " + m + ";";
							}
						}
						l = d + 1, u = -1;
					}
				}
			}
		}
		return r && (n += hi(r)), i && (n += hi(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function vi(e, t, n, r, i, a) {
	var o = e[fe];
	if (Ee || o !== n || o === void 0) {
		var s = mi(n, r, a);
		(!Ee || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[fe] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function yi(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function bi(e, t, n, r) {
	var i = e[pe];
	if (Ee || i !== t) {
		var a = _i(t, r);
		(!Ee || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[pe] = t;
	} else r && (Array.isArray(r) ? (yi(e, n?.[0], r[0]), yi(e, n?.[1], r[1], "important")) : yi(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var xi = Symbol("is custom element"), Si = Symbol("is html"), Ci = _e ? "link" : "LINK", wi = _e ? "progress" : "PROGRESS";
function G(e) {
	if (Ee) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					q(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					q(e, "checked", null), e.checked = r;
				}
			}
		};
		e[he] = n, nt(n), mt();
	}
}
function K(e, t) {
	var n = Ei(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === wi) && (e.value = t ?? "");
}
function Ti(e, t) {
	var n = Ei(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function q(e, t, n, r) {
	var i = Ei(e);
	Ee && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Ci) || i[t] !== (i[t] = n) && (t === "loading" && (e[ue] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Oi(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function Ei(e) {
	return e[de] ??= {
		[xi]: e.nodeName.includes("-"),
		[Si]: e.namespaceURI === be
	};
}
var Di = /* @__PURE__ */ new Map();
function Oi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = Di.get(t);
	if (n) return n;
	Di.set(t, n = /* @__PURE__ */ new Set());
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.add(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function ki(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	gt(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = Ai(e) ? ji(a) : a, n(a), jt !== null && r.add(jt), await hr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (Ee && e.defaultValue !== e.value || vr(t) == null && e.value) && (n(Ai(e) ? ji(e.value) : e.value), jt !== null && r.add(jt)), On(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = jt;
			if (r.has(i)) return;
		}
		Ai(e) && n === ji(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function Ai(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function ji(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Mi(e, t) {
	return e === t || e?.[se] === t;
}
function Ni(e = Qe(), t, n, r) {
	var i = Je.r, a = Yn;
	return En(() => {
		var o, s;
		return On(() => {
			o = s, s = r?.() || [], vr(() => {
				Mi(n(...s), e) || (t(e, ...s), o && Mi(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Mi(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function Pi(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ xt(r), R(u)) : (l && (l = !1, c = s ? vr(r) : r), c);
	let f;
	if (o) {
		var p = se in e || le in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = ut(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && Be(t), f(m)));
	var g = i ? () => {
		var n = e[t];
		return n === void 0 ? d() : (l = !0, n);
	} : () => {
		var n = e[t];
		return n !== void 0 && (c = void 0), n === void 0 ? c : n;
	};
	if (i && !(n & 4)) return g;
	if (f) {
		var _ = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!i || !t || _ || h) && f(t ? g() : e), e) : g();
		});
	}
	var v = !1, y = (n & 1 ? xt : wt)(() => (v = !1, g()));
	o && R(y);
	var b = Yn;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? R(y) : i && o ? nn(e) : e;
			return M(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Wn && v || b.f & 16384 ? y.v : R(y);
	});
}
var Fi = {
	lang: "nb",
	strings: {
		"nav.toFront": "Til forsiden",
		"nav.toLightTheme": "Bytt til lyst tema",
		"nav.toDarkTheme": "Bytt til mørkt tema",
		"nav.menu": "Meny",
		"nav.submenuFor": "Undermeny for {label}",
		"nav.toTop": "Til toppen",
		"nav.toTopFull": "Til toppen av siden",
		"lightbox.prev": "Forrige bilde",
		"lightbox.next": "Neste bilde",
		"lightbox.close": "Lukk",
		"footer.readMore": "Les mer",
		"footer.newsletter.subscribe": "Meld på",
		"footer.newsletter.success": "Takk, du er påmeldt!",
		"footer.newsletter.emailPlaceholder": "din@epost.no",
		"footer.newsletter.emailLabel": "E-postadresse",
		"footer.newsletter.invalidEmail": "Skriv inn en gyldig e-postadresse.",
		"footer.newsletter.sendFailed": "Kunne ikke sende akkurat nå. Prøv igjen senere.",
		"footer.newsletter.missingTarget": "Nyhetsbrevet mangler mottaker eller endepunkt.",
		"footer.newsletter.mailtoSubject": "Nyhetsbrev-påmelding",
		"footer.newsletter.mailtoBody": "Meld på nyhetsbrevet: {email}",
		"gallery.prevImages": "Forrige bilder",
		"gallery.nextImages": "Neste bilder",
		"gallery.prevImage": "Forrige bilde",
		"gallery.nextImage": "Neste bilde",
		"gallery.imageN": "Bilde {n}",
		"video.unknownUrl": "Ukjent videolenke (YouTube og Vimeo støttes)",
		"video.emptyHint": "Lim inn en YouTube- eller Vimeo-lenke i Egenskaper",
		"share.share": "Del på {service}",
		"share.email": "Del på e-post",
		"share.copy": "Kopier lenke",
		"share.copied": "Kopiert!",
		"shop.addToCart": "Legg i handlekurv",
		"shop.added": "Lagt i kurven!",
		"shop.memberPrice": "Medlem: {price}",
		"shop.cart": "Handlekurv",
		"shop.cartEmpty": "Handlekurven er tom.",
		"shop.total": "Sum",
		"shop.checkout": "Til kassen",
		"shop.close": "Lukk",
		"shop.remove": "Fjern varen",
		"shop.increase": "Flere",
		"shop.decrease": "Færre",
		"shop.name": "Navn",
		"shop.email": "E-post",
		"shop.phone": "Telefon",
		"shop.comment": "Kommentar",
		"shop.sendOrder": "Send bestilling",
		"shop.orderSubject": "Bestilling fra {site}",
		"shop.orderSent": "Takk! Bestillingen er sendt.",
		"shop.orderDraft": "E-postutkastet er åpnet - send det for å fullføre bestillingen.",
		"shop.fillRequired": "Fyll ut navn og en gyldig e-postadresse.",
		"shop.sendFailed": "Kunne ikke sende akkurat nå. Prøv igjen senere.",
		"shop.missingTarget": "Kassen mangler mottaker eller endepunkt.",
		"shop.vippsHint": "Betaling: Vipps til {number}.",
		"shop.quickView": "Vis produktet",
		"shop.payWithVipps": "Betal med Vipps",
		"shop.vippsUnavailable": "Betaling er ikke satt opp for denne siden ennå.",
		"countdown.days": "dager",
		"countdown.hours": "timer",
		"countdown.minutes": "minutter",
		"countdown.seconds": "sekunder",
		"render.missingPlugin": "Blokktypen '{type}' er ikke tilgjengelig (mangler plugin eller nyere Urd?)"
	},
	dates: {
		months: [
			"januar",
			"februar",
			"mars",
			"april",
			"mai",
			"juni",
			"juli",
			"august",
			"september",
			"oktober",
			"november",
			"desember"
		],
		monthsShort: [
			"jan",
			"feb",
			"mar",
			"apr",
			"mai",
			"jun",
			"jul",
			"aug",
			"sep",
			"okt",
			"nov",
			"des"
		],
		weekdays: [
			"mandag",
			"tirsdag",
			"onsdag",
			"torsdag",
			"fredag",
			"lørdag",
			"søndag"
		],
		weekdaysShort: [
			"man",
			"tir",
			"ons",
			"tor",
			"fre",
			"lør",
			"søn"
		]
	}
}, Ii = [
	"nb",
	"nn",
	"en-GB",
	"se",
	"tr"
], Li = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/, Ri = {
	nb: [
		"no",
		"nor",
		"nb",
		"nob"
	],
	nn: ["nn", "nno"],
	se: [
		"se",
		"sme",
		"smj",
		"sma"
	],
	tr: ["tr", "tur"],
	"en-GB": ["en", "eng"]
};
function zi(e) {
	let t = String(e ?? "").trim().toLowerCase();
	for (let [e, n] of Object.entries(Ri)) if (n.some((e) => t === e || t.startsWith(`${e}-`))) return e;
	return null;
}
function Bi(e) {
	return Ii.includes(String(e ?? ""));
}
function Vi(e) {
	let t = [];
	if (!Array.isArray(e)) return ["languages must be a list"];
	for (let n of e) {
		if (!n || typeof n != "object" || Array.isArray(n)) {
			t.push("languages: every entry must be an object");
			continue;
		}
		let e = String(n.code ?? "");
		Li.test(e) ? Bi(e) && t.push(`languages: '${e}' is built into Urd and cannot be overridden`) : t.push(`languages: '${e}' is not a valid language code`), (typeof n.name != "string" || !n.name.trim()) && t.push(`languages/${e}: name is missing (the language's own name)`);
		for (let r of ["site", "admin"]) n[r] !== void 0 && typeof n[r] != "boolean" && t.push(`languages/${e}: ${r} must be a boolean`);
		n.site !== !0 && n.admin !== !0 && t.push(`languages/${e}: must cover site, admin or both`);
	}
	return t;
}
function Hi(e) {
	let t = zi(e);
	if (t) return t;
	let n = String(e ?? "").trim();
	return Li.test(n) ? n : "nb";
}
async function Ui(e, t) {
	try {
		return await (await import(
			/* @vite-ignore */
			"/assets/urd/language-packs.js"
)).loadPackStrings(e, t);
	} catch {
		return null;
	}
}
({ ...Fi.strings });
var Wi = {
	lang: "nb",
	dict: {}
};
function Gi(e, t) {
	if (!t) return e;
	let n = e;
	for (let [e, r] of Object.entries(t)) n = n.replaceAll(`{${e}}`, String(r));
	return n;
}
function J(e, t) {
	return Gi(Wi.dict[e] ?? e, t);
}
function Ki(e) {
	let t = `api.${e?.code}`;
	return e?.code && Wi.dict[t] !== void 0 ? Gi(Wi.dict[t], e) : e?.error ?? null;
}
function qi() {
	return Wi.lang;
}
function Ji() {
	let e = null;
	try {
		e = localStorage.getItem("urd-admin-lang");
	} catch {}
	if (e) return Hi(e);
	for (let e of navigator.languages ?? [navigator.language]) {
		let t = zi(e);
		if (t) return t;
	}
	return "en-GB";
}
var Yi;
new Promise((e) => {
	Yi = e;
});
async function Xi(e = Ji()) {
	let t = async (e) => (await import(
		/* @vite-ignore */
		`/assets/urd/locales/admin/${e}.js`
)).default.strings;
	Wi.lang = Hi(e);
	let n = Bi(Wi.lang);
	try {
		Object.assign(Wi.dict, await t("nb")), n && Wi.lang !== "nb" && Object.assign(Wi.dict, await t(Wi.lang));
	} catch {}
	if (!n) {
		let e = await Ui(Wi.lang, "admin");
		e ? Object.assign(Wi.dict, e) : Wi.lang = "nb";
	}
	return Yi(Wi.lang), Wi.lang;
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region node_modules/svelte/src/transition/index.js
function Zi(e) {
	let t = e - 1;
	return t * t * t + 1;
}
function Qi(e) {
	let t = typeof e == "string" && e.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
	return t ? [parseFloat(t[1]), t[2] || "px"] : [e, "px"];
}
function $i(e, { delay: t = 0, duration: n = 400, easing: r = Zi, x: i = 0, y: a = 0, opacity: o = 0 } = {}) {
	let s = getComputedStyle(e), c = +s.opacity, l = s.transform === "none" ? "" : s.transform, u = c * (1 - o), [d, f] = Qi(i), [p, m] = Qi(a);
	return {
		delay: t,
		duration: n,
		easing: r,
		css: (e, t) => `
			transform: ${l} translate(${(1 - e) * d}${f}, ${(1 - e) * p}${m});
			opacity: ${c - u * t}`
	};
}
//#endregion
//#region src/lib/draftStore.js
function ea(e, t, n, r) {
	if (r) {
		let t = localStorage.getItem(r);
		if (t !== null) {
			if (localStorage.getItem(e) === null) try {
				localStorage.setItem(e, t);
			} catch {}
			localStorage.getItem(e) !== null && localStorage.removeItem(r);
		}
	}
	let i = t(), a = JSON.stringify(i), o = JSON.parse(a), s = localStorage.getItem(e);
	if (s) try {
		o = JSON.parse(s);
	} catch {
		localStorage.removeItem(e);
	}
	return {
		get data() {
			return o;
		},
		save() {
			let t = JSON.stringify(o);
			if (t === a) return localStorage.removeItem(e), !0;
			try {
				return localStorage.setItem(e, t), !0;
			} catch (e) {
				return n?.(e), !1;
			}
		},
		reset() {
			return localStorage.removeItem(e), o = JSON.parse(a), o;
		},
		replace(e) {
			return o = e, o;
		},
		amendBaseline(e) {
			let t = JSON.parse(a);
			e(t), a = JSON.stringify(t);
		},
		hasDraft() {
			return localStorage.getItem(e) !== null;
		}
	};
}
//#endregion
//#region src/lib/ColorPicker.svelte
var ta = /* @__PURE__ */ B("<button type=\"button\" class=\"cp-clear svelte-zxiloo\">×</button>"), na = /* @__PURE__ */ B("<button type=\"button\" class=\"cp-eye svelte-zxiloo\"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 2l4 4-3 3-4-4 3-3z\"></path><path d=\"M15 5L4 16l-1 5 5-1L19 9\"></path></svg></button>"), ra = /* @__PURE__ */ B("<input type=\"number\" min=\"0\" max=\"255\" class=\"svelte-zxiloo\"/>"), ia = /* @__PURE__ */ B("<button type=\"button\"></button>"), aa = /* @__PURE__ */ B("<span class=\"cp-label svelte-zxiloo\"> <!></span> <span class=\"cp-tokens svelte-zxiloo\"></span>", 1), oa = /* @__PURE__ */ B("<span class=\"cp-saved svelte-zxiloo\"><button type=\"button\" class=\"cp-token svelte-zxiloo\"></button> <button type=\"button\" class=\"cp-del svelte-zxiloo\">×</button></span>"), sa = /* @__PURE__ */ B("<span class=\"cp-tokens svelte-zxiloo\"></span>"), ca = /* @__PURE__ */ B("<button type=\"button\" class=\"cp-token svelte-zxiloo\"></button>"), la = /* @__PURE__ */ B("<span class=\"cp-label svelte-zxiloo\"> </span> <span class=\"cp-tokens svelte-zxiloo\"></span>", 1), ua = /* @__PURE__ */ B("<div class=\"cp-pop svelte-zxiloo\"><div class=\"cp-sv svelte-zxiloo\"><span class=\"cp-cursor svelte-zxiloo\"></span></div> <input class=\"cp-hue svelte-zxiloo\" type=\"range\" min=\"0\" max=\"360\" step=\"1\"/> <input class=\"cp-alpha svelte-zxiloo\" type=\"range\" min=\"0\" max=\"100\" step=\"1\"/> <span class=\"cp-row svelte-zxiloo\"><span class=\"cp-preview svelte-zxiloo\"></span> <input class=\"cp-hex svelte-zxiloo\" spellcheck=\"false\"/> <!></span> <span class=\"cp-row cp-rgb svelte-zxiloo\"></span> <!> <span class=\"cp-label cp-label-row svelte-zxiloo\"> <button type=\"button\" class=\"cp-add svelte-zxiloo\">+</button></span> <!> <!></div>"), da = /* @__PURE__ */ B("<span class=\"cp svelte-zxiloo\"><button type=\"button\"></button> <!> <!></span>");
function fa(e, t) {
	Xe(t, !0);
	let n = Pi(t, "value", 3, "#000000"), r = Pi(t, "tokens", 19, () => []), i = Pi(t, "label", 19, () => J("cp.pickColor")), a = Pi(t, "allowClear", 3, !1), o = "urd-recent-colors", s = "urd-saved-colors", c = () => {
		let e = r().find(([e]) => e === n());
		return e ? e[1] : n();
	}, l = () => r().find(([e]) => e === n())?.[0] ?? null, u = /* @__PURE__ */ j(nn([])), d = /* @__PURE__ */ j(nn([])), f = "", p = "", m = /* @__PURE__ */ j(null), g = /* @__PURE__ */ j(!1), _ = /* @__PURE__ */ j(nn({
		top: 0,
		left: 0
	})), v = /* @__PURE__ */ j(0), y = /* @__PURE__ */ j(0), b = /* @__PURE__ */ j(1), x = /* @__PURE__ */ j(1), S = /* @__PURE__ */ j("#000000");
	function C(e) {
		let t = /^#?([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(String(e).trim());
		if (!t) return null;
		let n = parseInt(t[1], 16), r = t[2] ? parseInt(t[2], 16) / 255 : 1;
		return [
			n >> 16 & 255,
			n >> 8 & 255,
			n & 255,
			r
		];
	}
	let ee = (e, t, n) => "#" + [
		e,
		t,
		n
	].map((e) => e.toString(16).padStart(2, "0")).join("");
	function te(e, t, n) {
		e /= 255, t /= 255, n /= 255;
		let r = Math.max(e, t, n), i = r - Math.min(e, t, n), a = 0;
		return i && (a = r === e ? (t - n) / i % 6 : r === t ? (n - e) / i + 2 : (e - t) / i + 4, a *= 60, a < 0 && (a += 360)), [
			a,
			r ? i / r : 0,
			r
		];
	}
	function ne(e, t, n) {
		let r = n * t, i = r * (1 - Math.abs(e / 60 % 2 - 1)), a = n - r, [o, s, c] = e < 60 ? [
			r,
			i,
			0
		] : e < 120 ? [
			i,
			r,
			0
		] : e < 180 ? [
			0,
			r,
			i
		] : e < 240 ? [
			0,
			i,
			r
		] : e < 300 ? [
			i,
			0,
			r
		] : [
			r,
			0,
			i
		];
		return [
			Math.round((o + a) * 255),
			Math.round((s + a) * 255),
			Math.round((c + a) * 255)
		];
	}
	function re() {
		return ee(...ne(R(v), R(y), R(b)));
	}
	function ie() {
		let e = re();
		return R(x) >= .995 ? e : e + Math.round(R(x) * 255).toString(16).padStart(2, "0");
	}
	function ae() {
		M(S, ie(), !0), p = R(S), t.onchange?.(R(S));
	}
	function oe(e) {
		let t = C(e);
		return t ? (((e) => {
			var t = h(e, 3);
			M(v, t[0], !0), M(y, t[1], !0), M(b, t[2], !0);
		})(te(t[0], t[1], t[2])), M(x, t[3], !0), M(S, ie(), !0), !0) : !1;
	}
	function se() {
		oe(c()) || oe("#000000"), f = n(), p = "";
		try {
			let e = JSON.parse(localStorage.getItem(o) ?? "[]");
			M(u, Array.isArray(e) ? e : [], !0);
		} catch {
			M(u, [], !0);
		}
		try {
			let e = JSON.parse(localStorage.getItem(s) ?? "[]");
			M(d, Array.isArray(e) ? e : [], !0);
		} catch {
			M(d, [], !0);
		}
		let e = R(m).getBoundingClientRect(), t = R(m).closest(".panel-body")?.getBoundingClientRect(), r = t ? t.right : window.innerWidth, i = Math.max(8, Math.min(e.right - 236, r - 236 - 8)), a = e.bottom + 380 + 8 > window.innerHeight ? Math.max(8, e.top - 380 - 8) : e.bottom + 6;
		M(_, {
			top: a,
			left: i
		}, !0), M(g, !0);
	}
	function ce() {
		if (M(g, !1), p && p !== f) {
			let e = [p, ...R(u).filter((e) => e !== p)].slice(0, 8);
			localStorage.setItem(o, JSON.stringify(e));
		}
	}
	function le(e, n) {
		oe(n), M(S, n, !0), t.onchange?.(e);
	}
	function ue(e) {
		let t = e.currentTarget;
		t.setPointerCapture(e.pointerId);
		let n = (e) => {
			let n = t.getBoundingClientRect();
			M(y, Math.min(1, Math.max(0, (e.clientX - n.left) / n.width)), !0), M(b, 1 - Math.min(1, Math.max(0, (e.clientY - n.top) / n.height))), ae();
		};
		n(e);
		let r = (e) => n(e), i = () => {
			t.removeEventListener("pointermove", r), t.removeEventListener("pointerup", i);
		};
		t.addEventListener("pointermove", r), t.addEventListener("pointerup", i);
	}
	function de(e) {
		oe(e.target.value) ? ae() : M(S, re(), !0);
	}
	function fe(e) {
		return (C(re()) ?? [
			0,
			0,
			0
		])[e];
	}
	function pe(e, t) {
		let n = C(re()) ?? [
			0,
			0,
			0
		];
		n[e] = Math.min(255, Math.max(0, Number(t) || 0)), ((e) => {
			var t = h(e, 3);
			M(v, t[0], !0), M(y, t[1], !0), M(b, t[2], !0);
		})(te(...n)), ae();
	}
	let me = typeof window < "u" && "EyeDropper" in window;
	async function he() {
		try {
			oe((await new window.EyeDropper().open()).sRGBHex) && ae();
		} catch {}
	}
	function ge(e) {
		oe(e) && ae();
	}
	function _e() {
		let e = ie();
		R(d).includes(e) || (M(d, [e, ...R(d)].slice(0, 12), !0), localStorage.setItem(s, JSON.stringify(Ke(R(d)))));
	}
	function ve(e) {
		M(d, R(d).filter((t) => t !== e), !0), localStorage.setItem(s, JSON.stringify(Ke(R(d))));
	}
	Cn(() => {
		if (!R(g)) return;
		let e = (e) => {
			R(m) && !R(m).contains(e.target) && ce();
		}, t = (e) => {
			e.key === "Escape" && ce();
		}, n = () => ce();
		return document.addEventListener("pointerdown", e, !0), document.addEventListener("keydown", t, !0), window.addEventListener("blur", n), () => {
			document.removeEventListener("pointerdown", e, !0), document.removeEventListener("keydown", t, !0), window.removeEventListener("blur", n);
		};
	});
	var ye = da(), be = N(ye);
	let xe;
	var Se = I(be, 2), Ce = (e) => {
		var n = ta();
		L((e, t) => {
			q(n, "title", e), q(n, "aria-label", t);
		}, [() => J("cp.clearTitle"), () => J("cp.clear")]), z("click", n, () => t.onchange?.("")), V(e, n);
	};
	U(Se, (e) => {
		a() && n() && e(Ce);
	});
	var we = I(Se, 2), Te = (e) => {
		var t = ua(), i = N(t), a = F(i), o = I(i, 2);
		G(o);
		var s = I(o, 2);
		G(s);
		var c = I(s, 2), f = N(c), p = I(f, 2);
		G(p);
		var m = I(p, 2), g = (e) => {
			var t = na();
			L((e) => q(t, "title", e), [() => J("cp.eyedropper")]), z("click", t, he), V(e, t);
		};
		U(m, (e) => {
			me && e(g);
		}), w(c);
		var C = I(c, 2);
		Zr(C, 22, () => [
			"R",
			"G",
			"B"
		], (e) => e, (e, t, n) => {
			var r = ra();
			G(r), L((e) => {
				q(r, "title", t), K(r, e);
			}, [() => fe(R(n))]), z("change", r, (e) => pe(R(n), e.target.value)), V(e, r);
		}), w(C);
		var ee = I(C, 2), te = (e) => {
			var t = aa(), i = P(t), a = N(i, !0), o = I(a), s = (e) => {
				var t = Fr();
				L((e) => H(t, e), [() => J("cp.linkedSuffix", { token: l() })]), V(e, t);
			}, c = /* @__PURE__ */ O(() => l());
			U(o, (e) => {
				R(c) && e(s);
			}), w(i);
			var u = I(i, 2);
			Zr(u, 21, r, ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ O(() => h(R(t), 2));
				let i = () => R(r)[0], a = () => R(r)[1];
				var o = ia();
				let s;
				L((e) => {
					s = vi(o, 1, "cp-token svelte-zxiloo", null, s, { active: n() === i() }), bi(o, `background: ${a() ?? ""}`), q(o, "title", e);
				}, [() => J("cp.tokenTitle", { name: i() })]), z("click", o, () => le(i(), a())), V(e, o);
			}), w(u), L((e) => H(a, e), [() => J("cp.themeColors")]), V(e, t);
		};
		U(ee, (e) => {
			r().length && e(te);
		});
		var ne = I(ee, 2), ie = N(ne), oe = I(ie);
		w(ne);
		var se = I(ne, 2), ce = (e) => {
			var t = sa();
			Zr(t, 20, () => R(d), (e) => e, (e, t) => {
				var n = oa(), r = N(n), i = I(r, 2);
				w(n), L((e) => {
					bi(r, `background: ${t ?? ""}`), q(r, "title", t), q(i, "title", e);
				}, [() => J("cp.removeSaved")]), z("click", r, () => ge(t)), z("click", i, () => ve(t)), V(e, n);
			}), w(t), V(e, t);
		};
		U(se, (e) => {
			R(d).length && e(ce);
		});
		var ye = I(se, 2), be = (e) => {
			var t = la(), n = P(t), r = F(n, !0), i = I(n, 2);
			Zr(i, 20, () => R(u), (e) => e, (e, t) => {
				var n = ca();
				L(() => {
					bi(n, `background: ${t ?? ""}`), q(n, "title", t);
				}), z("click", n, () => ge(t)), V(e, n);
			}), w(i), L((e) => H(r, e), [() => J("common.recent")]), V(e, t);
		};
		U(ye, (e) => {
			R(u).length && e(be);
		}), w(t), L((e, n, r, c, l) => {
			bi(t, `top: ${R(_).top ?? ""}px; left: ${R(_).left ?? ""}px`), bi(i, `background-image: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent); background-color: hsl(${R(v) ?? ""}, 100%, 50%)`), bi(a, `left: ${R(y) * 100}%; top: ${(1 - R(b)) * 100}%`), K(o, R(v)), K(s, e), q(s, "title", n), bi(s, `background: linear-gradient(to right, transparent, ${r ?? ""}), repeating-conic-gradient(rgb(255 255 255 / 35%) 0 25%, rgb(0 0 0 / 35%) 0 50%) 0 0 / 10px 10px`), bi(f, `background: ${R(S) ?? ""}`), K(p, R(S)), H(ie, `${c ?? ""} `), q(oe, "title", l);
		}, [
			() => Math.round(R(x) * 100),
			() => J("cp.alpha"),
			() => re(),
			() => J("cp.saved"),
			() => J("cp.saveTitle")
		]), z("click", t, (e) => e.preventDefault()), z("pointerdown", i, ue), z("input", o, (e) => {
			M(v, Number(e.target.value), !0), ae();
		}), z("input", s, (e) => {
			M(x, Number(e.target.value) / 100), ae();
		}), z("change", p, de), z("click", oe, _e), V(e, t);
	};
	U(we, (e) => {
		R(g) && e(Te);
	}), w(ye), Ni(ye, (e) => M(m, e), () => R(m)), L((e, t, r) => {
		xe = vi(be, 1, "cp-swatch svelte-zxiloo", null, xe, {
			linked: e,
			"cp-empty": a() && !n()
		}), bi(be, `background: ${t ?? ""}`), q(be, "title", r), q(be, "aria-label", i());
	}, [
		() => l(),
		() => n() ? c() : "transparent",
		() => l() ? J("cp.linkedTitle", {
			label: i(),
			token: l()
		}) : i()
	]), z("click", be, () => R(g) ? ce() : se()), V(e, ye), Ze();
}
Dr([
	"click",
	"pointerdown",
	"input",
	"change"
]);
//#endregion
//#region ../template/assets/engine/0.7.2/imageTools.js
var pa = 1600, ma = .82, ha = .6, ga = 15e6;
async function _a(e, t = pa) {
	if (ya(e)) return ba(await e.text());
	let n = await createImageBitmap(e), r = Math.min(1, t / Math.max(n.width, n.height)), i = Math.round(n.width * r), a = Math.round(n.height * r), o = document.createElement("canvas");
	o.width = i, o.height = a, o.getContext("2d").drawImage(n, 0, 0, i, a), n.close();
	let s = (e) => new Promise((t) => o.toBlob(t, "image/webp", e)), c = await s(ma);
	return c.size > 4e5 && (c = await s(ha)), {
		dataUrl: await new Promise((e) => {
			let t = new FileReader();
			t.onload = () => e(t.result), t.readAsDataURL(c);
		}),
		bytes: c.size,
		width: i,
		height: a
	};
}
var va = "image/svg+xml";
function ya(e) {
	return e.type === va || /\.svg$/i.test(e.name || "");
}
function ba(e) {
	let t = String(e ?? "");
	if (!/<svg[\s>]/i.test(t)) throw Error("Invalid SVG");
	if (/<\s*script[\s>]/i.test(t) || /<\s*foreignObject[\s>]/i.test(t) || /\son[a-z]+\s*=/i.test(t) || /javascript:/i.test(t)) throw Error("The SVG contains scripts or event handlers and cannot be used");
	let n = new Blob([t]).size, r = `data:${va};base64,${btoa(unescape(encodeURIComponent(t)))}`, i = t.match(/<svg\b[^>]*>/i)?.[0] ?? "", a = i.match(/viewBox\s*=\s*["']\s*([-\d.]+(?:[\s,]+[-\d.]+){3})\s*["']/i)?.[1]?.split(/[\s,]+/).map(Number);
	return {
		dataUrl: r,
		bytes: n,
		width: a?.length === 4 ? a[2] : Number.parseFloat(i.match(/\bwidth\s*=\s*["']?([\d.]+)/i)?.[1]) || 0,
		height: a?.length === 4 ? a[3] : Number.parseFloat(i.match(/\bheight\s*=\s*["']?([\d.]+)/i)?.[1]) || 0
	};
}
function xa(e, t, n = .04) {
	let r = String(e ?? "");
	if (!t || !(t.width > 0) || !(t.height > 0)) return r;
	let i = r.match(/<svg\b[^>]*>/i)?.[0];
	if (!i) return r;
	let a = (e) => Math.round(e * 1e3) / 1e3, o = Math.max(t.width, t.height) * Math.max(0, n), s = a(t.x - o), c = a(t.y - o), l = a(t.width + 2 * o), u = a(t.height + 2 * o), d = i.replace(/\sviewBox\s*=\s*["'][^"']*["']/i, "").replace(/\swidth\s*=\s*["'][^"']*["']/i, "").replace(/\sheight\s*=\s*["'][^"']*["']/i, "").replace(/<svg\b/i, `<svg viewBox="${s} ${c} ${l} ${u}" width="${l}" height="${u}"`);
	return r.replace(i, d);
}
function Sa(e) {
	let t = String(e ?? "").match(/<svg\b[^>]*>/i)?.[0] ?? "", n = t.match(/viewBox\s*=\s*["']\s*([-\d.]+(?:[\s,]+[-\d.]+){3})\s*["']/i)?.[1]?.split(/[\s,]+/).map(Number);
	if (n?.length === 4 && n.every(Number.isFinite)) return n;
	let r = Number.parseFloat(t.match(/\bwidth\s*=\s*["']?([\d.]+)/i)?.[1]), i = Number.parseFloat(t.match(/\bheight\s*=\s*["']?([\d.]+)/i)?.[1]);
	return r > 0 && i > 0 ? [
		0,
		0,
		r,
		i
	] : null;
}
function Ca(e) {
	let t = e || "";
	if (/^data:image\/svg\+xml[;,]/.test(t)) return "svg";
	let n = t.match(/^data:audio\/([a-z0-9.+-]+)[;,]/i)?.[1]?.toLowerCase();
	if (n) return {
		mpeg: "mp3",
		mp3: "mp3",
		mp4: "m4a",
		"x-m4a": "m4a",
		aac: "aac",
		wav: "wav",
		"x-wav": "wav",
		ogg: "ogg",
		webm: "webm",
		flac: "flac"
	}[n] ?? "mp3";
	let r = t.match(/^data:video\/([a-z0-9.+-]+)[;,]/i)?.[1]?.toLowerCase();
	return r ? r === "webm" ? "webm" : "mp4" : "webp";
}
function wa(e, t = "image") {
	return e.replace(/\.[^.]+$/, "").toLowerCase().replaceAll("æ", "ae").replaceAll("ø", "o").replaceAll("å", "a").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || t;
}
function Ta(e) {
	let t = 5381;
	for (let n = 0; n < e.length; n++) t = (t << 5) + t + e.charCodeAt(n) >>> 0;
	return t.toString(16).padStart(8, "0");
}
//#endregion
//#region ../template/assets/engine/0.7.2/glyphs.js
var Ea = "urd-recent-glyphs", Da = [
	["glyphCat.symbols", "★ ☆ ✦ ✧ ✩ ✪ ✫ ✭ ✮ ✯ ✵ ✳ ✴ ❖ ❋ ✿ ❀ ❁ ✾ ❃ ☘ ◆ ◇ ● ○ ◎ ■ □ ▣ ▲ △ ▼ ▽ ⬡ ⬢ ♦ ♠ ♣ ♥ ♡ ✓ ✔ ✕ ✖ ✗ ✘ ✚ ✜ ☀ ☾ ♪ ♫ ♬ ☮ ☯ ⚜ ⚓ ⚡ ☂ ✂ ✏ ✒ ✉ ☎ ⌛ ⏳ ♻ ⚠ ☑ ⚙ § © ® ™ ° ± × ÷ ∞ ≈ ≠ ≤ ≥ € £ ¥ • ‣ ⁂"],
	["glyphCat.arrows", "→ ← ↑ ↓ ↔ ↕ ↗ ↘ ↙ ↖ ⇒ ⇐ ⇑ ⇓ ⇔ ➜ ➤ ➔ ↩ ↪ ⤴ ⤵ ↺ ↻ ⟲ ⟳ « » ‹ ›"],
	["glyphCat.smileys", "😀 😃 😄 😁 😆 😅 😂 🙂 😉 😊 😇 🥰 😍 🤩 😘 😋 😜 🤪 😎 🥳 😏 😌 😴 🤔 🤗 🤭 🙃 😢 😭 😤 😡 🤯 😱 🥺 😬 🤓 🫠 🫡 🫶"],
	["glyphCat.people", "👍 👎 👏 🙌 🤝 👋 ✌ 🤘 🤞 💪 🙏 👀 🧠 👶 🧒 🧑 🧓 👥 👤 🗣 🏃 🚶 🧍 💃 🕺 🧑‍🤝‍🧑"],
	["glyphCat.nature", "🌞 🌝 🌙 ⭐ 🌟 ✨ ☁ 🌈 🔥 💧 🌊 ❄ ⛄ 🌸 🌼 🌻 🌹 🌷 🌱 🌲 🌳 🍀 🍁 🍂 🐝 🦋 🐶 🐱 🐦 🦉 🐟 🐢 🌍 🏔 🏕"],
	["glyphCat.food", "☕ 🍵 🥤 🍺 🍷 🥂 🍰 🎂 🧁 🍪 🍩 🍕 🌮 🍔 🍟 🥗 🍎 🍊 🍋 🍇 🍓 🫐 🥕 🌽 🍞 🥐 🧀 🍿 🍦 🍫"],
	["glyphCat.activity", "⚽ 🏀 🏐 🎾 🏓 🏸 ⛷ 🏂 🚴 🏊 🎮 🎲 ♟ 🎯 🎳 🎣 🥾 ⛺ 🎪 🎭 🎨 🎬 🎤 🎧 🎸 🎹 🥁 🎻 📚 ✈ 🚗 🚲 ⛵ 🚀 🏋 🧘"],
	["glyphCat.objects", "💡 🔔 📣 📢 📌 📍 📅 ⏰ 🔑 🔒 🔓 🛠 🔧 🔨 🧰 📦 📫 📧 📱 💻 🖥 🖨 📷 📸 🎥 📺 🔍 🔎 📎 📏 📐 📝 📄 📋 📁 💾 🧾 💰 💳 🪙 🎁 🎈 🎉 🎊 🏆 🥇 🥈 🥉 🏅 🚩 🏁 🔗 🧭 🗺 🧲 🧪 🔬 🔭 💊 🩺 🛡 🕯 🪧 🖼"],
	["glyphCat.hearts", "❤ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💗 💓 💕 💖 💘 💝 💞 💟"]
];
function Oa(e, t) {
	return [t, ...(Array.isArray(e) ? e : []).filter((e) => e !== t)].slice(0, 16);
}
function ka() {
	try {
		let e = JSON.parse(localStorage.getItem("urd-recent-glyphs") ?? "[]");
		return Array.isArray(e) ? e : [];
	} catch {
		return [];
	}
}
function Aa(e) {
	let t = Oa(ka(), e);
	try {
		localStorage.setItem(Ea, JSON.stringify(t));
	} catch {}
	return t;
}
//#endregion
//#region ../template/assets/engine/0.7.2/icons.js
var ja = "fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"", Ma = "fill=\"currentColor\" stroke=\"none\"", Na = {
	facebook: {
		label: "Facebook",
		labelKey: "icon.facebook",
		body: "<path d=\"M15.5 4H13a3.5 3.5 0 0 0-3.5 3.5V10H7v3.2h2.5V20h3.2v-6.8h2.5l.55-3.2h-3.05V7.8c0-.5.4-.8.9-.8h1.9z\"/>"
	},
	instagram: {
		label: "Instagram",
		labelKey: "icon.instagram",
		body: "<rect x=\"3.5\" y=\"3.5\" width=\"17\" height=\"17\" rx=\"4.5\"/><circle cx=\"12\" cy=\"12\" r=\"3.8\"/><circle cx=\"16.9\" cy=\"7.1\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/>"
	},
	x: {
		label: "X (Twitter)",
		labelKey: "icon.x",
		body: "<path d=\"M5 4h3.8l4 5.4L17.4 4h2.4l-5.9 6.9L20.5 20h-3.8l-4.3-5.8L7.4 20H5l6.3-7.4z\"/>",
		fill: !0
	},
	linkedin: {
		label: "LinkedIn",
		labelKey: "icon.linkedin",
		body: "<circle cx=\"4.8\" cy=\"4.8\" r=\"1.7\"/><path d=\"M3.3 9.2h3v11h-3z\"/><path d=\"M9.7 20.2v-11h3v1.6a3.9 3.9 0 0 1 3.3-1.8c2.6 0 4.4 1.8 4.4 4.9v6.3h-3.1v-5.7c0-1.6-.7-2.6-2-2.6-1.4 0-2.5 1-2.5 2.7v5.6z\"/>"
	},
	youtube: {
		label: "YouTube",
		labelKey: "icon.youtube",
		body: "<rect x=\"2.8\" y=\"5.7\" width=\"18.4\" height=\"12.6\" rx=\"3.6\"/><path d=\"M10.2 9.3l5 2.7-5 2.7z\" fill=\"currentColor\" stroke=\"none\"/>"
	},
	tiktok: {
		label: "TikTok",
		labelKey: "icon.tiktok",
		body: "<path d=\"M13.8 5v9.3a3.9 3.9 0 1 1-3.9-3.9\"/><path d=\"M13.8 5c.5 2.9 2.6 4.8 5.6 5v3.1c-2.1-.1-4-.8-5.6-2\"/>"
	},
	whatsapp: {
		label: "WhatsApp",
		labelKey: "icon.whatsapp",
		body: "<path d=\"M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5z\"/><path d=\"M9.2 8.4l1 2-.8 1a7.3 7.3 0 0 0 3.2 3.2l1-.8 2 1c-.3 1.3-1.2 1.9-2.4 1.7-2.9-.5-5.2-2.8-5.7-5.7-.2-1.2.4-2.1 1.7-2.4z\"/>"
	},
	snapchat: {
		label: "Snapchat",
		labelKey: "icon.snapchat",
		body: "<path d=\"M12 3.2c-2.9 0-4.9 2.1-4.9 5v2.1c-.8.3-1.7.3-2.5.1.3 1 1.1 1.8 2.2 2-.4 1.4-1.5 2.5-3 2.8 1 1.2 2.6 1.9 4.3 1.8.9 1.2 2.3 1.9 3.9 1.9s3-.7 3.9-1.9c1.7.1 3.3-.6 4.3-1.8-1.5-.3-2.6-1.4-3-2.8 1.1-.2 1.9-1 2.2-2-.8.2-1.7.2-2.5-.1V8.2c0-2.9-2-5-4.9-5z\"/>"
	},
	pinterest: {
		label: "Pinterest",
		labelKey: "icon.pinterest",
		body: "<path d=\"M9.2 20.5c.4-1.6 1.4-5.6 1.9-7.6\"/><path d=\"M10.4 14.2c.4.9 1.4 1.5 2.6 1.5 2.6 0 4.4-2.2 4.4-5a5.4 5.4 0 1 0-10.4 2.1\"/>"
	},
	spotify: {
		label: "Spotify",
		labelKey: "icon.spotify",
		body: "<circle cx=\"12\" cy=\"12\" r=\"8.8\"/><path d=\"M7.6 9.6c3-.9 6.6-.6 9.1.9\"/><path d=\"M8 12.5c2.5-.7 5.4-.4 7.5.8\"/><path d=\"M8.5 15.2c2-.5 4.2-.3 5.9.7\"/>"
	},
	discord: {
		label: "Discord",
		labelKey: "icon.discord",
		body: "<path d=\"M8 3.9c-1.6.3-3.1.9-4.5 1.7-1.5 3.2-2.1 6.6-1.7 10a12.7 12.7 0 0 0 5 2.6l1-1.9a11 11 0 0 0 8.4 0l1 1.9a12.7 12.7 0 0 0 5-2.6c.4-3.4-.2-6.8-1.7-10A14 14 0 0 0 16 3.9l-.6 1.4a15 15 0 0 0-6.8 0z\"/><circle cx=\"9.3\" cy=\"11.5\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14.7\" cy=\"11.5\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/>"
	},
	github: {
		label: "GitHub",
		labelKey: "icon.github",
		body: "<path d=\"M12 2.8a9.2 9.2 0 0 0-2.9 17.9c.5.1.6-.2.6-.4v-1.7c-2.6.6-3.1-1.1-3.1-1.1-.4-1.1-1-1.4-1-1.4-.9-.6 0-.6 0-.6.9.1 1.4 1 1.4 1 .8 1.4 2.2 1 2.7.8.1-.6.3-1 .6-1.3-2-.2-4.2-1-4.2-4.5 0-1 .4-1.8 1-2.5-.1-.2-.4-1.2.1-2.4 0 0 .8-.3 2.5.9a8.8 8.8 0 0 1 4.6 0c1.7-1.2 2.5-.9 2.5-.9.5 1.2.2 2.2.1 2.4.6.7 1 1.5 1 2.5 0 3.5-2.2 4.3-4.2 4.5.3.3.6.9.6 1.8v2.6c0 .2.1.5.6.4A9.2 9.2 0 0 0 12 2.8z\"/>",
		fill: !0
	},
	mail: {
		label: "Email",
		labelKey: "icon.mail",
		body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2.5\"/><path d=\"M3.5 7l8.5 6 8.5-6\"/>"
	},
	phone: {
		label: "Phone",
		labelKey: "icon.phone",
		body: "<path d=\"M21.2 16.9v2.6a1.8 1.8 0 0 1-2 1.8 18 18 0 0 1-7.8-2.8 17.7 17.7 0 0 1-5.4-5.4A18 18 0 0 1 3.2 5.2a1.8 1.8 0 0 1 1.8-2h2.6a1.8 1.8 0 0 1 1.8 1.5c.1.9.3 1.7.6 2.5a1.8 1.8 0 0 1-.4 1.9l-1.1 1.1a14.4 14.4 0 0 0 5.4 5.4l1.1-1.1a1.8 1.8 0 0 1 1.9-.4c.8.3 1.6.5 2.5.6a1.8 1.8 0 0 1 1.5 1.8z\"/>"
	},
	smartphone: {
		label: "Mobile",
		labelKey: "icon.smartphone",
		body: "<rect x=\"7\" y=\"2.8\" width=\"10\" height=\"18.4\" rx=\"2.5\"/><line x1=\"10.8\" y1=\"18.2\" x2=\"13.2\" y2=\"18.2\"/>"
	},
	chat: {
		label: "Speech bubble",
		labelKey: "icon.chat",
		body: "<path d=\"M20.8 12a8.5 8.5 0 0 1-12.4 7.5L4 20.6l1.1-4.2A8.5 8.5 0 1 1 20.8 12z\"/>"
	},
	send: {
		label: "Send",
		labelKey: "icon.send",
		body: "<path d=\"M21 3.5L10.4 14.1\"/><path d=\"M21 3.5l-6.8 17-3.8-6.4L4 10.3z\"/>"
	},
	globe: {
		label: "Website",
		labelKey: "icon.globe",
		body: "<circle cx=\"12\" cy=\"12\" r=\"8.8\"/><path d=\"M3.2 12h17.6\"/><path d=\"M12 3.2c2.4 2.4 3.6 5.4 3.6 8.8s-1.2 6.4-3.6 8.8c-2.4-2.4-3.6-5.4-3.6-8.8S9.6 5.6 12 3.2z\"/>"
	},
	rss: {
		label: "RSS feed",
		labelKey: "icon.rss",
		body: "<path d=\"M4.5 11a8.5 8.5 0 0 1 8.5 8.5\"/><path d=\"M4.5 5.5a14 14 0 0 1 14 14\"/><circle cx=\"5.5\" cy=\"18.5\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/>"
	},
	"map-pin": {
		label: "Map pin",
		labelKey: "icon.map-pin",
		body: "<path d=\"M12 21.5s7-6.2 7-11.3A7 7 0 1 0 5 10.2c0 5.1 7 11.3 7 11.3z\"/><circle cx=\"12\" cy=\"10\" r=\"2.6\"/>"
	},
	map: {
		label: "Map",
		labelKey: "icon.map",
		body: "<path d=\"M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6z\"/><path d=\"M9 4v14\"/><path d=\"M15 6v14\"/>"
	},
	home: {
		label: "Home",
		labelKey: "icon.home",
		body: "<path d=\"M4 10.5l8-7 8 7V20a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20z\"/><path d=\"M9.5 21.5V14h5v7.5\"/>"
	},
	clock: {
		label: "Clock",
		labelKey: "icon.clock",
		body: "<circle cx=\"12\" cy=\"12\" r=\"8.8\"/><path d=\"M12 7v5l3.2 2\"/>"
	},
	calendar: {
		label: "Calendar",
		labelKey: "icon.calendar",
		body: "<rect x=\"3.5\" y=\"5\" width=\"17\" height=\"16\" rx=\"2.5\"/><path d=\"M3.5 10h17\"/><path d=\"M8 2.8V7\"/><path d=\"M16 2.8V7\"/>"
	},
	heart: {
		label: "Heart",
		labelKey: "icon.heart",
		body: "<path d=\"M12 20.5S3.5 15.4 3.5 9.5A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.5c0 5.9-8.5 11-8.5 11z\"/>"
	},
	star: {
		label: "Star",
		labelKey: "icon.star",
		body: "<path d=\"M12 3.5l2.7 5.4 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.8l6-.9z\"/>"
	},
	check: {
		label: "Check",
		labelKey: "icon.check",
		body: "<path d=\"M4.5 12.8L9.5 18 19.5 6.5\"/>"
	},
	cross: {
		label: "Cross",
		labelKey: "icon.cross",
		body: "<path d=\"M6 6l12 12\"/><path d=\"M18 6L6 18\"/>"
	},
	plus: {
		label: "Plus",
		labelKey: "icon.plus",
		body: "<path d=\"M12 5v14\"/><path d=\"M5 12h14\"/>"
	},
	info: {
		label: "Info",
		labelKey: "icon.info",
		body: "<circle cx=\"12\" cy=\"12\" r=\"8.8\"/><path d=\"M12 11v5.5\"/><line x1=\"12\" y1=\"7.8\" x2=\"12\" y2=\"7.8\"/>"
	},
	question: {
		label: "Question",
		labelKey: "icon.question",
		body: "<circle cx=\"12\" cy=\"12\" r=\"8.8\"/><path d=\"M9.4 9.2A2.7 2.7 0 0 1 12 7.4c1.5 0 2.7 1 2.7 2.4 0 1.8-2.7 2-2.7 4\"/><line x1=\"12\" y1=\"16.8\" x2=\"12\" y2=\"16.8\"/>"
	},
	warning: {
		label: "Warning",
		labelKey: "icon.warning",
		body: "<path d=\"M12 4L2.8 19.5h18.4z\"/><path d=\"M12 10v4\"/><line x1=\"12\" y1=\"16.8\" x2=\"12\" y2=\"16.8\"/>"
	},
	zap: {
		label: "Lightning",
		labelKey: "icon.zap",
		body: "<path d=\"M13 2.8L4.5 13.5H11l-1 7.7 8.5-10.7H12z\"/>"
	},
	sun: {
		label: "Sun",
		labelKey: "icon.sun",
		body: "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7\"/>"
	},
	moon: {
		label: "Moon",
		labelKey: "icon.moon",
		body: "<path d=\"M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z\"/>"
	},
	leaf: {
		label: "Leaf",
		labelKey: "icon.leaf",
		body: "<path d=\"M5 19C5 9 11 4.5 20 4.5c0 9-4.5 15-13 14.5z\"/><path d=\"M5 19c2-5.5 5.5-9 10-11\"/>"
	},
	music: {
		label: "Music",
		labelKey: "icon.music",
		body: "<circle cx=\"7\" cy=\"17.5\" r=\"2.8\"/><circle cx=\"17\" cy=\"15.5\" r=\"2.8\"/><path d=\"M9.8 17.5V6.5l10-2v11\"/>"
	},
	camera: {
		label: "Camera",
		labelKey: "icon.camera",
		body: "<path d=\"M3.5 8.5A1.5 1.5 0 0 1 5 7h2.5l1.7-2.3h5.6L16.5 7H19a1.5 1.5 0 0 1 1.5 1.5V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18z\"/><circle cx=\"12\" cy=\"13\" r=\"3.4\"/>"
	},
	image: {
		label: "Image",
		labelKey: "icon.image",
		body: "<rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15\" rx=\"2.5\"/><circle cx=\"8.8\" cy=\"9.3\" r=\"1.6\"/><path d=\"M20.5 15.5l-4.7-4.7-9.3 8.7\"/>"
	},
	document: {
		label: "Document",
		labelKey: "icon.document",
		body: "<path d=\"M13.5 3H6.8A1.8 1.8 0 0 0 5 4.8v14.4A1.8 1.8 0 0 0 6.8 21h10.4a1.8 1.8 0 0 0 1.8-1.8V8.5z\"/><path d=\"M13.5 3v5.5H19\"/><path d=\"M8.5 13h7M8.5 16.5h7\"/>"
	},
	"shopping-bag": {
		label: "Shopping bag",
		labelKey: "icon.shopping-bag",
		body: "<path d=\"M5.5 8h13l-1 12a1.8 1.8 0 0 1-1.8 1.5H8.3A1.8 1.8 0 0 1 6.5 20z\"/><path d=\"M8.8 10.5V7a3.2 3.2 0 0 1 6.4 0v3.5\"/>"
	},
	cart: {
		label: "Cart",
		labelKey: "icon.cart",
		body: "<circle cx=\"9.3\" cy=\"19.3\" r=\"1.5\"/><circle cx=\"17.3\" cy=\"19.3\" r=\"1.5\"/><path d=\"M3 4.5h2.4l2.3 10.6a1.8 1.8 0 0 0 1.8 1.4h7.6a1.8 1.8 0 0 0 1.8-1.4L20.8 8H6.1\"/>"
	},
	gift: {
		label: "Gift",
		labelKey: "icon.gift",
		body: "<rect x=\"3.5\" y=\"8\" width=\"17\" height=\"4\"/><path d=\"M5 12v8.5h14V12\"/><path d=\"M12 8v12.5\"/><path d=\"M12 8s-4.5.3-5.5-1.8C5.8 4.7 7.8 3.3 9.3 4.4 10.8 5.5 12 8 12 8z\"/><path d=\"M12 8s4.5.3 5.5-1.8c.7-1.5-1.3-2.9-2.8-1.8C13.2 5.5 12 8 12 8z\"/>"
	},
	wrench: {
		label: "Wrench",
		labelKey: "icon.wrench",
		body: "<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z\"/>"
	},
	lock: {
		label: "Lock",
		labelKey: "icon.lock",
		body: "<rect x=\"5\" y=\"10.5\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3\"/>"
	},
	search: {
		label: "Search",
		labelKey: "icon.search",
		body: "<circle cx=\"10.8\" cy=\"10.8\" r=\"6.8\"/><path d=\"M15.8 15.8L21 21\"/>"
	},
	user: {
		label: "Person",
		labelKey: "icon.user",
		body: "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4.5 20.5a7.5 7.5 0 0 1 15 0\"/>"
	},
	users: {
		label: "People",
		labelKey: "icon.users",
		body: "<circle cx=\"9\" cy=\"8.5\" r=\"3.5\"/><path d=\"M2.8 20a6.2 6.2 0 0 1 12.4 0\"/><path d=\"M16 5.4a3.5 3.5 0 0 1 0 6.2\"/><path d=\"M17.8 14.6a6.2 6.2 0 0 1 3.4 5.4\"/>"
	},
	"thumbs-up": {
		label: "Thumbs up",
		labelKey: "icon.thumbs-up",
		body: "<path d=\"M3.5 10.5H7v10H3.5z\"/><path d=\"M7 19.5V11l4.2-5.6a1.7 1.7 0 0 1 3 1.4l-.9 3.7h4.8a2 2 0 0 1 2 2.4l-1.2 5.5a2 2 0 0 1-2 1.6H8.6\"/>"
	},
	"arrow-right": {
		label: "Arrow right",
		labelKey: "icon.arrow-right",
		body: "<path d=\"M4 12h16\"/><path d=\"M13.5 5.5L20 12l-6.5 6.5\"/>"
	},
	"arrow-left": {
		label: "Arrow left",
		labelKey: "icon.arrow-left",
		body: "<path d=\"M20 12H4\"/><path d=\"M10.5 5.5L4 12l6.5 6.5\"/>"
	},
	"arrow-up": {
		label: "Arrow up",
		labelKey: "icon.arrow-up",
		body: "<path d=\"M12 20V4\"/><path d=\"M5.5 10.5L12 4l6.5 6.5\"/>"
	},
	"arrow-down": {
		label: "Arrow down",
		labelKey: "icon.arrow-down",
		body: "<path d=\"M12 4v16\"/><path d=\"M5.5 13.5L12 20l6.5-6.5\"/>"
	},
	"external-link": {
		label: "External link",
		labelKey: "icon.external-link",
		body: "<path d=\"M9.5 5H5.8A1.8 1.8 0 0 0 4 6.8v11.4A1.8 1.8 0 0 0 5.8 20h11.4a1.8 1.8 0 0 0 1.8-1.8v-3.7\"/><path d=\"M13.5 4H20v6.5\"/><path d=\"M20 4l-9 9\"/>"
	},
	download: {
		label: "Download",
		labelKey: "icon.download",
		body: "<path d=\"M12 3.5v11\"/><path d=\"M6.5 9l5.5 5.5L17.5 9\"/><path d=\"M4 20.5h16\"/>"
	},
	share: {
		label: "Share",
		labelKey: "icon.share",
		body: "<circle cx=\"6\" cy=\"12\" r=\"2.6\"/><circle cx=\"17.5\" cy=\"5.5\" r=\"2.6\"/><circle cx=\"17.5\" cy=\"18.5\" r=\"2.6\"/><path d=\"M8.4 10.8l6.8-4M8.4 13.2l6.8 4\"/>"
	}
}, Pa = [
	["iconCat.social", [
		"facebook",
		"instagram",
		"x",
		"linkedin",
		"youtube",
		"tiktok",
		"whatsapp",
		"snapchat",
		"pinterest",
		"spotify",
		"discord",
		"github"
	]],
	["iconCat.communication", [
		"mail",
		"phone",
		"smartphone",
		"chat",
		"send",
		"globe",
		"rss"
	]],
	["iconCat.placeTime", [
		"map-pin",
		"map",
		"home",
		"clock",
		"calendar"
	]],
	["iconCat.symbols", [
		"heart",
		"star",
		"check",
		"cross",
		"plus",
		"info",
		"question",
		"warning",
		"zap",
		"sun",
		"moon",
		"leaf",
		"music",
		"camera",
		"image",
		"document",
		"shopping-bag",
		"cart",
		"gift",
		"wrench",
		"lock",
		"search",
		"user",
		"users",
		"thumbs-up"
	]],
	["iconCat.arrows", [
		"arrow-right",
		"arrow-left",
		"arrow-up",
		"arrow-down",
		"external-link",
		"download",
		"share"
	]]
];
function Fa(e) {
	let t = typeof e == "string" ? Na[e] : null;
	return t ? `<svg viewBox="0 0 24 24" width="100%" height="100%" ${t.fill ? Ma : ja} aria-hidden="true" focusable="false">${t.body}</svg>` : null;
}
//#endregion
//#region src/lib/GlyphPicker.svelte
var Ia = /* @__PURE__ */ B("<img class=\"gp-own svelte-15ln1c3\"/>"), La = /* @__PURE__ */ B("<span class=\"gp-svg svelte-15ln1c3\"></span>"), Ra = /* @__PURE__ */ B("<button type=\"button\" class=\"gp-cell svelte-15ln1c3\"> </button>"), za = /* @__PURE__ */ B("<div class=\"gp-group svelte-15ln1c3\"> </div> <div class=\"gp-grid svelte-15ln1c3\"></div>", 1), Ba = /* @__PURE__ */ B("<button type=\"button\"><span class=\"gp-svg svelte-15ln1c3\"></span></button>"), Va = /* @__PURE__ */ B("<button type=\"button\"> </button>"), Ha = /* @__PURE__ */ B("<div class=\"gp-group svelte-15ln1c3\"> </div> <button type=\"button\" class=\"ghost gp-upload svelte-15ln1c3\"> </button> <input type=\"file\" accept=\"image/*\" hidden=\"\"/> <p class=\"gp-hint svelte-15ln1c3\"> </p>", 1), Ua = /* @__PURE__ */ B("<div class=\"gp-pop svelte-15ln1c3\"><!> <!> <!> <!></div>"), Wa = /* @__PURE__ */ B("<span class=\"gp svelte-15ln1c3\"><button type=\"button\" class=\"gp-swatch svelte-15ln1c3\"><!></button> <!></span>");
function Ga(e, t) {
	Xe(t, !0);
	let n = Pi(t, "value", 3, "★"), r = Pi(t, "icon", 3, null), i = Pi(t, "image", 3, null), a = Pi(t, "label", 19, () => J("gp.pickGlyph")), o = /* @__PURE__ */ j(nn([])), s = /* @__PURE__ */ j(null), c = /* @__PURE__ */ j(null), l = /* @__PURE__ */ j(!1), u = /* @__PURE__ */ j(nn({
		top: 0,
		left: 0
	}));
	function d() {
		M(o, ka(), !0);
		let e = R(s).getBoundingClientRect(), t = Math.max(8, Math.min(e.right - 292, window.innerWidth - 292 - 8)), n = e.bottom + 380 + 8 > window.innerHeight ? Math.max(8, e.top - 380 - 8) : e.bottom + 6;
		M(u, {
			top: n,
			left: t
		}, !0), M(l, !0);
	}
	function f(e) {
		Aa(e), t.onpick?.(e), M(l, !1);
	}
	function p(e) {
		t.onicon?.(e), M(l, !1);
	}
	async function m(e) {
		let n = e.target.files?.[0];
		if (e.target.value = "", !n) return;
		let r = await _a(n, 256);
		t.onimage?.(r.dataUrl), M(l, !1);
	}
	Cn(() => {
		if (!R(l)) return;
		let e = (e) => {
			R(s) && !R(s).contains(e.target) && M(l, !1);
		}, t = (e) => {
			e.key === "Escape" && M(l, !1);
		}, n = (e) => {
			R(s) && e.target instanceof Node && !R(s).contains(e.target) && M(l, !1);
		};
		return document.addEventListener("pointerdown", e, !0), document.addEventListener("keydown", t, !0), document.addEventListener("scroll", n, !0), () => {
			document.removeEventListener("pointerdown", e, !0), document.removeEventListener("keydown", t, !0), document.removeEventListener("scroll", n, !0);
		};
	});
	var g = Wa(), _ = N(g), v = N(_), y = (e) => {
		var t = Ia();
		L((e) => {
			q(t, "src", i()), q(t, "alt", e);
		}, [() => J("gp.ownIcon")]), V(e, t);
	}, b = (e) => {
		var t = La();
		W(t, () => Fa(r()), !0), w(t), V(e, t);
	}, x = (e) => {
		var t = Fr();
		L(() => H(t, n() || "★")), V(e, t);
	};
	U(v, (e) => {
		i() ? e(y) : r() && Na[r()] ? e(b, 1) : e(x, -1);
	}), w(_);
	var S = I(_, 2), C = (e) => {
		var i = Ua(), a = N(i), s = (e) => {
			var t = za(), n = P(t), r = F(n, !0), i = I(n, 2);
			Zr(i, 20, () => R(o), (e) => e, (e, t) => {
				var n = Ra(), r = F(n, !0);
				L(() => H(r, t)), z("click", n, () => f(t)), V(e, n);
			}), w(i), L((e) => H(r, e), [() => J("common.recent")]), V(e, t);
		};
		U(a, (e) => {
			R(o).length && e(s);
		});
		var l = I(a, 2), d = (e) => {
			var t = Ir();
			Zr(P(t), 17, () => Pa, ([e, t]) => e, (e, t) => {
				var n = /* @__PURE__ */ O(() => h(R(t), 2));
				let i = () => R(n)[0], a = () => R(n)[1];
				var o = za(), s = P(o), c = F(s, !0), l = I(s, 2);
				Zr(l, 20, a, (e) => e, (e, t) => {
					var n = Ba();
					let i;
					var a = N(n);
					W(a, () => Fa(t), !0), w(a), w(n), L((e) => {
						i = vi(n, 1, "gp-cell gp-cell-icon svelte-15ln1c3", null, i, { active: t === r() }), q(n, "title", e);
					}, [() => J(Na[t].labelKey)]), z("click", n, () => p(t)), V(e, n);
				}), w(l), L((e) => H(c, e), [() => J(i())]), V(e, o);
			}), V(e, t);
		};
		U(l, (e) => {
			t.onicon && e(d);
		});
		var g = I(l, 2);
		Zr(g, 17, () => Da, ([e, t]) => e, (e, t) => {
			var r = /* @__PURE__ */ O(() => h(R(t), 2));
			let i = () => R(r)[0], a = () => R(r)[1];
			var o = za(), s = P(o), c = F(s, !0), l = I(s, 2);
			Zr(l, 20, () => a().split(" "), (e) => e, (e, t) => {
				var r = Va();
				let i;
				var a = F(r, !0);
				L(() => {
					i = vi(r, 1, "gp-cell svelte-15ln1c3", null, i, { active: t === n() }), H(a, t);
				}), z("click", r, () => f(t)), V(e, r);
			}), w(l), L((e) => H(c, e), [() => J(i())]), V(e, o);
		});
		var _ = I(g, 2), v = (e) => {
			var t = Ha(), n = P(t), r = F(n, !0), i = I(n, 2), a = F(i, !0), o = I(i, 2);
			Ni(o, (e) => M(c, e), () => R(c));
			var s = F(I(o, 2), !0);
			L((e, t, n) => {
				H(r, e), H(a, t), H(s, n);
			}, [
				() => J("gp.ownIcon"),
				() => J("gp.upload"),
				() => J("gp.uploadHint")
			]), z("click", i, () => R(c).click()), z("change", o, m), V(e, t);
		};
		U(_, (e) => {
			t.onimage && e(v);
		}), w(i), L(() => bi(i, `top: ${R(u).top ?? ""}px; left: ${R(u).left ?? ""}px`)), V(e, i);
	};
	U(S, (e) => {
		R(l) && e(C);
	}), w(g), Ni(g, (e) => M(s, e), () => R(s)), L(() => {
		q(_, "title", a()), q(_, "aria-label", a());
	}), z("click", _, () => R(l) ? M(l, !1) : d()), V(e, g), Ze();
}
Dr(["click", "change"]);
//#endregion
//#region src/lib/previewBridge.js
function Ka(e, t = {}) {
	let n = (e) => {
		if (e.origin !== location.origin) return;
		let n = e.data;
		n?.type === "urd-edit" && t.onEdit?.(n), n?.type === "urd-move" && t.onMove?.(n), n?.type === "urd-grow" && t.onGrow?.(n), n?.type === "urd-delete" && t.onDelete?.(n), n?.type === "urd-add-section" && t.onAddSection?.(n), n?.type === "urd-move-section" && t.onMoveSection?.(n), n?.type === "urd-delete-section" && t.onDeleteSection?.(n), n?.type === "urd-section-size" && t.onSectionSize?.(n), n?.type === "urd-undo" && t.onUndo?.(n), n?.type === "urd-select-section" && t.onSelectSection?.(n), n?.type === "urd-select-block" && t.onSelectBlock?.(n), n?.type === "urd-block-menu" && t.onBlockMenu?.(n), n?.type === "urd-plugin-blocks" && t.onPluginBlocks?.(n), n?.type === "urd-ready" && t.onReady?.(n), n?.type === "urd-navigate" && t.onNavigate?.(n), n?.type === "urd-add-block" && t.onAddBlock?.(n), n?.type === "urd-add-blocks" && t.onAddBlocks?.(n), n?.type === "urd-request-block" && t.onRequestBlock?.(n), n?.type === "urd-move-block-section" && t.onMoveBlockSection?.(n), n?.type === "urd-mobile-reset" && t.onMobileReset?.(n), n?.type === "urd-mobile-order" && t.onMobileOrder?.(n), n?.type === "urd-review-done" && t.onReviewDone?.(n), n?.type === "urd-block-flag" && t.onBlockFlag?.(n), n?.type === "urd-collection-edit" && t.onCollectionEdit?.(n), n?.type === "urd-collection-add" && t.onCollectionAdd?.(n), n?.type === "urd-nav-width" && t.onNavWidth?.(n), n?.type === "urd-save-template" && t.onSaveTemplate?.(n), n?.type === "urd-sticky-group" && t.onStickyGroup?.(n), n?.type === "urd-sticky-dock" && t.onStickyDock?.(n), n?.type === "urd-delete-template" && t.onDeleteTemplate?.(n), n?.type === "urd-apply-layout" && t.onApplyLayout?.(n);
	};
	window.addEventListener("message", n);
	let r = (t) => e.contentWindow?.postMessage(t, location.origin);
	return {
		sendSection(e, t) {
			r({
				type: "urd-preview",
				pageId: e,
				section: t
			});
		},
		sendPage(e, t) {
			r({
				type: "urd-preview-full",
				pageId: e,
				page: t
			});
		},
		sendSite(e) {
			r({
				type: "urd-site",
				site: e
			});
		},
		sendChrome(e) {
			r({
				type: "urd-chrome",
				visible: e
			});
		},
		sendPlugins(e) {
			r({
				type: "urd-plugins",
				enabled: e
			});
		},
		sendCollections(e) {
			r({
				type: "urd-collections",
				collections: e
			});
		},
		sendTemplates(e) {
			r({
				type: "urd-templates",
				templates: e
			});
		},
		sendInsertTemplate(e) {
			r({
				type: "urd-insert-template",
				id: e
			});
		},
		sendViewport(e) {
			r({
				type: "urd-viewport",
				mode: e
			});
		},
		sendZoom(e) {
			r({
				type: "urd-zoom",
				scale: e
			});
		},
		sendCloseMenus() {
			r({ type: "urd-close-menus" });
		},
		sendDuplicate() {
			r({ type: "urd-duplicate" });
		},
		sendShowGrid(e) {
			r({
				type: "urd-show-grid",
				visible: e
			});
		},
		sendShowGuides(e) {
			r({
				type: "urd-show-guides",
				visible: e
			});
		},
		sendAdminTheme(e) {
			r({
				type: "urd-admin-theme",
				colors: e
			});
		},
		sendSelect(e) {
			r({
				type: "urd-select",
				blockId: e
			});
		},
		sendPlaceBlock(e) {
			r({
				type: "urd-place-block",
				block: e
			});
		},
		sendAttention(e, t) {
			r({
				type: "urd-attention",
				sectionId: e,
				needed: t
			});
		},
		sendScrollSection(e) {
			r({
				type: "urd-scroll-section",
				sectionId: e
			});
		},
		sendDemoAnim(e, t = null) {
			r({
				type: "urd-demo-anim",
				sectionId: e,
				blockId: t
			});
		},
		sendOpenConfig(e) {
			r({
				type: "urd-open-block-config",
				blockId: e
			});
		},
		destroy() {
			window.removeEventListener("message", n);
		}
	};
}
//#endregion
//#region src/lib/preview-scale.js
function qa(e, t) {
	return !(e > 0) || !(t > 0) ? 1 : e / t;
}
function Ja(e, t, n, r = 0, i = 0) {
	if (n === "full") return 1;
	let a = i > 0 ? qa(r, i) : Infinity;
	return Math.max(.1, Math.min(1, qa(e, t), a));
}
//#endregion
//#region src/lib/deploy-wait.js
function Ya(e, { max: t = 8 } = {}) {
	let n = (e ?? []).filter((e) => e && typeof e.path == "string" && typeof e.content == "string" && e.encoding === "utf-8" && !e.delete && (e.path.startsWith("content/") || e.path === "plugins/plugins.json"));
	return n.sort((e, t) => (e.path === "content/site.json" ? -1 : 0) - (t.path === "content/site.json" ? -1 : 0)), n.slice(0, t).map(({ path: e, content: t }) => ({
		path: e,
		content: t
	}));
}
async function Xa(e, { fetchFn: t = fetch, delayMs: n = 1e4, attempts: r = 18, sleep: i = (e) => new Promise((t) => setTimeout(t, e)) } = {}) {
	let a = [...e];
	if (a.length === 0) return !0;
	for (let e = 0; e < r; e++) {
		await i(n);
		let e = await Promise.all(a.map(async ({ path: e }) => {
			try {
				let n = await t(`/${e}`, { cache: "no-store" });
				return n.ok ? await n.text() : null;
			} catch {
				return null;
			}
		}));
		if (a = a.filter((t, n) => e[n] !== t.content), a.length === 0) return !0;
	}
	return !1;
}
var Za = 3840, Qa = 2400, $a = (e, t, n) => Math.min(n, Math.max(t, e));
function eo({ screenWidth: e = 0, availWidth: t = 0, outerWidth: n = 0, innerWidth: r = 0 } = {}) {
	let i = t > 0 && n > 0 && n >= t - 2 && r > 0 ? r : e > 0 ? e : r;
	return Math.max(1, Math.round(i > 0 ? i : 1));
}
function to(e) {
	return !e || !e.screen ? null : eo({
		screenWidth: e.screen.width,
		availWidth: e.screen.availWidth,
		outerWidth: e.outerWidth,
		innerWidth: e.innerWidth
	});
}
function no(e, t) {
	let n = e && typeof e == "object" && !Array.isArray(e) ? e : {}, r = n.mode === "custom" ? "custom" : "own", i = Number(n.width), a = $a(Number.isFinite(i) && i > 0 ? i : t, 640, Za), o = Number(n.height), s = Number.isFinite(o) && o > 0 ? $a(o, 480, Qa) : 0;
	return {
		mode: r,
		width: Math.round(a),
		height: Math.round(s)
	};
}
function ro(e, t) {
	return e?.mode === "custom" ? {
		width: e.width,
		height: e.height || 0
	} : {
		width: t,
		height: 0
	};
}
var io = 1920, ao = [
	{
		id: "none",
		gutter: 0
	},
	{
		id: "small",
		gutter: 3
	},
	{
		id: "medium",
		gutter: 6
	},
	{
		id: "large",
		gutter: 9
	}
], oo = [
	{
		id: "compact",
		width: 1200
	},
	{
		id: "standard",
		width: 1440
	},
	{
		id: "wide",
		width: 1600
	},
	{
		id: "full",
		width: "full"
	}
], so = [
	1920,
	1536,
	1366
];
function co(e) {
	let t = Number(e);
	if (!Number.isFinite(t)) return 1440;
	let n = Math.round(t / 20) * 20;
	return Math.min(io, Math.max(960, n));
}
function lo(e) {
	let t = Number(e);
	if (!Number.isFinite(t)) return 6;
	let n = Math.round(t / 1) * 1;
	return Math.min(12, Math.max(0, n));
}
function uo(e, t) {
	if (e === "full") return 0;
	let n = Math.min(49, Math.max(0, Number(t) || 0));
	return Math.ceil(Number(e) / (1 - 2 * n / 100));
}
function fo(e, t, n) {
	let r = Math.max(0, Number(t) || 0) / 100 * n, i = Math.max(0, n - 2 * r), a = e !== "full" && Number(e) < i, o = a ? Number(e) : i;
	return {
		width: o,
		margin: Math.round((n - o) / 2),
		pct: n > 0 ? o / n * 100 : 0,
		bound: a
	};
}
function po(e) {
	return oo.find((t) => t.width === e)?.id ?? null;
}
//#endregion
//#region src/lib/Dropdown.svelte
var mo = /* @__PURE__ */ B("<button type=\"button\"> </button>"), ho = /* @__PURE__ */ B("<div class=\"dd-pop svelte-vtocc6\"></div>"), go = /* @__PURE__ */ B("<span class=\"dd svelte-vtocc6\"><button type=\"button\" class=\"dd-btn svelte-vtocc6\"><span class=\"dd-value svelte-vtocc6\"> </span> <span class=\"dd-caret svelte-vtocc6\"> </span></button> <!></span>");
function Y(e, t) {
	Xe(t, !0);
	let n = Pi(t, "value", 3, null), r = Pi(t, "options", 19, () => []), i = Pi(t, "title", 3, null), a = Pi(t, "disabled", 3, !1), o = /* @__PURE__ */ j(!1), s = /* @__PURE__ */ j(null), c = /* @__PURE__ */ j(nn({
		top: 0,
		left: 0,
		width: 160
	})), l = () => r().find(([e]) => `${e ?? ""}` == `${n() ?? ""}`)?.[1] ?? "";
	function u() {
		let e = R(s).getBoundingClientRect(), t = Math.min(320, r().length * 32 + 12), n = Math.max(e.width, 160), i = e.bottom + t + 8 <= window.innerHeight;
		M(c, {
			top: i ? e.bottom + 4 : Math.max(8, e.top - t - 4),
			left: Math.max(8, Math.min(e.left, window.innerWidth - n - 8)),
			width: n
		}, !0);
	}
	function d() {
		if (!a()) {
			if (R(o)) {
				M(o, !1);
				return;
			}
			u(), M(o, !0);
		}
	}
	function f(e) {
		M(o, !1), t.onchange?.(e);
	}
	Cn(() => {
		if (!R(o)) return;
		let e = (e) => {
			R(s) && !R(s).contains(e.target) && M(o, !1);
		}, t = (e) => {
			e.key === "Escape" && M(o, !1);
		}, n = (e) => {
			R(s) && e.target instanceof Node && !R(s).contains(e.target) && u();
		};
		return document.addEventListener("pointerdown", e, !0), document.addEventListener("keydown", t, !0), document.addEventListener("scroll", n, !0), () => {
			document.removeEventListener("pointerdown", e, !0), document.removeEventListener("keydown", t, !0), document.removeEventListener("scroll", n, !0);
		};
	});
	var p = go(), m = N(p), g = N(m), _ = F(g, !0), v = F(I(g, 2), !0);
	w(m);
	var y = I(m, 2), b = (e) => {
		var t = ho();
		Zr(t, 21, r, ([e, t]) => `${e ?? ""}`, (e, t) => {
			var r = /* @__PURE__ */ O(() => h(R(t), 2));
			let i = () => R(r)[0], a = () => R(r)[1];
			var o = mo();
			let s;
			var c = F(o, !0);
			L(() => {
				s = vi(o, 1, "dd-opt svelte-vtocc6", null, s, { selected: `${i() ?? ""}` == `${n() ?? ""}` }), H(c, a());
			}), z("click", o, () => f(i())), V(e, o);
		}), w(t), L(() => bi(t, `top: ${R(c).top ?? ""}px; left: ${R(c).left ?? ""}px; min-width: ${R(c).width ?? ""}px`)), V(e, t);
	};
	U(y, (e) => {
		R(o) && e(b);
	}), w(p), Ni(p, (e) => M(s, e), () => R(s)), L((e) => {
		q(m, "title", i()), m.disabled = a(), H(_, e), H(v, R(o) ? "▴" : "▾");
	}, [() => l()]), z("click", m, d), V(e, p), Ze();
}
Dr(["click"]);
//#endregion
//#region src/lib/IconEditor.svelte
var _o = /* @__PURE__ */ B("<div class=\"ie-overlay svelte-e7sog7\" role=\"dialog\" aria-modal=\"true\"><div class=\"ie-card svelte-e7sog7\"><h2 class=\"svelte-e7sog7\"> </h2> <div class=\"ie-stage svelte-e7sog7\"><canvas class=\"ie-canvas svelte-e7sog7\"></canvas> <p class=\"ie-hint svelte-e7sog7\"> </p></div> <label class=\"ie-row svelte-e7sog7\"> <span class=\"ie-val svelte-e7sog7\"> </span></label> <input type=\"range\" min=\"1\" max=\"3\" step=\"0.02\" class=\"svelte-e7sog7\"/> <label class=\"ie-row svelte-e7sog7\"> <span class=\"ie-val svelte-e7sog7\"> </span></label> <input type=\"range\" min=\"0.3\" max=\"2\" step=\"0.02\" class=\"svelte-e7sog7\"/> <label class=\"ie-row svelte-e7sog7\"> <span class=\"ie-val svelte-e7sog7\"> </span></label> <input type=\"range\" min=\"0.3\" max=\"2\" step=\"0.02\" class=\"svelte-e7sog7\"/> <label class=\"ie-row svelte-e7sog7\"> <span class=\"ie-val svelte-e7sog7\"> </span></label> <input type=\"range\" min=\"0\" max=\"2\" step=\"0.02\" class=\"svelte-e7sog7\"/> <span class=\"ie-tools svelte-e7sog7\"><button type=\"button\" class=\"ghost svelte-e7sog7\"> </button> <button type=\"button\" class=\"ghost svelte-e7sog7\"> </button></span> <span class=\"ie-actions svelte-e7sog7\"><button type=\"button\" class=\"ghost svelte-e7sog7\"> </button> <button type=\"button\" class=\"primary svelte-e7sog7\"> </button></span></div></div>");
function vo(e, t) {
	Xe(t, !0);
	let n = Pi(t, "image", 3, ""), r = /* @__PURE__ */ j(null), i = /* @__PURE__ */ j(null), a = /* @__PURE__ */ j(1), o = /* @__PURE__ */ j(.5), s = /* @__PURE__ */ j(.5), c = /* @__PURE__ */ j(1), l = /* @__PURE__ */ j(1), u = /* @__PURE__ */ j(1);
	Cn(() => {
		if (!n()) return;
		let e = new Image();
		e.onload = () => {
			M(i, e, !0);
		}, e.src = n();
	});
	function d(e, t) {
		if (e.clearRect(0, 0, t, t), !R(i)) return;
		e.filter = `brightness(${R(c)}) contrast(${R(l)}) saturate(${R(u)})`;
		let n = Math.max(t / R(i).width, t / R(i).height) * R(a), r = R(i).width * n, d = R(i).height * n, f = t / 2 - R(o) * r, p = t / 2 - R(s) * d;
		f = Math.min(0, Math.max(t - r, f)), p = Math.min(0, Math.max(t - d, p)), e.drawImage(R(i), f, p, r, d), e.filter = "none";
	}
	Cn(() => {
		R(i), R(a), R(o), R(s), R(c), R(l), R(u), R(r) && d(R(r).getContext("2d"), 220);
	});
	function f(e) {
		if (!R(i)) return;
		e.preventDefault();
		let t = e.clientX, n = e.clientY, r = Math.max(220 / R(i).width, 220 / R(i).height) * R(a), c = R(i).width * r, l = R(i).height * r, u = (e) => {
			M(o, Math.min(1, Math.max(0, R(o) - (e.clientX - t) / c)), !0), M(s, Math.min(1, Math.max(0, R(s) - (e.clientY - n) / l)), !0), t = e.clientX, n = e.clientY;
		}, d = () => {
			window.removeEventListener("pointermove", u), window.removeEventListener("pointerup", d);
		};
		window.addEventListener("pointermove", u), window.addEventListener("pointerup", d);
	}
	function p() {
		M(a, 1), M(o, .5), M(s, .5), M(c, 1), M(l, 1), M(u, 1);
	}
	function m() {
		let e = document.createElement("canvas");
		e.width = 128, e.height = 128, d(e.getContext("2d"), 128), t.onapply?.(e.toDataURL("image/webp", .92));
	}
	var h = _o(), g = N(h), _ = N(g), v = F(_, !0), y = I(_, 2), b = N(y);
	q(b, "width", 220), q(b, "height", 220), Ni(b, (e) => M(r, e), () => R(r));
	var x = F(I(b, 2), !0);
	w(y);
	var S = I(y, 2), C = N(S), ee = F(I(C));
	w(S);
	var te = I(S, 2);
	G(te);
	var ne = I(te, 2), re = N(ne), ie = F(I(re));
	w(ne);
	var ae = I(ne, 2);
	G(ae);
	var oe = I(ae, 2), se = N(oe), ce = F(I(se));
	w(oe);
	var le = I(oe, 2);
	G(le);
	var ue = I(le, 2), de = N(ue), fe = F(I(de));
	w(ue);
	var pe = I(ue, 2);
	G(pe);
	var me = I(pe, 2), he = N(me), ge = F(he, !0), _e = I(he, 2), ve = F(_e, !0);
	w(me);
	var ye = I(me, 2), be = N(ye), xe = F(be, !0), Se = I(be, 2), Ce = F(Se, !0);
	w(ye), w(g), w(h), L((e, t, n, r, i, a, o, s, c, l, u, d, f, p, m) => {
		H(v, e), q(b, "title", t), H(x, n), H(C, `${r ?? ""} `), H(ee, `${i ?? ""}x`), H(re, `${a ?? ""} `), H(ie, `${o ?? ""}%`), H(se, `${s ?? ""} `), H(ce, `${c ?? ""}%`), H(de, `${l ?? ""} `), H(fe, `${u ?? ""}%`), H(ge, d), H(ve, f), H(xe, p), H(Ce, m);
	}, [
		() => J("ie.title"),
		() => J("ie.dragTip"),
		() => J("ie.hint"),
		() => J("lbl.zoom"),
		() => R(a).toFixed(2),
		() => J("lbl.brightness"),
		() => Math.round(R(c) * 100),
		() => J("lbl.contrast"),
		() => Math.round(R(l) * 100),
		() => J("lbl.saturate"),
		() => Math.round(R(u) * 100),
		() => J("ie.grayscale"),
		() => J("common.reset"),
		() => J("confirm.cancel"),
		() => J("common.apply")
	]), z("pointerdown", b, f), ki(te, () => R(a), (e) => M(a, e)), ki(ae, () => R(c), (e) => M(c, e)), ki(le, () => R(l), (e) => M(l, e)), ki(pe, () => R(u), (e) => M(u, e)), z("click", he, () => M(u, 0)), z("click", _e, p), z("click", be, () => t.oncancel?.()), z("click", Se, m), V(e, h), Ze();
}
Dr(["pointerdown", "click"]);
var yo = 24, bo = {
	"oppsett-byttet": "layout-changed",
	"blokk-endret": "block-edited",
	"desktop-endret-etter-mobil": "desktop-changed-after-mobile",
	seksjonshøyde: "section-height",
	"blokk-flyttet": "block-moved",
	"blokk-slettet": "block-deleted",
	"blokk-lagt-til": "block-added"
};
function xo(e, t) {
	if (!e || !("y" in e || "h" in e)) return e ?? null;
	if (t && e.x === t.x && e.y === t.y && e.w === t.w && e.h === t.h) return null;
	let n = {
		x: e.x,
		w: e.w
	};
	return Number.isFinite(e.y) && (n.row = Math.max(1, Math.round((e.y - yo) / 8) + 1), n.rows = Number.isFinite(e.h) ? Math.max(1, Math.ceil(e.h / 8)) : 1), Number.isFinite(e.z) && e.z !== 1 && (n.z = e.z), e.rot && (n.rot = e.rot), n;
}
var So = {
	samling: "collection",
	galleri: "gallery",
	tidslinje: "timeline",
	sitat: "quote",
	statistikk: "stats",
	tabell: "table",
	deling: "share",
	nedteller: "countdown",
	produkt: "product",
	handlekurv: "cart",
	kasse: "checkout"
}, Co = { bildegalleri: "slideshow" }, wo = {
	flate: "surface",
	aksent: "accent",
	invers: "inverse",
	dus: "soft",
	dempet: "muted",
	dyp: "deep",
	uthevet: "highlighted"
}, To = {
	tom: "blank",
	"hero-sentrert": "hero-centered",
	bilder: "images",
	galleri: "gallery",
	kontakt: "contact",
	funksjonskort: "feature-cards",
	"funksjonskort-enkel": "feature-cards-simple",
	nyheter: "news",
	"nyheter-samling": "news-collection",
	oppslagstavle: "noticeboard",
	publikasjonsarkiv: "publication-archive",
	arrangementer: "events",
	tidslinje: "timeline",
	steg: "steps",
	hovedoppslag: "lead-story",
	produkter: "products",
	butikk: "shop",
	"butikk-hero": "shop-hero",
	"butikk-kategorier": "shop-categories",
	"butikk-tillit": "shop-trust",
	"butikk-utstilling": "shop-showcase",
	kasse: "checkout",
	sitat: "quote",
	statistikk: "stats",
	sponsorer: "sponsors",
	medlemskap: "membership"
};
function Eo(e) {
	let t = Array.isArray(e) ? e : e.blocks ?? [];
	for (let e of t) So[e.type] && (e.type = So[e.type]);
	if (!Array.isArray(e)) {
		for (let t of e.background?.layers ?? []) Co[t.type] && (t.type = Co[t.type]);
		wo[e.theme] && (e.theme = wo[e.theme]), To[e.preset] && (e.preset = To[e.preset]);
	}
	return e;
}
var Do = {
	1: (e) => {
		for (let t of e.sections ?? []) {
			let e = t.responsive?.mobile;
			for (let e of t.blocks ?? []) e.decor && (e.hideMobile = !0), e.frames?.mobile && (e.frames.mobile = xo(e.frames.mobile, e.frames.desktop));
			e?.mode === "manual" && (e.mode = "auto");
			let n = e?.attention?.reason;
			n && bo[n] && (e.attention.reason = bo[n]);
		}
		return e;
	},
	2: (e) => {
		for (let t of e.sections ?? []) Eo(t);
		return e;
	},
	3: (e) => {
		for (let t of e.sections ?? []) Eo(t);
		return e;
	}
}, Oo = {
	1: (e) => ({
		...e,
		layout: e.layout ?? {
			contentWidth: 1440,
			gutter: 6
		}
	}),
	2: (e) => ({
		...e,
		layout: {
			...e.layout ?? { contentWidth: 1440 },
			gutter: 6
		}
	})
};
function ko(e) {
	let t = structuredClone(e), n = t.schemaVersion ?? 1;
	for (; n < 3;) {
		let r = Oo[n];
		if (typeof r != "function") return e;
		t = r(t) ?? t, n++, t.schemaVersion = n;
	}
	return t;
}
function Ao(e, t) {
	let n = structuredClone(e), r = n.schemaVersion ?? 1;
	for (; r < 4;) {
		let i = Do[r];
		if (typeof i != "function") return e;
		n = i(n, t) ?? n, r++, n.schemaVersion = r;
	}
	return n;
}
//#endregion
//#region ../template/assets/engine/0.7.2/plugins.js
function jo(e) {
	let t = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(e).trim());
	return t ? [
		Number(t[1]),
		Number(t[2]),
		Number(t[3])
	] : null;
}
var Mo = (e, t) => e[0] - t[0] || e[1] - t[1] || e[2] - t[2];
function No(e, t) {
	let n = jo(e);
	if (!n || typeof t != "string" || !t.trim()) return !1;
	for (let e of t.trim().split(/\s+/)) {
		let t = /^(>=|<=|>|<|=|\^|~)?(\d+\.\d+\.\d+)$/.exec(e);
		if (!t) return !1;
		let r = t[1] ?? "=", i = jo(t[2]), a = Mo(n, i);
		if (!(r === ">=" ? a >= 0 : r === ">" ? a > 0 : r === "<=" ? a <= 0 : r === "<" ? a < 0 : r === "^" ? i[0] === 0 ? n[0] === 0 && n[1] === i[1] && a >= 0 : n[0] === i[0] && a >= 0 : r === "~" ? n[0] === i[0] && n[1] === i[1] && a >= 0 : a === 0)) return !1;
	}
	return !0;
}
var Po = /^[a-z0-9][a-z0-9-]*$/;
function Fo(e) {
	let t = [];
	if (!e || typeof e != "object") return ["the manifest is not an object"];
	Po.test(e.id ?? "") || t.push("id is missing or invalid"), (typeof e.name != "string" || !e.name) && t.push("name is missing"), jo(e.version ?? "") || t.push("version is not semver"), (typeof e.requiresEngine != "string" || !e.requiresEngine) && t.push("requiresEngine is missing");
	let n = Array.isArray(e.languages) && e.languages.length > 0;
	return (e.entry !== void 0 || !n) && (typeof e.entry != "string" || !e.entry.endsWith(".js")) && t.push("entry is missing or is not a .js file"), (e.provides !== void 0 || !n) && (!e.provides || typeof e.provides != "object") && t.push("provides is missing"), e.languages !== void 0 && t.push(...Vi(e.languages)), e.locales !== void 0 && typeof e.locales != "boolean" && t.push("locales must be a boolean"), e.names !== void 0 && (typeof e.names != "object" || e.names === null || Array.isArray(e.names) || Object.values(e.names).some((e) => typeof e != "string" || !e)) && t.push("names must be an object mapping language code to name"), t;
}
Promise.resolve();
//#endregion
//#region ../template/assets/engine/0.7.2/sections/presets.js
function Io(e) {
	return typeof crypto < "u" && crypto.randomUUID ? `${e}-${crypto.randomUUID().slice(0, 8)}` : `${e}-${[...crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(4))].map((e) => e.toString(16).padStart(2, "0")).join("")}`;
}
var Lo = () => ({ mobile: {
	mode: "auto",
	attention: null
} }), X = (e, t, n, r, i = 1) => ({
	desktop: {
		x: e,
		y: t,
		w: n,
		h: r,
		z: i,
		rot: 0
	},
	mobile: null
}), Z = (e, t, n = {}) => ({
	id: Io("blk"),
	type: "text",
	version: 1,
	props: {
		html: t,
		align: "left",
		box: !1,
		...n
	},
	animation: null,
	frames: e
}), Ro = (e, t = {}) => ({
	id: Io("blk"),
	type: "image",
	version: 1,
	props: {
		src: "",
		alt: J("seed.imageAlt"),
		fit: "cover",
		radius: "md",
		href: null,
		...t
	},
	animation: null,
	frames: e
}), zo = (e, t, n = {}) => ({
	id: Io("blk"),
	type: "button",
	version: 1,
	props: {
		label: t,
		page: null,
		href: "#",
		style: "primary",
		...n
	},
	animation: null,
	frames: e
}), Bo = (e, t, n = 40) => ({
	id: Io("blk"),
	type: "icon",
	version: 1,
	props: {
		glyph: t,
		color: "accent",
		size: n
	},
	animation: null,
	frames: e
}), Vo = () => ({
	type: "hover-lift",
	version: 1,
	props: {}
}), Ho = (e, t, n = {}) => ({
	id: Io("blk"),
	type: "collection",
	version: 1,
	props: {
		collection: null,
		view: t,
		limit: 6,
		newestFirst: !0,
		...n
	},
	animation: null,
	frames: e
}), Uo = (e, t = {}) => ({
	id: Io("blk"),
	type: "product",
	version: 1,
	props: {
		collection: null,
		limit: 0,
		columns: 0,
		currency: "kr",
		...t
	},
	animation: null,
	frames: e
}), Wo = (e, t = {}) => ({
	id: Io("blk"),
	type: "cart",
	version: 1,
	props: {
		variant: "button",
		href: "",
		currency: "kr",
		...t
	},
	animation: null,
	frames: e
}), Go = (e, t = {}) => ({
	id: Io("blk"),
	type: "checkout",
	version: 1,
	props: {
		recipient: "",
		endpoint: "",
		vipps: "",
		currency: "kr",
		...t
	},
	animation: null,
	frames: e
}), Ko = (e, t = {}) => ({
	id: Io("blk"),
	type: "gallery",
	version: 1,
	props: {
		images: [],
		view: "grid",
		columns: 3,
		gap: 12,
		radius: "md",
		lightbox: !0,
		interval: 5,
		...t
	},
	animation: null,
	frames: e
}), qo = (e, t) => ({
	id: Io("blk"),
	type: "faq",
	version: 1,
	props: {
		items: t,
		multi: !1
	},
	animation: null,
	frames: e
}), Jo = (e, t = {}) => ({
	id: Io("blk"),
	type: "quote",
	version: 1,
	props: {
		text: "",
		attribution: "",
		role: "",
		variant: "large",
		image: "",
		accent: null,
		...t
	},
	animation: null,
	frames: e
}), Yo = (e, t) => ({
	id: Io("blk"),
	type: "timeline",
	version: 1,
	props: {
		items: t,
		variant: "left",
		marker: "filled",
		accent: null
	},
	animation: null,
	frames: e
}), Xo = (e, t = {}) => ({
	id: Io("blk"),
	type: "stats",
	version: 1,
	props: {
		value: "4800",
		prefix: "",
		suffix: "",
		label: "",
		countUp: !0,
		...t
	},
	animation: null,
	frames: e
}), Zo = (...e) => ({
	version: 1,
	layers: e
}), Qo = (e) => ({
	type: "color",
	version: 1,
	props: { value: e }
}), $o = (e, t, n, r = .5) => ({
	type: "glow",
	version: 1,
	props: {
		x: e,
		y: t,
		color: "accent",
		radius: r,
		opacity: n
	}
}), es = (e) => Math.max(0, ...e.blocks.map((e) => e.frames.desktop.y + e.frames.desktop.h)), ts = (e, t, n, r, i, a) => ({
	x: n + e % t * r,
	y: i + Math.floor(e / t) * a
}), ns = (e, t, n, r, i, a, o, s, c = 0) => {
	let l = (t) => e.blocks.some((e) => {
		let n = e.frames.desktop;
		return n.x < t.x + t.w - .01 && t.x < n.x + n.w - .01 && n.y < t.y + t.h - .01 && t.y < n.y + n.h - .01;
	});
	for (let e = 0; e < 60; e++) {
		let u = ts(e, t, n, r, i, a);
		if (!l({
			x: u.x,
			y: u.y + c,
			w: o,
			h: s
		})) return {
			...u,
			n: e
		};
	}
	return {
		x: n,
		y: es(e) + 16,
		n: 0
	};
}, rs = (e, t, n) => e + t * .1 + n * .01, is = (e, t, n, r, i = null) => ({
	id: Io("sec"),
	version: 1,
	preset: e,
	size: { minHeight: t },
	grid: i,
	background: n,
	blocks: r,
	responsive: Lo()
});
function as(e) {
	e.sections.define("blank", {
		label: "Empty section",
		labelKey: "preset.blank.label",
		group: "Basics",
		groupKey: "presetGroup.basic",
		hint: "A blank canvas to build on freely",
		hintKey: "preset.blank.hint",
		create: () => is("blank", "40vh", Zo(Qo("bg")), [])
	}), e.sections.define("hero", {
		label: "Hero",
		labelKey: "preset.hero.label",
		group: "Basics",
		groupKey: "presetGroup.basic",
		hint: "Large opening with gradient and glow, left-aligned",
		hintKey: "preset.hero.hint",
		create: () => is("hero", "70vh", {
			version: 1,
			layers: [
				{
					type: "gradient",
					version: 1,
					props: {
						stops: ["#0b0e14", "#1a1030"],
						angle: 160,
						animate: !1
					}
				},
				$o(.7, .2, .35),
				{
					type: "grain",
					version: 1,
					props: { opacity: .06 }
				}
			]
		}, [
			Z(X(8.33, 40, 50, 38), J("seed.hero.title")),
			Z(X(8.33, 84, 41.67, 26), J("seed.hero.intro")),
			zo(X(8.33, 118, 20, 32), J("seed.readMore"))
		])
	}), e.sections.define("hero-centered", {
		label: "Hero, centred",
		labelKey: "preset.hero-centered.label",
		group: "Basics",
		groupKey: "presetGroup.basic",
		hint: "Centred opening with two buttons",
		hintKey: "preset.hero-centered.hint",
		create: () => is("hero-centered", "60vh", Zo(Qo("bg")), [
			Z(X(15, 64, 70, 44), J("seed.heroCenter.title"), { align: "center" }),
			Z(X(25, 116, 50, 26), J("seed.heroCenter.intro"), { align: "center" }),
			zo(X(31.5, 160, 17, 40), J("seed.join")),
			zo(X(51.5, 160, 17, 40), J("seed.readMore"), { style: "secondary" })
		])
	}), e.sections.define("images", {
		label: "Images",
		labelKey: "preset.images.label",
		group: "Basics",
		groupKey: "presetGroup.basic",
		hint: "Title and three image frames",
		hintKey: "preset.images.hint",
		create: () => is("images", "360px", Zo(Qo("bg")), [
			Z(X(4, 24, 50, 32), J("seed.images.title")),
			Ro(X(4, 72, 28, 220)),
			Ro(X(36, 72, 28, 220)),
			Ro(X(68, 72, 28, 220))
		]),
		itemLabel: "image",
		itemLabelKey: "item.image",
		item: (e) => {
			let { x: t, y: n } = ns(e, 3, 4, 32, 72, 244, 28, 220);
			return {
				blocks: [Ro(X(t, n, 28, 220))],
				bottom: n + 244
			};
		}
	}), e.sections.define("gallery", {
		label: "Gallery",
		labelKey: "preset.gallery.label",
		group: "Basics",
		groupKey: "presetGroup.basic",
		hint: "Image gallery in a grid with full-screen view (lightbox)",
		hintKey: "preset.gallery.hint",
		create: () => is("gallery", "440px", Zo(Qo("bg")), [Z(X(4, 24, 50, 32), J("seed.gallery.title")), Ko(X(4, 72, 92, 320))])
	}), e.sections.define("contact", {
		label: "Contact",
		labelKey: "preset.contact.label",
		group: "Basics",
		groupKey: "presetGroup.basic",
		hint: "Contact details in a card with an email button",
		hintKey: "preset.contact.hint",
		create: () => is("contact", "320px", Zo(Qo("surface"), $o(.2, .8, .2)), [
			Z(X(10, 32, 40, 36), J("seed.contact.title")),
			Z(X(10, 84, 36, 130), J("seed.contact.info"), { box: !0 }),
			zo(X(60, 100, 22, 40), J("seed.contact.button"), { href: `mailto:${J("seed.email")}` })
		])
	}), e.sections.define("feature-cards", {
		label: "Feature cards",
		labelKey: "preset.feature-cards.label",
		group: "Cards and lists",
		groupKey: "presetGroup.cards",
		hint: "Three cards with icon, title and text",
		hintKey: "preset.feature-cards.hint",
		create: () => {
			let e = (e, t, n, r) => {
				let i = Bo(X(e + 10.5, 88, 4, 52), n), a = Z(X(e, 152, 25, 200), J("seed.features.card", { title: r }), {
					align: "center",
					box: !0
				});
				return a.animation = Vo(), i.mobileOrder = rs(88, t, 0), a.mobileOrder = rs(88, t, 1), [i, a];
			};
			return is("feature-cards", "420px", Zo(Qo("bg")), [
				Z(X(6, 28, 60, 38), J("seed.features.title")),
				...e(6, 0, "✦", J("seed.features.card1")),
				...e(37.5, 1, "★", J("seed.features.card2")),
				...e(69, 2, "✓", J("seed.features.card3"))
			]);
		},
		itemLabel: "card",
		itemLabelKey: "item.card",
		item: (e) => {
			let { x: t, y: n, n: r } = ns(e, 3, 6, 31.5, 152, 296, 25, 264, -64), i = Bo(X(t + 10.5, n - 64, 4, 52), "✦"), a = Z(X(t, n, 25, 200), J("seed.features.card", { title: J("seed.features.newTitle") }), {
				align: "center",
				box: !0
			});
			return a.animation = Vo(), i.mobileOrder = rs(88, r, 0), a.mobileOrder = rs(88, r, 1), {
				blocks: [i, a],
				bottom: n + 228
			};
		}
	}), e.sections.define("feature-cards-simple", {
		label: "Feature cards without icons",
		labelKey: "preset.feature-cards-simple.label",
		group: "Cards and lists",
		groupKey: "presetGroup.cards",
		hint: "Three cards with title and text (without the icons above)",
		hintKey: "preset.feature-cards-simple.hint",
		create: () => {
			let e = (e, t, n) => {
				let r = Z(X(e, 88, 25, 200), J("seed.features.card", { title: n }), {
					align: "center",
					box: !0
				});
				return r.animation = Vo(), r.mobileOrder = rs(88, t, 0), r;
			};
			return is("feature-cards-simple", "360px", Zo(Qo("bg")), [
				Z(X(6, 28, 60, 38), J("seed.features.title")),
				e(6, 0, J("seed.features.card1")),
				e(37.5, 1, J("seed.features.card2")),
				e(69, 2, J("seed.features.card3"))
			]);
		},
		itemLabel: "card",
		itemLabelKey: "item.card",
		item: (e) => {
			let { x: t, y: n, n: r } = ns(e, 3, 6, 31.5, 88, 232, 25, 200), i = Z(X(t, n, 25, 200), J("seed.features.card", { title: J("seed.features.newTitle") }), {
				align: "center",
				box: !0
			});
			return i.animation = Vo(), i.mobileOrder = rs(88, r, 0), {
				blocks: [i],
				bottom: n + 228
			};
		}
	}), e.sections.define("news", {
		label: "News",
		labelKey: "preset.news.label",
		group: "Cards and lists",
		groupKey: "presetGroup.cards",
		hint: "Three news cards with image, tag and date",
		hintKey: "preset.news.hint",
		create: () => {
			let e = (e, t) => {
				let n = Ro(X(e, 88, 25, 160)), r = Z(X(e, 256, 25, 160), J("seed.news.card"));
				return n.mobileOrder = rs(88, t, 0), r.mobileOrder = rs(88, t, 1), [n, r];
			};
			return is("news", "460px", Zo(Qo("bg")), [
				Z(X(6, 28, 50, 38), J("seed.news.title")),
				zo(X(78, 30, 16, 36), J("seed.news.seeAll"), { style: "secondary" }),
				...e(6, 0),
				...e(37.5, 1),
				...e(69, 2)
			]);
		},
		itemLabel: "story",
		itemLabelKey: "item.story",
		item: (e) => {
			let { x: t, y: n, n: r } = ns(e, 3, 6, 31.5, 88, 344, 25, 328), i = Ro(X(t, n, 25, 160)), a = Z(X(t, n + 168, 25, 160), J("seed.news.card"));
			return i.mobileOrder = rs(88, r, 0), a.mobileOrder = rs(88, r, 1), {
				blocks: [i, a],
				bottom: n + 352
			};
		}
	}), e.sections.define("news-collection", {
		label: "News (collection)",
		labelKey: "preset.news-collection.label",
		group: "Cards and lists",
		groupKey: "presetGroup.cards",
		hint: "News cards from a collection: write entries, the cards follow",
		hintKey: "preset.news-collection.hint",
		create: () => is("news-collection", "300px", Zo(Qo("bg")), [Z(X(6, 28, 50, 38), J("seed.news.title")), Ho(X(6, 88, 88, 180), "cards")])
	}), e.sections.define("noticeboard", {
		label: "Noticeboard",
		labelKey: "preset.noticeboard.label",
		group: "Cards and lists",
		groupKey: "presetGroup.cards",
		hint: "Dated list from a collection (notices/announcements)",
		hintKey: "preset.noticeboard.hint",
		create: () => is("noticeboard", "300px", Zo(Qo("surface")), [Z(X(6, 28, 50, 38), J("seed.noticeboard.title")), Ho(X(6, 88, 88, 180), "list", { limit: 8 })])
	}), e.sections.define("publication-archive", {
		label: "Publication archive",
		labelKey: "preset.publication-archive.label",
		group: "Cards and lists",
		groupKey: "presetGroup.cards",
		hint: "Year-grouped archive from a collection (issues, minutes, reports)",
		hintKey: "preset.publication-archive.hint",
		create: () => is("publication-archive", "300px", Zo(Qo("bg")), [Z(X(6, 28, 60, 38), J("seed.archive.title")), Ho(X(6, 88, 88, 180), "archive", { limit: 0 })])
	}), e.sections.define("events", {
		label: "Events",
		labelKey: "preset.events.label",
		group: "Cards and lists",
		groupKey: "presetGroup.cards",
		hint: "Three rows with date badge and sign-up button",
		hintKey: "preset.events.hint",
		create: () => {
			let e = (e, t, n, r) => [
				Z(X(6, e, 8, 88), J("seed.events.dateBadge", {
					day: t,
					month: n
				}), {
					align: "center",
					box: !0
				}),
				Z(X(16, e, 58, 88), J("seed.events.row", { title: r })),
				zo(X(78, e + 24, 16, 40), J("seed.events.signup"), { style: "secondary" })
			];
			return is("events", "440px", Zo(Qo("surface")), [
				Z(X(6, 28, 50, 38), J("seed.events.title")),
				...e(88, "11", J("seed.events.monthAug"), J("seed.events.row1")),
				...e(196, "25", J("seed.events.monthAug"), J("seed.events.row2")),
				...e(304, "8", J("seed.events.monthSep"), J("seed.events.row3"))
			]);
		},
		itemLabel: "row",
		itemLabelKey: "item.row",
		item: (e) => {
			let t = es(e) + 16;
			return {
				blocks: [
					Z(X(6, t, 8, 88), J("seed.events.newBadge"), {
						align: "center",
						box: !0
					}),
					Z(X(16, t, 58, 88), J("seed.events.row", { title: J("seed.events.newTitle") })),
					zo(X(78, t + 24, 16, 40), J("seed.events.signup"), { style: "secondary" })
				],
				bottom: t + 116
			};
		}
	}), e.sections.define("team", {
		label: "Team/board",
		labelKey: "preset.team.label",
		group: "Cards and lists",
		groupKey: "presetGroup.cards",
		hint: "Portraits with name, role and email",
		hintKey: "preset.team.hint",
		create: () => {
			let e = (e, t, n) => {
				let r = Ro(X(e, 80, 22, 180), { alt: J("seed.team.alt") }), i = Z(X(e, 268, 22, 84), J("seed.team.member", { role: n }), { align: "center" });
				return r.mobileOrder = rs(80, t, 0), i.mobileOrder = rs(80, t, 1), [r, i];
			};
			return is("team", "420px", Zo(Qo("surface")), [
				Z(X(6, 24, 50, 32), J("seed.team.title")),
				...e(7.5, 0, J("seed.team.role1")),
				...e(39, 1, J("seed.team.role2")),
				...e(70.5, 2, J("seed.team.role3"))
			]);
		},
		itemLabel: "person",
		itemLabelKey: "item.person",
		item: (e) => {
			let { x: t, y: n, n: r } = ns(e, 3, 7.5, 31.5, 80, 288, 22, 272), i = Ro(X(t, n, 22, 180), { alt: J("seed.team.alt") }), a = Z(X(t, n + 188, 22, 84), J("seed.team.member", { role: J("seed.team.roleNew") }), { align: "center" });
			return i.mobileOrder = rs(80, r, 0), a.mobileOrder = rs(80, r, 1), {
				blocks: [i, a],
				bottom: n + 296
			};
		}
	}), e.sections.define("faq", {
		label: "FAQ",
		labelKey: "preset.faq.label",
		group: "Cards and lists",
		groupKey: "presetGroup.cards",
		hint: "Questions and answers in cards",
		hintKey: "preset.faq.hint",
		create: () => is("faq", "520px", Zo(Qo("bg")), [
			Z(X(25, 24, 50, 36), J("seed.faq.title"), { align: "center" }),
			qo(X(20, 80, 60, 320), [
				{
					q: J("seed.faq.q1"),
					a: J("seed.faq.answer")
				},
				{
					q: J("seed.faq.q2"),
					a: J("seed.faq.answer")
				},
				{
					q: J("seed.faq.q3"),
					a: J("seed.faq.answer")
				}
			]),
			Z(X(20, 416, 60, 32), J("seed.faq.more"), { align: "center" })
		])
	}), e.sections.define("timeline", {
		label: "Timeline",
		labelKey: "preset.timeline.label",
		group: "Cards and lists",
		groupKey: "presetGroup.cards",
		hint: "Your story as events along a line",
		hintKey: "preset.timeline.hint",
		create: () => is("timeline", "480px", Zo(Qo("bg")), [Z(X(25, 24, 50, 36), J("seed.timeline.title"), { align: "center" }), Yo(X(25, 88, 50, 330), [
			{
				year: "2019",
				title: J("seed.timeline.t1"),
				text: J("seed.timeline.text")
			},
			{
				year: "2022",
				title: J("seed.timeline.t2"),
				text: J("seed.timeline.text")
			},
			{
				year: "2026",
				title: J("seed.timeline.t3"),
				text: J("seed.timeline.text")
			}
		])])
	}), e.sections.define("steps", {
		label: "Step by step",
		labelKey: "preset.steps.label",
		group: "Cards and lists",
		groupKey: "presetGroup.cards",
		hint: "Three numbered cards",
		hintKey: "preset.steps.hint",
		create: () => {
			let e = (e, t, n) => {
				let r = Z(X(e, 88, 25, 72), `<h3>${t + 1}</h3>`, {
					align: "center",
					size: 44
				}), i = Z(X(e, 168, 25, 160), J("seed.steps.card", { title: n }), {
					align: "center",
					box: !0
				});
				return r.mobileOrder = rs(88, t, 0), i.mobileOrder = rs(88, t, 1), [r, i];
			};
			return is("steps", "400px", Zo(Qo("bg")), [
				Z(X(6, 28, 60, 38), J("seed.steps.title")),
				...e(6, 0, J("seed.steps.s1")),
				...e(37.5, 1, J("seed.steps.s2")),
				...e(69, 2, J("seed.steps.s3"))
			]);
		},
		itemLabel: "step",
		itemLabelKey: "item.step",
		item: (e) => {
			let { x: t, y: n, n: r } = ns(e, 3, 6, 31.5, 88, 272, 25, 240), i = Z(X(t, n, 25, 72), `<h3>${r + 1}</h3>`, {
				align: "center",
				size: 44
			}), a = Z(X(t, n + 80, 25, 160), J("seed.steps.card", { title: J("seed.steps.newTitle") }), {
				align: "center",
				box: !0
			});
			return i.mobileOrder = rs(88, r, 0), a.mobileOrder = rs(88, r, 1), {
				blocks: [i, a],
				bottom: n + 268
			};
		}
	}), e.sections.define("lead-story", {
		label: "Lead story",
		labelKey: "preset.lead-story.label",
		group: "Cards and lists",
		groupKey: "presetGroup.cards",
		hint: "One big story and two small beside it",
		hintKey: "preset.lead-story.hint",
		create: () => {
			let e = [
				Ro(X(6, 40, 55, 300)),
				Z(X(6, 348, 55, 108), J("seed.feature.main")),
				zo(X(6, 464, 14, 38), J("seed.readMore"), { style: "secondary" }),
				Ro(X(66, 40, 28, 120)),
				Z(X(66, 164, 28, 60), J("seed.feature.small1")),
				Ro(X(66, 244, 28, 120)),
				Z(X(66, 368, 28, 60), J("seed.feature.small2"))
			];
			return e.forEach((e, t) => {
				e.mobileOrder = rs(40, t < 3 ? 0 : 1, t);
			}), is("lead-story", "540px", Zo(Qo("bg")), e);
		}
	}), e.sections.define("products", {
		label: "Products",
		labelKey: "preset.products.label",
		group: "Cards and lists",
		groupKey: "presetGroup.cards",
		hint: "Three hand-built product cards with their own buy link; the Shop preset gives real products with a basket",
		hintKey: "preset.products.hint",
		create: () => {
			let e = (e, t, n, r) => {
				let i = [
					Ro(X(e, 88, 25, 200)),
					Z(X(e, 296, 25, 76), J("seed.products.card", {
						name: n,
						price: r
					}), { align: "center" }),
					zo(X(e + 5, 380, 15, 40), J("seed.products.buy"))
				];
				return i.forEach((e, n) => {
					e.mobileOrder = rs(88, t, n);
				}), i;
			};
			return is("products", "470px", Zo(Qo("bg")), [
				Z(X(6, 28, 50, 38), J("seed.products.title")),
				...e(6, 0, J("seed.products.name"), J("seed.products.price1")),
				...e(37.5, 1, J("seed.products.name"), J("seed.products.price2")),
				...e(69, 2, J("seed.products.name"), J("seed.products.price3"))
			]);
		},
		itemLabel: "product",
		itemLabelKey: "item.product",
		item: (e) => {
			let { x: t, y: n, n: r } = ns(e, 3, 6, 31.5, 88, 348, 25, 332), i = [
				Ro(X(t, n, 25, 200)),
				Z(X(t, n + 208, 25, 76), J("seed.products.card", {
					name: J("seed.products.name"),
					price: J("seed.products.price1")
				}), { align: "center" }),
				zo(X(t + 5, n + 292, 15, 40), J("seed.products.buy"))
			];
			return i.forEach((e, t) => {
				e.mobileOrder = rs(88, r, t);
			}), {
				blocks: i,
				bottom: n + 356
			};
		}
	}), e.sections.define("shop", {
		label: "Shop",
		labelKey: "preset.shop.label",
		group: "Shop",
		groupKey: "presetGroup.shop",
		hint: "Real product cards from a product collection, with a basket",
		hintKey: "preset.shop.hint",
		create: () => is("shop", "544px", Zo(Qo("bg")), [
			Z(X(6, 28, 50, 38), J("seed.shop.title")),
			Wo(X(78, 88, 16, 48)),
			Uo(X(6, 176, 88, 320))
		])
	}), e.sections.define("shop-hero", {
		label: "Shop hero",
		labelKey: "preset.shop-hero.label",
		group: "Shop",
		groupKey: "presetGroup.shop",
		hint: "Campaign band: big heading, subtext, CTA and a campaign image",
		hintKey: "preset.shop-hero.hint",
		create: () => {
			let e = [
				Z(X(6, 48, 52, 96), J("seed.shopHero.title")),
				Z(X(6, 152, 40, 48), J("seed.shopHero.sub")),
				zo(X(6, 216, 17, 42), J("seed.shopHero.cta")),
				Ro(X(62, 40, 32, 300))
			];
			return e.forEach((e, t) => {
				e.mobileOrder = rs(48, t < 3 ? 0 : 1, t);
			}), is("shop-hero", "400px", {
				version: 1,
				layers: [
					Qo("bg"),
					$o(.8, .25, .28, .6),
					{
						type: "grain",
						version: 1,
						props: { opacity: .05 }
					}
				]
			}, e);
		}
	}), e.sections.define("shop-categories", {
		label: "Shop categories",
		labelKey: "preset.shop-categories.label",
		group: "Shop",
		groupKey: "presetGroup.shop",
		hint: "Four category tiles with image and name; set the link on the image in Properties",
		hintKey: "preset.shop-categories.hint",
		create: () => {
			let e = (e, t, n) => {
				let r = Ro(X(e, 88, 21, 170)), i = Z(X(e, 266, 21, 34), J("seed.shopCategories.tile", { name: n }), { align: "center" });
				return r.mobileOrder = rs(88, t, 0), i.mobileOrder = rs(88, t, 1), [r, i];
			}, t = is("shop-categories", "360px", Zo(Qo("bg")), [
				Z(X(6, 28, 60, 38), J("seed.shopCategories.title")),
				...e(6, 0, J("seed.shopCategories.cat1")),
				...e(29.5, 1, J("seed.shopCategories.cat2")),
				...e(53, 2, J("seed.shopCategories.cat3")),
				...e(76.5, 3, J("seed.shopCategories.cat4"))
			]);
			return t.theme = "soft", t;
		},
		itemLabel: "category",
		itemLabelKey: "item.category",
		item: (e) => {
			let { x: t, y: n, n: r } = ns(e, 4, 6, 23.5, 88, 220, 21, 212), i = Ro(X(t, n, 21, 170)), a = Z(X(t, n + 178, 21, 34), J("seed.shopCategories.tile", { name: J("seed.shopCategories.newCat") }), { align: "center" });
			return i.mobileOrder = rs(88, r, 0), a.mobileOrder = rs(88, r, 1), {
				blocks: [i, a],
				bottom: n + 220
			};
		}
	}), e.sections.define("shop-trust", {
		label: "Shop trust",
		labelKey: "preset.shop-trust.label",
		group: "Shop",
		groupKey: "presetGroup.shop",
		hint: "Three trust points with icon and text (returns, help, safe ordering)",
		hintKey: "preset.shop-trust.hint",
		create: () => {
			let e = (e, t, n, r) => {
				let i = Bo(X(e + 10.5, 88, 4, 52), r, 44), a = Z(X(e, 148, 25, 96), J(n), { align: "center" });
				return i.mobileOrder = rs(88, t, 0), a.mobileOrder = rs(88, t, 1), [i, a];
			}, t = is("shop-trust", "300px", Zo(Qo("bg")), [
				Z(X(6, 28, 60, 38), J("seed.shopTrust.title")),
				...e(6, 0, "seed.shopTrust.t1", "✓"),
				...e(37.5, 1, "seed.shopTrust.t2", "↻"),
				...e(69, 2, "seed.shopTrust.t3", "✉")
			]);
			return t.theme = "muted", t;
		},
		itemLabel: "card",
		itemLabelKey: "item.card",
		item: (e) => {
			let { x: t, y: n, n: r } = ns(e, 3, 6, 31.5, 148, 216, 25, 156, -60), i = Bo(X(t + 10.5, n - 60, 4, 52), "✓", 44), a = Z(X(t, n, 25, 96), J("seed.shopTrust.newItem"), { align: "center" });
			return i.mobileOrder = rs(88, r, 0), a.mobileOrder = rs(88, r, 1), {
				blocks: [i, a],
				bottom: n + 104
			};
		}
	}), e.sections.define("shop-showcase", {
		label: "Shop feature",
		labelKey: "preset.shop-showcase.label",
		group: "Shop",
		groupKey: "presetGroup.shop",
		hint: "Statement band: big typography, text, CTA and an image on a deep surface",
		hintKey: "preset.shop-showcase.hint",
		create: () => {
			let e = [
				Z(X(6, 56, 52, 100), J("seed.shopShowcase.title")),
				Z(X(6, 164, 42, 56), J("seed.shopShowcase.text")),
				zo(X(6, 236, 18, 42), J("seed.shopShowcase.cta")),
				Ro(X(62, 48, 32, 240))
			];
			e.forEach((e, t) => {
				e.mobileOrder = rs(56, t < 3 ? 0 : 1, t);
			});
			let t = is("shop-showcase", "340px", Zo(Qo("bg")), e);
			return t.theme = "deep", t;
		}
	}), e.sections.define("checkout", {
		label: "Checkout",
		labelKey: "preset.checkout.label",
		group: "Shop",
		groupKey: "presetGroup.shop",
		hint: "Order form that sends the basket as an email or to an endpoint",
		hintKey: "preset.checkout.hint",
		create: () => is("checkout", "560px", Zo(Qo("bg")), [Z(X(6, 28, 50, 38), J("seed.checkout.title")), Go(X(25, 96, 50, 430))])
	}), e.sections.define("cta", {
		label: "CTA banner",
		labelKey: "preset.cta.label",
		group: "Highlight",
		groupKey: "presetGroup.highlight",
		hint: "Full width with one clear action",
		hintKey: "preset.cta.hint",
		create: () => is("cta", "280px", Zo(Qo("surface"), $o(.5, .5, .3, .7)), [
			Z(X(20, 56, 60, 40), J("seed.cta.title"), { align: "center" }),
			Z(X(25, 104, 50, 26), J("seed.cta.sub"), { align: "center" }),
			zo(X(42, 148, 16, 42), J("seed.join"))
		])
	}), e.sections.define("quote", {
		label: "Quote",
		labelKey: "preset.quote.label",
		group: "Highlight",
		groupKey: "presetGroup.highlight",
		hint: "Large quote with attribution",
		hintKey: "preset.quote.hint",
		create: () => is("quote", "300px", Zo(Qo("bg")), [Jo(X(20, 56, 60, 190), {
			text: J("seed.quoteBlock.text"),
			attribution: J("seed.quoteBlock.name"),
			role: J("seed.quoteBlock.role")
		})])
	}), e.sections.define("stats", {
		label: "Statistics",
		labelKey: "preset.stats.label",
		group: "Highlight",
		groupKey: "presetGroup.highlight",
		hint: "Three big numbers with labels",
		hintKey: "preset.stats.hint",
		create: () => {
			let e = (e, t, n, r, i) => {
				let a = Xo(X(e, 76, 25, 120), {
					value: n,
					suffix: r,
					label: i
				});
				return a.mobileOrder = rs(76, t, 0), a;
			};
			return is("stats", "260px", Zo(Qo("surface")), [
				e(6, 0, "120", "+", J("seed.stats.l1")),
				e(37.5, 1, "25", "", J("seed.stats.l2")),
				e(69, 2, "1981", "", J("seed.stats.l3"))
			]);
		},
		itemLabel: "number",
		itemLabelKey: "item.number",
		item: (e) => {
			let { x: t, y: n, n: r } = ns(e, 3, 6, 31.5, 76, 140, 25, 120), i = Xo(X(t, n, 25, 120), {
				value: "42",
				label: J("seed.stats.newLabel")
			});
			return i.mobileOrder = rs(76, r, 0), {
				blocks: [i],
				bottom: n + 148
			};
		}
	}), e.sections.define("sponsors", {
		label: "Sponsors",
		labelKey: "preset.sponsors.label",
		group: "Highlight",
		groupKey: "presetGroup.highlight",
		hint: "Greyscale logo row with links",
		hintKey: "preset.sponsors.hint",
		create: () => {
			let e = (e) => Ro(X(e, 108, 18.5, 100), {
				alt: J("seed.sponsors.alt"),
				fit: "contain",
				radius: null,
				saturate: 0
			});
			return is("sponsors", "280px", Zo(Qo("bg")), [
				Z(X(6, 28, 60, 36), J("seed.sponsors.title")),
				e(5.5),
				e(29),
				e(52.5),
				e(76)
			]);
		},
		itemLabel: "logo",
		itemLabelKey: "item.logo",
		item: (e) => {
			let { x: t, y: n } = ns(e, 4, 5.5, 23.5, 108, 124, 18.5, 100);
			return {
				blocks: [Ro(X(t, n, 18.5, 100), {
					alt: J("seed.sponsors.alt"),
					fit: "contain",
					radius: null,
					saturate: 0
				})],
				bottom: n + 124
			};
		}
	}), e.sections.define("membership", {
		label: "Membership",
		labelKey: "preset.membership.label",
		group: "Highlight",
		groupKey: "presetGroup.highlight",
		hint: "Price tiers with benefits and a Vipps line",
		hintKey: "preset.membership.hint",
		create: () => is("membership", "500px", Zo(Qo("surface")), [
			Z(X(6, 28, 50, 38), J("seed.membership.title")),
			Z(X(14, 88, 32, 250), J("seed.membership.tier1"), {
				align: "center",
				box: !0
			}),
			Z(X(54, 88, 32, 250), J("seed.membership.tier2"), {
				align: "center",
				box: !0
			}),
			zo(X(42, 358, 16, 42), J("seed.join")),
			Z(X(25, 414, 50, 30), J("seed.membership.vipps"), { align: "center" })
		])
	});
}
//#endregion
//#region ../template/assets/engine/0.7.2/templates-model.js
var os = [
	"section",
	"blocks",
	"page"
];
function ss(e) {
	return wa(String(e ?? ""), "");
}
function cs(e, t, { id: n, title: r }) {
	let i = structuredClone(e);
	i.meta = {
		...i.meta,
		id: n,
		title: r
	};
	for (let e of i.sections ?? []) {
		e.id = t("sec");
		for (let n of e.blocks ?? []) n.id = t("blk");
	}
	return i;
}
//#endregion
//#region ../template/assets/engine/0.7.2/collections-csv.js
var ls = [
	"id",
	"title",
	"date",
	"text",
	"href",
	"image",
	"price",
	"memberPrice",
	"badge",
	"sizes",
	"colors"
];
function us(e) {
	let t = String(e ?? "");
	return /[",\n\r]/.test(t) ? `"${t.replaceAll("\"", "\"\"")}"` : t;
}
function ds(e, t) {
	return t === "sizes" ? (e.sizes ?? []).join("|") : t === "colors" ? (e.colors ?? []).map((e) => e.name).join("|") : e[t] ?? "";
}
function fs(e) {
	let t = [ls.join(",")];
	for (let n of e ?? []) t.push(ls.map((e) => us(ds(n, e))).join(","));
	return t.join("\n") + "\n";
}
function ps(e) {
	let t = [], n = [], r = "", i = !1, a = String(e ?? "");
	for (let e = 0; e < a.length; e += 1) {
		let o = a[e];
		i ? o === "\"" && a[e + 1] === "\"" ? (r += "\"", e += 1) : o === "\"" ? i = !1 : r += o : o === "\"" ? i = !0 : o === "," ? (n.push(r), r = "") : o === "\n" || o === "\r" ? (o === "\r" && a[e + 1] === "\n" && (e += 1), n.push(r), t.push(n), n = [], r = "") : r += o;
	}
	return (r !== "" || n.length) && (n.push(r), t.push(n)), t.filter((e) => e.some((e) => e.trim() !== ""));
}
var ms = (e) => String(e ?? "").split("|").map((e) => e.trim()).filter(Boolean);
function hs(e) {
	let t = ps(e);
	if (t.length < 2) return null;
	let n = t[0].map((e) => e.trim());
	if (!n.includes("title")) return null;
	let r = [], i = 0;
	for (let e of t.slice(1)) {
		let t = {};
		n.forEach((n, r) => {
			t[n] = e[r] ?? "";
		});
		let a = String(t.title ?? "").trim();
		if (!a) {
			i += 1;
			continue;
		}
		let o = {
			id: String(t.id ?? "").trim(),
			title: a
		};
		for (let e of [
			"date",
			"text",
			"href",
			"image",
			"badge"
		]) {
			let n = String(t[e] ?? "").trim();
			n && (o[e] = n);
		}
		for (let e of ["price", "memberPrice"]) {
			let n = String(t[e] ?? "").trim();
			if (n === "") continue;
			let r = Number(n.replace(",", "."));
			Number.isFinite(r) && r >= 0 && (o[e] = r);
		}
		let s = ms(t.sizes);
		s.length && (o.sizes = s);
		let c = ms(t.colors);
		c.length && (o.colors = c.map((e) => ({ name: e }))), r.push(o);
	}
	return {
		entries: r,
		skipped: i
	};
}
//#endregion
//#region ../template/assets/engine/0.7.2/feeds.js
function gs(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}
function _s(e, t) {
	let n = String(t ?? "").replace(/\/+$/, "");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${(e ?? []).filter((e) => !e.noindex).map((e) => `  <url><loc>${gs(n + (e.path === "/" ? "/" : e.path))}</loc></url>`).join("\n")}\n</urlset>\n`;
}
function vs(e) {
	return `User-agent: *\nDisallow: /admin/\n\nSitemap: ${String(e ?? "").replace(/\/+$/, "")}/sitemap.xml\n`;
}
var ys = [
	"news",
	"notices",
	"publications"
];
function bs(e) {
	let t = String(e.origin ?? "").replace(/\/+$/, ""), n = (e.items ?? []).map((n) => {
		let r = n.href ? new URL(n.href, t + "/").href : t + "/", i = n.date ? new Date(n.date) : null, a = i && !Number.isNaN(i.getTime()) ? `\n      <pubDate>${i.toUTCString()}</pubDate>` : "", o = n.text ? `\n      <description>${gs(n.text)}</description>` : "";
		return `    <item>\n      <title>${gs(n.title)}</title>\n      <link>${gs(r)}</link>\n      <guid isPermaLink="false">${gs(`${e.path}#${n.id ?? n.title}`)}</guid>${o}${a}\n    </item>`;
	}).join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${gs(e.title)}</title>\n    <link>${gs(t + "/")}</link>\n    <description>${gs(e.description ?? e.title)}</description>\n${n}${n ? "\n" : ""}  </channel>\n</rss>\n`;
}
//#endregion
//#region ../template/assets/engine/0.7.2/preset-thumb.js
var xs = /^#[0-9a-fA-F]{3,8}$/, Ss = /^[a-z][a-z0-9-]*$/, Cs = "#171c26", ws = "#232a38", Ts = "#98a1b3", Es = "#7c5cff", Q = (e, t) => `var(--urd-color-${e}, ${t})`;
function Ds(e, t) {
	return typeof e == "string" ? xs.test(e) ? e : Ss.test(e) ? Q(e, t) : t : t;
}
function Os(e, t = 800) {
	let n = Number.parseFloat(e);
	return !Number.isFinite(n) || n <= 0 ? 400 : typeof e == "string" && e.trim().endsWith("vh") ? n / 100 * t : n;
}
var $ = (e) => Math.round(e * 10) / 10, ks = (e, t, n) => Math.min(n, Math.max(t, e)), As = (e, t, n, r, i, a = "") => `<rect x="${$(e)}" y="${$(t)}" width="${$(Math.max(n, 1))}" height="${$(Math.max(r, 1))}" fill="${i}"${a}/>`;
function js(e) {
	if (e?.theme) return e.theme === "inverse" || e.theme === "deep" ? Q("text", Ts) : e.theme === "accent" ? Q("accent", Es) : Q("surface", ws);
	for (let t of e?.background?.layers ?? []) {
		if (t.type === "color") return Ds(t.props?.value, Cs);
		if (t.type === "gradient") return Ds(Array.isArray(t.props?.stops) ? t.props.stops[0] : null, Cs);
	}
	return Q("bg", Cs);
}
function Ms(e, t, n, r, i) {
	let a = /<h[1-3]/.test(String(i?.html ?? "")), o = i?.align === "center", s = Q("text", Ts), c = [];
	i?.box && c.push(As(e, t, n, r, Q("surface", ws), " rx=\"1.5\""));
	let l = i?.box ? Math.min(2, n * .06) : 0, u = e + l, d = n - l * 2, f = [
		.72,
		.9,
		.5
	], p = [
		a ? 4 : 2.2,
		2.2,
		2.2
	], m = ks(r / (p[0] + p[1] + p[2] + 4.8 + 2), 0, 1), h = t + l + Math.min(1, r * .08);
	for (let e = 0; e < 3; e++) {
		let n = Math.min(Math.max(e === 0 ? a ? 1.4 : 1 : .8, p[e] * m), Math.max(r, 1));
		if (e > 0 && h + n > t + r - l) break;
		let i = d * f[e], g = o ? u + (d - i) / 2 : u;
		c.push(As(g, h, i, n, s, ` opacity="${e === 0 ? .8 : .4}" rx="${$(Math.min(1, n / 2))}"`)), h += n + Math.max(.8, 2.4 * m);
	}
	return c.join("");
}
function Ns(e, t, n, r, i = !1) {
	let a = Q("text", Ts), o = [];
	i ? (o.push(As(e, t, n, r, Q("surface", ws), " rx=\"1.5\" opacity=\"0.35\"")), o.push(`<rect x="${$(e + .4)}" y="${$(t + .4)}" width="${$(Math.max(n - .8, 1))}" height="${$(Math.max(r - .8, 1))}" fill="none" stroke="${a}" stroke-width="0.6" stroke-dasharray="2 2" opacity="0.35" rx="1.5"/>`)) : o.push(As(e, t, n, r, Q("surface", ws), " rx=\"1.5\""));
	let s = i ? .15 : .4, c = (t) => $(e + n * t), l = (e) => $(t + r * e);
	return o.push(`<polygon points="${c(.08)},${l(.9)} ${c(.42)},${l(.38)} ${c(.62)},${l(.68)} ${c(.75)},${l(.5)} ${c(.92)},${l(.9)}" fill="${a}" opacity="${s}"/>`), o.push(`<circle cx="${c(.28)}" cy="${l(.26)}" r="${$(Math.max(1, Math.min(n, r) * .1))}" fill="${a}" opacity="${$(s + .1)}"/>`), o.join("");
}
function Ps(e, t, n, r, i) {
	let a = !(Array.isArray(i?.images) && i.images.length), o = Math.max(1, n * .03), s = (n - o * 2) / 3, c = [];
	for (let n = 0; n < 3; n++) c.push(Ns(e + n * (s + o), t, s, r, a));
	return c.join("");
}
function Fs(e, t, n, r) {
	let i = Math.max(1, n * .03), a = (n - i * 2) / 3, o = [];
	for (let n = 0; n < 3; n++) {
		let s = e + n * (a + i);
		o.push(As(s, t, a, r * .55, Q("surface", ws), " rx=\"1.5\"")), o.push(As(s, t + r * .62, a * .8, 2, Q("text", Ts), " opacity=\"0.5\" rx=\"1\""));
	}
	return o.join("");
}
function Is(e, t, n, r, i) {
	let a = Ds(i?.color, Es), o = i?.kind;
	return o === "circle" ? `<ellipse cx="${$(e + n / 2)}" cy="${$(t + r / 2)}" rx="${$(Math.max(n / 2, 1))}" ry="${$(Math.max(r / 2, 1))}" fill="${a}" opacity="0.8"/>` : o === "triangle" ? `<polygon points="${$(e)},${$(t + r)} ${$(e + n / 2)},${$(t)} ${$(e + n)},${$(t + r)}" fill="${a}" opacity="0.8"/>` : o === "line" || o === "arrow" ? As(e, t + r / 2 - .75, n, 1.5, a, " opacity=\"0.85\" rx=\"0.75\"") : As(e, t, n, r, a, " opacity=\"0.8\" rx=\"1\"");
}
function Ls(e, t, n, r, i, a) {
	if (e === "text") return Ms(t, n, r, i, a);
	if (e === "image") return Ns(t, n, r, i, !a?.src);
	if (e === "gallery") return Ps(t, n, r, i, a);
	if (e === "collection") return Fs(t, n, r, i);
	if (e === "faq") {
		let e = ks(Math.floor(i / 5), 2, 3), a = Math.max(.6, i * .04), o = (i - a * (e - 1)) / e, s = [];
		for (let i = 0; i < e; i += 1) {
			let e = n + i * (o + a);
			s.push(As(t, e, r, o, Q("surface", ws), " rx=\"1\"")), s.push(As(t + r * .06, e + o / 2 - .7, r * .55, 1.4, Q("text", Ts), " opacity=\"0.5\" rx=\"0.7\"")), s.push(`<circle cx="${$(t + r * .92)}" cy="${$(e + o / 2)}" r="0.9" fill="${Q("text", Ts)}" opacity="0.4"/>`);
		}
		return s.join("");
	}
	if (e === "shape") return Is(t, n, r, i, a);
	if (e === "button") return As(t, n, r, i, Q("accent", Es), ` rx="${$(Math.min(i / 2, 4))}"`);
	if (e === "icon") {
		let e = Math.max(1.2, Math.min(r, i) / 2);
		return `<circle cx="${$(t + r / 2)}" cy="${$(n + i / 2)}" r="${$(e)}" fill="${Q("accent", Es)}" opacity="0.85"/>`;
	}
	if (e === "video") {
		let e = [As(t, n, r, i, Q("surface", ws), " rx=\"1.5\"")], a = t + r / 2, o = n + i / 2, s = Math.max(1.5, Math.min(r, i) * .22);
		return e.push(`<polygon points="${$(a - s / 2)},${$(o - s)} ${$(a - s / 2)},${$(o + s)} ${$(a + s)},${$(o)}" fill="${Q("text", Ts)}" opacity="0.6"/>`), e.join("");
	}
	if (e === "timeline") {
		let e = [As(t + 1, n, 1.4, i, Q("accent", Es), " opacity=\"0.7\" rx=\"0.7\"")];
		for (let a = 0; a < 3; a += 1) {
			let o = n + i * (.18 + a * .32);
			e.push(`<circle cx="${$(t + 1.7)}" cy="${$(o)}" r="1.6" fill="${Q("accent", Es)}"/>`), e.push(As(t + 5, o - 1, r * .5, 2, Q("text", Ts), " opacity=\"0.5\" rx=\"1\""));
		}
		return e.join("");
	}
	if (e === "quote") return [
		`<text x="${$(t + r / 2)}" y="${$(n + i * .34)}" text-anchor="middle" font-size="${$(Math.min(r, i) * .5)}" font-family="Georgia, serif" fill="${Q("accent", Es)}">“</text>`,
		As(t + r * .15, n + i * .48, r * .7, 2, Q("text", Ts), " opacity=\"0.6\" rx=\"1\""),
		As(t + r * .25, n + i * .62, r * .5, 2, Q("text", Ts), " opacity=\"0.6\" rx=\"1\""),
		As(t + r * .35, n + i * .82, r * .3, 1.6, Q("text", Ts), " opacity=\"0.35\" rx=\"0.8\"")
	].join("");
	if (e === "stats") return [As(t + r * .28, n + i * .15, r * .44, i * .42, Q("accent", Es), " opacity=\"0.85\" rx=\"1\""), As(t + r * .32, n + i * .72, r * .36, 1.6, Q("text", Ts), " opacity=\"0.4\" rx=\"0.8\"")].join("");
	if (e === "table") {
		let e = Math.max(1.6, i * .22), a = [As(t, n, r, e, Q("accent", Es), " opacity=\"0.5\" rx=\"0.8\"")], o = ks(Math.floor((i - e) / 3.2), 1, 3);
		for (let s = 0; s < o; s += 1) a.push(As(t, n + e + 1 + s * ((i - e - 1) / o), r, 1, Q("text", Ts), " opacity=\"0.3\""));
		return a.push(As(t + r * .33, n, .6, i, Q("text", Ts), " opacity=\"0.2\"")), a.push(As(t + r * .66, n, .6, i, Q("text", Ts), " opacity=\"0.2\"")), a.join("");
	}
	if (e === "share") {
		let e = Math.max(1.2, Math.min(i / 2, r / 9)), a = [];
		for (let r = 0; r < 4; r += 1) a.push(`<circle cx="${$(t + e + r * (e * 2 + 1.5))}" cy="${$(n + i / 2)}" r="${$(e)}" fill="${Q("accent", Es)}" opacity="0.8"/>`);
		return a.join("");
	}
	if (e === "countdown") {
		let e = Math.max(.8, r * .03), a = (r - e * 3) / 4, o = [];
		for (let r = 0; r < 4; r += 1) {
			let s = t + r * (a + e);
			o.push(As(s, n, a, i, Q("surface", ws), " rx=\"1\"")), o.push(As(s + a * .25, n + i * .2, a * .5, i * .35, Q("accent", Es), " opacity=\"0.85\" rx=\"0.8\""));
		}
		return o.join("");
	}
	if (e === "audio") {
		let e = [As(t, n, r, i, Q("surface", ws), " rx=\"1.5\"")], a = n + i / 2, o = Math.max(1.2, i * .28);
		return e.push(`<polygon points="${$(t + r * .06)},${$(a - o)} ${$(t + r * .06)},${$(a + o)} ${$(t + r * .06 + o * 1.4)},${$(a)}" fill="${Q("accent", Es)}" opacity="0.85"/>`), e.push(As(t + r * .2, a - .6, r * .7, 1.2, Q("text", Ts), " opacity=\"0.35\" rx=\"0.6\"")), e.join("");
	}
	if (e === "product") {
		let e = Math.max(.8, r * .03), a = (r - e * 2) / 3, o = [];
		for (let r = 0; r < 3; r += 1) {
			let s = t + r * (a + e);
			o.push(As(s, n, a, i, Q("surface", ws), " rx=\"1\"")), o.push(As(s + a * .08, n + i * .06, a * .84, i * .42, Q("text", Ts), " opacity=\"0.15\" rx=\"0.8\"")), o.push(As(s + a * .08, n + i * .56, a * .6, 1.4, Q("text", Ts), " opacity=\"0.5\" rx=\"0.7\"")), o.push(As(s + a * .08, n + i * .72, a * .35, 1.4, Q("accent", Es), " opacity=\"0.85\" rx=\"0.7\"")), o.push(As(s + a * .08, n + i * .84, a * .84, i * .1, Q("accent", Es), " opacity=\"0.6\" rx=\"1\""));
		}
		return o.join("");
	}
	if (e === "cart") {
		let e = Math.max(1.5, Math.min(r, i) / 2.4), a = t + r / 2, o = n + i / 2;
		return [
			`<circle cx="${$(a)}" cy="${$(o)}" r="${$(e)}" fill="${Q("surface", ws)}"/>`,
			As(a - e * .5, o - e * .25, e, e * .55, Q("text", Ts), " opacity=\"0.5\" rx=\"0.4\""),
			`<circle cx="${$(a + e * .75)}" cy="${$(o - e * .75)}" r="${$(Math.max(.9, e * .35))}" fill="${Q("accent", Es)}"/>`
		].join("");
	}
	return e === "checkout" ? [
		As(t, n, r * .7, 1.2, Q("text", Ts), " opacity=\"0.5\" rx=\"0.6\""),
		As(t, n + i * .12, r * .5, 1.2, Q("text", Ts), " opacity=\"0.35\" rx=\"0.6\""),
		As(t, n + i * .3, r, i * .14, Q("surface", ws), " rx=\"1\""),
		As(t, n + i * .5, r, i * .14, Q("surface", ws), " rx=\"1\""),
		As(t, n + i * .78, r * .45, i * .16, Q("accent", Es), " opacity=\"0.85\" rx=\"1.2\"")
	].join("") : As(t, n, r, i, Q("surface", ws), " rx=\"1.5\"");
}
function Rs(e, t, n) {
	let r = Array.isArray(e?.blocks) ? e.blocks : [], i = r.map((e) => (e.frames?.desktop?.y ?? 0) + (e.frames?.desktop?.h ?? 0)), a = n / Math.max(Os(e?.size?.minHeight), i.length ? Math.max(...i) + 16 : 0), o = [As(0, 0, t, n, js(e))];
	for (let r of e?.background?.layers ?? []) {
		if (r.type !== "glow") continue;
		let e = r.props ?? {};
		o.push(`<circle cx="${$(ks(e.x ?? .5, 0, 1) * t)}" cy="${$(ks(e.y ?? .3, 0, 1) * n)}" r="${$(t * ks(e.radius ?? .5, .1, 1) * .5)}" fill="${Ds(e.color, Es)}" opacity="${$(ks(e.opacity ?? .3, 0, .5))}"/>`);
	}
	let s = t * .06, c = t - s * 2;
	for (let e of r) {
		let r = e.frames?.desktop;
		if (!r) continue;
		let i = ks(s + (r.x ?? 0) * (c / 100), 0, t - 2), l = ks((r.y ?? 0) * a, 0, n - 2), u = ks((r.w ?? 10) * (c / 100), 2, t - i), d = ks((r.h ?? 20) * a, 2, n - l);
		o.push(Ls(e.type, i, l, u, d, e.props));
	}
	return o.join("");
}
function zs(e, { w: t = 96, h: n = 116, max: r = 6 } = {}) {
	let i = (Array.isArray(e?.sections) ? e.sections : []).slice(0, r);
	if (!i.length) return `<svg viewBox="0 0 ${t} ${n}" width="${t}" height="${n}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${As(0, 0, t, n, Q("bg", Cs))}</svg>`;
	let a = i.map((e) => ks(Os(e?.size?.minHeight), 160, 900)), o = a.reduce((e, t) => e + t, 0), s = n - 1 * (i.length - 1), c = [], l = 0;
	for (let e = 0; e < i.length; e += 1) {
		let n = Math.max(6, a[e] / o * s);
		c.push(`<g transform="translate(0 ${$(l)})">${Rs(i[e], t, n)}</g>`), l += n + 1;
	}
	return `<svg viewBox="0 0 ${t} ${n}" width="${t}" height="${n}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${c.join("")}</svg>`;
}
//#endregion
//#region ../template/assets/engine/0.7.2/page-presets.js
var Bs = /* @__PURE__ */ new Map();
as({ sections: { define: (e, t) => Bs.set(e, t) } });
var Vs = [
	{
		id: "landing",
		labelKey: "pageTemplate.landing",
		sections: [
			"hero",
			"feature-cards",
			"stats",
			"quote",
			"cta"
		]
	},
	{
		id: "about",
		labelKey: "pageTemplate.about",
		sections: [
			"hero-centered",
			"team",
			"timeline",
			"sponsors",
			"cta"
		]
	},
	{
		id: "contact",
		labelKey: "pageTemplate.contact",
		sections: [
			"hero-centered",
			"contact",
			"faq"
		]
	},
	{
		id: "portfolio",
		labelKey: "pageTemplate.portfolio",
		sections: [
			"hero-centered",
			"gallery",
			"quote",
			"cta"
		]
	},
	{
		id: "event",
		labelKey: "pageTemplate.event",
		sections: [
			"lead-story",
			"events",
			"steps",
			"faq",
			"cta"
		]
	},
	{
		id: "shop",
		labelKey: "pageTemplate.shop",
		sections: [
			"shop-hero",
			"shop",
			"faq",
			"cta"
		]
	},
	{
		id: "shop-front",
		labelKey: "pageTemplate.shopFront",
		sections: [
			"shop-hero",
			"shop",
			"shop-categories",
			"shop-showcase",
			"shop-trust",
			"cta"
		]
	},
	{
		id: "checkout",
		labelKey: "pageTemplate.checkout",
		sections: ["checkout", "contact"]
	}
];
function Hs(e, { pageId: t, title: n }) {
	let r = Vs.find((t) => t.id === e);
	return r ? {
		schemaVersion: 4,
		meta: {
			id: t,
			title: n
		},
		sections: r.sections.map((e) => Bs.get(e).create())
	} : null;
}
//#endregion
//#region ../template/assets/engine/0.7.2/palette-search.js
function Us(e) {
	return String(e ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function Ws(e, t) {
	let n = Us(t).trim(), r = Us(e);
	return n ? r.startsWith(n) ? 0 : r.split(/[^a-z0-9]+/).some((e) => e.startsWith(n)) ? 1 : r.includes(n) ? 2 : -1 : 2;
}
function Gs(e, t, n) {
	return e.map((e, r) => ({
		item: e,
		i: r,
		rank: Ws(n(e), t)
	})).filter((e) => e.rank >= 0).sort((e, t) => e.rank - t.rank || e.i - t.i).map((e) => e.item);
}
//#endregion
//#region ../template/assets/engine/0.7.2/theme.js
function Ks(e, t, n) {
	return t === "light" || t === "dark" ? t : n ? "dark" : "light";
}
function qs(e, t) {
	let n = e.tokens || {}, r = e.scheme === "dark" ? "dark" : "light";
	if (!e.alt?.tokens || t === r) return n;
	let i = {};
	for (let t of /* @__PURE__ */ new Set([...Object.keys(n), ...Object.keys(e.alt.tokens)])) i[t] = {
		...n[t],
		...e.alt.tokens[t]
	};
	return i;
}
var Js = /^[a-zA-Z0-9#%.,()'"\s+\-*/]+$/;
function Ys(e) {
	return typeof e == "string" && Js.test(e) && !/url\(|\/\*|\*\/|expression/i.test(e);
}
function Xs(e) {
	let t = e.tokens || {}, n = qs(e, "light"), r = qs(e, "dark"), i = e.scheme === "dark" ? "dark" : "light", a = [], o = [], s = [], c = /* @__PURE__ */ new Set([
		...Object.keys(t),
		...Object.keys(n),
		...Object.keys(r)
	]);
	for (let e of c) {
		let i = e === "color", c = /* @__PURE__ */ new Set([
			...Object.keys(t[e] || {}),
			...Object.keys(n[e] || {}),
			...Object.keys(r[e] || {})
		]);
		for (let l of c) {
			let c = t[e]?.[l], u = n[e]?.[l], d = r[e]?.[l];
			Ys(c) && (a.push(`  --urd-${e}-${l}: ${c};`), i && a.push(`  --urd-base-${l}: ${c};`)), u !== d && (i && Ys(u) && Ys(d) ? o.push({
				name: l,
				lv: u,
				dv: d
			}) : !i && Ys(u) && Ys(d) && s.push({
				group: e,
				name: l,
				lv: u,
				dv: d
			}));
		}
	}
	let l = o.length > 0 || s.length > 0, u = `:root {\n  color-scheme: ${l ? "light dark" : i};\n${a.join("\n")}\n}\n`;
	if (!l) return u;
	let d = [];
	for (let e of o) {
		let t = `light-dark(${e.lv}, ${e.dv})`;
		d.push(`    --urd-color-${e.name}: ${t};`), d.push(`    --urd-base-${e.name}: ${t};`);
	}
	if (u += "@supports (color: light-dark(#000, #fff)) {\n", d.length && (u += `  :root {\n${d.join("\n")}\n  }\n`), u += "  :root[data-urd-theme=\"light\"] { color-scheme: light; }\n", u += "  :root[data-urd-theme=\"dark\"] { color-scheme: dark; }\n", s.length) {
		let e = (e) => s.map((t) => `    --urd-${t.group}-${t.name}: ${e(t)};`).join("\n");
		u += `  @media (prefers-color-scheme: dark) {\n    :root {\n${s.map((e) => `      --urd-${e.group}-${e.name}: ${e.dv};`).join("\n")}\n    }\n  }\n`, u += `  :root[data-urd-theme="light"] {\n${e((e) => e.lv)}\n  }\n`, u += `  :root[data-urd-theme="dark"] {\n${e((e) => e.dv)}\n  }\n`;
	}
	return u += "}\n", u;
}
function Zs(e) {
	return /^[a-z][a-z0-9-]*$/.test(e) ? `var(--urd-color-${e})` : e;
}
var Qs = {
	surface: {
		"--urd-color-bg": "var(--urd-base-surface)",
		"--urd-color-surface": "color-mix(in srgb, var(--urd-base-text) 7%, var(--urd-base-surface))"
	},
	accent: {
		"--urd-color-bg": "var(--urd-base-accent)",
		"--urd-color-surface": "color-mix(in srgb, var(--urd-base-accent) 82%, #000)",
		"--urd-color-text": "var(--urd-base-accent-text)",
		"--urd-color-accent": "var(--urd-base-accent-text)",
		"--urd-color-accent-text": "var(--urd-base-accent)"
	},
	inverse: {
		"--urd-color-bg": "var(--urd-base-text)",
		"--urd-color-surface": "color-mix(in srgb, var(--urd-base-text) 78%, var(--urd-base-bg))",
		"--urd-color-text": "var(--urd-base-bg)"
	},
	soft: {
		"--urd-color-bg": "color-mix(in srgb, var(--urd-base-accent) 12%, var(--urd-base-bg))",
		"--urd-color-surface": "color-mix(in srgb, var(--urd-base-accent) 8%, var(--urd-base-surface))"
	},
	muted: {
		"--urd-color-bg": "color-mix(in srgb, var(--urd-base-text) 5%, var(--urd-base-bg))",
		"--urd-color-surface": "color-mix(in srgb, var(--urd-base-text) 10%, var(--urd-base-bg))",
		"--urd-color-text": "color-mix(in srgb, var(--urd-base-text) 82%, var(--urd-base-bg))"
	},
	deep: {
		"--urd-color-bg": "color-mix(in srgb, var(--urd-base-accent) 30%, var(--urd-base-text))",
		"--urd-color-surface": "color-mix(in srgb, var(--urd-base-accent) 40%, var(--urd-base-text))",
		"--urd-color-text": "var(--urd-base-bg)"
	},
	highlighted: { "--urd-color-surface": "color-mix(in srgb, var(--urd-base-accent) 14%, var(--urd-base-surface))" }
}, $s = {
	surface: "sectionTheme.surface",
	accent: "sectionTheme.accent",
	inverse: "sectionTheme.inverse",
	soft: "sectionTheme.soft",
	muted: "sectionTheme.muted",
	deep: "sectionTheme.deep",
	highlighted: "sectionTheme.highlighted"
};
[...new Set(Object.values(Qs).flatMap(Object.keys))];
function ec(e) {
	return Qs[e] ?? {};
}
function tc(e) {
	let t = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(typeof e == "string" ? e.trim() : "");
	if (!t) return null;
	let n = t[1];
	n.length === 3 && (n = n.split("").map((e) => e + e).join(""));
	let r = (e) => {
		let t = parseInt(e, 16) / 255;
		return t <= .03928 ? t / 12.92 : ((t + .055) / 1.055) ** 2.4;
	};
	return .2126 * r(n.slice(0, 2)) + .7152 * r(n.slice(2, 4)) + .0722 * r(n.slice(4, 6));
}
function nc(e, t) {
	let n = tc(e), r = tc(t);
	return n == null || r == null ? null : (Math.max(n, r) + .05) / (Math.min(n, r) + .05);
}
//#endregion
//#region ../template/assets/engine/0.7.2/backgrounds/color.js
var rc = {
	version: 1,
	label: "Colour",
	labelKey: "bgLayer.color",
	defaults: () => ({
		value: "bg",
		opacity: 1
	}),
	migrations: {},
	render(e, t) {
		e.style.background = Zs(t.value), e.style.opacity = String(t.opacity ?? 1);
	}
}, ic = {
	linear: [
		"pan",
		"pan-loop",
		"rotate"
	],
	radial: ["pulse", "orbit"]
};
function ac(e) {
	let t = Array.isArray(e) && e.length ? e : [{ color: "#0b0e14" }, { color: "#1a1030" }], n = t.map((e) => Math.max(0, Number(e?.share) || 0)), r = n.reduce((e, t) => e + t, 0), i = r <= 0, a = i ? t.length : r, o = 0;
	return t.map((e, t) => {
		let r = i ? 1 : n[t], s = (o + r / 2) / a * 100;
		return o += r, {
			color: e?.color ?? "#0b0e14",
			at: Math.round(s * 100) / 100
		};
	});
}
function oc(e) {
	let t = (e) => Math.round(e * 100) / 100, n = e[0]?.at ?? 0;
	return [...e.map((e) => ({
		color: e.color,
		at: t(e.at - n)
	})), {
		color: e[0]?.color ?? "#0b0e14",
		at: 100
	}];
}
function sc(e, t, n, r = .5) {
	let i = n % 360 * Math.PI / 180, a = (e) => Math.round(e * 100) / 100 || 0, o = (Math.abs(e * Math.sin(i)) + Math.abs(t * Math.cos(i))) / (1 - Math.min(Math.max(r, 0), .9));
	return {
		period: a(o),
		dx: a(Math.sin(i) * o),
		dy: a(-Math.cos(i) * o)
	};
}
function cc(e, t, n) {
	return `repeating-linear-gradient(${t}deg, ${e.map((e) => `${Zs(e.color)} ${Math.round(e.at / 100 * n * 100) / 100}px`).join(", ")})`;
}
function lc(e) {
	let t = e.kind === "radial" ? "radial" : "linear", n = (ic[t] ?? []).includes(e.animation) ? e.animation : null, r = ac(e.stops), i = r.map((e) => `${Zs(e.color)} ${e.at}%`).join(", "), a = {}, o;
	if (t === "radial") {
		let t = Math.round((e.x ?? .5) * 100), r = Math.round((e.y ?? .5) * 100);
		if (o = `radial-gradient(circle at ${t}% ${r}%, ${i})`, n === "orbit") return {
			background: null,
			className: null,
			styles: a,
			runner: {
				className: "urd-bg-orbit-runner",
				background: o,
				left: `${-t}%`,
				top: `${-r}%`
			}
		};
		n === "pulse" && (a["--urd-bg-op"] = String(e.opacity ?? 1));
	} else {
		let t = e.angle ?? 160;
		if (n === "pan-loop") {
			let n = (e.stops ?? []).map((e) => Math.max(0, Number(e?.share) || 0)), i = n.reduce((e, t) => e + t, 0), o = i > 0 ? Math.max(...n) / i : 1 / r.length;
			return {
				background: null,
				className: null,
				styles: a,
				loop: {
					angle: t,
					stops: oc(r),
					maxShare: o
				}
			};
		}
		if (o = n === "rotate" ? `linear-gradient(calc(var(--urd-grad-spin, 0deg) + ${t}deg), ${i})` : `linear-gradient(${t}deg, ${i})`, n === "pan") return {
			background: null,
			className: null,
			styles: a,
			runner: {
				className: "urd-bg-pan-runner",
				background: o
			}
		};
	}
	return {
		background: o,
		className: n ? {
			rotate: "urd-bg-rotate",
			pulse: "urd-bg-pulse"
		}[n] ?? null : null,
		styles: a
	};
}
var uc = /* @__PURE__ */ new Set(), dc = !1;
function fc(e) {
	uc.add(e), !(dc || typeof window > "u") && (dc = !0, window.addEventListener("resize", () => {
		for (let e of [...uc]) e() || uc.delete(e);
	}));
}
var pc = !1;
function mc() {
	if (!pc) {
		pc = !0;
		try {
			CSS.registerProperty({
				name: "--urd-grad-spin",
				syntax: "<angle>",
				inherits: !1,
				initialValue: "0deg"
			});
		} catch {}
	}
}
var hc = {
	version: 1,
	label: "Gradient",
	labelKey: "bgLayer.gradient",
	defaults: () => ({
		kind: "linear",
		stops: [{
			color: "#0b0e14",
			share: 50
		}, {
			color: "#1a1030",
			share: 50
		}],
		angle: 160,
		x: .5,
		y: .5,
		animation: "none",
		opacity: 1
	}),
	migrations: {},
	render(e, t) {
		let n = lc(t);
		e.style.opacity = String(t.opacity ?? 1);
		for (let [t, r] of Object.entries(n.styles)) e.style.setProperty(t, r);
		if (n.loop) {
			e.classList.add("urd-bg-loop-host");
			let t = document.createElement("div");
			t.className = "urd-bg-loop-runner", e.appendChild(t);
			let r = () => {
				if (!e.isConnected) return !1;
				let r = e.clientWidth, i = e.clientHeight;
				if (r && i) {
					let e = sc(r, i, n.loop.angle, n.loop.maxShare);
					t.style.inset = `${-Math.ceil(e.period)}px`, t.style.background = cc(n.loop.stops, n.loop.angle, e.period), t.style.setProperty("--urd-loop-dx", `${e.dx}px`), t.style.setProperty("--urd-loop-dy", `${e.dy}px`);
				}
				return !0;
			};
			requestAnimationFrame(r), fc(r);
			return;
		}
		if (n.runner) {
			e.classList.add("urd-bg-loop-host");
			let t = document.createElement("div");
			t.className = n.runner.className, t.style.background = n.runner.background, n.runner.left != null && (t.style.left = n.runner.left), n.runner.top != null && (t.style.top = n.runner.top), e.appendChild(t);
			return;
		}
		e.style.background = n.background, n.className && (e.classList.add(n.className), n.className === "urd-bg-rotate" && mc());
	}
}, gc = {
	version: 1,
	label: "Glow",
	labelKey: "bgLayer.glow",
	defaults: () => ({
		x: .5,
		y: .3,
		color: "accent",
		radius: .5,
		opacity: .35
	}),
	migrations: {},
	render(e, t) {
		let n = Zs(t.color), r = t.x ?? .5, i = t.y ?? .3, a = t.radius ?? .5;
		e.style.background = `radial-gradient(circle at ${r * 100}% ${i * 100}%, ${n} 0%, transparent ${a * 100}%)`, e.style.opacity = String(t.opacity ?? .35);
	}
}, _c = "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22128%22%20height%3D%22128%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%222%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E\")", vc = {
	version: 1,
	label: "Grain",
	labelKey: "bgLayer.grain",
	defaults: () => ({ opacity: .06 }),
	migrations: {},
	render(e, t) {
		e.style.backgroundImage = _c, e.style.backgroundRepeat = "repeat", e.style.opacity = String(t.opacity ?? .06);
	}
}, yc = /^(?:data:image\/[\w.+-]+;base64,[A-Za-z0-9+/=]+|\/(?!\/)[\w%./-]*)$/;
function bc(e) {
	return typeof e == "string" && yc.test(e);
}
//#endregion
//#region ../template/assets/engine/0.7.2/backgrounds/image.js
var xc = .4;
function Sc(e, t) {
	return `${(e ?? .5) * 100}% ${(t ?? .5) * 100}%`;
}
function Cc(e, t) {
	return e === "contain" ? "contain" : e === "cover" ? "cover" : `${Math.max(0, t ?? 1) * 100}%`;
}
function wc(e) {
	let t = "-9999px";
	return e === "up" ? `inset(${t} 0 0 0)` : e === "down" ? `inset(0 0 ${t} 0)` : e === "both" ? `inset(${t} 0 ${t} 0)` : "inset(0)";
}
function Tc(e, t, n, r = .18) {
	let i = Math.max(0, Math.min(1, n)) * xc * t;
	return Math.round(Math.min(i, r * e));
}
function Ec(e, t, n, r, i) {
	let a = e + t / 2, o = (n / 2 - a) * Math.max(0, Math.min(1, r)) * xc, s = i ?? Tc(t, n, r);
	return Math.max(-s, Math.min(s, o)) || 0;
}
var Dc = /* @__PURE__ */ new Set(), Oc = !1, kc = 0;
function Ac() {
	kc = 0;
	for (let e of [...Dc]) e() || Dc.delete(e);
}
function jc() {
	kc ||= requestAnimationFrame(Ac);
}
function Mc(e) {
	Dc.add(e), e(), !(Oc || typeof window > "u") && (Oc = !0, window.addEventListener("scroll", jc, { passive: !0 }), window.addEventListener("resize", jc, { passive: !0 }));
}
function Nc(e, t, n, r) {
	let i = r === "cover" || r === "tile" || r === "repeat", a = e.closest(".urd-section") ?? e.parentElement?.closest(".urd-section") ?? e.parentElement, o = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
	e.style.willChange = "transform";
	let s = (t) => {
		e.style.top = `-${t}px`, e.style.bottom = `-${t}px`;
	}, c = () => {
		if (!e.isConnected) return !1;
		if (o || document.body.classList.contains("urd-mobile")) return s(n), e.style.transform = "", !0;
		let r = (a ?? e).getBoundingClientRect(), c = window.innerHeight || document.documentElement.clientHeight, l = Tc(r.height, c, t, i ? .18 : .6);
		s(i ? Math.max(n, l) : n);
		let u = Ec(r.top, r.height, c, t, l);
		return e.style.transform = `translateY(${u.toFixed(1)}px)`, !0;
	};
	Mc(c), typeof requestAnimationFrame == "function" && requestAnimationFrame(() => requestAnimationFrame(c));
}
function Pc() {
	return typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("animation-timeline", "view()");
}
var Fc = /* @__PURE__ */ new Set(), Ic = !1, Lc = 0;
function Rc() {
	Lc = 0;
	for (let e of [...Fc]) e() || Fc.delete(e);
}
function zc() {
	!Lc && typeof requestAnimationFrame == "function" && (Lc = requestAnimationFrame(Rc));
}
function Bc(e) {
	Fc.add(e), e(), !(Ic || typeof window > "u") && (Ic = !0, window.addEventListener("resize", zc, { passive: !0 }));
}
function Vc(e, t, n, r) {
	let i = r === "cover" || r === "tile" || r === "repeat", a = e.closest(".urd-section") ?? e.parentElement?.closest(".urd-section") ?? e.parentElement;
	e.style.willChange = "transform", e.classList.add("urd-parallax-css");
	let o = () => {
		if (!e.isConnected) return !1;
		let r = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || document.body.classList.contains("urd-mobile"), o = (a ?? e).getBoundingClientRect(), s = window.innerHeight || document.documentElement.clientHeight, c = Tc(o.height, s, t, i ? .18 : .6), l = i && !r ? Math.max(n, c) : n;
		return e.style.setProperty("--urd-px-shift", `${c}px`), e.style.top = `-${l}px`, e.style.bottom = `-${l}px`, !0;
	};
	Bc(o), typeof requestAnimationFrame == "function" && requestAnimationFrame(() => requestAnimationFrame(o));
}
var Hc = {
	version: 2,
	label: "Image",
	labelKey: "bgLayer.image",
	defaults: () => ({
		src: "",
		fit: "plain",
		x: .5,
		y: .5,
		size: 1,
		opacity: 1,
		blur: 0,
		parallax: 0,
		bleed: "none"
	}),
	migrations: { 1: (e) => ({
		...e,
		fit: e.fit === "vanlig" ? "plain" : e.fit === "flislegg" ? "tile" : e.fit === "egen" ? "custom" : e.fit
	}) },
	render(e, t) {
		if (!bc(t.src)) return;
		e.style.opacity = String(t.opacity ?? 1), e.style.clipPath = wc(t.bleed), e.style.zIndex = t.bleed === "down" || t.bleed === "both" ? "1" : "";
		let n = document.createElement("div");
		n.className = "urd-bg-image", n.style.position = "absolute", n.style.left = "0", n.style.right = "0", n.style.top = "0", n.style.bottom = "0";
		let r = t.fit === "tile" || t.fit === "repeat";
		n.style.backgroundImage = `url("${t.src}")`, n.style.backgroundSize = Cc(t.fit, t.size), n.style.backgroundRepeat = r ? "repeat" : "no-repeat", n.style.backgroundPosition = Sc(t.x, t.y);
		let i = 0;
		t.blur > 0 && (n.style.filter = `blur(${t.blur}px)`, i = Math.ceil(t.blur), n.style.left = `-${i}px`, n.style.right = `-${i}px`, n.style.top = `-${i}px`, n.style.bottom = `-${i}px`);
		let a = new Image();
		if (a.src = t.src, !a.complete) {
			e.style.visibility = "hidden";
			let t = () => {
				e.style.visibility = "";
			};
			a.addEventListener("load", t, { once: !0 }), a.addEventListener("error", t, { once: !0 });
		}
		e.appendChild(n), t.parallax > 0 && Uc(n, t.parallax, i, t.fit ?? "cover");
	}
};
function Uc(e, t, n, r) {
	Pc() ? Vc(e, t, n, r) : Nc(e, t, n, r);
}
//#endregion
//#region ../template/assets/engine/0.7.2/gallery-model.js
function Wc(e, t, n) {
	return !Number.isFinite(n) || n < 1 ? 0 : (((Number.isFinite(e) ? e : 0) + t) % n + n) % n;
}
function Gc({ count: e = 0, reducedMotion: t = !1 } = {}) {
	return e >= 2 && !t;
}
function Kc(e, { min: t = 2, fallback: n = 5 } = {}) {
	let r = Number(e);
	return !Number.isFinite(r) || r <= 0 ? n : Math.max(t, r);
}
//#endregion
//#region ../template/assets/engine/0.7.2/backgrounds/slideshow.js
var qc = {
	version: 1,
	label: "Image gallery",
	labelKey: "bgLayer.slideshow",
	defaults: () => ({
		images: [],
		fit: "cover",
		interval: 6,
		fade: 1.5,
		opacity: 1,
		blur: 0
	}),
	migrations: {},
	render(e, t) {
		let n = (t.images ?? []).filter((e) => bc(e?.src));
		if (!n.length) return;
		e.classList.add("urd-bg-slideshow"), e.style.opacity = String(t.opacity ?? 1), t.blur > 0 && (e.style.filter = `blur(${t.blur}px)`, e.style.inset = `-${t.blur * 2}px`);
		let r = Math.max(0, Number(t.fade) || 0);
		e.style.setProperty("--urd-bgg-fade", `${r}s`);
		let i = (e, n) => {
			e.style.backgroundImage = `url("${n.src}")`, e.style.backgroundSize = Cc(t.fit), e.style.backgroundRepeat = "no-repeat", e.style.backgroundPosition = Sc(n.x, n.y);
		}, a = new Image();
		if (a.src = n[0].src, !a.complete) {
			e.style.visibility = "hidden";
			let t = () => {
				e.style.visibility = "";
			};
			a.addEventListener("load", t, { once: !0 }), a.addEventListener("error", t, { once: !0 });
		}
		let o = document.createElement("div");
		o.className = "urd-bg-slide on", i(o, n[0]), e.appendChild(o);
		let s = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (!Gc({
			count: n.length,
			reducedMotion: s
		})) return;
		let c = document.createElement("div");
		c.className = "urd-bg-slide", e.appendChild(c);
		let l = 0, u = o, d = Math.max(Kc(t.interval, { fallback: 6 }), r + .5) * 1e3, f = setInterval(() => {
			if (!e.isConnected) {
				clearInterval(f);
				return;
			}
			if (document.hidden) return;
			let t = Wc(l, 1, n.length), r = new Image();
			r.src = n[t].src;
			let a = () => {
				if (!e.isConnected) return;
				let r = u === o ? c : o;
				i(r, n[t]), r.classList.add("on"), u.classList.remove("on"), u = r, l = t;
			};
			r.complete ? a() : (r.addEventListener("load", a, { once: !0 }), r.addEventListener("error", () => {
				l = t;
			}, { once: !0 }));
		}, d);
	}
}, Jc = /^(?:data:video\/[\w.+-]+;base64,[A-Za-z0-9+/=]+|\/media\/[\w%./-]+\.(?:mp4|webm))$/i;
function Yc(e) {
	return typeof e == "string" && Jc.test(e);
}
var Xc = null;
function Zc(e) {
	Xc ??= new IntersectionObserver((e) => {
		for (let t of e) {
			if (!t.target.isConnected) {
				Xc.unobserve(t.target);
				continue;
			}
			t.isIntersecting ? t.target.play().catch(() => {}) : t.target.pause();
		}
	}, { threshold: 0 }), Xc.observe(e);
}
var Qc = (e, t, n, r) => {
	e.style.position = "absolute", e.style.inset = "0", e.style.width = "100%", e.style.height = "100%", e.style.objectFit = t === "contain" ? "contain" : "cover", e.style.objectPosition = Sc(n, r);
}, $c = {
	version: 1,
	label: "Video",
	labelKey: "bgLayer.video",
	defaults: () => ({
		src: "",
		poster: "",
		fit: "cover",
		x: .5,
		y: .5,
		opacity: 1,
		parallax: 0
	}),
	migrations: {},
	render(e, t) {
		if (!Yc(t.src)) return;
		if (e.style.opacity = String(t.opacity ?? 1), window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
			if (!bc(t.poster)) return;
			let n = document.createElement("img");
			n.className = "urd-bg-video-poster", n.alt = "", n.setAttribute("aria-hidden", "true"), n.src = t.poster, Qc(n, t.fit, t.x, t.y), e.appendChild(n);
			return;
		}
		let n = document.createElement("video");
		n.className = "urd-bg-video", n.muted = !0, n.setAttribute("muted", ""), n.loop = !0, n.playsInline = !0, n.setAttribute("playsinline", ""), n.preload = "metadata", n.disablePictureInPicture = !0, n.setAttribute("aria-hidden", "true"), bc(t.poster) && (n.poster = t.poster), n.src = t.src, Qc(n, t.fit, t.x, t.y), e.appendChild(n), Zc(n), t.parallax > 0 && Uc(n, t.parallax, 0, t.fit === "contain" ? "contain" : "cover");
	}
};
//#endregion
//#region ../template/assets/engine/0.7.2/footer-thumb.js
function el(e = {}) {
	let t = "#2fd6b6", n = "#5c6b64", r = e.mega ? "#16221d" : "#0e1512", i = e.cols ?? 0, a = e.social ?? 0, o = `<svg viewBox="0 0 160 80" preserveAspectRatio="none" aria-hidden="true"><rect width="160" height="80" fill="${r}"/>`;
	if (e.mega && (o += `<circle cx="20" cy="6" r="34" fill="${t}" opacity="0.18"/>`), e.bigcta) return o += `<rect x="45" y="18" width="70" height="8" rx="3" fill="${n}" opacity="0.85"/>`, o += `<rect x="56" y="32" width="48" height="4" rx="2" fill="${n}" opacity="0.5"/>`, o += `<rect x="62" y="43" width="36" height="10" rx="3" fill="${t}"/>`, o += tl(n, e.baselineLinks), o + "</svg>";
	let s = e.center ? 80 : 16;
	if (o += `<rect x="${s - (e.center ? 9 : 0)}" y="14" width="18" height="6" rx="2" fill="${t}"/>`, e.tag && (o += `<rect x="${e.center ? s - 22 : 16}" y="24" width="44" height="3" rx="1.5" fill="${n}" opacity="0.6"/>`), e.cta && (o += `<rect x="16" y="31" width="40" height="8" rx="2" fill="none" stroke="${n}" stroke-width="1" opacity="0.7"/>`, o += `<rect x="58" y="31" width="16" height="8" rx="2" fill="${t}"/>`), e.row) o += `<g fill="${n}" opacity="0.7">` + [
		0,
		1,
		2,
		3
	].map((e) => `<rect x="${44 + e * 20}" y="40" width="14" height="4" rx="2"/>`).join("") + "</g>";
	else if (i) {
		let e = 160 - i * 30 - 6;
		for (let r = 0; r < i; r++) {
			let i = e + r * 30;
			o += `<rect x="${i}" y="16" width="16" height="3" rx="1.5" fill="${t}" opacity="0.8"/>`;
			for (let e = 0; e < 3; e++) o += `<rect x="${i}" y="${24 + e * 7}" width="22" height="3" rx="1.5" fill="${n}" opacity="0.6"/>`;
		}
	}
	let c = e.center ? 80 - a * 9 / 2 : 16;
	for (let e = 0; e < a; e++) o += `<rect x="${c + e * 9}" y="52" width="6.5" height="6.5" rx="2" fill="none" stroke="${n}" stroke-width="1"/>`;
	return o += tl(n, e.baselineLinks), o + "</svg>";
}
function tl(e, t = 0) {
	let n = `<line x1="8" y1="66" x2="152" y2="66" stroke="${e}" stroke-width="0.6" opacity="0.5"/>`;
	return n += `<rect x="8" y="70" width="40" height="3" rx="1.5" fill="${e}" opacity="0.6"/>`, t && (n += `<g fill="${e}" opacity="0.6">` + Array.from({ length: t }, (e, t) => `<rect x="${120 - t * 16}" y="70" width="12" height="3" rx="1.5"/>`).join("") + "</g>"), n;
}
//#endregion
//#region ../template/assets/engine/0.7.2/animations/core.js
var nl = () => ({
	duration: 600,
	delay: 0
}), rl = 90, il = {
	"fade-in": {
		version: 1,
		label: "Fade in",
		labelKey: "anim.fadeIn",
		entrance: !0,
		defaults: nl,
		migrations: {}
	},
	"slide-up": {
		version: 1,
		label: "Slide up",
		labelKey: "anim.slideUp",
		entrance: !0,
		defaults: nl,
		migrations: {}
	},
	"zoom-in": {
		version: 1,
		label: "Zoom in",
		labelKey: "anim.zoomIn",
		entrance: !0,
		defaults: nl,
		migrations: {}
	},
	"hover-lift": {
		version: 1,
		label: "Lift on pointer",
		labelKey: "anim.hoverLift",
		entrance: !1,
		defaults: () => ({}),
		migrations: {}
	},
	stagger: {
		version: 1,
		label: "Stagger (card group)",
		labelKey: "anim.stagger",
		entrance: !0,
		group: !0,
		defaults: () => ({
			duration: 600,
			delay: 0,
			step: rl,
			effect: "slide-up",
			pattern: "sequence"
		}),
		migrations: {}
	}
}, al = [
	["font.system", "system-ui, sans-serif"],
	["font.arial", "Arial, Helvetica, sans-serif"],
	["font.verdana", "Verdana, Geneva, sans-serif"],
	["font.trebuchet", "'Trebuchet MS', sans-serif"],
	["font.georgia", "Georgia, 'Times New Roman', serif"],
	["font.palatino", "'Palatino Linotype', Palatino, serif"],
	["font.courier", "'Courier New', monospace"]
];
//#endregion
//#region ../template/assets/engine/0.7.2/place.js
function ol(e) {
	let t = (e) => Math.round(e * 100) / 100, n = Math.max(0, t(100 - e.w)), r = Math.min(n, Math.max(0, t(e.x - e.w / 2))), i = Math.max(0, e.y - e.h / 2), a = e.snap === !1 || e.grid?.snap === !1, o = e.grid?.size || 8;
	return i = a ? Math.round(i) : Math.round(i / o) * o, {
		x: r,
		y: Math.max(0, i)
	};
}
//#endregion
//#region src/App.svelte
var sl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0.05\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/>", 1), cl = /* @__PURE__ */ B("<button class=\"ghost row-tool svelte-1n46o8q\"></button>"), ll = /* @__PURE__ */ B("<span><span class=\"grad-grip svelte-1n46o8q\"><svg viewBox=\"0 0 16 16\" width=\"14\" height=\"14\" fill=\"currentColor\" aria-hidden=\"true\"><circle cx=\"5\" cy=\"3\" r=\"1.4\"></circle><circle cx=\"11\" cy=\"3\" r=\"1.4\"></circle><circle cx=\"5\" cy=\"8\" r=\"1.4\"></circle><circle cx=\"11\" cy=\"8\" r=\"1.4\"></circle><circle cx=\"5\" cy=\"13\" r=\"1.4\"></circle><circle cx=\"11\" cy=\"13\" r=\"1.4\"></circle></svg></span> <!> <input type=\"range\" class=\"tb-grow svelte-1n46o8q\" min=\"0\" max=\"100\" step=\"1\"/> <span class=\"gridmenu-value svelte-1n46o8q\"> </span> <!></span>"), ul = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/>", 1), dl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"360\" step=\"5\" class=\"svelte-1n46o8q\"/>", 1), fl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <!> <button class=\"ghost action svelte-1n46o8q\"> </button> <!> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0.05\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <!></label>", 1), pl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0.1\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0.05\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/>", 1), ml = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0.01\" max=\"0.3\" step=\"0.01\" class=\"svelte-1n46o8q\"/>", 1), hl = /* @__PURE__ */ B("<div class=\"sizefill svelte-1n46o8q\"><button type=\"button\" class=\"ghost svelte-1n46o8q\"> </button> <button type=\"button\" class=\"ghost svelte-1n46o8q\"> </button></div> <label class=\"svelte-1n46o8q\"> </label> <div class=\"focalpad svelte-1n46o8q\"><span class=\"focaldot svelte-1n46o8q\"></span></div> <label class=\"sub svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"-0.5\" max=\"1.5\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"sub svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"-0.5\" max=\"1.5\" step=\"0.01\" class=\"svelte-1n46o8q\"/>", 1), gl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0.1\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <!></label>", 1), _l = /* @__PURE__ */ B("<label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> </label> <div class=\"sizestep svelte-1n46o8q\"><button type=\"button\" class=\"svelte-1n46o8q\">−</button> <input type=\"number\" min=\"10\" max=\"400\" class=\"svelte-1n46o8q\"/> <span class=\"sizeunit svelte-1n46o8q\">%</span> <button type=\"button\" class=\"svelte-1n46o8q\">+</button></div> <!> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"20\" step=\"1\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0.05\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <!>", 1), vl = /* @__PURE__ */ B("<span class=\"toolbar-row svelte-1n46o8q\"><img class=\"site-icon-preview svelte-1n46o8q\" alt=\"\"/> <span class=\"row-tools svelte-1n46o8q\"><button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span></span> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/>", 1), yl = /* @__PURE__ */ B("<label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" multiple=\"\" class=\"svelte-1n46o8q\"/></label> <!> <label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"2\" max=\"120\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"5\" step=\"0.1\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"20\" step=\"1\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0.05\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <p class=\"panel-hint svelte-1n46o8q\"> </p>", 1), bl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0.1\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/>", 1), xl = /* @__PURE__ */ B("<label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"video/mp4,video/webm\" class=\"svelte-1n46o8q\"/></label> <label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <!></label> <label class=\"sub svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"sub svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0.05\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <!>", 1), Sl = /* @__PURE__ */ B("<div class=\"bg-layer svelte-1n46o8q\"><span class=\"nav-line svelte-1n46o8q\"><!> <span class=\"row-tools svelte-1n46o8q\"><button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span></span> <!></div>"), Cl = /* @__PURE__ */ B("<!> <label class=\"svelte-1n46o8q\"> <!></label> <button class=\"ghost action svelte-1n46o8q\"> </button>", 1), wl = /* @__PURE__ */ B("<input class=\"nav-target svelte-1n46o8q\"/>"), Tl = /* @__PURE__ */ B("<div class=\"nav-row nav-sub-row svelte-1n46o8q\"><input class=\"svelte-1n46o8q\"/> <span class=\"row-tools svelte-1n46o8q\"><button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span> <span class=\"nav-target svelte-1n46o8q\"><!></span> <!></div>"), El = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label>"), Dl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <span class=\"num-stepper svelte-1n46o8q\"><button type=\"button\" class=\"svelte-1n46o8q\">−</button> <input type=\"number\" min=\"1\" max=\"12\" step=\"1\" class=\"svelte-1n46o8q\"/> <button type=\"button\" class=\"svelte-1n46o8q\">+</button></span></label>", 1), Ol = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <!></label> <!> <label class=\"svelte-1n46o8q\"> <!></label> <!> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label>", 1), kl = /* @__PURE__ */ B("<p class=\"panel-hint svelte-1n46o8q\"> </p>"), Al = /* @__PURE__ */ B("<span class=\"nav-line svelte-1n46o8q\"><input class=\"svelte-1n46o8q\"/> <span class=\"row-tools svelte-1n46o8q\"><button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span></span>"), jl = /* @__PURE__ */ B("<label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <p class=\"panel-strong svelte-1n46o8q\"> </p> <!> <button class=\"ghost action svelte-1n46o8q\"> </button>", 1), Ml = /* @__PURE__ */ B("<span class=\"nav-line svelte-1n46o8q\"><input class=\"tl-year svelte-1n46o8q\"/> <input class=\"svelte-1n46o8q\"/> <span class=\"row-tools svelte-1n46o8q\"><button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span></span> <input class=\"svelte-1n46o8q\"/>", 1), Nl = /* @__PURE__ */ B("<p class=\"panel-strong svelte-1n46o8q\"> </p> <!> <button class=\"ghost action svelte-1n46o8q\"> </button>", 1), Pl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label>", 1), Fl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label>", 1), Il = /* @__PURE__ */ B("<span class=\"toolbar-row svelte-1n46o8q\"><button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button></span> <span class=\"toolbar-row svelte-1n46o8q\"><button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button></span> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label>", 1), Ll = /* @__PURE__ */ B("<label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label>"), Rl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"datetime-local\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label>", 1), zl = /* @__PURE__ */ B("<button class=\"ghost svelte-1n46o8q\"> </button>"), Bl = /* @__PURE__ */ B("<label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"audio/*\" class=\"svelte-1n46o8q\"/></label> <!> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label>", 1), Vl = /* @__PURE__ */ B("<input class=\"svelte-1n46o8q\"/>"), Hl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <!></label> <!>", 1), Ul = /* @__PURE__ */ B("<label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <!>", 1), Wl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> </label> <input class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label>", 1), Gl = /* @__PURE__ */ B("<input class=\"token-input svelte-1n46o8q\" maxlength=\"4\"/>"), Kl = /* @__PURE__ */ B("<span class=\"toolbar-row svelte-1n46o8q\"><img class=\"site-icon-preview svelte-1n46o8q\"/> <button class=\"ghost svelte-1n46o8q\"> </button></span>"), ql = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <span class=\"toolbar-row svelte-1n46o8q\"><!> <!></span></label> <!>", 1), Jl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"0\" max=\"100\" class=\"svelte-1n46o8q\"/></label> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label>", 1), Yl = /* @__PURE__ */ B("<span class=\"toolbar-row svelte-1n46o8q\"><button class=\"ghost action svelte-1n46o8q\"> </button> <button class=\"ghost action svelte-1n46o8q\"> </button></span>"), Xl = /* @__PURE__ */ B("<button class=\"ghost action svelte-1n46o8q\"> </button>"), Zl = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <!> <label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"0\" max=\"100\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label>", 1), Ql = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label>", 1), $l = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"email\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input type=\"url\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label>", 1), eu = /* @__PURE__ */ B("<div class=\"bg-layer svelte-1n46o8q\"><span class=\"toolbar-row svelte-1n46o8q\"><img class=\"site-icon-preview svelte-1n46o8q\" alt=\"\"/> <span class=\"row-tools svelte-1n46o8q\"><button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span></span> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label></div>"), tu = /* @__PURE__ */ B("<label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" multiple=\"\" class=\"svelte-1n46o8q\"/></label> <!>", 1), nu = /* @__PURE__ */ B("<p> </p>"), ru = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"text\" class=\"svelte-1n46o8q\"/></label> <button class=\"ghost svelte-1n46o8q\"> </button> <!>", 1), iu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"number\" class=\"svelte-1n46o8q\"/></label>"), au = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"text\" class=\"svelte-1n46o8q\"/></label>"), ou = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <!> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), su = /* @__PURE__ */ B("<p class=\"panel-strong svelte-1n46o8q\"> </p> <!> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), cu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <!></label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), lu = /* @__PURE__ */ B("<label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" class=\"svelte-1n46o8q\"/></label> <!>", 1), uu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <!> <label class=\"svelte-1n46o8q\"> <!></label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), du = /* @__PURE__ */ B("<label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), fu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), pu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"24\" max=\"64\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <!></label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), mu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), hu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"1\" max=\"3\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0.2\" max=\"2\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0.2\" max=\"2\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"2\" step=\"0.01\" class=\"svelte-1n46o8q\"/> <button class=\"ghost action svelte-1n46o8q\"> </button> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), gu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"8\" max=\"400\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <!></label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), _u = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"0\" max=\"6\" class=\"svelte-1n46o8q\"/></label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), vu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"1\" max=\"6\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"32\" step=\"2\" class=\"svelte-1n46o8q\"/>", 1), yu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"2\" max=\"60\" class=\"svelte-1n46o8q\"/></label>"), bu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <!> <!> <label class=\"svelte-1n46o8q\"> <!></label> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), xu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"1\" max=\"40\" class=\"svelte-1n46o8q\"/></label> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), Su = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"100\" max=\"4000\" step=\"100\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"0\" max=\"4000\" step=\"100\" class=\"svelte-1n46o8q\"/></label>", 1), Cu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"0\" max=\"400\" class=\"svelte-1n46o8q\"/></label>"), wu = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <!> <!>", 1), Tu = /* @__PURE__ */ B("<hr class=\"gridmenu-divider svelte-1n46o8q\"/> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <!>", 1), Eu = /* @__PURE__ */ B("<div class=\"frame-grid svelte-1n46o8q\"><label class=\"svelte-1n46o8q\"> <input type=\"number\" step=\"0.5\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input type=\"number\" step=\"1\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input type=\"number\" step=\"0.5\" min=\"1\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input type=\"number\" step=\"1\" min=\"1\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input type=\"number\" step=\"1\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input type=\"number\" step=\"1\" class=\"svelte-1n46o8q\"/></label></div>"), Du = /* @__PURE__ */ B("<!> <label class=\"svelte-1n46o8q\"> <!></label> <!> <label class=\"svelte-1n46o8q\"> <!></label> <!> <hr class=\"gridmenu-divider svelte-1n46o8q\"/> <details class=\"group frame-group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><!> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label></div></details>", 1), Ou = /* @__PURE__ */ B("<div class=\"props-tabs svelte-1n46o8q\"><span class=\"seg svelte-1n46o8q\"><button type=\"button\"> </button> <button type=\"button\"> </button></span></div> <!>", 1), ku = /* @__PURE__ */ B("<button class=\"chrome-restore svelte-1n46o8q\"><!> </button>"), Au = /* @__PURE__ */ B("<div class=\"tool-pop-row svelte-1n46o8q\"><span class=\"mini-label svelte-1n46o8q\"> </span> <input type=\"number\" class=\"tb-num svelte-1n46o8q\" step=\"10\"/> <span class=\"mini-label svelte-1n46o8q\"> </span> <input type=\"number\" class=\"tb-num svelte-1n46o8q\" min=\"0\" step=\"10\" placeholder=\"0\"/></div>"), ju = /* @__PURE__ */ B("<span class=\"seg svelte-1n46o8q\"><button type=\"button\"> </button> <button type=\"button\"> </button></span> <!>", 1), Mu = /* @__PURE__ */ B("<button><!> </button> <!>", 1), Nu = /* @__PURE__ */ B("<div class=\"tool-pop svelte-1n46o8q\"></div>"), Pu = /* @__PURE__ */ B("<span class=\"toolmenu svelte-1n46o8q\"><button><!><!></button> <!></span>"), Fu = /* @__PURE__ */ B("<div class=\"tool-pop svelte-1n46o8q\"><!></div>"), Iu = /* @__PURE__ */ B("<span class=\"toolmenu svelte-1n46o8q\"><button></button> <!></span>"), Lu = /* @__PURE__ */ B("<button></button>"), Ru = /* @__PURE__ */ B("<span class=\"tool-cap svelte-1n46o8q\"> </span> <span class=\"viewswitch toolgrp svelte-1n46o8q\"></span>", 1), zu = /* @__PURE__ */ B("<div class=\"tool-pop svelte-1n46o8q\"><div class=\"tool-pop-row svelte-1n46o8q\"><button class=\"ghost svelte-1n46o8q\"></button> <span class=\"zoom-readout svelte-1n46o8q\"> </span> <button class=\"ghost svelte-1n46o8q\"></button></div> <button><!> </button></div>"), Bu = /* @__PURE__ */ B("<span class=\"toolmenu svelte-1n46o8q\"><button><span class=\"zoom-cap svelte-1n46o8q\"> </span><!></button> <!></span>"), Vu = /* @__PURE__ */ B("<span class=\"tool-cap svelte-1n46o8q\"> </span> <span class=\"zoomswitch toolgrp svelte-1n46o8q\"><button class=\"ghost svelte-1n46o8q\"></button> <span class=\"zoom-readout svelte-1n46o8q\"> </span> <button class=\"ghost svelte-1n46o8q\"></button> <button></button></span>", 1), Hu = /* @__PURE__ */ B("<div class=\"tool-pop svelte-1n46o8q\"><button><!> </button> <button><!> </button></div>"), Uu = /* @__PURE__ */ B("<span class=\"tool-cap svelte-1n46o8q\"> </span> <span class=\"toolgrp svelte-1n46o8q\"><button></button> <button></button></span>", 1), Wu = /* @__PURE__ */ B("<button class=\"ghost page-btn svelte-1n46o8q\"> </button> <span class=\"toolset svelte-1n46o8q\"><!> <!> <!></span>", 1), Gu = /* @__PURE__ */ B("<button class=\"badge attention svelte-1n46o8q\"><!> <span class=\"btn-label svelte-1n46o8q\"> </span> <span class=\"badge-mini svelte-1n46o8q\"> </span></button>"), Ku = /* @__PURE__ */ B("<button class=\"discard-confirm svelte-1n46o8q\"><!> </button>"), qu = /* @__PURE__ */ B("<span class=\"draft-cluster svelte-1n46o8q\"><span class=\"chip draft-chip svelte-1n46o8q\"><span class=\"chip-full svelte-1n46o8q\" aria-hidden=\"true\"> </span> <span class=\"chip-mini svelte-1n46o8q\" aria-hidden=\"true\">!</span></span>  <span class=\"discard-wrap svelte-1n46o8q\"><button><!><span class=\"discard-label svelte-1n46o8q\"> </span></button> <!></span></span>"), Ju = /* @__PURE__ */ B("<!> <span class=\"btn-label svelte-1n46o8q\"> </span>", 1), Yu = /* @__PURE__ */ B("<span class=\"who svelte-1n46o8q\"><!> </span>"), Xu = /* @__PURE__ */ B("<a class=\"ghost svelte-1n46o8q\" href=\"/api/github/login\"> </a>"), Zu = /* @__PURE__ */ B("<button class=\"ghost svelte-1n46o8q\"><!></button> <!> <a class=\"ghost svelte-1n46o8q\" target=\"_blank\" rel=\"noopener\"><!> <span class=\"btn-label svelte-1n46o8q\"> </span></a> <button class=\"primary svelte-1n46o8q\"> </button>", 1), Qu = /* @__PURE__ */ B("<button> </button>"), $u = /* @__PURE__ */ B("<span class=\"rail-group svelte-1n46o8q\"> </span> <!>", 1), ed = /* @__PURE__ */ B("<div class=\"settings-pop svelte-1n46o8q\"><p class=\"panel-strong svelte-1n46o8q\"> </p> <label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <!></label></div>"), td = /* @__PURE__ */ B("<span class=\"page-path svelte-1n46o8q\">/</span>"), nd = /* @__PURE__ */ B("<input class=\"page-slug svelte-1n46o8q\"/>"), rd = /* @__PURE__ */ B("<span class=\"seo-warn svelte-1n46o8q\"></span>"), id = /* @__PURE__ */ B("<button class=\"ghost danger svelte-1n46o8q\"><!> </button>"), ad = /* @__PURE__ */ B("<div class=\"page-menu svelte-1n46o8q\"><button class=\"ghost svelte-1n46o8q\"><!> </button> <!></div>"), od = /* @__PURE__ */ B("<div><input class=\"page-title svelte-1n46o8q\"/> <!> <!> <span class=\"row-tools svelte-1n46o8q\"><button class=\"ghost row-tool svelte-1n46o8q\"></button> <span class=\"page-menu-wrap svelte-1n46o8q\"><button class=\"ghost row-tool svelte-1n46o8q\"></button> <!></span></span></div>"), sd = /* @__PURE__ */ B("<img class=\"site-icon-preview svelte-1n46o8q\"/>"), cd = /* @__PURE__ */ B("<div><button class=\"page-template-pick svelte-1n46o8q\"><span class=\"page-template-thumb svelte-1n46o8q\"></span> <span class=\"page-template-name svelte-1n46o8q\"> </span></button></div>"), ld = /* @__PURE__ */ B("<div><button class=\"page-template-pick svelte-1n46o8q\"><span class=\"page-template-thumb svelte-1n46o8q\"></span> <span class=\"page-template-name svelte-1n46o8q\"> </span></button> <button class=\"page-template-del svelte-1n46o8q\"></button></div>"), ud = /* @__PURE__ */ B("<span class=\"mini-label svelte-1n46o8q\"> </span> <div class=\"page-template-grid svelte-1n46o8q\"></div>", 1), dd = /* @__PURE__ */ B("<div class=\"panel-body svelte-1n46o8q\"><!> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><label class=\"svelte-1n46o8q\"> <textarea rows=\"2\" class=\"svelte-1n46o8q\"></textarea></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <textarea rows=\"2\" class=\"svelte-1n46o8q\"></textarea></label> <label class=\"svelte-1n46o8q\"> <!></label> <span class=\"toolbar-row svelte-1n46o8q\"><label class=\"ghost filepick tb-grow svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" class=\"svelte-1n46o8q\"/></label> <!></span> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label></div></details> <hr class=\"gridmenu-divider svelte-1n46o8q\"/> <input class=\"svelte-1n46o8q\"/> <button class=\"ghost action svelte-1n46o8q\"> </button> <span class=\"mini-label svelte-1n46o8q\"> </span> <div class=\"page-template-grid svelte-1n46o8q\"><div><button class=\"page-template-pick svelte-1n46o8q\"><span class=\"page-template-thumb svelte-1n46o8q\"></span> <span class=\"page-template-name svelte-1n46o8q\"> </span></button></div> <!></div> <!></div>"), fd = /* @__PURE__ */ B("<input class=\"svelte-1n46o8q\"/> <span class=\"toolbar-row svelte-1n46o8q\"><!> <input type=\"number\" class=\"tb-num svelte-1n46o8q\" min=\"8\" max=\"96\" placeholder=\"px\"/> <button><b> </b></button> <button><i> </i></button></span>", 1), pd = /* @__PURE__ */ B("<span class=\"toolbar-row svelte-1n46o8q\"><label class=\"ghost filepick tb-grow svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" class=\"svelte-1n46o8q\"/></label> <input type=\"number\" class=\"tb-num svelte-1n46o8q\" min=\"12\" max=\"128\"/> <input type=\"number\" class=\"tb-num svelte-1n46o8q\" min=\"0\" max=\"64\"/></span>"), md = /* @__PURE__ */ B("<label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label>", 1), hd = /* @__PURE__ */ B("<label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <!>", 1), gd = /* @__PURE__ */ B("<div class=\"nav-row svelte-1n46o8q\"><input class=\"svelte-1n46o8q\"/> <span class=\"row-tools svelte-1n46o8q\"><button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span> <span class=\"nav-target svelte-1n46o8q\"><!></span> <!></div> <!>", 1), _d = /* @__PURE__ */ B("<div class=\"panel-body svelte-1n46o8q\"><details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><label class=\"svelte-1n46o8q\"> <!></label> <!> <!> <!></div></details> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><label class=\"svelte-1n46o8q\"> <!></label> <!> <!> <!> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <!></label> <!> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <!> <label class=\"svelte-1n46o8q\"> <!></label> <!> <!> <label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <!></label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/> <p class=\"panel-strong svelte-1n46o8q\"> </p> <!></div></details> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><label class=\"svelte-1n46o8q\"> <!></label> <!> <label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"1\" max=\"4\" class=\"svelte-1n46o8q\"/></label></div></details> <details class=\"group svelte-1n46o8q\" open=\"\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><!> <button class=\"ghost action svelte-1n46o8q\"> </button></div></details></div>"), vd = /* @__PURE__ */ B("<div class=\"cw-row svelte-1n46o8q\"><span class=\"mini-label cw-screen svelte-1n46o8q\"> </span> <span><span class=\"cw-fill svelte-1n46o8q\"></span></span> <span class=\"gridmenu-value cw-margin svelte-1n46o8q\"> </span></div>"), yd = /* @__PURE__ */ B("<div class=\"mini-label cw-binds svelte-1n46o8q\"> </div>"), bd = /* @__PURE__ */ B("<div class=\"ctl-row svelte-1n46o8q\"><span class=\"mini-label svelte-1n46o8q\"> </span> <input type=\"range\" class=\"svelte-1n46o8q\"/> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></div>"), xd = /* @__PURE__ */ B("<button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button>", 1), Sd = /* @__PURE__ */ B("<div class=\"panel-body svelte-1n46o8q\"><label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <!></label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/> <p class=\"panel-strong svelte-1n46o8q\"> </p> <div class=\"sample cw-sample svelte-1n46o8q\"><!> <div class=\"cw-legend svelte-1n46o8q\"><span class=\"mini-label svelte-1n46o8q\"> </span> <span class=\"mini-label svelte-1n46o8q\"> </span></div> <!></div> <div class=\"seg cw-seg svelte-1n46o8q\"></div> <!> <p class=\"mini-label svelte-1n46o8q\"> </p> <div class=\"seg cw-seg svelte-1n46o8q\"></div> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><div class=\"ctl-row svelte-1n46o8q\"><span class=\"mini-label svelte-1n46o8q\"> </span> <input type=\"range\" class=\"svelte-1n46o8q\"/> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></div></div></details> <hr class=\"gridmenu-divider svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <!></label> <span class=\"toolbar-row svelte-1n46o8q\"><label class=\"ghost filepick tb-grow svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" class=\"svelte-1n46o8q\"/></label> <!></span></div>"), Cd = /* @__PURE__ */ B("<div class=\"mini-label tpv-cap svelte-1n46o8q\"> </div>"), wd = /* @__PURE__ */ B("<div class=\"theme-pvw svelte-1n46o8q\"><!> <div class=\"tpv-demo svelte-1n46o8q\"><div class=\"tpv-h svelte-1n46o8q\"> </div> <div class=\"tpv-card svelte-1n46o8q\"> </div> <div class=\"tpv-row svelte-1n46o8q\"><span class=\"tpv-btn svelte-1n46o8q\"> </span><span class=\"tpv-lnk svelte-1n46o8q\"> </span></div></div></div>"), Td = /* @__PURE__ */ B("<button type=\"button\"><span class=\"tp-band svelte-1n46o8q\"><i class=\"svelte-1n46o8q\"></i><i class=\"svelte-1n46o8q\"></i><i class=\"svelte-1n46o8q\"></i><i class=\"svelte-1n46o8q\"></i></span> <small class=\"svelte-1n46o8q\"> </small></button>"), Ed = /* @__PURE__ */ B("<div class=\"ctl-row autorow svelte-1n46o8q\"><span class=\"autolbl svelte-1n46o8q\"> </span> <span class=\"seg svelte-1n46o8q\"><button type=\"button\"> </button> <button type=\"button\"> </button></span></div>"), Dd = /* @__PURE__ */ B("<span class=\"mini-label svelte-1n46o8q\"> </span>"), Od = /* @__PURE__ */ B("<div class=\"palcol svelte-1n46o8q\"><!> <span class=\"palcap svelte-1n46o8q\"> </span> <b class=\"palhex svelte-1n46o8q\"> </b></div>"), kd = /* @__PURE__ */ B("<div class=\"ctl-row palhead svelte-1n46o8q\"><span class=\"mini-label svelte-1n46o8q\"> </span> <button type=\"button\"> </button></div> <div></div>", 1), Ad = /* @__PURE__ */ B("<div class=\"panel-body svelte-1n46o8q\"><p class=\"panel-strong svelte-1n46o8q\"> </p> <div class=\"theme-presets svelte-1n46o8q\"></div> <p class=\"panel-strong svelte-1n46o8q\"> </p> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <!> <div class=\"ctl-row palhead svelte-1n46o8q\"><!> <button type=\"button\"> </button></div> <div class=\"palcells svelte-1n46o8q\"></div> <!> <div class=\"theme-previews svelte-1n46o8q\"><!> <!></div> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <!></label> <div class=\"sample typo-sample svelte-1n46o8q\"><div class=\"ts-h svelte-1n46o8q\"> </div> <div class=\"ts-b svelte-1n46o8q\"> </div></div></div></details> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><div class=\"sample form-prev svelte-1n46o8q\"><span class=\"fp-btn svelte-1n46o8q\"> </span> <span class=\"fp-card svelte-1n46o8q\"> </span></div> <label class=\"ctl-row svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"24\" step=\"1\" class=\"svelte-1n46o8q\"/> <label class=\"ctl-row svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"0\" max=\"40\" step=\"1\" class=\"svelte-1n46o8q\"/></div></details></div>"), jd = /* @__PURE__ */ B("<label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" class=\"svelte-1n46o8q\"/></label>"), Md = /* @__PURE__ */ B("<label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" multiple=\"\" class=\"svelte-1n46o8q\"/></label>"), Nd = /* @__PURE__ */ B("<details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"></div></details>"), Pd = /* @__PURE__ */ B("<details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button></div></details> <button class=\"ghost svelte-1n46o8q\"> </button> <label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" class=\"svelte-1n46o8q\"/></label> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><button class=\"ghost svelte-1n46o8q\"> </button> <label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" multiple=\"\" class=\"svelte-1n46o8q\"/></label></div></details> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"ghost svelte-1n46o8q\"> </button></div></details> <!> <!>", 1), Fd = /* @__PURE__ */ B("<div><input type=\"text\" class=\"svelte-1n46o8q\"/> <!></div>"), Id = /* @__PURE__ */ B("<div class=\"panel-body svelte-1n46o8q\"><label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"4\" max=\"96\" step=\"2\" class=\"svelte-1n46o8q\"/> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label></div>"), Ld = /* @__PURE__ */ B("<p class=\"panel-strong svelte-1n46o8q\"> </p> <!>", 1), Rd = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"4\" max=\"96\" step=\"2\" class=\"svelte-1n46o8q\"/>", 1), zd = /* @__PURE__ */ B("<button><span class=\"rs-sample svelte-1n46o8q\"><i class=\"rs-line svelte-1n46o8q\"></i> <i class=\"rs-chip svelte-1n46o8q\"></i> <i class=\"rs-dot svelte-1n46o8q\"></i></span> <span class=\"rs-name svelte-1n46o8q\"> </span></button>"), Bd = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"0\" max=\"1000\" step=\"10\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <!></label>", 1), Vd = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"100\" max=\"4000\" step=\"100\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"0\" max=\"4000\" step=\"100\" class=\"svelte-1n46o8q\"/></label> <!>", 1), Hd = /* @__PURE__ */ B("<p class=\"panel-strong svelte-1n46o8q\"> </p> <label class=\"svelte-1n46o8q\"> <input class=\"token-input svelte-1n46o8q\"/></label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <!> <hr class=\"gridmenu-divider svelte-1n46o8q\"/> <p class=\"panel-strong svelte-1n46o8q\"> </p> <div class=\"rs-grid svelte-1n46o8q\"></div> <label class=\"svelte-1n46o8q\"> <span class=\"row-tools svelte-1n46o8q\"><span class=\"gridmenu-value svelte-1n46o8q\"> </span> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span></label> <hr class=\"gridmenu-divider svelte-1n46o8q\"/> <p class=\"panel-strong svelte-1n46o8q\"> </p> <!> <hr class=\"gridmenu-divider svelte-1n46o8q\"/> <label class=\"svelte-1n46o8q\"> <!></label> <!> <label class=\"svelte-1n46o8q\"> <!></label>", 1), Ud = /* @__PURE__ */ B("<div class=\"panel-body svelte-1n46o8q\"><!></div>"), Wd = /* @__PURE__ */ B("<button class=\"footer-tp svelte-1n46o8q\"><span class=\"footer-tp-thumb svelte-1n46o8q\"></span> <span class=\"footer-tp-name svelte-1n46o8q\"> </span></button>"), Gd = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <span class=\"gridmenu-value svelte-1n46o8q\"> </span></label> <input type=\"range\" min=\"16\" max=\"160\" step=\"2\" class=\"svelte-1n46o8q\"/>", 1), Kd = /* @__PURE__ */ B("<span class=\"toolbar-row svelte-1n46o8q\"><label class=\"ghost filepick tb-grow svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" class=\"svelte-1n46o8q\"/></label> <!></span> <!>", 1), qd = /* @__PURE__ */ B("<div class=\"nav-row svelte-1n46o8q\"><input class=\"svelte-1n46o8q\"/> <span class=\"row-tools svelte-1n46o8q\"><button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span></div> <!>", 1), Jd = /* @__PURE__ */ B("<div class=\"nav-row svelte-1n46o8q\"><span class=\"nav-line svelte-1n46o8q\"><span class=\"footer-soc-preview svelte-1n46o8q\" aria-hidden=\"true\"></span> <!></span> <span class=\"row-tools svelte-1n46o8q\"><button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span> <input class=\"nav-target svelte-1n46o8q\"/></div>"), Yd = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <!>", 1), Xd = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <!></label> <label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <!>", 1), Zd = /* @__PURE__ */ B("<div class=\"panel-body svelte-1n46o8q\"><label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <!> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><div class=\"footer-tpick svelte-1n46o8q\"></div></div></details> <details class=\"group svelte-1n46o8q\" open=\"\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <!></label> <!></div></details> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><!> <button class=\"ghost action svelte-1n46o8q\"> </button> <label class=\"svelte-1n46o8q\"> <!></label></div></details> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><!> <button class=\"ghost action svelte-1n46o8q\"> </button></div></details> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><label class=\"gridmenu-snap svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <!></div></details> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><!> <button class=\"ghost action svelte-1n46o8q\"> </button></div></details> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><!> <p class=\"panel-strong svelte-1n46o8q\"> </p> <!></div></details> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <p class=\"panel-strong svelte-1n46o8q\"> </p> <!> <button class=\"ghost action svelte-1n46o8q\"> </button></div></details></div>"), Qd = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"date\" class=\"svelte-1n46o8q\"/></label>"), $d = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label>"), ef = /* @__PURE__ */ B("<img class=\"site-icon-preview svelte-1n46o8q\" alt=\"\"/> <button class=\"ghost row-tool svelte-1n46o8q\"></button>", 1), tf = /* @__PURE__ */ B("<img class=\"site-icon-preview svelte-1n46o8q\" alt=\"\"/>"), nf = /* @__PURE__ */ B("<span class=\"toolbar-row svelte-1n46o8q\"><input class=\"svelte-1n46o8q\"/> <label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" class=\"svelte-1n46o8q\"/></label> <!> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span>"), rf = /* @__PURE__ */ B("<label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"0\" step=\"0.01\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input type=\"number\" min=\"0\" step=\"0.01\" class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <!> <button class=\"ghost action svelte-1n46o8q\"> </button>", 1), af = /* @__PURE__ */ B("<details class=\"group collection-entry svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><span class=\"toolbar-row svelte-1n46o8q\"><input class=\"svelte-1n46o8q\"/> <span class=\"row-tools svelte-1n46o8q\"><button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span></span> <!> <textarea rows=\"3\" class=\"svelte-1n46o8q\"></textarea> <!> <span class=\"toolbar-row svelte-1n46o8q\"><label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\"image/*\" class=\"svelte-1n46o8q\"/></label> <!></span> <!></div></details>"), of = /* @__PURE__ */ B("<span class=\"toolbar-row svelte-1n46o8q\"><button class=\"ghost action svelte-1n46o8q\"> </button> <button class=\"ghost action svelte-1n46o8q\"> </button> <label class=\"ghost filepick svelte-1n46o8q\"> <input type=\"file\" accept=\".csv,text/csv\" class=\"svelte-1n46o8q\"/></label> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span> <!> <!> <hr class=\"gridmenu-divider svelte-1n46o8q\"/>", 1), sf = /* @__PURE__ */ B("<div class=\"panel-body svelte-1n46o8q\"><!> <!> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <!></label> <button class=\"ghost action svelte-1n46o8q\"> </button></div>"), cf = /* @__PURE__ */ B("<span class=\"plugin-meta svelte-1n46o8q\"> </span>"), lf = /* @__PURE__ */ B("<p class=\"panel-hint plugin-warn svelte-1n46o8q\"> </p>"), uf = /* @__PURE__ */ B("<div><span class=\"plugin-head svelte-1n46o8q\"><span class=\"plugin-name svelte-1n46o8q\"> </span> <!> <span class=\"row-tools svelte-1n46o8q\"><label class=\"gridmenu-snap plugin-toggle svelte-1n46o8q\"><input type=\"checkbox\" class=\"svelte-1n46o8q\"/> </label> <button class=\"ghost row-tool svelte-1n46o8q\"></button></span></span> <!> <!></div>"), df = /* @__PURE__ */ B("<div class=\"plugin-row svelte-1n46o8q\"><span class=\"plugin-head svelte-1n46o8q\"><span class=\"plugin-name svelte-1n46o8q\"> </span> <!> <span class=\"row-tools svelte-1n46o8q\"><button class=\"ghost row-tool svelte-1n46o8q\"></button></span></span></div>"), ff = /* @__PURE__ */ B("<hr class=\"gridmenu-divider svelte-1n46o8q\"/> <p class=\"panel-strong svelte-1n46o8q\"> </p> <!>", 1), pf = /* @__PURE__ */ B("<hr class=\"gridmenu-divider svelte-1n46o8q\"/> <input class=\"svelte-1n46o8q\"/> <button class=\"ghost action svelte-1n46o8q\"> </button> <!>", 1), mf = /* @__PURE__ */ B("<div class=\"panel-body svelte-1n46o8q\"><!> <!> <!> <!></div>"), hf = /* @__PURE__ */ B("<div><span class=\"history-msg svelte-1n46o8q\"> </span> <span class=\"history-meta svelte-1n46o8q\"> </span></div>"), gf = /* @__PURE__ */ B("<button class=\"ghost svelte-1n46o8q\"> </button> <!>", 1), _f = /* @__PURE__ */ B("<!> <!>", 1), vf = /* @__PURE__ */ B("<p class=\"panel-hint svelte-1n46o8q\"> </p> <button class=\"ghost svelte-1n46o8q\"> </button>", 1), yf = /* @__PURE__ */ B("<span class=\"update-arrow svelte-1n46o8q\"></span> <span class=\"badge svelte-1n46o8q\"> </span>", 1), bf = /* @__PURE__ */ B("<details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"><p class=\"update-notes svelte-1n46o8q\"> </p></div></details>"), xf = /* @__PURE__ */ B("<details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"><span class=\"update-warn svelte-1n46o8q\"></span> </summary> <div class=\"group-items svelte-1n46o8q\"><pre class=\"update-headers svelte-1n46o8q\"> </pre></div></details>"), Sf = /* @__PURE__ */ B("<span class=\"chip svelte-1n46o8q\"> </span>"), Cf = /* @__PURE__ */ B("<div class=\"update-row svelte-1n46o8q\"><span class=\"update-path svelte-1n46o8q\"> </span> <span class=\"update-flags svelte-1n46o8q\"><!> <span class=\"update-warn svelte-1n46o8q\"></span></span></div>"), wf = /* @__PURE__ */ B("<div class=\"update-row svelte-1n46o8q\"><span class=\"update-path svelte-1n46o8q\"> </span> <!></div>"), Tf = /* @__PURE__ */ B("<span class=\"update-warn svelte-1n46o8q\"></span>"), Ef = /* @__PURE__ */ B("<div class=\"update-row svelte-1n46o8q\"><span> </span> <span class=\"update-flags svelte-1n46o8q\"><!> <!> <input type=\"checkbox\" class=\"svelte-1n46o8q\"/></span></div>"), Df = /* @__PURE__ */ B("<div class=\"ctl-row update-opt-head svelte-1n46o8q\"><p class=\"panel-strong svelte-1n46o8q\"> </p> <span class=\"mini-label svelte-1n46o8q\"> </span></div> <!>", 1), Of = /* @__PURE__ */ B("<p class=\"update-summary svelte-1n46o8q\"> </p> <!> <!> <!> <details class=\"group svelte-1n46o8q\"><summary class=\"svelte-1n46o8q\"> </summary> <div class=\"group-items svelte-1n46o8q\"></div></details> <!> <button class=\"primary update-run svelte-1n46o8q\"> </button>", 1), kf = /* @__PURE__ */ B("<div class=\"update-versions svelte-1n46o8q\"><span class=\"update-from svelte-1n46o8q\"> </span> <!></div> <!>", 1), Af = /* @__PURE__ */ B("<aside class=\"panel svelte-1n46o8q\"><h2 class=\"svelte-1n46o8q\"> </h2> <!></aside>"), jf = /* @__PURE__ */ B("<nav class=\"rail svelte-1n46o8q\"><!> <span class=\"rail-settings svelte-1n46o8q\"><span class=\"rail-brand svelte-1n46o8q\" title=\"Urd\"><svg class=\"brand-mark svelte-1n46o8q\" viewBox=\"10.3 8.3 19.4 25.4\" aria-hidden=\"true\"><path d=\"M12 32V10l16 6.5V32\" fill=\"none\" stroke=\"var(--urd-brand)\" stroke-width=\"3.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg> <span class=\"brand-word svelte-1n46o8q\">Urd</span></span> <button></button> <!></span></nav> <!>", 1), Mf = /* @__PURE__ */ B("<div class=\"workspace svelte-1n46o8q\"><!> <div><div class=\"stage svelte-1n46o8q\"><iframe class=\"svelte-1n46o8q\"></iframe></div></div></div>"), Nf = /* @__PURE__ */ B("<p class=\"loading svelte-1n46o8q\"> </p>"), Pf = /* @__PURE__ */ B("<p class=\"panel-hint confirm-line svelte-1n46o8q\"> </p>"), Ff = /* @__PURE__ */ B("<div class=\"setup-overlay svelte-1n46o8q\"><div class=\"setup-card svelte-1n46o8q\"><h2 class=\"svelte-1n46o8q\"> </h2> <!> <!> <span class=\"setup-actions svelte-1n46o8q\"><button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"primary svelte-1n46o8q\"> </button></span></div></div>"), If = /* @__PURE__ */ B("<div class=\"setup-overlay svelte-1n46o8q\"><div class=\"setup-card svelte-1n46o8q\"><h2 class=\"svelte-1n46o8q\"> </h2> <p class=\"panel-hint svelte-1n46o8q\"> </p> <label class=\"svelte-1n46o8q\"> <input class=\"svelte-1n46o8q\"/></label> <label class=\"svelte-1n46o8q\"> <!></label> <label class=\"svelte-1n46o8q\"> <!></label> <p class=\"panel-hint svelte-1n46o8q\"> </p> <span class=\"setup-actions svelte-1n46o8q\"><button class=\"ghost svelte-1n46o8q\"> </button> <button class=\"primary svelte-1n46o8q\"> </button></span></div></div>"), Lf = /* @__PURE__ */ B("<div><span> </span> <button class=\"toast-x svelte-1n46o8q\">×</button></div>"), Rf = /* @__PURE__ */ B("<div class=\"block-menu svelte-1n46o8q\"><header class=\"block-menu-head svelte-1n46o8q\"><span> </span> <button class=\"ghost row-tool svelte-1n46o8q\"></button></header> <div class=\"panel-body block-menu-body svelte-1n46o8q\"><!></div></div>"), zf = /* @__PURE__ */ B("<div class=\"editor svelte-1n46o8q\"><!> <header><span class=\"topbar-group svelte-1n46o8q\"><!> <!></span> <span class=\"topbar-group topbar-draft svelte-1n46o8q\"><!></span> <span class=\"topbar-group topbar-right svelte-1n46o8q\"><!></span></header> <!> <!> <!> <!> <!></div>   <!>", 1);
function Bf(e, t) {
	Xe(t, !0);
	let n = (e, t = f, n = f) => {
		var r = Cl(), i = P(r);
		Zr(i, 17, n, qr, (e, r, i) => {
			var a = Sl(), s = N(a), l = N(s);
			{
				let e = /* @__PURE__ */ O(() => J("tip.bg.changeType")), n = /* @__PURE__ */ O(() => o.map(([e, t]) => [e, t.labelKey ? J(t.labelKey) : t.label]));
				Y(l, {
					get value() {
						return R(r).type;
					},
					get title() {
						return R(e);
					},
					get options() {
						return R(n);
					},
					onchange: (e) => tr(t(), i, e)
				});
			}
			var u = I(l, 2), d = N(u);
			d.disabled = i === 0, W(d, () => c.up, !0), w(d);
			var f = I(d, 2);
			W(f, () => c.down, !0), w(f);
			var p = I(f, 2);
			W(p, () => c.cross, !0), w(p), w(u), w(s);
			var m = I(s, 2), h = (e) => {
				var n = sl(), a = P(n), o = N(a), s = I(o);
				{
					let e = /* @__PURE__ */ O(yr), n = /* @__PURE__ */ O(() => J("tip.bg.layerColor"));
					fa(s, {
						get value() {
							return R(r).props.value;
						},
						get tokens() {
							return R(e);
						},
						get label() {
							return R(n);
						},
						onchange: (e) => Rn(t(), i, "value", e)
					});
				}
				w(a);
				var c = I(a, 2), l = N(c), u = F(I(l));
				w(c);
				var d = I(c, 2);
				G(d), L((e, t, n) => {
					H(o, `${e ?? ""} `), H(l, `${t ?? ""} `), H(u, `${n ?? ""}%`), K(d, R(r).props.opacity ?? 1);
				}, [
					() => J("lbl.color"),
					() => J("lbl.strength"),
					() => Math.round((R(r).props.opacity ?? 1) * 100)
				]), z("input", d, (e) => Rn(t(), i, "opacity", Number(e.target.value))), V(e, n);
			}, g = (e) => {
				let n = /* @__PURE__ */ O(() => Wn(R(r))), a = /* @__PURE__ */ O(() => R(n).stops.reduce((e, t) => e + Math.max(0, Number(t.share) || 0), 0));
				var o = fl(), s = P(o), l = N(s), u = I(l);
				{
					let e = /* @__PURE__ */ O(() => R(n).kind ?? "linear"), r = /* @__PURE__ */ O(() => [["linear", J("opt.grad.linear")], ["radial", J("opt.grad.radial")]]);
					Y(u, {
						get value() {
							return R(e);
						},
						get options() {
							return R(r);
						},
						onchange: (e) => Jn(t(), i, e)
					});
				}
				w(s);
				var d = I(s, 2);
				Zr(d, 17, () => R(n).stops, qr, (e, r, o) => {
					var s = ll();
					let l;
					var u = N(s), d = I(u, 2);
					{
						let e = /* @__PURE__ */ O(yr), n = /* @__PURE__ */ O(() => J("tip.bg.stopColor"));
						fa(d, {
							get value() {
								return R(r).color;
							},
							get tokens() {
								return R(e);
							},
							get label() {
								return R(n);
							},
							onchange: (e) => Yn(t(), i, o, { color: e })
						});
					}
					var f = I(d, 2);
					G(f);
					var p = I(f, 2), m = F(p), h = I(p, 2), g = (e) => {
						var n = cl();
						W(n, () => c.cross, !0), w(n), L((e) => q(n, "title", e), [() => J("tip.bg.removeStop")]), z("click", n, () => Zn(t(), i, o)), V(e, n);
					};
					U(h, (e) => {
						R(n).stops.length > 2 && e(g);
					}), w(s), L((e, t, a) => {
						l = vi(s, 1, "nav-line grad-stop svelte-1n46o8q", null, l, {
							dragging: R($n)?.layer === i && R($n).from === o,
							"drop-above": R($n)?.layer === i && R($n).insert === o,
							"drop-below": R($n)?.layer === i && R($n).insert === R(n).stops.length && o === R(n).stops.length - 1
						}), q(u, "title", e), K(f, R(r).share ?? 50), q(f, "title", t), H(m, `${a ?? ""}%`);
					}, [
						() => J("tip.bg.dragStop"),
						() => J("tip.bg.stopShare"),
						() => R(a) > 0 ? Math.round(Math.max(0, Number(R(r).share) || 0) / R(a) * 100) : Math.round(100 / R(n).stops.length)
					]), z("pointerdown", u, (e) => er(t(), e, i, o)), z("input", f, (e) => Yn(t(), i, o, { share: Number(e.target.value) })), V(e, s);
				});
				var f = I(d, 2), p = F(f, !0), m = I(f, 2), h = (e) => {
					var r = ul(), a = P(r), o = N(a), s = F(I(o));
					w(a);
					var c = I(a, 2);
					G(c);
					var l = I(c, 2), u = N(l), d = F(I(u));
					w(l);
					var f = I(l, 2);
					G(f), L((e, t, r, i) => {
						H(o, `${e ?? ""} `), H(s, `${t ?? ""}%`), K(c, R(n).x ?? .5), H(u, `${r ?? ""} `), H(d, `${i ?? ""}%`), K(f, R(n).y ?? .5);
					}, [
						() => J("lbl.centerX"),
						() => Math.round((R(n).x ?? .5) * 100),
						() => J("lbl.centerY"),
						() => Math.round((R(n).y ?? .5) * 100)
					]), z("input", c, (e) => Kn(t(), i, "x", Number(e.target.value))), z("input", f, (e) => Kn(t(), i, "y", Number(e.target.value))), V(e, r);
				}, g = (e) => {
					var r = dl(), a = P(r), o = N(a), s = F(I(o));
					w(a);
					var c = I(a, 2);
					G(c), L((e) => {
						H(o, `${e ?? ""} `), H(s, `${R(n).angle ?? ""}°`), K(c, R(n).angle);
					}, [() => J("lbl.angle")]), z("input", c, (e) => Kn(t(), i, "angle", Number(e.target.value))), V(e, r);
				};
				U(m, (e) => {
					(R(n).kind ?? "linear") === "radial" ? e(h) : e(g, -1);
				});
				var _ = I(m, 2), v = N(_), y = F(I(v));
				w(_);
				var b = I(_, 2);
				G(b);
				var x = I(b, 2), S = N(x), C = I(S);
				{
					let e = /* @__PURE__ */ O(() => R(n).animation ?? "none");
					Y(C, {
						get value() {
							return R(e);
						},
						get options() {
							return qn[(R(n).kind ?? "linear") === "radial" ? "radial" : "linear"];
						},
						onchange: (e) => Kn(t(), i, "animation", e)
					});
				}
				w(x), L((e, t, r, i, a, o, s) => {
					H(l, `${e ?? ""} `), q(f, "title", t), H(p, r), H(v, `${i ?? ""} `), H(y, `${a ?? ""}%`), K(b, R(n).opacity ?? 1), q(x, "title", o), H(S, `${s ?? ""} `);
				}, [
					() => J("blocks.shape"),
					() => J("tip.bg.addStop"),
					() => J("ui.addStop"),
					() => J("lbl.strength"),
					() => Math.round((R(n).opacity ?? 1) * 100),
					() => J("tip.bg.motion"),
					() => J("lbl.motion")
				]), z("click", f, () => Xn(t(), i)), z("input", b, (e) => Kn(t(), i, "opacity", Number(e.target.value))), V(e, o);
			}, _ = (e) => {
				var n = pl(), a = P(n), o = N(a), s = I(o);
				{
					let e = /* @__PURE__ */ O(yr), n = /* @__PURE__ */ O(() => J("tip.bg.glowColor"));
					fa(s, {
						get value() {
							return R(r).props.color;
						},
						get tokens() {
							return R(e);
						},
						get label() {
							return R(n);
						},
						onchange: (e) => Rn(t(), i, "color", e)
					});
				}
				w(a);
				var c = I(a, 2), l = N(c), u = F(I(l));
				w(c);
				var d = I(c, 2);
				G(d);
				var f = I(d, 2), p = N(f), m = F(I(p));
				w(f);
				var h = I(f, 2);
				G(h);
				var g = I(h, 2), _ = N(g), v = F(I(_));
				w(g);
				var y = I(g, 2);
				G(y);
				var b = I(y, 2), x = N(b), S = F(I(x));
				w(b);
				var C = I(b, 2);
				G(C), L((e, t, n, i, a, s, c, f, g) => {
					H(o, `${e ?? ""} `), H(l, `${t ?? ""} `), H(u, `${n ?? ""}%`), K(d, R(r).props.x), H(p, `${i ?? ""} `), H(m, `${a ?? ""}%`), K(h, R(r).props.y), H(_, `${s ?? ""} `), H(v, `${c ?? ""}%`), K(y, R(r).props.radius), H(x, `${f ?? ""} `), H(S, `${g ?? ""}%`), K(C, R(r).props.opacity);
				}, [
					() => J("lbl.color"),
					() => J("lbl.posX"),
					() => Math.round(R(r).props.x * 100),
					() => J("lbl.posY"),
					() => Math.round(R(r).props.y * 100),
					() => J("lbl.size"),
					() => Math.round(R(r).props.radius * 100),
					() => J("lbl.strength"),
					() => Math.round(R(r).props.opacity * 100)
				]), z("input", d, (e) => Rn(t(), i, "x", Number(e.target.value))), z("input", h, (e) => Rn(t(), i, "y", Number(e.target.value))), z("input", y, (e) => Rn(t(), i, "radius", Number(e.target.value))), z("input", C, (e) => Rn(t(), i, "opacity", Number(e.target.value))), V(e, n);
			}, v = (e) => {
				var n = ml(), a = P(n), o = N(a), s = F(I(o));
				w(a);
				var c = I(a, 2);
				G(c), L((e, t) => {
					H(o, `${e ?? ""} `), H(s, `${t ?? ""}%`), K(c, R(r).props.opacity);
				}, [() => J("lbl.strength"), () => Math.round(R(r).props.opacity * 100)]), z("input", c, (e) => Rn(t(), i, "opacity", Number(e.target.value))), V(e, n);
			}, y = (e) => {
				let n = /* @__PURE__ */ O(() => R(r).props.fit === "tile" || R(r).props.fit === "repeat");
				var a = _l(), o = P(a), s = N(o), c = I(s);
				w(o);
				var l = I(o, 2), u = N(l), d = I(u);
				{
					let e = /* @__PURE__ */ O(() => R(n) ? "tile" : "plain"), r = /* @__PURE__ */ O(() => [["plain", J("opt.img.plain")], ["tile", J("opt.img.tile")]]);
					Y(d, {
						get value() {
							return R(e);
						},
						get options() {
							return R(r);
						},
						onchange: (e) => Rn(t(), i, "fit", e)
					});
				}
				w(l);
				var f = I(l, 2), p = F(f, !0), m = I(f, 2), h = N(m), g = I(h, 2);
				G(g);
				var _ = I(g, 4);
				w(m);
				var v = I(m, 2), y = (e) => {
					var n = hl(), a = P(n), o = N(a), s = F(o, !0), c = I(o, 2), l = F(c, !0);
					w(a);
					var u = I(a, 2), d = F(u, !0), f = I(u, 2), p = I(f, 2), m = N(p), h = F(I(m));
					w(p);
					var g = I(p, 2);
					G(g);
					var _ = I(g, 2), v = N(_), y = F(I(v));
					w(_);
					var b = I(_, 2);
					G(b), L((e, t, n, i, a, p, _, x, S, C, ee, te) => {
						q(o, "title", e), H(s, t), q(c, "title", n), H(l, i), q(u, "title", a), H(d, p), bi(f, `--fx:${_ ?? ""}%; --fy:${x ?? ""}%`), H(m, `${S ?? ""} `), H(h, `${C ?? ""}%`), K(g, R(r).props.x ?? .5), H(v, `${ee ?? ""} `), H(y, `${te ?? ""}%`), K(b, R(r).props.y ?? .5);
					}, [
						() => J("tip.bg.cover"),
						() => J("ui.cover"),
						() => J("opt.fitFrame.contain"),
						() => J("opt.fit.contain"),
						() => J("tip.bg.position"),
						() => J("lbl.position"),
						() => Math.max(0, Math.min(1, R(r).props.x ?? .5)) * 100,
						() => Math.max(0, Math.min(1, R(r).props.y ?? .5)) * 100,
						() => J("lbl.horizontal"),
						() => Math.round((R(r).props.x ?? .5) * 100),
						() => J("lbl.vertical"),
						() => Math.round((R(r).props.y ?? .5) * 100)
					]), z("click", o, () => Un(t(), i, R(r), "cover")), z("click", c, () => Un(t(), i, R(r), "contain")), z("pointerdown", f, (e) => zn(e, t(), i, "xy")), z("input", g, (e) => Rn(t(), i, "x", Number(e.target.value))), z("input", b, (e) => Rn(t(), i, "y", Number(e.target.value))), V(e, n);
				};
				U(v, (e) => {
					R(n) || e(y);
				});
				var b = I(v, 2), x = N(b), S = F(I(x));
				w(b);
				var C = I(b, 2);
				G(C);
				var ee = I(C, 2), te = N(ee), ne = F(I(te));
				w(ee);
				var re = I(ee, 2);
				G(re);
				var ie = I(re, 2), ae = N(ie);
				G(ae);
				var oe = I(ae);
				w(ie);
				var se = I(ie, 2), ce = (e) => {
					var n = gl(), a = P(n), o = N(a), s = F(I(o));
					w(a);
					var c = I(a, 2);
					G(c);
					var l = I(c, 2), u = N(l), d = I(u);
					{
						let e = /* @__PURE__ */ O(() => R(r).props.bleed ?? "none"), n = /* @__PURE__ */ O(() => [
							["none", J("common.none")],
							["up", J("opt.bleed.up")],
							["down", J("opt.bleed.down")],
							["both", J("opt.brand.both")]
						]);
						Y(d, {
							get value() {
								return R(e);
							},
							get options() {
								return R(n);
							},
							onchange: (e) => Rn(t(), i, "bleed", e)
						});
					}
					w(l), L((e, t, n, i) => {
						H(o, `${e ?? ""} `), H(s, `${t ?? ""}%`), K(c, R(r).props.parallax ?? .3), q(l, "title", n), H(u, `${i ?? ""} `);
					}, [
						() => J("lbl.parallaxStrength"),
						() => Math.round((R(r).props.parallax ?? 0) * 100),
						() => J("tip.bg.bleed"),
						() => J("lbl.bleed")
					]), z("input", c, (e) => Rn(t(), i, "parallax", Number(e.target.value))), V(e, n);
				};
				U(se, (e) => {
					(R(r).props.parallax ?? 0) > 0 && e(ce);
				}), L((e, t, n, i, a, c, d, m, v, y, b, ee, se, ce) => {
					q(o, "title", e), H(s, `${t ?? ""} `), q(l, "title", n), H(u, `${i ?? ""} `), q(f, "title", a), H(p, c), q(h, "title", d), K(g, m), q(_, "title", v), H(x, `${y ?? ""} `), H(S, `${R(r).props.blur ?? 0 ?? ""} px`), K(C, R(r).props.blur ?? 0), H(te, `${b ?? ""} `), H(ne, `${ee ?? ""}%`), K(re, R(r).props.opacity ?? 1), q(ie, "title", se), Ti(ae, (R(r).props.parallax ?? 0) > 0), H(oe, ` ${ce ?? ""}`);
				}, [
					() => J("tip.webpAuto"),
					() => R(r).props.src ? J("ui.changeImage") : J("ui.chooseImage"),
					() => J("tip.bg.fit"),
					() => J("lbl.fit"),
					() => J("tip.bg.size"),
					() => J("lbl.size"),
					() => J("tip.smaller"),
					() => Math.round((R(r).props.size ?? 1) * 100),
					() => J("tip.larger"),
					() => J("lbl.blur"),
					() => J("lbl.strength"),
					() => Math.round((R(r).props.opacity ?? 1) * 100),
					() => J("tip.bg.parallax"),
					() => J("lbl.parallax")
				]), z("change", c, (e) => ar(t(), i, e)), z("click", h, () => Vn(t(), i, R(r).props.size ?? 1, -.05)), z("change", g, (e) => Hn(t(), i, e.target.value)), z("click", _, () => Vn(t(), i, R(r).props.size ?? 1, .05)), z("input", C, (e) => Rn(t(), i, "blur", Number(e.target.value))), z("input", re, (e) => Rn(t(), i, "opacity", Number(e.target.value))), z("change", ae, (e) => Rn(t(), i, "parallax", e.target.checked ? .3 : 0)), V(e, a);
			}, b = (e) => {
				var n = yl(), a = P(n), o = N(a), s = I(o);
				w(a);
				var l = I(a, 2);
				Zr(l, 17, () => R(r).props.images ?? [], qr, (e, n, a) => {
					var o = vl(), s = P(o), l = N(s), u = I(l, 2), d = N(u);
					d.disabled = a === 0, W(d, () => c.up, !0), w(d);
					var f = I(d, 2);
					W(f, () => c.down, !0), w(f);
					var p = I(f, 2);
					W(p, () => c.cross, !0), w(p), w(u), w(s);
					var m = I(s, 2), h = N(m), g = F(I(h));
					w(m);
					var _ = I(m, 2);
					G(_);
					var v = I(_, 2), y = N(v), b = F(I(y));
					w(v);
					var x = I(v, 2);
					G(x), L((e, t, i, o, s) => {
						q(l, "src", R(n).src), f.disabled = a === R(r).props.images.length - 1, q(p, "title", e), H(h, `${t ?? ""} `), H(g, `${i ?? ""}%`), K(_, R(n).x ?? .5), H(y, `${o ?? ""} `), H(b, `${s ?? ""}%`), K(x, R(n).y ?? .5);
					}, [
						() => J("tip.removeImage"),
						() => J("lbl.focusX"),
						() => Math.round((R(n).x ?? .5) * 100),
						() => J("lbl.focusY"),
						() => Math.round((R(n).y ?? .5) * 100)
					]), z("click", d, () => lr(t(), i, a, -1)), z("click", f, () => lr(t(), i, a, 1)), z("click", p, () => ur(t(), i, a)), z("input", _, (e) => dr(t(), i, a, "x", Number(e.target.value))), z("input", x, (e) => dr(t(), i, a, "y", Number(e.target.value))), V(e, o);
				});
				var u = I(l, 2), d = N(u), f = I(d);
				{
					let e = /* @__PURE__ */ O(() => R(r).props.fit ?? "cover"), n = /* @__PURE__ */ O(() => [["cover", J("opt.fit.cover")], ["contain", J("opt.fit.contain")]]);
					Y(f, {
						get value() {
							return R(e);
						},
						get options() {
							return R(n);
						},
						onchange: (e) => Rn(t(), i, "fit", e)
					});
				}
				w(u);
				var p = I(u, 2), m = N(p), h = I(m);
				G(h), w(p);
				var g = I(p, 2), _ = N(g), v = F(I(_));
				w(g);
				var y = I(g, 2);
				G(y);
				var b = I(y, 2), x = N(b), S = F(I(x));
				w(b);
				var C = I(b, 2);
				G(C);
				var ee = I(C, 2), te = N(ee), ne = F(I(te));
				w(ee);
				var re = I(ee, 2);
				G(re);
				var ie = F(I(re, 2), !0);
				L((e, t, n, i, s, c, l, u, f, g, b) => {
					q(a, "title", e), H(o, `${t ?? ""} `), H(d, `${n ?? ""} `), q(p, "title", i), H(m, `${s ?? ""} `), K(h, R(r).props.interval ?? 6), H(_, `${c ?? ""} `), H(v, `${l ?? ""} s`), K(y, R(r).props.fade ?? 1.5), H(x, `${u ?? ""} `), H(S, `${R(r).props.blur ?? 0 ?? ""} px`), K(C, R(r).props.blur ?? 0), H(te, `${f ?? ""} `), H(ne, `${g ?? ""}%`), K(re, R(r).props.opacity ?? 1), H(ie, b);
				}, [
					() => J("tip.bg.addImages"),
					() => J("ui.addImages"),
					() => J("lbl.fit"),
					() => J("hint.bg.gallery"),
					() => J("lbl.secondsPerImage"),
					() => J("lbl.transition"),
					() => (R(r).props.fade ?? 1.5).toFixed(1),
					() => J("lbl.blur"),
					() => J("lbl.strength"),
					() => Math.round((R(r).props.opacity ?? 1) * 100),
					() => J("hint.bg.gallery")
				]), z("change", s, (e) => cr(t(), i, e)), z("change", h, (e) => Rn(t(), i, "interval", Number(e.target.value))), z("input", y, (e) => Rn(t(), i, "fade", Number(e.target.value))), z("input", C, (e) => Rn(t(), i, "blur", Number(e.target.value))), z("input", re, (e) => Rn(t(), i, "opacity", Number(e.target.value))), V(e, n);
			}, x = (e) => {
				var n = xl(), a = P(n), o = N(a), s = I(o);
				w(a);
				var c = I(a, 2), l = N(c), u = I(l);
				w(c);
				var d = I(c, 2), f = N(d), p = I(f);
				{
					let e = /* @__PURE__ */ O(() => R(r).props.fit ?? "cover"), n = /* @__PURE__ */ O(() => [["cover", J("opt.fit.cover")], ["contain", J("opt.fit.contain")]]);
					Y(p, {
						get value() {
							return R(e);
						},
						get options() {
							return R(n);
						},
						onchange: (e) => Rn(t(), i, "fit", e)
					});
				}
				w(d);
				var m = I(d, 2), h = N(m), g = F(I(h));
				w(m);
				var _ = I(m, 2);
				G(_);
				var v = I(_, 2), y = N(v), b = F(I(y));
				w(v);
				var x = I(v, 2);
				G(x);
				var S = I(x, 2), C = N(S), ee = F(I(C));
				w(S);
				var te = I(S, 2);
				G(te);
				var ne = I(te, 2), re = N(ne);
				G(re);
				var ie = I(re);
				w(ne);
				var ae = I(ne, 2), oe = (e) => {
					var n = bl(), a = P(n), o = N(a), s = F(I(o));
					w(a);
					var c = I(a, 2);
					G(c), L((e, t) => {
						H(o, `${e ?? ""} `), H(s, `${t ?? ""}%`), K(c, R(r).props.parallax ?? .3);
					}, [() => J("lbl.parallaxStrength"), () => Math.round((R(r).props.parallax ?? 0) * 100)]), z("input", c, (e) => Rn(t(), i, "parallax", Number(e.target.value))), V(e, n);
				};
				U(ae, (e) => {
					(R(r).props.parallax ?? 0) > 0 && e(oe);
				}), L((e, t, n, i, s, u, p, m, v, S, ae, oe, se, ce) => {
					q(a, "title", e), H(o, `${t ?? ""} `), q(c, "title", n), H(l, `${i ?? ""} `), q(d, "title", s), H(f, `${u ?? ""} `), H(h, `${p ?? ""} `), H(g, `${m ?? ""}%`), K(_, R(r).props.x ?? .5), H(y, `${v ?? ""} `), H(b, `${S ?? ""}%`), K(x, R(r).props.y ?? .5), H(C, `${ae ?? ""} `), H(ee, `${oe ?? ""}%`), K(te, R(r).props.opacity ?? 1), q(ne, "title", se), Ti(re, (R(r).props.parallax ?? 0) > 0), H(ie, ` ${ce ?? ""}`);
				}, [
					() => J("tip.bg.videoFile"),
					() => R(r).props.src ? J("ui.changeVideo") : J("ui.chooseVideo"),
					() => J("tip.bg.poster"),
					() => R(r).props.poster ? J("ui.changeImage") : J("ui.choosePoster"),
					() => J("tip.bg.fit"),
					() => J("lbl.fit"),
					() => J("lbl.horizontal"),
					() => Math.round((R(r).props.x ?? .5) * 100),
					() => J("lbl.vertical"),
					() => Math.round((R(r).props.y ?? .5) * 100),
					() => J("lbl.strength"),
					() => Math.round((R(r).props.opacity ?? 1) * 100),
					() => J("tip.bg.parallax"),
					() => J("lbl.parallax")
				]), z("change", s, (e) => or(t(), i, e)), z("change", u, (e) => sr(t(), i, e)), z("input", _, (e) => Rn(t(), i, "x", Number(e.target.value))), z("input", x, (e) => Rn(t(), i, "y", Number(e.target.value))), z("input", te, (e) => Rn(t(), i, "opacity", Number(e.target.value))), z("change", re, (e) => Rn(t(), i, "parallax", e.target.checked ? .3 : 0)), V(e, n);
			};
			U(m, (e) => {
				R(r).type === "color" ? e(h) : R(r).type === "gradient" ? e(g, 1) : R(r).type === "glow" ? e(_, 2) : R(r).type === "grain" ? e(v, 3) : R(r).type === "image" ? e(y, 4) : R(r).type === "slideshow" ? e(b, 5) : R(r).type === "video" && e(x, 6);
			}), w(a), L((e, t, r) => {
				q(d, "title", e), q(f, "title", t), f.disabled = i === n().length - 1, q(p, "title", r);
			}, [
				() => J("hint.bg.order"),
				() => J("hint.bg.order"),
				() => J("tip.bg.removeLayer")
			]), z("click", d, () => Ln(t(), i, -1)), z("click", f, () => Ln(t(), i, 1)), z("click", p, () => In(t(), i)), V(e, a);
		});
		var a = I(i, 2), s = N(a), l = I(s);
		{
			let e = /* @__PURE__ */ O(() => o.map(([e, t]) => [e, t.labelKey ? J(t.labelKey) : t.label]));
			Y(l, {
				get value() {
					return R(Pn);
				},
				get options() {
					return R(e);
				},
				onchange: (e) => M(Pn, e, !0)
			});
		}
		w(a);
		var u = I(a, 2), d = F(u, !0);
		L((e, t) => {
			H(s, `${e ?? ""} `), H(d, t);
		}, [() => J("lbl.newLayer"), () => J("ui.addLayer")]), z("click", u, () => Fn(t(), R(Pn))), V(e, r);
	}, r = (e, t = f, n = f) => {
		var r = Ir();
		Zr(P(r), 17, n, qr, (e, r, i) => {
			var a = Tl(), o = N(a);
			G(o);
			var s = I(o, 2), l = N(s);
			l.disabled = i === 0, W(l, () => c.up, !0), w(l);
			var u = I(l, 2);
			W(u, () => c.down, !0), w(u);
			var d = I(u, 2);
			W(d, () => c.cross, !0), w(d), w(s);
			var f = I(s, 2), p = N(f);
			{
				let e = /* @__PURE__ */ O(() => R(r).page ?? "__href"), n = /* @__PURE__ */ O(() => J("tip.linkTarget")), a = /* @__PURE__ */ O(() => [...R(D).pages.map((e) => [e.id, e.title]), ["__href", J("opt.linkHref")]]);
				Y(p, {
					get value() {
						return R(e);
					},
					get title() {
						return R(n);
					},
					get options() {
						return R(a);
					},
					onchange: (e) => Ec(t(), i, e)
				});
			}
			w(f);
			var m = I(f, 2), h = (e) => {
				var n = wl();
				G(n), L((e, t) => {
					K(n, R(r).href ?? ""), q(n, "placeholder", e), q(n, "title", t);
				}, [() => J("ph.hrefAnchor"), () => J("tip.hrefAnchor")]), z("change", n, (e) => Dc(t(), i, e.target.value)), V(e, n);
			};
			U(m, (e) => {
				R(r).page || e(h);
			}), w(a), L((e, t) => {
				K(o, R(r).label), q(o, "title", e), u.disabled = i === n().length - 1, q(d, "title", t);
			}, [() => J("tip.linkLabel"), () => J("tip.removeLink")]), z("input", o, (e) => Tc(t(), i, e.target.value)), z("click", l, () => wc(t(), i, -1)), z("click", u, () => wc(t(), i, 1)), z("click", d, () => Cc(t(), i)), V(e, a);
		}), V(e, r);
	}, i = (e) => {
		let t = /* @__PURE__ */ O(() => R(k).props.boxStyle ?? {});
		var n = Ol(), r = P(n), i = N(r), a = I(i);
		{
			let e = /* @__PURE__ */ O(() => R(t).bg ?? ""), n = /* @__PURE__ */ O(yr), r = /* @__PURE__ */ O(() => J("tip.box.bg"));
			fa(a, {
				get value() {
					return R(e);
				},
				get tokens() {
					return R(n);
				},
				allowClear: !0,
				get label() {
					return R(r);
				},
				onchange: (e) => Xt({ bg: e || null })
			});
		}
		w(r);
		var o = I(r, 2), s = N(o), c = I(s);
		{
			let e = /* @__PURE__ */ O(() => R(t).shadow ?? ""), n = /* @__PURE__ */ O(() => [
				["", J("common.none")],
				["soft", J("opt.shadow.soft")],
				["strong", J("opt.shadow.strong")]
			]);
			Y(c, {
				get value() {
					return R(e);
				},
				get options() {
					return R(n);
				},
				onchange: (e) => Xt({ shadow: e || null })
			});
		}
		w(o);
		var l = I(o, 2), u = (e) => {
			var n = El(), r = N(n), i = I(r);
			{
				let e = /* @__PURE__ */ O(() => R(t).shadowColor ?? ""), n = /* @__PURE__ */ O(yr), r = /* @__PURE__ */ O(() => J("tip.box.shadowColor"));
				fa(i, {
					get value() {
						return R(e);
					},
					get tokens() {
						return R(n);
					},
					allowClear: !0,
					get label() {
						return R(r);
					},
					onchange: (e) => Xt({ shadowColor: e || null })
				});
			}
			w(n), L((e) => H(r, `${e ?? ""} `), [() => J("lbl.shadowColor")]), V(e, n);
		};
		U(l, (e) => {
			R(t).shadow && e(u);
		});
		var d = I(l, 2), f = N(d), p = I(f);
		{
			let e = /* @__PURE__ */ O(() => R(t).border === "none" ? "none" : R(t).border ? "custom" : ""), n = /* @__PURE__ */ O(() => [
				["", J("opt.border.theme")],
				["none", J("common.none")],
				["custom", J("opt.border.custom")]
			]);
			Y(p, {
				get value() {
					return R(e);
				},
				get options() {
					return R(n);
				},
				onchange: (e) => Xt({ border: e === "custom" ? {
					color: "accent",
					width: 1
				} : e || null })
			});
		}
		w(d);
		var m = I(d, 2), h = (e) => {
			let n = /* @__PURE__ */ O(() => typeof R(t).border == "object" ? R(t).border : {
				color: "text",
				width: 1
			});
			var r = Dl(), i = P(r), a = N(i), o = I(a);
			{
				let e = /* @__PURE__ */ O(yr), t = /* @__PURE__ */ O(() => J("tip.box.borderColor"));
				fa(o, {
					get value() {
						return R(n).color;
					},
					get tokens() {
						return R(e);
					},
					get label() {
						return R(t);
					},
					onchange: (e) => Xt({ border: {
						...R(n),
						color: e
					} })
				});
			}
			w(i);
			var s = I(i, 2), c = N(s), l = I(c), u = N(l), d = I(u, 2);
			G(d);
			var f = I(d, 2);
			w(l), w(s), L((e, t, r, i, o, s) => {
				H(a, `${e ?? ""} `), H(c, `${t ?? ""} `), q(u, "title", r), q(u, "aria-label", i), K(d, R(n).width), q(f, "title", o), q(f, "aria-label", s);
			}, [
				() => J("lbl.borderColor"),
				() => J("lbl.thicknessPx"),
				() => J("tip.thinner"),
				() => J("tip.thinner"),
				() => J("tip.thicker"),
				() => J("tip.thicker")
			]), z("click", u, () => Xt({ border: {
				...R(n),
				width: Math.max(1, R(n).width - 1)
			} })), z("change", d, (e) => Xt({ border: {
				...R(n),
				width: Math.min(12, Math.max(1, Number(e.target.value) || 1))
			} })), z("click", f, () => Xt({ border: {
				...R(n),
				width: Math.min(12, R(n).width + 1)
			} })), V(e, r);
		};
		U(m, (e) => {
			R(t).border !== "none" && e(h);
		});
		var g = I(m, 2), _ = N(g);
		G(_);
		var v = I(_);
		w(g), L((e, t, n, r, a, o) => {
			H(i, `${e ?? ""} `), H(s, `${t ?? ""} `), H(f, `${n ?? ""} `), q(g, "title", r), Ti(_, a), H(v, ` ${o ?? ""}`);
		}, [
			() => J("lbl.blockColor"),
			() => J("lbl.shadow"),
			() => J("lbl.border"),
			() => J("tip.box.glass"),
			() => !!R(t).glass,
			() => J("lbl.glass")
		]), z("change", _, (e) => Xt({ glass: e.target.checked || null })), V(e, n);
	}, a = (e) => {
		var t = Ou(), n = P(t), r = N(n), a = N(r);
		let o;
		var s = F(a, !0), l = I(a, 2);
		let u;
		var d = F(l, !0);
		w(r), w(n);
		var f = I(n, 2), p = (e) => {
			var t = Ir(), n = P(t), r = (e) => {
				var t = kl(), n = F(t, !0);
				L((e) => H(n, e), [() => J("hint.textInline")]), V(e, t);
			}, i = (e) => {
				var t = jl(), n = P(t), r = N(n);
				G(r);
				var i = I(r);
				w(n);
				var a = I(n, 2), o = F(a, !0), s = I(a, 2);
				Zr(s, 17, () => R(k).props.items ?? [], qr, (e, t, n) => {
					var r = Al(), i = N(r);
					G(i);
					var a = I(i, 2), o = N(a);
					o.disabled = n === 0, W(o, () => c.up, !0), w(o);
					var s = I(o, 2);
					W(s, () => c.down, !0), w(s);
					var l = I(s, 2);
					W(l, () => c.cross, !0), w(l), w(a), w(r), L((e, r) => {
						K(i, R(t).q), q(i, "title", e), s.disabled = n === (R(k).props.items?.length ?? 0) - 1, q(l, "title", r);
					}, [() => J("tip.faq.question"), () => J("tip.faq.remove")]), z("change", i, (e) => Zt(n, { q: e.target.value })), z("click", o, () => en(n, -1)), z("click", s, () => en(n, 1)), z("click", l, () => $t(n)), V(e, r);
				});
				var l = I(s, 2), u = F(l, !0);
				L((e, t, a, s, c) => {
					q(n, "title", e), Ti(r, t), H(i, ` ${a ?? ""}`), H(o, s), H(u, c);
				}, [
					() => J("tip.faq.multi"),
					() => !!R(k).props.multi,
					() => J("lbl.faqMulti"),
					() => J("lbl.questions"),
					() => J("ui.addQuestion")
				]), z("change", r, (e) => A("multi", e.target.checked)), z("click", l, Qt), V(e, t);
			}, a = (e) => {
				var t = Nl(), n = P(t), r = F(n, !0), i = I(n, 2);
				Zr(i, 17, () => R(k).props.items ?? [], qr, (e, t, n) => {
					var r = Ml(), i = P(r), a = N(i);
					G(a);
					var o = I(a, 2);
					G(o);
					var s = I(o, 2), l = N(s);
					l.disabled = n === 0, W(l, () => c.up, !0), w(l);
					var u = I(l, 2);
					W(u, () => c.down, !0), w(u);
					var d = I(u, 2);
					W(d, () => c.cross, !0), w(d), w(s), w(i);
					var f = I(i, 2);
					G(f), L((e, r, i, s, c, l) => {
						K(a, R(t).year), q(a, "placeholder", e), q(a, "title", r), K(o, R(t).title), q(o, "title", i), u.disabled = n === (R(k).props.items?.length ?? 0) - 1, q(d, "title", s), K(f, R(t).text), q(f, "placeholder", c), q(f, "title", l);
					}, [
						() => J("ph.tlYear"),
						() => J("tip.timeline.year"),
						() => J("tip.timeline.title"),
						() => J("tip.timeline.remove"),
						() => J("ph.tlText"),
						() => J("tip.timeline.text")
					]), z("change", a, (e) => tn(n, { year: e.target.value })), z("change", o, (e) => tn(n, { title: e.target.value })), z("click", l, () => sn(n, -1)), z("click", u, () => sn(n, 1)), z("click", d, () => on(n)), z("change", f, (e) => tn(n, { text: e.target.value })), V(e, r);
				});
				var a = I(i, 2), o = F(a, !0);
				L((e, t) => {
					H(r, e), H(o, t);
				}, [() => J("lbl.timelineItems"), () => J("ui.addTlItem")]), z("click", a, an), V(e, t);
			}, o = (e) => {
				var t = Pl(), n = P(t), r = N(n), i = I(r);
				G(i), w(n);
				var a = I(n, 2), o = N(a), s = I(o);
				G(s), w(a);
				var c = I(a, 2), l = N(c), u = I(l);
				G(u), w(c), L((e, t, n) => {
					H(r, `${e ?? ""} `), K(i, R(k).props.text ?? ""), H(o, `${t ?? ""} `), K(s, R(k).props.attribution ?? ""), H(l, `${n ?? ""} `), K(u, R(k).props.role ?? "");
				}, [
					() => J("lbl.quoteText"),
					() => J("lbl.quoteName"),
					() => J("lbl.quoteRole")
				]), z("change", i, (e) => A("text", e.target.value)), z("change", s, (e) => A("attribution", e.target.value)), z("change", u, (e) => A("role", e.target.value)), V(e, t);
			}, s = (e) => {
				var t = Fl(), n = P(t), r = N(n), i = I(r);
				G(i), w(n);
				var a = I(n, 2), o = N(a), s = I(o);
				G(s), w(a);
				var c = I(a, 2), l = N(c), u = I(l);
				G(u), w(c);
				var d = I(c, 2), f = N(d), p = I(f);
				G(p), w(d), L((e, t, n, a, c) => {
					H(r, `${e ?? ""} `), K(i, R(k).props.value ?? ""), q(i, "title", t), H(o, `${n ?? ""} `), K(s, R(k).props.prefix ?? ""), H(l, `${a ?? ""} `), K(u, R(k).props.suffix ?? ""), H(f, `${c ?? ""} `), K(p, R(k).props.label ?? "");
				}, [
					() => J("lbl.statValue"),
					() => J("tip.stat.value"),
					() => J("lbl.statPrefix"),
					() => J("lbl.statSuffix"),
					() => J("lbl.statLabel")
				]), z("change", i, (e) => A("value", e.target.value)), z("change", s, (e) => A("prefix", e.target.value)), z("change", u, (e) => A("suffix", e.target.value)), z("change", p, (e) => A("label", e.target.value)), V(e, t);
			}, l = (e) => {
				var t = Il(), n = P(t), r = N(n), i = F(r, !0), a = I(r, 2), o = F(a, !0);
				w(n);
				var s = I(n, 2), c = N(s), l = F(c, !0), u = I(c, 2), d = F(u, !0);
				w(s);
				var f = I(s, 2), p = N(f);
				G(p);
				var m = I(p);
				w(f), L((e, t, n, r, a, s) => {
					H(i, e), H(o, t), H(l, n), H(d, r), q(f, "title", a), Ti(p, R(k).props.header !== !1), H(m, ` ${s ?? ""}`);
				}, [
					() => J("ui.addRow"),
					() => J("ui.removeRow"),
					() => J("ui.addColumn"),
					() => J("ui.removeColumn"),
					() => J("tip.table.header"),
					() => J("lbl.tableHeader")
				]), z("click", r, () => ln(1, 0)), z("click", a, () => ln(-1, 0)), z("click", c, () => ln(0, 1)), z("click", u, () => ln(0, -1)), z("change", p, (e) => A("header", e.target.checked)), V(e, t);
			}, u = (e) => {
				var t = Ir();
				Zr(P(t), 17, () => [
					["facebook", "Facebook"],
					["x", "X"],
					["linkedin", "LinkedIn"],
					["whatsapp", "WhatsApp"],
					["email", J("opt.share.email")],
					["copy", J("opt.share.copy")]
				], ([e, t]) => e, (e, t) => {
					var n = /* @__PURE__ */ O(() => h(R(t), 2));
					let r = () => R(n)[0], i = () => R(n)[1];
					var a = Ll(), o = N(a);
					G(o);
					var s = I(o);
					w(a), L((e) => {
						Ti(o, e), H(s, ` ${i() ?? ""}`);
					}, [() => (R(k).props.services ?? []).includes(r())]), z("change", o, (e) => un(r(), e.target.checked)), V(e, a);
				}), V(e, t);
			}, d = (e) => {
				var t = Rl(), n = P(t), r = N(n), i = I(r);
				G(i), w(n);
				var a = I(n, 2), o = N(a), s = I(o);
				G(s), w(a), L((e, t, n) => {
					H(r, `${e ?? ""} `), K(i, R(k).props.target ?? ""), q(a, "title", t), H(o, `${n ?? ""} `), K(s, R(k).props.doneText ?? "");
				}, [
					() => J("lbl.countdownTarget"),
					() => J("tip.countdown.done"),
					() => J("lbl.countdownDone")
				]), z("change", i, (e) => A("target", e.target.value)), z("change", s, (e) => A("doneText", e.target.value)), V(e, t);
			}, f = (e) => {
				var t = Bl(), n = P(t), r = N(n), i = I(r);
				w(n);
				var a = I(n, 2), o = (e) => {
					var t = zl(), n = F(t, !0);
					L((e) => H(n, e), [() => J("ui.removeAudio")]), z("click", t, () => A("src", "")), V(e, t);
				};
				U(a, (e) => {
					R(k).props.src && e(o);
				});
				var s = I(a, 2), c = N(s), l = I(c);
				G(l), w(s);
				var u = I(s, 2), d = N(u);
				G(d);
				var f = I(d);
				w(u), L((e, t, i, a, o) => {
					q(n, "title", e), H(r, `${t ?? ""} `), H(c, `${i ?? ""} `), K(l, R(k).props.title ?? ""), Ti(d, a), H(f, ` ${o ?? ""}`);
				}, [
					() => J("tip.blocks.audioFile"),
					() => J("ui.chooseAudio"),
					() => J("lbl.audioTitle"),
					() => !!R(k).props.loop,
					() => J("lbl.audioLoop")
				]), z("change", i, dn), z("change", l, (e) => A("title", e.target.value)), z("change", d, (e) => A("loop", e.target.checked)), V(e, t);
			}, p = (e) => {
				var t = Hl(), n = P(t), r = N(n), i = I(r);
				G(i), w(n);
				var a = I(n, 2), o = N(a), s = I(o);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.page ?? "__href"), t = /* @__PURE__ */ O(() => [...R(D).pages.map((e) => [e.id, e.title]), ["__href", J("opt.externalLink")]]);
					Y(s, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => {
							let t = e === "__href" ? null : e;
							Vt(`edit:${R(k).blockId}`, (e) => {
								e.props.page = t, t && (e.props.href = null);
							});
						}
					});
				}
				w(a);
				var c = I(a, 2), l = (e) => {
					var t = Vl();
					G(t), L((e) => {
						q(t, "placeholder", e), K(t, R(k).props.href === "#" ? "" : R(k).props.href ?? "");
					}, [() => J("ph.url")]), z("change", t, (e) => A("href", e.target.value || null)), V(e, t);
				};
				U(c, (e) => {
					R(k).props.page || e(l);
				}), L((e, t) => {
					H(r, `${e ?? ""} `), K(i, R(k).props.label), H(o, `${t ?? ""} `);
				}, [() => J("blocks.text"), () => J("lbl.goesTo")]), z("change", i, (e) => A("label", e.target.value)), V(e, t);
			}, m = (e) => {
				var t = Ul(), n = P(t), r = N(n), i = I(r);
				w(n);
				var a = I(n, 2), o = N(a), s = I(o);
				G(s), w(a);
				var c = I(a, 2), l = N(c), u = I(l);
				G(u), w(c);
				var d = I(c, 2), f = (e) => {
					var t = Ll(), n = N(t);
					G(n);
					var r = I(n);
					w(t), L((e, i, a) => {
						q(t, "title", e), Ti(n, i), H(r, ` ${a ?? ""}`);
					}, [
						() => J("tip.lightbox"),
						() => !!R(k).props.lightbox,
						() => J("lbl.lightbox")
					]), z("change", n, (e) => A("lightbox", e.target.checked)), V(e, t);
				};
				U(d, (e) => {
					R(k).props.href || e(f);
				}), L((e, t, n, i, a) => {
					H(r, `${e ?? ""} `), H(o, `${t ?? ""} `), K(s, R(k).props.alt ?? ""), q(s, "placeholder", n), H(l, `${i ?? ""} `), K(u, R(k).props.href ?? ""), q(u, "placeholder", a);
				}, [
					() => J("ui.changeImage"),
					() => J("lbl.description"),
					() => J("ph.altText"),
					() => J("lbl.link"),
					() => J("ph.optionalImageLink")
				]), z("change", i, pn), z("change", s, (e) => A("alt", e.target.value)), z("change", u, (e) => A("href", e.target.value || null)), V(e, t);
			}, g = (e) => {
				var t = Wl(), n = P(t), r = F(n, !0), i = I(n, 2);
				G(i);
				var a = I(i, 2), o = N(a), s = I(o);
				G(s), w(a), L((e, t, a, c) => {
					q(n, "title", e), H(r, t), K(i, R(k).props.url ?? ""), q(i, "placeholder", a), H(o, `${c ?? ""} `), K(s, R(k).props.title ?? "");
				}, [
					() => J("hint.video"),
					() => J("lbl.videoUrl"),
					() => J("ph.videoUrl"),
					() => J("lbl.videoTitle")
				]), z("change", i, (e) => A("url", e.target.value)), z("change", s, (e) => A("title", e.target.value)), V(e, t);
			}, _ = (e) => {
				var t = ql(), n = P(t), r = N(n), i = I(r), a = N(i);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.glyph ?? "★"), t = /* @__PURE__ */ O(() => R(k).props.icon ?? null), n = /* @__PURE__ */ O(() => R(k).props.image ?? null);
					Ga(a, {
						get value() {
							return R(e);
						},
						get icon() {
							return R(t);
						},
						get image() {
							return R(n);
						},
						onpick: (e) => Vt(`edit:${R(k).blockId}`, (t) => {
							t.props.glyph = e, t.props.icon = null, t.props.image = null;
						}),
						onicon: (e) => Vt(`edit:${R(k).blockId}`, (t) => {
							t.props.icon = e, t.props.image = null;
						}),
						onimage: (e) => A("image", e)
					});
				}
				var o = I(a, 2), s = (e) => {
					var t = Gl();
					G(t), L((e) => {
						K(t, R(k).props.glyph ?? ""), q(t, "title", e);
					}, [() => J("tip.icon.typeGlyph")]), z("change", t, (e) => A("glyph", e.target.value || "★")), V(e, t);
				}, c = (e) => {
					var t = zl(), n = F(t, !0);
					L((e, r) => {
						q(t, "title", e), H(n, r);
					}, [() => J("tip.icon.backToGlyph"), () => J("ui.removeDrawnIcon")]), z("click", t, () => A("icon", null)), V(e, t);
				};
				U(o, (e) => {
					R(k).props.icon ? e(c, -1) : e(s);
				}), w(i), w(n);
				var l = I(n, 2), u = (e) => {
					var t = Kl(), n = N(t), r = I(n, 2), i = F(r, !0);
					w(t), L((e, r, a) => {
						q(t, "title", e), q(n, "src", R(k).props.image), q(n, "alt", r), H(i, a);
					}, [
						() => J("hint.icon.ownImage"),
						() => J("gp.ownIcon"),
						() => J("ui.removeOwnIcon")
					]), z("click", r, () => A("image", null)), V(e, t);
				};
				U(l, (e) => {
					R(k).props.image && e(u);
				}), L((e) => H(r, `${e ?? ""} `), [() => J("blocks.icon")]), V(e, t);
			}, v = (e) => {
				var t = Jl(), n = P(t), r = N(n), i = I(r);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.collection ?? ""), t = /* @__PURE__ */ O(() => [["", J("common.choose")], ...R(Oo).map((e) => [e, R(jo)[e]?.name ?? e])]);
					Y(i, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("collection", e || null)
					});
				}
				w(n);
				var a = I(n, 2), o = N(a), s = I(o);
				G(s), w(a);
				var c = I(a, 2), l = N(c);
				G(l);
				var u = I(l);
				w(c), L((e, t, i, c, d) => {
					q(n, "title", e), H(r, `${t ?? ""} `), q(a, "title", i), H(o, `${c ?? ""} `), K(s, R(k).props.limit ?? 6), Ti(l, R(k).props.newestFirst !== !1), H(u, ` ${d ?? ""}`);
				}, [
					() => J("tip.collection.source"),
					() => J("blocks.collection"),
					() => J("tip.collection.limit"),
					() => J("lbl.maxCount"),
					() => J("lbl.newestFirst")
				]), z("change", s, (e) => A("limit", Number(e.target.value))), z("change", l, (e) => A("newestFirst", e.target.checked)), V(e, t);
			}, y = (e) => {
				var t = Zl(), n = P(t), r = N(n), i = I(r);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.collection ?? ""), t = /* @__PURE__ */ O(() => [["", J("common.choose")], ...R(Oo).filter((e) => R(jo)[e]?.kind === "products").map((e) => [e, R(jo)[e]?.name ?? e])]);
					Y(i, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("collection", e || null)
					});
				}
				w(n);
				var a = I(n, 2), o = (e) => {
					var t = Yl(), n = N(t), r = F(n, !0), i = I(n, 2), a = F(i, !0);
					w(t), L((e, t, o, s) => {
						q(n, "title", e), H(r, t), q(i, "title", o), H(a, s);
					}, [
						() => J("tip.product.addProduct"),
						() => J("ui.addProduct"),
						() => J("tip.product.editCatalog"),
						() => J("ui.editCatalog")
					]), z("click", n, () => ls(R(k).props.collection)), z("click", i, () => {
						M(Mo, R(k).props.collection, !0), M(bt, "collections");
					}), V(e, t);
				}, s = (e) => {
					var t = Xl(), n = F(t, !0);
					L((e, r) => {
						q(t, "title", e), H(n, r);
					}, [() => J("tip.product.createCatalog"), () => J("ui.createCatalog")]), z("click", t, is), V(e, t);
				}, c = /* @__PURE__ */ O(() => !R(Oo).some((e) => R(jo)[e]?.kind === "products"));
				U(a, (e) => {
					R(k).props.collection && R(jo)[R(k).props.collection]?.kind === "products" ? e(o) : R(c) && e(s, 1);
				});
				var l = I(a, 2), u = N(l), d = I(u);
				G(d), w(l);
				var f = I(l, 2), p = N(f), m = I(p);
				G(m), w(f), L((e, t, i, a, o, s) => {
					q(n, "title", e), H(r, `${t ?? ""} `), q(l, "title", i), H(u, `${a ?? ""} `), K(d, R(k).props.limit ?? 0), q(f, "title", o), H(p, `${s ?? ""} `), K(m, R(k).props.currency ?? "kr");
				}, [
					() => J("tip.product.source"),
					() => J("blocks.collection"),
					() => J("tip.collection.limit"),
					() => J("lbl.maxCount"),
					() => J("tip.product.currency"),
					() => J("lbl.currency")
				]), z("change", d, (e) => A("limit", Number(e.target.value))), z("change", m, (e) => A("currency", e.target.value)), V(e, t);
			}, b = (e) => {
				var t = Ql(), n = P(t), r = N(n), i = I(r);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.href ?? ""), t = /* @__PURE__ */ O(() => [["", J("common.none")], ...R(D).pages.map((e) => [e.path, e.title])]);
					Y(i, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("href", e)
					});
				}
				w(n);
				var a = I(n, 2), o = N(a), s = I(o);
				G(s), w(a), L((e, t, i, c) => {
					q(n, "title", e), H(r, `${t ?? ""} `), q(a, "title", i), H(o, `${c ?? ""} `), K(s, R(k).props.currency ?? "kr");
				}, [
					() => J("tip.cart.checkout"),
					() => J("lbl.checkoutPage"),
					() => J("tip.product.currency"),
					() => J("lbl.currency")
				]), z("change", s, (e) => A("currency", e.target.value)), V(e, t);
			}, x = (e) => {
				var t = $l(), n = P(t), r = N(n), i = I(r);
				G(i), w(n);
				var a = I(n, 2), o = N(a), s = I(o);
				G(s), w(a);
				var c = I(a, 2), l = N(c), u = I(l);
				G(u), w(c);
				var d = I(c, 2), f = N(d);
				G(f);
				var p = I(f);
				w(d);
				var m = I(d, 2), h = N(m), g = I(h);
				G(g), w(m), L((e, t, _, v, y, b, x, S, C, ee) => {
					q(n, "title", e), H(r, `${t ?? ""} `), K(i, R(k).props.recipient ?? ""), q(a, "title", _), H(o, `${v ?? ""} `), K(s, R(k).props.endpoint ?? ""), q(c, "title", y), H(l, `${b ?? ""} `), K(u, R(k).props.vipps ?? ""), q(d, "title", x), Ti(f, R(k).props.vippsCheckout === !0), H(p, ` ${S ?? ""}`), q(m, "title", C), H(h, `${ee ?? ""} `), K(g, R(k).props.currency ?? "kr");
				}, [
					() => J("tip.checkout.recipient"),
					() => J("lbl.recipientEmail"),
					() => J("tip.checkout.endpoint"),
					() => J("lbl.endpointUrl"),
					() => J("tip.checkout.vipps"),
					() => J("lbl.vippsNumber"),
					() => J("tip.checkout.vippsCheckout"),
					() => J("lbl.vippsCheckout"),
					() => J("tip.product.currency"),
					() => J("lbl.currency")
				]), z("change", i, (e) => A("recipient", e.target.value.trim())), z("change", s, (e) => A("endpoint", e.target.value.trim())), z("change", u, (e) => A("vipps", e.target.value.trim())), z("change", f, (e) => A("vippsCheckout", e.target.checked)), z("change", g, (e) => A("currency", e.target.value)), V(e, t);
			}, S = (e) => {
				var t = tu(), n = P(t), r = N(n), i = I(r);
				w(n), Zr(I(n, 2), 17, () => R(k).props.images ?? [], qr, (e, t, n) => {
					var r = eu(), i = N(r), a = N(i), o = I(a, 2), s = N(o);
					s.disabled = n === 0, W(s, () => c.up, !0), w(s);
					var l = I(s, 2);
					W(l, () => c.down, !0), w(l);
					var u = I(l, 2);
					W(u, () => c.cross, !0), w(u), w(o), w(i);
					var d = I(i, 2), f = N(d), p = I(f);
					G(p), w(d);
					var m = I(d, 2), h = N(m), g = I(h);
					G(g), w(m), w(r), L((e, r, o, s, c, d) => {
						q(i, "title", e), q(a, "src", R(t).src), l.disabled = n === R(k).props.images.length - 1, q(u, "title", r), H(f, `${o ?? ""} `), K(p, R(t).alt ?? ""), q(p, "placeholder", s), H(h, `${c ?? ""} `), K(g, R(t).href ?? ""), q(g, "placeholder", d);
					}, [
						() => J("hint.gallery"),
						() => J("tip.removeImage"),
						() => J("lbl.description"),
						() => J("ph.altShort"),
						() => J("lbl.link"),
						() => J("ph.galleryHref")
					]), z("click", s, () => Vp(n, -1)), z("click", l, () => Vp(n, 1)), z("click", u, () => Hp(n)), z("change", p, (e) => Up(n, "alt", e.target.value)), z("change", g, (e) => Up(n, "href", e.target.value || null)), V(e, r);
				}), L((e, t) => {
					q(n, "title", e), H(r, `${t ?? ""} `);
				}, [() => J("tip.gallery.addImages"), () => J("ui.addImages")]), z("change", i, zp), V(e, t);
			}, C = (e) => {
				var t = El(), n = N(t);
				Y(I(n), {
					get value() {
						return R(k).props.kind;
					},
					get options() {
						return gn;
					},
					onchange: (e) => A("kind", e)
				}), w(t), L((e) => H(n, `${e ?? ""} `), [() => J("blocks.shape")]), V(e, t);
			}, ee = (e) => {
				let t = /* @__PURE__ */ O(() => R(Ap).find((e) => e.type === R(k).type)?.fields ?? []);
				var n = Ir(), r = P(n), i = (e) => {
					var n = Ir();
					Zr(P(n), 17, () => R(t), (e) => e.key, (e, t) => {
						var n = Ir(), r = P(n), i = (e) => {
							let n = /* @__PURE__ */ O(() => `${R(k).blockId}:${R(t).key}`);
							var r = ru(), i = P(r), a = N(i), o = I(a);
							G(o), w(i);
							var s = I(i, 2), c = F(s, !0), l = I(s, 2), u = (e) => {
								var t = nu();
								let r;
								var i = F(t, !0);
								L(() => {
									r = vi(t, 1, "panel-hint svelte-1n46o8q", null, r, { "place-error": Wt[R(n)].err }), H(i, Wt[R(n)].text);
								}), V(e, t);
							};
							U(l, (e) => {
								Wt[R(n)] && e(u);
							}), L((e) => {
								H(a, `${R(t).label ?? ""} `), q(o, "placeholder", R(t).placeholder), K(o, Ut[R(n)] ?? R(k).props[R(t).key] ?? ""), s.disabled = R(Gt), H(c, e);
							}, [() => J("props.place.search")]), z("input", o, (e) => {
								Ut[R(n)] = e.target.value;
							}), z("keydown", o, (e) => {
								e.key === "Enter" && Jt(R(t));
							}), z("click", s, () => Jt(R(t))), V(e, r);
						}, a = (e) => {
							var n = iu(), r = N(n), i = I(r);
							G(i), w(n), L(() => {
								H(r, `${R(t).label ?? ""} `), q(i, "min", R(t).min), q(i, "max", R(t).max), q(i, "step", R(t).step ?? 1), K(i, R(k).props[R(t).key]);
							}), z("change", i, (e) => A(R(t).key, qt(R(t), Number(e.target.value)))), V(e, n);
						}, o = (e) => {
							var n = Ll(), r = N(n);
							G(r);
							var i = I(r);
							w(n), L((e) => {
								Ti(r, e), H(i, ` ${R(t).label ?? ""}`);
							}, [() => !!R(k).props[R(t).key]]), z("change", r, (e) => A(R(t).key, e.target.checked)), V(e, n);
						}, s = (e) => {
							var n = El(), r = N(n), i = I(r);
							{
								let e = /* @__PURE__ */ O(() => (R(t).options ?? []).map((e) => [e.value, e.label]));
								Y(i, {
									get value() {
										return R(k).props[R(t).key];
									},
									get options() {
										return R(e);
									},
									onchange: (e) => A(R(t).key, e)
								});
							}
							w(n), L(() => H(r, `${R(t).label ?? ""} `)), V(e, n);
						}, c = (e) => {
							var n = au(), r = N(n), i = I(r);
							G(i), w(n), L(() => {
								H(r, `${R(t).label ?? ""} `), q(i, "placeholder", R(t).placeholder), K(i, R(k).props[R(t).key] ?? "");
							}), z("change", i, (e) => A(R(t).key, e.target.value)), V(e, n);
						};
						U(r, (e) => {
							R(t).type === "place" ? e(i) : R(t).type === "number" ? e(a, 1) : R(t).type === "toggle" ? e(o, 2) : R(t).type === "select" ? e(s, 3) : e(c, -1);
						}), V(e, n);
					}), V(e, n);
				}, a = (e) => {
					var t = zl(), n = F(t, !0);
					L((e, r) => {
						q(t, "title", e), H(n, r);
					}, [() => J("hint.pluginBlock"), () => J("ui.settings")]), z("click", t, () => E?.sendOpenConfig(R(k).blockId)), V(e, t);
				};
				U(r, (e) => {
					R(t).length ? e(i) : e(a, -1);
				}), V(e, n);
			};
			U(n, (e) => {
				R(k).type === "text" ? e(r) : R(k).type === "faq" ? e(i, 1) : R(k).type === "timeline" ? e(a, 2) : R(k).type === "quote" ? e(o, 3) : R(k).type === "stats" ? e(s, 4) : R(k).type === "table" ? e(l, 5) : R(k).type === "share" ? e(u, 6) : R(k).type === "countdown" ? e(d, 7) : R(k).type === "audio" ? e(f, 8) : R(k).type === "button" ? e(p, 9) : R(k).type === "image" ? e(m, 10) : R(k).type === "video" ? e(g, 11) : R(k).type === "icon" ? e(_, 12) : R(k).type === "collection" ? e(v, 13) : R(k).type === "product" ? e(y, 14) : R(k).type === "cart" ? e(b, 15) : R(k).type === "checkout" ? e(x, 16) : R(k).type === "gallery" ? e(S, 17) : R(k).type === "shape" ? e(C, 18) : e(ee, -1);
			}), V(e, t);
		}, m = (e) => {
			var t = Du(), n = P(t), r = (e) => {
				var t = ou(), n = P(t), r = N(n), a = I(r);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.align ?? "left"), t = /* @__PURE__ */ O(() => [
						["left", J("common.left")],
						["center", J("common.center")],
						["right", J("common.right")]
					]);
					Y(a, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("align", e)
					});
				}
				w(n);
				var o = I(n, 2), s = N(o);
				G(s);
				var c = I(s);
				w(o);
				var l = I(o, 2), u = (e) => {
					i(e);
				};
				U(l, (e) => {
					R(k).props.box && e(u);
				}), je(2), L((e, t, n) => {
					H(r, `${e ?? ""} `), Ti(s, t), H(c, ` ${n ?? ""}`);
				}, [
					() => J("lbl.align"),
					() => !!R(k).props.box,
					() => J("lbl.textBoxToggle")
				]), z("change", s, (e) => A("box", e.target.checked)), V(e, t);
			}, a = (e) => {
				var t = su(), n = P(t), r = F(n, !0), a = I(n, 2);
				i(a), je(2), L((e) => H(r, e), [() => J("lbl.cardStyle")]), V(e, t);
			}, o = (e) => {
				var t = cu(), n = P(t), r = N(n), i = I(r);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.variant ?? "left"), t = /* @__PURE__ */ O(() => [["left", J("opt.timeline.left")], ["alternating", J("opt.timeline.alternating")]]);
					Y(i, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("variant", e)
					});
				}
				w(n);
				var a = I(n, 2), o = N(a), s = I(o);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.marker ?? "filled"), t = /* @__PURE__ */ O(() => [["filled", J("opt.timeline.filled")], ["ring", J("opt.timeline.ring")]]);
					Y(s, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("marker", e)
					});
				}
				w(a);
				var c = I(a, 2), l = N(c), u = I(l);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.accent ?? "accent"), t = /* @__PURE__ */ O(yr);
					fa(u, {
						get value() {
							return R(e);
						},
						get tokens() {
							return R(t);
						},
						onchange: (e) => A("accent", e === "accent" ? null : e)
					});
				}
				w(c), je(2), L((e, t, n) => {
					H(r, `${e ?? ""} `), H(o, `${t ?? ""} `), H(l, `${n ?? ""} `);
				}, [
					() => J("lbl.variant"),
					() => J("lbl.timelineMarker"),
					() => J("lbl.color")
				]), V(e, t);
			}, s = (e) => {
				var t = uu(), n = P(t), r = N(n), i = I(r);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.variant ?? "large"), t = /* @__PURE__ */ O(() => [["large", J("opt.quote.large")], ["short", J("opt.quote.short")]]);
					Y(i, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("variant", e)
					});
				}
				w(n);
				var a = I(n, 2), o = (e) => {
					var t = lu(), n = P(t), r = N(n), i = I(r);
					w(n);
					var a = I(n, 2), o = (e) => {
						var t = zl(), n = F(t, !0);
						L((e) => H(n, e), [() => J("ui.quotePortraitRemove")]), z("click", t, () => A("image", "")), V(e, t);
					};
					U(a, (e) => {
						R(k).props.image && e(o);
					}), L((e) => H(r, `${e ?? ""} `), [() => J("ui.quotePortrait")]), z("change", i, mn), V(e, t);
				};
				U(a, (e) => {
					R(k).props.variant === "short" && e(o);
				});
				var s = I(a, 2), c = N(s), l = I(c);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.accent ?? "accent"), t = /* @__PURE__ */ O(yr);
					fa(l, {
						get value() {
							return R(e);
						},
						get tokens() {
							return R(t);
						},
						onchange: (e) => A("accent", e === "accent" ? null : e)
					});
				}
				w(s), je(2), L((e, t) => {
					H(r, `${e ?? ""} `), H(c, `${t ?? ""} `);
				}, [() => J("lbl.variant"), () => J("lbl.color")]), V(e, t);
			}, c = (e) => {
				var t = du(), n = P(t), r = N(n);
				G(r);
				var i = I(r);
				w(n), je(2), L((e, t) => {
					q(n, "title", e), Ti(r, R(k).props.countUp !== !1), H(i, ` ${t ?? ""}`);
				}, [() => J("tip.stat.countUp"), () => J("lbl.statCountUp")]), z("change", r, (e) => A("countUp", e.target.checked)), V(e, t);
			}, l = (e) => {
				var t = fu(), n = P(t), r = N(n), i = I(r);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.lines ?? "rows"), t = /* @__PURE__ */ O(() => [
						["rows", J("opt.table.rows")],
						["grid", J("opt.table.grid")],
						["none", J("common.none")]
					]);
					Y(i, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("lines", e)
					});
				}
				w(n);
				var a = I(n, 2), o = N(a);
				G(o);
				var s = I(o);
				w(a), je(2), L((e, t, n) => {
					H(r, `${e ?? ""} `), Ti(o, t), H(s, ` ${n ?? ""}`);
				}, [
					() => J("lbl.tableLines"),
					() => !!R(k).props.striped,
					() => J("lbl.tableStriped")
				]), z("change", o, (e) => A("striped", e.target.checked)), V(e, t);
			}, u = (e) => {
				var t = pu(), n = P(t), r = N(n), i = I(r);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.variant ?? "icons"), t = /* @__PURE__ */ O(() => [["icons", J("opt.share.icons")], ["labels", J("opt.share.labels")]]);
					Y(i, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("variant", e)
					});
				}
				w(n);
				var a = I(n, 2), o = N(a), s = I(o);
				G(s), w(a);
				var c = I(a, 2), l = N(c), u = I(l);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.color || "accent"), t = /* @__PURE__ */ O(yr);
					fa(u, {
						get value() {
							return R(e);
						},
						get tokens() {
							return R(t);
						},
						onchange: (e) => A("color", e === "accent" ? "" : e)
					});
				}
				w(c), je(2), L((e, t, n) => {
					H(r, `${e ?? ""} `), H(o, `${t ?? ""} `), K(s, R(k).props.size ?? 38), H(l, `${n ?? ""} `);
				}, [
					() => J("lbl.variant"),
					() => J("lbl.size"),
					() => J("lbl.color")
				]), z("change", s, (e) => A("size", Number(e.target.value) || 38)), V(e, t);
			}, d = (e) => {
				var t = fu(), n = P(t), r = N(n), i = I(r);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.variant ?? "boxes"), t = /* @__PURE__ */ O(() => [["boxes", J("opt.countdown.boxes")], ["plain", J("opt.countdown.plain")]]);
					Y(i, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("variant", e)
					});
				}
				w(n);
				var a = I(n, 2), o = N(a);
				G(o);
				var s = I(o);
				w(a), je(2), L((e, t) => {
					H(r, `${e ?? ""} `), Ti(o, R(k).props.showSeconds !== !1), H(s, ` ${t ?? ""}`);
				}, [() => J("lbl.variant"), () => J("lbl.countdownSeconds")]), z("change", o, (e) => A("showSeconds", e.target.checked)), V(e, t);
			}, f = (e) => {
				var t = mu(), n = P(t), r = N(n), i = I(r);
				{
					let e = /* @__PURE__ */ O(() => [["primary", J("opt.btn.primary")], ["secondary", J("opt.btn.secondary")]]);
					Y(i, {
						get value() {
							return R(k).props.style;
						},
						get options() {
							return R(e);
						},
						onchange: (e) => A("style", e)
					});
				}
				w(n), je(2), L((e) => H(r, `${e ?? ""} `), [() => J("lbl.style")]), V(e, t);
			}, p = (e) => {
				var t = hu(), n = P(t), r = N(n), i = I(r);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.fit ?? "cover"), t = /* @__PURE__ */ O(() => [["cover", J("opt.fitFrame.cover")], ["contain", J("opt.fitFrame.contain")]]);
					Y(i, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("fit", e)
					});
				}
				w(n);
				var a = I(n, 2), o = N(a), s = I(o);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.radius ?? ""), t = /* @__PURE__ */ O(() => [
						["", J("common.none")],
						["sm", J("opt.size.sm")],
						["md", J("opt.radius.md")]
					]);
					Y(s, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("radius", e || null)
					});
				}
				w(a);
				var c = I(a, 2), l = N(c), u = F(I(l));
				w(c);
				var d = I(c, 2);
				G(d);
				var f = I(d, 2), p = N(f), m = F(I(p));
				w(f);
				var h = I(f, 2);
				G(h);
				var g = I(h, 2), _ = N(g), v = F(I(_));
				w(g);
				var y = I(g, 2);
				G(y);
				var b = I(y, 2), x = N(b), S = F(I(x));
				w(b);
				var C = I(b, 2);
				G(C);
				var ee = I(C, 2), te = N(ee), ne = F(I(te));
				w(ee);
				var re = I(ee, 2);
				G(re);
				var ie = I(re, 2), ae = N(ie), oe = F(I(ae));
				w(ie);
				var se = I(ie, 2);
				G(se);
				var ce = I(se, 2), le = F(ce, !0);
				je(2), L((e, t, n, i, a, s, c, f, b, ee, ie, ue, de, fe, pe, me, he) => {
					H(r, `${e ?? ""} `), H(o, `${t ?? ""} `), H(l, `${n ?? ""} `), H(u, `${i ?? ""}%`), K(d, R(k).props.x ?? .5), H(p, `${a ?? ""} `), H(m, `${s ?? ""}%`), K(h, R(k).props.y ?? .5), q(g, "title", c), H(_, `${f ?? ""} `), H(v, `${b ?? ""}x`), K(y, R(k).props.zoom ?? 1), H(x, `${ee ?? ""} `), H(S, `${ie ?? ""}%`), K(C, R(k).props.brightness ?? 1), H(te, `${ue ?? ""} `), H(ne, `${de ?? ""}%`), K(re, R(k).props.contrast ?? 1), H(ae, `${fe ?? ""} `), H(oe, `${pe ?? ""}%`), K(se, R(k).props.saturate ?? 1), q(ce, "title", me), H(le, he);
				}, [
					() => J("lbl.fit"),
					() => J("lbl.radius"),
					() => J("lbl.focusX"),
					() => Math.round((R(k).props.x ?? .5) * 100),
					() => J("lbl.focusY"),
					() => Math.round((R(k).props.y ?? .5) * 100),
					() => J("tip.zoomCrop"),
					() => J("lbl.zoom"),
					() => (R(k).props.zoom ?? 1).toFixed(2),
					() => J("lbl.brightness"),
					() => Math.round((R(k).props.brightness ?? 1) * 100),
					() => J("lbl.contrast"),
					() => Math.round((R(k).props.contrast ?? 1) * 100),
					() => J("lbl.saturate"),
					() => Math.round((R(k).props.saturate ?? 1) * 100),
					() => J("tip.resetAdjust"),
					() => J("ui.resetAdjust")
				]), z("input", d, (e) => A("x", Number(e.target.value))), z("input", h, (e) => A("y", Number(e.target.value))), z("input", y, (e) => A("zoom", Number(e.target.value))), z("input", C, (e) => A("brightness", Number(e.target.value))), z("input", re, (e) => A("contrast", Number(e.target.value))), z("input", se, (e) => A("saturate", Number(e.target.value))), z("click", ce, () => Vt(`edit:${R(k).blockId}`, (e) => {
					e.props.brightness = 1, e.props.contrast = 1, e.props.saturate = 1;
				})), V(e, t);
			}, m = (e) => {
				var t = gu(), n = P(t), r = N(n), i = I(r);
				G(i), w(n);
				var a = I(n, 2), o = N(a), s = I(o);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.color ?? "accent"), t = /* @__PURE__ */ O(yr);
					fa(s, {
						get value() {
							return R(e);
						},
						get tokens() {
							return R(t);
						},
						onchange: (e) => A("color", e)
					});
				}
				w(a), je(2), L((e, t, n) => {
					H(r, `${e ?? ""} `), K(i, R(k).props.size ?? 48), q(a, "title", t), H(o, `${n ?? ""} `);
				}, [
					() => J("lbl.sizePx"),
					() => J("hint.icon.color"),
					() => J("lbl.color")
				]), z("change", i, (e) => A("size", Number(e.target.value))), V(e, t);
			}, h = (e) => {
				var t = mu(), n = P(t), r = N(n), i = I(r);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.view ?? "cards"), t = /* @__PURE__ */ O(() => [
						["cards", J("opt.collectionView.cards")],
						["list", J("opt.collectionView.list")],
						["archive", J("opt.collectionView.archive")]
					]);
					Y(i, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("view", e)
					});
				}
				w(n), je(2), L((e) => H(r, `${e ?? ""} `), [() => J("lbl.view")]), V(e, t);
			}, g = (e) => {
				var t = _u(), n = P(t), r = N(n), i = I(r);
				G(i), w(n), je(2), L((e, t) => {
					q(n, "title", e), H(r, `${t ?? ""} `), K(i, R(k).props.columns ?? 0);
				}, [() => J("tip.product.columns"), () => J("lbl.columns")]), z("change", i, (e) => A("columns", Number(e.target.value))), V(e, t);
			}, _ = (e) => {
				var t = mu(), n = P(t), r = N(n), i = I(r);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.variant ?? "button"), t = /* @__PURE__ */ O(() => [["button", J("opt.cart.button")], ["icon", J("opt.cart.icon")]]);
					Y(i, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("variant", e)
					});
				}
				w(n), je(2), L((e) => H(r, `${e ?? ""} `), [() => J("lbl.view")]), V(e, t);
			}, v = (e) => {
				var t = bu(), n = P(t), r = N(n), i = I(r);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.view ?? "grid"), t = /* @__PURE__ */ O(() => [
						["grid", J("opt.galleryView.grid")],
						["carousel", J("opt.galleryView.carousel")],
						["slides", J("opt.galleryView.slides")]
					]);
					Y(i, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("view", e)
					});
				}
				w(n);
				var a = I(n, 2), o = (e) => {
					var t = vu(), n = P(t), r = N(n), i = I(r);
					G(i), w(n);
					var a = I(n, 2), o = N(a), s = F(I(o));
					w(a);
					var c = I(a, 2);
					G(c), L((e, t) => {
						H(r, `${e ?? ""} `), K(i, R(k).props.columns ?? 3), H(o, `${t ?? ""} `), H(s, `${R(k).props.gap ?? 12 ?? ""} px`), K(c, R(k).props.gap ?? 12);
					}, [() => J("lbl.columns"), () => J("lbl.imageGap")]), z("change", i, (e) => A("columns", Number(e.target.value))), z("input", c, (e) => A("gap", Number(e.target.value))), V(e, t);
				};
				U(a, (e) => {
					(R(k).props.view ?? "grid") === "grid" && e(o);
				});
				var s = I(a, 2), c = (e) => {
					var t = yu(), n = N(t), r = I(n);
					G(r), w(t), L((e) => {
						H(n, `${e ?? ""} `), K(r, R(k).props.interval ?? 5);
					}, [() => J("lbl.secondsPerImage")]), z("change", r, (e) => A("interval", Number(e.target.value))), V(e, t);
				};
				U(s, (e) => {
					R(k).props.view === "slides" && e(c);
				});
				var l = I(s, 2), u = N(l), d = I(u);
				{
					let e = /* @__PURE__ */ O(() => R(k).props.radius ?? ""), t = /* @__PURE__ */ O(() => [
						["", J("common.none")],
						["sm", J("opt.size.sm")],
						["md", J("opt.radius.md")]
					]);
					Y(d, {
						get value() {
							return R(e);
						},
						get options() {
							return R(t);
						},
						onchange: (e) => A("radius", e || null)
					});
				}
				w(l);
				var f = I(l, 2), p = N(f);
				G(p);
				var m = I(p);
				w(f), je(2), L((e, t, n, i) => {
					H(r, `${e ?? ""} `), H(u, `${t ?? ""} `), q(f, "title", n), Ti(p, R(k).props.lightbox !== !1), H(m, ` ${i ?? ""}`);
				}, [
					() => J("lbl.view"),
					() => J("lbl.radius"),
					() => J("tip.lightbox"),
					() => J("lbl.lightbox")
				]), z("change", p, (e) => A("lightbox", e.target.checked)), V(e, t);
			}, y = (e) => {
				var t = xu(), n = P(t), r = N(n);
				Y(I(r), {
					get value() {
						return R(k).props.color;
					},
					get options() {
						return _n;
					},
					onchange: (e) => A("color", e)
				}), w(n);
				var i = I(n, 2), a = N(i), o = I(a);
				G(o), w(i);
				var s = I(i, 2), c = N(s);
				G(c);
				var l = I(c);
				w(s), je(2), L((e, t, n, i, u) => {
					H(r, `${e ?? ""} `), H(a, `${t ?? ""} `), K(o, R(k).props.thickness), q(s, "title", n), Ti(c, i), H(l, ` ${u ?? ""}`);
				}, [
					() => J("lbl.color"),
					() => J("lbl.thickness"),
					() => J("tip.shape.fill"),
					() => !!R(k).props.fill,
					() => J("lbl.filled")
				]), z("change", o, (e) => A("thickness", Number(e.target.value))), z("change", c, (e) => A("fill", e.target.checked ? R(k).props.color : null)), V(e, t);
			};
			U(n, (e) => {
				R(k).type === "text" ? e(r) : R(k).type === "faq" ? e(a, 1) : R(k).type === "timeline" ? e(o, 2) : R(k).type === "quote" ? e(s, 3) : R(k).type === "stats" ? e(c, 4) : R(k).type === "table" ? e(l, 5) : R(k).type === "share" ? e(u, 6) : R(k).type === "countdown" ? e(d, 7) : R(k).type === "button" ? e(f, 8) : R(k).type === "image" ? e(p, 9) : R(k).type === "icon" ? e(m, 10) : R(k).type === "collection" ? e(h, 11) : R(k).type === "product" ? e(g, 12) : R(k).type === "cart" ? e(_, 13) : R(k).type === "gallery" ? e(v, 14) : R(k).type === "shape" && e(y, 15);
			});
			var b = I(n, 2), x = N(b), S = I(x);
			{
				let e = /* @__PURE__ */ O(() => kr(R(k).animation) ? R(k).animation.type : "");
				Y(S, {
					get value() {
						return R(e);
					},
					get options() {
						return jr;
					},
					onchange: (e) => Pr(e || null)
				});
			}
			w(b);
			var C = I(b, 2), ee = (e) => {
				var t = Su(), n = P(t), r = N(n), i = I(r);
				G(i), w(n);
				var a = I(n, 2), o = N(a), s = I(o);
				G(s), w(a), L((e, t) => {
					H(r, `${e ?? ""} `), K(i, R(k).animation.props.duration), H(o, `${t ?? ""} `), K(s, R(k).animation.props.delay);
				}, [() => J("lbl.durationMs"), () => J("lbl.delayMs")]), z("change", i, (e) => Fr("duration", Number(e.target.value))), z("change", s, (e) => Fr("delay", Number(e.target.value))), V(e, t);
			}, te = /* @__PURE__ */ O(() => kr(R(k).animation));
			U(C, (e) => {
				R(te) && e(ee);
			});
			var ne = I(C, 2), re = N(ne), ie = I(re);
			{
				let e = /* @__PURE__ */ O(() => R(k).hover?.type ?? (R(k).animation && !kr(R(k).animation) ? R(k).animation.type : ""));
				Y(ie, {
					get value() {
						return R(e);
					},
					get options() {
						return Mr;
					},
					onchange: (e) => B(e || null)
				});
			}
			w(ne);
			var ae = I(ne, 2), oe = (e) => {
				var t = Tu(), n = I(P(t), 2), r = N(n);
				G(r);
				var i = I(r);
				w(n);
				var a = I(n, 2), o = (e) => {
					var t = wu(), n = P(t), r = N(n), i = I(r);
					{
						let e = /* @__PURE__ */ O(() => R(k).sticky.mode ?? "scroll"), t = /* @__PURE__ */ O(() => [["scroll", J("opt.sticky.modeScroll")], ["screen", J("opt.sticky.modeScreen")]]);
						Y(i, {
							get value() {
								return R(e);
							},
							get options() {
								return R(t);
							},
							onchange: (e) => Vt(`edit:${R(k).blockId}`, (t) => {
								t.sticky = {
									...t.sticky,
									mode: e
								};
							})
						});
					}
					w(n);
					var a = I(n, 2), o = (e) => {
						var t = Cu(), n = N(t), r = I(n);
						G(r), w(t), L((e, i) => {
							q(t, "title", e), H(n, `${i ?? ""} `), K(r, R(k).sticky.offset ?? 16);
						}, [() => R(k).sticky.mode === "screen" ? J("tip.stickyEdge") : J("tip.stickyOffset"), () => R(k).sticky.mode === "screen" ? J("lbl.stickyEdge") : J("lbl.stickyOffset")]), z("change", r, (e) => Vt(`edit:${R(k).blockId}`, (t) => {
							t.sticky = {
								...t.sticky,
								offset: Math.max(0, Number(e.target.value) || 0)
							};
						})), V(e, t);
					};
					U(a, (e) => {
						(R(k).sticky.mode !== "screen" || (R(k).sticky.dock ?? "bottom-right") !== "middle-center") && e(o);
					});
					var s = I(a, 2), c = (e) => {
						var t = El(), n = N(t), r = I(n);
						{
							let e = /* @__PURE__ */ O(() => R(k).sticky.dock ?? "bottom-right"), t = /* @__PURE__ */ O(() => Rt.map(([e, t]) => [e, J(t)]));
							Y(r, {
								get value() {
									return R(e);
								},
								get options() {
									return R(t);
								},
								onchange: (e) => Vt(`edit:${R(k).blockId}`, (t) => {
									t.sticky = {
										...t.sticky,
										dock: e
									};
								})
							});
						}
						w(t), L((e, r) => {
							q(t, "title", e), H(n, `${r ?? ""} `);
						}, [() => J("tip.stickyDock"), () => J("lbl.stickyDock")]), V(e, t);
					}, l = (e) => {
						var t = El(), n = N(t), r = I(n);
						{
							let e = /* @__PURE__ */ O(() => R(k).sticky.until ?? ""), t = /* @__PURE__ */ O(zt);
							Y(r, {
								get value() {
									return R(e);
								},
								get options() {
									return R(t);
								},
								onchange: (e) => Vt(`edit:${R(k).blockId}`, (t) => {
									t.sticky = {
										...t.sticky,
										until: e || null
									};
								})
							});
						}
						w(t), L((e, r) => {
							q(t, "title", e), H(n, `${r ?? ""} `);
						}, [() => J("tip.stickyUntil"), () => J("lbl.stickyUntil")]), V(e, t);
					};
					U(s, (e) => {
						R(k).sticky.mode === "screen" ? e(c) : e(l, -1);
					}), L((e, t) => {
						q(n, "title", e), H(r, `${t ?? ""} `);
					}, [() => J("tip.stickyMode"), () => J("lbl.stickyMode")]), V(e, t);
				};
				U(a, (e) => {
					R(k).sticky && e(o);
				}), L((e, t, a) => {
					q(n, "title", e), Ti(r, t), H(i, ` ${a ?? ""}`);
				}, [
					() => J("tip.sticky"),
					() => !!R(k).sticky,
					() => J("lbl.sticky")
				]), z("change", r, (e) => Vt(`edit:${R(k).blockId}`, (t) => {
					t.sticky = e.target.checked ? {
						offset: 16,
						until: null
					} : null;
				})), V(e, t);
			};
			U(ae, (e) => {
				R(ge) === "desktop" && e(oe);
			});
			var se = I(ae, 4), ce = N(se), le = F(ce, !0), ue = I(ce, 2), de = N(ue), fe = (e) => {
				var t = Eu(), n = N(t), r = N(n, !0), i = I(r);
				G(i), w(n);
				var a = I(n, 2), o = N(a, !0), s = I(o);
				G(s), w(a);
				var c = I(a, 2), l = N(c, !0), u = I(l);
				G(u), w(c);
				var d = I(c, 2), f = N(d, !0), p = I(f);
				G(p), w(d);
				var m = I(d, 2), h = N(m, !0), g = I(h);
				G(g), w(m);
				var _ = I(m, 2), v = N(_, !0), y = I(v);
				G(y), w(_), w(t), L((e, t, n, a, c, d, _) => {
					H(r, e), K(i, R(k).frame.x), H(o, t), K(s, R(k).frame.y), H(l, n), K(u, R(k).frame.w), H(f, a), K(p, R(k).frame.h), q(m, "title", c), H(h, d), K(g, R(k).frame.z ?? 1), H(v, _), K(y, R(k).frame.rot ?? 0);
				}, [
					() => J("frame.x"),
					() => J("frame.y"),
					() => J("frame.w"),
					() => J("frame.h"),
					() => J("tip.frameZ"),
					() => J("frame.z"),
					() => J("frame.rot")
				]), z("change", i, (e) => Yt("x", Number(e.target.value))), z("change", s, (e) => Yt("y", Number(e.target.value))), z("change", u, (e) => Yt("w", Number(e.target.value))), z("change", p, (e) => Yt("h", Number(e.target.value))), z("change", g, (e) => Yt("z", Number(e.target.value))), z("change", y, (e) => Yt("rot", Number(e.target.value))), V(e, t);
			};
			U(de, (e) => {
				R(ge) === "desktop" && e(fe);
			});
			var pe = I(de, 2), me = N(pe);
			G(me);
			var he = I(me);
			w(pe);
			var _e = I(pe, 2), ve = N(_e);
			G(ve);
			var ye = I(ve);
			w(_e), w(ue), w(se), L((e, t, n, r, i, a, o, s, c, l) => {
				q(b, "title", e), H(x, `${t ?? ""} `), q(ne, "title", n), H(re, `${r ?? ""} `), q(ce, "title", i), H(le, a), q(pe, "title", o), Ti(me, R(k).hideMobile), H(he, ` ${s ?? ""}`), q(_e, "title", c), Ti(ve, R(k).decor), H(ye, ` ${l ?? ""}`);
			}, [
				() => J("tip.props.blockAnim"),
				() => J("lbl.animIn"),
				() => J("tip.props.blockHover"),
				() => J("lbl.onHover"),
				() => J("hint.placement"),
				() => J("group.placement"),
				() => J("tip.hideMobile"),
				() => J("lbl.hideMobile"),
				() => J("tip.decor"),
				() => J("lbl.decor")
			]), z("change", me, (e) => fn(e.target.checked)), z("change", ve, (e) => cn(e.target.checked)), V(e, t);
		};
		U(f, (e) => {
			R(Kt) === "content" ? e(p) : e(m, -1);
		}), L((e, t) => {
			o = vi(a, 1, "svelte-1n46o8q", null, o, { on: R(Kt) === "content" }), H(s, e), u = vi(l, 1, "svelte-1n46o8q", null, u, { on: R(Kt) === "style" }), H(d, t);
		}, [() => J("props.tabContent"), () => J("props.tabStyle")]), z("click", a, () => M(Kt, "content")), z("click", l, () => M(Kt, "style")), V(e, t);
	}, o = [
		["color", rc],
		["gradient", hc],
		["glow", gc],
		["image", Hc],
		["slideshow", qc],
		["video", $c],
		["grain", vc]
	], s = Object.fromEntries(o), c = {
		copy: "<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"9\" y=\"9\" width=\"11\" height=\"11\" rx=\"2\"/><path d=\"M5 15V5a2 2 0 0 1 2-2h10\"/></svg>",
		phone: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><rect x=\"8\" y=\"3\" width=\"8\" height=\"18\" rx=\"2\"/><path d=\"M11 17.5h2\"/></svg>",
		pencil: "<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17 3l4 4L8 20l-5 1 1-5L17 3z\"/></svg>",
		eye: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\"/></svg>",
		warn: "<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3L2 20h20L12 3z\"/><path d=\"M12 10v4\"/><path d=\"M12 17.2h.01\"/></svg>",
		up: "<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 20V4\"/><path d=\"M5 11l7-7 7 7\"/></svg>",
		down: "<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 4v16\"/><path d=\"M5 13l7 7 7-7\"/></svg>",
		right: "<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 12h16\"/><path d=\"M13 5l7 7-7 7\"/></svg>",
		cross: "<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"><path d=\"M5 5l14 14\"/><path d=\"M19 5L5 19\"/></svg>",
		plus: "<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"><path d=\"M12 5v14\"/><path d=\"M5 12h14\"/></svg>",
		minus: "<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\"><path d=\"M5 12h14\"/></svg>",
		gear: "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z\"/></svg>",
		guides: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 2v20M2 12h20\" stroke-dasharray=\"3 3\"/><rect x=\"7.5\" y=\"7.5\" width=\"9\" height=\"9\" rx=\"1.5\"/></svg>",
		kebab: "<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"currentColor\" stroke=\"none\"><circle cx=\"12\" cy=\"5\" r=\"1.8\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\"/><circle cx=\"12\" cy=\"19\" r=\"1.8\"/></svg>",
		bookmark: "<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z\"/><path d=\"M12 7v6M9 10h6\"/></svg>",
		fit: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4\"/></svg>",
		gridToggle: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M9 3v18M15 3v18M3 9h18M3 15h18\"/></svg>",
		restore: "<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 4v5h5\"/><path d=\"M3.05 13A9 9 0 1 0 6 5.3L3 9\"/><path d=\"M12 8v4.5l3 1.8\"/></svg>",
		caret: "<svg width=\"9\" height=\"9\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9l6 6 6-6\"/></svg>",
		external: "<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 4h6v6\"/><path d=\"M20 4l-8 8\"/><path d=\"M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5\"/></svg>",
		device_desktop: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"3\" width=\"20\" height=\"13\" rx=\"2\"/><path d=\"M8 21h8M12 16v5\"/></svg>",
		device_reference: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"3\" width=\"20\" height=\"13\" rx=\"2\"/><path d=\"M8 21h8M12 16v5M6 9.5h12\"/></svg>",
		device_laptop: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"11\" rx=\"1.5\"/><path d=\"M2 19h20\"/></svg>",
		device_tablet: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"/><path d=\"M11 18.5h2\"/></svg>",
		device_mobile: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"/><path d=\"M11 18.5h2\"/></svg>"
	}, l = [
		["purple", J("adminTheme.purple")],
		["well", J("adminTheme.well")],
		["gold", J("adminTheme.gold")],
		["grey", J("adminTheme.grey")],
		["aurora", J("adminTheme.aurora")],
		["dusk", J("adminTheme.dusk")],
		["ember", J("adminTheme.ember")]
	], u = {
		lilla: "purple",
		bronn: "well",
		gull: "gold",
		graa: "grey",
		nordlys: "aurora",
		skumring: "dusk",
		glo: "ember"
	}, d = /* @__PURE__ */ j(nn((() => {
		let e = localStorage.getItem("urd-admin-theme");
		return u[e] ?? e ?? "grey";
	})()));
	Cn(() => {
		document.documentElement.dataset.adminTheme = R(d), localStorage.setItem("urd-admin-theme", R(d)), p();
	});
	function p() {
		let e = getComputedStyle(document.documentElement), t = e.getPropertyValue("--urd-color-accent").trim();
		E?.sendAdminTheme({
			bg: e.getPropertyValue("--urd-color-bg").trim(),
			surface: e.getPropertyValue("--urd-color-surface").trim(),
			accent: t,
			text: e.getPropertyValue("--urd-color-text").trim(),
			"accent-text": m(t)
		});
	}
	function m(e) {
		return tc(e) == null || (nc(e, "#ffffff") ?? 0) >= (nc(e, "#0b0e14") ?? 0) ? "#ffffff" : "#0b0e14";
	}
	let g = /* @__PURE__ */ j(null), _ = /* @__PURE__ */ j(null), v = /* @__PURE__ */ j(!1), y = /* @__PURE__ */ j(""), b = /* @__PURE__ */ j("info"), x = 0;
	function S(e, t = "info") {
		M(y, e, !0), M(b, t, !0);
		let n = ++x;
		t === "ok" && setTimeout(() => {
			x === n && (M(y, ""), M(b, "info"));
		}, 8e3);
	}
	function C() {
		S(J("status.storageFull"), "error");
	}
	function ee(e, t) {
		try {
			localStorage.setItem(e, t);
		} catch {
			C();
		}
	}
	let te = /* @__PURE__ */ j(null), ne = /* @__PURE__ */ j(null), re = /* @__PURE__ */ j(nn({
		size: 16,
		snap: !0
	})), ie = /* @__PURE__ */ j(!0), ae = /* @__PURE__ */ j(nn(to(typeof window < "u" ? window : null) ?? 1920)), oe = "urd-admin-screen";
	function se() {
		let e = null;
		try {
			e = JSON.parse(localStorage.getItem(oe) ?? "null");
		} catch {
			e = null;
		}
		return no(e, R(ae));
	}
	let ce = /* @__PURE__ */ j(nn(se()));
	function le(e) {
		M(ce, no({
			...Ke(R(ce)),
			...e
		}, R(ae)), !0);
		try {
			localStorage.setItem(oe, JSON.stringify(R(ce)));
		} catch {}
	}
	let ue = /* @__PURE__ */ O(() => ro(R(ce), R(ae))), de = [
		{
			id: "reference",
			width: 1920,
			height: null,
			viewport: "desktop"
		},
		{
			id: "laptop",
			width: 1280,
			height: null,
			viewport: "desktop"
		},
		{
			id: "tablet",
			width: 810,
			height: null,
			viewport: "desktop"
		},
		{
			id: "mobile",
			width: 390,
			height: null,
			viewport: "mobile"
		}
	], fe = /* @__PURE__ */ O(() => [{
		id: "desktop",
		width: R(ue).width,
		height: R(ue).height || null,
		viewport: "desktop"
	}, ...de]);
	function pe(e) {
		let t = fo(R(Aa), R(ja), e.width).width;
		return J(e.id === "desktop" ? R(ce).mode === "own" ? "tip.view.desktop" : e.height ? "tip.view.desktopSizeH" : "tip.view.desktopSize" : `tip.view.${e.id}`, {
			w: e.width,
			h: e.height ?? 0,
			c: t
		});
	}
	let me = /* @__PURE__ */ j("desktop"), he = /* @__PURE__ */ O(() => R(fe).find((e) => e.id === R(me)) ?? R(fe)[0]), ge = /* @__PURE__ */ O(() => R(he).viewport), _e = /* @__PURE__ */ j(null), ve = /* @__PURE__ */ j(0), ye = /* @__PURE__ */ j(0), be = /* @__PURE__ */ j("fit"), xe = /* @__PURE__ */ j(1), Se = /* @__PURE__ */ O(() => uo(R(Aa), R(ja))), Ce = /* @__PURE__ */ O(() => R(he).width), we = /* @__PURE__ */ O(() => R(he).height ?? 0), Te = /* @__PURE__ */ O(() => R(be) === "manual" ? R(xe) : Ja(R(ve), R(Ce), "fit", R(ye), R(we)));
	function Ee(e) {
		let t = Math.min(400, Math.max(10, (Math.round(Math.round(R(Te) * 100) / 10) + e) * 10));
		M(xe, t / 100), M(be, "manual");
	}
	let De = /* @__PURE__ */ O(() => R(we) > 0 ? R(we) : R(Te) > 0 ? R(ye) / R(Te) : R(ye)), Oe = /* @__PURE__ */ O(() => R(Ce) * R(Te)), ke = /* @__PURE__ */ O(() => R(we) > 0 ? R(we) * R(Te) : R(ye)), Ae = /* @__PURE__ */ O(() => R(Oe) > R(ve) + 1 || R(ke) > R(ye) + 1);
	Cn(() => {
		let e = () => E?.sendCloseMenus();
		return document.addEventListener("pointerdown", e, !0), () => document.removeEventListener("pointerdown", e, !0);
	}), Cn(() => {
		let e = R(ge);
		E?.sendViewport(e);
	}), Cn(() => {
		let e = R(Te);
		E?.sendZoom(e);
	}), Cn(() => {
		let e = () => {
			M(ae, to(window) ?? R(ae), !0);
		};
		return window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
	}), Cn(() => {
		let e = R(_e);
		if (!e || typeof ResizeObserver > "u") return;
		let t = () => {
			M(ve, e.clientWidth, !0), M(ye, e.clientHeight, !0);
		};
		t();
		let n = new ResizeObserver(t);
		return n.observe(e), () => n.disconnect();
	});
	let Me = /* @__PURE__ */ j(0);
	function Ne() {
		M(Me, T?.data.sections.filter((e) => e.responsive?.mobile?.attention?.needed).length ?? 0, !0);
	}
	function Pe() {
		let e = T?.data.sections.find((e) => e.responsive?.mobile?.attention?.needed);
		M(me, "mobile"), e && setTimeout(() => E?.sendScrollSection(e.id), 0);
	}
	function Fe(e) {
		let t = T.data.sections.find((t) => t.id === e.sectionId);
		if (t) {
			Ye("layout");
			for (let n of e.frames ?? []) {
				let e = t.blocks.find((e) => e.id === n.blockId);
				e && (e.frames.desktop = {
					...e.frames.desktop,
					...n.frame
				});
			}
			t.size = {
				...t.size,
				minHeight: e.minHeight
			}, Le(t, "layout-changed"), e.sectionId === R(vn) && M(bn, e.minHeight, !0), R(k)?.sectionId === e.sectionId && Pt(), T.save(), Ue(), E?.sendSection(R(_), t);
		}
	}
	function Ie(e) {
		return e?.blocks?.some((e) => e.frames?.mobile) ?? !1;
	}
	function Le(e, t) {
		!e || !Ie(e) || e.responsive?.mobile?.attention?.needed || (e.responsive = {
			...e.responsive ?? {},
			mobile: {
				...e.responsive?.mobile ?? { mode: "auto" },
				attention: {
					needed: !0,
					reason: t,
					since: (/* @__PURE__ */ new Date()).toISOString()
				}
			}
		}, Ne(), E?.sendAttention(e.id, !0));
	}
	let T = null, Re = null, E = null, D = /* @__PURE__ */ j(null);
	function ze() {
		M(D, Re.data, !0), Re.replace(R(D));
	}
	function Be() {
		E?.sendSite(Ke(R(D)));
	}
	let Ve = /* @__PURE__ */ new Set(), He = () => R(D).pages.find((e) => e.id === R(_));
	function Ue() {
		let e = R(D)?.pages?.some((e) => !Ve.has(e.id) && localStorage.getItem(`urd-draft-${e.id}`) !== null) ?? !1, t = wo?.hasDraft() || Object.values(To).some((e) => e.hasDraft()), n = Z?.hasDraft() || Object.values(Ro).some((e) => e.hasDraft());
		M(v, e || T?.hasDraft() && !Ve.has(R(_)) || Re?.hasDraft() || Q?.hasDraft() || t || n || !1, !0);
	}
	let We = [], Ge = [], qe = null;
	function Je() {
		return JSON.stringify({
			pageId: R(_),
			page: T.data,
			site: Re.data,
			collectionsIndex: Do ? wo.data : null,
			collections: Do ? Object.fromEntries(Object.entries(To).map(([e, t]) => [e, t.data])) : {},
			templatesIndex: Bo ? Z.data : null,
			templates: Bo ? Object.fromEntries(Object.entries(Ro).map(([e, t]) => [e, t.data])) : {},
			plugins: Q?.data ?? null
		});
	}
	function Ye(e) {
		e === qe && (e.startsWith("edit:") || e.startsWith("grid:")) || (We.push(Je()), We.length > 50 && We.shift(), Ge.length = 0, qe = e);
	}
	function Qe(e) {
		let { pageId: t, page: n, site: r, collectionsIndex: i, collections: a, templatesIndex: o, templates: s, plugins: c } = JSON.parse(e);
		if (Re.replace(r), ze(), Re.save(), M(re, {
			snap: !0,
			...R(D).grid
		}, !0), Be(), $e(i, a ?? {}), et(o, s ?? {}), tt(c), t && t !== R(_) && R(D).pages.some((e) => e.id === t)) {
			ee(`urd-draft-${t}`, JSON.stringify(n)), xi(t, { keepHistory: !0 }), Ue();
			return;
		}
		T.replace(n), T.save(), Ue(), Ne(), Pt(), En(T.data.sections.find((e) => e.id === R(vn))), R(D).pages.some((e) => e.id === R(_)) ? E?.sendPage(R(_), T.data) : xi(R(D).pages[0].id, { keepHistory: !0 });
	}
	function $e(e, t) {
		if (!(!wo || !e) && JSON.stringify({
			index: wo.data,
			collections: Object.fromEntries(Object.entries(To).map(([e, t]) => [e, t.data]))
		}) !== JSON.stringify({
			index: e,
			collections: t
		})) {
			wo.replace(e), wo.save();
			for (let e of Object.keys(To)) e in t || (localStorage.removeItem(`urd-draft-collection-${e}`), localStorage.removeItem(`urd-draft-samling-${e}`), delete To[e]);
			for (let [e, n] of Object.entries(t)) {
				if (!To[e]) {
					let t = Eo[e] ?? null;
					To[e] = ea(`urd-draft-collection-${e}`, () => t, C, `urd-draft-samling-${e}`);
				}
				To[e].replace(n), To[e].save();
			}
			M(Oo, [...e.samlinger ?? []], !0), R(Mo) && !R(Oo).includes(R(Mo)) && M(Mo, null), Xo();
		}
	}
	function et(e, t) {
		if (!(!Z || !e) && JSON.stringify({
			index: Z.data,
			templates: Object.fromEntries(Object.entries(Ro).map(([e, t]) => [e, t.data]))
		}) !== JSON.stringify({
			index: e,
			templates: t
		})) {
			Z.replace(e), Z.save();
			for (let e of Object.keys(Ro)) e in t || (localStorage.removeItem(`urd-draft-template-${e}`), localStorage.removeItem(`urd-draft-mal-${e}`), delete Ro[e]);
			for (let [e, n] of Object.entries(t)) Ro[e] || (Ro[e] = ea(`urd-draft-template-${e}`, () => zo[e] ?? null, C, `urd-draft-mal-${e}`)), Ro[e].replace(n), Ro[e].save();
			M(Vo, [...e.maler ?? []], !0), Ue(), Uo();
		}
	}
	function tt(e) {
		!Q || !e || JSON.stringify(Q.data) !== JSON.stringify(e) && (Q.replace(e), Q.save(), Ls(), ac());
	}
	function nt() {
		We.length && (Ge.push(Je()), Qe(We.pop()), qe = null, S(J("status.undone")));
	}
	function rt() {
		Ge.length && (We.push(Je()), Qe(Ge.pop()), qe = null, S(J("status.redone")));
	}
	function it(e) {
		R(It) && (e.target instanceof Element && e.target.closest(".block-menu") || M(It, null));
	}
	function at(e) {
		if (e.key === "Escape" && R(It)) {
			M(It, null);
			return;
		}
		if (!(e.ctrlKey || e.metaKey)) return;
		let t = e.key.toLowerCase();
		if (t === "d") {
			let t = e.target;
			if (t instanceof HTMLElement && (t.isContentEditable || t.tagName === "TEXTAREA" || t.tagName === "INPUT" && ![
				"number",
				"checkbox",
				"range",
				"color"
			].includes(t.type)) || !R(k) || R(ge) === "mobile") return;
			e.preventDefault(), E?.sendDuplicate();
			return;
		}
		if (t !== "z" && t !== "y") return;
		let n = e.target;
		n instanceof HTMLElement && (n.isContentEditable || n.tagName === "TEXTAREA" || n.tagName === "INPUT" && ![
			"number",
			"checkbox",
			"range",
			"color"
		].includes(n.type)) || (e.preventDefault(), t === "y" || e.shiftKey ? rt() : nt());
	}
	async function ot() {
		M(g, ko(await (await fetch("/content/site.json")).json()), !0), Re = ea("urd-draft-site", () => R(g), C), (Re.data.schemaVersion ?? 1) > 3 && (console.warn(`Urd: the site draft has schemaVersion ${Re.data.schemaVersion} (the engine has 3) and is discarded`), Re.replace(Ke(R(g)))), Re.replace(ko(Re.data)), Re.save(), ze(), M(re, {
			snap: !0,
			...R(D).grid
		}, !0), await xi(new URLSearchParams(location.search).get("page") ?? R(D).pages[0].id), await Ws(), await Yo(), await Ho(), await Kr(), R(ne) && Yr(), R(D).site.setup === !0 && !localStorage.getItem("urd-setup-done") && (M(ht, R(D).site.title, !0), M(gt, R(D).theme.tokens.color.accent, !0), M(_t, R(D).theme.tokens.color.bg, !0), M(mt, !0));
	}
	let st = /* @__PURE__ */ j(null);
	function ct({ title: e, lines: t = [], okLabel: n = J("confirm.ok"), cancelLabel: r = J("confirm.cancel") }) {
		return new Promise((i) => {
			M(st, {
				title: e,
				lines: t,
				okLabel: n,
				cancelLabel: r,
				resolve: i
			}, !0);
		});
	}
	function lt({ title: e, lines: t = [], value: n = "", placeholder: r = "", okLabel: i = J("confirm.ok"), cancelLabel: a = J("confirm.cancel") }) {
		return new Promise((o) => {
			M(st, {
				title: e,
				lines: t,
				okLabel: i,
				cancelLabel: a,
				resolve: o,
				prompt: !0,
				value: n,
				placeholder: r
			}, !0);
		});
	}
	function ut(e) {
		R(st)?.resolve(R(st).prompt ? e ? R(st).value : null : e), M(st, null);
	}
	let pt = !1;
	Cn(() => {
		if (!R(st)) return;
		let e = (e) => {
			e.key === "Escape" && (e.stopPropagation(), ut(!1));
		};
		return document.addEventListener("keydown", e, !0), () => document.removeEventListener("keydown", e, !0);
	});
	let mt = /* @__PURE__ */ j(!1), ht = /* @__PURE__ */ j(""), gt = /* @__PURE__ */ j("#7c5cff"), _t = /* @__PURE__ */ j("#0b0e14");
	function vt() {
		localStorage.setItem("urd-setup-done", "1"), M(mt, !1);
	}
	function yt() {
		let e = R(ht).trim();
		e && (Bi("setup", () => {
			R(D).site.title = e, R(D).nav.logo = {
				type: "text",
				value: e
			}, R(D).theme.tokens.color.accent = R(gt), R(D).theme.tokens.color.bg = R(_t), delete R(D).site.setup;
		}), vt(), S(J("status.setupDone"), "ok"));
	}
	let bt = /* @__PURE__ */ j(null), xt = [
		[
			"pages",
			"blocks",
			"properties",
			"grid"
		],
		[
			"site",
			"theme",
			"nav",
			"footer",
			"collections",
			"plugins"
		],
		["history", "update"]
	], St = [
		"rail.thisPage",
		"rail.site",
		"rail.system"
	], Ct = Object.fromEntries(xt.flat().map((e) => [e, J(`panel.${e}`)])), wt = {
		pages: ["hint.pages.drafts"],
		blocks: ["hint.blocks.intro"],
		grid: ["hint.grid.intro", "hint.grid.section"],
		collections: ["hint.collections.intro"],
		plugins: ["hint.plugins.intro"],
		history: ["hint.history.intro"]
	}, Tt = [
		["se", "Davvisámegiella"],
		["en-GB", "English (UK)"],
		["nb", "Norsk bokmål"],
		["nn", "Norsk nynorsk"],
		["tr", "Türkçe"]
	], Et = (e) => [...e].sort((e, t) => e[1].localeCompare(t[1]));
	function Dt(e, t) {
		let n = [];
		for (let r of e) for (let e of ks[r]?.languages ?? []) e?.[t] === !0 && (typeof e.code != "string" || typeof e.name != "string" || !e.name || Tt.some(([t]) => t === e.code) || n.some(([t]) => t === e.code) || n.push([e.code, e.name]));
		return n;
	}
	function Ot() {
		let e = Et([...Tt, ...Dt(R(Ps), "admin")]);
		return At === "auto" || e.some(([e]) => e === At) ? e : [[At, At], ...e];
	}
	let kt = () => Dt(R($)?.enabled ?? [], "site"), At = localStorage.getItem("urd-admin-lang") ?? "auto";
	function jt(e) {
		e !== At && (e === "auto" ? localStorage.removeItem("urd-admin-lang") : localStorage.setItem("urd-admin-lang", e), location.reload());
	}
	function Mt(e) {
		M(bt, R(bt) === e ? null : e, !0), R(bt) === "history" && ti(), R(bt) === "update" && !R(ui) && pi();
	}
	let k = /* @__PURE__ */ j(null);
	function Nt(e, t) {
		let n = T?.data.sections.find((t) => t.id === e);
		return {
			section: n,
			block: n?.blocks.find((e) => e.id === t)
		};
	}
	function Pt() {
		if (!R(k)) return;
		let { block: e } = Nt(R(k).sectionId, R(k).blockId);
		if (!e) {
			M(k, null);
			return;
		}
		M(k, {
			sectionId: R(k).sectionId,
			blockId: R(k).blockId,
			type: e.type,
			decor: !!e.decor,
			hideMobile: !!e.hideMobile,
			props: JSON.parse(JSON.stringify(e.props)),
			frame: { ...e.frames.desktop },
			animation: e.animation ? JSON.parse(JSON.stringify(e.animation)) : null,
			hover: e.hover ? JSON.parse(JSON.stringify(e.hover)) : null,
			sticky: e.sticky ? JSON.parse(JSON.stringify(e.sticky)) : null
		}, !0);
	}
	function Ft(e) {
		if (M(It, null), !e.blockId) {
			M(k, null);
			return;
		}
		M(k, {
			sectionId: e.sectionId,
			blockId: e.blockId
		}, !0), e.sectionId && M(vn, e.sectionId, !0), Pt();
	}
	let It = /* @__PURE__ */ j(null), Lt = window.matchMedia("(prefers-reduced-motion: reduce)").matches, Rt = [
		["top-left", "opt.dock.topLeft"],
		["top-center", "opt.dock.topCenter"],
		["top-right", "opt.dock.topRight"],
		["middle-left", "opt.dock.middleLeft"],
		["middle-center", "opt.dock.middleCenter"],
		["middle-right", "opt.dock.middleRight"],
		["bottom-left", "opt.dock.bottomLeft"],
		["bottom-center", "opt.dock.bottomCenter"],
		["bottom-right", "opt.dock.bottomRight"]
	];
	function zt() {
		let e = T?.data.sections ?? [], t = e.findIndex((e) => e.id === R(k)?.sectionId);
		return [["", J("opt.sticky.ownSection")], ...e.slice(t + 1).map((e, n) => [e.id, J("opt.sticky.atSection", { n: t + 2 + n })])];
	}
	function Bt(e) {
		if (Ft(e), !R(k)) return;
		let t = R(te)?.getBoundingClientRect();
		if (!t) return;
		let n = t.left + R(Te) * e.rect.right + 12;
		n + 300 > window.innerWidth - 8 && (n = Math.max(8, t.left + R(Te) * e.rect.left - 300 - 12));
		let r = window.innerHeight - Math.min(window.innerHeight * .7, 560) - 8, i = Math.min(Math.max(8, t.top + R(Te) * e.rect.top), Math.max(8, r));
		M(It, {
			left: n,
			top: i
		}, !0);
	}
	function Vt(e, t) {
		let { section: n, block: r } = Nt(R(k)?.sectionId, R(k)?.blockId);
		r && (e && Ye(e), t(r, n), Le(n, "block-edited"), T.save(), Ue(), E?.sendSection(R(_), n), Pt());
	}
	function A(e, t) {
		Vt(`edit:${R(k).blockId}:${e}`, (n) => {
			n.props[e] = t;
		});
	}
	function Ht(e, t) {
		Vt(`edit:${R(k).blockId}:${e}`, (e) => {
			Object.assign(e.props, t);
		});
	}
	let Ut = nn({}), Wt = nn({}), Gt = /* @__PURE__ */ j(!1), Kt = /* @__PURE__ */ j("content"), qt = (e, t) => (Number.isFinite(t) || (t = e.min ?? 0), e.min != null && (t = Math.max(e.min, t)), e.max != null && (t = Math.min(e.max, t)), t);
	async function Jt(e) {
		let t = R(k).blockId, n = `${t}:${e.key}`, r = (Ut[n] ?? R(k).props[e.key] ?? "").trim();
		Wt[n] = null;
		let i = r.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
		if (!r || i || /^https?:\/\//i.test(r)) {
			Ht(e.key, {
				[e.key]: r,
				lat: i ? Number(i[1]) : null,
				lon: i ? Number(i[2]) : null
			});
			return;
		}
		M(Gt, !0), Wt[n] = {
			text: J("props.place.searching"),
			err: !1
		};
		try {
			let i = await fetch(`/api/geocode?q=${encodeURIComponent(r)}`), a = await i.json().catch(() => null);
			if (R(k)?.blockId !== t) return;
			i.ok && Number.isFinite(a?.lat) ? (Ht(e.key, {
				[e.key]: r,
				lat: a.lat,
				lon: a.lon
			}), Wt[n] = null) : Wt[n] = {
				text: Ki(a) ?? J("props.place.notFound"),
				err: !0
			};
		} catch {
			Wt[n] = {
				text: J("props.place.failed"),
				err: !0
			};
		} finally {
			M(Gt, !1);
		}
	}
	function Yt(e, t) {
		Number.isFinite(t) && Vt(`edit:frame-${R(k).blockId}:${e}`, (n) => {
			n.frames.desktop = {
				...n.frames.desktop,
				[e]: t
			};
		});
	}
	function Xt(e) {
		Vt(`edit:${R(k).blockId}:boxStyle`, (t) => {
			let n = {
				...t.props.boxStyle ?? {},
				...e
			};
			for (let e of Object.keys(n)) n[e] ?? delete n[e];
			Object.keys(n).length ? t.props.boxStyle = n : delete t.props.boxStyle;
		});
	}
	function Zt(e, t) {
		Vt(`edit:${R(k).blockId}:faq${e}`, (n) => {
			n.props.items[e] = {
				...n.props.items[e],
				...t
			};
		});
	}
	function Qt() {
		Vt("faq-item", (e) => {
			(e.props.items ??= []).push({
				q: J("seed.faq.newQ"),
				a: J("seed.faq.answer")
			});
		});
	}
	function $t(e) {
		Vt("faq-item", (t) => {
			t.props.items.splice(e, 1);
		});
	}
	function en(e, t) {
		let n = e + t;
		Vt("faq-item", (t) => {
			n < 0 || n >= t.props.items.length || ([t.props.items[e], t.props.items[n]] = [t.props.items[n], t.props.items[e]]);
		});
	}
	function tn(e, t) {
		Vt(`edit:${R(k).blockId}:tl${e}`, (n) => {
			n.props.items[e] = {
				...n.props.items[e],
				...t
			};
		});
	}
	function an() {
		Vt("tl-item", (e) => {
			(e.props.items ??= []).push({
				year: "",
				title: J("seed.timeline.newTitle"),
				text: ""
			});
		});
	}
	function on(e) {
		Vt("tl-item", (t) => {
			t.props.items.splice(e, 1);
		});
	}
	function sn(e, t) {
		let n = e + t;
		Vt("tl-item", (t) => {
			n < 0 || n >= t.props.items.length || ([t.props.items[e], t.props.items[n]] = [t.props.items[n], t.props.items[e]]);
		});
	}
	function cn(e) {
		Vt("decor", (t) => {
			t.decor = e;
		});
	}
	function ln(e, t) {
		Vt(`edit:${R(k).blockId}:table-form`, (n) => {
			let r = (Array.isArray(n.props.rows) && n.props.rows.length ? n.props.rows : [[""]]).map((e) => Array.isArray(e) ? e.map((e) => String(e ?? "")) : [""]), i = Math.max(1, ...r.map((e) => e.length));
			r = r.map((e) => [...e, ...Array(i - e.length).fill("")]), e > 0 ? r.push(Array(i).fill("")) : e < 0 && r.length > 1 && r.pop(), t > 0 ? r = r.map((e) => [...e, ""]) : t < 0 && i > 1 && (r = r.map((e) => e.slice(0, i - 1))), n.props.rows = r;
		});
	}
	function un(e, t) {
		Vt(`edit:${R(k).blockId}:share`, (n) => {
			let r = [
				"facebook",
				"x",
				"linkedin",
				"whatsapp",
				"email",
				"copy"
			], i = new Set(n.props.services ?? []);
			t ? i.add(e) : i.delete(e), n.props.services = r.filter((e) => i.has(e));
		});
	}
	function dn(e) {
		let t = e.target.files?.[0];
		if (e.target.value = "", !t) return;
		let n = new FileReader();
		n.onload = () => {
			A("src", String(n.result ?? "")), t.size > 4e5 && S(J("status.audioLarge", { kb: Math.round(t.size / 1024) }), "error");
		}, n.onerror = () => S(J("status.imageReadError"), "error"), n.readAsDataURL(t);
	}
	function fn(e) {
		let { section: t, block: n } = Nt(R(k)?.sectionId, R(k)?.blockId);
		n && (Ye("hide-mobile"), n.hideMobile = e, T.save(), Ue(), E?.sendSection(R(_), t), Pt());
	}
	async function pn(e) {
		let t = e.target.files?.[0];
		if (e.target.value = "", t) try {
			let e = await ir(t);
			Vt(`edit:${R(k).blockId}`, (n) => {
				n.props.src = e.dataUrl, n.props.alt = n.props.alt || wa(t.name).replaceAll("-", " ");
			});
		} catch {
			S(J("status.imageReadError"), "error");
		}
	}
	async function mn(e) {
		let t = e.target.files?.[0];
		if (e.target.value = "", t) try {
			let e = await ir(t);
			Vt(`edit:${R(k).blockId}`, (t) => {
				t.props.image = e.dataUrl;
			});
		} catch {
			S(J("status.imageReadError"), "error");
		}
	}
	let hn = {
		text: J("blocks.text"),
		button: J("blocks.button"),
		image: J("blocks.image"),
		shape: J("blocks.shape"),
		video: J("blocks.video"),
		icon: J("blocks.icon"),
		gallery: J("blocks.gallery"),
		faq: J("blocks.faq"),
		collection: J("blocks.collection"),
		timeline: J("blocks.timeline"),
		quote: J("blocks.quote"),
		stats: J("blocks.stats"),
		table: J("blocks.table"),
		share: J("blocks.share"),
		countdown: J("blocks.countdown"),
		audio: J("blocks.audio"),
		product: J("blocks.product"),
		cart: J("blocks.cart"),
		checkout: J("blocks.checkout")
	}, gn = [
		["line", J("shape.line")],
		["arrow", J("shape.arrow")],
		["circle", J("shape.circle")],
		["rect", J("shape.rect")],
		["triangle", J("shape.triangle")]
	], _n = [
		["accent", J("color.accent")],
		["text", J("color.text")],
		["surface", J("color.surface")],
		["bg", J("color.bg")]
	], vn = /* @__PURE__ */ j(null), yn = /* @__PURE__ */ j(null), bn = /* @__PURE__ */ j(""), xn = /* @__PURE__ */ j(nn([])), Sn = /* @__PURE__ */ j(null), wn = /* @__PURE__ */ j(null), Tn = /* @__PURE__ */ j("");
	function En(e) {
		M(yn, e?.grid ? { ...e.grid } : null, !0), M(bn, e?.size?.minHeight ?? "", !0), M(xn, JSON.parse(JSON.stringify(e?.background?.layers ?? [])), !0), M(Sn, e?.animation ? JSON.parse(JSON.stringify(e.animation)) : null, !0), M(wn, e?.hover ? JSON.parse(JSON.stringify(e.hover)) : null, !0), M(Tn, e?.theme ?? "", !0);
	}
	let Dn = /* @__PURE__ */ j(null), On = nn({});
	function kn() {
		try {
			let e = ((R(te)?.contentDocument)?.querySelector(`.urd-section[data-section-id="${R(vn)}"]`))?.getBoundingClientRect();
			M(Dn, e && e.width ? {
				w: e.width,
				h: e.height
			} : null, !0);
		} catch {
			M(Dn, null);
		}
	}
	Cn(() => {
		R(vn), R(xn), requestAnimationFrame(() => requestAnimationFrame(kn));
	}), Cn(() => {
		let e = R(te);
		if (!e || typeof ResizeObserver > "u") return;
		let t = new ResizeObserver(() => kn());
		return t.observe(e), () => t.disconnect();
	}), Cn(() => {
		for (let e of R(xn)) {
			let t = e?.props?.src;
			if (e?.type === "image" && t && !On[t]) {
				let e = new Image();
				e.onload = () => {
					On[t] = {
						w: e.naturalWidth,
						h: e.naturalHeight
					};
				}, e.src = t;
			}
		}
	});
	function An(e) {
		Nn("section-theme", (t) => {
			e ? t.theme = e : delete t.theme;
		});
	}
	function jn(e) {
		let t = R(vr), n = (e) => e.replaceAll("var(--urd-base-bg)", t.bg).replaceAll("var(--urd-base-surface)", t.surface).replaceAll("var(--urd-base-text)", t.text).replaceAll("var(--urd-base-accent)", t.accent).replaceAll("var(--urd-base-accent-text)", t["accent-text"]), r = ec(e);
		return {
			bg: r["--urd-color-bg"] ? n(r["--urd-color-bg"]) : t.bg,
			surface: r["--urd-color-surface"] ? n(r["--urd-color-surface"]) : t.surface,
			text: r["--urd-color-text"] ? n(r["--urd-color-text"]) : t.text,
			accent: r["--urd-color-accent"] ? n(r["--urd-color-accent"]) : t.accent
		};
	}
	function Mn(e) {
		M(vn, e.sectionId, !0), En(T?.data.sections.find((t) => t.id === e.sectionId));
	}
	function Nn(e, t) {
		let n = T.data.sections.find((e) => e.id === R(vn));
		n && (Ye(e), t(n), T.save(), Ue(), E?.sendSection(R(_), n), En(n));
	}
	let Pn = /* @__PURE__ */ j("color");
	function Fn(e, t) {
		e.mutate(e.keyPrefix, (e) => {
			e.background ??= {
				version: 1,
				layers: []
			}, e.background.layers.push({
				type: t,
				version: s[t].version ?? 1,
				props: s[t].defaults()
			});
		});
	}
	function In(e, t) {
		e.mutate(e.keyPrefix, (e) => {
			e.background.layers.splice(t, 1), e.background.layers.length || delete e.background;
		});
	}
	function Ln(e, t, n) {
		let r = t + n;
		e.mutate(e.keyPrefix, (e) => {
			let n = e.background.layers;
			r < 0 || r >= n.length || ([n[t], n[r]] = [n[r], n[t]]);
		});
	}
	function Rn(e, t, n, r) {
		e.mutate(`edit:${e.keyPrefix}-${e.keyId}-${t}-${n}`, (e) => {
			e.background.layers[t].props[n] = r;
		});
	}
	function zn(e, t, n, r = "xy") {
		e.preventDefault();
		let i = e.currentTarget;
		i.setPointerCapture?.(e.pointerId);
		let a = (e) => {
			let a = i.getBoundingClientRect();
			if (r.includes("x")) {
				let r = Math.min(1, Math.max(0, (e.clientX - a.left) / a.width));
				Rn(t, n, "x", Math.round(r * 100) / 100);
			}
			if (r.includes("y")) {
				let r = Math.min(1, Math.max(0, (e.clientY - a.top) / a.height));
				Rn(t, n, "y", Math.round(r * 100) / 100);
			}
		};
		a(e);
		let o = () => {
			i.removeEventListener("pointermove", a), i.removeEventListener("pointerup", o), i.removeEventListener("pointercancel", o);
		};
		i.addEventListener("pointermove", a), i.addEventListener("pointerup", o), i.addEventListener("pointercancel", o);
	}
	let Bn = (e) => Math.min(4, Math.max(.1, e));
	function Vn(e, t, n, r) {
		Rn(e, t, "size", Bn(Math.round((n + r) * 100) / 100));
	}
	function Hn(e, t, n) {
		let r = Number(n);
		Number.isFinite(r) && Rn(e, t, "size", Bn(r / 100));
	}
	function Un(e, t, n, r) {
		let i = On[n.props.src];
		if (!i?.w || !i?.h || !R(Dn)?.w || !R(Dn)?.h) return;
		let a = R(Dn).h * i.w / (R(Dn).w * i.h), o = r === "cover" ? Math.max(1, a) : Math.min(1, a);
		(n.props.fit === "tile" || n.props.fit === "repeat") && Rn(e, t, "fit", "plain"), Rn(e, t, "size", Bn(Math.round(o * 100) / 100));
	}
	function Wn(e) {
		return e.props;
	}
	function Gn(e, t, n, r) {
		e.mutate(n, (e) => {
			r(e.background.layers[t].props);
		});
	}
	function Kn(e, t, n, r) {
		Gn(e, t, `edit:${e.keyPrefix}-${e.keyId}-${t}-${n}`, (e) => {
			e[n] = r;
		});
	}
	let qn = {
		linear: [
			["none", J("common.none")],
			["pan", J("opt.gradAnim.pan")],
			["pan-loop", J("opt.gradAnim.panLoop")],
			["rotate", J("opt.gradAnim.rotate")]
		],
		radial: [
			["none", J("common.none")],
			["pulse", J("opt.gradAnim.pulse")],
			["orbit", J("opt.gradAnim.orbit")]
		]
	};
	function Jn(e, t, n) {
		Gn(e, t, e.keyPrefix, (e) => {
			e.kind = n, qn[n].some(([t]) => t === (e.animation ?? "none")) || (e.animation = "none");
		});
	}
	function Yn(e, t, n, r) {
		Gn(e, t, `edit:${e.keyPrefix}-${e.keyId}-${t}-stop${n}`, (e) => {
			e.stops[n] = {
				...e.stops[n],
				...r
			};
		});
	}
	function Xn(e, t) {
		Gn(e, t, e.keyPrefix, (e) => {
			let t = Math.round(e.stops.reduce((e, t) => e + (Number(t.share) || 0), 0) / e.stops.length) || 50;
			e.stops.push({
				color: e.stops[e.stops.length - 1]?.color ?? "#ffffff",
				share: t
			});
		});
	}
	function Zn(e, t, n) {
		Gn(e, t, e.keyPrefix, (e) => {
			e.stops.length > 2 && e.stops.splice(n, 1);
		});
	}
	function Qn(e, t, n, r) {
		Gn(e, t, e.keyPrefix, (e) => {
			let [t] = e.stops.splice(n, 1);
			e.stops.splice(r, 0, t);
		});
	}
	let $n = /* @__PURE__ */ j(null);
	function er(e, t, n, r) {
		if (t.button !== 0) return;
		t.preventDefault();
		let i = t.currentTarget.closest(".bg-layer"), a = t.currentTarget.closest(".grad-stop");
		M($n, {
			layer: n,
			from: r,
			insert: r
		}, !0);
		let o = a.getBoundingClientRect(), s = t.clientY - o.top, c = a.cloneNode(!0);
		c.style.cssText = `position:fixed;left:${o.left}px;top:${o.top}px;width:${o.width}px;display:flex;align-items:center;gap:0.4rem;pointer-events:none;z-index:1000;opacity:0.92;padding:2px 4px;background:var(--urd-color-surface);border:1px solid var(--urd-color-accent);border-radius:6px;`, document.body.appendChild(c);
		let l = (e) => {
			c.style.top = `${e.clientY - s}px`;
			let t = [...i.querySelectorAll(".grad-stop")].map((e) => e.getBoundingClientRect()), n = t.length;
			for (let r = 0; r < t.length; r++) if (e.clientY < t[r].top + t[r].height / 2) {
				n = r;
				break;
			}
			M($n, {
				...R($n),
				insert: n
			}, !0);
		}, u = () => {
			window.removeEventListener("pointermove", l), window.removeEventListener("pointerup", u), c.remove();
			let t = R($n);
			if (M($n, null), !t) return;
			let n = t.insert > t.from ? t.insert - 1 : t.insert;
			n !== t.from && Qn(e, t.layer, t.from, n);
		};
		window.addEventListener("pointermove", l), window.addEventListener("pointerup", u);
	}
	function tr(e, t, n) {
		e.mutate(e.keyPrefix, (e) => {
			e.background.layers[t].type !== n && (e.background.layers[t] = {
				type: n,
				version: s[n].version ?? 1,
				props: s[n].defaults()
			});
		});
	}
	async function nr(e, t) {
		try {
			let n = new Image();
			await new Promise((t, r) => {
				n.onload = t, n.onerror = r, n.src = e;
			});
			let r = Math.max(1, Math.round(320 * t[3] / t[2])), i = document.createElement("canvas");
			i.width = 320, i.height = r;
			let a = i.getContext("2d");
			a.drawImage(n, 0, 0, 320, r);
			let o = a.getImageData(0, 0, 320, r).data, s = 320, c = r, l = -1, u = -1;
			for (let e = 0; e < r; e++) for (let t = 0; t < 320; t++) o[(e * 320 + t) * 4 + 3] > 8 && (t < s && (s = t), t > l && (l = t), e < c && (c = e), e > u && (u = e));
			if (l < s) return null;
			let d = t[2] / 320, f = t[3] / r;
			return {
				x: t[0] + s * d,
				y: t[1] + c * f,
				width: (l - s + 1) * d,
				height: (u - c + 1) * f
			};
		} catch {
			return null;
		}
	}
	async function rr(e) {
		let t = await e.text(), n = ba(t), r = Sa(t);
		if (!r) return n;
		let i = await nr(n.dataUrl, r);
		if (!i) return n;
		let a = xa(t, i);
		if (a === t) return n;
		try {
			return ba(a);
		} catch {
			return n;
		}
	}
	async function ir(e) {
		return e.type === "image/svg+xml" || /\.svg$/i.test(e.name || "") ? rr(e) : _a(e);
	}
	async function ar(e, t, n) {
		let r = n.target.files?.[0];
		if (n.target.value = "", r) try {
			Rn(e, t, "src", (await ir(r)).dataUrl);
		} catch {
			S(J("status.imageReadError"), "error");
		}
	}
	function or(e, t, n) {
		let r = n.target.files?.[0];
		if (n.target.value = "", !r) return;
		if (!["video/mp4", "video/webm"].includes(r.type)) {
			S(J("status.videoFormat"), "error");
			return;
		}
		if (r.size > 15e6) {
			S(J("status.videoTooLarge", {
				mb: (r.size / 1e6).toFixed(1),
				max: Math.round(ga / 1e6)
			}), "error");
			return;
		}
		let i = new FileReader();
		i.onload = () => {
			Rn(e, t, "src", String(i.result ?? "")), r.size > 4e6 && S(J("status.videoLarge", { mb: (r.size / 1e6).toFixed(1) }), "error");
		}, i.onerror = () => S(J("status.imageReadError"), "error"), i.readAsDataURL(r);
	}
	async function sr(e, t, n) {
		let r = n.target.files?.[0];
		if (n.target.value = "", r) try {
			Rn(e, t, "poster", (await ir(r)).dataUrl);
		} catch {
			S(J("status.imageReadError"), "error");
		}
	}
	async function cr(e, t, n) {
		let r = [...n.target.files ?? []];
		if (n.target.value = "", !r.length) return;
		S(J("status.compressingImages"));
		let { images: i, failed: a, big: o } = await Lp(r);
		i.length && e.mutate(e.keyPrefix, (e) => {
			let n = e.background.layers[t].props;
			n.images ??= [], n.images.push(...i.map(({ src: e }) => ({
				src: e,
				x: .5,
				y: .5
			})));
		}), Rp(i.length, a, o);
	}
	function lr(e, t, n, r) {
		e.mutate(e.keyPrefix, (e) => {
			let i = e.background.layers[t].props.images, a = n + r;
			a < 0 || a >= i.length || ([i[n], i[a]] = [i[a], i[n]]);
		});
	}
	function ur(e, t, n) {
		e.mutate(e.keyPrefix, (e) => {
			e.background.layers[t].props.images.splice(n, 1);
		});
	}
	function dr(e, t, n, r, i) {
		e.mutate(`edit:${e.keyPrefix}g-${e.keyId}-${t}-${n}-${r}`, (e) => {
			e.background.layers[t].props.images[n][r] = i;
		});
	}
	function fr(e, t) {
		Bi(e, () => {
			R(D).nav.style ??= {}, t(R(D).nav.style);
		});
	}
	let pr = /* @__PURE__ */ O(() => ({
		mutate: Nn,
		keyPrefix: "bg",
		keyId: R(vn)
	})), mr = {
		mutate: fr,
		keyPrefix: "navbg",
		keyId: "nav"
	}, hr = {
		mutate: lc,
		keyPrefix: "footerbg",
		keyId: "footer"
	}, gr = () => {
		let e = null;
		try {
			e = localStorage.getItem("urd-theme-mode");
		} catch {}
		return Ks(R(D)?.theme?.scheme, e, window.matchMedia("(prefers-color-scheme: dark)").matches);
	}, _r = /* @__PURE__ */ j("light");
	Cn(() => {
		M(_r, gr(), !0);
		let e = window.matchMedia("(prefers-color-scheme: dark)"), t = (e) => {
			e instanceof StorageEvent && e.key && e.key !== "urd-theme-mode" || M(_r, gr(), !0);
		};
		return e.addEventListener("change", t), window.addEventListener("storage", t), () => {
			e.removeEventListener("change", t), window.removeEventListener("storage", t);
		};
	});
	let vr = /* @__PURE__ */ O(() => R(D)?.theme ? qs(R(D).theme, R(_r)).color ?? {} : {}), yr = () => Object.entries(R(vr)), br = [
		[
			"bg",
			J("palette.bg"),
			J("palette.bgShort")
		],
		[
			"surface",
			J("palette.surface"),
			J("palette.surfaceShort")
		],
		[
			"text",
			J("palette.text"),
			J("palette.textShort")
		],
		[
			"accent",
			J("palette.accent"),
			J("palette.accentShort")
		],
		[
			"accent-text",
			J("palette.accentText"),
			J("palette.accentTextShort")
		]
	], xr = /* @__PURE__ */ O(() => !!R(D)?.theme.alt), Sr = /* @__PURE__ */ O(() => R(D)?.theme.alt?.auto === !0), Cr = /* @__PURE__ */ O(() => R(D)?.theme.scheme === "dark" ? "dark" : "light"), Tr = /* @__PURE__ */ O(() => R(D)?.theme.tokens.color ?? {}), Dr = /* @__PURE__ */ O(() => ({
		...R(D)?.theme.tokens.color ?? {},
		...R(D)?.theme.alt?.tokens?.color ?? {}
	}));
	function Or(e) {
		return {
			type: e,
			version: il[e].version,
			props: il[e].defaults()
		};
	}
	let kr = (e) => !!(e && il[e.type]?.entrance), Ar = [["", J("common.none")], ...Object.entries(il).filter(([, e]) => e.entrance).map(([e, t]) => [e, t.labelKey ? J(t.labelKey) : t.label])], jr = Ar.filter(([e]) => !il[e]?.group), Mr = [["", J("common.none")], ...Object.entries(il).filter(([, e]) => !e.entrance).map(([e, t]) => [e, t.labelKey ? J(t.labelKey) : t.label])];
	function Nr(e) {
		e.animation && !kr(e.animation) && (e.hover ??= e.animation, e.animation = null);
	}
	function Pr(e) {
		Vt(`edit:anim-${R(k).blockId}`, (t) => {
			Nr(t), t.animation = e ? Or(e) : null;
		}), R(k) && E?.sendDemoAnim(R(k).sectionId, R(k).blockId);
	}
	function B(e) {
		Vt(`edit:hover-${R(k).blockId}`, (t) => {
			Nr(t), t.hover = e ? Or(e) : null;
		});
	}
	function Fr(e, t) {
		Number.isFinite(t) && (Vt(`edit:anim-${R(k).blockId}:${e}`, (n) => {
			n.animation && (n.animation.props[e] = t);
		}), R(k) && E?.sendDemoAnim(R(k).sectionId, R(k).blockId));
	}
	function Lr(e) {
		Nn("section-anim", (t) => {
			Nr(t), t.animation = e ? Or(e) : null;
		}), E?.sendDemoAnim(R(vn));
	}
	function Rr(e) {
		Nn("section-hover", (t) => {
			Nr(t), t.hover = e ? Or(e) : null;
		});
	}
	function zr(e, t) {
		Number.isFinite(t) && (Nn("edit:section-anim", (n) => {
			n.animation && (n.animation.props[e] = t);
		}), E?.sendDemoAnim(R(vn)));
	}
	function Br(e, t) {
		Nn("edit:section-anim", (n) => {
			n.animation && (n.animation.props[e] = t);
		}), E?.sendDemoAnim(R(vn));
	}
	function Vr(e) {
		let t = T.data.sections.find((e) => e.id === R(vn));
		if (!t) return;
		let n = e.trim();
		if (!n) return;
		let r = /^\d+$/.test(n) ? `${n}px` : n;
		Ye("section-size"), t.size = {
			...t.size,
			minHeight: r
		}, M(bn, r, !0), T.save(), Ue(), E?.sendSection(R(_), t);
	}
	function Hr() {
		return T.data.sections.find((e) => e.id === R(vn)) ?? T.data.sections[0];
	}
	function Ur(e) {
		let t = T.data.sections.find((e) => e.id === R(vn));
		t && (Ye("grid:section"), t.grid = e ? { ...Re.data.grid } : null, M(yn, t.grid ? { ...t.grid } : null, !0), T.save(), Ue(), E?.sendSection(R(_), t), R(Li) && E?.sendShowGrid(!0));
	}
	function Wr(e, t) {
		let n = T.data.sections.find((e) => e.id === R(vn));
		n?.grid && (Ye("grid:section"), n.grid = {
			...n.grid,
			[e]: t
		}, M(yn, { ...n.grid }, !0), T.save(), Ue(), E?.sendSection(R(_), n), R(Li) && E?.sendShowGrid(!0));
	}
	function Gr(e, t) {
		Ye("grid:site"), M(re, {
			...R(re),
			[e]: t
		}, !0), Re.data.grid = {
			...Re.data.grid,
			[e]: t
		}, Re.save(), Ue(), Be(), R(Li) && E?.sendShowGrid(!0);
	}
	async function Kr() {
		try {
			let e = await fetch("/api/github/me");
			e.ok ? M(ne, await e.json(), !0) : e.status !== 503 && M(ne, null);
		} catch {
			M(ne, null);
		}
	}
	let Jr = null;
	async function Yr() {
		try {
			let e = await fetch("/api/github/latest");
			e.ok && (Jr = (await e.json()).head ?? null);
		} catch {}
	}
	async function Xr(e) {
		if (!Jr) return await Yr(), {
			ok: await ct({
				title: J("confirm.conflictUnknown.title"),
				lines: [J("confirm.conflictUnknown.body"), J("confirm.conflictUnknown.warning")],
				okLabel: J("confirm.publishAnyway"),
				cancelLabel: J("confirm.cancel")
			}),
			head: Jr
		};
		let t = null;
		try {
			let e = await fetch(`/api/github/latest?base=${Jr}`);
			e.ok && (t = await e.json().catch(() => null));
		} catch {}
		if (!t?.head) return {
			ok: !0,
			head: null
		};
		let n = t.head;
		if (n === Jr) return {
			ok: !0,
			head: n
		};
		let r = new Set(e.map((e) => e.path)), i = t.truncated ? [J("confirm.conflict.truncated")] : (t.changedFiles ?? []).filter((e) => r.has(e));
		return i.length === 0 ? {
			ok: !0,
			head: n
		} : {
			ok: await ct({
				title: J("confirm.conflict.title"),
				lines: [
					J("confirm.conflict.intro"),
					...i.map((e) => `• ${e}`),
					J("confirm.conflict.warning")
				],
				okLabel: J("confirm.publishAnyway"),
				cancelLabel: J("confirm.cancel")
			}),
			head: n
		};
	}
	let Qr = /* @__PURE__ */ j(null), $r = /* @__PURE__ */ j(""), ei = /* @__PURE__ */ j(!1);
	async function ti() {
		M($r, "");
		try {
			let e = await fetch("/api/github/history");
			e.ok ? M(Qr, (await e.json()).commits, !0) : e.status === 401 ? (M(Qr, [], !0), M($r, J("status.historyLoginRequired"), !0)) : (M(Qr, [], !0), M($r, Ki(await e.json().catch(() => null)) ?? J("status.historyFetchFailed"), !0));
		} catch {
			M(Qr, [], !0), M($r, J("status.historyUnavailable"), !0);
		}
	}
	let ni = (() => {
		let e = {
			dateStyle: "short",
			timeStyle: "short"
		};
		try {
			return new Intl.DateTimeFormat(qi(), e);
		} catch {
			return new Intl.DateTimeFormat(void 0, e);
		}
	})(), ri = !1;
	async function ii() {
		let e = R(Qr)?.[0];
		if (!(!e || R(ei)) && await ct({
			title: J("confirm.revert.title"),
			lines: [`«${e.message}»`, J("confirm.revert.body")],
			okLabel: J("confirm.revert.ok"),
			cancelLabel: J("confirm.cancel")
		})) {
			M(ei, !0), S(J("status.reverting"));
			try {
				let t = await fetch("/api/github/revert", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ expect: e.sha })
				});
				if (t.ok) {
					let { sha: e } = await t.json().catch(() => ({}));
					e ? Jr = e : Yr(), ri = !0, S(J("status.revertDone"), "ok"), ai();
				} else t.status === 409 ? S(J("status.revertConflict"), "error") : S(Ki(await t.json().catch(() => null)) ?? J("status.revertFailed"), "error");
			} catch {
				S(J("status.publishLayerUnreachable"), "error");
			}
			M(ei, !1), ti();
		}
	}
	async function ai() {
		let e = ["/content/site.json", ...R(D).pages.map((e) => `/${e.file}`)], t = async () => {
			let t = {};
			for (let n of e) try {
				t[n] = await (await fetch(n, { cache: "no-store" })).text();
			} catch {
				t[n] = null;
			}
			return t;
		}, n = await t();
		for (let r = 0; r < 18; r++) {
			await new Promise((e) => setTimeout(e, 1e4));
			let r = await t();
			if (e.some((e) => r[e] !== null && n[e] !== null && r[e] !== n[e])) {
				S(J("status.revertDeployed"), "ok");
				for (let e of Object.keys(localStorage).filter((e) => e.startsWith("urd-draft-"))) localStorage.removeItem(e);
				await new Promise((e) => setTimeout(e, 800)), location.reload();
				return;
			}
		}
		S(J("status.revertDeployTimeout"), "error");
	}
	let oi = 0;
	async function si(e) {
		let t = ++oi, n = x, r = await Xa(Ya(e));
		t === oi && n === x && (r ? S(J("status.publishLive"), "ok") : S(J("status.publishDeployTimeout"), "error"));
	}
	let ci = /* @__PURE__ */ j(null), li = /* @__PURE__ */ j(null), ui = /* @__PURE__ */ j(!1), fi = /* @__PURE__ */ j(nn(/* @__PURE__ */ new Set()));
	async function pi() {
		M(ui, !0), M(li, null), M(ci, null);
		try {
			let e = await fetch("/api/github/update"), t = await e.json().catch(() => null);
			e.ok ? (M(ci, t, !0), M(fi, /* @__PURE__ */ new Set(), !0)) : M(li, Ki(t) ?? J("update.checkFailed"), !0);
		} catch {
			M(li, J("status.publishLayerUnreachable"), !0);
		}
		M(ui, !1);
	}
	function mi(e) {
		let t = new Set(R(fi));
		t.has(e) ? t.delete(e) : t.add(e), M(fi, t, !0);
	}
	async function hi() {
		if (!R(ci) || R(ci).upToDate || R(ui)) return;
		let e = [...R(fi)], t = R(ci).changes.filter((e) => !R(fi).has(e.path)), n = t.filter((e) => e.atom && e.conflict);
		if (await ct({
			title: J("confirm.update.title"),
			lines: [J("confirm.update.body", {
				target: R(ci).target,
				writes: t.filter((e) => e.action === "write").length,
				deletes: t.filter((e) => e.action === "delete").length
			}), ...n.length > 0 ? [J("confirm.update.warnEdited", { paths: n.map((e) => e.path).join(", ") })] : []],
			okLabel: J("confirm.update.ok"),
			cancelLabel: J("confirm.cancel")
		})) {
			M(ui, !0), S(J("update.running", { target: R(ci).target }));
			try {
				let t = await fetch("/api/github/update", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						to: R(ci).target,
						expect: R(ci).head,
						skip: e
					})
				}), n = await t.json().catch(() => null);
				t.ok ? (S(J("update.committed", { target: R(ci).target }), "ok"), await gi(R(ci).target.replace(/^v/, ""))) : t.status === 409 ? (S(Ki(n) ?? J("update.checkFailed"), "error"), await pi()) : S(Ki(n) ?? J("update.failed"), "error");
			} catch {
				S(J("status.publishLayerUnreachable"), "error");
			}
			M(ui, !1);
		}
	}
	async function gi(e) {
		for (let t = 0; t < 18; t++) {
			await new Promise((e) => setTimeout(e, 1e4));
			try {
				if ((await (await fetch("/urd.json", { cache: "no-store" })).json())?.engine === e) {
					S(J("update.deployed"), "ok"), await new Promise((e) => setTimeout(e, 800)), location.reload();
					return;
				}
			} catch {}
		}
		S(J("update.deployTimeout"), "error");
	}
	let _i = null;
	function yi(e) {
		return {
			schemaVersion: 4,
			meta: {
				id: e.id,
				title: e.title
			},
			sections: [{
				id: Io("sec"),
				version: 1,
				preset: "blank",
				size: { minHeight: "40vh" },
				grid: null,
				background: {
					version: 1,
					layers: [{
						type: "color",
						version: 1,
						props: { value: "bg" }
					}]
				},
				blocks: []
			}]
		};
	}
	async function xi(e, { keepHistory: t = !1 } = {}) {
		M(_, e, !0), _i = (async () => {
			let n = He(), r = null;
			try {
				let e = await fetch(`/${n.file}`);
				e.ok && (r = Ao(await e.json(), Re.data));
			} catch {}
			r ? Ve.delete(e) : r = yi(n), T = ea(`urd-draft-${e}`, () => r, C), (T.data.schemaVersion ?? 1) > 4 && (console.warn(`Urd: the draft for '${e}' has schemaVersion ${T.data.schemaVersion} (the engine has 4) and is discarded`), T.replace(structuredClone(r))), T.replace(Ao(T.data, Re.data)), T.save(), t || (qe = null), M(vn, null), M(yn, null), Ue(), na(), Ne(), M(y, "");
		})(), await _i;
	}
	function Si() {
		E?.destroy(), R(te)?.contentDocument?.addEventListener("pointerdown", () => {
			R(It) && M(It, null);
		}, !0), E = Ka(R(te), {
			onEdit: dp,
			onMove: fp,
			onGrow: pp,
			onDelete: Cp,
			onAddSection: vp,
			onMoveSection: yp,
			onDeleteSection: bp,
			onSectionSize: xp,
			onUndo: (e) => e.redo ? rt() : nt(),
			onSelectSection: Mn,
			onSelectBlock: Ft,
			onBlockMenu: Bt,
			onReady: Ci,
			onNavigate: zi,
			onAddBlock: (e) => Dp(e.sectionId, e.block),
			onAddBlocks: (e) => Op(e.sectionId, e.blocks, e.minBottom, e.moves),
			onRequestBlock: Fp,
			onMoveBlockSection: Sp,
			onMobileReset: mp,
			onMobileOrder: hp,
			onReviewDone: gp,
			onBlockFlag: _p,
			onCollectionEdit: ts,
			onCollectionAdd: $o,
			onSaveTemplate: Wo,
			onStickyGroup: Ko,
			onStickyDock: Go,
			onDeleteTemplate: Jo,
			onApplyLayout: Fe,
			onPluginBlocks: (e) => {
				M(Ap, e.blocks ?? [], !0);
			},
			onNavWidth: (e) => Bi("edit:nav-width", () => {
				R(D).nav.style ??= {}, R(D).nav.style.width = e.width;
			})
		});
	}
	async function Ci() {
		await _i, await Os, E?.sendPlugins(Ke(R($))?.enabled ?? []), E?.sendViewport(R(ge)), E?.sendZoom(R(Te)), Zo(), Uo(), Re.hasDraft() && Be();
		let e = !R(g).pages.some((e) => e.id === R(_));
		(T.hasDraft() || e) && E?.sendPage(R(_), T.data), R(ie) || E?.sendChrome(!1), R(Li) && E?.sendShowGrid(!0), R(wi) && E?.sendShowGuides(!0), p();
	}
	let wi = /* @__PURE__ */ j(localStorage.getItem("urd-guides") === "1"), Ei = /* @__PURE__ */ j(!1), Di = /* @__PURE__ */ j(nn(localStorage.getItem("urd-layout-picker") === "menu" ? "menu" : "strip"));
	function Oi(e) {
		M(Di, e === "menu" ? "menu" : "strip", !0), R(Di) === "menu" ? localStorage.setItem("urd-layout-picker", "menu") : localStorage.removeItem("urd-layout-picker");
	}
	let Ai = /* @__PURE__ */ j(null);
	Cn(() => {
		if (!R(Ei)) return;
		let e = (e) => {
			R(Ai)?.contains(e.target) || M(Ei, !1);
		}, t = (e) => {
			e.key === "Escape" && M(Ei, !1);
		}, n = () => {
			M(Ei, !1);
		};
		return document.addEventListener("pointerdown", e, !0), document.addEventListener("keydown", t), window.addEventListener("blur", n), () => {
			document.removeEventListener("pointerdown", e, !0), document.removeEventListener("keydown", t), window.removeEventListener("blur", n);
		};
	});
	let ji = {
		view: 1079,
		device: 999,
		zoom: 919
	}, Mi = /* @__PURE__ */ j(null), Pi = /* @__PURE__ */ j(null), Fi = nn({
		view: !1,
		device: !1,
		zoom: !1
	});
	Cn(() => {
		let e = Object.entries(ji).map(([e, t]) => {
			let n = window.matchMedia(`(max-width: ${t}px)`), r = () => {
				Fi[e] = n.matches;
			};
			return r(), n.addEventListener("change", r), () => n.removeEventListener("change", r);
		});
		return () => e.forEach((e) => e());
	}), Cn(() => {
		R(Mi) && (R(Mi) === "screen" ? Fi.device : !Fi[R(Mi)]) && M(Mi, null);
	}), Cn(() => {
		if (!R(Mi)) return;
		let e = (e) => {
			R(Pi)?.contains(e.target) || M(Mi, null);
		}, t = (e) => {
			e.key === "Escape" && M(Mi, null);
		}, n = () => {
			M(Mi, null);
		};
		return document.addEventListener("pointerdown", e, !0), document.addEventListener("keydown", t), window.addEventListener("blur", n), () => {
			document.removeEventListener("pointerdown", e, !0), document.removeEventListener("keydown", t), window.removeEventListener("blur", n);
		};
	});
	function Ii() {
		M(wi, !R(wi)), localStorage.setItem("urd-guides", R(wi) ? "1" : "0"), E?.sendShowGuides(R(wi));
	}
	let Li = /* @__PURE__ */ j(localStorage.getItem("urd-grid-overlay") === "1");
	function Ri() {
		M(Li, !R(Li)), localStorage.setItem("urd-grid-overlay", R(Li) ? "1" : "0"), E?.sendShowGrid(R(Li));
	}
	function zi(e) {
		let t = e.path.replace(/\/$/, "") || "/", n = R(D).pages.find((e) => e.path === t);
		n && n.id !== R(_) && xi(n.id);
	}
	function Bi(e, t) {
		Ye(e), t(), Re.save(), Ue(), Be();
	}
	let Vi = /* @__PURE__ */ j(""), Hi = /* @__PURE__ */ j(null), Ui = Object.fromEntries(Vs.map((e) => [e.id, zs(Hs(e.id, {
		pageId: "preview",
		title: ""
	}))])), Wi = /* @__PURE__ */ O(() => {
		let e = R(D)?.theme?.tokens?.color ?? {};
		return [
			"bg",
			"surface",
			"text",
			"accent"
		].filter((t) => typeof e[t] == "string" && Ys(e[t])).map((t) => `--urd-color-${t}: ${e[t]};`).join(" ");
	}), Gi = /* @__PURE__ */ j(null);
	Cn(() => {
		if (!R(Gi)) return;
		let e = (e) => {
			e.target.closest?.(".page-menu-wrap") || M(Gi, null);
		}, t = (e) => {
			e.key === "Escape" && M(Gi, null);
		}, n = () => {
			M(Gi, null);
		};
		return document.addEventListener("pointerdown", e, !0), document.addEventListener("keydown", t), window.addEventListener("blur", n), () => {
			document.removeEventListener("pointerdown", e, !0), document.removeEventListener("keydown", t), window.removeEventListener("blur", n);
		};
	});
	let Ji = [
		"admin",
		"api",
		"assets",
		"content",
		"media",
		"plugins",
		"functions",
		"readme"
	];
	function Yi(e, t = null) {
		return e ? Ji.includes(e) ? J("error.reservedName", { slug: e }) : R(D).pages.some((n) => n.id !== t && (n.path === `/${e}` || n.id === e)) ? J("error.pageExists") : null : J("error.pageNeedsName");
	}
	function Xi() {
		let e = R(Vi).trim(), t = wa(e), n = Yi(t);
		if (n) {
			S(n, "error");
			return;
		}
		let r = R(Hi) && !R(Hi).startsWith("preset:") ? Ro[R(Hi)]?.data?.page : null, i = R(Hi)?.startsWith("preset:") ? Hs(R(Hi).slice(7), {
			pageId: t,
			title: e
		}) ?? yi({
			id: t,
			title: e
		}) : r ? cs(Ao(JSON.parse(JSON.stringify(r)), Re.data), Io, {
			id: t,
			title: e
		}) : yi({
			id: t,
			title: e
		});
		Bi("pages", () => {
			R(D).pages.push({
				id: t,
				title: e,
				path: `/${t}`,
				file: `content/pages/${t}.json`
			}), R(D).nav.items.push({
				label: e,
				page: t
			});
		}), ee(`urd-draft-${t}`, JSON.stringify(i)), Ue(), M(Vi, ""), M(Hi, null), xi(t);
	}
	async function Zi(e) {
		M(Gi, null), await qo("page", e.id === R(_) ? JSON.parse(JSON.stringify(T.data)) : await ca(e));
	}
	function Qi(e, t) {
		let n = t.trim();
		if (!n || n === e.title) return;
		let r = e.title;
		Bi("pages", () => {
			e.title = n;
			for (let t of R(D).nav.items) t.page === e.id && t.label === r && (t.label = n);
		}), e.id === R(_) ? (T.data.meta.title = n, T.save(), Ue(), E?.sendPage(R(_), T.data)) : la(e, (e) => {
			e.meta.title = n;
		});
	}
	let ta = /* @__PURE__ */ j(nn({
		description: "",
		ogTitle: "",
		ogDescription: "",
		ogImage: ""
	}));
	function na() {
		let e = T?.data?.meta ?? {};
		M(ta, {
			description: e.description ?? "",
			ogTitle: e.og?.title ?? "",
			ogDescription: e.og?.description ?? "",
			ogImage: e.og?.image ?? ""
		}, !0);
	}
	function ra(e, t) {
		let n = String(t ?? "").trim();
		if (e === "description") n ? T.data.meta.description = n : delete T.data.meta.description;
		else {
			let t = {
				ogTitle: "title",
				ogDescription: "description",
				ogImage: "image"
			}[e], r = { ...T.data.meta.og ?? {} };
			n ? r[t] = n : delete r[t], Object.keys(r).length ? T.data.meta.og = r : delete T.data.meta.og;
		}
		T.save(), Ue(), na();
		let r = R(D).pages.find((e) => e.id === R(_));
		R(aa)[R(_)] = !r?.noindex && !T.data.meta.description;
	}
	function ia(e) {
		let t = R(D).pages.find((e) => e.id === R(_));
		t && (Bi("edit:page-noindex", () => {
			e ? t.noindex = !0 : delete t.noindex;
		}), R(aa)[R(_)] = !e && !T?.data?.meta?.description);
	}
	let aa = /* @__PURE__ */ j(nn({}));
	async function oa() {
		let e = {};
		for (let t of R(D).pages) {
			if (t.noindex) continue;
			if (t.id === R(_)) {
				e[t.id] = !T?.data?.meta?.description;
				continue;
			}
			let n = await ca(t);
			e[t.id] = !n?.meta?.description;
		}
		M(aa, e, !0);
	}
	Cn(() => {
		R(bt) === "pages" && R(_) && oa();
	});
	async function sa(e) {
		let t = e.target.files?.[0];
		if (e.target.value = "", t) try {
			ra("ogImage", (await ir(t)).dataUrl);
		} catch {
			S(J("status.imageReadError"), "error");
		}
	}
	async function ca(e) {
		let t = localStorage.getItem(`urd-draft-${e.id}`);
		if (t) try {
			return JSON.parse(t);
		} catch {}
		try {
			let t = await fetch(`/${e.file}`);
			if (t.ok) return Ao(await t.json(), Re.data);
		} catch {}
		return yi(e);
	}
	async function la(e, t) {
		let n = await ca(e);
		t(n), ee(`urd-draft-${e.id}`, JSON.stringify(n)), Ue();
	}
	function ua(e, t) {
		let n = wa(t);
		if (e.path === "/" || `/${n}` === e.path) return;
		let r = Yi(n, e.id);
		if (r) {
			S(r, "error");
			return;
		}
		Bi("pages", () => {
			e.path = `/${n}`;
		});
	}
	function da(e) {
		e.path !== "/" && (Bi("pages", () => {
			R(D).pages = R(D).pages.filter((t) => t.id !== e.id), R(D).nav.items = R(D).nav.items.filter((t) => t.page !== e.id || t.children);
			for (let t of R(D).nav.items) t.page === e.id && delete t.page, t.children && (t.children = t.children.filter((t) => t.page !== e.id), t.children.length === 0 && delete t.children);
			R(D).nav.items = R(D).nav.items.filter((e) => e.page || e.href || e.children);
		}), e.id === R(_) && xi(R(D).pages[0].id), S(J("status.pageRemoved")));
	}
	function pa(e) {
		Bi("edit:nav-logo", () => {
			R(D).nav.logo = {
				type: "text",
				value: "",
				...R(D).nav.logo,
				...e
			};
		});
	}
	function ma(e) {
		Bi("nav", () => {
			R(D).nav.logo ??= {
				type: "text",
				value: R(D).site.title
			};
			let t = R(D).nav.logo, n = t.type === "image";
			e === "both" ? (n && (t.image = t.value, t.value = R(D).site.title), t.image ??= "", t.size ??= 32) : e === "image" ? (n || (t.value = t.image ?? ""), delete t.image, t.size ??= 32) : (n && (t.value = R(D).site.title), delete t.image), t.type = e;
		});
	}
	async function ha(e) {
		let t = e.target.files?.[0];
		if (e.target.value = "", t) try {
			let e = await ir(t);
			Bi("nav", () => {
				let t = R(D).nav.logo;
				t.type === "both" ? t.image = e.dataUrl : t.value = e.dataUrl;
			});
		} catch {
			S(J("status.imageReadErrorSvg"), "error");
		}
	}
	let va = /* @__PURE__ */ j(null);
	async function ya(e) {
		let t = e.target.files?.[0];
		if (e.target.value = "", !t) return;
		if (t.type === "image/svg+xml" || /\.svg$/i.test(t.name || "")) {
			try {
				let e = await rr(t);
				M(va, e.dataUrl, !0);
			} catch {
				S(J("status.imageReadErrorSvg"), "error");
			}
			return;
		}
		let n = new FileReader();
		n.onload = () => {
			M(va, String(n.result), !0);
		}, n.onerror = () => S(J("status.imageReadError"), "error"), n.readAsDataURL(t);
	}
	function Ea(e) {
		Bi("edit:site-icon", () => {
			R(D).site.icon = e;
		}), M(va, null);
	}
	function Da() {
		Bi("edit:site-icon", () => {
			delete R(D).site.icon;
		});
	}
	function Oa(e) {
		Bi("edit:site-title", () => {
			R(D).site.title = e;
		});
	}
	function ka(e) {
		Bi("edit:site-desc", () => {
			R(D).site.description = e;
		});
	}
	let Aa = /* @__PURE__ */ O(() => R(D)?.layout?.contentWidth ?? 1440), ja = /* @__PURE__ */ O(() => R(D)?.layout?.gutter ?? 6), Ma = /* @__PURE__ */ O(() => po(R(Aa))), Ia = /* @__PURE__ */ O(() => ao.find((e) => e.gutter === R(ja))?.id ?? null), La = /* @__PURE__ */ j(!1), Ra = /* @__PURE__ */ O(() => R(Aa) === "full" ? io : co(R(Aa))), za = /* @__PURE__ */ O(() => so.map((e) => ({
		screen: e,
		...fo(R(Aa), R(ja), e)
	})));
	function Ba(e, t) {
		Bi(t, () => {
			R(D).layout = {
				contentWidth: R(Aa),
				gutter: R(ja),
				...e
			};
		});
	}
	let Va = (e) => Ba({ contentWidth: e === "full" ? "full" : co(e) }, "edit:site-width"), Ha = (e) => Ba({ gutter: lo(e) }, "edit:site-gutter");
	function Ua() {
		let e = R(D).site.lang ?? "no";
		return e === "no" ? "nb" : e;
	}
	function Wa() {
		let e = Ua(), t = Et([...Tt, ...kt()]);
		return [...t.some(([t]) => t === e) ? [] : [[e, e]], ...t];
	}
	function qa(e) {
		Bi("site", () => {
			R(D).site.lang = e;
		});
	}
	let $a = /^(?:data:image\/[\w.+-]+;base64,[A-Za-z0-9+/=]+|\/(?!\/)[\w%./-]*)$/;
	Cn(() => {
		if (!R(D)?.site) return;
		let e = R(D).site.icon, t = document.querySelector("link[rel=\"icon\"]");
		if (t) {
			if (typeof e != "string" || !e) {
				t.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230b0e14'/%3E%3Cpath d='M19.2 49.6V14.4l25.6 10.4V49.6' fill='none' stroke='%2315b39a' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";
				return;
			}
			$a.test(e) && (t.href = e);
		}
	});
	function eo(e) {
		Bi("nav", () => {
			R(D).nav.layout = e;
		});
	}
	function mo(e, t) {
		Bi(`edit:nav-style-${e}`, () => {
			R(D).nav.style ??= {}, t === void 0 ? delete R(D).nav.style[e] : R(D).nav.style[e] = t;
		});
	}
	let ho = /* @__PURE__ */ O(() => R(D)?.nav?.variant === "side-left" || R(D)?.nav?.variant === "side-right"), go = /* @__PURE__ */ O(() => [
		"floating",
		"floating-square",
		"floating-tab"
	].includes(R(D)?.nav?.variant)), _o = {
		underline: [J("hoverColor.underline.label"), J("hoverColor.underline.title")],
		pill: [J("hoverColor.pill.label"), J("hoverColor.pill.title")],
		lift: [J("hoverColor.lift.label"), J("hoverColor.lift.title")]
	}, yo = /* @__PURE__ */ O(() => _o[R(D)?.nav?.style?.hover] ?? null);
	function bo(e) {
		Bi("nav", () => {
			e === "bar" ? delete R(D).nav.variant : R(D).nav.variant = e;
		});
	}
	function xo(e) {
		Bi("nav", () => {
			R(D).nav.style ??= {}, e ? R(D).nav.style.glow = !0 : delete R(D).nav.style.glow;
		});
	}
	function So(e) {
		Bi("nav", () => {
			R(D).nav.style ??= {}, e ? delete R(D).nav.style.topGap : R(D).nav.style.topGap = !1;
		});
	}
	function Co(e) {
		Bi("nav", () => {
			R(D).nav.style ??= {}, e === "standard" ? delete R(D).nav.style.hover : R(D).nav.style.hover = e;
		});
	}
	let wo = null, To = {}, Eo = {}, Do = !1, Oo = /* @__PURE__ */ j(nn([])), jo = /* @__PURE__ */ j(nn({})), Mo = /* @__PURE__ */ j(null), Po = /* @__PURE__ */ j(""), Lo = /* @__PURE__ */ j("news"), X = [
		["news", J("collectionKind.news")],
		["notices", J("collectionKind.notices")],
		["publications", J("collectionKind.publications")],
		["products", J("collectionKind.products")],
		["custom", J("collectionKind.custom")]
	], Z = null, Ro = {}, zo = {}, Bo = !1, Vo = /* @__PURE__ */ j(nn([]));
	async function Ho() {
		let e = {
			version: 1,
			maler: []
		};
		try {
			e = await (await fetch("/content/maler.json")).json();
		} catch {}
		Z = ea("urd-draft-templates", () => e, C, "urd-draft-maler"), M(Vo, [...Z.data.maler ?? []], !0);
		for (let e of R(Vo)) {
			let t = null;
			try {
				t = await (await fetch(`/content/maler/${e}.json`)).json();
			} catch {}
			zo[e] = t, Ro[e] = ea(`urd-draft-template-${e}`, () => t, C, `urd-draft-mal-${e}`), (Ro[e].data?.schemaVersion ?? 1) > 1 && Ro[e].reset();
		}
		Bo = !0, Uo();
	}
	function Uo() {
		let e = R(Vo).map((e) => Ro[e]?.data ? {
			id: e,
			...JSON.parse(JSON.stringify(Ro[e].data))
		} : null).filter(Boolean).map(({ id: e, mal: t, section: n, blocks: r, page: i }) => ({
			id: e,
			name: t.name,
			kind: t.kind,
			section: n,
			blocks: r,
			page: i
		}));
		E?.sendTemplates(e);
	}
	function Wo(e) {
		let t = os.includes(e.kind) ? e.kind : "section";
		return qo(t, e[t]);
	}
	function Go(e) {
		let { section: t, block: n } = Nt(e.sectionId, e.blockId);
		!t || !n?.sticky || Rt.some(([t]) => t === e.dock) && (Ye(`sticky-dock:${e.blockId}`), n.sticky = {
			...n.sticky,
			dock: e.dock
		}, T.save(), Ue(), E?.sendSection(R(_), t), Pt());
	}
	function Ko(e) {
		let t = e.blockIds ?? [], { section: n } = Nt(e.sectionId, t[0]);
		if (!n || !t.length) return;
		Ye(`sticky-group:${e.sectionId}`);
		let r = e.on ? Io("stk") : null;
		for (let e of n.blocks) t.includes(e.id) && (e.sticky = r ? {
			offset: 16,
			until: null,
			...e.sticky,
			group: r
		} : null);
		Le(n, "block-edited"), T.save(), Ue(), E?.sendSection(R(_), n), Pt(), S(J(e.on ? "status.stickyGrouped" : "status.stickyUngrouped"));
	}
	async function qo(e, t) {
		if (!t || !Z) return;
		let n = (await lt({
			title: J("canvas.templateNamePrompt"),
			placeholder: J("ph.templateName")
		}))?.trim();
		if (!n) return;
		let r = ss(n);
		if (!r) {
			S(J("status.invalidName"), "error");
			return;
		}
		if (R(Vo).includes(r)) {
			S(J("status.templateExists"), "error");
			return;
		}
		Ye("templates");
		let i = {
			schemaVersion: 1,
			mal: {
				name: n,
				kind: e
			},
			[e]: t
		};
		Ro[r] = ea(`urd-draft-template-${r}`, () => null, C, `urd-draft-mal-${r}`), Ro[r].replace(i), Ro[r].save(), Z.data.maler = [...R(Vo), r], Z.save(), M(Vo, [...R(Vo), r], !0), S(J("status.templateSaved", { name: n }), "ok"), Ue(), Uo();
	}
	async function Jo(e) {
		let t = Ro[e.id]?.data?.mal;
		t && await ct({ title: J("confirm.deleteTemplate", { name: t.name }) }) && (Ye("templates"), R(Hi) === e.id && M(Hi, null), localStorage.removeItem(`urd-draft-template-${e.id}`), localStorage.removeItem(`urd-draft-mal-${e.id}`), delete Ro[e.id], Z.data.maler = R(Vo).filter((t) => t !== e.id), Z.save(), M(Vo, R(Vo).filter((t) => t !== e.id), !0), Ue(), Uo());
	}
	async function Yo() {
		let e = {
			version: 1,
			samlinger: []
		};
		try {
			e = await (await fetch("/content/collections.json")).json();
		} catch {}
		wo = ea("urd-draft-collections", () => e, C, "urd-draft-samlinger"), M(Oo, [...wo.data.samlinger ?? []], !0);
		for (let e of R(Oo)) {
			let t = null;
			try {
				t = await (await fetch(`/content/samlinger/${e}.json`)).json();
			} catch {}
			Eo[e] = t, To[e] = ea(`urd-draft-collection-${e}`, () => t, C, `urd-draft-samling-${e}`), !t && !To[e].data && (To[e].replace({
				schemaVersion: 1,
				id: e,
				name: e,
				kind: "custom",
				entries: []
			}), To[e].save());
		}
		Do = !0, Xo();
	}
	function Xo(e = !0) {
		let t = {};
		for (let e of R(Oo)) To[e] && (t[e] = JSON.parse(JSON.stringify(To[e].data)));
		M(jo, t, !0), e && Zo();
	}
	function Zo() {
		E?.sendCollections(Ke(R(jo)) ?? {});
	}
	function Qo(e, t, n, r = !0) {
		let i = To[e];
		i && (Ye(t), n(i.data), i.save(), Ue(), Xo(r));
	}
	function $o(e) {
		To[e.collection] && ls(e.collection);
	}
	function es(e) {
		return (new DOMParser().parseFromString(String(e ?? ""), "text/html").body.textContent ?? "").trim();
	}
	function ts(e) {
		let { collection: t, entryId: n, field: r, value: i } = e;
		[
			"title",
			"text",
			"image",
			"imageAlt",
			"imageStyle"
		].includes(r) && (r === "title" && !es(i) || Qo(t, `edit:collection:${t}:${n}:${r}`, (e) => {
			let t = e.entries.find((e) => e.id === n);
			t && (i === "" && r !== "title" ? delete t[r] : t[r] = i);
		}, r === "image"));
	}
	function ns(e, t, n) {
		let r = {
			schemaVersion: 1,
			id: e,
			name: t,
			kind: n,
			entries: []
		};
		To[e] = ea(`urd-draft-collection-${e}`, () => null, C, `urd-draft-samling-${e}`), To[e].replace(r), To[e].save(), wo.data.samlinger = [...R(Oo), e], wo.save(), M(Oo, [...R(Oo), e], !0), M(Mo, e, !0), Ue(), Xo();
	}
	function rs() {
		let e = R(Po).trim();
		if (!e) return;
		let t = wa(e);
		if (!t || R(Oo).includes(t)) {
			S(J(t ? "status.collectionExists" : "status.invalidName"), "error");
			return;
		}
		Ye("collections"), ns(t, e, R(Lo)), M(Po, "");
	}
	function is() {
		let e = J("seed.productCatalogName"), t = wa(e) || "collection", n = t;
		for (let e = 2; R(Oo).includes(n); e += 1) n = `${t}-${e}`;
		Ye("collections"), ns(n, e, "products"), Vt(null, (e) => {
			e.props.collection = n;
		});
	}
	function as(e) {
		Ye("collections"), localStorage.removeItem(`urd-draft-collection-${e}`), localStorage.removeItem(`urd-draft-samling-${e}`), delete To[e], wo.data.samlinger = R(Oo).filter((t) => t !== e), wo.save(), M(Oo, R(Oo).filter((t) => t !== e), !0), R(Mo) === e && M(Mo, null), Ue(), Xo();
	}
	function ls(e) {
		Qo(e, `collection:${e}:add-entry`, (e) => {
			e.kind === "products" ? e.entries.push({
				id: Io("entry"),
				title: J("seed.newProduct"),
				text: ""
			}) : e.entries.unshift({
				id: Io("entry"),
				title: J("seed.newEntry"),
				date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				text: ""
			});
		});
	}
	function us(e, t, n, r) {
		Qo(e, `edit:collection:${e}:${t}:${n}`, (e) => {
			let i = e.entries.find((e) => e.id === t);
			i && (r === "" && n !== "title" ? delete i[n] : i[n] = r);
		});
	}
	function ds(e, t, n) {
		Qo(e, `collection:${e}:move-entry`, (e) => {
			let r = t + n;
			r < 0 || r >= e.entries.length || ([e.entries[t], e.entries[r]] = [e.entries[r], e.entries[t]]);
		});
	}
	function ps(e, t) {
		Qo(e, `collection:${e}:remove-entry`, (e) => {
			e.entries = e.entries.filter((e) => e.id !== t);
		});
	}
	async function ms(e, t, n) {
		let r = n.target.files?.[0];
		n.target.value = "", r && us(e, t, "image", (await ir(r)).dataUrl);
	}
	function gs(e, t, n) {
		let r = n.split(",").map((e) => e.trim()).filter(Boolean);
		us(e, t, "sizes", r.length ? r : "");
	}
	function xs(e, t) {
		Qo(e, `collection:${e}:${t}:colors`, (e) => {
			let n = e.entries.find((e) => e.id === t);
			n && (n.colors = [...n.colors ?? [], { name: J("ph.colorName") }]);
		});
	}
	function Ss(e, t, n, r, i) {
		Qo(e, `edit:collection:${e}:${t}:color:${n}:${r}`, (e) => {
			let a = e.entries.find((e) => e.id === t)?.colors?.[n];
			a && (r === "image" && !i ? delete a.image : i && (a[r] = i));
		});
	}
	async function Cs(e, t, n, r) {
		let i = r.target.files?.[0];
		r.target.value = "", i && Ss(e, t, n, "image", (await ir(i)).dataUrl);
	}
	function ws(e, t, n) {
		Qo(e, `collection:${e}:${t}:colors`, (e) => {
			let r = e.entries.find((e) => e.id === t);
			r?.colors && (r.colors = r.colors.filter((e, t) => t !== n), r.colors.length || delete r.colors);
		});
	}
	function Ts(e) {
		let t = To[e]?.data;
		if (!t) return;
		let n = URL.createObjectURL(new Blob([fs(t.entries)], { type: "text/csv" })), r = document.createElement("a");
		r.href = n, r.download = `${e}.csv`, r.click(), URL.revokeObjectURL(n);
	}
	async function Es(e, t) {
		let n = t.target.files?.[0];
		if (t.target.value = "", !n) return;
		let r = hs(await n.text());
		if (!r) {
			S(J("status.csvInvalid"), "error");
			return;
		}
		let i = /* @__PURE__ */ new Set();
		for (let e of r.entries) (!/^[a-z0-9][a-z0-9-]*$/.test(e.id) || i.has(e.id)) && (e.id = Io("entry")), i.add(e.id);
		Qo(e, `collection:${e}:import`, (e) => {
			e.entries = r.entries;
		}), S(J("status.csvImported", { count: String(r.entries.length) }), "ok");
	}
	let Q = null, Ds, Os = new Promise((e) => {
		Ds = e;
	}), $ = /* @__PURE__ */ j(null), ks = nn({}), As = /* @__PURE__ */ j("0.0.0"), js = /* @__PURE__ */ j(""), Ms = /* @__PURE__ */ j(""), Ns = /* @__PURE__ */ j(nn([])), Ps = /* @__PURE__ */ j(nn([])), Fs = /* @__PURE__ */ j("pending"), Is = () => [.../* @__PURE__ */ new Set([...R($)?.enabled ?? [], ...R($)?.disabled ?? []])];
	function Ls() {
		M($, JSON.parse(JSON.stringify(Q.data)), !0);
	}
	let Rs = /* @__PURE__ */ j(null);
	async function Bs() {
		try {
			let e = (await fetch("/urd.json", { cache: "no-store" })).headers.get("content-security-policy");
			if (!e) {
				M(Rs, { unknown: !0 }, !0);
				return;
			}
			let t = (t) => new Set((e.split(";").map((e) => e.trim()).find((e) => e.startsWith(`${t} `)) ?? "").split(/\s+/).slice(1));
			M(Rs, {
				frameSrc: t("frame-src"),
				connectSrc: t("connect-src"),
				scriptSrc: t("script-src")
			}, !0);
		} catch {
			M(Rs, { unknown: !0 }, !0);
		}
	}
	function Us(e) {
		let t = [
			...(e.scriptSrc ?? []).map((e) => ["script-src", e]),
			...(e.connectSrc ?? []).map((e) => ["connect-src", e]),
			...(e.frameSrc ?? []).map((e) => ["frame-src", e])
		];
		if (!R(Rs) || R(Rs).unknown) return [];
		let n = {
			"script-src": R(Rs).scriptSrc,
			"connect-src": R(Rs).connectSrc,
			"frame-src": R(Rs).frameSrc
		};
		return t.filter(([e, t]) => !n[e]?.has(t)).map(([e, t]) => `${e} ${t}`);
	}
	async function Ws() {
		Bs();
		let e = {
			version: 1,
			enabled: []
		};
		try {
			e = await (await fetch("/plugins/plugins.json")).json();
		} catch {}
		M(Ps, e.enabled ?? [], !0), Q = ea("urd-draft-plugins", () => e, C), Ls();
		try {
			M(As, (await (await fetch("/urd.json")).json()).engine ?? "0.0.0", !0);
		} catch {}
		for (let e of Is()) Qs(e);
		Js(), Ds(), E?.sendPlugins(Ke(R($))?.enabled ?? []);
	}
	async function Js() {
		try {
			let e = await fetch("/api/github/plugins");
			if (!e.ok) {
				Zs();
				return;
			}
			let { plugins: t } = await e.json();
			localStorage.setItem("urd-plugins-found", JSON.stringify(t ?? [])), M(Ns, (t ?? []).filter((e) => !Is().includes(e)), !0);
			for (let e of R(Ns)) Qs(e);
			M(Fs, "ok");
		} catch {
			Zs();
		}
	}
	function Zs() {
		try {
			let e = JSON.parse(localStorage.getItem("urd-plugins-found") ?? "[]");
			if (Array.isArray(e) && e.length) {
				M(Ns, e.filter((e) => !Is().includes(e)), !0);
				for (let e of R(Ns)) Qs(e);
				M(Fs, "ok");
				return;
			}
		} catch {}
		M(Fs, "unavailable");
	}
	async function Qs(e) {
		try {
			let t = await (await fetch(`/plugins/${e}/plugin.json`)).json(), n = Fo(t);
			ks[e] = {
				...t,
				errors: n,
				satisfied: n.length === 0 && No(R(As), t.requiresEngine)
			};
		} catch {
			ks[e] = {
				name: e,
				errors: [J("plugin.manifestNotFound", { id: e })],
				satisfied: !1
			};
		}
	}
	function ic(e, t) {
		Ye("plugins");
		let n = Q.data;
		n.enabled = (n.enabled ?? []).filter((t) => t !== e), n.disabled = (n.disabled ?? []).filter((t) => t !== e), t ? n.enabled.push(e) : n.disabled.push(e), Q.save(), Ue(), Ls(), ac();
	}
	function ac() {
		R(te) && (R(te).src = R(te).src);
	}
	function oc(e) {
		Ye("plugins");
		let t = Q.data;
		t.enabled = (t.enabled ?? []).filter((t) => t !== e), t.disabled = (t.disabled ?? []).filter((t) => t !== e), Q.save(), Ue(), Ls(), ac();
	}
	async function sc() {
		M(Ms, "");
		let e = R(js).trim().toLowerCase();
		if (!/^[a-z0-9][a-z0-9-]*$/.test(e)) {
			M(Ms, J("plugin.invalidId"), !0);
			return;
		}
		if (Is().includes(e)) {
			M(Ms, J("plugin.alreadyListed"), !0);
			return;
		}
		if (await Qs(e), ks[e].errors.length) {
			M(Ms, J("plugin.invalidManifest", { errors: ks[e].errors.join("; ") }), !0);
			return;
		}
		ic(e, !0), M(js, "");
	}
	function cc(e) {
		M(Ns, R(Ns).filter((t) => t !== e), !0), ic(e, !0);
	}
	function lc(e, t) {
		Bi(e, () => {
			R(D).footer ??= {
				version: 1,
				show: !1,
				text: "",
				align: "center"
			}, t(R(D).footer);
		});
	}
	function uc(e, t) {
		lc(`edit:footer-brand-${e}`, (n) => {
			n.brand ??= {}, t.trim() ? n.brand[e] = t : delete n.brand[e], !n.brand.title && !n.brand.tagline && !n.brand.logo && delete n.brand;
		});
	}
	function dc(e) {
		lc("footer", (t) => {
			t.brand ??= {}, e === "image" || e === "both" ? t.brand.mode = e : delete t.brand.mode;
		});
	}
	async function fc(e) {
		let t = e.target.files?.[0];
		if (e.target.value = "", t) try {
			let e = await ir(t);
			lc("footer", (t) => {
				t.brand ??= {}, t.brand.logo = e.dataUrl, t.brand.mode || (t.brand.mode = "both");
			});
		} catch {
			S(J("status.imageReadErrorSvg"), "error");
		}
	}
	function pc() {
		lc("footer", (e) => {
			e.brand && (delete e.brand.logo, delete e.brand.mode, delete e.brand.logoHeight, !e.brand.title && !e.brand.tagline && delete e.brand);
		});
	}
	function mc(e) {
		lc("edit:footer-logo-height", (t) => {
			t.brand ??= {};
			let n = Number(e);
			Number.isFinite(n) && (t.brand.logoHeight = Math.min(160, Math.max(16, Math.round(n))));
		});
	}
	function _c(e) {
		lc("edit:footer-copyright", (t) => {
			e.trim() ? t.copyright = e : delete t.copyright;
		});
	}
	let yc = [
		{
			id: "minimal",
			label: J("footerTemplate.minimal"),
			thumb: {
				center: !0,
				social: 2,
				baselineLinks: 1
			}
		},
		{
			id: "centered",
			label: J("footerTemplate.centered"),
			thumb: {
				center: !0,
				row: !0,
				social: 3
			}
		},
		{
			id: "columns",
			label: J("footerTemplate.columns"),
			thumb: {
				tag: !0,
				cols: 3,
				social: 3,
				baselineLinks: 2
			}
		},
		{
			id: "sitemap",
			label: J("footerTemplate.sitemap"),
			thumb: {
				tag: !0,
				fat: !0,
				cols: 4,
				social: 4,
				baselineLinks: 3
			}
		},
		{
			id: "newsletter",
			label: J("footerTemplate.newsletter"),
			thumb: {
				tag: !0,
				cta: !0,
				cols: 2,
				social: 2,
				baselineLinks: 1
			}
		},
		{
			id: "bigcta",
			label: J("footerTemplate.bigcta"),
			thumb: {
				center: !0,
				bigcta: !0,
				baselineLinks: 2
			}
		},
		{
			id: "contact",
			label: J("footerTemplate.contact"),
			thumb: {
				tag: !0,
				cols: 3,
				social: 2,
				baselineLinks: 1
			}
		},
		{
			id: "mega",
			label: J("footerTemplate.mega"),
			thumb: {
				tag: !0,
				mega: !0,
				cols: 2,
				social: 4,
				baselineLinks: 2
			}
		}
	];
	function bc(e) {
		let t = J("seed.orgName"), n = R(D).pages ?? [], r = (e) => n.slice(0, e).map((e) => ({
			label: e.title || e.id,
			page: e.id
		})), i = (e) => e.map((e) => ({
			icon: e,
			url: `https://${e}.com`
		})), a = (e, t) => ({
			label: e,
			href: t
		}), o = `© ${t}`;
		return e === "minimal" ? {
			align: "center",
			brand: { title: t },
			social: i(["facebook", "instagram"]),
			copyright: o,
			baseline: [a(J("seed.footer.privacy"), "#")]
		} : e === "centered" ? {
			align: "center",
			brand: { title: t },
			linkRow: r(5),
			social: i([
				"facebook",
				"instagram",
				"x"
			]),
			copyright: `${o} · ${J("seed.footer.madeWith")}`
		} : e === "columns" ? {
			align: "left",
			brand: {
				title: t,
				tagline: J("seed.footer.tagline1")
			},
			columns: [
				{
					title: J("seed.footer.colPages"),
					links: r(4)
				},
				{
					title: J("seed.footer.colCompany"),
					links: [
						a(J("seed.footer.about"), "#"),
						a(J("seed.join"), "#"),
						a(J("seed.footer.press"), "#")
					]
				},
				{
					title: J("seed.footer.colResources"),
					links: [
						a(J("seed.footer.bylaws"), "#"),
						a(J("seed.footer.privacy"), "#"),
						a(J("seed.footer.contact"), "#")
					]
				}
			],
			social: i([
				"facebook",
				"instagram",
				"linkedin"
			]),
			copyright: o,
			baseline: [a(J("seed.footer.privacy"), "#"), a(J("seed.footer.terms"), "#")]
		} : e === "sitemap" ? {
			align: "left",
			brand: {
				title: t,
				tagline: J("seed.footer.tagline2")
			},
			columns: [
				{
					title: J("seed.footer.colExplore"),
					links: [
						a(J("seed.footer.home"), "#"),
						a(J("seed.footer.events"), "#"),
						a(J("seed.footer.gallery"), "#"),
						a(J("seed.footer.blog"), "#")
					]
				},
				{
					title: J("seed.footer.colCompany"),
					links: [
						a(J("seed.footer.about"), "#"),
						a(J("seed.footer.history"), "#"),
						a(J("seed.footer.press"), "#"),
						a(J("seed.footer.contact"), "#")
					]
				},
				{
					title: J("seed.footer.colSupport"),
					links: [
						a(J("seed.join"), "#"),
						a(J("seed.footer.faq"), "#"),
						a(J("seed.footer.help"), "#")
					]
				},
				{
					title: J("seed.footer.colLegal"),
					links: [
						a(J("seed.footer.privacy"), "#"),
						a(J("seed.footer.terms"), "#"),
						a(J("seed.footer.bylaws"), "#")
					]
				}
			],
			social: i([
				"facebook",
				"instagram",
				"linkedin",
				"youtube"
			]),
			copyright: o,
			baseline: [
				a(J("seed.footer.privacy"), "#"),
				a(J("seed.footer.terms"), "#"),
				a(J("seed.footer.cookies"), "#")
			]
		} : e === "newsletter" ? {
			align: "left",
			brand: {
				title: t,
				tagline: J("seed.footer.tagline3")
			},
			cta: {
				kind: "newsletter",
				heading: J("seed.footer.newsletterHeading"),
				label: J("seed.footer.newsletterButton"),
				recipient: J("seed.email"),
				success: J("seed.footer.newsletterSuccess")
			},
			columns: [{
				title: J("seed.footer.colPages"),
				links: r(4)
			}, {
				title: J("seed.footer.colMore"),
				links: [
					a(J("seed.footer.about"), "#"),
					a(J("seed.footer.contact"), "#"),
					a(J("seed.footer.privacy"), "#")
				]
			}],
			social: i(["facebook", "instagram"]),
			copyright: o,
			baseline: [a(J("seed.footer.privacy"), "#")]
		} : e === "bigcta" ? {
			align: "center",
			cta: {
				kind: "button",
				big: !0,
				heading: J("seed.footer.ctaHeading"),
				sub: J("seed.footer.ctaSub"),
				label: J("seed.join"),
				href: "#"
			},
			linkRow: r(4),
			social: i([
				"facebook",
				"instagram",
				"x"
			]),
			copyright: o,
			baseline: [a(J("seed.footer.privacy"), "#"), a(J("seed.footer.terms"), "#")]
		} : e === "contact" ? {
			align: "left",
			brand: {
				title: t,
				tagline: J("seed.footer.tagline4")
			},
			columns: [
				{
					title: J("seed.footer.colVisit"),
					links: [
						a(J("seed.footer.address"), "#"),
						a(J("seed.email"), `mailto:${J("seed.email")}`),
						a(J("seed.phone"), `tel:${J("seed.phone").replace(/\s+/g, "")}`)
					]
				},
				{
					title: J("seed.footer.colHours"),
					links: [a(J("seed.footer.hours1"), "#"), a(J("seed.footer.hours2"), "#")]
				},
				{
					title: J("seed.footer.colPages"),
					links: r(4)
				}
			],
			social: i(["facebook", "instagram"]),
			copyright: o,
			baseline: [a(J("seed.footer.privacy"), "#")]
		} : {
			align: "left",
			brand: {
				title: t,
				tagline: J("seed.footer.tagline5")
			},
			columns: [{
				title: J("seed.footer.colExplore"),
				links: r(4)
			}, {
				title: J("seed.footer.colFollow"),
				links: [a(J("seed.footer.newsletter"), "#"), a(J("seed.email"), `mailto:${J("seed.email")}`)]
			}],
			social: i([
				"facebook",
				"instagram",
				"linkedin",
				"youtube"
			]),
			copyright: o,
			baseline: [a(J("seed.footer.privacy"), "#"), a(J("seed.footer.madeWith"), "#")],
			background: {
				version: 1,
				layers: [{
					type: "glow",
					version: gc.version ?? 1,
					props: {
						...gc.defaults(),
						color: "accent",
						x: .12,
						y: 0,
						radius: .6,
						opacity: .45
					}
				}, {
					type: "grain",
					version: vc.version ?? 1,
					props: {
						...vc.defaults(),
						opacity: .08
					}
				}]
			}
		};
	}
	function xc(e) {
		lc("footer-template", (t) => {
			let n = bc(e);
			t.show = !0, delete t.text;
			for (let e of [
				"align",
				"brand",
				"columns",
				"social",
				"copyright",
				"baseline",
				"linkRow",
				"cta",
				"columnsAlign",
				"background"
			]) n[e] === void 0 ? delete t[e] : t[e] = n[e];
		});
	}
	function Sc(e) {
		lc("footer", (t) => {
			t[e] ??= [], t[e].push(R(D).pages[0] ? {
				label: J("seed.link"),
				page: R(D).pages[0].id
			} : {
				label: J("seed.link"),
				href: "https://"
			});
		});
	}
	function Cc(e, t) {
		lc("footer", (n) => {
			n[e].splice(t, 1), n[e].length || delete n[e];
		});
	}
	function wc(e, t, n) {
		lc("footer", (r) => {
			let i = r[e], a = t + n;
			a < 0 || a >= i.length || ([i[t], i[a]] = [i[a], i[t]]);
		});
	}
	function Tc(e, t, n) {
		lc(`edit:footer-${e}-label-${t}`, (r) => {
			r[e][t].label = n;
		});
	}
	function Ec(e, t, n) {
		lc("footer", (r) => {
			let i = r[e][t];
			n === "__href" ? (delete i.page, i.href = i.href ?? "https://") : (i.page = n, delete i.href);
		});
	}
	function Dc(e, t, n) {
		lc(`edit:footer-${e}-href-${t}`, (r) => {
			r[e][t].href = n;
		});
	}
	function Oc(e) {
		lc("footer", (t) => {
			e === "center" ? t.columnsAlign = "center" : delete t.columnsAlign;
		});
	}
	function kc(e) {
		lc("footer", (t) => {
			e ? t.cta ??= {
				kind: "button",
				label: J("seed.join")
			} : delete t.cta;
		});
	}
	function Ac(e, t) {
		lc(`edit:footer-cta-${e}`, (n) => {
			n.cta ??= {}, t === "" || t == null || t === !1 ? delete n.cta[e] : n.cta[e] = t;
		});
	}
	function jc(e) {
		lc("footer", (t) => {
			t.cta ??= {}, e === "__href" ? (delete t.cta.page, t.cta.href = t.cta.href ?? "https://") : (t.cta.page = e, delete t.cta.href);
		});
	}
	function Mc(e, t) {
		lc("footer", (n) => {
			let r = new Set(n.hideOn ?? []);
			t ? r.delete(e) : r.add(e), r.size ? n.hideOn = [...r] : delete n.hideOn;
		});
	}
	function Nc() {
		lc("footer", (e) => {
			e.columns ??= [], e.columns.push({
				title: J("seed.column"),
				links: [{
					label: J("seed.link"),
					page: R(D).pages[0].id
				}]
			});
		});
	}
	function Pc(e) {
		lc("footer", (t) => {
			t.columns.splice(e, 1), t.columns.length || delete t.columns;
		});
	}
	function Fc(e, t) {
		lc("footer", (n) => {
			let r = e + t;
			r < 0 || r >= n.columns.length || ([n.columns[e], n.columns[r]] = [n.columns[r], n.columns[e]]);
		});
	}
	function Ic(e, t) {
		lc(`edit:footer-col-title-${e}`, (n) => {
			n.columns[e].title = t;
		});
	}
	function Lc(e) {
		lc("footer", (t) => {
			t.columns[e].links ??= [], t.columns[e].links.push({
				label: J("seed.link"),
				page: R(D).pages[0].id
			});
		});
	}
	function Rc(e, t) {
		lc("footer", (n) => {
			n.columns[e].links.splice(t, 1);
		});
	}
	function zc(e, t, n) {
		lc("footer", (r) => {
			let i = r.columns[e].links, a = t + n;
			a < 0 || a >= i.length || ([i[t], i[a]] = [i[a], i[t]]);
		});
	}
	function Bc(e, t, n) {
		lc(`edit:footer-link-label-${e}-${t}`, (r) => {
			r.columns[e].links[t].label = n;
		});
	}
	function Vc(e, t, n) {
		lc("footer", (r) => {
			let i = r.columns[e].links[t];
			n === "__href" ? (delete i.page, i.href = i.href ?? "https://") : (i.page = n, delete i.href);
		});
	}
	function Uc(e, t, n) {
		lc(`edit:footer-link-href-${e}-${t}`, (r) => {
			r.columns[e].links[t].href = n;
		});
	}
	function Wc() {
		lc("footer", (e) => {
			e.social ??= [], e.social.push({
				icon: "facebook",
				url: "https://"
			});
		});
	}
	function Gc(e) {
		lc("footer", (t) => {
			t.social.splice(e, 1), t.social.length || delete t.social;
		});
	}
	function Kc(e, t) {
		lc("footer", (n) => {
			let r = e + t;
			r < 0 || r >= n.social.length || ([n.social[e], n.social[r]] = [n.social[r], n.social[e]]);
		});
	}
	function Jc(e, t) {
		lc("footer", (n) => {
			n.social[e].icon = t;
		});
	}
	function Yc(e, t) {
		lc(`edit:footer-social-url-${e}`, (n) => {
			n.social[e].url = t;
		});
	}
	let Xc = Pa.filter(([e]) => e === "iconCat.social" || e === "iconCat.communication").flatMap(([, e]) => e.map((e) => [e, J(Na[e].labelKey)]));
	function Zc(e, t) {
		Bi(`edit:nav-label-${e}`, () => {
			R(D).nav.items[e].label = t;
		});
	}
	function Qc(e, t) {
		Bi("nav", () => {
			let n = R(D).nav.items[e];
			t === "__href" ? (delete n.page, n.href = n.href ?? "https://") : t === "__none" ? (delete n.page, delete n.href) : (n.page = t, delete n.href);
		});
	}
	function tl(e, t) {
		Bi(`edit:nav-href-${e}`, () => {
			R(D).nav.items[e].href = t;
		});
	}
	function nl(e, t) {
		let n = e + t, r = R(D).nav.items;
		n < 0 || n >= r.length || Bi("nav", () => {
			[r[e], r[n]] = [r[n], r[e]];
		});
	}
	function rl(e) {
		Bi("nav", () => {
			R(D).nav.items.splice(e, 1);
		});
	}
	function Bf() {
		Bi("nav", () => {
			R(D).nav.items.push({
				label: J("seed.link"),
				page: R(D).pages[0].id
			});
		});
	}
	function Vf(e) {
		Bi("nav", () => {
			let t = R(D).nav.items[e];
			t.children ??= [], t.children.push({
				label: J("seed.link"),
				page: R(D).pages[0].id
			});
		});
	}
	function Hf(e, t, n) {
		Bi(`edit:nav-child-label-${e}-${t}`, () => {
			R(D).nav.items[e].children[t].label = n;
		});
	}
	function Uf(e, t, n) {
		Bi("nav", () => {
			let r = R(D).nav.items[e].children[t];
			n === "__href" ? (delete r.page, r.href = r.href ?? "https://") : (r.page = n, delete r.href);
		});
	}
	function Wf(e, t, n) {
		Bi(`edit:nav-child-href-${e}-${t}`, () => {
			R(D).nav.items[e].children[t].href = n;
		});
	}
	function Gf(e, t, n) {
		let r = t + n, i = R(D).nav.items[e].children;
		r < 0 || r >= i.length || Bi("nav", () => {
			[i[t], i[r]] = [i[r], i[t]];
		});
	}
	function Kf(e, t) {
		Bi("nav", () => {
			let n = R(D).nav.items[e];
			n.children.splice(t, 1), n.children.length === 0 && (delete n.children, !n.page && !n.href && (n.page = R(D).pages[0].id));
		});
	}
	function qf(e, t) {
		Bi(`edit:theme-color-${e}`, () => {
			R(D).theme.tokens.color[e] = t, R(D).theme.alt?.auto && (R(D).theme.alt.tokens.color = Zf());
		});
	}
	function Jf(e, t) {
		Bi("theme", () => {
			R(D).theme.tokens.font[e] = t;
		});
	}
	function Yf(e, t) {
		Bi("theme", () => {
			R(D).theme.tokens.radius[e] = t;
		});
	}
	function Xf(e) {
		let t = /^#([0-9a-f]{6})$/i.exec(e ?? "");
		if (!t) return e;
		let [n, r, i] = [
			0,
			2,
			4
		].map((e) => parseInt(t[1].slice(e, e + 2), 16) / 255), a = Math.max(n, r, i), o = Math.min(n, r, i), s = 0, c = (a + o) / 2, l = a - o, u = l === 0 ? 0 : l / (1 - Math.abs(2 * c - 1));
		l !== 0 && (s = a === n ? (r - i) / l % 6 : a === r ? (i - n) / l + 2 : (n - r) / l + 4, s = (s * 60 + 360) % 360);
		let d = 1 - c, f = (1 - Math.abs(2 * d - 1)) * u, p = f * (1 - Math.abs(s / 60 % 2 - 1)), m = d - f / 2, [h, g, _] = s < 60 ? [
			f,
			p,
			0
		] : s < 120 ? [
			p,
			f,
			0
		] : s < 180 ? [
			0,
			f,
			p
		] : s < 240 ? [
			0,
			p,
			f
		] : s < 300 ? [
			p,
			0,
			f
		] : [
			f,
			0,
			p
		], v = (e) => Math.round((e + m) * 255).toString(16).padStart(2, "0");
		return `#${v(h)}${v(g)}${v(_)}`;
	}
	function Zf() {
		return Object.fromEntries(Object.entries(R(D).theme.tokens.color).map(([e, t]) => [e, Xf(t)]));
	}
	function Qf(e, t) {
		Bi(`edit:theme-alt-${e}`, () => {
			R(D).theme.alt.tokens.color[e] = t, R(D).theme.alt.auto = !1;
		});
	}
	function $f(e) {
		Bi("theme", () => {
			e === "light" ? delete R(D).theme.scheme : R(D).theme.scheme = e;
		});
	}
	function ep(e) {
		Bi("theme", () => {
			e ? R(D).theme.alt = {
				auto: !0,
				tokens: { color: Zf() }
			} : delete R(D).theme.alt;
		});
	}
	function tp(e) {
		Bi("theme", () => {
			R(D).theme.alt ??= { tokens: { color: Zf() } }, R(D).theme.alt.auto = e, e && (R(D).theme.alt.tokens.color = Zf());
		});
	}
	function np(e) {
		let t = R(D).theme.tokens.font[e];
		return [...al.some(([, e]) => e === t) ? [] : [[t, J("opt.customFont")]], ...al.map(([e, t]) => [t, J(e)])];
	}
	let rp = (e) => parseInt(e, 10) || 0;
	function ip(e, t) {
		Yf(e, `${t}px`);
	}
	let ap = (e, t) => e && t && t[e] ? t[e] : e, op = [
		"bg",
		"surface",
		"text",
		"accent",
		"accent-text"
	], sp = [
		{
			id: "well",
			name: J("themePreset.well.name"),
			note: J("themePreset.well.note"),
			light: {
				bg: "#f6faf8",
				surface: "#ffffff",
				text: "#16211d",
				accent: "#15b39a",
				"accent-text": "#04241d"
			},
			dark: {
				bg: "#0e1512",
				surface: "#17211d",
				text: "#eaf1ed",
				accent: "#22c3a8",
				"accent-text": "#04241d"
			}
		},
		{
			id: "stone",
			name: J("themePreset.stone.name"),
			note: J("themePreset.stone.note"),
			light: {
				bg: "#f4f2ed",
				surface: "#ffffff",
				text: "#262019",
				accent: "#8a5a41",
				"accent-text": "#ffffff"
			},
			dark: {
				bg: "#17130e",
				surface: "#221c15",
				text: "#efe8dd",
				accent: "#c0906f",
				"accent-text": "#1a1109"
			}
		},
		{
			id: "plum",
			name: J("themePreset.plum.name"),
			note: J("themePreset.plum.note"),
			light: {
				bg: "#faf5ff",
				surface: "#ffffff",
				text: "#2a1546",
				accent: "#7c3aed",
				"accent-text": "#ffffff"
			},
			dark: {
				bg: "#140f20",
				surface: "#1f1733",
				text: "#ece5f8",
				accent: "#a97cf6",
				"accent-text": "#170a2c"
			}
		},
		{
			id: "rose",
			name: J("themePreset.rose.name"),
			note: J("themePreset.rose.note"),
			light: {
				bg: "#faf5f6",
				surface: "#ffffff",
				text: "#241a1d",
				accent: "#b04a63",
				"accent-text": "#ffffff"
			},
			dark: {
				bg: "#171015",
				surface: "#22181c",
				text: "#f1e6ea",
				accent: "#d98098",
				"accent-text": "#2a0f18"
			}
		},
		{
			id: "ocean",
			name: J("themePreset.ocean.name"),
			note: J("themePreset.ocean.note"),
			light: {
				bg: "#f1f6fb",
				surface: "#ffffff",
				text: "#13202b",
				accent: "#1a6fa8",
				"accent-text": "#ffffff"
			},
			dark: {
				bg: "#0a1420",
				surface: "#12202f",
				text: "#e2edf5",
				accent: "#47a6df",
				"accent-text": "#06131f"
			}
		},
		{
			id: "night",
			name: J("themePreset.night.name"),
			note: J("themePreset.night.note"),
			scheme: "dark",
			light: {
				bg: "#f5f6fb",
				surface: "#ffffff",
				text: "#171a2b",
				accent: "#4f5ed6",
				"accent-text": "#ffffff"
			},
			dark: {
				bg: "#0d0f1a",
				surface: "#171b2e",
				text: "#e7e9f5",
				accent: "#8091ff",
				"accent-text": "#0a0c18"
			}
		}
	];
	function cp(e) {
		Bi("theme", () => {
			let t = e.scheme === "dark", n = t ? e.dark : e.light, r = t ? e.light : e.dark;
			for (let e of op) R(D).theme.tokens.color[e] = n[e];
			t ? R(D).theme.scheme = "dark" : delete R(D).theme.scheme, R(D).theme.alt = { tokens: { color: { ...r } } };
		});
	}
	let lp = /* @__PURE__ */ O(() => {
		if (!R(D)) return null;
		let e = R(D).theme.tokens.color, t = R(D).theme.alt?.tokens?.color ?? {}, n = R(D).theme.scheme === "dark";
		return sp.find((r) => {
			let i = n ? r.dark : r.light, a = n ? r.light : r.dark;
			return op.every((n) => e[n] === i[n] && t[n] === a[n]);
		})?.id ?? null;
	});
	function up() {
		M(ie, !R(ie)), E?.sendChrome(R(ie));
	}
	function dp(e) {
		let t = T.data.sections.find((t) => t.id === e.sectionId), n = t?.blocks.find((t) => t.id === e.blockId);
		n && (Ye(`edit:${e.blockId}`), n.props = e.props, T.save(), Ue(), R(k)?.blockId === e.blockId && Pt(), e.rerender && E?.sendSection(R(_), t), M(y, ""));
	}
	function fp(e) {
		let t = T.data.sections.find((t) => t.id === e.sectionId), n = t?.blocks.find((t) => t.id === e.blockId);
		if (!n) return;
		Ye(e.coalesce ? `edit:${e.groupKey ?? e.blockId}` : "move-block");
		let r = e.frameKey === "mobile" ? "mobile" : "desktop";
		n.frames[r] = e.frame, r === "desktop" && Le(t, "desktop-changed-after-mobile"), T.save(), Ue(), R(k)?.blockId === e.blockId && Pt();
	}
	function pp(e) {
		let t = T.data.sections.find((t) => t.id === e.sectionId)?.blocks.find((t) => t.id === e.blockId);
		!t?.frames?.desktop || t.frames.desktop.h === e.h || (T.amendBaseline((t) => {
			let n = t.sections.find((t) => t.id === e.sectionId)?.blocks.find((t) => t.id === e.blockId);
			n?.frames?.desktop && (n.frames.desktop.h = e.h);
		}), T.hasDraft() && Ye(`edit:${e.blockId}`), t.frames.desktop.h = e.h, T.save(), Ue(), R(k)?.blockId === e.blockId && Pt());
	}
	function mp(e) {
		let t = T.data.sections.find((t) => t.id === e.sectionId);
		if (t) {
			if (Ye("mobile-reset"), e.blockId) {
				let n = t.blocks.find((t) => t.id === e.blockId);
				n && (n.frames.mobile = null);
			} else for (let e of t.blocks) e.frames.mobile = null;
			!Ie(t) && t.responsive?.mobile && (t.responsive.mobile.attention = null), T.save(), Ue(), Ne(), E?.sendSection(R(_), t);
		}
	}
	function hp(e) {
		let t = T.data.sections.find((t) => t.id === e.sectionId), n = t?.blocks.find((t) => t.id === e.blockId);
		!n || typeof e.mobileOrder != "number" || (Ye("mobile-order"), n.mobileOrder = e.mobileOrder, T.save(), Ue(), E?.sendSection(R(_), t));
	}
	function gp(e) {
		let t = T.data.sections.find((t) => t.id === e.sectionId);
		t?.responsive?.mobile && (Ye("review-done"), t.responsive.mobile.attention = null, T.save(), Ue(), Ne());
	}
	function _p(e) {
		let t = T.data.sections.find((t) => t.id === e.sectionId), n = t?.blocks.find((t) => t.id === e.blockId);
		n && (Ye("block-flag"), typeof e.decor == "boolean" && (n.decor = e.decor), typeof e.hideMobile == "boolean" && (n.hideMobile = e.hideMobile), T.save(), Ue(), typeof e.hideMobile == "boolean" && R(ge) === "mobile" && E?.sendSection(R(_), t), R(k)?.blockId === e.blockId && Pt());
	}
	function vp(e) {
		Ye("add-section"), e.section.id || (e.section.id = Io("sec")), T.data.sections.splice(e.index, 0, e.section), T.save(), Ue(), E?.sendPage(R(_), T.data), M(vn, e.section.id, !0), En(e.section), M(bt, "properties");
	}
	function yp(e) {
		let t = T.data.sections, n = t.findIndex((t) => t.id === e.sectionId), r = n + e.dir;
		n < 0 || r < 0 || r >= t.length || (Ye("move-section"), [t[n], t[r]] = [t[r], t[n]], T.save(), Ue(), E?.sendPage(R(_), T.data));
	}
	function bp(e) {
		Ye("delete-section"), e.sectionId === R(vn) && (M(vn, null), M(yn, null)), R(k)?.sectionId === e.sectionId && M(k, null), T.data.sections = T.data.sections.filter((t) => t.id !== e.sectionId), T.save(), Ue(), E?.sendPage(R(_), T.data);
	}
	function xp(e) {
		let t = T.data.sections.find((t) => t.id === e.sectionId);
		if (t) {
			Ye("section-size"), t.size = {
				...t.size,
				minHeight: e.minHeight
			};
			for (let n of e.moves ?? []) {
				let e = t.blocks.find((e) => e.id === n.blockId);
				e && (e.frames.desktop = {
					...e.frames.desktop,
					y: e.frames.desktop.y + n.dy
				});
			}
			e.moves?.length && (Le(t, "section-height"), R(k)?.sectionId === e.sectionId && Pt()), e.sectionId === R(vn) && M(bn, e.minHeight, !0), T.save(), Ue();
		}
	}
	function Sp(e) {
		let t = T.data.sections.find((t) => t.id === e.fromSectionId), n = T.data.sections.find((t) => t.id === e.toSectionId), r = t?.blocks.find((t) => t.id === e.blockId);
		!t || !n || !r || (Ye("move-block"), t.blocks = t.blocks.filter((t) => t.id !== e.blockId), r.frames.desktop = e.frame, r.frames.mobile = null, n.blocks.push(r), Le(t, "block-moved"), Le(n, "block-moved"), T.save(), Ue(), Ne(), E?.sendPage(R(_), T.data), R(k)?.blockId === e.blockId && (M(k, {
			...R(k),
			sectionId: e.toSectionId
		}, !0), Pt()));
	}
	function Cp(e) {
		let t = T.data.sections.find((t) => t.id === e.sectionId);
		if (!t) return;
		let n = e.blockIds ?? [e.blockId];
		Ye("delete-block"), t.blocks = t.blocks.filter((e) => !n.includes(e.id)), n.includes(R(k)?.blockId) && M(k, null), Le(t, "block-deleted"), T.save(), Ue(), E?.sendSection(R(_), t);
	}
	let wp = {
		text: {
			type: "text",
			props: {
				html: J("seed.text"),
				align: "left"
			},
			w: 33,
			h: 28
		},
		"text-box": {
			type: "text",
			props: {
				html: J("seed.textBox"),
				align: "left",
				box: !0
			},
			w: 30,
			h: 150
		},
		button: {
			type: "button",
			props: {
				label: J("seed.newButton"),
				page: null,
				href: null,
				style: "primary"
			},
			w: 20,
			h: 36
		},
		"shape-line": {
			type: "shape",
			decor: !0,
			hideMobile: !0,
			props: {
				kind: "line",
				color: "accent",
				thickness: 2,
				fill: null
			},
			w: 25,
			h: 8
		},
		"shape-arrow": {
			type: "shape",
			decor: !0,
			hideMobile: !0,
			props: {
				kind: "arrow",
				color: "accent",
				thickness: 2,
				fill: null
			},
			w: 25,
			h: 16
		},
		"shape-circle": {
			type: "shape",
			decor: !0,
			hideMobile: !0,
			props: {
				kind: "circle",
				color: "accent",
				thickness: 2,
				fill: null
			},
			w: 10,
			h: 110
		},
		"shape-rect": {
			type: "shape",
			decor: !0,
			hideMobile: !0,
			props: {
				kind: "rect",
				color: "accent",
				thickness: 2,
				fill: null
			},
			w: 20,
			h: 110
		},
		"shape-triangle": {
			type: "shape",
			decor: !0,
			hideMobile: !0,
			props: {
				kind: "triangle",
				color: "accent",
				thickness: 2,
				fill: null
			},
			w: 10,
			h: 110
		},
		image: {
			type: "image",
			props: {
				src: "",
				alt: "",
				fit: "cover",
				radius: "md",
				href: null
			},
			w: 30,
			h: 220
		},
		video: {
			type: "video",
			props: {
				url: "",
				title: "Video"
			},
			w: 45,
			h: 300
		},
		icon: {
			type: "icon",
			decor: !0,
			hideMobile: !0,
			props: {
				glyph: "★",
				color: "accent",
				size: 48
			},
			w: 8,
			h: 64
		},
		collection: {
			type: "collection",
			props: {
				collection: null,
				view: "cards",
				limit: 6,
				newestFirst: !0
			},
			w: 90,
			h: 200
		},
		gallery: {
			type: "gallery",
			props: {
				images: [],
				view: "grid",
				columns: 3,
				gap: 12,
				radius: "md",
				lightbox: !0,
				interval: 5
			},
			w: 90,
			h: 320
		},
		faq: {
			type: "faq",
			props: {
				items: [
					{
						q: J("seed.faq.q1"),
						a: J("seed.faq.answer")
					},
					{
						q: J("seed.faq.q2"),
						a: J("seed.faq.answer")
					},
					{
						q: J("seed.faq.q3"),
						a: J("seed.faq.answer")
					}
				],
				multi: !1
			},
			w: 50,
			h: 220
		},
		timeline: {
			type: "timeline",
			props: {
				items: [
					{
						year: "2019",
						title: J("seed.timeline.t1"),
						text: J("seed.timeline.text")
					},
					{
						year: "2022",
						title: J("seed.timeline.t2"),
						text: J("seed.timeline.text")
					},
					{
						year: "2026",
						title: J("seed.timeline.t3"),
						text: J("seed.timeline.text")
					}
				],
				variant: "left",
				marker: "filled",
				accent: null
			},
			w: 42,
			h: 260
		},
		quote: {
			type: "quote",
			props: {
				text: J("seed.quoteBlock.text"),
				attribution: J("seed.quoteBlock.name"),
				role: J("seed.quoteBlock.role"),
				variant: "large",
				image: "",
				accent: null
			},
			w: 44,
			h: 180
		},
		stats: {
			type: "stats",
			props: {
				value: "4800",
				prefix: "",
				suffix: "+",
				label: J("seed.statsBlock.label"),
				countUp: !0
			},
			w: 20,
			h: 90
		},
		table: {
			type: "table",
			props: {
				header: !0,
				striped: !1,
				lines: "rows",
				rows: [
					[
						J("seed.table.h1"),
						J("seed.table.h2"),
						J("seed.table.h3")
					],
					[
						J("seed.table.r1c1"),
						J("seed.table.r1c2"),
						""
					],
					[
						J("seed.table.r2c1"),
						J("seed.table.r2c2"),
						""
					]
				]
			},
			w: 50,
			h: 160
		},
		share: {
			type: "share",
			props: {
				services: [
					"facebook",
					"x",
					"linkedin",
					"whatsapp",
					"email",
					"copy"
				],
				variant: "icons",
				size: 38,
				color: ""
			},
			w: 34,
			h: 48
		},
		countdown: {
			type: "countdown",
			props: {
				target: (() => {
					let e = new Date(Date.now() + 2592e6), t = (e) => String(e).padStart(2, "0");
					return `${e.getFullYear()}-${t(e.getMonth() + 1)}-${t(e.getDate())}T18:00`;
				})(),
				doneText: J("seed.countdown.done"),
				variant: "boxes",
				showSeconds: !0
			},
			w: 40,
			h: 110
		},
		audio: {
			type: "audio",
			props: {
				src: "",
				title: "",
				loop: !1
			},
			w: 34,
			h: 80
		},
		product: {
			type: "product",
			props: {
				collection: null,
				limit: 0,
				columns: 0,
				currency: "kr"
			},
			w: 90,
			h: 300
		},
		cart: {
			type: "cart",
			props: {
				variant: "button",
				href: "",
				currency: "kr"
			},
			w: 16,
			h: 48
		},
		checkout: {
			type: "checkout",
			props: {
				recipient: "",
				endpoint: "",
				vipps: "",
				currency: "kr",
				vippsCheckout: !1
			},
			w: 44,
			h: 430
		}
	};
	function Tp(e) {
		let t = wp[e];
		return t ? {
			id: Io("blk"),
			type: t.type,
			version: 1,
			decor: !!t.decor,
			hideMobile: !!t.hideMobile,
			props: structuredClone(t.props),
			animation: null,
			frames: {
				desktop: {
					x: 4,
					y: 8,
					w: t.w,
					h: t.h,
					z: 1,
					rot: 0
				},
				mobile: null
			}
		} : null;
	}
	function Ep(e) {
		E ? E.sendPlaceBlock(e) : Dp(Hr()?.id, e);
	}
	function Dp(e, t) {
		let n = T.data.sections.find((t) => t.id === e) ?? T.data.sections[0];
		if (!n) return;
		Ye("add-block");
		let r = Math.max(0, ...n.blocks.map((e) => e.frames?.desktop?.z ?? 1)) + 1;
		t.frames?.desktop && (t.frames.desktop = {
			...t.frames.desktop,
			z: r
		}), n.blocks.push(t), Le(n, "block-added"), T.save(), Ue(), E?.sendSection(R(_), n);
	}
	function Op(e, t, n, r) {
		let i = T.data.sections.find((t) => t.id === e);
		if (!i || !t?.length) return;
		Ye("add-blocks");
		for (let e of r ?? []) {
			let t = i.blocks.find((t) => t.id === e.blockId);
			t && typeof e.dy == "number" && (t.frames.desktop = {
				...t.frames.desktop,
				y: t.frames.desktop.y + e.dy
			});
		}
		i.blocks.push(...t);
		let a = String(i.size?.minHeight ?? "");
		n && a.endsWith("px") && Number.parseFloat(a) < n && (i.size = {
			...i.size,
			minHeight: `${n}px`
		}), Le(i, "block-added"), T.save(), Ue(), E?.sendSection(R(_), i);
	}
	function kp(e) {
		Ep(Tp(e));
	}
	let Ap = /* @__PURE__ */ j(nn([]));
	function jp(e, t = {}) {
		let n = Ke(e);
		Ep({
			id: Io("blk"),
			type: n.type,
			version: n.version ?? 1,
			decor: !1,
			props: {
				...n.defaults ?? {},
				...Ke(t)
			},
			animation: null,
			frames: {
				desktop: {
					x: 25,
					y: 40,
					w: 50,
					h: 260,
					z: 1,
					rot: 0
				},
				mobile: null
			}
		});
	}
	let Mp = /* @__PURE__ */ j("");
	function Np() {
		let e = [
			{
				label: J("blocks.text"),
				act: "block",
				kind: "text"
			},
			{
				label: J("ui.textBox"),
				act: "block",
				kind: "text-box"
			},
			{
				label: J("blocks.button"),
				act: "block",
				kind: "button"
			},
			{
				label: J("blocks.image"),
				act: "image"
			},
			{
				label: J("blocks.video"),
				act: "block",
				kind: "video"
			},
			{
				label: J("blocks.icon"),
				act: "block",
				kind: "icon"
			},
			{
				label: J("blocks.collection"),
				act: "block",
				kind: "collection"
			},
			{
				label: J("blocks.faq"),
				act: "block",
				kind: "faq"
			},
			{
				label: J("blocks.timeline"),
				act: "block",
				kind: "timeline"
			},
			{
				label: J("blocks.quote"),
				act: "block",
				kind: "quote"
			},
			{
				label: J("blocks.stats"),
				act: "block",
				kind: "stats"
			},
			{
				label: J("blocks.table"),
				act: "block",
				kind: "table"
			},
			{
				label: J("blocks.share"),
				act: "block",
				kind: "share"
			},
			{
				label: J("blocks.countdown"),
				act: "block",
				kind: "countdown"
			},
			{
				label: J("blocks.audio"),
				act: "block",
				kind: "audio"
			},
			{
				label: J("blocks.product"),
				act: "block",
				kind: "product"
			},
			{
				label: J("blocks.cart"),
				act: "block",
				kind: "cart"
			},
			{
				label: J("blocks.checkout"),
				act: "block",
				kind: "checkout"
			},
			{
				label: J("ui.emptyGallery"),
				act: "block",
				kind: "gallery"
			},
			{
				label: J("ui.galleryWithImages"),
				act: "galleryImages"
			},
			{
				label: J("shape.line"),
				act: "block",
				kind: "shape-line"
			},
			{
				label: J("shape.arrow"),
				act: "block",
				kind: "shape-arrow"
			},
			{
				label: J("shape.circle"),
				act: "block",
				kind: "shape-circle"
			},
			{
				label: J("shape.rect"),
				act: "block",
				kind: "shape-rect"
			},
			{
				label: J("shape.triangle"),
				act: "block",
				kind: "shape-triangle"
			}
		];
		for (let t of R(Vo)) {
			let n = Ro[t]?.data?.mal;
			n?.kind === "blocks" && e.push({
				label: n.name,
				act: "template",
				id: t
			});
		}
		for (let t of R(Ap)) if (t.variants?.length) for (let n of t.variants) e.push({
			label: `${t.label}: ${n.label}`,
			act: "plugin",
			entry: t,
			props: n.props
		});
		else e.push({
			label: t.label,
			act: "plugin",
			entry: t
		});
		return e;
	}
	function Pp(e) {
		e.act === "block" ? kp(e.kind) : e.act === "plugin" ? jp(e.entry, e.props ?? {}) : e.act === "template" && E?.sendInsertTemplate(e.id);
	}
	function Fp(e) {
		let t = Tp(e.kind);
		if (t) {
			if (e.at && typeof e.at.x == "number" && typeof e.at.y == "number") {
				let n = T.data.sections.find((t) => t.id === e.sectionId)?.grid ?? R(D).grid, r = ol({
					x: e.at.x,
					y: e.at.y,
					w: t.frames.desktop.w,
					h: t.frames.desktop.h,
					grid: n
				});
				t.frames.desktop.x = r.x, t.frames.desktop.y = r.y;
			} else t.frames.desktop.x = Math.round((100 - t.frames.desktop.w) / 2 * 100) / 100, t.frames.desktop.y = 40;
			Dp(e.sectionId, t), E?.sendSelect(t.id), e.kind === "image" && S(J("status.imageBlockAdded")), e.kind === "gallery" && S(J("status.galleryBlockAdded"));
		}
	}
	async function Ip(e) {
		let t = e.target.files?.[0];
		if (e.target.value = "", !t) return;
		S(J("status.compressingImage"));
		let n;
		try {
			n = await ir(t);
		} catch {
			S(J("status.imageReadError"), "error");
			return;
		}
		let r = Math.round(n.height / n.width * .3 * (R(te)?.clientWidth ?? 1280));
		Ep({
			id: Io("blk"),
			type: "image",
			version: 1,
			props: {
				src: n.dataUrl,
				alt: wa(t.name).replaceAll("-", " "),
				fit: "cover",
				radius: "md",
				href: null
			},
			animation: null,
			frames: {
				desktop: {
					x: 4,
					y: 8,
					w: 30,
					h: Math.max(40, r),
					z: 1,
					rot: 0
				},
				mobile: null
			}
		}), n.bytes > 4e5 ? S(J("status.imageLarge", { kb: Math.round(n.bytes / 1024) }), "error") : S("");
	}
	async function Lp(e) {
		let t = [], n = 0, r = 0;
		for (let i of e) try {
			let e = await ir(i);
			e.bytes > 4e5 && (r += 1), t.push({
				src: e.dataUrl,
				alt: wa(i.name).replaceAll("-", " "),
				href: null,
				style: {}
			});
		} catch {
			n += 1;
		}
		return {
			images: t,
			failed: n,
			big: r
		};
	}
	function Rp(e, t, n) {
		t ? S(J("status.imagesReadFailed", { n: t }), "error") : n ? S(J("status.imagesLarge", { n }), "error") : S(e ? "" : J("status.noImagesAdded"));
	}
	async function zp(e) {
		let t = [...e.target.files ?? []];
		if (e.target.value = "", !t.length) return;
		S(J("status.compressingImages"));
		let { images: n, failed: r, big: i } = await Lp(t);
		n.length && Vt("gallery-add", (e) => {
			e.props.images.push(...n);
		}), Rp(n.length, r, i);
	}
	async function Bp(e) {
		let t = [...e.target.files ?? []];
		if (e.target.value = "", !t.length) return;
		S(J("status.compressingImages"));
		let { images: n, failed: r, big: i } = await Lp(t);
		if (!n.length) {
			Rp(0, r, i);
			return;
		}
		let a = Tp("gallery");
		a.props.images = n, Ep(a), Rp(n.length, r, i);
	}
	function Vp(e, t) {
		Vt("gallery-move", (n) => {
			let r = e + t;
			r < 0 || r >= n.props.images.length || ([n.props.images[e], n.props.images[r]] = [n.props.images[r], n.props.images[e]]);
		});
	}
	function Hp(e) {
		Vt("gallery-remove", (t) => {
			t.props.images.splice(e, 1);
		});
	}
	function Up(e, t, n) {
		Vt(`edit:${R(k).blockId}:img${e}-${t}`, (r) => {
			r.props.images[e][t] = n;
		});
	}
	function Wp(e, t, n, r) {
		let i = e?.[t];
		if (!i?.startsWith("data:image/") && !i?.startsWith("data:audio/") && !i?.startsWith("data:video/")) return;
		let a = i.split(",", 2)[1], o = `media/${wa(n || "image")}-${Ta(a)}.${Ca(i)}`;
		r.push({
			path: o,
			content: a,
			encoding: "base64"
		}), e[t] = `/${o}`;
	}
	function Gp(e, t) {
		Wp(e, "image", e.title, t);
		for (let n of e.colors ?? []) Wp(n, "image", `${e.title}-${n.name}`, t);
	}
	function Kp(e, t) {
		for (let n of e?.layers ?? []) {
			if (n.type === "image" && Wp(n.props, "src", "background", t), n.type === "slideshow") for (let e of n.props.images ?? []) Wp(e, "src", "background", t);
			n.type === "video" && (Wp(n.props, "src", "video", t), Wp(n.props, "poster", "plakat", t));
		}
	}
	function qp(e, t) {
		if (e.type === "image" && Wp(e.props, "src", e.props.alt, t), e.type === "icon" && Wp(e.props, "image", "ikon", t), e.type === "gallery") for (let n of e.props.images ?? []) Wp(n, "src", n.alt || "gallery", t);
		e.type === "audio" && Wp(e.props, "src", e.props.title || "lyd", t);
	}
	function Jp(e, t) {
		Kp(e.background, t);
		for (let n of e.blocks) qp(n, t);
	}
	function Yp(e) {
		let t = [];
		e.meta?.og && Wp(e.meta.og, "image", "share", t);
		for (let n of e.sections) Jp(n, t);
		return t;
	}
	function Xp(e) {
		let t = [], n = e.nav?.logo;
		return n?.type === "image" && Wp(n, "value", "logo", t), n?.type === "both" && Wp(n, "image", "logo", t), e.nav?.style && Wp(e.nav.style, "image", "menu", t), Kp(e.nav?.style?.background, t), Kp(e.footer?.background, t), e.footer?.brand && Wp(e.footer.brand, "logo", "footer-logo", t), Wp(e.site, "icon", "ikon", t), t;
	}
	let Zp = /* @__PURE__ */ j(!1), Qp = /* @__PURE__ */ j(null);
	function $p() {
		M(Zp, !R(Zp));
	}
	function em() {
		M(Zp, !1), tm();
	}
	Cn(() => {
		if (!R(Zp)) return;
		let e = (e) => {
			R(Qp)?.contains(e.target) || M(Zp, !1);
		}, t = (e) => {
			e.key === "Escape" && M(Zp, !1);
		}, n = () => M(Zp, !1);
		return window.addEventListener("click", e, !0), window.addEventListener("keydown", t, !0), window.addEventListener("blur", n), () => {
			window.removeEventListener("click", e, !0), window.removeEventListener("keydown", t, !0), window.removeEventListener("blur", n);
		};
	});
	function tm() {
		Ye("discard");
		for (let e of R(D).pages) e.id !== R(_) && !Ve.has(e.id) && localStorage.removeItem(`urd-draft-${e.id}`);
		let e = T.reset();
		if (Re.reset(), Q && (Q.reset(), Ls()), wo) {
			wo.reset(), M(Oo, [...wo.data.samlinger ?? []], !0);
			for (let e of Object.keys(To)) R(Oo).includes(e) ? To[e].reset() : delete To[e];
			Xo();
		}
		if (Z) {
			Z.reset(), M(Vo, [...Z.data.maler ?? []], !0);
			for (let e of Object.keys(Ro)) R(Vo).includes(e) ? Ro[e].reset() : (localStorage.removeItem(`urd-draft-template-${e}`), localStorage.removeItem(`urd-draft-mal-${e}`), delete Ro[e]);
			Uo();
		}
		ze(), M(re, {
			snap: !0,
			...R(D).grid
		}, !0), Ue(), M(y, ""), Be(), R(D).pages.some((e) => e.id === R(_)) ? E?.sendPage(R(_), e) : xi(R(D).pages[0].id);
	}
	async function nm() {
		if (ri) {
			S(J("status.revertReloadBeforePublish"), "error");
			return;
		}
		if (R(ui)) {
			S(J("update.publishBlocked"), "error");
			return;
		}
		S(J("status.publishing"));
		let e = [], t = [], n = [], r = [];
		for (let i of R(D).pages) {
			let a = `urd-draft-${i.id}`, o = Ve.has(i.id) || !R(g).pages.some((e) => e.id === i.id), s = null;
			if (i.id === R(_) && (T.hasDraft() || o)) s = T.data;
			else if (i.id !== R(_)) {
				let e = localStorage.getItem(a);
				if (e) try {
					s = Ao(JSON.parse(e), Re.data);
				} catch {}
			}
			if (!s && o && (s = yi(i)), !s) continue;
			let c = JSON.parse(JSON.stringify(s));
			e.push(...Yp(c)), e.push({
				path: i.file,
				content: JSON.stringify(c, null, 2) + "\n",
				encoding: "utf-8"
			}), t.push(i.title), o ? r.push(i.id) : n.push(a);
		}
		if (Re.hasDraft()) {
			let r = JSON.parse(JSON.stringify(R(D)));
			e.push(...Xp(r)), e.push({
				path: "content/site.json",
				content: JSON.stringify(r, null, 2) + "\n",
				encoding: "utf-8"
			}), e.push({
				path: "content/theme.css",
				content: Xs(r.theme),
				encoding: "utf-8"
			}), n.push("urd-draft-site");
			let i = (e, t) => JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
			i(R(g).theme, R(D).theme) || t.push(J("publish.part.theme")), i(R(g).nav, R(D).nav) || t.push(J("publish.part.nav")), i(R(g).footer, R(D).footer) || t.push(J("publish.part.footer")), i(R(g).pages, R(D).pages) || t.push(J("publish.part.pages")), i(R(g).grid, R(D).grid) || t.push(J("publish.part.grid")), (R(g).site.icon ?? null) !== (R(D).site.icon ?? null) && t.push(J("publish.part.icon"));
			let { icon: a, ...o } = R(g).site, { icon: s, ...c } = R(D).site;
			i(o, c) || t.push(J("publish.part.siteInfo"));
		}
		let i = Object.entries(To).filter(([, e]) => e.hasDraft());
		if (i.length || wo?.hasDraft()) {
			for (let [t, r] of i) {
				let i = JSON.parse(JSON.stringify(r.data));
				for (let t of i.entries) Gp(t, e);
				e.push({
					path: `content/samlinger/${t}.json`,
					content: JSON.stringify(i, null, 2) + "\n",
					encoding: "utf-8"
				}), ys.includes(i.kind) && e.push({
					path: `content/samlinger/${t}.xml`,
					content: bs({
						title: i.name ?? t,
						origin: location.origin,
						path: `/content/samlinger/${t}.xml`,
						items: i.entries.map((e) => ({
							id: e.id,
							title: es(e.title),
							text: es(e.text),
							date: e.date,
							href: e.href
						}))
					}),
					encoding: "utf-8"
				}), n.push(`urd-draft-samling-${t}`);
			}
			if (wo?.hasDraft()) {
				e.push({
					path: "content/collections.json",
					content: JSON.stringify(wo.data, null, 2) + "\n",
					encoding: "utf-8"
				}), n.push("urd-draft-collections", "urd-draft-samlinger");
				let t = { samlinger: [] };
				try {
					t = await (await fetch("/content/collections.json")).json();
				} catch {}
				let r = new Set(e.map((e) => e.path));
				for (let n of t.samlinger ?? []) {
					let t = `content/samlinger/${n}.json`;
					!R(Oo).includes(n) && !r.has(t) && e.push({
						path: t,
						delete: !0
					});
				}
			}
			t.push(J("publish.part.collections"));
		}
		let a = Object.entries(Ro).filter(([, e]) => e.hasDraft());
		if (a.length || Z?.hasDraft()) {
			for (let [t, r] of a) {
				let i = JSON.parse(JSON.stringify(r.data));
				i.section && Jp(i.section, e);
				for (let t of i.blocks ?? []) qp(t, e);
				for (let t of i.page?.sections ?? []) Jp(t, e);
				e.push({
					path: `content/maler/${t}.json`,
					content: JSON.stringify(i, null, 2) + "\n",
					encoding: "utf-8"
				}), n.push(`urd-draft-mal-${t}`);
			}
			if (Z?.hasDraft()) {
				e.push({
					path: "content/maler.json",
					content: JSON.stringify(Z.data, null, 2) + "\n",
					encoding: "utf-8"
				}), n.push("urd-draft-templates", "urd-draft-maler");
				let t = { maler: [] };
				try {
					t = await (await fetch("/content/maler.json")).json();
				} catch {}
				let r = new Set(e.map((e) => e.path));
				for (let n of t.maler ?? []) {
					let t = `content/maler/${n}.json`;
					!R(Vo).includes(n) && !r.has(t) && e.push({
						path: t,
						delete: !0
					});
				}
			}
			t.push(J("publish.part.templates"));
		}
		Q?.hasDraft() && (e.push({
			path: "plugins/plugins.json",
			content: JSON.stringify(Q.data, null, 2) + "\n",
			encoding: "utf-8"
		}), n.push("urd-draft-plugins"), t.push(J("publish.part.plugins")));
		try {
			let t = await (await fetch("/index.html")).text();
			for (let n of R(D).pages) n.path !== "/" && e.push({
				path: `${n.path.slice(1)}/index.html`,
				content: t,
				encoding: "utf-8"
			});
		} catch {}
		e.push({
			path: "sitemap.xml",
			content: _s(R(D).pages, location.origin),
			encoding: "utf-8"
		}), e.push({
			path: "robots.txt",
			content: vs(location.origin),
			encoding: "utf-8"
		});
		let o = new Set(e.map((e) => e.path)), s = (t) => {
			o.has(t) || e.push({
				path: t,
				delete: !0
			});
		};
		for (let e of R(g).pages) {
			let t = R(D).pages.find((t) => t.id === e.id);
			t ? t.path !== e.path && e.path !== "/" && s(`${e.path.slice(1)}/index.html`) : (s(e.file), e.path !== "/" && s(`${e.path.slice(1)}/index.html`));
		}
		let c = await Xr(e);
		if (!c.ok) {
			S(J("status.publishAborted"), "error");
			return;
		}
		let l = {
			message: J("publish.commitMessage", { titles: t.join(", ") || J("publish.theSite") }),
			files: e,
			...c.head ? { expect: c.head } : {}
		}, u = null;
		try {
			u = await fetch("/api/github/commit", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(l)
			});
		} catch {}
		if (u?.ok) {
			let { sha: t } = await u.json().catch(() => ({}));
			t ? Jr = t : Yr(), Yp(T.data), Xp(R(D));
			for (let e of n) localStorage.removeItem(e);
			for (let e of r) Ve.add(e);
			if (M(g, JSON.parse(JSON.stringify(R(D))), !0), Re = ea("urd-draft-site", () => R(g), C), ze(), Q) {
				let e = JSON.parse(JSON.stringify(Q.data));
				Q = ea("urd-draft-plugins", () => e, C), Ls();
			}
			if (wo) {
				for (let e of Object.values(To)) for (let t of e.data.entries) Gp(t, []);
				let e = JSON.parse(JSON.stringify(wo.data));
				wo = ea("urd-draft-collections", () => e, C, "urd-draft-samlinger"), Eo = {};
				for (let e of R(Oo)) {
					if (!To[e]) continue;
					let t = JSON.parse(JSON.stringify(To[e].data));
					Eo[e] = t, To[e] = ea(`urd-draft-collection-${e}`, () => t, C, `urd-draft-samling-${e}`);
				}
				Xo();
			}
			if (Z) {
				for (let e of Object.values(Ro)) {
					e.data?.section && Jp(e.data.section, []);
					for (let t of e.data?.blocks ?? []) qp(t, []);
					for (let t of e.data?.page?.sections ?? []) Jp(t, []);
				}
				let e = JSON.parse(JSON.stringify(Z.data));
				Z = ea("urd-draft-templates", () => e, C, "urd-draft-maler"), zo = {};
				for (let e of R(Vo)) {
					if (!Ro[e]) continue;
					let t = JSON.parse(JSON.stringify(Ro[e].data));
					zo[e] = t, Ro[e] = ea(`urd-draft-template-${e}`, () => t, C, `urd-draft-mal-${e}`);
				}
				Uo();
			}
			M(re, {
				snap: !0,
				...R(D).grid
			}, !0);
			let i = JSON.parse(JSON.stringify(T.data));
			T = ea(`urd-draft-${R(_)}`, () => i, C), Ve.has(R(_)) && ee(`urd-draft-${R(_)}`, JSON.stringify(i)), Ue(), S(J("status.published"), "info"), si(e);
		} else if (u?.status === 401) {
			let e = await u.json().catch(() => null);
			S(e?.code === "loginExpired" ? J("status.loginExpired") : J("status.loginRequired", { reason: Ki(e) ?? J("status.unknownReason") }), "error"), await Kr();
		} else u?.status === 403 ? S(Ki(await u.json().catch(() => null)) ?? J("status.noPublishAccess"), "error") : u?.status === 409 ? S(J("status.publishRace"), "error") : S(u ? Ki(await u.json().catch(() => null)) ?? J("status.publishFailed") : J("status.publishUnavailable"), "error");
	}
	ot();
	var rm = zf();
	Er("keydown", rn, at), Er("pointerdown", rn, it);
	var im = P(rm), am = N(im), om = (e) => {
		var t = ku(), n = N(t);
		W(n, () => c.pencil);
		var r = I(n);
		w(t), L((e, n) => {
			q(t, "title", e), H(r, ` ${n ?? ""}`);
		}, [() => J("tip.backToEdit"), () => J("ui.edit")]), z("click", t, up), V(e, t);
	};
	U(am, (e) => {
		R(ie) || e(om);
	});
	var sm = I(am, 2);
	let cm;
	var lm = N(sm), um = N(lm), dm = (e) => {
		var t = Wu(), n = P(t), r = F(n, !0), i = I(n, 2);
		{
			let e = (e) => {
				var t = ju(), n = P(t), r = N(n);
				let i;
				var a = F(r, !0), o = I(r, 2);
				let s;
				var c = F(o, !0);
				w(n);
				var l = I(n, 2), u = (e) => {
					var t = Au(), n = N(t), r = F(n, !0), i = I(n, 2);
					G(i);
					var a = I(i, 2), o = F(a, !0), s = I(a, 2);
					G(s), w(t), L((e, t, n, a) => {
						H(r, e), q(i, "min", 640), q(i, "max", Za), q(i, "title", t), K(i, R(ce).width), H(o, n), q(s, "max", Qa), q(s, "title", a), K(s, R(ce).height || "");
					}, [
						() => J("lbl.screen.w"),
						() => J("tip.screen.width", {
							min: 640,
							max: Za
						}),
						() => J("lbl.screen.h"),
						() => J("tip.screen.height", {
							min: 480,
							max: Qa
						})
					]), z("change", i, (e) => {
						le({ width: Number(e.target.value) }), e.target.value = R(ce).width;
					}), z("change", s, (e) => {
						le({ height: Number(e.target.value) }), e.target.value = R(ce).height || "";
					}), V(e, t);
				};
				U(l, (e) => {
					R(ce).mode === "custom" && e(u);
				}), L((e, t, l) => {
					q(n, "title", e), i = vi(r, 1, "svelte-1n46o8q", null, i, { on: R(ce).mode === "own" }), H(a, t), s = vi(o, 1, "svelte-1n46o8q", null, s, { on: R(ce).mode === "custom" }), H(c, l);
				}, [
					() => J("tip.screen.mode"),
					() => J("lbl.screen.own"),
					() => J("lbl.screen.size")
				]), z("click", r, () => le({ mode: "own" })), z("click", o, () => le({ mode: "custom" })), V(e, t);
			};
			var a = N(i), o = (t) => {
				var n = Pu(), r = N(n);
				let i;
				var a = N(r);
				W(a, () => c[`device_${R(me)}`]), W(I(a), () => c.caret), w(r);
				var o = I(r, 2), s = (t) => {
					var n = Nu();
					Zr(n, 21, () => R(fe), (e) => e.id, (t, n) => {
						var r = Mu(), i = P(r);
						let a;
						var o = N(i);
						W(o, () => c[`device_${R(n).id}`]);
						var s = I(o);
						w(i);
						var l = I(i, 2), u = (t) => {
							e(t);
						};
						U(l, (e) => {
							R(n).id === "desktop" && R(me) === "desktop" && e(u);
						}), L((e, t) => {
							a = vi(i, 1, "ghost svelte-1n46o8q", null, a, { active: R(me) === R(n).id }), q(i, "title", e), H(s, ` ${t ?? ""}`);
						}, [() => pe(R(n)), () => J(`lbl.device.${R(n).id}`)]), z("click", i, () => {
							M(me, R(n).id, !0), M(Mi, null);
						}), V(t, r);
					}), w(n), V(t, n);
				};
				U(o, (e) => {
					R(Mi) === "device" && e(s);
				}), w(n), L((e) => {
					i = vi(r, 1, "ghost svelte-1n46o8q", null, i, { active: R(Mi) === "device" }), q(r, "title", e);
				}, [() => J("lbl.group.device")]), z("click", r, () => M(Mi, R(Mi) === "device" ? null : "device", !0)), V(t, n);
			}, s = (t) => {
				var n = Ru(), r = P(n), i = F(r, !0), a = I(r, 2);
				Zr(a, 21, () => R(fe), (e) => e.id, (t, n) => {
					var r = Ir(), i = P(r), a = (t) => {
						var r = Iu(), i = N(r);
						let a;
						W(i, () => c[`device_${R(n).id}`], !0), w(i);
						var o = I(i, 2), s = (t) => {
							var n = Fu(), r = N(n);
							e(r), w(n), V(t, n);
						};
						U(o, (e) => {
							R(Mi) === "screen" && e(s);
						}), w(r), L((e) => {
							a = vi(i, 1, "ghost svelte-1n46o8q", null, a, { active: R(me) === R(n).id }), q(i, "title", e);
						}, [() => pe(R(n))]), z("click", i, () => {
							R(me) === "desktop" ? M(Mi, R(Mi) === "screen" ? null : "screen", !0) : M(me, "desktop");
						}), V(t, r);
					}, o = (e) => {
						var t = Lu();
						let r;
						W(t, () => c[`device_${R(n).id}`], !0), w(t), L((e) => {
							r = vi(t, 1, "ghost svelte-1n46o8q", null, r, { active: R(me) === R(n).id }), q(t, "title", e);
						}, [() => pe(R(n))]), z("click", t, () => M(me, R(n).id, !0)), V(e, t);
					};
					U(i, (e) => {
						R(n).id === "desktop" ? e(a) : e(o, -1);
					}), V(t, r);
				}), w(a), L((e) => H(i, e), [() => J("lbl.group.device")]), V(t, n);
			};
			U(a, (e) => {
				Fi.device ? e(o) : e(s, -1);
			});
			var l = I(a, 2), u = (e) => {
				var t = Bu(), n = N(t);
				let r;
				var i = N(n), a = F(i);
				W(I(i), () => c.caret), w(n);
				var o = I(n, 2), s = (e) => {
					var t = zu(), n = N(t), r = N(n);
					W(r, () => c.minus, !0), w(r);
					var i = I(r, 2), a = F(i), o = I(i, 2);
					W(o, () => c.plus, !0), w(o), w(n);
					var s = I(n, 2);
					let l;
					var u = N(s);
					W(u, () => c.fit);
					var d = I(u);
					w(s), w(t), L((e, t, n, c, u, f) => {
						q(r, "title", e), q(i, "title", t), H(a, `${n ?? ""}%`), q(o, "title", c), l = vi(s, 1, "ghost svelte-1n46o8q", null, l, { active: R(be) === "fit" }), q(s, "title", u), H(d, ` ${f ?? ""}`);
					}, [
						() => J("tip.zoomOut"),
						() => J("tip.zoomCurrent"),
						() => Math.round(R(Te) * 100),
						() => J("tip.zoomIn"),
						() => J("tip.zoomFit"),
						() => J("lbl.zoom.fit")
					]), z("click", r, () => Ee(-1)), z("click", o, () => Ee(1)), z("click", s, () => M(be, "fit")), V(e, t);
				};
				U(o, (e) => {
					R(Mi) === "zoom" && e(s);
				}), w(t), L((e, t) => {
					r = vi(n, 1, "ghost svelte-1n46o8q", null, r, { active: R(Mi) === "zoom" }), q(n, "title", e), H(a, `${t ?? ""}%`);
				}, [() => J("lbl.group.zoom"), () => Math.round(R(Te) * 100)]), z("click", n, () => M(Mi, R(Mi) === "zoom" ? null : "zoom", !0)), V(e, t);
			}, d = (e) => {
				var t = Vu(), n = P(t), r = F(n, !0), i = I(n, 2), a = N(i);
				W(a, () => c.minus, !0), w(a);
				var o = I(a, 2), s = F(o), l = I(o, 2);
				W(l, () => c.plus, !0), w(l);
				var u = I(l, 2);
				let d;
				W(u, () => c.fit, !0), w(u), w(i), L((e, t, n, i, c, f) => {
					H(r, e), q(a, "title", t), q(o, "title", n), H(s, `${i ?? ""}%`), q(l, "title", c), d = vi(u, 1, "ghost svelte-1n46o8q", null, d, { active: R(be) === "fit" }), q(u, "title", f);
				}, [
					() => J("lbl.group.zoom"),
					() => J("tip.zoomOut"),
					() => J("tip.zoomCurrent"),
					() => Math.round(R(Te) * 100),
					() => J("tip.zoomIn"),
					() => J("tip.zoomFit")
				]), z("click", a, () => Ee(-1)), z("click", l, () => Ee(1)), z("click", u, () => M(be, "fit")), V(e, t);
			};
			U(l, (e) => {
				Fi.zoom ? e(u) : e(d, -1);
			});
			var f = I(l, 2), p = (e) => {
				var t = Pu(), n = N(t);
				let r;
				var i = N(n);
				W(i, () => c.gridToggle), W(I(i), () => c.caret), w(n);
				var a = I(n, 2), o = (e) => {
					var t = Hu(), n = N(t);
					let r;
					var i = N(n);
					W(i, () => c.gridToggle);
					var a = I(i);
					w(n);
					var o = I(n, 2);
					let s;
					var l = N(o);
					W(l, () => c.guides);
					var u = I(l);
					w(o), w(t), L((e, t, i, c) => {
						r = vi(n, 1, "ghost svelte-1n46o8q", null, r, { active: R(Li) }), q(n, "title", e), H(a, ` ${t ?? ""}`), s = vi(o, 1, "ghost svelte-1n46o8q", null, s, { active: R(wi) }), q(o, "title", i), H(u, ` ${c ?? ""}`);
					}, [
						() => J("tip.gridToggle"),
						() => J("lbl.view.grid"),
						() => J("tip.guides"),
						() => J("lbl.view.guides")
					]), z("click", n, Ri), z("click", o, Ii), V(e, t);
				};
				U(a, (e) => {
					R(Mi) === "view" && e(o);
				}), w(t), L((e) => {
					r = vi(n, 1, "ghost svelte-1n46o8q", null, r, { active: R(Mi) === "view" || R(Li) || R(wi) }), q(n, "title", e);
				}, [() => J("lbl.group.view")]), z("click", n, () => M(Mi, R(Mi) === "view" ? null : "view", !0)), V(e, t);
			}, m = (e) => {
				var t = Uu(), n = P(t), r = F(n, !0), i = I(n, 2), a = N(i);
				let o;
				W(a, () => c.gridToggle, !0), w(a);
				var s = I(a, 2);
				let l;
				W(s, () => c.guides, !0), w(s), w(i), L((e, t, n) => {
					H(r, e), o = vi(a, 1, "ghost svelte-1n46o8q", null, o, { active: R(Li) }), q(a, "title", t), l = vi(s, 1, "ghost svelte-1n46o8q", null, l, { active: R(wi) }), q(s, "title", n);
				}, [
					() => J("lbl.group.view"),
					() => J("tip.gridToggle"),
					() => J("tip.guides")
				]), z("click", a, Ri), z("click", s, Ii), V(e, t);
			};
			U(f, (e) => {
				Fi.view ? e(p) : e(m, -1);
			}), w(i), Ni(i, (e) => M(Pi, e), () => R(Pi));
		}
		L((e, t) => {
			q(n, "title", e), H(r, t);
		}, [() => J("tip.switchPage"), () => He()?.title ?? ""]), z("click", n, () => Mt("pages")), V(e, t);
	};
	U(um, (e) => {
		R(g) && e(dm);
	});
	var fm = I(um, 2), pm = (e) => {
		var t = Gu(), n = N(t);
		W(n, () => c.phone);
		var r = I(n, 2), i = F(r, !0), a = F(I(r, 2), !0);
		w(t), L((e, n) => {
			q(t, "title", e), H(i, n), H(a, R(Me));
		}, [() => J("tip.attention"), () => J(R(Me) === 1 ? "ui.attentionOne" : "ui.attentionMany", { n: R(Me) })]), z("click", t, Pe), V(e, t);
	};
	U(fm, (e) => {
		R(Me) > 0 && e(pm);
	}), w(lm);
	var mm = I(lm, 2), hm = N(mm), gm = (e) => {
		var t = qu(), n = N(t), r = F(N(n), !0);
		je(2), w(n);
		var i = I(n, 2), a = N(i);
		let o;
		var s = N(a);
		W(s, () => c.restore);
		var l = F(I(s), !0);
		w(a);
		var u = I(a, 2), d = (e) => {
			var t = Ku(), n = N(t);
			W(n, () => c.restore);
			var r = I(n);
			w(t), L((e, n) => {
				q(t, "title", e), H(r, ` ${n ?? ""}`);
			}, [() => J("tip.discardArmed"), () => J("ui.discardConfirm")]), z("click", t, em), V(e, t);
		};
		U(u, (e) => {
			R(Zp) && e(d);
		}), w(i), Ni(i, (e) => M(Qp, e), () => R(Qp)), w(t), L((e, t, i, s, c) => {
			q(n, "title", e), q(n, "aria-label", t), H(r, i), o = vi(a, 1, "discard-dot svelte-1n46o8q", null, o, { armed: R(Zp) }), q(a, "title", s), H(l, c);
		}, [
			() => J("ui.unpublished"),
			() => J("ui.unpublished"),
			() => J("ui.unpublished"),
			() => R(Zp) ? J("tip.discardArmed") : J("tip.discard"),
			() => J("ui.discard")
		]), z("click", a, $p), di(2, t, () => $i, () => ({
			x: 24,
			duration: Lt ? 0 : 150
		})), V(e, t);
	};
	U(hm, (e) => {
		R(v) && e(gm);
	}), w(mm);
	var _m = I(mm, 2), vm = N(_m), ym = (e) => {
		var t = Zu(), n = P(t), r = N(n), i = (e) => {
			var t = Ju(), n = P(t);
			W(n, () => c.eye);
			var r = F(I(n, 2), !0);
			L((e) => H(r, e), [() => J("ui.cleanView")]), V(e, t);
		}, a = (e) => {
			var t = Ju(), n = P(t);
			W(n, () => c.pencil);
			var r = F(I(n, 2), !0);
			L((e) => H(r, e), [() => J("ui.edit")]), V(e, t);
		};
		U(r, (e) => {
			R(ie) ? e(i) : e(a, -1);
		}), w(n);
		var o = I(n, 2), s = (e) => {
			var t = Yu(), n = N(t), r = (e) => {
				var t = Ir();
				W(P(t), () => c.warn), V(e, t);
			};
			U(n, (e) => {
				R(ne).allowed || e(r);
			});
			var i = I(n, 1, !0);
			w(t), L((e) => {
				q(t, "title", e), H(i, R(ne).login);
			}, [() => R(ne).allowed ? J("tip.hasPublishAccess") : J("tip.noPublishAccess")]), V(e, t);
		}, l = (e) => {
			var t = Xu(), n = F(t, !0);
			L((e) => H(n, e), [() => J("ui.loginGitHub")]), V(e, t);
		};
		U(o, (e) => {
			R(ne)?.loggedIn ? e(s) : R(ne) && e(l, 1);
		});
		var u = I(o, 2), d = N(u);
		W(d, () => c.external);
		var f = F(I(d, 2), !0);
		w(u);
		var p = I(u, 2), m = F(p, !0);
		L((e, t, r, i, a) => {
			q(n, "title", e), q(u, "href", t), q(u, "title", r), H(f, i), p.disabled = !R(v), H(m, a);
		}, [
			() => R(ie) ? J("tip.chromeHide") : J("tip.chromeShow"),
			() => He()?.path ?? "/",
			() => J("ui.viewSite"),
			() => J("ui.viewSite"),
			() => J("ui.publish")
		]), z("click", n, up), z("click", p, nm), V(e, t);
	};
	U(vm, (e) => {
		R(g) && e(ym);
	}), w(_m), w(sm);
	var bm = I(sm, 2), xm = (e) => {
		var t = Mf(), i = N(t), o = (e) => {
			var t = jf(), i = P(t), o = N(i);
			Zr(o, 17, () => xt, qr, (e, t, n) => {
				var r = $u(), i = P(r), a = F(i, !0);
				Zr(I(i, 2), 16, () => R(t), (e) => e, (e, t) => {
					var n = Qu();
					let r;
					var i = F(n, !0);
					L(() => {
						r = vi(n, 1, "svelte-1n46o8q", null, r, { active: R(bt) === t }), H(i, Ct[t]);
					}), z("click", n, () => Mt(t)), V(e, n);
				}), L((e) => H(a, e), [() => J(St[n])]), V(e, r);
			});
			var s = I(o, 2), u = I(N(s), 2);
			let p;
			W(u, () => c.gear, !0), w(u);
			var m = I(u, 2), g = (e) => {
				var t = ed(), n = N(t), r = F(n, !0), i = I(n, 2), a = N(i);
				Y(I(a), {
					get value() {
						return R(d);
					},
					get options() {
						return l;
					},
					onchange: (e) => M(d, e, !0)
				}), w(i);
				var o = I(i, 2), s = N(o), c = I(s);
				{
					let e = /* @__PURE__ */ O(() => [["auto", J("lang.auto")], ...Ot()]);
					Y(c, {
						get value() {
							return At;
						},
						get options() {
							return R(e);
						},
						onchange: jt
					});
				}
				w(o);
				var u = I(o, 2), f = N(u), p = I(f);
				{
					let e = /* @__PURE__ */ O(() => [["strip", J("settings.layoutPickerStrip")], ["menu", J("settings.layoutPickerMenu")]]);
					Y(p, {
						get value() {
							return R(Di);
						},
						get options() {
							return R(e);
						},
						onchange: Oi
					});
				}
				w(u), w(t), L((e, t, n, c, l, d, p) => {
					H(r, e), q(i, "title", t), H(a, `${n ?? ""} `), q(o, "title", c), H(s, `${l ?? ""} `), q(u, "title", d), H(f, `${p ?? ""} `);
				}, [
					() => J("settings.title"),
					() => J("topbar.adminTheme.title"),
					() => J("settings.theme"),
					() => J("topbar.language.title"),
					() => J("settings.language"),
					() => J("tip.settings.layoutPicker"),
					() => J("settings.layoutPicker")
				]), V(e, t);
			};
			U(m, (e) => {
				R(Ei) && e(g);
			}), w(s), Ni(s, (e) => M(Ai, e), () => R(Ai)), w(i);
			var v = I(i, 2), y = (e) => {
				var t = Af(), i = N(t), o = F(i, !0), s = I(i, 2), l = (e) => {
					var t = dd(), n = N(t);
					Zr(n, 17, () => R(D).pages, (e) => e.id, (e, t) => {
						var n = od();
						let r;
						var i = N(n);
						G(i);
						var a = I(i, 2), o = (e) => {
							var t = td();
							L((e) => q(t, "title", e), [() => J("tip.pages.homeLocked")]), V(e, t);
						}, s = (e) => {
							var n = nd();
							G(n), L((e, t) => {
								K(n, e), q(n, "title", t);
							}, [() => R(t).path.slice(1), () => J("tip.pages.slug")]), z("change", n, (e) => ua(R(t), e.target.value)), V(e, n);
						};
						U(a, (e) => {
							R(t).path === "/" ? e(o) : e(s, -1);
						});
						var l = I(a, 2), u = (e) => {
							var t = rd();
							W(t, () => c.warn, !0), w(t), L((e) => q(t, "title", e), [() => J("tip.pages.missingDescription")]), V(e, t);
						};
						U(l, (e) => {
							R(aa)[R(t).id] && e(u);
						});
						var d = I(l, 2), f = N(d);
						W(f, () => c.right, !0), w(f);
						var p = I(f, 2), m = N(p);
						W(m, () => c.kebab, !0), w(m);
						var h = I(m, 2), g = (e) => {
							var n = ad(), r = N(n), i = N(r);
							W(i, () => c.bookmark);
							var a = I(i);
							w(r);
							var o = I(r, 2), s = (e) => {
								var n = id(), r = N(n);
								W(r, () => c.cross);
								var i = I(r);
								w(n), L((e, t) => {
									q(n, "title", e), H(i, ` ${t ?? ""}`);
								}, [() => J("tip.pages.delete"), () => J("ui.deletePage")]), z("click", n, () => {
									M(Gi, null), da(R(t));
								}), V(e, n);
							};
							U(o, (e) => {
								R(t).path !== "/" && e(s);
							}), w(n), L((e) => H(a, ` ${e ?? ""}`), [() => J("ui.savePageTemplate")]), z("click", r, () => Zi(R(t))), V(e, n);
						};
						U(h, (e) => {
							R(Gi) === R(t).id && e(g);
						}), w(p), w(d), w(n), L((e, a, o) => {
							r = vi(n, 1, "page-row svelte-1n46o8q", null, r, { current: R(t).id === R(_) }), K(i, R(t).title), q(i, "title", e), q(f, "title", a), f.disabled = R(t).id === R(_), q(m, "title", o);
						}, [
							() => J("tip.pages.title"),
							() => J("tip.pages.open"),
							() => J("tip.pages.menu")
						]), z("change", i, (e) => Qi(R(t), e.target.value)), z("click", f, () => xi(R(t).id)), z("click", m, () => M(Gi, R(Gi) === R(t).id ? null : R(t).id, !0)), V(e, n);
					});
					var r = I(n, 2), i = N(r), a = F(i, !0), o = I(i, 2), s = N(o), l = N(s), u = I(l);
					ft(u), w(s);
					var d = I(s, 2), f = N(d), p = I(f);
					G(p), w(d);
					var m = I(d, 2), h = N(m), g = I(h);
					ft(g), w(m);
					var v = I(m, 2), y = N(v), b = I(y), x = (e) => {
						var t = sd();
						L((e) => {
							q(t, "src", R(ta).ogImage), q(t, "alt", e);
						}, [() => J("lbl.ogImage")]), V(e, t);
					};
					U(b, (e) => {
						R(ta).ogImage && e(x);
					}), w(v);
					var S = I(v, 2), C = N(S), ee = N(C), te = I(ee);
					w(C);
					var ne = I(C, 2), re = (e) => {
						var t = cl();
						W(t, () => c.cross, !0), w(t), L((e) => q(t, "title", e), [() => J("tip.seo.removeOgImage")]), z("click", t, () => ra("ogImage", "")), V(e, t);
					};
					U(ne, (e) => {
						R(ta).ogImage && e(re);
					}), w(S);
					var ie = I(S, 2), ae = N(ie);
					G(ae);
					var oe = I(ae);
					w(ie), w(o), w(r);
					var se = I(r, 4);
					G(se);
					var ce = I(se, 2), le = F(ce, !0), ue = I(ce, 2), de = F(ue, !0), fe = I(ue, 2), pe = N(fe);
					let me;
					var he = N(pe), ge = N(he);
					W(ge, () => zs({ sections: [] }), !0), w(ge);
					var _e = F(I(ge, 2), !0);
					w(he), w(pe), Zr(I(pe, 2), 17, () => Vs, (e) => e.id, (e, t) => {
						var n = cd();
						let r;
						var i = N(n), a = N(i);
						W(a, () => Ui[R(t).id], !0), w(a);
						var o = F(I(a, 2), !0);
						w(i), w(n), L((e, a) => {
							r = vi(n, 1, "page-template-card svelte-1n46o8q", null, r, { picked: R(Hi) === `preset:${R(t).id}` }), q(i, "title", e), H(o, a);
						}, [() => J("tip.pages.templatePick", { name: J(R(t).labelKey) }), () => J(R(t).labelKey)]), z("click", i, () => M(Hi, R(Hi) === `preset:${R(t).id}` ? null : `preset:${R(t).id}`, !0)), V(e, n);
					}), w(fe);
					var ve = I(fe, 2), ye = (e) => {
						var t = ud(), n = P(t), r = F(n, !0), i = I(n, 2);
						Zr(i, 20, () => R(Vo).filter((e) => Ro[e]?.data?.mal?.kind === "page"), (e) => e, (e, t) => {
							var n = ld();
							let r;
							var i = N(n), a = N(i);
							W(a, () => zs(Ro[t].data.page), !0), w(a);
							var o = F(I(a, 2), !0);
							w(i);
							var s = I(i, 2);
							W(s, () => c.cross, !0), w(s), w(n), L((e, a) => {
								r = vi(n, 1, "page-template-card svelte-1n46o8q", null, r, { picked: R(Hi) === t }), q(i, "title", e), H(o, Ro[t].data.mal.name), q(s, "title", a);
							}, [() => J("tip.pages.templatePick", { name: Ro[t].data.mal.name }), () => J("canvas.deleteTemplate")]), z("click", i, () => M(Hi, R(Hi) === t ? null : t, !0)), z("click", s, () => Jo({ id: t })), V(e, n);
						}), w(i), L((e) => {
							H(r, e), bi(i, R(Wi));
						}, [() => J("canvas.tabMyTemplates")]), V(e, t);
					}, be = /* @__PURE__ */ O(() => R(Vo).some((e) => Ro[e]?.data?.mal?.kind === "page"));
					U(ve, (e) => {
						R(be) && e(ye);
					}), w(t), L((e, t, n, r, i, o, c, _, b, x, S, te, ne, re, ue, ge, ve, ye, be, xe, Se, Ce) => {
						H(a, e), q(s, "title", t), H(l, `${n ?? ""} `), K(u, R(ta).description), q(d, "title", r), H(f, `${i ?? ""} `), K(p, R(ta).ogTitle), q(p, "placeholder", o), q(m, "title", c), H(h, `${_ ?? ""} `), K(g, R(ta).ogDescription), q(g, "placeholder", R(ta).description), q(v, "title", b), H(y, `${x ?? ""} `), q(C, "title", S), H(ee, `${te ?? ""} `), q(ie, "title", ne), Ti(ae, re), H(oe, ` ${ue ?? ""}`), q(se, "placeholder", ge), q(ce, "title", ve), ce.disabled = ye, H(le, be), H(de, xe), bi(fe, R(Wi)), me = vi(pe, 1, "page-template-card svelte-1n46o8q", null, me, { picked: R(Hi) === null }), q(he, "title", Se), H(_e, Ce);
					}, [
						() => J("ui.seoGroup", { page: R(D).pages.find((e) => e.id === R(_))?.title ?? "" }),
						() => J("tip.seo.description"),
						() => J("lbl.seoDescription"),
						() => J("tip.seo.ogTitle"),
						() => J("lbl.ogTitle"),
						() => R(D).pages.find((e) => e.id === R(_))?.title ?? "",
						() => J("tip.seo.ogDescription"),
						() => J("lbl.ogDescription"),
						() => J("tip.seo.ogImage"),
						() => J("lbl.ogImage"),
						() => J("tip.seo.ogImage"),
						() => R(ta).ogImage ? J("ui.changeImage") : J("ui.chooseImage"),
						() => J("tip.seo.hideFromSearch"),
						() => R(D).pages.find((e) => e.id === R(_))?.noindex === !0,
						() => J("lbl.hideFromSearch"),
						() => J("ph.newPageName"),
						() => J("hint.pages.autoMenu"),
						() => !R(Vi).trim(),
						() => J("ui.createPage"),
						() => J("canvas.tabPresets"),
						() => J("tip.pages.blankPick"),
						() => J("ui.blankPage")
					]), z("change", u, (e) => ra("description", e.target.value)), z("change", p, (e) => ra("ogTitle", e.target.value)), z("change", g, (e) => ra("ogDescription", e.target.value)), z("change", te, sa), z("change", ae, (e) => ia(e.target.checked)), z("keydown", se, (e) => e.key === "Enter" && Xi()), ki(se, () => R(Vi), (e) => M(Vi, e)), z("click", ce, Xi), z("click", he, () => M(Hi, null)), V(e, t);
				}, u = (e) => {
					var t = _d(), r = N(t), i = N(r), a = F(i, !0), o = I(i, 2), s = N(o), l = N(s), u = I(l);
					{
						let e = /* @__PURE__ */ O(() => R(D).nav.logo?.type ?? "text"), t = /* @__PURE__ */ O(() => [
							["text", J("blocks.text")],
							["image", J("blocks.image")],
							["both", J("opt.logo.both")]
						]);
						Y(u, {
							get value() {
								return R(e);
							},
							get options() {
								return R(t);
							},
							onchange: (e) => ma(e)
						});
					}
					w(s);
					var d = I(s, 2), f = (e) => {
						var t = fd(), n = P(t);
						G(n);
						var r = I(n, 2), i = N(r);
						{
							let e = /* @__PURE__ */ O(() => J("tip.nav.logoFont")), t = /* @__PURE__ */ O(() => R(D).nav.logo?.font ?? ""), n = /* @__PURE__ */ O(() => [["", J("common.inherit")], ...al.map(([e, t]) => [t, J(e)])]);
							Y(i, {
								get title() {
									return R(e);
								},
								get value() {
									return R(t);
								},
								get options() {
									return R(n);
								},
								onchange: (e) => pa({ font: e || void 0 })
							});
						}
						var a = I(i, 2);
						G(a);
						var o = I(a, 2);
						let s;
						var c = F(N(o), !0);
						w(o);
						var l = I(o, 2);
						let u;
						var d = F(N(l), !0);
						w(l), w(r), L((e, t, r, i, f, p, m) => {
							K(n, R(D).nav.logo?.value ?? ""), q(n, "placeholder", e), q(a, "title", t), K(a, R(D).nav.logo?.textSize ?? ""), s = vi(o, 1, "tbtn svelte-1n46o8q", null, s, { active: R(D).nav.logo?.bold !== !1 }), q(o, "title", r), H(c, i), u = vi(l, 1, "tbtn svelte-1n46o8q", null, u, { active: f }), q(l, "title", p), H(d, m);
						}, [
							() => J("ph.nav.logoName"),
							() => J("tip.nav.textSize"),
							() => J("format.bold"),
							() => J("format.boldLetter"),
							() => !!R(D).nav.logo?.italic,
							() => J("format.italic"),
							() => J("format.italicLetter")
						]), z("input", n, (e) => pa({ value: e.target.value })), z("change", a, (e) => pa({ textSize: e.target.value ? Number(e.target.value) : void 0 })), z("click", o, () => pa({ bold: R(D).nav.logo?.bold === !1 })), z("click", l, () => pa({ italic: !R(D).nav.logo?.italic })), V(e, t);
					};
					U(d, (e) => {
						(R(D).nav.logo?.type ?? "text") !== "image" && e(f);
					});
					var p = I(d, 2), m = (e) => {
						var t = pd(), n = N(t), r = N(n), i = I(r);
						w(n);
						var a = I(n, 2);
						G(a);
						var o = I(a, 2);
						G(o), w(t), L((e, t, i, s) => {
							q(n, "title", e), H(r, `${t ?? ""} `), q(a, "title", i), K(a, R(D).nav.logo?.size ?? 32), q(o, "title", s), K(o, R(D).nav.logo?.radius ?? 0);
						}, [
							() => J("tip.webpAuto"),
							() => (R(D).nav.logo?.type === "image" ? R(D).nav.logo?.value : R(D).nav.logo?.image) ? J("ui.changeImage") : J("ui.chooseImage"),
							() => J("tip.nav.logoHeight"),
							() => J("tip.nav.logoRadius")
						]), z("change", i, ha), z("change", a, (e) => pa({ size: Number(e.target.value) })), z("change", o, (e) => pa({ radius: Number(e.target.value) })), V(e, t);
					};
					U(p, (e) => {
						(R(D).nav.logo?.type ?? "text") !== "text" && e(m);
					});
					var h = I(p, 2), g = (e) => {
						var t = El(), n = N(t), r = I(n);
						{
							let e = /* @__PURE__ */ O(() => R(D).nav.logo?.order ?? "image-first"), t = /* @__PURE__ */ O(() => [["image-first", J("opt.logo.imageFirst")], ["text-first", J("opt.logo.textFirst")]]);
							Y(r, {
								get value() {
									return R(e);
								},
								get options() {
									return R(t);
								},
								onchange: (e) => pa({ order: e })
							});
						}
						w(t), L((e) => H(n, `${e ?? ""} `), [() => J("lbl.order")]), V(e, t);
					};
					U(h, (e) => {
						R(D).nav.logo?.type === "both" && e(g);
					}), w(o), w(r);
					var _ = I(r, 2), v = N(_), y = F(v, !0), b = I(v, 2), x = N(b), S = N(x), C = I(S);
					{
						let e = /* @__PURE__ */ O(() => R(D).nav.variant ?? "bar"), t = /* @__PURE__ */ O(() => [
							["bar", J("opt.navVariant.bar")],
							["floating", J("opt.navVariant.floating")],
							["floating-square", J("opt.navVariant.floatingSquare")],
							["floating-tab", J("opt.navVariant.floatingTab")],
							["side-left", J("opt.navVariant.sideLeft")],
							["side-right", J("opt.navVariant.sideRight")]
						]);
						Y(C, {
							get value() {
								return R(e);
							},
							get options() {
								return R(t);
							},
							onchange: (e) => bo(e)
						});
					}
					w(x);
					var ee = I(x, 2), te = (e) => {
						var t = md(), n = P(t), r = N(n);
						G(r);
						var i = I(r);
						w(n);
						var a = I(n, 2), o = N(a);
						G(o);
						var s = I(o);
						w(a), L((e, t, c, l) => {
							q(n, "title", e), Ti(r, R(D).nav.style?.glow === !0), H(i, ` ${t ?? ""}`), q(a, "title", c), Ti(o, R(D).nav.style?.topGap !== !1), H(s, ` ${l ?? ""}`);
						}, [
							() => J("tip.nav.glow"),
							() => J("lbl.navGlow"),
							() => J("tip.nav.topGap"),
							() => J("lbl.navTopGap")
						]), z("change", r, (e) => xo(e.target.checked)), z("change", o, (e) => So(e.target.checked)), V(e, t);
					};
					U(ee, (e) => {
						R(go) && e(te);
					});
					var ne = I(ee, 2), re = (e) => {
						var t = Ll(), n = N(t);
						G(n);
						var r = I(n);
						w(t), L((e, i) => {
							q(t, "title", e), Ti(n, R(D).nav.overlay === !0), H(r, ` ${i ?? ""}`);
						}, [() => J("tip.nav.overlay"), () => J("lbl.navOverlay")]), z("change", n, (e) => Bi("nav", () => {
							e.target.checked ? R(D).nav.overlay = !0 : delete R(D).nav.overlay;
						})), V(e, t);
					};
					U(ne, (e) => {
						!R(go) && !R(ho) && e(re);
					});
					var ie = I(ne, 2), ae = (e) => {
						var t = El(), n = N(t), r = I(n);
						{
							let e = /* @__PURE__ */ O(() => R(D).nav.style?.sideAlign ?? "left"), t = /* @__PURE__ */ O(() => [
								["left", J("common.left")],
								["center", J("common.center")],
								["right", J("common.right")]
							]);
							Y(r, {
								get value() {
									return R(e);
								},
								get options() {
									return R(t);
								},
								onchange: (e) => mo("sideAlign", e === "left" ? void 0 : e)
							});
						}
						w(t), L((e, r) => {
							q(t, "title", e), H(n, `${r ?? ""} `);
						}, [() => J("tip.nav.sideAlign"), () => J("lbl.textAlign")]), V(e, t);
					};
					U(ie, (e) => {
						R(ho) && e(ae);
					});
					var oe = I(ie, 2), se = N(oe);
					G(se);
					var ce = I(se);
					w(oe);
					var le = I(oe, 2), ue = N(le), de = I(ue);
					{
						let e = /* @__PURE__ */ O(() => R(D).nav.style?.size ?? "md"), t = /* @__PURE__ */ O(() => [
							["sm", J("opt.size.sm")],
							["md", J("opt.size.md")],
							["lg", J("opt.size.lg")],
							["xl", J("opt.size.xl")]
						]);
						Y(de, {
							get value() {
								return R(e);
							},
							get options() {
								return R(t);
							},
							onchange: (e) => mo("size", e === "md" ? void 0 : e)
						});
					}
					w(le);
					var fe = I(le, 2), pe = N(fe), me = I(pe), he = (e) => {
						{
							let t = /* @__PURE__ */ O(() => R(D).nav.style?.sidePlacement ?? "top"), n = /* @__PURE__ */ O(() => [
								["top", J("opt.place.top")],
								["middle", J("opt.place.middle")],
								["bottom", J("opt.place.bottom")]
							]);
							Y(e, {
								get value() {
									return R(t);
								},
								get options() {
									return R(n);
								},
								onchange: (e) => mo("sidePlacement", e === "top" ? void 0 : e)
							});
						}
					}, ge = (e) => {
						{
							let t = /* @__PURE__ */ O(() => R(D).nav.layout ?? "right"), n = /* @__PURE__ */ O(() => [
								["right", J("common.right")],
								["center", J("common.center")],
								["left", J("opt.layout.leftAfterLogo")]
							]);
							Y(e, {
								get value() {
									return R(t);
								},
								get options() {
									return R(n);
								},
								onchange: (e) => eo(e)
							});
						}
					};
					U(me, (e) => {
						R(ho) ? e(he) : e(ge, -1);
					}), w(fe);
					var _e = I(fe, 2), ve = (e) => {
						var t = hd(), n = P(t), r = N(n);
						G(r);
						var i = I(r);
						w(n);
						var a = I(n, 2), o = (e) => {
							var t = El(), n = N(t), r = I(n);
							{
								let e = /* @__PURE__ */ O(() => R(D).nav.scroll ?? "none"), t = /* @__PURE__ */ O(() => [
									["none", J("opt.scroll.none")],
									["shrink", J("opt.scroll.shrink")],
									["hide", J("opt.scroll.hide")]
								]);
								Y(r, {
									get value() {
										return R(e);
									},
									get options() {
										return R(t);
									},
									onchange: (e) => Bi("nav", () => {
										e === "none" ? delete R(D).nav.scroll : R(D).nav.scroll = e;
									})
								});
							}
							w(t), L((e, r) => {
								q(t, "title", e), H(n, `${r ?? ""} `);
							}, [() => J("tip.nav.scroll"), () => J("lbl.navScroll")]), V(e, t);
						};
						U(a, (e) => {
							R(D).nav.sticky !== !1 && e(o);
						}), L((e, t) => {
							q(n, "title", e), Ti(r, R(D).nav.sticky !== !1), H(i, ` ${t ?? ""}`);
						}, [() => J("tip.nav.sticky"), () => J("lbl.navSticky")]), z("change", r, (e) => Bi("nav", () => {
							R(D).nav.sticky = e.target.checked;
						})), V(e, t);
					};
					U(_e, (e) => {
						R(ho) || e(ve);
					});
					var ye = I(_e, 2), be = N(ye);
					G(be);
					var xe = I(be);
					w(ye);
					var Se = I(ye, 2), Ce = (e) => {
						var t = El(), n = N(t), r = I(n);
						{
							let e = /* @__PURE__ */ O(() => R(D).nav.cart?.href ?? ""), t = /* @__PURE__ */ O(() => [["", J("common.none")], ...R(D).pages.map((e) => [e.path, e.title])]);
							Y(r, {
								get value() {
									return R(e);
								},
								get options() {
									return R(t);
								},
								onchange: (e) => Bi("nav", () => {
									e ? R(D).nav.cart.href = e : delete R(D).nav.cart.href;
								})
							});
						}
						w(t), L((e, r) => {
							q(t, "title", e), H(n, `${r ?? ""} `);
						}, [() => J("tip.cart.checkout"), () => J("lbl.checkoutPage")]), V(e, t);
					};
					U(Se, (e) => {
						R(D).nav.cart?.show && e(Ce);
					});
					var we = I(Se, 2), Te = N(we), Ee = I(Te);
					{
						let e = /* @__PURE__ */ O(() => R(D).nav.style?.hover ?? "standard"), t = /* @__PURE__ */ O(() => [
							["standard", J("opt.hover.standard")],
							["underline", J("opt.hover.underline")],
							["pill", J("opt.hover.pill")],
							["lift-plain", J("opt.hover.liftPlain")],
							["lift", J("opt.hover.lift")]
						]);
						Y(Ee, {
							get value() {
								return R(e);
							},
							get options() {
								return R(t);
							},
							onchange: (e) => Co(e)
						});
					}
					w(we);
					var De = I(we, 2), Oe = (e) => {
						var t = bl(), n = P(t), r = N(n), i = F(I(r));
						w(n);
						var a = I(n, 2);
						G(a), L((e, t, o) => {
							q(n, "title", e), H(r, `${t ?? ""} `), H(i, `${o ?? ""}%`), K(a, R(D).nav.style?.hoverGlow ?? .6);
						}, [
							() => J("tip.nav.hoverGlow"),
							() => J("lbl.glowStrength"),
							() => Math.round((R(D).nav.style?.hoverGlow ?? .6) * 100)
						]), z("input", a, (e) => mo("hoverGlow", Number(e.target.value))), V(e, t);
					};
					U(De, (e) => {
						R(D).nav.style?.hover === "lift" && e(Oe);
					});
					var ke = I(De, 2), Ae = (e) => {
						var t = El(), n = N(t), r = I(n);
						{
							let e = /* @__PURE__ */ O(() => R(D).nav.style?.hoverColor ?? "accent"), t = /* @__PURE__ */ O(yr);
							fa(r, {
								get value() {
									return R(e);
								},
								get tokens() {
									return R(t);
								},
								get label() {
									return R(yo)[1];
								},
								onchange: (e) => mo("hoverColor", e)
							});
						}
						w(t), L(() => {
							q(t, "title", R(yo)[1]), H(n, `${R(yo)[0] ?? ""} `);
						}), V(e, t);
					};
					U(ke, (e) => {
						R(yo) && e(Ae);
					});
					var je = I(ke, 2), Me = N(je), Ne = I(Me);
					{
						let e = /* @__PURE__ */ O(() => R(D).nav.style?.hoverTextColor ?? "accent"), t = /* @__PURE__ */ O(yr), n = /* @__PURE__ */ O(() => J("tip.nav.hoverTextColorPick"));
						fa(Ne, {
							get value() {
								return R(e);
							},
							get tokens() {
								return R(t);
							},
							get label() {
								return R(n);
							},
							onchange: (e) => mo("hoverTextColor", e)
						});
					}
					w(je);
					var Pe = I(je, 2), Fe = N(Pe), Ie = I(Fe);
					{
						let e = /* @__PURE__ */ O(() => R(D).nav.style?.textColor ?? "text"), t = /* @__PURE__ */ O(yr), n = /* @__PURE__ */ O(() => J("tip.nav.textColorPick"));
						fa(Ie, {
							get value() {
								return R(e);
							},
							get tokens() {
								return R(t);
							},
							get label() {
								return R(n);
							},
							onchange: (e) => mo("textColor", e)
						});
					}
					w(Pe);
					var Le = I(Pe, 4), T = F(Le, !0), Re = I(Le, 2);
					n(Re, () => mr, () => R(D).nav?.style?.background?.layers ?? []), w(b), w(_);
					var E = I(_, 2), ze = N(E), Be = F(ze, !0), Ve = I(ze, 2), He = N(Ve), Ue = N(He), We = I(Ue);
					{
						let e = /* @__PURE__ */ O(() => R(D).nav.style?.subStyle ?? "card"), t = /* @__PURE__ */ O(() => R(ho) ? [
							["card", J("common.standard")],
							["pills", J("opt.sub.pills")],
							["lines", J("opt.sub.lines")]
						] : [
							["card", J("opt.sub.card")],
							["flat", J("opt.sub.flat")],
							["pills", J("opt.sub.pills")],
							["lines", J("opt.sub.lines")],
							["flyout", J("opt.sub.flyout")]
						]);
						Y(We, {
							get value() {
								return R(e);
							},
							get options() {
								return R(t);
							},
							onchange: (e) => mo("subStyle", e === "card" ? void 0 : e)
						});
					}
					w(He);
					var Ge = I(He, 2), Ke = (e) => {
						var t = El(), n = N(t), r = I(n);
						{
							let e = /* @__PURE__ */ O(() => R(D).nav.style?.subPillColor ?? "surface"), t = /* @__PURE__ */ O(yr), n = /* @__PURE__ */ O(() => J("tip.nav.subPillColorPick"));
							fa(r, {
								get value() {
									return R(e);
								},
								get tokens() {
									return R(t);
								},
								get label() {
									return R(n);
								},
								onchange: (e) => mo("subPillColor", e)
							});
						}
						w(t), L((e, r) => {
							q(t, "title", e), H(n, `${r ?? ""} `);
						}, [() => J("tip.nav.subPillColor"), () => J("lbl.subPillColor")]), V(e, t);
					};
					U(Ge, (e) => {
						R(D).nav.style?.subStyle === "pills" && e(Ke);
					});
					var qe = I(Ge, 2), Je = N(qe), Ye = I(Je);
					G(Ye), w(qe), w(Ve), w(E);
					var Xe = I(E, 2), Ze = N(Xe), Qe = F(Ze, !0), $e = I(Ze, 2), et = N($e);
					Zr(et, 17, () => R(D).nav.items, qr, (e, t, n) => {
						var r = gd(), i = P(r), a = N(i);
						G(a);
						var o = I(a, 2), s = N(o);
						W(s, () => c.plus, !0), w(s);
						var l = I(s, 2);
						l.disabled = n === 0, W(l, () => c.up, !0), w(l);
						var u = I(l, 2);
						W(u, () => c.down, !0), w(u);
						var d = I(u, 2);
						W(d, () => c.cross, !0), w(d), w(o);
						var f = I(o, 2), p = N(f);
						{
							let e = /* @__PURE__ */ O(() => R(t).page ?? (R(t).href == null ? "__none" : "__href")), r = /* @__PURE__ */ O(() => J("tip.linkTarget")), i = /* @__PURE__ */ O(() => [
								...R(D).pages.map((e) => [e.id, e.title]),
								["__href", J("opt.linkHref")],
								...R(t).children ? [["__none", J("opt.noLink")]] : []
							]);
							Y(p, {
								get value() {
									return R(e);
								},
								get title() {
									return R(r);
								},
								get options() {
									return R(i);
								},
								onchange: (e) => Qc(n, e)
							});
						}
						w(f);
						var m = I(f, 2), h = (e) => {
							var r = wl();
							G(r), L((e, n) => {
								K(r, R(t).href), q(r, "placeholder", e), q(r, "title", n);
							}, [() => J("ph.hrefAnchor"), () => J("tip.hrefAnchor")]), z("change", r, (e) => tl(n, e.target.value)), V(e, r);
						};
						U(m, (e) => {
							!R(t).page && R(t).href != null && e(h);
						}), w(i), Zr(I(i, 2), 17, () => R(t).children ?? [], qr, (e, r, i) => {
							var a = Tl(), o = N(a);
							G(o);
							var s = I(o, 2), l = N(s);
							l.disabled = i === 0, W(l, () => c.up, !0), w(l);
							var u = I(l, 2);
							W(u, () => c.down, !0), w(u);
							var d = I(u, 2);
							W(d, () => c.cross, !0), w(d), w(s);
							var f = I(s, 2), p = N(f);
							{
								let e = /* @__PURE__ */ O(() => R(r).page ?? "__href"), t = /* @__PURE__ */ O(() => J("tip.linkTarget")), a = /* @__PURE__ */ O(() => [...R(D).pages.map((e) => [e.id, e.title]), ["__href", J("opt.linkHref")]]);
								Y(p, {
									get value() {
										return R(e);
									},
									get title() {
										return R(t);
									},
									get options() {
										return R(a);
									},
									onchange: (e) => Uf(n, i, e)
								});
							}
							w(f);
							var m = I(f, 2), h = (e) => {
								var t = wl();
								G(t), L((e, n) => {
									K(t, R(r).href ?? ""), q(t, "placeholder", e), q(t, "title", n);
								}, [() => J("ph.hrefAnchor"), () => J("tip.hrefAnchor")]), z("change", t, (e) => Wf(n, i, e.target.value)), V(e, t);
							};
							U(m, (e) => {
								R(r).page || e(h);
							}), w(a), L((e, n) => {
								K(o, R(r).label), q(o, "title", e), u.disabled = i === R(t).children.length - 1, q(d, "title", n);
							}, [() => J("tip.nav.childLabel"), () => J("tip.nav.removeChild")]), z("input", o, (e) => Hf(n, i, e.target.value)), z("click", l, () => Gf(n, i, -1)), z("click", u, () => Gf(n, i, 1)), z("click", d, () => Kf(n, i)), V(e, a);
						}), L((e, r, i) => {
							K(a, R(t).label), q(a, "title", e), q(s, "title", r), u.disabled = n === R(D).nav.items.length - 1, q(d, "title", i);
						}, [
							() => J("tip.nav.itemLabel"),
							() => J("tip.nav.addChild"),
							() => J("tip.nav.removeItem")
						]), z("input", a, (e) => Zc(n, e.target.value)), z("click", s, () => Vf(n)), z("click", l, () => nl(n, -1)), z("click", u, () => nl(n, 1)), z("click", d, () => rl(n)), V(e, r);
					});
					var tt = I(et, 2), nt = F(tt, !0);
					w($e), w(Xe), w(t), L((e, t, n, r, o, s, c, u, d, f, p, m, h, g, _, v, b, C, ee, te, ne, re, ie, ae) => {
						q(i, "title", e), H(a, t), H(l, `${n ?? ""} `), H(y, r), q(x, "title", o), H(S, `${s ?? ""} `), q(oe, "title", c), Ti(se, R(D).nav.style?.blur !== !1), H(ce, ` ${u ?? ""}`), H(ue, `${d ?? ""} `), H(pe, `${f ?? ""} `), q(ye, "title", p), Ti(be, R(D).nav.cart?.show === !0), H(xe, ` ${m ?? ""}`), H(Te, `${h ?? ""} `), q(je, "title", g), H(Me, `${_ ?? ""} `), H(Fe, `${v ?? ""} `), H(T, b), H(Be, C), H(Ue, `${ee ?? ""} `), q(qe, "title", te), H(Je, `${ne ?? ""} `), K(Ye, R(D).nav.style?.subColumns ?? 1), q(Ze, "title", re), H(Qe, ie), H(nt, ae);
					}, [
						() => J("hint.nav.logoHome"),
						() => J("group.logo"),
						() => J("common.type"),
						() => J("group.appearance"),
						() => J("tip.nav.variant"),
						() => J("lbl.navVariant"),
						() => J("tip.nav.blur"),
						() => J("lbl.navBlur"),
						() => J("lbl.size"),
						() => J("lbl.navPlacement"),
						() => J("tip.nav.cart"),
						() => J("lbl.navCart"),
						() => J("lbl.navHover"),
						() => J("tip.nav.hoverTextColor"),
						() => J("lbl.hoverTextColor"),
						() => J("lbl.textColor"),
						() => J("lbl.background"),
						() => J("group.submenu"),
						() => J("lbl.design"),
						() => J("tip.nav.subColumns"),
						() => J("lbl.columns"),
						() => J("hint.nav.submenu"),
						() => J("group.menuItems"),
						() => J("ui.addMenuItem")
					]), z("change", se, (e) => mo("blur", e.target.checked)), z("change", be, (e) => Bi("nav", () => {
						e.target.checked ? R(D).nav.cart = {
							...R(D).nav.cart ?? {},
							show: !0
						} : delete R(D).nav.cart;
					})), z("change", Ye, (e) => mo("subColumns", Number(e.target.value) > 1 ? Number(e.target.value) : void 0)), z("click", tt, Bf), V(e, t);
				}, d = (e) => {
					var t = Sd(), n = N(t), r = N(n), i = I(r);
					G(i), w(n);
					var a = I(n, 2), o = N(a), s = I(o);
					G(s), w(a);
					var l = I(a, 2), u = N(l), d = I(u);
					{
						let e = /* @__PURE__ */ O(Ua), t = /* @__PURE__ */ O(Wa);
						Y(d, {
							get value() {
								return R(e);
							},
							get options() {
								return R(t);
							},
							onchange: (e) => qa(e)
						});
					}
					w(l);
					var f = I(l, 4), p = F(f, !0), m = I(f, 2), h = N(m);
					Zr(h, 17, () => R(za), (e) => e.screen, (e, t) => {
						var n = vd(), r = N(n), i = F(r, !0), a = I(r, 2);
						let o;
						var s = F(a), c = F(I(a, 2), !0);
						w(n), L(() => {
							H(i, R(t).screen), o = vi(a, 1, "cw-bar svelte-1n46o8q", null, o, { fluid: !R(t).bound }), bi(s, `width:${R(t).pct ?? ""}%`), H(c, R(t).bound ? `${R(t).margin}` : "-");
						}), V(e, n);
					});
					var g = I(h, 2), _ = N(g), v = F(_, !0), y = F(I(_, 2), !0);
					w(g);
					var b = I(g, 2), x = (e) => {
						var t = yd(), n = F(t, !0);
						L((e) => H(n, e), [() => J("lbl.bindsFrom", { n: R(Se) })]), V(e, t);
					};
					U(b, (e) => {
						R(Aa) !== "full" && e(x);
					}), w(m);
					var S = I(m, 2);
					Zr(S, 21, () => oo, (e) => e.id, (e, t) => {
						var n = Qu();
						let r;
						var i = F(n, !0);
						L((e) => {
							r = vi(n, 1, "svelte-1n46o8q", null, r, { on: R(Ma) === R(t).id }), H(i, e);
						}, [() => J(`lbl.width.${R(t).id}`)]), z("click", n, () => Va(R(t).width)), V(e, n);
					}), w(S);
					var C = I(S, 2), ee = (e) => {
						var t = bd(), n = N(t), r = F(n, !0), i = I(n, 2);
						G(i);
						var a = F(I(i, 2));
						w(t), L((e, n) => {
							q(t, "title", e), H(r, n), q(i, "min", 960), q(i, "max", io), q(i, "step", 20), K(i, R(Ra)), H(a, `${R(Ra) ?? ""} px`);
						}, [() => J("tip.site.contentWidthFree"), () => J("lbl.widthFree")]), z("input", i, (e) => Va(e.target.valueAsNumber)), V(e, t);
					};
					U(C, (e) => {
						R(Aa) !== "full" && e(ee);
					});
					var te = I(C, 2), ne = F(te, !0), re = I(te, 2);
					Zr(re, 21, () => ao, (e) => e.id, (e, t) => {
						var n = Qu();
						let r;
						var i = F(n, !0);
						L((e) => {
							r = vi(n, 1, "svelte-1n46o8q", null, r, { on: R(Ia) === R(t).id }), H(i, e);
						}, [() => J(`lbl.gutter.${R(t).id}`)]), z("click", n, () => Ha(R(t).gutter)), V(e, n);
					}), w(re);
					var ie = I(re, 2), ae = N(ie), oe = F(ae, !0), se = I(ae, 2), ce = N(se), le = N(ce), ue = F(le, !0), de = I(le, 2);
					G(de);
					var fe = F(I(de, 2));
					w(ce), w(se), w(ie);
					var pe = I(ie, 4), me = N(pe), he = I(me), ge = (e) => {
						var t = sd();
						L((e) => {
							q(t, "src", R(D).site.icon), q(t, "alt", e);
						}, [() => J("lbl.siteIcon")]), V(e, t);
					};
					U(he, (e) => {
						R(D).site.icon && e(ge);
					}), w(pe);
					var _e = I(pe, 2), ve = N(_e), ye = N(ve), be = I(ye);
					w(ve);
					var xe = I(ve, 2), Ce = (e) => {
						var t = xd(), n = P(t);
						W(n, () => c.pencil ?? "✎", !0), w(n);
						var r = I(n, 2);
						W(r, () => c.cross, !0), w(r), L((e, t) => {
							q(n, "title", e), q(r, "title", t);
						}, [() => J("tip.site.editIcon"), () => J("tip.site.removeIcon")]), z("click", n, () => M(va, R(D).site.icon, !0)), z("click", r, Da), V(e, t);
					};
					U(xe, (e) => {
						R(D).site.icon && e(Ce);
					}), w(_e), w(t), L((e, t, c, d, m, h, g, _, b, x, S, C, ee, re, ae, se, le, pe, he, ge) => {
						q(n, "title", e), H(r, `${t ?? ""} `), K(i, R(D).site.title ?? ""), q(i, "placeholder", c), q(a, "title", d), H(o, `${m ?? ""} `), K(s, R(D).site.description ?? ""), q(s, "placeholder", h), q(l, "title", g), H(u, `${_ ?? ""} `), q(f, "title", b), H(p, x), H(v, S), H(y, C), q(te, "title", ee), H(ne, re), ie.open = R(Ia) === null || R(La), H(oe, ae), q(ce, "title", se), H(ue, le), q(de, "min", 0), q(de, "max", 12), q(de, "step", 1), K(de, R(ja)), H(fe, `${R(ja) ?? ""} vw`), H(me, `${pe ?? ""} `), q(ve, "title", he), H(ye, `${ge ?? ""} `);
					}, [
						() => J("tip.site.name"),
						() => J("lbl.name"),
						() => J("ph.site.name"),
						() => J("tip.site.description"),
						() => J("lbl.description"),
						() => J("ph.site.description"),
						() => J("site.langTitle"),
						() => J("site.langLabel"),
						() => J("tip.site.contentWidth"),
						() => J("lbl.contentWidth"),
						() => J("lbl.screenPx"),
						() => J("lbl.marginPx"),
						() => J("tip.site.gutter"),
						() => J("lbl.gutter"),
						() => J("group.advanced"),
						() => J("tip.site.gutterVw"),
						() => J("lbl.gutterVw"),
						() => J("lbl.siteIcon"),
						() => J("tip.site.icon"),
						() => R(D).site.icon ? J("ui.changeIcon") : J("ui.chooseIcon")
					]), z("input", i, (e) => Oa(e.target.value)), z("input", s, (e) => ka(e.target.value)), Er("toggle", ie, (e) => M(La, e.currentTarget.open, !0)), z("input", de, (e) => Ha(e.target.valueAsNumber)), z("change", be, ya), V(e, t);
				}, p = (e) => {
					var t = Ad();
					{
						let e = (e, t = f, n = f) => {
							var r = wd(), i = N(r), a = (e) => {
								var t = Cd(), r = F(t, !0);
								L(() => H(r, n())), V(e, t);
							};
							U(i, (e) => {
								n() && e(a);
							});
							var o = I(i, 2), s = N(o), c = F(s, !0), l = I(s, 2), u = F(l, !0), d = I(l, 2), p = N(d), m = F(p, !0), h = F(I(p), !0);
							w(d), w(o), w(r), L((e, t, n, r, i, a, s, l, d) => {
								bi(o, `--tv-bg:${e ?? ""};--tv-surface:${t ?? ""};--tv-text:${n ?? ""};--tv-accent:${r ?? ""};--tv-accent-ink:${i ?? ""}`), H(c, a), H(u, s), H(m, l), H(h, d);
							}, [
								() => ap(t().bg, t()),
								() => ap(t().surface, t()),
								() => ap(t().text, t()),
								() => ap(t().accent, t()),
								() => ap(t()["accent-text"] ?? t().bg, t()),
								() => J("preview.heading"),
								() => J("preview.cardBody"),
								() => J("preview.button"),
								() => J("preview.link")
							]), V(e, r);
						};
						var n = N(t), r = F(n, !0), i = I(n, 2);
						Zr(i, 21, () => sp, (e) => e.id, (e, t) => {
							var n = Td();
							let r;
							var i = N(n), a = N(i), o = I(a), s = I(o), c = I(s);
							w(i);
							var l = F(I(i, 2), !0);
							w(n), L(() => {
								r = vi(n, 1, "theme-preset svelte-1n46o8q", null, r, { sel: R(lp) === R(t).id }), q(n, "title", `${R(t).name} - ${R(t).note}`), bi(a, `background:${R(t).light.bg ?? ""}`), bi(o, `background:${R(t).light.surface ?? ""}`), bi(s, `background:${R(t).light.accent ?? ""}`), bi(c, `background:${R(t).light.text ?? ""}`), H(l, R(t).name);
							}), z("click", n, () => cp(R(t))), V(e, n);
						}), w(i);
						var a = I(i, 2), o = F(a, !0), s = I(a, 2), c = N(s);
						G(c);
						var l = I(c);
						w(s);
						var u = I(s, 2), d = (e) => {
							var t = Ed(), n = N(t), r = F(n, !0), i = I(n, 2), a = N(i);
							let o;
							var s = F(a, !0), c = I(a, 2);
							let l;
							var u = F(c, !0);
							w(i), w(t), L((e, t, n, i) => {
								H(r, e), q(a, "title", t), o = vi(a, 1, "svelte-1n46o8q", null, o, { on: R(Sr) }), H(s, n), l = vi(c, 1, "svelte-1n46o8q", null, l, { on: !R(Sr) }), H(u, i);
							}, [
								() => J("lbl.darkColors"),
								() => J("hint.theme.autoDark"),
								() => J("opt.auto"),
								() => J("opt.custom")
							]), z("click", a, () => tp(!0)), z("click", c, () => tp(!1)), V(e, t);
						};
						U(u, (e) => {
							R(xr) && e(d);
						});
						var p = I(u, 2), m = N(p), g = (e) => {
							var t = Dd(), n = F(t, !0);
							L((e) => H(n, e), [() => J("lbl.light")]), V(e, t);
						};
						U(m, (e) => {
							R(xr) && e(g);
						});
						var _ = I(m, 2);
						let Ne;
						var v = F(_, !0);
						w(p);
						var y = I(p, 2);
						Zr(y, 21, () => br, ([e, t, n]) => e, (e, t) => {
							var n = /* @__PURE__ */ O(() => h(R(t), 3));
							let r = () => R(n)[0], i = () => R(n)[1], a = () => R(n)[2];
							var o = Od(), s = N(o);
							{
								let e = /* @__PURE__ */ O(() => R(D).theme.tokens.color[r()] ?? R(D).theme.tokens.color.bg), t = /* @__PURE__ */ O(yr);
								fa(s, {
									get value() {
										return R(e);
									},
									get tokens() {
										return R(t);
									},
									get label() {
										return i();
									},
									onchange: (e) => qf(r(), e)
								});
							}
							var c = I(s, 2), l = F(c, !0), u = F(I(c, 2), !0);
							w(o), L((e) => {
								H(l, a()), H(u, e);
							}, [() => ap(R(D).theme.tokens.color[r()] ?? R(D).theme.tokens.color.bg, R(Tr))]), V(e, o);
						}), w(y);
						var b = I(y, 2), x = (e) => {
							var t = kd(), n = P(t), r = N(n), i = F(r, !0), a = I(r, 2);
							let o;
							var s = F(a, !0);
							w(n);
							var c = I(n, 2);
							let l;
							Zr(c, 21, () => br, ([e, t, n]) => e, (e, t) => {
								var n = /* @__PURE__ */ O(() => h(R(t), 3));
								let r = () => R(n)[0], i = () => R(n)[1], a = () => R(n)[2];
								var o = Od(), s = N(o);
								{
									let e = /* @__PURE__ */ O(() => R(D).theme.alt.tokens.color[r()] ?? R(Dr)[r()] ?? R(D).theme.tokens.color.bg), t = /* @__PURE__ */ O(yr), n = /* @__PURE__ */ O(() => J("theme.darkColorLabel", { name: i() }));
									fa(s, {
										get value() {
											return R(e);
										},
										get tokens() {
											return R(t);
										},
										get label() {
											return R(n);
										},
										onchange: (e) => Qf(r(), e)
									});
								}
								var c = I(s, 2), l = F(c, !0), u = F(I(c, 2), !0);
								w(o), L((e) => {
									H(l, a()), H(u, e);
								}, [() => ap(R(D).theme.alt.tokens.color[r()] ?? R(Dr)[r()], R(Dr))]), V(e, o);
							}), w(c), L((e, t, n) => {
								H(i, e), o = vi(a, 1, "chip svelte-1n46o8q", null, o, { accent: R(Cr) === "dark" }), q(a, "title", t), H(s, n), l = vi(c, 1, "palcells svelte-1n46o8q", null, l, { autopal: R(Sr) });
							}, [
								() => J("lbl.dark"),
								() => J("tip.theme.darkDefault"),
								() => J("common.standard")
							]), z("click", a, () => $f("dark")), V(e, t);
						};
						U(b, (e) => {
							R(xr) && e(x);
						});
						var S = I(b, 2), C = N(S);
						{
							let t = /* @__PURE__ */ O(() => R(xr) ? J("lbl.light") : "");
							e(C, () => R(Tr), () => R(t));
						}
						var ee = I(C, 2), te = (t) => {
							{
								let n = /* @__PURE__ */ O(() => J("lbl.dark"));
								e(t, () => R(Dr), () => R(n));
							}
						};
						U(ee, (e) => {
							R(xr) && e(te);
						}), w(S);
						var ne = I(S, 2), re = N(ne), ie = F(re, !0), ae = I(re, 2), oe = N(ae), se = N(oe), ce = I(se);
						{
							let e = /* @__PURE__ */ O(() => np("heading"));
							Y(ce, {
								get value() {
									return R(D).theme.tokens.font.heading;
								},
								get options() {
									return R(e);
								},
								onchange: (e) => Jf("heading", e)
							});
						}
						w(oe);
						var le = I(oe, 2), ue = N(le), de = I(ue);
						{
							let e = /* @__PURE__ */ O(() => np("body"));
							Y(de, {
								get value() {
									return R(D).theme.tokens.font.body;
								},
								get options() {
									return R(e);
								},
								onchange: (e) => Jf("body", e)
							});
						}
						w(le);
						var fe = I(le, 2), pe = N(fe), me = F(pe, !0), he = I(pe, 2), ge = F(he, !0);
						w(fe), w(ae), w(ne);
						var _e = I(ne, 2), ve = N(_e), ye = F(ve, !0), be = I(ve, 2), xe = N(be), Se = N(xe), Ce = F(Se, !0), we = F(I(Se, 2), !0);
						w(xe);
						var Te = I(xe, 2), Ee = N(Te, !0), De = F(I(Ee), !0);
						w(Te);
						var Oe = I(Te, 2);
						G(Oe);
						var ke = I(Oe, 2), Ae = N(ke, !0), je = F(I(Ae), !0);
						w(ke);
						var Me = I(ke, 2);
						G(Me), w(be), w(_e), w(t), L((e, t, n, i, a, u, d, f, p, m, h, g, y, b, x, S, C, ee) => {
							H(r, e), H(o, t), q(s, "title", n), Ti(c, R(xr)), H(l, ` ${i ?? ""}`), Ne = vi(_, 1, "chip svelte-1n46o8q", null, Ne, { accent: R(Cr) === "light" }), q(_, "title", a), H(v, u), H(ie, d), H(se, `${f ?? ""} `), H(ue, `${p ?? ""} `), bi(pe, `font-family:${R(D).theme.tokens.font.heading ?? ""}`), H(me, m), bi(he, `font-family:${R(D).theme.tokens.font.body ?? ""}`), H(ge, h), H(ye, g), bi(xe, `--r-sm:${R(D).theme.tokens.radius.sm ?? ""};--r-md:${R(D).theme.tokens.radius.md ?? ""}`), H(Ce, y), H(we, b), H(Ee, x), H(De, R(D).theme.tokens.radius.sm), K(Oe, S), H(Ae, C), H(je, R(D).theme.tokens.radius.md), K(Me, ee);
						}, [
							() => J("lbl.themePresets"),
							() => J("lbl.colors"),
							() => J("tip.theme.dualMode"),
							() => J("lbl.dualMode"),
							() => J("tip.theme.defaultScheme"),
							() => J("common.standard"),
							() => J("group.typography"),
							() => J("lbl.headings"),
							() => J("lbl.bodyText"),
							() => J("preview.heading"),
							() => J("preview.bodySample"),
							() => J("group.shape"),
							() => J("preview.button"),
							() => J("preview.card"),
							() => J("lbl.smallCorners"),
							() => rp(R(D).theme.tokens.radius.sm),
							() => J("lbl.largeCorners"),
							() => rp(R(D).theme.tokens.radius.md)
						]), z("change", c, (e) => ep(e.target.checked)), z("click", _, () => $f("light")), z("input", Oe, (e) => ip("sm", Number(e.target.value))), z("input", Me, (e) => ip("md", Number(e.target.value)));
					}
					V(e, t);
				}, m = (e) => {
					var t = Fd();
					let n;
					var r = N(t);
					G(r);
					var i = I(r, 2), a = (e) => {
						var t = Ir();
						Zr(P(t), 17, () => Gs(Np(), R(Mp), (e) => e.label), (e) => e.label, (e, t) => {
							var n = Ir(), r = P(n), i = (e) => {
								var n = jd(), r = N(n), i = I(r);
								w(n), L((e) => {
									q(n, "title", e), H(r, `${R(t).label ?? ""} `);
								}, [() => J("tip.webpAuto")]), z("change", i, Ip), V(e, n);
							}, a = (e) => {
								var n = Md(), r = N(n), i = I(r);
								w(n), L((e) => {
									q(n, "title", e), H(r, `${R(t).label ?? ""} `);
								}, [() => J("tip.blocks.galleryImages")]), z("change", i, Bp), V(e, n);
							}, o = (e) => {
								var n = zl(), r = F(n, !0);
								L(() => H(r, R(t).label)), z("click", n, () => Pp(R(t))), V(e, n);
							};
							U(r, (e) => {
								R(t).act === "image" ? e(i) : R(t).act === "galleryImages" ? e(a, 1) : e(o, -1);
							}), V(e, n);
						}, (e) => {
							var t = kl(), n = F(t, !0);
							L((e) => H(n, e), [() => J("canvas.searchEmpty")]), V(e, t);
						}), V(e, t);
					}, o = /* @__PURE__ */ O(() => R(Mp).trim()), s = (e) => {
						var t = Pd(), n = P(t), r = N(n), i = F(r, !0), a = I(r, 2), o = N(a), s = F(o, !0), c = I(o, 2), l = F(c, !0);
						w(a), w(n);
						var u = I(n, 2), d = F(u, !0), f = I(u, 2), p = N(f), m = I(p);
						w(f);
						var h = I(f, 2), g = F(h, !0), _ = I(h, 2), v = F(_, !0), y = I(_, 2), b = F(y, !0), x = I(y, 2), S = F(x, !0), C = I(x, 2), ee = F(C, !0), te = I(C, 2), ne = F(te, !0), re = I(te, 2), ie = F(re, !0), ae = I(re, 2), oe = F(ae, !0), se = I(ae, 2), ce = F(se, !0), le = I(se, 2), ue = F(le, !0), de = I(le, 2), fe = F(de, !0), pe = I(de, 2), me = F(pe, !0), he = I(pe, 2), ge = F(he, !0), _e = I(he, 2), ve = F(_e, !0), ye = I(_e, 2), be = N(ye), xe = F(be, !0), Se = I(be, 2), Ce = N(Se), we = F(Ce, !0), Te = I(Ce, 2), Ee = N(Te), De = I(Ee);
						w(Te), w(Se), w(ye);
						var Oe = I(ye, 2), ke = N(Oe), Ae = F(ke, !0), je = I(ke, 2), Me = N(je), Ne = F(Me, !0), Pe = I(Me, 2), Fe = F(Pe, !0), Ie = I(Pe, 2), Le = F(Ie, !0), T = I(Ie, 2), Re = F(T, !0), D = I(T, 2), ze = F(D, !0);
						w(je), w(Oe);
						var Be = I(Oe, 2), Ve = (e) => {
							let t = /* @__PURE__ */ O(() => R(Vo).filter((e) => Ro[e]?.data?.mal?.kind === "blocks"));
							var n = Nd(), r = N(n), i = F(r, !0), a = I(r, 2);
							Zr(a, 20, () => R(t), (e) => e, (e, t) => {
								var n = zl(), r = F(n, !0);
								L((e) => {
									q(n, "title", e), H(r, Ro[t].data.mal.name);
								}, [() => J("canvas.insertGroup")]), z("click", n, () => E?.sendInsertTemplate(t)), V(e, n);
							}), w(a), w(n), L((e) => H(i, e), [() => J("canvas.tabMyTemplates")]), V(e, n);
						}, He = /* @__PURE__ */ O(() => R(Vo).some((e) => Ro[e]?.data?.mal?.kind === "blocks"));
						U(Be, (e) => {
							R(He) && e(Ve);
						});
						var Ue = I(Be, 2), We = (e) => {
							var t = Nd(), n = N(t), r = F(n, !0), i = I(n, 2);
							Zr(i, 21, () => R(Ap), (e) => e.type, (e, t) => {
								var n = Ir(), r = P(n), i = (e) => {
									var n = Nd(), r = N(n), i = F(r, !0), a = I(r, 2);
									Zr(a, 21, () => R(t).variants, (e) => e.label, (e, n) => {
										var r = zl(), i = F(r, !0);
										L((e) => {
											q(r, "title", e), H(i, R(n).label);
										}, [() => J("tip.blocks.fromPlugin", { plugin: R(t).plugin })]), z("click", r, () => jp(R(t), R(n).props)), V(e, r);
									}), w(a), w(n), L(() => H(i, R(t).label)), V(e, n);
								}, a = (e) => {
									var n = zl(), r = F(n, !0);
									L((e) => {
										q(n, "title", e), H(r, R(t).label);
									}, [() => J("tip.blocks.fromPlugin", { plugin: R(t).plugin })]), z("click", n, () => jp(R(t))), V(e, n);
								};
								U(r, (e) => {
									R(t).variants?.length ? e(i) : e(a, -1);
								}), V(e, n);
							}), w(i), w(t), L((e) => H(r, e), [() => J("panel.plugins")]), V(e, t);
						};
						U(Ue, (e) => {
							R(Ap).length && e(We);
						}), L((e, t, n, r, a, o, u, m, ye, be, Se, De, Oe, ke, w, je, Me, Pe, Ie, T, E, D, Be, Ve, He, Ue, We, Ge, Ke, qe, Je, Ye, Xe, Ze, Qe, $e, et, tt, nt, rt, it, at, ot, st, ct, lt) => {
							H(i, e), H(s, t), q(c, "title", n), H(l, r), H(d, a), q(f, "title", o), H(p, `${u ?? ""} `), q(h, "title", m), H(g, ye), q(_, "title", be), H(v, Se), q(y, "title", De), H(b, Oe), q(x, "title", ke), H(S, w), q(C, "title", je), H(ee, Me), q(te, "title", Pe), H(ne, Ie), q(re, "title", T), H(ie, E), q(ae, "title", D), H(oe, Be), q(se, "title", Ve), H(ce, He), q(le, "title", Ue), H(ue, We), q(de, "title", Ge), H(fe, Ke), q(pe, "title", qe), H(me, Je), q(he, "title", Ye), H(ge, Xe), q(_e, "title", Ze), H(ve, Qe), H(xe, $e), q(Ce, "title", et), H(we, tt), q(Te, "title", nt), H(Ee, `${rt ?? ""} `), H(Ae, it), H(Ne, at), H(Fe, ot), H(Le, st), H(Re, ct), H(ze, lt);
						}, [
							() => J("blocks.text"),
							() => J("blocks.text"),
							() => J("tip.blocks.textBox"),
							() => J("ui.textBox"),
							() => J("blocks.button"),
							() => J("tip.webpAuto"),
							() => J("blocks.image"),
							() => J("tip.blocks.video"),
							() => J("blocks.video"),
							() => J("tip.blocks.icon"),
							() => J("blocks.icon"),
							() => J("tip.blocks.collection"),
							() => J("blocks.collection"),
							() => J("tip.blocks.faq"),
							() => J("blocks.faq"),
							() => J("tip.blocks.timeline"),
							() => J("blocks.timeline"),
							() => J("tip.blocks.quote"),
							() => J("blocks.quote"),
							() => J("tip.blocks.stats"),
							() => J("blocks.stats"),
							() => J("tip.blocks.table"),
							() => J("blocks.table"),
							() => J("tip.blocks.share"),
							() => J("blocks.share"),
							() => J("tip.blocks.countdown"),
							() => J("blocks.countdown"),
							() => J("tip.blocks.audio"),
							() => J("blocks.audio"),
							() => J("tip.blocks.product"),
							() => J("blocks.product"),
							() => J("tip.blocks.cart"),
							() => J("blocks.cart"),
							() => J("tip.blocks.checkout"),
							() => J("blocks.checkout"),
							() => J("blocks.gallery"),
							() => J("tip.blocks.gallery"),
							() => J("ui.emptyGallery"),
							() => J("tip.blocks.galleryImages"),
							() => J("ui.galleryWithImages"),
							() => J("group.shapes"),
							() => J("shape.line"),
							() => J("shape.arrow"),
							() => J("shape.circle"),
							() => J("shape.rect"),
							() => J("shape.triangle")
						]), z("click", o, () => kp("text")), z("click", c, () => kp("text-box")), z("click", u, () => kp("button")), z("change", m, Ip), z("click", h, () => kp("video")), z("click", _, () => kp("icon")), z("click", y, () => kp("collection")), z("click", x, () => kp("faq")), z("click", C, () => kp("timeline")), z("click", te, () => kp("quote")), z("click", re, () => kp("stats")), z("click", ae, () => kp("table")), z("click", se, () => kp("share")), z("click", le, () => kp("countdown")), z("click", de, () => kp("audio")), z("click", pe, () => kp("product")), z("click", he, () => kp("cart")), z("click", _e, () => kp("checkout")), z("click", Ce, () => kp("gallery")), z("change", De, Bp), z("click", Me, () => kp("shape-line")), z("click", Pe, () => kp("shape-arrow")), z("click", Ie, () => kp("shape-circle")), z("click", T, () => kp("shape-rect")), z("click", D, () => kp("shape-triangle")), V(e, t);
					};
					U(i, (e) => {
						R(o) ? e(a) : e(s, -1);
					}), w(t), L((e, i, a) => {
						n = vi(t, 1, "panel-body svelte-1n46o8q", null, n, { locked: R(ge) === "mobile" }), q(t, "title", e), q(r, "placeholder", i), q(r, "title", a);
					}, [
						() => R(ge) === "mobile" ? J("tip.blocks.mobileLocked") : void 0,
						() => J("canvas.searchBlocks"),
						() => J("canvas.searchBlocks")
					]), ki(r, () => R(Mp), (e) => M(Mp, e)), V(e, t);
				}, g = (e) => {
					var t = Id(), n = N(t), r = N(n), i = F(I(r));
					w(n);
					var a = I(n, 2);
					G(a);
					var o = I(a, 2), s = N(o);
					G(s);
					var c = I(s);
					w(o), w(t), L((e, t) => {
						H(r, `${e ?? ""} `), H(i, `${R(re).size ?? ""} px`), K(a, R(re).size), Ti(s, R(re).snap !== !1), H(c, ` ${t ?? ""}`);
					}, [() => J("lbl.gridSize"), () => J("lbl.gridSnap")]), z("input", a, (e) => Gr("size", Number(e.target.value))), z("change", s, (e) => Gr("snap", e.target.checked)), V(e, t);
				}, v = (e) => {
					var t = Ud(), r = N(t), i = (e) => {
						var t = Ld(), n = P(t), r = F(n, !0), i = I(n, 2);
						a(i), L((e) => H(r, e), [() => J("blocks.suffix", { label: hn[R(k).type] ?? R(k).type })]), V(e, t);
					}, o = (e) => {
						var t = Hd(), r = P(t), i = F(r, !0), a = I(r, 2), o = N(a), s = I(o);
						G(s), w(a);
						var l = I(a, 4), u = N(l);
						G(u);
						var d = I(u);
						w(l);
						var f = I(l, 2), p = (e) => {
							var t = Rd(), n = P(t), r = N(n), i = F(I(r));
							w(n);
							var a = I(n, 2);
							G(a), L((e) => {
								H(r, `${e ?? ""} `), H(i, `${R(yn).size ?? ""} px`), K(a, R(yn).size);
							}, [() => J("lbl.gridSize")]), z("input", a, (e) => Wr("size", Number(e.target.value))), V(e, t);
						};
						U(f, (e) => {
							R(yn) && e(p);
						});
						var m = I(f, 4), g = F(m, !0), _ = I(m, 2);
						Zr(_, 21, () => [["", "common.standard"], ...Object.entries($s)], ([e, t]) => e, (e, t) => {
							var n = /* @__PURE__ */ O(() => h(R(t), 2));
							let r = () => R(n)[0], i = () => R(n)[1], a = /* @__PURE__ */ O(() => jn(r()));
							var o = zd();
							let s;
							var c = N(o), l = N(c), u = I(l, 2), d = I(u, 2);
							w(c);
							var f = F(I(c, 2), !0);
							w(o), L((e, t) => {
								s = vi(o, 1, "rs-card svelte-1n46o8q", null, s, { on: R(Tn) === r() }), q(o, "title", e), bi(c, `background: ${R(a).bg ?? ""}`), bi(l, `background: ${R(a).text ?? ""}`), bi(u, `background: ${R(a).surface ?? ""}`), bi(d, `background: ${R(a).accent ?? ""}`), H(f, t);
							}, [() => J("tip.props.sectionTheme"), () => J(i())]), z("click", o, () => An(r())), V(e, o);
						}), w(_);
						var v = I(_, 2), y = N(v), b = I(y), x = N(b), S = F(x), C = I(x, 2);
						W(C, () => c.copy, !0), w(C), w(b), w(v);
						var ee = I(v, 4), te = F(ee, !0), ne = I(ee, 2);
						n(ne, () => R(pr), () => R(xn));
						var re = I(ne, 4), ie = N(re), ae = I(ie);
						{
							let e = /* @__PURE__ */ O(() => kr(R(Sn)) ? R(Sn).type : "");
							Y(ae, {
								get value() {
									return R(e);
								},
								get options() {
									return Ar;
								},
								onchange: (e) => Lr(e || null)
							});
						}
						w(re);
						var oe = I(re, 2), se = (e) => {
							var t = Vd(), n = P(t), r = N(n), i = I(r);
							G(i), w(n);
							var a = I(n, 2), o = N(a), s = I(o);
							G(s), w(a);
							var c = I(a, 2), l = (e) => {
								var t = Bd(), n = P(t), r = N(n), i = I(r);
								{
									let e = /* @__PURE__ */ O(() => R(Sn).props.effect ?? "slide-up"), t = /* @__PURE__ */ O(() => [
										["fade-in", J("anim.fadeIn")],
										["slide-up", J("anim.slideUp")],
										["zoom-in", J("anim.zoomIn")]
									]);
									Y(i, {
										get value() {
											return R(e);
										},
										get options() {
											return R(t);
										},
										onchange: (e) => Br("effect", e)
									});
								}
								w(n);
								var a = I(n, 2), o = N(a), s = I(o);
								G(s), w(a);
								var c = I(a, 2), l = N(c), u = I(l);
								{
									let e = /* @__PURE__ */ O(() => R(Sn).props.pattern ?? "sequence"), t = /* @__PURE__ */ O(() => [
										["sequence", J("opt.stagger.sequence")],
										["columns", J("opt.stagger.columns")],
										["rows", J("opt.stagger.rows")],
										["center", J("opt.stagger.center")]
									]);
									Y(u, {
										get value() {
											return R(e);
										},
										get options() {
											return R(t);
										},
										onchange: (e) => Br("pattern", e)
									});
								}
								w(c), L((e, t, i, u, d, f) => {
									q(n, "title", e), H(r, `${t ?? ""} `), q(a, "title", i), H(o, `${u ?? ""} `), K(s, R(Sn).props.step ?? 90), q(c, "title", d), H(l, `${f ?? ""} `);
								}, [
									() => J("tip.props.staggerEffect"),
									() => J("lbl.staggerEffect"),
									() => J("tip.props.staggerStep"),
									() => J("lbl.stepMs"),
									() => J("tip.props.staggerPattern"),
									() => J("lbl.pattern")
								]), z("change", s, (e) => zr("step", Number(e.target.value))), V(e, t);
							};
							U(c, (e) => {
								R(Sn).type === "stagger" && e(l);
							}), L((e, t) => {
								H(r, `${e ?? ""} `), K(i, R(Sn).props.duration), H(o, `${t ?? ""} `), K(s, R(Sn).props.delay ?? 0);
							}, [() => J("lbl.durationMs"), () => J("lbl.delayMs")]), z("change", i, (e) => zr("duration", Number(e.target.value))), z("change", s, (e) => zr("delay", Number(e.target.value))), V(e, t);
						}, ce = /* @__PURE__ */ O(() => kr(R(Sn)));
						U(oe, (e) => {
							R(ce) && e(se);
						});
						var le = I(oe, 2), ue = N(le), de = I(ue);
						{
							let e = /* @__PURE__ */ O(() => R(wn)?.type ?? (R(Sn) && !kr(R(Sn)) ? R(Sn).type : ""));
							Y(de, {
								get value() {
									return R(e);
								},
								get options() {
									return Mr;
								},
								onchange: (e) => Rr(e || null)
							});
						}
						w(le), L((e, t, n, r, c, l, f, p, h, _, b, x, ee, ne, ae) => {
							H(i, e), q(a, "title", t), H(o, `${n ?? ""} `), K(s, R(bn)), q(s, "placeholder", r), Ti(u, R(yn) !== null), H(d, ` ${c ?? ""}`), q(m, "title", l), H(g, f), q(v, "title", p), H(y, `${h ?? ""} `), H(S, `#${R(vn) ?? ""}`), q(C, "title", _), H(te, b), q(re, "title", x), H(ie, `${ee ?? ""} `), q(le, "title", ne), H(ue, `${ae ?? ""} `);
						}, [
							() => J("lbl.section"),
							() => J("hint.props.minHeight"),
							() => J("lbl.minHeight"),
							() => J("ph.minHeight"),
							() => J("lbl.sectionGrid"),
							() => J("tip.props.sectionTheme"),
							() => J("lbl.sectionTheme"),
							() => J("tip.props.anchor"),
							() => J("lbl.anchor"),
							() => J("tip.props.copyAnchor"),
							() => J("lbl.background"),
							() => J("tip.props.sectionAnim"),
							() => J("lbl.animIn"),
							() => J("tip.props.sectionHover"),
							() => J("lbl.onHover")
						]), z("change", s, (e) => Vr(e.target.value)), z("change", u, (e) => Ur(e.target.checked)), z("click", C, () => navigator.clipboard?.writeText(`#${R(vn)}`)), V(e, t);
					}, s = (e) => {
						var t = kl(), n = F(t, !0);
						L((e) => H(n, e), [() => J("hint.props.empty")]), V(e, t);
					};
					U(r, (e) => {
						R(k) ? e(i) : R(vn) ? e(o, 1) : e(s, -1);
					}), w(t), V(e, t);
				}, y = (e) => {
					var t = Zd(), i = N(t), a = N(i);
					G(a);
					var o = I(a);
					w(i);
					var s = I(i, 2), l = (e) => {
						var t = Nd(), n = N(t), r = F(n, !0), i = I(n, 2);
						Zr(i, 21, () => R(D).pages ?? [], (e) => e.id, (e, t) => {
							var n = Ll(), r = N(n);
							G(r);
							var i = I(r);
							w(n), L((e, a) => {
								q(n, "title", e), Ti(r, a), H(i, ` ${(R(t).title || R(t).id) ?? ""}`);
							}, [() => J("tip.footer.hideOnPage"), () => !(R(D).footer?.hideOn ?? []).includes(R(t).id)]), z("change", r, (e) => Mc(R(t).id, e.target.checked)), V(e, n);
						}), w(i), w(t), L((e) => H(r, e), [() => J("group.showOnPages")]), V(e, t);
					};
					U(s, (e) => {
						R(D).footer?.show && e(l);
					});
					var u = I(s, 2), d = N(u), f = F(d, !0), p = I(d, 2), m = N(p);
					Zr(m, 21, () => yc, (e) => e.id, (e, t) => {
						var n = Wd(), r = N(n);
						W(r, () => el(R(t).thumb), !0), w(r);
						var i = F(I(r, 2), !0);
						w(n), L((e) => {
							q(n, "title", e), H(i, R(t).label);
						}, [() => J("tip.footer.template", { label: R(t).label })]), z("click", n, () => xc(R(t).id)), V(e, n);
					}), w(m), w(p), w(u);
					var h = I(u, 2), g = N(h), _ = F(g, !0), v = I(g, 2), y = N(v), b = N(y), x = I(b);
					G(x), w(y);
					var S = I(y, 2), C = N(S), ee = I(C);
					G(ee), w(S);
					var te = I(S, 2), ne = N(te), re = I(ne);
					{
						let e = /* @__PURE__ */ O(() => R(D).footer?.brand?.mode ?? "text"), t = /* @__PURE__ */ O(() => [
							["text", J("blocks.text")],
							["image", J("opt.brand.image")],
							["both", J("opt.brand.both")]
						]);
						Y(re, {
							get value() {
								return R(e);
							},
							get options() {
								return R(t);
							},
							onchange: (e) => dc(e)
						});
					}
					w(te);
					var ie = I(te, 2), ae = (e) => {
						var t = Kd(), n = P(t), r = N(n), i = N(r), a = I(i);
						w(r);
						var o = I(r, 2), s = (e) => {
							var t = cl();
							W(t, () => c.cross, !0), w(t), L((e) => q(t, "title", e), [() => J("tip.footer.removeLogo")]), z("click", t, pc), V(e, t);
						};
						U(o, (e) => {
							R(D).footer?.brand?.logo && e(s);
						}), w(n);
						var l = I(n, 2), u = (e) => {
							var t = Gd(), n = P(t), r = N(n), i = F(I(r));
							w(n);
							var a = I(n, 2);
							G(a), L((e) => {
								H(r, `${e ?? ""} `), H(i, `${R(D).footer?.brand?.logoHeight ?? 40 ?? ""} px`), K(a, R(D).footer?.brand?.logoHeight ?? 40);
							}, [() => J("lbl.logoHeight")]), z("input", a, (e) => mc(e.target.value)), V(e, t);
						};
						U(l, (e) => {
							R(D).footer?.brand?.logo && e(u);
						}), L((e, t) => {
							q(r, "title", e), H(i, `${t ?? ""} `);
						}, [() => J("tip.webpAutoPublish"), () => R(D).footer?.brand?.logo ? J("ui.changeLogo") : J("ui.uploadLogo")]), z("change", a, fc), V(e, t);
					};
					U(ie, (e) => {
						(R(D).footer?.brand?.mode ?? "text") !== "text" && e(ae);
					}), w(v), w(h);
					var oe = I(h, 2), se = N(oe), ce = F(se, !0), le = I(se, 2), ue = N(le);
					Zr(ue, 17, () => R(D).footer?.columns ?? [], qr, (e, t, n) => {
						var r = qd(), i = P(r), a = N(i);
						G(a);
						var o = I(a, 2), s = N(o);
						W(s, () => c.plus, !0), w(s);
						var l = I(s, 2);
						l.disabled = n === 0, W(l, () => c.up, !0), w(l);
						var u = I(l, 2);
						W(u, () => c.down, !0), w(u);
						var d = I(u, 2);
						W(d, () => c.cross, !0), w(d), w(o), w(i), Zr(I(i, 2), 17, () => R(t).links ?? [], qr, (e, r, i) => {
							var a = Tl(), o = N(a);
							G(o);
							var s = I(o, 2), l = N(s);
							l.disabled = i === 0, W(l, () => c.up, !0), w(l);
							var u = I(l, 2);
							W(u, () => c.down, !0), w(u);
							var d = I(u, 2);
							W(d, () => c.cross, !0), w(d), w(s);
							var f = I(s, 2), p = N(f);
							{
								let e = /* @__PURE__ */ O(() => R(r).page ?? "__href"), t = /* @__PURE__ */ O(() => J("tip.linkTarget")), a = /* @__PURE__ */ O(() => [...R(D).pages.map((e) => [e.id, e.title]), ["__href", J("opt.linkHref")]]);
								Y(p, {
									get value() {
										return R(e);
									},
									get title() {
										return R(t);
									},
									get options() {
										return R(a);
									},
									onchange: (e) => Vc(n, i, e)
								});
							}
							w(f);
							var m = I(f, 2), h = (e) => {
								var t = wl();
								G(t), L((e, n) => {
									K(t, R(r).href ?? ""), q(t, "placeholder", e), q(t, "title", n);
								}, [() => J("ph.hrefAnchor"), () => J("tip.hrefAnchor")]), z("change", t, (e) => Uc(n, i, e.target.value)), V(e, t);
							};
							U(m, (e) => {
								R(r).page || e(h);
							}), w(a), L((e, n) => {
								K(o, R(r).label), q(o, "title", e), u.disabled = i === R(t).links.length - 1, q(d, "title", n);
							}, [() => J("tip.linkLabel"), () => J("tip.removeLink")]), z("input", o, (e) => Bc(n, i, e.target.value)), z("click", l, () => zc(n, i, -1)), z("click", u, () => zc(n, i, 1)), z("click", d, () => Rc(n, i)), V(e, a);
						}), L((e, r, i) => {
							K(a, R(t).title), q(a, "title", e), q(s, "title", r), u.disabled = n === R(D).footer.columns.length - 1, q(d, "title", i);
						}, [
							() => J("tip.footer.columnTitle"),
							() => J("tip.footer.addLink"),
							() => J("tip.footer.removeColumn")
						]), z("input", a, (e) => Ic(n, e.target.value)), z("click", s, () => Lc(n)), z("click", l, () => Fc(n, -1)), z("click", u, () => Fc(n, 1)), z("click", d, () => Pc(n)), V(e, r);
					});
					var de = I(ue, 2), fe = F(de, !0), pe = I(de, 2), me = N(pe), he = I(me);
					{
						let e = /* @__PURE__ */ O(() => R(D).footer?.columnsAlign ?? "left"), t = /* @__PURE__ */ O(() => [["left", J("common.left")], ["center", J("common.center")]]);
						Y(he, {
							get value() {
								return R(e);
							},
							get options() {
								return R(t);
							},
							onchange: (e) => Oc(e)
						});
					}
					w(pe), w(le), w(oe);
					var ge = I(oe, 2), _e = N(ge), ve = F(_e, !0), ye = I(_e, 2), be = N(ye);
					Zr(be, 17, () => R(D).footer?.social ?? [], qr, (e, t, n) => {
						var r = Jd(), i = N(r), a = N(i);
						W(a, () => Fa(R(t).icon) || "", !0), w(a);
						var o = I(a, 2);
						{
							let e = /* @__PURE__ */ O(() => J("blocks.icon"));
							Y(o, {
								get value() {
									return R(t).icon;
								},
								get title() {
									return R(e);
								},
								get options() {
									return Xc;
								},
								onchange: (e) => Jc(n, e)
							});
						}
						w(i);
						var s = I(i, 2), l = N(s);
						l.disabled = n === 0, W(l, () => c.up, !0), w(l);
						var u = I(l, 2);
						W(u, () => c.down, !0), w(u);
						var d = I(u, 2);
						W(d, () => c.cross, !0), w(d), w(s);
						var f = I(s, 2);
						G(f), w(r), L((e, r) => {
							u.disabled = n === R(D).footer.social.length - 1, q(d, "title", e), K(f, R(t).url), q(f, "placeholder", r);
						}, [() => J("tip.removeLink"), () => J("ph.hrefMailto")]), z("click", l, () => Kc(n, -1)), z("click", u, () => Kc(n, 1)), z("click", d, () => Gc(n)), z("change", f, (e) => Yc(n, e.target.value)), V(e, r);
					});
					var xe = I(be, 2), Se = F(xe, !0);
					w(ye), w(ge);
					var Ce = I(ge, 2), we = N(Ce), Te = F(we, !0), Ee = I(we, 2), De = N(Ee), Oe = N(De);
					G(Oe);
					var ke = I(Oe);
					w(De);
					var Ae = I(De, 2), Me = (e) => {
						let t = /* @__PURE__ */ O(() => R(D).footer.cta);
						var n = Xd(), r = P(n), i = N(r), a = I(i);
						{
							let e = /* @__PURE__ */ O(() => R(t).kind ?? "button"), n = /* @__PURE__ */ O(() => [["button", J("opt.cta.button")], ["newsletter", J("opt.cta.newsletter")]]);
							Y(a, {
								get value() {
									return R(e);
								},
								get options() {
									return R(n);
								},
								onchange: (e) => Ac("kind", e)
							});
						}
						w(r);
						var o = I(r, 2), s = N(o);
						G(s);
						var c = I(s);
						w(o);
						var l = I(o, 2), u = N(l), d = I(u);
						G(d), w(l);
						var f = I(l, 2), p = N(f), m = I(p);
						G(m), w(f);
						var h = I(f, 2), g = N(h), _ = I(g);
						G(_), w(h);
						var v = I(h, 2), y = (e) => {
							var n = Yd(), r = P(n), i = N(r), a = I(i);
							{
								let e = /* @__PURE__ */ O(() => R(t).page ?? "__href"), n = /* @__PURE__ */ O(() => [...R(D).pages.map((e) => [e.id, e.title]), ["__href", J("opt.linkHrefMailto")]]);
								Y(a, {
									get value() {
										return R(e);
									},
									get options() {
										return R(n);
									},
									onchange: (e) => jc(e)
								});
							}
							w(r);
							var o = I(r, 2), s = (e) => {
								var n = Vl();
								G(n), L((e, r) => {
									K(n, R(t).href ?? ""), q(n, "placeholder", e), q(n, "title", r);
								}, [() => J("ph.hrefMailtoAnchor"), () => J("tip.hrefAnchor")]), z("change", n, (e) => Ac("href", e.target.value)), V(e, n);
							};
							U(o, (e) => {
								R(t).page || e(s);
							}), L((e, t) => {
								q(r, "title", e), H(i, `${t ?? ""} `);
							}, [() => J("tip.footer.ctaTarget"), () => J("lbl.buttonTarget")]), V(e, n);
						}, b = (e) => {
							var n = Pl(), r = P(n), i = N(r), a = I(i);
							G(a), w(r);
							var o = I(r, 2), s = N(o), c = I(s);
							G(c), w(o);
							var l = I(o, 2), u = N(l), d = I(u);
							G(d), w(l), L((e, n, f, p, m, h, g, _, v) => {
								q(r, "title", e), H(i, `${n ?? ""} `), K(a, R(t).endpoint ?? ""), q(a, "placeholder", f), q(o, "title", p), H(s, `${m ?? ""} `), K(c, R(t).recipient ?? ""), q(c, "placeholder", h), q(l, "title", g), H(u, `${_ ?? ""} `), K(d, R(t).success ?? ""), q(d, "placeholder", v);
							}, [
								() => J("tip.footer.ctaEndpoint"),
								() => J("lbl.newsletterEndpoint"),
								() => J("ph.endpoint"),
								() => J("tip.footer.ctaRecipient"),
								() => J("lbl.recipientFallback"),
								() => J("ph.email"),
								() => J("tip.footer.ctaSuccess"),
								() => J("lbl.confirmation"),
								() => J("ph.footer.ctaSuccess")
							]), z("change", a, (e) => Ac("endpoint", e.target.value)), z("change", c, (e) => Ac("recipient", e.target.value)), z("input", d, (e) => Ac("success", e.target.value)), V(e, n);
						};
						U(v, (e) => {
							(R(t).kind ?? "button") === "button" ? e(y) : e(b, -1);
						}), L((e, n, a, v, y, b, x, S, C, ee, te, ne) => {
							q(r, "title", e), H(i, `${n ?? ""} `), q(o, "title", a), Ti(s, R(t).big === !0), H(c, ` ${v ?? ""}`), q(l, "title", y), H(u, `${b ?? ""} `), K(d, R(t).heading ?? ""), q(d, "placeholder", x), q(f, "title", S), H(p, `${C ?? ""} `), K(m, R(t).sub ?? ""), q(h, "title", ee), H(g, `${te ?? ""} `), K(_, R(t).label ?? ""), q(_, "placeholder", ne);
						}, [
							() => J("tip.footer.ctaKind"),
							() => J("common.type"),
							() => J("tip.footer.ctaBig"),
							() => J("lbl.bigCentered"),
							() => J("tip.footer.ctaHeading"),
							() => J("lbl.heading"),
							() => J("ph.footer.ctaHeading"),
							() => J("tip.footer.ctaSub"),
							() => J("lbl.subText"),
							() => J("tip.footer.ctaLabel"),
							() => J("lbl.buttonText"),
							() => J("ph.footer.ctaLabel")
						]), z("change", s, (e) => Ac("big", e.target.checked)), z("input", d, (e) => Ac("heading", e.target.value)), z("input", m, (e) => Ac("sub", e.target.value)), z("input", _, (e) => Ac("label", e.target.value)), V(e, n);
					};
					U(Ae, (e) => {
						R(D).footer?.cta && e(Me);
					}), w(Ee), w(Ce);
					var Ne = I(Ce, 2), Pe = N(Ne), Fe = F(Pe, !0), Ie = I(Pe, 2), Le = N(Ie);
					r(Le, () => "linkRow", () => R(D).footer?.linkRow ?? []);
					var T = I(Le, 2), Re = F(T, !0);
					w(Ie), w(Ne);
					var E = I(Ne, 2), ze = N(E), Be = F(ze, !0), Ve = I(ze, 2), He = N(Ve), Ue = (e) => {
						var t = mu(), n = P(t), r = N(n), i = I(r);
						{
							let e = /* @__PURE__ */ O(() => R(D).footer?.align ?? "left"), t = /* @__PURE__ */ O(() => [
								["left", J("common.left")],
								["center", J("common.center")],
								["right", J("common.right")]
							]);
							Y(i, {
								get value() {
									return R(e);
								},
								get options() {
									return R(t);
								},
								onchange: (e) => lc("footer", (t) => {
									t.align = e;
								})
							});
						}
						w(n), je(2), L((e, t) => {
							q(n, "title", e), H(r, `${t ?? ""} `);
						}, [() => J("tip.footer.align"), () => J("lbl.align")]), V(e, t);
					};
					U(He, (e) => {
						R(D).footer?.cta?.big !== !0 && e(Ue);
					});
					var We = I(He, 2), Ge = F(We, !0), Ke = I(We, 2);
					n(Ke, () => hr, () => R(D).footer?.background?.layers ?? []), w(Ve), w(E);
					var qe = I(E, 2), Je = N(qe), Ye = F(Je, !0), Xe = I(Je, 2), Ze = N(Xe), Qe = N(Ze), $e = I(Qe);
					G($e), w(Ze);
					var et = I(Ze, 2), tt = F(et, !0), nt = I(et, 2);
					r(nt, () => "baseline", () => R(D).footer?.baseline ?? []);
					var rt = I(nt, 2), it = F(rt, !0);
					w(Xe), w(qe), w(t), L((e, t, n, r, s, c, l, u, d, p, m, h, g, v, re, ie, ae, oe, se, le, ue, de, he, ge, _e, ye, be, xe, Ce, we, Ee, Ae) => {
						q(i, "title", e), Ti(a, t), H(o, ` ${n ?? ""}`), H(f, r), H(_, s), q(y, "title", c), H(b, `${l ?? ""} `), K(x, R(D).footer?.brand?.title ?? ""), q(x, "placeholder", u), q(S, "title", d), H(C, `${p ?? ""} `), K(ee, R(D).footer?.brand?.tagline ?? ""), q(te, "title", m), H(ne, `${h ?? ""} `), H(ce, g), H(fe, v), q(pe, "title", re), H(me, `${ie ?? ""} `), H(ve, ae), H(Se, oe), H(Te, se), q(De, "title", le), Ti(Oe, ue), H(ke, ` ${de ?? ""}`), H(Fe, he), H(Re, ge), H(Be, _e), H(Ge, ye), H(Ye, be), q(Ze, "title", xe), H(Qe, `${Ce ?? ""} `), K($e, R(D).footer?.copyright ?? ""), q($e, "placeholder", we), H(tt, Ee), H(it, Ae);
					}, [
						() => J("tip.footer.show"),
						() => !!R(D).footer?.show,
						() => J("lbl.showFooter"),
						() => J("group.startpoint"),
						() => J("group.brand"),
						() => J("tip.footer.brandTitle"),
						() => J("lbl.title"),
						() => J("ph.footer.brandTitle"),
						() => J("tip.footer.tagline"),
						() => J("lbl.tagline"),
						() => J("tip.footer.brandMode"),
						() => J("lbl.brandMode"),
						() => J("group.columns"),
						() => J("ui.addColumn"),
						() => J("tip.footer.columnsAlign"),
						() => J("lbl.splitColumnAlign"),
						() => J("group.social"),
						() => J("ui.addSocial"),
						() => J("group.cta"),
						() => J("tip.footer.cta"),
						() => !!R(D).footer?.cta,
						() => J("lbl.showCta"),
						() => J("group.linkRow"),
						() => J("ui.addRowLink"),
						() => J("group.appearance"),
						() => J("lbl.background"),
						() => J("group.baseline"),
						() => J("tip.footer.copyright"),
						() => J("lbl.copyright"),
						() => J("ph.footer.copyright"),
						() => J("lbl.baselineLinks"),
						() => J("ui.addBaselineLink")
					]), z("change", a, (e) => lc("footer", (t) => {
						t.show = e.target.checked;
					})), z("input", x, (e) => uc("title", e.target.value)), z("input", ee, (e) => uc("tagline", e.target.value)), z("click", de, Nc), z("click", xe, Wc), z("change", Oe, (e) => kc(e.target.checked)), z("click", T, () => Sc("linkRow")), z("input", $e, (e) => _c(e.target.value)), z("click", rt, () => Sc("baseline")), V(e, t);
				}, b = (e) => {
					var t = sf(), n = N(t), r = (e) => {
						var t = El(), n = N(t), r = I(n);
						{
							let e = /* @__PURE__ */ O(() => R(Mo) ?? ""), t = /* @__PURE__ */ O(() => [["", J("common.choose")], ...R(Oo).map((e) => [e, R(jo)[e]?.name ?? e])]);
							Y(r, {
								get value() {
									return R(e);
								},
								get options() {
									return R(t);
								},
								onchange: (e) => M(Mo, e || null, !0)
							});
						}
						w(t), L((e) => H(n, `${e ?? ""} `), [() => J("blocks.collection")]), V(e, t);
					};
					U(n, (e) => {
						R(Oo).length && e(r);
					});
					var i = I(n, 2), a = (e) => {
						let t = /* @__PURE__ */ O(() => R(jo)[R(Mo)]);
						var n = of(), r = P(n), i = N(r), a = F(i, !0), o = I(i, 2), s = F(o, !0), l = I(o, 2), u = N(l), d = I(u);
						w(l);
						var f = I(l, 2);
						W(f, () => c.cross, !0), w(f), w(r);
						var p = I(r, 2);
						Zr(p, 19, () => R(t).entries, (e) => e.id, (e, n, r) => {
							var i = af(), a = N(i), o = F(a), s = I(a, 2), l = N(s), u = N(l);
							G(u);
							var d = I(u, 2), f = N(d);
							W(f, () => c.up, !0), w(f);
							var p = I(f, 2);
							W(p, () => c.down, !0), w(p);
							var m = I(p, 2);
							W(m, () => c.cross, !0), w(m), w(d), w(l);
							var h = I(l, 2), g = (e) => {
								var t = Qd(), r = N(t), i = I(r);
								G(i), w(t), L((e) => {
									H(r, `${e ?? ""} `), K(i, R(n).date ?? "");
								}, [() => J("lbl.date")]), z("change", i, (e) => us(R(Mo), R(n).id, "date", e.target.value)), V(e, t);
							};
							U(h, (e) => {
								R(t).kind !== "products" && e(g);
							});
							var _ = I(h, 2);
							ft(_);
							var v = I(_, 2), y = (e) => {
								var t = $d(), r = N(t), i = I(r);
								G(i), w(t), L((e, t) => {
									H(r, `${e ?? ""} `), K(i, R(n).href ?? ""), q(i, "placeholder", t);
								}, [() => J("lbl.link"), () => J("ph.collections.href")]), z("change", i, (e) => us(R(Mo), R(n).id, "href", e.target.value)), V(e, t);
							};
							U(v, (e) => {
								R(t).kind !== "products" && e(y);
							});
							var b = I(v, 2), x = N(b), S = N(x), C = I(S);
							w(x);
							var ee = I(x, 2), te = (e) => {
								var t = ef(), r = P(t), i = I(r, 2);
								W(i, () => c.cross, !0), w(i), L((e) => {
									q(r, "src", R(n).image), q(i, "title", e);
								}, [() => J("tip.removeImage")]), z("click", i, () => us(R(Mo), R(n).id, "image", "")), V(e, t);
							};
							U(ee, (e) => {
								R(n).image && e(te);
							}), w(b);
							var ne = I(b, 2), re = (e) => {
								var t = rf(), r = P(t), i = N(r), a = I(i);
								G(a), w(r);
								var o = I(r, 2), s = N(o), l = I(s);
								G(l), w(o);
								var u = I(o, 2), d = N(u), f = I(d);
								G(f), w(u);
								var p = I(u, 2), m = N(p), h = I(m);
								G(h), w(p);
								var g = I(p, 2);
								Zr(g, 17, () => R(n).colors ?? [], qr, (e, t, r) => {
									var i = nf(), a = N(i);
									G(a);
									var o = I(a, 2), s = N(o), l = I(s);
									w(o);
									var u = I(o, 2), d = (e) => {
										var n = tf();
										L(() => q(n, "src", R(t).image)), V(e, n);
									};
									U(u, (e) => {
										R(t).image && e(d);
									});
									var f = I(u, 2);
									W(f, () => c.cross, !0), w(f), w(i), L((e, n) => {
										K(a, R(t).name), q(a, "placeholder", e), H(s, `${n ?? ""} `);
									}, [() => J("ph.colorName"), () => R(t).image ? J("ui.changeImage") : J("ui.addImage")]), z("change", a, (e) => Ss(R(Mo), R(n).id, r, "name", e.target.value)), z("change", l, (e) => Cs(R(Mo), R(n).id, r, e)), z("click", f, () => ws(R(Mo), R(n).id, r)), V(e, i);
								});
								var _ = I(g, 2), v = F(_, !0);
								L((e, t, r, c, g, y, b, x, S, C, ee) => {
									H(i, `${e ?? ""} `), K(a, R(n).price ?? ""), q(o, "title", t), H(s, `${r ?? ""} `), K(l, R(n).memberPrice ?? ""), q(u, "title", c), H(d, `${g ?? ""} `), K(f, R(n).badge ?? ""), q(p, "title", y), H(m, `${b ?? ""} `), K(h, x), q(h, "placeholder", S), q(_, "title", C), H(v, ee);
								}, [
									() => J("lbl.price"),
									() => J("tip.entry.memberPrice"),
									() => J("lbl.memberPrice"),
									() => J("tip.entry.badge"),
									() => J("lbl.productBadge"),
									() => J("tip.entry.sizes"),
									() => J("lbl.sizes"),
									() => (R(n).sizes ?? []).join(", "),
									() => J("ph.sizes"),
									() => J("tip.entry.colors"),
									() => J("ui.addColor")
								]), z("change", a, (e) => us(R(Mo), R(n).id, "price", e.target.value === "" ? "" : Number(e.target.value))), z("change", l, (e) => us(R(Mo), R(n).id, "memberPrice", e.target.value === "" ? "" : Number(e.target.value))), z("change", f, (e) => us(R(Mo), R(n).id, "badge", e.target.value)), z("change", h, (e) => gs(R(Mo), R(n).id, e.target.value)), z("click", _, () => xs(R(Mo), R(n).id)), V(e, t);
							};
							U(ne, (e) => {
								R(t).kind === "products" && e(re);
							}), w(s), w(i), L((e, i, a, s, c) => {
								H(o, `${e ?? ""}${R(t).kind === "products" ? R(n).price == null ? "" : ` · ${R(n).price}` : R(n).date ? ` · ${R(n).date}` : ""}`), K(u, R(n).title), q(u, "title", i), f.disabled = R(r) === 0, p.disabled = R(r) === R(t).entries.length - 1, q(m, "title", a), q(_, "placeholder", s), K(_, R(n).text ?? ""), H(S, `${c ?? ""} `);
							}, [
								() => es(R(n).title),
								() => J("lbl.title"),
								() => J("tip.collections.deleteEntry"),
								() => J("ph.collections.text"),
								() => R(n).image ? J("ui.changeImage") : J("ui.addImage")
							]), z("change", u, (e) => us(R(Mo), R(n).id, "title", e.target.value || J("ui.untitled"))), z("click", f, () => ds(R(Mo), R(r), -1)), z("click", p, () => ds(R(Mo), R(r), 1)), z("click", m, () => ps(R(Mo), R(n).id)), z("change", _, (e) => us(R(Mo), R(n).id, "text", e.target.value)), z("change", C, (e) => ms(R(Mo), R(n).id, e)), V(e, i);
						});
						var m = I(p, 2), h = (e) => {
							var t = kl(), n = F(t, !0);
							L((e) => H(n, e), [() => J("hint.collections.empty")]), V(e, t);
						};
						U(m, (e) => {
							R(t).entries.length || e(h);
						}), je(2), L((e, t, n, r, i, c) => {
							H(a, e), q(o, "title", t), H(s, n), q(l, "title", r), H(u, `${i ?? ""} `), q(f, "title", c);
						}, [
							() => J("ui.addEntry"),
							() => J("tip.collections.exportCsv"),
							() => J("ui.exportCsv"),
							() => J("tip.collections.importCsv"),
							() => J("ui.importCsv"),
							() => J("tip.collections.deleteCollection")
						]), z("click", i, () => ls(R(Mo))), z("click", o, () => Ts(R(Mo))), z("change", d, (e) => Es(R(Mo), e)), z("click", f, () => as(R(Mo))), V(e, n);
					};
					U(i, (e) => {
						R(Mo) && R(jo)[R(Mo)] && e(a);
					});
					var o = I(i, 2), s = N(o), l = I(s);
					G(l), w(o);
					var u = I(o, 2), d = N(u);
					Y(I(d), {
						get value() {
							return R(Lo);
						},
						get options() {
							return X;
						},
						onchange: (e) => M(Lo, e, !0)
					}), w(u);
					var f = I(u, 2), p = F(f, !0);
					w(t), L((e, t, n, r, i) => {
						H(s, `${e ?? ""} `), q(l, "placeholder", t), H(d, `${n ?? ""} `), f.disabled = r, H(p, i);
					}, [
						() => J("lbl.newCollectionName"),
						() => J("ph.collections.name"),
						() => J("common.type"),
						() => !R(Po).trim(),
						() => J("ui.createCollection")
					]), z("keydown", l, (e) => e.key === "Enter" && rs()), ki(l, () => R(Po), (e) => M(Po, e)), z("click", f, rs), V(e, t);
				}, x = (e) => {
					var t = mf(), n = N(t), r = (e) => {
						var t = kl(), n = F(t, !0);
						L((e) => H(n, e), [() => J("hint.plugins.empty")]), V(e, t);
					}, i = /* @__PURE__ */ O(() => !Is().length);
					U(n, (e) => {
						R(i) && e(r);
					});
					var a = I(n, 2);
					Zr(a, 16, Is, (e) => e, (e, t) => {
						let n = /* @__PURE__ */ O(() => ks[t]), r = /* @__PURE__ */ O(() => (R($)?.enabled ?? []).includes(t));
						var i = uf();
						let a;
						var o = N(i), s = N(o), l = F(s, !0), u = I(s, 2), d = (e) => {
							var t = cf(), r = F(t);
							L(() => H(r, `v${R(n).version ?? ""}`)), V(e, t);
						};
						U(u, (e) => {
							R(n)?.version && e(d);
						});
						var f = I(u, 2), p = N(f), m = N(p);
						G(m);
						var h = I(m);
						w(p);
						var g = I(p, 2);
						W(g, () => c.cross, !0), w(g), w(f), w(o);
						var _ = I(o, 2), v = (e) => {
							var t = lf(), r = F(t, !0);
							L((e) => H(r, e), [() => R(n).errors.join("; ")]), V(e, t);
						}, y = (e) => {
							var t = lf(), r = F(t, !0);
							L((e) => H(r, e), [() => J("plugin.engineMismatch", {
								required: R(n).requiresEngine,
								current: R(As)
							})]), V(e, t);
						}, b = (e) => {
							var t = lf(), r = F(t, !0);
							L((e) => H(r, e), [() => J("plugin.cspNeeded", { list: Us(R(n).csp).join(", ") })]), V(e, t);
						}, x = /* @__PURE__ */ O(() => R(n)?.csp && Us(R(n).csp).length);
						U(_, (e) => {
							R(n)?.errors?.length ? e(v) : R(n) && !R(n).satisfied ? e(y, 1) : R(x) && e(b, 2);
						});
						var S = I(_, 2), C = (e) => {
							var t = kl(), r = F(t, !0);
							L((e) => H(r, e), [() => J("plugin.languages", { list: R(n).languages.map((e) => e.name).join(", ") })]), V(e, t);
						};
						U(S, (e) => {
							R(n)?.languages?.length && e(C);
						}), w(i), L((e, t, o, s, c) => {
							a = vi(i, 1, "plugin-row svelte-1n46o8q", null, a, { "plugin-broken": R(n)?.errors?.length }), H(l, e), q(p, "title", t), Ti(m, R(r)), m.disabled = o, H(h, ` ${s ?? ""}`), q(g, "title", c);
						}, [
							() => R(n)?.names?.[qi()] ?? R(n)?.name ?? t,
							() => R(r) ? J("tip.plugins.on") : J("tip.plugins.off"),
							() => !!R(n)?.errors?.length,
							() => R(r) ? J("ui.on") : J("ui.off"),
							() => J("tip.plugins.remove")
						]), z("change", m, (e) => ic(t, e.target.checked)), z("click", g, () => oc(t)), V(e, i);
					});
					var o = I(a, 2), s = (e) => {
						var t = ff(), n = I(P(t), 2), r = F(n, !0);
						Zr(I(n, 2), 16, () => R(Ns), (e) => e, (e, t) => {
							var n = df(), r = N(n), i = N(r), a = F(i, !0), o = I(i, 2), s = (e) => {
								var n = cf(), r = F(n);
								L(() => H(r, `v${ks[t].version ?? ""}`)), V(e, n);
							};
							U(o, (e) => {
								ks[t]?.version && e(s);
							});
							var l = I(o, 2), u = N(l);
							W(u, () => c.right, !0), w(u), w(l), w(r), w(n), L((e, t) => {
								H(a, e), q(u, "title", t);
							}, [() => ks[t]?.names?.[qi()] ?? ks[t]?.name ?? t, () => J("tip.plugins.addFound")]), z("click", u, () => cc(t)), V(e, n);
						}), L((e) => H(r, e), [() => J("hint.plugins.found")]), V(e, t);
					};
					U(o, (e) => {
						R(Ns).length && e(s);
					});
					var l = I(o, 2), u = (e) => {
						var t = Ir(), n = P(t), r = (e) => {
							var t = kl(), n = F(t, !0);
							L((e) => H(n, e), [() => J("hint.plugins.autoDiscover")]), V(e, t);
						};
						U(n, (e) => {
							R(Ns).length || e(r);
						}), V(e, t);
					}, d = (e) => {
						var t = pf(), n = I(P(t), 2);
						G(n);
						var r = I(n, 2), i = F(r, !0), a = I(r, 2), o = (e) => {
							var t = lf(), n = F(t, !0);
							L(() => H(n, R(Ms))), V(e, t);
						};
						U(a, (e) => {
							R(Ms) && e(o);
						}), L((e, t, a) => {
							q(n, "placeholder", e), r.disabled = t, H(i, a);
						}, [
							() => J("ph.plugins.folder"),
							() => !R(js).trim(),
							() => J("ui.addPlugin")
						]), z("keydown", n, (e) => e.key === "Enter" && sc()), ki(n, () => R(js), (e) => M(js, e)), z("click", r, sc), V(e, t);
					};
					U(l, (e) => {
						R(Fs) === "ok" ? e(u) : e(d, -1);
					}), w(t), V(e, t);
				}, S = (e) => {
					var t = Ud(), n = N(t), r = (e) => {
						var t = kl(), n = F(t, !0);
						L((e) => H(n, e), [() => J("hint.history.loading")]), V(e, t);
					}, i = (e) => {
						var t = _f(), n = P(t), r = (e) => {
							var t = kl(), n = F(t, !0);
							L(() => H(n, R($r))), V(e, t);
						};
						U(n, (e) => {
							R($r) && e(r);
						});
						var i = I(n, 2), a = (e) => {
							var t = gf(), n = P(t), r = F(n, !0);
							Zr(I(n, 2), 19, () => R(Qr), (e) => e.sha, (e, t, n) => {
								var r = hf();
								let i;
								var a = N(r), o = F(a, !0), s = F(I(a, 2));
								w(r), L((e) => {
									i = vi(r, 1, "history-row svelte-1n46o8q", null, i, { head: R(n) === 0 }), q(a, "title", R(t).sha), H(o, R(t).message), H(s, `${R(t).author ?? ""}${e ?? ""}`);
								}, [() => R(t).date ? ` · ${ni.format(new Date(R(t).date))}` : ""]), V(e, r);
							}), L((e, t) => {
								n.disabled = R(ei) || !R(ne)?.allowed, q(n, "title", e), H(r, t);
							}, [() => R(ne)?.allowed ? J("tip.history.revert") : J("tip.history.needsAccess"), () => J("ui.revertLast")]), z("click", n, ii), V(e, t);
						};
						U(i, (e) => {
							R(Qr).length > 0 && e(a);
						}), V(e, t);
					};
					U(n, (e) => {
						R(Qr) === null ? e(r) : e(i, -1);
					}), w(t), V(e, t);
				}, C = (e) => {
					var t = Ud(), n = N(t), r = (e) => {
						var t = kl(), n = F(t, !0);
						L((e) => H(n, e), [() => J("update.checking")]), V(e, t);
					}, i = (e) => {
						var t = vf(), n = P(t), r = F(n, !0), i = I(n, 2), a = F(i, !0);
						L((e) => {
							H(r, R(li)), H(a, e);
						}, [() => J("update.retry")]), z("click", i, pi), V(e, t);
					}, a = (e) => {
						var t = kf(), n = P(t), r = N(n), i = F(r, !0), a = I(r, 2), o = (e) => {
							var t = yf(), n = P(t);
							W(n, () => c.right, !0), w(n);
							var r = F(I(n, 2), !0);
							L(() => H(r, R(ci).target)), V(e, t);
						};
						U(a, (e) => {
							R(ci).upToDate || e(o);
						}), w(n);
						var s = I(n, 2), l = (e) => {
							var t = kl(), n = F(t, !0);
							L((e) => H(n, e), [() => J("update.upToDate")]), V(e, t);
						}, u = (e) => {
							var t = Of(), n = P(t), r = F(n, !0), i = I(n, 2), a = (e) => {
								var t = bf(), n = N(t), r = F(n, !0), i = I(n, 2), a = F(N(i), !0);
								w(i), w(t), L((e) => {
									H(r, e), H(a, R(ci).notes);
								}, [() => J("update.aboutVersion", { target: R(ci).target })]), V(e, t);
							};
							U(i, (e) => {
								R(ci).notes && e(a);
							});
							var o = I(i, 2), s = (e) => {
								var t = xf(), n = N(t), r = N(n);
								W(r, () => c.warn, !0), w(r);
								var i = I(r);
								w(n);
								var a = I(n, 2), o = F(N(a), !0);
								w(a), w(t), L((e, t) => {
									q(n, "title", e), H(i, ` ${t ?? ""}`), H(o, R(ci).headers.upstream);
								}, [() => J("update.headersManual"), () => J("update.headersTitle")]), V(e, t);
							};
							U(o, (e) => {
								R(ci).headers?.upstream && e(s);
							});
							var l = I(o, 2);
							Zr(l, 17, () => R(ci).changes.filter((e) => e.atom && e.conflict), (e) => e.path, (e, t) => {
								var n = Cf(), r = N(n), i = F(r, !0), a = I(r, 2), o = N(a), s = (e) => {
									var t = Sf(), n = F(t, !0);
									L((e) => H(n, e), [() => J("update.actionDelete")]), V(e, t);
								};
								U(o, (e) => {
									R(t).action === "delete" && e(s);
								});
								var l = I(o, 2);
								W(l, () => c.warn, !0), w(l), w(a), w(n), L((e) => {
									q(r, "title", R(t).path), H(i, R(t).path), q(l, "title", e);
								}, [() => J(`update.conflict.${R(t).conflict}`)]), V(e, n);
							});
							var u = I(l, 2), d = N(u), f = F(d), p = I(d, 2);
							Zr(p, 21, () => R(ci).changes.filter((e) => e.atom && !e.conflict), (e) => e.path, (e, t) => {
								var n = wf(), r = N(n), i = F(r, !0), a = I(r, 2), o = (e) => {
									var t = Sf(), n = F(t, !0);
									L((e) => H(n, e), [() => J("update.actionDelete")]), V(e, t);
								};
								U(a, (e) => {
									R(t).action === "delete" && e(o);
								}), w(n), L(() => {
									q(r, "title", R(t).path), H(i, R(t).path);
								}), V(e, n);
							}), w(p), w(u);
							var m = I(u, 2), h = (e) => {
								var t = Df(), n = P(t), r = N(n), i = F(r, !0), a = F(I(r, 2), !0);
								w(n), Zr(I(n, 2), 17, () => R(ci).changes.filter((e) => !e.atom), (e) => e.path, (e, t) => {
									var n = Ef(), r = N(n);
									let i;
									var a = F(r, !0), o = I(r, 2), s = N(o), l = (e) => {
										var t = Sf(), n = F(t, !0);
										L((e) => H(n, e), [() => J("update.actionDelete")]), V(e, t);
									};
									U(s, (e) => {
										R(t).action === "delete" && e(l);
									});
									var u = I(s, 2), d = (e) => {
										var n = Tf();
										W(n, () => c.warn, !0), w(n), L((e) => q(n, "title", e), [() => J(`update.conflict.${R(t).conflict}`)]), V(e, n);
									};
									U(u, (e) => {
										R(t).conflict && e(d);
									});
									var f = I(u, 2);
									G(f), w(o), w(n), L((e, n, o, s) => {
										i = vi(r, 1, "update-path svelte-1n46o8q", null, i, { skipped: e }), q(r, "title", R(t).path), H(a, R(t).path), Ti(f, n), q(f, "title", o), q(f, "aria-label", s);
									}, [
										() => R(fi).has(R(t).path),
										() => R(fi).has(R(t).path),
										() => J("update.keepMine.title"),
										() => J("update.keepMine")
									]), z("change", f, () => mi(R(t).path)), V(e, n);
								}), L((e, t) => {
									H(i, e), H(a, t);
								}, [() => J("update.optionalTitle"), () => J("update.keepMine")]), V(e, t);
							}, g = /* @__PURE__ */ O(() => R(ci).changes.some((e) => !e.atom));
							U(m, (e) => {
								R(g) && e(h);
							});
							var _ = I(m, 2), v = F(_, !0);
							L((e, t, n, i, a, o) => {
								H(r, e), q(d, "title", t), H(f, `${n ?? ""} · ${i ?? ""}`), _.disabled = R(ui) || !R(ne)?.allowed, q(_, "title", a), H(v, o);
							}, [
								() => J("update.summary", {
									writes: R(ci).changes.filter((e) => e.action === "write").length,
									deletes: R(ci).changes.filter((e) => e.action === "delete").length
								}),
								() => J("update.atomGroup.title"),
								() => J("update.atomTitle"),
								() => R(ci).changes.filter((e) => e.atom).length,
								() => R(ne)?.allowed ? J("update.run.title") : J("tip.history.needsAccess"),
								() => J("update.run", { target: R(ci).target })
							]), z("click", _, hi), V(e, t);
						};
						U(s, (e) => {
							R(ci).upToDate ? e(l) : e(u, -1);
						}), L((e) => H(i, e), [() => J("update.current", { version: R(ci).current })]), V(e, t);
					};
					U(n, (e) => {
						R(ui) && !R(ci) ? e(r) : R(li) ? e(i, 1) : R(ci) && e(a, 2);
					}), w(t), V(e, t);
				};
				U(s, (e) => {
					R(bt) === "pages" ? e(l) : R(bt) === "nav" ? e(u, 1) : R(bt) === "site" ? e(d, 2) : R(bt) === "theme" ? e(p, 3) : R(bt) === "blocks" ? e(m, 4) : R(bt) === "grid" ? e(g, 5) : R(bt) === "properties" ? e(v, 6) : R(bt) === "footer" ? e(y, 7) : R(bt) === "collections" ? e(b, 8) : R(bt) === "plugins" ? e(x, 9) : R(bt) === "history" ? e(S, 10) : R(bt) === "update" && e(C, 11);
				}), w(t), L((e) => {
					q(i, "title", e), H(o, Ct[R(bt)]);
				}, [() => wt[R(bt)]?.map((e) => J(e)).join("\n")]), V(e, t);
			};
			U(v, (e) => {
				R(bt) && e(y);
			}), L((e) => {
				p = vi(u, 1, "rail-gear svelte-1n46o8q", null, p, { active: R(Ei) }), q(u, "title", e);
			}, [() => J("settings.title")]), z("click", u, () => M(Ei, !R(Ei))), V(e, t);
		};
		U(i, (e) => {
			R(ie) && e(o);
		});
		var s = I(i, 2);
		let u;
		var p = N(s), m = N(p);
		Ni(m, (e) => M(te, e), () => R(te)), w(p), w(s), Ni(s, (e) => M(_e, e), () => R(_e)), w(t), L((e) => {
			u = vi(s, 1, "frame-wrap svelte-1n46o8q", null, u, {
				mobile: R(ge) === "mobile",
				pan: R(Ae),
				fold: R(we) > 0
			}), bi(p, `width:${R(Oe) ?? ""}px; height:${R(ke) ?? ""}px`), q(m, "title", e), q(m, "src", `/?page=${R(_)}&preview=1`), bi(m, `width:${R(Ce) ?? ""}px; height:${R(De) ?? ""}px; transform:scale(${R(Te) ?? ""}); transform-origin:top left`);
		}, [() => J("ui.previewTitle")]), Er("load", m, Si), wr(m), V(e, t);
	}, Sm = (e) => {
		var t = Nf(), n = F(t, !0);
		L((e) => H(n, e), [() => J("ui.loading")]), V(e, t);
	};
	U(bm, (e) => {
		R(g) ? e(xm) : e(Sm, -1);
	});
	var Cm = I(bm, 2), wm = (e) => {
		vo(e, {
			get image() {
				return R(va);
			},
			onapply: Ea,
			oncancel: () => M(va, null)
		});
	};
	U(Cm, (e) => {
		R(va) && e(wm);
	});
	var Tm = I(Cm, 2), Em = (e) => {
		var t = Ff(), n = N(t), r = N(n), i = F(r, !0), a = I(r, 2);
		Zr(a, 16, () => R(st).lines, (e) => e, (e, t) => {
			var n = Pf(), r = F(n, !0);
			L(() => H(r, t)), V(e, n);
		});
		var o = I(a, 2), s = (e) => {
			var t = Vl();
			G(t), dt(t, !0), L(() => q(t, "placeholder", R(st).placeholder)), z("keydown", t, (e) => e.key === "Enter" && R(st).value.trim() && ut(!0)), ki(t, () => R(st).value, (e) => R(st).value = e), V(e, t);
		};
		U(o, (e) => {
			R(st).prompt && e(s);
		});
		var c = I(o, 2), l = N(c), u = F(l, !0), d = I(l, 2), f = F(d, !0);
		w(c), w(n), w(t), L(() => {
			H(i, R(st).title), H(u, R(st).cancelLabel), H(f, R(st).okLabel);
		}), z("pointerdown", t, (e) => pt = e.target === e.currentTarget), z("click", t, (e) => pt && e.target === e.currentTarget && ut(!1)), z("click", l, () => ut(!1)), z("click", d, () => ut(!0)), V(e, t);
	};
	U(Tm, (e) => {
		R(st) && e(Em);
	});
	var Dm = I(Tm, 2), Om = (e) => {
		var t = If(), n = N(t), r = N(n), i = F(r, !0), a = I(r, 2), o = F(a, !0), s = I(a, 2), c = N(s), l = I(c);
		G(l), w(s);
		var u = I(s, 2), d = N(u), f = I(d);
		{
			let e = /* @__PURE__ */ O(() => J("setup.accentPick"));
			fa(f, {
				get value() {
					return R(gt);
				},
				get label() {
					return R(e);
				},
				onchange: (e) => M(gt, e, !0)
			});
		}
		w(u);
		var p = I(u, 2), m = N(p), h = I(m);
		{
			let e = /* @__PURE__ */ O(() => J("setup.bgLabel"));
			fa(h, {
				get value() {
					return R(_t);
				},
				get label() {
					return R(e);
				},
				onchange: (e) => M(_t, e, !0)
			});
		}
		w(p);
		var g = I(p, 2), _ = F(g, !0), v = I(g, 2), y = N(v), b = F(y, !0), x = I(y, 2), S = F(x, !0);
		w(v), w(n), w(t), L((e, t, n, r, a, s, u, f, p, h) => {
			H(i, e), H(o, t), H(c, `${n ?? ""} `), q(l, "placeholder", r), H(d, `${a ?? ""} `), H(m, `${s ?? ""} `), H(_, u), H(b, f), x.disabled = p, H(S, h);
		}, [
			() => J("setup.title"),
			() => J("setup.intro"),
			() => J("setup.nameLabel"),
			() => J("ph.setup.name"),
			() => J("setup.accentLabel"),
			() => J("setup.bgLabel"),
			() => J("setup.outro"),
			() => J("setup.skip"),
			() => !R(ht).trim(),
			() => J("setup.start")
		]), z("keydown", l, (e) => e.key === "Enter" && yt()), ki(l, () => R(ht), (e) => M(ht, e)), z("click", y, vt), z("click", x, yt), V(e, t);
	};
	U(Dm, (e) => {
		R(mt) && e(Om);
	});
	var km = I(Dm, 2), Am = (e) => {
		var t = Lf();
		let n;
		var r = N(t), i = F(r, !0), a = I(r, 2);
		w(t), L((e) => {
			n = vi(t, 1, "toast svelte-1n46o8q", null, n, {
				ok: R(b) === "ok",
				error: R(b) === "error"
			}), H(i, R(y)), q(a, "title", e);
		}, [() => J("ui.close")]), z("click", a, () => S("")), V(e, t);
	};
	U(km, (e) => {
		R(y) && e(Am);
	}), w(im);
	var jm = I(im, 2), Mm = (e) => {
		var t = Rf(), n = N(t), r = N(n), i = F(r, !0), o = I(r, 2);
		W(o, () => c.cross, !0), w(o), w(n);
		var s = I(n, 2), l = N(s);
		a(l), w(s), w(t), L((e, n) => {
			bi(t, `left: ${R(It).left ?? ""}px; top: ${R(It).top ?? ""}px`), H(i, e), q(o, "title", n);
		}, [() => J("blocks.suffix", { label: hn[R(k).type] ?? R(k).type }), () => J("tip.closeEsc")]), z("click", o, () => M(It, null)), V(e, t);
	};
	U(jm, (e) => {
		R(It) && R(k) && e(Mm);
	}), L(() => cm = vi(sm, 1, "topbar svelte-1n46o8q", null, cm, { hidden: !R(ie) })), V(e, rm), Ze();
}
//#endregion
//#region src/main.js
Dr([
	"click",
	"input",
	"pointerdown",
	"change",
	"keydown"
]), document.documentElement.lang = await Xi();
var Vf = Hr(Bf, { target: document.getElementById("urd-admin") });
//#endregion
export { Vf as default };
