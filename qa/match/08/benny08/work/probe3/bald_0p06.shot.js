const m = Q.scene.getObjectByName('Benny').getObjectByName('fur_body');
const u = m.userData.furU; if (!u) return 'no furU';
if (window.__bw === undefined) window.__bw = u.uBald.value.w;
u.uBald.value.w = window.__bw + 0.06; Q.composer.render();
return { base: window.__bw, w: u.uBald.value.w, xyz: u.uBald.value.toArray() };
