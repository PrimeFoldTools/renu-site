// RENU house geometry, in the logo's own 2048 px space. One axis, one roof pitch, one offset.
// The thick line is the house outline; the thin line is that outline offset outward by a constant gap.
const G = { AX: 1015, K: 0.72, APY: 218, EY: 612, WL: 560, WR: 1470, BY: 1158, CL: 1266, CR: 1398, CT: 310, OFF: 46, GOLD_IN: 80 };
G.roofY = x => G.APY + Math.abs(x - G.AX) * G.K;
G.XE = G.AX - (G.EY - G.APY) / G.K;                       // eave tip of the thick line
G.HMAX = G.roofY(G.CR) - G.CT;                            // chimney height at full growth
// thick outline, starting at the bottom centre, going left and round. h = chimney height above the roof (0..HMAX)
G.thick = h => {
  h = Math.max(h, 0.6); const lt = Math.max(G.CT, G.roofY(G.CL) - h), rt = Math.max(G.CT, G.roofY(G.CR) - h);
  return [[G.AX, G.BY], [G.WL, G.BY], [G.WL, G.EY], [G.XE, G.EY], [G.AX, G.APY],
          [G.CL, G.roofY(G.CL)], [G.CL, lt], [G.CR, rt], [G.CR, G.roofY(G.CR)],
          [2 * G.AX - G.XE, G.EY], [G.WR, G.EY], [G.WR, G.BY]];
};
G.APEX = 4;
// miter offset of a closed polygon; d > 0 = outward
G.offset = (P, d) => {
  const n = P.length; let area = 0;
  for (let i = 0; i < n; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % n]; area += x1 * y2 - x2 * y1; }
  const s = area > 0 ? 1 : -1;                              // pick the normal that points outward
  const L = P.map((p, i) => { const q = P[(i + 1) % n]; const dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy) || 1;
    const nx = s * dy / len, ny = -s * dx / len; return { p: [p[0] + nx * d, p[1] + ny * d], v: [dx, dy], nx, ny }; });
  return P.map((p, i) => { const a = L[(i - 1 + n) % n], b = L[i]; const den = a.v[0] * b.v[1] - a.v[1] * b.v[0];
    if (Math.abs(den) < 1e-6) return [p[0] + b.nx * d, p[1] + b.ny * d];
    const t = ((b.p[0] - a.p[0]) * b.v[1] - (b.p[1] - a.p[1]) * b.v[0]) / den; return [a.p[0] + a.v[0] * t, a.p[1] + a.v[1] * t]; });
};
G.thin = h => G.offset(G.thick(h), G.OFF);
G.path = (P, close) => 'M' + P.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + (close ? ' Z' : '');
// the two halves, both drawn from the apex down to the bottom centre (for a symmetric draw-on)
G.halves = P => [G.path([P[4], P[3], P[2], P[1], P[0]]), G.path(P.slice(4).concat([P[0]]))];
// house silhouette without the chimney (for the solid house that rises in)
G.silhouette = () => { const T = G.thick(0.6); return G.offset([T[0], T[1], T[2], T[3], T[4], T[9], T[10], T[11]], G.OFF); };
// gold inner frame: the plain pentagon, offset inward
G.gold = () => G.path(G.offset([[G.AX, G.BY], [G.WL, G.BY], [G.WL, G.roofY(G.WL)], [G.AX, G.APY], [G.WR, G.roofY(G.WR)], [G.WR, G.BY]], -G.GOLD_IN), true);
// keyhole on the axis
G.key = () => { const cx = G.AX, cy = 600, r = 131, nx = 75.5, ny = cy + Math.sqrt(r * r - nx * nx);
  return `M${cx - nx} ${ny.toFixed(1)} A${r} ${r} 0 1 1 ${cx + nx} ${ny.toFixed(1)} L${cx + 128} 1015 L${cx - 128} 1015 Z`; };
if (typeof module !== 'undefined') module.exports = G;
