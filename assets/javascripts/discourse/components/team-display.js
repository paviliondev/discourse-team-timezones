import { inject as service } from "@ember/service";
import Component from "@glimmer/component";

export default class TeamDisplayComponent extends Component {
  @service teamDisplay;

  get shouldDisplay() {
    return this.teamDisplay.shouldDisplay || this.args?.params?.["active"];
  }
}
