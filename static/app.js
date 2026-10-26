/* ============================================================
   留言板 · 交互
   1) 稿件按阅读顺序依次入场
   2) 字数计量与输入框随内容长高
   3) 时间先显示"几分钟前"，完整时间留在 title 里
   4) 发布成功后给一句确认，几秒后退场
   5) 提交反馈，删除前确认并且淡出后再走
   ============================================================ */
(function () {
    'use strict';

    var reduceMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 1. 依次入场 ---------- */
    if (!reduceMotion) {
        document.querySelectorAll('.feed .entry').forEach(function (el, i) {
            el.style.setProperty('--d', Math.min(i, 7) * 55 + 'ms');
        });
    }

    /* ---------- 2. 字数 + 高度 ---------- */
    function autosize(el) {
        var max = 220;
        el.style.height = 'auto';
        var next = Math.min(el.scrollHeight, max);
        el.style.height = next + 'px';
        el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
    }

    document.querySelectorAll('textarea').forEach(function (el) {
        var counter = el.id
            ? document.querySelector('[data-counter-for="' + el.id + '"]')
            : null;

        function sync() {
            if (counter) counter.textContent = String(el.value.trim().length);
            autosize(el);
        }

        el.addEventListener('input', sync);
        sync();

        window.addEventListener('resize', function () {
            autosize(el);
        });
    });

    /* ---------- 3. 相对时间 ---------- */
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };

    function relative(date, now) {
        var diff = (now - date) / 1000;
        if (diff < 60) return '刚刚';
        if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前';

        var sameDay =
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();
        if (sameDay) return '今天 ' + pad(date.getHours()) + ':' + pad(date.getMinutes());

        var yesterday = new Date(now.getTime() - 86400000);
        var isYesterday =
            date.getFullYear() === yesterday.getFullYear() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getDate() === yesterday.getDate();
        if (isYesterday) return '昨天 ' + pad(date.getHours()) + ':' + pad(date.getMinutes());

        if (date.getFullYear() === now.getFullYear()) {
            return (date.getMonth() + 1) + ' 月 ' + date.getDate() + ' 日 ' +
                pad(date.getHours()) + ':' + pad(date.getMinutes());
        }
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
            ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
    }

    var now = new Date();
    document.querySelectorAll('time.stamp[datetime]').forEach(function (el) {
        var date = new Date(el.getAttribute('datetime'));
        if (isNaN(date.getTime())) return;
        el.textContent = relative(date, now);
    });

    /* ---------- 4. 发布成功的确认 ---------- */
    var status = document.querySelector('[data-status]');
    if (status) {
        // 刷新页面不该再看到一次"已发布"
        if (window.history && window.history.replaceState && window.location.search) {
            window.history.replaceState(null, document.title, window.location.pathname);
        }
        window.setTimeout(function () {
            if (status.parentNode) status.parentNode.removeChild(status);
        }, 4600);
    }

    /* ---------- 5. 提交与删除 ---------- */
    document.querySelectorAll('form.form-box').forEach(function (form) {
        form.addEventListener('submit', function () {
            var btn = form.querySelector('button[type="submit"]');
            if (!btn) return;
            btn.disabled = true;
            var label = btn.getAttribute('data-submit-label');
            if (label) btn.textContent = label;
        });
    });

    document.querySelectorAll('form[data-confirm]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!window.confirm(form.getAttribute('data-confirm'))) {
                event.preventDefault();
                return;
            }
            if (reduceMotion) return;

            var entry = form.closest('.entry');
            if (!entry) return;
            event.preventDefault();
            entry.classList.add('is-leaving');
            window.setTimeout(function () { form.submit(); }, 190);
        });
    });
})();
