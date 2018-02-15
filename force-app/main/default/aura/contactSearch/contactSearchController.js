({
	getRecordsBySearchTerm: function(component, event, helper) {
		console.log("getRecordsBySearchTerm");
		var searchTerm = component.get("v.searchTerm");
		var getRecordsAction = component.get('c.getContacts');


            getRecordsAction.setParams({
                jsonString: JSON.stringify({
					searchTerm: searchTerm
				})
			});

			console.log(JSON.stringify({
				searchTerm: searchTerm
			}));
			
			getRecordsAction.setCallback(this, function(res) {
                if (res.getState() === 'SUCCESS') {
                    var returnValue = JSON.parse(res.getReturnValue());

                    if (returnValue.isSuccess && returnValue.results.searchTerm === searchTerm) {
                        var returnedRecords = [];

                        returnValue.results.data.forEach(function(record) {
                            returnedRecords.push({
                                label: record.label,
                                sublabel: record.sublabel,
                                value: record.value
                            });
                        });
						component.set('v.records', returnedRecords);
						console.log(component.get("v.records"));
					//	helper.makeSearchResultsDraggable(component,helper);
                    }
                } else {
                    //helper.setRecords(component, event, helper, []);
                }
            });

            $A.enqueueAction(getRecordsAction);
	},

	jsLoaded: function (cmp, evt, hlp) {
		hlp.makeSearchResultsDraggable(cmp,hlp);
    },

    dragStart : function(component,evt) {
		var event = {
            title: 'Event1',
           start: '2018-02-14'
        };

    //    console.log(event);
     //   console.log(event.target.getAttribute("data-sfid") );
     evt.dataTransfer.setData("data-event", JSON.stringify(event));
	}
})