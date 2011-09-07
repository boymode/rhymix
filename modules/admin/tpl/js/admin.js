/* NHN (developers@xpressengine.com) */
jQuery(function($){
	// Constants
	var ESC_KEY = 27;

	// Overlapping label
	$('.form li').find('>input:text,>input:password,>textarea')
 		.filter('input[value!=""],textarea:not(:empty)').prev('label').css('visibility','hidden').end().end()
		.prev('label')
			.css({position:'absolute',top:'15px',left:'5px'})
			.next()
				.focus(function(){
					var $label = $(this).prev().stop().animate({opacity:0, left:'25px'},'fast',function(){ $label.css('visibility','hidden') });
				})
				.blur(function(){
					var $this = $(this), $label;
					if($.trim($this.val()) == '') {
						$label = $this.prev().stop().css('visibility','visible').animate({opacity:1, left:'5px'},'fast');
					}
				})
			.end()
			.parent()
				.css('position', 'relative');

	// Make selected checkbox elements bold
	var $rc_label = $('input:radio+label,input:checkbox+label'), $input_rc = $rc_label.prev('input');
	$input_rc
		.change(function(){
			var name = $(this).attr('name');
			$input_rc
				.filter(function(){ return this.name == name })
				.next('label').css('font-weight', 'normal').end()
				.filter(':checked')
					.next('label').css('font-weight', 'bold').end();
		})
		.change();

	// Toogle checkbox all
	$('.form th>input:checkbox')
		.change(function() {
			var $this = $(this), name = $this.data('name');

			$this.closest('table')
				.find('input:checkbox')
					.filter(function(){
						var $this = $(this);
						return !$this.prop('disabled') && (($this.attr('name') == name) || ($this.data('name') == name));
					})
						.prop('checked', $this.prop('checked'))
					.end()
				.end()
				.trigger('update.checkbox', [name, this.checked]);
		});

	// Global Navigation Bar
	var $menuitems = $('div.gnb')
		.removeClass('jx')
		.attr('role', 'navigation') // WAI-ARIA role
		.find('li')
			.attr('role', 'menuitem') // WAI-ARIA role
			.filter(':has(>ul)')
				.attr('aria-haspopup', 'true') // WAI-ARIA
				.find('>ul').hide().end()
				.mouseover(function(){
					var $this = $(this);
					if($this.css('float') == 'left') $this.find('>ul:hidden').prev('a').click();
				})
				.mouseleave(function(){
					var $this = $(this);
					if($this.css('float') == 'left') $this.find('>ul:visible').slideUp(100);
				})
				.find('>a')
					.focus(function(){ $(this).click() })
					.click(function(){
						$menuitems.removeClass('active');

						$(this)
							.next('ul').slideToggle(100).end()
							.parent().addClass('active');

						return false;
					})
				.end()
			.end()
			.find('>a')
				.blur(function(){
					var anchor = this;
					setTimeout(function(){
						var $a  = $(anchor), $ul = $a.closest('ul'), $focus = $ul.find('a:focus');

						if(!$focus.length || $focus.closest('ul').parent('div.gnb').length) {
							if($ul.parent('div.gnb').length) $ul = $a.next('ul');
							$ul.filter(':visible').slideUp(100);
						}
					}, 10);
				})
			.end()

	// pagination
	$.fn.xePagination = function(){
		this
			.not('.xe-pagination')
			.addClass('xe-pagination')
			.find('span.tgContent').css('whiteSpace', 'nowrap').end()
			.find('a.tgAnchor')
				.each(function(idx){
					var $this = $(this);
					$this.after( $($this.attr('href')) );
				})
			.end();

		return this;
	};
	$('.pagination').xePagination();

	// Portlet Action
	$('.portlet .action')
		.css({display:'none',position:'absolute'})
		.parent()
			.mouseleave(function(){ $(this).find('>.action').fadeOut(100); })
			.mouseenter(function(){ $(this).find('>.action').fadeIn(100); })
			.focusin(function(){ $(this).mouseenter() })
			.focusout(function(){
				var $this = $(this), timer;

				clearTimeout($this.data('timer'));
				timer = setTimeout(function(){ if(!$this.find(':focus').length) $this.mouseleave() }, 10);

				$this.data('timer', timer);
			});

	// Display the dashboard in two column
	$('.dashboard>.section>.portlet:odd').after('<br style="clear:both" />');


	// Popup list : 'Move to site' and 'Site map'
	$('.header>.siteTool>a.i')
		.bind('before-open.tc', function(){
			$(this)
				.addClass('active')
				.next('div.tgContent')
					.find('>.section:gt(0)').hide().end()
					.find('>.btnArea>button').show();
		})
		.bind('after-close.tc', function(){
			$(this).removeClass('active');
		})
		.next('#siteMapList')
			.find('>.section:last')
				.after('<p class="btnArea"><button type="button">&rsaquo; more</button></p>')
				.find('+p>button')
					.click(function(){
						// Display all sections then hide this button
						$(this).hide().parent().prevAll('.section').show();
					});

	$.fn.xeMask = function(){
		this
			.each(function(){
				var $this = $(this), text = $this.text();
				var reg_mail = /^([\w\-\.]+?)@(([\w-]+\.)+[a-z]{2,})$/ig;
				$this.data('originalText', text);

				if(reg_mail.test(text)) {
					$this.data('maskedText', RegExp.$1+'...');
				}

				$this.text( $this.data('maskedText') );
			})
			.mouseover(function(){
				$(this).text( $(this).data('originalText') );
			})
			.mouseout(function(){
				$(this).text( $(this).data('maskedText') );
			})
			.focus(function(){ $(this).mouseover(); })
			.blur(function(){ $(this).mouseout(); });
	};
	$('.masked').xeMask();
});

// Modal Window
jQuery(function($){

$.fn.xeModalWindow = function(){
	this
		.not('.xe-modal-window')
		.addClass('xe-modal-window')
		.each(function(){
			$( $(this).attr('href') ).addClass('x').hide();
		})
		.click(function(){
			var $this = $(this), $modal, $btnClose, disabled;

			// get and initialize modal window
			$modal = $( $this.attr('href') );
			if(!$modal.parent('body').length) {
				$btnClose = $('<button type="button" class="modalClose" title="Close this layer">X</button>');
				$btnClose.click(function(){ $modal.data('anchor').trigger('close.mw') });

				$modal
					.prepend('<span class="bg"></span>')
					.append('<!--[if IE 6]><iframe class="ie6"></iframe><![endif]-->')
					.find('>.fg')
						.prepend($btnClose)
						.append($btnClose.clone(true))
					.end()
					.appendTo('body');
			}

			// set the related anchor
			$modal.data('anchor', $this);

			if($modal.data('state') == 'showing') {
				$this.trigger('close.mw');
			} else {
				$this.trigger('open.mw');
			}

			return false;
		})
		.bind('open.mw', function(){
			var $this = $(this), before_event, $modal, duration;

			// before event trigger
			before_event = $.Event('before-open.mw');
			$this.trigger(before_event);

			// is event canceled?
			if(before_event.isDefaultPrevented()) return false;

			// get modal window
			$modal = $( $this.attr('href') );

			// get duration
			duration = $this.data('duration') || 'fast';

			// set state : showing
			$modal.data('state', 'showing');

			// workaroud for IE6
			$('html,body').addClass('modalContainer');

			// after event trigger
			function after(){ $this.trigger('after-open.mw') };

			$(document).bind('keydown.mw', function(event){
				if(event.which == ESC_KEY) {
					$this.trigger('close.mw');
					return false;
				}
			});

			$modal
				.fadeIn(duration, after)
				.find('>.bg').height($(document).height()).end()
				.find('button.modalClose:first').focus();
		})
		.bind('close.mw', function(){
			var $this = $(this), before_event, $modal, duration;

			// before event trigger
			before_event = $.Event('before-close.mw');
			$this.trigger(before_event);

			// is event canceled?
			if(before_event.isDefaultPrevented()) return false;

			// get modal window
			$modal = $( $this.attr('href') );

			// get duration
			duration = $this.data('duration') || 'fast';

			// set state : hiding
			$modal.data('state', 'hiding');

			// workaroud for IE6
			$('html,body').removeClass('modalContainer');

			// after event trigger
			function after(){ $this.trigger('after-close.mw') };

			$modal.fadeOut(duration, after);
			$this.focus();
		});
};
$('a.modalAnchor').xeModalWindow();

});

// Content Toggler
jQuery(function($){

$.fn.xeContentToggler = function(){
	this
		.not('.xe-content-toggler')
		.addClass('xe-content-toggler')
		.each(function(){
			$($(this).attr('href')).hide().focusout(focusoutContent);
		})
		.click(function(){
			var $this = $(this), $layer;

			// get content container
			$layer = $( $this.attr('href') );

			// set anchor object
			$layer.data('anchor', $this);

			if($layer.data('state') == 'showing') {
				$this.trigger('close.tc');
			} else {
				$this.trigger('open.tc');
			}

			return false;
		})
		.bind('open.tc', function(){
			var $this = $(this), $layer, effect, duration;

			// get content container
			$layer = $( $this.attr('href') );

			// get effeect
			effect = $this.data('effect');

			// get duration
			duration = $this.data('duration') || 'fast';

			// set state : showing
			$layer.data('state', 'showing');

			// before event trigger
			$this.trigger('before-open.tc');

			// When mouse button is down or when ESC key is pressed close this layer
			$(document)
				.unbind('mousedown.tc keydown.tc')
				.bind('mousedown.tc keydown.tc',
					function(event){
						if(event && (
							(event.type == 'keydown' && event.which != ESC_KEY) ||
							(event.type == 'mousedown' && ($(event.target).is('.tgAnchor,.tgContent') || $layer.has(event.target)[0]))
						)) return true;

						$this.trigger('close.tc');

						return false;
					}
				);

			// triggering after
			function trigger_after(){ $this.trigger('after-open.tc') }

			switch(effect) {
				case 'slide':
					$layer.slideDown(duration, trigger_after);
					break;
				case 'slide-h':
					var w = $layer.css({'overflow-x':'',width:''}).width();
					$layer
						.show()
						.css({'overflow-x':'hidden',width:'0px'})
						.animate({width:w}, duration, function(){ $layer.css({'overflow-x':'',width:''}); trigger_after(); });
					break;
				case 'fade':
					$layer.fadeIn(duration, trigger_after);
					break;
				default:
					$layer.show();
					$this.trigger('after-open.tc');
			}
		})
		.bind('close.tc', function(){
			var $this = $(this), $layer, effect, duration;

			// unbind document's event handlers
			$(document).unbind('mousedown.tc keydown.tc');

			// get content container
			$layer = $( $this.attr('href') );

			// get effeect
			effect = $this.data('effect');

			// get duration
			duration = $this.data('duration') || 'fast';

			// set state : hiding
			$layer.data('state', 'hiding');

			// before event trigger
			$this.trigger('before-close.tc');

			// triggering after
			function trigger_after(){ $this.trigger('after-close.tc') };

			// close this layer
			switch(effect) {
				case 'slide':
					$layer.slideUp(duration, trigger_after);
					break;
				case 'slide-h':
					$layer.animate({width:0}, duration, function(){ $layer.hide(); trigger_after(); });
					break;
				case 'fade':
					$layer.fadeOut(duration, trigger_after);
					break;
				default:
					$layer.hide();
					$this.trigger('after-close.tc');
			}
		});

	return this;
};

$('a.tgAnchor').xeContentToggler();

function focusoutContent(event) {
	var $this = $(this), $anchor = $this.data('anchor');
	setTimeout(function(){
		if(!$this.find(':focus').length && $this.data('state') == 'showing') $anchor.trigger('close.tc');
	}, 1);
};

});

// Module finder
jQuery(function($){

$.fn.xeModuleFinder = function(){
	this
		.not('.xe-module-finder')
		.addClass('xe-module-finder')
		.find('a.tgAnchor.findsite')
			.bind('before-open.tc', function(){
				var $this, $ul, val;

				$this = $(this);
				$ul   = $($this.attr('href')).find('>ul');
				val   = $this.prev('input:text').val();

				function on_complete(data) {
					var $li, list = data.site_list, i, c;

					$ul.empty();
					$this.closest('.modulefinder').find('.moduleList,.moduleIdList').attr('disabled','disabled');

					if(data.error || !$.isArray(list)) {
						$this.trigger('close.tc');
						return;
					}

					for(i=0,c=list.length; i < c; i++) {
						$li = $('<li />').appendTo($ul);
						$('<button type="button" />').text(list[i].domain).data('site_srl', list[i].site_srl).appendTo($li);
					}
				};

				$.exec_json('admin.getSiteAllList', {domain:val}, on_complete);
			})
		.end()
		.find('.tgContent.suggestion')
			.delegate('button','click',function(){
				var $this, $finder;

				$this    = $(this);
				$finder  = $this.closest('.modulefinder');

				function on_complete(data) {
					var $mod_select, list = data.module_list, x;

					if(data.error || !list) return;

					$mod_select = $finder.find('.moduleList').data('module_list', list).removeAttr('disabled').empty();
					for(x in list) {
						if(!list.hasOwnProperty(x)) continue;
						$('<option />').attr('value', x).text(list[x].title).appendTo($mod_select);
					}
					$mod_select.prop('selectedIndex', 0).change().focus();

					if(!$mod_select.is(':visible')) {
						$mod_select
							.slideDown(100, function(){
								$finder.find('.moduleIdList:not(:visible)').slideDown(100).trigger('show');
							})
							.trigger('show');
					}
				};

				$finder.find('a.tgAnchor.findsite').trigger('close.tc');

				$.exec_json('module.procModuleAdminGetList', {site_srl:$this.data('site_srl')}, on_complete);
			})
		.end()
		.find('.moduleList,.moduleIdList').hide().end()
		.find('.moduleList')
			.change(function(){
				var $this, $mid_select, val, list;

				$this   = $(this);
				val     = $this.val();
				list    = $this.data('module_list');

				if(!list[val]) return;

				list = list[val].list;
				$mid_select = $this.closest('.modulefinder').find('.moduleIdList').removeAttr('disabled').empty();

				for(var x in list) {
					if(!list.hasOwnProperty(x)) continue;
					$('<option />').attr('value', list[x].module_srl).text(list[x].browser_title).appendTo($mid_select);
				}
				$mid_select.prop('selectedIndex', 0);
			});

	return this;
};
$('.modulefinder').xeModuleFinder();

});

// Sortable table
jQuery(function($){

var
	dragging = false,
	$holder  = $('<tr class="placeholder"><td>&nbsp;</td></tr>');

$.fn.xeSortableTable = function(){
	this
		.not('.xe-sortable-table')
		.addClass('xe-sortable-table')
		.delegate('button.dragBtn', 'mousedown.st', function(event){
			var $this, $tr, $table, $th, height, width, offset, position, offsets, i, dropzone, cols;

			if(event.which != 1) return;

			$this  = $(this);
			$tr    = $this.closest('tr');
			$table = $this.closest('table').css('position','relative');
			height = $tr.height();
			width  = $tr.width();

			// before event trigger
			before_event = $.Event('before-drag.st');
			$table.trigger(before_event);

			// is event canceled?
			if(before_event.isDefaultPrevented()) return false;

			position = {x:event.pageX, y:event.pageY};
			offset   = getOffset($tr.get(0), $table.get(0));

			$clone = $tr.attr('target', true).clone(true).appendTo($table);

			// get colspan
			cols = ($th=$table.find('thead th')).length;
			$th.filter('[colspan]').attr('colspan', function(idx,attr){ cols += attr - 1; });
			$holder.find('td').attr('colspan', cols);

			// get offsets of all list-item elements
			offsets = [];
			$table.find('tbody>tr:not([target],.sticky)').each(function() {
				var $this = $(this), o;

				o = getOffset(this, $table.get(0));
				offsets.push({top:o.top, bottom:o.top+32, $item:$(this)});
			});

			$clone
				.addClass('draggable')
				.css({
					position: 'absolute',
					opacity : .6,
					width   : width,
					height  : height,
					left    : offset.left,
					top     : offset.top,
					zIndex  : 100
				});

			// Set a place holder
			$holder
				.css({
					position:'absolute',
					opacity : .6,
					width   : width,
					height  : '10px',
					left    : offset.left,
					top     : offset.top,
					backgroundColor : '#bbb',
					overflow: 'hidden',
					zIndex  : 99
				})
				.appendTo($table);

			$tr.css('opacity', .6);

			$(document)
				.unbind('mousedown.st mouseup.st')
				.bind('mousemove.st', function(event) {
					var diff, nTop, item, i, c, o;

					dropzone = null;

					diff = {x:position.x-event.pageX, y:position.y-event.pageY};
					nTop = offset.top - diff.y;

					for(i=0,c=offsets.length; i < c; i++) {
						o = offsets[i];
						if( (i && o.top > nTop) || ((i < c-1) && o.bottom < nTop)) continue;

						dropzone = {element:o.$item};
						if(o.top > nTop - 12) {
							dropzone.state = 'before';
							$holder.css('top', o.top-5);
						} else {
							dropzone.state = 'after';
							$holder.css('top', o.bottom-5);
						}
					}

					$clone.css({top:nTop});
				})
				.bind('mouseup.st', function(event) {
					var $dropzone;

					dragging = false;

					$(document).unbind('mousemove.st mouseup.st');
					$tr.removeAttr('target').css('opacity', '');
					$clone.remove();
					$holder.remove();

					if(!dropzone) return;
					$dropzone = $(dropzone.element);

					// use the clone for animation
					$dropzone[dropzone.state]($tr);

					$table.trigger('after-drag.st');
				});
		})

	return this;
};
$('table.sortable').xeSortableTable();


function getOffset(elem, offsetParent) {
	var top = 0, left = 0;

	while(elem && elem != offsetParent) {
		top  += elem.offsetTop;
		left += elem.offsetLeft;

		elem = elem.offsetParent;
	}

	return {top:top, left:left};
}

});

// Language selector
jQuery(function($){

var w_timer = null, r_timer = null, r_idx = 0, f_timer = null;
var KEY_UP = 38, KEY_DOWN = 40;

$('.multiLangEdit')
	.find('input.vLang,textarea.vLang')
		.bind('textchange', function(){
			var $this = $(this), val = $.trim($this.val()), $ul, $mle;

			if(r_timer) {
				clearTimeout(r_timer);
				r_timer = null;
			}

			if(!val) return;

			$mle = $this.closest('.multiLangEdit');
			$ul  = $mle.find('.suggestion > ul');

			// remove lagnauge key
			$mle.find('.vLang').eq(0).val('');

			function request() {
				$this.addClass('loading');

				if($ul.parent().is(':visible')) $ul.parent().hide();

				$.exec_json(
					'module.getLangListByLangcodeForAutoComplete',
					{search_keyword:val},
					(function(i){ return function(data){ on_complete(data,i) } })(r_idx++)
				);
			};

			function on_complete(data, idx){
				var results = data.results, $btn, i, c;

				if(data.error || !results || (r_idx != idx+1)) return;

				$this.removeClass('loading');

				$ul.empty();
				for(i=0,c=results.length; i < c; i++) {
					$btn = $('<button type="button" class="_btnLang" />').data('langkey', results[i].name).text(results[i].value);
					$('<li />').append($btn).appendTo($ul);
				}
				$ul.parent().slideDown(300);
			};

			r_timer = setTimeout(request, 100);
		})
		.focus(function(){
			var $this = $(this), oldValue = $.trim($this.val());

			(function(){
				var value = $.trim($this.val());

				if(value != oldValue) {
					oldValue = value;
					$this.trigger('textchange');
				}
				w_timer = setTimeout(arguments.callee, 50);
			})();
		})
		.blur(function(){
			clearTimeout(w_timer);
			w_timer = null;

			$(this).closest('.multiLangEdit').focusout();
		})
	.end()
	.find('a.tgAnchor.editUserLang')
		.bind('before-open.tc', function(){
			var $this, $layer, $vlangs;

			$this   = $(this);
			$layer  = $($this.attr('href'));
			$vlangs = $this.closest('.multiLangEdit').find('input.vLang,textarea.vLang');

			function on_complete(data) {
				var list = data.lang_list, i, c;

				if(data.error || !list || !list.length) return;

				$layer.find('li > input').val('').prev('label').css('visibility','visible');
				for(i=0,c=list.length; i < c; i++) {
					$layer.find('li.'+list[i].lang_code).find('> input').val(list[i].value).prev('label').css('visibility','hidden');
				}
			};

			$.exec_json('module.getModuleAdminLangListByName', {lang_name:$vlangs.eq(0).val()}, on_complete);
		})
	.end()
	.delegate('.suggestion button._btnLang', 'click', function(){
		var $this = $(this), key = $this.data('langkey'), text = $this.text();

		$this.closest('.suggestion')
			.hide()
			.prev('.vLang').val(text)
				.prev('.vLang').val(key);
	})
	.focusout(function(){
		var self = this;

		function check(){
			var $this = $(self);

			if($this.find(':focus').is('.vLang,._btnLang')) return;
			$this.find('>.suggestion').slideUp(300);
		}

		clearTimeout(f_timer);
		f_timer = setTimeout(check, 10);
	})
});

// filebox
jQuery(function($){

$('.filebox')
	.bind('before-open.mw', function(){
		var $this, $list, $parentObj;
		var anchor;

		$this = $(this);
		anchor = $this.attr('href');

		$list = $(anchor).find('.filebox_list');

		function on_complete(data){
			$list.html(data.html);

			$list.find('.lined .select')
				.bind('click', function(event){
					var selectedImgSrc = $(this).parent().find('img.filebox_item').attr('src');
					$this.trigger('filebox.selected', [selectedImgSrc]);
					$this.trigger('close.mw');
					return false;
				});

			$list.find('.pagination')
				.find('a')
				.filter(function(){
					if ($(this).hasClass('tgAnchor')) return false;
					return true;
				})
				.bind('click', function(){
					var page = $(this).attr('page');

					$.exec_json('module.getFileBoxListHtml', {'page': page}, on_complete);
					$(window).scrollTop($(anchor).find('.modalClose').offset().top);
					return false;
				});

			$('#FileBoxGoTo')
				.find('button')
				.bind('click', function(){
					var page = $(this).prev('input').val();

					$.exec_json('module.getFileBoxListHtml', {'page': page}, on_complete);
					$(window).scrollTop($(anchor).find('.modalClose').offset().top);
					return false;
				});
		}

		$.exec_json('module.getFileBoxListHtml', {'page': '1'}, on_complete);
	});

});

/* install module */
function doInstallModule(module) {
    var params = new Array();
    params['module_name'] = module;
    exec_xml('install','procInstallAdminInstall',params, completeInstallModule);
}

/* upgrade module */
function doUpdateModule(module) {
    var params = new Array();
    params['module_name'] = module;
    exec_xml('install','procInstallAdminUpdate',params, completeInstallModule);
}

function completeInstallModule(ret_obj) {
    alert(ret_obj['message']);
    location.reload();
}
