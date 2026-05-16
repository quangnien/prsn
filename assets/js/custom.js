$(document).ready(function(){
	"use strict";
    
        /*==================================
* Author        : "ThemeSine"
* Template Name : Khanas HTML Template
* Version       : 1.0
==================================== */



/*=========== TABLE OF CONTENTS ===========
1. Scroll To Top 
2. Smooth Scroll spy
3. Progress-bar
4. owl carousel
5. welcome animation support
======================================*/

    // 1. Scroll To Top 
		$(window).on('scroll',function () {
			if ($(this).scrollTop() > 600) {
				$('.return-to-top').fadeIn();
			} else {
				$('.return-to-top').fadeOut();
			}
		});
		$('.return-to-top').on('click',function(){
				$('html, body').animate({
				scrollTop: 0
			}, 1500);
			return false;
		});
	
	
	
	// 2. Smooth Scroll spy
		
		$('.header-area').sticky({
           topSpacing:0
        });
		
		//=============

		$('li.smooth-menu a').bind("click", function(event) {
			event.preventDefault();
			var anchor = $(this);
			$('html, body').stop().animate({
				scrollTop: $(anchor.attr('href')).offset().top - 0
			}, 1200,'easeInOutExpo');
		});
		
		$('body').scrollspy({
			target:'.navbar-collapse',
			offset:0
		});

	// 3. Progress-bar
	
		var dataToggleTooTip = $('[data-toggle="tooltip"]');
		var progressBar = $(".progress-bar");
		if (progressBar.length) {
			progressBar.appear(function () {
				dataToggleTooTip.tooltip({
					trigger: 'manual'
				}).tooltip('show');
				progressBar.each(function () {
					var each_bar_width = $(this).attr('aria-valuenow');
					$(this).width(each_bar_width + '%');
				});
			});
		}
	
	// 4. owl carousel (inactive — client section hidden)


    // 5. welcome animation support

        $(window).on('load', function(){
        	$(".header-text h2,.header-text p").removeClass("animated fadeInUp").css({'opacity':'0'});
            $(".header-text a").removeClass("animated fadeInDown").css({'opacity':'0'});
        });

        $(window).on('load', function(){
        	$(".header-text h2,.header-text p").addClass("animated fadeInUp").css({'opacity':'0'});
            $(".header-text a").addClass("animated fadeInDown").css({'opacity':'0'});
        });

});

// 6. Auto-update footer copyright year
(function () {
    var el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
}());

// 7. Typing effect for hero subtitle
(function () {
    var phrases = [
        'Java Back-End Developer',
        'Software Engineer',
        'Fintech Developer',
        'Spring Boot Specialist'
    ];
    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typingEl = document.getElementById('typing-text');

    function typeEffect() {
        if (!typingEl) return;
        var current = phrases[phraseIndex];

        if (isDeleting) {
            typingEl.textContent = current.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingEl.textContent = current.substring(0, charIndex + 1);
            charIndex++;
        }

        var delay = isDeleting ? 45 : 95;

        if (!isDeleting && charIndex === current.length) {
            delay = 2200;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delay = 400;
        }

        setTimeout(typeEffect, delay);
    }

    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(typeEffect, 800);
    });
}());

// 8. Section fade-in on scroll (IntersectionObserver)
document.addEventListener('DOMContentLoaded', function () {
    var sections = document.querySelectorAll('.fade-in-section');
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        sections.forEach(function (s) { observer.observe(s); });
    } else {
        sections.forEach(function (s) { s.classList.add('is-visible'); });
    }
});
	

// PDF Viewer
(function () {
    var CV_SRC = "assets/download/CV_MIDDLE_JAVA_NGUYENQUANGNIEN.pdf";

    function showPDF() {
        document.getElementById("pdf-frame").src = CV_SRC;
        document.getElementById("pdf-viewer").style.display = "flex";
        document.getElementById("btn-view").style.display = "none";
        document.getElementById("btn-close").style.display = "inline-block";
    }

    function hidePDF() {
        document.getElementById("pdf-viewer").style.display = "none";
        document.getElementById("pdf-frame").src = "";
        document.getElementById("btn-close").style.display = "none";
        document.getElementById("btn-view").style.display = "inline-block";
    }

    document.addEventListener("DOMContentLoaded", function () {
        var btnView  = document.getElementById("btn-view");
        var btnClose = document.getElementById("btn-close");
        if (btnView)  btnView.addEventListener("click", showPDF);
        if (btnClose) btnClose.addEventListener("click", hidePDF);

        // Close PDF with Escape key
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") hidePDF();
        });
    });
}());

// Contact form via Formspree
document.addEventListener("DOMContentLoaded", function () {
    var contactForm = document.querySelector("#contact form");
    if (!contactForm) return;

    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var form = this;
        var messageDiv = document.getElementById("form-message");
        var submitBtn  = form.querySelector("button[type='submit']");

        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";

        fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { "Accept": "application/json" }
        }).then(function (response) {
            if (response.ok) {
                messageDiv.textContent = "Your message has been sent successfully. I'll get back to you soon!";
                messageDiv.className = "success-message";
                form.reset();
            } else {
                messageDiv.textContent = "Oops! Something went wrong. Please try again or email me directly.";
                messageDiv.className = "error-message";
            }
        }).catch(function () {
            messageDiv.textContent = "Network error — please check your connection and try again.";
            messageDiv.className = "error-message";
        }).finally(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
        });
    });
});
  