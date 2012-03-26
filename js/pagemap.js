$(document).ready(function(){

    $.fn.redrawForWebkit = function() {
        this[0].style.display = 'none';
        this[0].offsetHeight;
        this[0].style.display = 'block';
        console.log("fock");
    };


	init();
});
var wh = 0;
var bh = 0;
var ratio = 0;
var selectors = ["h1"];
var elements = [];
var emptyPageMap = '<div id="pageIndicator"></div>';
var config = {
	"scrollSpeed": 300
}

function init(){
	console.log("Pagemap init");
	var pageMapMarkup = '<div id="pageMap"></div>';
	$('body').append(pageMapMarkup);
	$('#pagemap .clickTarget').live('click', function(event){
		slideToElement(this);
	});
	$(window).bind("resize", function(){
		redrawMap();
	});
	$(window).bind("scroll", function(){
		drawScrollIndicator();
	});
	redrawMap();
	drawScrollIndicator();
}

function slideToElement(source){
	console.log("scrollTo ",$(source).data('element'));
	$.scrollTo($(source).data('element'), config.scrollSpeed);
	/* Old version:
	for(id in elements){
		if($(elements[id].mapElement).is(source)){
			$.scrollTo(elements[id].element, config.scrollSpeed);
			return;
		}
	}
	*/
}

function redrawMap(){
	// also do this if font size/magnification changes
	$('#pageMap').html(emptyPageMap);
	wh = $(window).height();
	bh = $('body').height();
	elements = [];
	for(sid in selectors){
		console.log("dealing with "+sid);
		$.each($(selectors[sid]), function(id, element){
			var pos = $(element).offset().top
			elements.push({
				"element": element,
				"tag": selectors[sid],
				"pos": pos
			});
			if(id != 0){
				var previousElement = elements[id-1];
				if(id == 1){
					previousElement.sectionHeight = pos;
				} else {
					previousElement.sectionHeight = pos - previousElement.pos;
				}
			}
			if(id == elements.length -1){
				elements[id].sectionHeight = bh - pos;
			}
			previousElementPos = pos;
			var newElement = '<div class="clickTarget pageMap-'+selectors[sid]+'"></div>';
			$('#pageMap').append(newElement);
			// this will break as soon as elements aren't added sequentially anymore
			elements[id].mapElement = $('#pageMap .pageMap-'+selectors[sid]).last();
			$('#pageMap .pageMap-'+selectors[sid]).last().data('element', elements[id].element);

		});
	}
	setTimeout(drawElements, 500);
}

function drawElements(){
	$('#pageMap').height(wh);
	ratio = wh / bh;
	for(id in elements){ 
		var element = elements[id];
		var node = $('#pageMap .pageMap-'+element.tag)[id];
		var elementMargin = parseInt($(node).css('marginBottom'));
		console.log($(node), "margin: "+elementMargin);
		var h = Math.ceil(element.sectionHeight * ratio) - elementMargin;
		$(node).height(h);
	}
	console.log(elements.length+" elements found: ",elements);
	drawScrollIndicator();	
}

function drawScrollIndicator(){
	var offset = $('body').scrollTop();
	var percent = offset / (bh - wh);
	if(percent < 0){percent = 0;}
	if(percent > 1){percent = 1;}
	$('#pageMap #pageIndicator').height(wh * ratio).css('top', (percent * 100 * (1-ratio))+"%");
}

