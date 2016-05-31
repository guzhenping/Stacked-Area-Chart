define("echarts/chart/eventRiver", ["require", "./base", "../layout/eventRiver", "zrender/shape/Polygon", "../component/axis", "../component/grid", "../component/dataZoom", "../config", "../util/ecData", "../util/date", "zrender/tool/util", "zrender/tool/color", "../chart"], function(e) {
	function t(e, t, n, a, o) {
		i.call(this, e, t, n, a, o);
		var r = this;
		r._ondragend = function() {
			r.isDragend = !0
		}, this.refresh(a)
	}
	var i = e("./base"),
		n = e("../layout/eventRiver"),
		a = e("zrender/shape/Polygon");
	e("../component/axis"), e("../component/grid"), e("../component/dataZoom");
	var o = e("../config");
	o.eventRiver = {
		zlevel: 0,
		z: 2,
		clickable: !0,
		//鼠标经过legend时候，label显示
		legendHoverLink: !0,
		itemStyle: {
			normal: {
				borderColor: "rgba(0,0,0,0)",
				borderWidth: 1,
				label: {
					show: !0,
					textStyle :{
						//lable颜色
						// color: 'rgb(' + [
						//                 Math.round(Math.random() * 160),
						//                 Math.round(Math.random() * 160),
						//                 Math.round(Math.random() * 160)
						//             ].join(',') + ')',
						color:'#8B7D7B',
						//修改字体大小
						fontSize :'13'
					},
					position: "inside",
					formatter: "{b}"
				}
			},
			emphasis: {
				borderColor: "rgba(0,0,0,0)",
				borderWidth: 1,
				label: {
					show: !0
				}
			}
		}
	};
	var r = e("../util/ecData"),
		s = e("../util/date"),
		l = e("zrender/tool/util"),
		h = e("zrender/tool/color");
	return t.prototype = {
		type: o.CHART_TYPE_EVENTRIVER,
		_buildShape: function() {
			var e = this.series;
			this.selectedMap = {}, this._dataPreprocessing();
			for (var t = this.component.legend, i = [], a = 0; a < e.length; a++)
				if (e[a].type === this.type) {
					e[a] = this.reformOption(e[a]), this.legendHoverLink = e[a].legendHoverLink || this.legendHoverLink;
					var o = e[a].name || "";
					if (this.selectedMap[o] = t ? t.isSelected(o) : !0, !this.selectedMap[o]) continue;
					this.buildMark(a), i.push(this.series[a])
				}
			n(i, this._intervalX, this.component.grid.getArea()), this._drawEventRiver(), this.addShapeList()
		},
		_dataPreprocessing: function() {
			for (var e, t, i = this.series, n = 0, a = i.length; a > n; n++)
				if (i[n].type === this.type) {
					e = this.component.xAxis.getAxis(i[n].xAxisIndex || 0);
					for (var o = 0, r = i[n].data.length; r > o; o++) {
						t = i[n].data[o].evolution;
						for (var l = 0, h = t.length; h > l; l++) t[l].timeScale = e.getCoord(s.getNewDate(t[l].time) - 0), t[l].valueScale = Math.pow(t[l].value, .8)
					}
				}
			this._intervalX = Math.round(this.component.grid.getWidth() / 40)
		},
		_drawEventRiver: function() {
			for (var e = this.series, t = 0; t < e.length; t++) {
				var i = e[t].name || "";
				if (e[t].type === this.type && this.selectedMap[i])
					for (var n = 0; n < e[t].data.length; n++) this._drawEventBubble(e[t].data[n], t, n)
			}
		},
		_drawEventBubble: function(e, t, i) {
			var n = this.series,
				o = n[t],
				s = o.name || "",
				l = o.data[i],
				m = [l, o],
				V = this.component.legend,
				U = V ? V.getColor(s) : this.zr.getColor(t),
				d = this.deepMerge(m, "itemStyle.normal") || {},
				p = this.deepMerge(m, "itemStyle.emphasis") || {},
				c = this.getItemStyleColor(d.color, t, i, l) || U,
				u = this.getItemStyleColor(p.color, t, i, l) || ("string" == typeof c ? h.lift(c, -.2) : c),
				y = this._calculateControlPoints(e),
				g = {
					zlevel: o.zlevel,
					z: o.z,
					clickable: this.deepQuery(m, "clickable"),
					style: {
						pointList: y,
						smooth: "spline",
						brushType: "both",
						lineJoin: "round",
						color: c,
						lineWidth: d.borderWidth,
						strokeColor: d.borderColor
					},
					highlightStyle: {
						color: u,
						lineWidth: p.borderWidth,
						strokeColor: p.borderColor
					},
					draggable: "vertical",
					ondragend: this._ondragend
				};
			g = new a(g), this.addLabel(g, o, l, e.name), r.pack(g, n[t], t, n[t].data[i], i, n[t].data[i].name), this.shapeList.push(g)
		},
		_calculateControlPoints: function(e) {
			var t = this._intervalX,
				i = e.y,
				n = e.evolution,
				a = n.length;
			if (!(1 > a)) {
				for (var o = [], r = [], s = 0; a > s; s++) o.push(n[s].timeScale), r.push(n[s].valueScale);
				var l = [];
				l.push([o[0], i]);
				var s = 0;
				for (s = 0; a - 1 > s; s++) l.push([(o[s] + o[s + 1]) / 2, r[s] / -2 + i]);
				for (l.push([(o[s] + (o[s] + t)) / 2, r[s] / -2 + i]), l.push([o[s] + t, i]), l.push([(o[s] + (o[s] + t)) / 2, r[s] / 2 + i]), s = a - 1; s > 0; s--) l.push([(o[s] + o[s - 1]) / 2, r[s - 1] / 2 + i]);
				return l
			}
		},
		ondragend: function(e, t) {
			this.isDragend && e.target && (t.dragOut = !0, t.dragIn = !0, t.needRefresh = !1, this.isDragend = !1)
		},
		refresh: function(e) {
			e && (this.option = e, this.series = e.series), this.backupShapeList(), this._buildShape()
		}
	}, l.inherits(t, i), e("../chart").define("eventRiver", t), t
}), define("echarts/layout/eventRiver", ["require"], function() {
	function e(e, i, o) {
		function r(e, t) {
			var i = e.importance,
				n = t.importance;
			return i > n ? -1 : n > i ? 1 : 0
		}
		for (var s = 4, l = 0; l < e.length; l++) {
			for (var h = 0; h < e[l].data.length; h++) {
				null == e[l].data[h].weight && (e[l].data[h].weight = 1);
				for (var m = 0, V = 0; V < e[l].data[h].evolution.length; V++) m += e[l].data[h].evolution[V].valueScale;
				e[l].data[h].importance = m * e[l].data[h].weight
			}
			e[l].data.sort(r)
		}
		for (var l = 0; l < e.length; l++) {
			null == e[l].weight && (e[l].weight = 1);
			for (var m = 0, h = 0; h < e[l].data.length; h++) m += e[l].data[h].weight;
			e[l].importance = m * e[l].weight
		}
		e.sort(r);
		for (var U = Number.MAX_VALUE, d = 0, l = 0; l < e.length; l++)
			for (var h = 0; h < e[l].data.length; h++)
				for (var V = 0; V < e[l].data[h].evolution.length; V++) {
					var p = e[l].data[h].evolution[V].timeScale;
					U = Math.min(U, p), d = Math.max(d, p)
				}
		U = ~~U, d = ~~d;
		for (var c = function() {
				var e = d - U + 1 + ~~i;
				if (0 >= e) return [0];
				for (var t = []; e--;) t.push(0);
				return t
			}(), u = c.slice(0), y = [], g = 0, b = 0, l = 0; l < e.length; l++)
			for (var h = 0; h < e[l].data.length; h++) {
				var f = e[l].data[h];
				f.time = [], f.value = [];
				for (var k, _ = 0, V = 0; V < e[l].data[h].evolution.length; V++) k = e[l].data[h].evolution[V], f.time.push(k.timeScale), f.value.push(k.valueScale), _ = Math.max(_, k.valueScale);
				n(f, i, U), f.y = a(u, f, function(e, t) {
					return e.ypx[t]
				}), f._offset = a(c, f, function() {
					return s
				}), g = Math.max(g, f.y + _), b = Math.max(b, f._offset), y.push(f)
			}
		t(y, o, g, b)
	}

	function t(e, t, i, n) {
		for (var a = t.height, o = n / a > .5 ? .5 : 1, r = t.y, s = (t.height - n) / i, l = 0, h = e.length; h > l; l++) {
			var m = e[l];
			m.y = r + s * m.y + m._offset * o, delete m.time, delete m.value, delete m.xpx, delete m.ypx, delete m._offset;
			for (var V = m.evolution, U = 0, d = V.length; d > U; U++) V[U].valueScale *= s
		}
	}

	function i(e, t, i, n) {
		if (e === i) throw new Error("x0 is equal with x1!!!");
		if (t === n) return function() {
			return t
		};
		var a = (t - n) / (e - i),
			o = (n * e - t * i) / (e - i);
		return function(e) {
			return a * e + o
		}
	}

	function n(e, t, n) {
		var a = ~~t,
			o = e.time.length;
		e.xpx = [], e.ypx = [];
		for (var r, s = 0, l = 0, h = 0, m = 0, V = 0; o > s; s++) {
			l = ~~e.time[s], m = e.value[s] / 2, s === o - 1 ? (h = l + a, V = 0) : (h = ~~e.time[s + 1], V = e.value[s + 1] / 2), r = i(l, m, h, V);
			for (var U = l; h > U; U++) e.xpx.push(U - n), e.ypx.push(r(U))
		}
		e.xpx.push(h - n), e.ypx.push(V)
	}

	function a(e, t, i) {
		for (var n, a = 0, o = t.xpx.length, r = 0; o > r; r++) n = i(t, r), a = Math.max(a, n + e[t.xpx[r]]);
		for (r = 0; o > r; r++) n = i(t, r), e[t.xpx[r]] = a + n;
		return a
	}
	return e
});