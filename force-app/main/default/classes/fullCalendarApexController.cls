public class fullCalendarApexController {
    
    static String dtFormat = 'EEE, d MMM yyyy HH:mm:ss z';

    public class ScheduledEvent {
        
        @AuraEnabled
        public Id Id {get;set;}
        @AuraEnabled
        public String title {get;set;}
        @AuraEnabled
        public Boolean allDay {get;set;}
        @AuraEnabled
        public DateTime  startString  {get;set;}
        @AuraEnabled
        public DateTime  endString  {get;set;}
        @AuraEnabled
        public String contactId {get;set;}
        @AuraEnabled
        public String description {get;set;}
        @AuraEnabled
        public String contactName {get;set;}
         @AuraEnabled
        public String accountId {get;set;}
        @AuraEnabled
        public String accountName {get;set;}
        @AuraEnabled
        public String relatedTo {get;set;}
      
        public ScheduledEvent(Event event){
            Id = event.id;
            title = event.Subject;
            allDay = event.IsAllDayEvent;
            startString = event.StartDateTime;
            endString = event.EndDateTime;
            description = event.Description;
            contactId = event.WhoId;
            contactName = event.who.Name;
            accountId = event.WhatId;
            accountName = event.account.Name;
            relatedTo = event.WhatId == null ? 'Contact' : 'Account';
        }
        
        public Event toSObject(){
            return new Event(
                Id = this.Id,
                Subject = this.title,
                IsAllDayEvent = this.allDay,
                StartDateTime = this.startString,
                EndDateTime = this.endString,
                Description = this.description,
                WhoId = this.contactId,
                WhatId = this.accountId
            );
        }
    }

    public class PagedResult {
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        @AuraEnabled
        public List<sObject> items { get;set; }
        
    }

    public class Filter {
        
        @AuraEnabled
        public String searchKey { get;set; }
        
        @AuraEnabled
        public String category { get;set; }
        
    }
    
    @AuraEnabled
    public static string getEvents(){
        
        strike_responseData responseData = new strike_responseData();
        try
        {
            Map<Id, ScheduledEvent> scheduledEvents = new Map<Id, ScheduledEvent>();
            for ( Event event : [SELECT Id, WhoId, WhatId, who.name, account.Name, Subject, Location, IsAllDayEvent, StartDateTime, EndDateTime, ActivityDateTime, ActivityDate, Description, AccountId, OwnerId, IsDeleted FROM Event
                                 where IsDeleted = false])
            {
                scheduledEvents.put(event.Id,new ScheduledEvent(event));
            }
            responseData.results = new Map<String, Object>{
                'data' => scheduledEvents.values()
                    };
                        }
        catch (Exception e) {
            responseData.addError(e.getMessage());
        }
        string jsonResponse = responseData.getJsonString();
        jsonResponse = jsonResponse.replace('startString','start');
        jsonResponse = jsonResponse.replace('endString','end');
        return jsonResponse;
    }

    @AuraEnabled
    public static string getContacts(String jsonString){
        strike_responseData responseData = new strike_responseData();
        List<Map<String, Object>> data = new List<Map<String, Object>>();
        String query;

        try {
            Map<String, Object> jsonMap = (Map<String, Object>)JSON.deserializeUntyped(jsonString);
            String searchTerm = String.escapeSingleQuotes((String)jsonMap.get('searchTerm'));
            query = 'SELECT Id, Account.Name, contact.Name from Contact where Name' + ' LIKE \'%' + searchTerm + '%\'' + 'LIMIT 5';
            system.debug(query);
            for (Contact obj : Database.query(query)) {
                data.add(new Map<String, Object>{
                    'label' => obj.Name,
                    'sublabel' => obj.Account.Name,
                    'value' => obj.get('Id')
                });
            }

          responseData.results = new Map<String, Object>{
                    'data' => data,
                    'searchTerm' => searchTerm
          };

        } catch (Exception e) {
            responseData.addError(e.getMessage());
        }
        
        return responseData.getJsonString();
    }

    

    @AuraEnabled
    public static string upsertEvent(String jsonString){
        system.debug(jsonString);
        string jsonRequest = jsonString;
        jsonRequest = jsonRequest.replace('start','startString');
        jsonRequest = jsonRequest.replace('end','endString');

        system.debug(jsonRequest);
        ScheduledEvent se = (ScheduledEvent)JSON.deserialize(jsonRequest, ScheduledEvent.class);
        system.debug(se.toSObject());
        upsert se.toSObject();

        return getEvents();
        
    }

     @AuraEnabled
    public static string deleteEvent(String jsonString){
        
        string jsonRequest = jsonString;
        jsonRequest = jsonRequest.replace('start','startString');
        jsonRequest = jsonRequest.replace('end','endString');

        system.debug(jsonRequest);
        ScheduledEvent se = (ScheduledEvent)JSON.deserialize(jsonRequest, ScheduledEvent.class);
        system.debug(se.toSObject());
        delete se.toSObject();

        return getEvents();
        
    }

    @AuraEnabled
    public static string getContactsV1(String filters,Decimal pageSize, Decimal pageNumber) {
        system.debug(filters);
        system.debug(pageSize);
        system.debug(pageNumber);

        strike_responseData responseData = new strike_responseData();
        Filter filter = (Filter) JSON.deserializeStrict(filters, fullCalendarApexController.Filter.class);
        Integer pSize = (Integer)pageSize ;
        String key = '%' + filter.searchKey + '%';
        Integer offset = ((Integer)pageNumber - 1) * pSize;
        
        PagedResult r =  new PagedResult();

        r.pageSize = pSize;
        r.page = (Integer) pageNumber;

        r.total = [SELECT count() FROM Contact
                   WHERE name LIKE :key ];

        r.items =  [SELECT Id, Account.Name, contact.Name FROM Contact
                      WHERE Name LIKE :key
                      LIMIT :pSize OFFSET :offset];                   
  
        responseData.results = new Map<String, Object>{
                    'data' => r
        };                                          

        return responseData.getJsonString();
        
    }
}