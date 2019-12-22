import { ajax } from 'discourse/lib/ajax';
import discourseComputed from "discourse-common/utils/decorators";
import { withPluginApi } from 'discourse/lib/plugin-api';


export default {
  name: 'team-timezones-route-edits',
  initialize(container) {
    withPluginApi('0.8.12', (api) => {
      api.modifyClass('route:discovery', {
        afterModel() {
          return Ember.RSVP.all([
            this._super(),
            this.getUserData()
          ]); 
        },

        getUserData() {
          return ajax('/teamtimezones').then(result => {
            this.controllerFor("discovery/topics").set("teamtimezones", result);
          });
        }
      });
    })
  }
}