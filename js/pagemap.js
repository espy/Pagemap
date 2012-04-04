$(document).ready(function(){

		$.fn.redrawForWebkit = function() {
				this[0].style.display = 'none';
				this[0].offsetHeight;
				this[0].style.display = 'block';
		};

	init();
});

var wh = 0;
var bh = 0;
var ratio = 0;
var tooltipLength = 25;
var selectors = ["h1", "h2", "p"];
var container = "#main";
var elements = [];
var emptyPageMap = '<div id="pageIndicator"></div>';
var config = {
	"scrollSpeed": 300
}

function init(){
	console.log("Pagemap init");
	var pageMapMarkup = '<div id="pageMap"></div>';
	$('body').append(pageMapMarkup);

	parseSelectors();

	$('#addSubline').live('click', function(event){
		event.preventDefault();
		$('<h2>H2 inserted afterwards</h2>').insertAfter(this);
		setTimeout(parseSelectors, 1000);
	});

	$('#pagemap .clickTarget').live('click', function(event){
		slideToElement(this);
	});

	$('#pagemap .clickTarget').live('mouseenter', function(event){
		var preview = shorten($($(this).data('element')).text());
		showPreview(preview, this);
		console.log("over", preview);
	});

	$('#pagemap .clickTarget').live('mouseleave', function(event){
		$('#pageMap #preview').hide();
	});

	/*
	$(window).bind("resize", function(){
		redrawMap();
	});
	redrawMap();
	*/	

	$(window).bind("scroll", function(){
		drawScrollIndicator();
	});
	drawScrollIndicator();
}

function showPreview(previewText, element) {
	if(!$('#pageMap #preview').length){
		$('#pageMap').append('<div id="preview"></div>');
	}	
	$('#pageMap #preview').text(previewText);
	$('#pageMap #preview').show().css('top', $(element).offset().top - $('#pageMap').offset().top);
}

function parseSelectors(){
	$.each(selectors, function(index, selector){
		parseSelector(selector);
	});
	elements.sort(comparePositions);
	console.log("Total elements",elements.length);
	setTimeout(parseSelectors, 1500);
}

function parseSelector(selector) {
	$.each($(selector, container), function(id, element){
		if(!$(element).data('pageMap')){
			var pageMapID = "pageMap_"+elements.length;
			$(element).data('pageMap', pageMapID)
			elements.push({
				"id": pageMapID,
				"element": element,
				"tag": selector,
				"pos": $(element).offset().top,
				"pageMapElement": null
			});
		};
	});
	drawPageMap();	
}

function drawPageMap() {
	//if(wh == $(window).height() && bh == $('body').height()) return;
	wh = $(window).height();
	bh = $('body').height();
	ratio = wh / bh;
	$.each(elements, function(id, element){
		if(element.pageMapElement == null){
			// create new element
			var newElement = '<div class="clickTarget pageMap-'+element.tag+'"></div>';
			$('#pageMap').append(newElement)
			element.pageMapElement = $('#pageMap .pageMap-'+element.tag).last();
			$(element.pageMapElement).data('element', element.element)
			element.pos = $(element.element).offset().top;
		} else {
			element.pos = $(element.element).offset().top;
		}
		//$(element.pageMapElement).css('top', ratio * element.pos);
		var target = Math.round(ratio * element.pos);
		if(target != $(element.pageMapElement).offset().top){
			$(element.pageMapElement).animate({	
				top: target
				}, 250
			);
		}
	});
	drawScrollIndicator();	
}



function slideToElement(source){
	console.log("scrollTo ",$(source).data('element'));
	$.scrollTo($(source).data('element'), config.scrollSpeed);
}

function redrawMap(){
	// also do this if font size/magnification changes
	$('#pageMap').html(emptyPageMap);
	wh = $(window).height();
	bh = $('body').height();
	elements = [];
	for(sid in selectors){
		console.log("dealing with "+selectors[sid]);
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
		var h = Math.ceil(element.sectionHeight * ratio) - elementMargin;
		$(node).height(h);
	}
	drawScrollIndicator();	
}

function drawScrollIndicator(){
	if(!$('#pageMap #pageIndicator').length){
		$('#pageMap').append('<div id="pageIndicator"></div>');
	}
	var offset = $('body').scrollTop();
	var percent = offset / (bh - wh);
	if(percent < 0){percent = 0;}
	if(percent > 1){percent = 1;}
	$('#pageMap #pageIndicator').height(wh * ratio).css('top', (percent * 100 * (1-ratio))+"%");
}

// Helpers
 
function comparePositions(a, b) {
	return a.pos - b.pos;
}

function shorten(text) {
	var l = text.length;
	text = text.substr(0,tooltipLength);
	if(l > tooltipLength) text += "…";
	return text;
}
