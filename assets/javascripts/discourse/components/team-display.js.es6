import { getOwner } from 'discourse-common/lib/get-owner';
import {
  default as discourseComputed,
  observes,
  on
} from "discourse-common/utils/decorators";
import MountWidget from "discourse/components/mount-widget";

export default Ember.Component.extend({
  classNames: ['team-view'],
  people: null,

  currentCategory: Ember.computed.alias('args.category.id'),
  currentPath: Ember.computed.alias('window.location.pathname'),
          

  @discourseComputed('currentCategory')
  showTimezones() {
    if (!Discourse.SiteSettings.team_timezones_enabled) {return false} ; 
    const categoryId = this.get('currentCategory');
    const people = this.get('people')
    return Array.isArray(people) && people.length && Discourse.SiteSettings.team_timezones_categories.split("|").includes(`${categoryId}`);
  },

  @discourseComputed
  team() {
    return (Discourse.SiteSettings.team_timezones_group.replace(/_/g, " "));
  },

  didInsertElement() {
      this._super(...arguments);
      let whocares = this.get('showTimezones');
  },

  @discourseComputed
  currentHour() {
    const d = new Date();
    return d.getUTCHours() + 1;
  },
  
  model() {
    const controller = getOwner(this).lookup('controller:discovery/topics');
    let people = controller.get('teamtimezones');
    const n = this.get('currentHour');

    let times_score = (a, i) => {
      return Math.pow(Math.sin((Math.PI/24)* (i+a)), 4);
    };

    people.forEach (a => {
      let timezone = a.timezone.timezone;
      a.offset = Math.round((moment.tz(timezone)._offset)/60);
    });

    people.sort(
      (a, b) => ((a.username_lower > b.username_lower) ? 1 : -1)
     );    
    
    people.sort(
      (a, b) => ((times_score(a.offset,n) < times_score(b.offset,n)) ? 1 : -1)
    );    

    return people;
  },

  init () {
    this._super();
    this.set('people',this.model());
  },

  @discourseComputed
  header() {
    let header ='';
    const n = this.get('currentHour');

    for (let i=-1; i < 24; i++) {
      header += (i<0) ? `<th>Timezones of group: ${this.get('team')}</th>` : (i==n) ? `<th class="highlight">${i}</th>` : `<th>${i}</th>`;
    };

    return Ember.String.htmlSafe(header);
  }
});
