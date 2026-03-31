/**
 * Matt Anthony Photography — Conversion Optimization
 * 1. Discovery call page: social proof above scheduler
 * 2. Journal posts: mid-article CTA with quiz secondary
 * 3. Exit-intent popup on high-intent pages
 * 4. Quiz CTA banner on service, case study, bio, contact, homepage, pricing thank-you
 * 5. Journal index: quiz CTA between article grids
 */
(function() {
  'use strict';
  var path = window.location.pathname.replace(/\/$/, '') || '/';
  var QUIZ = 'https://mattanthonyphoto.github.io/photo-ready/';

  // ── Shared styles (injected once) ──
  var sharedCSS = document.createElement('style');
  sharedCSS.textContent = '' +
    '.ma-quiz-banner{max-width:720px;margin:48px auto;padding:36px 40px;background:linear-gradient(135deg,rgba(26,26,24,0.95),rgba(30,28,24,0.95));border:1px solid rgba(201,169,110,0.15);border-radius:8px;text-align:center;position:relative;overflow:hidden;}' +
    '.ma-quiz-banner::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#c9a96e,transparent);}' +
    '.ma-quiz-banner-label{font-family:"DM Sans",sans-serif;font-size:0.6rem;letter-spacing:0.25em;text-transform:uppercase;color:#c9a96e;margin-bottom:10px;}' +
    '.ma-quiz-banner h3{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400;font-size:1.4rem;color:#f6f4f0;margin-bottom:8px;line-height:1.4;}' +
    '.ma-quiz-banner h3 em{font-style:italic;color:#c9a96e;}' +
    '.ma-quiz-banner p{font-family:"DM Sans",sans-serif;font-size:0.8rem;color:#8a8579;line-height:1.6;margin-bottom:20px;max-width:460px;margin-left:auto;margin-right:auto;}' +
    '.ma-quiz-banner-btns{display:flex;justify-content:center;gap:16px;align-items:center;flex-wrap:wrap;}' +
    '.ma-quiz-btn{display:inline-block;padding:14px 32px;font-family:"DM Sans",sans-serif;font-size:0.72rem;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;border-radius:4px;text-decoration:none;transition:all 0.3s ease;}' +
    '.ma-quiz-btn-gold{background:#c9a96e;color:#1a1a18;border:1px solid #c9a96e;}' +
    '.ma-quiz-btn-gold:hover{background:#d4b87a;}' +
    '.ma-quiz-btn-outline{background:transparent;color:#f6f4f0;border:1px solid rgba(201,169,110,0.35);}' +
    '.ma-quiz-btn-outline:hover{border-color:#c9a96e;color:#c9a96e;background:rgba(201,169,110,0.06);}' +
    '.ma-quiz-btn-text{font-family:"DM Sans",sans-serif;font-size:0.7rem;color:#8a8579;text-decoration:none;transition:color 0.2s;}' +
    '.ma-quiz-btn-text:hover{color:#c9a96e;}' +
    '@media(max-width:600px){.ma-quiz-banner{margin:36px 16px;padding:28px 20px;}.ma-quiz-banner h3{font-size:1.2rem;}.ma-quiz-banner-btns{flex-direction:column;gap:10px;}}';
  document.head.appendChild(sharedCSS);

  // ── Helper: create a quiz banner ──
  function quizBanner(opts) {
    var el = document.createElement('div');
    el.className = 'ma-quiz-banner';
    var label = opts.label || 'Not sure where to start?';
    var headline = opts.headline || 'Find out if your project is <em>photo-ready</em>';
    var desc = opts.desc || 'Take a 60-second quiz and get a personalized recommendation based on your project stage, goals, and timeline.';
    var primaryText = opts.primaryText || 'Take the Quiz';
    var secondaryHref = opts.secondaryHref || '/discovery-call';
    var secondaryText = opts.secondaryText || 'Or book a call';

    el.innerHTML = '' +
      '<p class="ma-quiz-banner-label">' + label + '</p>' +
      '<h3>' + headline + '</h3>' +
      '<p>' + desc + '</p>' +
      '<div class="ma-quiz-banner-btns">' +
        '<a href="' + QUIZ + '" class="ma-quiz-btn ma-quiz-btn-gold">' + primaryText + '</a>' +
        '<a href="' + secondaryHref + '" class="ma-quiz-btn-text">' + secondaryText + '</a>' +
      '</div>';
    return el;
  }

  // ═══════════════════════════════════════════════════════════════
  // 1. DISCOVERY CALL — Social proof above the scheduler
  // ═══════════════════════════════════════════════════════════════
  if (path === '/discovery-call') {
    window.addEventListener('DOMContentLoaded', function() {
      var booking = document.querySelector('.dc-booking');
      if (!booking) return;

      var proofHTML = document.createElement('div');
      proofHTML.className = 'dc-proof-strip';
      proofHTML.innerHTML = '' +
        '<style>' +
        '.dc-proof-strip{max-width:680px;margin:0 auto 48px;padding:32px 40px;background:rgba(201,169,110,0.04);border:1px solid rgba(201,169,110,0.12);border-radius:8px;text-align:center;}' +
        '.dc-proof-strip .dc-proof-quote{font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-size:1.15rem;line-height:1.7;color:#d9d5cd;margin-bottom:16px;}' +
        '.dc-proof-strip .dc-proof-attr{font-family:"DM Sans",sans-serif;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:#8a8579;}' +
        '.dc-proof-strip .dc-proof-attr a{color:#c9a96e;text-decoration:none;}' +
        '.dc-proof-strip .dc-proof-attr a:hover{text-decoration:underline;}' +
        '.dc-proof-badges{display:flex;justify-content:center;gap:24px;margin-top:20px;padding-top:20px;border-top:1px solid rgba(201,169,110,0.08);}' +
        '.dc-proof-badge{font-family:"DM Sans",sans-serif;font-size:0.7rem;letter-spacing:0.05em;color:#8a8579;}' +
        '.dc-proof-badge strong{color:#c9a96e;font-size:0.85rem;display:block;margin-bottom:2px;}' +
        '.dc-proof-expect{max-width:540px;margin:0 auto 12px;font-family:"DM Sans",sans-serif;font-size:0.8rem;color:#8a8579;line-height:1.6;text-align:center;}' +
        '.dc-proof-expect strong{color:#d9d5cd;}' +
        '@media(max-width:600px){.dc-proof-strip{padding:24px 20px;margin:0 16px 36px;}.dc-proof-badges{gap:16px;flex-wrap:wrap;}}' +
        '</style>' +
        '<p class="dc-proof-quote">"Matt\'s photography helped us win two Georgie Awards. The images captured exactly what we were going for with the design."</p>' +
        '<p class="dc-proof-attr">Marc Harvey, Balmoral Construction &middot; <a href="/balmoral-construction">Case Study</a></p>' +
        '<div class="dc-proof-badges">' +
          '<div class="dc-proof-badge"><strong>50+</strong>Projects Shot</div>' +
          '<div class="dc-proof-badge"><strong>30+</strong>Clients</div>' +
          '<div class="dc-proof-badge"><strong>5</strong>Case Studies</div>' +
          '<div class="dc-proof-badge"><strong>7</strong>Regions</div>' +
        '</div>';

      var iframeWrap = booking.querySelector('.dc-booking-iframe');
      if (iframeWrap) {
        var expectP = document.createElement('p');
        expectP.className = 'dc-proof-expect';
        expectP.innerHTML = '<strong>20 minutes, zero obligation.</strong> We\'ll talk about your upcoming projects and whether working together makes sense. No pitch, no pressure.';
        booking.insertBefore(expectP, iframeWrap);
        booking.insertBefore(proofHTML, expectP);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. JOURNAL POSTS — Mid-article CTA + quiz secondary
  // ═══════════════════════════════════════════════════════════════
  if (path.indexOf('/journal/') === 0 && path !== '/journal') {
    window.addEventListener('DOMContentLoaded', function() {
      var articles = document.querySelectorAll('article.bl-body');
      if (articles.length < 2) return;

      var insertAfter = articles[1];
      var cta = document.createElement('div');
      cta.className = 'bl-inline-cta';
      cta.innerHTML = '' +
        '<style>' +
        '.bl-inline-cta{max-width:680px;margin:48px auto;padding:40px;background:linear-gradient(135deg,rgba(26,26,24,0.95),rgba(30,28,24,0.95));border:1px solid rgba(201,169,110,0.15);border-radius:8px;text-align:center;position:relative;overflow:hidden;}' +
        '.bl-inline-cta::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#c9a96e,transparent);}' +
        '.bl-inline-cta-label{font-family:"DM Sans",sans-serif;font-size:0.65rem;letter-spacing:0.25em;text-transform:uppercase;color:#c9a96e;margin-bottom:12px;}' +
        '.bl-inline-cta h3{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400;font-size:1.5rem;color:#f6f4f0;margin-bottom:10px;line-height:1.4;}' +
        '.bl-inline-cta p{font-family:"DM Sans",sans-serif;font-size:0.85rem;color:#8a8579;line-height:1.6;margin-bottom:24px;max-width:480px;margin-left:auto;margin-right:auto;}' +
        '.bl-inline-cta-btns{display:flex;justify-content:center;gap:16px;align-items:center;flex-wrap:wrap;}' +
        '@media(max-width:600px){.bl-inline-cta{margin:36px 5vw;padding:28px 20px;}.bl-inline-cta h3{font-size:1.25rem;}.bl-inline-cta-btns{flex-direction:column;gap:10px;}}' +
        '</style>' +
        '<p class="bl-inline-cta-label">Like what you\'re reading?</p>' +
        '<h3>Let\'s talk about your next project</h3>' +
        '<p>Find out if your project is ready for professional photography, or book a call to discuss your goals.</p>' +
        '<div class="bl-inline-cta-btns">' +
          '<a href="' + QUIZ + '" class="ma-quiz-btn ma-quiz-btn-gold">Take the Quiz</a>' +
          '<a href="/discovery-call" class="ma-quiz-btn ma-quiz-btn-outline">Book a Call</a>' +
        '</div>';

      insertAfter.parentNode.insertBefore(cta, insertAfter.nextSibling);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. EXIT-INTENT POPUP — All high-intent pages + homepage
  // ═══════════════════════════════════════════════════════════════
  var exitPages = [
    '/',
    '/pricing-guide-landing',
    '/pricing-guide-builders',
    '/project-photography',
    '/award-publication-imagery',
    '/construction-team-content',
    '/creative-partner',
    '/summerhill-fine-homes',
    '/balmoral-construction',
    '/sitelines-architecture',
    '/the-window-merchant',
    '/lrd-studio-interior-design',
    '/bio',
    '/process',
    '/projects',
    '/contact',
  ];

  var shouldShowExit = exitPages.indexOf(path) !== -1 ||
    document.querySelector('.pj-hero, .cs-hero, .sv-hero') ||
    path.indexOf('/journal/') === 0;

  if (shouldShowExit) {
    var exitShown = false;
    var dismissed = sessionStorage.getItem('ma_exit_dismissed');

    if (!dismissed) {
      var overlay = document.createElement('div');
      overlay.id = 'maExitOverlay';
      overlay.innerHTML = '' +
        '<style>' +
        '#maExitOverlay{position:fixed;inset:0;z-index:999999;background:rgba(10,10,8,0.75);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;opacity:0;transition:opacity 0.4s ease;}' +
        '#maExitOverlay.ma-exit-show{display:flex;opacity:1;}' +
        '.ma-exit-card{background:#1a1a18;border:1px solid rgba(201,169,110,0.15);border-radius:8px;max-width:460px;width:90%;padding:48px 40px;text-align:center;position:relative;transform:translateY(20px);transition:transform 0.4s cubic-bezier(0.16,1,0.3,1);}' +
        '#maExitOverlay.ma-exit-show .ma-exit-card{transform:translateY(0);}' +
        '.ma-exit-close{position:absolute;top:16px;right:16px;background:none;border:none;color:#8a8579;font-size:18px;cursor:pointer;padding:4px 8px;transition:color 0.2s;}' +
        '.ma-exit-close:hover{color:#f6f4f0;}' +
        '.ma-exit-label{font-family:"DM Sans",sans-serif;font-size:0.6rem;letter-spacing:0.3em;text-transform:uppercase;color:#c9a96e;margin-bottom:16px;}' +
        '.ma-exit-card h3{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400;font-size:1.6rem;color:#f6f4f0;line-height:1.4;margin-bottom:12px;}' +
        '.ma-exit-card h3 em{font-style:italic;color:#c9a96e;}' +
        '.ma-exit-card>p{font-family:"DM Sans",sans-serif;font-size:0.85rem;color:#8a8579;line-height:1.6;margin-bottom:28px;}' +
        '.ma-exit-btns{display:flex;flex-direction:column;gap:10px;align-items:center;}' +
        '.ma-exit-btn-primary{display:inline-block;padding:14px 40px;font-family:"DM Sans",sans-serif;font-size:0.75rem;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#1a1a18;background:#c9a96e;border:none;border-radius:4px;text-decoration:none;cursor:pointer;transition:all 0.3s ease;}' +
        '.ma-exit-btn-primary:hover{background:#d4b87a;}' +
        '.ma-exit-btn-secondary{font-family:"DM Sans",sans-serif;font-size:0.7rem;color:#8a8579;text-decoration:none;letter-spacing:0.05em;transition:color 0.2s;}' +
        '.ma-exit-btn-secondary:hover{color:#c9a96e;}' +
        '@media(max-width:500px){.ma-exit-card{padding:36px 24px;}}' +
        '</style>' +
        '<div class="ma-exit-card">' +
          '<button class="ma-exit-close" id="maExitClose">&times;</button>' +
          '<p class="ma-exit-label">Before You Go</p>' +
          '<h3>Is your project <em>photo-ready?</em></h3>' +
          '<p>Take a 60-second quiz to find out. Get a personalized recommendation based on your project stage, goals, and timeline.</p>' +
          '<div class="ma-exit-btns">' +
            '<a href="' + QUIZ + '" class="ma-exit-btn-primary">Take the Quiz</a>' +
            '<a href="/pricing-guide-landing" class="ma-exit-btn-secondary">Or get the pricing guide</a>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);

      function showExit() {
        if (exitShown || dismissed) return;
        exitShown = true;
        requestAnimationFrame(function() {
          overlay.classList.add('ma-exit-show');
        });
      }

      function hideExit() {
        overlay.classList.remove('ma-exit-show');
        sessionStorage.setItem('ma_exit_dismissed', '1');
      }

      document.getElementById('maExitClose').addEventListener('click', hideExit);
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) hideExit();
      });
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') hideExit();
      });

      document.addEventListener('mouseout', function(e) {
        if (e.clientY <= 0 && !exitShown) showExit();
      });

      var scrollDepth = 0;
      var hasScrolledDeep = false;
      window.addEventListener('scroll', function() {
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollDepth = Math.max(scrollDepth, (window.scrollY / docHeight) * 100);
        if (scrollDepth > 50) hasScrolledDeep = true;
        if (hasScrolledDeep && window.scrollY < 100 && !exitShown) {
          showExit();
        }
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. QUIZ CTA BANNERS — Service, case study, bio, contact pages
  // ═══════════════════════════════════════════════════════════════
  window.addEventListener('DOMContentLoaded', function() {

    // ── Service pages: before footer ──
    var servicePages = ['/project-photography', '/award-publication-imagery', '/construction-team-content', '/creative-partner'];
    if (servicePages.indexOf(path) !== -1) {
      var footer = document.querySelector('footer, [class*="ft"], [class*="footer"]');
      if (footer) {
        footer.parentNode.insertBefore(quizBanner({
          label: 'Not sure which service fits?',
          headline: 'Take the quiz and get a <em>personalized recommendation</em>',
          desc: '4 quick questions about your project. We\'ll tell you exactly which service fits and show you a relevant case study.',
          secondaryText: 'Or book a discovery call'
        }), footer);
      }
    }

    // ── Case study pages: after the content, before footer ──
    var caseStudyPages = ['/summerhill-fine-homes', '/balmoral-construction', '/sitelines-architecture', '/the-window-merchant', '/lrd-studio-interior-design'];
    if (caseStudyPages.indexOf(path) !== -1) {
      var csFooter = document.querySelector('footer, [class*="ft"], [class*="footer"]');
      if (csFooter) {
        csFooter.parentNode.insertBefore(quizBanner({
          label: 'Inspired by this project?',
          headline: 'See what we\'d recommend <em>for yours</em>',
          desc: 'Take the 60-second quiz to get a personalized service recommendation and see how your project compares.',
          secondaryText: 'Or book a discovery call'
        }), csFooter);
      }
    }

    // ── Bio page: after content ──
    if (path === '/bio') {
      var bioFooter = document.querySelector('footer, [class*="ft"], [class*="footer"]');
      if (bioFooter) {
        bioFooter.parentNode.insertBefore(quizBanner({
          label: 'Want to work together?',
          headline: 'Find out if your project is <em>photo-ready</em>',
          desc: 'A 60-second quiz that tells you exactly what you need and what it looks like to work with us.',
          secondaryText: 'Or book a discovery call'
        }), bioFooter);
      }
    }

    // ── Contact page: above the form ──
    if (path === '/contact') {
      var contactForm = document.querySelector('form, .ct-form, [class*="contact-form"]');
      if (contactForm) {
        contactForm.parentNode.insertBefore(quizBanner({
          label: 'Not sure what you need yet?',
          headline: 'Start with the <em>photo-ready quiz</em>',
          desc: 'Answer 4 quick questions and we\'ll recommend the right service, show you a relevant case study, and give you a clear next step.',
          primaryText: 'Take the Quiz',
          secondaryHref: '/pricing-guide-landing',
          secondaryText: 'Or get the pricing guide'
        }), contactForm);
      }
    }

    // ── Pricing guide thank-you: after confirmation ──
    if (path === '/pricing-guide-thank-you' || path.indexOf('/pricing-guide/') === 0) {
      var tyFooter = document.querySelector('footer, [class*="ft"], [class*="footer"]');
      if (tyFooter) {
        tyFooter.parentNode.insertBefore(quizBanner({
          label: 'Got the guide?',
          headline: 'Now find out if your project is <em>ready to shoot</em>',
          desc: 'Take the quiz to get a personalized recommendation based on your timeline and goals.',
          primaryText: 'Take the Quiz',
          secondaryHref: '/discovery-call',
          secondaryText: 'Or book a call now'
        }), tyFooter);
      }
    }

    // ── Homepage: before footer ──
    if (path === '/' || path === '/home') {
      var homeFooter = document.querySelector('footer, [class*="ft"], [class*="footer"]');
      if (homeFooter) {
        homeFooter.parentNode.insertBefore(quizBanner({
          label: '60 seconds',
          headline: 'Is your project <em>photo-ready?</em>',
          desc: 'Take the quiz to get a personalized recommendation, a relevant case study, and a clear next step.',
          secondaryText: 'Or book a discovery call'
        }), homeFooter);
      }
    }

    // ── Journal index: between article sections ──
    if (path === '/journal') {
      var grids = document.querySelectorAll('[class*="grid"], [class*="articles"], section');
      if (grids.length >= 2) {
        grids[1].parentNode.insertBefore(quizBanner({
          label: 'Have a project coming up?',
          headline: 'Find out if it\'s <em>photo-ready</em>',
          desc: '4 quick questions. Personalized recommendation. No commitment.',
          secondaryText: 'Or book a discovery call'
        }), grids[1]);
      }
    }

    // ── FAQs page: before footer ──
    if (path === '/faqs') {
      var faqFooter = document.querySelector('footer, [class*="ft"], [class*="footer"]');
      if (faqFooter) {
        faqFooter.parentNode.insertBefore(quizBanner({
          label: 'Still have questions?',
          headline: 'Take the quiz or <em>book a call</em>',
          desc: 'The quiz gives you a personalized recommendation in 60 seconds. Or jump straight to a conversation.',
          secondaryText: 'Or book a discovery call'
        }), faqFooter);
      }
    }

    // ── Process page: before footer ──
    if (path === '/process') {
      var procFooter = document.querySelector('footer, [class*="ft"], [class*="footer"]');
      if (procFooter) {
        procFooter.parentNode.insertBefore(quizBanner({
          label: 'Like what you see?',
          headline: 'Check if your project is <em>ready</em>',
          desc: 'Take the 60-second quiz and we\'ll recommend the right service based on where your project is right now.',
          secondaryText: 'Or book a discovery call'
        }), procFooter);
      }
    }
  });

})();
