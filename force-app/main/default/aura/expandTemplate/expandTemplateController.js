({
    toggle : function(component, event, helper) {
        component.set("v.fullScreen", !component.get("v.fullScreen"));
        $A.util.toggleClass(component.find("container"), 'fullscreen');
        var rightColumn = component.find("rightColumn");
        $A.util.toggleClass(rightColumn, 'slds-size--8-of-12');
        $A.util.toggleClass(rightColumn, 'slds-size--12-of-12');
    }
})
