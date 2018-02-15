({
	makeSearchResultsDraggable: function (cmp,hlp) {
		console.log("makeSearchResultsDraggable");
		console.log("cmp.getElements(): ", cmp.getElements());

		var uniqueId = cmp.getGlobalId() + 'external-events';
		console.log(uniqueId);
		$(document).ready($A.getCallback(function(){

			// http://salesforce.stackexchange.com/questions/113816/refresh-a-jquery-accordion-in-a-lightning-component
			$A.getCallback(function(){
				var parent = $(document.getElementById(uniqueId));
				var events = $('.fc-event');
				var results = $(document.getElementById(uniqueId)).find(events);
				 //console.log('results', results);

				results.each(function() {
					// store data so the calendar knows to render an event upon drop
					$(this).data('event', {
						title: $.trim($(this).text()), // use the element's text as the event title
						stick: true, // maintain when user navigates (see docs on the renderEvent method)
						contactId: $(this).data('sfid')
					});

					// make the event draggable using jQuery UI
					$(this).draggable({
						zIndex: 999,
						revert: true,      // will cause the event to go back to its
						revertDuration: 0  //  original position after the drag
					});

				});
			})();

		}));
	}
})
