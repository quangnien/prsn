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
	
	// 4. owl carousel
	
		// i. client (carousel)
		
			$('#client').owlCarousel({
				items:7,
				loop:true,
				smartSpeed: 1000,
				autoplay:true,
				dots:false,
				autoplayHoverPause:true,
				responsive:{
						0:{
							items:2
						},
						415:{
							items:2
						},
						600:{
							items:4

						},
						1199:{
							items:4
						},
						1200:{
							items:7
						}
					}
				});
				
				
				$('.play').on('click',function(){
					owl.trigger('play.owl.autoplay',[1000])
				})
				$('.stop').on('click',function(){
					owl.trigger('stop.owl.autoplay')
				})


    // 5. welcome animation support

        $(window).load(function(){
        	$(".header-text h2,.header-text p").removeClass("animated fadeInUp").css({'opacity':'0'});
            $(".header-text a").removeClass("animated fadeInDown").css({'opacity':'0'});
        });

        $(window).load(function(){
        	$(".header-text h2,.header-text p").addClass("animated fadeInUp").css({'opacity':'0'});
            $(".header-text a").addClass("animated fadeInDown").css({'opacity':'0'});
        });

});	
	

// JavaScript for PDF View
function viewPDF() {
	document.getElementById("pdf-frame").src = "assets/download/CV_MIDDLE_JAVA_NGUYENQUANGNIEN.pdf";
	document.getElementById("pdf-viewer").style.display = "flex"; // Show PDF viewer
  
	document.getElementById("btn-view").style.display = "none"; // Hide View CV button
	document.getElementById("btn-close").style.display = "inline-block"; // Show Close CV button
}
  
function closePDF() {
	document.getElementById("pdf-viewer").style.display = "none"; // Hide PDF viewer
	document.getElementById("pdf-frame").src = ""; // Reset PDF to avoid loading issues

	document.getElementById("btn-close").style.display = "none"; // Hide Close CV button
	document.getElementById("btn-view").style.display = "inline-block"; // Show View CV button
}
  
  // SENT EMAIL.
document.querySelector("form").addEventListener("submit", function(event) {
	event.preventDefault(); // Prevent default form submission
	var form = this;
	var messageDiv = document.getElementById("form-message");
  
	fetch(form.action, {
		method: "POST",
		body: new FormData(form),
		headers: { "Accept": "application/json" }
	}).then(response => {
		if (response.ok) {
			messageDiv.textContent = "✅ Your message has been sent successfully!";
			messageDiv.className = "success-message";
			form.reset(); // Reset form fields
		} else {
			messageDiv.textContent = "❌ Oops! Something went wrong. Please try again.";
			messageDiv.className = "error-message";
		}
	}).catch(error => {
		messageDiv.textContent = "❌ Error: " + error;
		messageDiv.className = "error-message";
	});
  
	messageDiv.style.display = "block"; // Show message
});
  