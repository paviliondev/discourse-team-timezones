import { getOwner } from 'discourse-common/lib/get-owner';
import discourseComputed from "discourse-common/utils/decorators";

export default Ember.Component.extend({
  classNames: ['team-view-row'],
  tagName: 'tr',

  @discourseComputed
  row() {

    let times_score = (a, i) => {
      const periodic_time = a + i;
      const local_time = periodic_time >= 0 ? periodic_time <= 23 ? periodic_time : periodic_time - 24 : periodic_time + 24 ;
      console.log (periodic_time);
      return Discourse.SiteSettings.team_timezones_mode == 'zones' ?
       ((local_time >= Discourse.SiteSettings.team_timezones_evening_start) ? 0.5 :
        (local_time < Discourse.SiteSettings.team_timezones_morning_start) ? 0 : 1) :
        Math.abs(Math.pow(Math.sin((Math.PI/24)* (local_time-Discourse.SiteSettings.team_timezones_availability_origin_offset)), Discourse.SiteSettings.team_timezones_availability_curve_power_function));
    };

    const d = new Date();
    const n = d.getUTCHours();

    let rgbToHex = (r, g, b) => {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    let hexToRgb = (hex) => {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
          ]
        : null;
    };

    let colourGradientor = (p, rgb_beginning, rgb_end) => {
      var w = p * 2 - 1;
      var w1 = (w + 1) / 2.0;
      var w2 = 1 - w1;
      var rgb = [parseInt(rgb_beginning[0] * w1 + rgb_end[0] * w2),
          parseInt(rgb_beginning[1] * w1 + rgb_end[1] * w2),
              parseInt(rgb_beginning[2] * w1 + rgb_end[2] * w2)];
      return rgbToHex(rgb[0], rgb[1], rgb[2]);
    };

    let row = '';
    let base = '';

    let person = this.get('person');

    for (let i=0; i < 24; i++) {
      base = `<td style="background-color:${colourGradientor(times_score(person.offset,(i+n+37)%24), hexToRgb(Discourse.SiteSettings.team_timezones_available_colour),hexToRgb(Discourse.SiteSettings.team_timezones_background_colour))};`;
      base += (i==11) ? `" class="highlight"` : `"` ;
      row += `${base}"></td>`;
    };

    return Ember.String.htmlSafe(row);
  }
})