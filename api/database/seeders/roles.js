const rolesJson = [
{
    "title": "Super Admin",
    "name": "SuperAdmin",
    "priority": 0,
    "parentRole": null,
    "info": "Highest access level than Admin",
    "isAssigned": true,
    "forSystem": true
  },
  {
    "title": "Administrator",
    "name": "admin",
    "priority": 1,
    "parentRole": null,
    "info": "Highest access level",
    "isAssigned": true,
    "forSystem": true
  },
  {
    "title": "Author",
    "name": "author",
    "priority": 2,
    "parentRole": null,
    "info": "Content creator",
    "isAssigned": false,
    "forSystem": false
  },
  {
    "title": "Editor",
    "name": "editor",
    "priority": 3,
    "parentRole": null,
    "info": "Content reviewer",
    "isAssigned": false,
    "forSystem": false
  },
  {
    "title": "User",
    "name": "user",
    "priority": 4,
    "parentRole": null,
    "info": "General user",
    "isAssigned": false,
    "forSystem": false
  },
  {
    "title": "Staff",
    "name": "staff",
    "priority": 5,
    "parentRole": null,
    "info": "Support staff",
    "isAssigned": false,
    "forSystem": true
  }
]

export default rolesJson;
