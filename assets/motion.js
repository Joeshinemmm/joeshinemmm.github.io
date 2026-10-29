/* 조유민 포트폴리오 · 메뉴 현재 위치와 경력 진행선 (2026-10-28)
   읽는 위치에 맞춰 상단 메뉴의 해당 항목을 강조하고, 경력 칸이 보이면 진행선을 한 번 그린다.
   지원하지 않는 브라우저에서는 아무것도 하지 않으며, 진행선은 완성된 상태로 보인다. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var links = {};
  document.querySelectorAll('.nav a.link[href^="#"]').forEach(function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      Object.keys(links).forEach(function (id) { links[id].classList.remove('is-active'); });
      var active = links[entry.target.id];
      if (active) active.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(links).forEach(function (id) {
    var section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  var timeline = document.querySelector('.timeline');
  if (!timeline) return;
  timeline.classList.add('is-armed');
  var drawer = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    timeline.classList.add('is-drawn');
    drawer.disconnect();
  }, { threshold: 0.35 });
  drawer.observe(timeline);
})();
