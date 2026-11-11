/* 조유민 포트폴리오 · 화면 정보줄(현재 시각, 스크롤 비율, 마우스 좌표), 독 이동 강조, 사례 목차, 문장 밝아짐 (2026-11-11)
   스크립트가 없으면 정보줄은 숨겨지고, 독 링크는 그대로 사례 섹션으로 이동한다. */
(function () {
  var pad = function (n, w) { return String(n).padStart(w, '0'); };

  var clock = document.querySelector('[data-clock]');
  var tick = function () {
    if (!clock) return;
    var d = new Date();
    clock.textContent = pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ':' + pad(d.getSeconds(), 2);
  };
  tick();
  setInterval(tick, 1000);

  var scrollOut = document.querySelector('[data-scroll]');
  var xOut = document.querySelector('[data-x]');
  var yOut = document.querySelector('[data-y]');
  var scrollQueued = false;
  var onScroll = function () {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.round(window.scrollY / max * 100) : 0;
      if (scrollOut) scrollOut.textContent = pad(Math.min(100, Math.max(0, p)), 3);
      scrollQueued = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var px = 0, py = 0, moveQueued = false;
  window.addEventListener('pointermove', function (e) {
    px = e.clientX; py = e.clientY;
    if (moveQueued) return;
    moveQueued = true;
    requestAnimationFrame(function () {
      if (xOut) xOut.textContent = pad(Math.round(px), 4);
      if (yOut) yOut.textContent = pad(Math.round(py), 4);
      moveQueued = false;
    });
  }, { passive: true });

  // 독 타일: 아래 해당 사례로 이동한 뒤 그 카드를 잠깐 강조한다
  document.querySelectorAll('.dock a[href^="#case-"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      target.classList.remove('is-flash');
      setTimeout(function () {
        target.classList.add('is-flash');
        setTimeout(function () { target.classList.remove('is-flash'); }, 1600);
      }, 450);
    });
  });

  // 사례 섹션 왼쪽 목차: 지금 읽는 사례를 표시한다
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.case-index a[href^="#"]'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var mark = function (id) {
      tocLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + id); });
    };
    var tocObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) mark(entry.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    tocLinks.forEach(function (a) {
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) tocObserver.observe(target);
    });
  }

  // 스크롤하면 문장이 단어 단위로 밝아진다 (움직임 줄이기 설정이면 하지 않는다)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lits = reduce ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-lit]'));
  lits.forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'lit-word';
      span.textContent = w;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.classList.add('is-split');
  });
  var litQueued = false;
  var lightUp = function () {
    if (litQueued || !lits.length) return;
    litQueued = true;
    requestAnimationFrame(function () {
      var vh = window.innerHeight;
      var remain = Math.max(0, document.documentElement.scrollHeight - vh - window.scrollY);
      lits.forEach(function (el) {
        var r = el.getBoundingClientRect();
        // 페이지 끝에 가까운 문장은 더 올라가지 못하므로, 끝까지 내렸을 때의 위치에서 다 채워지게 한다
        var start = vh * 0.9;
        var end = Math.max(vh * 0.45, r.top - remain);
        if (end > start - vh * 0.2) start = end + vh * 0.2;
        var p = Math.min(1, Math.max(0, (start - r.top) / (start - end)));
        var spans = el.querySelectorAll('.lit-word');
        var n = Math.round(p * spans.length);
        for (var i = 0; i < spans.length; i++) spans[i].classList.toggle('on', i < n);
      });
      litQueued = false;
    });
  };
  window.addEventListener('scroll', lightUp, { passive: true });
  window.addEventListener('resize', lightUp);
  lightUp();

})();
