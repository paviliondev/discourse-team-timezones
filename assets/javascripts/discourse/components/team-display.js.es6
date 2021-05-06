import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";

export default Ember.Component.extend({
  teamDisplayService: service("team-display"),
  classNames: ["team-view"],

  shouldDisplay: alias("teamDisplayService.shouldDisplay"),
});
