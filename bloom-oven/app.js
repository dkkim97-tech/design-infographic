/* ============================================================
   Bloom Oven — front-end interactions
   ============================================================ */
(function () {
  "use strict";
  var STORE_KEY = "bloom_reservations";

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Back to top ---------- */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    var onScroll = function () {
      if (window.scrollY > 480) toTop.classList.add("show");
      else toTop.classList.remove("show");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Reservation form ---------- */
  var form = document.querySelector(".reservation-form");
  if (form) {
    var notice = form.querySelector(".form-notice");
    var setNotice = function (msg, type) {
      if (!notice) return;
      notice.textContent = msg;
      notice.className = "form-notice" + (type ? " " + type : "");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());

      if (!data.name || !data.phone || !data.pickup_date || !data.menu || !data.quantity) {
        setNotice("필수 항목(이름, 연락처, 수령일, 메뉴, 수량)을 모두 입력해주세요.", "err");
        return;
      }
      if (data.delivery_type === "배송 요청" && !data.address) {
        setNotice("배송을 선택하신 경우 주소를 입력해주세요.", "err");
        var addr = form.querySelector('input[name="address"]');
        if (addr) addr.focus();
        return;
      }

      var record = {
        id: Date.now(),
        created: new Date().toISOString(),
        status: "new",
        name: data.name,
        phone: data.phone,
        email: data.email || "",
        pickup_date: data.pickup_date,
        menu: data.menu,
        quantity: data.quantity,
        delivery_type: data.delivery_type || "매장 픽업",
        address: data.address || "",
        request: data.request || ""
      };

      try {
        var list = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
        list.unshift(record);
        localStorage.setItem(STORE_KEY, JSON.stringify(list));
      } catch (err) { /* storage unavailable — still confirm to user */ }

      form.reset();
      setNotice("예약 신청이 접수되었습니다. 확인 후 순차적으로 연락드리겠습니다. 감사합니다 ✿", "ok");
    });
  }
})();
