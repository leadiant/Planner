({
	doInit: function (cmp, evt, hlp) {
		var filterObject = {
            searchKey: '',
            category: ''
        };
		cmp.set("v.filterObject", filterObject);
		
		cmp.set("v.modal", cmp.find("newEventModal"));
	},
	
	toggle : function(component, event, helper) {
        component.set("v.fullScreen", !component.get("v.fullScreen"));
        $A.util.toggleClass(component.find("container"), 'fullscreen');
        var rightColumn = component.find("rightColumn");
        $A.util.toggleClass(rightColumn, 'slds-size--8-of-12');
        $A.util.toggleClass(rightColumn, 'slds-size--12-of-12');
	},
	
	createNewRecord : function(cmp, evt, hlp) {
		// Launch standard create page in one/one.app container
		var createRecordEvent = $A.get('e.force:createRecord');
		createRecordEvent.setParams({
			"entityApiName": 'Contact'
		});
		createRecordEvent.fire();
	},

	handleClickSave: function (component, event, helper) {
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

	handleClickDeleteModal: function (component, event, helper) {
		var action = component.get("c.deleteEvent");
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
				component.find('toaster').show('Failed!', 'failure', 'There was a problem Deleting your Event. Please contact HelpDesk.');
			}
			component.find("spinner").hide();
		});
		component.find("spinner").show();
		$A.enqueueAction(action);
	},

	handledayClickEvent: function (cmp, evt, hlp) {
		cmp.set("v.showDeleteButton", false);
		var date = evt.getParam("data");
		hlp.newEventInstance(cmp, date);
		var newModalBody = [
			["c:addEvent", {
				scheduledEvent: cmp.getReference("v.scheduledEvent")
			}]
		];
		hlp.setModalBody(cmp, newModalBody);
	},

	handleEventClick: function (cmp, evt, hlp) {
		var clickedEvent = evt.getParam("data");
		cmp.set("v.showDeleteButton", true);
		var ScheduledEvents = cmp.get("v.ScheduledEvents");
		ScheduledEvents.forEach(function (ScheduledEvent) {
			if (ScheduledEvent.Id === clickedEvent.Id) {
				cmp.set("v.scheduledEvent", ScheduledEvent);
				var newModalBody = [
					["c:addEvent", {
						scheduledEvent: cmp.getReference("v.scheduledEvent")
					}]
				];
				hlp.setModalBody(cmp, newModalBody);
			}
		});
	},
	handleEventDrop: function (cmp, evt, hlp) {
		var droppedEvent = evt.getParam("data");
		console.log(droppedEvent);
		var ScheduledEvents = cmp.get("v.ScheduledEvents");
		ScheduledEvents.forEach(function (ScheduledEvent) {
			if (ScheduledEvent.Id === droppedEvent.event.Id) {
				ScheduledEvent.start = moment(droppedEvent.event.start._i).format();
				ScheduledEvent.end = moment(droppedEvent.event.end._i).format();
				console.log(ScheduledEvent);
				cmp.set("v.scheduledEvent", ScheduledEvent);
				hlp.saveEvent(cmp, evt, hlp);
			}
		});
	},
	handleEventResize: function (cmp, evt, hlp) {
		var resizedEvent = evt.getParam("data");
		console.log(resizedEvent);
		var ScheduledEvents = cmp.get("v.ScheduledEvents");
		ScheduledEvents.forEach(function (ScheduledEvent) {
			if (ScheduledEvent.Id === resizedEvent.event.Id) {
				ScheduledEvent.start = moment(resizedEvent.event.start._i).format();
				ScheduledEvent.end = moment(resizedEvent.event.end._i).format();
				console.log(ScheduledEvent);
				cmp.set("v.scheduledEvent", ScheduledEvent);
				hlp.saveEvent(cmp, evt, hlp);
			}
		});
	},

	handleDrop: function (cmp, evt, hlp) {
		console.log('event dropped');
		var droppedEvent = evt.getParam("data");
		console.log(droppedEvent);
		hlp.newEventInstance(cmp, droppedEvent.date);
		/*var scheduledEvent = cmp.get("v.scheduledEvent");
		scheduledEvent.contactId = 
		var newModalBody = [
			["c:addEvent", {
				scheduledEvent: cmp.getReference("v.scheduledEvent")
			}]
		];
		hlp.setModalBody(cmp, newModalBody);
*/
	},

		handleChange: function (cmp, event) {
			var changeValue = event.getParam("value");
			alert(changeValue);
		},


	handleEventReceive: function (cmp, evt, hlp) {
		console.log('event received');
		var droppedEvent = evt.getParam("data");
		console.log(droppedEvent);
		cmp.set("v.showDeleteButton", false);
		var scheduledEvent = cmp.get("v.scheduledEvent");
		scheduledEvent.contactId = droppedEvent.contactId;
		var newModalBody = [
			["c:addEvent", {
				scheduledEvent: cmp.getReference("v.scheduledEvent")
			}]
		];
		hlp.setModalBody(cmp, newModalBody);
	},
	getRecordsBySearchTerm: function(component, event, helper) {
		helper.getRecords(component,helper);
	},

	previousPage: function(component, event, helper) {
		var page = component.get("v.page") || 1;
        page = page - 1;
        helper.getRecords(component,helper, page);
	},

	nextPage: function(component, event, helper) {
		console.log("onNextPage");
		var page = component.get("v.page") || 1;
		page = page + 1;
		console.log("page");
        helper.getRecords(component,helper, page);
	},

	jsLoaded: function (cmp, evt, hlp) {
		// Fetch events and load in calendar
		hlp.getScheduledEvents(cmp);
		hlp.makeSearchResultsDraggable(cmp,hlp);
		$(document).ready(function () {
			$('#calendar').fullCalendar({
				header: {
					left: 'prev,next today',
					center: 'title',
					right: 'month,agendaWeek,agendaDay'
				},
				defaultView: 'month',
				defaultDate: moment().format("YYYY-MM-DD"),
				timezone: 'local',
				navLinks: true, // can click day/week names to navigate views
				editable: true,
				droppable: true, // allows things to be dropped onto the calendar
				selectable: true,
				selectHelper: true,
				eventLimit: true, // allow "more" link when too many events
				events: [],
				// Callbacks
				dayClick:
					function (date, jsEvent, ui, resourceObj) {
						$A.getCallback(
							function () {
								var messageEvent = cmp.getEvent("dayClickEvent");
								messageEvent.setParam("data", date);
								messageEvent.fire()
							}
						)();
					},

				drop: function (date, jsEvent, ui, resourceId) {
					console.log('an event has been dropped!');
					$A.getCallback(
						function () {
							var messageEvent = cmp.getEvent("drop");
							messageEvent.setParams({
								"data": {
									"jsEvent": jsEvent,
									"date": date
								}
							});
							messageEvent.fire()
						}
					)();
				},
				eventClick: function (calEvent, jsEvent, view) {
					$A.getCallback(
						function () {
							var messageEvent = cmp.getEvent("eventClick");
							messageEvent.setParam("data", calEvent);
							messageEvent.fire()
						}
					)();

					// change the border color just for fun
					$(this).css('border-color', 'red');
				},
				eventRender: function(event, element)
				{ 
    				element.find('.fc-title').append("<br/>" + event.contactName); 
				},
				eventDrop: function (event, delta, revertFunc) {
					$A.getCallback(
						function () {
							var messageEvent = cmp.getEvent("eventDrop");
							messageEvent.setParams({
								"data": {
									"event": event,
									"delta": delta
								}
							});
							messageEvent.fire();
						}
					)();
				},
				eventResize: function (event, delta, revertFunc) {
					$A.getCallback(
						function () {
							var messageEvent = cmp.getEvent("eventResize");
							messageEvent.setParams({
								"data": {
									"event": event,
									"delta": delta
								}
							});
							messageEvent.fire();
						}
					)();
				},
				eventReceive: function (event) {
					console.log('event received',event);
					$A.getCallback(
						function () {
							var messageEvent = cmp.getEvent("eventReceive");
							messageEvent.setParam("data", event);
							messageEvent.fire()
						}
					)();
				}
			});

		});
	},
	handleClickCancelModal: function (component, event, helper) {
		var ScheduledEvents = component.get("v.ScheduledEvents");
		$('#calendar').fullCalendar('removeEvents');
		$('#calendar').fullCalendar('addEventSource', ScheduledEvents);
		component.get("v.modal").hide();
	},
	handleClickX: function (component, event, helper) {
		var ScheduledEvents = component.get("v.ScheduledEvents");
		$('#calendar').fullCalendar('removeEvents');
		$('#calendar').fullCalendar('addEventSource', ScheduledEvents);
	}
})