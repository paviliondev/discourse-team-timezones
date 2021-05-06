import Service from "@ember/service";
import { inject as service } from "@ember/service";
import discourseComputed from "discourse-common/utils/decorators";

const teamTimezoneCategories = Discourse.application.SiteSettings.team_timezones_categories
  .split("|")
  .map((id) => parseInt(id,10));

const teamTimezoneTags = Discourse.application.SiteSettings.team_timezones_tags.split("|");

export default Service.extend({
  router: service("router"),

  @discourseComputed("router.currentRouteName")
  isTopicListRoute(currentRouteName) {
    return (
      currentRouteName.match(/^discovery\./) ||
      currentRouteName.match(/^tag?\.show/)
    );
  },

  @discourseComputed(
    "router.currentRouteName",
    "router.currentRoute.attributes.category.id"
  )
  viewingCategoryId(currentRouteName, categoryId) {
    if (!currentRouteName.match(/^discovery\./)) return;
    return categoryId;
  },

  @discourseComputed(
    "router.currentRouteName",
    "router.currentRoute.attributes.id"
  )
  viewingTagId(currentRouteName, tagId) {
    if (!currentRouteName.match(/^tag?\.show/)) return;
    return tagId;
  },

  @discourseComputed(
    "viewingCategoryId",
    "viewingTagId",
    "isTopicListRoute"
  )
  shouldDisplay(
    viewingCategoryId,
    viewingTagId,
    isTopicListRoute
  ) {
    if (teamTimezoneCategories.includes(viewingCategoryId)) {
     return true;
    } else if (teamTimezoneTags.includes(viewingTagId)) {
     return true;
    } else {
      return false;
    }
  },
});
