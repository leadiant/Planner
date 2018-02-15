({
	newEventInstance: function (component,date) {
		console.log('newEventInstance!');
	
		var startDateTime;
		var endDateTime;

		if (date._f == "YYYY-MM-DD"){
			startDateTime = moment(date.format()).add(12, 'hours').format();
			endDateTime = moment(date.format()).add(14, 'hours').format();
		} else {
			startDateTime = moment(date.format()).format();
			endDateTime = moment(date.format()).add(2, 'hours').format();
		}

		var scheduledEvent = {
			Id:null,
			contactId: null,
			title:null,
			start:startDateTime,
			end:endDateTime,
			allDay: false,
			url:null,
			description:null
		};
		component.set("v.scheduledEvent", scheduledEvent);
	},

	setModalBody: function (component, modalBodyComponents) {
        $A.createComponents(modalBodyComponents,
            function (newComponents, status, statusMessagesList) {
				component.set("v.addEventComponent", newComponents[0]);
                component.get("v.modal").set("v.body", newComponents);
               component.get("v.modal").show();
            });
	},
	
	saveEvent:function (component, event, helper) {
		var action = component.get("c.upsertEvent");
		action.setParam("jsonString", JSON.stringify(component.get("v.scheduledEvent")));
		action.setCallback(this, function (response) {
			var state = response.getState();
			if (component.isValid() && state === "SUCCESS") {
				var returnValue = JSON.parse(response.getReturnValue());
				if (returnValue.isSuccess) {
					component.set('v.ScheduledEvents', returnValue.results.data);
					$('#calendar').fullCalendar('removeEvents');
					$('#calendar').fullCalendar('addEventSource', returnValue.results.data);
					component.get("v.modal").hide();
				}
			}
			else if (component.isValid() && state === "ERROR") {
				component.find('toaster').show('Failed!', 'failure', 'There was a problem logging your Event. Please contact HelpDesk.');
			}
			component.find("spinner").hide();
		});
		component.find("spinner").show();
		$A.enqueueAction(action);
	},
	getScheduledEvents: function(component,recordIds) {
		var getScheduledEventsAction = component.get("c.getEvents");
		var returnedRecords = [];

		getScheduledEventsAction.setCallback(this, function(response) {
			var state = response.getState();
			console.log(state);
	        if (component.isValid() && state === "SUCCESS") {
				var returnValue = JSON.parse(response.getReturnValue());
				if (returnValue.isSuccess) {
					component.set('v.ScheduledEvents', returnValue.results.data);
					$('#calendar').fullCalendar('addEventSource',returnValue.results.data);
				}
	        }
	    });
	    $A.enqueueAction(getScheduledEventsAction);
	},

	getRecords: function(component,helper, page) {
		console.log("getRecords");
		var searchTerm = component.get("v.searchTerm");
		var filterObject = component.get("v.filterObject");
		var pageSize = component.get("v.pageSize");
		filterObject.searchKey = component.get("v.searchTerm");

		var getRecordsAction = component.get('c.getContactsV1');

		getRecordsAction.setParams({
			  "filters": JSON.stringify(component.get("v.filterObject")),
			  "pageSize": pageSize,
			  "pageNumber": page || 1
		  });

			
			getRecordsAction.setCallback(this, function(res) {
                if (res.getState() === 'SUCCESS') {
                    var returnValue = JSON.parse(res.getReturnValue());

					console.log(returnValue);

                    if (returnValue.isSuccess) {
                        var returnedRecords = [];

                        returnValue.results.data.items.forEach(function(record) {
							console.log(record);
							returnedRecords.push({
                                label: record.Name,
                                sublabel: record.Account.Name,
                                value: record.Id
                            });
                        });
						component.set('v.records', returnedRecords);
						component.set("v.page", returnValue.results.data.page);
            			component.set("v.total", returnValue.results.data.total);
            			component.set("v.pages", Math.ceil(returnValue.results.data.total/pageSize));
						console.log(component.get("v.records"));
						helper.makeSearchResultsDraggable(component);
                    }
                } else {
                    //helper.setRecords(component, event, helper, []);
                }
            });

            $A.enqueueAction(getRecordsAction);
	},

	makeSearchResultsDraggable: function (cmp,hlp) {
		console.log("makeSearchResultsDraggable");
		var uniqueId = cmp.getGlobalId() + 'external-events';
		$(document).ready(function(){

			// http://salesforce.stackexchange.com/questions/113816/refresh-a-jquery-accordion-in-a-lightning-component
			setTimeout(function(){
				var parent = $(document.getElementById(uniqueId));
				var events = $('.fc-event');
				var results = $(document.getElementById(uniqueId)).find(events);
				// console.log('results', results);

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
			},0)

		});
	}
})